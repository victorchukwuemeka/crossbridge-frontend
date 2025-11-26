import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './docs.module.css';

// Icon components as SVG
interface IconProps {
  children: React.ReactNode;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ children, className, ...props }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={className} {...props}>
    {children}
  </svg>
);

const BookIcon = () => (
  <Icon><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm2 0v12h8V2H4z"/><path d="M6 4h4v1H6V4zm0 2h4v1H6V6zm0 2h4v1H6V8z"/></Icon>
);

const ExchangeIcon = () => (
  <Icon><path d="M0 4a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1zm0 8a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1z"/><path d="M11.5 1.5a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0V2.707L8.854 4.854a.5.5 0 1 1-.708-.708L10.293 2H8a.5.5 0 0 1 0-1h3a.5.5 0 0 1 .5.5zm-7 9a.5.5 0 0 1 .5.5v2.293l2.146-2.147a.5.5 0 0 1 .708.708L5.707 14H8a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5z"/></Icon>
);

const FireIcon = () => (
  <Icon><path d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.777 11.777 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7.159 7.159 0 0 0 1.048-.625 11.775 11.775 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.541 1.541 0 0 0-1.044-1.263 62.467 62.467 0 0 0-2.887-.87C9.843.266 8.69 0 8 0zm2.5 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></Icon>
);

const WalletIcon = () => (
  <Icon><path d="M0 3a2 2 0 0 1 2-2h13.5a.5.5 0 0 1 0 1H15v2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a2 2 0 0 1-2-2V3zm1 1.732V13a1 1 0 0 0 1 1h12V5H2a1.99 1.99 0 0 1-1-.268z"/><path d="M13 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></Icon>
);

const ShieldIcon = () => (
  <Icon><path d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.777 11.777 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7.159 7.159 0 0 0 1.048-.625 11.775 11.775 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.541 1.541 0 0 0-1.044-1.263 62.467 62.467 0 0 0-2.887-.87C9.843.266 8.69 0 8 0z"/></Icon>
);

const CoinsIcon = () => (
  <Icon><path d="M8 11.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13zm0-12a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z"/><path d="M8 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 1a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></Icon>
);

const ToolsIcon = () => (
  <Icon><path d="M0 1l1-1 3.081 2.2a1 1 0 0 1 .419.815v.07a1 1 0 0 0 .293.708L10.5 9.5l.914-.305a1 1 0 0 1 1.023.242l3.356 3.356a1 1 0 0 1 0 1.414l-1.586 1.586a1 1 0 0 1-1.414 0l-3.356-3.356a1 1 0 0 1-.242-1.023L9.5 10.5 3.793 4.793a1 1 0 0 0-.707-.293h-.071a1 1 0 0 1-.814-.419L0 1zm11.354 9.646a.5.5 0 0 0-.708.708l3 3a.5.5 0 0 0 .708-.708l-3-3z"/></Icon>
);

const LockIcon = () => (
  <Icon><path d="M8 1a3 3 0 0 1 3 3v2H5V4a3 3 0 0 1 3-3zm2 5V4a2 2 0 1 0-4 0v2h4z"/><path d="M3 7h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/></Icon>
);

const ChartIcon = () => (
  <Icon><path d="M0 0h1v15h15v1H0V0zm10 11.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 0-.5.5v4zm-5 2A.5.5 0 0 0 5.5 14h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 0-.5.5v7zM.5 14a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5H.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5H.5z"/></Icon>
);

const CodeIcon = () => (
  <Icon><path d="M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8l3.147-3.146zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8l-3.147-3.146z"/></Icon>
);

const NetworkIcon = () => (
  <Icon><path d="M6 1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM1 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm6 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm6 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM6 15a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/><path d="M5 2v3h1V2H5zM1 7v1h3V7H1zm8 0v1h3V7H9zM5 10v3h1v-3H5zm6 0v3h1v-3h-1z"/></Icon>
);

const RocketIcon = () => (
  <Icon><path d="M8 0c4.97 0 9 4.03 9 9a9 9 0 0 1-18 0c0-4.97 4.03-9 9-9zm0 1a8 8 0 1 0 0 16A8 8 0 0 0 8 1zm.5 4.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 11.293V5.5a.5.5 0 0 1 1 0z"/></Icon>
);

const BarsIcon = () => (
  <Icon><path d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/></Icon>
);

const TimesIcon = () => (
  <Icon><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854z"/></Icon>
);

const GithubIcon = () => (
  <Icon><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></Icon>
);

const TwitterIcon = () => (
  <Icon><path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/></Icon>
);

