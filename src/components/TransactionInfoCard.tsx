import { useState } from 'react';
import { Copy, ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { CompleteTransactionInfo } from '../ethereum/ethereumWsolContract';
import styles from '../pages/BridgePage.module.css'; // module CSS

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
        return <CheckCircle className={`${styles.statusIcon} ${styles.completed}`} size={18} />;
      case 'pending':
        return <Clock className={`${styles.statusIcon} ${styles.pending}`} size={18} />;
      case 'failed':
        return <AlertCircle className={`${styles.statusIcon} ${styles.failed}`} size={18} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.bridgeStatus}>
        <div className={styles.transactionHeader}>
          <div className={styles.transactionTitle}>
            <span className={styles.bridgeIcon}>🌉</span>
            {info.network.network} Bridge
            <StatusIcon />
          </div>
          <button 
            className={styles.toggleDetails}
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? '− Hide Details' : '+ Show Details'}
          </button>
        </div>

        <div className={styles.amountsContainer}>
          <div className={styles.amountBox}>
            <div className={styles.amountLabel}>
              <span>📤</span> You Send
            </div>
            <div className={styles.amountValue}>
              {formatAmount(info.transaction.inputAmount)} SOL
            </div>
          </div>

          <div className={styles.bridgeArrow}>
            <div className={styles.arrowLine}></div>
            <div className={styles.arrowIcon}>⭣</div>
          </div>

          <div className={styles.amountBox}>
            <div className={styles.amountLabel}>
              <span>📥</span> You Receive
            </div>
            <div className={`${styles.amountValue} ${styles.receive}`}>
              {formatAmount(info.transaction.outputAmount)} {info.token.symbol}
            </div>
          </div>
        </div>

        <div className={styles.networkInfo}>
          <div className={styles.networkIcon}>Ξ</div>
          <div className={styles.networkDetails}>
            <div className={styles.networkName}>Ethereum Network</div>
            <div className={styles.networkType}>{info.network.testnet}</div>
          </div>
        </div>

        {showDetails && (
          <div className={styles.detailsSection}>
            <div className={styles.feeRow}>
              <span>Bridge Fee</span>
              <span>{info.fees.bridgeFee.toFixed(6)} SOL</span>
            </div>
            <div className={styles.feeRow}>
              <span>Gas Fee</span>
              <span>{info.fees.gasFee.toFixed(6)} SOL</span>
            </div>
            <div className={`${styles.feeRow} ${styles.total}`}>
              <span>Total Fees</span>
              <span>{info.fees.totalFees.toFixed(6)} SOL</span>
            </div>

            <div className={styles.addressSection}>
              <div className={styles.addressLabel}>Recipient Address</div>
              <div className={styles.addressValue}>
                <span>
                  {info.addresses.recipientAddress.slice(0, 6)}...
                  {info.addresses.recipientAddress.slice(-4)}
                </span>
                {info.ui.canCopy && (
                  <button 
                    className={styles.copyButton}
                    onClick={() => copyToClipboard(info.addresses.recipientAddress)}
                  >
                    {copied ? 'Copied!' : <Copy size={16} />}
                  </button>
                )}
              </div>
            </div>

            {info.metadata.blockExplorerLink && (
              <div className={styles.txLink}>
                <div className={styles.txLabel}>Transaction</div>
                <a 
                  href={info.metadata.blockExplorerLink} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.viewLink}
                >
                  View <ExternalLink size={16} />
                </a>
              </div>
            )}
          </div>
        )}

        {info.ui.showConfirmButton && onConfirm && (
          <button className={styles.bridgeButton} onClick={onConfirm}>
            Confirm Transaction
          </button>
        )}
      </div>
    </div>
  );
}
