import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { lockSol, initializeBridge } from "./solana/lockSol";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { walletSolBalance } from "./solana/walletSolBalance";

export default function App() {
  const wallet = useWallet();
  const [amount, setAmount] = useState(""); // amount in SOL
  const [ethAddress, setEthAddress] = useState(""); // ETH address for bridge
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<string | null>(null); // SOL balance
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  // Function to fetch wallet balance
  const fetchBalance = useCallback(async () => {
    if (!wallet.connected || !wallet.publicKey) {
      setBalance(null);
      setBalanceError(null);
      return;
    }

    try {
      setBalanceLoading(true);
      setBalanceError(null);
      const walletBalance = await walletSolBalance(wallet);
      setBalance(walletBalance);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch balance";
      setBalanceError(errorMessage);
      console.error("Balance fetch error:", error);
    } finally {
      setBalanceLoading(false);
    }
  }, [wallet]);

  // Fetch balance when wallet connection changes
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Set max amount function
  const setMaxAmount = () => {
    if (balance) {
      // Leave some SOL for transaction fees (0.01 SOL buffer)
      const maxAmount = Math.max(0, parseFloat(balance) - 0.01);
      setAmount(maxAmount.toFixed(6));
    }
  };

  // For locking sol aka bridging
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

    // Check if user has enough balance
    if (balance && solAmount > parseFloat(balance)) {
      alert(`Insufficient balance. You have ${balance} SOL`);
      return;
    }

    const lamports = solAmount * 1_000_000_000;

    try {
      setLoading(true);
      // Initialize the bridge account first
      await initializeBridge(wallet);
      console.log('✅ Bridge account initialized successfully');
      
      // Call lockSol with the ETH address
      const sig = await lockSol(wallet, lamports, ethAddress);
      alert("Locked " + amount + " SOL for ETH address: " + ethAddress + "\nTx: " + sig);
      
      setAmount("");
      setEthAddress("");
      
      // Refresh balance after successful transaction
      setTimeout(() => {
        fetchBalance();
      }, 2000); // Wait 2 seconds for transaction to be confirmed
      
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      alert("Error locking SOL: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
      <h1>Connect your Solana Wallet</h1>
      <WalletMultiButton />
      
      {/* Balance Display */}
      {wallet.connected && (
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
              disabled={balanceLoading}
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
              {balanceLoading ? "..." : "🔄"}
            </button>
          </div>
          
          {balanceLoading && (
            <div style={{ color: "#666", fontSize: "0.9rem" }}>Loading balance...</div>
          )}
          
          {balanceError && (
            <div style={{ color: "#d32f2f", fontSize: "0.9rem" }}>
              Error: {balanceError}
            </div>
          )}
          
          {balance && !balanceLoading && (
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
      )}

      <h1 style={{ marginBottom: "1rem", marginTop: "2rem" }}>Lock SOL</h1>
      
      <div style={{ position: "relative" }}>
        <input
          id="solAmount"
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
            paddingRight: "60px" // Make room for MAX button
          }}
        />
        
        {/* MAX Button */}
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
      
      {/* Show available balance hint */}
      {balance && (
        <div style={{ 
          fontSize: "0.8rem", 
          color: "#666", 
          marginBottom: "1rem",
          textAlign: "right"
        }}>
          Available: {parseFloat(balance).toFixed(4)} SOL
        </div>
      )}

      <input
        id="ethAddress"
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