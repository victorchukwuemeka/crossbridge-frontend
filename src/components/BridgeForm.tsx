// import { useState } from 'react';
// import { useWallet } from '@solana/wallet-adapter-react';
// import { lockSol, initializeBridge } from '../solana/lockSol';

// interface BridgeFormProps {
//   balance: string | null;
//   onTransactionComplete: () => void;
// }

// export function BridgeForm({ balance, onTransactionComplete }: BridgeFormProps) {
//   const wallet = useWallet();
//   const [amount, setAmount] = useState('');
//   const [ethAddress, setEthAddress] = useState('');
//   const [loading, setLoading] = useState(false);

//   const setMaxAmount = () => {
//     if (balance) {
//       const maxAmount = Math.max(0, parseFloat(balance) - 0.01);
//       setAmount(maxAmount.toFixed(6));
//     }
//   };

//   const handleLockSol = async () => {
//     if (!wallet.connected || !wallet.publicKey) {
//       alert("Connect wallet first");
//       return;
//     }

//     const solAmount = parseFloat(amount);
//     if (isNaN(solAmount) || solAmount <= 0) {
//       alert("Enter a valid amount of SOL");
//       return;
//     }

//     if (!ethAddress.trim()) {
//       alert("Please enter an Ethereum address");
//       return;
//     }

//     if (balance && solAmount > parseFloat(balance)) {
//       alert(`Insufficient balance. You have ${balance} SOL`);
//       return;
//     }

//     try {
//       setLoading(true);
//       await initializeBridge(wallet);
//       const sig = await lockSol(wallet, solAmount * 1e9, ethAddress);
//       alert(`Locked ${amount} SOL\nTx: ${sig}`);
//       setAmount('');
//       setEthAddress('');
//       onTransactionComplete();
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : "Unknown error";
//       alert("Error: " + errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{
//       maxWidth: '480px',
//       margin: '0 auto',
//       padding: '1rem'
//     }}>
//       {/* Main Form Card */}
//       <div style={{
//         background: 'rgba(30, 30, 30, 0.95)',
//         borderRadius: '16px',
//         border: '1px solid rgba(255, 255, 255, 0.1)',
//         boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
//         padding: '1.25rem'
//       }}>
//         {/* Header */}
//         <div style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           marginBottom: '1.5rem'
//         }}>
//           <div style={{ fontSize: '14px', color: '#ccc' }}>Bridge</div>
//           <div style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: '6px',
//             fontSize: '13px',
//             color: '#ccc',
//             padding: '6px 12px',
//             background: 'rgba(255, 255, 255, 0.05)',
//             borderRadius: '20px'
//           }}>
//             <span style={{
//               width: '6px',
//               height: '6px',
//               background: '#14F195',
//               borderRadius: '50%',
//               display: 'inline-block'
//             }}></span>
//             Solana
//           </div>
//         </div>

//         {/* Amount Input Section */}
//         <div style={{
//           background: 'rgba(255, 255, 255, 0.03)',
//           borderRadius: '12px',
//           padding: '1rem',
//           marginBottom: '0.75rem',
//           border: '1px solid rgba(255, 255, 255, 0.05)'
//         }}>
//           <div style={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             marginBottom: '8px'
//           }}>
//             <span style={{ fontSize: '13px', color: '#ccc' }}>Amount</span>
//             <span style={{ fontSize: '13px', color: '#ccc' }}>
//               Balance: {balance ? parseFloat(balance).toFixed(4) : '0'} SOL
//             </span>
//           </div>
//           <div style={{ position: 'relative' }}>
//             <input
//               type="number"
//               step="0.001"
//               placeholder="0.0"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               style={{
//                 width: '100%',
//                 padding: '8px 0',
//                 border: 'none',
//                 background: 'transparent',
//                 fontSize: '20px',
//                 color: '#fff',
//                 outline: 'none',
//                 caretColor: 'transparent'
//               }}
//             />
//             <button
//               onClick={setMaxAmount}
//               style={{
//                 position: 'absolute',
//                 right: '0',
//                 top: '50%',
//                 transform: 'translateY(-50%)',
//                 padding: '4px 8px',
//                 fontSize: '12px',
//                 color: '#ccc',
//                 background: 'rgba(255, 255, 255, 0.08)',
//                 border: 'none',
//                 borderRadius: '6px',
//                 cursor: 'pointer',
//                 transition: 'all 0.2s'
//               }}
//             >
//               MAX
//             </button>
//           </div>
//         </div>

