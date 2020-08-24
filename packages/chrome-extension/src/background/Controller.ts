import BurnerCore from '@burner-wallet/core';
import { EventEmitter } from 'events';
import PortStream from 'extension-port-stream';
import _ from 'lodash';
import ObjectMultiplex from 'obj-multiplex';
import { Writable } from 'stream';
import pump from 'pump';

import { readStorage, writeStorage } from '../lib';
import Domains from './Domains';
import SignatureQueue from './SignatureQueue';

const assetProps = ['id', 'name', 'network', 'type', 'icon', 'address'];

export default class Controller {
  private core: BurnerCore;
  private events = new EventEmitter();
  private defaultChain: string;
  private domains = new Domains();
  private signatureQueue = new SignatureQueue();
  private overwriteMetamask = false;
  private numWallets = 0;

  constructor(core: BurnerCore) {
    this.core = core;
    // @ts-ignore
    this.defaultChain = core.gateways[0].getNetworks()[0];
    readStorage('defaultNetwork').then((network: any) => {
      if (network) {
        this.defaultChain = network;
      }
    });

    readStorage('overwriteMetamask').then((overwrite: boolean) => {
      this.overwriteMetamask = overwrite === true ? true : false;
    });

    this.rpcPassthrough = this.rpcPassthrough.bind(this);

    setTimeout(() => this.core.stopAccountWatching(), 500);
  }

  connectToWallet(port: PortStream) {
    const mux = new ObjectMultiplex();
    pump(mux, port, mux, (err) => console.error('Pipe closed', err));

    const walletStream = mux.createStream('wallet');
    const rpcStream = mux.createStream('rpc');

    this.setupWallet(walletStream);
    this.setupRPC(rpcStream, this.rpcPassthrough);
  }

  setupWallet(stream: Writable) {
    stream.write({
      msg: 'initialize',
      assets: this.core.getAssets().map(asset => ({
        ..._.pick(asset, assetProps),
        supportsMsg: asset.supportsMessages(),
      })),
      accounts: this.core.getAccounts(),
    });
    console.log('wallet connected');

    this.numWallets++;
    if (this.numWallets === 1) {
      this.core.startAccountWatching();
    }

    const rpcMethods: { [name: string]: (...args: any[]) => any } = {
      assetCall: (msg: any) => this.assetCall(msg.asset, msg.command, msg.args),

      getPendingSignatures: (domain?: string) => {
        return this.signatureQueue.getPendingSignatures(domain);
      },

      approveSignature: (id: number) => {
        this.signatureQueue.approveSignature(id);
        return true;
      },

      rejectSignature: (id: number) => {
        this.signatureQueue.rejectSignature(id);
        return true;
      },

      metamaskOverwrite: () => this.overwriteMetamask,

      setMetamaskOverwrite: (overwrite: boolean) => {
        this.overwriteMetamask = overwrite;
        writeStorage('overwriteMetamask', overwrite);
      },
    };

    stream.on('data', async ({ id, msg, data }: any) => {
      let response, error;
      switch (msg) {
        case 'setSiteApproval':
          if (data[1]) {
            this.domains.approveSite(data[0]);
          } else {
            this.domains.cancelApproval(data[0]);
          }
          response = true;
          break;

        case 'getNetworks':
          // @ts-ignore
          response = _.uniq(_.flatten(this.core.gateways.map(gateway => gateway.getNetworks())));
          break;

        case 'getDefaultNetwork':
          response = this.defaultChain;
          break;

        case 'setDefaultNetwork':
          this.defaultChain = data[0];
          this.events.emit('defaultNetworkChanged', data[0]);
          await writeStorage('defaultNetwork', data[0]);
          response = true;
          break;

        default:
          if (rpcMethods[msg]) {
            response = await rpcMethods[msg](...data);
            break;
          }

          error = `Unknown msg ${msg}`;
          console.warn(error);
      }
      stream.write({ id, response, error });
    });

    stream.on('end', () => {
      console.log('wallet close');

      this.numWallets--;
      if (this.numWallets === 0) {
        this.core.stopAccountWatching();
      }
    });
  }

  connectToCS(port: Writable, origin: string, tab: any) {
    const mux = new ObjectMultiplex();
    pump(mux, port, mux, (err) => console.error('Pipe closed', err));

    const rpcStream = mux.createStream('rpc');
    const popInStream = mux.createStream('popin');
    const settingsStream = mux.createStream('settings');

    this.setupSettingsStream(settingsStream);

    this.setupRPC(rpcStream, async (chainId: string, payload: any) => {
      switch (payload.method) {
        case 'eth_requestAccounts':
          await this.domains.checkApproval(popInStream, origin);
          return { id: payload.id, result: this.core.getAccounts() };

        case 'eth_sendTransaction':
          await this.signatureQueue.confirmSignature(popInStream, payload.params[0], origin);
          return this.rpcPassthrough(chainId, payload);

        default:
          return this.rpcPassthrough(chainId, payload);
      }
    });

    const networkChangeListener = (newNetwork: any) => rpcStream.write({
      event: 'defaultNetworkChanged',
      network: newNetwork,
    });
    this.events.on('defaultNetworkChanged', networkChangeListener);

    port.on('end', () => {
      console.log(`Tab ${origin} closed`);

      this.events.off('defaultNetworkChanged', networkChangeListener);
    });
  }

  setupRPC(stream: Writable, handler: (chainId: string, payload: any) => Promise<any>) {
    stream.on('data', async (data: any) => {
      const chainId = data.chainId === 'default' ? this.defaultChain : data.chainId;

      const out: any = { id: data.id };

      try {
        out.response = await handler(chainId, data.payload);
      } catch (error) {
        console.error(error);
        out.response = { id: data.payload.id, jsonrpc: '2.0', error };
      }

      console.log('out', out);
      stream.write(out);
    });
  }

  private rpcPassthrough(chainId: string, payload: any) {
    const provider = this.core.getProvider(chainId);

    return new Promise((resolve, reject) => {
      provider.sendAsync(payload, (error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  setupSettingsStream(stream: Writable) {
    stream.on('data', (data: any) => {
      if (data.method === 'shouldOverwriteMetamask') {
        stream.write({ overwriteMetamask: this.overwriteMetamask });
      } else {
        console.warn('Unhandled settings message', data);
      }
    });
  }

  async assetCall(assetId: string, command: string, args: any[]) {
    const [asset] = this.core.getAssets().filter(asset => asset.id === assetId);
    if (!asset) {
      throw new Error(`Invalid asset ${assetId}`);
    }

    switch (command) {
      case 'getBalance':
        return await asset.getBalance(args[0]);

      case 'getSendFee':
        // @ts-ignore
        return await asset.getSendFee(args[0], args[1]);

      case 'getTx':
        return await asset.getTx(args[0]);

      case 'startWatchingAddress':
        // @ts-ignore
        return asset.startWatchingAddress(args[0]);

      case 'send':
        return await asset.send(args[0]);


      default:
        throw new Error(`Invalid command ${command}`);
    }
  }
}
