import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { StockItem, TimeframeFilter, StockHistoryPoint } from '../types/market';
import { fetchStockHistory } from '../services/marketService';
import { formatBRL, formatPercent, formatVolumeBRL, formatFullDateTimeBR } from '../utils/formatters';
import { X, Sparkles, Clock, AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface StockChartModalProps {
  stock: StockItem | null;
  onClose: () => void;
  onExplainAi: (stock: StockItem) => void;
}

export const StockChartModal: React.FC<StockChartModalProps> = ({
  stock,
  onClose,
  onExplainAi,
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('1M');
  const [historyData, setHistoryData] = useState<StockHistoryPoint[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isHistoryAvailable, setIsHistoryAvailable] = useState(true);
  const [historyUpdatedAt, setHistoryUpdatedAt] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Fetch real history on asset or timeframe change
  useEffect(() => {
    if (!stock) return;

    let isMounted = true;
    setIsLoadingHistory(true);

    fetchStockHistory(stock.ticker, timeframe)
      .then((res) => {
        if (!isMounted) return;
        setHistoryData(res.history);
        setIsHistoryAvailable(res.available);
        setHistoryUpdatedAt(res.updatedAt);
        setIsLoadingHistory(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setHistoryData([]);
        setIsHistoryAvailable(false);
        setIsLoadingHistory(false);
      });

    return () => {
      isMounted = false;
    };
  }, [stock, timeframe]);

  if (!stock) return null;

  const prices = historyData.map((d) => d.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : stock.low24h || stock.price;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : stock.high24h || stock.price;
  const startPrice = prices[0] || stock.openPrice || stock.price;
  const currentPrice = prices.length > 0 ? prices[prices.length - 1] : stock.price;
  const periodDiff = currentPrice - startPrice;
  const periodPct = startPrice > 0 ? (periodDiff / startPrice) * 100 : stock.changePercent;
  const isUp = periodDiff >= 0;

  // Chart color dynamically matching period trend (#3ddc97 / #ff5c6c)
  const strokeColor = isUp ? '#3ddc97' : '#ff5c6c';
  const fillColor = isUp ? '#3ddc97' : '#ff5c6c';

  const timeframes: { label: string; value: TimeframeFilter }[] = [
    { label: '1D', value: '1D' },
    { label: '1S', value: '1S' },
    { label: '1M', value: '1M' },
    { label: '6M', value: '6M' },
    { label: '1A', value: '1A' },
  ];

  const isFii = stock.category === 'fii' || stock.ticker.endsWith('11');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative w-full max-w-4xl bg-[#141210] border border-[#d4af6a]/25 rounded-[16px] shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-[#d4af6a]/15 bg-[#1c1916]/70">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <span className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-[#f5efe6] tracking-tight">
                {stock.ticker}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#141210] text-[#d4af6a] border border-[#d4af6a]/25 font-semibold">
                B3 • {isFii ? 'Fundo Imobiliário' : 'Ações'}
              </span>
              <span className="text-xs text-[#a39a8c] hidden sm:inline font-normal">
                {stock.sector}
              </span>

              {/* Timestamp Indicator */}
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#a39a8c] bg-[#141210] px-2 py-0.5 rounded border border-[#d4af6a]/10">
                <Clock className="w-3 h-3 text-[#d4af6a]" />
                <span>Atualizado em {formatFullDateTimeBR(historyUpdatedAt || stock.updatedAt || new Date())}</span>
              </span>
            </div>
            <h3 className="text-sm font-serif text-[#a39a8c] font-normal">
              {stock.name}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onExplainAi(stock)}
              className="relative group p-[1px] rounded-[8px] overflow-hidden transition-all duration-200 cursor-pointer shadow-sm"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#d4af6a] via-[#f0d9a8] to-[#b58d46] opacity-75 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-[7px] bg-[#141210] group-hover:bg-[#1c1916] text-xs font-semibold text-[#f0d9a8] transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-[#d4af6a] group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Explicar com IA</span>
                <span className="sm:hidden font-mono">IA</span>
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-[8px] bg-[#141210] hover:bg-[#1c1916] text-[#a39a8c] hover:text-[#f5efe6] border border-[#d4af6a]/15 transition-colors cursor-pointer"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Price & Sliding Timeframe Selector Bar */}
        <div className="px-5 sm:px-6 py-4 bg-[#141210] border-b border-[#d4af6a]/15 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-3">
              <span className="font-mono tabular-nums text-2xl sm:text-3xl font-extrabold text-[#f5efe6]">
                {formatBRL(stock.price)}
              </span>
              <span
                className="inline-flex items-center gap-1 font-mono tabular-nums text-xs font-bold px-2.5 py-1 rounded-full"
                style={{
                  color: strokeColor,
                  backgroundColor: isUp ? 'rgba(61, 220, 151, 0.1)' : 'rgba(255, 92, 108, 0.1)',
                  border: `1px solid ${isUp ? 'rgba(61, 220, 151, 0.25)' : 'rgba(255, 92, 108, 0.25)'}`,
                }}
              >
                <span>{isUp ? '▲' : '▼'}</span>
                <span>{formatPercent(periodPct, false)}</span>
              </span>
            </div>
            {isHistoryAvailable && historyData.length >= 2 ? (
              <span className="text-xs text-[#a39a8c] font-mono mt-1 block">
                Histórico real ({timeframe}): {isUp ? '+' : ''}{formatBRL(periodDiff)} (Abertura: {formatBRL(startPrice)})
              </span>
            ) : (
              <span className="text-xs text-[#8c8273] font-mono mt-1 block">
                Cotação mais recente do pregão da B3
              </span>
            )}
          </div>

          {/* Sliding Pill Selector */}
          <div className="flex items-center bg-[#1c1916] p-1 rounded-full border border-[#d4af6a]/20">
            {timeframes.map((tf) => {
              const isActive = timeframe === tf.value;
              return (
                <button
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value)}
                  className={`relative px-3.5 py-1 rounded-full text-xs font-mono font-medium transition-colors cursor-pointer ${
                    isActive ? 'text-[#0b0a09] font-bold' : 'text-[#a39a8c] hover:text-[#f5efe6]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeChartTimeframe"
                      className="absolute inset-0 bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] rounded-full shadow-md shadow-[#d4af6a]/25"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{tf.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recharts Area Container or '—' when history unavailable */}
        <div className="p-4 sm:p-6 flex-1 min-h-[260px] sm:min-h-[320px] bg-[#0b0a09]/80 flex flex-col justify-center">
          {isLoadingHistory ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#d4af6a] border-t-transparent animate-spin" />
              <p className="text-xs font-mono text-[#c2b9ac]">Consultando histórico real na API brapi.dev...</p>
            </div>
          ) : isHistoryAvailable && historyData.length >= 2 ? (
            <ResponsiveContainer width="100%" height={290}>
              <AreaChart data={historyData} margin={{ top: 12, right: 15, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="proStockGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={fillColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={fillColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 106, 0.08)" vertical={false} />

                <XAxis
                  dataKey="date"
                  stroke="#6e675c"
                  tick={{ fontSize: 11, fill: '#a39a8c', fontFamily: 'Space Grotesk' }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#6e675c"
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 11, fill: '#a39a8c', fontFamily: 'Space Grotesk' }}
                  tickFormatter={(val) => `R$${val.toFixed(1)}`}
                  tickLine={false}
                />

                <ReferenceLine
                  y={startPrice}
                  stroke="rgba(212, 175, 106, 0.25)"
                  strokeDasharray="4 4"
                  label={{
                    value: `Abertura ${formatBRL(startPrice)}`,
                    fill: '#d4af6a',
                    fontSize: 10,
                    fontFamily: 'Space Grotesk',
                    position: 'insideTopRight',
                  }}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const diff = data.price - startPrice;
                      const pct = startPrice > 0 ? (diff / startPrice) * 100 : 0;
                      const ptUp = diff >= 0;

                      return (
                        <div className="bg-[#141210]/95 backdrop-blur-md border border-[#d4af6a]/30 p-3.5 rounded-[12px] shadow-[0_12px_36px_rgba(0,0,0,0.8)] font-mono text-xs space-y-1">
                          <div className="text-[#a39a8c] text-[10px] uppercase tracking-wider flex items-center justify-between gap-4">
                            <span>{data.date}</span>
                            <span className={ptUp ? 'text-[#3ddc97]' : 'text-[#ff5c6c]'}>
                              {ptUp ? '+' : ''}{formatPercent(pct)}
                            </span>
                          </div>
                          <div className="text-[#f5efe6] font-bold text-base tabular-nums">
                            {formatBRL(data.price)}
                          </div>
                          {data.volume ? (
                            <div className="text-[#6e675c] text-[10px] tabular-nums pt-1 border-t border-white/5">
                              Volume: {formatVolumeBRL(data.volume)}
                            </div>
                          ) : null}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={strokeColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#proStockGradient)"
                  isAnimationActive={true}
                  animationDuration={700}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="text-5xl font-mono text-[#a39a8c] font-light">—</div>
              <p className="text-sm font-serif text-[#f5efe6]">
                Histórico de preços indisponível para {stock.ticker} no período {timeframe}
              </p>
              <p className="text-xs text-[#a39a8c] max-w-md font-sans leading-relaxed">
                Este ativo não possui série temporal fornecida pela API no intervalo selecionado. Seguindo as diretrizes de transparência, gráficos nunca utilizam curvas aleatórias ou inventadas.
              </p>
              {!stock.isRealData && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs font-mono font-bold mt-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dados de demonstração</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stock Metrics Footer */}
        <div className="p-4 sm:p-6 bg-[#1c1916]/70 border-t border-[#d4af6a]/15">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs">
            <div className="p-3.5 rounded-[10px] bg-[#141210] border border-[#d4af6a]/15">
              <span className="text-[#a39a8c] uppercase font-mono tracking-wider text-[10px] block">
                Mínima {isHistoryAvailable && historyData.length >= 2 ? `(${timeframe})` : '24h'}
              </span>
              <span className="font-mono tabular-nums font-semibold text-[#f5efe6] text-sm mt-0.5 block">
                {formatBRL(minPrice)}
              </span>
            </div>

            <div className="p-3.5 rounded-[10px] bg-[#141210] border border-[#d4af6a]/15">
              <span className="text-[#a39a8c] uppercase font-mono tracking-wider text-[10px] block">
                Máxima {isHistoryAvailable && historyData.length >= 2 ? `(${timeframe})` : '24h'}
              </span>
              <span className="font-mono tabular-nums font-semibold text-[#f5efe6] text-sm mt-0.5 block">
                {formatBRL(maxPrice)}
              </span>
            </div>

            <div className="p-3.5 rounded-[10px] bg-[#141210] border border-[#d4af6a]/15">
              <span className="text-[#a39a8c] uppercase font-mono tracking-wider text-[10px] block">
                Volume 24h
              </span>
              <span className="font-mono tabular-nums font-semibold text-[#f5efe6] text-sm mt-0.5 block">
                {formatVolumeBRL(stock.volume)}
              </span>
            </div>

            <div className="p-3.5 rounded-[10px] bg-[#141210] border border-[#d4af6a]/15">
              <span className="text-[#a39a8c] uppercase font-mono tracking-wider text-[10px] block">
                Valor de Mercado
              </span>
              <span className="font-mono tabular-nums font-semibold text-[#f5efe6] text-sm mt-0.5 block">
                {stock.marketCap ? formatVolumeBRL(stock.marketCap) : 'N/D'}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6e675c] font-mono">
            <span>Histórico oficial brapi.dev / Pregão B3 • Abertura sinalizada em linha pontilhada</span>
            <span className="text-[#d4af6a]">B3 Brasil, Bolsa, Balcão</span>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