//         {/* Address Input Section */}
//         <div style={{
//           background: 'rgba(255, 255, 255, 0.03)',
//           borderRadius: '12px',
//           padding: '1rem',
//           marginBottom: '1rem',
//           border: '1px solid rgba(255, 255, 255, 0.05)'
//         }}>
//           <div style={{ marginBottom: '8px' }}>
//             <span style={{ fontSize: '13px', color: '#ccc' }}>Recipient (Ethereum)</span>
//           </div>
//           <input
//             type="text"
//             placeholder="0x..."
//             value={ethAddress}
//             onChange={(e) => setEthAddress(e.target.value)}
//             style={{
//               width: '100%',
//               padding: '8px 0',
//               border: 'none',
//               background: 'transparent',
//               fontSize: '15px',
//               fontFamily: 'monospace',
//               color: '#fff',
//               outline: 'none',
//               caretColor: 'transparent'
//             }}
//           />
//         </div>

//         {/* Transaction Summary */}
//         <div style={{
//           padding: '12px',
//           marginBottom: '1rem',
//           fontSize: '13px',
//           color: '#ccc',
//           background: 'rgba(255, 255, 255, 0.03)',
//           borderRadius: '12px',
//           border: '1px solid rgba(255, 255, 255, 0.05)'
//         }}>
//           <div style={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             marginBottom: '8px'
//           }}>
//             <span>Bridge Fee</span>
//             <span>0.001 SOL</span>
//           </div>
//           <div style={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             marginBottom: '8px'
//           }}>
//             <span>Network Fee</span>
//             <span>~0.0005 SOL</span>
//           </div>
//           <div style={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             paddingTop: '8px',
//             marginTop: '8px',
//             borderTop: '1px solid rgba(255, 255, 255, 0.1)',
//             color: '#fff',
//             fontWeight: '500'
//           }}>
//             <span>You will receive</span>
//             <span>{amount ? `${(parseFloat(amount) - 0.0015).toFixed(4)} wSOL` : '0.0000 wSOL'}</span>
//           </div>
//         </div>

//         {/* Bridge Button */}
//         <button
//           onClick={handleLockSol}
//           disabled={loading || !wallet.connected}
//           style={{
//             width: '100%',
//             padding: '14px',
//             background: loading || !wallet.connected ? 
//               'rgba(255, 255, 255, 0.05)' : 
//               'linear-gradient(45deg, #9945FF, #14F195)',
//             color: loading || !wallet.connected ? '#666' : 'white',
//             border: 'none',
//             borderRadius: '12px',
//             fontSize: '15px',
//             fontWeight: '500',
//             cursor: loading || !wallet.connected ? 'not-allowed' : 'pointer',
//             transition: 'transform 0.2s'
//           }}
//         >
//           {loading ? (
//             'Processing...'
//           ) : !wallet.connected ? (
//             'Connect Wallet'
//           ) : (
//             'Bridge to Ethereum'
//           )}
//         </button>
//       </div>

