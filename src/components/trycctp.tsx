import React, { useState } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { getAssociatedTokenAddress, createBurnCheckedInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { ethers } from 'ethers';
import axios from 'axios';

interface AttestationData{
    status : string,
    message : string,
    attestation : string
}



const CCTPBridge = () => {
  const { publicKey, signTransaction } = useWallet();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [status, setStatus] = useState('');
  const [txHash, setTxHash] = useState('');
  //const [attestation, setAttestation] = useState(null);
  const [attestation, setAttestation] = useState<AttestationData | null>(null);

//  const connection = new Connection('https://api.mainnet-beta.solana.com');
   const connection = new Connection('https://api.devnet.solana.com', {
     commitment: 'confirmed',
     confirmTransactionInitialTimeout: 60000,
   });



  //const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
  //const MESSAGE_TRANSMITTER_ETH = '0x0a992d191DEeC32aFe36203Ad87D7d289a738F81';
  const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
  const MESSAGE_TRANSMITTER_ETH = '0x0a992d191DEeC32aFe36203Ad87D7d289a738F81';

  const validateInputs = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setStatus('Enter valid amount');
      return false;
    }
    if (!recipient || !ethers.isAddress(recipient)) {
      setStatus('Enter valid Ethereum address');
      return false;
    }
    if (!publicKey) {
      setStatus('Connect Solana wallet');
      return false;
    }
    return true;
  };

  const getAttestation = async (txHash: string) => {
    setStatus('Waiting for attestation...');
    for (let i = 0; i < 60; i++) {
      try {
        const { data } = await axios.get(`https://iris-api.circle.com/attestations/${txHash}`);
        if (data.status === 'complete') return data;
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error: any) {
        if (error.response?.status !== 404) throw new Error('Attestation failed');
      }
    }
    throw new Error('Attestation timeout');
  };

  const bridgeUSDC = async () => {
    if (!validateInputs()) return;
    setStatus('Burning USDC...');

    try {
      const usdcAccount = await getAssociatedTokenAddress(USDC_MINT, publicKey!);
      const balance = await connection.getTokenAccountBalance(usdcAccount);
      const amountLamports = Math.floor(parseFloat(amount) * 1000000);

      if (balance.value.uiAmount! < parseFloat(amount)) {
        throw new Error('Insufficient USDC');
      }

      const transaction = new Transaction().add(
        createBurnCheckedInstruction(usdcAccount, USDC_MINT, publicKey!, amountLamports, 6)
      );

      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey!;

      const signedTx = await signTransaction!(transaction);
      const txSignature = await connection.sendRawTransaction(signedTx.serialize());
      setTxHash(txSignature);

      await connection.confirmTransaction(txSignature, 'finalized');
      setStatus('Burn confirmed. Getting attestation...');

      const attestationData = await getAttestation(txSignature);
      setAttestation(attestationData);
      setStatus('Ready to mint on Ethereum');
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const mintOnEthereum = async () => {
    if (!attestation) {
      setStatus('No attestation data');
      return;
    }

    try {
      if (!window.ethereum) throw new Error('Install MetaMask');
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();

      const abi = ['function receiveMessage(bytes message, bytes attestation) external returns (bool success)'];
      const contract = new ethers.Contract(MESSAGE_TRANSMITTER_ETH, abi, await signer);

      setStatus('Minting USDC...');
      const tx = await contract.receiveMessage(attestation.message, attestation.attestation);
      await tx.wait();

      setStatus(`Minted! Tx: ${tx.hash}`);
    } catch (error: any) {
      setStatus(`Mint error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">USDC Bridge: Solana → Ethereum</h2>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
        placeholder="USDC Amount"
        min="0"
        step="0.000001"
      />
      <input
        type="text"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
        placeholder="Ethereum Address (0x...)"
      />
      <button
        onClick={bridgeUSDC}
        disabled={!publicKey}
        className={`w-full p-2 mb-2 rounded ${!publicKey ? 'bg-gray-300' : 'bg-blue-600 text-white'}`}
      >
        Burn on Solana
      </button>
      {attestation && (
        <button
          onClick={mintOnEthereum}
          className="w-full p-2 bg-green-600 text-white rounded"
        >
          Mint on Ethereum
        </button>
      )}
      {status && <p className="mt-2 text-sm">{status}</p>}
      {txHash && (
        <p className="mt-2 text-sm">
          Tx: <a href={`https://solscan.io/tx/${txHash}`} target="_blank" className="text-blue-600">
            {txHash.slice(0, 8)}...
          </a>
        </p>
      )}
    </div>
  );
};

export default CCTPBridge;