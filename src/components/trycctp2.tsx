import React, { useState } from 'react';
import { Connection, PublicKey, SystemProgram, Transaction, SendTransactionError } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import axios from 'axios';

interface AttestationData {
  status: string;
  message: string;
  attestation: string;
}

// Constants
const CCTP_PROGRAM_ID = new PublicKey('CCTPiPYPc6AsJuwueEnWgSgucamXDZwBd53dQ11YiKX3');
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'); // Solana Devnet USDC
const MESSAGE_TRANSMITTER_ETH = '0x0a992d191DEeC32aFe36203Ad87D7d289a738F81'; // Sepolia MessageTransmitter
const SOLANA_DEVNET = 'https://api.devnet.solana.com';
const IRIS_API_URL = 'https://iris-api-sandbox.circle.com';

const createDepositForBurnInstruction = async (
  amount: number,
  destinationDomain: number,
  mintRecipient: string,
  burnToken: PublicKey,
  messageSender: PublicKey,
  connection: Connection,
  maxFee: number = 0,
  minFinalityThreshold: number = 0
) => {
  // Validate inputs
  if (!ethers.isAddress(mintRecipient)) {
    throw new Error('Invalid Ethereum address for mintRecipient');
  }

  // Convert Ethereum address to bytes32 (Buffer)
  const recipientBytes32 = Buffer.from(ethers.zeroPadValue(mintRecipient, 32).slice(2), 'hex'); // 32 bytes

  // Ethereum USDC address for Sepolia (replace with actual address from https://docs.circle.com/cctp/en/contract-addresses)
  const ethUsdcAddress = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'; // Placeholder
  const ethUsdcBytes = Buffer.from(ethUsdcAddress.slice(2), 'hex'); // 20 bytes

  // Derive PDAs with debugging logs
  console.log('1. Deriving token_messenger...');
  const tokenMessengerSeed = Buffer.from('token_messenger');
  console.log('Seed: "token_messenger", Length:', tokenMessengerSeed.length);
  const [tokenMessengerAccount] = PublicKey.findProgramAddressSync(
    [tokenMessengerSeed],
    CCTP_PROGRAM_ID
  );
  console.log('token_messenger:', tokenMessengerAccount.toBase58());

  console.log('2. Deriving remote_token_messenger...');
  const remoteTokenMessengerSeed1 = Buffer.from('remote_token_messenger');
  const remoteTokenMessengerSeed2 = Buffer.alloc(4);
  remoteTokenMessengerSeed2.writeUInt32LE(destinationDomain, 0);
  console.log('Seed 1: "remote_token_messenger", Length:', remoteTokenMessengerSeed1.length);
  console.log('Seed 2: destinationDomain, Length:', remoteTokenMessengerSeed2.length);
  const [remoteTokenMessengerAccount] = PublicKey.findProgramAddressSync(
    [remoteTokenMessengerSeed1, remoteTokenMessengerSeed2],
    CCTP_PROGRAM_ID
  );
  console.log('remote_token_messenger:', remoteTokenMessengerAccount.toBase58());

  console.log('3. Deriving token_minter...');
  const tokenMinterSeed = Buffer.from('token_minter');
  console.log('Seed: "token_minter", Length:', tokenMinterSeed.length);
  const [tokenMinterAccount] = PublicKey.findProgramAddressSync(
    [tokenMinterSeed],
    CCTP_PROGRAM_ID
  );
  console.log('token_minter:', tokenMinterAccount.toBase58());

  console.log('4. Deriving local_token...');
  const localTokenSeed1 = Buffer.from('local_token');
  const localTokenSeed2 = USDC_MINT.toBytes();
  console.log('Seed 1: "local_token", Length:', localTokenSeed1.length);
  console.log('Seed 2: USDC_MINT, Length:', localTokenSeed2.length);
  const [localTokenAccount] = PublicKey.findProgramAddressSync(
    [localTokenSeed1, localTokenSeed2],
    CCTP_PROGRAM_ID
  );
  console.log('local_token:', localTokenAccount.toBase58());

  console.log('5. Deriving token_pair...');
  const tokenPairSeed1 = Buffer.from('token_pair');
  const tokenPairSeed2 = Buffer.alloc(4);
  tokenPairSeed2.writeUInt32LE(destinationDomain, 0);
  const tokenPairSeed3 = ethUsdcBytes;
  console.log('Seed 1: "token_pair", Length:', tokenPairSeed1.length);
  console.log('Seed 2: destinationDomain, Length:', tokenPairSeed2.length);
  console.log('Seed 3: ethUsdcBytes, Length:', tokenPairSeed3.length);
  const [tokenPairAccount] = PublicKey.findProgramAddressSync(
    [tokenPairSeed1, tokenPairSeed2, tokenPairSeed3],
    CCTP_PROGRAM_ID
  );
  console.log('token_pair:', tokenPairAccount.toBase58());

  console.log('6. Deriving custody_token_account...');
  const custodyTokenSeed1 = Buffer.from('custody');
  const custodyTokenSeed2 = USDC_MINT.toBytes();
  console.log('Seed 1: "custody", Length:', custodyTokenSeed1.length);
  console.log('Seed 2: USDC_MINT, Length:', custodyTokenSeed2.length);
  const [custodyTokenAccount] = PublicKey.findProgramAddressSync(
    [custodyTokenSeed1, custodyTokenSeed2],
    CCTP_PROGRAM_ID
  );
  console.log('custody_token_account:', custodyTokenAccount.toBase58());

  console.log('7. Deriving token_program_event_authority...');
  const eventAuthoritySeed = Buffer.from('__event_authority');
  console.log('Seed: "__event_authority", Length:', eventAuthoritySeed.length);
  const [tokenProgramEventAuthority] = PublicKey.findProgramAddressSync(
    [eventAuthoritySeed],
    CCTP_PROGRAM_ID
  );
  console.log('token_program_event_authority:', tokenProgramEventAuthority.toBase58());

  console.log('8. Deriving message_transmitter...');
  const messageTransmitterSeed = Buffer.from('message_transmitter');
  console.log('Seed: "message_transmitter", Length:', messageTransmitterSeed.length);
  const [messageTransmitterAccount] = PublicKey.findProgramAddressSync(
    [messageTransmitterSeed],
    CCTP_PROGRAM_ID
  );
  console.log('message_transmitter:', messageTransmitterAccount.toBase58());

  console.log('9. Deriving authority_pda...');
  const authoritySeed = Buffer.from('message_transmitter_authority');
  console.log('Seed: "message_transmitter_authority", Length:', authoritySeed.length);
  const [authorityPda] = PublicKey.findProgramAddressSync(
    [authoritySeed],
    CCTP_PROGRAM_ID
  );
  console.log('authority_pda:', authorityPda.toBase58());

  // user_token_account
  const userTokenAccount = await getAssociatedTokenAddress(USDC_MINT, messageSender);
  console.log('10. user_token_account:', userTokenAccount.toBase58());

  // Create instruction data
  const amountBuffer = Buffer.alloc(8);
  amountBuffer.writeBigUInt64LE(BigInt(amount), 0);

  const maxFeeBuffer = Buffer.alloc(8);
  maxFeeBuffer.writeBigUInt64LE(BigInt(maxFee), 0);

  const destinationDomainBuffer = Buffer.alloc(4);
  destinationDomainBuffer.writeUInt32LE(destinationDomain, 0);

  const minFinalityThresholdBuffer = Buffer.alloc(4);
  minFinalityThresholdBuffer.writeUInt32LE(minFinalityThreshold, 0);

  // Nonce (placeholder; replace with actual logic from depositForBurnSol)
  const nonce = Buffer.alloc(8);
  nonce.writeBigUInt64LE(BigInt(Date.now()), 0); // Replace with proper nonce

  // Burn message (optional; included for depositForBurnSolWithHook)
  const burnMessage = Buffer.alloc(32);
  burnMessage.fill(0);

  // Discriminator for depositForBurn
  const discriminator = Buffer.from('0c6e1e5e0f8a0b2f', 'hex'); // SHA256("depositForBurn")[:8]

  const instructionData = Buffer.concat([
    discriminator, // 8 bytes
    amountBuffer, // u64: amount
    maxFeeBuffer, // u64: maxFee
    nonce, // u64: nonce
    destinationDomainBuffer, // u32: destination domain
    minFinalityThresholdBuffer, // u32: minFinalityThreshold
    recipientBytes32, // bytes32: mint recipient
    burnMessage, // bytes32: burn message (optional)
    USDC_MINT.toBytes(), // Pubkey: burn token mint
  ]);

  console.log('Instruction data (hex):', instructionData.toString('hex'));

  const instruction = {
    programId: CCTP_PROGRAM_ID,
    keys: [
      { pubkey: messageSender, isSigner: true, isWritable: true }, // Signer (user)
      { pubkey: messageTransmitterAccount, isSigner: false, isWritable: true }, // message_transmitter
      { pubkey: tokenMessengerAccount, isSigner: false, isWritable: false }, // token_messenger
      { pubkey: remoteTokenMessengerAccount, isSigner: false, isWritable: false }, // remote_token_messenger
      { pubkey: tokenMinterAccount, isSigner: false, isWritable: true }, // token_minter
      { pubkey: localTokenAccount, isSigner: false, isWritable: true }, // local_token
      { pubkey: tokenPairAccount, isSigner: false, isWritable: false }, // token_pair
      { pubkey: userTokenAccount, isSigner: false, isWritable: true }, // user_token_account
      { pubkey: custodyTokenAccount, isSigner: false, isWritable: true }, // custody_token_account
      { pubkey: authorityPda, isSigner: false, isWritable: false }, // authority_pda
      { pubkey: tokenProgramEventAuthority, isSigner: false, isWritable: false }, // token_program_event_authority
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // SPL.token_program_id
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // System program
    ],
    data: instructionData,
  };

  return instruction;
};

