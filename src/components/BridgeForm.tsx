import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { lockSol, initializeBridge } from '../solana/lockSol';
import './bridge.css';

interface BridgeFormProps {
  balance: string | null;
  onTransactionComplete: (amount: number, address: string) => void;
}

export function BridgeForm({ balance, onTransactionComplete }: BridgeFormProps) {
  const wallet = useWallet();
  const [amount, setAmount] = useState('');
  const [ethAddress, setEthAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

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
      setShowStatus(true);
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

  const solPrice = 245.5;
  const bridgeFee = 0.005;
  const amountNum = parseFloat(amount) || 0;
  const usdValue = amountNum * solPrice;
  const receiveAmount = amountNum * 0.995;
  const receiveUSD = receiveAmount * solPrice;

  return (
    <div className="bridge-container">
      <div className="bridge-wrapper">
        {/* Header */}
        <header className="bridge-header">
          <div className="bridge-title">
            SOL BRIDGE
          </div>
        </header>

        {/* Main Bridge Interface */}
        <div className="bridge-interface">
          {/* From Chain */}
          <div className="chain-section">
            <div className="chain-header">
              <div className="chain-icon solana">
                🟣
              </div>
              <div className="chain-info">
                <h3>Solana Network</h3>
                <p>Source Chain</p>
              </div>
            </div>
            
            <div className="token-info">
              <div className="balance-info">
                <span>Token: SOL (Solana)</span>
                <span>
                  Balance: {balance ? `${parseFloat(balance).toFixed(4)} SOL` : 'Loading...'}
                </span>
              </div>
              <div className="balance-usd">
                Available: ${balance ? (parseFloat(balance) * solPrice).toFixed(2) : '0.00'}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Amount to Bridge:
              </label>
              <div className="amount-input-group">
                <input
                  type="number"
                  step="0.001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="amount-input"
                  placeholder="0.00"
                />
                <button
                  onClick={setMaxAmount}
                  className="max-button"
                >
                  MAX
                </button>
              </div>
              <div className="usd-value">
                USD Value: ≈ ${usdValue.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Bridge Arrow */}
          <div className="bridge-arrow">
            <div className="bridge-arrow-icon">
              ⬇
            </div>
          </div>

          {/* To Chain */}
          <div className="chain-section">
            <div className="chain-header">
              <div className="chain-icon ethereum">
                🔷
              </div>
              <div className="chain-info">
                <h3>Ethereum Network</h3>
                <p>Sepolia Testnet</p>
              </div>
            </div>

            <div className="token-info">
              <div className="contract-info">
                <div>Token: wSOL (Wrapped SOL)</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Contract: <span className="contract-address">
                    0xba82C80E13beDdAE290edf6b016d7f981e43431f
                  </span>
                </div>
              </div>
              
              <div className="receive-info">
                <span>You will receive: ~{receiveAmount.toFixed(3)} wSOL</span>
                <span>≈ ${receiveUSD.toFixed(2)}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Recipient Address:</label>
              <input
                type="text"
                placeholder="Ethereum Address (0x...)"
                value={ethAddress}
                onChange={(e) => setEthAddress(e.target.value)}
                className="address-input"
              />
            </div>
          </div>

          {/* Transaction Breakdown */}
          <div className="transaction-breakdown">
            <div className="breakdown-title">
              💰 Transaction Breakdown
            </div>
            <div className="breakdown-row">
              <span>Bridge Fee:</span>
              <span>{bridgeFee} SOL (~${(bridgeFee * solPrice).toFixed(2)})</span>
            </div>
            <div className="breakdown-row">
              <span>Ethereum Gas Fee:</span>
              <span>~$8.50</span>
            </div>
            <div className="breakdown-divider"></div>
            <div className="breakdown-row breakdown-total">
              <span>Total You Pay:</span>
              <span>{(amountNum + bridgeFee).toFixed(3)} SOL + $8.50 gas</span>
            </div>
            <div className="breakdown-row breakdown-total">
              <span>Total You Receive:</span>
              <span>{receiveAmount.toFixed(3)} wSOL</span>
            </div>
            <div className="breakdown-details">
              <div>Exchange Rate: 1 SOL = 0.995 wSOL</div>
              <div>Estimated Time: 15-20 minutes</div>
              <div>Required Confirmations: 12 blocks</div>
            </div>
          </div>

          {/* Bridge Button */}
          <button
            onClick={handleLockSol}
            disabled={loading || !wallet.connected}
            className={`bridge-button ${loading || !wallet.connected ? 'disabled' : 'enabled'}`}
          >
            {loading ? '🔄 Bridging in Progress...' : `🌉 BRIDGE ${amountNum.toFixed(1)} SOL`}
          </button>

          {/* Transaction Status */}
          {showStatus && (
            <div className="transaction-status">
              <div className="status-title">🔄 Transaction Status</div>
              
              <div className="status-item">
                <div className="status-icon completed">
                  ✓
                </div>
                <div className="status-details">
                  <div>SOL sent from Solana</div>
                  <div className="status-link">
                    TX: 4xK9mN... <a href="#">View on Solscan</a>
                  </div>
                </div>
              </div>

              <div className="status-item">
                <div className="status-icon processing">
                  ⏳
                </div>
                <div className="status-details">
                  <div>Processing bridge (8/12 confirmations)</div>
                  <div className="progress-bar">
                    <div className="progress-fill"></div>
                  </div>
                  <div className="time-remaining">Estimated: 8 minutes remaining</div>
                </div>
              </div>

              <div className="status-item">
                <div className="status-icon pending">
                  ⏳
                </div>
                <div className="status-details">
                  <div>wSOL delivery to Ethereum</div>
                  <div className="status-link">Will appear in your wallet automatically</div>
                </div>
              </div>
            </div>
          )}

          {/* Warning Section */}
          <div className="warning-section">
            <div className="warning-title">⚠️ Important Information</div>
            <div className="testnet-badge">
              🧪 TESTNET MODE - Using Sepolia Ethereum testnet
            </div>
            <div className="warning-content">
              <strong>📝 After bridging:</strong>
              <ul className="warning-list">
                <li>wSOL tokens will appear in your Ethereum wallet</li>
                <li>You may need to manually add the token contract</li>
                <li>Symbol: wSOL, Decimals: 18</li>
              </ul>
            </div>
            <div className="warning-content">
              <strong>🚨 Security Reminders:</strong>
              <ul className="warning-list">
                <li>Double-check recipient address</li>
                <li>Transactions cannot be reversed</li>
                <li>Keep transaction hash for tracking</li>
                <li>Only bridge to compatible Ethereum addresses</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}