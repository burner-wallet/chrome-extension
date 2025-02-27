import pump from 'pump';
import { Writable } from 'stream';
import { EventEmitter } from 'events';

export default class StreamProvider extends EventEmitter {
  public chainId: string;

  private stream: Writable;
  private resolvers: { [id: string]: { resolve: any, reject: any, callback: any } } = {};
  private network: string;

  constructor(stream: Writable, network?: string) {
    super();

    this.stream = stream;
    this.network = network || 'default';

    this.chainId = isNaN(network as any) ? this.network : `0x${parseInt(this.network).toString(16)}`;

    if (!network) {
      this.rpc({ method: 'eth_chainId' }).then((response: any) => {
        this.chainId = response.result;
      });
    }

    stream.on('data', (data) => {
      if (data.response && this.resolvers[data.id]) {
        if (data.response.error) {
          this.resolvers[data.id].reject(data.response.error);
        } else {
          this.resolvers[data.id].resolve(data.response.result);
        }
        if (this.resolvers[data.id].callback) {
          this.resolvers[data.id].callback(data.response.error, data.response);
        }
        delete this.resolvers[data.id];
      }

      if (data.event) {
        switch (data.event) {
          case 'defaultNetworkChanged':
            this.chainId = `0x${parseInt(data.network).toString(16)}`;
            this.emit('chainChanged', this.chainId);
            return;

          default:
            console.log('Unhandled event', data);
        }
      }
    });
  }

  enable() {
    return this.rpc({ method: 'eth_requestAccounts', params: [] });
  }

  async request(payload: any) {
    return this.rpc(payload);
  }

  send(methodOrPayload: any, callbackOrArgs: any) {
    if (
      typeof methodOrPayload === 'string' &&
      (!callbackOrArgs || Array.isArray(callbackOrArgs))
    ) {
      return this.rpc({ method: methodOrPayload, params: callbackOrArgs });
    } else if (
      typeof methodOrPayload === 'object' &&
      typeof callbackOrArgs === 'function'
    ) {
      return this.rpc(methodOrPayload, callbackOrArgs);
    } else {
      throw new Error(`Invalid send params ${JSON.stringify(methodOrPayload)}`);
    }
  }

  sendAsync(payload: any, callback: (err: any, data: any) => void) {
    return this.rpc(payload, callback);
  }

  private rpc(payload: any, callback?: (err: any, data: any) => void) {
    if (!payload.jsonrpc) {
      payload.jsonrpc = '2.0';
    }
    if (!payload.id) {
      payload.id = Math.floor(Math.random() * 10000000);
    }

    return new Promise((resolve, reject) => {
      const id = Math.floor(Math.random() * 10000000);
      this.resolvers[id] = { resolve, reject, callback };

      this.stream.write({ chainId: this.network, payload: payload, id });
    });
  }
}
