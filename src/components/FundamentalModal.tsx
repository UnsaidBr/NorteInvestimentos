import React from 'react';
import { FundamentalStock } from '../types/fundamental';
import { formatBRL, formatPercent } from '../utils/formatters';
import {
  X,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Percent,
  Sparkles,
  Info,
} from 'lucide-react';

interface FundamentalModalProps {
  stock: FundamentalStock | null;
  onClose: () => void;
  bazinYieldReq?: number;
  grahamMultiplier?: number;
}

export const FundamentalModal: React.FC<FundamentalModalProps> = ({
  stock,
  onClose,
  bazinYieldReq = 6.0,
  grahamMultiplier = 22.5,
}) => {
  if (!stock) return null;

  const isGrahamSafe = stock.grahamMargin > 0;
  const isBazinSafe = stock.bazinDiscount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#141210] border border-[#d4af6a]/30 rounded-[18px] shadow-2xl p-6 sm:p-8 space-y-6 text-[#c2b9ac]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#d4af6a]/15 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-[#f0d9a8] bg-[#d4af6a]/15 px-2.5 py-0.5 rounded border border-[#d4af6a]/30">
                {stock.ticker}
              </span>
              <span className="text-xs font-mono text-[#8c8273]">
                {stock.sector}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6] mt-1.5">
              {stock.friendlyName} <span className="text-sm font-sans font-normal text-[#8c8273]">({stock.name})</span>
            </h2>
            <div className="flex items-center gap-3 mt-1 text-xs font-mono">
              <span className="text-[#f5efe6] font-bold text-sm">
                {formatBRL(stock.price)}
              </span>
              <span className={stock.changePercent >= 0 ? 'text-[#3ddc97]' : 'text-[#e25c5c]'}>
                {formatPercent(stock.changePercent)} hoje
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#1c1916] hover:bg-[#25221e] border border-[#d4af6a]/20 text-[#c2b9ac] hover:text-[#f5efe6] transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Health Score Banner */}
        <div className="p-4 rounded-[12px] bg-[#1c1916] border border-[#d4af6a]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[10px] bg-[#d4af6a]/15 border border-[#d4af6a]/30 flex items-center justify-center font-serif text-xl font-bold text-[#f0d9a8]">
              {stock.scoreSaude}
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase text-[#f5efe6]">
                Score de Consistência Fundamentalista
              </div>
              <p className="text-xs text-[#8c8273]">
                Avaliação algorítmica de 1 a 10 baseada em margens, liquidez, ROE e balanço.
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-right shrink-0">
            {stock.greenblattRank && (
              <span className="px-3 py-1 rounded bg-[#d4af6a]/10 text-[#f0d9a8] border border-[#d4af6a]/25">
                #{stock.greenblattRank} na Fórmula Mágica
              </span>
            )}
          </div>
        </div>

        {/* Memorial de Cálculo: Graham e Bazin */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#f5efe6] flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#d4af6a]" />
            <span>Memorial Didático das Fórmulas Clássicas</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GRAHAM */}
            <div className={`p-5 rounded-[14px] border space-y-3 ${
              isGrahamSafe ? 'bg-[#141210] border-[#3ddc97]/30' : 'bg-[#141210] border-[#d4af6a]/20'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#f5efe6] uppercase">
                  Fórmula de Benjamin Graham
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c1916] text-[#f0d9a8] border border-[#d4af6a]/20">
                  Preço Justo
                </span>
              </div>

              <div className="p-3 rounded-[8px] bg-[#0b0a09] font-mono text-xs text-[#f0d9a8] space-y-1">
                <div>V = √(22,5 × LPA × VPA)</div>
                <div className="text-[11px] text-[#8c8273]">
                  V = √({grahamMultiplier} × {formatBRL(stock.lpa)} × {formatBRL(stock.vpa)})
                </div>
                <div className="text-sm font-bold text-[#f5efe6] pt-1">
                  Preço Justo: {formatBRL(stock.grahamPrice)}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span>Margem de Segurança:</span>
                <span className={`font-bold ${isGrahamSafe ? 'text-[#3ddc97]' : 'text-[#e25c5c]'}`}>
                  {stock.grahamMargin > 0 ? `+${stock.grahamMargin}%` : `${stock.grahamMargin}%`}
                </span>
              </div>

              <p className="text-[11px] text-[#8c8273] leading-relaxed">
                {isGrahamSafe
                  ? `Negocia com ${stock.grahamMargin}% de desconto sobre o valor intrínseco calculado por Graham.`
                  : `Cotação atual de ${formatBRL(stock.price)} supera o preço justo estipulado pelo método clássico.`}
              </p>
            </div>

            {/* BAZIN */}
            <div className={`p-5 rounded-[14px] border space-y-3 ${
              isBazinSafe ? 'bg-[#141210] border-[#3ddc97]/30' : 'bg-[#141210] border-[#d4af6a]/20'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#f5efe6] uppercase">
                  Método Décio Bazin
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c1916] text-[#f0d9a8] border border-[#d4af6a]/20">
                  Preço Teto {bazinYieldReq}%
                </span>
              </div>

              <div className="p-3 rounded-[8px] bg-[#0b0a09] font-mono text-xs text-[#f0d9a8] space-y-1">
                <div>P_teto = DPA 12m / {bazinYieldReq / 100}</div>
                <div className="text-[11px] text-[#8c8273]">
                  P_teto = {formatBRL(stock.dpa12m)} / 0,06
                </div>
                <div className="text-sm font-bold text-[#f5efe6] pt-1">
                  Preço Teto: {formatBRL(stock.bazinPrice)}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span>Desconto até o Teto:</span>
                <span className={`font-bold ${isBazinSafe ? 'text-[#3ddc97]' : 'text-[#e25c5c]'}`}>
                  {stock.bazinDiscount > 0 ? `+${stock.bazinDiscount}%` : `${stock.bazinDiscount}%`}
                </span>
              </div>

              <p className="text-[11px] text-[#8c8273] leading-relaxed">
                {isBazinSafe
                  ? `Comprando até ${formatBRL(stock.bazinPrice)}, o investidor garante no mínimo ${bazinYieldReq}% a.a. em dividendos.`
                  : `Cotação acima do teto estipulado para assegurar o yield de ${bazinYieldReq}% com base nos proventos passados.`}
              </p>
            </div>
          </div>
        </div>

        {/* Tabela de Indicadores Fundamentalistas */}
        <div className="space-y-3">
          <h4 className="font-mono text-xs font-bold uppercase text-[#f5efe6] tracking-wider">
            Indicadores Contábeis em Destaque
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/15">
              <div className="text-[#8c8273]">P/L</div>
              <div className="text-sm font-bold text-[#f5efe6] mt-0.5">{stock.pl}x</div>
            </div>
            <div className="p-3 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/15">
              <div className="text-[#8c8273]">P/VP</div>
              <div className="text-sm font-bold text-[#f5efe6] mt-0.5">{stock.pvp}x</div>
            </div>
            <div className="p-3 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/15">
              <div className="text-[#8c8273]">ROE</div>
              <div className="text-sm font-bold text-[#3ddc97] mt-0.5">{stock.roe}%</div>
            </div>
            <div className="p-3 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/15">
              <div className="text-[#8c8273]">DY 12m</div>
              <div className="text-sm font-bold text-[#f0d9a8] mt-0.5">{stock.dy}%</div>
            </div>
            <div className="p-3 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/15">
              <div className="text-[#8c8273]">Margem Líquida</div>
              <div className="text-sm font-bold text-[#f5efe6] mt-0.5">{stock.margemLiquida === null ? "n/d" : `${stock.margemLiquida}%`}</div>
            </div>
            <div className="p-3 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/15">
              <div className="text-[#8c8273]">Dív. Líq / EBITDA</div>
              <div className="text-sm font-bold text-[#f5efe6] mt-0.5">{stock.dividaLiquidaEbitda === null ? 'n/d' : `${stock.dividaLiquidaEbitda}x`}</div>
            </div>
            <div className="p-3 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/15">
              <div className="text-[#8c8273]">LPA (Lucro/ação)</div>
              <div className="text-sm font-bold text-[#f5efe6] mt-0.5">{formatBRL(stock.lpa)}</div>
            </div>
            <div className="p-3 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/15">
              <div className="text-[#8c8273]">VPA (Patrim./ação)</div>
              <div className="text-sm font-bold text-[#f5efe6] mt-0.5">{formatBRL(stock.vpa)}</div>
            </div>
          </div>
        </div>

        {/* Checklist: Pontos Positivos e de Atenção */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-[12px] bg-[#1c1916]/80 border border-[#3ddc97]/20 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#3ddc97] uppercase">
              <CheckCircle2 className="w-4 h-4" />
              <span>Pontos Fortes Identificados</span>
            </div>
            <ul className="text-xs space-y-1.5 text-[#c2b9ac]">
              {stock.pontosPositivos.map((p, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3ddc97] mt-1 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-[12px] bg-[#1c1916]/80 border border-[#e25c5c]/20 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#e25c5c] uppercase">
              <AlertTriangle className="w-4 h-4" />
              <span>Pontos de Atenção</span>
            </div>
            <ul className="text-xs space-y-1.5 text-[#c2b9ac]">
              {stock.pontosAtencao.length === 0 ? (
                <li className="text-xs text-[#8c8273]">Nenhum sinal crítico imediato nos múltiplos analisados.</li>
              ) : (
                stock.pontosAtencao.map((a, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e25c5c] mt-1 shrink-0" />
                    <span>{a}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Regulatory footer notice */}
        <div className="p-3.5 rounded-[10px] bg-[#0b0a09] border border-[#d4af6a]/15 text-[11px] text-[#8c8273] leading-relaxed flex items-center gap-2.5">
          <Info className="w-4 h-4 text-[#d4af6a] shrink-0" />
          <span>
            <strong>Aviso Legal (CVM):</strong> Os preços justos e tetos representam exercícios didáticos baseados em dados públicos históricos. Não constituem recomendação de compra, venda ou alocação patrimonial.
          </span>
        </div>
      </div>
    </div>
  );
};
