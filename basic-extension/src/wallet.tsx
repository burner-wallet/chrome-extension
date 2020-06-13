import React from 'react';
import ReactDOM from 'react-dom';
import { xdai, dai, eth } from '@burner-wallet/assets';
import BurnerCore from '@burner-wallet/core';
import { LocalSigner } from '@burner-wallet/core/signers';
import { InfuraGateway, XDaiGateway, } from '@burner-wallet/core/gateways';
import Exchange, { Uniswap, XDaiBridge } from '@burner-wallet/exchange';
import ModernUI from '@burner-wallet/modern-ui';
import { ChromeExtensionPlugin, ChromeExtensionSigner } from '@burner-wallet/chrome-extension';

const core = new BurnerCore({
  signers: [new ChromeExtensionSigner()],
  gateways: [
    new InfuraGateway(process.env.REACT_APP_INFURA_KEY),
    new XDaiGateway(),
  ],
  assets: [xdai, dai, eth],
});

const exchange = new Exchange([new XDaiBridge(), new Uniswap('dai')]);

const BurnerWallet = () =>
  <ModernUI
    title="Basic Wallet"
    core={core}
    plugins={[exchange, new ChromeExtensionPlugin()]}
    router="memory"
  />


ReactDOM.render(<BurnerWallet />, document.getElementById('root'));
