import React from 'react';

interface AssetLogoProps {
  ticker: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Mapeamento visual das identidades corporativas e marcas líderes da B3
interface BrandIdentity {
  bg: string;
  fg: string;
  border: string;
  accent: string;
  iconType: 'petrobras' | 'vale' | 'itau' | 'bradesco' | 'bb' | 'ambev' | 'weg' | 'fii' | 'crypto' | 'generic';
}

const BRAND_IDENTITIES: Record<string, BrandIdentity> = {
  // Ações Principais
  PETR4: { bg: 'bg-[#008542]/20', fg: 'text-[#00c853]', border: 'border-[#008542]/40', accent: '#ffcc00', iconType: 'petrobras' },
  PETR3: { bg: 'bg-[#008542]/20', fg: 'text-[#00c853]', border: 'border-[#008542]/40', accent: '#ffcc00', iconType: 'petrobras' },
  VALE3: { bg: 'bg-[#007e7a]/20', fg: 'text-[#14b8a6]', border: 'border-[#007e7a]/40', accent: '#eab308', iconType: 'vale' },
  ITUB4: { bg: 'bg-[#002f6c]/30', fg: 'text-[#3b82f6]', border: 'border-[#ec7000]/40', accent: '#ec7000', iconType: 'itau' },
  ITSA4: { bg: 'bg-[#002f6c]/30', fg: 'text-[#3b82f6]', border: 'border-[#ec7000]/40', accent: '#ec7000', iconType: 'itau' },
  BBDC4: { bg: 'bg-[#cc092f]/20', fg: 'text-[#f43f5e]', border: 'border-[#cc092f]/40', accent: '#ffffff', iconType: 'bradesco' },
  BBDC3: { bg: 'bg-[#cc092f]/20', fg: 'text-[#f43f5e]', border: 'border-[#cc092f]/40', accent: '#ffffff', iconType: 'bradesco' },
  BBAS3: { bg: 'bg-[#003882]/30', fg: 'text-[#60a5fa]', border: 'border-[#fcf000]/40', accent: '#fcf000', iconType: 'bb' },
  ABEV3: { bg: 'bg-[#c28e00]/20', fg: 'text-[#facc15]', border: 'border-[#c28e00]/40', accent: '#d4af6a', iconType: 'ambev' },
  WEGE3: { bg: 'bg-[#005c8a]/25', fg: 'text-[#38bdf8]', border: 'border-[#005c8a]/45', accent: '#0284c7', iconType: 'weg' },
  RENT3: { bg: 'bg-[#008542]/20', fg: 'text-[#4ade80]', border: 'border-[#008542]/40', accent: '#22c55e', iconType: 'generic' },
  MGLU3: { bg: 'bg-[#0086ff]/20', fg: 'text-[#38bdf8]', border: 'border-[#0086ff]/40', accent: '#0086ff', iconType: 'generic' },
  PRIO3: { bg: 'bg-[#e11d48]/20', fg: 'text-[#fb7185]', border: 'border-[#e11d48]/40', accent: '#f43f5e', iconType: 'generic' },
  SUZB3: { bg: 'bg-[#15803d]/20', fg: 'text-[#4ade80]', border: 'border-[#15803d]/40', accent: '#16a34a', iconType: 'generic' },
  JBSS3: { bg: 'bg-[#881337]/25', fg: 'text-[#fda4af]', border: 'border-[#881337]/45', accent: '#be123c', iconType: 'generic' },
  ELET3: { bg: 'bg-[#0369a1]/20', fg: 'text-[#7dd3fc]', border: 'border-[#0369a1]/40', accent: '#0284c7', iconType: 'generic' },
  TAEE11: { bg: 'bg-[#d97706]/20', fg: 'text-[#fbbf24]', border: 'border-[#d97706]/40', accent: '#f59e0b', iconType: 'generic' },
  KLBN11: { bg: 'bg-[#166534]/20', fg: 'text-[#86efac]', border: 'border-[#166534]/40', accent: '#22c55e', iconType: 'generic' },
  CSNA3: { bg: 'bg-[#475569]/30', fg: 'text-[#94a3b8]', border: 'border-[#64748b]/40', accent: '#dc2626', iconType: 'generic' },
  GGBR4: { bg: 'bg-[#1e3a8a]/30', fg: 'text-[#60a5fa]', border: 'border-[#3b82f6]/40', accent: '#2563eb', iconType: 'generic' },
  USIM5: { bg: 'bg-[#0f766e]/25', fg: 'text-[#2dd4bf]', border: 'border-[#14b8a6]/40', accent: '#0d9488', iconType: 'generic' },
  EMBR3: { bg: 'bg-[#0369a1]/25', fg: 'text-[#38bdf8]', border: 'border-[#0284c7]/40', accent: '#0284c7', iconType: 'generic' },
  CPLE6: { bg: 'bg-[#15803d]/25', fg: 'text-[#4ade80]', border: 'border-[#22c55e]/40', accent: '#16a34a', iconType: 'generic' },
  EGIE3: { bg: 'bg-[#0e7490]/25', fg: 'text-[#22d3ee]', border: 'border-[#06b6d4]/40', accent: '#0891b2', iconType: 'generic' },
  CMIG4: { bg: 'bg-[#166534]/25', fg: 'text-[#86efac]', border: 'border-[#15803d]/40', accent: '#b91c1c', iconType: 'generic' },
  SANB11: { bg: 'bg-[#b91c1c]/25', fg: 'text-[#f87171]', border: 'border-[#dc2626]/40', accent: '#ef4444', iconType: 'generic' },
  B3SA3: { bg: 'bg-[#78350f]/30', fg: 'text-[#fde047]', border: 'border-[#eab308]/40', accent: '#ca8a04', iconType: 'generic' },
  VIVT3: { bg: 'bg-[#581c87]/30', fg: 'text-[#c084fc]', border: 'border-[#9333ea]/40', accent: '#a855f7', iconType: 'generic' },
  TIMS3: { bg: 'bg-[#1e3a8a]/25', fg: 'text-[#93c5fd]', border: 'border-[#2563eb]/40', accent: '#dc2626', iconType: 'generic' },
  BPAC11: { bg: 'bg-[#0f172a]', fg: 'text-[#cbd5e1]', border: 'border-[#94a3b8]/40', accent: '#0284c7', iconType: 'generic' },

  // FIIs Populares
  HGLG11: { bg: 'bg-[#1e293b]', fg: 'text-[#f0d9a8]', border: 'border-[#d4af6a]/40', accent: '#d4af6a', iconType: 'fii' },
  MXRF11: { bg: 'bg-[#0f172a]', fg: 'text-[#3ddc97]', border: 'border-[#3ddc97]/40', accent: '#3ddc97', iconType: 'fii' },
  XPML11: { bg: 'bg-[#18181b]', fg: 'text-[#f0d9a8]', border: 'border-[#d4af6a]/40', accent: '#d4af6a', iconType: 'fii' },
  KNIP11: { bg: 'bg-[#1e1b4b]/40', fg: 'text-[#a5b4fc]', border: 'border-[#6366f1]/40', accent: '#818cf8', iconType: 'fii' },
  KNCR11: { bg: 'bg-[#1e1b4b]/40', fg: 'text-[#a5b4fc]', border: 'border-[#6366f1]/40', accent: '#818cf8', iconType: 'fii' },
  VISC11: { bg: 'bg-[#27272a]', fg: 'text-[#fb7185]', border: 'border-[#f43f5e]/40', accent: '#f43f5e', iconType: 'fii' },
  BTLG11: { bg: 'bg-[#172554]/40', fg: 'text-[#93c5fd]', border: 'border-[#3b82f6]/40', accent: '#60a5fa', iconType: 'fii' },
  HGRE11: { bg: 'bg-[#1e293b]', fg: 'text-[#f0d9a8]', border: 'border-[#d4af6a]/40', accent: '#d4af6a', iconType: 'fii' },
  XPLG11: { bg: 'bg-[#18181b]', fg: 'text-[#f0d9a8]', border: 'border-[#d4af6a]/40', accent: '#d4af6a', iconType: 'fii' },
  CPTS11: { bg: 'bg-[#1c1917]', fg: 'text-[#fdba74]', border: 'border-[#f97316]/40', accent: '#ea580c', iconType: 'fii' },
  IRDM11: { bg: 'bg-[#1e293b]', fg: 'text-[#67e8f9]', border: 'border-[#06b6d4]/40', accent: '#0891b2', iconType: 'fii' },
  TGAR11: { bg: 'bg-[#14532d]/30', fg: 'text-[#86efac]', border: 'border-[#22c55e]/40', accent: '#16a34a', iconType: 'fii' },
  RECR11: { bg: 'bg-[#312e81]/30', fg: 'text-[#c7d2fe]', border: 'border-[#6366f1]/40', accent: '#4f46e5', iconType: 'fii' },
  RBRR11: { bg: 'bg-[#18181b]', fg: 'text-[#fde047]', border: 'border-[#eab308]/40', accent: '#ca8a04', iconType: 'fii' },

  // Criptos e Moedas
  BTC: { bg: 'bg-[#f7931a]/15', fg: 'text-[#f7931a]', border: 'border-[#f7931a]/40', accent: '#f7931a', iconType: 'crypto' },
  ETH: { bg: 'bg-[#627eea]/15', fg: 'text-[#818cf8]', border: 'border-[#627eea]/40', accent: '#627eea', iconType: 'crypto' },
  SOL: { bg: 'bg-[#14f195]/15', fg: 'text-[#34d399]', border: 'border-[#14f195]/40', accent: '#14f195', iconType: 'crypto' },
  USD: { bg: 'bg-[#10b981]/15', fg: 'text-[#10b981]', border: 'border-[#10b981]/40', accent: '#10b981', iconType: 'generic' },
  EUR: { bg: 'bg-[#3b82f6]/15', fg: 'text-[#60a5fa]', border: 'border-[#3b82f6]/40', accent: '#3b82f6', iconType: 'generic' },
};

const SIZE_CLASSES = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-14 h-14 text-base',
};

