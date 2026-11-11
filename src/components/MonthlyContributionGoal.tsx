import React, { useState, useEffect, useMemo } from 'react';
import {
  Target,
  Pencil,
  Check,
  X,
  TrendingUp,
  Sparkles,
  PlusCircle,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { supabase, isSupabaseRealtimeConfigured } from '../services/supabaseClient';
import { PortfolioPosition } from '../types/portfolio';
import { formatBRL } from '../utils/formatters';

export interface MonthlyContributionGoalProps {
  positions: PortfolioPosition[];
  className?: string;
  onGoalChange?: (newGoal: number) => void;
  externalGoalAmount?: number;
  externalManualDeposits?: number;
}

const STORAGE_GOAL_KEY = 'norteinvest_monthly_goal_v1';
const STORAGE_DEPOSITS_PREFIX = 'norteinvest_manual_deposits_';

const PRESET_GOALS = [500, 1000, 2000, 3000, 5000, 10000];

export const MonthlyContributionGoal: React.FC<MonthlyContributionGoalProps> = ({
  positions,
  className = '',
  onGoalChange,
  externalGoalAmount,
  externalManualDeposits,
}) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0 = Jan, 10 = Nov
  const currentMonthKey = `${currentYear}_${currentMonth}`;

  const currentMonthName = useMemo(() => {
    return today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }, []);

  // 1. Meta definida pelo usuário (persistida no localStorage)
  const [goalAmount, setGoalAmount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_GOAL_KEY);
      if (stored) {
        const val = parseFloat(stored);
        if (!isNaN(val) && val > 0) return val;
      }
    } catch {
      // fallback
    }
    return 2500; // Padrão: R$ 2.500,00 / mês
  });

  // 2. Aportes manuais extras registrados no mês corrente
  const [manualExtraDeposits, setManualExtraDeposits] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_DEPOSITS_PREFIX}${currentMonthKey}`);
      if (stored) {
        const val = parseFloat(stored);
        if (!isNaN(val) && val >= 0) return val;
      }
    } catch {
      // fallback
    }
    return 0;
  });

  // Estados para edição da meta
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [inputGoalValue, setInputGoalValue] = useState<string>(goalAmount.toString());
  const [isAddingDeposit, setIsAddingDeposit] = useState(false);
  const [inputDepositValue, setInputDepositValue] = useState<string>('500');

  // Salvar meta quando alterada
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_GOAL_KEY, goalAmount.toString());
      if (onGoalChange) onGoalChange(goalAmount);
    } catch (e) {
      console.warn('Erro ao salvar meta no localStorage', e);
    }
  }, [goalAmount, onGoalChange]);

  // Salvar depósitos manuais quando alterados
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_DEPOSITS_PREFIX}${currentMonthKey}`, manualExtraDeposits.toString());
    } catch (e) {
      console.warn('Erro ao salvar aportes extras no localStorage', e);
    }
  }, [manualExtraDeposits, currentMonthKey]);

  // 3. Cálculo dos aportes automáticos vindos das posições criadas no mês corrente
  const aportesFromPositions = useMemo(() => {
    const currentYmPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    return positions.reduce((acc, pos) => {
      if (pos.createdAt && pos.createdAt.startsWith(currentYmPrefix)) {
        return acc + pos.quantity * pos.averagePrice;
      }
      return acc;
    }, 0);
  }, [positions, currentYear, currentMonth]);

  // Total aportado este mês
  const totalContributedThisMonth = aportesFromPositions + manualExtraDeposits;

  // Percentual da meta atingido
  const progressPercent = goalAmount > 0 ? (totalContributedThisMonth / goalAmount) * 100 : 0;
  const clampedProgress = Math.min(100, Math.max(0, progressPercent));

  // Quanto falta para atingir a meta
  const remainingAmount = Math.max(0, goalAmount - totalContributedThisMonth);
  const isGoalAchieved = totalContributedThisMonth >= goalAmount && goalAmount > 0;
  const surplus = totalContributedThisMonth - goalAmount;

  // Sincronizar quando receber atualização externa (ex: Supabase Realtime)
  useEffect(() => {
    if (typeof externalGoalAmount === 'number' && externalGoalAmount > 0) {
      setGoalAmount(externalGoalAmount);
    }
  }, [externalGoalAmount]);

  useEffect(() => {
    if (typeof externalManualDeposits === 'number' && externalManualDeposits >= 0) {
      setManualExtraDeposits(externalManualDeposits);
    }
  }, [externalManualDeposits]);

  // Função auxiliar para replicar alterações na tabela portfolio_goals do Supabase
  const syncGoalToSupabase = (newGoal: number, newDeposits: number) => {
    if (isSupabaseRealtimeConfigured && supabase) {
      supabase
        .from('portfolio_goals')
        .upsert({
          id: `goal_${currentMonthKey}`,
          goal_amount: newGoal,
          manual_deposits: newDeposits,
          month_key: currentMonthKey,
          updated_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error) {
            console.warn('[Supabase Realtime] Falha ao sincronizar meta com o banco:', error.message);
          }
        });
    }
  };

  const handleSaveGoal = () => {
    const parsed = parseFloat(inputGoalValue.replace(',', '.'));
    if (!isNaN(parsed) && parsed > 0) {
      setGoalAmount(parsed);
      setIsEditingGoal(false);
      syncGoalToSupabase(parsed, manualExtraDeposits);
    }
  };

  const handleAddManualDeposit = () => {
    const parsed = parseFloat(inputDepositValue.replace(',', '.'));
    if (!isNaN(parsed) && parsed > 0) {
      const newTotal = manualExtraDeposits + parsed;
      setManualExtraDeposits(newTotal);
      setInputDepositValue('');
      setIsAddingDeposit(false);
      syncGoalToSupabase(goalAmount, newTotal);
    }
  };

  const handleQuickAdd = (val: number) => {
    const newTotal = manualExtraDeposits + val;
    setManualExtraDeposits(newTotal);
    syncGoalToSupabase(goalAmount, newTotal);
  };

  return (
    <div
      className={`rounded-[18px] bg-[#141210] border border-[#d4af6a]/25 p-5 sm:p-7 shadow-xl relative overflow-hidden ${className}`}
    >
      {/* Luz ambiente sutil decorativa */}
      <div
        className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isGoalAchieved ? 'bg-[#3ddc97]/15' : 'bg-[#d4af6a]/10'
        }`}
      />

      {/* Header do Componente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#d4af6a]/15 relative z-10">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-[10px] border flex items-center justify-center transition-colors ${
              isGoalAchieved
                ? 'bg-[#3ddc97]/15 border-[#3ddc97]/30 text-[#3ddc97]'
                : 'bg-[#1c1916] border-[#d4af6a]/30 text-[#d4af6a]'
            }`}
          >
            <Target className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#f5efe6] tracking-tight">
                Meta de Aportes Mensais
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full capitalize bg-[#1c1916] text-[#c2b9ac] border border-[#d4af6a]/20">
                {currentMonthName}
              </span>
            </div>
            <p className="text-xs text-[#a39a8c] mt-0.5">
              Acompanhe seu hábito de poupança e investimentos regulares na B3
            </p>
          </div>
        </div>

        {/* Botão para Editar Meta */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!isEditingGoal ? (
            <button
              onClick={() => {
                setInputGoalValue(goalAmount.toString());
                setIsEditingGoal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#1c1916] hover:bg-[#25211c] border border-[#d4af6a]/25 text-[#c2b9ac] hover:text-[#f0d9a8] text-xs font-mono transition-colors cursor-pointer"
              title="Ajustar valor da meta mensal"
            >
              <Pencil className="w-3.5 h-3.5 text-[#d4af6a]" />
              <span>Ajustar Meta</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditingGoal(false)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] bg-[#1c1916] text-[#8c8273] hover:text-[#f5efe6] text-xs font-mono transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Fechar</span>
            </button>
          )}
        </div>
      </div>

      {/* Gaveta de Edição da Meta (Inline Drawer) */}
      {isEditingGoal && (
        <div className="my-4 p-4 rounded-[12px] bg-[#1c1916] border border-[#d4af6a]/30 space-y-3 animate-fadeIn relative z-10">
          <div className="text-xs font-mono font-semibold text-[#f5efe6] flex items-center justify-between">
            <span>Defina sua nova meta mensal de investimento:</span>
            <span className="text-[11px] text-[#8c8273]">Salvo no seu navegador</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {PRESET_GOALS.map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setGoalAmount(preset);
                  setIsEditingGoal(false);
                }}
                className={`px-3 py-1.5 rounded-[6px] text-xs font-mono transition-all cursor-pointer ${
                  goalAmount === preset
                    ? 'bg-[#d4af6a] text-[#0b0a09] font-bold shadow'
                    : 'bg-[#141210] border border-[#d4af6a]/20 text-[#c2b9ac] hover:text-[#f0d9a8]'
                }`}
              >
                {formatBRL(preset, 0)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#8c8273]">
                R$
              </span>
              <input
                type="number"
                min="50"
                step="50"
                value={inputGoalValue}
                onChange={(e) => setInputGoalValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal()}
                placeholder="Ex: 2500"
                className="w-full pl-8 pr-3 py-1.5 rounded-[8px] bg-[#141210] border border-[#d4af6a]/30 text-xs font-mono text-[#f5efe6] focus:outline-none focus:border-[#d4af6a]"
              />
            </div>
            <button
              onClick={handleSaveGoal}
              className="px-4 py-1.5 rounded-[8px] bg-[#d4af6a] text-[#0b0a09] font-bold text-xs font-mono hover:bg-[#dfbc77] transition-colors cursor-pointer"
            >
              Salvar Meta
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo Principal: Números & Barra de Progresso */}
      <div className="mt-5 space-y-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card 1: Aportado Este Mês */}
          <div className="p-3.5 rounded-[12px] bg-[#1c1916]/80 border border-[#d4af6a]/15">
            <div className="text-[10px] font-mono text-[#8c8273] uppercase tracking-wider">
              Aportado no Mês
            </div>
            <div className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6] mt-1 tabular-nums">
              {formatBRL(totalContributedThisMonth)}
            </div>
            <div className="text-[11px] font-mono text-[#8c8273] mt-1 flex items-center gap-1">
              {aportesFromPositions > 0 && (
                <span title="Posições compradas este mês">{formatBRL(aportesFromPositions)} em ativos</span>
              )}
              {aportesFromPositions > 0 && manualExtraDeposits > 0 && <span>+</span>}
              {manualExtraDeposits > 0 && (
                <span title="Aportes extras registrados">{formatBRL(manualExtraDeposits)} manual</span>
              )}
            </div>
          </div>

          {/* Card 2: Meta Estabelecida */}
          <div className="p-3.5 rounded-[12px] bg-[#1c1916]/80 border border-[#d4af6a]/15">
            <div className="text-[10px] font-mono text-[#8c8273] uppercase tracking-wider">
              Meta Almejada
            </div>
            <div className="text-xl sm:text-2xl font-serif font-bold text-[#d4af6a] mt-1 tabular-nums">
              {formatBRL(goalAmount)}
            </div>
            <div className="text-[11px] font-mono text-[#8c8273] mt-1">
              Objetivo regular mensal
            </div>
          </div>

          {/* Card 3: Status / Quanto Falta */}
          <div
            className={`p-3.5 rounded-[12px] border ${
              isGoalAchieved
                ? 'bg-[#3ddc97]/10 border-[#3ddc97]/30'
                : 'bg-[#1c1916]/80 border-[#d4af6a]/15'
            }`}
          >
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8c8273]">
              {isGoalAchieved ? 'Status da Meta' : 'Faltam para Atingir'}
            </div>
            <div
              className={`text-xl sm:text-2xl font-serif font-bold mt-1 tabular-nums ${
                isGoalAchieved ? 'text-[#3ddc97]' : 'text-[#f0d9a8]'
              }`}
            >
              {isGoalAchieved ? 'Meta Batida! 🎯' : formatBRL(remainingAmount)}
            </div>
            <div className="text-[11px] font-mono mt-1">
              {isGoalAchieved ? (
                <span className="text-[#3ddc97] font-semibold">
                  +{formatBRL(surplus)} além da meta
                </span>
              ) : (
                <span className="text-[#8c8273]">
                  {progressPercent.toFixed(1)}% do objetivo alcançado
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Barra Visual de Progresso */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#c2b9ac] flex items-center gap-1.5">
              <span>Progresso Atual:</span>
              <span
                className={`font-bold tabular-nums ${
                  isGoalAchieved ? 'text-[#3ddc97]' : 'text-[#d4af6a]'
                }`}
              >
                {progressPercent.toFixed(1)}%
              </span>
            </span>
            <span className="text-[#8c8273] text-[11px]">
              {formatBRL(totalContributedThisMonth)} de {formatBRL(goalAmount)}
            </span>
          </div>

          <div className="h-3.5 w-full bg-[#1c1916] rounded-full p-0.5 border border-[#d4af6a]/15 overflow-hidden">
            <div
              style={{ width: `${clampedProgress}%` }}
              className={`h-full rounded-full transition-all duration-700 ${
                isGoalAchieved
                  ? 'bg-gradient-to-r from-[#3ddc97] to-[#4ade80] shadow-[0_0_12px_rgba(61,220,151,0.5)]'
                  : 'bg-gradient-to-r from-[#d4af6a] via-[#f0d9a8] to-[#dfbc77] shadow-[0_0_10px_rgba(212,175,106,0.3)]'
              }`}
            />
          </div>

          {/* Marcadores de Marco (25%, 50%, 75%, 100%) */}
          <div className="flex justify-between text-[10px] font-mono text-[#8c8273] px-1 pt-0.5">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span className="font-bold text-[#d4af6a]">100% Meta</span>
          </div>
        </div>

        {/* Ações Rápidas de Aporte */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-1.5 text-[#8c8273]">
            <span>Registrar aporte rápido:</span>
            <button
              onClick={() => handleQuickAdd(200)}
              className="px-2 py-0.5 rounded bg-[#1c1916] hover:bg-[#25211c] border border-[#d4af6a]/20 text-[#f0d9a8] hover:text-white transition-colors cursor-pointer"
            >
              +R$ 200
            </button>
            <button
              onClick={() => handleQuickAdd(500)}
              className="px-2 py-0.5 rounded bg-[#1c1916] hover:bg-[#25211c] border border-[#d4af6a]/20 text-[#f0d9a8] hover:text-white transition-colors cursor-pointer"
            >
              +R$ 500
            </button>
            <button
              onClick={() => handleQuickAdd(1000)}
              className="px-2 py-0.5 rounded bg-[#1c1916] hover:bg-[#25211c] border border-[#d4af6a]/20 text-[#f0d9a8] hover:text-white transition-colors cursor-pointer"
            >
              +R$ 1.000
            </button>

            {!isAddingDeposit ? (
              <button
                onClick={() => setIsAddingDeposit(true)}
                className="px-2 py-0.5 rounded bg-[#1c1916] hover:bg-[#25211c] border border-[#d4af6a]/20 text-[#c2b9ac] hover:text-[#d4af6a] transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <PlusCircle className="w-3 h-3" />
                <span>Outro valor</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 inline-flex">
                <input
                  type="number"
                  min="10"
                  step="50"
                  value={inputDepositValue}
                  onChange={(e) => setInputDepositValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddManualDeposit()}
                  placeholder="R$"
                  className="w-20 px-2 py-0.5 rounded bg-[#141210] border border-[#d4af6a]/30 text-xs text-[#f5efe6]"
                  autoFocus
                />
                <button
                  onClick={handleAddManualDeposit}
                  className="px-2 py-0.5 rounded bg-[#d4af6a] text-[#0b0a09] font-bold text-xs hover:bg-[#dfbc77]"
                >
                  OK
                </button>
                <button
                  onClick={() => setIsAddingDeposit(false)}
                  className="text-[#8c8273] hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {manualExtraDeposits > 0 && (
            <button
              onClick={() => setManualExtraDeposits(0)}
              className="text-[11px] text-[#8c8273] hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
              title="Zerar aportes manuais adicionais deste mês"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Zerar manuais</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyContributionGoal;
