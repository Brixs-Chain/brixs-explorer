import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush } from 'recharts';
import { getExplorerBlocks } from '../utils/rpc';

const TpsChart: React.FC = () => {
  const [blocks, setBlocks] = useState<any[]>([]);

  useEffect(() => {
    getExplorerBlocks(1, 100).then(res => {
      setBlocks(res.blocks || []);
    });
  }, []);

  const chartData = useMemo(() => {
    if (!blocks || blocks.length < 2) return [];
    
    const data = [];
    const reversed = [...blocks].reverse(); // oldest to newest
    
    for (let i = 0; i < reversed.length - 1; i++) {
      const older = reversed[i];
      const newer = reversed[i + 1];
      const olderTs = older.timestamp > 1e12 ? older.timestamp : older.timestamp * 1000;
      const newerTs = newer.timestamp > 1e12 ? newer.timestamp : newer.timestamp * 1000;
      
      const diffSec = Math.max(1, Math.abs(newerTs - olderTs) / 1000);
      const tps = (newer.txCount || 0) / diffSec;
      
      data.push({
        name: `${newer.number}`,
        tps: parseFloat(tps.toFixed(2))
      });
    }
    return data;
  }, [blocks]);

  return (
    <div className="container page-wrapper" style={{ maxWidth: 1200 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 24 }}>
        <div>
          <h1 className="page-title" style={{ fontSize: 24, marginBottom: 8 }}>Transaction TPS</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Number of transactions on the chain per second.</p>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          <Link to="/" style={{ color: 'var(--accent)' }}>Charts</Link> <span style={{ margin: '0 4px' }}>/</span> TPS
        </div>
      </div>

      <div className="card" style={{ padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Real-time TPS (Last 100 Blocks)</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Click and drag in the plot area to zoom in</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
          {chartData[0]?.name ? `Block ${chartData[0].name}` : ''} — {chartData[chartData.length-1]?.name ? `Block ${chartData[chartData.length-1].name}` : ''}
        </div>

        <div style={{ width: '100%', height: 500 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }} 
                tickMargin={12} 
                minTickGap={40} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }} 
                label={{ value: 'TPS', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'var(--text-muted)', fontSize: 12 } }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="tps" 
                stroke="#EAB308" 
                strokeWidth={1.5} 
                dot={false} 
                activeDot={{ r: 4, fill: '#EAB308', stroke: '#fff', strokeWidth: 2 }} 
                animationDuration={1000}
              />
              <Brush 
                dataKey="name" 
                height={30} 
                stroke="#EAB308" 
                fill="#f9fafb" 
                tickFormatter={() => ''} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TpsChart;
