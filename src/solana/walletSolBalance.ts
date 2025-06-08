import {  connection } from "./constants";
import type { WalletContextState } from "@solana/wallet-adapter-react";

/**
 * Fetches the SOL balance of a connected wallet
 * @param {WalletContextState} wallet - Wallet adapter context
 * @param {Connection} connection - Solana connection object
 * @returns {Promise<string>} Balance in SOL (as string with 9 decimal places)
 * @throws {Error} If wallet is disconnected or RPC fails
 */
export async function walletSolBalance(
  wallet: WalletContextState,
  
): Promise<string> {
  // Validate wallet connection
  if (!wallet.connected || !wallet.publicKey) {
    throw new Error("Wallet not connected");
  }

  try {
    // Get balance in lamports
    const lamports = await connection.getBalance(wallet.publicKey);
    
    // Convert to SOL (1 SOL = 1,000,000,000 lamports)
    const solBalance = lamports / 1e9;
    
    // Format with 9 decimal places (max SOL precision)
    return solBalance.toFixed(9);
    
  } catch (error) {
    // Type-safe error handling
    const err = error as Error;
    console.error("Balance fetch error:", err);
    throw new Error(`Failed to fetch balance: ${err.message}`);
  }
}