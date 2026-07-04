import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Droplets, CheckCircle, XCircle, ExternalLink, Clock } from 'lucide-react';
import { requestFaucet, NATIVE_TOKEN } from '../utils/rpc';

const Faucet: React.FC = () => {
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);

  // Auto-fill from MetaMask if available
  const fillFromWallet = async () => {
    if (!window.ethereum) return alert('MetaMask not installed.');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts[0]) setAddress(accounts[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !address.startsWith('0x') || address.length !== 42) {
      return alert('Please enter a valid wallet address (0x...)');
    }
    setStatus('loading');
    try {
      const data = await requestFaucet(address);
      if (data.success) {
        setResult(data);
        setStatus('success');
      } else {
        setResult(data);
        setStatus('error');
      }
    } catch {
      setResult({ error: 'Could not connect to the Brixs RPC node. Make sure it is running on localhost:8546.' });
      setStatus('error');
    }
  };

  return (
    <div className="container page-wrapper" style={{ maxWidth: 680 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Droplets size={24} color="var(--accent)" />
            Brixs Testnet Faucet
          </h1>
          <div className="page-subtitle">Receive free BRIXS tokens for testing on the Brixs Testnet</div>
        </div>
      </div>

      {/* Info banner */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20, background: 'var(--accent-glow)', border: '1px solid rgba(234,179,8,0.2)' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Clock size={18} color="var(--accent-dark)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--accent-dark)', marginBottom: 4 }}>Faucet Limits</div>
            <ul style={{ paddingLeft: 16, color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.8 }}>
              <li>100 BRIXS per request</li>
              <li>24-hour cooldown per address</li>
              <li>Tokens are for testing only — no real value</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '28px 28px' }}>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
            Your Wallet Address
          </label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              className="input"
              placeholder="0x..."
              value={address}
              onChange={e => setAddress(e.target.value)}
              disabled={status === 'loading'}
            />
            {typeof window !== 'undefined' && window.ethereum && (
              <button type="button" className="btn btn-ghost" onClick={fillFromWallet} style={{ whiteSpace: 'nowrap' }}>
                Use MetaMask
              </button>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={status === 'loading'}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15 }}
          >
            {status === 'loading' ? (
              <><div className="spinner" style={{ width: 16, height: 16 }} /> Requesting tokens...</>
            ) : (
              <><Droplets size={16} /> Request 100 BRIXS</>
            )}
          </button>
        </form>

        {/* Success */}
        {status === 'success' && result && (
          <div style={{ marginTop: 20, padding: '16px 20px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#16a34a', marginBottom: 12 }}>
              <CheckCircle size={18} /> Success! 100 BRIXS sent to your wallet
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <div><strong>Amount:</strong> {result.amount} {NATIVE_TOKEN}</div>
              {result.txHash && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <strong>Tx Hash:</strong>
                  <Link to={`/tx/${result.txHash}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>
                    {result.txHash.slice(0, 20)}...{result.txHash.slice(-8)}
                    <ExternalLink size={11} style={{ marginLeft: 4 }} />
                  </Link>
                </div>
              )}
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
              Add Brixs Testnet to MetaMask: RPC URL <code style={{ background: 'var(--bg-tertiary)', padding: '1px 6px', borderRadius: 4 }}>https://rpc-testnet.brixs.space</code>, Chain ID <code style={{ background: 'var(--bg-tertiary)', padding: '1px 6px', borderRadius: 4 }}>51515</code>
            </div>
          </div>
        )}

        {/* Error */}
        {status === 'error' && result && (
          <div style={{ marginTop: 20, padding: '16px 20px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>
              <XCircle size={18} /> Request Failed
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{result.error}</div>
          </div>
        )}
      </div>

      {/* MetaMask setup */}
      <div className="card" style={{ padding: '20px 24px', marginTop: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Add Brixs Testnet to MetaMask</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <div>• <strong>Network Name:</strong> Brixs Testnet</div>
          <div>• <strong>RPC URL:</strong> <code>https://rpc-testnet.brixs.space</code></div>
          <div>• <strong>Chain ID:</strong> 51515</div>
          <div>• <strong>Symbol:</strong> BRIXS</div>
          <div>• <strong>Explorer:</strong> https://testnet.brixs.space/</div>
        </div>
      </div>
    </div>
  );
};

export default Faucet;
