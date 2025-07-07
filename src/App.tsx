import { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { WalletBalance } from './components/WalletBalance';
import { BridgeForm } from './components/BridgeForm';
import { TransactionInfoCard } from './components/TransactionInfoCard';
import { getCompleteTransactionInfo, type CompleteTransactionInfo } from './ethereum/ethereumWsolContract';
//import './App.css';
import './index.css'
//  // Import the CSS file
//import { EthereumWsolBalance } from "./components/EthereumWsolBalance";
import BurnTokenComponent from "./components/BurnTokenComponent";



export default function App() {
  const [transactionInfo, setTransactionInfo] = useState<CompleteTransactionInfo | null>(null);
  const [solAmount, setSolAmount] = useState<number | null>(null);
  const [ethAddress, setEthAddress] = useState<string | null>(null);

 
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header Section */}
      <header className="app-header">
        <h1 className="bg-blue-500 text-white p-4 rounded">CROSSBRIDGE</h1>
        <p className="app-subtitle">Connect • Bridge • Transfer</p>
      </header>

      {/* Wallet Connection Section */}
      <section className="">
         <div className="bg-red-500 text-white p-16 rounded">
          Tailwind CSS is working!
        </div>
        <h2>Connect Your Solana Wallet</h2>
        <WalletMultiButton />
      </section>

      {/* Balance Section */}
      <section className="">
        <WalletBalance />
      </section>

      {/* Bridge Section */}
      <section className="">
        <BridgeForm
          onTransactionComplete={() => {
            // Refresh balance after 2 seconds
            setTimeout(() => window.location.reload(), 2000);
          }}
          balance={null}
        />
      </section>


      {/* ethereum burn section */}
       
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