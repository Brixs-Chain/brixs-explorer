import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SiteFooter from './components/SiteFooter';
import Dashboard from './pages/Dashboard';
import BlocksList from './pages/BlocksList';
import BlockDetails from './pages/BlockDetails';
import TxsList from './pages/TxsList';
import TxDetails from './pages/TxDetails';
import AddressDetails from './pages/AddressDetails';
import Validators from './pages/Validators';
import UnitConverter from './pages/UnitConverter';
import BroadcastTx from './pages/BroadcastTx';
import PendingTxs from './pages/PendingTxs';

import ApiKeys from './pages/ApiKeys';
import Tokens from './pages/Tokens';
import TokenTransfers from './pages/TokenTransfers';
import TokenDetails from './pages/TokenDetails';
import InternalTxs from './pages/InternalTxs';
import VerifiedContracts from './pages/VerifiedContracts';

const Placeholder = ({ title }: { title: string }) => (
  <div className="container page-wrapper">
    <div className="empty-state" style={{ paddingTop: 80 }}>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>{title}</h2>
      <p>This section is coming soon.</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main className="main-content" style={{ flex: 1 }}>
          <Routes>
            <Route path="/"                       element={<Dashboard />} />
            <Route path="/blocks"                 element={<BlocksList />} />
            <Route path="/block/:id"              element={<BlockDetails />} />
            <Route path="/txs"                    element={<TxsList />} />
            <Route path="/tx/:hash"               element={<TxDetails />} />
            <Route path="/address/:hash"          element={<AddressDetails />} />
            <Route path="/pending"                element={<PendingTxs />} />
            <Route path="/validators"             element={<Validators />} />
            <Route path="/tools/unit-converter"   element={<UnitConverter />} />
            <Route path="/tools/broadcast"        element={<BroadcastTx />} />
            <Route path="/tools/api"              element={<ApiKeys />} />
            <Route path="/tokens"                 element={<Tokens />} />
            <Route path="/token/:address"         element={<TokenDetails />} />
            <Route path="/token-transfers"        element={<TokenTransfers />} />
            <Route path="/txsInternal"            element={<InternalTxs />} />
            <Route path="/contractsVerified"      element={<VerifiedContracts />} />
            <Route path="*"                       element={<Placeholder title="404 — Page Not Found" />} />
          </Routes>
        </main>

        <SiteFooter />
      </div>
    </Router>
  );
}

export default App;
