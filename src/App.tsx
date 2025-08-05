
// import { useState, useEffect } from 'react';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import BridgeForm from './components/BridgeForm';
// import BurnTokenComponent from "./components/BurnTokenComponent";
// import './App.css';

// export default function App() {
//   const [activeTab, setActiveTab] = useState<'bridge' | 'burn'>('bridge');
//   const [balance, setBalance] = useState<string | null>(null);
//   const { connection } = useConnection();
//   const wallet = useWallet();

//   // Fetch SOL balance
//   useEffect(() => {
//     const fetchBalance = async () => {
//       if (wallet.publicKey && connection) {
//         try {
//           const balance = await connection.getBalance(wallet.publicKey);
//           setBalance((balance / 1e9).toFixed(4));
//         } catch (error) {
//           console.error("Error fetching balance:", error);
//           setBalance(null);
//         }
//       } else {
//         setBalance(null);
//       }
//     };

//     fetchBalance();

//     // Refresh balance when wallet changes
//     const interval = setInterval(fetchBalance, 5000);
//     return () => clearInterval(interval);
//   }, [wallet.publicKey, connection]);

//   // Handle transaction completion
//   const handleTransactionComplete = () => {
//     // Refresh balance after 2 seconds
//     setTimeout(() => {
//       if (wallet.publicKey && connection) {
//         connection.getBalance(wallet.publicKey).then(balance => {
//           setBalance((balance / 1e9).toFixed(4));
//         });
//       }
//     }, 2000);
//   };

//   return (
//     <div className="app-container">
//      <header className="app-header">
//   <div className="header-wrapper">
//     {/* Top Right Links */}
//     <div className="top-links">
//       <a href="https://faucet.solana.com/" target="_blank" rel="noopener noreferrer">Faucet</a>
//       <a href="/docs" target="_blank" rel="noopener noreferrer">Docs</a>
//     </div>

//     {/* Centered Branding */}
//     <div className="branding-centered">
//       <img
//         src="/crossbridge-logo.png"
//         alt="CrossBridge Logo"
//         className="app-logo"
//       />
//       <h1 className="app-title">CROSSBRIDGE</h1>
//       <p className="app-subtitle">
//         Effortless Bridging from Solana to Ethereum and Beyond
//       </p>
//     </div>
//   </div>
// </header>



//       <div className="tab-container">
//         <button
//           className={`tab-button ${activeTab === 'bridge' ? 'active' : ''}`}
//           onClick={() => setActiveTab('bridge')}
//         >
//           Bridge to WSOL
//         </button>
//         <button
//           className={`tab-button ${activeTab === 'burn' ? 'active' : ''}`}
//           onClick={() => setActiveTab('burn')}
//         >
//           Burn to SOL
//         </button>
//       </div>

//       <main className="main-content">
//         {activeTab === 'bridge' ? (
//           <BridgeForm
//             onTransactionComplete={handleTransactionComplete}
//           />
//         ) : (
//           <BurnTokenComponent />
//         )}
//       </main>

//       <footer className="app-footer">
//         <p>Bridge SOL ↔ WSOL securely across chains</p>
//       </footer>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { WalletBalance } from './components/WalletBalance';
//import { BridgeForm } from './components/BridgeForm';
import { TransactionInfoCard } from './components/TransactionInfoCard';
import { getCompleteTransactionInfo, type CompleteTransactionInfo } from './ethereum/ethereumWsolContract';
//import './App.css'; // Import the CSS file
//import { EthereumWsolBalance } from "./components/EthereumWsolBalance";
import BurnTokenComponent from "./components/BurnTokenComponent";
import BridgeForm from "./components/BridgeForm";
import CCTPBridge from './components/CCTPBridge';


export default function App() {
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
