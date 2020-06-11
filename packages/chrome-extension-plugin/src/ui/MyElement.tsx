import React, { useEffect, useState } from 'react';
import { PluginElementContext } from '@burner-wallet/types';
import ChromeExtensionPlugin from '../ChromeExtensionPlugin';

const MyElement: React.FC<PluginElementContext<ChromeExtensionPlugin>> = ({ plugin }) => {
  const [block, setBlock] = useState<number | null>(null);

  useEffect(() => {
    plugin.getBlockNum().then((num: number) => setBlock(num))
  }, []);

  return (
    <div>
      <div>Injected plugin element</div>
      {block && (
        <div>Current block number: {block}</div>
      )}
    </div>
  );
};

export default MyElement;
