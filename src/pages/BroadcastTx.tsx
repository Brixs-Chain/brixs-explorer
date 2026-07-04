import React, { useState } from 'react';
import { Send, CheckCircle, XCircle } from 'lucide-react';
import { broadcastTx } from '../utils/rpc';
import { Link } from 'react-router-dom';

const BroadcastTx: React.FC = () => {
  const [rawTx, setRawTx] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawTx.trim() || !rawTx.startsWith('0x')) return alert('Enter a valid raw transaction hex (0x...)');
    setStatus('loading');
    const res = await broadcastTx(rawTx.trim());
    if (res.success) { setResult(res); setStatus('success'); }
    else { setResult(res); setStatus('error'); }
  };

  return (
    <div className="container page-wrapper" style={{ maxWidth: 680 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><Send size={20} style={{ marginRight: 8 }} />Broadcast Transaction</h1>
          <div className="page-subtitle">Submit a signed raw transaction to the Brixs Testnet</div>
        </div>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Signed Raw Transaction (Hex)</label>
          <textarea
            className="input"
            value={rawTx}
            onChange={e => setRawTx(e.target.value)}
            placeholder="0x..."
            style={{ height: 130, fontFamily: 'var(--font-mono)', fontSize: 12, resize: 'vertical' }}
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={status === 'loading'}
            style={{ width: '100%', justifyContent: 'center', padding: 12, marginTop: 14, fontSize: 15 }}
          >
            {status === 'loading'
              ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Broadcasting...</>
              : <><Send size={15} /> Broadcast Transaction</>
            }
          </button>
        </form>

        {status === 'success' && result && (
          <div style={{ marginTop: 20, padding: '16px 20px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#16a34a', marginBottom: 8 }}>
              <CheckCircle size={18} /> Transaction Broadcast Successful
            </div>
            <div style={{ fontSize: 13 }}>
              Tx Hash: <Link to={`/tx/${result.txHash}`} className="hash-link mono">{result.txHash}</Link>
            </div>
          </div>
        )}

        {status === 'error' && result && (
          <div style={{ marginTop: 20, padding: '16px 20px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>
              <XCircle size={18} /> Broadcast Failed
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{result.error}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BroadcastTx;
