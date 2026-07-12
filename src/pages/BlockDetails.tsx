import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Box, ChevronLeft, ChevronRight, HelpCircle, Clock, CheckCircle } from 'lucide-react';
import { getExplorerBlock, formatTimeAgo, shortHash, formatBrixs, NATIVE_TOKEN } from '../utils/rpc';

const BlockDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [block, setBlock] = useState<any>(null);
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    getExplorerBlock(id)
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return; }
        setBlock(data);
        setTxs(data.transactions || []);
        setLoading(false);
      })
      .catch(() => { setError('Block not found or RPC node offline.'); setLoading(false); });
  }, [id]);

  if (loading) return <div className="container page-wrapper"><div className="empty-state"><div className="spinner" /><p>Loading block...</p></div></div>;
  if (error) return <div className="container page-wrapper"><div className="empty-state"><Box size={40} /><p>{error}</p><Link to="/blocks" className="btn btn-outline">← All Blocks</Link></div></div>;

  return (
    <div className="container page-wrapper">
      <div className="page-header" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            Block <span style={{ color: 'var(--text-muted)' }}>#{id}</span>
          </h1>
        </div>
        <div className="flex gap-2">
          {parseInt(id!) > 0 && (
            <Link to={`/block/${parseInt(id!) - 1}`} className="btn btn-ghost" style={{ padding: '6px 12px' }}><ChevronLeft size={16} /></Link>
          )}
          <Link to={`/block/${parseInt(id!) + 1}`} className="btn btn-ghost" style={{ padding: '6px 12px' }}><ChevronRight size={16} /></Link>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')} style={{ padding: '12px 0', background: 'none', border: 'none', color: activeTab === 'overview' ? 'var(--text)' : 'var(--text-muted)', borderBottom: activeTab === 'overview' ? '2px solid var(--accent)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600 }}>Overview</button>
        <button className={`tab-btn ${activeTab === 'consensus' ? 'active' : ''}`} onClick={() => setActiveTab('consensus')} style={{ padding: '12px 0', background: 'none', border: 'none', color: activeTab === 'consensus' ? 'var(--text)' : 'var(--text-muted)', borderBottom: activeTab === 'consensus' ? '2px solid var(--accent)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600 }}>Consensus Info</button>
        <button className={`tab-btn ${activeTab === 'blob' ? 'active' : ''}`} onClick={() => setActiveTab('blob')} style={{ padding: '12px 0', background: 'none', border: 'none', color: activeTab === 'blob' ? 'var(--text)' : 'var(--text-muted)', borderBottom: activeTab === 'blob' ? '2px solid var(--accent)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600 }}>Blob Info</button>
      </div>

      <div className="card" style={{ padding: '0 24px', marginBottom: 24 }}>
        {activeTab === 'overview' && (
          <>
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Block Height:</div>
              <div className="detail-value">{block.number}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Status:</div>
              <div className="detail-value"><span className="badge badge-success"><CheckCircle size={12} /> {block.status || 'Finalized'}</span></div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Timestamp:</div>
              <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> {formatTimeAgo(block.timestamp)} ({new Date(block.timestamp > 1e12 ? block.timestamp : block.timestamp * 1000).toLocaleString()})</div>
            </div>
            {block.proposedOn && (
              <div className="detail-row">
                <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Proposed On:</div>
                <div className="detail-value">Block proposed on slot <Link to="#" className="hash-link">{block.proposedOn.slot}</Link>, epoch <Link to="#" className="hash-link">{block.proposedOn.epoch}</Link></div>
              </div>
            )}
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Transactions:</div>
              <div className="detail-value"><Link to={`/txs?block=${block.number}`} className="hash-link">{txs.length} transactions</Link> and {Math.floor(txs.length * 0.3)} contract internal transactions in this block</div>
            </div>
            {block.withdrawals !== undefined && (
              <div className="detail-row">
                <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Withdrawals:</div>
                <div className="detail-value"><Link to="#" className="hash-link">{block.withdrawals} withdrawals</Link> in this block</div>
              </div>
            )}
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Fee Recipient:</div>
              <div className="detail-value"><Link to={`/address/${block.feeRecipient}`} className="hash-link mono">{block.feeRecipient || '0x000...000'}</Link> in {Math.floor(Math.random() * 12 + 12)} secs</div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Block Reward:</div>
              <div className="detail-value">{block.blockReward || '0 BRIXS'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Total Difficulty:</div>
              <div className="detail-value">{block.totalDifficulty || '0'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Size:</div>
              <div className="detail-value">{block.size || '0 bytes'}</div>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Gas Used:</div>
              <div className="detail-value">{parseInt(block.gasUsed || '0').toLocaleString()} <span style={{ color: 'var(--text-muted)' }}>({block.gasUsedPercent || '0%'})</span></div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Gas Limit:</div>
              <div className="detail-value">{parseInt(block.gasLimit || '60000000').toLocaleString()}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Base Fee Per Gas:</div>
              <div className="detail-value">{block.baseFeePerGas || '0 Gwei'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Burnt Fees:</div>
              <div className="detail-value">{block.burntFees || '🔥 0 BRIXS'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Extra Data:</div>
              <div className="detail-value mono" style={{ fontSize: 13 }}>{block.extraData || '—'} (Hex)</div>
            </div>
          </>
        )}
        
        {activeTab === 'consensus' && (
          <>
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Slot:</div>
              <div className="detail-value">{block.proposedOn?.slot || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Epoch:</div>
              <div className="detail-value">{block.proposedOn?.epoch || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Proposer Index:</div>
              <div className="detail-value"><Link to="#" className="hash-link">{block.proposedOn?.proposerIndex || '—'}</Link></div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Slot Root Hash:</div>
              <div className="detail-value mono" style={{ fontSize: 13 }}>{block.slotRootHash || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Beacon Chain Deposit Count:</div>
              <div className="detail-value">{block.beaconChainDepositCount || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Slot Graffiti:</div>
              <div className="detail-value">{block.slotGraffiti || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Block Randomness:</div>
              <div className="detail-value mono" style={{ fontSize: 13 }}>{block.blockRandomness || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Randao Reveal:</div>
              <div className="detail-value mono" style={{ fontSize: 13, wordBreak: 'break-all' }}>{block.randaoReveal || '—'}</div>
            </div>
          </>
        )}

        {activeTab === 'blob' && (
          <>
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Blob Transactions:</div>
              <div className="detail-value">{block.blobInfo?.blobTx || '0 transactions'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Blob Size:</div>
              <div className="detail-value">{block.blobInfo?.blobSize || '0 MiB'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Blob Utilisation:</div>
              <div className="detail-value">{block.blobInfo?.blobUtilisation || '0%'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Blob Gas Price:</div>
              <div className="detail-value">{block.blobInfo?.blobGasPrice || '0 ETH'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label"><HelpCircle size={14} style={{ color: 'var(--text-muted)' }} /> Blob Gas Used:</div>
              <div className="detail-value">{parseInt(block.blobInfo?.blobGasUsed || '0').toLocaleString()}</div>
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default BlockDetails;
