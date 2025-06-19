import { useState } from 'react';
import { Copy, ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { CompleteTransactionInfo } from '../ethereum/ethereumWsolContract';

interface TransactionInfoCardProps {
  info: CompleteTransactionInfo;
  onConfirm?: () => void;
}

export function TransactionInfoCard({ info, onConfirm }: TransactionInfoCardProps) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const formatAmount = (amount: number) => amount.toFixed(6);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const StatusIcon = () => {
    switch (info.ui.statusIndicator) {
      case 'completed':
        return <CheckCircle style={{ color: '#14F195' }} size={18} />;
      case 'pending':
        return <Clock style={{ color: '#FFA500' }} size={18} />;
      case 'failed':
        return <AlertCircle style={{ color: '#ff4757' }} size={18} />;
      default:
        return null;
    }
  };

  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      padding: '1rem'
    }}>
      {/* Main Transaction Card */}
      <div style={{
        background: 'rgba(30, 30, 30, 0.95)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        padding: '1.25rem'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#fff'
          }}>
            <span>🌉</span>
            {info.network.network} Bridge
            <StatusIcon />
          </div>
          <button 
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '12px',
              color: '#14F195',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px'
            }}
          >
            {showDetails ? '− Hide Details' : '+ Show Details'}
          </button>
        </div>

        {/* Transaction Amounts */}
        <div style={{
          display: 'grid',
          gap: '1.5rem',
          margin: '2rem 0',
          position: 'relative'
        }}>
          {/* Send Amount */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '1.5rem',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              color: '#ccc',
              fontSize: '13px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>📤 You Send</span>
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#fff'
            }}>
              {formatAmount(info.transaction.inputAmount)} SOL
            </div>
          </div>

          {/* Bridge Arrow */}
          <div style={{
            position: 'relative',
            height: '40px',
            margin: '1rem 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '2px',
              background: 'linear-gradient(90deg, rgba(153, 69, 255, 0.2), rgba(20, 241, 149, 0.2))'
            }}></div>
            <div style={{
              background: 'linear-gradient(45deg, #9945FF, #14F195)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.25rem',
              position: 'relative',
              zIndex: 1
            }}>
              ⭣
            </div>
          </div>

          {/* Receive Amount */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '1.5rem',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              color: '#ccc',
              fontSize: '13px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>📥 You Receive</span>
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#14F195'
            }}>
              {formatAmount(info.transaction.outputAmount)} {info.token.symbol}
            </div>
          </div>
        </div>

        {/* Network Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '1rem 1.25rem',
          borderRadius: '16px',
          marginTop: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #627eea, #3c3c3d)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.25rem'
          }}>
            Ξ
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: '600' }}>Ethereum Network</div>
            <div style={{ color: '#ccc', fontSize: '13px' }}>{info.network.testnet}</div>
          </div>
        </div>

        {/* Details Section */}
        {showDetails && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              color: '#ccc',
              fontSize: '13px'
            }}>
              <span>Bridge Fee</span>
              <span>{info.fees.bridgeFee.toFixed(6)} SOL</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              color: '#ccc',
              fontSize: '13px'
            }}>
              <span>Gas Fee</span>
              <span>{info.fees.gasFee.toFixed(6)} SOL</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '8px',
              marginTop: '8px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontWeight: '500'
            }}>
              <span>Total Fees</span>
              <span>{info.fees.totalFees.toFixed(6)} SOL</span>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ color: '#ccc', fontSize: '13px' }}>Recipient Address</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    color: '#fff'
                  }}>
                    {info.addresses.recipientAddress.slice(0, 6)}...{info.addresses.recipientAddress.slice(-4)}
                  </span>
                  {info.ui.canCopy && (
                    <button 
                      onClick={() => copyToClipboard(info.addresses.recipientAddress)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ccc',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      {copied ? 'Copied!' : <Copy size={16} />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {info.metadata.blockExplorerLink && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#ccc', fontSize: '13px' }}>Transaction</span>
                  <a 
                    href={info.metadata.blockExplorerLink} 
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#14F195',
                      textDecoration: 'none',
                      fontSize: '13px'
                    }}
                  >
                    View <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {info.ui.showConfirmButton && onConfirm && (
          <button
            onClick={onConfirm}
            style={{
              width: '100%',
              padding: '14px',
              marginTop: '1rem',
              background: 'linear-gradient(45deg, #9945FF, #14F195)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
          >
            Confirm Transaction
          </button>
        )}
      </div>
    </div>
  );
}