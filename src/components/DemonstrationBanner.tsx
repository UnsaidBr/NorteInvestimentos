import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface DemonstrationBannerProps {
  isDemoMode: boolean;
  onRetry: () => void;
  isRetrying: boolean;
}

export const DemonstrationBanner: React.FC<DemonstrationBannerProps> = ({
  isDemoMode,
  onRetry,
  isRetrying,
}) => {
  if (!isDemoMode) return null;

  return (
    <div
      role="banner"
      aria-label="Faixa fixa de dados de demonstração"
      className="fixed top-0 left-0 right-0 z-50 bg-[#d4af6a] text-[#0b0a09] px-4 py-1.5 shadow-lg flex items-center justify-between text-xs font-mono font-bold select-none border-b border-[#0b0a09]/20"
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#0b0a09] shrink-0 fill-current" />
          <span className="uppercase tracking-wider font-extrabold text-[11px] sm:text-xs">
            Dados de demonstração
          </span>
          <span className="hidden md:inline font-normal text-[11px] text-[#0b0a09]/80">
            • Ativos e cotações simuladas para fins de teste e desenvolvimento
          </span>
        </div>

        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] bg-[#0b0a09] hover:bg-[#1f1b17] text-[#f0d9a8] font-mono text-[11px] font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-sm shrink-0"
        >
          <RefreshCw className={`w-3 h-3 text-[#d4af6a] ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Reconectando...' : 'Reconectar API'}</span>
        </button>
      </div>
    </div>
  );
};
