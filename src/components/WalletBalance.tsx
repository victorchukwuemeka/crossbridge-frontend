import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { walletSolBalance } from '../solana/walletSolBalance';

interface WalletBalanceProps {
  onBalanceUpdate?: (balance: string | null) => void;
}

export function WalletBalance({ onBalanceUpdate }: WalletBalanceProps) {
  const wallet = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!wallet.connected || !wallet.publicKey) {
      setBalance(null);
      setError(null);

      if (onBalanceUpdate) {
        onBalanceUpdate(null); // <--- Add this line
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const bal = await walletSolBalance(wallet);
      setBalance(bal);
      if (onBalanceUpdate) {
        onBalanceUpdate(bal);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch balance";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [wallet, onBalanceUpdate]);

 useEffect(() => {
  // Always clear balance first when wallet changes
  if (!wallet.connected || !wallet.publicKey) {
    setBalance(null);
    setError(null);
    if (onBalanceUpdate) {
      onBalanceUpdate(null);
    }
    return; // prevent running fetchBalance when not connected
  }

  // If connected, fetch balance
  fetchBalance();
}, [wallet.connected, wallet.publicKey]); // ← only depend on wallet state



  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      padding: '1rem'
    }}>
      {/* Main Balance Card */}
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
          <div style={{ fontSize: '14px', color: '#ccc' }}>Wallet Balance</div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: '#ccc',
            padding: '6px 12px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              background: wallet.connected ? '#14F195' : '#ff4757',
              borderRadius: '50%',
              display: 'inline-block'
            }}></span>
            {wallet.connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        {/* Balance Display */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          textAlign: 'center'
        }}>
          {loading ? (
            <div style={{ color: '#ccc', fontSize: '1.1rem' }}>Loading balance...</div>
          ) : error ? (
            <div style={{ color: '#ff4757', fontSize: '1.1rem' }}>Error: {error}</div>
          ) : balance ? (
            <div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#fff',
                marginBottom: '0.5rem'
              }}>
                {parseFloat(balance).toFixed(4)}
              </div>
              <div style={{
                fontSize: '1.1rem',
                color: '#14F195',
                fontWeight: '600'
              }}>
                SOL
              </div>
            </div>
          ) : (
            <div style={{ color: '#ccc', fontSize: '1.1rem' }}>
              {wallet.connected ? 'No balance found' : 'Connect wallet to view balance'}
            </div>
          )}
        </div>

        {/* Wallet Address */}
        {wallet.connected && wallet.publicKey && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#ccc' }}>Wallet Address</span>
            </div>
            <div style={{
              fontSize: '14px',
              fontFamily: 'monospace',
              color: '#fff',
              wordBreak: 'break-all'
            }}>
              {wallet.publicKey.toString()}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <button
  onClick={fetchBalance}
  disabled={loading || !wallet.connected}
  style={{
    width: '100%',
    padding: '14px 24px',
    background: 'linear-gradient(90deg, #c6ee12, #00D1FF)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: loading || !wallet.connected ? 'not-allowed' : 'pointer',
    opacity: loading || !wallet.connected ? 0.6 : 1,
    transition: 'all 0.3s ease'
  }}
  onMouseEnter={(e) => {
    if (!loading && wallet.connected) {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 6px 20px rgba(198, 238, 18, 0.3)';
    }
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  }}
>
  {loading ? 'Refreshing...' : 'Refresh Balance'}
</button>
      </div>
    </div>
  );
}