// components/EthereumWsolBalance.tsx
import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';

// WSOL token contract address on Sepolia (you'll need to replace with actual address)
const WSOL_CONTRACT_ADDRESS = '0xFe58E38FF0bE0055551AAd2699287D81461c31E0'; // Replace with actual WSOL contract


// Standard ERC-20 ABI for balanceOf and decimals
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
  const WSOL_DECIMALS: number  = 9;

  // Read WSOL balance
  const { 
    data: balance, 
    isError: balanceError,
    isLoading: balanceLoading, 
    refetch: refetchBalance 
  } = useReadContract<bigint>({
    address: WSOL_CONTRACT_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
        enabled: !!address && isConnected,
    },
  });

  // Read WSOL decimals
  const decimals = WSOL_DECIMALS;

  // Read token symbol to confirm it's WSOL
  const { data: symbol } = useReadContract({
    address: WSOL_CONTRACT_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'symbol',
    query:{
        enabled: true,
    },
  });

  useEffect(() => {
    setWsolBalance(balance ? formatUnits(balance, WSOL_DECIMALS) : '0');
  }, [balance]);

  /*useEffect(() => {
    if (balance && decimals) {
      const formattedBalance = formatUnits(balance as bigint, decimals as number);
      setWsolBalance(formattedBalance);
    } else {
      setWsolBalance('0');
    }
  }, [balance, decimals]);*/

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