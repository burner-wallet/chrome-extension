import React from 'react';
import ReactDOM from 'react-dom';
import { ERC20Asset, NativeAsset } from '@burner-wallet/assets';
import BurnerCore from '@burner-wallet/core';
import { HTTPGateway } from '@burner-wallet/core/gateways';
import ModernUI from '@burner-wallet/modern-ui';
import { ChromeExtensionPlugin, ChromeExtensionSigner } from '@burner-wallet/chrome-extension';

const core = new BurnerCore({
  signers: [
    new ChromeExtensionSigner({ privateKey: process.env.REACT_APP_PK, saveKey: false }),
  ],
  gateways: [
    new HTTPGateway('http://localhost:8545', '5777'),
  ],
  assets: [
    new ERC20Asset({
      id: 'localerc20',
      name: 'Local Token',
      network: '5777',
      // @ts-ignore
      address: process.env.REACT_APP_ERC20_ADDRESS,
    }),
    new NativeAsset({
      id: 'geth',
      name: 'Ganache ETH',
      network: '5777',
    }),
  ],
});


const BurnerWallet = () =>
  <ModernUI
    title="Basic Wallet"
    core={core}
    plugins={[new ChromeExtensionPlugin()]}
    router="memory"
  />


ReactDOM.render(<BurnerWallet />, document.getElementById('root'));
