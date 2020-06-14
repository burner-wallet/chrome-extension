import React from 'react';
import ReactDOM from 'react-dom';
import ModernUI from '@burner-wallet/modern-ui';
import { ChromeExtensionPlugin, ChromeExtensionSigner, ProxyCore } from '@burner-wallet/chrome-extension';

const core = new ProxyCore();

const BurnerWallet = () =>
  <ModernUI
    title="Basic Wallet"
    // @ts-ignore
    core={core}
    plugins={[new ChromeExtensionPlugin()]}
    router="memory"
  />


ReactDOM.render(<BurnerWallet />, document.getElementById('root'));
