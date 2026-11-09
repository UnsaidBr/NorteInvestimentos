import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useMarket } from '../context/MarketContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { StockDetailData, StockHistoryPoint, TimeframeFilter, StockItem } from '../types/market';
import { fetchStockDetail, fetchStockHistory } from '../services/marketService';
import { formatBRL, formatPercent, formatVolumeBRL, formatFullDateTimeBR } from '../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  Clock,
  ShieldCheck,
  AlertTriangle,
  BarChart2,
  Layers,
  Activity,
  Check,
  Share2,
  Calendar,
  DollarSign,
  Building2,
  Scale,
  X,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Flame,
  Bell,
  Crown,
  Lock,
} from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
} from 'recharts';

// Normalização inteligente de setores para comparação uniforme
function getMacroSector(sector: string = '', category: string = ''): string {
  const s = (sector || '').toLowerCase();
  if (category === 'fii' || s.startsWith('fii') || s.includes('fundo imobiliário')) {
    return 'Fundos Imobiliários (FIIs)';
  }
  if (s.includes('petróleo') || s.includes('combustíve') || s.includes('gás')) {
    return 'Petróleo, Gás & Energia';
  }
  if (s.includes('financeir') || s.includes('banco') || s.includes('seguro') || s.includes('holding')) {
    return 'Financeiro & Seguros';
  }
  if (s.includes('minera') || s.includes('siderurg') || s.includes('metalurg') || s.includes('celulose') || s.includes('química')) {
    return 'Materiais Básicos & Mineração';
  }
  if (s.includes('elétric') || s.includes('transmissão') || s.includes('energia renovável') || s.includes('saneamento') || s.includes('água')) {
    return 'Utilidade Pública & Elétrica';
  }
  if (
    s.includes('varejo') ||
    s.includes('comércio') ||
    s.includes('alimento') ||
    s.includes('carne') ||
    s.includes('bebida') ||
    s.includes('cosmético') ||
    s.includes('luxo') ||
    s.includes('agrícola')
  ) {
    return 'Consumo, Varejo & Agro';
  }
  if (
    s.includes('motores') ||
    s.includes('aeroespacial') ||
    s.includes('logística') ||
    s.includes('transporte') ||
    s.includes('aluguel') ||
    s.includes('máquinas')
  ) {
    return 'Bens Industriais & Logística';
  }
  if (s.includes('saúde') || s.includes('médic') || s.includes('farmac') || s.includes('plano')) {
    return 'Saúde & Farmacêutica';
  }
  if (s.includes('tecnologia') || s.includes('software') || s.includes('hardware') || s.includes('telecom')) {
    return 'Tecnologia & Telecom';
  }
  if (s.includes('construção') || s.includes('shopping') || s.includes('imóve')) {
    return 'Construção Civil & Shoppings';
  }
  return sector || 'Outros Setores';
}

// Cálculo robusto de mediana matemática
function calculateMedian(values: number[]): number | undefined {
  const filtered = values.filter((v) => typeof v === 'number' && !isNaN(v) && isFinite(v));
  if (filtered.length === 0) return undefined;
  filtered.sort((a, b) => a - b);
  const mid = Math.floor(filtered.length / 2);
  if (filtered.length % 2 !== 0) {
    return filtered[mid];
  }
  return (filtered[mid - 1] + filtered[mid]) / 2;
}

