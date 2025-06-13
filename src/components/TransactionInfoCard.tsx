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
        return <CheckCircle className="text-green-500" size={18} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={18} />;
      case 'failed':
        return <AlertCircle className="text-red-500" size={18} />;
      default:
        return null;
    }
  };
  return (
    <div className="bridge-details">
      <div className="bridge-header">
        <div className="bridge-title">
          <span className="icon">🌉</span>
          {info.network.network} Bridge
          <StatusIcon />
        </div>
        <button 
          className="details-toggle"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? '− Hide Details' : '+ Show Details'}
        </button>
      </div>

      <div className="transaction-amounts">
        <div className="amount-box">
          <div className="amount-label">
            <span>📤 You Send</span>
          </div>
          <div className="amount-value">
            {formatAmount(info.transaction.inputAmount)} SOL
          </div>
        </div>

        <div className="bridge-arrow">
          <div className="arrow-icon">⭣</div>
        </div>

        <div className="amount-box">
          <div className="amount-label">
            <span>📥 You Receive</span>
          </div>
          <div className="amount-value receive">
            {formatAmount(info.transaction.outputAmount)} {info.token.symbol}
          </div>
        </div>
      </div>

      {/* Basic Info */}      <div className="network-info">
        <div className="network-icon">Ξ</div>
        <div className="network-details">
          <div className="network-name">Ethereum Network</div>
          <div className="network-type">{info.network.testnet}</div>
        </div>
      </div>

      {/* Details Section */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Bridge Fee</span>
            <span>{info.fees.bridgeFee.toFixed(6)} SOL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Gas Fee</span>
            <span>{info.fees.gasFee.toFixed(6)} SOL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total Fees</span>
            <span>{info.fees.totalFees.toFixed(6)} SOL</span>
          </div>

          <div className="mt-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Recipient Address</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">
                  {info.addresses.recipientAddress.slice(0, 6)}...{info.addresses.recipientAddress.slice(-4)}
                </span>
                {info.ui.canCopy && (
                  <button 
                    onClick={() => copyToClipboard(info.addresses.recipientAddress)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {copied ? 'Copied!' : <Copy size={16} />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {info.metadata.transactionHash && (
            <div className="mt-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Transaction</span>
                <a 
                  href={info.metadata.blockExplorerLink!} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
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
          className="mt-4 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Confirm Transaction
        </button>
      )}
    </div>
  );
}