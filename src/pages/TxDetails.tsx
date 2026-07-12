import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FileText, CheckCircle, XCircle, Clock, HelpCircle, ArrowRight } from 'lucide-react';
import { getExplorerTx, getTransactionDetails, formatTimeAgo, shortHash, formatBrixs, NATIVE_TOKEN } from '../utils/rpc';

const TxDetails: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();
  const [tx, setTx] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  useEffect(() => {
    if (!hash) return;
    setLoading(true);
    Promise.all([
      getExplorerTx(hash).catch(() => null),
      getTransactionDetails(hash).catch(() => null),
    ]).then(([explorerTx, rpcTx]) => {
      if (explorerTx && !explorerTx.error) {
        const merged = { ...rpcTx, ...explorerTx };
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

  const status = tx?.status === 1 || tx?.status === '0x1' || tx?.status === "Success" ? 'success' : tx?.status === 0 || tx?.status === "Failed" ? 'fail' : 'pending';

  return (
    <div className="container page-wrapper">
      <div className="page-header" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            Transaction Details
          </h1>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')} style={{ padding: '12px 0', background: 'none', border: 'none', color: activeTab === 'overview' ? 'var(--text)' : 'var(--text-muted)', borderBottom: activeTab === 'overview' ? '2px solid var(--accent)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600 }}>Overview</button>
        <button className={`tab-btn ${activeTab === 'internal' ? 'active' : ''}`} onClick={() => setActiveTab('internal')} style={{ padding: '12px 0', background: 'none', border: 'none', color: activeTab === 'internal' ? 'var(--text)' : 'var(--text-muted)', borderBottom: activeTab === 'internal' ? '2px solid var(--accent)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600 }}>Internal Txs <span className="badge badge-gray" style={{ marginLeft: 6 }}>{tx?.internalTxs || 0}</span></button>
        <button className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')} style={{ padding: '12px 0', background: 'none', border: 'none', color: activeTab === 'logs' ? 'var(--text)' : 'var(--text-muted)', borderBottom: activeTab === 'logs' ? '2px solid var(--accent)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600 }}>Logs <span className="badge badge-gray" style={{ marginLeft: 6 }}>{tx?.erc20Transfers?.length || 0}</span></button>
      </div>

      <div className="card" style={{ padding: '0 24px' }}>
        {activeTab === 'overview' && (
          <>
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Transaction Hash:</div>
              <div className="detail-value mono" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {hash}
                <button className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: 11 }} onClick={() => copy(hash!, 'hash')}>
                  {copied === 'hash' ? '✓' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Status:</div>
              <div className="detail-value">
                {status === 'success' && <span className="badge badge-success"><CheckCircle size={12} /> Success</span>}
                {status === 'fail'    && <span className="badge badge-fail"><XCircle size={12} /> Failed</span>}
                {status === 'pending' && <span className="badge badge-pending"><Clock size={12} /> Pending</span>}
              </div>
            </div>

            {tx?.blockNumber && (
              <div className="detail-row">
                <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Block:</div>
                <div className="detail-value">
                  <CheckCircle size={14} style={{ color: 'var(--success)', marginRight: 6 }} />
                  <Link to={`/block/${parseInt(tx.blockNumber, 16) || tx.blockNumber}`} style={{ color: 'var(--accent)' }}>{parseInt(tx.blockNumber, 16) || tx.blockNumber}</Link>
                  <span className="badge badge-gray" style={{ marginLeft: 8 }}>75 Block Confirmations</span>
                </div>
              </div>
            )}

            {tx?.timestamp && (
              <div className="detail-row">
                <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Timestamp:</div>
                <div className="detail-value"><Clock size={14} style={{ color: 'var(--text-muted)', marginRight: 6 }} />{formatTimeAgo(tx.timestamp)} ({new Date(tx.timestamp > 1e12 ? tx.timestamp : tx.timestamp * 1000).toLocaleString()})</div>
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />

            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> From:</div>
              <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link to={`/address/${tx?.from}`} className="hash-link mono">{tx?.from}</Link>
                <button className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: 11 }} onClick={() => copy(tx?.from || '', 'from')}>
                  {copied === 'from' ? '✓' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> To:</div>
              <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {tx?.to
                  ? <Link to={`/address/${tx.to}`} className="hash-link mono">{tx.to}</Link>
                  : <span className="badge badge-yellow">Contract Creation</span>
                }
                {tx?.contractAddress && (
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    → Contract <Link to={`/address/${tx.contractAddress}`} className="hash-link">{tx.contractAddress}</Link> Created
                  </span>
                )}
              </div>
            </div>

            {/* Token Transfers */}
            {tx?.erc20Transfers && tx.erc20Transfers.length > 0 && (
              <div className="detail-row" style={{ alignItems: 'flex-start' }}>
                <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> ERC-20 Tokens Transferred:</div>
                <div className="detail-value">
                  {tx.erc20Transfers.map((transfer: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 }}>
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ color: 'var(--text-muted)' }}>From</span>
                      <Link to={`/address/${transfer.from}`} className="hash-link mono">{shortHash(transfer.from, 8)}</Link>
                      <span style={{ color: 'var(--text-muted)' }}>To</span>
                      <Link to={`/address/${transfer.to}`} className="hash-link mono">{shortHash(transfer.to, 8)}</Link>
                      <span style={{ color: 'var(--text-muted)' }}>For</span>
                      <span style={{ fontWeight: 600 }}>{transfer.value}</span>
                      <Link to={`/token/${transfer.contract}`} className="hash-link" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 14, height: 14, background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 8 }}>T</div>
                        {transfer.tokenName} ({transfer.tokenSymbol})
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />

            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Value:</div>
              <div className="detail-value">
                <span className="badge badge-gray">{formatBrixs(tx?.value || '0')} {NATIVE_TOKEN}</span>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Transaction Fee:</div>
              <div className="detail-value">{tx?.transactionFee || '0.000105 BRIXS'}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Gas Price:</div>
              <div className="detail-value">{tx?.gasPrice || '4.82 Gwei'}</div>
            </div>

          </>
        )}

        {activeTab === 'internal' && (
          <div style={{ padding: '24px 0', color: 'var(--text-muted)' }}>
            {tx?.internalTxs ? `${tx.internalTxs} Internal Transactions were processed in this contract execution.` : 'No internal transactions found.'}
          </div>
        )}

        {activeTab === 'logs' && (
          <div style={{ padding: '24px 0', color: 'var(--text-muted)' }}>
            {tx?.erc20Transfers && tx.erc20Transfers.length > 0 ? (
              <pre style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 8, fontSize: 12, overflowX: 'auto' }}>
                {JSON.stringify(tx.erc20Transfers, null, 2)}
              </pre>
            ) : 'No logs found.'}
          </div>
        )}

      </div>
    </div>
  );
};

export default TxDetails;
