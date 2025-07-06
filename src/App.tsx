// import { useState, useEffect } from 'react';
// import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
// import { WalletBalance } from './components/WalletBalance';
// import { BridgeForm } from './components/BridgeForm';
// import { TransactionInfoCard } from './components/TransactionInfoCard';
// import { getCompleteTransactionInfo, type CompleteTransactionInfo } from './ethereum/ethereumWsolContract';
// //import './App.css'; // Import the CSS file
// //import { EthereumWsolBalance } from "./components/EthereumWsolBalance";
// import BurnTokenComponent from "./components/BurnTokenComponent";




// export default function App() {
//   const [transactionInfo, setTransactionInfo] = useState<CompleteTransactionInfo | null>(null);
//   const [solAmount, setSolAmount] = useState<number | null>(null);
//   const [ethAddress, setEthAddress] = useState<string | null>(null);

//   /*const handleTransactionComplete = async (amount:number, address:string) =>{
//    setSolAmount(amount);
//    setEthAddress(address);
//    const info = await getCompleteTransactionInfo(
//    amount, // Use the actual SOL amount from BridgeForm
//    address, // Use the actual Ethereum address from BridgeForm
//    'So11111111111111111111111111111111111111112', // This would typically come from the wallet
//    'completed', // You might update this based on actual tx status
//    '5j7x8k9m2n3p4q5r6s7t8u9v1w2x3y4z5a6b7c8d9e1f2g3h4i5j6k7l8m9n1p2q3r4s5t' // This would come from the tx response
//    );
//    setTransactionInfo(info);
//    };*/

//   /*useEffect(() => {
//    // Create sample transaction info when component mounts
//    const loadTransactionInfo = async (amount:number, address:string) => {
//    setSolAmount(amount);
//    setEthAddress(address);
//    const info = await getCompleteTransactionInfo(
//    amount, // solInput
//    address,//'0x742d35Cc6634C0532925a3b8D4341EaE7C5B4D8D', // recipientAddress
//    'So11111111111111111111111111111111111111112', // sourceAddress (example SOL address)
//    'completed', // transactionStatus
//    '5j7x8k9m2n3p4q5r6s7t8u9v1w2x3y4z5a6b7c8d9e1f2g3h4i5j6k7l8m9n1p2q3r4s5t' // txHash
//    );
//    setTransactionInfo(info);
//    };
//    loadTransactionInfo(solAmount,ethAddress);
//    }, []);*/

//   return (
//     <div className="app-container">
//       {/* Header Section */}
//       <header className="app-header">
//         <h1 className="app-title">SOL BRIDGE</h1>
//         <p className="app-subtitle">Connect • Bridge • Transfer</p>
//       </header>

//       {/* Wallet Connection Section */}
//       <section className="wallet-section card-hover">
//         <h2>Connect Your Solana Wallet</h2>
//         <WalletMultiButton />
//       </section>

//       {/* Balance Section */}
//       <section className="balance-section card-hover">
//         <WalletBalance />
//       </section>

//       {/* Bridge Section */}
//       <section className="bridge-section">
//         <BridgeForm
//           onTransactionComplete={() => {
//             // Refresh balance after 2 seconds
//             setTimeout(() => window.location.reload(), 2000);
//           }}
//           balance={null}
//         />
//       </section>


//       {/* ethereum burn section */}
       
//        <BurnTokenComponent />

//       {/* Transaction Info Section */}
//       {transactionInfo && (
//         <section className="transaction-section card-hover">
//           <TransactionInfoCard info={transactionInfo} />
//         </section>
//       )}
//     </div>
//   );
// }

// // App.tsx
// import { useState } from 'react';
// import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
// import { WalletBalance } from './components/WalletBalance';
// import { BridgeForm } from './components/BridgeForm';
// import BurnTokenComponent from "./components/BurnTokenComponent";
// import './App.css';

// export default function App() {
//   const [activeTab, setActiveTab] = useState<'bridge' | 'burn'>('bridge');


//   return (
//     <div className="app-container">
//       {/* Header Section */}
//       <header className="app-header">
//         <div className="logo">
//           <div className="logo-icon">
//             <i className="fas fa-bridge"></i>
//           </div>
//           <h1>SOL Bridge</h1>
//         </div>
//         <nav>
//           <ul>
//             <li><a href="#"><i className="fas fa-home"></i> Home</a></li>
//             <li><a href="#"><i className="fas fa-history"></i> History</a></li>
//             <li><a href="#"><i className="fas fa-question-circle"></i> FAQ</a></li>
//             <li><a href="#"><i className="fas fa-headset"></i> Support</a></li>
//           </ul>
//         </nav>
//       </header>

//       <div className="main-container">
//         <h1 className="app-title">SOL Bridge</h1>
//         <p className="app-subtitle">Bridge SOL to WSOL on Ethereum</p>

//         {/* Bridge Options */}
//         <div className="bridge-options">
//           <button 
//             className={`bridge-btn ${activeTab === 'bridge' ? 'active' : ''}`}
//             onClick={() => setActiveTab('bridge')}
//           >
//             <h3>Bridge to WSOL</h3>
//             <p>Convert SOL to wrapped SOL on Ethereum</p>
//           </button>
//           <button 
//             className={`bridge-btn ${activeTab === 'burn' ? 'active' : ''}`}
//             onClick={() => setActiveTab('burn')}
//           >
//             <h3>Burn to SOL</h3>
//             <p>Convert WSOL back to SOL on Solana</p>
//           </button>
//         </div>

//         {/* Wallet Connection Section */}
//         <section className="wallet-section card">
//           <h2>Connect Your Wallet</h2>
//           <p>Connect your Solana wallet to get started</p>
//           <WalletMultiButton className="connect-btn">
//             <i className="fas fa-plug"></i> Connect Wallet
//           </WalletMultiButton>
//         </section>

//         {/* Content Sections */}
//         <section className="content-section">
//           {activeTab === 'bridge' ? (
//             <div className="bridge-content">
//               <WalletBalance />
//               <BridgeForm 
//                 onTransactionComplete={() => setTimeout(() => window.location.reload(), 2000)} 
//                 balance={null} 
//               />
//             </div>
//           ) : (
//             <BurnTokenComponent />
//           )}
//         </section>

//       </div>
//       {/* Security Note */}
//         <div className="security-note">
//           <i className="fas fa-shield-alt"></i>
//           Bridge SOL ⇔ WSOL securely across chains
//         </div>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import BridgeStatus from './components/BridgeStatus';
import BridgeForm from './components/BridgeForm';
import BurnTokenComponent from "./components/BurnTokenComponent";
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState<'bridge' | 'burn'>('bridge');
  const [balance, setBalance] = useState<string | null>(null);
  const { connection } = useConnection();
  const wallet = useWallet();
  
  // Fetch SOL balance
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
    
    // Refresh balance when wallet changes
    const interval = setInterval(fetchBalance, 5000);
    return () => clearInterval(interval);
  }, [wallet.publicKey, connection]);

  // Handle transaction completion
  const handleTransactionComplete = () => {
    // Refresh balance after 2 seconds
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
        <h1 className="app-title">CROSSBRIDGE</h1>
        <p className="app-subtitle">Effortless Bridging from Solana to Ethereum and Beyond</p>
      </header>

      {/* Bridge Status - Show in both tabs */}
      <BridgeStatus />

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
          <BridgeForm 
            balance={balance}
            onTransactionComplete={handleTransactionComplete} 
          />
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