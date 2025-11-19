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
        return <CheckCircle className="status-icon completed" size={18} />;
      case 'pending':
        return <Clock className="status-icon pending" size={18} />;
      case 'failed':
        return <AlertCircle className="status-icon failed" size={18} />;
      default:
        return null;
    }
  };

  return (
    <div className="transaction-card">
      <div className="transaction-header">
        <div className="transaction-title">
          <span className="bridge-icon">🌉</span>
          {info.network.network} Bridge
          <StatusIcon />
        </div>
        <button 
          className="toggle-details"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? '− Hide Details' : '+ Show Details'}
        </button>
      </div>

      <div className="amounts-container">
        <div className="amount-box">
          <div className="amount-label">
            <span>📤</span> You Send
          </div>
          <div className="amount-value">
            {formatAmount(info.transaction.inputAmount)} SOL
          </div>
        </div>

        <div className="bridge-arrow">
          <div className="arrow-line"></div>
          <div className="arrow-icon">
            ⭣
          </div>
        </div>

        <div className="amount-box">
          <div className="amount-label">
            <span>📥</span> You Receive
          </div>
          <div className="amount-value receive">
            {formatAmount(info.transaction.outputAmount)} {info.token.symbol}
          </div>
        </div>
      </div>

      <div className="network-info">
        <div className="network-icon">
          Ξ
        </div>
        <div className="network-details">
          <div className="network-name">Ethereum Network</div>
          <div className="network-type">{info.network.testnet}</div>
        </div>
      </div>

      {showDetails && (
        <div className="details-section">
          <div className="fee-row">
            <span>Bridge Fee</span>
            <span>{info.fees.bridgeFee.toFixed(6)} SOL</span>
          </div>
          <div className="fee-row">
            <span>Gas Fee</span>
            <span>{info.fees.gasFee.toFixed(6)} SOL</span>
          </div>
          <div className="fee-row total">
            <span>Total Fees</span>
            <span>{info.fees.totalFees.toFixed(6)} SOL</span>
          </div>

          <div className="address-section">
            <div className="address-label">Recipient Address</div>
            <div className="address-value">
              <span>
                {info.addresses.recipientAddress.slice(0, 6)}...{info.addresses.recipientAddress.slice(-4)}
              </span>
              {info.ui.canCopy && (
                <button 
                  className="copy-button"
                  onClick={() => copyToClipboard(info.addresses.recipientAddress)}
                >
                  {copied ? 'Copied!' : <Copy size={16} />}
                </button>
              )}
            </div>
          </div>

          {info.metadata.blockExplorerLink && (
            <div className="tx-link">
              <div className="tx-label">Transaction</div>
              <a 
                href={info.metadata.blockExplorerLink} 
                target="_blank"
                rel="noopener noreferrer"
                className="view-link"
              >
                View <ExternalLink size={16} />
              </a>
            </div>
          )}
        </div>
      )}

      {info.ui.showConfirmButton && onConfirm && (
        <button
          className="confirm-button"
          onClick={onConfirm}
        >
          Confirm Transaction
        </button>
      )}
    </div>
  );
}