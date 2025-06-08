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
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg flex items-center gap-2">
          <StatusIcon />
          {info.network.network} Bridge
        </h3>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:underline"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Basic Info */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-500">You send</span>
          <span className="font-medium">
            {info.transaction.inputAmount.toFixed(6)} SOL
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">You receive</span>
          <span className="font-medium">
            {info.transaction.outputAmount.toFixed(6)} {info.token.symbol}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Network</span>
          <span>{info.network.testnet}</span>
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