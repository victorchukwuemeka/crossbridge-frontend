import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import type { SendOptions } from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { PROGRAM_ID, connection } from "../solana/constants";
import { getBridgePda } from "../solana/pda";
import { Buffer } from 'buffer';
import { sha256 } from 'js-sha256';

// ===============================
// CONSTANTS & TYPES
// ===============================

export const ADMIN_PUBLICKEY = new PublicKey("4dmQAcJe9Ksh4FtpMMfHajP4ssBhrbNrPrGc3v5jFFSA");
const BRIDGE_ACCOUNT_SIZE = 57;
const FEES_OFFSET = 49;
const MIN_BALANCE_BUFFER = 10000; // 0.00001 SOL

interface FeeCollectionContext {
  adminPubkey: PublicKey;
  bridgePda: PublicKey;
  feeCollectorWallet: PublicKey;
  availableFees: number;
}

// ===============================
// CORE UTILITIES
// ===============================

const createDiscriminator = (name: string): Buffer => {
  const hash = sha256(`global:${name}`);
  return Buffer.from(hash.slice(0, 16), 'hex');
};

const parseError = (error: any): string => {
  if (!error?.InstructionError) return `Unknown error: ${error}`;
  
  const [index, errorCode] = error.InstructionError;
  const errorType = Object.keys(errorCode)[0];
  
  const messages: Record<string, string> = {
    'InsufficientFunds': 'Not enough SOL',
    'Unauthorized': 'Admin only',
    'NoFeesToCollect': 'No fees available',
  };
  
  return messages[errorType] || `Error ${index}: ${errorType}`;
};

const log = (emoji: string, message: string, data?: any) => {
  console.log(`${emoji} ${message}`, data || '');
};

// ===============================
// VALIDATION LAYER
// ===============================

const validateWallet = (wallet: WalletContextState): PublicKey => {
  if (!wallet.connected || !wallet.publicKey) {
    throw new Error("Wallet not connected");
  }
  
  if (!wallet.publicKey.equals(ADMIN_PUBLICKEY)) {
    throw new Error("Unauthorized: Admin only");
  }
  
  return wallet.publicKey;
};

const validateBridge = async (): Promise<PublicKey> => {
  const bridgePda = await getBridgePda();
  const account = await connection.getAccountInfo(bridgePda);
  
  if (!account) throw new Error("Bridge not initialized");
  if (!account.owner.equals(PROGRAM_ID)) throw new Error("Wrong program owner");
  if (account.data.length !== BRIDGE_ACCOUNT_SIZE) throw new Error("Invalid account size");
  
  return bridgePda;
};

const validateBalance = async (pubkey: PublicKey): Promise<void> => {
  const balance = await connection.getBalance(pubkey);
  if (balance < MIN_BALANCE_BUFFER) {
    throw new Error(`Need ${MIN_BALANCE_BUFFER / 1e9} SOL for fees`);
  }
};

// ===============================
// FEE OPERATIONS
// ===============================

export const getAvailableFees = async (): Promise<number> => {
  try {
    const bridgePda = await getBridgePda();
    const account = await connection.getAccountInfo(bridgePda);
    
    if (!account || account.data.length !== BRIDGE_ACCOUNT_SIZE) return 0;
    
    const feesBytes = account.data.slice(FEES_OFFSET, FEES_OFFSET + 8);
    return feesBytes.reduce((acc, byte, i) => acc + byte * Math.pow(256, i), 0);
  } catch {
    return 0;
  }
};

const checkFees = async (): Promise<number> => {
  const fees = await getAvailableFees();
  if (fees === 0) throw new Error("No fees to collect");
  
  log("💰", "Fees available:", `${(fees / 1e9).toFixed(6)} SOL`);
  return fees;
};

// ===============================
// TRANSACTION BUILDERS
// ===============================

const createInstruction = (ctx: FeeCollectionContext): TransactionInstruction => {
  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: ctx.bridgePda, isSigner: false, isWritable: true },
      { pubkey: ctx.adminPubkey, isSigner: true, isWritable: true },
      { pubkey: ctx.feeCollectorWallet, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: createDiscriminator('collect_fees'),
  });
};

const buildTx = async (ix: TransactionInstruction, payer: PublicKey): Promise<Transaction> => {
  const { blockhash } = await connection.getLatestBlockhash('confirmed');
  return new Transaction({ recentBlockhash: blockhash, feePayer: payer }).add(ix);
};

// ===============================
// EXECUTION LAYER
// ===============================

const simulate = async (tx: Transaction): Promise<void> => {
  log("🧪", "Simulating...");
  
  const result = await connection.simulateTransaction(tx);
  if (result.value.err) {
    throw new Error(`Simulation failed: ${parseError(result.value.err)}`);
  }
  
  log("✅", "Simulation passed");
};

const execute = async (wallet: WalletContextState, tx: Transaction): Promise<string> => {
  const signature = await wallet.sendTransaction(tx, connection, {
    skipPreflight: false,
    preflightCommitment: "confirmed",
    maxRetries: 2,
  });
  
  if (!signature) throw new Error("No signature returned");
  
  log("📧", "Sent:", signature);
  return signature;
};

const confirm = async (signature: string): Promise<void> => {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  
  const result = await connection.confirmTransaction({
    blockhash,
    lastValidBlockHeight,
    signature,
  }, "confirmed");
  
  if (result.value.err) {
    throw new Error(`Confirmation failed: ${parseError(result.value.err)}`);
  }
  
  log("✅", "Confirmed");
};

// ===============================
// COMPOSITION HELPERS
// ===============================

const createContext = async (
  wallet: WalletContextState,
  feeCollectorWallet: PublicKey
): Promise<FeeCollectionContext> => {
  
  const adminPubkey = validateWallet(wallet);
  const bridgePda = await validateBridge();
  await validateBalance(adminPubkey);
  const availableFees = await checkFees();
  
  return { adminPubkey, bridgePda, feeCollectorWallet, availableFees };
};

const processTransaction = async (
  wallet: WalletContextState,
  ctx: FeeCollectionContext
): Promise<string> => {
  
  const instruction = createInstruction(ctx);
  const transaction = await buildTx(instruction, ctx.adminPubkey);
  
  await simulate(transaction);
  const signature = await execute(wallet, transaction);
  await confirm(signature);
  
  return signature;
};

// ===============================
// PUBLIC API
// ===============================

export const isAdminWallet = (pubkey: PublicKey | null): boolean => {
  return pubkey?.equals(ADMIN_PUBLICKEY) ?? false;
};

export const collectFees = async (
  wallet: WalletContextState,
  feeCollectorWallet: PublicKey
): Promise<string> => {
  
  try {
    log("🚀", "Starting fee collection...");
    
    // 1. Setup & Validation
    const ctx = await createContext(wallet, feeCollectorWallet);
    
    // 2. Execute Transaction  
    const signature = await processTransaction(wallet, ctx);
    
    // 3. Success
    log("🎉", "Success!");
    log("🔗", "Explorer:", `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    
    return signature;
    
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    log("💀", "Failed:", message);
    
    // Enhanced error messages
    const enhanced: Record<string, string> = {
      'Unauthorized': message + '\n💡 Only admin can collect fees',
      'No fees': message + '\n💡 Wait for bridge usage to accumulate fees',
      'not initialized': message + '\n💡 Initialize bridge first',
    };
    
    const errorKey = Object.keys(enhanced).find(key => message.includes(key));
    throw new Error(errorKey ? enhanced[errorKey] : message);
  }
};