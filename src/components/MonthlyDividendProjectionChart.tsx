import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import { Calendar, TrendingUp, Info, DollarSign, Sparkles } from 'lucide-react';
import { PortfolioPosition, MonthlyDividendProjection } from '../types/portfolio';
import { StockItem } from '../types/market';
import { calculatePortfolioSummary } from '../services/portfolioService';
import { formatBRL } from '../utils/formatters';

export interface MonthlyDividendProjectionChartProps {
  positions: PortfolioPosition[];
  stocks?: StockItem[];
  cdiRate?: number;
  initialSelectedMonth?: number | null;
  className?: string;
  onSelectMonth?: (monthIndex: number | null) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      monthIndex: number;
      monthLabel: string;
      projectedValue: number;
      assets: Array<{ ticker: string; value: number }>;
    };
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const { monthLabel, projectedValue, assets } = data;

  return (
    <div className="bg-[#141210] border border-[#d4af6a]/40 rounded-[12px] p-3.5 shadow-2xl backdrop-blur-md max-w-xs z-50">
      <div className="flex items-center justify-between gap-3 border-b border-[#d4af6a]/15 pb-2 mb-2">
        <span className="font-serif font-bold text-sm text-[#f5efe6]">{monthLabel}</span>
        <span className="font-mono font-bold text-xs text-[#d4af6a] tabular-nums">
          {formatBRL(projectedValue)}
        </span>
      </div>

      {assets && assets.length > 0 ? (
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono text-[#8c8273] uppercase tracking-wider">
            Ativos pagadores ({assets.length}):
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {assets.map((asset, i) => (
              <div
                key={`${asset.ticker}-${i}`}
                className="flex items-center justify-between text-xs font-mono"
              >
                <span className="text-[#f0d9a8] font-semibold">{asset.ticker}</span>
                <span className="text-[#c2b9ac] tabular-nums">{formatBRL(asset.value)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-[#8c8273] italic">Nenhum provento projetado para este mês.</p>
      )}
    </div>
  );
};

export const MonthlyDividendProjectionChart: React.FC<MonthlyDividendProjectionChartProps> = ({
  positions,
  stocks = [],
  cdiRate = 13.65,
  initialSelectedMonth = null,
  className = '',
  onSelectMonth,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(initialSelectedMonth);

  // Recalcula o resumo e projeções mensais se as posições ou cotações mudarem
  const summary = useMemo(() => {
    return calculatePortfolioSummary(positions, stocks, cdiRate);
  }, [positions, stocks, cdiRate]);

  const { monthlyProjections, projectedMonthlyAverage, projectedAnnualDividends } = summary;

  // Encontra o mês com maior provento
  const bestMonth = useMemo(() => {
    if (!monthlyProjections || monthlyProjections.length === 0) return null;
    return [...monthlyProjections].sort((a, b) => b.projectedValue - a.projectedValue)[0];
  }, [monthlyProjections]);

  const handleBarClick = (data: MonthlyDividendProjection) => {
    const newIdx = selectedMonth === data.monthIndex ? null : data.monthIndex;
    setSelectedMonth(newIdx);
    if (onSelectMonth) {
      onSelectMonth(newIdx);
    }
  };

  const selectedMonthData = selectedMonth !== null ? monthlyProjections[selectedMonth] : null;

  return (
    <div
      className={`rounded-[18px] bg-[#141210] border border-[#d4af6a]/20 p-5 sm:p-7 shadow-xl flex flex-col justify-between ${className}`}
    >
      {/* Header com Título & Indicadores Chave */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#d4af6a]/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/25 flex items-center justify-center text-[#d4af6a] shadow-inner">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#f5efe6] tracking-tight">
                  Projeção de Renda Passiva Mensal
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#d4af6a]/10 text-[#d4af6a] border border-[#d4af6a]/25 font-semibold">
                  12 Meses
                </span>
              </div>
              <p className="text-xs text-[#a39a8c] mt-0.5">
                Estimativa de dividendos, JCP e rendimentos com base na sazonalidade e histórico da B3
              </p>
            </div>
          </div>

          {/* Destaque Média Mensal */}
          <div className="flex items-center gap-3 bg-[#1c1916] px-3.5 py-2 rounded-[12px] border border-[#d4af6a]/15 self-start sm:self-auto">
            <div className="text-right font-mono">
              <div className="text-[10px] text-[#8c8273] uppercase tracking-wider">Média Mensal</div>
              <div className="text-sm sm:text-base font-bold text-[#d4af6a] tabular-nums">
                {formatBRL(projectedMonthlyAverage)}
              </div>
            </div>
          </div>
        </div>

        {/* Resumo em 3 Mini Cards Rápidos */}
        <div className="grid grid-cols-3 gap-3 mb-5 text-xs font-mono">
          <div className="p-2.5 rounded-[10px] bg-[#1c1916]/80 border border-[#d4af6a]/10">
            <div className="text-[#8c8273] text-[10px] uppercase">Total Anual</div>
            <div className="text-[#f5efe6] font-bold text-xs sm:text-sm mt-0.5 tabular-nums">
              {formatBRL(projectedAnnualDividends)}
            </div>
          </div>

          <div className="p-2.5 rounded-[10px] bg-[#1c1916]/80 border border-[#d4af6a]/10">
            <div className="text-[#8c8273] text-[10px] uppercase">Melhor Mês</div>
            <div className="text-[#3ddc97] font-bold text-xs sm:text-sm mt-0.5 tabular-nums truncate">
              {bestMonth && bestMonth.projectedValue > 0
                ? `${bestMonth.monthLabel} (${formatBRL(bestMonth.projectedValue, 0)})`
                : '—'}
            </div>
          </div>

          <div className="p-2.5 rounded-[10px] bg-[#1c1916]/80 border border-[#d4af6a]/10">
            <div className="text-[#8c8273] text-[10px] uppercase">Yield on Cost</div>
            <div className="text-[#f0d9a8] font-bold text-xs sm:text-sm mt-0.5 tabular-nums">
              {summary.averageYieldOnCost.toFixed(2)}% ao ano
            </div>
          </div>
        </div>

        {/* Gráfico Recharts de Barras */}
        <div className="w-full h-56 pt-2 pb-1">
          {positions.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#d4af6a]/20 rounded-[12px] bg-[#1c1916]/40">
              <DollarSign className="w-8 h-8 text-[#d4af6a]/40 mb-2" />
              <p className="text-xs text-[#a39a8c]">
                Cadastre seus ativos para projetar o fluxo de dividendos mês a mês.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyProjections}
                margin={{ top: 12, right: 6, left: -20, bottom: 0 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length > 0) {
                    handleBarClick(e.activePayload[0].payload);
                  }
                }}
              >
                <XAxis
                  dataKey="monthLabel"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8c8273', fontSize: 11, fontFamily: 'monospace' }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8c8273', fontSize: 10, fontFamily: 'monospace' }}
                  tickFormatter={(val: number) => {
                    if (val >= 1000) return `R$ ${(val / 1000).toFixed(0)}k`;
                    return `R$ ${val}`;
                  }}
                  dx={-2}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(212, 175, 106, 0.08)' }}
                  content={<CustomTooltip />}
                />
                {projectedMonthlyAverage > 0 && (
                  <ReferenceLine
                    y={projectedMonthlyAverage}
                    stroke="#d4af6a"
                    strokeDasharray="4 4"
                    strokeOpacity={0.6}
                  />
                )}
                <Bar
                  dataKey="projectedValue"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={true}
                  className="cursor-pointer"
                >
                  {monthlyProjections.map((entry) => {
                    const isSelected = selectedMonth === entry.monthIndex;
                    return (
                      <Cell
                        key={`cell-${entry.monthIndex}`}
                        fill={isSelected ? '#f0d9a8' : '#d4af6a'}
                        fillOpacity={isSelected ? 1 : 0.75}
                        stroke={isSelected ? '#ffffff' : '#d4af6a'}
                        strokeWidth={isSelected ? 1.5 : 0}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Detalhamento do mês clicado ou aviso interativo */}
      <div className="mt-4 pt-3.5 border-t border-[#d4af6a]/15 text-xs font-mono">
        {selectedMonthData ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#f5efe6] font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#d4af6a]" />
                Detalhamento de {selectedMonthData.monthLabel}:
              </span>
              <button
                onClick={() => setSelectedMonth(null)}
                className="text-[11px] text-[#8c8273] hover:text-[#f0d9a8] underline cursor-pointer"
              >
                Limpar seleção
              </button>
            </div>

            {selectedMonthData.assets.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                {selectedMonthData.assets.map((a, i) => (
                  <div
                    key={`${a.ticker}-${i}`}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#1c1916] text-[#f0d9a8] border border-[#d4af6a]/20 shadow-sm"
                  >
                    <span className="font-bold">{a.ticker}</span>
                    <span className="text-[#8c8273]">·</span>
                    <span className="text-[#f5efe6] tabular-nums">{formatBRL(a.value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#8c8273] italic">Nenhum ativo realiza pagamento neste mês.</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[#8c8273]">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#d4af6a]/80 shrink-0" />
              Clique em uma barra do gráfico para detalhar os ativos de cada mês.
            </span>
            <span className="text-[11px] text-[#a39a8c]">Linha tracejada: Média mensal</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyDividendProjectionChart;
