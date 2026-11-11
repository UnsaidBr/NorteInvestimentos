import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { StaticReferenceNotice } from '../components/StaticReferenceNotice';
import { APP_NAME } from '../constants/config';
import { useMarket } from '../context/MarketContext';
import { usePortfolio } from '../hooks/usePortfolio';
import { calculatePortfolioSummary, INITIAL_DEMO_PORTFOLIO } from '../services/portfolioService';
import { PortfolioPosition, AssetCategory } from '../types/portfolio';
import { supabase, isSupabaseRealtimeConfigured } from '../services/supabaseClient';
import { useSupabasePortfolioRealtime } from '../hooks/useSupabasePortfolioRealtime';
import { AddPositionModal } from '../components/AddPositionModal';
import { AssetLogo } from '../components/AssetLogo';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { formatBRL, formatPercent, getFriendlyCompanyName } from '../utils/formatters';
import { FII_DATASET } from '../data/fiiData';
import { BASE_FUNDAMENTAL_STOCKS } from '../data/fundamentalData';
import { MonthlyDividendProjectionChart } from '../components/MonthlyDividendProjectionChart';
import { AssetAllocationDonutChart } from '../components/AssetAllocationDonutChart';
import { MonthlyContributionGoal } from '../components/MonthlyContributionGoal';
import { PriceAlertBanner } from '../components/PriceAlertBanner';
import { PriceAlertModal } from '../components/PriceAlertModal';
import { PortfolioRebalanceSimulator } from '../components/PortfolioRebalanceSimulator';
import { AssetAiAnalysisModal } from '../components/AssetAiAnalysisModal';
import { generatePortfolioPdfReport } from '../services/portfolioPdfReportService';
import {
  calculateCurrentClassValues,
  simulateRebalance,
  getSavedTargetAllocation,
  getSavedContributionAmount,
} from '../services/rebalanceService';
import { usePriceAlerts } from '../hooks/usePriceAlerts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Calendar,
  Plus,
  RotateCcw,
  Download,
  Trash2,
  Edit2,
  AlertCircle,
  HelpCircle,
  Info,
  SlidersHorizontal,
  Building2,
  Layers,
  ArrowRight,
  Percent,
  FileSpreadsheet,
  FileText,
  Bell,
  BellRing,
  Scale,
  Sparkles,
} from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  usePageMeta(
    `Minha Carteira & Projeção de Dividendos | ${APP_NAME}`,
    'Acompanhe seu patrimônio consolidado na B3, alocação por classes de ativos, rentabilidade com cotações atualizadas a cada 60 segundos e gráfico de projeção de proventos mensais sem login.'
  );

  const { marketState } = useMarket();
  const { stocks, isDemoMode, lastUpdated, macro } = marketState;

  const {
    positions,
    addPosition,
    updatePosition,
    deletePosition,
    resetToDemo,
    clearAll,
    exportBackup,
    exportCsv,
  } = usePortfolio();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<PortfolioPosition | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<'all' | AssetCategory>('all');

  // Estado da meta financeira recebida via Supabase Realtime
  const [realtimeGoal, setRealtimeGoal] = useState<{
    goalAmount: number;
    manualDeposits: number;
  } | null>(null);

  // Hook do Listener de Tempo Real do Supabase para ativos e metas
  const { syncStatus, isRealtimeActive, lastSyncTime } = useSupabasePortfolioRealtime({
    onGoalChange: (data) => {
      setRealtimeGoal({
        goalAmount: data.goalAmount,
        manualDeposits: data.manualDeposits,
      });
    },
  });

  // Cálculo analítico consolidado
  const cdiAnnualRate = macro.cdi.rateAnnual || 13.65;
  const summary = useMemo(() => {
    return calculatePortfolioSummary(positions, stocks, cdiAnnualRate);
  }, [positions, stocks, cdiAnnualRate]);

  // Mapa de cotações em tempo real por ativo para cálculo de alertas e métricas
  const currentPricesMap = useMemo(() => {
    const map: Record<string, number> = {};
    positions.forEach((pos) => {
      const tickerUpper = pos.ticker.toUpperCase().trim();
      if (pos.category === 'renda_fixa') {
        map[tickerUpper] = pos.averagePrice * (1 + cdiAnnualRate / 100);
      } else if (pos.category === 'fii') {
        const foundFii = FII_DATASET.find((f) => f.ticker.toUpperCase() === tickerUpper);
        map[tickerUpper] = foundFii ? foundFii.price : pos.averagePrice;
      } else {
        const live = stocks.find((s) => s.ticker.toUpperCase() === tickerUpper);
        const fund = BASE_FUNDAMENTAL_STOCKS.find((fs) => fs.ticker.toUpperCase() === tickerUpper);
        if (live && live.price > 0) {
          map[tickerUpper] = live.price;
        } else if (fund) {
          map[tickerUpper] = fund.price;
        } else {
          map[tickerUpper] = pos.averagePrice;
        }
      }
    });
    return map;
  }, [positions, stocks, cdiAnnualRate]);

  // Hook de Alertas de Preço com avaliação contínua em tempo real
  const {
    alerts,
    activeAlerts,
    triggeredAlerts,
    hasTriggeredAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleActive,
    dismissTrigger,
    dismissAllTriggered,
    reactivateAlert,
    playTestChime,
    requestNotificationPermission,
    getAlertsForTicker,
  } = usePriceAlerts(currentPricesMap);

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertModalTicker, setAlertModalTicker] = useState<string | undefined>(undefined);

  const handleOpenAlertModal = (ticker?: string) => {
    setAlertModalTicker(ticker);
    setIsAlertModalOpen(true);
  };

  // Estado e handler do Modal de Análise Automatizada por IA Gemini
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiSelectedPosition, setAiSelectedPosition] = useState<PortfolioPosition | null>(null);
  const [aiSelectedPrice, setAiSelectedPrice] = useState<number>(0);
  const [aiSelectedAnnualDividend, setAiSelectedAnnualDividend] = useState<number>(0);

  const handleOpenAiAnalysis = (pos: PortfolioPosition, currentPrice: number, annualDividend: number) => {
    setAiSelectedPosition(pos);
    setAiSelectedPrice(currentPrice);
    setAiSelectedAnnualDividend(annualDividend);
    setIsAiModalOpen(true);
  };

  // Simulação de Rebalanceamento para integração com o Relatório Executivo em PDF
  const currentClassTotals = useMemo(() => {
    return calculateCurrentClassValues(positions, stocks, cdiAnnualRate);
  }, [positions, stocks, cdiAnnualRate]);

  const rebalanceSimulation = useMemo(() => {
    const target = getSavedTargetAllocation();
    const contrib = getSavedContributionAmount();
    return simulateRebalance(currentClassTotals, target, contrib);
  }, [currentClassTotals]);

  // Handler para Exportar Relatório em PDF
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleExportPdfReport = () => {
    if (positions.length === 0) return;
    try {
      setIsGeneratingPdf(true);
      generatePortfolioPdfReport({
        summary,
        positions,
        currentPricesMap,
        rebalanceSimulation,
        cdiRate: cdiAnnualRate,
      });
    } catch (err) {
      console.error('Falha ao exportar relatório em PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Posições enriquecidas filtradas por aba
  const filteredPositions = useMemo(() => {
    if (activeViewTab === 'all') return positions;
    return positions.filter((p) => p.category === activeViewTab);
  }, [positions, activeViewTab]);

  const handleOpenAddModal = () => {
    setEditingPos(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pos: PortfolioPosition) => {
    setEditingPos(pos);
    setIsModalOpen(true);
  };

  const handleSavePosition = (data: Omit<PortfolioPosition, 'id' | 'createdAt'>) => {
    if (editingPos) {
      updatePosition(editingPos.id, data);

      // Sincroniza atualização no Supabase Realtime se configurado
      if (isSupabaseRealtimeConfigured && supabase) {
        supabase
          .from('portfolio_positions')
          .update({
            ticker: data.ticker.toUpperCase().trim(),
            name: data.name,
            category: data.category,
            quantity: data.quantity,
            average_price: data.averagePrice,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingPos.id)
          .then(({ error }) => {
            if (error) console.warn('[Supabase Realtime] Falha ao atualizar ativo:', error.message);
          });
      }
    } else {
      addPosition(data);

      // Sincroniza inserção no Supabase Realtime se configurado
      if (isSupabaseRealtimeConfigured && supabase) {
        const generatedId = `pos-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        supabase
          .from('portfolio_positions')
          .insert({
            id: generatedId,
            ticker: data.ticker.toUpperCase().trim(),
            name: data.name,
            category: data.category,
            quantity: data.quantity,
            average_price: data.averagePrice,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .then(({ error }) => {
            if (error) console.warn('[Supabase Realtime] Falha ao cadastrar ativo:', error.message);
          });
      }
    }
  };

  const handleDeletePosition = (id: string, ticker: string) => {
    if (window.confirm(`Remover ${ticker} da sua carteira?`)) {
      deletePosition(id);

      // Sincroniza exclusão no Supabase Realtime se configurado
      if (isSupabaseRealtimeConfigured && supabase) {
        supabase
          .from('portfolio_positions')
          .delete()
          .eq('id', id)
          .then(({ error }) => {
            if (error) console.warn('[Supabase Realtime] Falha ao excluir ativo:', error.message);
          });
      }
    }
  };

  const handleResetToDemo = () => {
    resetToDemo();

    if (isSupabaseRealtimeConfigured && supabase) {
      const records = INITIAL_DEMO_PORTFOLIO.map((p) => ({
        id: p.id,
        ticker: p.ticker,
        name: p.name,
        category: p.category,
        quantity: p.quantity,
        average_price: p.averagePrice,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      supabase
        .from('portfolio_positions')
        .upsert(records)
        .then(({ error }) => {
          if (error) console.warn('[Supabase Realtime] Falha ao restaurar demo no Supabase:', error.message);
        });
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Tem certeza que deseja limpar todas as posições da carteira?')) {
      clearAll();

      if (isSupabaseRealtimeConfigured && supabase) {
        supabase
          .from('portfolio_positions')
          .delete()
          .neq('id', '')
          .then(({ error }) => {
            if (error) console.warn('[Supabase Realtime] Falha ao limpar posições:', error.message);
          });
      }
    }
  };

  const isProfit = summary.totalGainLossBrl >= 0;

  return (
    <div className="min-h-screen bg-[#0b0a09] text-[#f5efe6] pb-24">
      {/* 1. Page Header */}
      <PageHeader
        title="Minha Carteira de Investimentos"
        subtitle="Gerenciamento patrimonial completo, projeção de renda passiva mensal e alocação por classes de ativos da B3 com privacidade total no seu navegador."
        badge="Ferramenta Analítica"
        breadcrumbs={[{ label: 'Minha Carteira' }]}
      />
      <StaticReferenceNotice what="A valorização da carteira e a lista de ativos para cadastro" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        
        {/* Banner de Notificação de Alertas Disparados */}
        <PriceAlertBanner
          triggeredAlerts={triggeredAlerts}
          onOpenModal={(ticker) => handleOpenAlertModal(ticker)}
          onDismiss={dismissTrigger}
          onDismissAll={dismissAllTriggered}
        />

        {/* Barra de Ações Rápidas da Carteira */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[14px] bg-[#141210] border border-[#d4af6a]/20 mb-8 shadow-lg">
          <div className="flex flex-wrap items-center gap-3">
            <DataSourceBadge isDemoMode={isDemoMode} lastUpdated={lastUpdated} />

            {/* Indicador do Listener de Tempo Real do Supabase */}
            {isRealtimeActive ? (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-[#3ddc97]/10 text-[#3ddc97] border border-[#3ddc97]/30 shadow-[0_0_10px_rgba(61,220,151,0.2)]"
                title={lastSyncTime ? `Realtime ativo via WebSocket. Última sincronização: ${lastSyncTime.toLocaleTimeString('pt-BR')}` : 'Supabase Realtime conectado'}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#3ddc97] animate-pulse" />
                <span>Supabase Realtime</span>
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-[#1c1916] text-[#8c8273] border border-[#d4af6a]/15"
                title="Persistência local no navegador (localStorage). Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para sincronização na nuvem."
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#8c8273]" />
                <span>Modo Local</span>
              </span>
            )}

            <span className="text-xs font-mono text-[#8c8273]">
              {positions.length} {positions.length === 1 ? 'posição cadastrada' : 'posições cadastradas'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] hover:from-[#dfbc77] hover:to-[#fae6b8] text-[#0b0a09] font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Adicionar Ativo</span>
            </button>

            <button
              onClick={handleResetToDemo}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[8px] bg-[#1c1916] hover:bg-[#24201c] border border-[#d4af6a]/20 text-[#c2b9ac] hover:text-[#f0d9a8] text-xs font-mono transition-colors cursor-pointer"
              title="Restaurar a carteira demonstrativa padrão com Ações, FIIs e Renda Fixa"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#d4af6a]" />
              <span className="hidden sm:inline">Restaurar Demo</span>
            </button>

            <button
              onClick={exportBackup}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[8px] bg-[#1c1916] hover:bg-[#24201c] border border-[#d4af6a]/20 text-[#c2b9ac] hover:text-[#f0d9a8] text-xs font-mono transition-colors cursor-pointer"
              title="Baixar arquivo JSON com todas as suas transações para backup pessoal"
            >
              <Download className="w-3.5 h-3.5 text-[#d4af6a]" />
              <span className="hidden sm:inline">Backup JSON</span>
            </button>

            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[8px] bg-[#1c1916] hover:bg-[#24201c] border border-[#3ddc97]/30 text-[#c2b9ac] hover:text-[#3ddc97] text-xs font-mono transition-colors cursor-pointer"
              title="Exportar posições atuais para planilha CSV (compatível com Excel, Numbers e Google Planilhas)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#3ddc97]" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={handleExportPdfReport}
              disabled={isGeneratingPdf || positions.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-gradient-to-r from-[#d4af6a]/20 to-[#d4af6a]/10 hover:from-[#d4af6a]/30 hover:to-[#d4af6a]/20 border border-[#d4af6a]/40 text-[#f0d9a8] hover:text-white text-xs font-mono font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              title="Exportar Relatório Executivo em PDF contendo o resumo atual da carteira, gráficos de alocação e sugestões de rebalanceamento"
            >
              <FileText className="w-3.5 h-3.5 text-[#d4af6a]" />
              <span>{isGeneratingPdf ? 'Gerando Relatório...' : 'Exportar Relatório'}</span>
            </button>

            <button
              onClick={() => handleOpenAlertModal()}
              className={`relative inline-flex items-center gap-1.5 px-3 py-2 rounded-[8px] border text-xs font-mono transition-all cursor-pointer ${
                hasTriggeredAlerts
                  ? 'bg-[#1f190e] border-[#d4af6a] text-[#f0d9a8] shadow-[0_0_12px_rgba(212,175,106,0.25)]'
                  : 'bg-[#1c1916] hover:bg-[#24201c] border-[#d4af6a]/20 text-[#c2b9ac] hover:text-[#f0d9a8]'
              }`}
              title="Gerenciar alertas de preço para os ativos da carteira"
            >
              {hasTriggeredAlerts ? (
                <BellRing className="w-3.5 h-3.5 text-[#3ddc97] animate-bounce" />
              ) : (
                <Bell className="w-3.5 h-3.5 text-[#d4af6a]" />
              )}
              <span>Alertas</span>
              {alerts.length > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    hasTriggeredAlerts
                      ? 'bg-[#3ddc97]/20 text-[#3ddc97] animate-pulse'
                      : 'bg-[#d4af6a]/20 text-[#f0d9a8]'
                  }`}
                >
                  {hasTriggeredAlerts ? `${triggeredAlerts.length}!` : alerts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                document.getElementById('simulador-rebalanceamento')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[8px] bg-[#1c1916] hover:bg-[#24201c] border border-[#d4af6a]/30 text-[#c2b9ac] hover:text-[#f0d9a8] text-xs font-mono transition-colors cursor-pointer"
              title="Ir para o simulador de rebalanceamento da carteira"
            >
              <Scale className="w-3.5 h-3.5 text-[#d4af6a]" />
              <span>Rebalancear</span>
            </button>

            {positions.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-[8px] bg-[#1c1916] hover:bg-red-950/40 border border-red-500/20 text-[#8c8273] hover:text-red-400 text-xs font-mono transition-colors cursor-pointer"
                title="Limpar todas as posições"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Cartões de Resumo Patrimonial (KPIs de Alto Impacto) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          
          {/* Card 1: Patrimônio Atual */}
          <div className="p-5 rounded-[16px] bg-[#141210] border border-[#d4af6a]/20 shadow-md flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#8c8273] uppercase tracking-wider">
                Patrimônio Atual
              </span>
              <div className="w-7 h-7 rounded-full bg-[#d4af6a]/10 flex items-center justify-center text-[#d4af6a]">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#f5efe6] tabular-nums">
                {formatBRL(summary.currentValue)}
              </div>
              <div className="text-xs font-mono text-[#8c8273] mt-1">
                Total Investido: <span className="text-[#c2b9ac]">{formatBRL(summary.totalInvested)}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Rentabilidade Consolidada */}
          <div className="p-5 rounded-[16px] bg-[#141210] border border-[#d4af6a]/20 shadow-md flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#8c8273] uppercase tracking-wider">
                Rentabilidade Total
              </span>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                isProfit ? 'bg-[#3ddc97]/10 text-[#3ddc97]' : 'bg-[#ff5c6c]/10 text-[#ff5c6c]'
              }`}>
                {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              </div>
            </div>

            <div>
              <div className={`text-2xl sm:text-3xl font-serif font-bold tabular-nums ${
                isProfit ? 'text-[#3ddc97]' : 'text-[#ff5c6c]'
              }`}>
                {isProfit ? '+' : ''}{formatPercent(summary.totalGainLossPercent, false)}
              </div>
              <div className={`text-xs font-mono mt-1 ${isProfit ? 'text-[#3ddc97]' : 'text-[#ff5c6c]'}`}>
                {isProfit ? '+' : ''}{formatBRL(summary.totalGainLossBrl)}
              </div>
            </div>
          </div>

          {/* Card 3: Proventos Anuais Estimados */}
          <div className="p-5 rounded-[16px] bg-[#141210] border border-[#d4af6a]/20 shadow-md flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#8c8273] uppercase tracking-wider">
                Proventos Anuais
              </span>
              <div className="w-7 h-7 rounded-full bg-[#d4af6a]/10 flex items-center justify-center text-[#d4af6a]">
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#f0d9a8] tabular-nums">
                {formatBRL(summary.projectedAnnualDividends)}
              </div>
              <div className="text-xs font-mono text-[#8c8273] mt-1">
                Média mensal: <span className="text-[#f5efe6] font-semibold">{formatBRL(summary.projectedMonthlyAverage)}/mês</span>
              </div>
            </div>
          </div>

          {/* Card 4: Dividend Yield Médio */}
          <div className="p-5 rounded-[16px] bg-[#141210] border border-[#d4af6a]/20 shadow-md flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#8c8273] uppercase tracking-wider">
                Yield on Cost
              </span>
              <div className="w-7 h-7 rounded-full bg-[#d4af6a]/10 flex items-center justify-center text-[#d4af6a]">
                <Percent className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#f5efe6] tabular-nums">
                {summary.averageYieldOnCost.toFixed(2)}%
              </div>
              <div className="text-xs font-mono text-[#8c8273] mt-1">
                DY a Mercado: <span className="text-[#c2b9ac]">{summary.currentDividendYield.toFixed(2)}%</span>
              </div>
            </div>
          </div>

        </div>

        {/* 2.5 Meta de Aportes Mensais */}
        <MonthlyContributionGoal
          positions={positions}
          externalGoalAmount={realtimeGoal?.goalAmount}
          externalManualDeposits={realtimeGoal?.manualDeposits}
          className="mb-10"
        />

        {/* 3. Seção Intermediária: Projeção de Dividendos & Alocação por Classe */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Projeção de Dividendos Mensais com Recharts (7 Colunas) */}
          <MonthlyDividendProjectionChart
            positions={positions}
            stocks={stocks}
            cdiRate={cdiAnnualRate}
            className="lg:col-span-7"
          />

          {/* Gráfico de Alocação por Classe de Ativos (Donut Chart com Recharts) */}
          <AssetAllocationDonutChart
            allocationData={summary.allocationByClass}
            positions={positions}
            stocks={stocks}
            cdiRate={cdiAnnualRate}
            selectedCategory={activeViewTab === 'all' ? null : activeViewTab}
            onSelectCategory={(cat) => setActiveViewTab(cat || 'all')}
            className="lg:col-span-5"
          />

        </div>

        {/* 3.5 Simulador de Rebalanceamento Inteligente & Comparativo Visual de Rosca */}
        <div id="simulador-rebalanceamento" className="mb-12 scroll-mt-20">
          <PortfolioRebalanceSimulator
            positions={positions}
            stocks={stocks}
            cdiRate={cdiAnnualRate}
            onExportPdf={handleExportPdfReport}
          />
        </div>

        {/* 4. Tabela Detalhada de Posições da Carteira */}
        <div className="rounded-[18px] bg-[#141210] border border-[#d4af6a]/20 overflow-hidden shadow-xl">
          
          {/* Header da Tabela com Filtros de Abas */}
          <div className="p-4 sm:p-5 border-b border-[#d4af6a]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141210]/95">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#f5efe6]">
                Posições em Carteira
              </h3>
              <p className="text-xs text-[#c2b9ac]">
                Acompanhe o preço médio de compra, cotação atual da B3 e rentabilidade
              </p>
            </div>

            {/* Abas de Filtro da Tabela */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-[#1c1916] rounded-[10px] border border-[#d4af6a]/15 text-xs font-mono">
              {[
                { id: 'all' as const, label: 'Todos' },
                { id: 'acao' as const, label: 'Ações' },
                { id: 'fii' as const, label: 'FIIs' },
                { id: 'renda_fixa' as const, label: 'Renda Fixa' },
                { id: 'cripto' as const, label: 'Cripto' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveViewTab(tab.id)}
                  className={`px-3 py-1.5 rounded-[8px] transition-all cursor-pointer ${
                    activeViewTab === tab.id
                      ? 'bg-[#d4af6a] text-[#0b0a09] font-bold shadow-sm'
                      : 'text-[#a39a8c] hover:text-[#f5efe6]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visualização em Cards de Ativos para Dispositivos Móveis */}
          <div className="block md:hidden divide-y divide-[#d4af6a]/10">
            {filteredPositions.length === 0 ? (
              <div className="py-12 text-center text-[#8c8273] font-mono text-xs p-4">
                Nenhuma posição encontrada nesta categoria.{' '}
                <button
                  onClick={handleOpenAddModal}
                  className="text-[#d4af6a] hover:underline font-bold"
                >
                  Cadastrar primeiro ativo
                </button>
              </div>
            ) : (
              filteredPositions.map((pos) => {
                let currentPrice = pos.averagePrice;
                let annualDividend = 0;

                if (pos.category === 'renda_fixa') {
                  currentPrice = pos.averagePrice * (1 + cdiAnnualRate / 100);
                  annualDividend = pos.averagePrice * (cdiAnnualRate / 100);
                } else if (pos.category === 'fii') {
                  const foundFii = FII_DATASET.find((f) => f.ticker.toUpperCase() === pos.ticker.toUpperCase());
                  if (foundFii) {
                    currentPrice = foundFii.price;
                    annualDividend = foundFii.lastDividend * 12;
                  }
                } else {
                  const live = stocks.find((s) => s.ticker.toUpperCase() === pos.ticker.toUpperCase());
                  const fund = BASE_FUNDAMENTAL_STOCKS.find((fs) => fs.ticker.toUpperCase() === pos.ticker.toUpperCase());
                  if (live && live.price > 0) currentPrice = live.price;
                  else if (fund) currentPrice = fund.price;
                  if (fund && fund.dpa12m > 0) annualDividend = fund.dpa12m;
                }

                const totalCost = pos.quantity * pos.averagePrice;
                const currentValue = pos.quantity * currentPrice;
                const gainLossBrl = currentValue - totalCost;
                const gainLossPercent = totalCost > 0 ? (gainLossBrl / totalCost) * 100 : 0;
                const isRowProfit = gainLossBrl >= 0;
                const projectedDividend = pos.quantity * annualDividend;
                const yoc = totalCost > 0 ? (projectedDividend / totalCost) * 100 : 0;

                const assetAlerts = getAlertsForTicker(pos.ticker);
                const isAssetTriggered = assetAlerts.some((a) => a.isTriggered && !a.dismissed);

                return (
                  <div
                    key={`card-${pos.id}`}
                    className="p-4 bg-[#141210] hover:bg-[#181512] transition-colors space-y-3 font-mono"
                  >
                    {/* Topo do Card com Logo, Ticker e Botão de IA */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <AssetLogo ticker={pos.ticker} name={pos.name} size="sm" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#f0d9a8]">{pos.ticker}</span>
                            {isAssetTriggered && (
                              <span className="text-[10px] text-[#3ddc97] bg-[#3ddc97]/20 border border-[#3ddc97]/40 px-1.5 py-0.5 rounded font-bold">
                                Alvo
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#8c8273] font-sans block truncate max-w-[150px]">
                            {getFriendlyCompanyName(pos.name, pos.ticker)}
                          </span>
                        </div>
                      </div>

                      {/* Ícone de IA no card de ativos */}
                      <button
                        onClick={() => handleOpenAiAnalysis(pos, currentPrice, annualDividend)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] bg-[#d4af6a]/20 hover:bg-[#d4af6a]/30 border border-[#d4af6a]/40 text-[#f0d9a8] text-xs font-bold transition-all shadow-sm cursor-pointer"
                        title="Ver análise automatizada por IA Gemini deste ativo"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#d4af6a]" />
                        <span>Análise IA</span>
                      </button>
                    </div>

                    {/* Métricas do Card */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#1c1916] p-2.5 rounded-[10px] border border-[#d4af6a]/15">
                      <div>
                        <span className="text-[10px] text-[#8c8273] block uppercase">Preço Atual B3</span>
                        <span className="font-bold text-[#f5efe6]">{formatBRL(currentPrice)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8c8273] block uppercase">Preço Médio</span>
                        <span className="text-[#c2b9ac]">{formatBRL(pos.averagePrice)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8c8273] block uppercase">Saldo Total</span>
                        <span className="font-bold text-[#f0d9a8]">{formatBRL(currentValue)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8c8273] block uppercase">Rentabilidade</span>
                        <span className={`font-bold ${isRowProfit ? 'text-[#3ddc97]' : 'text-[#ff5c6c]'}`}>
                          {isRowProfit ? '▲ +' : '▼ '}{formatPercent(gainLossPercent, false)}
                        </span>
                      </div>
                    </div>

                    {/* Rodapé do Card */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-[#8c8273]">
                        {pos.quantity} cotas • {yoc > 0 ? `YoC: ${yoc.toFixed(2)}%` : 'Renda Fixa'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenAlertModal(pos.ticker)}
                          className="p-1.5 rounded-[6px] bg-[#1c1916] hover:bg-[#24201c] text-[#8c8273] hover:text-[#d4af6a] transition-colors cursor-pointer"
                          title="Alertas de Preço"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(pos)}
                          className="p-1.5 rounded-[6px] bg-[#1c1916] hover:bg-[#24201c] text-[#c2b9ac] hover:text-[#f0d9a8] transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePosition(pos.id, pos.ticker)}
                          className="p-1.5 rounded-[6px] bg-[#1c1916] hover:bg-red-950/40 text-[#c2b9ac] hover:text-red-400 transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Table Container (Desktop / Tablets) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#1c1916] border-b border-[#d4af6a]/15 text-[#8c8273] uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 font-bold">Ativo</th>
                  <th className="py-3.5 px-3 text-right font-bold">Quantidade</th>
                  <th className="py-3.5 px-3 text-right font-bold">Preço Médio</th>
                  <th className="py-3.5 px-3 text-right font-bold">Preço Atual B3</th>
                  <th className="py-3.5 px-3 text-right font-bold">Saldo Atual</th>
                  <th className="py-3.5 px-3 text-right font-bold">Rentabilidade</th>
                  <th className="py-3.5 px-3 text-right font-bold">Provento Anual</th>
                  <th className="py-3.5 px-3 text-right font-bold">Yield on Cost</th>
                  <th className="py-3.5 px-4 text-center font-bold">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#d4af6a]/10">
                {filteredPositions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#8c8273]">
                      Nenhuma posição encontrada nesta categoria.{' '}
                      <button
                        onClick={handleOpenAddModal}
                        className="text-[#d4af6a] hover:underline font-bold"
                      >
                        Cadastrar primeiro ativo
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredPositions.map((pos) => {
                    // Cálculo da linha individual com base nas cotações ao vivo
                    let currentPrice = pos.averagePrice;
                    let annualDividend = 0;

                    if (pos.category === 'renda_fixa') {
                      currentPrice = pos.averagePrice * (1 + cdiAnnualRate / 100);
                      annualDividend = pos.averagePrice * (cdiAnnualRate / 100);
                    } else if (pos.category === 'fii') {
                      const foundFii = FII_DATASET.find((f) => f.ticker.toUpperCase() === pos.ticker.toUpperCase());
                      if (foundFii) {
                        currentPrice = foundFii.price;
                        annualDividend = foundFii.lastDividend * 12;
                      }
                    } else {
                      const live = stocks.find((s) => s.ticker.toUpperCase() === pos.ticker.toUpperCase());
                      const fund = BASE_FUNDAMENTAL_STOCKS.find((fs) => fs.ticker.toUpperCase() === pos.ticker.toUpperCase());
                      if (live && live.price > 0) currentPrice = live.price;
                      else if (fund) currentPrice = fund.price;
                      if (fund && fund.dpa12m > 0) annualDividend = fund.dpa12m;
                    }

                    const totalCost = pos.quantity * pos.averagePrice;
                    const currentValue = pos.quantity * currentPrice;
                    const gainLossBrl = currentValue - totalCost;
                    const gainLossPercent = totalCost > 0 ? (gainLossBrl / totalCost) * 100 : 0;
                    const isRowProfit = gainLossBrl >= 0;
                    const projectedDividend = pos.quantity * annualDividend;
                    const yoc = totalCost > 0 ? (projectedDividend / totalCost) * 100 : 0;

                    // Alertas deste ativo
                    const assetAlerts = getAlertsForTicker(pos.ticker);
                    const isAssetTriggered = assetAlerts.some((a) => a.isTriggered && !a.dismissed);
                    const hasActiveAlert = assetAlerts.some((a) => a.active && !a.isTriggered);

                    return (
                      <tr
                        key={pos.id}
                        className={`transition-colors group ${
                          isAssetTriggered
                            ? 'bg-[#1f190e]/60 hover:bg-[#1f190e]/90'
                            : 'hover:bg-[#1c1916]/80'
                        }`}
                      >
                        {/* Ativo (Logo + Ticker + Nome + Ícone IA) */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <AssetLogo ticker={pos.ticker} name={pos.name} size="sm" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#f0d9a8] group-hover:underline">
                                  {pos.ticker}
                                </span>

                                {/* Ícone de IA no card/linha do ativo */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenAiAnalysis(pos, currentPrice, annualDividend);
                                  }}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-[#d4af6a]/15 hover:bg-[#d4af6a]/30 border border-[#d4af6a]/30 text-[#f0d9a8] text-[10px] font-mono font-bold transition-all cursor-pointer shadow-xs group/ai"
                                  title="Ver análise automatizada por IA Gemini deste ativo"
                                >
                                  <Sparkles className="w-2.5 h-2.5 text-[#d4af6a] group-hover/ai:rotate-12 transition-transform" />
                                  <span>IA</span>
                                </button>

                                {isAssetTriggered && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenAlertModal(pos.ticker);
                                    }}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-[#3ddc97]/20 border border-[#3ddc97]/40 text-[#3ddc97] text-[10px] font-mono font-bold animate-pulse cursor-pointer hover:bg-[#3ddc97]/30 transition-colors"
                                    title="Alvo de preço atingido! Clique para ver alerta"
                                  >
                                    <BellRing className="w-2.5 h-2.5" />
                                    <span>Alvo Atingido</span>
                                  </button>
                                )}
                              </div>
                              <div className="text-[11px] text-[#8c8273] font-sans truncate max-w-[140px]">
                                {getFriendlyCompanyName(pos.name, pos.ticker)}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Quantidade */}
                        <td className="py-3 px-3 text-right tabular-nums text-[#f5efe6]">
                          {pos.quantity}
                        </td>

                        {/* Preço Médio */}
                        <td className="py-3 px-3 text-right tabular-nums text-[#c2b9ac]">
                          {formatBRL(pos.averagePrice)}
                        </td>

                        {/* Preço Atual B3 */}
                        <td className="py-3 px-3 text-right tabular-nums text-[#f5efe6] font-semibold">
                          <div className="flex items-center justify-end gap-1.5">
                            <span>{formatBRL(currentPrice)}</span>
                            {isAssetTriggered ? (
                              <span
                                className="w-2 h-2 rounded-full bg-[#3ddc97] animate-ping"
                                title="Cotação atingiu o preço alvo configurado!"
                              />
                            ) : hasActiveAlert ? (
                              <span
                                className="text-[10px] font-mono text-[#d4af6a]"
                                title={`Alerta ativo: ${assetAlerts
                                  .filter((a) => a.active)
                                  .map((a) => `${a.condition === 'ABOVE_OR_EQUAL' ? '≥' : '≤'} ${formatBRL(a.targetPrice)}`)
                                  .join(', ')}`}
                              >
                                <Bell className="w-2.5 h-2.5 inline" />
                              </span>
                            ) : null}
                          </div>
                        </td>

                        {/* Saldo Atual */}
                        <td className="py-3 px-3 text-right tabular-nums text-[#f5efe6] font-bold">
                          {formatBRL(currentValue)}
                        </td>

                        {/* Rentabilidade */}
                        <td className="py-3 px-3 text-right tabular-nums font-bold">
                          <span className={isRowProfit ? 'text-[#3ddc97]' : 'text-[#ff5c6c]'}>
                            {isRowProfit ? '▲ +' : '▼ '}{formatPercent(gainLossPercent, false)}
                          </span>
                          <div className={`text-[10px] ${isRowProfit ? 'text-[#3ddc97]/80' : 'text-[#ff5c6c]/80'}`}>
                            {isRowProfit ? '+' : ''}{formatBRL(gainLossBrl)}
                          </div>
                        </td>

                        {/* Provento Anual Projetado */}
                        <td className="py-3 px-3 text-right tabular-nums text-[#f0d9a8] font-semibold">
                          {projectedDividend > 0 ? formatBRL(projectedDividend) : '—'}
                        </td>

                        {/* Yield on Cost */}
                        <td className="py-3 px-3 text-right tabular-nums font-semibold">
                          <span className="text-[#d4af6a]">
                            {yoc > 0 ? `${yoc.toFixed(2)}%` : '—'}
                          </span>
                        </td>

                        {/* Botões de Ação */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Botão de Análise IA Gemini */}
                            <button
                              onClick={() => handleOpenAiAnalysis(pos, currentPrice, annualDividend)}
                              className="p-1.5 rounded-[6px] bg-[#d4af6a]/15 hover:bg-[#d4af6a]/30 border border-[#d4af6a]/30 text-[#f0d9a8] hover:text-white transition-all cursor-pointer"
                              title="Análise com IA Gemini sobre o desempenho recente deste ativo"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-[#d4af6a]" />
                            </button>
                            <button
                              onClick={() => handleOpenAlertModal(pos.ticker)}
                              className={`p-1.5 rounded-[6px] transition-colors cursor-pointer ${
                                isAssetTriggered
                                  ? 'bg-[#3ddc97]/20 text-[#3ddc97] hover:bg-[#3ddc97]/30 ring-1 ring-[#3ddc97]/40 animate-pulse'
                                  : hasActiveAlert
                                  ? 'bg-[#d4af6a]/15 text-[#f0d9a8] hover:bg-[#d4af6a]/25'
                                  : 'bg-[#1c1916] hover:bg-[#24201c] text-[#8c8273] hover:text-[#d4af6a]'
                              }`}
                              title={
                                isAssetTriggered
                                  ? 'Alerta atingido! Clique para ver detalhes'
                                  : hasActiveAlert
                                  ? `Alerta ativo (${assetAlerts.length} configurado)`
                                  : 'Definir alerta de preço para este ativo'
                              }
                            >
                              {isAssetTriggered ? (
                                <BellRing className="w-3.5 h-3.5" />
                              ) : (
                                <Bell className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(pos)}
                              className="p-1.5 rounded-[6px] bg-[#1c1916] hover:bg-[#24201c] text-[#c2b9ac] hover:text-[#f0d9a8] transition-colors cursor-pointer"
                              title="Editar quantidade ou preço médio"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePosition(pos.id, pos.ticker)}
                              className="p-1.5 rounded-[6px] bg-[#1c1916] hover:bg-red-950/40 text-[#c2b9ac] hover:text-red-400 transition-colors cursor-pointer"
                              title="Excluir posição"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer da Tabela com Resumo de Totais */}
          <div className="p-4 bg-[#1c1916] border-t border-[#d4af6a]/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
            <span className="text-[#8c8273]">
              Dados atualizados com cotações da B3. Armazenamento 100% privado no seu navegador.
            </span>
            <div className="flex items-center gap-4 text-sm font-bold">
              <span>Total: <strong className="text-[#f5efe6]">{formatBRL(summary.currentValue)}</strong></span>
              <span>Proventos: <strong className="text-[#f0d9a8]">{formatBRL(summary.projectedAnnualDividends)}/ano</strong></span>
            </div>
          </div>

        </div>

      </div>

      {/* Modal de Inclusão/Edição */}
      <AddPositionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePosition}
        editingPosition={editingPos}
      />

      {/* Modal de Alertas de Preço */}
      <PriceAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        positions={positions}
        currentPrices={currentPricesMap}
        preselectedTicker={alertModalTicker}
        alerts={alerts}
        onCreateAlert={createAlert}
        onDeleteAlert={deleteAlert}
        onToggleActive={toggleActive}
        onReactivateAlert={reactivateAlert}
        onDismissTrigger={dismissTrigger}
        onPlayTestChime={playTestChime}
        onRequestNotificationPermission={requestNotificationPermission}
      />

      {/* Modal de Análise de Desempenho com IA Gemini */}
      <AssetAiAnalysisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        position={aiSelectedPosition}
        currentPrice={aiSelectedPrice}
        annualDividend={aiSelectedAnnualDividend}
      />
    </div>
  );
};
