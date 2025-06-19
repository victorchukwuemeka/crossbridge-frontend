import React, { useState } from 'react';
import { 
  initializeProvider,
  loadContract,
  validateBurn,
  estimateGasCost,
  prepareBurnTransaction,
  executeBurn,
  monitorTransaction
} from '../ethereum/tokenBurnService';

const BurnTokenComponent = () => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS_HERE';
  const CONTRACT_ABI = []; // Your contract ABI here
  const RPC_URL = 'https://sepolia.infura.io/v3/YOUR_KEY';
  const PRIVATE_KEY = 'YOUR_PRIVATE_KEY_HERE';

  const handleBurn = async () => {
    if (!amount) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Initialize provider
      const { provider, signer, address } = await initializeProvider(RPC_URL, PRIVATE_KEY);
      
      // Load contract
      const contract = await loadContract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // Validate burn
      const burnAmountWei = await validateBurn(contract, address, amount, provider);
      
      // Estimate gas
      const { gasLimit, gasPrice } = await estimateGasCost(contract, burnAmountWei, provider);
      
      // Prepare transaction
      const transaction = await prepareBurnTransaction(
        contract, 
        burnAmountWei, 
        gasLimit, 
        gasPrice, 
        provider, 
        address
      );
      
      // Execute burn
      const hash = await executeBurn(transaction, signer);
      setTxHash(hash);
      
      // Monitor transaction
      await monitorTransaction(hash, provider);
      
      alert('Burn successful!');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Burn WSOL Tokens</h2>
      
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount to burn"
      />
      
      <button onClick={handleBurn} disabled={isLoading || !amount}>
        {isLoading ? 'Burning...' : 'Burn Tokens'}
      </button>
      
      {error && <p style={{color: 'red'}}>{error}</p>}
      {txHash && <p>Transaction: {txHash}</p>}
    </div>
  );
};

export default BurnTokenComponent;