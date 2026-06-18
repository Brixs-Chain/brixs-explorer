import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { Search, Activity, Box, FileText, ArrowRight, Wallet } from 'lucide-react';
import './index.css';

const RPC_URL = import.meta.env.VITE_RPC_URL || "https://brixs-core-node.onrender.com";

function Home() {
  const [stats, setStats] = useState(null);
  const [txs, setTxs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${RPC_URL}/explorer/stats`).then(r => r.json()).then(setStats).catch(console.error);
    fetch(`${RPC_URL}/explorer/tx`).then(r => r.json()).then(d => setTxs(d.transactions)).catch(console.error);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.length === 42 && searchQuery.startsWith('0x')) {
      navigate(`/address/${searchQuery}`);
    } else {
      alert('Please enter a valid 0x address');
    }
  };

  return (
    <div className="home">
      <div className="hero-section">
        <h1>BrixsScan Explorer</h1>
        <p>The native block explorer for Brixs Chain</p>
        
        <form className="search-bar" onSubmit={handleSearch}>
          <Search size={20} color="#a78bfa" />
          <input 
            type="text" 
            placeholder="Search by Address / Txn Hash / Block" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <Activity size={24} color="#00ffcc" />
          <div>
            <h3>Chain Status</h3>
            <p className="status-badge">Online</p>
          </div>
        </div>
        <div className="stat-card">
          <Box size={24} color="#581cff" />
          <div>
            <h3>Latest Block</h3>
            <p>{stats?.currentBlock || 'Loading...'}</p>
          </div>
        </div>
        <div className="stat-card">
          <FileText size={24} color="#facc15" />
          <div>
            <h3>Total Transactions</h3>
            <p>{stats?.totalTransactions || 0}</p>
          </div>
        </div>
      </div>

      <div className="recent-txs">
        <h2>Recent Transactions</h2>
        <div className="tx-list">
          {txs.length === 0 ? <p className="empty-state">No transactions yet</p> : null}
          {txs.map((tx, i) => (
            <div className="tx-row" key={i}>
              <div className="tx-icon"><FileText size={18} /></div>
              <div className="tx-info">
                <span className="tx-hash">Tx: <code>{tx.hash.slice(0,16)}...</code></span>
                <span className="tx-time">{new Date(tx.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="tx-addresses">
                <div>From: <Link to={`/address/${tx.from}`}>{tx.from.slice(0,10)}...</Link></div>
                <div>To: {tx.to ? <Link to={`/address/${tx.to}`}>{tx.to.slice(0,10)}...</Link> : <span className="badge">Contract Creation</span>}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AddressView() {
  const { addr } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${RPC_URL}/explorer/address/${addr}`).then(r => r.json()).then(setData).catch(console.error);
  }, [addr]);

  if (!data) return <div className="loading">Loading address data...</div>;

  return (
    <div className="address-view">
      <div className="header-box">
        <div className="title">
          <Wallet size={28} color="#00ffcc" />
          <h2>Address</h2>
        </div>
        <code className="full-address">{addr}</code>
      </div>

      <div className="overview-cards">
        <div className="card">
          <h4>BRIXS Balance</h4>
          <h2>{data.balanceFormatted} BRIXS</h2>
        </div>
        <div className="card">
          <h4>Nonce</h4>
          <h2>{data.nonce}</h2>
        </div>
      </div>

      <div className="recent-txs">
        <h2>Transactions</h2>
        <div className="tx-list">
          {data.transactions.length === 0 ? <p className="empty-state">No transactions found</p> : null}
          {data.transactions.map((tx, i) => (
            <div className="tx-row" key={i}>
              <div className="tx-icon"><FileText size={18} /></div>
              <div className="tx-info">
                <span className="tx-hash">Tx: <code>{tx.hash.slice(0,16)}...</code></span>
                <span className="tx-time">{new Date(tx.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="tx-addresses">
                <div>From: <Link to={`/address/${tx.from}`}>{tx.from === addr ? 'This Address' : tx.from.slice(0,10)}</Link></div>
                <div>To: {tx.to ? <Link to={`/address/${tx.to}`}>{tx.to === addr ? 'This Address' : tx.to.slice(0,10)}</Link> : 'Contract Creation'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="explorer-layout">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="logo">
              <span className="icon">🧱</span> BrixsScan
            </Link>
          </div>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/address/:addr" element={<AddressView />} />
          </Routes>
        </main>

        <footer>
          <p>© 2026 Brixs Chain Explorer. Secured by Apna Coding Ecosystem.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
