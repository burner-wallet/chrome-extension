interface BasePendingSignature {
  id: number;
  domain: string;
  resolve: () => void;
  reject: () => void;
}

export interface TX {
  from: string;
  value?: string;
  to?: string;
  data?: string;
  gas?: string;
  gasPrice?: string;
  nonce?: string;
}

export interface PendingTransaction extends BasePendingSignature {
  type: 'tx';
  tx: TX;
}

export interface PendingSignedMessage extends BasePendingSignature {
  type: 'message';
}

export type PendingSignature = PendingTransaction | PendingSignedMessage;
