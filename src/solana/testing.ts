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

// Type for better error handling
interface SolanaError extends Error {
  logs?: string[];
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

  const userPublicKey = wallet.publicKey;
  
  try {
    console.log("🚀 Starting lockSol transaction...");
    console.log("👤 User:", userPublicKey.toBase58());
    console.log("💰 Amount:", amountLamports, "lamports (", amountLamports / 1e9, "SOL)");
    console.log("🏛️ Program ID:", PROGRAM_ID.toBase58());

    // 1. Get Bridge PDA
    const bridgePda = await getBridgePda();
    
    // PDAs should be OFF the curve, not ON the curve!
    if (PublicKey.isOnCurve(bridgePda.toBuffer())) {
      throw new Error("Invalid bridge PDA address - PDA should be off the curve");
    }
    
    console.log("✅ Valid PDA generated:", bridgePda.toBase58());

    // 2. Check if bridge account exists
    try {
      const bridgeAccountInfo = await connection.getAccountInfo(bridgePda);
      console.log("🏦 Bridge account info:", {
        exists: !!bridgeAccountInfo,
        owner: bridgeAccountInfo?.owner.toBase58(),
        lamports: bridgeAccountInfo?.lamports,
        dataLength: bridgeAccountInfo?.data.length
      });
    } catch (err) {
      console.warn("⚠️ Could not fetch bridge account info:", err);
    }

    // 3. Create instruction data
    const discriminator = Buffer.from([0x0c, 0xcf, 0x28, 0xe8, 0xb9, 0xb9, 0xdc, 0x9f]);
    const amountBytes = new BN(amountLamports).toArrayLike(Buffer, 'le', 8);
    const data = Buffer.concat([discriminator, amountBytes]);
    
    console.log("📦 Instruction data:", {
      discriminator: Array.from(discriminator),
      amountBytes: Array.from(amountBytes),
      totalData: Array.from(data)
    });

    // 4. Create instruction
    const ix = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: bridgePda, isSigner: false, isWritable: true },
        { pubkey: userPublicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });

    console.log("📋 Instruction accounts:", ix.keys.map(key => ({
      pubkey: key.pubkey.toBase58(),
      isSigner: key.isSigner,
      isWritable: key.isWritable
    })));

    // 5. Get fresh blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      .catch(err => {
        console.error("Blockhash error:", err);
        throw new Error("Network error: Failed to get blockhash");
      });

    console.log("🔗 Blockhash:", blockhash);

    // 6. Check balance
    const balance = await connection.getBalance(userPublicKey);
    const feeBuffer = 5000; // Conservative fee buffer
    if (balance < amountLamports + feeBuffer) {
      throw new Error(`Insufficient SOL. Need ${(amountLamports + feeBuffer)/1e9} SOL (including fees)`);
    }

    console.log("💳 Balance check:", {
      currentBalance: balance,
      balanceSOL: balance / 1e9,
      amountToLock: amountLamports,
      feeBuffer,
      totalNeeded: amountLamports + feeBuffer,
      remaining: balance - amountLamports - feeBuffer
    });

    // 7. Build transaction
    const tx = new Transaction({
      recentBlockhash: blockhash,
      feePayer: userPublicKey,
    }).add(ix);

    // 8. CRITICAL: Simulate transaction BEFORE sending
    console.log("🧪 Simulating transaction...");
    try {
      const simulation = await connection.simulateTransaction(tx)
      /*, {
        sigVerify: false,
        commitment: 'confirmed'
      });*/

      console.log("📊 Simulation result:", {
        err: simulation.value.err,
        logs: simulation.value.logs,
        unitsConsumed: simulation.value.unitsConsumed,
        returnData: simulation.value.returnData
      });

      /*if (simulation.value.err) {
        
        console.error("❌ Simulation failed:", simulation.value.err);
        console.error("📝 Simulation logs:", simulation.value.logs);
        
        // Parse common errors
        const logs = simulation.value.logs || [];
        const errorLog = logs.find(log => log.includes('Error:') || log.includes('failed'));
        
        if (errorLog) {
          throw new Error(`Program execution failed: ${errorLog}`);
        }
        
        throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
      }*/

      if (simulation.value.err) {
        console.error("❌ Simulation failed:", simulation.value.err);
        console.error("📝 Simulation logs:", simulation.value.logs);
        
        // Parse InstructionError specifically
        const error = simulation.value.err;
        if (error && typeof error === 'object' && 'InstructionError' in error) {
            const instructionError = (error as any).InstructionError;
            console.error("🔍 Instruction Error Details:", instructionError);
            
            if (Array.isArray(instructionError) && instructionError.length >= 2) {
                const [instructionIndex, errorCode] = instructionError;
                console.error(`📍 Error at instruction ${instructionIndex}:`, errorCode);
                
                // Parse common Solana error codes
                if (typeof errorCode === 'object') {
                    const errorType = Object.keys(errorCode)[0];
                    const errorValue = Object.values(errorCode)[0];
                    console.error(`❗ Error type: ${errorType}, Value: ${errorValue}`);
                    
                    // Common error mappings
                    const errorMessages: Record<string, string> = {
                        'Custom': `Custom program error: ${errorValue}`,
                        'InsufficientFunds': 'Insufficient funds to complete transaction',
                        'InvalidAccountData': 'Invalid account data or account not initialized',
                        // ... more error mappings
                    };
                    const friendlyMessage = errorMessages[errorType] || `Unknown error: ${errorType}`;
                    throw new Error(`Program execution failed: ${friendlyMessage}`);
                }
            }
        }
        // ... rest of error handling
        }
        
        console.log("✅ Simulation successful!");
        console.log("📝 Program logs:", simulation.value.logs);
    } catch (simError:any) {
        console.error("🚫 Simulation error:", simError);
        throw new Error(`Failed to simulate transaction:  ${simError?.message || simError}`);
    }

    // 9. Check transaction size
    const serialized = tx.serialize({ requireAllSignatures: false });
    console.log("📏 Transaction size:", serialized.length, "bytes (max 1232)");
    
    if (serialized.length > 1232) {
      throw new Error(`Transaction too large: ${serialized.length} bytes (max 1232)`);
    }

    console.debug("Transaction details:", {
      from: userPublicKey.toBase58(),
      to: bridgePda.toBase58(),
      amount: amountLamports,
      balance,
      feeBuffer,
      blockhash,
    });

    // 10. Send transaction
    console.log("📤 Sending transaction...");
    const options: SendOptions = {
      skipPreflight: false, // We already simulated, but let's be safe
      preflightCommitment: "confirmed",
      maxRetries: 3,
    };

    const signature = await wallet.sendTransaction(tx, connection, options)
      .catch(async (error: SolanaError) => {
        console.error("💥 Transaction send error:", {
          name: error.name,
          message: error.message,
          logs: error.logs,
          stack: error.stack,
        });

        // Try to get more specific error information
        if (error.message.includes('User rejected')) {
          throw new Error("Transaction cancelled by user");
        }

        if (error.message.includes('insufficient funds')) {
          throw new Error("Insufficient funds for transaction");
        }

        if (error.message.includes('0x1')) {
          throw new Error("Program error: Insufficient funds or invalid account");
        }

        if (error.logs) {
          const simplifiedLogs = error.logs
            .filter(log => log.includes("Error") || log.includes("failed"))
            .join('\n');
          throw new Error(`Program error: ${simplifiedLogs}`);
        }

        // If we get here, it's likely a wallet adapter issue
        throw new Error(`Wallet send failed: ${error.message}. Check if your wallet supports this transaction type.`);
      });

    console.log("📧 Transaction signature:", signature);

    // 11. Confirm transaction
    console.log("⏳ Confirming transaction...");
    const confirmation = await connection.confirmTransaction(
      {
        blockhash,
        lastValidBlockHeight,
        signature,
      },
      "confirmed"
    );

    if (confirmation.value.err) {
      console.error("❌ Confirmation error:", confirmation.value.err);
      throw new Error(`Transaction failed on-chain: ${JSON.stringify(confirmation.value.err)}`);
    }

    console.log("🎉 Transaction successful:", signature);
    return signature;

  } catch (error) {
    console.error("💀 Lock SOL failed:", error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Unknown error occurred";
      
    throw new Error(errorMessage);
  }
}

