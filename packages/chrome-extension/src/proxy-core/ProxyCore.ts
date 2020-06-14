import { Asset } from '@burner-wallet/assets';
import HistoryEvent, { HistoryEventProps } from '@burner-wallet/core/HistoryEvent';
import { SignedTransaction } from '@burner-wallet/core/signers/Signer';
import { EventEmitter } from 'events';
import PortStream from 'extension-port-stream';
import Web3 from 'web3';
import ProxyAsset from './ProxyAsset';

export default class ProxyCore {
  private events: EventEmitter = new EventEmitter();
  private accounts: string[] = [];
  private assets: ProxyAsset[] = [];

  constructor() {
    const extensionPort = chrome.runtime.connect({ name: 'wallet' });
    const extensionStream = new PortStream(extensionPort);

    const resolvers: { [id: number]: { resolve: any, reject: any } } = {};
    let nextId = 0;

    extensionStream.on('data', (data: any) => {
      if (data.msg === 'initialize') {
        this.assets = data.assets.map((assetData: any) => {
          const call = (command: string, ...args: any[]) => {
            return new Promise((resolve, reject) => {
              const id = nextId++;
              resolvers[id] = { resolve, reject };
              extensionStream.write({ id, msg: 'assetCall', asset: assetData.id, command, args });
            });
          };

          return new ProxyAsset(assetData, call);
        });
        this.accounts = data.accounts;
        this.events.emit('accountChange', this.accounts);
      } else if (data.response) {
        if (resolvers[data.id]) {
          resolvers[data.id].resolve(data.response);
          delete resolvers[data.id];
        }
      }
    });
  }

  onAccountChange(callback: (accounts: string[]) => void) {
    this.events.on('accountChange', callback);
  }
  
  getAssets(): Asset[] {
    // @ts-ignore
    return this.assets;
  }

  getAccounts(): string[] {
    return this.accounts;
  }

  async signTx(txParams: any): Promise<SignedTransaction> {
    return txParams as SignedTransaction;
  }

  async signMsg(msg: string, account: string): Promise<string> {
    return '';
  }

  shouldSkipSigning(network:string, txParams:any): boolean {
    return false;
  }

  async handleRequest(network: string, payload: any) {
    return null;
  }

  getProvider(network: string): any {
    return null;
  }

  getWeb3(network: string, options?: any): Web3 {
    return new Web3(this.getProvider(network));
  }

  canCallSigner(action: string, account: string) {
    // Todo: cache all of these
    return true;
  }

  callSigner(action: string, account: string, ...params: any[]): any {
    return null;
  }


  addHistoryEvent(eventProps: HistoryEventProps) {
    return null;
  }

  getHistoryEvents(options: any): HistoryEvent[] {
    return [];
  }

  onHistoryEvent(listener: (event: HistoryEvent) => void) {
    return null;
  }

  removeHistoryEventListener(listener: (event: HistoryEvent) => void) {
    return null;
  }

  stop() {}
}
