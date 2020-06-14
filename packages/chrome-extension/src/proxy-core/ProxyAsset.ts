import { Asset } from '@burner-wallet/assets';

export interface AssetConstructor {
  id: string;
  name: string;
  network: string;
  type?: string;
  usdPrice?: number;
  priceSymbol?: string;
  icon?: string;
  decimals?: number;
  address?: string;
}

export default class ProxyAsset extends Asset {
  constructor(props: AssetConstructor) {
    super(props);
  }
}