//       {/* Footer */}
//       <div style={{
//         marginTop: '1rem',
//         padding: '1rem',
//         background: 'rgba(30, 30, 30, 0.8)',
//         borderRadius: '12px',
//         fontSize: '13px',
//         color: '#ccc',
//         display: 'flex',
//         flexDirection: 'column',
//         gap: '8px',
//         border: '1px solid rgba(255, 255, 255, 0.05)'
//       }}>
//         <div style={{
//           display: 'flex',
//           alignItems: 'center',
//           gap: '6px'
//         }}>
//           <span style={{
//             width: '6px',
//             height: '6px',
//             background: '#14F195',
//             borderRadius: '50%'
//           }}></span>
//           <span>Estimated time: ~15 minutes</span>
//         </div>
//         <div style={{
//           display: 'flex',
//           alignItems: 'center',
//           gap: '6px'
//         }}>
//           <span style={{
//             width: '6px',
//             height: '6px',
//             background: '#14F195',
//             borderRadius: '50%'
//           }}></span>
//           <span>Bridge powered by CrossBridge Protocol</span>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { lockSol, initializeBridge } from '../solana/lockSol';

interface BridgeFormProps {
  balance: string | null;
  onTransactionComplete: () => void;
}

export default function BridgeForm({ balance, onTransactionComplete }: BridgeFormProps) {
  const wallet = useWallet();
  const [amount, setAmount] = useState('');
  const [ethAddress, setEthAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setMaxAmount = () => {
    if (balance) {
      const maxAmount = Math.max(0, parseFloat(balance) - 0.01);
      setAmount(maxAmount.toFixed(6));
    }
  };

  const handleLockSol = async () => {
    setError('');
    
    if (!wallet.connected || !wallet.publicKey) {
      setError("Connect wallet first");
      return;
    }

    const solAmount = parseFloat(amount);
    if (isNaN(solAmount) || solAmount <= 0) {
      setError("Enter a valid amount of SOL");
      return;
    }

    if (!ethAddress.trim()) {
      setError("Please enter an Ethereum address");
      return;
    }

    if (balance && solAmount > parseFloat(balance)) {
      setError(`Insufficient balance. You have ${balance} SOL`);
      return;
    }

    try {
      setLoading(true);
      await initializeBridge(wallet);
      const sig = await lockSol(wallet, solAmount * 1e9, ethAddress);
      alert(`Locked ${amount} SOL\nTx: ${sig}`);
      setAmount('');
      setEthAddress('');
      onTransactionComplete();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError("Error: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      {/* Wallet Connection Section */}
      <div className="wallet-section">
        <h2>Connect Your Wallet</h2>
        <p>Connect your Solana wallet to get started</p>
        <div className="wallet-button-container">
          <WalletMultiButton className="wallet-button" />
        </div>
      </div>
      
      {/* Amount Input */}
      <div className="amount-input">
        <label>Amount to Bridge</label>
        <div className="input-group">
          <input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!wallet.connected || loading}
          />
        </div>
        <button
          onClick={setMaxAmount}
          className="max-button"
          disabled={!wallet.connected || loading}
        >
          MAX
        </button>
      </div>
      
      {/* Address Input */}
      <div className="amount-input">
        <label>Recipient (Ethereum)</label>
        <div className="input-group">
          <input
            type="text"
            placeholder="0x..."
            value={ethAddress}
            onChange={(e) => setEthAddress(e.target.value)}
            disabled={!wallet.connected || loading}
          />
        </div>
      </div>

      {/* Transaction Summary */}
      <div className="transaction-summary">
        <div className="fee-row">
          <span>Bridge Fee</span>
          <span>0.001 SOL</span>
        </div>
        <div className="fee-row">
          <span>Network Fee</span>
          <span>~0.0005 SOL</span>
        </div>
        <div className="fee-row total">
          <span>You will receive</span>
          <span>
            {amount ? (parseFloat(amount) - 0.0015).toFixed(4) : '0.0000'} wSOL
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Bridge Button */}
      <button 
        className="action-button"
        onClick={handleLockSol}
        disabled={loading || !wallet.connected || !amount || !ethAddress}
      >
        {loading ? 'Processing...' : 'Bridge Tokens'}
      </button>

      {/* Status Footer */}
      <div className="status-footer">
        <div className="status-item">
          <span className="status-dot"></span>
          <span>Estimated time: 10 seconds</span>
        </div>
        <div className="status-item">
          <span className="status-dot"></span>
          <span>Bridge powered by CrossBridge Protocol</span>
        </div>
      </div>
    </div>
  );
}