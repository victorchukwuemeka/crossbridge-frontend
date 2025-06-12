import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { lockSol, initializeBridge } from '../solana/lockSol';

interface BridgeFormProps {
  balance: string | null;
  onTransactionComplete: (amount: number, address: string) => void;
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
      onTransactionComplete(solAmount, ethAddress);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      alert("Error: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
      <h1 style={{ marginBottom: "1rem" }}>Lock SOL</h1>
      
      <div style={{ position: "relative" }}>
        <input
          type="number"
          step="0.001"
          placeholder="Amount in SOL"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            padding: "0.5rem",
            width: "100%",
            marginBottom: "0.5rem",
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
          padding: "0.5rem",
          width: "100%",
          marginBottom: "1rem",
          fontSize: "1rem",
        }}
      />

      <button
        onClick={handleLockSol}
        disabled={loading || !wallet.connected}
        style={{
          width: "100%",
          padding: "0.75rem",
          fontSize: "1rem",
          background: loading || !wallet.connected ? "#ccc" : "#111",
          color: "#fff",
          border: "none",
          cursor: loading || !wallet.connected ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Locking..." : "Lock SOL"}
      </button>
    </div>
  );
}