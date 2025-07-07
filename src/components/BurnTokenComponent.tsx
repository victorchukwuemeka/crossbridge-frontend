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
import { EthereumWsolBalance } from "./EthereumWsolBalance";

const BurnTokenComponent = () => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [gasfee, setGasFee] = useState('');
  const [solanaAddress, setSolanaAddress] = useState('');
  
  const CONTRACT_ADDRESS = '0x81CAD7CC4D6e972b598674201d8d33efD8973445';
  //const RPC_URL = 'https://rpc.sepolia.org';

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
  
  const checkEthBalance = async () => {
    try {
      const wallet_provider = new BrowserProvider(window.ethereum);
      const ethBalance = await wallet_provider.getBalance(userAddress);
      console.log('ETH Balance (wei):', ethBalance.toString());
      console.log('ETH Balance (ETH):', ethers.formatEther(ethBalance));
      return ethBalance;
    } catch (error) {
      console.error('Error checking ETH balance:', error);
      throw error;
    }
  }

  
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
      
       // Check ETH balance first
      const ethBalance = await checkEthBalance();
      console.log('the eth balance:',ethers.formatEther(ethBalance));
      // Load contract
      const contract = await loadContract(CONTRACT_ADDRESS, ABI, signer);
      
      // Validate burn
      const burnAmountWei = await validateBurn(
        contract,
        userAddress,
        solanaAddress,
        amount,
        wallet_provider,
        ethBalance
      );
      
      // Estimate gas
      const { gasLimit, gasPrice } = await estimateGasCost(contract, burnAmountWei,solanaAddress, wallet_provider);
      
      console.log('gas limit:', gasLimit);
      console.log('gas Price:', gasPrice);
      const totalPrice = gasLimit * gasPrice;
      console.log('total gas cost in (wie)', totalPrice.toString());
      console.log('total gas cost in (eth)', ethers.formatEther(totalPrice));
      //setGasFee('gasPrice');
      setGasFee(gasPrice.toString());
      // Prepare transaction
      const transaction = await prepareBurnTransaction(
        contract,
        burnAmountWei,
        solanaAddress,
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
    setSolanaAddress('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Burn WSOL Tokens</h2>
      <p>Your Wsol balance</p> <EthereumWsolBalance/>
      
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
      <div>
       <p>gasFee</p> {gasfee}
      </div>
       
      {/* Burn Section */}
      <div style={{ marginBottom: '20px' }}>

        <input
          type="text"
          value={solanaAddress}
          onChange={(e) => setSolanaAddress(e.target.value)}
          placeholder="Solana address (e.g., 5Fwc...xyz123)"
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
          disabled={isLoading || !amount || !walletConnected || !solanaAddress}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: walletConnected && amount && !solanaAddress && !isLoading? '#2196F3' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: walletConnected && amount && !isLoading && !solanaAddress? 'pointer' : 'not-allowed',
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