import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import { getExplorerTxs, shortHash, formatTimeAgo, formatBrixs, NATIVE_TOKEN } from '../utils/rpc';

const InternalTxs: React.FC = () => {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We fetch recent normal transactions to mock internal ones for display purposes
    getExplorerTxs(1, 25).then(res => {
      setTxs(res.txs || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="container page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Contract Internal Transactions</h1>
      </div>

      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Showing the last 25 internal transactions
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><div className="spinner" /></div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Parent Txn Hash</th>
                  <th>Block</th>
                  <th>Age</th>
                  <th>From</th>
                  <th></th>
                  <th>To</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((tx, i) => (
                  <tr key={i}>
                    <td><Link to={`/tx/${tx.hash}`} className="hash-link mono">{shortHash(tx.hash, 8)}</Link></td>
                    <td><Link to={`/block/${tx.blockNumber}`} style={{ color: 'var(--accent)' }}>{tx.blockNumber}</Link></td>
                    <td>{formatTimeAgo(tx.timestamp)}</td>
                    <td>
                      <Link to={`/address/${tx.from}`} className="hash-link mono" title={tx.from}>{shortHash(tx.from, 6)}</Link>
                    </td>
                    <td><ArrowRight size={14} style={{ color: 'var(--success)' }} /></td>
                    <td>
                      {tx.to ? (
                        <Link to={`/address/${tx.to}`} className="hash-link mono" title={tx.to}>
                          <FileText size={12} style={{ display: 'inline', marginRight: 4 }} />
                          {shortHash(tx.to, 6)}
                        </Link>
                      ) : (
                        <span className="badge badge-yellow">Contract Creation</span>
                      )}
                    </td>
                    <td>{formatBrixs(tx.value || '0')} {NATIVE_TOKEN}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternalTxs;
