import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, X, Wallet, Sun, Search } from 'lucide-react';
import './Navbar.css';

declare global { interface Window { ethereum?: any; } }

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    if (q.length === 66 && q.startsWith('0x')) navigate(`/tx/${q}`);
    else if (q.length === 42 && q.startsWith('0x')) navigate(`/address/${q}`);
    else if (/^\d+$/.test(q)) navigate(`/block/${q}`);
    else alert('Enter a valid Tx Hash, Address, or Block Number');
    setSearchQuery('');
    setMobileOpen(false);
  };

  const short = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-inner">
          {/* Brand */}
          <Link to="/" className="navbar-brand">
            <img src="/logo.png" alt="Brixs" />
            Brixs Scan
          </Link>


          {/* Desktop nav */}
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <a href="https://docs.brixs.space" target="_blank" rel="noreferrer" className="nav-link">Docs ↗</a>

            {/* Blockchain */}
            <div className="dropdown">
              <button className="dropdown-trigger">Blockchain <ChevronDown size={13} /></button>
              <div className="dropdown-menu">
                <span className="dropdown-section-label">Transactions</span>
                <Link className="dropdown-item" to="/txs">Transactions</Link>
                <Link className="dropdown-item" to="/txsInternal">Internal Transactions</Link>
                <Link className="dropdown-item" to="/pending">Pending Transactions</Link>
                <div className="dropdown-divider" />
                <span className="dropdown-section-label">Blocks</span>
                <Link className="dropdown-item" to="/blocks">View Blocks</Link>
                <div className="dropdown-divider" />
                <span className="dropdown-section-label">Accounts</span>
                <Link className="dropdown-item" to="/contractsVerified">Verified Contracts</Link>
                <Link className="dropdown-item" to="/validators">Validators</Link>
              </div>
            </div>

            {/* Tokens */}
            <div className="dropdown">
              <button className="dropdown-trigger">Tokens <ChevronDown size={13} /></button>
              <div className="dropdown-menu">
                <Link className="dropdown-item" to="/tokens">All Tokens</Link>
                <Link className="dropdown-item" to="/token-transfers">Token Transfers</Link>
              </div>
            </div>

            {/* Tools */}
            <div className="dropdown">
              <button className="dropdown-trigger">More <ChevronDown size={13} /></button>
              <div className="mega-menu">
                <div>
                  <div className="mega-col-title">Developer Tools</div>
                  <Link className="mega-link" to="/tools/unit-converter">Unit Converter</Link>
                  <Link className="mega-link" to="/tools/broadcast">Broadcast Transaction</Link>
                  <Link className="mega-link" to="/tools/api">API Keys</Link>
                </div>
                <div>
                  <div className="mega-col-title">Network</div>
                  <Link className="mega-link" to="/validators">Validators</Link>
                  <a className="mega-link" href="https://faucet.brixs.space" target="_blank" rel="noreferrer">Testnet Faucet ↗</a>
                </div>
                <div>
                  <div className="mega-col-title">Resources</div>
                  <a className="mega-link" href="https://rpc-testnet.brixs.space" target="_blank" rel="noreferrer">RPC Endpoint ↗</a>
                  <a className="mega-link" href="https://rpc-testnet.brixs.space/explorer/stats" target="_blank" rel="noreferrer">Chain Stats API ↗</a>
                </div>
              </div>
            </div>

            <a href="https://faucet.brixs.space" target="_blank" rel="noreferrer" className="nav-link">Faucet ↗</a>
          </div>

          {/* Right */}
          <div className="nav-right">
            <div className="network-badge">
              <span className="network-dot" />
              Brixs Testnet
            </div>

            <button className="mobile-btn" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            placeholder="Search tx / address / block..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary"><Search size={16} /></button>
        </form>
        <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
        <Link to="/txs" onClick={() => setMobileOpen(false)}>Transactions</Link>
        <Link to="/txsInternal" onClick={() => setMobileOpen(false)}>Internal Txs</Link>
        <Link to="/blocks" onClick={() => setMobileOpen(false)}>Blocks</Link>
        <Link to="/pending" onClick={() => setMobileOpen(false)}>Pending Txs</Link>
        <Link to="/contractsVerified" onClick={() => setMobileOpen(false)}>Verified Contracts</Link>
        <Link to="/validators" onClick={() => setMobileOpen(false)}>Validators</Link>
        <a href="https://docs.brixs.space" target="_blank" rel="noreferrer">Docs ↗</a>
        <Link to="/tools/api" onClick={() => setMobileOpen(false)}>API Keys</Link>
        <a href="https://faucet.brixs.space" target="_blank" rel="noreferrer">Faucet ↗</a>
        <Link to="/tools/unit-converter" onClick={() => setMobileOpen(false)}>Unit Converter</Link>
      </div>
    </>
  );
};

export default Navbar;
