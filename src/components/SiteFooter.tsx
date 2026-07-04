import React from 'react';
import './SiteFooter.css';

declare global { interface Window { ethereum?: any; } }

const SiteFooter: React.FC = () => {

  const addNetwork = async () => {
    if (!window.ethereum) return alert('MetaMask is not installed.');
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x76ADF1' }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x76ADF1',
            chainName: 'Brixs Chain Testnet',
            nativeCurrency: { name: 'BRIXS', symbol: 'BRIXS', decimals: 18 },
            rpcUrls: ['https://rpc-testnet.brixs.space'],
            blockExplorerUrls: ['https://scan.brixs.space'],
          }],
        });
      }
    }
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="site-footer">
      {/* ── Row 1: Powered by + Back to Top ─────────────────────────── */}
      <div className="footer-top">
        <div className="footer-powered">
          {/* Brixs icon */}
          <img src="/logo.png" alt="Brixs" className="footer-chain-icon" />
          <span>
            Powered by{' '}
            <a href="https://brixs.space" target="_blank" rel="noreferrer">
              Brixs Chain
            </a>
          </span>
        </div>
        <button className="footer-back-top" onClick={scrollTop}>
          ↑ Back to Top
        </button>
      </div>

      {/* ── Row 2: Add Network button ────────────────────────────────── */}
      <div className="footer-network-row">
        <button className="footer-add-network" onClick={addNetwork}>
          {/* MetaMask fox SVG inline */}
          <svg width="20" height="20" viewBox="0 0 318.6 318.6" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
            <style>
              {`.st1,.st6{fill:#e4761b;stroke:#e4761b;stroke-linecap:round;stroke-linejoin:round}.st6{fill:#f6851b;stroke:#f6851b}`}
            </style>
            <path fill="#e2761b" stroke="#e2761b" strokeLinecap="round" strokeLinejoin="round" d="m274.1 35.5-99.5 73.9L193 65.8z"/>
            <path d="m44.4 35.5 98.7 74.6-17.5-44.3zm193.9 171.3-26.5 40.6 56.7 15.6 16.3-55.3zm-204.4.9L50.1 263l56.7-15.6-26.5-40.6z" className="st1"/>
            <path d="m103.6 138.2-15.8 23.9 56.3 2.5-2-60.5zm111.3 0-39-34.8-1.3 61.2 56.2-2.5zM106.8 247.4l33.8-16.5-29.2-22.8zm71.1-16.5 33.9 16.5-4.7-39.3z" className="st1"/>
            <path fill="#d7c1b3" stroke="#d7c1b3" strokeLinecap="round" strokeLinejoin="round" d="m211.8 247.4-33.9-16.5 2.7 22.1-.3 9.3zm-105 0 31.5 14.9-.2-9.3 2.5-22.1z"/>
            <path fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" d="m138.8 193.5-28.2-8.3 19.9-9.1zm40.9 0 8.3-17.4 20 9.1z"/>
            <path fill="#cd6116" stroke="#cd6116" strokeLinecap="round" strokeLinejoin="round" d="m106.8 247.4 4.8-40.6-31.3.9zM207 206.8l4.8 40.6 26.5-39.7zm23.8-44.7-56.2 2.5 5.2 28.9 8.3-17.4 20 9.1zm-120.2 23.1 20-9.1 8.2 17.4 5.3-28.9-56.3-2.5z"/>
            <path fill="#e4751f" stroke="#e4751f" strokeLinecap="round" strokeLinejoin="round" d="m87.8 162.1 23.6 46-.8-22.9zm120.3 23.1-1 22.9 23.7-46zm-64-20.6-5.3 28.9 6.6 34.1 1.5-44.9zm30.5 0-2.7 18 1.2 45 6.7-34.1z"/>
            <path d="m179.8 193.5-6.7 34.1 4.8 3.3 29.2-22.8 1-22.9zm-69.2-8.3.8 22.9 29.2 22.8 4.8-3.3-6.6-34.1z" className="st6"/>
            <path fill="#c0ad9e" stroke="#c0ad9e" strokeLinecap="round" strokeLinejoin="round" d="m180.3 262.3.3-9.3-2.5-2.2h-37.7l-2.3 2.2.2 9.3-31.5-14.9 11 9 22.3 15.5h38.3l22.4-15.5 11-9z"/>
            <path fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round" d="m177.9 230.9-4.8-3.3h-27.7l-4.8 3.3-2.5 22.1 2.3-2.2h37.7l2.5 2.2z"/>
            <path fill="#763d16" stroke="#763d16" strokeLinecap="round" strokeLinejoin="round" d="m278.3 114.2 8.5-40.8-12.7-37.9-96.2 71.4 37 31.3 52.3 15.3 11.6-13.5-5-3.6 8-7.3-6.2-4.8 8-6.1zM31.8 73.4l8.5 40.8-5.4 4 8 6.1-6.1 4.8 8 7.3-5 3.6 11.5 13.5 52.3-15.3 37-31.3-96.2-71.4z"/>
            <path d="m267.2 153.5-52.3-15.3 15.9 23.9-23.7 46 31.2-.4h46.5zm-163.6-15.3-52.3 15.3-17.4 54.2h46.4l31.1.4-23.6-46zm71 26.4 3.3-57.7 15.2-41.1h-67.5l15 41.1 3.5 57.7 1.2 18.2.1 44.8h27.7l.2-44.8z" className="st6"/>
          </svg>
          Add Brixs Testnet Network
        </button>
      </div>

      {/* ── Divider ──────────────────────────────────────────────────── */}
      <div className="footer-divider" />

      {/* ── Row 3: Copyright + Links ─────────────────────────────────── */}
      <div className="footer-bottom">
        <div className="footer-copy">
          BrixsScan © 2026 (BRIXS-TESTNET)
          <span className="footer-dot">|</span>
          <a href="https://brixs.space" target="_blank" rel="noreferrer">
            Built by Team Brixs
          </a>
          <span style={{ fontSize: 10 }}>↗</span>
        </div>

        <div className="footer-links">
          <a href="https://brixs.space/legal" target="_blank" rel="noreferrer">Terms &amp; Privacy</a>
          <span className="footer-sep" />
          <a href="https://rpc-testnet.brixs.space" target="_blank" rel="noreferrer">Network Status</a>
          <span className="footer-sep" />
          <span className="footer-donation">
            Faucet:&nbsp;
            <a href="https://faucet.brixs.space" target="_blank" rel="noreferrer">
              faucet.brixs.space
            </a>
            <span className="footer-heart">♥</span>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
