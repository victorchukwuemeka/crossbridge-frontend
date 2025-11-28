import { useState, useEffect, useRef } from 'react';
import './landing.css';

export default function LandingPage() {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  // Scroll animation observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.scroll-animate');
    animatedElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const toggleFAQ = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: "What is CrossBridge?",
      answer: "CrossBridge is a decentralized cross-chain bridge protocol that enables asset transfers across multiple blockchains. Unlike traditional bridges that rely on centralized validators or multisig committees, CrossBridge operates through a permissionless network of relayers who facilitate transfers without requiring trust."
    },
    {
      question: "Why is a decentralized bridge needed?",
      answer: "Centralized bridges create single points of failure - they've resulted in over $2 billion in losses from hacks and exploits. CrossBridge eliminates trusted intermediaries by using a decentralized relayer network where anyone can participate. This removes the risk of validator collusion, custody vulnerabilities, and centralized control that plague traditional bridges."
    },
    {
      question: "How do relayers get incentivized?",
      answer: "Relayers earn fees for each transaction they successfully process and submit to the destination chain. The fee model is competitive - relayers compete to provide the fastest execution, and users benefit from this competition through better service. There's no staking requirement or whitelisting needed to become a relayer."
    },
    {
      question: "Why did we add privacy as a layer to CrossBridge?",
      answer: "Privacy is critical for institutional and individual users who don't want their transaction history publicly traceable. By integrating Zcash, CrossBridge enables shielded cross-chain transfers where transaction amounts and participants remain private. This makes CrossBridge suitable for users who need confidential transfers across chains."
    },
    {
      question: "What happens if a swap fails?",
      answer: "If a transfer fails, your funds remain secure on the source chain. CrossBridge uses atomic swap mechanics - either the full transaction completes on both chains, or it's fully reverted. You won't lose funds in a failed transfer. Our relayer network monitors transactions and will automatically retry failed submissions."
    }
  ];

  return (
    <div className="landing-page">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            Decentralized Cross-Chain <span className="gradient-text">Infrastructure</span>
          </h1>

          <p className="hero-subtitle">
            Permissionless bridge protocol powered by a decentralized relayer network. 
            Transfer assets across chains without trusted intermediaries.
          </p>

          <div className="hero-buttons">
            <a href="/bridge" className="btn btn-primary">Launch Bridge</a>
            <a href="#features" className="btn btn-secondary">Learn More</a>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="features">
        <div className="section-header scroll-animate">
          <h2>Built for True Decentralization</h2>
          <p>Permissionless architecture that eliminates single points of failure.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card scroll-animate">
            <h3>Decentralized Relayer Network</h3>
            <p>Anyone can run a relayer without staking or whitelisting. Competitive fee market ensures fast, reliable execution.</p>
          </div>
          <div className="feature-card scroll-animate">
            <h3>Privacy-Preserving Transfers</h3>
            <p>Integrated Zcash support enables shielded cross-chain transactions where amounts and participants remain confidential.</p>
          </div>
          <div className="feature-card scroll-animate">
            <h3>Multi-Chain Support</h3>
            <p>Bridge assets across Ethereum, Base, Polygon, Arbitrum, and Solana with more chains coming soon.</p>
          </div>
          <div className="feature-card scroll-animate">
            <h3>Atomic Execution</h3>
            <p>Transactions either complete fully or revert completely. Your funds never get stuck in limbo.</p>
          </div>
          <div className="feature-card scroll-animate">
            <h3>Permissionless Access</h3>
            <p>No accounts, no KYC, no gatekeepers. Connect your wallet and bridge instantly.</p>
          </div>
          <div className="feature-card scroll-animate">
            <h3>Transparent Operations</h3>
            <p>All transactions are verifiable on-chain. Monitor relayer performance and network status in real-time.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <div className="section-header scroll-animate">
          <h2>How It Works</h2>
          <p>Four simple steps to bridge your assets across chains.</p>
        </div>
        <div className="steps-container">
          <div className="step scroll-animate">
            <div className="step-number">1</div>
            <h3>Connect Wallet</h3>
            <p>Select your source chain and connect your wallet.</p>
          </div>
          <div className="step scroll-animate">
            <div className="step-number">2</div>
            <h3>Choose Destination</h3>
            <p>Specify the asset, amount, and destination chain.</p>
          </div>
          <div className="step scroll-animate">
            <div className="step-number">3</div>
            <h3>Submit Transfer</h3>
            <p>Relayers compete to process your transaction.</p>
          </div>
          <div className="step scroll-animate">
            <div className="step-number">4</div>
            <h3>Receive Assets</h3>
            <p>Assets arrive on destination chain atomically.</p>
          </div>
        </div>
      </section>

      {/* SUPPORTED CHAINS */}
      <section className="supported-chains">
        <div className="section-header scroll-animate">
          <h2>Supported Chains</h2>
          <p>Bridging across major blockchain networks with privacy options.</p>
        </div>
        <div className="chains-container">
          <div className="chain-logo scroll-animate">
            <div className="chain-icon">
              <img src="https://cryptologos.cc/logos/ethereum-eth-logo.png" alt="Ethereum" />
            </div>
            <div className="chain-name">Ethereum</div>
          </div>
          <div className="chain-logo scroll-animate">
            <div className="chain-icon">
              <img src="https://icons.llamao.fi/icons/chains/rsz_base.jpg" alt="Base" />
            </div>
            <div className="chain-name">Base</div>
          </div>
          <div className="chain-logo scroll-animate">
            <div className="chain-icon">
              <img src="https://cryptologos.cc/logos/polygon-matic-logo.png" alt="Polygon" />
            </div>
            <div className="chain-name">Polygon</div>
          </div>
          <div className="chain-logo scroll-animate">
            <div className="chain-icon">
              <img src="https://cryptologos.cc/logos/arbitrum-arb-logo.png" alt="Arbitrum" />
            </div>
            <div className="chain-name">Arbitrum</div>
          </div>
          <div className="chain-logo scroll-animate">
            <div className="chain-icon">
              <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="Solana" />
            </div>
            <div className="chain-name">Solana</div>
          </div>
          <div className="chain-logo scroll-animate">
            <div className="chain-icon">
              <img src="https://cryptologos.cc/logos/zcash-zec-logo.png" alt="Zcash" />
            </div>
            <div className="chain-name">Zcash</div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="faq">
        <div className="section-header scroll-animate">
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about CrossBridge.</p>
        </div>
        <div className="faq-container">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item scroll-animate ${activeFAQ === index ? 'active' : ''}`}
            >
              <div 
                className="faq-question" 
                onClick={() => toggleFAQ(index)}
              >
                <span>{faq.question}</span>
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta scroll-animate">
        <h2>Start Bridging Today</h2>
        <p>Experience truly decentralized cross-chain transfers.</p>
        <a href="/bridge" className="btn btn-primary btn-large">Launch Bridge</a>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>CrossBridge</h4>
            <p>Decentralized cross-chain infrastructure powered by permissionless relayers.</p>
            <div className="social-links">
              <a 
                href="https://x.com/CrossBridg_" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Twitter"
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a 
                href="https://github.com/victorchukwuemeka/crossbridge-frontend" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
                aria-label="GitHub"
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li><a href="/bridge">Bridge</a></li>
              <li><a href="/docs">Documentation</a></li>
              <li><a href="/relayers">Run a Relayer</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><a href="/about">About</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="https://github.com/victorchukwuemeka/crossbridge-frontend" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 CrossBridge. Decentralized infrastructure for Web3.</p>
        </div>
      </footer>
    </div>
  );
}