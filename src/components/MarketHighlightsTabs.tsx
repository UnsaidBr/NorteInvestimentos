import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Percent,
  Building2,
  ArrowRight,
  BarChart2,
  Sparkles,
  SlidersHorizontal,
  Play,
  Pause,
  RotateCw,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { AssetLogo } from './AssetLogo';
import { MiniSparkline } from './StocksSection';
import { DataSourceBadge } from './DataSourceBadge';
import { formatBRL, formatPercent, getFriendlyCompanyName } from '../utils/formatters';
import { FII_DATASET } from '../data/fiiData';
import { BASE_FUNDAMENTAL_STOCKS } from '../data/fundamentalData';
import { StockItem } from '../types/market';
import { FiiItem } from '../types/fundamental';

export type TabKey = 'most_searched' | 'high_dividends' | 'top_gainers' | 'top_losers';

interface TabDefinition {
  key: TabKey;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface HighlightCardItem {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  sparkline?: number[];
  isFii: boolean;
  badge: string;
  highlightMetricLabel: string;
  highlightMetricValue: string;
  secondaryMetric?: string;
  rawStock?: StockItem;
  rawFii?: FiiItem;
}

const TABS: TabDefinition[] = [
  {
    key: 'most_searched',
    label: 'Mais Buscadas',
    shortLabel: 'Mais Buscadas',
    icon: Flame,
    description: 'Ativos de maior liquidez e volume de busca na B3',
  },
  {
    key: 'high_dividends',
    label: 'Maiores Dividendos',
    shortLabel: 'Dividendos',
    icon: Percent,
    description: 'Ações e FIIs com os maiores proventos acumulados em 12 meses',
  },
  {
    key: 'top_gainers',
    label: 'Maiores Altas',
    shortLabel: 'Altas',
    icon: TrendingUp,
    description: 'Ações com maior valorização percentual na sessão da B3',
  },
  {
    key: 'top_losers',
    label: 'Maiores Baixas',
    shortLabel: 'Baixas',
    icon: TrendingDown,
    description: 'Ações com maior retração percentual na sessão da B3',
  },
];

const CYCLE_DURATION_MS = 8000; // 8 segundos por aba

export const MarketHighlightsTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('most_searched');
  const [isAutoCycleActive, setIsAutoCycleActive] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const navigate = useNavigate();

  const { marketState, setSelectedStockForChart, setSelectedStockForAi } = useMarket();
  const { stocks, isDemoMode, lastUpdated } = marketState;

