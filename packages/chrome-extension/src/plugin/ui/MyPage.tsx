import React from 'react';
import { PluginPageContext } from '@burner-wallet/types';
import { Asset } from '@burner-wallet/assets';
import ChromeExtensionPlugin from '../ChromeExtensionPlugin';

const MyPage: React.FC<PluginPageContext<{}, ChromeExtensionPlugin>> = ({ burnerComponents, assets, defaultAccount }) => {
  const { Page } = burnerComponents;
  return (
    <Page title="My Page">
      <div>Account: {defaultAccount}</div>
      <div>Assets: {assets.map((asset: Asset) => asset.name).join(', ')}</div>
    </Page>
  );
};

export default MyPage;
