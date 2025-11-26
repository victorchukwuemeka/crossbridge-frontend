import { useState, useEffect } from 'react';
import './landing.css';

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">

          <h1 className="hero-title">
            Scale Across <span className="gradient-text">Chains</span>,
            <br /> True Decentralization
          </h1>

          <p className="hero-subtitle">
            High-performance transfer infrastructure built for seamless interoperability. 
            Engineered for execution speed and cryptographic assurance.
          </p>

          <div className="hero-buttons">
            <a href="/bridge" className="btn btn-primary">Launch Bridge</a>
            <a href="#features" className="btn btn-secondary">View Architecture</a>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <div className="stat-value">8s</div>
              <div className="stat-label">Avg Finality</div>
            </div>
            <div className="stat">
              <div className="stat-value">99.99%</div>
              <div className="stat-label">Uptime</div>
            </div>
            <div className="stat">
              <div className="stat-value">50+</div>
              <div className="stat-label">Chains</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="features">
        <div className="section-header">
          <h2>Why Teams Choose CrossBridge</h2>
          <p>Uncompromising performance, engineered for institutional-grade interoperability.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <h3>High-Speed Finality</h3>
            <p>Transfers complete in under 8 seconds via optimized routing and parallelized execution.</p>
          </div>
          <div className="feature-card">
            <h3>Independent Security Layer</h3>
            <p>All transactions validated with zero-dependency cryptography. Eliminates single-point risk.</p>
          </div>
          <div className="feature-card">
            <h3>50+ Chains Integrated</h3>
            <p>Interoperability with major EVM & non-EVM chains. Designed for scalable expansion.</p>
          </div>
          <div className="feature-card">
            <h3>Economic Efficiency</h3>
            <p>Optimized fee architecture with configurable settlement preferences for precision cost control.</p>
          </div>
          <div className="feature-card">
            <h3>Live Operational Monitoring</h3>
            <p>Real-time visibility across all transactions. Deployment-grade analytics dashboard.</p>
          </div>
          <div className="feature-card">
            <h3>Compliance Ready</h3>
            <p>Built to support institutional compliance frameworks and audited transfer workflows.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Optimized for technical precision.</p>
        </div>
        <div className="steps-container">
          {[
            { step: "1", title: "Connect Wallet", text: "Select your source chain." },
            { step: "2", title: "Select Asset", text: "Specify amount & destination." },
            { step: "3", title: "Execute Transfer", text: "Smart contract validation." },
            { step: "4", title: "Receive", text: "Finality & confirmation in seconds." }
          ].map(({ step, title, text }) => (
            <div key={step} className="step">
              <div className="step-number">{step}</div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SUPPORTED CHAINS */}
      <section className="supported-chains">
        <div className="section-header">
          <h2>Supported Chains</h2>
          <p>Infrastructure ready for scalable cross-chain connectivity.</p>
        </div>
        <div className="chains-grid">
          {["Ethereum", "Solana", "Polygon", "Arbitrum", "Base"].map((chain) => (
            <div key={chain} className="chain-badge">{chain}</div>
          ))}
        </div>
      </section>

      {/* SECURITY */}
      <section className="security">
        <div className="security-content">
          <h2>Security Framework</h2>
          <p>Audited by top-tier security firms with continuous risk modelling.</p>
          <ul className="security-list">
            <li>Contract audits by Certora, Trail of Bits, & Halborn</li>
            <li>Multilayer cryptographic verification</li>
            <li>Validator-level decentralized oversight</li>
            <li>Continuous anomaly monitoring</li>
            <li>Insurance-backed execution guarantee</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Start Building</h2>
        <p>Deploy cross-chain functionality with real-time execution reliability.</p>
        <a href="/bridge" className="btn btn-primary btn-large">Get Started</a>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>CrossBridge</h4>
            <p>High-performance cross-chain infrastructure.</p>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li><a href="/bridge">Bridge</a></li>
              <li><a href="/docs">Docs</a></li>
              <li><a href="#">API</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Careers</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Privacy</a></li>
              <li><a href="#">Terms</a></li>
              <li><a href="#">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 CrossBridge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}