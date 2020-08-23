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

declare module 'obj-multiplex' {
  import * as stream from 'stream';

  export default class ObjectMultiplex extends stream.Writable {
    constructor();

    write(chunk: any): boolean;
    on(event: string, cb: (data: any) => void): this;

    createStream(name: string): stream.Writable;
  }
}
