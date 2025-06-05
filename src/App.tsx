import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { lockSol, initializeBridge } from "./solana/lockSol";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function App() {
  const wallet = useWallet();
  const [amount, setAmount] = useState(""); // amount in SOL
  const [ethAddress, setEthAddress] = useState(""); // ETH address for bridge
  const [loading, setLoading] = useState(false);

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
      
      <h1 style={{ marginBottom: "1rem" }}>Lock SOL</h1>
      
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
          marginBottom: "1rem",
          fontSize: "1rem",
        }}
      />

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
        disabled={loading}
        style={{
          width: "100%",
          padding: "0.75rem",
          fontSize: "1rem",
          background: "#111",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "Locking..." : "Lock SOL"}
      </button>
    </div>
  );
}