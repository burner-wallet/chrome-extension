import React, { useEffect, useState } from 'react';
import { PluginElementContext } from '@burner-wallet/types';
import ChromeExtensionPlugin from '../ChromeExtensionPlugin';
import { metamaskExists } from '../../lib';

const MetamaskOverwrite: React.FC<PluginElementContext<ChromeExtensionPlugin>> = ({ plugin }) => {
  const [hasMetamask, setHasMetamask] = useState(false);
  const [overwrite, setOverwrite] = useState(false);

  useEffect(() => {
    let mounted = true;
    metamaskExists().then(async (exists: boolean) => {
      setHasMetamask(exists);
      const metamaskOverwrite = await plugin.getMetamaskOverwrite();
      setOverwrite(metamaskOverwrite);
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!hasMetamask) {
    return null;
  }

  const changeOverwrite = (overwriteVal: boolean) => () => {
    setOverwrite(overwriteVal);
    plugin.setMetamaskOverwrite(overwriteVal);
  }

  return (
    <div>
      <div>
        <label>
          <input type="radio" name="metamask" checked={overwrite} onChange={changeOverwrite(true)} />
          Use BurnerX
        </label>
      </div>
      <div>
        <label>
          <input type="radio" name="metamask" checked={!overwrite} onChange={changeOverwrite(false)} />
          Use Metamask
        </label>
      </div>
    </div>
  );
};

export default MetamaskOverwrite;
