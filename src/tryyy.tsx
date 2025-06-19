import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

//import for the solana wallet 
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';

// The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
const network = WalletAdapterNetwork.Devnet;
// You can provide a custom RPC endpoint here
const endpoint = clusterApiUrl(network);
//wallet config for the solana wallet .
const wallets = [
  new PhantomWalletAdapter(),
];



// Ethereum (Wagmi)
import { createConfig, http, WagmiProvider } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { metaMask, walletConnect } from 'wagmi/connectors'
//import { WagmiConfig, createConfig, configureChains } from 'wagmi';
//import { sepolia, mainnet } from 'wagmi/chains';
//import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
//import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
//import { publicProvider } from 'wagmi/providers/public';
//import { alchemyProvider } from 'wagmi/providers/alchemy';
// Configure chains (only mainnet for simplic
// Minimal setup - just public provider

//ethereum config 
const  wagmiConfig =  createConfig({
  chains: [mainnet, sepolia],
  transports:{
    [mainnet.id]:http(),
    [sepolia.id]:http()
  },
  connectors:[
    metaMask(),
    walletConnect({
       projectId: 'd059b17b54b65e1a02c16aab01472f18',
    })
  ]
})


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}   autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
    </WagmiProvider>
    
  </React.StrictMode>
);
