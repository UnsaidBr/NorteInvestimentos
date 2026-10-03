import React from 'react';
import { APP_NAME } from '../constants/config';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const boxDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }[size];

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  }[size];

  return (
    <div className="flex items-center gap-3 group">
      {/* Minimalist Golden Monogram */}
      <div
        className={`${boxDimensions} rounded-[10px] bg-gradient-to-br from-[#1c1916] via-[#141210] to-[#0b0a09] border border-[#d4af6a]/35 flex items-center justify-center shadow-[0_4px_20px_rgba(212,175,106,0.15)] group-hover:border-[#d4af6a]/70 group-hover:shadow-[0_4px_25px_rgba(212,175,106,0.25)] transition-all duration-300 relative overflow-hidden`}
      >
        {/* Subtle internal gold hairline */}
        <div className="absolute inset-[2px] rounded-[7px] border border-[#d4af6a]/15 pointer-events-none" />

        {/* Monogram Graphic "N" */}
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 text-[#d4af6a] transition-transform duration-300 group-hover:scale-105"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 19 V5 L18 19 V5" />
          <circle cx="6" cy="5" r="1.2" fill="#d4af6a" stroke="none" />
          <circle cx="18" cy="19" r="1.2" fill="#d4af6a" stroke="none" />
        </svg>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className={`${titleSizes} font-serif font-bold tracking-tight text-[#f5efe6] leading-none`}>
            {APP_NAME}
          </span>
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#d4af6a]/10 text-[#d4af6a] border border-[#d4af6a]/25">
            Dados da B3
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[10px] uppercase font-mono tracking-wider text-[#c2b9ac] mt-1 font-medium">
            Inteligência de mercado em português
          </p>
        )}
      </div>
    </div>
  );
};
