import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { StockItem } from '../types/market';
import { formatBRL, formatPercent, formatVolumeBRL, formatFullDateTimeBR } from '../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  Sparkles,
  Search,
  Flame,
  Layers,
  AlertTriangle,
  Clock,
  Building2,
} from 'lucide-react';

interface StocksSectionProps {
  stocks: StockItem[];
  isLoading: boolean;
  isDemoMode?: boolean;
  lastUpdated?: Date;
  onSelectStockForChart: (stock: StockItem) => void;
  onSelectStockForAi: (stock: StockItem) => void;
}

type TabType = 'altas' | 'baixas' | 'negociadas' | 'acoes' | 'fiis' | 'todas';

// Subtle metallic avatar for stocks
function getStockAvatar(ticker: string) {
  const clean = ticker.replace(/\d/g, '').slice(0, 3);
  return { initials: clean || 'B3', gradient: 'from-[#24201c] to-[#141210]' };
}

// Mini SVG Sparkline Component for Table Row & Mobile Card
// Strictly uses real historical price data from the API (brapi.dev).
// If real history is unavailable, renders '—' without generating any synthetic curve!
export const MiniSparkline: React.FC<{
  stock: StockItem;
  width?: number;
  height?: number;
}> = ({ stock, width = 76, height = 28 }) => {
  const isUp = stock.changePercent >= 0;
  const strokeColor = isUp ? '#3ddc97' : '#ff5c6c';
  const gradId = `spark-${stock.ticker}`;

  const hasRealHistory = Array.isArray(stock.sparkline) && stock.sparkline.length >= 2;

  const points = useMemo(() => {
    if (!hasRealHistory || !stock.sparkline) return [];

    const raw = stock.sparkline;
    const min = Math.min(...raw);
    const max = Math.max(...raw);
    const range = max - min || 1;

    return raw.map((val, idx) => {
      const x = (idx / (raw.length - 1)) * (width - 4) + 2;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
  }, [hasRealHistory, stock.sparkline, width, height]);

  if (!hasRealHistory || points.length < 2) {
    return (
      <div
        className="flex items-center justify-center font-mono text-xs text-[#8c8273] select-none h-6 w-16 mx-auto"
        title="Histórico real de preços indisponível para este ativo na API"
      >
        —
      </div>
    );
  }

  const polylineStr = points.join(' ');
  const areaPoints = `0,${height} ${polylineStr} ${width},${height}`;

  return (
    <svg
      width={width}
      height={height}
      className="overflow-visible inline-block shrink-0"
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
        </linearGradient>
      </defs>

      <polygon points={areaPoints} fill={`url(#${gradId})`} />

      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polylineStr}
      />

      {points.length > 0 && (
        <circle
          cx={points[points.length - 1].split(',')[0]}
          cy={points[points.length - 1].split(',')[1]}
          r="2.2"
          fill={strokeColor}
        />
      )}
    </svg>
  );
};

export const StocksSection: React.FC<StocksSectionProps> = ({
  stocks,
  isLoading,
  isDemoMode = false,
  lastUpdated,
  onSelectStockForChart,
  onSelectStockForAi,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('altas');
  const [searchTerm, setSearchTerm] = useState('');

  const prevPricesRef = useRef<Map<string, number>>(new Map());
  const [flashMap, setFlashMap] = useState<Map<string, 'up' | 'down'>>(new Map());

  useEffect(() => {
    const newFlashes = new Map<string, 'up' | 'down'>();
    let hasChanges = false;

    stocks.forEach((s) => {
      const prev = prevPricesRef.current.get(s.ticker);
      if (prev !== undefined && prev !== s.price) {
        newFlashes.set(s.ticker, s.price > prev ? 'up' : 'down');
        hasChanges = true;
      }
      prevPricesRef.current.set(s.ticker, s.price);
    });

    if (hasChanges) {
      setFlashMap(newFlashes);
      const timer = setTimeout(() => {
        setFlashMap(new Map());
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    let result = [...stocks];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.ticker.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          (s.sector?.toLowerCase() || '').includes(q)
      );
    }

    switch (activeTab) {
      case 'altas':
        return result.sort((a, b) => b.changePercent - a.changePercent);
      case 'baixas':
        return result.sort((a, b) => a.changePercent - b.changePercent);
      case 'negociadas':
        return result.sort((a, b) => b.volume - a.volume);
      case 'acoes':
        return result
          .filter((s) => s.category !== 'fii' && !s.ticker.endsWith('11'))
          .sort((a, b) => b.volume - a.volume);
      case 'fiis':
        return result
          .filter((s) => s.category === 'fii' || s.ticker.endsWith('11'))
          .sort((a, b) => b.volume - a.volume);
      case 'todas':
      default:
        return result.sort((a, b) => a.ticker.localeCompare(b.ticker));
    }
  }, [stocks, activeTab, searchTerm]);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'altas', label: 'Maiores Altas', icon: <TrendingUp className="w-3.5 h-3.5 text-[#3ddc97]" /> },
    { id: 'baixas', label: 'Maiores Baixas', icon: <TrendingDown className="w-3.5 h-3.5 text-[#ff5c6c]" /> },
    { id: 'negociadas', label: 'Mais Negociadas', icon: <Flame className="w-3.5 h-3.5 text-[#d4af6a]" /> },
    { id: 'acoes', label: 'Ações B3', icon: <Layers className="w-3.5 h-3.5 text-[#f0d9a8]" /> },
    { id: 'fiis', label: 'Fundos Imobiliários (FIIs)', icon: <Building2 className="w-3.5 h-3.5 text-[#d4af6a]" /> },
    { id: 'todas', label: 'Todos os Ativos', icon: <Layers className="w-3.5 h-3.5 text-[#c2b9ac]" /> },
  ];

  const updateLabel = formatFullDateTimeBR(lastUpdated || new Date());

  return (
    <section id="mercado" className="py-16 sm:py-24 bg-[#0b0a09]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2.5">
              <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#d4af6a] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af6a] shadow-[0_0_6px_#d4af6a]" />
                Painel B3 • Atualizado a cada 60 segundos
              </div>

              {/* Exact Origin Timestamp */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#141210] border border-[#d4af6a]/20 text-xs font-mono text-[#c2b9ac]">
                <Clock className="w-3 h-3 text-[#d4af6a]" />
                <span>Atualizado em {updateLabel}</span>
              </div>

              {/* Visible Demo Mode Badge */}
              {isDemoMode && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>Dados de demonstração</span>
                </span>
              )}
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#f5efe6] tracking-tight">
              Ativos em Destaque
            </h2>
            <p className="text-sm text-[#c2b9ac] mt-2 max-w-xl font-normal leading-relaxed">
              Cotações da B3 atualizadas a cada 60 segundos com sparklines reais e análise de volume. Clique em qualquer ativo para abrir o gráfico ou consultar a síntese com IA.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a39a8c]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar ticker ou empresa (ex: PETR4, MXRF11)..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#141210] border border-[#d4af6a]/20 focus:border-[#d4af6a] rounded-[10px] text-xs sm:text-sm text-[#f5efe6] placeholder:text-[#8c8273] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Sliding Pill Tabs (Framer Motion) */}
        <div className="flex items-center p-1 rounded-full bg-[#141210] border border-[#d4af6a]/15 w-fit max-w-full overflow-x-auto scrollbar-none mb-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                  isActive ? 'text-[#0b0a09]' : 'text-[#c2b9ac] hover:text-[#f5efe6]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeStockTab"
                    className="absolute inset-0 bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] rounded-full shadow-md shadow-[#d4af6a]/25"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {tab.icon}
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table Origin and Mode Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 mb-3 rounded-[10px] bg-[#141210] border border-[#d4af6a]/15 text-xs font-mono">
          <div className="flex items-center gap-2 text-[#c2b9ac]">
            <Clock className="w-3.5 h-3.5 text-[#d4af6a]" />
            <span>Atualizado em {updateLabel}</span>
            <span className="text-[#6e675c]">•</span>
            <span className="text-[#a39a8c]">{filteredStocks.length} ativos exibidos</span>
          </div>

          <div>
            {isDemoMode ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Dados de demonstração</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c1916] border border-[#d4af6a]/25 text-[#f0d9a8] text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3ddc97] animate-pulse" />
                <span>Fonte: Pregão B3 / brapi.dev</span>
              </span>
            )}
          </div>
        </div>

        {/* Skeleton Loading */}
        {isLoading && (
          <div className="rounded-[14px] border border-[#d4af6a]/15 bg-[#141210] overflow-hidden shadow-lg">
            <div className="p-4 border-b border-[#d4af6a]/10 flex justify-between">
              <div className="h-4 w-32 bg-[#1c1916] rounded animate-pulse" />
              <div className="h-4 w-20 bg-[#1c1916] rounded animate-pulse" />
            </div>
            <div className="divide-y divide-[#d4af6a]/10">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="p-4 flex items-center justify-between gap-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[8px] bg-[#1c1916]" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-16 bg-[#1c1916] rounded" />
                      <div className="h-3 w-28 bg-[#1c1916] rounded" />
                    </div>
                  </div>
                  <div className="hidden sm:block h-6 w-20 bg-[#1c1916] rounded" />
                  <div className="h-5 w-24 bg-[#1c1916] rounded" />
                  <div className="h-6 w-16 bg-[#1c1916] rounded-full" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredStocks.length === 0 && (
          <div className="text-center py-16 bg-[#141210] rounded-[14px] border border-[#d4af6a]/15">
            <p className="text-[#c2b9ac] text-sm">
              Nenhum ativo encontrado para a busca "{searchTerm}".
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-3 px-4 py-1.5 rounded-[8px] bg-[#1c1916] text-xs text-[#f0d9a8] font-medium hover:text-white transition-colors cursor-pointer border border-[#d4af6a]/20"
            >
              Limpar busca
            </button>
          </div>
        )}

        {/* Desktop Table View */}
        {!isLoading && filteredStocks.length > 0 && (
          <div className="hidden md:block rounded-[14px] border border-[#d4af6a]/15 bg-[#141210] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#d4af6a]/12 bg-[#1c1916]/80 text-[11px] font-mono text-[#c2b9ac] uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Ativo / Empresa</th>
                  <th className="py-4 px-4 font-semibold hidden lg:table-cell">Setor B3</th>
                  <th className="py-4 px-4 font-semibold text-center">Histórico Real (30D)</th>
                  <th className="py-4 px-4 font-semibold text-right">Cotação (R$)</th>
                  <th className="py-4 px-4 font-semibold text-right">Variação %</th>
                  <th className="py-4 px-4 font-semibold text-right">Volume</th>
                  <th className="py-4 px-6 font-semibold text-center">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d4af6a]/10 text-sm">
                {filteredStocks.map((stock) => {
                  const isPositive = stock.changePercent >= 0;
                  const avatar = getStockAvatar(stock.ticker);
                  const flash = flashMap.get(stock.ticker);
                  const isFii = stock.category === 'fii' || stock.ticker.endsWith('11');

                  return (
                    <tr
                      key={stock.ticker}
                      className="hover:bg-[#1c1916]/70 transition-colors group cursor-pointer"
                      onClick={() => onSelectStockForChart(stock)}
                    >
                      {/* Ticker & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-[8px] bg-gradient-to-tr ${avatar.gradient} border border-[#d4af6a]/20 flex items-center justify-center font-mono font-bold text-xs text-[#f0d9a8] shrink-0 shadow-sm`}
                          >
                            {avatar.initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono tabular-nums font-bold text-[#f5efe6] group-hover:text-[#f0d9a8] transition-colors">
                                {stock.ticker}
                              </span>
                              <span className="text-[10px] font-mono px-1 rounded bg-[#1c1916] text-[#c2b9ac] border border-[#d4af6a]/10">
                                {isFii ? 'FII' : 'B3'}
                              </span>
                            </div>
                            <div className="text-xs text-[#c2b9ac] truncate max-w-[200px] font-normal">
                              {stock.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Sector */}
                      <td className="py-4 px-4 hidden lg:table-cell text-xs text-[#c2b9ac]">
                        {stock.sector}
                      </td>

                      {/* Real Sparkline or '—' */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex justify-center items-center">
                          <MiniSparkline stock={stock} width={80} height={26} />
                        </div>
                      </td>

                      {/* Price with flash animation */}
                      <td className="py-4 px-4 text-right font-mono tabular-nums font-semibold text-[#f5efe6]">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded transition-all duration-300 ${
                            flash === 'up'
                              ? 'bg-[#3ddc97]/25 text-[#3ddc97]'
                              : flash === 'down'
                              ? 'bg-[#ff5c6c]/25 text-[#ff5c6c]'
                              : ''
                          }`}
                        >
                          {formatBRL(stock.price)}
                        </span>
                      </td>

                      {/* % Variation */}
                      <td className="py-4 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 font-mono tabular-nums text-xs font-semibold px-2.5 py-1 rounded-full ${
                            isPositive
                              ? 'text-[#3ddc97] bg-[#3ddc97]/10 border border-[#3ddc97]/20'
                              : 'text-[#ff5c6c] bg-[#ff5c6c]/10 border border-[#ff5c6c]/20'
                          }`}
                        >
                          <span>{isPositive ? '▲' : '▼'}</span>
                          <span>{formatPercent(stock.changePercent, false)}</span>
                        </span>
                      </td>

                      {/* Volume */}
                      <td className="py-4 px-4 text-right font-mono tabular-nums text-xs text-[#c2b9ac]">
                        {formatVolumeBRL(stock.volume)}
                      </td>

                      {/* Action buttons: Gráfico e ✨ Explicar com IA */}
                      <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onSelectStockForChart(stock)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#1c1916] hover:bg-[#24201c] text-xs font-medium text-[#c2b9ac] hover:text-[#f0d9a8] border border-[#d4af6a]/15 hover:border-[#d4af6a]/35 transition-all cursor-pointer"
                            title="Ver histórico e gráfico interativo"
                          >
                            <BarChart2 className="w-3.5 h-3.5 text-[#d4af6a]" />
                            <span>Gráfico</span>
                          </button>

                          <button
                            onClick={() => onSelectStockForAi(stock)}
                            className="relative group p-[1px] rounded-[8px] overflow-hidden transition-all duration-200 cursor-pointer shadow-sm"
                            title="Explicar possíveis motivos da variação com IA"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-[#d4af6a] via-[#f0d9a8] to-[#b58d46] opacity-75 group-hover:opacity-100 transition-opacity" />
                            <span className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-[#141210] group-hover:bg-[#1c1916] text-xs font-semibold text-[#f0d9a8] transition-colors">
                              <Sparkles className="w-3.5 h-3.5 text-[#d4af6a] group-hover:scale-110 transition-transform" />
                              <span>Explicar com IA</span>
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile Compact Cards View - 2-row layout without overlaps */}
        {!isLoading && filteredStocks.length > 0 && (
          <div className="md:hidden space-y-3">
            {filteredStocks.map((stock) => {
              const isPositive = stock.changePercent >= 0;
              const avatar = getStockAvatar(stock.ticker);
              const isFii = stock.category === 'fii' || stock.ticker.endsWith('11');

              return (
                <div
                  key={stock.ticker}
                  className="p-4 rounded-[14px] bg-[#141210] border border-[#d4af6a]/15 shadow-sm space-y-3"
                  onClick={() => onSelectStockForChart(stock)}
                >
                  {/* Linha 1: avatar, ticker, nome completo da empresa sem truncar, preço e variação */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-[8px] bg-gradient-to-tr ${avatar.gradient} border border-[#d4af6a]/20 flex items-center justify-center font-mono font-bold text-xs text-[#f0d9a8] shrink-0`}
                      >
                        {avatar.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-base text-[#f5efe6]">
                            {stock.ticker}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1c1916] text-[#c2b9ac] border border-[#d4af6a]/10">
                            {isFii ? 'FII' : 'B3'}
                          </span>
                        </div>
                        {/* Nome completo sem truncar */}
                        <div className="text-xs text-[#c2b9ac] font-normal leading-snug">
                          {stock.name}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono tabular-nums font-bold text-base text-[#f5efe6]">
                        {formatBRL(stock.price)}
                      </div>
                      <span
                        className={`inline-flex items-center gap-0.5 font-mono tabular-nums text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isPositive
                            ? 'text-[#3ddc97] bg-[#3ddc97]/10'
                            : 'text-[#ff5c6c] bg-[#ff5c6c]/10'
                        }`}
                      >
                        <span>{isPositive ? '▲' : '▼'}</span>
                        <span>{formatPercent(stock.changePercent, false)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Linha 2: sparkline à esquerda e os botões à direita (nada se sobrepondo) */}
                  <div
                    className="pt-2.5 border-t border-[#d4af6a]/10 flex items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="shrink-0">
                      <MiniSparkline stock={stock} width={85} height={24} />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectStockForChart(stock)}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-[8px] bg-[#1c1916] text-xs font-medium text-[#c2b9ac] hover:text-[#f0d9a8] border border-[#d4af6a]/15 cursor-pointer"
                      >
                        <BarChart2 className="w-3.5 h-3.5 text-[#d4af6a]" />
                        <span>Gráfico</span>
                      </button>

                      <button
                        onClick={() => onSelectStockForAi(stock)}
                        className="relative group p-[1px] rounded-[8px] overflow-hidden cursor-pointer"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-[#d4af6a] via-[#f0d9a8] to-[#b58d46] opacity-75 group-hover:opacity-100 transition-opacity" />
                        <span className="relative flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-[7px] bg-[#141210] text-xs font-semibold text-[#f0d9a8]">
                          <Sparkles className="w-3.5 h-3.5 text-[#d4af6a]" />
                          <span>Explicar com IA</span>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
