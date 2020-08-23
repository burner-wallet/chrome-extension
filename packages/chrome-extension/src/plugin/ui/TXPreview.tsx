import React, { Fragment } from 'react';
import styled from 'styled-components';
import { fromWei } from 'web3-utils';
import { TX } from '../../types';

const DataContainer = styled.div`
  font-family: monospace;
  overflow-wrap: anywhere;
  text-align: left;
  padding: 4px;
`;

// interface TXOverrides {
//   gas?: string;
//   gasPrice?: string;
// }

interface TXPreviewProps {
  tx: TX;
  // overrides: TXOverrides;
  // setOverrides: (overrides: TXOverrides) => void;
}

const TXPreview: React.FC<TXPreviewProps> = ({ tx }) => {
  return (
    <div>
      <div>From</div>
      <div>{tx.from}</div>

      {tx.to ? (
        <Fragment>
          <div>To</div>
          <div>{tx.to}</div>
        </Fragment>
      ) : (
        <div>Contract deployment</div>
      )}

      <div>Value</div>
      <div>{tx.value || 0} ETH</div>

      <div>Gas Limit</div>
      <div>{tx.gas ? parseInt(tx.gas) : null}</div>

      <div>Gas Price</div>
      <div>{tx.gasPrice ? fromWei(tx.gasPrice, 'gwei') + ' Gwei' : null}</div>

      <div>Nonce</div>
      <div>{tx.nonce || 'Auto '}</div>

      {tx.data ? (
        <Fragment>
          <div>Data</div>
          <DataContainer>{tx.data}</DataContainer>
        </Fragment>
      ) : null}
    </div>
  )
}

export default TXPreview;
