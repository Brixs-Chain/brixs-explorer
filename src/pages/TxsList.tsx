import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { getExplorerTxs, formatTimeAgo, shortHash, formatBrixs, NATIVE_TOKEN } from '../utils/rpc';
import CurrencyLogo from '../components/CurrencyLogo';

const TxsList: React.FC = () => {
  const [txs, setTxs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const LIMIT = 25;

  const fetchData = React.useCallback(() => {
    getExplorerTxs(page, LIMIT).then(data => {
      setTxs(data.txs || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    setLoading(true);
    fetchData();
    if (page === 1) {
      const id = setInterval(fetchData, 6000);
      return () => clearInterval(id);
    }
  }, [fetchData, page]);

  return (
    <div className="container page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <div className="page-subtitle">
            {total.toLocaleString()} total transactions found
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state"><div className="spinner" /><p>Loading transactions...</p></div>
        ) : txs.length === 0 ? (
          <div className="empty-state">
            <FileText size={40} />
            <p>No transactions yet. Use the faucet to send your first transaction.</p>
            <Link to="/faucet" className="btn btn-primary" style={{ marginTop: 8 }}>Go to Faucet</Link>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Txn Hash</th>
                  <th>Type</th>
                  <th>Age</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount ({NATIVE_TOKEN})</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((tx, i) => (
                  <tr key={i}>
                    <td>
                      <Link to={`/tx/${tx.hash}`} className="hash-link">{shortHash(tx.hash)}</Link>
                    </td>
                    <td>
                      <span className="badge badge-gray">{tx.type || 'Transfer'}</span>
                    </td>
                    <td className="text-muted">{formatTimeAgo(tx.timestamp)}</td>
                    <td>
                      <Link to={`/address/${tx.from}`} className="hash-link">{shortHash(tx.from)}</Link>
                    </td>
                    <td>
                      {tx.to
                        ? <Link to={`/address/${tx.to}`} className="hash-link">{shortHash(tx.to)}</Link>
                        : <span className="badge badge-yellow">Contract Creation</span>
                      }
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {formatBrixs(tx.value || '0')}
                        <CurrencyLogo symbol={NATIVE_TOKEN} size={16} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 'auto' }}>
                Page {page} of {pages} · {total} transactions
              </span>
              <button onClick={() => setPage(1)} disabled={page === 1}><ChevronLeft size={12} /><ChevronLeft size={12} /></button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={12} /> Prev</button>
              <button className="active">{page}</button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>Next <ChevronRight size={12} /></button>
              <button onClick={() => setPage(pages)} disabled={page === pages}><ChevronRight size={12} /><ChevronRight size={12} /></button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TxsList;
