import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { lockSol, initializeBridge } from '../solana/lockSol';

interface BridgeFormProps {
  balance: string | null;
  onTransactionComplete: () => void;
}

export function BridgeForm({ balance, onTransactionComplete }: BridgeFormProps) {
  const wallet = useWallet();
  const [amount, setAmount] = useState('');
  const [ethAddress, setEthAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const setMaxAmount = () => {
    if (balance) {
      const maxAmount = Math.max(0, parseFloat(balance) - 0.01);
      setAmount(maxAmount.toFixed(6));
    }
  };

  const handleLockSol = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      alert("Connect wallet first");
      return;
    }

    const solAmount = parseFloat(amount);
    if (isNaN(solAmount) || solAmount <= 0) {
      alert("Enter a valid amount of SOL");
      return;
    }

    if (!ethAddress.trim()) {
      alert("Please enter an Ethereum address");
      return;
    }

    if (balance && solAmount > parseFloat(balance)) {
      alert(`Insufficient balance. You have ${balance} SOL`);
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
      alert("Error: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (    <div className="bridge-form">
      <h2 className="text-gradient">Bridge Your Assets</h2>
      
      <div className="balance-display glass-card">
        <div>
          <span className="label">Available Balance</span>
          <div className="balance-amount">{balance ? `${parseFloat(balance).toFixed(4)} SOL` : '0.0000 SOL'}</div>
        </div>
        <div className="network-badge">
          <span className="status-dot"></span>
          Solana Network
        </div>
      </div>

      <div className="input-container">
        <input
          type="number"
          step="0.001"
          placeholder="Enter amount to bridge"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            padding: "1rem",
            width: "100%",
            marginBottom: "0.2rem",
            fontSize: "1rem",
            paddingRight: "60px"
          }}
        />
        
        {balance && (
          <button
            onClick={setMaxAmount}
            style={{
              position: "absolute",
              right: "8px",
              top: "8px",
              padding: "0.25rem 0.5rem",
              fontSize: "0.8rem",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            MAX
          </button>
        )}
      </div>
      
      {balance && (
        <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: "1rem", textAlign: "right" }}>
          Available: {parseFloat(balance).toFixed(4)} SOL
        </div>
      )}

      <input
        type="text"
        placeholder="Ethereum Address (0x...)"
        value={ethAddress}
        onChange={(e) => setEthAddress(e.target.value)}
        style={{
          padding: "1rem",
          width: "100%",
          marginBottom: "1rem",
          fontSize: "1rem",
        }}
      />      <div className="transaction-details">
        <div className="detail-row">
          <span>Bridge Fee</span>
          <span>0.001 SOL</span>
        </div>
        <div className="detail-row">
          <span>Network Fee</span>
          <span>~0.0005 SOL</span>
        </div>
        <div className="detail-row total">
          <span>You will receive</span>
          <span>{amount ? `${(parseFloat(amount) - 0.0015).toFixed(4)} wSOL` : '0.0000 wSOL'}</span>
        </div>
      </div>

      <button
        className="action-button"
        onClick={handleLockSol}
        disabled={loading || !wallet.connected}
      >
        {loading ? (
          <span className="loading">Processing...</span>
        ) : !wallet.connected ? (
          'Connect Wallet to Bridge'
        ) : (
          'Bridge SOL → wSOL'
        )}
      </button>
    </div>
  );
}