import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Box, Zap, Search, ArrowRight, FileText, RefreshCw, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

  const tpsHistory = useMemo(() => {
    return Array.from({ length: 20 }, () => Math.floor(Math.random() * 80) + 20);
  }, [stats?.currentBlock]);

  const currentTps = tpsHistory[tpsHistory.length - 1] || 0;

  // Mock data for the charts
  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 14; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      data.push({
        name: `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`,
        txs: Math.floor(Math.random() * 8000) + 2000,
        accounts: Math.floor(Math.random() * 300) + 20
      });
    }
    return data;
  }, []);

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
        <div className="stats-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div className="stat-item" style={{ gridColumn: 'span 1' }}>
            <div className="stat-icon"><Activity size={20} /></div>
            <div>
              <div className="stat-label">Total Transactions</div>
              <div className="stat-value">
                {loading ? '—' : (stats?.totalTransactions ?? 0).toLocaleString()}
                <span className="stat-sub">on-chain</span>
              </div>
            </div>
          </div>
          <div className="stat-item" style={{ gridColumn: 'span 1' }}>
            <div className="stat-icon"><Box size={20} /></div>
            <div>
              <div className="stat-label">Latest Block</div>
              <div className="stat-value">
                {loading ? '—' : (stats?.currentBlock ?? 0).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="stat-item" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Brixs Network TPS</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{currentTps} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>TPS</span></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: 40, gap: 4, width: '100%' }}>
              {tpsHistory.map((val, idx) => (
                <div key={idx} style={{ 
                  flex: 1, 
                  height: `${(val / 100) * 100}%`, 
                  background: idx === tpsHistory.length - 1 ? 'var(--accent)' : 'var(--bg-tertiary)',
                  borderRadius: '2px 2px 0 0',
                  transition: 'height 0.3s ease'
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Charts (Transactions & Accounts) ───────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
          {/* Transactions Count Chart */}
          <div className="card" style={{ padding: 24, paddingBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Transactions Count</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>The total number of transactions per day on the Brixs network.</p>
              </div>
              <Link to="/txs" className="btn btn-outline" style={{ fontSize: 12, padding: '4px 12px' }}>View Details ›</Link>
            </div>
            <div style={{ height: 200, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickMargin={10} minTickGap={20} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="txs" stroke="#EAB308" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Account Growth Chart */}
          <div className="card" style={{ padding: 24, paddingBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Account Growth</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>The number of new accounts added per day on the Brixs network.</p>
              </div>
              <Link to="/validators" className="btn btn-outline" style={{ fontSize: 12, padding: '4px 12px' }}>View Details ›</Link>
            </div>
            <div style={{ height: 200, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickMargin={10} minTickGap={20} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="accounts" stroke="#EAB308" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
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
