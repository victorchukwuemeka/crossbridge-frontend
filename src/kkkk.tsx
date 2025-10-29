
import { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { WalletBalance } from './components/WalletBalance';
import  BridgeForm  from './components/BridgeForm';
import { TransactionInfoCard } from './components/TransactionInfoCard';
import BurnTokenComponent from "./components/BurnTokenComponent";
import { type CompleteTransactionInfo } from './ethereum/ethereumWsolContract';

export default function App() {
  const [transactionInfo, setTransactionInfo] = useState<CompleteTransactionInfo | null>(null);

  return (
    <div className="app-container">
      {/* Header Section */}
      <header className="app-header">
        <h1 className="app-title">SOL BRIDGE</h1>
        <p className="app-subtitle">Connect • Bridge • Transfer</p>
      </header>

      {/* Wallet Connection Section */}
      <section className="wallet-section card-hover">
        <h2>Connect Your Solana Wallet</h2>
        <WalletMultiButton />
      </section>

      {/* Balance Section */}
      <section className="balance-section card-hover">
        <WalletBalance />
      </section>

      {/* Bridge Section */}
      <section className="bridge-section">
       <BridgeForm
  onTransactionComplete={() => {
    // Refresh balance after 2 seconds
    setTimeout(() => window.location.reload(), 2000);
  }}
/>
      </section>

      {/* Ethereum burn section */}
      <BurnTokenComponent />

      {/* Transaction Info Section */}
      {transactionInfo && (
        <section className="transaction-section card-hover">
          <TransactionInfoCard info={transactionInfo} />
        </section>
      )}
    </div>
  );
}