const CCTPBridge: React.FC = () => {
  const { publicKey, signTransaction } = useWallet();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [status, setStatus] = useState('');
  const [txHash, setTxHash] = useState('');
  const [attestation, setAttestation] = useState<AttestationData | null>(null);

  const connection = new Connection(SOLANA_DEVNET, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
  });

  const validateInputs = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setStatus('Enter valid amount');
      return false;
    }
    if (!recipient || !ethers.isAddress(recipient)) {
      setStatus('Enter valid Ethereum address');
      return false;
    }
    if (!publicKey || !signTransaction) {
      setStatus('Connect Solana wallet');
      return false;
    }
    return true;
  };

  const getAttestation = async (txHash: string) => {
    setStatus('Waiting for attestation...');
    for (let i = 0; i < 60; i++) {
      try {
        const { data } = await axios.get(`${IRIS_API_URL}/v2/messages/0?transactionHash=${txHash}`);
        if (data.messages?.[0]?.attestation !== 'PENDING') {
          return data.messages[0] as AttestationData;
        }
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
      const amountLamports = Math.floor(parseFloat(amount) * 1_000_000); // USDC has 6 decimals

      if (balance.value.uiAmount! < parseFloat(amount)) {
        throw new Error('Insufficient USDC');
      }

      const instruction = await createDepositForBurnInstruction(
        amountLamports,
        0, // Ethereum Sepolia
        recipient,
        USDC_MINT,
        publicKey!,
        connection,
        0, // maxFee (adjust as needed)
        0 // minFinalityThreshold (adjust as needed)
      );

      const transaction = new Transaction().add(instruction);
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
      if (error instanceof SendTransactionError) {
        console.error('SendTransactionError:', error.message);
        const logs = await error.getLogs(connection);
        console.error('Transaction logs:', logs);
        setStatus(`Error: ${error.message}\nLogs: ${logs.join('\n')}`);
      } else {
        console.error('Error in bridgeUSDC:', error);
        setStatus(`Error: ${error.message}`);
      }
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
      const signer = await provider.getSigner();

      const abi = ['function receiveMessage(bytes message, bytes attestation) external returns (bool success)'];
      const contract = new ethers.Contract(MESSAGE_TRANSMITTER_ETH, abi, signer);

      setStatus('Minting USDC...');
      const tx = await contract.receiveMessage(
        ethers.hexlify(ethers.toUtf8Bytes(attestation.message)),
        ethers.hexlify(ethers.toUtf8Bytes(attestation.attestation))
      );
      await tx.wait();

      setStatus(`Minted! Tx: ${tx.hash}`);
    } catch (error: any) {
      setStatus(`Mint error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">USDC Bridge: Solana → Ethereum</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">USDC Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter USDC amount"
          min="0"
          step="0.000001"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Ethereum Recipient Address</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0x..."
        />
      </div>
      <button
        onClick={bridgeUSDC}
        disabled={!publicKey || !signTransaction || !amount || !recipient}
        className={`w-full p-2 mb-2 rounded-md text-white ${
          !publicKey || !signTransaction || !amount || !recipient
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        Burn on Solana
      </button>
      {attestation && (
        <button
          onClick={mintOnEthereum}
          className="w-full p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Mint on Ethereum
        </button>
      )}
      {status && <p className="mt-2 text-sm">{status}</p>}
      {txHash && (
        <p className="mt-2 text-sm">
          Tx:{' '}
          <a
            href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600"
          >
            {txHash.slice(0, 8)}...
          </a>
        </p>
      )}
    </div>
  );
};

export default CCTPBridge;
