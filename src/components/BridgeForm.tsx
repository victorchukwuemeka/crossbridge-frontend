// import { useEffect, useState } from 'react';
// import { useWallet } from '@solana/wallet-adapter-react';
// import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
// import { lockSol, initializeBridge } from '../solana/lockSol';
// import { WalletBalance } from './WalletBalance';


// interface BridgeFormProps {
//   balance: string | null;
//   onTransactionComplete: () => void;
// }

// const TOTAL_FEE = 0.0015; // Bridge fee + network fee

// export default function BridgeForm({ balance, onTransactionComplete }: BridgeFormProps) {
//   const wallet = useWallet();
//   const [amount, setAmount] = useState('');
//   const [ethAddress, setEthAddress] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   // Calculate max amount considering fees
//   const setMaxAmount = () => {
//     if (!balance) {
//       setAmount('');
//       return;
//     }
    
//     const parsedBalance = parseFloat(balance);
//     const maxAmount = Math.max(0, parsedBalance - TOTAL_FEE);
//     setAmount(maxAmount.toFixed(6));
//   };

//   // Auto-fill only when wallet connects/balance loads and user hasn't modified amount
//   useEffect(() => {
//     if (balance && amount === '') {
//       setMaxAmount();
//     }
//   }, [balance, amount]);


//       const handleLockSol = async () => {
//         setError('');

//         if (!wallet.connected || !wallet.publicKey) {
//           setError("Connect wallet first");
//           return;
//         }

//         const solAmount = parseFloat(amount);
//         if (isNaN(solAmount) || solAmount <= 0) {
//           setError("Enter a valid amount of SOL");
//           return;
//         }

//         if (!ethAddress.trim()) {
//           setError("Please enter an Ethereum address");
//           return;
//         }

//         if (balance && solAmount > parseFloat(balance)) {
//           setError(`Insufficient balance. You have ${balance} SOL`);
//           return;
//         }

//         try {
//           setLoading(true);
//           await initializeBridge(wallet);
//           const sig = await lockSol(wallet, solAmount * 1e9, ethAddress);
//           alert(`Locked ${amount} SOL\nTx: ${sig}`);
//           setAmount('');
//           setEthAddress('');
//           onTransactionComplete();
//         } catch (err) {
//           const errorMessage = err instanceof Error ? err.message : "Unknown error";
//           setError("Error: " + errorMessage);
//         } finally {
//           setLoading(false);
//         }
//       };

//       return (
//         <div className="form-container">
          // {/* Wallet Connection Section */}
          // <div className="wallet-section" style={{ position: 'relative', zIndex: 1000 }}>
          //   <h2>Connect Your Wallet</h2>
          //   <div className="wallet-button-container">
          //     <WalletMultiButton
          //       className="wallet-button"
          //       style={{
          //         background: 'linear-gradient(90deg, var(--primary), var(--accent))',
          //         color: 'white',
          //         border: 'none',
          //         borderRadius: '12px',
          //         padding: '14px 28px',
          //         fontWeight: '600',
          //         fontSize: '1rem',
          //         width: '100%',
          //         position: 'relative',
          //         zIndex: 101
          //       }} />
          //     {/* <WalletMultiButton className="wallet-button" /> */}
          //   </div>
          // </div>

//           {/* Balance Section */}
//           <section className="balance-section card-hover">
//             <WalletBalance />
//           </section>


//            <div className="amount-input">
//         <label>Amount to Bridge</label>
//         <div className="input-group">
//           <input
//             type="number"
//             placeholder="0.0"
//             value={amount}
//             onChange={(e) => setAmount(e.target.value)}
//             disabled={!wallet.connected || loading} />
//           <button
//             onClick={setMaxAmount}
//             className="max-button"
//             disabled={!wallet.connected || loading}
//           >
//             MAX
//           </button>
//         </div>
//       </div>


//           {/* Address Input */}
//           <div className="amount-input">
//             <label>Recipient (Ethereum)</label>
//             <div className="input-group">
//               <input
//                 type="text"
//                 placeholder="0x..."
//                 value={ethAddress}
//                 onChange={(e) => setEthAddress(e.target.value)}
//                 disabled={!wallet.connected || loading} />
//             </div>
//           </div>

