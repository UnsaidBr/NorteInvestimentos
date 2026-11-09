import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { APP_NAME } from '../constants/config';
import { useMarket } from '../context/MarketContext';
import { usePortfolio } from '../hooks/usePortfolio';
import { calculatePortfolioSummary } from '../services/portfolioService';
import { PortfolioPosition } from '../types/portfolio';
import { AddPositionModal } from '../components/AddPositionModal';
import { AssetLogo } from '../components/AssetLogo';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { formatBRL, formatPercent, getFriendlyCompanyName } from '../utils/formatters';
import { FII_DATASET } from '../data/fiiData';
import { BASE_FUNDAMENTAL_STOCKS } from '../data/fundamentalData';
import { MonthlyDividendProjectionChart } from '../components/MonthlyDividendProjectionChart';
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
  const [activeViewTab, setActiveViewTab] = useState<'all' | 'acao' | 'fii' | 'renda_fixa'>('all');

  // Cálculo analítico consolidado
  const cdiAnnualRate = macro.cdi.rateAnnual || 13.65;
  const summary = useMemo(() => {
    return calculatePortfolioSummary(positions, stocks, cdiAnnualRate);
  }, [positions, stocks, cdiAnnualRate]);

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
    } else {
      addPosition(data);
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        
        {/* Barra de Ações Rápidas da Carteira */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[14px] bg-[#141210] border border-[#d4af6a]/20 mb-8 shadow-lg">
          <div className="flex items-center gap-3">
            <DataSourceBadge isDemoMode={isDemoMode} lastUpdated={lastUpdated} />
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
              onClick={resetToDemo}
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

            {positions.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja limpar todas as posições da carteira?')) {
                    clearAll();
                  }
                }}
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

        {/* 3. Seção Intermediária: Projeção de Dividendos & Alocação por Classe */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Projeção de Dividendos Mensais com Recharts (7 Colunas) */}
          <MonthlyDividendProjectionChart
            positions={positions}
            stocks={stocks}
            cdiRate={cdiAnnualRate}
            className="lg:col-span-7"
          />

          {/* Gráfico de Alocação por Classe de Ativos (5 Colunas) */}
          <div className="lg:col-span-5 rounded-[18px] bg-[#141210] border border-[#d4af6a]/20 p-6 sm:p-7 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#d4af6a]/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-[8px] bg-[#1c1916] border border-[#d4af6a]/20 flex items-center justify-center text-[#d4af6a]">
                    <PieChart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#f5efe6]">
                      Alocação por Classe
                    </h3>
                    <p className="text-xs text-[#c2b9ac]">
                      Divisão patrimonial entre ações, FIIs e renda fixa
                    </p>
                  </div>
                </div>
              </div>

              {/* Donut Visual Simplificado em Barras Proporcionais */}
              <div className="space-y-4 pt-2">
                {summary.allocationByClass.map((item) => (
                  <div key={item.category} className="space-y-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-semibold text-[#f5efe6]">{item.label}</span>
                        <span className="text-[10px] text-[#8c8273]">({item.count} ativos)</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#f5efe6] font-bold">{formatBRL(item.totalValue)}</span>
                        <span className="text-[#8c8273] ml-2">({item.percent.toFixed(1)}%)</span>
                      </div>
                    </div>

                    <div className="h-2 w-full bg-[#1c1916] rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${item.percent}%`,
                          backgroundColor: item.color,
                        }}
                        className="h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#d4af6a]/10 flex items-center justify-between text-xs text-[#8c8273] font-mono">
              <span>{summary.allocationByClass.length} classes de investimento</span>
              <span className="text-[#d4af6a]">Diversificação saudável</span>
            </div>
          </div>

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
            <div className="flex items-center gap-1 p-1 bg-[#1c1916] rounded-[10px] border border-[#d4af6a]/15 text-xs font-mono">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'acao', label: 'Ações' },
                { id: 'fii', label: 'FIIs' },
                { id: 'renda_fixa', label: 'Renda Fixa' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveViewTab(tab.id as any)}
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

          {/* Table Container */}
          <div className="overflow-x-auto">
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

                    return (
                      <tr
                        key={pos.id}
                        className="hover:bg-[#1c1916]/80 transition-colors group"
                      >
                        {/* Ativo (Logo + Ticker + Nome) */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <AssetLogo ticker={pos.ticker} name={pos.name} size="sm" />
                            <div>
                              <div className="font-bold text-[#f0d9a8] group-hover:underline">
                                {pos.ticker}
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
                          {formatBRL(currentPrice)}
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
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEditModal(pos)}
                              className="p-1.5 rounded-[6px] bg-[#1c1916] hover:bg-[#24201c] text-[#c2b9ac] hover:text-[#f0d9a8] transition-colors cursor-pointer"
                              title="Editar quantidade ou preço médio"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Remover ${pos.ticker} da sua carteira?`)) {
                                  deletePosition(pos.id);
                                }
                              }}
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
    </div>
  );
};
