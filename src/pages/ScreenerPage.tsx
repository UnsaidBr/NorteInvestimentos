import React, { useState, useMemo, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { StaticReferenceNotice } from '../components/StaticReferenceNotice';
import { APP_NAME } from '../constants/config';
import { FundamentalStock, ScreenerFilterState } from '../types/fundamental';
import { getScreenerStocks } from '../services/fundamentalService';
import { FundamentalModal } from '../components/FundamentalModal';
import { AssetLogo } from '../components/AssetLogo';
import { formatBRL, formatPercent } from '../utils/formatters';
import {
  SlidersHorizontal,
  Search,
  Sparkles,
  Calculator,
  ArrowUpDown,
  TrendingUp,
  Percent,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  X,
  Info,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type SortColumn =
  | 'ticker'
  | 'price'
  | 'changePercent'
  | 'pl'
  | 'pvp'
  | 'dy'
  | 'roe'
  | 'margemLiquida'
  | 'grahamMargin'
  | 'bazinDiscount'
  | 'scoreSaude';

export const ScreenerPage: React.FC = () => {
  usePageMeta(
    `Rastreador de Ações & Fórmulas Clássicas | ${APP_NAME}`,
    'Filtre e ranqueie ações da B3 através das fórmulas de Graham, Décio Bazin e Greenblatt. Screener fundamentalista com premissas transparentes e múltiplos contábeis.'
  );

  const [filters, setFilters] = useState<ScreenerFilterState>({
    preset: 'graham',
    sector: 'TODOS',
    minPrice: 0,
    maxPrice: 1000,
    minPl: 0,
    maxPl: 100,
    minPvp: 0,
    maxPvp: 20,
    minDy: 0,
    maxDy: 50,
    minRoe: 0,
    minMargem: 0,
    minVolume: 1000000, // R$ 1 milhão
    bazinYieldReq: 6.0,
    grahamMultiplier: 22.5,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortColumn>('grahamMargin');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedStock, setSelectedStock] = useState<FundamentalStock | null>(null);

  const [stocksList, setStocksList] = useState<FundamentalStock[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados quando filtros mudarem
  useEffect(() => {
    setLoading(true);
    getScreenerStocks(filters).then(({ stocks }) => {
      setStocksList(stocks);
      setLoading(false);
    });
  }, [filters]);

  // Filtragem por busca e ordenação
  const processedStocks = useMemo(() => {
    let result = [...stocksList];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.ticker.toLowerCase().includes(q) ||
          s.friendlyName.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let valA: any = a[sortColumn];
      let valB: any = b[sortColumn];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      valA = Number(valA || 0);
      valB = Number(valB || 0);
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [stocksList, searchQuery, sortColumn, sortDirection]);

  // Médias do conjunto filtrado
  const stats = useMemo(() => {
    const total = processedStocks.length;
    if (total === 0) return { avgPl: 0, avgPvp: 0, avgDy: 0, avgRoe: 0 };
    return {
      avgPl: parseFloat((processedStocks.reduce((acc, s) => acc + s.pl, 0) / total).toFixed(1)),
      avgPvp: parseFloat((processedStocks.reduce((acc, s) => acc + s.pvp, 0) / total).toFixed(2)),
      avgDy: parseFloat((processedStocks.reduce((acc, s) => acc + s.dy, 0) / total).toFixed(1)),
      avgRoe: parseFloat((processedStocks.reduce((acc, s) => acc + s.roe, 0) / total).toFixed(1)),
    };
  }, [processedStocks]);

  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDirection('desc');
    }
  };

  const handlePresetSelect = (preset: ScreenerFilterState['preset']) => {
    setFilters((prev) => ({ ...prev, preset }));
    if (preset === 'graham') setSortColumn('grahamMargin');
    else if (preset === 'bazin') setSortColumn('bazinDiscount');
    else if (preset === 'greenblatt') setSortColumn('scoreSaude');
    else if (preset === 'dividendos') setSortColumn('dy');
  };

  return (
    <div>
      <PageHeader
        badge="Análise Fundamentalista Avançada"
        badgeColor="gold"
        title="Rastreador de"
        titleHighlight="Ações & Fórmulas"
        subtitle="Triagem de empresas da B3 com múltiplos contábeis e rankings de Benjamin Graham, Décio Bazin e Joel Greenblatt."
        breadcrumbs={[{ label: 'Rastreador Fundamentalista' }]}
      >
        <Link
          to="/fiis"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#141210] hover:bg-[#1c1916] border border-[#d4af6a]/25 text-xs font-mono font-medium text-[#f0d9a8] transition-all cursor-pointer shadow-sm"
        >
          <span>Ir para Painel de FIIs →</span>
        </Link>
      </PageHeader>
      <StaticReferenceNotice what="O Rastreador (incluindo as fórmulas de Graham, Bazin e Greenblatt)" />

      <div className="py-12 sm:py-16 bg-[#0b0a09]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Presets Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-[#8c8273] font-bold">
                Estratégias Consagradas (Rankings Automáticos)
              </span>
              <button
                type="button"
                onClick={() => setShowAdvancedFilters((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#f0d9a8] hover:underline cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{showAdvancedFilters ? 'Ocultar Filtros Detalhados' : 'Personalizar Filtros Livres'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { id: 'graham', label: 'Benjamin Graham', desc: 'Preço Justo & Margem' },
                { id: 'bazin', label: 'Décio Bazin', desc: 'Preço Teto Dividendos' },
                { id: 'greenblatt', label: 'Fórmula Mágica', desc: 'Maior ROE + Menor P/L' },
                { id: 'dividendos', label: 'Dividendos Reais', desc: 'DY > 6% & Lucro Sólido' },
                { id: 'todos', label: 'Todos os Ativos', desc: 'Visão Geral da B3' },
              ].map((p) => {
                const isSelected = filters.preset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handlePresetSelect(p.id as any)}
                    className={`p-4 rounded-[12px] border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1c1916] border-[#d4af6a] shadow-[0_0_15px_rgba(212,175,106,0.15)]'
                        : 'bg-[#141210] hover:bg-[#181614] border-[#d4af6a]/15 text-[#c2b9ac]'
                    }`}
                  >
                    <div className="font-serif font-bold text-sm text-[#f5efe6]">{p.label}</div>
                    <div className="text-[11px] font-mono text-[#8c8273] mt-1">{p.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Premise Customizer Bar (Graham multiplier and Bazin Yield %) */}
          <div className="p-4 rounded-[12px] bg-[#141210] border border-[#d4af6a]/20 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 text-[#f0d9a8]">
              <Calculator className="w-4 h-4 text-[#d4af6a]" />
              <span className="font-bold uppercase tracking-wider">Premissas Visíveis da Metodologia:</span>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[#8c8273]">Multiplicador de Graham:</span>
                <input
                  type="number"
                  step="0.5"
                  min="15"
                  max="30"
                  value={filters.grahamMultiplier}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, grahamMultiplier: parseFloat(e.target.value) || 22.5 }))
                  }
                  className="w-16 px-2 py-1 rounded bg-[#1c1916] border border-[#d4af6a]/30 text-[#f5efe6] text-center focus:outline-none focus:border-[#d4af6a]"
                />
                <span className="text-[11px] text-[#8c8273]">(padrão 22.5)</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#8c8273]">Yield Mínimo Bazin:</span>
                <input
                  type="number"
                  step="0.5"
                  min="4"
                  max="12"
                  value={filters.bazinYieldReq}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, bazinYieldReq: parseFloat(e.target.value) || 6.0 }))
                  }
                  className="w-16 px-2 py-1 rounded bg-[#1c1916] border border-[#d4af6a]/30 text-[#f5efe6] text-center focus:outline-none focus:border-[#d4af6a]"
                />
                <span className="text-[11px] text-[#8c8273]">% a.a. (padrão 6.0%)</span>
              </div>
            </div>
          </div>

          {/* Advanced Sliders Filter Drawer */}
          {showAdvancedFilters && (
            <div className="p-6 rounded-[16px] bg-[#141210] border border-[#d4af6a]/25 space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#d4af6a]/15 pb-3">
                <h3 className="font-mono text-xs font-bold uppercase text-[#f5efe6] tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#d4af6a]" />
                  <span>Filtros Fundamentalistas Multiparâmetros</span>
                </h3>
                <button
                  onClick={() =>
                    setFilters({
                      preset: 'todos',
                      sector: 'TODOS',
                      minPrice: 0,
                      maxPrice: 1000,
                      minPl: 0,
                      maxPl: 100,
                      minPvp: 0,
                      maxPvp: 20,
                      minDy: 0,
                      maxDy: 50,
                      minRoe: 0,
                      minMargem: 0,
                      minVolume: 500000,
                      bazinYieldReq: 6.0,
                      grahamMultiplier: 22.5,
                    })
                  }
                  className="text-xs font-mono text-[#f0d9a8] hover:underline cursor-pointer"
                >
                  Restaurar padrões
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs font-mono">
                {/* P/L Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[#8c8273]">
                    <span>P/L Máximo:</span>
                    <span className="text-[#f5efe6] font-bold">{filters.maxPl}x</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={filters.maxPl}
                    onChange={(e) => setFilters((p) => ({ ...p, maxPl: Number(e.target.value) }))}
                    className="w-full accent-[#d4af6a]"
                  />
                </div>

                {/* P/VP Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[#8c8273]">
                    <span>P/VP Máximo:</span>
                    <span className="text-[#f5efe6] font-bold">{filters.maxPvp}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={filters.maxPvp}
                    onChange={(e) => setFilters((p) => ({ ...p, maxPvp: Number(e.target.value) }))}
                    className="w-full accent-[#d4af6a]"
                  />
                </div>

                {/* Min DY Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[#8c8273]">
                    <span>DY 12m Mínimo:</span>
                    <span className="text-[#3ddc97] font-bold">{filters.minDy}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="0.5"
                    value={filters.minDy}
                    onChange={(e) => setFilters((p) => ({ ...p, minDy: Number(e.target.value) }))}
                    className="w-full accent-[#d4af6a]"
                  />
                </div>

                {/* Min ROE Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[#8c8273]">
                    <span>ROE Mínimo:</span>
                    <span className="text-[#f0d9a8] font-bold">{filters.minRoe}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={filters.minRoe}
                    onChange={(e) => setFilters((p) => ({ ...p, minRoe: Number(e.target.value) }))}
                    className="w-full accent-[#d4af6a]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Search and KPI Summary Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-[#d4af6a] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por código ou nome (ex: PETR4, Vale, Banco do Brasil)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-[10px] bg-[#141210] border border-[#d4af6a]/20 text-xs text-[#f5efe6] placeholder-[#8c8273] focus:outline-none focus:border-[#d4af6a] transition-all"
              />
            </div>

            {/* Quick KPI stats */}
            <div className="flex items-center gap-4 text-xs font-mono text-[#8c8273] overflow-x-auto w-full sm:w-auto">
              <div>
                Empresas: <strong className="text-[#f5efe6]">{processedStocks.length}</strong>
              </div>
              <div aria-hidden="true">·</div>
              <div>
                P/L médio: <strong className="text-[#f5efe6]">{stats.avgPl}x</strong>
              </div>
              <div aria-hidden="true">·</div>
              <div>
                DY médio: <strong className="text-[#3ddc97]">{stats.avgDy}%</strong>
              </div>
              <div aria-hidden="true">·</div>
              <div>
                ROE médio: <strong className="text-[#f0d9a8]">{stats.avgRoe}%</strong>
              </div>
            </div>
          </div>

          {/* High Density Table */}
          <div className="rounded-[16px] bg-[#141210] border border-[#d4af6a]/20 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-[#1c1916] border-b border-[#d4af6a]/15 text-[#8c8273] uppercase tracking-wider text-[11px]">
                    <th
                      onClick={() => handleSort('ticker')}
                      className="py-3.5 px-4 font-bold cursor-pointer hover:text-[#f0d9a8]"
                    >
                      <div className="flex items-center gap-1">
                        <span>Ativo</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('price')}
                      className="py-3.5 px-3 text-right font-bold cursor-pointer hover:text-[#f0d9a8]"
                    >
                      Preço
                    </th>
                    <th
                      onClick={() => handleSort('pl')}
                      className="py-3.5 px-3 text-right font-bold cursor-pointer hover:text-[#f0d9a8]"
                    >
                      P/L
                    </th>
                    <th
                      onClick={() => handleSort('pvp')}
                      className="py-3.5 px-3 text-right font-bold cursor-pointer hover:text-[#f0d9a8]"
                    >
                      P/VP
                    </th>
                    <th
                      onClick={() => handleSort('dy')}
                      className="py-3.5 px-3 text-right font-bold cursor-pointer hover:text-[#f0d9a8]"
                    >
                      DY 12m
                    </th>
                    <th
                      onClick={() => handleSort('roe')}
                      className="py-3.5 px-3 text-right font-bold cursor-pointer hover:text-[#f0d9a8]"
                    >
                      ROE
                    </th>
                    <th
                      onClick={() => handleSort('margemLiquida')}
                      className="py-3.5 px-3 text-right font-bold cursor-pointer hover:text-[#f0d9a8]"
                    >
                      Marg. Líq
                    </th>
                    <th
                      onClick={() => handleSort('grahamMargin')}
                      className="py-3.5 px-3 text-right font-bold cursor-pointer hover:text-[#f0d9a8] bg-[#d4af6a]/5"
                    >
                      Graham (Margem)
                    </th>
                    <th
                      onClick={() => handleSort('bazinDiscount')}
                      className="py-3.5 px-3 text-right font-bold cursor-pointer hover:text-[#f0d9a8] bg-[#d4af6a]/5"
                    >
                      Bazin (Teto 6%)
                    </th>
                    <th
                      onClick={() => handleSort('scoreSaude')}
                      className="py-3.5 px-3 text-center font-bold cursor-pointer hover:text-[#f0d9a8]"
                    >
                      Score
                    </th>
                    <th className="py-3.5 px-4 text-center font-bold">Memorial</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#d4af6a]/10">
                  {loading ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-[#8c8273]">
                        Carregando balanços e cálculos fundamentalistas...
                      </td>
                    </tr>
                  ) : processedStocks.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-[#8c8273]">
                        Nenhuma ação corresponde aos filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    processedStocks.map((stock) => {
                      const isGrahamPos = stock.grahamMargin > 0;
                      const isBazinPos = stock.bazinDiscount > 0;

                      return (
                        <tr
                          key={stock.ticker}
                          onClick={() => setSelectedStock(stock)}
                          className="hover:bg-[#1c1916]/80 transition-colors cursor-pointer group"
                        >
                          {/* Ativo */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <AssetLogo ticker={stock.ticker} name={stock.name} size="sm" />
                              <div className="min-w-0">
                                <div className="font-bold text-[#f0d9a8] group-hover:underline">
                                  {stock.ticker}
                                </div>
                                <div className="text-[11px] text-[#8c8273] font-sans truncate max-w-[120px]">
                                  {stock.friendlyName}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Preço */}
                          <td className="py-3 px-3 text-right tabular-nums text-[#f5efe6] font-semibold">
                            {formatBRL(stock.price)}
                          </td>

                          {/* P/L */}
                          <td className="py-3 px-3 text-right tabular-nums text-[#c2b9ac]">
                            {stock.pl}x
                          </td>

                          {/* P/VP */}
                          <td className="py-3 px-3 text-right tabular-nums text-[#c2b9ac]">
                            {stock.pvp}x
                          </td>

                          {/* DY */}
                          <td className="py-3 px-3 text-right tabular-nums text-[#3ddc97] font-semibold">
                            {stock.dy}%
                          </td>

                          {/* ROE */}
                          <td className="py-3 px-3 text-right tabular-nums text-[#f0d9a8]">
                            {stock.roe}%
                          </td>

                          {/* Margem */}
                          <td className="py-3 px-3 text-right tabular-nums text-[#c2b9ac]">
                            {stock.margemLiquida}%
                          </td>

                          {/* Graham */}
                          <td className="py-3 px-3 text-right tabular-nums bg-[#d4af6a]/5">
                            <div className="font-bold">
                              {stock.grahamPrice > 0 ? formatBRL(stock.grahamPrice) : 'n/d'}
                            </div>
                            <div className={`text-[10px] ${isGrahamPos ? 'text-[#3ddc97]' : 'text-[#e25c5c]'}`}>
                              {stock.grahamPrice > 0 ? (isGrahamPos ? `+${stock.grahamMargin}%` : `${stock.grahamMargin}%`) : ''}
                            </div>
                          </td>

                          {/* Bazin */}
                          <td className="py-3 px-3 text-right tabular-nums bg-[#d4af6a]/5">
                            <div className="font-bold">
                              {stock.bazinPrice > 0 ? formatBRL(stock.bazinPrice) : 'n/d'}
                            </div>
                            <div className={`text-[10px] ${isBazinPos ? 'text-[#3ddc97]' : 'text-[#e25c5c]'}`}>
                              {stock.bazinPrice > 0 ? (isBazinPos ? `+${stock.bazinDiscount}%` : `${stock.bazinDiscount}%`) : ''}
                            </div>
                          </td>

                          {/* Score */}
                          <td className="py-3 px-3 text-center tabular-nums">
                            <span className="px-2 py-0.5 rounded bg-[#1c1916] text-[#f0d9a8] border border-[#d4af6a]/20 font-bold text-xs">
                              {stock.scoreSaude}
                            </span>
                          </td>

                          {/* Ação */}
                          <td className="py-3 px-4 text-center">
                            <span className="text-[11px] font-mono text-[#d4af6a] group-hover:underline">
                              Ver fórmula →
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Explanation Footer Card */}
          <div className="p-6 rounded-[14px] bg-[#141210] border border-[#d4af6a]/20 space-y-3 text-xs leading-relaxed text-[#c2b9ac]">
            <div className="flex items-center gap-2 font-mono font-bold uppercase text-[#f0d9a8]">
              <Info className="w-4 h-4 text-[#d4af6a]" />
              <span>Como Interpretar as Fórmulas Clássicas</span>
            </div>
            <p>
              <strong>Fórmula de Graham:</strong> Estipula o Preço Justo de uma ação com base no produto entre o lucro por ação (LPA) e o valor patrimonial por ação (VPA), considerando um múltiplo equilibrado de 22,5. Margens de segurança positivas indicam que a ação negocia abaixo do seu valor intrínseco teórico.
            </p>
            <p>
              <strong>Método de Décio Bazin:</strong> Determina o Preço Teto dividindo o dividendo por ação anual por 6% (ou taxa configurada). Se a cotação estiver abaixo do Preço Teto, a empresa oferece remuneração em proventos superior à taxa exigida.
            </p>
          </div>

        </div>
      </div>

      {/* Modal de Detalhamento e Memorial de Cálculo */}
      <FundamentalModal
        stock={selectedStock}
        onClose={() => setSelectedStock(null)}
        bazinYieldReq={filters.bazinYieldReq}
        grahamMultiplier={filters.grahamMultiplier}
      />
    </div>
  );
};
