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
    }

    portStream.on('data', (data: any) => {
      if (data.method === 'enable') {
        approved[port.sender.origin] = true;
        console.log(approved);
      }
      console.log('in', data);
    });

    // const processName = remotePort.name;
    // const isMetaMaskInternalProcess = metamaskInternalProcessHash[processName]

    // if (metamaskBlockedPorts.includes(remotePort.name)) {
    //   return false
    // }

    // if (isMetaMaskInternalProcess) {
    //   const portStream = new PortStream(remotePort)
    //   // communication with popup
    //   controller.isClientOpen = true
    //   controller.setupTrustedCommunication(portStream, remotePort.sender)

    //   if (processName === ENVIRONMENT_TYPE_POPUP) {
    //     popupIsOpen = true

    //     endOfStream(portStream, () => {
    //       popupIsOpen = false
    //       controller.isClientOpen = isClientOpenStatus()
    //     })
    //   }

    //   if (processName === ENVIRONMENT_TYPE_NOTIFICATION) {
    //     notificationIsOpen = true

    //     endOfStream(portStream, () => {
    //       notificationIsOpen = false
    //       controller.isClientOpen = isClientOpenStatus()
    //     })
    //   }

    //   if (processName === ENVIRONMENT_TYPE_FULLSCREEN) {
    //     const tabId = remotePort.sender.tab.id
    //     openMetamaskTabsIDs[tabId] = true

    //     endOfStream(portStream, () => {
    //       delete openMetamaskTabsIDs[tabId]
    //       controller.isClientOpen = isClientOpenStatus()
    //     })
    //   }
    // } else {
    //   if (remotePort.sender && remotePort.sender.tab && remotePort.sender.url) {
    //     const tabId = remotePort.sender.tab.id
    //     const url = new URL(remotePort.sender.url)
    //     const { origin } = url

    //     remotePort.onMessage.addListener((msg) => {
    //       if (msg.data && msg.data.method === 'eth_requestAccounts') {
    //         requestAccountTabIds[origin] = tabId
    //       }
    //     })
    //   }
    //   connectExternal(remotePort)
    // }








  });
}
