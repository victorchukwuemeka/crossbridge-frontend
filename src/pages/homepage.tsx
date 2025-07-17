import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import BridgeForm from '../components/BridgeForm';
import BurnTokenComponent from "../components/BurnTokenComponent";
import '../App.css';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'bridge' | 'burn'>('bridge');
  const [balance, setBalance] = useState<string | null>(null);
  const { connection } = useConnection();
  const wallet = useWallet();

  useEffect(() => {
    const fetchBalance = async () => {
      if (wallet.publicKey && connection) {
        try {
          const balance = await connection.getBalance(wallet.publicKey);
          setBalance((balance / 1e9).toFixed(4));
        } catch (error) {
          console.error("Error fetching balance:", error);
          setBalance(null);
        }
      } else {
        setBalance(null);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 5000);
    return () => clearInterval(interval);
  }, [wallet.publicKey, connection]);

  const handleTransactionComplete = () => {
    setTimeout(() => {
      if (wallet.publicKey && connection) {
        connection.getBalance(wallet.publicKey).then(balance => {
          setBalance((balance / 1e9).toFixed(4));
        });
      }
    }, 2000);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-wrapper">
          <div className="top-links">
            <a href="https://faucet.solana.com/" target="_blank" rel="noopener noreferrer">Faucet</a>
           <a href="/docs" target="_blank" rel="noopener noreferrer">Docs</a>

          </div>
          <div className="branding-centered">
            <img src="/crossbridge-logo.png" alt="CrossBridge Logo" className="app-logo" />
            <h1 className="app-title">CROSSBRIDGE</h1>
            <p className="app-subtitle">
              Effortless Bridging from Solana to Ethereum and Beyond
            </p>
          </div>
        </div>
      </header>

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

      <main className="main-content">
        {activeTab === 'bridge' ? (
          <BridgeForm onTransactionComplete={handleTransactionComplete} />
        ) : (
          <BurnTokenComponent />
        )}
      </main>

      <footer className="app-footer">
        <p>Bridge SOL ↔ WSOL securely across chains</p>
      </footer>
    </div>
  );
}
