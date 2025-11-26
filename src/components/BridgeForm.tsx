import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { lockSol, initializeBridge } from '../solana/lockSol';
import { WalletBalance } from './WalletBalance';
import styles from '../pages/BridgePage.module.css';

export interface BridgeFormProps {
  onTransactionComplete: () => void;
  balance?: number | null;
}

const BRIDGE_FEE = 0.001;
const NETWORK_FEE = 0.0005;
const TOTAL_FEE = BRIDGE_FEE + NETWORK_FEE;

const NETWORKS = [
  { id: 1, name: "Ethereum", symbol: "ETH" },
  { id: 121, name: "Base", symbol: "BASE" },
  { id: 137, name: "Polygon", symbol: "MATIC" },
];

export default function BridgeForm({ onTransactionComplete }: BridgeFormProps) {
  const wallet = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [ethAddress, setEthAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userModifiedAmount, setUserModifiedAmount] = useState(false);
  const [targetNetwork, setTargetNetwork] = useState(NETWORKS[0].id);

  const setMaxAmount = () => {
    if (!balance) return;
    setAmount(parseFloat(balance).toFixed(6));
    setUserModifiedAmount(true);
  };

  useEffect(() => {
    if (balance === null) {
      setAmount('');
      setUserModifiedAmount(false);
    }
  }, [balance]);

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setUserModifiedAmount(true);
  };

  const handleLockSol = async () => {
    setError('');
    if (!wallet.connected || !wallet.publicKey) return setError('Connect wallet first');
    const solAmount = parseFloat(amount);
    if (isNaN(solAmount) || solAmount <= 0) return setError('Enter a valid SOL amount');
    if (solAmount < BRIDGE_FEE) return setError(`Amount must be at least ${BRIDGE_FEE} SOL`);
    if (!ethAddress.trim()) return setError('Enter a recipient address');
    const requiredBalance = solAmount - TOTAL_FEE;
    if (balance && requiredBalance > parseFloat(balance)) return setError(`Insufficient balance`);
    try {
      setLoading(true);
      await initializeBridge(wallet);
      const sig = await lockSol(wallet, solAmount * 1e9, ethAddress, targetNetwork);
      alert(`Locked ${amount} SOL\nTx: ${sig}`);
      setAmount('');
      setEthAddress('');
      setUserModifiedAmount(false);
      onTransactionComplete();
    } catch (err) {
      setError('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      {/* Wallet Connect */}
      <div className={styles.walletSection}>
        <h2 className={styles.sectionTitle}>Connect Your Wallet</h2>
        <WalletMultiButton className={styles.walletButton} />
      </div>

      {/* Balance */}
      <div className={`${styles.card} ${styles.cardHover}`}>
        <WalletBalance onBalanceUpdate={setBalance} />
      </div>

      {/* Amount Input */}
      <div className={styles.formGroup}>
        <label className={styles.inputLabel}>Amount to Bridge</label>
        <div className={styles.inputGroup}>
          <input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            disabled={!wallet.connected || loading || balance === null}
            className={styles.inputField}
          />
          <button
            onClick={setMaxAmount}
            className={styles.maxButton}
            disabled={!wallet.connected || loading}
          >
            MAX
          </button>
        </div>
      </div>

      {/* Network Selector */}
      <div className={styles.formGroup}>
        <label className={styles.inputLabel}>Destination Network</label>
        <div className={styles.networkCards}>
          {NETWORKS.map(net => (
            <div
              key={net.id}
              className={`${styles.networkCard} ${targetNetwork === net.id ? styles.selected : ''}`}
              onClick={() => !loading && wallet.connected && setTargetNetwork(net.id)}
            >
              {net.name}
              {targetNetwork === net.id && <div className={styles.selectedIndicator} />}
            </div>
          ))}
        </div>
      </div>

      {/* Recipient Address */}
      <div className={styles.formGroup}>
        <label className={styles.inputLabel}>Recipient Address</label>
        <input
          type="text"
          placeholder="0x... or Base / Polygon address"
          value={ethAddress}
          onChange={(e) => setEthAddress(e.target.value)}
          disabled={!wallet.connected || loading}
          className={styles.inputField}
        />
      </div>

      {/* Fees */}
      <div className={styles.feeSummary}>
        <div className={styles.feeRow}><span>Bridge Fee</span><span>{BRIDGE_FEE} SOL</span></div>
        <div className={styles.feeRow}><span>Network Fee</span><span>{NETWORK_FEE} SOL</span></div>
        <div className={`${styles.feeRow} ${styles.feeTotal}`}>
          <span>Receivable</span>
          <span>{amount ? (Math.max(0, parseFloat(amount) - TOTAL_FEE)).toFixed(6) : '0.000000'} wSOL</span>
        </div>
      </div>

      {/* Error */}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* Action Button */}
      <button
        className={styles.actionButton}
        onClick={handleLockSol}
        disabled={loading || !wallet.connected || !amount || !ethAddress}
      >
        {loading ? 'Processing...' : 'Bridge Tokens'}
      </button>
    </div>
  );
}