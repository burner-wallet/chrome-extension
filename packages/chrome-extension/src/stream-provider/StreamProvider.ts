import pump from 'pump';
import RPCEngine from 'json-rpc-engine';
import createIdRemapMiddleware from 'json-rpc-engine/src/idRemapMiddleware';
import createJsonRpcStream from 'json-rpc-middleware-stream';
import { Writable } from 'stream';

export default class StreamProvider {
  private stream: Writable;
  private resolvers: { [id: string]: { resolve: any, reject: any, callback: any } } = {};
  private network: string;

  constructor(stream: Writable, network?: string) {
    this.stream = stream;
    this.network = network || 'default';

    stream.on('data', (data) => {
      if (data.response && this.resolvers[data.id]) {
        this.resolvers[data.id].resolve(data.response);
        if (this.resolvers[data.id].callback) {
          this.resolvers[data.id].callback(null, data.response);
        }
        delete this.resolvers[data.id];
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
    return new Promise((resolve, reject) => {
      const id = Math.floor(Math.random() * 10000000);
      this.resolvers[id] = { resolve, reject, callback };

      this.stream.write({ chainId: this.network, payload: { ...payload, id2: payload.id }, id });
    });
  }
}
