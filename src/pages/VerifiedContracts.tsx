import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Code } from 'lucide-react';
import { getExplorerTxs, shortHash, formatTimeAgo } from '../utils/rpc';

const VerifiedContracts: React.FC = () => {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExplorerTxs(1, 100).then(res => {
      const txs = res.txs || [];
      const realContracts = txs
        .filter((tx: any) => !tx.to) // Contract creations have no 'to' address
        .map((tx: any) => ({
          address: tx.contractAddress || tx.hash, // Use hash if address isn't returned
          name: "Unverified Contract",
          compiler: "—",
          version: "—",
          balance: "0 BRIXS",
          txs: 1,
          date: tx.timestamp,
          verified: false
        }));
      setContracts(realContracts);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="container page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Verified Contracts</h1>
      </div>

      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Showing recently deployed contracts from the last 100 transactions
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><div className="spinner" /></div>
        ) : contracts.length === 0 ? (
          <div className="empty-state">
            <p>No recently deployed contracts found in the latest blocks.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Contract/Tx Hash</th>
                  <th>Contract Name</th>
                  <th>Compiler</th>
                  <th>Version</th>
                  <th>Balance</th>
                  <th>Txns</th>
                  <th>Deployed Date</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c, i) => (
                  <tr key={i}>
                    <td>
                      <Link to={c.address.length === 66 ? `/tx/${c.address}` : `/address/${c.address}`} className="hash-link mono" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Code size={14} /> {shortHash(c.address, 8)}
                        {c.verified && <CheckCircle size={12} style={{ color: 'var(--success)' }} />}
                      </Link>
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.compiler}</td>
                    <td>{c.version}</td>
                    <td>{c.balance}</td>
                    <td>{c.txs}</td>
                    <td>{formatTimeAgo(c.date)}</td>
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

export default VerifiedContracts;
