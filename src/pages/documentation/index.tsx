import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaFaucet,
  FaBook,
  FaExchangeAlt,
  FaFire,
  FaWallet,
  FaShieldAlt,
  FaCoins,
  FaTools,
  FaLock,
  FaChartLine,
  FaRocket,
  FaGraduationCap,
  FaHeadset
} from 'react-icons/fa';
import styles from './docs.module.css';

const DocsPage = () => {
  return (
    <div className={styles.docsContainer}>
      {/* Header */}
      <header className={styles.appHeader}>
        <div className={styles.headerWrapper}>
          <div className={styles.topLinks}>
            <a href="https://faucet.solana.com/" target="_blank" rel="noopener noreferrer">
              <FaFaucet className="icon" /> Faucet
            </a>
            <Link to="/docs">
              <FaBook className="icon" /> Docs
            </Link>
          </div>

          <div className={styles.brandingCentered}>
          <img src="/crossbridge-logo.png" alt="CrossBridge Logo" className={`${styles.appLogo} ${styles.floating}`} />
            <h1 className={styles.appTitle}>CROSSBRIDGE</h1>
            <p className={styles.appSubtitle}>
              Complete guides for bridging between Solana and other chains
            </p>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1>CrossBridge Documentation</h1>
          <p>
            Complete guides, tutorials, and tips to help you securely bridge tokens between Solana and other blockchains
          </p>
          <button className={styles.getStartedBtn}>
            <FaRocket className="icon" /> Get Started →
          </button>
        </div>
      </section>

      {/* Main Content */}
      <main className={styles.docsMain}>
        <h2>What would you like to learn?</h2>

        <div className={styles.docsGrid}>
          {[
            {
              title: "Bridge to WSOL",
              icon: <FaExchangeAlt />,
              description: "Learn how to bridge your SOL tokens to WSOL for cross-chain usage",
              link: "/docs/bridge"
            },
            {
              title: "Burn to SOL",
              icon: <FaFire />,
              description: "Guide to burning WSOL tokens to retrieve native SOL",
              link: "/docs/burn"
            },
            {
              title: "Wallet Connection",
              icon: <FaWallet />,
              description: "How to connect and manage your Solana wallet",
              link: "/docs/wallet"
            },
            {
              title: "Transaction Security",
              icon: <FaShieldAlt />,
              description: "Best practices for secure cross-chain transactions",
              link: "/docs/security"
            },
            {
              title: "Fee Structure",
              icon: <FaCoins />,
              description: "Understanding gas fees and bridging costs",
              link: "/docs/fees"
            },
            {
              title: "Troubleshooting",
              icon: <FaTools />,
              description: "Solutions to common bridging issues and errors",
              link: "/docs/troubleshooting"
            }
          ].map((card, index) => (
            <Link
              to={card.link}
              key={index}
              className={styles.docCard}
            >
              <h3>{card.icon} {card.title}</h3>
              <p>{card.description}</p>
            </Link>
          ))}
        </div>

        {/* Advanced Section */}
        <div className={styles.advancedSection}>
          <h2>Advanced Topics</h2>

          <div className={styles.advancedGrid}>
            <div className={styles.advancedCard}>
              <h3><FaLock /> Cross-Chain Security Deep Dive</h3>
              <p>
                Comprehensive guide to understanding security mechanisms and smart contract audits.
                Learn how to verify transactions and ensure asset safety during cross-chain transfers.
              </p>
              <button className={styles.outlineBtn}>
                <FaGraduationCap /> Learn More
              </button>
            </div>

            <div className={styles.advancedCard}>
              <h3><FaChartLine /> Understanding Bridge Economics</h3>
              <p>
                How token wrapping/unwrapping affects market dynamics and liquidity.
                Explore economic models behind cross-chain bridges and their impact on token value.
              </p>
              <button className={styles.outlineBtn}>
                <FaGraduationCap /> Learn More
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Support Section */}
      <section className={styles.supportSection}>
        <div className={styles.supportContent}>
          <h2>Still Need Help?</h2>
          <p>
            Can't find what you're looking for? Our community and support team are here to help
          </p>
          <button className={styles.contactBtn}>
            <FaHeadset /> Contact Support →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.appFooter}>
        <p>
          © {new Date().getFullYear()} CrossBridge. Secure cross-chain bridging between Solana and Ethereum ecosystems.
          Built with advanced cryptography and audited smart contracts.
        </p>
      </footer>
    </div>
  );
};

export default DocsPage;
