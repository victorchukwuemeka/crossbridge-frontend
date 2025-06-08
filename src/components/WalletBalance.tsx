import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { walletSolBalance } from '../solana/walletSolBalance';

export function WalletBalance() {
  const wallet = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!wallet.connected || !wallet.publicKey) {
      setBalance(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const bal = await walletSolBalance(wallet);
      setBalance(bal);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch balance";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return (
    <div style={{ 
      marginTop: "1rem", 
      padding: "1rem", 
      background: "#f5f5f5", 
      borderRadius: "8px",
      border: "1px solid #ddd"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>Wallet Balance:</strong>
        <button 
          onClick={fetchBalance}
          disabled={loading}
          style={{
            padding: "0.25rem 0.5rem",
            fontSize: "0.8rem",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          {loading ? "..." : "🔄"}
        </button>
      </div>
      
      {loading && <div style={{ color: "#666", fontSize: "0.9rem" }}>Loading balance...</div>}
      {error && <div style={{ color: "#d32f2f", fontSize: "0.9rem" }}>Error: {error}</div>}
      {balance && !loading && (
        <div style={{ 
          fontSize: "1.2rem", 
          fontWeight: "bold", 
          color: "#2e7d32",
          marginTop: "0.5rem"
        }}>
          {parseFloat(balance).toFixed(4)} SOL
        </div>
      )}
    </div>
  );
}