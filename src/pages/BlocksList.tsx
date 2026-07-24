import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { getExplorerBlocks, formatTimeAgo, shortHash } from '../utils/rpc';

const BlocksList: React.FC = () => {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const LIMIT = 25;

  const fetchData = React.useCallback(() => {
    getExplorerBlocks(page, LIMIT).then(data => {
      setBlocks(data.blocks || []);
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
          <h1 className="page-title">Blocks</h1>
          <div className="page-subtitle">
            {total.toLocaleString()} total blocks found
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state"><div className="spinner" /> <p>Loading blocks...</p></div>
        ) : blocks.length === 0 ? (
          <div className="empty-state">
            <Box size={40} />
            <p>No blocks mined yet. Blocks are created when transactions are sent.</p>
            <Link to="/faucet" className="btn btn-primary" style={{ marginTop: 8 }}>Go to Faucet</Link>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Block</th>
                  <th>Age</th>
                  <th>Txns</th>
                  <th>Block Hash</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map((b, i) => (
                  <tr key={i}>
                    <td>
                      <Link to={`/block/${b.number}`} className="hash-link" style={{ fontSize: 13, fontFamily: 'inherit' }}>
                        #{b.number}
                      </Link>
                    </td>
                    <td className="text-muted">{formatTimeAgo(b.timestamp)}</td>
                    <td>
                      <span className="badge badge-yellow">{b.txCount ?? 0} txn{(b.txCount ?? 0) !== 1 ? 's' : ''}</span>
                    </td>
                    <td>
                      <Link to={`/block/${b.number}`} className="hash-link">{shortHash(b.hash || '0x' + '0'.repeat(64))}</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 'auto' }}>
                Page {page} of {pages} · {total} blocks
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

export default BlocksList;
