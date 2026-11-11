import React from 'react';
import { BellRing, Check, X, ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';
import { PriceAlert } from '../types/priceAlert';
import { formatBRL } from '../utils/formatters';

interface PriceAlertBannerProps {
  triggeredAlerts: PriceAlert[];
  onOpenModal: (preselectedTicker?: string) => void;
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
}

export const PriceAlertBanner: React.FC<PriceAlertBannerProps> = ({
  triggeredAlerts,
  onOpenModal,
  onDismiss,
  onDismissAll,
}) => {
  if (triggeredAlerts.length === 0) return null;

  return (
    <div className="mb-6 rounded-[12px] bg-gradient-to-r from-[#1f190e] via-[#1a150c] to-[#14110a] border border-[#d4af6a]/40 shadow-[0_4px_24px_rgba(212,175,106,0.15)] overflow-hidden">
      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Lado Esquerdo: Ícone + Título + Lista dos Alertas Disparados */}
        <div className="flex items-start gap-3.5">
          <div className="relative mt-0.5 p-2 rounded-full bg-[#d4af6a]/20 border border-[#d4af6a]/40 text-[#f0d9a8] flex-shrink-0">
            <BellRing className="w-5 h-5 animate-bounce stroke-[2.2]" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#3ddc97] ring-2 ring-[#141210] animate-ping" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm sm:text-base text-[#f0d9a8]">
                Alerta de Preço Disparado!
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#d4af6a]/20 text-[#f0d9a8] border border-[#d4af6a]/30">
                {triggeredAlerts.length} {triggeredAlerts.length === 1 ? 'alvo atingido' : 'alvos atingidos'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {triggeredAlerts.map((alert) => {
                const isAbove = alert.condition === 'ABOVE_OR_EQUAL';
                return (
                  <div
                    key={alert.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#141210]/90 border border-[#d4af6a]/30 text-xs font-mono text-[#f5efe6]"
                  >
                    <span className="font-bold text-[#f0d9a8]">{alert.ticker}</span>
                    <span className="text-[#8c8273]">atingiu</span>
                    <span className="font-bold text-[#3ddc97]">
                      {alert.triggeredPrice ? formatBRL(alert.triggeredPrice) : formatBRL(alert.targetPrice)}
                    </span>
                    <span className="text-[10px] text-[#c2b9ac]">
                      (Alvo {isAbove ? '≥' : '≤'} {formatBRL(alert.targetPrice)})
                    </span>
                    {isAbove ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#3ddc97]" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 text-[#ff5c6c]" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDismiss(alert.id);
                      }}
                      className="ml-1 text-[#8c8273] hover:text-[#f5efe6] p-0.5 rounded cursor-pointer transition-colors"
                      title="Dispensar este alerta"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lado Direito: Ações rápidas */}
        <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
          <button
            onClick={() => onOpenModal()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#d4af6a] hover:bg-[#e2c17e] text-[#0b0a09] font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <span>Gerenciar Alertas</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onDismissAll}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] bg-[#1c1916] hover:bg-[#24201c] border border-[#d4af6a]/20 text-[#c2b9ac] hover:text-[#f0d9a8] text-xs font-mono transition-colors cursor-pointer"
            title="Dispensar todos os alertas disparados"
          >
            <Check className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dispensar Todos</span>
          </button>
        </div>

      </div>
    </div>
  );
};
