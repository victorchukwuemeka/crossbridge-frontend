// import React from 'react';
// import { Link } from 'react-router-dom';
// import './docs.css';

// const DocsPage = () => {
//   return (
//     <div className="docs-container">
//       {/* Header */}
//       <header className="app-header">
//         <div className="header-wrapper">

//           <div className="branding-centered">
//             <img
//               src="/crossbridge-logo.png"
//               alt="CrossBridge Logo"
//               className="app-logo"
//             />
//             <h1 className="app-title">CROSSBRIDGE</h1>
//             <p className="app-subtitle">
//               Complete guides for bridging between Solana and other chains
//             </p>
//           </div>
//         </div>
//       </header>

//       {/* Hero Section */}
//       <section className="hero-section">
//         <div className="hero-content">
//           <h1>CrossBridge Documentation</h1>
//           <p>
//             Complete guides, tutorials, and tips to help you securely bridge tokens between Solana and other blockchains
//           </p>
//           <button className="get-started-btn">
//             Get Started →
//           </button>
//         </div>
//       </section>

//       {/* Main Content */}
//       <main className="docs-main">
//         <h2>What would you like to learn?</h2>

//         <div className="docs-grid">
//           {[
//             {
//               title: "Bridge to WSOL",
//               description: "Learn how to bridge your SOL tokens to WSOL for cross-chain usage",
//               link: "/docs/bridge"
//             },
//             {
//               title: "Burn to SOL",
//               description: "Guide to burning WSOL tokens to retrieve native SOL",
//               link: "/docs/burn"
//             },
//             {
//               title: "Wallet Connection",
//               description: "How to connect and manage your Solana wallet",
//               link: "/docs/wallet"
//             },
//             {
//               title: "Transaction Security",
//               description: "Best practices for secure cross-chain transactions",
//               link: "/docs/security"
//             },
//             {
//               title: "Fee Structure",
//               description: "Understanding gas fees and bridging costs",
//               link: "/docs/fees"
//             },
//             {
//               title: "Troubleshooting",
//               description: "Solutions to common bridging issues and errors",
//               link: "/docs/troubleshooting"
//             }
//           ].map((card, index) => (
//             <Link 
//               to={card.link}
//               key={index}
//               className="doc-card"
//             >
//               <h3>{card.title}</h3>
//               <p>{card.description}</p>
//             </Link>
//           ))}
//         </div>

//         {/* Advanced Section */}
//         <div className="advanced-section">
//           <h2>Advanced Topics</h2>
          
//           <div className="advanced-grid">
//             <div className="advanced-card">
//               <h3>Cross-Chain Security Deep Dive</h3>
//               <p>
//                 Comprehensive guide to understanding security mechanisms and smart contract audits
//               </p>
//               <button className="outline-btn">
//                 Learn More
//               </button>
//             </div>
            
//             <div className="advanced-card">
//               <h3>Understanding Bridge Economics</h3>
//               <p>
//                 How token wrapping/unwrapping affects market dynamics and liquidity
//               </p>
//               <button className="outline-btn">
//                 Learn More
//               </button>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Support Section */}
//       <section className="support-section">
//         <div className="support-content">
//           <h2>Still Need Help?</h2>
//           <p>
//             Can't find what you're looking for? Our community and support team are here to help
//           </p>
//           <button className="contact-btn">
//             Contact Support →
//           </button>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="app-footer">
//         <p>
//           © {new Date().getFullYear()} CrossBridge. Secure cross-chain bridging between Solana and Ethereum ecosystems.
//         </p>
//       </footer>
//     </div>
//   );
// };

// export default DocsPage;

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
import './docs.css';

const DocsPage = () => {
  return (
    <div className="docs-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-wrapper">
          <div className="top-links">
            <a href="https://faucet.solana.com/" target="_blank" rel="noopener noreferrer">
              <FaFaucet className="icon" /> Faucet
            </a>
            <Link to="/docs">
              <FaBook className="icon" /> Docs
            </Link>
          </div>

          <div className="branding-centered">
            <div className="app-logo floating">
              <div className="logo-inner">
                <FaExchangeAlt className="logo-icon" />
              </div>
            </div>
            <h1 className="app-title">CROSSBRIDGE</h1>
            <p className="app-subtitle">
              Complete guides for bridging between Solana and other chains
            </p>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>CrossBridge Documentation</h1>
          <p>
            Complete guides, tutorials, and tips to help you securely bridge tokens between Solana and other blockchains
          </p>
          <button className="get-started-btn">
            <FaRocket className="icon" /> Get Started →
          </button>
        </div>
      </section>

      {/* Main Content */}
      <main className="docs-main">
        <h2>What would you like to learn?</h2>

        <div className="docs-grid">
          {/* Documentation Cards */}
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
              className="doc-card"
            >
              <h3>{card.icon} {card.title}</h3>
              <p>{card.description}</p>
            </Link>
          ))}
        </div>

        {/* Advanced Section */}
        <div className="advanced-section">
          <h2>Advanced Topics</h2>
          
          <div className="advanced-grid">
            <div className="advanced-card">
              <h3><FaLock /> Cross-Chain Security Deep Dive</h3>
              <p>
                Comprehensive guide to understanding security mechanisms and smart contract audits. 
                Learn how to verify transactions and ensure asset safety during cross-chain transfers.
              </p>
              <button className="outline-btn">
                <FaGraduationCap /> Learn More
              </button>
            </div>
            
            <div className="advanced-card">
              <h3><FaChartLine /> Understanding Bridge Economics</h3>
              <p>
                How token wrapping/unwrapping affects market dynamics and liquidity. 
                Explore economic models behind cross-chain bridges and their impact on token value.
              </p>
              <button className="outline-btn">
                <FaGraduationCap /> Learn More
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Support Section */}
      <section className="support-section">
        <div className="support-content">
          <h2>Still Need Help?</h2>
          <p>
            Can't find what you're looking for? Our community and support team are here to help
          </p>
          <button className="contact-btn">
            <FaHeadset /> Contact Support →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          © {new Date().getFullYear()} CrossBridge. Secure cross-chain bridging between Solana and Ethereum ecosystems. 
          Built with advanced cryptography and audited smart contracts.
        </p>
      </footer>
    </div>
  );
};

export default DocsPage;