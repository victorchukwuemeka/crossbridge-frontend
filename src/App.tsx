import { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { WalletBalance } from './components/WalletBalance';
import { BridgeForm } from './components/BridgeForm';
import { TransactionInfoCard } from './components/TransactionInfoCard';
import { getCompleteTransactionInfo, type CompleteTransactionInfo } from './ethereum/ethereumWsolContract';
import './App.css'; // Import the CSS file

export default function App() {
  const [transactionInfo, setTransactionInfo] = useState<CompleteTransactionInfo | null>(null);
  const [solAmount, setSolAmount] = useState<number | null>(null);
  const [ethAddress, setEthAddress] = useState<string | null>(null);

  /*const handleTransactionComplete = async (amount:number, address:string) =>{
   setSolAmount(amount);
   setEthAddress(address);
   const info = await getCompleteTransactionInfo(
   amount, // Use the actual SOL amount from BridgeForm
   address, // Use the actual Ethereum address from BridgeForm
   'So11111111111111111111111111111111111111112', // This would typically come from the wallet
   'completed', // You might update this based on actual tx status
   '5j7x8k9m2n3p4q5r6s7t8u9v1w2x3y4z5a6b7c8d9e1f2g3h4i5j6k7l8m9n1p2q3r4s5t' // This would come from the tx response
   );
   setTransactionInfo(info);
   };*/

  /*useEffect(() => {
   // Create sample transaction info when component mounts
   const loadTransactionInfo = async (amount:number, address:string) => {
   setSolAmount(amount);
   setEthAddress(address);
   const info = await getCompleteTransactionInfo(
   amount, // solInput
   address,//'0x742d35Cc6634C0532925a3b8D4341EaE7C5B4D8D', // recipientAddress
   'So11111111111111111111111111111111111111112', // sourceAddress (example SOL address)
   'completed', // transactionStatus
   '5j7x8k9m2n3p4q5r6s7t8u9v1w2x3y4z5a6b7c8d9e1f2g3h4i5j6k7l8m9n1p2q3r4s5t' // txHash
   );
   setTransactionInfo(info);
   };
   loadTransactionInfo(solAmount,ethAddress);
   }, []);*/

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
          balance={null}
        />
      </section>

      {/* Transaction Info Section */}
      {transactionInfo && (
        <section className="transaction-section card-hover">
          <TransactionInfoCard info={transactionInfo} />
        </section>
      )}
    </div>
  );
}