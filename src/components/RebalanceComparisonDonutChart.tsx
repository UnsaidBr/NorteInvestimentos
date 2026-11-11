import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { ArrowRight, Layers, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';
import { RebalanceClassItem } from '../types/portfolio';
import { formatBRL } from '../utils/formatters';

interface RebalanceComparisonDonutChartProps {
  classes: RebalanceClassItem[];
  totalCurrentValue: number;
  totalProjectedValue: number;
  contributionAmount: number;
  className?: string;
}

type ChartViewMode = 'side_by_side' | 'nested' | 'toggle';

export const RebalanceComparisonDonutChart: React.FC<RebalanceComparisonDonutChartProps> = ({
  classes,
  totalCurrentValue,
  totalProjectedValue,
  contributionAmount,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<ChartViewMode>('side_by_side');
  const [toggleState, setToggleState] = useState<'current' | 'projected'>('projected');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Dados para o Donut Atual
  const currentData = classes
    .filter((c) => c.currentValue > 0 || c.targetPercent > 0)
    .map((c) => ({
      name: c.label,
      category: c.category,
      value: Math.max(0, c.currentValue),
      percent: c.currentPercent,
      color: c.color,
      targetPercent: c.targetPercent,
      suggestedContribution: c.suggestedContribution,
    }));

  // Dados para o Donut Projetado Pós-Aporte
  const projectedData = classes
    .filter((c) => c.projectedValue > 0 || c.targetPercent > 0)
    .map((c) => ({
      name: c.label,
      category: c.category,
      value: Math.max(0, c.projectedValue),
      percent: c.projectedPercent,
      color: c.color,
      targetPercent: c.targetPercent,
      suggestedContribution: c.suggestedContribution,
    }));

  // Tooltip customizado com detalhamento de Atual vs Projetado vs Meta
  const CustomComparisonTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    const item = classes.find((c) => c.category === data.category);
    if (!item) return null;

    return (
      <div className="bg-[#141210] border border-[#d4af6a]/40 rounded-[12px] p-3 shadow-2xl backdrop-blur-md z-50 font-mono text-xs space-y-1.5 min-w-[210px]">
        <div className="flex items-center gap-2 pb-1.5 border-b border-[#d4af6a]/15">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="font-serif font-bold text-sm text-[#f5efe6]">{item.label}</span>
        </div>

        <div className="space-y-1 pt-0.5">
          <div className="flex justify-between gap-3 text-[#8c8273]">
            <span>Alocação Atual:</span>
            <span className="text-[#f5efe6] font-bold tabular-nums">
              {item.currentPercent.toFixed(1)}% ({formatBRL(item.currentValue)})
            </span>
          </div>

          <div className="flex justify-between gap-3 text-[#8c8273]">
            <span>Meta Definida:</span>
            <span className="text-[#d4af6a] font-bold tabular-nums">
              {item.targetPercent.toFixed(1)}%
            </span>
          </div>

          {item.suggestedContribution > 0 ? (
            <div className="flex justify-between gap-3 text-[#3ddc97]">
              <span>Aporte Sugerido:</span>
              <span className="font-bold tabular-nums">
                +{formatBRL(item.suggestedContribution)}
              </span>
            </div>
          ) : (
            <div className="flex justify-between gap-3 text-[#8c8273]">
              <span>Aporte Sugerido:</span>
              <span className="text-[#8c8273] font-mono">R$ 0,00 (Alvo atingido)</span>
            </div>
          )}

          <div className="flex justify-between gap-3 pt-1 border-t border-white/5 text-[#f0d9a8]">
            <span className="font-semibold">Pós-Rebalanceamento:</span>
            <span className="font-bold tabular-nums">
              {item.projectedPercent.toFixed(1)}% ({formatBRL(item.projectedValue)})
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* Controles do Gráfico: Modo de Visualização */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
        <div className="text-xs font-mono text-[#8c8273] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#d4af6a]" />
          <span>Comparativo Visual de Alocação</span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#1c1916] rounded-[8px] border border-[#d4af6a]/15 text-xs font-mono">
          <button
            onClick={() => setViewMode('side_by_side')}
            className={`px-2.5 py-1 rounded-[6px] transition-all cursor-pointer ${
              viewMode === 'side_by_side'
                ? 'bg-[#d4af6a] text-[#0b0a09] font-bold shadow-sm'
                : 'text-[#8c8273] hover:text-[#f5efe6]'
            }`}
          >
            Lado a Lado
          </button>
          <button
            onClick={() => setViewMode('nested')}
            className={`px-2.5 py-1 rounded-[6px] transition-all cursor-pointer ${
              viewMode === 'nested'
                ? 'bg-[#d4af6a] text-[#0b0a09] font-bold shadow-sm'
                : 'text-[#8c8273] hover:text-[#f5efe6]'
            }`}
          >
            Anéis Concêntricos
          </button>
          <button
            onClick={() => setViewMode('toggle')}
            className={`px-2.5 py-1 rounded-[6px] transition-all cursor-pointer ${
              viewMode === 'toggle'
                ? 'bg-[#d4af6a] text-[#0b0a09] font-bold shadow-sm'
                : 'text-[#8c8273] hover:text-[#f5efe6]'
            }`}
          >
            Alternar
          </button>
        </div>
      </div>

      {/* Renderização conforme modo selecionado */}
      {viewMode === 'side_by_side' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Donut 1: Alocação Atual */}
          <div className="p-4 rounded-[14px] bg-[#141210]/90 border border-[#d4af6a]/15 flex flex-col items-center">
            <div className="text-xs font-mono text-[#8c8273] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8c8273]" />
              <span>Alocação Atual</span>
            </div>
            <div className="text-sm font-serif font-bold text-[#f5efe6] mb-2 tabular-nums">
              {formatBRL(totalCurrentValue)}
            </div>

            <div className="relative w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomComparisonTooltip />} />
                  <Pie
                    data={currentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    onMouseEnter={(_, idx) => setHoveredCategory(currentData[idx]?.category || null)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    isAnimationActive={true}
                  >
                    {currentData.map((entry) => (
                      <Cell
                        key={`curr-cell-${entry.category}`}
                        fill={entry.color}
                        stroke={hoveredCategory === entry.category ? '#ffffff' : '#141210'}
                        strokeWidth={hoveredCategory === entry.category ? 2 : 1}
                        opacity={hoveredCategory && hoveredCategory !== entry.category ? 0.4 : 1}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-mono uppercase text-[#8c8273]">Atual</span>
                <span className="text-xs font-bold font-mono text-[#f5efe6]">100%</span>
              </div>
            </div>
          </div>

          {/* Donut 2: Alocação Pós-Rebalanceamento (Meta) */}
          <div className="p-4 rounded-[14px] bg-[#141210]/90 border border-[#3ddc97]/30 flex flex-col items-center shadow-[0_0_15px_rgba(61,220,151,0.08)]">
            <div className="text-xs font-mono text-[#3ddc97] uppercase tracking-wider mb-1 flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pós-Rebalanceamento</span>
            </div>
            <div className="text-sm font-serif font-bold text-[#f0d9a8] mb-2 tabular-nums">
              {formatBRL(totalProjectedValue)}
              {contributionAmount > 0 && (
                <span className="text-xs font-mono text-[#3ddc97] font-semibold ml-2">
                  (+{formatBRL(contributionAmount)})
                </span>
              )}
            </div>

            <div className="relative w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomComparisonTooltip />} />
                  <Pie
                    data={projectedData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    onMouseEnter={(_, idx) => setHoveredCategory(projectedData[idx]?.category || null)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    isAnimationActive={true}
                  >
                    {projectedData.map((entry) => (
                      <Cell
                        key={`proj-cell-${entry.category}`}
                        fill={entry.color}
                        stroke={hoveredCategory === entry.category ? '#ffffff' : '#141210'}
                        strokeWidth={hoveredCategory === entry.category ? 2 : 1}
                        opacity={hoveredCategory && hoveredCategory !== entry.category ? 0.4 : 1}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-mono uppercase text-[#3ddc97] font-bold">Meta</span>
                <span className="text-xs font-bold font-mono text-[#f0d9a8]">Pós-Aporte</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {viewMode === 'nested' && (
        <div className="p-5 rounded-[14px] bg-[#141210]/90 border border-[#d4af6a]/20 flex flex-col items-center">
          <div className="flex flex-wrap items-center justify-between w-full mb-3 text-xs font-mono">
            <span className="flex items-center gap-2 text-[#8c8273]">
              <span className="inline-block w-3 h-3 rounded-full border-2 border-[#8c8273]" />
              <span>Anel Interno: Alocação Atual</span>
            </span>
            <span className="flex items-center gap-2 text-[#3ddc97]">
              <span className="inline-block w-3 h-3 rounded-full border-2 border-[#3ddc97]" />
              <span className="font-bold">Anel Externo: Alocação Pós-Aporte (Meta)</span>
            </span>
          </div>

          <div className="relative w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomComparisonTooltip />} />
                {/* Anel Interno: Atual */}
                <Pie
                  data={currentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={68}
                  paddingAngle={2}
                  onMouseEnter={(_, idx) => setHoveredCategory(currentData[idx]?.category || null)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  isAnimationActive={true}
                >
                  {currentData.map((entry) => (
                    <Cell
                      key={`nested-curr-${entry.category}`}
                      fill={entry.color}
                      stroke="#141210"
                      strokeWidth={1.5}
                      opacity={0.75}
                    />
                  ))}
                </Pie>

                {/* Anel Externo: Projetado Pós-Rebalanceamento */}
                <Pie
                  data={projectedData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={74}
                  outerRadius={96}
                  paddingAngle={3}
                  onMouseEnter={(_, idx) => setHoveredCategory(projectedData[idx]?.category || null)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  isAnimationActive={true}
                >
                  {projectedData.map((entry) => (
                    <Cell
                      key={`nested-proj-${entry.category}`}
                      fill={entry.color}
                      stroke={hoveredCategory === entry.category ? '#ffffff' : '#141210'}
                      strokeWidth={hoveredCategory === entry.category ? 2 : 1}
                      opacity={hoveredCategory && hoveredCategory !== entry.category ? 0.35 : 1}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] font-mono uppercase text-[#8c8273]">Rebalancear</span>
              <span className="text-xs font-bold font-mono text-[#f0d9a8]">Atual vs Meta</span>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'toggle' && (
        <div className="p-5 rounded-[14px] bg-[#141210]/90 border border-[#d4af6a]/20 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4 p-1 bg-[#1c1916] rounded-[8px] border border-[#d4af6a]/15 text-xs font-mono">
            <button
              onClick={() => setToggleState('current')}
              className={`px-3 py-1 rounded-[6px] transition-all cursor-pointer ${
                toggleState === 'current'
                  ? 'bg-[#141210] text-[#f5efe6] font-bold border border-[#d4af6a]/30'
                  : 'text-[#8c8273] hover:text-[#f5efe6]'
              }`}
            >
              Exibir Situação Atual ({formatBRL(totalCurrentValue)})
            </button>
            <button
              onClick={() => setToggleState('projected')}
              className={`px-3 py-1 rounded-[6px] transition-all cursor-pointer ${
                toggleState === 'projected'
                  ? 'bg-[#d4af6a] text-[#0b0a09] font-bold shadow-sm'
                  : 'text-[#8c8273] hover:text-[#f5efe6]'
              }`}
            >
              Exibir Meta Pós-Aporte ({formatBRL(totalProjectedValue)})
            </button>
          </div>

          <div className="relative w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomComparisonTooltip />} />
                <Pie
                  data={toggleState === 'current' ? currentData : projectedData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  onMouseEnter={(_, idx) => {
                    const src = toggleState === 'current' ? currentData : projectedData;
                    setHoveredCategory(src[idx]?.category || null);
                  }}
                  onMouseLeave={() => setHoveredCategory(null)}
                  isAnimationActive={true}
                >
                  {(toggleState === 'current' ? currentData : projectedData).map((entry) => (
                    <Cell
                      key={`toggle-cell-${entry.category}`}
                      fill={entry.color}
                      stroke={hoveredCategory === entry.category ? '#ffffff' : '#141210'}
                      strokeWidth={hoveredCategory === entry.category ? 2 : 1}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] font-mono uppercase text-[#8c8273]">
                {toggleState === 'current' ? 'Alocação Atual' : 'Meta Projetada'}
              </span>
              <span className="text-sm font-bold font-mono text-[#f0d9a8]">
                {toggleState === 'current' ? formatBRL(totalCurrentValue) : formatBRL(totalProjectedValue)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Comparação Visual Rápida entre Atual -> Aporte -> Projetado -> Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {classes.map((item) => {
          const isUnder = item.status === 'underweight';
          const isOver = item.status === 'overweight';
          const diffFromTarget = item.projectedPercent - item.targetPercent;

          return (
            <div
              key={item.category}
              onMouseEnter={() => setHoveredCategory(item.category)}
              onMouseLeave={() => setHoveredCategory(null)}
              className={`p-3 rounded-[10px] bg-[#1c1916] border transition-all ${
                hoveredCategory === item.category
                  ? 'border-[#d4af6a] shadow-[0_0_12px_rgba(212,175,106,0.15)]'
                  : 'border-[#d4af6a]/15 hover:border-[#d4af6a]/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-mono font-bold text-xs text-[#f5efe6]">{item.label}</span>
                </div>
                {item.suggestedContribution > 0 ? (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[4px] bg-[#3ddc97]/20 text-[#3ddc97] font-bold">
                    +Aporte
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-[#8c8273]">
                    {isOver ? 'Acima' : 'Equil.'}
                  </span>
                )}
              </div>

              {/* Comparativo de %: Atual vs Projetado vs Meta */}
              <div className="space-y-1 text-xs font-mono">
                <div className="flex items-center justify-between text-[#8c8273]">
                  <span>Atual:</span>
                  <span className="text-[#f5efe6] font-semibold tabular-nums">
                    {item.currentPercent.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#8c8273]">
                  <span>Meta Ideal:</span>
                  <span className="text-[#d4af6a] font-bold tabular-nums">
                    {item.targetPercent.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5 font-bold">
                  <span className="text-[#3ddc97]">Projetado:</span>
                  <span className="text-[#3ddc97] tabular-nums">
                    {item.projectedPercent.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Barra de Progresso em Direção à Meta */}
              <div className="mt-2.5">
                <div className="flex justify-between text-[10px] font-mono text-[#8c8273] mb-1">
                  <span>Convergência</span>
                  <span className={Math.abs(diffFromTarget) < 1.0 ? 'text-[#3ddc97]' : 'text-[#f0d9a8]'}>
                    {diffFromTarget > 0 ? '+' : ''}{diffFromTarget.toFixed(1)}% da meta
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#0b0a09] rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${Math.min(100, Math.max(5, (item.projectedPercent / Math.max(1, item.targetPercent)) * 100))}%`,
                      backgroundColor: item.color,
                    }}
                    className="h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
