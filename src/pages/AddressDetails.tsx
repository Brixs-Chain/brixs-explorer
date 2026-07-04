import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Wallet, ArrowUpRight, ArrowDownLeft, FileText } from 'lucide-react';
import { getExplorerAddress, getAddressInfo, formatTimeAgo, shortHash, formatBrixs, NATIVE_TOKEN } from '../utils/rpc';

const AddressDetails: React.FC = () => {
  const { hash: address } = useParams<{ hash: string }>();
  const [info, setInfo] = useState<any>(null);
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(address || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    Promise.all([
      getExplorerAddress(address).catch(() => null),
      getAddressInfo(address).catch(() => null),
    ]).then(([explorerData, rpcData]) => {
      const merged = {
        ...(rpcData || {}),
        ...(explorerData || {}),
        balance: rpcData?.balance || explorerData?.balanceFormatted || '0',
        txCount: explorerData?.txCount || rpcData?.txCount || 0,
      };
      setInfo(merged);
      setTxs(explorerData?.transactions || []);
      setLoading(false);
    }).catch(() => {
      setError('Address not found or RPC node offline.');
      setLoading(false);
    });
  }, [address]);

  if (loading) return <div className="container page-wrapper"><div className="empty-state"><div className="spinner" /><p>Loading address...</p></div></div>;
  if (error) return <div className="container page-wrapper"><div className="empty-state"><Wallet size={40} /><p>{error}</p></div></div>;

  return (
    <div className="container page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Address</h1>
          <div className="page-subtitle mono" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            {address}
            <button className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: 11 }} onClick={copy}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Overview card */}
      <div className="card" style={{ padding: '0 24px', marginBottom: 24 }}>
        <div className="detail-row">
          <div className="detail-label">Balance</div>
          <div className="detail-value">
            <strong style={{ fontSize: 18 }}>{formatBrixs(info?.balance || '0')}</strong> {NATIVE_TOKEN}
          </div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Transactions</div>
          <div className="detail-value">{(info?.txCount || 0).toLocaleString()} transactions</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Nonce</div>
          <div className="detail-value">{info?.nonce || 0}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Network</div>
          <div className="detail-value">Brixs Testnet (Chain ID: 51515)</div>
        </div>
      </div>

      {/* Transactions */}
      <div className="card">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={16} /> Transactions
          <span className="badge badge-gray">{txs.length}</span>
        </div>

        {txs.length === 0 ? (
          <div className="empty-state">
            <FileText size={36} />
            <p>No transactions found for this address.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Txn Hash</th>
                <th>Type</th>
                <th>Age</th>
                <th>From</th>
                <th>Dir</th>
                <th>To</th>
                <th>Amount ({NATIVE_TOKEN})</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((tx, i) => {
                const isOut = tx.from?.toLowerCase() === address?.toLowerCase();
                return (
                  <tr key={i}>
                    <td><Link to={`/tx/${tx.hash}`} className="hash-link">{shortHash(tx.hash)}</Link></td>
                    <td><span className="badge badge-gray">{tx.type || 'Transfer'}</span></td>
                    <td className="text-muted">{formatTimeAgo(tx.timestamp)}</td>
                    <td><Link to={`/address/${tx.from}`} className="hash-link">{shortHash(tx.from)}</Link></td>
                    <td>
                      {isOut
                        ? <span className="badge badge-fail" style={{ gap: 3 }}><ArrowUpRight size={10} /> OUT</span>
                        : <span className="badge badge-success" style={{ gap: 3 }}><ArrowDownLeft size={10} /> IN</span>
                      }
                    </td>
                    <td>{tx.to ? <Link to={`/address/${tx.to}`} className="hash-link">{shortHash(tx.to)}</Link> : <span className="badge badge-yellow">Contract</span>}</td>
                    <td style={{ fontWeight: 600 }}>{formatBrixs(tx.value || '0')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AddressDetails;
