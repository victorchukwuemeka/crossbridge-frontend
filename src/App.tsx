import { useState, useEffect } from "react";
//import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { WalletBalance } from "./components/WalletBalance";
import { BridgeForm } from "./components/BridgeForm";
import { TransactionInfoCard } from "./components/TransactionInfoCard";
import {
  getCompleteTransactionInfo,
  type CompleteTransactionInfo,
} from "./ethereum/ethereumWsolContract";
import { EthereumWsolBalance } from "./components/EthereumWsolBalance"; 
//import { BurnTokenComponent } from "./components/BurnTokenComponent";
import BurnTokenComponent from "./components/BurnTokenComponent";

import "./App.css";

import { useConnect, useAccount, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

export default function App() {
  const [transactionInfo, setTransactionInfo] =
    useState<CompleteTransactionInfo | null>(null);
  const [activeTab, setActiveTab] = useState("bridge");
  const [solAmount, setSolAmount] = useState<number | null>(null);
  const [ethWalletAddress, setEthWalletAddress] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string>("");

  // Ethereum wallet hooks
  // const { connect } = useConnect();
  // Ethereum wallet hooks
  const { connect, isPending, error } = useConnect();
  const { address: ethAddress, isConnected: ethConnected } = useAccount();
  const { disconnect } = useDisconnect();

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
      await connect({ connector: injected() });
    } catch (err) {
      console.error("Connection error:", err);
      setWalletError("Failed to connect Ethereum wallet");
    }
  };

  // Log connection status for debugging
  useEffect(() => {
    console.log("Ethereum connection status:", {
      ethConnected,
      ethAddress,
      isPending,
      error,
    });
  }, [ethConnected, ethAddress, isPending, error]);

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
        <nav style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <WalletMultiButton
            style={{
              background: "linear-gradient(45deg, #9945FF, #14F195)",
              padding: "12px 24px",
              borderRadius: "12px",
              fontWeight: "600",
              transition: "all 0.3s ease",
            }}
          />
        </nav>
      </header>

      {/* Tabs Container */}
      <div style={{ width: "100%", marginBottom: "2rem" }}>
        {/* Tabs Header */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "2rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "0 1rem",
          }}
        >
          <button
            style={{
              padding: "1rem 2rem",
              background:
                activeTab === "bridge"
                  ? "rgba(255, 255, 255, 0.1)"
                  : "transparent",
              border: "none",
              color: activeTab === "bridge" ? "#fff" : "#ccc",
              fontSize: "1.1em",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.3s ease",
              position: "relative",
              borderRadius: "12px 12px 0 0",
              borderBottom:
                activeTab === "bridge" ? "2px solid #14F195" : "none",
            }}
            onClick={() => setActiveTab("bridge")}
          >
            Bridge Assets
          </button>
          <button
            style={{
              padding: "1rem 2rem",
              background:
                activeTab === "transactions"
                  ? "rgba(255, 255, 255, 0.1)"
                  : "transparent",
              border: "none",
              color: activeTab === "transactions" ? "#fff" : "#ccc",
              fontSize: "1.1em",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.3s ease",
              position: "relative",
              borderRadius: "12px 12px 0 0",
              borderBottom:
                activeTab === "transactions" ? "2px solid #14F195" : "none",
            }}
            onClick={() => setActiveTab("transactions")}
          >
            Transactions
          </button>
          <button
            style={{
              padding: "1rem 2rem",
              background:
                activeTab === "wallet"
                  ? "rgba(255, 255, 255, 0.1)"
                  : "transparent",
              border: "none",
              color: activeTab === "wallet" ? "#fff" : "#ccc",
              fontSize: "1.1em",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.3s ease",
              position: "relative",
              borderRadius: "12px 12px 0 0",
              borderBottom:
                activeTab === "wallet" ? "2px solid #14F195" : "none",
            }}
            onClick={() => setActiveTab("wallet")}
          >
            Wallet
          </button>
        </div>
      </div>
      {/* Tab Content */}
      <div
        style={{
          display: activeTab === "bridge" ? "block" : "none",
          padding: "2rem",
          background: "rgba(30, 30, 30, 0.95)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
          animation: "fadeIn 0.3s ease-in-out",
        }}
      >
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
      </div>
      <div className="app-container">
        <div className="main-content">
          <header className="header">
            <div className="logo">CROSSBRIDGE</div>
            {/** solana wallet section */}
            <WalletMultiButton className="wallet-button" />

            {/** ethereum wallet section */}
            <div className="eth-wallet-section">
              {!ethConnected ? (
                <button
                  onClick={handleEthConnect}
                  disabled={isPending}
                  className="eth-connect-button"
                >
                  {isPending ? "Connecting..." : "Connect Ethereum"}
                </button>
              ) : (
                <div className="eth-wallet-connected">
                  <span>
                    ETH: {ethAddress?.slice(0, 6)}...{ethAddress?.slice(-4)}
                  </span>
                  <button
                    onClick={() => disconnect()}
                    className="disconnect-button"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
            {/* Error display */}
            {(walletError || error) && (
              <div className="error-message">
                Error: {walletError || error?.message}
              </div>
            )}
          </header>

          <div className="card">
            {/** display both etherum and solana balances */}
            <EthereumWsolBalance />
            <br />

            <WalletBalance />

            <BridgeForm
              onTransactionComplete={() => {
                setTimeout(() => window.location.reload(), 2000);
              }}
              balance={null}
            />
          </div>

          <div
            style={{
              display: activeTab === "transactions" ? "block" : "none",
              padding: "2rem",
              background: "rgba(30, 30, 30, 0.95)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
              animation: "fadeIn 0.3s ease-in-out",
            }}
          >
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
              <p style={{ color: "#ccc" }}>No recent transactions found.</p>
            )}
          </div>

          <div
            style={{
              display: activeTab === "wallet" ? "block" : "none",
              padding: "2rem",
              background: "rgba(30, 30, 30, 0.95)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
              animation: "fadeIn 0.3s ease-in-out",
            }}
          >
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
            <WalletBalance />
          </div>
        </div>




























        {/**burn the wsol section  */}
        <div>
        
             <BurnTokenComponent/>
        
        </div>














































        {/* Footer */}
        <footer
          style={{
            marginTop: "auto",
            paddingTop: "2rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
            width: "100%",
            maxWidth: "1200px",
            margin: "0 auto",
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
              <a
                href="/docs"
                style={{
                  background: "transparent",
                  border: "1px solid #14F195",
                  color: "#14F195",
                  padding: "0.8em 1.6em",
                  borderRadius: "8px",
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                  textAlign: "center",
                }}
              >
                Documentation
              </a>
              <a
                href="/guides"
                style={{
                  background: "transparent",
                  border: "1px solid #14F195",
                  color: "#14F195",
                  padding: "0.8em 1.6em",
                  borderRadius: "8px",
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                  textAlign: "center",
                }}
              >
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
              <a
                href="https://discord.gg/solbridge"
                style={{
                  background: "transparent",
                  border: "1px solid #14F195",
                  color: "#14F195",
                  padding: "0.8em 1.6em",
                  borderRadius: "8px",
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                  textAlign: "center",
                }}
              >
                Discord
              </a>
              <a
                href="https://twitter.com/solbridge"
                style={{
                  background: "transparent",
                  border: "1px solid #14F195",
                  color: "#14F195",
                  padding: "0.8em 1.6em",
                  borderRadius: "8px",
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                  textAlign: "center",
                }}
              >
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
              <a
                href="/faq"
                style={{
                  background: "transparent",
                  border: "1px solid #14F195",
                  color: "#14F195",
                  padding: "0.8em 1.6em",
                  borderRadius: "8px",
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                  textAlign: "center",
                }}
              >
                FAQ
              </a>
              <a
                href="/support"
                style={{
                  background: "transparent",
                  border: "1px solid #14F195",
                  color: "#14F195",
                  padding: "0.8em 1.6em",
                  borderRadius: "8px",
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                  textAlign: "center",
                }}
              >
                Support
              </a>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}
