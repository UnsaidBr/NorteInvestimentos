import React from 'react';
import { Info, RefreshCw, X } from 'lucide-react';

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
  const [dismissed, setDismissed] = React.useState(false);

  if (!isDemoMode || dismissed) return null;

  return (
    <div className="bg-[#141210] border-b border-[#d4af6a]/15 px-4 py-2.5 text-xs text-[#a39a8c]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-[#d4af6a] shrink-0" />
          <span>
            <strong className="text-[#f5efe6] font-medium">Modo contingência ativo:</strong> Exibindo dados de referência de mercado para garantir estabilidade contínua.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#1c1916] hover:bg-[#24201c] text-[#f0d9a8] hover:text-white font-mono text-xs border border-[#d4af6a]/20 hover:border-[#d4af6a]/40 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 text-[#d4af6a] ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Reconectando...' : 'Reconectar'}</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-[#6e675c] hover:text-[#f5efe6] transition-colors cursor-pointer"
            aria-label="Ocultar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
