// components/EthereumWsolBalance.tsx
import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';

// WSOL token contract address on Sepolia
const WSOL_CONTRACT_ADDRESS = '0xFe58E38FF0bE0055551AAd2699287D81461c31E0'; // Replace if needed

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
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
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

export function EthereumWsolBalance() {
  const { address, isConnected } = useAccount();
  const [wsolBalance, setWsolBalance] = useState<string>('0');
  const WSOL_DECIMALS: number = 9;

  // Read WSOL balance
  const {
    data: balance,
    isError: balanceError,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useReadContract({
    address: WSOL_CONTRACT_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Read token symbol
  const { data: symbol } = useReadContract({
    address: WSOL_CONTRACT_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'symbol',
    query: {
      enabled: true,
    },
  });

  useEffect(() => {
    setWsolBalance(balance ? formatUnits(balance as bigint, WSOL_DECIMALS) : '0');
  }, [balance]);

  const handleRefresh = () => {
    refetchBalance();
  };

  if (!isConnected) {
    return (
      <div className="eth-wsol-balance">
        <span>ETH WSOL: Not connected</span>
      </div>
    );
  }

  if (balanceLoading) {
    return (
      <div className="eth-wsol-balance">
        <span>ETH WSOL: Loading...</span>
      </div>
    );
  }

  if (balanceError) {
    return (
      <div className="eth-wsol-balance error">
        <span>ETH WSOL: Error loading balance</span>
        <button onClick={handleRefresh} className="refresh-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="eth-wsol-balance">
      <div className="balance-info">
        <span>{(symbol as string) || 'WSOL'}</span>
        <span className="balance-value">{parseFloat(wsolBalance).toFixed(4)}</span>
      </div>
      <button onClick={handleRefresh} className="refresh-button">
        ↻
      </button>
    </div>
  );
}
