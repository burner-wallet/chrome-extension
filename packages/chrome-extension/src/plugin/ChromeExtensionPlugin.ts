import { BurnerPluginContext, Plugin, Actions } from '@burner-wallet/types';
import singleton from '../proxy-core/singleton';
import { PendingSignature } from '../types';
import ApproveSitePage from './ui/ApproveSitePage';
import ConfirmTXPage from './ui/ConfirmTXPage';
import HashRouter from './ui/HashRouter';
import NetworkPicker from './ui/NetworkPicker';

interface PluginActionContext {
  actions: Actions;
}


export default class ChromeExtensionPlugin implements Plugin {
  private pluginContext?: BurnerPluginContext;

  constructor() {
    chrome.tabs.getCurrent((tab: any) => {
      if (tab) {
        document.head.style.height = 'initial';
        document.body.style.height = 'initial';
        document.querySelector('#root').style.height = 'initial';
      } else {
        window.document.body.style.width = '360px';
      }
    });
  }

  initializePlugin(pluginContext: BurnerPluginContext) {
    this.pluginContext = pluginContext;

    pluginContext.addPage('/approve-site', ApproveSitePage);
    pluginContext.addPage('/confirm-tx', ConfirmTXPage);
    pluginContext.addElement('home-middle', HashRouter);
    pluginContext.addElement('home-middle', NetworkPicker);
  }

  isPopIn(): boolean {
    return window.parent !== window;
  }

  close() {
    window.parent.postMessage({ close: true }, '*');
  }

  setSiteApproval(origin: string, isApproved: boolean) {
    return singleton.core!.setSiteApproval(origin, isApproved);
  }

  getNetworks() {
    return singleton.core!.getNetworks();
  }

  getDefaultNetwork() {
    return singleton.core!.getDefaultNetwork();
  }

  setDefaultNetwork(newDefault: string) {
    return singleton.core!.setDefaultNetwork(newDefault);
  }

  async getNextPendingSignature(domain?: string): Promise<PendingSignature | null> {
    const signatures = await singleton.core!.rpc('getPendingSignatures', domain);
    return signatures.length === 0 ? null : signatures[0];
  }

  approveSignature(id: number) {
    return singleton.core!.rpc('approveSignature', id);
  }

  rejectSignature(id: number) {
    return singleton.core!.rpc('rejectSignature', id);
  }
}
