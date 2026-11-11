import React, { useState, useEffect, useMemo } from 'react';
import {
  Scale,
  Sparkles,
  Sliders,
  DollarSign,
  TrendingUp,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
  Mail,
  FileText,
} from 'lucide-react';
import {
  PortfolioPosition,
  RebalanceTargetAllocation,
  AssetCategory,
} from '../types/portfolio';
import { StockItem } from '../types/market';
import { formatBRL } from '../utils/formatters';
import {
  ALL_ASSET_CATEGORIES,
  CATEGORY_INFO,
  REBALANCE_PRESETS,
  DEFAULT_TARGET_ALLOCATION,
  getSavedTargetAllocation,
  saveTargetAllocation,
  getSavedContributionAmount,
  saveContributionAmount,
  calculateCurrentClassValues,
  simulateRebalance,
  normalizeTargetAllocation,
} from '../services/rebalanceService';
import { RebalanceComparisonDonutChart } from './RebalanceComparisonDonutChart';
import { RebalanceEmailModal } from './RebalanceEmailModal';

interface PortfolioRebalanceSimulatorProps {
  positions: PortfolioPosition[];
  stocks?: StockItem[];
  cdiRate?: number;
  className?: string;
  onExportPdf?: () => void;
}

export const PortfolioRebalanceSimulator: React.FC<PortfolioRebalanceSimulatorProps> = ({
  positions,
  stocks = [],
  cdiRate = 13.65,
  className = '',
  onExportPdf,
}) => {
  const [targetAllocation, setTargetAllocation] = useState<RebalanceTargetAllocation>(() => {
    return getSavedTargetAllocation();
  });

  const [contributionInput, setContributionInput] = useState<string>(() => {
    return getSavedContributionAmount().toString();
  });

  const [activePreset, setActivePreset] = useState<string | null>('moderado');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);

  // Cotações correntes consolidadas por classe
  const currentClassTotals = useMemo(() => {
    return calculateCurrentClassValues(positions, stocks, cdiRate);
  }, [positions, stocks, cdiRate]);

  // Aporte numérico
  const contributionAmount = useMemo(() => {
    const parsed = parseFloat(contributionInput.replace(',', '.'));
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  }, [contributionInput]);

  // Salva aporte e metas no localStorage quando alterados
  useEffect(() => {
    saveTargetAllocation(targetAllocation);
  }, [targetAllocation]);

  useEffect(() => {
    saveContributionAmount(contributionAmount);
  }, [contributionAmount]);

  // Simulação de Rebalanceamento
  const simulation = useMemo(() => {
    return simulateRebalance(currentClassTotals, targetAllocation, contributionAmount);
  }, [currentClassTotals, targetAllocation, contributionAmount]);

  // Selecionar preset
  const handleSelectPreset = (presetId: string) => {
    const found = REBALANCE_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setTargetAllocation({ ...found.allocation });
      setActivePreset(presetId);
    }
  };

  // Ajuste manual de uma classe
  const handleSliderChange = (category: AssetCategory, val: number) => {
    setActivePreset(null);
    setTargetAllocation((prev) => ({
      ...prev,
      [category]: Math.max(0, Math.min(100, Math.round(val))),
    }));
  };

  // Normalizar para 100%
  const handleNormalize = () => {
    const normalized = normalizeTargetAllocation(targetAllocation);
    setTargetAllocation(normalized);
  };

  // Atalhos de valor de aporte
  const handleQuickContribution = (amount: number) => {
    setContributionInput(amount.toString());
  };

  // Copiar resumo do rebalanceamento para a área de transferência
  const handleCopySummary = () => {
    const lines = [
      `📊 *Norte Invest - Simulação de Rebalanceamento*`,
      `Patrimônio Atual: ${formatBRL(simulation.totalCurrentValue)}`,
      `Aporte Simulado: ${formatBRL(simulation.contributionAmount)}`,
      `Total Projetado: ${formatBRL(simulation.totalProjectedValue)}`,
      '',
      '🎯 *Sugestão de Aportes por Classe:*',
      ...simulation.classes.map((c) => {
        const aporte = c.suggestedContribution > 0 ? `+${formatBRL(c.suggestedContribution)}` : 'R$ 0,00';
        return `• ${c.label}: Aportar ${aporte} (Meta: ${c.targetPercent}% | Projetado: ${c.projectedPercent.toFixed(1)}%)`;
      }),
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Soma das metas atuais
  const targetSum = simulation.targetSum;
  const isTarget100 = Math.abs(targetSum - 100) < 0.1;

  return (
    <div
      className={`rounded-[18px] bg-[#141210] border border-[#d4af6a]/30 p-5 sm:p-7 shadow-xl space-y-6 ${className}`}
    >
      {/* 1. Header do Simulador com Botão de Recolher/Expandir */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#d4af6a]/15">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-[10px] bg-gradient-to-br from-[#d4af6a]/20 to-[#d4af6a]/5 border border-[#d4af6a]/30 text-[#f0d9a8] flex-shrink-0">
            <Scale className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-[#f5efe6] tracking-tight">
                Simulador de Rebalanceamento Inteligente
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#d4af6a]/15 text-[#f0d9a8] border border-[#d4af6a]/25">
                Sem Venda de Ativos
              </span>
            </div>
            <p className="text-xs text-[#a39a8c] mt-0.5 font-sans">
              Descubra quanto aportar em cada classe de ativos para atingir sua meta ideal de alocação patrimonial na B3.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {onExportPdf && (
            <button
              onClick={onExportPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#1c1916] hover:bg-[#24201c] border border-[#d4af6a]/30 text-[#f0d9a8] hover:text-white text-xs font-mono font-semibold transition-colors cursor-pointer"
              title="Exportar Relatório Executivo com resumo patrimonial e rebalanceamento em PDF"
            >
              <FileText className="w-3.5 h-3.5 text-[#d4af6a]" />
              <span>Exportar PDF</span>
            </button>
          )}

          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#1c1916] hover:bg-[#24201c] border border-[#3ddc97]/30 text-[#c2b9ac] hover:text-[#3ddc97] text-xs font-mono transition-colors cursor-pointer"
            title="Enviar notificação de resumo do rebalanceamento por e-mail via Supabase"
          >
            <Mail className="w-3.5 h-3.5 text-[#3ddc97]" />
            <span>Enviar por E-mail</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#1c1916] hover:bg-[#24201c] border border-[#d4af6a]/20 text-[#c2b9ac] hover:text-[#f0d9a8] text-xs font-mono transition-colors cursor-pointer"
            title="Copiar plano de aportes para a área de transferência"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-[#3ddc97]" /> : <Copy className="w-3.5 h-3.5 text-[#d4af6a]" />}
            <span>{isCopied ? 'Copiado!' : 'Copiar Plano'}</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-[8px] bg-[#1c1916] hover:bg-[#24201c] text-[#8c8273] hover:text-[#f5efe6] transition-colors cursor-pointer"
            title={isExpanded ? 'Recolher simulador' : 'Expandir simulador'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          
          {/* 2. Seleção de Modelos / Presets de Alocação */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#8c8273]">
              <span className="uppercase tracking-wider">Perfis Estratégicos Pré-Definidos</span>
              <span className="text-[11px]">Ou personalize os percentuais abaixo</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {REBALANCE_PRESETS.map((preset) => {
                const isSelected = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`p-2.5 rounded-[10px] text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#d4af6a]/15 border-[#d4af6a] text-[#f5efe6] shadow-[0_0_12px_rgba(212,175,106,0.15)]'
                        : 'bg-[#1c1916] border-[#d4af6a]/15 text-[#8c8273] hover:text-[#c2b9ac] hover:border-[#d4af6a]/30'
                    }`}
                  >
                    <div className="font-mono font-bold text-xs text-[#f0d9a8] truncate">
                      {preset.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-[#8c8273] mt-0.5 truncate font-sans">
                      {preset.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Sliders de Definição da Meta Percentual & Input do Aporte */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-5 rounded-[14px] bg-[#1c1916]/80 border border-[#d4af6a]/15">
            
            {/* Lado Esquerdo: Sliders das 4 Classes (8 Colunas) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#f5efe6] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#d4af6a]" />
                  <span>Meta de Alocação Desejada (%)</span>
                </span>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span
                    className={`px-2 py-0.5 rounded-[6px] font-bold ${
                      isTarget100
                        ? 'bg-[#3ddc97]/20 text-[#3ddc97] border border-[#3ddc97]/30'
                        : 'bg-[#ff5c6c]/20 text-[#ff5c6c] border border-[#ff5c6c]/30'
                    }`}
                  >
                    Total: {targetSum.toFixed(1)}% {isTarget100 ? '✓' : `(Faltam ${(100 - targetSum).toFixed(1)}%)`}
                  </span>

                  {!isTarget100 && (
                    <button
                      onClick={handleNormalize}
                      className="inline-flex items-center gap-1 text-[11px] text-[#d4af6a] hover:underline cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Ajustar 100%</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Sliders das Classes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {ALL_ASSET_CATEGORIES.map((cat) => {
                  const info = CATEGORY_INFO[cat];
                  const value = targetAllocation[cat] || 0;
                  const currentVal = currentClassTotals[cat] || 0;
                  const currentPct = simulation.totalCurrentValue > 0
                    ? (currentVal / simulation.totalCurrentValue) * 100
                    : 0;

                  return (
                    <div
                      key={cat}
                      className="p-3 rounded-[10px] bg-[#141210] border border-[#d4af6a]/15 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: info.color }}
                          />
                          <span className="font-mono font-bold text-xs text-[#f5efe6]">
                            {info.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-[#8c8273]">
                            Atual: {currentPct.toFixed(1)}%
                          </span>
                          <span className="font-mono font-bold text-xs text-[#d4af6a] tabular-nums">
                            {value}%
                          </span>
                        </div>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={value}
                        onChange={(e) => handleSliderChange(cat, parseFloat(e.target.value))}
                        className="w-full accent-[#d4af6a] cursor-pointer h-1.5 bg-[#1c1916] rounded-lg"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lado Direito: Input do Valor do Aporte (4 Colunas) */}
            <div className="lg:col-span-4 p-4 rounded-[12px] bg-[#141210] border border-[#d4af6a]/20 flex flex-col justify-between space-y-3">
              <div>
                <label className="block text-xs font-mono uppercase text-[#8c8273] mb-1">
                  Valor do Novo Aporte
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono text-[#8c8273]">
                    R$
                  </span>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={contributionInput}
                    onChange={(e) => setContributionInput(e.target.value)}
                    placeholder="0,00"
                    className="w-full pl-10 pr-3 py-2.5 rounded-[8px] bg-[#1c1916] border border-[#d4af6a]/30 text-[#f5efe6] font-mono text-base font-bold focus:border-[#d4af6a] focus:outline-none"
                  />
                </div>

                {/* Atalhos Rápidos de Aporte */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  {[500, 1000, 2500, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickContribution(amt)}
                      className={`px-2 py-1 rounded-[6px] text-[11px] font-mono transition-colors cursor-pointer border ${
                        contributionAmount === amt
                          ? 'bg-[#d4af6a] text-[#0b0a09] font-bold border-[#d4af6a]'
                          : 'bg-[#1c1916] hover:bg-[#24201c] border-[#d4af6a]/20 text-[#c2b9ac]'
                      }`}
                    >
                      {formatBRL(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resumo do Impacto no Patrimônio */}
              <div className="pt-2 border-t border-[#d4af6a]/15 text-xs font-mono space-y-1">
                <div className="flex justify-between text-[#8c8273]">
                  <span>Patrimônio Atual:</span>
                  <span className="text-[#f5efe6] font-semibold">{formatBRL(simulation.totalCurrentValue)}</span>
                </div>
                <div className="flex justify-between text-[#8c8273]">
                  <span>Novo Aporte:</span>
                  <span className="text-[#3ddc97] font-bold">+{formatBRL(simulation.contributionAmount)}</span>
                </div>
                <div className="flex justify-between text-[#f0d9a8] font-bold pt-1 border-t border-white/5">
                  <span>Patrimônio Final:</span>
                  <span className="tabular-nums">{formatBRL(simulation.totalProjectedValue)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* 4. Gráfico Comparativo de Rosca (Recharts): Alocação Atual vs Meta Pós-Aporte */}
          <div className="p-4 sm:p-5 rounded-[14px] bg-[#1c1916]/40 border border-[#d4af6a]/20">
            <RebalanceComparisonDonutChart
              classes={simulation.classes}
              totalCurrentValue={simulation.totalCurrentValue}
              totalProjectedValue={simulation.totalProjectedValue}
              contributionAmount={simulation.contributionAmount}
            />
          </div>

          {/* 5. Tabela de Sugestões de Aporte por Classe */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono uppercase tracking-wider text-[#8c8273] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3ddc97]" />
                <span>Sugestão de Aportes por Classe (Rebalanceamento Otimizado)</span>
              </div>
              <span className="text-[11px] font-mono text-[#8c8273]">
                Sem giro desnecessário de carteira ou pagamento de IR
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {simulation.classes.map((item) => {
                const isUnder = item.status === 'underweight';
                const isOver = item.status === 'overweight';
                const hasAporte = item.suggestedContribution > 0;

                // Ativos da carteira pertencentes a esta classe
                const classPositions = positions.filter((p) => p.category === item.category);

                return (
                  <div
                    key={item.category}
                    className={`p-4 rounded-[12px] border transition-all flex flex-col justify-between ${
                      hasAporte
                        ? 'bg-gradient-to-b from-[#141812] to-[#141210] border-[#3ddc97]/40 shadow-[0_4px_16px_rgba(61,220,151,0.08)]'
                        : 'bg-[#141210] border-[#d4af6a]/15'
                    }`}
                  >
                    <div>
                      {/* Top: Nome da Classe + Status */}
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#d4af6a]/10">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-mono font-bold text-xs text-[#f5efe6]">
                            {item.label}
                          </span>
                        </div>

                        {hasAporte ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#3ddc97]/20 text-[#3ddc97] font-bold border border-[#3ddc97]/30">
                            Aportar Agora
                          </span>
                        ) : isOver ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#d4af6a]/10 text-[#d4af6a]">
                            Aguardar
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-[#8c8273]">
                            Equilibrado
                          </span>
                        )}
                      </div>

                      {/* Aporte Recomendado em Destaque */}
                      <div className="my-2 p-2.5 rounded-[8px] bg-[#1c1916] border border-white/5">
                        <span className="text-[10px] font-mono text-[#8c8273] block mb-0.5 uppercase">
                          Aporte Recomendado
                        </span>
                        <div
                          className={`font-mono text-base font-bold tabular-nums ${
                            hasAporte ? 'text-[#3ddc97]' : 'text-[#8c8273]'
                          }`}
                        >
                          {hasAporte ? `+${formatBRL(item.suggestedContribution)}` : 'R$ 0,00'}
                        </div>
                        {hasAporte && simulation.contributionAmount > 0 && (
                          <span className="text-[10px] font-mono text-[#3ddc97]/80 block mt-0.5">
                            {((item.suggestedContribution / simulation.contributionAmount) * 100).toFixed(0)}% do seu aporte deste mês
                          </span>
                        )}
                      </div>

                      {/* Métricas de Alocação: Atual vs Meta vs Projetado */}
                      <div className="space-y-1.5 text-xs font-mono text-[#8c8273] pt-1">
                        <div className="flex justify-between">
                          <span>Atual:</span>
                          <span className="text-[#f5efe6] font-semibold tabular-nums">
                            {formatBRL(item.currentValue)} ({item.currentPercent.toFixed(1)}%)
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span>Meta Desejada:</span>
                          <span className="text-[#d4af6a] font-bold tabular-nums">
                            {item.targetPercent.toFixed(1)}%
                          </span>
                        </div>

                        <div className="flex justify-between pt-1 border-t border-white/5 text-[#f0d9a8]">
                          <span className="font-semibold">Pós-Aporte:</span>
                          <span className="font-bold tabular-nums">
                            {formatBRL(item.projectedValue)} ({item.projectedPercent.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rodapé do Card: Ativos da Carteira */}
                    <div className="mt-3 pt-2 border-t border-[#d4af6a]/10 text-[11px] font-mono text-[#8c8273]">
                      {classPositions.length > 0 ? (
                        <div className="truncate">
                          <span className="text-[#8c8273]">Seus ativos: </span>
                          <span className="text-[#c2b9ac]">
                            {classPositions.map((p) => p.ticker).slice(0, 3).join(', ')}
                            {classPositions.length > 3 ? ` +${classPositions.length - 3}` : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#8c8273] italic">Sem ativos cadastrados nesta classe</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Modal de Envio por E-mail integrado ao Supabase */}
      <RebalanceEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        simulation={simulation}
      />
    </div>
  );
};
