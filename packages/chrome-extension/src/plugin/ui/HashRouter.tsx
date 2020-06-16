import React, { useEffect } from 'react';
import { PluginElementContext } from '@burner-wallet/types';
import ChromeExtensionPlugin from '../ChromeExtensionPlugin';

const parse = (hash: string) => hash.substring(1).split('&').reduce((out: any, pair: string) => {
  const split = pair.split('=');
  return { ...out, [split[0]]: split[1] };
}, {} as any);

const HashRouter: React.FC<PluginElementContext<ChromeExtensionPlugin>> = ({ plugin, actions }) => {
  useEffect(() => {
    const { page, ...data } = parse(document.location.hash);
    if (page) {
      actions.navigateTo(`/${page}`, data);
    }
  }, [document.location.hash]);

  return null;
};

export default HashRouter;