//           {/* Transaction Summary */}

//           <div className="fee-row">
//             <span>Bridge Fee</span>
//             <span>0.001 SOL</span>
//           </div>
//           <div className="fee-row">
//             <span>Network Fee</span>
//             <span>~0.0005 SOL</span>
//           </div>
//           <div className="fee-row total">
//             <span>You will receive</span>
//             <span>
//               {amount ? (parseFloat(amount) - 0.0015).toFixed(4) : '0.0000'} wSOL
//             </span>
//           </div>

          // {/* Error Message */}
          // {error && <div className="error-message">{error}</div>}

          // {/* Bridge Button */}
          // <button
          //   className="action-button"
          //   onClick={handleLockSol}
          //   disabled={loading || !wallet.connected || !amount || !ethAddress}
          // >
          //   {loading ? 'Processing...' : <span className="button-text">Bridge tokens</span>}
          // </button>

          // {/* Info Footer */}

          // <div className='footerone'>
          //   <div style={{
          //     display: 'flex',
          //     alignItems: 'center',
          //     gap: '6px'
          //   }}>
          //     <span style={{
          //       width: '6px',
          //       height: '6px',
          //       background: '#14F195',
          //       borderRadius: '50%'
          //     }}></span>
          //     <span>Real-time balance updates</span>
          //   </div>
          //   <div style={{
          //     display: 'flex',
          //     alignItems: 'center',
          //     gap: '6px'
          //   }}>
          //     <span style={{
          //       width: '6px',
          //       height: '6px',
          //       background: '#14F195',
          //       borderRadius: '50%'
          //     }}></span>
          //     <span>Connected to Solana Devnet</span>
          //   </div>
          // </div>
//         </div>
//       );
//     }



import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { lockSol, initializeBridge } from '../solana/lockSol';
import { WalletBalance } from './WalletBalance';

export interface BridgeFormProps {
  onTransactionComplete: () => void;
  balance?: number | null;
}

const BRIDGE_FEE = 0.001;
const NETWORK_FEE = 0.0005;
const TOTAL_FEE = BRIDGE_FEE + NETWORK_FEE;

// Supported networks
const NETWORKS = [
  { id: 1, name: "Ethereum", symbol: "ETH" },   // chainId 1
  { id: 8453, name: "Base", symbol: "BASE" },    // Base mainnet chainId
  { id: 137, name: "Polygon", symbol: "MATIC" },  // Polygon mainnet chainId
];

