import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Box, FileText, CheckCircle, ArrowRight, Copy } from 'lucide-react';
import { getExplorerTxs, shortHash, formatTimeAgo } from '../utils/rpc';
import CurrencyLogo from '../components/CurrencyLogo';

const TokenDetails: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [tokenInfo, setTokenInfo] = useState({ name: 'Unknown Token', symbol: 'UNKNOWN' });

  // Derive mock token data based on the USDC dummy transfers from sequencer
  const totalSupply = "1,000,000,000.000000";
  const holders = "1,240";
  const transfersCount = "12,504";

  useEffect(() => {
    // Fetch recent transactions and filter for simulated ERC-20 transfers
    getExplorerTxs(1, 100).then(res => {
      const allTxs = res.txs || [];
      const extractedTransfers: any[] = [];
      let foundName = 'Unknown Token';
      let foundSymbol = 'UNKNOWN';
      
      allTxs.forEach((tx: any) => {
        if (tx.erc20Transfers && tx.erc20Transfers.length > 0) {
          tx.erc20Transfers.forEach((t: any) => {
            if (address && t.contract && t.contract.toLowerCase() === address.toLowerCase()) {
              if (foundName === 'Unknown Token') {
                foundName = t.tokenName || 'Unknown Token';
                foundSymbol = t.tokenSymbol || 'UNKNOWN';
              }
              extractedTransfers.push({
                ...t,
                txHash: tx.hash,
                timestamp: tx.timestamp,
                blockNumber: tx.blockNumber
              });
            }
          });
        }
      });
      
      // Fallback for mock data mappings if no transfers found
      if (foundName === 'Unknown Token' && address) {
        if (address.toLowerCase() === '0x0000000000000000000000000000000000000002' || address.toLowerCase().includes('usdt')) { foundName = 'Tether USD'; foundSymbol = 'USDT'; }
        else if (address.toLowerCase() === '0x0000000000000000000000000000000000000003' || address.toLowerCase().includes('usdc')) { foundName = 'USD Coin'; foundSymbol = 'USDC'; }
        else if (address.toLowerCase() === '0x0000000000000000000000000000000000000001' || address.toLowerCase().includes('wbrixs')) { foundName = 'Wrapped BRIXS'; foundSymbol = 'WBRIXS'; }
        else if (address.toLowerCase() === '0x0000000000000000000000000000000000000004' || address.toLowerCase().includes('bdao')) { foundName = 'Brixs DAO'; foundSymbol = 'BDAO'; }
        else if (address.toLowerCase() === '0x0000000000000000000000000000000000000005' || address.toLowerCase().includes('link')) { foundName = 'Chainlink'; foundSymbol = 'LINK'; }
      }

      setTokenInfo({ name: foundName, symbol: foundSymbol });
      setTransfers(extractedTransfers.slice(0, 20));
      setLoading(false);
    });
  }, [address]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="container page-wrapper">
      <div className="page-header" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CurrencyLogo symbol={tokenInfo.symbol} size={28} />
            Token <span style={{ color: 'var(--text-muted)' }}>{tokenInfo.name}</span>
          </h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Overview Card */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>Overview</h3>
          
          <div className="detail-row">
            <div className="detail-label">Max Total Supply:</div>
            <div className="detail-value">{totalSupply} {tokenInfo.symbol}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Holders:</div>
            <div className="detail-value">{holders} addresses</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Total Transfers:</div>
            <div className="detail-value">{transfersCount}</div>
          </div>
        </div>

        {/* Profile Summary Card */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>Profile Summary</h3>
          
          <div className="detail-row">
            <div className="detail-label">Contract:</div>
            <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="mono">{address}</span>
              <button className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: 11 }} onClick={copyAddress}>
                {copied ? '✓' : <Copy size={12} />}
              </button>
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Decimals:</div>
            <div className="detail-value">6</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Official Site:</div>
            <div className="detail-value"><a href="https://brixs.space" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>https://brixs.space</a></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            Token Transfers
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><div className="spinner" /></div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Txn Hash</th>
                  <th>Method</th>
                  <th>Age</th>
                  <th>From</th>
                  <th></th>
                  <th>To</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {transfers.length > 0 ? transfers.map((t, i) => (
                  <tr key={i}>
                    <td><Link to={`/tx/${t.txHash}`} className="hash-link mono">{shortHash(t.txHash, 8)}</Link></td>
                    <td><span className="badge badge-gray">Transfer</span></td>
                    <td>{formatTimeAgo(t.timestamp)}</td>
                    <td><Link to={`/address/${t.from}`} className="hash-link mono">{shortHash(t.from, 8)}</Link></td>
                    <td><ArrowRight size={14} style={{ color: 'var(--success)' }} /></td>
                    <td><Link to={`/address/${t.to}`} className="hash-link mono">{shortHash(t.to, 8)}</Link></td>
                    <td>{t.value} {tokenInfo.symbol}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                      No transfers found for this token.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenDetails;
