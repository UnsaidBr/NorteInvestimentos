import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { formatDateTimeBR } from '../utils/formatters';

interface DataSourceBadgeProps {
  isDemoMode: boolean;
  lastUpdated?: Date;
  compact?: boolean;
  className?: string;
}

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({
  isDemoMode,
  lastUpdated = new Date(),
  compact = false,
  className = '',
}) => {
  if (isDemoMode) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider shadow-sm select-none ${className}`}
        title="Exibindo dados de simulação/contingência"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>Dados de demonstração</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#141210] border border-[#d4af6a]/25 text-[#c2b9ac] font-mono text-[10px] tracking-wide select-none ${className}`}
      title="Dados reais obtidos via provedores de mercado"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#3ddc97] shadow-[0_0_6px_#3ddc97] shrink-0" />
      <span className="font-medium text-[#f5efe6]">
        Atualizado em {formatDateTimeBR(lastUpdated)}
      </span>
      {!compact && (
        <span className="text-[#8c8273] hidden sm:inline">
          • Atualizado a cada 60 segundos
        </span>
      )}
    </span>
  );
};
