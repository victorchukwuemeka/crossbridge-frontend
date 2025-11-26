import { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import BridgeForm from '../components/BridgeForm';
import BurnTokenComponent from '../components/BurnTokenComponent';
import { TransactionInfoCard } from '../components/TransactionInfoCard';
import { Analytics } from "@vercel/analytics/react";
import { Toaster, toast } from "react-hot-toast";
import styles from '../pages/BridgePage.module.css';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'bridge' | 'burn'>('bridge');
  const { connection } = useConnection();
  const wallet = useWallet();
  const [transactionInfo, setTransactionInfo] = useState(null);

  const handleTransactionComplete = async () => {
    setTimeout(async () => {
      if (wallet.publicKey && connection) {
        const balance = await connection.getBalance(wallet.publicKey);
        // Update balance in child components as needed
      }
    }, 2000);
  };

  return (
    <div className={styles.bridgeApp}>
      {/* Header */}
      <header className={styles.appHeader}>
        <div className={styles.headerBar}>
          <div className={styles.topLinks}>
            <a href="https://faucet.solana.com/" target="_blank" rel="noopener noreferrer">Faucet</a>
            <a href="/docs" target="_blank" rel="noopener noreferrer">Docs</a>
          </div>
          <div className={styles.brandingCentered}>
            <img src="/crossbridge-logo.png" alt="CrossBridge Logo" className={styles.appLogo} />
            <h1 className={styles.appTitle}>CROSSBRIDGE</h1>
            <p className={styles.appSubtitle}>Effortless Bridging from Solana to Ethereum and Beyond</p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className={styles.appContainer}>
        {/* Tabs */}
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tabButton} ${activeTab === 'bridge' ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveTab('bridge')}
          >
            Bridge to WSOL
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'burn' ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveTab('burn')}
          >
            Burn to SOL
          </button>
        </div>

        {/* Main Content */}
        <main className={styles.mainContent}>
          {activeTab === 'bridge' ? (
            <BridgeForm onTransactionComplete={() => toast.success("✅ Transaction succeeded!")} />
          ) : (
            <BurnTokenComponent />
          )}
        </main>

        {/* Transaction Info */}
        {transactionInfo && (
          <section className={styles.card}>
            <TransactionInfoCard info={transactionInfo} />
          </section>
        )}
      </div>

      {/* Toaster */}
      <Toaster position="top-right" />

      {/* Analytics */}
      <Analytics />
    </div>
  );
}