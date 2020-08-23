import { Writable } from 'stream';
import { PendingSignature } from '../types';

export default class SignatureQueue {
  private signatures: PendingSignature[] = [];

  confirmSignature(stream: Writable, tx: any, domain: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.signatures.push({
        type: 'tx',
        domain,
        tx,
        resolve,
        reject,
        id: Math.floor(Math.random() * 100000),
      });

      stream.write({ url: chrome.runtime.getURL(`wallet.html#page=confirm-tx&domain=${domain}`)});
    });
  }

  getPendingSignatures(domain?: string) {
    return domain ? this.signatures.filter((sig: PendingSignature) => sig.domain === domain) : this.signatures;
  }

  approveSignature(id: number) {
    for (const index in this.signatures) {
      const signature = this.signatures[index];
      if (signature.id === id) {
        this.signatures.splice(parseInt(index), 1);
        signature.resolve();
        return;
      }
    }
    console.warn(`Tx ${id} not found`);
  }

  rejectSignature(id: number) {
    for (const index in this.signatures) {
      const signature = this.signatures[index];
      if (signature.id === id) {
        this.signatures.splice(parseInt(index), 1);
        signature.reject();
        return;
      }
    }
    console.warn(`Tx ${id} not found`);
  }
}