// Gráfico de Candlesticks customizado em SVG nativo de alta precisão
const CandlestickChartSvg: React.FC<{
  data: StockHistoryPoint[];
  height?: number;
}> = ({ data, height = 360 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(containerRef.current);
    setContainerWidth(containerRef.current.clientWidth || 800);
    return () => observer.disconnect();
  }, []);

  if (!data || data.length < 2) {
    return (
      <div className="h-[360px] flex items-center justify-center text-xs font-mono text-[#8c8273]">
        Dados de candles insuficientes para o período selecionado.
      </div>
    );
  }

  const paddingLeft = 10;
  const paddingRight = 65;
  const paddingTop = 25;
  const paddingBottom = 40;
  const chartWidth = Math.max(containerWidth - paddingLeft - paddingRight, 200);
  const chartHeight = height - paddingTop - paddingBottom;

  const highs = data.map((d) => d.high ?? d.price);
  const lows = data.map((d) => d.low ?? d.price);
  const minVal = Math.min(...lows);
  const maxVal = Math.max(...highs);
  const range = maxVal - minVal || 1;

  const getY = (val: number) => {
    return paddingTop + chartHeight - ((val - minVal) / range) * chartHeight;
  };

  const candleSlotWidth = chartWidth / data.length;
  const candleBodyWidth = Math.max(1.8, Math.min(candleSlotWidth * 0.72, 14));

  const hoveredCandle = hoverIndex !== null ? data[hoverIndex] : null;

  // Grid horizontal lines
  const gridLevels = 5;
  const gridLines = Array.from({ length: gridLevels }, (_, i) => {
    const val = minVal + (range / (gridLevels - 1)) * i;
    const y = getY(val);
    return { val, y };
  });

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none"
      style={{ height }}
      onMouseLeave={() => setHoverIndex(null)}
    >
      <svg
        width={containerWidth}
        height={height}
        className="overflow-visible"
        onMouseMove={(e) => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const mouseX = e.clientX - rect.left - paddingLeft;
          const idx = Math.min(
            Math.max(0, Math.floor(mouseX / candleSlotWidth)),
            data.length - 1
          );
          setHoverIndex(idx);
        }}
      >
        {/* Linhas de Grade Horizontais e Eixo Y */}
        {gridLines.map((line, idx) => (
          <g key={idx}>
            <line
              x1={paddingLeft}
              x2={paddingLeft + chartWidth}
              y1={line.y}
              y2={line.y}
              stroke="#2c2722"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            <text
              x={paddingLeft + chartWidth + 8}
              y={line.y + 3.5}
              fill="#8e8579"
              fontSize={10}
              fontFamily="monospace"
              textAnchor="start"
            >
              {formatBRL(line.val)}
            </text>
          </g>
        ))}

        {/* Linha vertical de Crosshair ao passar o mouse */}
        {hoverIndex !== null && (
          <line
            x1={paddingLeft + hoverIndex * candleSlotWidth + candleSlotWidth / 2}
            x2={paddingLeft + hoverIndex * candleSlotWidth + candleSlotWidth / 2}
            y1={paddingTop}
            y2={paddingTop + chartHeight}
            stroke="#d4af6a"
            strokeWidth={1}
            strokeDasharray="2 2"
            opacity={0.8}
          />
        )}

        {/* Desenho de cada Vela (Candle) */}
        {data.map((point, idx) => {
          const open = point.open ?? point.price;
          const close = point.close ?? point.price;
          const high = point.high ?? Math.max(open, close);
          const low = point.low ?? Math.min(open, close);
          const isUp = close >= open;

          const cx = paddingLeft + idx * candleSlotWidth + candleSlotWidth / 2;
          const highY = getY(high);
          const lowY = getY(low);
          const openY = getY(open);
          const closeY = getY(close);

          const bodyY = Math.min(openY, closeY);
          const bodyHeight = Math.max(2, Math.abs(closeY - openY));

          const candleColor = isUp ? '#22c55e' : '#ef4444';
          const isHovered = hoverIndex === idx;

          return (
            <g key={idx} opacity={hoverIndex !== null && !isHovered ? 0.6 : 1}>
              {/* Pavio Superior & Inferior */}
              <line
                x1={cx}
                x2={cx}
                y1={highY}
                y2={lowY}
                stroke={candleColor}
                strokeWidth={1.5}
              />
              {/* Corpo da Vela */}
              <rect
                x={cx - candleBodyWidth / 2}
                y={bodyY}
                width={candleBodyWidth}
                height={bodyHeight}
                fill={isUp ? candleColor : candleColor}
                stroke={candleColor}
                strokeWidth={isHovered ? 1.5 : 1}
                rx={1}
              />
            </g>
          );
        })}

        {/* Rótulos do Eixo X (Datas espaçadas) */}
        {data.map((point, idx) => {
          const step = Math.max(1, Math.floor(data.length / 6));
          if (idx % step !== 0 && idx !== data.length - 1) return null;
          const cx = paddingLeft + idx * candleSlotWidth + candleSlotWidth / 2;
          return (
            <text
              key={`label-${idx}`}
              x={cx}
              y={height - 12}
              fill="#8e8579"
              fontSize={10}
              fontFamily="monospace"
              textAnchor="middle"
            >
              {point.date}
            </text>
          );
        })}
      </svg>

      {/* Tooltip Detalhado do Candle Hover */}
      {hoveredCandle && (
        <div className="absolute top-2 left-3 z-20 flex flex-wrap items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#141210]/95 backdrop-blur-md border border-[#d4af6a]/30 text-xs font-mono shadow-xl pointer-events-none">
          <span className="text-[#a39a8c]">{hoveredCandle.date}</span>
          <span className="text-white">
            Abertura: <strong>{formatBRL(hoveredCandle.open ?? hoveredCandle.price)}</strong>
          </span>
          <span className="text-[#22c55e]">
            Máx: <strong>{formatBRL(hoveredCandle.high ?? hoveredCandle.price)}</strong>
          </span>
          <span className="text-[#ef4444]">
            Mín: <strong>{formatBRL(hoveredCandle.low ?? hoveredCandle.price)}</strong>
          </span>
          <span
            className={
              (hoveredCandle.close ?? hoveredCandle.price) >= (hoveredCandle.open ?? hoveredCandle.price)
                ? 'text-[#22c55e]'
                : 'text-[#ef4444]'
            }
          >
            Fechamento: <strong>{formatBRL(hoveredCandle.close ?? hoveredCandle.price)}</strong>
          </span>
          {hoveredCandle.volume ? (
            <span className="text-[#c2b9ac]">
              Vol: {formatVolumeBRL(hoveredCandle.volume)}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
};

export const StockDetailPage: React.FC = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const normalizedTicker = (ticker || '').toUpperCase().trim();

  const { marketState } = useMarket();
  const { isPremium, aiUsageToday, canUseAi, recordAiUsage, openWaitlistModal, limits } = usePlan();

  const [stockDetail, setStockDetail] = useState<StockDetailData | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Timeframe e Gráfico
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('1M');
  const [chartType, setChartType] = useState<'area' | 'candles'>('area');
  const [historyData, setHistoryData] = useState<StockHistoryPoint[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [historyAvailable, setHistoryAvailable] = useState<boolean>(true);

  // Favoritos (localStorage)
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal de Comparação
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [compareTargetTicker, setCompareTargetTicker] = useState<string>('');
  const [compareSearch, setCompareSearch] = useState<string>('');

  // Bloco IA Integrado
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiDisclaimer, setAiDisclaimer] = useState<string>(
    'Conteúdo informativo e educacional. Não constitui recomendação de investimento. Rentabilidade passada não garante resultados futuros.'
  );

  // Filtro de proventos na tabela
  const [dividendTypeFilter, setDividendTypeFilter] = useState<'todos' | 'DIVIDENDO' | 'JCP'>('todos');

  // Inicializa status de favoritos
  useEffect(() => {
    try {
      const stored = localStorage.getItem('norteinvest_favorites');
      if (stored) {
        const list: string[] = JSON.parse(stored);
        setIsFavorite(list.includes(normalizedTicker));
      }
    } catch {
      // Ignora erro de storage
    }
  }, [normalizedTicker]);

  // Carrega detalhes do ativo na API
  useEffect(() => {
    if (!normalizedTicker) return;

    let isMounted = true;
    setIsLoadingDetail(true);
    setLoadError(null);

    fetchStockDetail(normalizedTicker)
      .then((data) => {
        if (!isMounted) return;
        if (!data) {
          setLoadError(`Ativo ${normalizedTicker} não encontrado.`);
          setIsLoadingDetail(false);
          return;
        }
        setStockDetail(data);
        setIsLoadingDetail(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setLoadError(`Erro ao carregar dados de ${normalizedTicker}: ${err.message}`);
        setIsLoadingDetail(false);
      });

    return () => {
      isMounted = false;
    };
  }, [normalizedTicker]);

  // Carrega histórico de preços no timeframe selecionado
  useEffect(() => {
    if (!normalizedTicker) return;

    let isMounted = true;
    setIsLoadingHistory(true);

    fetchStockHistory(normalizedTicker, timeframe)
      .then((res) => {
        if (!isMounted) return;
        setHistoryData(res.history);
        setHistoryAvailable(res.available);
        setIsLoadingHistory(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setHistoryData([]);
        setHistoryAvailable(false);
        setIsLoadingHistory(false);
      });

    return () => {
      isMounted = false;
    };
  }, [normalizedTicker, timeframe]);

  // SEO dinâmico por ativo
  const pageTitle = stockDetail
    ? `${stockDetail.ticker} - ${stockDetail.name} | Cotação B3, Gráficos e Dividendos | NorteInvest`
    : `${normalizedTicker} | Cotação e Indicadores B3 | NorteInvest`;

  const pageDescription = stockDetail
    ? `Acompanhe a cotação de ${stockDetail.ticker} (${stockDetail.name}) em tempo real na B3: ${formatBRL(stockDetail.price)}, variação de ${formatPercent(stockDetail.changePercent)}, múltiplos P/L e P/VP, histórico de proventos e comparação setorial.`
    : `Consulte cotações, múltiplos fundamentalistas e gráficos históricos do ativo ${normalizedTicker} na bolsa brasileira.`;

  usePageMeta(pageTitle, pageDescription);

  // Toggle Favoritos
  const handleToggleFavorite = () => {
    try {
      const stored = localStorage.getItem('norteinvest_favorites');
      let list: string[] = stored ? JSON.parse(stored) : [];
      if (list.includes(normalizedTicker)) {
        list = list.filter((t) => t !== normalizedTicker);
        setIsFavorite(false);
        setToastMessage(`${normalizedTicker} removido dos favoritos.`);
      } else {
        if (!isPremium && list.length >= limits.maxFavorites) {
          openWaitlistModal(
            `Você atingiu o limite de ${limits.maxFavorites} favoritos no plano Gratuito. Passe para o Premium para salvar ativos ilimitados!`
          );
          return;
        }
        list.push(normalizedTicker);
        setIsFavorite(true);
        setToastMessage(`${normalizedTicker} adicionado aos favoritos com sucesso!`);
      }
      localStorage.setItem('norteinvest_favorites', JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('norteinvest-favorites-change', { detail: list }));
      setTimeout(() => setToastMessage(null), 3000);
    } catch {
      // Ignora erro
    }
  };

  // Bloco IA: Solicitar Explicação
  const handleGenerateAi = async () => {
    if (!stockDetail) return;
    if (!canUseAi) {
      openWaitlistModal('Limite de 3 explicações de IA por dia atingido no plano Gratuito');
      return;
    }

    setIsLoadingAi(true);

    try {
      const res = await fetch('/api/gemini/explain-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: stockDetail.ticker,
          name: stockDetail.name,
          price: stockDetail.price,
          changePercent: stockDetail.changePercent,
          volume: stockDetail.volume,
          context: `Setor: ${stockDetail.sector}. P/L: ${stockDetail.pl ?? 'n/d'}, P/VP: ${stockDetail.pvp ?? 'n/d'}, DY: ${stockDetail.dividendYield ?? 'n/d'}%, ROE: ${stockDetail.roe ?? 'n/d'}%.`,
        }),
      });

      if (!res.ok) throw new Error('Falha ao consultar IA');
      const data = await res.json();
      recordAiUsage();
      setAiExplanation(data.explanation || 'Análise indisponível no momento.');
      if (data.disclaimer) setAiDisclaimer(data.disclaimer);
    } catch (err: any) {
      setAiExplanation('Explicação por IA indisponível no momento. Tente novamente em instantes.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Comparação com a Mediana do Setor
  const sectorComparison = useMemo(() => {
    if (!stockDetail) return null;
    const currentMacro = getMacroSector(stockDetail.sector, stockDetail.category);
    const peers = marketState.stocks.filter((s) => {
      const macro = getMacroSector(s.sector, s.category);
      return macro === currentMacro && s.ticker !== stockDetail.ticker;
    });

    const plList = peers.map((p) => p.pl).filter((v): v is number => typeof v === 'number' && v > 0);
    const pvpList = peers.map((p) => p.pvp).filter((v): v is number => typeof v === 'number' && v > 0);
    const dyList = peers.map((p) => p.dividendYield).filter((v): v is number => typeof v === 'number');
    const roeList = peers.map((p) => p.roe).filter((v): v is number => typeof v === 'number');
    const capList = peers.map((p) => p.marketCap).filter((v): v is number => typeof v === 'number' && v > 0);

    return {
      sectorName: currentMacro,
      peersCount: peers.length,
      medianPl: calculateMedian(plList),
      medianPvp: calculateMedian(pvpList),
      medianDy: calculateMedian(dyList),
      medianRoe: calculateMedian(roeList),
      medianMarketCap: calculateMedian(capList),
    };
  }, [stockDetail, marketState.stocks]);

  // Ativo Alvo para Comparação Lado a Lado
  const compareTargetStock = useMemo(() => {
    if (!compareTargetTicker) return null;
    return marketState.stocks.find((s) => s.ticker === compareTargetTicker) || null;
  }, [compareTargetTicker, marketState.stocks]);

  // Lista filtrada para busca de comparação
  const availableToCompare = useMemo(() => {
    const q = compareSearch.toLowerCase().trim();
    return marketState.stocks
      .filter((s) => s.ticker !== normalizedTicker)
      .filter((s) => !q || s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [marketState.stocks, normalizedTicker, compareSearch]);

  // Filtro da tabela de proventos
  const filteredDividends = useMemo(() => {
    if (!stockDetail?.dividends) return [];
    if (dividendTypeFilter === 'todos') return stockDetail.dividends;
    return stockDetail.dividends.filter((d) => d.label.toUpperCase().includes(dividendTypeFilter));
  }, [stockDetail?.dividends, dividendTypeFilter]);

  // Cálculo de variação e extremidades no histórico
  const prices = historyData.map((d) => d.price);
  const minPeriodPrice = prices.length > 0 ? Math.min(...prices) : stockDetail?.low24h || 0;
  const maxPeriodPrice = prices.length > 0 ? Math.max(...prices) : stockDetail?.high24h || 0;
  const startPrice = prices[0] || stockDetail?.openPrice || stockDetail?.price || 1;
  const endPrice = prices.length > 0 ? prices[prices.length - 1] : stockDetail?.price || 1;
  const periodDiff = endPrice - startPrice;
  const periodPct = startPrice > 0 ? (periodDiff / startPrice) * 100 : stockDetail?.changePercent || 0;
  const isUpPeriod = periodDiff >= 0;

  const strokeColor = isUpPeriod ? '#22c55e' : '#ef4444';

  if (isLoadingDetail) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#d4af6a] border-t-transparent animate-spin" />
        <p className="font-mono text-sm text-[#c2b9ac]">
          Carregando dados oficiais de <strong>{normalizedTicker}</strong> na B3...
        </p>
      </div>
    );
  }

  if (loadError || !stockDetail) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="inline-flex p-3 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold font-mono text-white">Ativo não encontrado</h1>
        <p className="text-sm text-[#a39a8c]">
          {loadError || `Não foi possível carregar as informações para o ticker "${normalizedTicker}".`}
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Link
            to="/mercado"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1c1916] border border-[#d4af6a]/30 text-sm font-mono text-[#d4af6a] hover:bg-[#d4af6a]/15 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o Mercado
          </Link>
        </div>
      </div>
    );
  }

  const isPositiveDay = stockDetail.changePercent >= 0;
  const isFii = stockDetail.category === 'fii' || stockDetail.ticker.endsWith('11');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#141210]/95 backdrop-blur-xl border border-[#d4af6a] text-xs font-mono text-[#f5efe6] shadow-2xl flex items-center gap-2"
          >
            <Star className="w-4 h-4 text-[#d4af6a] fill-[#d4af6a]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb de navegação */}
      <nav className="flex items-center gap-2 text-xs font-mono text-[#8e8579]">
        <Link to="/" className="hover:text-[#d4af6a] transition-colors">
          Início
        </Link>
        <span>/</span>
        <Link to="/mercado" className="hover:text-[#d4af6a] transition-colors">
          Mercado B3
        </Link>
        <span>/</span>
        <span className="text-[#d4af6a] font-bold">{stockDetail.ticker}</span>
      </nav>

      {/* CABEÇALHO DO ATIVO */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#1c1916] to-[#12100e] border border-[#d4af6a]/25 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Lado Esquerdo: Identificação do Ativo */}
          <div className="flex items-start gap-4">
            {stockDetail.logoUrl ? (
              <img
                src={stockDetail.logoUrl}
                alt={stockDetail.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0e0d0b] border border-white/10 p-1.5 object-contain shrink-0 shadow-md"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#2a241e] to-[#141210] border border-[#d4af6a]/30 flex items-center justify-center font-mono font-bold text-lg text-[#d4af6a] shrink-0 shadow-md">
                {stockDetail.ticker.slice(0, 4)}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-tight">
                  {stockDetail.ticker}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#141210] border border-[#d4af6a]/30 text-[#d4af6a] font-semibold">
                  {isFii ? 'Fundo Imobiliário (FII)' : 'Ação B3'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#24201c] text-[#c2b9ac]">
                  {stockDetail.sector || 'Bolsa do Brasil'}
                </span>
              </div>
              <p className="text-sm sm:text-base text-[#c2b9ac] font-medium">
                {stockDetail.name}
              </p>
              {stockDetail.industry && (
                <p className="text-xs text-[#8e8579] font-mono">
                  Sub-segmento: {stockDetail.industry}
                </p>
              )}
            </div>
          </div>

          {/* Lado Direito: Cotação, Variação e Ações */}
          <div className="flex flex-col sm:flex-row sm:items-center lg:items-end justify-between lg:justify-end gap-4 sm:gap-6 border-t sm:border-t-0 pt-4 sm:pt-0 border-white/10">
            <div>
              <div className="text-xs text-[#8e8579] font-mono mb-0.5">Preço Atual</div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-mono font-bold text-white">
                  {formatBRL(stockDetail.price)}
                </span>
                <div
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-mono font-bold ${
                    isPositiveDay
                      ? 'bg-[#15803d]/25 text-[#4ade80] border border-[#22c55e]/30'
                      : 'bg-[#b91c1c]/25 text-[#f87171] border border-[#ef4444]/30'
                  }`}
                >
                  {isPositiveDay ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{formatPercent(stockDetail.changePercent)}</span>
                  <span className="text-xs font-normal opacity-80">
                    ({stockDetail.change >= 0 ? '+' : ''}
                    {formatBRL(stockDetail.change)})
                  </span>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                  isFavorite
                    ? 'bg-[#d4af6a]/20 border-[#d4af6a] text-[#d4af6a]'
                    : 'bg-[#141210] border-white/15 text-[#c2b9ac] hover:text-white hover:border-[#d4af6a]/40'
                }`}
                title="Salvar nos favoritos"
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-[#d4af6a] text-[#d4af6a]' : ''}`} />
                <span>{isFavorite ? 'Favorito' : 'Adicionar aos favoritos'}</span>
              </button>

              <button
                onClick={() => setIsCompareOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-[#141210] border border-white/15 text-[#c2b9ac] hover:text-white hover:border-[#d4af6a]/40 transition-all cursor-pointer"
                title="Comparar com outro ativo da B3"
              >
                <Scale className="w-4 h-4 text-[#d4af6a]" />
                <span>Comparar</span>
              </button>

              <button
                onClick={() =>
                  openWaitlistModal(
                    `Alertas de preço por e-mail em tempo real para ${stockDetail.ticker}`
                  )
                }
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-[#141210] border border-[#d4af6a]/30 text-[#f0d9a8] hover:bg-[#1c1916] transition-all cursor-pointer group"
                title="Criar alerta de preço por e-mail (Recurso Premium)"
              >
                <Bell className="w-4 h-4 text-[#d4af6a] group-hover:scale-110 transition-transform" />
                <span>Alerta</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-[#d4af6a]/20 text-[#f0d9a8] border border-[#d4af6a]/30">
                  VIP
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Linha de Metadados e Selo "Atualizado em" */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs font-mono text-[#8e8579]">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#d4af6a]" />
            <span>
              Atualizado em:{' '}
              <strong className="text-[#f5efe6]">
                {stockDetail.updatedAt
                  ? formatFullDateTimeBR(new Date(stockDetail.updatedAt))
                  : 'Em tempo de pregão'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {stockDetail.isRealData ? (
              <span className="flex items-center gap-1.5 text-[#3ddc97]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Cotação Oficial B3 (brapi.dev)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Modo Demonstração</span>
              </span>
            )}

            {stockDetail.website && (
              <a
                href={stockDetail.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[#d4af6a] hover:underline"
              >
                <span>Site de RI</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* GRÁFICO GRANDE INTERATIVO */}
      <div className="p-6 rounded-2xl bg-[#141210] border border-[#d4af6a]/20 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-mono font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#d4af6a]" />
              <span>Desempenho Histórico</span>
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs font-mono">
              <span className="text-[#8e8579]">Variação no período ({timeframe}):</span>
              <strong className={isUpPeriod ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                {isUpPeriod ? '+' : ''}
                {formatPercent(periodPct)} ({isUpPeriod ? '+' : ''}
                {formatBRL(periodDiff)})
              </strong>
            </div>
          </div>

          {/* Controles de Timeframe e Alternância Linha/Candles */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Alternância Linha/Candles */}
            <div className="flex rounded-lg bg-[#1c1916] border border-white/10 p-0.5">
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                  chartType === 'area'
                    ? 'bg-[#d4af6a] text-[#0b0a09] font-bold'
                    : 'text-[#c2b9ac] hover:text-white'
                }`}
              >
                Linha / Área
              </button>
              <button
                onClick={() => setChartType('candles')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                  chartType === 'candles'
                    ? 'bg-[#d4af6a] text-[#0b0a09] font-bold'
                    : 'text-[#c2b9ac] hover:text-white'
                }`}
              >
                Candlesticks
              </button>
            </div>

            {/* Timeframes: 1D, 1S, 1M, 6M, 1A, 5A */}
            <div className="flex rounded-lg bg-[#1c1916] border border-white/10 p-0.5">
              {(['1D', '1S', '1M', '6M', '1A', '5A'] as TimeframeFilter[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                    timeframe === tf
                      ? 'bg-[#d4af6a] text-[#0b0a09] font-bold'
                      : 'text-[#8e8579] hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Área do Gráfico */}
        <div className="relative w-full h-[380px] bg-[#0c0b09] rounded-xl border border-white/5 p-3 overflow-hidden">
          {isLoadingHistory ? (
            <div className="h-full flex items-center justify-center space-y-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#d4af6a] border-t-transparent animate-spin" />
            </div>
          ) : !historyAvailable || historyData.length < 2 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 font-mono text-xs text-[#8e8579]">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <p>Histórico oficial para o período {timeframe} não retornado pela API para este ativo.</p>
              <p className="text-[11px] text-[#6e675c]">Nenhum dado fictício é sintetizado.</p>
            </div>
          ) : chartType === 'candles' ? (
            <CandlestickChartSvg data={historyData} height={355} />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 15, right: 15, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorStockDetail" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={strokeColor} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#221e1a" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#6e675c"
                  fontSize={11}
                  fontFamily="monospace"
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  stroke="#6e675c"
                  fontSize={11}
                  fontFamily="monospace"
                  tickLine={false}
                  orientation="right"
                  tickFormatter={(val) => formatBRL(val)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as StockHistoryPoint;
                      return (
                        <div className="p-3 rounded-xl bg-[#141210]/95 backdrop-blur-md border border-[#d4af6a]/30 text-xs font-mono shadow-2xl space-y-1">
                          <p className="text-[#8e8579]">{data.date}</p>
                          <p className="text-base font-bold text-white">
                            {formatBRL(data.price)}
                          </p>
                          {data.volume ? (
                            <p className="text-[11px] text-[#c2b9ac]">
                              Vol: {formatVolumeBRL(data.volume)}
                            </p>
                          ) : null}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={startPrice}
                  stroke="#8e8579"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={strokeColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorStockDetail)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Resumo Rápido dos Extremos do Período */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#1c1916] border border-white/5">
            <span className="text-[#8e8579] block">Mínima do Período</span>
            <strong className="text-white text-sm">{formatBRL(minPeriodPrice)}</strong>
          </div>
          <div className="p-3 rounded-xl bg-[#1c1916] border border-white/5">
            <span className="text-[#8e8579] block">Máxima do Período</span>
            <strong className="text-white text-sm">{formatBRL(maxPeriodPrice)}</strong>
          </div>
          <div className="p-3 rounded-xl bg-[#1c1916] border border-white/5">
            <span className="text-[#8e8579] block">Abertura do Período</span>
            <strong className="text-white text-sm">{formatBRL(startPrice)}</strong>
          </div>
          <div className="p-3 rounded-xl bg-[#1c1916] border border-white/5">
            <span className="text-[#8e8579] block">Fechamento do Período</span>
            <strong className="text-white text-sm">{formatBRL(endPrice)}</strong>
          </div>
        </div>
      </div>

      {/* GRADE DE INDICADORES FUNDAMENTALISTAS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#d4af6a]" />
              <span>Grade de Indicadores Fundamentalistas</span>
            </h2>
            <p className="text-xs text-[#8e8579]">
              Métricas auditadas diretamente da API oficial. Indicadores ausentes exibem &quot;n/d&quot;.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* 1. P/L */}
          <div className="p-4 rounded-xl bg-[#141210] border border-[#d4af6a]/15 hover:border-[#d4af6a]/40 transition-colors space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-[#8e8579]">
              <span>P/L (Preço / Lucro)</span>
              <span title="Múltiplo de anos para recuperar o valor investido via lucros">
                <Info className="w-3.5 h-3.5 text-[#d4af6a] cursor-help" />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-white">
              {typeof stockDetail.pl === 'number' ? stockDetail.pl.toFixed(2) : 'n/d'}
            </div>
            <p className="text-[11px] text-[#6e675c]">
              {typeof stockDetail.pl === 'number'
                ? `${stockDetail.pl.toFixed(2)}x lucro líquido anual`
                : 'Indicador não informado na API'}
            </p>
          </div>

          {/* 2. P/VP */}
          <div className="p-4 rounded-xl bg-[#141210] border border-[#d4af6a]/15 hover:border-[#d4af6a]/40 transition-colors space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-[#8e8579]">
              <span>P/VP (Valor Patrimonial)</span>
              <span title="Relação entre cotação e patrimônio líquido por ação">
                <Info className="w-3.5 h-3.5 text-[#d4af6a] cursor-help" />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-white">
              {typeof stockDetail.pvp === 'number' ? stockDetail.pvp.toFixed(2) : 'n/d'}
            </div>
            <p className="text-[11px] text-[#6e675c]">
              {typeof stockDetail.pvp === 'number'
                ? `${stockDetail.pvp.toFixed(2)}x valor patrimonial`
                : 'Indicador não informado na API'}
            </p>
          </div>

          {/* 3. Dividend Yield */}
          <div className="p-4 rounded-xl bg-[#141210] border border-[#d4af6a]/15 hover:border-[#d4af6a]/40 transition-colors space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-[#8e8579]">
              <span>Dividend Yield (12M)</span>
              <DollarSign className="w-3.5 h-3.5 text-[#d4af6a]" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-[#4ade80]">
              {typeof stockDetail.dividendYield === 'number'
                ? `${stockDetail.dividendYield.toFixed(2)}%`
                : 'n/d'}
            </div>
            <p className="text-[11px] text-[#6e675c]">Proventos pagos em 12 meses</p>
          </div>

          {/* 4. ROE */}
          <div className="p-4 rounded-xl bg-[#141210] border border-[#d4af6a]/15 hover:border-[#d4af6a]/40 transition-colors space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-[#8e8579]">
              <span>ROE (Rentabilidade)</span>
              <span className="font-mono text-xs text-[#d4af6a] font-bold">%</span>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-white">
              {typeof stockDetail.roe === 'number' ? `${stockDetail.roe.toFixed(2)}%` : 'n/d'}
            </div>
            <p className="text-[11px] text-[#6e675c]">Retorno sobre o patrimônio</p>
          </div>

          {/* 5. Valor de Mercado */}
          <div className="p-4 rounded-xl bg-[#141210] border border-[#d4af6a]/15 hover:border-[#d4af6a]/40 transition-colors space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-[#8e8579]">
              <span>Valor de Mercado</span>
              <Building2 className="w-3.5 h-3.5 text-[#d4af6a]" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-white">
              {typeof stockDetail.marketCap === 'number'
                ? formatVolumeBRL(stockDetail.marketCap)
                : 'n/d'}
            </div>
            <p className="text-[11px] text-[#6e675c]">Capitalização total da B3</p>
          </div>

          {/* 6. Mínima / Máxima 52 Semanas */}
          <div className="p-4 rounded-xl bg-[#141210] border border-[#d4af6a]/15 hover:border-[#d4af6a]/40 transition-colors space-y-2 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-xs font-mono text-[#8e8579]">
              <span>52 Semanas (Mín / Máx)</span>
              <Activity className="w-3.5 h-3.5 text-[#d4af6a]" />
            </div>
            {stockDetail.fiftyTwoWeekLow && stockDetail.fiftyTwoWeekHigh ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-white">
                  <span>{formatBRL(stockDetail.fiftyTwoWeekLow)}</span>
                  <span>{formatBRL(stockDetail.fiftyTwoWeekHigh)}</span>
                </div>
                {/* Barra com ponteiro da cotação atual */}
                <div className="relative w-full h-2 bg-[#24201c] rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 bg-gradient-to-r from-red-500 via-amber-400 to-green-500 rounded-full"
                    style={{ width: '100%' }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-1.5 bg-white shadow-md"
                    style={{
                      left: `${Math.min(
                        Math.max(
                          0,
                          ((stockDetail.price - stockDetail.fiftyTwoWeekLow) /
                            (stockDetail.fiftyTwoWeekHigh - stockDetail.fiftyTwoWeekLow || 1)) *
                            100
                        ),
                        98
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-xl font-mono font-bold text-white">n/d</div>
            )}
            <p className="text-[11px] text-[#6e675c]">Range no último ano</p>
          </div>

          {/* 7. Volume Diário */}
          <div className="p-4 rounded-xl bg-[#141210] border border-[#d4af6a]/15 hover:border-[#d4af6a]/40 transition-colors space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-[#8e8579]">
              <span>Volume Diário</span>
              <Activity className="w-3.5 h-3.5 text-[#d4af6a]" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-white">
              {typeof stockDetail.volume === 'number' && stockDetail.volume > 0
                ? formatVolumeBRL(stockDetail.volume)
                : 'n/d'}
            </div>
            <p className="text-[11px] text-[#6e675c]">Volume negociado no pregão</p>
          </div>

          {/* 8. Volume Médio */}
          <div className="p-4 rounded-xl bg-[#141210] border border-[#d4af6a]/15 hover:border-[#d4af6a]/40 transition-colors space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-[#8e8579]">
              <span>Volume Médio (10D)</span>
              <Activity className="w-3.5 h-3.5 text-[#d4af6a]" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-white">
              {typeof stockDetail.avgVolume === 'number' && stockDetail.avgVolume > 0
                ? formatVolumeBRL(stockDetail.avgVolume)
                : 'n/d'}
            </div>
            <p className="text-[11px] text-[#6e675c]">Liquidez média recente</p>
          </div>
        </div>
      </div>

      {/* BLOCO: COMPARE COM O SETOR */}
      {sectorComparison && (
        <div className="p-6 rounded-2xl bg-gradient-to-b from-[#181512] to-[#12100e] border border-[#d4af6a]/25 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#d4af6a]" />
                <span>Compare com o Setor: {sectorComparison.sectorName}</span>
              </h2>
              <p className="text-xs text-[#a39a8c]">
                Comparativo estatístico com a mediana calculada de{' '}
                <strong>{sectorComparison.peersCount} ativos</strong> do mesmo setor monitorados na B3.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#24201c] text-[#d4af6a] border border-[#d4af6a]/20">
              Mediana do Setor
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Comparativo P/L */}
            <div className="p-4 rounded-xl bg-[#141210] border border-white/10 space-y-3">
              <div className="text-xs font-mono text-[#8e8579]">Múltiplo P/L</div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-[#8e8579] block font-mono">{stockDetail.ticker}</span>
                  <strong className="text-xl font-mono text-white">
                    {typeof stockDetail.pl === 'number' ? stockDetail.pl.toFixed(2) : 'n/d'}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#8e8579] block font-mono">Mediana Setor</span>
                  <strong className="text-xl font-mono text-[#d4af6a]">
                    {typeof sectorComparison.medianPl === 'number'
                      ? sectorComparison.medianPl.toFixed(2)
                      : 'n/d'}
                  </strong>
                </div>
              </div>
              {typeof stockDetail.pl === 'number' && typeof sectorComparison.medianPl === 'number' && (
                <div
                  className={`text-[11px] font-mono px-2 py-1 rounded text-center ${
                    stockDetail.pl < sectorComparison.medianPl
                      ? 'bg-green-500/15 text-green-300'
                      : 'bg-amber-500/15 text-amber-300'
                  }`}
                >
                  {stockDetail.pl < sectorComparison.medianPl
                    ? 'Abaixo da mediana (Mais descontado)'
                    : 'Acima da mediana do setor'}
                </div>
              )}
            </div>

            {/* Comparativo P/VP */}
            <div className="p-4 rounded-xl bg-[#141210] border border-white/10 space-y-3">
              <div className="text-xs font-mono text-[#8e8579]">Múltiplo P/VP</div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-[#8e8579] block font-mono">{stockDetail.ticker}</span>
                  <strong className="text-xl font-mono text-white">
                    {typeof stockDetail.pvp === 'number' ? stockDetail.pvp.toFixed(2) : 'n/d'}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#8e8579] block font-mono">Mediana Setor</span>
                  <strong className="text-xl font-mono text-[#d4af6a]">
                    {typeof sectorComparison.medianPvp === 'number'
                      ? sectorComparison.medianPvp.toFixed(2)
                      : 'n/d'}
                  </strong>
                </div>
              </div>
              {typeof stockDetail.pvp === 'number' && typeof sectorComparison.medianPvp === 'number' && (
                <div
                  className={`text-[11px] font-mono px-2 py-1 rounded text-center ${
                    stockDetail.pvp < sectorComparison.medianPvp
                      ? 'bg-green-500/15 text-green-300'
                      : 'bg-amber-500/15 text-amber-300'
                  }`}
                >
                  {stockDetail.pvp < sectorComparison.medianPvp
                    ? 'Abaixo da mediana patrimonial'
                    : 'Acima da mediana do setor'}
                </div>
              )}
            </div>

            {/* Comparativo Dividend Yield */}
            <div className="p-4 rounded-xl bg-[#141210] border border-white/10 space-y-3">
              <div className="text-xs font-mono text-[#8e8579]">Dividend Yield (12M)</div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-[#8e8579] block font-mono">{stockDetail.ticker}</span>
                  <strong className="text-xl font-mono text-[#4ade80]">
                    {typeof stockDetail.dividendYield === 'number'
                      ? `${stockDetail.dividendYield.toFixed(2)}%`
                      : 'n/d'}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#8e8579] block font-mono">Mediana Setor</span>
                  <strong className="text-xl font-mono text-[#d4af6a]">
                    {typeof sectorComparison.medianDy === 'number'
                      ? `${sectorComparison.medianDy.toFixed(2)}%`
                      : 'n/d'}
                  </strong>
                </div>
              </div>
              {typeof stockDetail.dividendYield === 'number' && typeof sectorComparison.medianDy === 'number' && (
                <div
                  className={`text-[11px] font-mono px-2 py-1 rounded text-center ${
                    stockDetail.dividendYield >= sectorComparison.medianDy
                      ? 'bg-green-500/15 text-green-300'
                      : 'bg-amber-500/15 text-amber-300'
                  }`}
                >
                  {stockDetail.dividendYield >= sectorComparison.medianDy
                    ? 'Rendimento acima da mediana'
                    : 'Rendimento abaixo da mediana'}
                </div>
              )}
            </div>

            {/* Comparativo ROE */}
            <div className="p-4 rounded-xl bg-[#141210] border border-white/10 space-y-3">
              <div className="text-xs font-mono text-[#8e8579]">ROE (Retorno s/ PL)</div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-[#8e8579] block font-mono">{stockDetail.ticker}</span>
                  <strong className="text-xl font-mono text-white">
                    {typeof stockDetail.roe === 'number' ? `${stockDetail.roe.toFixed(2)}%` : 'n/d'}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#8e8579] block font-mono">Mediana Setor</span>
                  <strong className="text-xl font-mono text-[#d4af6a]">
                    {typeof sectorComparison.medianRoe === 'number'
                      ? `${sectorComparison.medianRoe.toFixed(2)}%`
                      : 'n/d'}
                  </strong>
                </div>
              </div>
              {typeof stockDetail.roe === 'number' && typeof sectorComparison.medianRoe === 'number' && (
                <div
                  className={`text-[11px] font-mono px-2 py-1 rounded text-center ${
                    stockDetail.roe >= sectorComparison.medianRoe
                      ? 'bg-green-500/15 text-green-300'
                      : 'bg-amber-500/15 text-amber-300'
                  }`}
                >
                  {stockDetail.roe >= sectorComparison.medianRoe
                    ? 'Rentabilidade superior à mediana'
                    : 'Rentabilidade inferior à mediana'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HISTÓRICO DE PROVENTOS (TABELA + GRÁFICO DE BARRAS POR ANO) */}
      <div className="p-6 rounded-2xl bg-[#141210] border border-[#d4af6a]/20 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#d4af6a]" />
              <span>Histórico de Proventos & Dividendos</span>
            </h2>
            <p className="text-xs text-[#8e8579]">
              Distribuições oficiais registradas na B3. NUNCA inventamos valores.
            </p>
          </div>

          {/* Filtros da tabela */}
          <div className="flex rounded-lg bg-[#1c1916] border border-white/10 p-0.5 text-xs font-mono">
            {(['todos', 'DIVIDENDO', 'JCP'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setDividendTypeFilter(t)}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  dividendTypeFilter === t
                    ? 'bg-[#d4af6a] text-[#0b0a09] font-bold'
                    : 'text-[#8e8579] hover:text-white'
                }`}
              >
                {t === 'todos' ? 'Todos' : t === 'DIVIDENDO' ? 'Dividendos' : 'JCP'}
              </button>
            ))}
          </div>
        </div>

        {/* Gráfico de Barras por Ano */}
        {stockDetail.dividendsByYear && stockDetail.dividendsByYear.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-xs font-mono text-[#d4af6a] uppercase tracking-wider">
              Total Distribuído por Ação por Ano (R$)
            </h3>
            <div className="h-64 bg-[#0c0b09] rounded-xl border border-white/5 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stockDetail.dividendsByYear}
                  margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#221e1a" vertical={false} />
                  <XAxis
                    dataKey="year"
                    stroke="#6e675c"
                    fontSize={11}
                    fontFamily="monospace"
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#6e675c"
                    fontSize={11}
                    fontFamily="monospace"
                    tickLine={false}
                    tickFormatter={(val) => `R$ ${val}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="p-3 rounded-xl bg-[#141210]/95 backdrop-blur-md border border-[#d4af6a]/30 text-xs font-mono shadow-2xl space-y-1">
                            <span className="text-[#8e8579]">Ano {item.year}</span>
                            <p className="text-base font-bold text-[#4ade80]">
                              {formatBRL(item.total)} por ação
                            </p>
                            <p className="text-[11px] text-[#c2b9ac]">
                              {item.count} provento(s) distribuído(s)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="total" fill="#d4af6a" radius={[4, 4, 0, 0]}>
                    {stockDetail.dividendsByYear.map((_, idx) => (
                      <Cell key={`bar-${idx}`} fill={idx % 2 === 0 ? '#d4af6a' : '#b8944d'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : null}

        {/* Tabela de Proventos Recentes */}
        {filteredDividends.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#1c1916] text-[#8e8579] uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Valor por Ação</th>
                  <th className="py-3 px-4">Data de Pagamento</th>
                  <th className="py-3 px-4">Data com / Ex</th>
                  <th className="py-3 px-4">Aprovação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#c2b9ac]">
                {filteredDividends.slice(0, 15).map((div, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          div.label.includes('JCP')
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                            : 'bg-green-500/15 text-green-300 border border-green-500/20'
                        }`}
                      >
                        {div.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {formatBRL(div.rate)}
                    </td>
                    <td className="py-3 px-4">
                      {div.paymentDate && div.paymentDate !== 'A definir'
                        ? new Date(div.paymentDate).toLocaleDateString('pt-BR')
                        : 'A definir'}
                    </td>
                    <td className="py-3 px-4">
                      {div.lastDatePrior
                        ? new Date(div.lastDatePrior).toLocaleDateString('pt-BR')
                        : '—'}
                    </td>
                    <td className="py-3 px-4 text-[#8e8579]">
                      {div.approvedOn
                        ? new Date(div.approvedOn).toLocaleDateString('pt-BR')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs font-mono text-[#8e8579] border border-white/5 rounded-xl">
            Nenhum histórico recente de proventos registrado na B3 para este ativo no filtro selecionado.
          </div>
        )}
      </div>

      {/* BLOCO: EXPLICAR COM IA JÁ INTEGRADO NA PÁGINA COM AVISO LEGAL */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#1f1b16] via-[#141210] to-[#0d0c0a] border border-[#d4af6a]/30 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#d4af6a]/15 text-[#d4af6a] border border-[#d4af6a]/30">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-mono font-bold text-white">
                  Análise Didática com Inteligência Artificial
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  isPremium
                    ? 'bg-[#d4af6a]/20 text-[#f0d9a8] border-[#d4af6a]/30'
                    : 'bg-[#141210] text-[#c2b9ac] border-[#d4af6a]/15'
                }`}>
                  {isPremium ? '⭐ IA Ilimitada' : `${Math.min(aiUsageToday, 3)}/3 hoje`}
                </span>
              </div>
              <p className="text-xs text-[#a39a8c]">
                Síntese contextual gerada com Google Gemini sobre os fundamentos e movimentação de {stockDetail.ticker}.
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateAi}
            disabled={isLoadingAi}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#d4af6a] hover:bg-[#e2c17f] text-[#0b0a09] font-mono text-xs font-bold transition-all shadow-lg hover:shadow-[#d4af6a]/20 cursor-pointer disabled:opacity-60 shrink-0"
          >
            {isLoadingAi ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-[#0b0a09] border-t-transparent animate-spin" />
                <span>Processando análise...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{aiExplanation ? 'Atualizar Análise' : 'Explicar com IA'}</span>
              </>
            )}
          </button>
        </div>

        {/* Quota reached notice if on Free and daily 3 reached */}
        {!canUseAi && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-300">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Você atingiu o limite de 3 explicações de IA por dia no plano Gratuito.</span>
            </div>
            <button
              onClick={() => openWaitlistModal('Limite de 3 explicações de IA diárias atingido')}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#d4af6a] to-[#e6ca85] text-[#0a0908] text-xs font-bold transition-all hover:brightness-110 flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Desbloquear Ilimitada</span>
            </button>
          </div>
        )}

        {/* Resposta da IA ou Call to Action */}
        {aiExplanation ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl bg-[#0e0d0b] border border-[#d4af6a]/20 space-y-4"
          >
            <div className="prose prose-invert max-w-none text-xs sm:text-sm text-[#e0d8cc] leading-relaxed whitespace-pre-line">
              {aiExplanation}
            </div>

            {/* Aviso Legal Mandatório */}
            <div className="p-3 rounded-lg bg-[#141210] border border-amber-500/30 text-[11px] font-mono text-amber-300/90 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Aviso Legal Importante:</strong> {aiDisclaimer}
              </span>
            </div>
          </motion.div>
        ) : (
          <div className="p-6 rounded-xl bg-[#0e0d0b]/70 border border-white/5 text-center space-y-3">
            <p className="text-xs sm:text-sm text-[#a39a8c] max-w-2xl mx-auto">
              Clique no botão <strong>&quot;Explicar com IA&quot;</strong> para que o modelo processe os
              indicadores de {stockDetail.ticker} (P/L {stockDetail.pl ?? 'n/d'}, P/VP {stockDetail.pvp ?? 'n/d'}, DY {stockDetail.dividendYield ?? 'n/d'}%), o cenário macroeconômico atual da B3 e forneça uma síntese clara e didática sem jargões.
            </p>
            <div className="text-[11px] font-mono text-[#6e675c]">
              Conteúdo informativo e educacional. Não constitui recomendação de compra ou venda.
            </div>
          </div>
        )}
      </div>

      {/* SOBRE A COMPANHIA (se houver descrição na API) */}
      {stockDetail.description && (
        <div className="p-6 rounded-2xl bg-[#141210] border border-white/10 space-y-3">
          <h2 className="text-base font-mono font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#d4af6a]" />
            <span>Sobre a Companhia / Emissor</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#a39a8c] leading-relaxed whitespace-pre-line">
            {stockDetail.description}
          </p>
        </div>
      )}

      {/* MODAL DE COMPARAÇÃO COM OUTRO ATIVO */}
      <AnimatePresence>
        {isCompareOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-[#141210] border border-[#d4af6a]/30 rounded-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-[#d4af6a]" />
                  <h3 className="text-lg font-mono font-bold text-white">
                    Comparar {stockDetail.ticker} com outro ativo da B3
                  </h3>
                </div>
                <button
                  onClick={() => setIsCompareOpen(false)}
                  className="p-1 rounded-lg text-[#8e8579] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Seletor do segundo ativo */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-[#8e8579] block">
                  Selecione o ativo para comparação:
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-[#8e8579] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={compareSearch}
                    onChange={(e) => setCompareSearch(e.target.value)}
                    placeholder="Buscar por ticker ou nome (ex: VALE3, ITUB4)..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1c1916] border border-white/15 text-xs text-white placeholder-[#6e675c] focus:outline-none focus:border-[#d4af6a]"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {availableToCompare.map((item) => (
                    <button
                      key={item.ticker}
                      onClick={() => setCompareTargetTicker(item.ticker)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                        compareTargetTicker === item.ticker
                          ? 'bg-[#d4af6a] text-[#0b0a09] font-bold'
                          : 'bg-[#1c1916] text-[#c2b9ac] border border-white/10 hover:border-[#d4af6a]/40'
                      }`}
                    >
                      {item.ticker} ({item.name.slice(0, 15)})
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabela Comparativa Lado a Lado */}
              {compareTargetStock ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#1c1916] text-[#8e8579] uppercase tracking-wider border-b border-white/10">
                        <tr>
                          <th className="py-3 px-4">Métrica</th>
                          <th className="py-3 px-4 text-[#d4af6a] font-bold text-sm">
                            {stockDetail.ticker}
                          </th>
                          <th className="py-3 px-4 text-[#3ddc97] font-bold text-sm">
                            {compareTargetStock.ticker}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-[#c2b9ac]">
                        <tr>
                          <td className="py-3 px-4 text-[#8e8579]">Nome</td>
                          <td className="py-3 px-4 font-bold text-white">{stockDetail.name}</td>
                          <td className="py-3 px-4 font-bold text-white">{compareTargetStock.name}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-[#8e8579]">Cotação</td>
                          <td className="py-3 px-4 text-white font-bold">{formatBRL(stockDetail.price)}</td>
                          <td className="py-3 px-4 text-white font-bold">{formatBRL(compareTargetStock.price)}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-[#8e8579]">Variação Dia</td>
                          <td
                            className={`py-3 px-4 font-bold ${
                              stockDetail.changePercent >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'
                            }`}
                          >
                            {formatPercent(stockDetail.changePercent)}
                          </td>
                          <td
                            className={`py-3 px-4 font-bold ${
                              compareTargetStock.changePercent >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'
                            }`}
                          >
                            {formatPercent(compareTargetStock.changePercent)}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-[#8e8579]">P/L</td>
                          <td className="py-3 px-4">{stockDetail.pl ? stockDetail.pl.toFixed(2) : 'n/d'}</td>
                          <td className="py-3 px-4">{compareTargetStock.pl ? compareTargetStock.pl.toFixed(2) : 'n/d'}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-[#8e8579]">P/VP</td>
                          <td className="py-3 px-4">{stockDetail.pvp ? stockDetail.pvp.toFixed(2) : 'n/d'}</td>
                          <td className="py-3 px-4">{compareTargetStock.pvp ? compareTargetStock.pvp.toFixed(2) : 'n/d'}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-[#8e8579]">Dividend Yield (12M)</td>
                          <td className="py-3 px-4 text-[#4ade80] font-bold">
                            {stockDetail.dividendYield ? `${stockDetail.dividendYield.toFixed(2)}%` : 'n/d'}
                          </td>
                          <td className="py-3 px-4 text-[#4ade80] font-bold">
                            {compareTargetStock.dividendYield ? `${compareTargetStock.dividendYield.toFixed(2)}%` : 'n/d'}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-[#8e8579]">ROE</td>
                          <td className="py-3 px-4">{stockDetail.roe ? `${stockDetail.roe.toFixed(2)}%` : 'n/d'}</td>
                          <td className="py-3 px-4">{compareTargetStock.roe ? `${compareTargetStock.roe.toFixed(2)}%` : 'n/d'}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-[#8e8579]">Valor de Mercado</td>
                          <td className="py-3 px-4">
                            {stockDetail.marketCap ? formatVolumeBRL(stockDetail.marketCap) : 'n/d'}
                          </td>
                          <td className="py-3 px-4">
                            {compareTargetStock.marketCap ? formatVolumeBRL(compareTargetStock.marketCap) : 'n/d'}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-[#8e8579]">Setor</td>
                          <td className="py-3 px-4">{stockDetail.sector}</td>
                          <td className="py-3 px-4">{compareTargetStock.sector}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => {
                        navigate(`/mercado/${compareTargetStock.ticker}`);
                        setIsCompareOpen(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#d4af6a] text-[#0b0a09] font-mono font-bold text-xs hover:bg-[#e2c17f] transition-colors"
                    >
                      Ir para página de {compareTargetStock.ticker} →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs font-mono text-[#8e8579] border border-white/5 rounded-xl">
                  Selecione um ativo acima para ver o comparativo completo lado a lado.
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
