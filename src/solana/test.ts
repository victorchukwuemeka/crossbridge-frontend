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









// Alternative function that uses connection.sendRawTransaction instead of wallet.sendTransaction
export async function lockSolAlternative(
  wallet: WalletContextState,
  amountLamports: number
): Promise<string> {
  if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected or doesn't support signing");
  }

  try {
    console.log("🔄 Trying alternative send method...");
    
    // Build the same transaction as above
    const userPublicKey = wallet.publicKey;
    const bridgePda = await getBridgePda();
    
    const discriminator = Buffer.from([0x0c, 0xcf, 0x28, 0xe8, 0xb9, 0xb9, 0xdc, 0x9f]);
    const amountBytes = new BN(amountLamports).toArrayLike(Buffer, 'le', 8);
    const data = Buffer.concat([discriminator, amountBytes]);

    const ix = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: bridgePda, isSigner: false, isWritable: true },
        { pubkey: userPublicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    
    const tx = new Transaction({
      recentBlockhash: blockhash,
      feePayer: userPublicKey,
    }).add(ix);

    // Simulate first
    const simulation = await connection.simulateTransaction(tx);
    if (simulation.value.err) {
      throw new Error(`Simulation failed: ${JSON.stringify(simulation.value.err)}`);
    }

    // Sign the transaction using wallet
    const signedTx = await wallet.signTransaction(tx);

    // Send using connection instead of wallet
    const signature = await connection.sendRawTransaction(signedTx.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
      maxRetries: 3,
    });

    // Confirm
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    }, 'confirmed');

    console.log("✅ Alternative method successful:", signature);
    return signature;

  } catch (error) {
    console.error("Alternative method failed:", error);
    throw error;
  }
}