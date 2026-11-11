import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Sector,
} from 'recharts';
import { PieChart as PieIcon, Layers, ShieldCheck, Info } from 'lucide-react';
import { AllocationByClass, PortfolioPosition, AssetCategory } from '../types/portfolio';
import { StockItem } from '../types/market';
import { calculatePortfolioSummary } from '../services/portfolioService';
import { formatBRL } from '../utils/formatters';

export interface AssetAllocationDonutChartProps {
  allocationData?: AllocationByClass[];
  positions?: PortfolioPosition[];
  stocks?: StockItem[];
  cdiRate?: number;
  className?: string;
  onSelectCategory?: (category: AssetCategory | null) => void;
  selectedCategory?: AssetCategory | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  acao: '#d4af6a',       // Champagne Gold
  fii: '#38bdf8',        // Sky Blue
  renda_fixa: '#3ddc97', // Emerald Green
  cripto: '#f7931a',     // Crypto Amber/Orange
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: AllocationByClass;
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-[#141210] border border-[#d4af6a]/40 rounded-[12px] p-3 shadow-2xl backdrop-blur-md z-50 font-mono">
      <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-[#d4af6a]/15">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: data.color }}
        />
        <span className="font-serif font-bold text-sm text-[#f5efe6]">{data.label}</span>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-[#8c8273]">Patrimônio:</span>
          <span className="text-[#f5efe6] font-bold tabular-nums">{formatBRL(data.totalValue)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#8c8273]">Participação:</span>
          <span className="text-[#d4af6a] font-bold tabular-nums">{data.percent.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#8c8273]">Qtd. Ativos:</span>
          <span className="text-[#c2b9ac] tabular-nums">{data.count} {data.count === 1 ? 'ativo' : 'ativos'}</span>
        </div>
      </div>
    </div>
  );
};

export const AssetAllocationDonutChart: React.FC<AssetAllocationDonutChartProps> = ({
  allocationData,
  positions = [],
  stocks = [],
  cdiRate = 13.65,
  className = '',
  onSelectCategory,
  selectedCategory,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Calcula a alocação a partir das posições se allocationData não for fornecido diretamente
  const allocation = useMemo(() => {
    if (allocationData && allocationData.length > 0) {
      return allocationData;
    }
    if (positions.length > 0) {
      const summary = calculatePortfolioSummary(positions, stocks, cdiRate);
      return summary.allocationByClass;
    }
    return [];
  }, [allocationData, positions, stocks, cdiRate]);

  const totalValue = useMemo(() => {
    return allocation.reduce((acc, item) => acc + item.totalValue, 0);
  }, [allocation]);

  const activeItem = hoveredIndex !== null && allocation[hoveredIndex] ? allocation[hoveredIndex] : null;

  const handlePieEnter = (_: any, index: number) => {
    setHoveredIndex(index);
  };

  const handlePieLeave = () => {
    setHoveredIndex(null);
  };

  const handleSliceClick = (entry: AllocationByClass) => {
    if (onSelectCategory) {
      onSelectCategory(selectedCategory === entry.category ? null : entry.category);
    }
  };

  return (
    <div
      className={`rounded-[18px] bg-[#141210] border border-[#d4af6a]/20 p-5 sm:p-7 shadow-xl flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#d4af6a]/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[9px] bg-[#1c1916] border border-[#d4af6a]/20 flex items-center justify-center text-[#d4af6a] shadow-inner">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#f5efe6] tracking-tight">
                Alocação por Classe
              </h3>
              <p className="text-xs text-[#a39a8c]">
                Distribuição percentual entre Ações, FIIs, Renda Fixa e Cripto
              </p>
            </div>
          </div>

          <span className="text-xs font-mono text-[#d4af6a] font-bold">
            {allocation.length} {allocation.length === 1 ? 'classe' : 'classes'}
          </span>
        </div>

        {/* Visualização: Donut Chart Recharts */}
        {allocation.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#d4af6a]/20 rounded-[12px] bg-[#1c1916]/40">
            <Layers className="w-8 h-8 text-[#d4af6a]/40 mb-2" />
            <p className="text-xs text-[#a39a8c]">
              Nenhum ativo cadastrado para compor a distribuição da carteira.
            </p>
          </div>
        ) : (
          <div>
            <div className="relative w-full h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={allocation}
                    dataKey="totalValue"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    onMouseEnter={handlePieEnter}
                    onMouseLeave={handlePieLeave}
                    onClick={(entry) => handleSliceClick(entry as any)}
                    className="cursor-pointer outline-none"
                    isAnimationActive={true}
                  >
                    {allocation.map((entry, index) => {
                      const isHovered = hoveredIndex === index;
                      const isSelected = selectedCategory === entry.category;
                      const fillColor = entry.color || CATEGORY_COLORS[entry.category] || '#d4af6a';

                      return (
                        <Cell
                          key={`cell-${entry.category}-${index}`}
                          fill={fillColor}
                          stroke={isSelected || isHovered ? '#ffffff' : '#141210'}
                          strokeWidth={isSelected || isHovered ? 2 : 1}
                          opacity={
                            selectedCategory && !isSelected && !isHovered
                              ? 0.45
                              : 1
                          }
                          className="transition-all duration-200"
                        />
                      );
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Rótulo Central no Miolo do Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                {activeItem ? (
                  <>
                    <span className="text-[10px] font-mono uppercase text-[#8c8273] tracking-wider truncate max-w-[90px]">
                      {activeItem.label.split(' ')[0]}
                    </span>
                    <span className="text-sm font-bold font-mono text-[#f0d9a8] tabular-nums">
                      {activeItem.percent.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[9px] font-mono uppercase text-[#8c8273] tracking-wider">
                      Patrimônio
                    </span>
                    <span className="text-xs font-bold font-mono text-[#f5efe6] tabular-nums">
                      100%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Lista Detalhada das Classes com Barras Proporcionais */}
            <div className="space-y-3 pt-2">
              {allocation.map((item, idx) => {
                const isSelected = selectedCategory === item.category;
                const isHovered = hoveredIndex === idx;

                return (
                  <div
                    key={item.category}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => handleSliceClick(item)}
                    className={`p-2 rounded-[8px] transition-colors cursor-pointer space-y-1.5 font-mono text-xs ${
                      isSelected
                        ? 'bg-[#1c1916] border border-[#d4af6a]/30'
                        : isHovered
                        ? 'bg-[#1c1916]/60'
                        : 'hover:bg-[#1c1916]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-semibold text-[#f5efe6]">{item.label}</span>
                        <span className="text-[10px] text-[#8c8273]">
                          ({item.count} {item.count === 1 ? 'ativo' : 'ativos'})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#f5efe6] font-bold tabular-nums">
                          {formatBRL(item.totalValue)}
                        </span>
                        <span className="text-[#d4af6a] font-semibold ml-2 tabular-nums">
                          {item.percent.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-[#1c1916] rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${item.percent}%`,
                          backgroundColor: item.color,
                        }}
                        className="h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer com Indicador de Diversificação */}
      <div className="mt-5 pt-3.5 border-t border-[#d4af6a]/10 flex items-center justify-between text-xs text-[#8c8273] font-mono">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3ddc97]" />
          <span>Diversificação por classes</span>
        </span>
        <span className="text-[#d4af6a] font-medium">
          Total: {formatBRL(totalValue)}
        </span>
      </div>
    </div>
  );
};

export default AssetAllocationDonutChart;
