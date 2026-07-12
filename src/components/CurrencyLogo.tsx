import React from 'react';
import { NATIVE_TOKEN } from '../utils/rpc';

interface CurrencyLogoProps {
  symbol: string;
  size?: number;
  className?: string;
}

const CurrencyLogo: React.FC<CurrencyLogoProps> = ({ symbol, size = 16, className = '' }) => {
  const getLogoPath = (sym: string) => {
    const s = sym.toLowerCase();
    if (s.includes('usdt') || s.includes('tether')) return '/logos/usdt.svg';
    if (s.includes('usdc') || s.includes('usd coin')) return '/logos/usdc.svg';
    if (s.includes('eth') || s.includes('ethereum')) return '/logos/eth.svg';
    if (s.includes('btc') || s.includes('bitcoin')) return '/logos/btc.svg';
    if (s.includes('bnb')) return '/logos/bnb.svg';
    if (s.includes('sol') || s.includes('solana')) return '/logos/sol.svg';
    if (s === NATIVE_TOKEN.toLowerCase()) return '/logo.svg';
    
    // Default fallback
    return null;
  };

  const logoPath = getLogoPath(symbol);

  if (!logoPath) {
    return (
      <div 
        className={`fallback-logo ${className}`} 
        style={{ 
          width: size, 
          height: size, 
          background: 'var(--accent)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#fff', 
          fontSize: size * 0.5,
          fontWeight: 'bold'
        }}
      >
        {symbol.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img 
      src={logoPath} 
      alt={`${symbol} logo`} 
      width={size} 
      height={size} 
      className={className} 
      style={{ borderRadius: '50%', objectFit: 'contain' }}
    />
  );
};

export default CurrencyLogo;
