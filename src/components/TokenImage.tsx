
import React from 'react';

interface TokenImageProps {
  symbol: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const getBackgroundColor = (symbol: string): string => {
  const charCode = symbol.charCodeAt(0);
  const hue = charCode % 360;
  return `#059669`;
  // return `hsl(${hue}, 70%, 45%)`;
};

const TokenImage: React.FC<TokenImageProps> = ({ symbol, size = 'md', className = '' }) => {
  const letter = symbol ? symbol.charAt(0).toUpperCase() : 'X';
  const bg = getBackgroundColor(symbol);
  
  const sizeClass = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };
  
  return (
    <div 
      className={`${sizeClass[size]} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
      style={{ backgroundColor: bg }}
    >
      {letter}
    </div>
  );
};

export default TokenImage;
