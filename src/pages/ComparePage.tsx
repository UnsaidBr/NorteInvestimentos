import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useMarket } from '../context/MarketContext';
import { useFavorites } from '../hooks/useFavorites';
import { usePageMeta } from '../hooks/usePageMeta';
import { fetchStockHistory, fetchStockDetail } from '../services/marketService';
import { StockDetailData, StockHistoryPoint, TimeframeFilter } from '../types/market';
import { formatBRL, formatPercent, formatVolumeBRL } from '../utils/formatters';
import {
  Scale,
  Plus,
  X,
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Info,
  Calendar,
  Layers,
  Activity,
  Check,
  ChevronDown,
  Crown,
  Lock,
} from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';

const ASSET_COLORS = [
  { stroke: '#d4af6a', bg: 'rgba(212, 175, 106, 0.15)', border: 'rgba(212, 175, 106, 0.4)', name: 'Dourado' },
  { stroke: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.4)', name: 'Azul Celeste' },
  { stroke: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.4)', name: 'Esmeralda' },
  { stroke: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', border: 'rgba(192, 132, 252, 0.4)', name: 'Violeta' },
];

export const ComparePage: React.FC = () => {
  usePageMeta(
    'Comparador de Ativos B3',
    'Compare até 4 ações e FIIs da B3 lado a lado com gráfico de rentabilidade normalizado na Base 100 e tabela comparativa de múltiplos fundamentalistas.'
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { marketState } = useMarket();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isPremium, limits, openWaitlistModal } = usePlan();

  const maxCompareAssets = isPremium ? 4 : 2;

  // Selected tickers state
  const queryTickers = searchParams.get('tickers');
  const initialTickers = useMemo(() => {
    if (queryTickers) {
      return queryTickers
        .split(',')
        .map((t) => t.trim().toUpperCase())
        .filter(Boolean)
        .slice(0, maxCompareAssets);
    }
    return isPremium ? ['PETR4', 'VALE3', 'ITUB4'] : ['PETR4', 'VALE3'];
  }, [queryTickers, isPremium, maxCompareAssets]);

  const [selectedTickers, setSelectedTickers] = useState<string[]>(initialTickers);
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('1A');

  // Asset search dropdown
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Loaded details and history for selected tickers
  const [stockDetails, setStockDetails] = useState<Record<string, StockDetailData>>({});
  const [histories, setHistories] = useState<Record<string, StockHistoryPoint[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Sync state to URL
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (selectedTickers.length > 0) {
          next.set('tickers', selectedTickers.join(','));
        } else {
          next.delete('tickers');
        }
        return next;
      },
      { replace: true }
    );
  }, [selectedTickers, setSearchParams]);

  // Load details and historical series for each selected ticker
  useEffect(() => {
    if (selectedTickers.length === 0) return;

    let isMounted = true;
    setIsLoading(true);

    const loadAll = async () => {
      const detailsMap: Record<string, StockDetailData> = {};
      const historyMap: Record<string, StockHistoryPoint[]> = {};

      await Promise.all(
        selectedTickers.map(async (ticker) => {
          try {
            const detail = await fetchStockDetail(ticker);
            if (detail) detailsMap[ticker] = detail;
          } catch (e) {
            console.warn(`Erro ao carregar detalhes de ${ticker}:`, e);
          }

          try {
            const histRes = await fetchStockHistory(ticker, timeframe);
            if (histRes.available && histRes.history.length >= 2) {
              historyMap[ticker] = histRes.history;
            }
          } catch (e) {
            console.warn(`Erro ao carregar histórico de ${ticker}:`, e);
          }
        })
      );

      if (isMounted) {
        setStockDetails(detailsMap);
        setHistories(historyMap);
        setIsLoading(false);
      }
    };

    loadAll();

    return () => {
      isMounted = false;
    };
  }, [selectedTickers, timeframe]);

  // Handle asset addition
  const handleAddTicker = (ticker: string) => {
    const norm = ticker.toUpperCase().trim();
    if (selectedTickers.includes(norm)) {
      setIsSearchOpen(false);
      setSearchQuery('');
      return;
    }

    if (selectedTickers.length >= maxCompareAssets) {
      if (!isPremium) {
        openWaitlistModal(
          'Comparação de até 4 ativos simultâneos na Base 100 (limite de 2 no plano Gratuito)'
        );
      }
      setIsSearchOpen(false);
      setSearchQuery('');
      return;
    }

    setSelectedTickers((prev) => [...prev, norm]);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  // Handle asset removal
  const handleRemoveTicker = (ticker: string) => {
    setSelectedTickers((prev) => prev.filter((t) => t !== ticker));
  };

  // Build Normalized Base 100 Chart Data
  const normalizedChartData = useMemo(() => {
    if (selectedTickers.length === 0) return [];

    // Find ticker with longest valid history as reference dates
    let primaryTicker = '';
    let maxLen = 0;
    selectedTickers.forEach((t) => {
      const h = histories[t];
      if (h && h.length > maxLen) {
        maxLen = h.length;
        primaryTicker = t;
      }
    });

    if (!primaryTicker || maxLen < 2) return [];

    const basePrices: Record<string, number> = {};
    selectedTickers.forEach((t) => {
      const h = histories[t];
      if (h && h.length > 0) {
        const first = h.find((p) => typeof p.price === 'number' && p.price > 0);
        if (first && first.price) {
          basePrices[t] = first.price;
        }
      }
    });

    const primaryHistory = histories[primaryTicker] || [];

    return primaryHistory.map((pt, idx) => {
      const row: any = {
        date: pt.date,
        timestamp: pt.timestamp,
      };

      selectedTickers.forEach((t) => {
        const h = histories[t];
        const base = basePrices[t];
        if (h && base && base > 0) {
          // Match by date or index proportion
          const matchedPoint = h.find((p) => p.date === pt.date) || h[Math.min(idx, h.length - 1)];
          if (matchedPoint && typeof matchedPoint.price === 'number') {
            const normalized = (matchedPoint.price / base) * 100;
            row[t] = parseFloat(normalized.toFixed(2));
            row[`${t}_realPrice`] = matchedPoint.price;
            row[`${t}_gain`] = parseFloat((normalized - 100).toFixed(2));
          }
        }
      });

      return row;
    });
  }, [selectedTickers, histories]);

  // Overall performance return in period for each asset
  const periodReturns = useMemo(() => {
    const res: Record<string, number> = {};
    if (normalizedChartData.length < 2) return res;
    const lastRow = normalizedChartData[normalizedChartData.length - 1];

    selectedTickers.forEach((t) => {
      if (typeof lastRow[t] === 'number') {
        res[t] = parseFloat((lastRow[t] - 100).toFixed(2));
      }
    });
    return res;
  }, [normalizedChartData, selectedTickers]);

  // Indicators Matrix with Min and Max Highlight (without value judgment)
  const indicatorRows = useMemo(() => {
    type RowDef = {
      id: string;
      label: string;
      tooltip?: string;
      formatter: (val: number | undefined) => string;
      getValue: (d: StockDetailData | undefined) => number | undefined;
    };

    const definitions: RowDef[] = [
      {
        id: 'price',
        label: 'Cotação Atual',
        formatter: (v) => (typeof v === 'number' ? formatBRL(v) : '—'),
        getValue: (d) => d?.price,
      },
      {
        id: 'change',
        label: 'Variação Hoje (%)',
        formatter: (v) => (typeof v === 'number' ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : '—'),
        getValue: (d) => d?.changePercent,
      },
      {
        id: 'pl',
        label: 'P/L (Preço / Lucro)',
        tooltip: 'Preço da ação dividido pelo lucro por ação',
        formatter: (v) => (typeof v === 'number' ? v.toFixed(2) : '—'),
        getValue: (d) => d?.pl,
      },
      {
        id: 'pvp',
        label: 'P/VP (Preço / V. Patrimonial)',
        tooltip: 'Relação entre valor de mercado e patrimônio líquido',
        formatter: (v) => (typeof v === 'number' ? v.toFixed(2) : '—'),
        getValue: (d) => d?.pvp,
      },
      {
        id: 'dy',
        label: 'Dividend Yield (12M %)',
        tooltip: 'Proventos pagos nos últimos 12 meses divididos pelo preço',
        formatter: (v) => (typeof v === 'number' ? `${v.toFixed(2)}%` : '—'),
        getValue: (d) => d?.dividendYield,
      },
      {
        id: 'roe',
        label: 'ROE (%)',
        tooltip: 'Retorno sobre o patrimônio líquido da empresa',
        formatter: (v) => (typeof v === 'number' ? `${v.toFixed(2)}%` : '—'),
        getValue: (d) => d?.roe,
      },
      {
        id: 'marketCap',
        label: 'Valor de Mercado',
        formatter: (v) => (typeof v === 'number' ? formatVolumeBRL(v) : '—'),
        getValue: (d) => d?.marketCap,
      },
      {
        id: 'volume',
        label: 'Volume Médio Diário',
        formatter: (v) => (typeof v === 'number' ? formatVolumeBRL(v) : '—'),
        getValue: (d) => d?.avgVolume || d?.volume,
      },
      {
        id: 'fiftyTwoLow',
        label: 'Mínima 52 Semanas',
        formatter: (v) => (typeof v === 'number' ? formatBRL(v) : '—'),
        getValue: (d) => d?.fiftyTwoWeekLow,
      },
      {
        id: 'fiftyTwoHigh',
        label: 'Máxima 52 Semanas',
        formatter: (v) => (typeof v === 'number' ? formatBRL(v) : '—'),
        getValue: (d) => d?.fiftyTwoWeekHigh,
      },
    ];

    return definitions.map((def) => {
      const values: (number | undefined)[] = selectedTickers.map((t) =>
        def.getValue(stockDetails[t])
      );

      const validNumbers = values.filter(
        (v): v is number => typeof v === 'number' && !isNaN(v) && isFinite(v)
      );

      let minVal: number | undefined = undefined;
      let maxVal: number | undefined = undefined;

      if (validNumbers.length >= 2) {
        minVal = Math.min(...validNumbers);
        maxVal = Math.max(...validNumbers);
        // If all values are identical, do not highlight
        if (minVal === maxVal) {
          minVal = undefined;
          maxVal = undefined;
        }
      }

      return {
        id: def.id,
        label: def.label,
        tooltip: def.tooltip,
        formatter: def.formatter,
        values,
        minVal,
        maxVal,
      };
    });
  }, [selectedTickers, stockDetails]);

  // Filtered stocks for autocomplete
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return marketState.stocks
      .filter(
        (s) =>
          !selectedTickers.includes(s.ticker) &&
          (s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [searchQuery, marketState.stocks, selectedTickers]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#d4af6a]/15">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#d4af6a] uppercase tracking-wider mb-2">
            <Scale className="w-4 h-4" />
            <span>Análise Comparativa B3</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#f5efe6] tracking-tight">
            Comparador de Ativos
          </h1>
          <p className="mt-1 text-sm text-[#a39a8c]">
            Selecione até 4 ativos para analisar o desempenho normalizado (Base 100) e os indicadores fundamentalistas lado a lado.
          </p>
        </div>

        <Link
          to="/favoritos"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1714] hover:bg-[#24201c] text-[#a39a8c] hover:text-[#f5efe6] border border-[#d4af6a]/15 text-xs font-medium transition-all"
        >
          <Star className="w-4 h-4 text-[#d4af6a]" />
          <span>Ver Favoritos</span>
        </Link>
      </div>

      {/* Asset Selection Bar */}
      <div className="my-6 p-4 rounded-xl bg-[#141210] border border-[#d4af6a]/20">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#d4af6a]">
              Ativos Selecionados
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#1c1916] text-[#a39a8c] border border-[#d4af6a]/15">
              {selectedTickers.length} / {maxCompareAssets}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              isPremium
                ? 'bg-[#d4af6a]/20 text-[#f0d9a8] border border-[#d4af6a]/30'
                : 'bg-[#1c1916] text-[#c2b9ac] border border-[#d4af6a]/15'
            }`}>
              {isPremium ? '⭐ Premium (Até 4)' : 'Gratuito (Até 2)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isPremium && selectedTickers.length >= 2 && (
              <button
                onClick={() =>
                  openWaitlistModal(
                    'Comparação de até 4 ativos simultâneos na Base 100 (limite de 2 no plano Gratuito)'
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#d4af6a]/20 to-[#e6ca85]/20 hover:from-[#d4af6a]/30 hover:to-[#e6ca85]/30 text-[#f0d9a8] border border-[#d4af6a]/40 text-xs font-medium transition-all cursor-pointer shadow"
                title="Desbloquear comparação de até 4 ativos simultâneos"
              >
                <Lock className="w-3.5 h-3.5 text-[#d4af6a]" />
                <span>Liberar 4 Ativos</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#d4af6a]/20 text-[#f0d9a8] font-bold uppercase">
                  VIP
                </span>
              </button>
            )}

            {selectedTickers.length < maxCompareAssets && (
              <div className="relative">
                <button
                  onClick={() => setIsSearchOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d4af6a]/15 hover:bg-[#d4af6a]/25 text-[#f0d9a8] border border-[#d4af6a]/30 text-xs font-medium transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Ativo</span>
                </button>

                {/* Autocomplete Dropdown */}
                {isSearchOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-[#141210] border border-[#d4af6a]/30 shadow-2xl z-50 p-2">
                    <div className="relative mb-2">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8c8273]" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Ex: PETR4, VALE3, WEGE3..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-[#0b0a09] border border-[#d4af6a]/20 text-xs text-[#f5efe6] placeholder-[#8c8273] focus:outline-none focus:border-[#d4af6a]"
                      />
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-1">
                      {searchResults.length > 0 ? (
                        searchResults.map((stock) => (
                          <button
                            key={stock.ticker}
                            onClick={() => handleAddTicker(stock.ticker)}
                            className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#1f1b17] flex items-center justify-between text-xs transition-colors cursor-pointer"
                          >
                            <div>
                              <span className="font-mono font-bold text-[#f5efe6]">{stock.ticker}</span>
                              <span className="text-[#8c8273] text-[11px] block truncate max-w-[150px]">
                                {stock.name}
                              </span>
                            </div>
                            <span className="font-mono text-[11px] text-[#f0d9a8]">
                              {formatBRL(stock.price)}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-[#8c8273]">
                          {searchQuery ? 'Nenhum ativo encontrado.' : 'Digite o ticker ou nome para buscar.'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected Asset Chips */}
        <div className="flex flex-wrap gap-2.5">
          {selectedTickers.map((ticker, idx) => {
            const color = ASSET_COLORS[idx % ASSET_COLORS.length];
            const detail = stockDetails[ticker];
            const ret = periodReturns[ticker];

            return (
              <div
                key={ticker}
                style={{ backgroundColor: color.bg, borderColor: color.border }}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all"
              >
                <div
                  style={{ backgroundColor: color.stroke }}
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs text-[#f5efe6]">{ticker}</span>
                    {typeof ret === 'number' && (
                      <span
                        className={`text-[10px] font-mono font-semibold ${
                          ret >= 0 ? 'text-[#34d399]' : 'text-[#f87171]'
                        }`}
                      >
                        {ret >= 0 ? '+' : ''}
                        {ret.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  {detail && (
                    <span className="text-[10px] text-[#a39a8c] block truncate max-w-[120px]">
                      {detail.name}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleRemoveTicker(ticker)}
                  disabled={selectedTickers.length <= 1}
                  className="p-1 rounded-md hover:bg-white/10 text-[#a39a8c] hover:text-[#f87171] transition-colors disabled:opacity-30 disabled:hover:text-[#a39a8c]"
                  title={selectedTickers.length <= 1 ? 'Mantenha pelo menos 1 ativo' : `Remover ${ticker}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Normalized Performance Chart (Base 100) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#12100e] border border-[#d4af6a]/20 shadow-2xl mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#d4af6a]/15">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#d4af6a]" />
              <h2 className="text-lg font-serif font-bold text-[#f5efe6]">
                Desempenho Relativo Normalizado (Base 100)
              </h2>
            </div>
            <p className="text-xs text-[#8c8273] mt-0.5">
              Todos os ativos começam no valor 100 na data inicial do período. Acima de 100 representa valorização e abaixo de 100 representa desvalorização acumulada.
            </p>
          </div>

          {/* Timeframe Selector */}
          <div className="inline-flex p-1 rounded-xl bg-[#0b0a09] border border-[#d4af6a]/20 shrink-0 self-start sm:self-auto">
            {(['1M', '6M', '1A', '5A'] as TimeframeFilter[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                  timeframe === tf
                    ? 'bg-[#d4af6a] text-[#0b0a09] font-bold shadow-sm'
                    : 'text-[#8c8273] hover:text-[#f5efe6]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="mt-6 h-[380px] w-full">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-xs font-mono text-[#8c8273]">
              <div className="w-7 h-7 border-2 border-[#d4af6a] border-t-transparent rounded-full animate-spin mb-3" />
              <span>Normalizando séries históricas da B3...</span>
            </div>
          ) : normalizedChartData.length >= 2 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={normalizedChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26221c" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#5e5549"
                  tick={{ fill: '#8c8273', fontSize: 11, fontFamily: 'monospace' }}
                  tickLine={false}
                  axisLine={{ stroke: '#2e2924' }}
                />
                <YAxis
                  stroke="#5e5549"
                  tick={{ fill: '#8c8273', fontSize: 11, fontFamily: 'monospace' }}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => `${v.toFixed(0)}`}
                />
                <ReferenceLine
                  y={100}
                  stroke="#8c8273"
                  strokeDasharray="4 4"
                  strokeWidth={1.2}
                  label={{
                    value: 'Base 100',
                    fill: '#8c8273',
                    fontSize: 10,
                    fontFamily: 'monospace',
                    position: 'insideTopRight',
                  }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const rowData = payload[0]?.payload;
                    return (
                      <div className="p-3 rounded-xl bg-[#0b0a09]/95 border border-[#d4af6a]/30 shadow-2xl backdrop-blur-md text-xs font-mono">
                        <span className="text-[#8c8273] text-[10px] uppercase block mb-2 pb-1 border-b border-[#2e2924]">
                          {label}
                        </span>
                        <div className="space-y-1.5">
                          {selectedTickers.map((ticker, idx) => {
                            const val = rowData?.[ticker];
                            const real = rowData?.[`${ticker}_realPrice`];
                            const gain = rowData?.[`${ticker}_gain`];
                            const color = ASSET_COLORS[idx % ASSET_COLORS.length];

                            if (typeof val !== 'number') return null;

                            return (
                              <div key={ticker} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-1.5">
                                  <div
                                    style={{ backgroundColor: color.stroke }}
                                    className="w-2 h-2 rounded-full"
                                  />
                                  <span className="text-[#f5efe6] font-bold">{ticker}:</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[#f0d9a8] font-bold">{val.toFixed(2)} pts</span>
                                  {typeof gain === 'number' && (
                                    <span
                                      className={`ml-1.5 text-[11px] ${
                                        gain >= 0 ? 'text-[#34d399]' : 'text-[#f87171]'
                                      }`}
                                    >
                                      ({gain >= 0 ? '+' : ''}
                                      {gain.toFixed(2)}%)
                                    </span>
                                  )}
                                  {typeof real === 'number' && (
                                    <span className="text-[10px] text-[#8c8273] block">
                                      {formatBRL(real)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }}
                />
                {selectedTickers.map((ticker, idx) => {
                  const color = ASSET_COLORS[idx % ASSET_COLORS.length];
                  return (
                    <Line
                      key={ticker}
                      type="monotone"
                      dataKey={ticker}
                      name={ticker}
                      stroke={color.stroke}
                      strokeWidth={2.4}
                      dot={false}
                      activeDot={{ r: 5, stroke: '#0b0a09', strokeWidth: 2 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs font-mono text-[#8c8273]">
              Dados históricos insuficientes para calcular a base 100 dos ativos selecionados neste período.
            </div>
          )}
        </div>
      </div>

      {/* Side-by-side Indicators Table */}
      <div className="rounded-2xl bg-[#12100e] border border-[#d4af6a]/20 shadow-2xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#d4af6a]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#d4af6a]" />
              <h2 className="text-lg font-serif font-bold text-[#f5efe6]">
                Matriz de Indicadores Fundamentalistas
              </h2>
            </div>
            <p className="text-xs text-[#8c8273] mt-0.5">
              Destacamos o maior e menor valor de cada linha sem qualquer juízo de valor ou viés de mérito.
            </p>
          </div>

          {/* Legend pill */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400/15 border border-amber-400/35 text-amber-300 text-[10px] font-semibold">
              Maior
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-400/15 border border-sky-400/35 text-sky-300 text-[10px] font-semibold">
              Menor
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#d4af6a]/15 bg-[#161412] text-xs font-mono text-[#8c8273]">
                <th className="py-4 px-5 min-w-[200px]">Indicador</th>
                {selectedTickers.map((ticker, idx) => {
                  const color = ASSET_COLORS[idx % ASSET_COLORS.length];
                  const detail = stockDetails[ticker];
                  const fav = isFavorite(ticker);

                  return (
                    <th key={ticker} className="py-4 px-5 text-right min-w-[160px]">
                      <div className="flex items-center justify-end gap-2">
                        <div
                          style={{ backgroundColor: color.stroke }}
                          className="w-2.5 h-2.5 rounded-full"
                        />
                        <Link
                          to={`/mercado/${ticker}`}
                          className="font-mono font-bold text-sm text-[#f5efe6] hover:text-[#d4af6a] transition-colors"
                        >
                          {ticker}
                        </Link>
                        <button
                          onClick={() => toggleFavorite(ticker)}
                          className="p-1 rounded text-[#8c8273] hover:text-[#d4af6a]"
                          title={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              fav ? 'fill-[#d4af6a] text-[#d4af6a]' : ''
                            }`}
                          />
                        </button>
                      </div>
                      <span className="text-[11px] font-sans font-normal text-[#8c8273] block truncate">
                        {detail?.name || ticker}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4af6a]/10 text-sm font-sans">
              {indicatorRows.map((row) => (
                <tr key={row.id} className="hover:bg-[#1a1714]/60 transition-colors">
                  {/* Indicator Name */}
                  <td className="py-3.5 px-5 font-medium text-[#f5efe6]">
                    <div className="flex items-center gap-1.5">
                      <span>{row.label}</span>
                      {row.tooltip && (
                        <span title={row.tooltip} className="cursor-help text-[#8c8273] hover:text-[#d4af6a]">
                          <Info className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Asset Indicator Values */}
                  {selectedTickers.map((ticker, idx) => {
                    const rawVal = row.values[idx];
                    const isMin = typeof rawVal === 'number' && rawVal === row.minVal;
                    const isMax = typeof rawVal === 'number' && rawVal === row.maxVal;

                    return (
                      <td key={ticker} className="py-3.5 px-5 text-right font-mono text-xs">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <span
                            className={`font-semibold ${
                              isMax
                                ? 'text-amber-300'
                                : isMin
                                ? 'text-sky-300'
                                : 'text-[#f5efe6]'
                            }`}
                          >
                            {row.formatter(rawVal)}
                          </span>

                          {isMax && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-400/15 border border-amber-400/35 text-amber-300 text-[9px] font-bold">
                              Maior
                            </span>
                          )}

                          {isMin && (
                            <span className="px-1.5 py-0.2 rounded bg-sky-400/15 border border-sky-400/35 text-sky-300 text-[9px] font-bold">
                              Menor
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Action row */}
              <tr className="bg-[#161412]/60">
                <td className="py-4 px-5 text-xs font-mono text-[#8c8273] uppercase">
                  Página Completa
                </td>
                {selectedTickers.map((ticker) => (
                  <td key={ticker} className="py-4 px-5 text-right">
                    <Link
                      to={`/mercado/${ticker}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#d4af6a]/15 hover:bg-[#d4af6a]/25 text-[#f0d9a8] border border-[#d4af6a]/30 text-xs font-medium transition-all"
                    >
                      <span>Ver Análise</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Impartiality / Neutrality Disclaimer */}
        <div className="p-4 bg-[#0e0c0a] border-t border-[#d4af6a]/15 text-xs text-[#8c8273] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#d4af6a] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#a39a8c]">Critério de destaque puramente matemático:</strong> Os rótulos de maior e menor valor são estritamente descritivos e não refletem recomendação de investimento. Um múltiplo menor (ex: P/L ou P/VP baixo) pode sinalizar desconto ou problemas de fundamentos da empresa; similarmente, um dividend yield mais elevado pode decorrer de queda no preço da ação.
          </p>
        </div>
      </div>
    </div>
  );
};
