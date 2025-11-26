import React, { useState, useEffect } from 'react';
import { Contract, ethers, BrowserProvider } from 'ethers';
import {
  loadContract,
  estimateGasCost,
  prepareBurnTransaction,
  executeBurn,
  monitorTransaction
} from '../ethereum/tokenBurnService';
import { ABI } from '../ethereum/ABI';
import { EthereumWsolBalance } from "./EthereumWsolBalance";
import styles from '../pages/BridgePage.module.css';

const BurnTokenComponent = () => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [gasFee, setGasFee] = useState('');
  const [solanaAddress, setSolanaAddress] = useState('');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [contract, setContract] = useState<Contract | null>(null);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(false);

  const CONTRACT_ADDRESS = '0xF5D98867613023D30E28Fb4910E90A5273cA3aBC';

  const handleConnectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsLoading(true);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setUserAddress(accounts[0]);
        setWalletConnected(true);
        setError('');
      } catch (err) {
        setError('Failed to connect wallet');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Please install MetaMask or another wallet provider');
    }
  };

useEffect(() => {
  console.log('🔵 BurnTokenComponent useEffect triggered', { walletConnected, userAddress });
  
  const loadContractAndBalance = async () => {
    if (!walletConnected || !userAddress) {
      console.log('⏸️ Skipping - wallet not connected');
      return;
    }
    
    console.log('🔄 Loading contract and checking network...');
    
    try {
      const wallet_provider = new BrowserProvider(window.ethereum);
      console.log('✅ Provider created');

      // CHECK NETWORK FIRST - BEFORE LOADING CONTRACT
      const network = await wallet_provider.getNetwork();
      console.log('🌐 Network:', network.chainId, typeof network.chainId);
      
      const isWrongNetwork = network.chainId !== BigInt(11155111);
      console.log('❌ Is wrong network?', isWrongNetwork);
      
      setWrongNetwork(isWrongNetwork);
      
      if (isWrongNetwork) {
        console.log('🚨 Wrong network - stopping here');
        setTokenBalance('0');
        return; // Stop here, don't try to load contract
      }

      console.log('✅ Correct network - loading contract');
      // Only load contract if on correct network
      const signer = await wallet_provider.getSigner();
      console.log('✅ Signer obtained');
      
      const contractInstance = await loadContract(CONTRACT_ADDRESS, ABI, signer);
      console.log('✅ Contract loaded');
      setContract(contractInstance);

      const userBalance = await contractInstance.balanceOf(userAddress);
      const decimals = await contractInstance.decimals();
      const formattedBalance = ethers.formatUnits(userBalance, decimals);
      setTokenBalance(formattedBalance);
      console.log('✅ Balance loaded:', formattedBalance);
    } catch (err) {
      console.error('❌ Error:', err);
      setError('Failed to load contract or balance');
    }
  };
  
  loadContractAndBalance();

  // Listen for network changes
  if (window.ethereum) {
    const handleChainChanged = () => {
      console.log('🔄 Network changed - reloading...');
      loadContractAndBalance();
    };
    
    window.ethereum.on('chainChanged', handleChainChanged);
    
    // Cleanup listener
    return () => {
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }
}, [walletConnected, userAddress]);

  const handleBurn = async () => {
    if (!amount || !userAddress || !contract) return;

    setIsLoading(true);
    setError('');
    setTxHash('');

    try {
      const wallet_provider = new BrowserProvider(window.ethereum);
      const signer = await wallet_provider.getSigner();
      const decimals = await contract.decimals();
      const burnAmountWei = ethers.parseUnits(amount, decimals);

      if (!solanaAddress || solanaAddress.length < 32) {
        throw new Error('Enter a valid Solana address');
      }

      const { gasLimit, gasPrice, totalGasCost } = await estimateGasCost(contract, burnAmountWei, solanaAddress, wallet_provider);
      setGasFee(`${ethers.formatEther(totalGasCost).substring(0, 6)} ETH`);

      const tx = await prepareBurnTransaction(contract, burnAmountWei, solanaAddress, gasLimit, gasPrice, wallet_provider, userAddress);
      const hash = await executeBurn(tx, signer);
      setTxHash(hash);

      const receipt = await monitorTransaction(hash, wallet_provider);
      if (receipt?.success) {
        const newBalance = await contract.balanceOf(userAddress);
        setTokenBalance(ethers.formatUnits(newBalance, decimals));
      }
      setAmount('');
      setSolanaAddress('');
    } catch (err: any) {
      setError(err.message || 'Burn transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Title - Outside the card */}
      <h1 style={{ 
        fontSize: '1.8rem', 
        fontWeight: 700,
        background: 'linear-gradient(90deg, var(--primary), var(--accent))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textAlign: 'center',
        margin: '0 0 24px 0'
      }}>
        Burn WSOL to SOL
      </h1>

      {/* Network Warning Modal */}
      {showNetworkModal && wrongNetwork && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid var(--error)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 700, 
                color: 'var(--error)',
                margin: '0 0 12px 0'
              }}>
                Wrong Network Detected
              </h2>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '1rem',
                lineHeight: '1.6',
                margin: 0
              }}>
                Your wSOL tokens are on <strong style={{ color: 'var(--text)' }}>Sepolia Testnet</strong>.
                Please switch your wallet network to continue.
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 82, 82, 0.1)',
              border: '1px solid rgba(255, 82, 82, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ 
                fontSize: '0.85rem', 
                color: 'var(--text-secondary)',
                marginBottom: '8px'
              }}>
                Current Network
              </div>
              <div style={{ 
                fontSize: '1rem', 
                fontWeight: 600,
                color: 'var(--error)'
              }}>
                Chain ID: 1 (Ethereum Mainnet)
              </div>
            </div>

            <div style={{
              background: 'rgba(0, 255, 157, 0.1)',
              border: '1px solid rgba(0, 255, 157, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ 
                fontSize: '0.85rem', 
                color: 'var(--text-secondary)',
                marginBottom: '12px',
                fontWeight: 600
              }}>
                How to Switch Network:
              </div>
              <ol style={{ 
                margin: 0, 
                paddingLeft: '20px',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                lineHeight: '1.8'
              }}>
                <li>Open your MetaMask wallet</li>
                <li>Click the network dropdown at the top</li>
                <li>Select <strong style={{ color: 'var(--success)' }}>Sepolia Testnet</strong></li>
                <li>Refresh this page</li>
              </ol>
            </div>

            <button
              onClick={() => setShowNetworkModal(false)}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                color: 'var(--secondary)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Instructions Card */}
      <div className={styles.bridgeStatus}>
        <h3 style={{ 
          fontSize: '1.1rem', 
          fontWeight: 600, 
          color: 'var(--text)',
          margin: '0 0 16px 0'
        }}>
          How it works
        </h3>
        <ol style={{ 
          listStyle: 'decimal',
          paddingLeft: '20px',
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <li style={{ color: 'var(--text-secondary)' }}>Connect your Ethereum wallet</li>
          <li style={{ color: 'var(--text-secondary)' }}>Enter the amount of WSOL tokens to burn</li>
          <li style={{ color: 'var(--text-secondary)' }}>Confirm the transaction in your wallet</li>
          <li style={{ color: 'var(--text-secondary)' }}>Receive equivalent SOL on Solana network</li>
        </ol>
      </div>

      {/* Wallet Connection */}
      {!walletConnected ? (
        <div className={styles.walletSection}>
          <button 
            className={styles.walletButton} 
            onClick={handleConnectWallet} 
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>
      ) : (
        <>
          {/* Connected Wallet Info */}
          <div className={`${styles.card} ${styles.cardHover}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Connected Wallet
                </div>
                <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                  {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                </div>
              </div>
              <button 
                className={styles.disconnectButton} 
                onClick={() => {
                  setWalletConnected(false);
                  setUserAddress('');
                  setTokenBalance('0');
                }}
              >
                Disconnect
              </button>
            </div>
          </div>

          {/* Burn Form */}
          <div className={styles.formContainer}>
            {/* Balance Display Card - Industry Standard */}
            <div className={styles.card}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Available Balance
                </div>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 700, 
                  color: 'var(--text)',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '8px'
                }}>
                  {parseFloat(tokenBalance).toFixed(6)}
                  <span style={{ 
                    fontSize: '1rem', 
                    fontWeight: 600,
                    color: 'var(--primary)'
                  }}>
                    WSOL
                  </span>
                </div>
                
                {wrongNetwork && (
                  <button
                    onClick={() => setShowNetworkModal(true)}
                    style={{
                      marginTop: '12px',
                      padding: '10px 16px',
                      background: 'rgba(255, 82, 82, 0.1)',
                      border: '1px solid var(--error)',
                      borderRadius: '8px',
                      color: 'var(--error)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      justifyContent: 'center',
                      width: '100%'
                    }}
                  >
                    ⚠️ Wrong Network - Click to Fix
                  </button>
                )}
              </div>
              
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <EthereumWsolBalance />
              </div>
            </div>

            {/* Solana Address Input */}
            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>Recipient Solana Address</label>
              <input
                type="text"
                value={solanaAddress}
                onChange={(e) => setSolanaAddress(e.target.value)}
                placeholder="Enter your Solana wallet address"
                disabled={isLoading}
                className={styles.inputField}
              />
            </div>

            {/* Amount Input */}
            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>Amount to Burn</label>
              <div className={styles.inputGroup}>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isLoading}
                  placeholder="0.0"
                  className={styles.inputField}
                />
                <button
                  onClick={() => setAmount(tokenBalance)}
                  className={styles.maxButton}
                  disabled={isLoading || !tokenBalance || tokenBalance === '0'}
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Gas Fee Info */}
            {gasFee && (
              <div className={styles.feeSummary}>
                <div className={styles.feeRow}>
                  <span>Estimated Gas Fee</span>
                  <span>{gasFee}</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && <div className={styles.errorMessage}>{error}</div>}

            {/* Action Button */}
            <button 
              className={styles.actionButton} 
              onClick={handleBurn} 
              disabled={isLoading || !amount || !solanaAddress || parseFloat(amount) <= 0}
            >
              {isLoading ? 'Processing...' : 'Burn WSOL Tokens'}
            </button>

            {/* Transaction Hash */}
            {txHash && (
              <div className={styles.transactionSuccess}>
                <div>
                  <strong>✅ Transaction Submitted!</strong>
                  <div style={{ marginTop: '8px', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    Hash: {txHash}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default BurnTokenComponent;