import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  Connection,
} from "@solana/web3.js";
import type { SendOptions } from "@solana/web3.js";
import BN from "bn.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { PROGRAM_ID, connection } from "./constants";
import { getBridgePda } from "./pda";
import { Buffer } from 'buffer';
import { sha256 } from 'js-sha256';

// Type for better error handling
interface SolanaError extends Error {
  logs?: string[];
}

// Function to generate Anchor instruction discriminator
function getInstructionDiscriminator(instructionName: string): Buffer {
  const hash = sha256(`global:${instructionName}`);
  return Buffer.from(hash.slice(0, 16), 'hex'); // First 8 bytes (16 hex chars)
}

// Enhanced error parsing for Anchor programs
function parseAnchorError(error: any): string {
  if (!error || typeof error !== 'object') {
    return `Unknown error: ${error}`;
  }

  // Handle InstructionError format
  if ('InstructionError' in error) {
    const instructionError = error.InstructionError;
    if (Array.isArray(instructionError) && instructionError.length >= 2) {
      const [instructionIndex, errorCode] = instructionError;
      
      if (typeof errorCode === 'object') {
        const errorType = Object.keys(errorCode)[0];
        const errorValue = Object.values(errorCode)[0];
        
        // Map common Anchor/Solana errors
        const anchorErrorMap: Record<number, string> = {
          101: "InstructionFallbackNotFound - The instruction you're calling doesn't exist",
          102: "InstructionDidNotDeserialize - Invalid instruction data format",
          103: "InstructionDidNotSerialize - Failed to serialize instruction",
          300: "AccountDiscriminatorAlreadySet - Account already initialized",
          301: "AccountDiscriminatorNotFound - Account not initialized or wrong type",
          302: "AccountDidNotDeserialize - Failed to deserialize account data",
          303: "AccountDidNotSerialize - Failed to serialize account data",
          304: "AccountNotEnoughKeys - Missing required accounts",
          305: "AccountNotMutable - Account should be mutable but isn't",
          306: "AccountOwnedByWrongProgram - Account owned by wrong program",
          2001: "InsufficientFunds - Not enough lamports for transaction",
          2002: "InvalidAccountData - Account data is invalid",
          2003: "InvalidAccountOwner - Account has wrong owner",
          2004: "UninitializedAccount - Account not initialized",
        };

        if (errorType === 'Custom' && typeof errorValue === 'number') {
          const friendlyMessage = anchorErrorMap[errorValue] || `Custom program error: ${errorValue}`;
          return `Error at instruction ${instructionIndex}: ${friendlyMessage}`;
        }

        // Handle other error types
        const errorMessages: Record<string, string> = {
          'InsufficientFunds': 'Insufficient funds to complete transaction',
          'InvalidAccountData': 'Invalid account data or account not initialized',
          'AccountNotFound': 'Required account not found',
          'InvalidArgument': 'Invalid argument provided',
          'InvalidInstruction': 'Invalid instruction',
          'MissingRequiredSignature': 'Missing required signature',
          'AccountAlreadyInUse': 'Account already in use',
          'AccountLoadedTwice': 'Account loaded twice in transaction',
          'AccountNotRentExempt': 'Account not rent exempt',
          'UnsupportedSysvar': 'Unsupported sysvar',
        };

        const friendlyMessage = errorMessages[errorType] || `${errorType}: ${errorValue}`;
        return `Error at instruction ${instructionIndex}: ${friendlyMessage}`;
      }
    }
  }

  return `Transaction failed: ${JSON.stringify(error)}`;
}

