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
  const settingsStream = mux.createStream('settings');

  const provider = new StreamProvider(rpcStream);

  // @ts-ignore
  if (window.ethereum) {
    settingsStream.on('data', (data) => {
      if (data.overwriteMetamask) {
        // @ts-ignore
        window.ethereum = provider;
      }
    });
    settingsStream.write({ method: 'shouldOverwriteMetamask' });
  } else {
    // @ts-ignore
    window.ethereum = provider;
  }

  const popInStream = mux.createStream('popin');
  popInStream.on('data', (data) => {
    new PopIn(data.url);
  });
}
