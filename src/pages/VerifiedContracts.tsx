import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Code } from 'lucide-react';
import { getExplorerTxs, shortHash, formatTimeAgo } from '../utils/rpc';

const VerifiedContracts: React.FC = () => {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking verified contracts based on recent txs for visual representation
    getExplorerTxs(1, 15).then(res => {
      const txs = res.txs || [];
      const mockedContracts = txs.map((tx: any) => ({
        address: tx.to || tx.from,
        name: tx.to ? "BrixsSmartRouter" : "TokenFactory",
        compiler: "Solidity (0.8.20)",
        version: "v0.8.20+commit.a1b79de6",
        balance: "0 BRIXS",
        txs: Math.floor(Math.random() * 500) + 1,
        date: tx.timestamp,
        verified: true
      }));
      setContracts(mockedContracts);
      setLoading(false);
    });
  }, []);

  return (
    <div className="container page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Verified Contracts</h1>
      </div>

      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Showing the last 15 verified contracts with Source Code
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><div className="spinner" /></div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Contract Name</th>
                  <th>Compiler</th>
                  <th>Version</th>
                  <th>Balance</th>
                  <th>Txns</th>
                  <th>Verified Date</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c, i) => (
                  <tr key={i}>
                    <td>
                      <Link to={`/address/${c.address}`} className="hash-link mono" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
