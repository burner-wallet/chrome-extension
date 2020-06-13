import Signer from '@burner-wallet/core/signers/Signer';
import Web3 from 'web3';
import { toBN } from 'web3-utils';

const arrayEquals = (a: any[], b: any[]) => a.length === b.length && a.every((val, i) => val === b[i]);

interface ChromeExtensionSignerOptions {
  privateKey?: string;
  saveKey?: boolean;
  gasMultiplier?: number;
}

export default class ChromeExtensionSigner extends Signer {
  private account: any;
  private _saveKey: boolean;
  private gasMultiplier: number;

  constructor({ privateKey, saveKey=true, gasMultiplier=1 }: ChromeExtensionSignerOptions = {}) {
    super({ id: 'chrome-extension' });
    this._saveKey = saveKey;
    this.gasMultiplier = gasMultiplier;
    this.account = { address: '0x0000000000000000000000000000000000000000' };

    if (this._isValidPK(privateKey)) {
      this._generateAccountFromPK(privateKey!);
    } else {
      this._loadOrGenerateAccount();
    }
  }

  getAccounts() {
    return [this.account.address];
  }

  permissions() {
    return ['readKey', 'writeKey', 'burn', 'keyToAddress'];
  }

  async signTx(tx: any): Promise<any> {
    const _tx = {
      ...tx,

      // Workaround for https://github.com/ethereumjs/ethereumjs-tx/pull/195
      common: {
        customChain: {
          chainId: tx.chainId,
          networkId: tx.chainId,
        },
        hardfork: 'istanbul',
      },
    };

    if (this.gasMultiplier !== 1) {
      const multiplier = Math.floor(this.gasMultiplier * 1000).toString();
      _tx.gas = toBN(tx.gas).mul(toBN(multiplier)).div(toBN('1000'));
    }

    const { rawTransaction } = await this.account.signTransaction(_tx);
    _tx.signedTransaction = rawTransaction;

    return _tx;
  }

  async signMsg(msg: any) {
    return this.account.sign(msg).signature;
  }

  invoke(action: string, account: string, ...params: any[]) {
    if (!this.hasAccount(account)) {
      throw new Error('Can not call invoke, incorrect account');
    }

    switch (action) {
      case 'readKey':
        return this.account.privateKey;
      case 'writeKey':
        const [newPK] = params;
        this._generateAccountFromPK(newPK);
        return this.account.address;
      case 'burn':
        this._generateNewAccount();
        return this.account.address;
      case 'keyToAddress':
        const [pk] = params;
        const { address } = (new Web3()).eth.accounts.privateKeyToAccount(pk);
        return address;
      default:
        throw new Error(`Unknown action ${action}`);
    }
  }

  private _isValidPK(pk?: string | null): boolean {
    return !!pk && parseInt(pk) > 0;
  }

  private async _loadOrGenerateAccount() {
    const pk = await this._loadStoredPK();

    if (this._isValidPK(pk)) {
      this._generateAccountFromPK(pk!);
    } else {
      this._generateNewAccount();
    }
  }

  private _loadStoredPK(): Promise<string | null> {
    return new Promise(resolve =>
      chrome.storage.local.get('privateKey', (items: any) => resolve(items.privateKey)));
  }

  private _generateAccountFromPK(privateKey: string) {
    this.account = (new Web3()).eth.accounts.privateKeyToAccount(privateKey);
    this._saveAccount();
    this.events.emit('accountChange');
  }

  private _generateNewAccount() {
    this.account = (new Web3()).eth.accounts.create();
    this._saveAccount();
    this.events.emit('accountChange');
  }

  private _saveAccount() {
    if (!this._saveKey) {
      return;
    }

    const { privateKey } = this.account;
    if (!privateKey || !/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
      throw new Error(`Invalid Private Key "${privateKey}"`);
    }

    chrome.storage.local.set({ privateKey: this.account.privateKey });
  }
}
