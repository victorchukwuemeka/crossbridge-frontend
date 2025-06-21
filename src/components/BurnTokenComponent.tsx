import React, { useState } from 'react';
import {
  loadContract,
  validateBurn,
  estimateGasCost,
  prepareBurnTransaction,
  executeBurn,
  monitorTransaction
} from '../ethereum/tokenBurnService';
import { ABI } from '../ethereum/ABI';
import { ethers, BrowserProvider } from 'ethers';

const BurnTokenComponent = () => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  
  const CONTRACT_ADDRESS = '0xFe58E38FF0bE0055551AAd2699287D81461c31E0';
  const RPC_URL = 'https://rpc.sepolia.org';

  const handleConnectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsLoading(true);
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setUserAddress(accounts[0]); // Set the user's address
        setWalletConnected(true); // Set wallet as connected
        setError(''); // Clear any previous errors
      } catch (err) {
        console.error(err);
        setError('Failed to connect wallet');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Please install MetaMask or another wallet provider');
    }
  };

  const handleBurn = async () => {
    if (!amount || !userAddress) return;
    
    setIsLoading(true);
    setError('');
    setTxHash(''); // Clear previous transaction hash
    
    try {
      // Initialize provider and signer using the connected wallet
      const wallet_provider = new BrowserProvider(window.ethereum);
      console.log('Provider:', wallet_provider);
      
      const signer = await wallet_provider.getSigner(userAddress);
      console.log('Signer:', signer);
      
      // Load contract
      const contract = await loadContract(CONTRACT_ADDRESS, ABI, signer);
      
      // Validate burn
      const burnAmountWei = await validateBurn(contract, userAddress, amount, wallet_provider);
      
      // Estimate gas
      const { gasLimit, gasPrice } = await estimateGasCost(contract, burnAmountWei, wallet_provider);
      
      // Prepare transaction
      const transaction = await prepareBurnTransaction(
        contract,
        burnAmountWei,
        gasLimit,
        gasPrice,
        wallet_provider,
        userAddress
      );
      
      // Execute burn
      const hash = await executeBurn(transaction, signer);
      setTxHash(hash);
      
      // Monitor transaction
      await monitorTransaction(hash, wallet_provider);
      
      alert('Burn successful!');
      setAmount(''); // Clear amount after successful burn
      
    } catch (err) {
      console.error('Burn error:', err);
      setError((err as Error).message || 'Burn transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletConnected(false);
    setUserAddress('');
    setAmount('');
    setTxHash('');
    setError('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Burn WSOL Tokens</h2>
      
      {/* Wallet Connection Section */}
      {!walletConnected ? (
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={handleConnectWallet} 
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
          <p style={{ margin: '0', color: '#333' }}>
            <strong>Connected:</strong> {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
          </p>
          <button 
            onClick={handleDisconnectWallet}
            style={{
              marginTop: '5px',
              padding: '5px 10px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Disconnect
          </button>
        </div>
      )}

      {/* Burn Section */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount to burn"
          disabled={!walletConnected || isLoading}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        />
        
        <button 
          onClick={handleBurn} 
          disabled={isLoading || !amount || !walletConnected}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: walletConnected && amount && !isLoading ? '#2196F3' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: walletConnected && amount && !isLoading ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {isLoading ? 'Burning...' : 'Burn Tokens'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          borderRadius: '5px',
          marginBottom: '10px',
          border: '1px solid #ffcdd2'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Transaction Hash Display */}
      {txHash && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#e8f5e8', 
          color: '#2e7d32', 
          borderRadius: '5px',
          marginBottom: '10px',
          border: '1px solid #c8e6c9'
        }}>
          <strong>Transaction Hash:</strong> 
          <br />
          <a 
            href={`https://sepolia.etherscan.io/tx/${txHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#1976d2', wordBreak: 'break-all' }}
          >
            {txHash}
          </a>
        </div>
      )}

      {/* Instructions */}
      {!walletConnected && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#fff3e0', 
          color: '#ef6c00', 
          borderRadius: '5px',
          fontSize: '14px',
          border: '1px solid #ffcc02'
        }}>
          <strong>Instructions:</strong>
          <br />
          1. Connect your MetaMask wallet
          <br />
          2. Enter the amount of WSOL tokens to burn
          <br />
          3. Click "Burn Tokens" and confirm the transaction
        </div>
      )}
    </div>
  );
};

export default BurnTokenComponent;