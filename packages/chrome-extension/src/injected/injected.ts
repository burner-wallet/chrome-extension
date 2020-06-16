import PostMessageStream from 'post-message-stream';
import ObjectMultiplex from 'obj-multiplex';
import pump from 'pump';
import StreamProvider from '../stream-provider/StreamProvider';
import PopIn from './PopIn';

export default function injected() {
  const stream = new PostMessageStream({
    name: 'injected',
    target: 'burnercs',
  });

  const mux = new ObjectMultiplex();
  pump(mux, stream, mux, (err) => console.error('Pipe closed', err));

  const rpcStream = mux.createStream('rpc');

  const provider = new StreamProvider(rpcStream);

  // @ts-ignore
  window.ethereum = provider;

  const popInStream = mux.createStream('popin');
  popInStream.on('data', (data) => {
    new PopIn(data.url);
  });
}