  // Gerenciamento do ciclo automático através das abas
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isAutoCycleActive || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    const interval = 100; // Atualiza a barra de progresso a cada 100ms

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / CYCLE_DURATION_MS) * 100);
      setProgress(pct);

      if (elapsed >= CYCLE_DURATION_MS) {
        // Passa para a próxima aba
        setActiveTab((prev) => {
          const currentIndex = TABS.findIndex((t) => t.key === prev);
          const nextIndex = (currentIndex + 1) % TABS.length;
          return TABS[nextIndex].key;
        });
        startTimeRef.current = Date.now();
        setProgress(0);
      }
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoCycleActive, isHovered, activeTab]);

  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    startTimeRef.current = Date.now();
    setProgress(0);
  };

  // 1. Most Searched (Mais Buscadas: PETR4, VALE3, ITUB4, BBAS3, WEGE3, MXRF11)
  const mostSearchedAssets: HighlightCardItem[] = useMemo(() => {
    const popularTickers = ['PETR4', 'VALE3', 'ITUB4', 'BBAS3', 'WEGE3', 'MXRF11'];
    return popularTickers
      .map((ticker): HighlightCardItem | null => {
        const foundStock = stocks.find((s: StockItem) => s.ticker === ticker);
        const foundFii = FII_DATASET.find((f: FiiItem) => f.ticker === ticker);
        const foundFund = BASE_FUNDAMENTAL_STOCKS.find((fs) => fs.ticker === ticker);

        if (foundStock) {
          const livePrice = foundStock.price || foundFund?.price || 30;
          // Cálculo dinâmico do Dividend Yield com cotação em tempo real
          const dynamicDy = foundFund ? (foundFund.dpa12m / livePrice) * 100 : 0;

          return {
            ticker: foundStock.ticker,
            name: foundStock.name,
            price: livePrice,
            changePercent: foundStock.changePercent,
            sparkline: foundStock.sparkline,
            isFii: false,
            badge: foundStock.sector || 'Ação B3',
            highlightMetricLabel: 'Dividend Yield',
            highlightMetricValue: dynamicDy > 0 ? `${dynamicDy.toFixed(1)}%` : '—',
            secondaryMetric: foundFund ? `P/L ${foundFund.pl.toFixed(1)}x` : undefined,
            rawStock: foundStock,
          };
        }
        if (foundFii) {
          return {
            ticker: foundFii.ticker,
            name: foundFii.name,
            price: foundFii.price,
            changePercent: 0.18,
            sparkline: [9.95, 10.02, 10.08, 10.15, 10.12, 10.18],
            isFii: true,
            badge: foundFii.segment,
            highlightMetricLabel: 'DY 12m',
            highlightMetricValue: `${foundFii.dy12m.toFixed(1)}%`,
            secondaryMetric: `P/VP ${foundFii.pvp.toFixed(2)}`,
            rawFii: foundFii,
          };
        }
        return null;
      })
      .filter((item): item is HighlightCardItem => item !== null);
  }, [stocks]);

  // 2. High Dividend Yielders (Maiores Dividendos)
  const highDividendAssets: HighlightCardItem[] = useMemo(() => {
    // Ações ordenadas por DY dinâmico calculado com a cotação ao vivo
    const dividendStocks = BASE_FUNDAMENTAL_STOCKS.map((fs) => {
      const live = stocks.find((s: StockItem) => s.ticker === fs.ticker);
      const currentPrice = live?.price || fs.price;
      const dynamicDy = (fs.dpa12m / currentPrice) * 100;
      return {
        ticker: fs.ticker,
        name: fs.name,
        price: currentPrice,
        changePercent: live?.changePercent || 0.1,
        sparkline: live?.sparkline,
        isFii: false,
        badge: fs.sector,
        dynamicDy,
        dpa12m: fs.dpa12m,
        rawStock: live,
      };
    });

    const sortedStocks = [...dividendStocks].sort((a, b) => b.dynamicDy - a.dynamicDy).slice(0, 5);

    // Adiciona o FII com maior provento recorrente para complementar a cesta de renda
    const topFii = [...FII_DATASET].sort((a, b) => b.dy12m - a.dy12m)[0];

    const cards: HighlightCardItem[] = sortedStocks.map((s) => ({
      ticker: s.ticker,
      name: s.name,
      price: s.price,
      changePercent: s.changePercent,
      sparkline: s.sparkline,
      isFii: false,
      badge: s.badge,
      highlightMetricLabel: 'Dividend Yield',
      highlightMetricValue: `${s.dynamicDy.toFixed(1)}%`,
      secondaryMetric: `DPA R$ ${s.dpa12m.toFixed(2)}`,
      rawStock: s.rawStock,
    }));

    if (topFii) {
      cards.push({
        ticker: topFii.ticker,
        name: topFii.name,
        price: topFii.price,
        changePercent: 0.22,
        sparkline: [10.1, 10.12, 10.15, 10.2, 10.18],
        isFii: true,
        badge: topFii.segment,
        highlightMetricLabel: 'DY 12m',
        highlightMetricValue: `${topFii.dy12m.toFixed(1)}%`,
        secondaryMetric: `Rendimento R$ ${topFii.lastDividend.toFixed(2)}`,
        rawFii: topFii,
      });
    }

    return cards;
  }, [stocks]);

  // 3. Top Gainers (Maiores Altas ao vivo da B3)
  const topGainers: HighlightCardItem[] = useMemo(() => {
    const eligible = stocks.filter((s: StockItem) => {
      const isFii = s.ticker.endsWith('11') && !['TAEE11', 'KLBN11', 'SAPR11', 'BPAC11', 'SANB11', 'ALUP11'].includes(s.ticker);
      return !isFii && (s.price || 0) >= 1.0;
    });

    return [...eligible]
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 6)
      .map((s: StockItem): HighlightCardItem => {
        const foundFund = BASE_FUNDAMENTAL_STOCKS.find((fs) => fs.ticker === s.ticker);
        return {
          ticker: s.ticker,
          name: s.name,
          price: s.price,
          changePercent: s.changePercent,
          sparkline: s.sparkline,
          isFii: false,
          badge: s.sector || 'Ação B3',
          highlightMetricLabel: 'Variação Dia',
          highlightMetricValue: `+${s.changePercent.toFixed(2)}%`,
          secondaryMetric: foundFund ? `P/L ${foundFund.pl.toFixed(1)}x` : 'B3',
          rawStock: s,
        };
      });
  }, [stocks]);

  // 4. Top Losers (Maiores Baixas ao vivo da B3)
  const topLosers: HighlightCardItem[] = useMemo(() => {
    const eligible = stocks.filter((s: StockItem) => {
      const isFii = s.ticker.endsWith('11') && !['TAEE11', 'KLBN11', 'SAPR11', 'BPAC11', 'SANB11', 'ALUP11'].includes(s.ticker);
      return !isFii && (s.price || 0) >= 1.0;
    });

    return [...eligible]
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 6)
      .map((s: StockItem): HighlightCardItem => {
        const foundFund = BASE_FUNDAMENTAL_STOCKS.find((fs) => fs.ticker === s.ticker);
        return {
          ticker: s.ticker,
          name: s.name,
          price: s.price,
          changePercent: s.changePercent,
          sparkline: s.sparkline,
          isFii: false,
          badge: s.sector || 'Ação B3',
          highlightMetricLabel: 'Variação Dia',
          highlightMetricValue: `${s.changePercent.toFixed(2)}%`,
          secondaryMetric: foundFund ? `P/VP ${foundFund.pvp.toFixed(2)}x` : 'B3',
          rawStock: s,
        };
      });
  }, [stocks]);

  // Seleciona a lista de ativos para a aba ativa
  const currentAssets = useMemo(() => {
    switch (activeTab) {
      case 'high_dividends':
        return highDividendAssets;
      case 'top_gainers':
        return topGainers;
      case 'top_losers':
        return topLosers;
      case 'most_searched':
      default:
        return mostSearchedAssets;
    }
  }, [activeTab, mostSearchedAssets, highDividendAssets, topGainers, topLosers]);

  const activeTabMeta = TABS.find((t) => t.key === activeTab) || TABS[0];

  return (
    <section
      className="py-16 sm:py-24 bg-[#0b0a09] border-b border-[#d4af6a]/15"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header da Seção com Título, Origem e Controle de Ciclo */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2.5">
              <span className="flex items-center gap-2 text-xs font-mono font-medium text-[#d4af6a] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af6a] shadow-[0_0_8px_#d4af6a]" />
                Termômetro de Mercado
              </span>
              <DataSourceBadge isDemoMode={isDemoMode} lastUpdated={lastUpdated} />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#f5efe6] tracking-tight">
              Destaques do Pregão B3
            </h2>
            <p className="text-sm text-[#c2b9ac] mt-2 max-w-xl font-normal leading-relaxed">
              {activeTabMeta.description}
            </p>
          </div>

          {/* Ações do Topo: Controle do Ciclo Automático e Link para o Screener */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAutoCycleActive(!isAutoCycleActive)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-[10px] bg-[#141210] hover:bg-[#1c1916] border border-[#d4af6a]/20 text-xs font-mono text-[#c2b9ac] hover:text-[#f0d9a8] transition-all cursor-pointer"
              title={isAutoCycleActive ? 'Pausar rotação automática' : 'Ativar rotação automática'}
            >
              {isAutoCycleActive ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-[#d4af6a]" />
                  <span className="hidden sm:inline">Pausar Ciclo</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-[#3ddc97]" />
                  <span className="hidden sm:inline">Iniciar Ciclo</span>
                </>
              )}
            </button>

            <Link
              to="/radar"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#141210] hover:bg-[#1c1916] border border-[#d4af6a]/25 text-xs sm:text-sm font-semibold text-[#f0d9a8] transition-all shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#d4af6a]" />
              <span>Rastreador Completo</span>
            </Link>
          </div>
        </div>

        {/* Barra de Abas Interativas com Barra de Progresso do Ciclo */}
        <div className="relative mb-8">
          <div className="flex items-center gap-1.5 p-1.5 bg-[#141210] rounded-[14px] border border-[#d4af6a]/20 overflow-x-auto scrollbar-none">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] text-[#0b0a09] shadow-[0_4px_16px_rgba(212,175,106,0.25)]'
                      : 'text-[#c2b9ac] hover:text-[#f5efe6] hover:bg-[#1c1916]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0b0a09]' : 'text-[#d4af6a]'}`} />
                  <span>{tab.label}</span>

                  {/* Indicador de progresso de tempo na aba ativa */}
                  {isActive && isAutoCycleActive && !isHovered && (
                    <div
                      className="absolute bottom-0 left-0 h-[2px] bg-[#0b0a09]/50 transition-all duration-100 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Dica discreta de pausa ao passar o mouse */}
          {isHovered && isAutoCycleActive && (
            <div className="absolute right-2 -bottom-5 text-[10px] font-mono text-[#8c8273]">
              Rotação pausada (cursor sobre os ativos)
            </div>
          )}
        </div>

        {/* Grade de Ativos: 6 Cards por Aba com AssetLogo Limpo e Métricas Reais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentAssets.map((asset) => {
            const isUp = (asset.changePercent ?? 0) >= 0;

            return (
              <div
                key={asset.ticker}
                className="p-5 rounded-[16px] bg-[#141210] border border-[#d4af6a]/15 hover:border-[#d4af6a]/35 transition-all duration-200 shadow-md hover:shadow-[0_8px_25px_rgba(0,0,0,0.6)] flex flex-col justify-between group space-y-4"
              >
                {/* Linha Superior: Logo, Identificação, Preço e Variação */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <AssetLogo ticker={asset.ticker} name={asset.name} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-base text-[#f5efe6] group-hover:text-[#f0d9a8] transition-colors">
                          {asset.ticker}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1c1916] text-[#c2b9ac] border border-[#d4af6a]/10">
                          {asset.badge}
                        </span>
                      </div>
                      <div
                        className="text-xs text-[#c2b9ac] truncate cursor-help mt-0.5"
                        title={asset.name}
                      >
                        {getFriendlyCompanyName(asset.name, asset.ticker)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono tabular-nums font-bold text-base sm:text-lg text-[#f5efe6]">
                      {formatBRL(asset.price)}
                    </div>
                    <span className={`inline-flex items-center gap-0.5 font-mono tabular-nums text-xs font-bold ${
                      isUp ? 'text-[#3ddc97]' : 'text-[#ff5c6c]'
                    }`}>
                      {isUp ? '▲' : '▼'} {formatPercent(asset.changePercent, false)}
                    </span>
                  </div>
                </div>

                {/* Linha Intermediária: Métrica de Destaque & Sparkline */}
                <div className="pt-3 border-t border-[#d4af6a]/10 flex items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[#8c8273]">{asset.highlightMetricLabel}:</span>
                    <strong className="text-[#f0d9a8] font-bold">{asset.highlightMetricValue}</strong>
                    {asset.secondaryMetric && (
                      <>
                        <span className="text-[#8c8273]" aria-hidden="true">·</span>
                        <span className="text-[#c2b9ac]">{asset.secondaryMetric}</span>
                      </>
                    )}
                  </div>

                  {Array.isArray(asset.sparkline) && asset.sparkline.length >= 2 && (
                    <div className="shrink-0">
                      <MiniSparkline
                        stock={{
                          ticker: asset.ticker,
                          name: asset.name,
                          price: asset.price,
                          changePercent: asset.changePercent,
                          sparkline: asset.sparkline,
                        } as any}
                        width={80}
                        height={22}
                      />
                    </div>
                  )}
                </div>

                {/* Linha Inferior: Botões Interativos (Gráfico e IA) */}
                <div className="pt-2 border-t border-[#d4af6a]/10 flex items-center justify-between gap-2">
                  {asset.rawStock ? (
                    <>
                      <button
                        onClick={() => setSelectedStockForChart(asset.rawStock!)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-[8px] bg-[#1c1916] hover:bg-[#24201c] text-[#c2b9ac] hover:text-[#f0d9a8] border border-[#d4af6a]/15 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <BarChart2 className="w-3.5 h-3.5 text-[#d4af6a]" />
                        <span>Gráfico</span>
                      </button>

                      <button
                        onClick={() => setSelectedStockForAi(asset.rawStock!)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-[8px] bg-[#1c1916] hover:bg-[#24201c] text-[#f0d9a8] border border-[#d4af6a]/25 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#d4af6a]" />
                        <span>IA</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => navigate('/fiis')}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-[8px] bg-[#1c1916] hover:bg-[#24201c] text-[#f0d9a8] border border-[#d4af6a]/25 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#d4af6a]" />
                      <span>Ver FII no Painel</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé da Seção com Links Rápidos */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold">
          <Link
            to="/mercado"
            className="inline-flex items-center gap-1.5 text-[#d4af6a] hover:text-[#f0d9a8] transition-colors"
          >
            <span>Ver todas as ações da B3</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <span className="text-[#8c8273]" aria-hidden="true">·</span>
          <Link
            to="/fiis"
            className="inline-flex items-center gap-1.5 text-[#d4af6a] hover:text-[#f0d9a8] transition-colors"
          >
            <span>Ver painel de FIIs e proventos</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <span className="text-[#8c8273]" aria-hidden="true">·</span>
          <Link
            to="/radar"
            className="inline-flex items-center gap-1.5 text-[#d4af6a] hover:text-[#f0d9a8] transition-colors"
          >
            <span>Rastreador de Graham e Bazin</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};
