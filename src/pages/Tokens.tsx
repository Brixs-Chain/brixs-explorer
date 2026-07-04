import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Coins, ChevronLeft, ChevronRight } from 'lucide-react';

const Tokens: React.FC = () => {
  const [page, setPage] = useState(1);
  const total = 5;
  const pages = 1;
  const tokens = [
    { name: 'Wrapped BRIXS', symbol: 'WBRIXS', address: '0x0000000000000000000000000000000000000001', supply: '1,000,000' },
    { name: 'Tether USD', symbol: 'USDT', address: '0x0000000000000000000000000000000000000002', supply: '500,000' },
    { name: 'USD Coin', symbol: 'USDC', address: '0x0000000000000000000000000000000000000003', supply: '500,000' },
    { name: 'Brixs DAO', symbol: 'BDAO', address: '0x0000000000000000000000000000000000000004', supply: '10,000,000' },
    { name: 'Chainlink', symbol: 'LINK', address: '0x0000000000000000000000000000000000000005', supply: '250,000' },
  ];

  return (
    <div className="container page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Coins size={22} color="var(--accent)" /> Tokens
          </h1>
          <div className="page-subtitle">Tokens tracked on Brixs Testnet</div>
        </div>
      </div>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Token Name</th>
              <th>Symbol</th>
              <th>Contract Address</th>
              <th>Total Supply</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((t, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{t.name}</td>
                <td><span className="badge badge-gray">{t.symbol}</span></td>
                <td><Link to={`/address/${t.address}`} className="hash-link">{t.address}</Link></td>
                <td>{t.supply}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 'auto' }}>
            Page {page} of {pages} · {total} tokens
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
export default Tokens;
