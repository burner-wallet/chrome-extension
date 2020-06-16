import { BurnerPluginContext, Plugin, Actions } from '@burner-wallet/types';
import ApproveSitePage from './ui/ApproveSitePage';
import HashRouter from './ui/HashRouter';
import singleton from '../proxy-core/singleton';

interface PluginActionContext {
  actions: Actions;
}

export default class ChromeExtensionPlugin implements Plugin {
  private pluginContext?: BurnerPluginContext;

  constructor() {
    chrome.tabs.getCurrent((tab: any) => {
      if (!tab) {
        window.document.body.style.width = '360px';
      }
    });
  }

  initializePlugin(pluginContext: BurnerPluginContext) {
    this.pluginContext = pluginContext;

    pluginContext.addPage('/approve-site', ApproveSitePage);
    pluginContext.addElement('home-middle', HashRouter);
  }

  setSiteApproval(origin: string, isApproved: boolean) {
    return singleton.core!.setSiteApproval(origin, isApproved);
  }
}
