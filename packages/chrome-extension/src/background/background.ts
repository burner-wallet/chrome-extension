import BurnerCore from '@burner-wallet/core';
import PortStream from 'extension-port-stream';
import Controller from './Controller';

interface BackgroundOptions {
  core: BurnerCore;
  plugins?: any[];
}

const approved: { [origin: string]: boolean } = {};

export default function setupBackground({ core, plugins=[] }: BackgroundOptions) {
  const controller = new Controller(core);

  chrome.runtime.onConnect.addListener((port) => {
    console.log(port);
    const portStream = new PortStream(port);

    if (port.name === 'wallet') {
      controller.connectToWallet(portStream);
    } else if (port.name === 'contentscript') {
      controller.connectToCS(portStream, port.sender!.origin, port.tab);
    } else {
      console.error(`Unknown port ${port.name}`)
    }

    portStream.on('data', (data: any) => {
      if (data.method === 'enable') {
        approved[port.sender.origin] = true;
        console.log(approved);
      }
      console.log('in', data);
    });
  });
}