export async function lockSol(
  wallet: WalletContextState,
  amountLamports: number
): Promise<string> {
  // Validate inputs
  if (!wallet.connected || !wallet.publicKey) {
    throw new Error("Wallet not connected");
  }
  if (amountLamports <= 0) {
    throw new Error("Amount must be positive");
  }
  if (amountLamports < 1000) {
    throw new Error("Amount too small (minimum 1000 lamports)");
  }

  const userPublicKey = wallet.publicKey;
  
  try {
    console.log("🚀 Starting lockSol transaction...");
    console.log("👤 User:", userPublicKey.toBase58());
    console.log("💰 Amount:", amountLamports, "lamports (", amountLamports / 1e9, "SOL)");
    console.log("🏛️ Program ID:", PROGRAM_ID.toBase58());

    // 1. Validate Program ID
    if (!PROGRAM_ID || PROGRAM_ID.equals(PublicKey.default)) {
      throw new Error("Invalid program ID");
    }

    // 2. Get Bridge PDA
    let bridgePda: PublicKey;
    try {
      bridgePda = await getBridgePda();
    } catch (err) {
      console.error("Failed to derive bridge PDA:", err);
      throw new Error("Failed to derive bridge PDA address");
    }
    
    // PDAs should be OFF the curve, not ON the curve!
    if (PublicKey.isOnCurve(bridgePda.toBuffer())) {
      throw new Error("Invalid bridge PDA address - PDA should be off the curve");
    }
    
    console.log("✅ Valid PDA generated:", bridgePda.toBase58());

    // 3. Check network connectivity
    try {
      const slot = await connection.getSlot();
      console.log("🌐 Network connected, current slot:", slot);
    } catch (err) {
      console.error("Network connectivity error:", err);
      throw new Error("Network connection failed. Please check your internet connection.");
    }

    // 4. Check if bridge account exists and is properly initialized
    let bridgeAccountInfo;
    try {
      bridgeAccountInfo = await connection.getAccountInfo(bridgePda);
    } catch (err) {
      console.error("Failed to fetch bridge account info:", err);
      throw new Error("Failed to fetch bridge account information");
    }

    console.log("🏦 Bridge account info:", {
      exists: !!bridgeAccountInfo,
      owner: bridgeAccountInfo?.owner.toBase58(),
      lamports: bridgeAccountInfo?.lamports,
      dataLength: bridgeAccountInfo?.data.length
    });

    if (!bridgeAccountInfo) {
      throw new Error("Bridge account not initialized. You need to call initialize() first.");
    }

    // Verify bridge account is owned by our program
    if (!bridgeAccountInfo.owner.equals(PROGRAM_ID)) {
      throw new Error(`Bridge account owned by wrong program. Expected: ${PROGRAM_ID.toBase58()}, Got: ${bridgeAccountInfo.owner.toBase58()}`);
    }

    // Verify bridge account has correct data size (8 discriminator + 8 total_locked + 1 bump = 17 bytes)
    if (bridgeAccountInfo.data.length !== 17) {
      throw new Error(`Bridge account has wrong data size. Expected 17 bytes, got ${bridgeAccountInfo.data.length}`);
    }

    // 5. Check user balance
    let balance: number;
    try {
      balance = await connection.getBalance(userPublicKey);
    } catch (err) {
      console.error("Failed to fetch user balance:", err);
      throw new Error("Failed to fetch account balance");
    }

    const feeBuffer = 10000; // More conservative fee buffer (0.00001 SOL)
    const totalNeeded = amountLamports + feeBuffer;
    
    if (balance < totalNeeded) {
      throw new Error(
        `Insufficient SOL. Balance: ${(balance/1e9).toFixed(6)} SOL, ` +
        `Need: ${(totalNeeded/1e9).toFixed(6)} SOL (including ~${(feeBuffer/1e9).toFixed(6)} SOL for fees)`
      );
    }

    console.log("💳 Balance check:", {
      currentBalance: balance,
      balanceSOL: (balance / 1e9).toFixed(6),
      amountToLock: amountLamports,
      amountSOL: (amountLamports / 1e9).toFixed(6),
      feeBuffer,
      totalNeeded,
      remaining: balance - totalNeeded
    });

    // 6. Create instruction data with correct discriminator
    let discriminator: Buffer;
    try {
      discriminator = getInstructionDiscriminator('lock_sol');
    } catch (err) {
      console.error("Failed to generate discriminator:", err);
      throw new Error("Failed to generate instruction discriminator");
    }

    const amountBytes = new BN(amountLamports).toArrayLike(Buffer, 'le', 8);
    const data = Buffer.concat([discriminator, amountBytes]);
    
    console.log("📦 Instruction data:", {
      discriminator: Array.from(discriminator),
      discriminatorHex: discriminator.toString('hex'),
      amountBytes: Array.from(amountBytes),
      amountHex: amountBytes.toString('hex'),
      totalData: Array.from(data),
      totalDataHex: data.toString('hex')
    });

    // 7. Create instruction with proper account ordering
    const ix = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: bridgePda, isSigner: false, isWritable: true },        // bridge_account
        { pubkey: userPublicKey, isSigner: true, isWritable: true },     // user (signer)
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
      ],
      data,
    });

    console.log("📋 Instruction accounts:", ix.keys.map((key, index) => ({
      index,
      pubkey: key.pubkey.toBase58(),
      isSigner: key.isSigner,
      isWritable: key.isWritable,
      name: index === 0 ? 'bridge_account' : index === 1 ? 'user' : 'system_program'
    })));

    // 8. Get fresh blockhash with retry logic
    let blockhash: string;
    let lastValidBlockHeight: number;
    
    try {
      const blockhashResponse = await connection.getLatestBlockhash('confirmed');
      blockhash = blockhashResponse.blockhash;
      lastValidBlockHeight = blockhashResponse.lastValidBlockHeight;
    } catch (err) {
      console.error("Blockhash error:", err);
      throw new Error("Network error: Failed to get blockhash. Please check your connection.");
    }

    console.log("🔗 Blockhash info:", {
      blockhash,
      lastValidBlockHeight,
      currentSlot: await connection.getSlot().catch(() => 'unknown')
    });

    // 9. Build transaction
    const tx = new Transaction({
      recentBlockhash: blockhash,
      feePayer: userPublicKey,
    }).add(ix);

    // 10. Check transaction size
    try {
      const serialized = tx.serialize({ requireAllSignatures: false });
      console.log("📏 Transaction size:", serialized.length, "bytes (max 1232)");
      
      if (serialized.length > 1232) {
        throw new Error(`Transaction too large: ${serialized.length} bytes (max 1232)`);
      }
    } catch (err) {
      console.error("Transaction serialization error:", err);
      throw new Error("Failed to serialize transaction");
    }

    // 11. CRITICAL: Simulate transaction BEFORE sending
    console.log("🧪 Simulating transaction...");
    let simulation;
    
    try {
        
      simulation = await connection.simulateTransaction(tx);
      /* {
        sigVerify: false,
        commitment: 'confirmed',
        replaceRecentBlockhash: true, // Use fresh blockhash for simulation
      });*/
    } catch (simError: any) {
      console.error("🚫 Simulation request failed:", simError);
      throw new Error(`Failed to simulate transaction: ${simError?.message || simError}`);
    }

    console.log("📊 Simulation result:", {
      err: simulation.value.err,
      logs: simulation.value.logs,
      unitsConsumed: simulation.value.unitsConsumed,
      returnData: simulation.value.returnData
    });

    if (simulation.value.err) {
      console.error("❌ Simulation failed:", simulation.value.err);
      console.error("📝 Simulation logs:", simulation.value.logs);
      
      const errorMessage = parseAnchorError(simulation.value.err);
      
      // Check for specific common errors and provide helpful messages
      if (simulation.value.logs) {
        const logs = simulation.value.logs.join('\n');
        
        if (logs.includes('InstructionFallbackNotFound') || logs.includes('Fallback functions are not supported')) {
          throw new Error("Instruction not found. This usually means the function name doesn't match your program or the discriminator is wrong.");
        }
        
        if (logs.includes('insufficient funds')) {
          throw new Error("Insufficient funds for the transaction");
        }
        
        if (logs.includes('AccountNotFound')) {
          throw new Error("Required account not found. Make sure the bridge account is initialized.");
        }
        
        if (logs.includes('invalid account data')) {
          throw new Error("Invalid account data. The bridge account may be corrupted or have wrong format.");
        }
      }
      
      throw new Error(`Transaction simulation failed: ${errorMessage}`);
    }
        
    console.log("✅ Simulation successful!");
    console.log("📝 Program logs:", simulation.value.logs);
    console.log("⛽ Compute units consumed:", simulation.value.unitsConsumed);

    // 12. Verify simulation logs for success indicators
    if (simulation.value.logs) {
      const hasSuccess = simulation.value.logs.some(log => 
        log.includes('Program log: LockEvent') || 
        log.includes('succeeded') ||
        !log.includes('failed') && !log.includes('Error')
      );
      
      if (hasSuccess) {
        console.log("✅ Simulation shows successful execution");
      }
    }

    // 13. Send transaction with enhanced error handling
    console.log("📤 Sending transaction...");
    const options: SendOptions = {
      skipPreflight: false, // Double-check even though we simulated
      preflightCommitment: "confirmed",
      maxRetries: 5,
    };

    let signature: string;
    try {
      signature = await wallet.sendTransaction(tx, connection, options);
    } catch (error: any) {
      console.error("💥 Transaction send error:", {
        name: error.name,
        message: error.message,
        logs: error.logs,
        stack: error.stack,
      });

      // Handle specific wallet/send errors
      if (error.message.includes('User rejected') || error.message.includes('declined')) {
        throw new Error("Transaction cancelled by user");
      }

      if (error.message.includes('insufficient funds')) {
        throw new Error("Insufficient funds for transaction");
      }

      if (error.message.includes('Blockhash not found')) {
        throw new Error("Transaction expired. Please try again.");
      }

      if (error.message.includes('0x1')) {
        throw new Error("Program error: Insufficient funds or invalid account state");
      }

      if (error.message.includes('0x0')) {
        throw new Error("Program error: Generic program failure");
      }

      // Parse logs if available
      if (error.logs) {
        const simplifiedLogs = error.logs
          .filter((log: string) => log.includes("Error") || log.includes("failed"))
          .join('\n');
        if (simplifiedLogs) {
          throw new Error(`Program error: ${simplifiedLogs}`);
        }
      }

      // Wallet-specific errors
      if (error.message.includes('WalletSendTransactionError')) {
        throw new Error(`Wallet error: ${error.message}. Please try reconnecting your wallet.`);
      }

      throw new Error(`Transaction send failed: ${error.message}`);
    }

    if (!signature) {
      throw new Error("Transaction send returned empty signature");
    }

    console.log("📧 Transaction signature:", signature);

    // 14. Confirm transaction with timeout and retry
    console.log("⏳ Confirming transaction...");
    let confirmation;
    
    try {
      confirmation = await connection.confirmTransaction(
        {
          blockhash,
          lastValidBlockHeight,
          signature,
        },
        "confirmed"
      );
    } catch (confirmError: any) {
      console.error("Confirmation timeout or error:", confirmError);
      
      // Even if confirmation times out, the transaction might have succeeded
      console.log("🔍 Checking transaction status directly...");
      try {
        const txStatus = await connection.getTransaction(signature, {
          commitment: 'confirmed',
          maxSupportedTransactionVersion: 0
        });
        
        if (txStatus && !txStatus.meta?.err) {
          console.log("✅ Transaction found and successful despite confirmation timeout");
          return signature;
        } else if (txStatus?.meta?.err) {
          console.error("❌ Transaction found but failed:", txStatus.meta.err);
          throw new Error(`Transaction failed: ${JSON.stringify(txStatus.meta.err)}`);
        }
      } catch (statusError) {
        console.error("Failed to check transaction status:", statusError);
      }
      
      throw new Error("Transaction confirmation timed out. Transaction may still be processing.");
    }

    if (confirmation.value.err) {
      console.error("❌ Confirmation error:", confirmation.value.err);
      const errorMessage = parseAnchorError(confirmation.value.err);
      throw new Error(`Transaction failed on-chain: ${errorMessage}`);
    }

    // 15. Final verification - check the transaction details
    try {
      console.log("🔍 Verifying transaction details...");
      const txDetails = await connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      });
      
      if (txDetails) {
        console.log("📋 Transaction details:", {
          slot: txDetails.slot,
          blockTime: txDetails.blockTime,
          fee: txDetails.meta?.fee,
          computeUnitsConsumed: txDetails.meta?.computeUnitsConsumed,
          logMessages: txDetails.meta?.logMessages?.length,
          success: !txDetails.meta?.err
        });
        
        // Check for our specific success log
        const successLogs = txDetails.meta?.logMessages?.filter(log => 
          log.includes('LockEvent') || log.includes('Program log:')
        );
        
        if (successLogs && successLogs.length > 0) {
          console.log("✅ Success logs found:", successLogs);
        }
      }
    } catch (verifyError) {
      console.warn("⚠️ Could not verify transaction details:", verifyError);
      // Don't throw here, transaction was confirmed
    }

    console.log("🎉 Transaction successful:", signature);
    console.log(`🔗 View on explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    
    return signature;

  } catch (error) {
    console.error("💀 Lock SOL failed:", error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Unknown error occurred";
      
    // Add helpful context for common issues
    let helpfulError = errorMessage;
    
    if (errorMessage.includes('Bridge account not initialized')) {
      helpfulError += "\n\n💡 Solution: Call initializeBridge(wallet) first to set up the bridge account.";
    }
    
    if (errorMessage.includes('InstructionFallbackNotFound')) {
      helpfulError += "\n\n💡 Solution: Make sure your program is deployed correctly and the function name matches.";
    }
    
    if (errorMessage.includes('insufficient funds')) {
      helpfulError += "\n\n💡 Solution: Add more SOL to your wallet or reduce the lock amount.";
    }
    
    throw new Error(helpfulError);
  }
}

// Initialize bridge account function
export async function initializeBridge(
  wallet: WalletContextState
): Promise<string> {
  //check wallet connection 
  if (!wallet.connected || !wallet.publicKey) {
    throw new Error("Wallet not connected");
  }

  try {
    console.log("🚀 Initializing bridge account...");
    console.log("👛 Wallet public key:", wallet.publicKey.toBase58());
    
    const bridgePda = await getBridgePda();
    console.log("🏦 Bridge PDA:", bridgePda.toBase58());
    
    // Check if already initialized
    const bridgeAccountInfo = await connection.getAccountInfo(bridgePda);
    if (bridgeAccountInfo) {
      console.log("✅ Bridge account already initialized");
      console.log("📊 Account info:", {
        owner: bridgeAccountInfo.owner.toBase58(),
        lamports: bridgeAccountInfo.lamports,
        dataLength: bridgeAccountInfo.data.length
      });
      return "already_initialized";
    }

    // Check user balance for initialization
    const balance = await connection.getBalance(wallet.publicKey);
    const rentExemptAmount = await connection.getMinimumBalanceForRentExemption(17); // Account size
    const feeBuffer = 10000;
    const totalNeeded = rentExemptAmount + feeBuffer;
    
    if (balance < totalNeeded) {
      throw new Error(
        `Insufficient SOL for initialization. Need ~${(totalNeeded/1e9).toFixed(6)} SOL ` +
        `(${(rentExemptAmount/1e9).toFixed(6)} for rent + fees)`
      );
    }

    console.log("💰 Initialization cost:", {
      rentExempt: rentExemptAmount,
      feeBuffer,
      totalNeeded,
      userBalance: balance
    });

    const discriminator = getInstructionDiscriminator('initialize');
    
    const ix = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: bridgePda, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: discriminator,
    });

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    
    const tx = new Transaction({
      recentBlockhash: blockhash,
      feePayer: wallet.publicKey,
    }).add(ix);

    // Simulate first
    console.log("🧪 Simulating initialize transaction...");
    const simulation = await connection.simulateTransaction(tx);
    /*{
      sigVerify: false,
      commitment: 'confirmed'
    });*/

    if (simulation.value.err) {
      console.error("❌ Initialize simulation failed:", simulation.value.err);
      console.error("📝 Simulation logs:", simulation.value.logs);
      const errorMessage = parseAnchorError(simulation.value.err);
      throw new Error(`Initialize simulation failed: ${errorMessage}`);
    }

    console.log("✅ Initialize simulation successful");
    console.log("📝 Simulation logs:", simulation.value.logs);

    const signature = await wallet.sendTransaction(tx, connection, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
      maxRetries: 3,
    });
    
    console.log("📧 Initialize signature:", signature);
    
    const confirmation = await connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature,
    });

    if (confirmation.value.err) {
      console.error("❌ Initialize confirmation error:", confirmation.value.err);
      throw new Error(`Initialize failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    // Verify the account was created correctly
    const newAccountInfo = await connection.getAccountInfo(bridgePda);
    if (!newAccountInfo) {
      throw new Error("Bridge account was not created successfully");
    }

    console.log("🎉 Bridge initialized successfully:", signature);
    console.log("✅ Bridge account created:", {
      address: bridgePda.toBase58(),
      owner: newAccountInfo.owner.toBase58(),
      lamports: newAccountInfo.lamports,
      dataLength: newAccountInfo.data.length
    });
    
    return signature;
    
  } catch (error) {
    console.error("💀 Initialize bridge failed:", error);
    throw error;
  }
}