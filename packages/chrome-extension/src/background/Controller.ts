import BurnerCore from '@burner-wallet/core';
import { EventEmitter } from 'events';
import PortStream from 'extension-port-stream';
import _ from 'lodash';

const assetProps = ['id', 'name', 'network', 'type', 'icon', 'address'];

export default class Controller {
  private core: BurnerCore;
  private events: EventEmitter;

  constructor(core: BurnerCore) {
    this.core = core;

    this.events = new EventEmitter();
  }

  connectToWallet(port: PortStream) {
    port.write({
      msg: 'initialize',
      assets: this.core.getAssets().map(asset => _.pick(asset, assetProps)),
      accounts: this.core.getAccounts(),
    });
    console.log('wallet connected');

    port.on('end', () => console.log('wallet close'));
  }
}
