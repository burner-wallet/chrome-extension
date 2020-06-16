import { Writable } from 'stream';

interface Domain {
  approved: boolean;
  awaitingApproval: { resolve: any, reject: any }[];
}

export default class Domains {
  private domains: { [origin: string]: Domain } = {};

  checkApproval(stream: Writable, origin: string) {
    if (this.domains[origin] && this.domains[origin].approved) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      if (!this.domains[origin]) {
        this.domains[origin] = { approved: false, awaitingApproval: [] };
      }
      this.domains[origin].awaitingApproval.push({ resolve, reject });

      stream.write({ url: chrome.runtime.getURL(`wallet.html#page=approve-site&domain=${origin}`)});
    });
  }

  approveSite(origin: string) {
    if (!this.domains[origin]) {
      this.domains[origin] = { approved: true, awaitingApproval: [] };
    }

    this.domains[origin].awaitingApproval.forEach(({ resolve }) => resolve());
    this.domains[origin].awaitingApproval = [];
    console.log(this.domains);
  }

  cancelApproval(origin: string) {
    if (this.domains[origin]) {
      this.domains[origin].awaitingApproval.forEach(({ reject }) => reject({
        code: 4001,
        message: 'User rejected permission',
      }));
      this.domains[origin].awaitingApproval = [];
    }
    console.log(this.domains);
  }
}
