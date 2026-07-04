import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Box, Zap, Search, ArrowRight, FileText, RefreshCw } from 'lucide-react';
import {
  getExplorerStats, getExplorerBlocks, getExplorerTxs,
  formatTimeAgo, shortHash, formatBrixs, NATIVE_TOKEN
} from '../utils/rpc';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('all');
  const [stats, setStats] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const fetchData = useCallback(async () => {
    try {
      const [s, b, t] = await Promise.all([
        getExplorerStats(),
        getExplorerBlocks(1, 6),
        getExplorerTxs(1, 6),
      ]);
      setStats(s);
      setBlocks(b.blocks || []);
      setTxs(t.txs || []);
      setLastRefresh(Date.now());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 6000);
    return () => clearInterval(id);
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    if (q.length === 66 && q.startsWith('0x')) navigate(`/tx/${q}`);
    else if (q.length === 42 && q.startsWith('0x')) navigate(`/address/${q}`);
    else if (/^\d+$/.test(q)) navigate(`/block/${q}`);
    else alert('Enter a valid Tx Hash, Address, or Block Number');
  };

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <div className="dashboard-hero">
        <div className="container">
          <h1 className="hero-title">
            Brixs Testnet Explorer
            <span className="testnet-chip">Testnet</span>
          </h1>
          <form className="hero-search-form" onSubmit={handleSearch}>
            <select
              className="hero-search-select"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
            >
              <option value="all">All Filters</option>
              <option value="address">Address</option>
              <option value="tx">Transaction</option>
              <option value="block">Block</option>
            </select>
            <input
              className="hero-search-input"
              type="text"
              placeholder="Search by Address / Txn Hash / Block Number"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="hero-search-btn">
              <Search size={16} /> Search
            </button>
          </form>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 48 }}>
        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-icon"><Activity size={20} /></div>
            <div>
              <div className="stat-label">Total Transactions</div>
              <div className="stat-value">
                {loading ? '—' : (stats?.totalTransactions ?? 0).toLocaleString()}
                <span className="stat-sub">on-chain</span>
              </div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><Zap size={20} /></div>
            <div>
              <div className="stat-label">Gas Price</div>
              <div className="stat-value">
                {loading ? '—' : stats?.gasPrice ?? '1'}
                <span className="stat-sub">Gwei</span>
              </div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><Box size={20} /></div>
            <div>
              <div className="stat-label">Latest Block</div>
              <div className="stat-value">
                {loading ? '—' : (stats?.currentBlock ?? 0).toLocaleString()}
                <span className="stat-sub">{NATIVE_TOKEN}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Refresh indicator ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, margin: '16px 0 8px', color: 'var(--text-muted)', fontSize: 12 }}>
          <RefreshCw size={12} />
          Auto-refreshes every 6s · Last: {new Date(lastRefresh).toLocaleTimeString()}
        </div>

        {/* ── Latest Blocks + Txs ────────────────────────────────────────── */}
        <div className="lists-grid">

          {/* Latest Blocks */}
          <div className="card list-card">
            <div className="list-card-header">
              <span>Latest Blocks</span>
              <Link to="/blocks" style={{ fontSize: 12, color: 'var(--accent)' }}>View all</Link>
            </div>

            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="list-item">
                    <div className="item-icon skeleton" style={{ width: 38, height: 38 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ width: '60%', height: 14, marginBottom: 8 }} />
                      <div className="skeleton" style={{ width: '80%', height: 11 }} />
                    </div>
                  </div>
                ))
              : blocks.length === 0
              ? (
                <div className="empty-state">
                  <Box size={32} />
                  <p>No blocks yet. Send a transaction via the faucet to start.</p>
                </div>
              )
              : blocks.map((b, i) => (
                <div key={i} className="list-item">
                  <div className="item-icon"><Box size={18} /></div>
                  <div className="item-body">
                    <div className="item-row1">
                      <Link to={`/block/${b.number}`} className="item-link">Block #{b.number}</Link>
                      <span className="item-time">{formatTimeAgo(b.timestamp)}</span>
                    </div>
                    <div className="item-row2">
                      <span className="item-addr" title={b.hash}>{shortHash(b.hash || '0x000...', 8)}</span>
                      <span className="item-amount">{b.txCount ?? 0} txn{(b.txCount ?? 0) !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              ))
            }

            <div className="list-footer">
              <Link to="/blocks">View All Blocks <ArrowRight size={14} /></Link>
            </div>
          </div>

          {/* Latest Transactions */}
          <div className="card list-card">
            <div className="list-card-header">
              <span>Latest Transactions</span>
              <Link to="/txs" style={{ fontSize: 12, color: 'var(--accent)' }}>View all</Link>
            </div>

            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="list-item">
                    <div className="item-icon skeleton" style={{ width: 38, height: 38 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ width: '70%', height: 14, marginBottom: 8 }} />
                      <div className="skeleton" style={{ width: '90%', height: 11 }} />
                    </div>
                  </div>
                ))
              : txs.length === 0
              ? (
                <div className="empty-state">
                  <FileText size={32} />
                  <p>No transactions yet. Use the <Link to="/faucet">Faucet</Link> to get started.</p>
                </div>
              )
              : txs.map((tx, i) => (
                <div key={i} className="list-item">
                  <div className="item-icon"><FileText size={18} /></div>
                  <div className="item-body">
                    <div className="item-row1">
                      <Link to={`/tx/${tx.hash}`} className="item-link">{shortHash(tx.hash, 8)}</Link>
                      <span className="item-time">{formatTimeAgo(tx.timestamp)}</span>
                    </div>
                    <div className="item-row2">
                      <span className="item-addr">
                        From <Link to={`/address/${tx.from}`} style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{shortHash(tx.from, 5)}</Link>
                        {tx.to && <> → <Link to={`/address/${tx.to}`} style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{shortHash(tx.to, 5)}</Link></>}
                      </span>
                      <span className="item-amount">{formatBrixs(tx.value || '0')} {NATIVE_TOKEN}</span>
                    </div>
                  </div>
                </div>
              ))
            }

            <div className="list-footer">
              <Link to="/txs">View All Transactions <ArrowRight size={14} /></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
