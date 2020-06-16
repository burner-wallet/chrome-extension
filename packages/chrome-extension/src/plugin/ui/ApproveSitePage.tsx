import React from 'react';
import { PluginPageContext } from '@burner-wallet/types';
import { Asset } from '@burner-wallet/assets';
import styled from 'styled-components';
import ChromeExtensionPlugin from '../ChromeExtensionPlugin';

const Page = styled.div`
  background: white;
  padding: 8px;
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Buttons = styled.div`
  display: flex;
  flex: 1;
  justify-content: space-around;
  align-items: flex-end;
`;

const close = () => window.parent.postMessage({ close: true }, '*');

const ApproveSitePage: React.FC<PluginPageContext<{}, ChromeExtensionPlugin>> = ({ location, BurnerComponents, plugin }) => {
  const { Button } = BurnerComponents;

  const connect = async () => {
    await plugin.setSiteApproval(location.state.domain, true);
    close();
  };
  const cancel = async () => {
    await plugin.setSiteApproval(location.state.domain, false);
    close();
  };

  return (
    <Page>
      <h1>Connect to site</h1>
      <div>{location.state.domain}</div>
      <div>This site is requesting permission to view your account</div>

      <Buttons>
        <Button onClick={cancel}>Cancel</Button>
        <Button onClick={connect}>Connect</Button>
      </Buttons>
    </Page>
  );
};

export default ApproveSitePage;
