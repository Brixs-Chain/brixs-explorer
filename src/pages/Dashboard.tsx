import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Search, ArrowRight, FileText, Menu } from 'lucide-react';
import {
  getExplorerStats, getExplorerBlocks, getExplorerTxs,
  formatTimeAgo, shortHash, formatBrixs, NATIVE_TOKEN
} from '../utils/rpc';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush } from 'recharts';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('all');
  const [stats, setStats] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Time Granularity and Date Range states
  const [timeGranularity, setTimeGranularity] = useState('day');
  const [dateRange, setDateRange] = useState('1y');

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

  // Calculate real TPS data from recent blocks
  const tpsData = useMemo(() => {
    if (!blocks || blocks.length === 0) return [];
    
    // Sort blocks by timestamp ascending for the graph
    const sortedBlocks = [...blocks].sort((a, b) => a.timestamp - b.timestamp);
    
    return sortedBlocks.map(b => {
      // Very basic TPS calculation: tx count / 3 seconds (block time)
      const tps = (b.txCount || 0) / 3;
      return {
        name: new Date(b.timestamp > 1e12 ? b.timestamp : b.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        tps: parseFloat(tps.toFixed(2))
      };
    });
  }, [blocks]);

  // Calculate real current TPS
  const currentTps = blocks.length > 0 ? (blocks[0].txCount || 0) / 3 : 0;
  
  // Estimate accounts based on unique addresses in recent txs (rough real metric)
  const uniqueAccounts = useMemo(() => {
    const addrs = new Set();
    txs.forEach(tx => {
      if (tx.from) addrs.add(tx.from);
      if (tx.to) addrs.add(tx.to);
    });
    return addrs.size;
  }, [txs]);

  // Estimate total gas used in recent blocks
  const gasUsedPerSec = useMemo(() => {
    if (blocks.length === 0) return 0;
    return parseInt(blocks[0].gasUsed || '0') / 3;
  }, [blocks]);

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', paddingBottom: 48 }}>
      {/* ── Hero Search (Simplified) ──────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '24px 0' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <form className="hero-search-form" onSubmit={handleSearch} style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: 8, width: '100%' }}>
            <select
              className="hero-search-select"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb', width: 140 }}
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
              style={{ flex: 1, padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 8 }}
            />
            <button type="submit" className="hero-search-btn" style={{ padding: '0 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>
              <Search size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: '-3px' }} />
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="container" style={{ marginTop: 24 }}>
        
        {/* ── Exact Replica Stats Bar ────────────────────────────────────────────── */}
        <div className="stats-bar-replica card" style={{ padding: '24px 32px', marginBottom: 32, borderRadius: 16, display: 'flex', justifyContent: 'space-between' }}>
          
          <div className="stat-col">
            <div className="stat-label">Current Block Height</div>
            <div className="stat-value">{stats?.currentBlock ? parseInt(stats.currentBlock).toLocaleString() : '0'}</div>
          </div>
          
          <div className="stat-col">
            <div className="stat-label">Accounts</div>
            <div className="stat-value">{uniqueAccounts.toLocaleString()}</div>
          </div>
          
          <div className="stat-col">
            <div className="stat-label">Transactions</div>
            <div className="stat-value">{stats?.totalTransactions ? stats.totalTransactions.toLocaleString() : '0'}</div>
          </div>
          
          <div className="stat-col">
            <div className="stat-label">Transaction TPS</div>
            <div className="stat-value">{currentTps.toFixed(2)}</div>
          </div>
          
          <div className="stat-col">
            <div className="stat-label">Gas Used Per Second</div>
            <div className="stat-value">{Math.floor(gasUsedPerSec).toLocaleString()}</div>
          </div>
          
          <div className="stat-col">
            <div className="stat-label">Block Time</div>
            <div className="stat-value">3.00s</div>
          </div>

        </div>

        {/* ── TPS Chart ──────────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 400, margin: 0, marginBottom: 8 }}>Transaction TPS</h2>
            <div style={{ color: '#6b7280', fontSize: 14 }}>Number of transactions on the chain per second.</div>
          </div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>
            <Link to="#" style={{ color: '#9333ea', textDecoration: 'none' }}>Charts</Link> / TPS
          </div>
        </div>

        <div className="card" style={{ padding: 24, marginBottom: 48, borderRadius: 8 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div className="chart-controls">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Time Granularity:</span>
                <div className="button-group">
                  <button className={timeGranularity === 'min' ? 'active' : ''} onClick={() => setTimeGranularity('min')}>min</button>
                  <button className={timeGranularity === 'hour' ? 'active' : ''} onClick={() => setTimeGranularity('hour')}>hour</button>
                  <button className={timeGranularity === 'day' ? 'active' : ''} onClick={() => setTimeGranularity('day')}>day</button>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Date Range:</span>
                <div className="button-group">
                  {['1w', '1m', '3m', '6m', '1y', 'All'].map(range => (
                    <button key={range} className={dateRange === range ? 'active' : ''} onClick={() => setDateRange(range)}>{range}</button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>Transaction TPS</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>Click and drag in the plot area to zoom in</div>
            </div>

            <div>
              <Menu size={20} style={{ color: '#6b7280', cursor: 'pointer' }} />
            </div>
          </div>
          
          <div style={{ textAlign: 'right', fontSize: 12, color: '#6b7280', marginBottom: 16 }}>
            Jul 13, 2025 — Jul 12, 2026
          </div>

          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tpsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickMargin={10}
                  minTickGap={50}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  label={{ value: 'Transaction Number in Secs', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 } }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 600, color: '#374151' }}
                  itemStyle={{ color: '#a855f7' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="tps" 
                  stroke="#a855f7" 
                  strokeWidth={1.5} 
                  dot={false}
                  activeDot={{ r: 4, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }} 
                />
                <Brush 
                  dataKey="name" 
                  height={30} 
                  stroke="#a855f7" 
                  fill="#f9fafb" 
                  tickFormatter={() => ''} 
                  className="recharts-brush-custom"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Latest Blocks + Txs ────────────────────────────────────────── */}
        <div className="lists-grid">
          {/* Latest Blocks */}
          <div className="card list-card">
            <div className="list-card-header">
              <span>Latest Blocks</span>
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
                  <p>No blocks yet.</p>
                </div>
              )
              : blocks.map((b, i) => (
                <div key={i} className="list-item">
                  <div className="item-icon" style={{ background: '#f3f4f6' }}><Box size={18} color="#4b5563" /></div>
                  <div className="item-body">
                    <div className="item-row1">
                      <Link to={`/block/${b.number}`} className="item-link">Block #{b.number}</Link>
                      <span className="item-time">{formatTimeAgo(b.timestamp)}</span>
                    </div>
                    <div className="item-row2">
                      <span className="item-addr" title={b.hash}>Fee Recipient: <Link to={`/address/${b.feeRecipient}`} style={{color: 'var(--accent)'}}>{shortHash(b.feeRecipient || '0x000...', 8)}</Link></span>
                      <span className="item-amount" style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{b.txCount ?? 0} txns</span>
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
                  <p>No transactions yet.</p>
                </div>
              )
              : txs.map((tx, i) => (
                <div key={i} className="list-item">
                  <div className="item-icon" style={{ background: '#f3f4f6' }}><FileText size={18} color="#4b5563" /></div>
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
                      <span className="item-amount" style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{formatBrixs(tx.value || '0')} {NATIVE_TOKEN}</span>
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
