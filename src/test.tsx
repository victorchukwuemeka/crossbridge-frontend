import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
//import './index.css';

//import for the solana wallet 
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
//import '@solana/wallet-adapter-react-ui/styles.css';

// The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
const network = WalletAdapterNetwork.Devnet;
// You can provide a custom RPC endpoint here
const endpoint = clusterApiUrl(network);
//wallet config for the solana wallet .
const wallets = [
  new PhantomWalletAdapter(),
];



// Ethereum (Wagmi)
import { createConfig, http, injected, WagmiProvider } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { metaMask, walletConnect } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();


//ethereum config 
const  wagmiConfig =  createConfig({
  chains: [mainnet, sepolia],
  transports:{
    [mainnet.id]:http(),
    [sepolia.id]:http()
  },
  connectors:[
    injected(),
    metaMask(),
    walletConnect({
       projectId: 'd059b17b54b65e1a02c16aab01472f18',
    })
  ]
})





ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
     <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
      <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}   autoConnect>
        <WalletModalProvider>
          <App/>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
    </WagmiProvider>
     </QueryClientProvider>

  </React.StrictMode>
);
