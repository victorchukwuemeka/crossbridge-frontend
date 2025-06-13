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
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '20px',
      color: '#333'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <header style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            fontSize: '28px',
            fontWeight: '800',
            background: 'linear-gradient(45deg, #9945FF, #14F195)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            SOL BRIDGE
          </div>
        </header>

        {/* Main Bridge Interface */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}>
          {/* From Chain */}
          <div style={{
            background: '#f8f9ff',
            borderRadius: '16px',
            padding: '24px',
            margin: '16px 0',
            border: '2px solid #e8eaff'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                background: '#9945FF'
              }}>
                🟣
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>Solana Network</div>
                <div style={{ color: '#666', fontSize: '14px' }}>Source Chain</div>
              </div>
            </div>
            
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '16px',
              margin: '16px 0',
              border: '1px solid #e8eaff'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <span>Token: SOL (Solana)</span>
                <span style={{ fontWeight: '600' }}>
                  Balance: {balance ? `${parseFloat(balance).toFixed(4)} SOL` : 'Loading...'}
                </span>
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>
                Available: ${balance ? (parseFloat(balance) * solPrice).toFixed(2) : '0.00'}
              </div>
            </div>

            <div style={{ margin: '16px 0' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600'
              }}>
                Amount to Bridge:
              </label>
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                margin: '16px 0'
              }}>
                <input
                  type="number"
                  step="0.001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '16px',
                    border: '2px solid #e8eaff',
                    borderRadius: '12px',
                    fontSize: '18px',
                    fontWeight: '600',
                    background: 'white',
                    transition: 'border-color 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#9945FF'}
                  onBlur={(e) => e.target.style.borderColor = '#e8eaff'}
                />
                <button
                  onClick={setMaxAmount}
                  style={{
                    background: '#14F195',
                    color: 'white',
                    border: 'none',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#0FD186'}
                  onMouseOut={(e) => e.target.style.background = '#14F195'}
                >
                  MAX
                </button>
              </div>
              <div style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
                USD Value: ≈ ${usdValue.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Bridge Arrow */}
          <div style={{ textAlign: 'center', margin: '24px 0', position: 'relative' }}>
            <div style={{
              background: 'linear-gradient(45deg, #9945FF, #14F195)',
              color: 'white',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              animation: 'pulse 2s infinite'
            }}>
              ⬇
            </div>
          </div>

          {/* To Chain */}
          <div style={{
            background: '#f8f9ff',
            borderRadius: '16px',
            padding: '24px',
            margin: '16px 0',
            border: '2px solid #e8eaff'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                background: '#627EEA'
              }}>
                🔷
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>Ethereum Network</div>
                <div style={{ color: '#666', fontSize: '14px' }}>Sepolia Testnet</div>
              </div>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '16px',
              margin: '16px 0',
              border: '1px solid #e8eaff'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ marginBottom: '4px' }}>Token: wSOL (Wrapped SOL)</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Contract: <span style={{
                    fontFamily: 'Courier New, monospace',
                    background: '#f8f9fa',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}>
                    0xba82C80E13beDdAE290edf6b016d7f981e43431f
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>You will receive: ~{receiveAmount.toFixed(3)} wSOL</span>
                <span>≈ ${receiveUSD.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <div style={{ fontWeight: '600', marginBottom: '8px' }}>Recipient Address:</div>
              <input
                type="text"
                placeholder="Ethereum Address (0x...)"
                value={ethAddress}
                onChange={(e) => setEthAddress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e8eaff',
                  borderRadius: '8px',
                  fontFamily: 'Courier New, monospace',
                  fontSize: '14px',
                  background: 'white',
                  transition: 'border-color 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#9945FF'}
                onBlur={(e) => e.target.style.borderColor = '#e8eaff'}
              />
            </div>
          </div>

          {/* Transaction Breakdown */}
          <div style={{
            background: '#fff8e6',
            border: '2px solid #ffeaa7',
            borderRadius: '12px',
            padding: '20px',
            margin: '20px 0'
          }}>
            <div style={{
              fontWeight: '600',
              marginBottom: '12px',
              color: '#d68910'
            }}>
              💰 Transaction Breakdown
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              margin: '8px 0',
              padding: '4px 0'
            }}>
              <span>Bridge Fee:</span>
              <span>{bridgeFee} SOL (~${(bridgeFee * solPrice).toFixed(2)})</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              margin: '8px 0',
              padding: '4px 0'
            }}>
              <span>Ethereum Gas Fee:</span>
              <span>~$8.50</span>
            </div>
            <div style={{
              borderBottom: '1px solid #d68910',
              margin: '12px 0'
            }}></div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              margin: '8px 0',
              padding: '4px 0',
              fontWeight: '600'
            }}>
              <span>Total You Pay:</span>
              <span>{(amountNum + bridgeFee).toFixed(3)} SOL + $8.50 gas</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              margin: '8px 0',
              padding: '4px 0',
              fontWeight: '600'
            }}>
              <span>Total You Receive:</span>
              <span>{receiveAmount.toFixed(3)} wSOL</span>
            </div>
            <div style={{
              marginTop: '12px',
              fontSize: '14px',
              color: '#666'
            }}>
              <div>Exchange Rate: 1 SOL = 0.995 wSOL</div>
              <div>Estimated Time: 15-20 minutes</div>
              <div>Required Confirmations: 12 blocks</div>
            </div>
          </div>

          {/* Bridge Button */}
          <button
            onClick={handleLockSol}
            disabled={loading || !wallet.connected}
            style={{
              width: '100%',
              background: loading || !wallet.connected 
                ? '#ccc' 
                : 'linear-gradient(45deg, #9945FF, #14F195)',
              color: 'white',
              border: 'none',
              padding: '20px',
              borderRadius: '16px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: loading || !wallet.connected ? 'not-allowed' : 'pointer',
              margin: '24px 0',
              transition: 'transform 0.2s',
              transform: loading || !wallet.connected ? 'none' : 'translateY(0)'
            }}
            onMouseOver={(e) => {
              if (!loading && wallet.connected) {
                e.target.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading && wallet.connected) {
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            {loading ? '🔄 Bridging in Progress...' : `🌉 BRIDGE ${amountNum.toFixed(1)} SOL`}
          </button>

          {/* Transaction Status */}
          {showStatus && (
            <div style={{
              background: '#e8f5e8',
              border: '2px solid #a8d8a8',
              borderRadius: '12px',
              padding: '20px',
              margin: '20px 0'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '16px' }}>🔄 Transaction Status</div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '12px 0',
                padding: '8px 0'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  background: '#2ecc71',
                  color: 'white'
                }}>
                  ✓
                </div>
                <div>
                  <div>SOL sent from Solana</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    TX: 4xK9mN... <a href="#" style={{ color: '#9945FF' }}>View on Solscan</a>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '12px 0',
                padding: '8px 0'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  background: '#f39c12',
                  color: 'white'
                }}>
                  ⏳
                </div>
                <div style={{ flex: 1 }}>
                  <div>Processing bridge (8/12 confirmations)</div>
                  <div style={{
                    background: '#e9ecef',
                    borderRadius: '10px',
                    height: '8px',
                    margin: '8px 0',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: 'linear-gradient(45deg, #9945FF, #14F195)',
                      height: '100%',
                      width: '67%',
                      transition: 'width 0.3s'
                    }}></div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Estimated: 8 minutes remaining</div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '12px 0',
                padding: '8px 0'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  background: '#95a5a6',
                  color: 'white'
                }}>
                  ⏳
                </div>
                <div>
                  <div>wSOL delivery to Ethereum</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Will appear in your wallet automatically</div>
                </div>
              </div>
            </div>
          )}

          {/* Warning Section */}
          <div style={{
            background: '#fff3cd',
            border: '2px solid #ffeaa7',
            borderRadius: '12px',
            padding: '20px',
            margin: '20px 0'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '12px' }}>⚠️ Important Information</div>
            <div style={{
              background: '#fff',
              padding: '12px',
              borderRadius: '8px',
              margin: '8px 0'
            }}>
              <strong>🧪 TESTNET MODE</strong> - Using Sepolia Ethereum testnet
            </div>
            <div style={{ margin: '12px 0' }}>
              <strong>📝 After bridging:</strong>
              <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                <li>wSOL tokens will appear in your Ethereum wallet</li>
                <li>You may need to manually add the token contract</li>
                <li>Symbol: wSOL, Decimals: 18</li>
              </ul>
            </div>
            <div>
              <strong>🚨 Security Reminders:</strong>
              <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                <li>Double-check recipient address</li>
                <li>Transactions cannot be reversed</li>
                <li>Keep transaction hash for tracking</li>
                <li>Only bridge to compatible Ethereum addresses</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}