// components/EthereumWsolBalance.tsx
import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useChainId } from 'wagmi';
import { formatUnits } from 'viem';

// WSOL token configuration
const WSOL_CONTRACT_ADDRESS = '0xFe58E38FF0bE0055551AAd2699287D81461c31E0' as const;
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
  showRefreshButton = true,
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
  }, [address, isConnected, balance, balanceLoading, balanceError, symbol,chainId,isOnSepoliaNetwork,SEPOLIA_CHAIN_ID]);

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
      <div className={`wsol-balance-container ${className}`}>
        <div className="wsol-balance-message">
          Connect your wallet to view WSOL balance
        </div>
      </div>
    );
  }
   
  //checking network
  if (!isOnSepoliaNetwork) {
    return (
      <div className={`wsol-balance-container ${className}`}>
        <div className="wsol-balance-error">
          <div>❌ Wrong Network</div>
          <div>Your wSOL tokens are on Sepolia testnet.</div>
          <div>Current network: Chain ID {chainId}</div>
          <div>Please switch to Sepolia testnet in your wallet.</div>
        </div>
      </div>
    );
  }


  if (balanceLoading || symbolLoading) {
    return (
      <div className={`wsol-balance-container ${className}`}>
        <div className="wsol-balance-loading">
          Loading WSOL balance...
        </div>
      </div>
    );
  }

  if (balanceError) {
    return (
      <div className={`wsol-balance-container ${className}`}>
        <div className="wsol-balance-error">
          <div>Error loading balance</div>
          {balanceErrorDetails && (
            <div className="error-details">
              {balanceErrorDetails.message || 'Unknown error'}
            </div>
          )}
          <button 
            onClick={handleRefresh}
            className="wsol-balance-retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`wsol-balance-container ${className}`}>
      <div className="wsol-balance-display">
        <div className="wsol-balance-info">
          <span className="wsol-symbol">{(symbol as string) || 'WSOL'}</span>
        
          <span className="wsol-amount">{formatDisplayBalance(formattedBalance)}</span>
        </div>
        {showRefreshButton && (
          <button 
            onClick={handleRefresh}
            className="wsol-balance-refresh-button"
            disabled={balanceLoading}
          >
            {balanceLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        )}
      </div>
    </div>
  );
}

