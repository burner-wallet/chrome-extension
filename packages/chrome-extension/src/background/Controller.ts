import BurnerCore from '@burner-wallet/core';
import { EventEmitter } from 'events';
import PortStream from 'extension-port-stream';
import _ from 'lodash';
import ObjectMultiplex from 'obj-multiplex';
import { Writable } from 'stream';
import pump from 'pump';

const assetProps = ['id', 'name', 'network', 'type', 'icon', 'address'];

export default class Controller {
  private core: BurnerCore;
  private events: EventEmitter;
  private defaultChain: string;

  constructor(core: BurnerCore) {
    this.core = core;
    // @ts-ignore
    this.defaultChain = core.gateways[0].getNetworks()[0];

    this.events = new EventEmitter();

    this.rpcPassthrough = this.rpcPassthrough.bind(this);
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

    stream.on('data', async (data: any) => {
      if (data.msg === 'assetCall') {
        const response = await this.assetCall(data.asset, data.command, data.args);
        stream.write({ id: data.id, response });
      }
    });

    stream.on('end', () => console.log('wallet close'));
  }

  connectToCS(port: Writable, origin: string, tab: any) {
    const mux = new ObjectMultiplex();
    pump(mux, port, mux, (err) => console.error('Pipe closed', err));

    const rpcStream = mux.createStream('rpc');

    this.setupRPC(rpcStream, async (chainId: string, payload: any) => {
      switch (payload.method) {
        case 'eth_requestAccounts':
          return { id: payload.id, result: this.core.getAccounts() };

        default:
          return this.rpcPassthrough(chainId, payload);
      }
    });
    port.on('end', () => console.log(`Tab ${origin} closed`));
  }

  setupRPC(stream: Writable, handler: (chainId: string, payload: any) => Promise<any>) {
    stream.on('data', async (data: any) => {
      const chainId = data.chainId === 'default' ? this.defaultChain : data.chainId;

      const out: any = { id: data.id };

      try {
        out.response = await handler(chainId, data.payload);
        out.response.id = data.payload.id2;
      } catch (error) {
        out.error = error;
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
