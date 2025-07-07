import React, { useState } from 'react';
import { Contract, ethers, BrowserProvider } from 'ethers';
import {
  loadContract,
  validateBurn,
  estimateGasCost,
  prepareBurnTransaction,
  executeBurn,
  monitorTransaction
} from '../ethereum/tokenBurnService';
import { ABI } from '../ethereum/ABI';
import { EthereumWsolBalance } from "./EthereumWsolBalance";

const BurnTokenComponent = () => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [gasFee, setGasFee] = useState('');

  const CONTRACT_ADDRESS = '0x990f31d4359Ee8745D479c873549F5eF44494435';

  const handleConnectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsLoading(true);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setUserAddress(accounts[0]);
        setWalletConnected(true);
        setError('');
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
      return await wallet_provider.getBalance(userAddress);
    } catch (error) {
      console.error('Error checking ETH balance:', error);
      throw error;
    }
  }

  const handleBurn = async () => {
    if (!amount || !userAddress) return;

    setIsLoading(true);
    setError('');
    setTxHash('');

    try {
      const wallet_provider = new BrowserProvider(window.ethereum);
      const signer = await wallet_provider.getSigner();
      const ethBalance = await checkEthBalance();

      const contract = await loadContract(CONTRACT_ADDRESS, ABI, signer);
      await verifyContract(contract);

      const burnAmountWei = await validateBurn(
        contract,
        userAddress,
        amount,
        wallet_provider,
        ethBalance
      );

      const { gasLimit, gasPrice, totalGasCost } = await estimateGasCost(
        contract,
        burnAmountWei,
        wallet_provider
      );

      const formattedGasFee = ethers.formatEther(totalGasCost);
      setGasFee(`${formattedGasFee.substring(0, 6)} ETH`);

      const transaction = await prepareBurnTransaction(
        contract,
        burnAmountWei,
        gasLimit,
        gasPrice,
        wallet_provider,
        userAddress
      );

      const hash = await executeBurn(transaction, signer);
      setTxHash(hash);

      const receipt = await monitorTransaction(hash, wallet_provider);
      if (receipt && receipt.success) {
        console.log('Burn successful! Block:', receipt.blockNumber);
      }

      setAmount('');
    } catch (err: any) {
      console.error('Burn error:', err);
      setError(err.message || 'Burn transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyContract = async (contract: Contract) => {
    try {
      const fragment = contract.interface.getFunction('burn');
      if (!fragment) {
        throw new Error('Contract does not have a burn function');
      }

      try {
        const name = await contract.name();
        const symbol = await contract.symbol();
        console.log(`Contract: ${name} (${symbol})`);
      } catch (error) {
        console.log('Contract does not implement name/symbol');
      }
    } catch (error) {
      throw new Error('Contract does not have a burn function');
    }
  }

  const handleDisconnectWallet = () => {
    setWalletConnected(false);
    setUserAddress('');
    setAmount('');
    setTxHash('');
    setError('');
    setGasFee('');
  };




  return (
    <div className="burn-container">
      {/* Instructions Section */}
      <div className="instructions-section">
        <h2>Burn WSOL to SOL</h2>
        <div className="instructions-card">
          <h3>How it works</h3>
          <ol className="steps">
            <li>Connect your Ethereum wallet</li>
            <li>Enter the amount of WSOL tokens to burn</li>
            <li>Confirm the transaction in your wallet</li>
            <li>Receive equivalent SOL on Solana network</li>
          </ol>
        </div>
      </div>

      {/* Wallet Connection */}

      {!walletConnected ? (
        <div className="wallet-connection">
          <div className="wallet-button-container">
            <button
              onClick={handleConnectWallet}
              disabled={isLoading}
              className="wallet-button"
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  <span className="button-text">Connecting...</span>
                </>
              ) : (
                <span className="button-text">Connect Wallet</span>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="connected-wallet">
          <div className="wallet-info">
            <div className="wallet-details">
              <span className="wallet-status">Connected</span>
              <span className="wallet-address">{userAddress.slice(0, 6)}...{userAddress.slice(-4)}</span>
            </div>
          </div>
          <button
            onClick={handleDisconnectWallet}
            className="disconnect-button"
          >
            Disconnect
          </button>
        </div>
      )}


      {walletConnected && (
        <div className="burn-form">

          <div className="amount-input">
            <label>Amount to Burn</label>
            <div className="input-group">
              <input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading}
                min="0"
                step="any"
              />
              <span>WSOL</span>
            </div>
          </div>
          <span className="conversion-rate">1 WSOL = 1 SOL </span>
          <div className="token-info">
            <div className="balance-info">
              <span>Your Balance:</span>
              <span><EthereumWsolBalance /></span>
            </div>
            <div className="gas-info">
              <span>Estimated Gas:</span>
              <span>{gasFee || 'Calculating...'}</span>
            </div>
          </div>



          <button
            className="action-button"
            onClick={handleBurn}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                <span className="button-text">Processing...</span>
              </>
            ) : <span className="button-text">Burn WSOL Tokens</span>}
          </button>

          {/* Status Messages */}
          {error && (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <div>
                <strong>Transaction Error</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {txHash && (
            <div className="transaction-success">
              <div className="success-icon">✅</div>
              <div>
                <strong>Transaction Submitted!</strong>
                <p>Your WSOL tokens are being burned</p>
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="etherscan-link"
                >
                  View on Etherscan
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BurnTokenComponent;


