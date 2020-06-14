import { Asset } from '@burner-wallet/assets';

export interface AssetProps {
  id: string;
  name: string;
  network: string;
  type?: string;
  usdPrice?: number;
  priceSymbol?: string;
  icon?: string;
  decimals?: number;
  address?: string;

  supportsMessages: boolean;
}

type CallFn = (method: string, ...params: any[]) => Promise<any>;

export default class ProxyAsset extends Asset {
  private call: CallFn;
  private supportsMsg: boolean;

  constructor(props: AssetProps, call: CallFn) {
    super(props);
    this.call = call;
    this.supportsMsg = props.supportsMessages;
  }

  getBalance(account: string): Promise<string> {
    return this.call('getBalance', account);
  }

  // @ts-ignore
  getSendFee(from: string, to: string): Promise<string> {
    return this.call('getSendFee', from, to);
  }

  getTx(txHash: string): Promise<any> {
    return this.call('getTx', txHash);
  }

  startWatchingAddress(address: string) {
    return this.call('startWatchingAddress', address);
  }

  send(params: any): Promise<any> {
    return this.call('send', params);
  }

  supportsMessages() {
    return this.supportsMsg;
  }
}
