import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getExplorerTx, getTransactionDetails, formatTimeAgo, shortHash, formatBrixs, NATIVE_TOKEN } from '../utils/rpc';

const TxDetails: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();
  const [tx, setTx] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  useEffect(() => {
    if (!hash) return;
    setLoading(true);
    // Try explorer API first (has richer data), fallback to RPC
    Promise.all([
      getExplorerTx(hash).catch(() => null),
      getTransactionDetails(hash).catch(() => null),
    ]).then(([explorerTx, rpcTx]) => {
      if (explorerTx && !explorerTx.error) {
        // explorerTx has the real data (like to, from, value, type) for faucet txs
        // rpcTx might have dummy data that overwrites it if we spread it last
        const merged = { ...rpcTx, ...explorerTx };
        
        // If it's mined (has blockNumber) but missing status, assume success (1)
        if (merged.blockNumber && merged.status === undefined) {
          merged.status = 1;
        }
        
        setTx(merged);
      } else if (rpcTx) {
        setTx(rpcTx);
      } else {
        setError('Transaction not found or RPC node is offline.');
      }
      setLoading(false);
    });
  }, [hash]);

  if (loading) return <div className="container page-wrapper"><div className="empty-state"><div className="spinner" /><p>Loading transaction...</p></div></div>;
  if (error) return <div className="container page-wrapper"><div className="empty-state"><FileText size={40} /><p>{error}</p></div></div>;

  const status = tx?.status === 1 || tx?.status === '0x1' ? 'success' : tx?.status === 0 ? 'fail' : 'pending';

  return (
    <div className="container page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transaction Details</h1>
          <div className="page-subtitle mono" style={{ fontSize: 12 }}>{hash}</div>
        </div>
      </div>

      <div className="card" style={{ padding: '0 24px' }}>
        {/* Status */}
        <div className="detail-row">
          <div className="detail-label">Status</div>
          <div className="detail-value">
            {status === 'success' && <span className="badge badge-success"><CheckCircle size={11} /> Success</span>}
            {status === 'fail'    && <span className="badge badge-fail"><XCircle size={11} /> Failed</span>}
            {status === 'pending' && <span className="badge badge-pending"><Clock size={11} /> Pending</span>}
          </div>
        </div>

        {/* Hash */}
        <div className="detail-row">
          <div className="detail-label">Transaction Hash</div>
          <div className="detail-value mono" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {hash}
            <button className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: 11 }} onClick={() => copy(hash!, 'hash')}>
              {copied === 'hash' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Block */}
        {tx?.blockNumber && (
          <div className="detail-row">
            <div className="detail-label">Block</div>
            <div className="detail-value">
              <Link to={`/block/${tx.blockNumber}`} style={{ color: 'var(--accent)' }}>#{tx.blockNumber}</Link>
            </div>
          </div>
        )}

        {/* Timestamp */}
        {tx?.timestamp && (
          <div className="detail-row">
            <div className="detail-label">Timestamp</div>
            <div className="detail-value">{formatTimeAgo(tx.timestamp)} · {new Date(tx.timestamp > 1e12 ? tx.timestamp : tx.timestamp * 1000).toLocaleString()}</div>
          </div>
        )}

        {/* Type */}
        {tx?.type && (
          <div className="detail-row">
            <div className="detail-label">Transaction Type</div>
            <div className="detail-value"><span className="badge badge-gray">{tx.type}</span></div>
          </div>
        )}

        {/* From */}
        <div className="detail-row">
          <div className="detail-label">From</div>
          <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to={`/address/${tx?.from}`} className="hash-link mono">{tx?.from}</Link>
            <button className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: 11 }} onClick={() => copy(tx?.from || '', 'from')}>
              {copied === 'from' ? '✓' : 'Copy'}
            </button>
          </div>
        </div>

        {/* To */}
        <div className="detail-row">
          <div className="detail-label">To</div>
          <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {tx?.to
              ? <Link to={`/address/${tx.to}`} className="hash-link mono">{tx.to}</Link>
              : <span className="badge badge-yellow">Contract Creation</span>
            }
            {tx?.contractAddress && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                → Contract: <Link to={`/address/${tx.contractAddress}`} className="hash-link">{shortHash(tx.contractAddress)}</Link>
              </span>
            )}
          </div>
        </div>

        {/* Value */}
        <div className="detail-row">
          <div className="detail-label">Value</div>
          <div className="detail-value">
            <strong>{formatBrixs(tx?.value || '0')}</strong> {NATIVE_TOKEN}
          </div>
        </div>

        {/* Gas */}
        {tx?.gasUsed && (
          <div className="detail-row">
            <div className="detail-label">Gas Used</div>
            <div className="detail-value">{parseInt(tx.gasUsed, 16).toLocaleString()}</div>
          </div>
        )}

        {/* Gas price */}
        {tx?.gasPrice && (
          <div className="detail-row">
            <div className="detail-label">Gas Price</div>
            <div className="detail-value">{tx.gasPrice} Gwei</div>
          </div>
        )}

        {/* Nonce */}
        {tx?.nonce !== undefined && (
          <div className="detail-row">
            <div className="detail-label">Nonce</div>
            <div className="detail-value">{tx.nonce}</div>
          </div>
        )}

        {/* Input data */}
        {tx?.data && tx.data !== '0x' && (
          <div className="detail-row" style={{ alignItems: 'flex-start' }}>
            <div className="detail-label">Input Data</div>
            <div className="detail-value">
              <textarea
                readOnly
                value={tx.data}
                style={{
                  width: '100%',
                  height: 80,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  padding: 10,
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
        )}

        {/* Network */}
        <div className="detail-row">
          <div className="detail-label">Network</div>
          <div className="detail-value">Brixs Testnet (Chain ID: 51515)</div>
        </div>
      </div>
    </div>
  );
};

export default TxDetails;