export default function BridgeForm({ onTransactionComplete }: BridgeFormProps) {
  const wallet = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [ethAddress, setEthAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userModifiedAmount, setUserModifiedAmount] = useState(false);
  const [targetNetwork, setTargetNetwork] = useState(NETWORKS[0].id); // default Ethereum

  // Set full balance as input (do not subtract fees)
  const setMaxAmount = () => {
    if (!balance) return;
    setAmount(parseFloat(balance).toFixed(6));
    setUserModifiedAmount(true);
  };

  // Reset when balance changes
  useEffect(() => {
    if (balance === null) {
      setAmount('');
      setUserModifiedAmount(false);
    }
  }, [balance]);

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setUserModifiedAmount(true);
  };

  const handleLockSol = async () => {
    setError('');

    if (!wallet.connected || !wallet.publicKey) {
      setError('Connect wallet first');
      return;
    }

    const solAmount = parseFloat(amount);
    if (isNaN(solAmount) || solAmount <= 0) {
      setError('Enter a valid amount of SOL');
      return;
    }

    if (solAmount < BRIDGE_FEE) {
      setError(`Amount must be at least ${BRIDGE_FEE} SOL to cover bridge fee`);
      return;
    }

    if (!ethAddress.trim()) {
      setError('Please enter a recipient address');
      return;
    }

    const requiredBalance = solAmount - TOTAL_FEE;
    if (balance && requiredBalance > parseFloat(balance)) {
      setError(`Insufficient balance. You need ${requiredBalance.toFixed(6)} SOL (incl. network fee)`);
      return;
    }

    try {
      setLoading(true);
      await initializeBridge(wallet);
      const sig = await lockSol(wallet, solAmount * 1e9, ethAddress, targetNetwork);
      alert(`Locked ${amount} SOL\nTx: ${sig}`);
      setAmount('');
      setEthAddress('');
      setUserModifiedAmount(false);
      onTransactionComplete();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Error: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      {/* Wallet Connect */}
      <div className="wallet-section" style={{ position: 'relative', zIndex: 1000 }}>
        <h2>Connect Your Wallet</h2>
        <div className="wallet-button-container">
          <WalletMultiButton
            className="wallet-button"
            style={{
              background: 'linear-gradient(90deg, var(--primary), var(--accent))',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 28px',
              fontWeight: '600',
              fontSize: '1rem',
              width: '100%',
              position: 'relative',
              zIndex: 101,
            }}
          />
        </div>
      </div>

      {/* Balance */}
      <section className="balance-section card-hover">
        <WalletBalance onBalanceUpdate={setBalance} />
      </section>

      {/* Amount Input */}
      <div className="amount-input">
        <label>Amount to Bridge</label>
        <div className="input-group">
          <input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            disabled={!wallet.connected || loading || balance === null}
          />
          <button
            onClick={setMaxAmount}
            className="max-button"
            disabled={!wallet.connected || loading}
          >
            MAX
          </button>
        </div>
      </div>

    {/* Network Selector - Card Style */}
      <div className="network-selector">
        <label>Choose Network</label>
        <div className="network-cards" style={{
         display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", // smaller width
      gap: "8px",
      marginTop: "6px",
      marginBottom: "15px",
        }}>
          {NETWORKS.map(net => (
            <div
              key={net.id}
              className={`network-card ${targetNetwork === net.id ? 'selected' : ''}`}
              onClick={() => !loading && wallet.connected && setTargetNetwork(net.id)}
              style={{
                padding: "12px", // smaller padding
                position: "relative",
          border:
            targetNetwork === net.id
              ? "2px solid var(--primary)"
              : "2px solid transparent", // only show border on click
          borderRadius: "10px",
          cursor: !loading && wallet.connected ? "pointer" : "not-allowed",
          textAlign: "center",
          transition: "all 0.2s ease",
          background: "transparent", // matches background
          opacity: !loading && wallet.connected ? 1 : 0.6,
              }}
            >
              <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '4px' }}>
                {net.name}
              </div>
            
             {targetNetwork === net.id && (
      <div
        style={{
          position: "absolute",
          top: "6px",
          left: "6px",
          width: "8px",
          height: "8px",
          backgroundColor: "var(--primary)",
          borderRadius: "50%",
        }}
      />
    )}
            </div>
          ))}
        </div>
      </div>


      {/* Recipient Address */}
      <div className="amount-input">
        <label>Recipient Address</label>
        <div className="input-group">
          <input
            type="text"
            placeholder="0x... or base/polygon address"
            value={ethAddress}
            onChange={(e) => setEthAddress(e.target.value)}
            disabled={!wallet.connected || loading}
          />
        </div>
      </div>



      {/* Fee Summary */}
      <div className="fee-row">
        <span>Bridge Fee</span>
        <span>{BRIDGE_FEE} SOL</span>
      </div>
      <div className="fee-row">
        <span>Network Fee</span>
        <span>{NETWORK_FEE} SOL</span>
      </div>
      <div className="fee-row total">
        <span>You will receive</span>
        <span>
          {amount ? (Math.max(0, parseFloat(amount) - TOTAL_FEE)).toFixed(6) : '0.000000'} wSOL
        </span>
      </div>

      {/* Error */}
      {error && <div className="error-message">{error}</div>}

      {/* Action Button */}
      <button
        className="action-button"
        onClick={handleLockSol}
        disabled={loading || !wallet.connected || !amount || !ethAddress}
      >
        {loading ? 'Processing...' : <span className="button-text">Bridge tokens</span>}
      </button>

      {/* Footer */}
      <div className="footerone">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', background: '#14F195', borderRadius: '50%' }}></span>
          <span>Real-time balance updates</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', background: '#14F195', borderRadius: '50%' }}></span>
          <span>Connected to Solana Devnet</span>
        </div>
      </div>
    </div>
  );
}