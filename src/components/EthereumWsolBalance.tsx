// components/EthereumWsolBalance.tsx
import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useChainId } from 'wagmi';
import { formatUnits } from 'viem';

// WSOL token configuration
const WSOL_CONTRACT_ADDRESS = '0x81CAD7CC4D6e972b598674201d8d33efD8973445' as const;
const WSOL_DECIMALS = 9; // WSOL uses 9 decimals
const SEPOLIA_CHAIN_ID = 11155111; 

// ERC-20 ABI for balance and symbol
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
] as const;

interface EthereumWsolBalanceProps {
  className?: string;
  showRefreshButton?: boolean;
  precision?: number;
}

export function EthereumWsolBalance({ 
  className = '',
  showRefreshButton = false,
  precision = 4 
}: EthereumWsolBalanceProps = {}) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [formattedBalance, setFormattedBalance] = useState('0');

  const isOnSepoliaNetwork = chainId === SEPOLIA_CHAIN_ID;

  // Fetch token balance
  const {
    data: balance,
    isError: balanceError,
    isLoading: balanceLoading,
    refetch: refetchBalance,
    error: balanceErrorDetails
  } = useReadContract({
    address: WSOL_CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
      
      retry: 3,
      retryDelay: 1000,
    },
  });

  // Fetch token symbol
  const { 
    data: symbol,
    isLoading: symbolLoading 
  } = useReadContract({
    address: WSOL_CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'symbol',
    query: { 
      enabled: true,
      retry: 2,
    },
  });

  // Debug logging
  useEffect(() => {
    console.log('=== WSOL Balance Debug ===');
    console.log('Address:', address);
    console.log('IsConnected:', isConnected);
    console.log('Balance (raw):', balance);
    console.log('Balance type:', typeof balance);
    console.log('Balance loading:', balanceLoading);
    console.log('Balance error:', balanceError);
    console.log('Symbol:', symbol);
    console.log('========================');
    console.log('Current Chain ID:', chainId);
    console.log('Is Sepolia Network:', isOnSepoliaNetwork);
    console.log('Expected Chain ID (Sepolia):', SEPOLIA_CHAIN_ID);
  }, [address, isConnected, balance, balanceLoading, balanceError, symbol, chainId, isOnSepoliaNetwork, SEPOLIA_CHAIN_ID]);

  // Format balance when it changes
  useEffect(() => {
    if (balance !== undefined && balance !== null && typeof balance === 'bigint') {
      console.log('Balance is not null/undefined');
      console.log('Balance type check:', typeof balance);
      console.log(balance);
      const formatted = formatUnits(balance, WSOL_DECIMALS);
      console.log(formatted);
      setFormattedBalance(formatted);
    } else {
      setFormattedBalance('0');
    }
  }, [balance]);

  const handleRefresh = async () => {
    try {
      await refetchBalance();
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  };

  const formatDisplayBalance = (balance: string): string => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    return num.toFixed(precision);
  };

  // Render states
  if (!isConnected) {
    return (
      <div style={{ 
        padding: '12px', 
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem'
      }}>
        Connect your wallet to view WSOL balance
      </div>
    );
  }
   
  // Network check removed - handled by parent modal

  if (balanceLoading || symbolLoading) {
    return (
      <div style={{ 
        padding: '12px', 
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem'
      }}>
        Loading WSOL balance...
      </div>
    );
  }

  if (balanceError) {
    // Don't show error if on wrong network - parent handles it
    if (!isOnSepoliaNetwork) {
      return null;
    }
    
    return (
      <div style={{
        padding: '12px',
        background: 'rgba(255, 82, 82, 0.1)',
        border: '1px solid rgba(255, 82, 82, 0.3)',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <div style={{ 
          color: 'var(--error)', 
          fontSize: '0.9rem',
          marginBottom: '8px'
        }}>
          Error loading balance
        </div>
        {balanceErrorDetails && (
          <div style={{ 
            fontSize: '0.8rem', 
            color: 'var(--text-secondary)',
            marginBottom: '12px'
          }}>
            {balanceErrorDetails.message || 'Unknown error'}
          </div>
        )}
        <button 
          onClick={handleRefresh}
          style={{
            padding: '8px 16px',
            background: 'rgba(255, 82, 82, 0.1)',
            border: '1px solid var(--error)',
            borderRadius: '6px',
            color: 'var(--error)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Don't show balance if on wrong network
  if (!isOnSepoliaNetwork) {
    return null;
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '8px 0'
    }}>
      <div style={{ 
        fontSize: '0.85rem', 
        color: 'var(--text-secondary)' 
      }}>
        Contract Balance
      </div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'baseline', 
        gap: '6px' 
      }}>
        <span style={{ 
          fontSize: '1rem', 
          fontWeight: 700, 
          color: 'var(--text)' 
        }}>
          {formatDisplayBalance(formattedBalance)}
        </span>
        <span style={{ 
          fontSize: '0.85rem', 
          fontWeight: 600, 
          color: 'var(--text-secondary)' 
        }}>
          {(symbol as string) || 'WSOL'}
        </span>
      </div>
    </div>
  );
}