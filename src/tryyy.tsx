import { useState, useEffect } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { WalletBalance } from "./components/WalletBalance";
import BridgeForm from "./components/BridgeForm";
import { TransactionInfoCard } from "./components/TransactionInfoCard";
import {
  getCompleteTransactionInfo,
  type CompleteTransactionInfo,
} from "./ethereum/ethereumWsolContract";
import { EthereumWsolBalance } from "./components/EthereumWsolBalance";
import BurnTokenComponent from "./components/BurnTokenComponent";

import { useConnect, useAccount, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

export default function App() {
  const [transactionInfo, setTransactionInfo] =
    useState<CompleteTransactionInfo | null>(null);
  const [activeTab, setActiveTab] = useState("bridge");
  const [walletError, setWalletError] = useState<string>("");

  // Solana wallet hook - renamed to avoid conflicts
  const {
    connected: solConnected,
    publicKey: solPublicKey,
    connect: solConnect,
    disconnect: solDisconnect
  } = useWallet();

  // Ethereum wallet hooks
  const { connect: ethConnect, isPending, error } = useConnect();
  const { address: ethAddress, isConnected: ethConnected } = useAccount();
  const { disconnect: ethDisconnect } = useDisconnect();

  useEffect(() => {
    const loadTransactionInfo = async () => {
      const info = await getCompleteTransactionInfo(
        1.5,
        "0x742d35Cc6634C0532925a3b8D4341EaE7C5B4D8D",
        "So11111111111111111111111111111111111111112",
        "completed",
        "5j7x8k9m2n3p4q5r6s7t8u9v1w2x3y4z5a6b7c8d9e1f2g3h4i5j6k7l8m9n1p2q3r4s5t"
      );
      setTransactionInfo(info);
    };
    loadTransactionInfo();
  }, []);

  const handleEthConnect = async () => {
    try {
      setWalletError("");
      await ethConnect({ connector: injected() });
    } catch (err) {
      console.error("Connection error:", err);
      setWalletError("Failed to connect Ethereum wallet");
    }
  };

  // Log connection status for debugging
  useEffect(() => {
    console.log("Wallet connection status:", {
      solConnected,
      solPublicKey: solPublicKey?.toString(),
      ethConnected,
      ethAddress,
      isPending,
      error,
    });
  }, [solConnected, solPublicKey, ethConnected, ethAddress, isPending, error]);

  const tabButtonStyle = (isActive: boolean) => ({
    padding: "1rem 2rem",
    background: isActive ? "rgba(255, 255, 255, 0.1)" : "transparent",
    border: "none",
    color: isActive ? "#fff" : "#ccc",
    fontSize: "1.1em",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    borderRadius: "12px 12px 0 0",
    borderBottom: isActive ? "2px solid #14F195" : "none",
  });

  const tabContentStyle = {
    padding: "2rem",
    background: "rgba(30, 30, 30, 0.95)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
    animation: "fadeIn 0.3s ease-in-out",
  };

  const linkStyle = {
    background: "transparent",
    border: "1px solid #14F195",
    color: "#14F195",
    padding: "0.8em 1.6em",
    borderRadius: "8px",
    textDecoration: "none",
    transition: "all 0.3s ease",
    textAlign: "center" as const,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        minHeight: "100vh",
        padding: "2rem",
        background: "linear-gradient(135deg, #0A192F 0%, #132F4C 100%)",
        color: "#fff",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "1.5rem",
          background: "rgba(30, 30, 30, 0.95)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div
          style={{
            fontSize: "2em",
            fontWeight: "700",
            background: "linear-gradient(135deg, #9945ff, #14f195)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          CrossBridge
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          {/* Solana Wallet */}
          <WalletMultiButton />
          <button onClick={() => solConnect()}>
            Connect Solana Manually
          </button>
          {/* Ethereum Wallet */}
          <div>
            {!ethConnected ? (
              <button
                onClick={handleEthConnect}
                disabled={isPending}
                style={{
                  background: "linear-gradient(135deg, #9945ff, #14f195)",
                  border: "none",
                  color: "#fff",
                  padding: "0.8em 1.6em",
                  borderRadius: "8px",
                  cursor: isPending ? "not-allowed" : "pointer",
                  fontSize: "1em",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                  opacity: isPending ? 0.7 : 1,
                }}
              >
                {isPending ? "Connecting..." : "Connect Ethereum"}
              </button>
            ) : (
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span style={{ color: "#14F195", fontSize: "0.9em" }}>
                  ETH: {ethAddress?.slice(0, 6)}...{ethAddress?.slice(-4)}
                </span>
                <button
                  onClick={() => ethDisconnect()}
                  style={{
                    background: "rgba(244, 67, 54, 0.8)",
                    border: "none",
                    color: "#fff",
                    padding: "0.5em 1em",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.9em",
                    transition: "all 0.3s ease",
                  }}
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error display */}
        {(walletError || error) && (
          <div
            style={{
              width: "100%",
              padding: "1rem",
              background: "rgba(244, 67, 54, 0.1)",
              border: "1px solid rgba(244, 67, 54, 0.3)",
              borderRadius: "8px",
              color: "#ff6b6b",
              fontSize: "0.9em",
            }}
          >
            Error: {walletError || error?.message}
          </div>
        )}
      </header>

      {/* Main Content Container */}
      <div style={{ width: "100%", flex: "1", display: "flex", flexDirection: "column" }}>
        {/* Tabs Header */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "2rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "0 1rem",
            flexWrap: "wrap",
          }}
        >
          <button
            style={tabButtonStyle(activeTab === "bridge")}
            onClick={() => setActiveTab("bridge")}
          >
            Bridge Assets
          </button>
          <button
            style={tabButtonStyle(activeTab === "transactions")}
            onClick={() => setActiveTab("transactions")}
          >
            Transactions
          </button>
          <button
            style={tabButtonStyle(activeTab === "wallet")}
            onClick={() => setActiveTab("wallet")}
          >
            Wallet
          </button>
          <button
            style={tabButtonStyle(activeTab === "burn")}
            onClick={() => setActiveTab("burn")}
          >
            Burn Tokens
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ flex: "1", minHeight: "600px" }}>
          {activeTab === "bridge" && (
            <div style={tabContentStyle}>
              <h2
                style={{
                  color: "#ccc",
                  fontSize: "1.2em",
                  marginBottom: "1.5rem",
                  fontWeight: "500",
                }}
              >
                Bridge Your Assets
              </h2>

              {/* Balance Display */}
              <div style={{ marginBottom: "2rem" }}>
                <EthereumWsolBalance />
                <div style={{ marginTop: "1rem" }}>
                  <WalletBalance />
                </div>
              </div>

              {/* Bridge Form */}
              <BridgeForm
                onTransactionComplete={() => {
                  setTimeout(() => window.location.reload(), 2000);
                }}
                balance={null}
              />
            </div>
          )}

          {activeTab === "transactions" && (
            <div style={tabContentStyle}>
              <h2
                style={{
                  color: "#ccc",
                  fontSize: "1.2em",
                  marginBottom: "1.5rem",
                  fontWeight: "500",
                }}
              >
                Recent Transactions
              </h2>
              {transactionInfo ? (
                <TransactionInfoCard info={transactionInfo} />
              ) : (
                <div style={{ padding: "3rem", textAlign: "center" }}>
                  <p style={{ color: "#ccc", fontSize: "1.1em", marginBottom: "1rem" }}>
                    No recent transactions found.
                  </p>
                  <p style={{ color: "#888", fontSize: "0.9em" }}>
                    Complete a bridge transaction to see your history here.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "wallet" && (
            <div style={tabContentStyle}>
              <h2
                style={{
                  color: "#ccc",
                  fontSize: "1.2em",
                  marginBottom: "1.5rem",
                  fontWeight: "500",
                }}
              >
                Wallet Overview
              </h2>

              {/* Wallet Connection Status */}
              <div style={{ marginBottom: "2rem", padding: "1.5rem", background: "rgba(255, 255, 255, 0.05)", borderRadius: "12px" }}>
                <h3 style={{ color: "#14F195", marginBottom: "1rem", fontSize: "1.1em" }}>Connection Status</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <p style={{ color: solConnected ? "#14F195" : "#ff6b6b" }}>
                    Solana: {solConnected ? `Connected (${solPublicKey?.toString().slice(0, 6)}...${solPublicKey?.toString().slice(-4)})` : "Not Connected"}
                  </p>
                  <p style={{ color: ethConnected ? "#14F195" : "#ff6b6b" }}>
                    Ethereum: {ethConnected ? `Connected (${ethAddress?.slice(0, 6)}...${ethAddress?.slice(-4)})` : "Not Connected"}
                  </p>
                </div>
              </div>

              {/* Balance Display */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <div>
                  <h3 style={{ color: "#14F195", marginBottom: "1rem", fontSize: "1.1em" }}>Ethereum Balances</h3>
                  <EthereumWsolBalance />
                </div>
                <div>
                  <h3 style={{ color: "#14F195", marginBottom: "1rem", fontSize: "1.1em" }}>Solana Balances</h3>
                  <WalletBalance />
                </div>
              </div>
            </div>
          )}

          {activeTab === "burn" && (
            <div style={tabContentStyle}>
              <h2
                style={{
                  color: "#ccc",
                  fontSize: "1.2em",
                  marginBottom: "1.5rem",
                  fontWeight: "500",
                }}
              >
                Burn WSOL Tokens
              </h2>
              <div style={{ marginBottom: "2rem" }}>
                <p style={{ color: "#ccc", marginBottom: "1rem" }}>
                  Burn your WSOL tokens to convert them back to native SOL.
                </p>
                <div style={{ padding: "1rem", background: "rgba(255, 193, 7, 0.1)", borderRadius: "8px", border: "1px solid rgba(255, 193, 7, 0.3)" }}>
                  <p style={{ color: "#ffc107", fontSize: "0.9em", margin: 0 }}>
                    ⚠️ Warning: This action is irreversible. Make sure you understand the implications before proceeding.
                  </p>
                </div>
              </div>
              <BurnTokenComponent />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          paddingTop: "3rem",
          marginTop: "3rem",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
          width: "100%",
        }}
      >
        <div
          style={{
            padding: "2rem",
            background: "rgba(30, 30, 30, 0.95)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
          }}
        >
          <h3
            style={{
              color: "#ccc",
              fontSize: "1.2em",
              marginBottom: "1.5rem",
              fontWeight: "500",
            }}
          >
            Resources
          </h3>
          <nav
            style={{
              display: "flex",
              gap: "1.5rem",
              flexDirection: "column",
            }}
          >
            <a href="/docs" style={linkStyle}>
              Documentation
            </a>
            <a href="/guides" style={linkStyle}>
              User Guides
            </a>
          </nav>
        </div>

        <div
          style={{
            padding: "2rem",
            background: "rgba(30, 30, 30, 0.95)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
          }}
        >
          <h3
            style={{
              color: "#ccc",
              fontSize: "1.2em",
              marginBottom: "1.5rem",
              fontWeight: "500",
            }}
          >
            Community
          </h3>
          <nav
            style={{
              display: "flex",
              gap: "1.5rem",
              flexDirection: "column",
            }}
          >
            <a href="https://discord.gg/solbridge" style={linkStyle}>
              Discord
            </a>
            <a href="https://twitter.com/solbridge" style={linkStyle}>
              Twitter
            </a>
          </nav>
        </div>

        <div
          style={{
            padding: "2rem",
            background: "rgba(30, 30, 30, 0.95)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
          }}
        >
          <h3
            style={{
              color: "#ccc",
              fontSize: "1.2em",
              marginBottom: "1.5rem",
              fontWeight: "500",
            }}
          >
            Help
          </h3>
          <nav
            style={{
              display: "flex",
              gap: "1.5rem",
              flexDirection: "column",
            }}
          >
            <a href="/faq" style={linkStyle}>
              FAQ
            </a>
            <a href="/support" style={linkStyle}>
              Support
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}