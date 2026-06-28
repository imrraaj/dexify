
import React from 'react';

interface TokenImageProps {
  symbol: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const getBackground = (symbol: string): string => {
  const charCode = symbol.charCodeAt(0) || 120;
  const hue = (charCode * 47) % 360;
  return `linear-gradient(135deg, hsl(${hue} 88% 62%), hsl(${(hue + 72) % 360} 92% 44%))`;
};

const TokenImage: React.FC<TokenImageProps> = ({ symbol, size = 'md', className = '' }) => {
  const letter = symbol ? symbol.charAt(0).toUpperCase() : 'X';
  const bg = getBackground(symbol);
  
  const sizeClass = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };
  
  return (
    <div 
      className={`${sizeClass[size]} rounded-full flex items-center justify-center text-white font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_20px_rgba(0,0,0,0.25)] ${className}`}
      style={{ background: bg }}
    >
      {letter}
    </div>
  );
};

export default TokenImage;
