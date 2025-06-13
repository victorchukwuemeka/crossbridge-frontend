import { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { WalletBalance } from './components/WalletBalance';
import { BridgeForm } from './components/BridgeForm';
import { TransactionInfoCard } from './components/TransactionInfoCard';
import { getCompleteTransactionInfo, type CompleteTransactionInfo } from './ethereum/ethereumWsolContract';
import './App.css';

export default function App() {
  const [transactionInfo, setTransactionInfo] = useState<CompleteTransactionInfo | null>(null);
  const [solAmount, setSolAmount] = useState<number | null>(null);
  const [ethAddress, setEthAddress] = useState<string | null>(null);

  useEffect(() => {
    const loadTransactionInfo = async () => {
      const info = await getCompleteTransactionInfo(
        1.5,
        '0x742d35Cc6634C0532925a3b8D4341EaE7C5B4D8D',
        'So11111111111111111111111111111111111111112',
        'completed',
        '5j7x8k9m2n3p4q5r6s7t8u9v1w2x3y4z5a6b7c8d9e1f2g3h4i5j6k7l8m9n1p2q3r4s5t'
      );
      setTransactionInfo(info);
    };
    loadTransactionInfo();
  }, []);

  return (
    <div className="app-container">
      <div className="main-content">
        <header className="header">
          <div className="logo">SOL BRIDGE</div>
          <WalletMultiButton className="wallet-button" />
        </header>

        <div className="card">
          <WalletBalance />
          <BridgeForm
            onTransactionComplete={() => {
              setTimeout(() => window.location.reload(), 2000);
            }} 
            balance={null}
          />
          {transactionInfo && <TransactionInfoCard info={transactionInfo} />}
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Resources</h3>
            <ul>
              <li><a href="/docs">Documentation</a></li>
              <li><a href="/guides">User Guides</a></li>
              <li><a href="/api">API Reference</a></li>
              <li><a href="/security">Security</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Blog</h3>
            <ul>
              <li><a href="/blog/latest">Latest Posts</a></li>
              <li><a href="/blog/announcements">Announcements</a></li>
              <li><a href="/blog/tutorials">Tutorials</a></li>
              <li><a href="/blog/ecosystem">Ecosystem</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>FAQ</h3>
            <ul>
              <li><a href="/faq#general">General Questions</a></li>
              <li><a href="/faq#bridge">Bridge Process</a></li>
              <li><a href="/faq#security">Security FAQ</a></li>
              <li><a href="/faq#fees">Fees & Limits</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Community</h3>
            <ul>
              <li><a href="https://discord.gg/solbridge">Discord</a></li>
              <li><a href="https://twitter.com/solbridge">Twitter</a></li>
              <li><a href="https://t.me/solbridge">Telegram</a></li>
              <li><a href="https://github.com/solbridge">GitHub</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}