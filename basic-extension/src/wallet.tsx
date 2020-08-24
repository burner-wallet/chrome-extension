import React from 'react';
import ReactDOM from 'react-dom';
import Exchange, { Uniswap, XDaiBridge } from '@burner-wallet/exchange';
import ModernUI from '@burner-wallet/modern-ui';
import { ChromeExtensionPlugin, ChromeExtensionSigner, ProxyCore } from '@burner-wallet/chrome-extension';

const core = new ProxyCore();

const BurnerWallet = () =>
  <ModernUI
    title="BurnerX"
    // @ts-ignore
    core={core}
    plugins={[
      new ChromeExtensionPlugin(),
      new Exchange([new XDaiBridge(), new Uniswap('dai')]),
    ]}
    theme={{
      balanceStyle: 'stack',
    }}
    router="memory"
  />



ReactDOM.render(<BurnerWallet />, document.getElementById('root'));
