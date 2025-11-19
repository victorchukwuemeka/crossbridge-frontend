

import { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletBalance } from '../components/WalletBalance';
import BridgeForm from '../components/BridgeForm';
import BurnTokenComponent from '../components/BurnTokenComponent';
import { TransactionInfoCard } from '../components/TransactionInfoCard';
import { getCompleteTransactionInfo, type CompleteTransactionInfo } from '../ethereum/ethereumWsolContract';
//import { Analytics } from "@vercel/analytics/next"
import { Analytics } from "@vercel/analytics/react";
import { Toaster, toast } from "react-hot-toast";


import '../App.css';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'bridge' | 'burn'>('bridge');
  const [balance, setBalance] = useState<string | null>(null);
  const { connection } = useConnection();
  const wallet = useWallet();
  const [message, setMessage] = useState("");

  const [transactionInfo, setTransactionInfo] = useState<CompleteTransactionInfo | null>(null);


  const handleTransactionComplete = async () => {
    setTimeout(async () => {
      if (wallet.publicKey && connection) {
        const balance = await connection.getBalance(wallet.publicKey);
        setBalance((balance / 1e9).toFixed(4));
      }
    }, 2000);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-wrapper">
          <div className="top-links">
            <a href="https://faucet.solana.com/" target="_blank" rel="noopener noreferrer">Faucet</a>
            <a href="/docs" target="_blank" rel="noopener noreferrer">Docs</a>
          </div>
          <div className="branding-centered">
            <img src="/crossbridge-logo.png" alt="CrossBridge Logo" className="app-logo" />
            <h1 className="app-title">CROSSBRIDGE</h1>
            <p className="app-subtitle">Effortless Bridging from Solana to Ethereum and Beyond</p>
          </div>
           
        </div>
      </header>
      <div>
        
      </div>

      {/* Tabs */}
      <div className="tab-container">
        <button
          className={`tab-button ${activeTab === 'bridge' ? 'active' : ''}`}
          onClick={() => setActiveTab('bridge')}
        >
          Bridge to WSOL
        </button>
        <button
          className={`tab-button ${activeTab === 'burn' ? 'active' : ''}`}
          onClick={() => setActiveTab('burn')}
        >
          Burn to SOL
        </button>
      </div>


      {/* Main Section */}
      <main className="main-content">
        {activeTab === 'bridge' ? (
          <BridgeForm  onTransactionComplete={function (): void {
            //setMessage("✅ Transaction succeeded!");
            toast.success("✅ Transaction succeeded!");
          } } />
        ) : (
          <BurnTokenComponent />
        )}

        <Toaster position="top-right" />
      </main>
      


      {/* Transaction Info Section */}
      {transactionInfo && (
        <section className="transaction-section card-hover">
          <TransactionInfoCard info={transactionInfo} />
        </section>
      )}
      {/* Analytics Component */}
      <Analytics />
      
      {/* Footer */}
      <footer className="app-footer">
        <p>Bridge SOL ↔ WSOL securely across chains</p>
      </footer>
    </div>
  );
}
