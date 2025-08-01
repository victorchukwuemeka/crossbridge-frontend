/*
 * Copyright (c) 2025, Circle Internet Financial LTD All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { ethers } from 'ethers';
import { Buffer } from 'buffer';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';

// Constants
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
const MESSAGE_TRANSMITTER_PROGRAM_ID = new PublicKey('CCTPmbSD7gX1bxKPAmg77w8oFzNFpaQiQUWD43TKaecd');
const TOKEN_MESSENGER_MINTER_PROGRAM_ID = new PublicKey('CCTPiPYPc6AsJuwueEnWgSgucamXDZwBd53dQ11YiKX3');
const SOLANA_SRC_DOMAIN_ID = 5;
const REMOTE_EVM_DOMAIN = 0; // Sepolia
const ETHEREUM_USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
const ETHEREUM_TOKEN_MESSENGER_ADDRESS = '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70A25'; // Sepolia TokenMessenger
const ATTESTATION_API = 'https://iris-api-sandbox.circle.com/v1/attestations';

// Solana connection
const connection = new Connection('https://api.devnet.solana.com', {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000,
});

// Ethereum provider (e.g., MetaMask)
const getEthereumProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error('Ethereum wallet (e.g., MetaMask) not detected');
};

const CCTPBridge: React.FC = () => {
  const { wallet, publicKey, signTransaction } = useWallet();
  const [amount, setAmount] = useState('');
  const [remoteAddress, setRemoteAddress] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [messageHex, setMessageHex] = useState('');

  // Step 1: Collect Input (handled via React state and UI)

  // Step 2: Check Wallet
  const checkWallet = () => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }
    return publicKey;
  };

  // Step 3 & 4: Derive PDAs and Validate Accounts
  const createDepositForBurnInstruction = async (
    amount: number,
    destinationDomain: number,
    mintRecipient: string,
    burnToken: PublicKey,
    messageSender: PublicKey
  ) => {
    // Validate inputs
    if (!ethers.isAddress(mintRecipient)) {
      throw new Error('Invalid Ethereum address for mintRecipient');
    }

    // Convert Ethereum address to bytes32
    const recipientBytes32 = Buffer.from(ethers.zeroPadValue(mintRecipient, 32).slice(2), 'hex');

    // Ethereum USDC address for Sepolia
    const ethUsdcBytes = Buffer.from(ETHEREUM_USDC_ADDRESS.slice(2), 'hex');

    // Derive PDAs
    console.log('Deriving token_messenger...');
    const [tokenMessengerAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('token_messenger')],
      TOKEN_MESSENGER_MINTER_PROGRAM_ID
    );
    console.log('token_messenger:', tokenMessengerAccount.toBase58());

    console.log('Deriving remote_token_messenger...');
    const remoteTokenMessengerSeed = Buffer.alloc(4);
    remoteTokenMessengerSeed.writeUInt32LE(destinationDomain, 0);
    const [remoteTokenMessengerAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('remote_token_messenger'), remoteTokenMessengerSeed],
      TOKEN_MESSENGER_MINTER_PROGRAM_ID
    );
    console.log('remote_token_messenger:', remoteTokenMessengerAccount.toBase58());

    console.log('Deriving token_minter...');
    const [tokenMinterAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('token_minter')],
      TOKEN_MESSENGER_MINTER_PROGRAM_ID
    );
    console.log('token_minter:', tokenMinterAccount.toBase58());

    console.log('Deriving local_token...');
    const [localTokenAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('local_token'), USDC_MINT.toBytes()],
      TOKEN_MESSENGER_MINTER_PROGRAM_ID
    );
    console.log('local_token:', localTokenAccount.toBase58());

    console.log('Deriving token_pair...');
    const tokenPairSeed = Buffer.alloc(4);
    tokenPairSeed.writeUInt32LE(destinationDomain, 0);
    const [tokenPairAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('token_pair'), tokenPairSeed, ethUsdcBytes],
      TOKEN_MESSENGER_MINTER_PROGRAM_ID
    );
    console.log('token_pair:', tokenPairAccount.toBase58());

    console.log('Deriving custody_token_account...');
    const [custodyTokenAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('custody'), USDC_MINT.toBytes()],
      TOKEN_MESSENGER_MINTER_PROGRAM_ID
    );
    console.log('custody_token_account:', custodyTokenAccount.toBase58());

    console.log('Deriving message_transmitter...');
    const [messageTransmitterAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('cctp:MessageTransmitter')],
      MESSAGE_TRANSMITTER_PROGRAM_ID
    );
    console.log('message_transmitter:', messageTransmitterAccount.toBase58());
    try {
      const accountInfo = await connection.getAccountInfo(messageTransmitterAccount);
      if (!accountInfo) {
        console.error('message_transmitter account is not initialized. Address:', messageTransmitterAccount.toBase58());
        throw new Error('message_transmitter account is not initialized. Please run initialize.ts from solana-cctp-contracts/examples.');
      }
      console.log('message_transmitter account found. Data length:', accountInfo.data.length);
    } catch (error: any) {
      console.error('Error checking message_transmitter account:', error.message);
      throw error;
    }

    console.log('Deriving sender_authority_pda...');
    const [senderAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('message_transmitter_authority')],
      MESSAGE_TRANSMITTER_PROGRAM_ID
    );
    console.log('sender_authority_pda:', senderAuthorityPda.toBase58());

    console.log('Deriving message_sent_event_data...');
    const messageSentEventAccountKeypair = Keypair.generate();
    console.log('message_sent_event_data:', messageSentEventAccountKeypair.publicKey.toBase58());

    console.log('Deriving user_token_account...');
    const userTokenAccount = await getAssociatedTokenAddress(USDC_MINT, messageSender);
    console.log('user_token_account:', userTokenAccount.toBase58());

    // Step 5: Build Instruction Data
    const amountBuffer = Buffer.alloc(8);
    amountBuffer.writeBigUInt64LE(BigInt(amount), 0);

    const maxFeeBuffer = Buffer.alloc(8);
    maxFeeBuffer.writeBigUInt64LE(BigInt(0), 0);

    const destinationDomainBuffer = Buffer.alloc(4);
    destinationDomainBuffer.writeUInt32LE(destinationDomain, 0);

    const minFinalityThresholdBuffer = Buffer.alloc(4);
    minFinalityThresholdBuffer.writeUInt32LE(0, 0);

    const destinationCaller = new PublicKey('11111111111111111111111111111111');
    const destinationCallerBytes = destinationCaller.toBytes();

    const nonce = Buffer.alloc(8);
    nonce.writeBigUInt64LE(BigInt(0), 0); // Placeholder nonce

    const burnMessage = Buffer.alloc(32);
    burnMessage.fill(0);

    const discriminator = Buffer.from('1a4a3366b2f3d9eb', 'hex');
    console.log('Using discriminator: deposit_for_burn (1a4a3366b2f3d9eb)');

    const instructionData = Buffer.concat([
      discriminator,
      amountBuffer,
      destinationDomainBuffer,
      recipientBytes32,
      maxFeeBuffer,
      minFinalityThresholdBuffer,
      destinationCallerBytes,
      nonce,
      burnMessage,
      USDC_MINT.toBytes(),
    ]);

    console.log('Instruction data (hex):', instructionData.toString('hex'));

    // Step 6: Create Transaction Instruction
    const instruction = new TransactionInstruction({
      programId: TOKEN_MESSENGER_MINTER_PROGRAM_ID,
      keys: [
        { pubkey: messageSender, isSigner: true, isWritable: true }, // owner
        { pubkey: messageSender, isSigner: true, isWritable: true }, // eventRentPayer
        { pubkey: senderAuthorityPda, isSigner: false, isWritable: false },
        { pubkey: userTokenAccount, isSigner: false, isWritable: true },
        { pubkey: messageTransmitterAccount, isSigner: false, isWritable: true },
        { pubkey: tokenMessengerAccount, isSigner: false, isWritable: false },
        { pubkey: remoteTokenMessengerAccount, isSigner: false, isWritable: false },
        { pubkey: tokenMinterAccount, isSigner: false, isWritable: true },
        { pubkey: localTokenAccount, isSigner: false, isWritable: true },
        { pubkey: USDC_MINT, isSigner: false, isWritable: true },
        { pubkey: messageSentEventAccountKeypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: MESSAGE_TRANSMITTER_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: TOKEN_MESSENGER_MINTER_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: instructionData,
    });

    return { instruction, signers: [messageSentEventAccountKeypair] };
  };

  // Step 7: Burn USDC on Solana
  const bridgeUSDC = async () => {
    try {
      // Step 1: Validate Input
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        throw new Error('Invalid amount');
      }
      if (!ethers.isAddress(remoteAddress)) {
        throw new Error('Invalid Ethereum address');
      }

      // Step 2: Check Wallet
      const messageSender = checkWallet();

      setError('');
      setStatus('Initiating burn on Solana...');

      // Steps 3-6: Create and send instruction
      const { instruction, signers } = await createDepositForBurnInstruction(
        Number(amount) * 1_000_000, // USDC has 6 decimals
        REMOTE_EVM_DOMAIN,
        remoteAddress,
        USDC_MINT,
        messageSender
      );

      const transaction = new Transaction().add(instruction);
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey!;

      const signedTx = await signTransaction!(transaction);
      signedTx.partialSign(...signers);

      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature, 'confirmed');

      setStatus(`Burn successful! Signature: ${signature}`);

      // Fetch the transaction to get the MessageSent event
      const tx = await connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });
      if (!tx || !tx.meta || !tx.meta.logMessages) {
        throw new Error('Failed to fetch transaction logs');
      }

      // Parse logs for MessageSent event
      const messageLog = tx.meta.logMessages.find((log) =>
        log.includes('Program data:')
      );
      if (!messageLog) {
        throw new Error('MessageSent event not found in transaction logs');
      }
      const messageBase64 = messageLog.split('Program data: ')[1];
      const messageBytes = Buffer.from(messageBase64, 'base64');
      setMessageHex(messageBytes.toString('hex'));
      setStatus(`Burn successful! Message: 0x${messageHex}`);
      return messageBytes;
    } catch (err: any) {
      console.error('Error in bridgeUSDC:', err);
      setError(`Error: ${err.message}`);
      setStatus('');
      throw err;
    }
  };

  // Attestation Service
  const getAttestation = async (message: Buffer) => {
    try {
      setStatus('Fetching attestation...');
      const messageHash = ethers.keccak256(message);
      const response = await axios.get(`${ATTESTATION_API}/${messageHash}`);
      const attestation = response.data.attestation;
      if (!attestation) {
        throw new Error('Attestation not found');
      }
      setStatus(`Attestation received: ${attestation}`);
      return attestation;
    } catch (err: any) {
      console.error('Error in getAttestation:', err);
      setError(`Error fetching attestation: ${err.message}`);
      setStatus('');
      throw err;
    }
  };

  // Mint USDC on Ethereum
  const mintOnEthereum = async (message: Buffer, attestation: string) => {
    try {
      setStatus('Minting on Ethereum...');
      const provider = getEthereumProvider();
      const signer = await provider.getSigner();
      const tokenMessenger = new ethers.Contract(
        ETHEREUM_TOKEN_MESSENGER_ADDRESS,
        [
          'function depositForBurn(uint64 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken, bytes memory message, bytes memory attestation) external',
        ],
        signer
      );

      const tx = await tokenMessenger.depositForBurn(
        message,
        attestation
      );
      const receipt = await tx.wait();
      setStatus(`Mint successful! Ethereum Tx: ${receipt.hash}`);
    } catch (err: any) {
      console.error('Error in mintOnEthereum:', err);
      setError(`Error minting on Ethereum: ${err.message}`);
      setStatus('');
      throw err;
    }
  };

  // Full bridge process
  const handleBridge = async () => {
    try {
      // Step 1-7: Burn on Solana
      const message = await bridgeUSDC();
      
      // Attestation
      const attestation = await getAttestation(message);
      
      // Mint on Ethereum
      await mintOnEthereum(message, attestation);
    } catch (err) {
      // Error already set in individual functions
    }
  };

  return (
    <div>
      <h2>CCTP USDC Bridge (Solana to Ethereum)</h2>
      <div>
        <label>
          Amount (USDC):
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter USDC amount"
          />
        </label>
      </div>
      <div>
        <label>
          Ethereum Recipient Address:
          <input
            type="text"
            value={remoteAddress}
            onChange={(e) => setRemoteAddress(e.target.value)}
            placeholder="0x..."
          />
        </label>
      </div>
      <button onClick={handleBridge} disabled={!publicKey || !window.ethereum}>
        Bridge USDC
      </button>
      {status && <p>Status: {status}</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {messageHex && <p>Message: 0x{messageHex}</p>}
    </div>
  );
};

export default CCTPBridge;