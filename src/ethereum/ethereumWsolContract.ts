//import React, { useState, useEffect } from 'react';
//import { Copy, ExternalLink, CheckCircle } from 'lucide-react';


//interface for only the network.
interface NetworkInfo {
 network: string;
 testnet: string;
 chainId: number;
 rpcUrl: string;
 explorerUrl: string;
 nativeCurrency: {
   name: string;
   symbol: string;
   decimals: number;
 };
}

//function to call the network
function getNetworkInfo(): NetworkInfo {
 return {
   network: "Ethereum Network",
   testnet: "Sepolia Testnet",
   chainId: 11155111, // Sepolia chain ID
   rpcUrl: "https://sepolia.publicnode.com",
   explorerUrl: "https://sepolia.etherscan.io",
   nativeCurrency: {
     name: "Sepolia Ether",
     symbol: "ETH",
     decimals: 18
   }
 };
}

//interface  for token details.
interface TokenDetails {
  name: string;
  symbol: string;
  contract: string;
}

//function for getting the token details
function getTokenDetails(): TokenDetails {
  return {
    name: "Wrapped SOL",
    symbol: "wSOL",
    contract: "0xba82C80E13beDdAE290edf6b016d7f981e43431f"
  };
}


//transaction interface amount
interface TransactionAmounts{
    inputAmount: number,
    outputAmount: number,
    usdValue: number,
    conversionRate: number,
}

//used for getting what ever transaction details.
function getTransactionAmounts(solInput: number): TransactionAmounts {
 const conversionRate = 0.995; // 1 SOL = 0.995 wSOL
 const solPriceUSD = 245.20;
 
 const outputAmount = solInput * conversionRate;
 const usdValue = outputAmount * solPriceUSD;
 
 return {
   inputAmount: solInput,
   outputAmount: outputAmount,
   usdValue: usdValue,
   conversionRate: conversionRate
 };
}


//interface for fee structure 
interface FeeStructure{
    bridgeFee: number,
    gasFee: number,
    totalFees: number
}
//the function
function getFeeStructure(solAmount: number): FeeStructure{
    const bridgeFee = solAmount * 0.003; // 0.3% bridge fee
    const gasFee = 0.002; // Fixed gas fee in SOL
    const totalFees = bridgeFee + gasFee;

    return{
        bridgeFee:bridgeFee,
        gasFee: gasFee,
        totalFees: totalFees
    }
}



//handle the wallet Addresses needed
interface WalletAddresses {
 recipientAddress: string;
 sourceAddress: string;
}

function getWalletAddresses(recipientAddress: string, sourceAddress: string): WalletAddresses {
 return {
   recipientAddress: recipientAddress,
   sourceAddress: sourceAddress
 };
}


//additional transaction data
interface TransactionMetadata {
  transactionType: string;
  estimatedCompletionTime: string;
  transactionHash: string | null;
  blockExplorerLink: string | null;
}

function getTransactionMetadata(txHash?: string): TransactionMetadata {
  return {
    transactionType: "cross-chain bridge",
    estimatedCompletionTime: "5-10 minutes",
    transactionHash: txHash || null,
    blockExplorerLink: txHash ? `https://sepolia.etherscan.io/tx/${txHash}` : null
  };
}



interface UIElements {
  canCopy: boolean;
  hasExternalLinks: boolean;
  showConfirmButton: boolean;
  statusIndicator: string;
}

function getUIElements(transactionStatus: string): UIElements {
  return {
    canCopy: true,
    hasExternalLinks: true,
    showConfirmButton: transactionStatus === "ready",
    statusIndicator: transactionStatus // "ready", "pending", "completed", "failed"
  };
}


export interface CompleteTransactionInfo {
 network: NetworkInfo;
 token: TokenDetails;
 transaction: TransactionAmounts;
 fees: FeeStructure;
 addresses: WalletAddresses;
 metadata: TransactionMetadata;
 ui: UIElements;
}


export async function getCompleteTransactionInfo(
 solInput: number,
 recipientAddress: string,
 sourceAddress: string,
 transactionStatus: string = "ready",
 txHash?: string
): Promise<CompleteTransactionInfo> {
 return {
   network: getNetworkInfo(),
   token: getTokenDetails(),
   transaction: getTransactionAmounts(solInput),
   fees: getFeeStructure(solInput),
   addresses: getWalletAddresses(recipientAddress, sourceAddress),
   metadata: getTransactionMetadata(txHash),
   ui: getUIElements(transactionStatus)
 };
}