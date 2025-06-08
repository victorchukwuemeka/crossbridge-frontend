/*import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { WalletBalance } from './components/WalletBalance';
import { BridgeForm } from './components/BridgeForm';
import { TransactionInfoCard } from './components/TransactionInfoCard';

export default function App() {
  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
      <h1>Connect your Solana Wallet</h1>
      <WalletMultiButton />
      
      <WalletBalance />
      <BridgeForm 
        onTransactionComplete={() => {
          // Refresh balance after 2 seconds
          setTimeout(() => window.location.reload(), 2000);
        } } balance={null}      />

     
    </div>
  );
}*/



/*import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { WalletBalance } from './components/WalletBalance';
import { BridgeForm } from './components/BridgeForm';
import { TransactionInfoCard } from './components/TransactionInfoCard';

export default function App() {
  const mockTransactionInfo = {
    network: {
      network: 'Solana to Ethereum',
      testnet: 'Mainnet'
    },
    transaction: {
      inputAmount: 1.5,
      outputAmount: 1.497,
    },
    token: {
      symbol: 'wSOL'
    },
    fees: {
      bridgeFee: 0.0015,
      gasFee: 0.0015,
      totalFees: 0.003
    },
    addresses: {
      recipientAddress: '0x742d35Cc6634C0532925a3b8D4341EaE7C5B4D8D'
    },
    metadata: {
      transactionHash: '5j7x8k9m2n3p4q5r6s7t8u9v1w2x3y4z5a6b7c8d9e1f2g3h4i5j6k7l8m9n1p2q3r4s5t',
      blockExplorerLink: 'https://solscan.io/tx/5j7x8k9m2n3p4q5r6s7t8u9v1w2x3y4z5a6b7c8d9e1f2g3h4i5j6k7l8m9n1p2q3r4s5t'
    },
    ui: {
      statusIndicator: 'completed' as const,
      showConfirmButton: false,
      canCopy: true
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
      <h1>Connect your Solana Wallet</h1>
      <WalletMultiButton />
      <WalletBalance />
      <BridgeForm
        onTransactionComplete={() => {
          // Refresh balance after 2 seconds
          setTimeout(() => window.location.reload(), 2000);
        }} 
        balance={null} 
      />
      <TransactionInfoCard info={mockTransactionInfo} />
    </div>
  );
}*/


/*import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { WalletBalance } from './components/WalletBalance';
import { BridgeForm } from './components/BridgeForm';
import { TransactionInfoCard } from './components/TransactionInfoCard';
import type { CompleteTransactionInfo } from './ethereum/ethereumWsolContract';

export default function App() {
  const mockTransactionInfo: CompleteTransactionInfo = {
    network: {
      network: 'Solana to Ethereum',
      testnet: 'Mainnet',
      chainId: 1,
      rpcUrl: 'https://mainnet.infura.io/v3/your-key',
      explorerUrl: 'https://etherscan.io',
      nativeCurrency: {

      }'ETH'
    },
    transaction: {
      inputAmount: 1.5,
      outputAmount: 1.497,
    },
    token: {
      symbol: 'wSOL'
    },
    fees: {
      bridgeFee: 0.0015,
      gasFee: 0.0015,
      totalFees: 0.003
    },
    addresses: {
      recipientAddress: '0x742d35Cc6634C0532925a3b8D4341EaE7C5B4D8D'
    },
    metadata: {
      transactionHash: '5j7x8k9m2n3p4q5r6s7t8u9v1w2x3y4z5a6b7c8d9e1f2g3h4i5j6k7l8m9n1p2q3r4s5t',
      blockExplorerLink: 'https://solscan.io/tx/5j7x8k9m2n3p4q5r6s7t8u9v1w2x3y4z5a6b7c8d9e1f2g3h4i5j6k7l8m9n1p2q3r4s5t'
    },
    ui: {
      statusIndicator: 'completed' as const,
      showConfirmButton: false,
      canCopy: true
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
      <h1>Connect your Solana Wallet</h1>
      <WalletMultiButton />
      <WalletBalance />
      <BridgeForm
        onTransactionComplete={() => {
          // Refresh balance after 2 seconds
          setTimeout(() => window.location.reload(), 2000);
        }} 
        balance={null} 
      />
      <TransactionInfoCard info={mockTransactionInfo} />
    </div>
  );
}*/


import { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { WalletBalance } from './components/WalletBalance';
import { BridgeForm } from './components/BridgeForm';
import { TransactionInfoCard } from './components/TransactionInfoCard';
import { getCompleteTransactionInfo, type CompleteTransactionInfo } from './ethereum/ethereumWsolContract';

export default function App() {
  const [transactionInfo, setTransactionInfo] = useState<CompleteTransactionInfo | null>(null);

  useEffect(() => {
    // Create sample transaction info when component mounts
    const loadTransactionInfo = async () => {
      const info = await getCompleteTransactionInfo(
        1.5, // solInput
        '0x742d35Cc6634C0532925a3b8D4341EaE7C5B4D8D', // recipientAddress
        'So11111111111111111111111111111111111111112', // sourceAddress (example SOL address)
        'completed', // transactionStatus
        '5j7x8k9m2n3p4q5r6s7t8u9v1w2x3y4z5a6b7c8d9e1f2g3h4i5j6k7l8m9n1p2q3r4s5t' // txHash
      );
      setTransactionInfo(info);
    };

    loadTransactionInfo();
  }, []);

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
      <h1>Connect your Solana Wallet</h1>
      <WalletMultiButton />
      <WalletBalance />
      <BridgeForm
        onTransactionComplete={() => {
          // Refresh balance after 2 seconds
          setTimeout(() => window.location.reload(), 2000);
        }} 
        balance={null} 
      />
      {transactionInfo && <TransactionInfoCard info={transactionInfo} />}
    </div>
  );
}