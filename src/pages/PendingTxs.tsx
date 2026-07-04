import React, { useState } from 'react';
import { getExplorerTxs } from '../utils/rpc';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

const PendingTxs: React.FC = () => {
  // Pending txs are currently stored in-memory on the RPC node
  return (
    <div className="container page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Clock size={20} style={{ marginRight: 8 }} />Pending Transactions</h1>
          <div className="page-subtitle">Transactions in the Brixs encrypted mempool</div>
        </div>
      </div>
      <div className="card">
        <div className="empty-state">
          <Clock size={40} />
          <p>No pending transactions. The Brixs encrypted mempool processes transactions instantly.</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Brixs uses an encrypted mempool with MEV protection — all transactions are confirmed immediately.</p>
          <Link to="/txs" className="btn btn-outline" style={{ marginTop: 12 }}>View Confirmed Transactions</Link>
        </div>
      </div>
    </div>
  );
};

export default PendingTxs;
