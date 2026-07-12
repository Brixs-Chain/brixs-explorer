import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { getExplorerStats, formatBrixs, NATIVE_TOKEN, EXPLORER_API } from '../utils/rpc';
import CurrencyLogo from '../components/CurrencyLogo';

const Validators: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => { getExplorerStats().then(setStats).catch(() => {}); }, []);

  const validators = [
    {
      rank: 1,
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      name: 'Genesis Validator',
      stake: '10,000,000',
      status: 'Active',
      blocks: stats?.currentBlock ?? '—',
    }
  ];

  return (
    <div className="container page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={22} color="var(--accent)" /> Validators
          </h1>
          <div className="page-subtitle">DPoS Validators securing the Brixs Testnet</div>
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Address</th>
              <th>Name</th>
              <th>Staked ({NATIVE_TOKEN})</th>
              <th>Status</th>
              <th>Blocks Produced</th>
            </tr>
          </thead>
          <tbody>
            {validators.map((v, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 700, color: 'var(--accent)' }}>#{v.rank}</td>
                <td><span className="hash-link mono">{v.address}</span></td>
                <td style={{ fontWeight: 600 }}>{v.name}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {v.stake} <CurrencyLogo symbol={NATIVE_TOKEN} size={16} />
                  </div>
                </td>
                <td><span className="badge badge-success">{v.status}</span></td>
                <td>{v.blocks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Validators;
