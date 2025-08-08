import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { collectFees, getAvailableFees, isAdminWallet } from './adminInstructions';


const FeeCollectionComponent: React.FC = () => {
  const wallet = useWallet();
  
  const [isCollecting, setIsCollecting] = useState(false);
  const [availableFees, setAvailableFees] = useState(0);
  const [feeCollector, setFeeCollector] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const isAdmin = isAdminWallet(wallet.publicKey);

  useEffect(() => {
    if (wallet.connected && isAdmin) {
      const fetchFees = async () => {
        const fees = await getAvailableFees();
        setAvailableFees(fees);
      };
      fetchFees();
      const interval = setInterval(fetchFees, 30000);
      return () => clearInterval(interval);
    }
  }, [wallet.connected, isAdmin]);

  const handleCollect = async () => {
    if (!feeCollector.trim()) {
      showMessage('Enter fee collector address', true);
      return;
    }

    try {
      setIsCollecting(true);
      const feeCollectorPubkey = new PublicKey(feeCollector.trim());
      const signature = await collectFees(wallet, feeCollectorPubkey);
      
      showMessage(`Success! ${signature.slice(0, 8)}...`, false);
      setAvailableFees(await getAvailableFees());
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed';
      showMessage(errorMsg, true);
    } finally {
      setIsCollecting(false);
    }
  };

  const showMessage = (msg: string, error: boolean) => {
    setMessage(msg);
    setIsError(error);
    setTimeout(() => setMessage(''), 5000);
  };

  if (!wallet.connected) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
        <div className="text-center">
          <div className="text-3xl mb-2">🔒</div>
          <p>Connect wallet to continue</p>
        </div>
      </div>
    );
  }
  
  //check the  admin user 
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
        <div className="text-center">
          <div className="text-3xl mb-2">⛔</div>
          <p className="text-red-600">Admin access only</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold">💰 Collect Fees</h1>
      </div>

      <div className="bg-blue-50 p-4 rounded mb-4">
        <div className="text-sm text-blue-600">Available</div>
        <div className="text-2xl font-bold text-blue-800">
          {(availableFees / 1e9).toFixed(6)} SOL
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={feeCollector}
          onChange={(e) => setFeeCollector(e.target.value)}
          placeholder="Fee collector address..."
          className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 text-sm font-mono"
          disabled={isCollecting}
        />
      </div>

      <button
        onClick={handleCollect}
        disabled={isCollecting || availableFees === 0 || !feeCollector.trim()}
        className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded transition-colors"
      >
        {isCollecting ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Collecting...
          </span>
        ) : (
          `Collect ${(availableFees / 1e9).toFixed(3)} SOL`
        )}
      </button>

      {message && (
        <div className={`mt-4 p-3 rounded text-sm ${
          isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        }`}>
          {isError ? '❌' : '✅'} {message}
        </div>
      )}
    </div>
  );
};

export default FeeCollectionComponent;