const DiscordIcon = () => (
  <Icon><path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019z"/></Icon>
);

const ExternalIcon = () => (
  <Icon><path d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/><path d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/></Icon>
);

const ChevronIcon = () => (
  <Icon><path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></Icon>
);

// Types
interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface NavCategory {
  category: string;
  items: NavItem[];
}

interface ContentSection {
  heading: string;
  content?: string;
  items?: string[];
  steps?: string[];
}

interface ContentData {
  title: string;
  sections: ContentSection[];
}

interface ContentMap {
  [key: string]: ContentData;
}

const DocsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems: NavCategory[] = [
    {
      category: 'Getting Started',
      items: [
        { id: 'overview', label: 'Overview', icon: <BookIcon /> },
        { id: 'quickstart', label: 'Quick Start', icon: <RocketIcon /> },
        { id: 'wallet', label: 'Connect Wallet', icon: <WalletIcon /> }
      ]
    },
    {
      category: 'Core Concepts',
      items: [
        { id: 'bridge', label: 'Bridge to WSOL', icon: <ExchangeIcon /> },
        { id: 'burn', label: 'Burn to SOL', icon: <FireIcon /> },
        { id: 'fees', label: 'Fee Structure', icon: <CoinsIcon /> }
      ]
    },
    {
      category: 'Advanced',
      items: [
        { id: 'security', label: 'Security', icon: <ShieldIcon /> },
        { id: 'architecture', label: 'Architecture', icon: <NetworkIcon /> },
        { id: 'smart-contracts', label: 'Smart Contracts', icon: <CodeIcon /> },
        { id: 'economics', label: 'Economics', icon: <ChartIcon /> }
      ]
    },
    {
      category: 'Resources',
      items: [
        { id: 'troubleshooting', label: 'Troubleshooting', icon: <ToolsIcon /> },
        { id: 'api', label: 'API Reference', icon: <CodeIcon /> }
      ]
    }
  ];

  const content: ContentMap = {
    overview: {
      title: 'Overview',
      sections: [
        {
          heading: 'What is CrossBridge?',
          content: 'CrossBridge is a secure, decentralized protocol for bridging assets between Solana and other blockchain networks. Built with advanced cryptography and audited smart contracts, CrossBridge enables seamless token transfers while maintaining the highest security standards.'
        },
        {
          heading: 'Key Features',
          items: [
            'Trustless cross-chain transfers',
            'Sub-second transaction finality',
            'Minimal gas fees',
            'Audited smart contracts',
            'Non-custodial architecture'
          ]
        },
        {
          heading: 'Supported Networks',
          content: 'Currently supporting Solana, Ethereum, Polygon, and Binance Smart Chain with more networks coming soon.'
        }
      ]
    },
    quickstart: {
      title: 'Quick Start',
      sections: [
        {
          heading: 'Get Started in 3 Steps',
          steps: [
            'Connect your Solana wallet (Phantom, Solflare, or any SPL-compatible wallet)',
            'Select the token and amount you want to bridge',
            'Confirm the transaction and wait for confirmation'
          ]
        },
        {
          heading: 'Prerequisites',
          items: [
            'A Solana wallet with sufficient SOL for gas fees',
            'Tokens you wish to bridge',
            'Basic understanding of blockchain transactions'
          ]
        }
      ]
    },
    wallet: {
      title: 'Connect Wallet',
      sections: [
        {
          heading: 'Supported Wallets',
          content: 'CrossBridge supports all major Solana wallets including Phantom, Solflare, Backpack, and any wallet compatible with the Solana Wallet Adapter.'
        },
        {
          heading: 'How to Connect',
          steps: [
            'Click "Connect Wallet" in the top right corner',
            'Select your preferred wallet from the list',
            'Approve the connection in your wallet',
            'Your wallet is now connected and ready to use'
          ]
        },
        {
          heading: 'Security Best Practices',
          items: [
            'Never share your private keys or seed phrase',
            'Always verify the URL before connecting',
            'Use hardware wallets for large amounts',
            'Keep your wallet software updated'
          ]
        }
      ]
    },
    bridge: {
      title: 'Bridge to WSOL',
      sections: [
        {
          heading: 'What is WSOL?',
          content: 'Wrapped SOL (WSOL) is an SPL token representation of native SOL, enabling SOL to interact with smart contracts and DeFi protocols that require SPL token standards.'
        },
        {
          heading: 'Bridging Process',
          steps: [
            'Enter the amount of SOL you want to wrap',
            'Review the transaction details and estimated fees',
            'Click "Bridge" and confirm in your wallet',
            'Wait for transaction confirmation (typically 1-2 seconds)',
            'WSOL will appear in your wallet'
          ]
        },
        {
          heading: 'Important Notes',
          items: [
            'Bridging is irreversible - ensure correct amounts',
            'Small gas fee required for transaction',
            'WSOL maintains 1:1 peg with SOL',
            'Can be unwrapped back to SOL at any time'
          ]
        }
      ]
    },
    burn: {
      title: 'Burn to SOL',
      sections: [
        {
          heading: 'Unwrapping WSOL',
          content: 'Burning WSOL converts your wrapped tokens back to native SOL. This process is instant and maintains the 1:1 ratio.'
        },
        {
          heading: 'How to Burn',
          steps: [
            'Navigate to the "Burn" section',
            'Enter the amount of WSOL to unwrap',
            'Review the transaction and fees',
            'Confirm the burn transaction',
            'Native SOL will be returned to your wallet'
          ]
        },
        {
          heading: 'Fee Structure',
          content: 'Burning WSOL only requires a minimal Solana network fee (typically < 0.001 SOL). No additional protocol fees are charged for unwrapping.'
        }
      ]
    },
    fees: {
      title: 'Fee Structure',
      sections: [
        {
          heading: 'Transaction Fees',
          content: 'CrossBridge employs a transparent fee structure to ensure sustainability while keeping costs minimal for users.'
        },
        {
          heading: 'Fee Breakdown',
          items: [
            'Bridge Fee: 0.1% of transaction amount',
            'Network Gas: Variable (typically 0.000005 SOL)',
            'No hidden fees or charges',
            'Volume discounts available for large transactions'
          ]
        },
        {
          heading: 'Fee Distribution',
          content: 'Protocol fees are distributed to validators, liquidity providers, and the CrossBridge treasury for ongoing development and security audits.'
        }
      ]
    },
    security: {
      title: 'Security',
      sections: [
        {
          heading: 'Security Model',
          content: 'CrossBridge implements multiple layers of security including multi-signature requirements, time-locks, and continuous monitoring systems.'
        },
        {
          heading: 'Audit Reports',
          content: 'All smart contracts have been audited by leading security firms including CertiK and Quantstamp. Audit reports are publicly available.'
        },
        {
          heading: 'Best Practices',
          items: [
            'Always verify contract addresses before interacting',
            'Start with small test transactions',
            'Enable transaction notifications in your wallet',
            'Monitor your transactions on block explorers',
            'Report any suspicious activity immediately'
          ]
        }
      ]
    },
    architecture: {
      title: 'Architecture',
      sections: [
        {
          heading: 'System Design',
          content: 'CrossBridge utilizes a hybrid architecture combining on-chain validation with off-chain message passing for optimal performance and security.'
        },
        {
          heading: 'Core Components',
          items: [
            'Bridge Contracts: Handle token locking and minting',
            'Validator Network: Decentralized validator set',
            'Relay System: Cross-chain message delivery',
            'Oracle Network: Price feeds and verification'
          ]
        },
        {
          heading: 'Transaction Flow',
          content: 'Transactions are validated by multiple independent validators before execution, ensuring security and preventing double-spending.'
        }
      ]
    },
    'smart-contracts': {
      title: 'Smart Contracts',
      sections: [
        {
          heading: 'Contract Addresses',
          content: 'All CrossBridge smart contracts are verified and open-source. View them on Solana Explorer.'
        },
        {
          heading: 'Main Contracts',
          items: [
            'Bridge Contract: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
            'Token Vault: 0x8e5dECa0e89f0D3d0F2F3C0E5a6d7c8b9A1f2e3',
            'Validator Registry: 0x1a2B3c4D5e6F7g8H9i0J1k2L3m4N5o6P7q8R9s0'
          ]
        },
        {
          heading: 'Integration',
          content: 'Developers can integrate CrossBridge directly using our SDK or interact with smart contracts directly. Full documentation available in our GitHub repository.'
        }
      ]
    },
    economics: {
      title: 'Economics',
      sections: [
        {
          heading: 'Token Model',
          content: 'CrossBridge maintains a 1:1 peg between native and wrapped tokens through a fully collateralized reserve system.'
        },
        {
          heading: 'Liquidity Mechanics',
          items: [
            'All wrapped tokens backed by locked native assets',
            'Transparent reserve verification on-chain',
            'No fractional reserves',
            'Real-time proof of reserves'
          ]
        },
        {
          heading: 'Market Impact',
          content: 'Bridging activities do not affect the total supply of tokens, only their distribution across chains, minimizing market impact.'
        }
      ]
    },
    troubleshooting: {
      title: 'Troubleshooting',
      sections: [
        {
          heading: 'Common Issues',
          content: 'Most issues can be resolved by following these troubleshooting steps.'
        },
        {
          heading: 'Transaction Stuck',
          items: [
            'Check transaction status on Solana Explorer',
            'Verify sufficient SOL for gas fees',
            'Try increasing priority fees during network congestion',
            'Contact support if stuck for more than 5 minutes'
          ]
        },
        {
          heading: 'Wallet Connection Issues',
          items: [
            'Refresh the page and try reconnecting',
            'Clear browser cache and cookies',
            'Ensure wallet extension is updated',
            'Try a different browser or wallet'
          ]
        },
        {
          heading: 'Get Help',
          content: 'If your issue persists, join our Discord community or open a support ticket. Our team typically responds within 24 hours.'
        }
      ]
    },
    api: {
      title: 'API Reference',
      sections: [
        {
          heading: 'REST API',
          content: 'CrossBridge provides a RESTful API for querying bridge status, transaction history, and network statistics.'
        },
        {
          heading: 'Endpoints',
          items: [
            'GET /api/v1/bridge/status - Bridge operational status',
            'GET /api/v1/transactions/:txHash - Transaction details',
            'GET /api/v1/fees - Current fee structure',
            'POST /api/v1/estimate - Estimate bridge costs'
          ]
        },
        {
          heading: 'SDK',
          content: 'Install our TypeScript SDK via npm: npm install @crossbridge/sdk. Full documentation and examples available on GitHub.'
        }
      ]
    }
  };

  const currentContent = content[activeSection] || content.overview;

  return (
    <div className={styles.container}>
      {/* Top Navigation Bar */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoSection}>
            <img src="/crossbridge-logo.png" alt="CrossBridge" className={styles.logo} />
            <span className={styles.logoText}>CrossBridge</span>
          </div>
          
          <nav className={styles.topNav}>
            <Link to="/" className={styles.topNavLink}>Home</Link>
            <Link to="/bridge" className={styles.topNavLink}>Bridge</Link>
            <Link to="/docs" className={styles.topNavLinkActive}>Docs</Link>
          </nav>

          <button className={styles.mobileMenuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <TimesIcon /> : <BarsIcon />}
          </button>
        </div>
      </header>

      <div className={styles.mainWrapper}>
        {/* Sidebar Navigation */}
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarContent}>
            {navigationItems.map((category: NavCategory, idx: number) => (
              <div key={idx} className={styles.navCategory}>
                <h3 className={styles.categoryTitle}>{category.category}</h3>
                {category.items.map((item: NavItem) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`${styles.navItem} ${activeSection === item.id ? styles.navItemActive : ''}`}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span>{item.label}</span>
                    {activeSection === item.id && (
                      <span className={styles.activeIndicator}><ChevronIcon /></span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className={styles.sidebarFooter}>
            <div className={styles.socialLinks}>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <TwitterIcon />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <DiscordIcon />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <GithubIcon />
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.content}>
          <article className={styles.article}>
            <h1 className={styles.pageTitle}>{currentContent.title}</h1>
            
            {currentContent.sections.map((section: ContentSection, idx: number) => (
              <section key={idx} className={styles.section}>
                <h2 className={styles.sectionHeading}>{section.heading}</h2>
                
                {section.content && (
                  <p className={styles.paragraph}>{section.content}</p>
                )}
                
                {section.items && (
                  <ul className={styles.list}>
                    {section.items.map((item: string, i: number) => (
                      <li key={i} className={styles.listItem}>{item}</li>
                    ))}
                  </ul>
                )}
                
                {section.steps && (
                  <ol className={styles.orderedList}>
                    {section.steps.map((step: string, i: number) => (
                      <li key={i} className={styles.orderedListItem}>{step}</li>
                    ))}
                  </ol>
                )}
              </section>
            ))}

            {/* CTA Section - Only show on overview page */}
            {activeSection === 'overview' && (
              <div className={styles.ctaSection}>
                <h3 className={styles.ctaTitle}>Ready to get started?</h3>
                <Link to="/bridge" className={styles.ctaButton}>
                  <span style={{ display: 'flex', alignItems: 'center' }}><RocketIcon /></span>
                  Launch Bridge
                  <span style={{ display: 'flex', alignItems: 'center' }}><ExternalIcon /></span>
                </Link>
              </div>
            )}
          </article>

          {/* Footer */}
          <footer className={styles.footer}>
            <p className={styles.footerText}>
              © {new Date().getFullYear()} CrossBridge Protocol. Secure cross-chain bridging infrastructure.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default DocsPage;