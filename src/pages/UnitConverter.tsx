import React, { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { ethers } from 'ethers';

const units = ['Wei', 'Kwei', 'Mwei', 'Gwei', 'Szabo', 'Finney', 'Ether'];
const unitMap: Record<string, string> = {
  Wei: 'wei', Kwei: 'kwei', Mwei: 'mwei', Gwei: 'gwei',
  Szabo: 'szabo', Finney: 'finney', Ether: 'ether'
};

const UnitConverter: React.FC = () => {
  const [value, setValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('Ether');

  const convert = (to: string): string => {
    try {
      if (!value || isNaN(Number(value))) return '—';
      const wei = ethers.parseUnits(value, unitMap[fromUnit]);
      return ethers.formatUnits(wei, unitMap[to]);
    } catch {
      return 'Invalid';
    }
  };

  return (
    <div className="container page-wrapper" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><ArrowLeftRight size={20} style={{ marginRight: 8 }} />Unit Converter</h1>
          <div className="page-subtitle">Convert between BRIXS / ETH-compatible denominations</div>
        </div>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>VALUE</label>
            <input
              className="input"
              type="number"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Enter value..."
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>FROM UNIT</label>
            <select
              className="input"
              value={fromUnit}
              onChange={e => setFromUnit(e.target.value)}
              style={{ width: 130 }}
            >
              {units.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr><th>Unit</th><th>Value</th></tr>
          </thead>
          <tbody>
            {units.map(u => (
              <tr key={u} style={{ background: u === fromUnit ? 'var(--accent-glow)' : undefined }}>
                <td style={{ fontWeight: u === fromUnit ? 700 : 400, color: u === fromUnit ? 'var(--accent-dark)' : undefined }}>{u}</td>
                <td className="mono" style={{ wordBreak: 'break-all', fontSize: 12 }}>{convert(u)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UnitConverter;
