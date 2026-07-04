import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Box, ChevronLeft, ChevronRight } from 'lucide-react';
import { getExplorerBlock, getExplorerTxs, formatTimeAgo, shortHash, formatBrixs, NATIVE_TOKEN } from '../utils/rpc';

const BlockDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [block, setBlock] = useState<any>(null);
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    getExplorerBlock(id)
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return; }
        setBlock(data);
        setTxs(data.transactions || []);
        setLoading(false);
      })
      .catch(() => { setError('Block not found or RPC node offline.'); setLoading(false); });
  }, [id]);

  if (loading) return <div className="container page-wrapper"><div className="empty-state"><div className="spinner" /><p>Loading block...</p></div></div>;
  if (error) return <div className="container page-wrapper"><div className="empty-state"><Box size={40} /><p>{error}</p><Link to="/blocks" className="btn btn-outline">← All Blocks</Link></div></div>;

  return (
    <div className="container page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Block #{id}</h1>
          <div className="page-subtitle">Brixs Testnet · {formatTimeAgo(block.timestamp)}</div>
        </div>
        <div className="flex gap-2">
          {parseInt(id!) > 0 && (
            <Link to={`/block/${parseInt(id!) - 1}`} className="btn btn-ghost"><ChevronLeft size={14} /> Prev</Link>
          )}
          <Link to={`/block/${parseInt(id!) + 1}`} className="btn btn-ghost">Next <ChevronRight size={14} /></Link>
        </div>
      </div>

      <div className="card" style={{ padding: '0 24px', marginBottom: 24 }}>
        <div className="detail-row">
          <div className="detail-label">Block Height</div>
          <div className="detail-value">{block.number} <span className="badge badge-yellow">Latest</span></div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Timestamp</div>
          <div className="detail-value">{formatTimeAgo(block.timestamp)} ({new Date(block.timestamp > 1e12 ? block.timestamp : block.timestamp * 1000).toLocaleString()})</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Transactions</div>
          <div className="detail-value">{txs.length} transaction{txs.length !== 1 ? 's' : ''} in this block</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Block Hash</div>
          <div className="detail-value mono">{block.hash || '—'}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Chain</div>
          <div className="detail-value">Brixs Testnet (Chain ID: 51515)</div>
        </div>
      </div>

      {txs.length > 0 && (
        <div className="card">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>
            Transactions in Block #{id}
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Txn Hash</th><th>Type</th><th>From</th><th>To</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {txs.map((tx, i) => (
                <tr key={i}>
                  <td><Link to={`/tx/${tx.hash}`} className="hash-link">{shortHash(tx.hash)}</Link></td>
                  <td><span className="badge badge-gray">{tx.type || 'Transfer'}</span></td>
                  <td><Link to={`/address/${tx.from}`} className="hash-link">{shortHash(tx.from)}</Link></td>
                  <td>{tx.to ? <Link to={`/address/${tx.to}`} className="hash-link">{shortHash(tx.to)}</Link> : <span className="badge badge-yellow">Contract Creation</span>}</td>
                  <td>{formatBrixs(tx.value || '0')} {NATIVE_TOKEN}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BlockDetails;
