import React, { useEffect, useState } from 'react';
import { PluginElementContext } from '@burner-wallet/types';
import ChromeExtensionPlugin from '../ChromeExtensionPlugin';
import networkNames from '../networks';

const NetworkPicker: React.FC<PluginElementContext<ChromeExtensionPlugin>> = ({ plugin }) => {
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [networks, setNetworks] = useState<string[]>([]);

  useEffect(() => {
    plugin.getNetworks().then(_networks => setNetworks(_networks));
    plugin.getDefaultNetwork().then(_default => setSelectedNetwork(_default));
  }, []);

  const changeNetwork = async (newNetwork: string) => {
    setSelectedNetwork(newNetwork);
    await plugin.setDefaultNetwork(newNetwork);
  }

  return (
    <div>
      <select value={selectedNetwork} onChange={(e: any) => changeNetwork(e.target.value)}>
        {networks.map(network => (
          <option key={network} value={network}>{networkNames[network]}</option>
        ))}
      </select>
    </div>
  );
};

export default NetworkPicker;
