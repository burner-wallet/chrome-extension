declare module 'post-message-stream' {
  import * as stream from 'stream';

  export default class PostMessageStream extends stream.Writable {
    constructor(options: any);

    write(chunk: any): boolean;
    on(event: string, cb: (data: any) => void): this;
  }
}

declare module 'extension-port-stream' {
  import * as stream from 'stream';

  export default class PortStream extends stream.Writable {
    constructor(port: any);

    write(chunk: any): boolean;
    on(event: string, cb: (data: any) => void): this;
  }
}

declare module 'json-rpc-engine' {
  export default class RPCEngine {
    push(middleware: any): void;

    handle(payload: any, callback: (err: any, data: any) => any): void;
  }
}

declare module 'json-rpc-engine/src/idRemapMiddleware' {
  function createIdRemapMiddleware(): any;
  export default createIdRemapMiddleware;
}

declare module 'json-rpc-middleware-stream' {
  function createJsonRpcStream(): any;
  export default createJsonRpcStream;
}
