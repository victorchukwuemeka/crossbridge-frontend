import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { walletSolBalance } from '../solana/walletSolBalance';

export function WalletBalance() {
  const wallet = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!wallet.connected || !wallet.publicKey) {
      setBalance(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const bal = await walletSolBalance(wallet);
      setBalance(bal);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch balance";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

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
            padding: '14px',
            background: loading || !wallet.connected ? 
              'rgba(255, 255, 255, 0.05)' : 
              'linear-gradient(45deg, #9945FF, #14F195)',
            color: loading || !wallet.connected ? '#666' : 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '500',
            cursor: loading || !wallet.connected ? 'not-allowed' : 'pointer',
            transition: 'transform 0.2s'
          }}
        >
          {loading ? 'Refreshing...' : '🔄 Refresh Balance'}
        </button>
      </div>

      {/* Info Footer */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: 'rgba(30, 30, 30, 0.8)',
        borderRadius: '12px',
        fontSize: '13px',
        color: '#ccc',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            background: '#14F195',
            borderRadius: '50%'
          }}></span>
          <span>Real-time balance updates</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            background: '#14F195',
            borderRadius: '50%'
          }}></span>
          <span>Connected to Solana Devnet</span>
        </div>
      </div>
    </div>
  );
}