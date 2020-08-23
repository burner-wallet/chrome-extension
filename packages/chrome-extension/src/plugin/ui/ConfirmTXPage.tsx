import React, { useEffect, useLayoutEffect, useState } from 'react';
import { PluginPageContext } from '@burner-wallet/types';
import { Asset } from '@burner-wallet/assets';
import styled from 'styled-components';
import { PendingSignature } from '../../types';
import ChromeExtensionPlugin from '../ChromeExtensionPlugin';
import TXPreview from './TXPreview';

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

const ConfirmSignaturePage: React.FC<PluginPageContext<{}, ChromeExtensionPlugin>> = ({
  location, BurnerComponents, plugin, actions
}) => {
  const [currentSignature, setCurrentSignature] = useState<PendingSignature | null>(null);

  const { Button } = BurnerComponents;

  const getNextSignature = async () => {
    const signature = await plugin.getNextPendingSignature();
    setCurrentSignature(signature);

    if (!signature) {
      if (plugin.isPopIn()) {
        plugin.close();
      } else {
        actions.navigateTo('/');
      }
      return;
    }
  };

  useEffect(() => {
    getNextSignature();
  }, []);

  useLayoutEffect(() => {
    window.parent.postMessage({ resize: true, height: document.body.scrollHeight }, '*');
  }, [currentSignature]);

  if (!currentSignature) {
    return (
      <Page>
        <h1>Loading...</h1>
      </Page>
    );
  }

  const approve = async () => {
    await plugin.approveSignature(currentSignature.id);
    getNextSignature();
  };
  const cancel = async () => {
    await plugin.rejectSignature(currentSignature.id);
    getNextSignature();
  };

  return (
    <Page>
      <h1>Confirm {currentSignature.type === 'tx' ? 'Transaction' : 'Signature'}</h1>
      
      {currentSignature.type === 'tx' ? (
        <TXPreview tx={currentSignature.tx} />
      ) : 'Signature'}

      <Buttons>
        <Button onClick={cancel}>Reject</Button>
        <Button onClick={approve}>Approve</Button>
      </Buttons>
    </Page>
  );
};

export default ConfirmSignaturePage;
