import React, { useState, useEffect } from 'react';
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
  const [solanaAddress, setSolanaAddress] = useState('');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [contract, setContract] = useState<Contract | null>(null);
  
  // TODO: Use the SAME contract address as EthereumWsolBalance component
  // Currently using: 0x990f31d4359Ee8745D479c873549F5eF44494435
  // But EthereumWsolBalance is using a different address where you have 6 wSOL
  // Check EthereumWsolBalance.tsx for the correct CONTRACT_ADDRESS
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
        console.error(err);
        setError('Failed to connect wallet');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Please install MetaMask or another wallet provider');
    }
  };

  // Load contract and check balance whenever wallet connects or address changes
  useEffect(() => {
    const loadContractAndBalance = async () => {
      if (!walletConnected || !userAddress) return;

      try {
        const wallet_provider = new BrowserProvider(window.ethereum);
        const signer = await wallet_provider.getSigner();
        
        const contractInstance = await loadContract(CONTRACT_ADDRESS, ABI, signer);
        await verifyContract(contractInstance);
        setContract(contractInstance);

        // Get balance with proper decimals
        const userBalance = await contractInstance.balanceOf(userAddress);
        const decimals = await contractInstance.decimals();
        const formattedBalance = ethers.formatUnits(userBalance, decimals);
        
        console.log('Contract Address:', CONTRACT_ADDRESS);
        console.log('User Address:', userAddress);
        console.log('Raw balance:', userBalance.toString());
        console.log('Decimals:', decimals);
        console.log('Formatted balance:', formattedBalance);
        
        setTokenBalance(formattedBalance);
        
      } catch (error) {
        console.error('Error loading contract/balance:', error);
        setError('Failed to load contract or balance');
      }
    };

    loadContractAndBalance();
  }, [walletConnected, userAddress]);

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
    if (!amount || !userAddress || !contract) return;

    setIsLoading(true);
    setError('');
    setTxHash('');

    try {
      const wallet_provider = new BrowserProvider(window.ethereum);
      const signer = await wallet_provider.getSigner();
      const ethBalance = await checkEthBalance();

      // Get fresh balance and decimals
      const userBalance = await contract.balanceOf(userAddress);
      const decimals = await contract.decimals();
      const formattedBalance = ethers.formatUnits(userBalance, decimals);
      
      console.log('=== BURN TRANSACTION DEBUG ===');
      console.log('User Address:', userAddress);
      console.log('Contract Address:', CONTRACT_ADDRESS);
      console.log('Raw balance from contract:', userBalance.toString());
      console.log('Decimals:', decimals);
      console.log('Formatted balance:', formattedBalance);
      console.log('Amount to burn:', amount);
      
      // Check if user has sufficient balance
      if (parseFloat(formattedBalance) < parseFloat(amount)) {
        throw new Error(`Insufficient tokens. Have: ${formattedBalance} wSOL, Need: ${amount} wSOL`);
      }
      
      // Convert amount to wei using contract decimals
      const burnAmountWei = ethers.parseUnits(amount, decimals);
      console.log('Burn amount in wei:', burnAmountWei.toString());
      
      if (!solanaAddress || solanaAddress.length < 32) {
        throw new Error('Please enter a valid Solana address');
      }

      // Estimate gas and format for display
      const { gasLimit, gasPrice, totalGasCost } = await estimateGasCost(
        contract,
        burnAmountWei,
        solanaAddress,
        wallet_provider
      );
      
      console.log('Gas limit:', gasLimit);
      console.log('Gas Price:', gasPrice);
      console.log('Total gas cost in wei:', totalGasCost.toString());
      console.log('Total gas cost in ETH:', ethers.formatEther(totalGasCost));
      
      const formattedGasFee = ethers.formatEther(totalGasCost);
      setGasFee(`${formattedGasFee.substring(0, 6)} ETH`);

      const transaction = await prepareBurnTransaction(
        contract,
        burnAmountWei,
        solanaAddress,
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
        // Refresh balance after successful burn
        const newBalance = await contract.balanceOf(userAddress);
        const newFormattedBalance = ethers.formatUnits(newBalance, decimals);
        setTokenBalance(newFormattedBalance);
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
    setSolanaAddress('');
    setGasFee('');
    setTokenBalance('0');
    setContract(null);
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

      {/* Debug Info */}
      {walletConnected && (
        <div className="debug-info" style={{ 
          backgroundColor: '#0A0E17', 
          padding: '10px', 
          margin: '10px 0', 
          borderRadius: '5px',
          fontSize: '12px'
        }}>
          <strong>Debug Info:</strong><br />
          Contract: {CONTRACT_ADDRESS}<br />
          User: {userAddress}<br />
          Balance: {tokenBalance} wSOL
        </div>
      )}

      {/* Burn Section */}
      {walletConnected && (
        <div className="burn-form">
          {/* Solana Address Input */}
           <div className="amount-input">
               <label>Solana Address</label>
          <div className="input-group">
            <input
              type="text"
              value={solanaAddress}
              onChange={(e) => setSolanaAddress(e.target.value)}
              placeholder="Solana address (e.g., 5Fwc...xyz123)"
              disabled={!walletConnected || isLoading}
            />
          </div>
          </div>

          {/* Amount Input */}
          <div className="amount-input">
            <label>Amount to Burn</label>
            <div className="input-group">
              <input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading}
                //min="0"
                //step="any"
              />
              <span>WSOL</span>
            </div>
          </div>
          
          <span className="conversion-rate">1 WSOL = 1 SOL </span>
          
          <div className="token-info">
            <div className="balance-info">
              <span>Your Balance:</span>
              <span>{tokenBalance} wSOL</span>
            </div>
            <div className="balance-info">
              <span>EthereumWsolBalance Component:</span>
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
            disabled={isLoading || !amount || !solanaAddress || parseFloat(amount) <= 0}
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

// import React, { useState } from 'react';
// import { Contract, ethers, BrowserProvider } from 'ethers';
// import {
//   loadContract,
//   validateBurn,
//   estimateGasCost,
//   prepareBurnTransaction,
//   executeBurn,
//   monitorTransaction
// } from '../ethereum/tokenBurnService';
// import { ABI } from '../ethereum/ABI';
// import { EthereumWsolBalance } from "./EthereumWsolBalance";

// const BurnTokenComponent = () => {
//   const [amount, setAmount] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [txHash, setTxHash] = useState('');
//   const [error, setError] = useState('');
//   const [walletConnected, setWalletConnected] = useState(false);
//   const [userAddress, setUserAddress] = useState('');
//   const [gasFee, setGasFee] = useState('');

//   const CONTRACT_ADDRESS = '0x990f31d4359Ee8745D479c873549F5eF44494435';

//   const handleConnectWallet = async () => {
//     if (typeof window.ethereum !== 'undefined') {
//       try {
//         setIsLoading(true);
//         const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//         setUserAddress(accounts[0]);
//         setWalletConnected(true);
//         setError('');
//       } catch (err) {
//         console.error(err);
//         setError('Failed to connect wallet');
//       } finally {
//         setIsLoading(false);
//       }
//     } else {
//       setError('Please install MetaMask or another wallet provider');
//     }
//   };

//   const checkEthBalance = async () => {
//     try {
//       const wallet_provider = new BrowserProvider(window.ethereum);
//       return await wallet_provider.getBalance(userAddress);
//     } catch (error) {
//       console.error('Error checking ETH balance:', error);
//       throw error;
//     }
//   }

//   const handleBurn = async () => {
//     if (!amount || !userAddress) return;

//     setIsLoading(true);
//     setError('');
//     setTxHash('');

//     try {
//       const wallet_provider = new BrowserProvider(window.ethereum);
//       const signer = await wallet_provider.getSigner();
//       const ethBalance = await checkEthBalance();

//       const contract = await loadContract(CONTRACT_ADDRESS, ABI, signer);
//       await verifyContract(contract);

//       const burnAmountWei = await validateBurn(
//         contract,
//         userAddress,
//         amount,
//         wallet_provider,
//         ethBalance
//       );

//       const { gasLimit, gasPrice, totalGasCost } = await estimateGasCost(
//         contract,
//         burnAmountWei,
//         wallet_provider
//       );

//       const formattedGasFee = ethers.formatEther(totalGasCost);
//       setGasFee(`${formattedGasFee.substring(0, 6)} ETH`);

//       const transaction = await prepareBurnTransaction(
//         contract,
//         burnAmountWei,
//         gasLimit,
//         gasPrice,
//         wallet_provider,
//         userAddress
//       );

//       const hash = await executeBurn(transaction, signer);
//       setTxHash(hash);

//       const receipt = await monitorTransaction(hash, wallet_provider);
//       if (receipt && receipt.success) {
//         console.log('Burn successful! Block:', receipt.blockNumber);
//       }

//       setAmount('');
//     } catch (err: any) {
//       console.error('Burn error:', err);
//       setError(err.message || 'Burn transaction failed');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const verifyContract = async (contract: Contract) => {
//     try {
//       const fragment = contract.interface.getFunction('burn');
//       if (!fragment) {
//         throw new Error('Contract does not have a burn function');
//       }

//       try {
//         const name = await contract.name();
//         const symbol = await contract.symbol();
//         console.log(`Contract: ${name} (${symbol})`);
//       } catch (error) {
//         console.log('Contract does not implement name/symbol');
//       }
//     } catch (error) {
//       throw new Error('Contract does not have a burn function');
//     }
//   }

//   const handleDisconnectWallet = () => {
//     setWalletConnected(false);
//     setUserAddress('');
//     setAmount('');
//     setTxHash('');
//     setError('');
//     setGasFee('');
//   };




//   return (
//     <div className="burn-container">
//       {/* Instructions Section */}
//       <div className="instructions-section">
//         <h2>Burn WSOL to SOL</h2>
//         <div className="instructions-card">
//           <h3>How it works</h3>
//           <ol className="steps">
//             <li>Connect your Ethereum wallet</li>
//             <li>Enter the amount of WSOL tokens to burn</li>
//             <li>Confirm the transaction in your wallet</li>
//             <li>Receive equivalent SOL on Solana network</li>
//           </ol>
//         </div>
//       </div>

//       {/* Wallet Connection */}

//       {!walletConnected ? (
//         <div className="wallet-connection">
//           <div className="wallet-button-container">
//             <button
//               onClick={handleConnectWallet}
//               disabled={isLoading}
//               className="wallet-button"
//             >
//               {isLoading ? (
//                 <>
//                   <span className="loading-spinner"></span>
//                   <span className="button-text">Connecting...</span>
//                 </>
//               ) : (
//                 <span className="button-text">Connect Wallet</span>
//               )}
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div className="connected-wallet">
//           <div className="wallet-info">
//             <div className="wallet-details">
//               <span className="wallet-status">Connected</span>
//               <span className="wallet-address">{userAddress.slice(0, 6)}...{userAddress.slice(-4)}</span>
//             </div>
//           </div>
//           <button
//             onClick={handleDisconnectWallet}
//             className="disconnect-button"
//           >
//             Disconnect
//           </button>
//         </div>
//       )}


//       {walletConnected && (
//         <div className="burn-form">

//           <div className="amount-input">
//             <label>Amount to Burn</label>
//             <div className="input-group">
//               <input
//                 type="number"
//                 placeholder="0.0"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 disabled={isLoading}
//                 min="0"
//                 step="any"
//               />
//               <span>WSOL</span>
//             </div>
//           </div>
//           <span className="conversion-rate">1 WSOL = 1 SOL </span>
//           <div className="token-info">
//             <div className="balance-info">
//               <span>Your Balance:</span>
//               <span><EthereumWsolBalance /></span>
//             </div>
//             <div className="gas-info">
//               <span>Estimated Gas:</span>
//               <span>{gasFee || 'Calculating...'}</span>
//             </div>
//           </div>



//           <button
//             className="action-button"
//             onClick={handleBurn}
//             disabled={isLoading || !amount || parseFloat(amount) <= 0}
//           >
//             {isLoading ? (
//               <>
//                 <span className="loading-spinner"></span>
//                 <span className="button-text">Processing...</span>
//               </>
//             ) : <span className="button-text">Burn WSOL Tokens</span>}
//           </button>

//           {/* Status Messages */}
//           {error && (
//             <div className="error-message">
//               <div className="error-icon">⚠️</div>
//               <div>
//                 <strong>Transaction Error</strong>
//                 <p>{error}</p>
//               </div>
//             </div>
//           )}

//           {txHash && (
//             <div className="transaction-success">
//               <div className="success-icon">✅</div>
//               <div>
//                 <strong>Transaction Submitted!</strong>
//                 <p>Your WSOL tokens are being burned</p>
//                 <a
//                   href={`https://sepolia.etherscan.io/tx/${txHash}`}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="etherscan-link"
//                 >
//                   View on Etherscan
//                 </a>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default BurnTokenComponent;

