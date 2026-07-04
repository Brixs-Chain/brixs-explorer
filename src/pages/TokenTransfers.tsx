import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { shortHash, formatTimeAgo } from '../utils/rpc';

const TokenTransfers: React.FC = () => {
  const [page, setPage] = useState(1);
  const total = 3;
  const pages = 1;
  const transfers = [
    { hash: '0xabc1234567890abcdef1234567890abcdef1234567890abcdef1234567890a', age: Date.now() - 60000, from: '0x1111111111111111111111111111111111111111', to: '0x2222222222222222222222222222222222222222', amount: '100.5', token: 'USDT' },
    { hash: '0xdef4567890abcdef1234567890abcdef1234567890abcdef1234567890abcd', age: Date.now() - 360000, from: '0x3333333333333333333333333333333333333333', to: '0x4444444444444444444444444444444444444444', amount: '500', token: 'USDC' },
    { hash: '0xghi7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1', age: Date.now() - 86400000, from: '0x5555555555555555555555555555555555555555', to: '0x6666666666666666666666666666666666666666', amount: '10', token: 'WBRIXS' },
  ];

  return (
    <div className="container page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ArrowLeftRight size={22} color="var(--accent)" /> Token Transfers
          </h1>
          <div className="page-subtitle">Recent ERC-20 token transfers</div>
        </div>
      </div>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Txn Hash</th>
              <th>Age</th>
              <th>From</th>
              <th>To</th>
              <th>Amount</th>
              <th>Token</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((t, i) => (
              <tr key={i}>
                <td><Link to={`/tx/${t.hash}`} className="hash-link">{shortHash(t.hash)}</Link></td>
                <td className="text-muted">{formatTimeAgo(t.age)}</td>
                <td><Link to={`/address/${t.from}`} className="hash-link">{shortHash(t.from)}</Link></td>
                <td><Link to={`/address/${t.to}`} className="hash-link">{shortHash(t.to)}</Link></td>
                <td style={{ fontWeight: 600 }}>{t.amount}</td>
                <td><span className="badge badge-gray">{t.token}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 'auto' }}>
            Page {page} of {pages} · {total} transfers
          </span>
          <button onClick={() => setPage(1)} disabled={page === 1}><ChevronLeft size={12} /><ChevronLeft size={12} /></button>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={12} /> Prev</button>
          <button className="active">{page}</button>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>Next <ChevronRight size={12} /></button>
          <button onClick={() => setPage(pages)} disabled={page === pages}><ChevronRight size={12} /><ChevronRight size={12} /></button>
        </div>
      </div>
    </div>
  );
};
export default TokenTransfers;