export const AssetLogo: React.FC<AssetLogoProps> = ({
  ticker,
  name,
  size = 'md',
  className = '',
}) => {
  const cleanTicker = ticker.toUpperCase().trim();
  const identity = BRAND_IDENTITIES[cleanTicker] || {
    bg: 'bg-gradient-to-br from-[#24201c] to-[#141210]',
    fg: 'text-[#f0d9a8]',
    border: 'border-[#d4af6a]/20',
    accent: '#d4af6a',
    iconType: cleanTicker.endsWith('11') ? 'fii' : 'generic',
  };

  const sizeClass = SIZE_CLASSES[size];

  // Renderizador de SVG específico para marcas conhecidas
  const renderBrandIcon = () => {
    switch (identity.iconType) {
      case 'petrobras':
        return (
          <svg viewBox="0 0 24 24" className="w-3/5 h-3/5 fill-current">
            <path d="M12 2L3 8.5v7L12 22l9-6.5v-7L12 2zm0 3.2l6 4.3v4.6l-6 4.3-6-4.3V9.5l6-4.3z" fill="#008542" />
            <path d="M12 6.5l4 2.8v3.4l-4 2.8-4-2.8V9.3l4-2.8z" fill="#ffcc00" />
          </svg>
        );
      case 'vale':
        return (
          <svg viewBox="0 0 24 24" className="w-3/5 h-3/5 fill-current">
            <path d="M4 5h5l3 8 3-8h5l-6.5 14h-3L4 5z" fill="#007e7a" />
            <circle cx="12" cy="7" r="2.5" fill="#eab308" />
          </svg>
        );
      case 'itau':
        return (
          <div className="flex flex-col items-center justify-center font-bold tracking-tighter">
            <span className="text-[#ec7000] font-sans font-black leading-none text-[11px] sm:text-xs">it</span>
            <span className="text-[#facc15] font-sans font-black leading-none text-[8px]">aú</span>
          </div>
        );
      case 'bradesco':
        return (
          <svg viewBox="0 0 24 24" className="w-3/5 h-3/5">
            <path d="M5 19V5c0-1.1.9-2 2-2h4c4 0 7 2.5 7 6.5s-3 6.5-7 6.5H9v3H5zm4-6.5h2.5c2 0 3.5-1.1 3.5-3.5S13.5 5.5 11.5 5.5H9v7z" fill="#cc092f" />
          </svg>
        );
      case 'bb':
        return (
          <div className="flex items-center justify-center font-bold tracking-tighter font-sans">
            <span className="text-[#fcf000] font-black text-xs leading-none">BB</span>
          </div>
        );
      case 'crypto':
        return (
          <span className="font-mono font-black text-xs text-[#f7931a]">₿</span>
        );
      case 'fii':
        return (
          <div className="flex flex-col items-center justify-center leading-none">
            <span className="text-[9px] font-mono font-bold text-[#d4af6a]">FII</span>
            <span className="text-[7px] font-mono text-[#c2b9ac] tracking-tight">{cleanTicker.slice(0, 4)}</span>
          </div>
        );
      default:
        return (
          <span className="font-mono font-bold tracking-wider">
            {cleanTicker.slice(0, 3)}
          </span>
        );
    }
  };

  return (
    <div
      className={`rounded-[10px] ${identity.bg} ${identity.border} border flex items-center justify-center shrink-0 select-none shadow-inner transition-transform group-hover:scale-105 ${sizeClass} ${className}`}
      title={name || cleanTicker}
    >
      {renderBrandIcon()}
    </div>
  );
};
