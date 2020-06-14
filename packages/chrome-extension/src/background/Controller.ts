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

  constructor(core: BurnerCore) {
    this.core = core;

    this.events = new EventEmitter();
  }

  connectToWallet(port: PortStream) {
    const mux = new ObjectMultiplex();
    pump(mux, port, mux, (err) => console.error('Pipe closed', err));

    const walletStream = mux.createStream('wallet');
    const rpcStream = mux.createStream('rpc');

    this.setupWallet(walletStream);
    this.setupRPC(rpcStream);
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

  setupRPC(stream: Writable) {
    stream.on('data', async (data: any) => {
      const provider = this.core.getProvider(data.chainId);

      provider.sendAsync(data.payload, (error: any, response: any) => {
        if (response) {
          response.id = data.payload.id2;
        }
        stream.write({ id: data.id, response, error });
      });
    })
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
