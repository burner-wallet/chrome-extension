import pump from 'pump';
import PostMessageStream from 'post-message-stream';
import PortStream from 'extension-port-stream';

export default function contentScript() {
  injectScript();
  setupStreams();
}

function injectScript() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.bundle.js');
  (document.head || document.documentElement).appendChild(script);
  script.remove();
}

function setupStreams() {
  const pageStream = new PostMessageStream({
    name: 'burnercs',
    target: 'injected',
  });

  const extensionPort = chrome.runtime.connect({ name: 'contentscript' });
  const extensionStream = new PortStream(extensionPort);

  pump(pageStream, extensionStream, pageStream, (err: any) => console.error(`Stream error:`, err));
}
