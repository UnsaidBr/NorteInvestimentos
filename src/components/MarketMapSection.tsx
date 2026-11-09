import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, Treemap } from 'recharts';
import { StockItem } from '../types/market';
import { formatBRL, formatPercent, formatVolumeBRL } from '../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Layers,
  Building2,
  Search,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Filter,
  Info,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface MarketMapSectionProps {
  stocks: StockItem[];
  isDemoMode?: boolean;
  onSelectStockForChart: (stock: StockItem) => void;
  onSelectStockForAi: (stock: StockItem) => void;
}

// Normalização inteligente de setores da B3 para agrupamento macro limpo e legível
export function getMacroSector(sector: string = '', category: string = ''): string {
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
    s.includes('agrícola') ||
    s.includes('açúcar') ||
    s.includes('grãos')
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
  if (s.includes('ensino') || s.includes('educação')) {
    return 'Educação & Serviços';
  }
  return sector || 'Outros Setores';
}

// Escala de cores do Heatmap do Vermelho Escuro ao Verde Vivo (padrão financeiro)
export function getHeatmapColor(changePercent: number): {
  bg: string;
  border: string;
  text: string;
  label: string;
} {
  if (changePercent >= 3.0) {
    return { bg: '#15803d', border: '#22c55e', text: '#ffffff', label: '> +3%' };
  }
  if (changePercent >= 1.5) {
    return { bg: '#166534', border: '#16a34a', text: '#f0fdf4', label: '+1.5% a +3%' };
  }
  if (changePercent >= 0.5) {
    return { bg: '#14532d', border: '#15803d', text: '#dcfce7', label: '+0.5% a +1.5%' };
  }
  if (changePercent > 0.05) {
    return { bg: '#064e3b', border: '#047857', text: '#bbf7d0', label: '0% a +0.5%' };
  }
  if (changePercent >= -0.05 && changePercent <= 0.05) {
    return { bg: '#27272a', border: '#52525b', text: '#e4e4e7', label: 'Estável' };
  }
  if (changePercent >= -0.5) {
    return { bg: '#450a0a', border: '#7f1d1d', text: '#fecaca', label: '0% a -0.5%' };
  }
  if (changePercent >= -1.5) {
    return { bg: '#7f1d1d', border: '#991b1b', text: '#fee2e2', label: '-0.5% a -1.5%' };
  }
  if (changePercent >= -3.0) {
    return { bg: '#991b1b', border: '#dc2626', text: '#fef2f2', label: '-1.5% a -3%' };
  }
  return { bg: '#b91c1c', border: '#ef4444', text: '#ffffff', label: '< -3%' };
}

// Props injetadas pelo Recharts no content do Treemap
interface CustomTreemapItemProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  depth?: number;
  name?: string;
  stock?: StockItem;
  sectorName?: string;
  changePercent?: number;
  price?: number;
  marketCap?: number;
  children?: unknown[];
  // Handlers passados pelo pai
  onSelectStock?: (stock: StockItem) => void;
  onHoverStock?: (stock: StockItem, e: React.MouseEvent) => void;
  onLeaveStock?: () => void;
  selectedSector?: string | null;
  searchFilter?: string;
}

// Renderizador customizado de cada nó do Treemap
const CustomTreemapNode: React.FC<CustomTreemapItemProps> = (props) => {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    depth = 0,
    name = '',
    stock,
    sectorName = '',
    children,
    onSelectStock,
    onHoverStock,
    onLeaveStock,
    selectedSector,
    searchFilter,
  } = props;

  // Se for o contêiner do setor (depth === 1)
  if (depth === 1) {
    const isFiltered = selectedSector && selectedSector !== 'todos' && name !== selectedSector;
    return (
      <g opacity={isFiltered ? 0.2 : 1} style={{ transition: 'opacity 0.2s' }}>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="transparent"
          stroke="#3d352b"
          strokeWidth={1.5}
          rx={4}
        />
      </g>
    );
  }

  // Se for nó folha (depth === 2 ou folha sem filhos)
  if (!stock) return null;

  const matchesSearch =
    !searchFilter ||
    stock.ticker.toLowerCase().includes(searchFilter.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchFilter.toLowerCase());

  const matchesSector = !selectedSector || selectedSector === 'todos' || sectorName === selectedSector;
  const isVisible = matchesSearch && matchesSector;

  const colorInfo = getHeatmapColor(stock.changePercent);

  // Espaço interno com margem de 1px para grade nítida
  const rectX = x + 1;
  const rectY = y + 1;
  const rectW = Math.max(0, width - 2);
  const rectH = Math.max(0, height - 2);

  if (rectW <= 2 || rectH <= 2) return null;

  // Tipografia dinâmica proporcional às dimensões do bloco
  const showTicker = rectW >= 28 && rectH >= 16;
  const showPercent = rectW >= 48 && rectH >= 34;
  const showPrice = rectW >= 74 && rectH >= 54;
  const showFullName = rectW >= 120 && rectH >= 76;

  const tickerFontSize = rectW < 45 || rectH < 26 ? 10 : rectW < 75 ? 12 : 14;

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${stock.ticker}: ${formatBRL(stock.price)}, variação de ${formatPercent(stock.changePercent)}`}
      style={{ cursor: 'pointer', outline: 'none' }}
      opacity={isVisible ? 1 : 0.2}
      onClick={(e) => {
        e.stopPropagation();
        onSelectStock?.(stock);
      }}
      onMouseEnter={(e) => onHoverStock?.(stock, e)}
      onMouseMove={(e) => onHoverStock?.(stock, e)}
      onMouseLeave={() => onLeaveStock?.()}
    >
      <rect
        x={rectX}
        y={rectY}
        width={rectW}
        height={rectH}
        fill={colorInfo.bg}
        stroke={colorInfo.border}
        strokeWidth={1}
        rx={3}
        className="transition-all duration-150 hover:brightness-125 hover:stroke-[#f5efe6] hover:stroke-[2px]"
      />

      {/* Rótulos de Texto Centralizados */}
      {showTicker && (
        <text
          x={rectX + rectW / 2}
          y={
            showPercent
              ? showPrice
                ? rectY + rectH / 2 - (showFullName ? 14 : 9)
                : rectY + rectH / 2 - 2
              : rectY + rectH / 2 + 3.5
          }
          textAnchor="middle"
          fill="#ffffff"
          fontSize={tickerFontSize}
          fontWeight={700}
          fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
          className="select-none pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
        >
          {stock.ticker}
        </text>
      )}

      {showPercent && (
        <text
          x={rectX + rectW / 2}
          y={showPrice ? rectY + rectH / 2 + (showFullName ? 1 : 6) : rectY + rectH / 2 + 11}
          textAnchor="middle"
          fill={colorInfo.text}
          fontSize={rectW < 75 ? 10 : 11}
          fontWeight={600}
          fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
          className="select-none pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
        >
          {stock.changePercent >= 0 ? '+' : ''}
          {stock.changePercent.toFixed(2)}%
        </text>
      )}

      {showPrice && (
        <text
          x={rectX + rectW / 2}
          y={rectY + rectH / 2 + (showFullName ? 16 : 20)}
          textAnchor="middle"
          fill="rgba(255, 255, 255, 0.85)"
          fontSize={10}
          fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
          className="select-none pointer-events-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
        >
          {formatBRL(stock.price)}
        </text>
      )}

      {showFullName && (
        <text
          x={rectX + rectW / 2}
          y={rectY + 12}
          textAnchor="middle"
          fill="rgba(255, 255, 255, 0.65)"
          fontSize={9}
          className="select-none pointer-events-none truncate"
        >
          {stock.name.length > 18 ? stock.name.slice(0, 16) + '…' : stock.name}
        </text>
      )}
    </g>
  );
};

export const MarketMapSection: React.FC<MarketMapSectionProps> = ({
  stocks,
  isDemoMode = false,
  onSelectStockForChart,
  onSelectStockForAi,
}) => {
  const navigate = useNavigate();

  const handleStockClick = (stock: StockItem) => {
    navigate(`/mercado/${stock.ticker}`);
    onSelectStockForChart?.(stock);
  };

  // Estados de controle do Mapa
  const [categoryFilter, setCategoryFilter] = useState<'todos' | 'acao' | 'fii'>('todos');
  const [sizeMetric, setSizeMetric] = useState<'marketCap' | 'volume'>('marketCap');
  const [selectedSector, setSelectedSector] = useState<string>('todos');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [sectorSortOrder, setSectorSortOrder] = useState<'perf_desc' | 'perf_asc' | 'name'>('perf_desc');

  // Tooltip interativo
  const [hoveredStock, setHoveredStock] = useState<StockItem | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Filtragem preliminar de ativos por categoria (Ações vs FIIs)
  const baseStocks = useMemo(() => {
    return stocks.filter((s) => {
      if (categoryFilter === 'acao') return s.category !== 'fii' && !s.ticker.endsWith('11');
      if (categoryFilter === 'fii') return s.category === 'fii' || s.ticker.endsWith('11');
      return true;
    });
  }, [stocks, categoryFilter]);

  // 2. Placar do Dia (Market Breadth)
  const scoreboard = useMemo(() => {
    const total = baseStocks.length;
    if (total === 0) return { up: 0, down: 0, stable: 0, upPct: 0, downPct: 0, stablePct: 0, avgChange: 0 };

    let up = 0;
    let down = 0;
    let stable = 0;
    let sumChange = 0;

    baseStocks.forEach((s) => {
      sumChange += s.changePercent;
      if (s.changePercent > 0.05) {
        up++;
      } else if (s.changePercent < -0.05) {
        down++;
      } else {
        stable++;
      }
    });

    return {
      total,
      up,
      down,
      stable,
      upPct: (up / total) * 100,
      downPct: (down / total) * 100,
      stablePct: (stable / total) * 100,
      avgChange: sumChange / total,
    };
  }, [baseStocks]);

  // 3. Agrupamento por Setor & Estatísticas de Desempenho Setorial
  const sectorStats = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        stocks: StockItem[];
        sumChange: number;
        totalCap: number;
        totalVol: number;
      }
    >();

    baseStocks.forEach((stock) => {
      const sectorName = getMacroSector(stock.sector, stock.category);
      let entry = map.get(sectorName);
      if (!entry) {
        entry = {
          name: sectorName,
          stocks: [],
          sumChange: 0,
          totalCap: 0,
          totalVol: 0,
        };
        map.set(sectorName, entry);
      }
      entry.stocks.push(stock);
      entry.sumChange += stock.changePercent;
      entry.totalCap += stock.marketCap || 0;
      entry.totalVol += stock.volume || 0;
    });

    const list = Array.from(map.values()).map((entry) => {
      const count = entry.stocks.length;
      const avgChange = count > 0 ? entry.sumChange / count : 0;
      const sortedByGain = [...entry.stocks].sort((a, b) => b.changePercent - a.changePercent);
      const best = sortedByGain[0];
      const worst = sortedByGain[sortedByGain.length - 1];

      return {
        name: entry.name,
        stocksCount: count,
        stocks: entry.stocks,
        avgChangePercent: avgChange,
        totalMarketCap: entry.totalCap,
        totalVolume: entry.totalVol,
        bestStock: best,
        worstStock: worst,
      };
    });

    // Ordenação do painel lateral
    if (sectorSortOrder === 'perf_desc') {
      list.sort((a, b) => b.avgChangePercent - a.avgChangePercent);
    } else if (sectorSortOrder === 'perf_asc') {
      list.sort((a, b) => a.avgChangePercent - b.avgChangePercent);
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [baseStocks, sectorSortOrder]);

  // 4. Estrutura hierárquica para o Recharts Treemap
  // Agrupado por setor com tamanho proporcional a valor de mercado ou volume
  const treemapData = useMemo(() => {
    // Se o usuário selecionou um setor específico, isolamos esse setor
    const activeSectorList =
      selectedSector && selectedSector !== 'todos'
        ? sectorStats.filter((s) => s.name === selectedSector)
        : sectorStats;

    return activeSectorList.map((sec) => {
      const children = sec.stocks.map((stock) => {
        // Cálculo do peso para o bloco
        let sizeValue = 1000000;
        if (sizeMetric === 'marketCap') {
          sizeValue =
            stock.marketCap && stock.marketCap > 0
              ? stock.marketCap
              : stock.volume > 0
              ? stock.volume * 20
              : stock.price * 500000000;
        } else {
          sizeValue = stock.volume && stock.volume > 0 ? stock.volume : stock.price * 1000000;
        }

        return {
          name: stock.ticker,
          size: Math.max(sizeValue, 10000),
          stock,
          sectorName: sec.name,
          changePercent: stock.changePercent,
          price: stock.price,
          marketCap: stock.marketCap,
        };
      });

      return {
        name: sec.name,
        children,
      };
    });
  }, [sectorStats, selectedSector, sizeMetric]);

  // Manipuladores de mouse para Tooltip flutuante suave
  const handleHoverStock = (stock: StockItem, e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setHoveredStock(stock);
  };

  const handleLeaveStock = () => {
    setHoveredStock(null);
  };

  return (
    <div className="space-y-6">
      {/* Barra de Filtros e Controles Superiores do Mapa */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#141210] border border-[#d4af6a]/20 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Filtros Rápidos: Todos / Ações / FIIs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-medium text-[#c2b9ac] flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5 text-[#d4af6a]" />
              Segmento:
            </span>

            {[
              { id: 'todos', label: 'Todos os Ativos', count: stocks.length, icon: Layers },
              {
                id: 'acao',
                label: 'Ações B3',
                count: stocks.filter((s) => s.category !== 'fii' && !s.ticker.endsWith('11')).length,
                icon: Layers,
              },
              {
                id: 'fii',
                label: 'Fundos Imobiliários (FIIs)',
                count: stocks.filter((s) => s.category === 'fii' || s.ticker.endsWith('11')).length,
                icon: Building2,
              },
            ].map((cat) => {
              const isActive = categoryFilter === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategoryFilter(cat.id as any);
                    setSelectedSector('todos');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] text-[#0b0a09] font-bold shadow-md shadow-[#d4af6a]/20'
                      : 'bg-[#1c1916] text-[#c2b9ac] hover:text-[#f5efe6] hover:bg-[#24201c] border border-white/5'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-[#0b0a09]/20 text-[#0b0a09]' : 'bg-black/30 text-[#8e8579]'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Métrica de Tamanho e Busca Rápida */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Seletor de Tamanho */}
            <div className="flex items-center gap-1 p-1 bg-[#1c1916] rounded-lg border border-white/5 text-xs font-mono">
              <span className="px-2 text-[11px] text-[#8e8579]">Bloco por:</span>
              <button
                onClick={() => setSizeMetric('marketCap')}
                className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  sizeMetric === 'marketCap'
                    ? 'bg-[#d4af6a] text-[#0b0a09] font-bold'
                    : 'text-[#c2b9ac] hover:text-[#f5efe6]'
                }`}
              >
                Valor de Mercado
              </button>
              <button
                onClick={() => setSizeMetric('volume')}
                className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  sizeMetric === 'volume'
                    ? 'bg-[#d4af6a] text-[#0b0a09] font-bold'
                    : 'text-[#c2b9ac] hover:text-[#f5efe6]'
                }`}
              >
                Volume Diário
              </button>
            </div>

            {/* Busca Rápida de Ativo no Mapa */}
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-[#8e8579] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Destacar ticker (ex: PETR4)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#1c1916] border border-white/10 text-[#f5efe6] placeholder-[#6e675c] focus:outline-none focus:border-[#d4af6a]"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#8e8579] hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Reset de Setor */}
            {selectedSector !== 'todos' && (
              <button
                onClick={() => setSelectedSector('todos')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-[#d4af6a] bg-[#d4af6a]/10 border border-[#d4af6a]/30 hover:bg-[#d4af6a]/20 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Ver todos os setores</span>
              </button>
            )}
          </div>
        </div>

        {/* Legenda Visual da Escala de Cores */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs">
          <div className="flex items-center gap-2 text-[#8e8579] font-mono text-[11px]">
            <span>Escala de variação diária:</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            {[
              { label: '≤ -3%', bg: '#b91c1c' },
              { label: '-1.5%', bg: '#991b1b' },
              { label: '-0.5%', bg: '#7f1d1d' },
              { label: '0%', bg: '#27272a' },
              { label: '+0.5%', bg: '#14532d' },
              { label: '+1.5%', bg: '#166534' },
              { label: '≥ +3%', bg: '#15803d' },
            ].map((step, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <span
                  className="w-3.5 h-3.5 rounded-[3px] border border-black/40 shadow-sm"
                  style={{ backgroundColor: step.bg }}
                />
                <span className="text-[10px] font-mono text-[#a39a8c]">{step.label}</span>
              </div>
            ))}
          </div>

          {selectedSector !== 'todos' && (
            <div className="text-xs font-mono text-[#d4af6a]">
              Foco no setor: <strong className="text-white">{selectedSector}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Grid Principal: Treemap do Mapa (esquerda) + Painel Lateral de Setores e Placar (direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Painel Central: Treemap com Recharts */}
        <div className="lg:col-span-8 space-y-3">
          <div
            ref={containerRef}
            className="relative w-full h-[600px] sm:h-[660px] rounded-2xl bg-[#0e0d0b] border border-[#d4af6a]/20 p-2 sm:p-3 overflow-hidden shadow-2xl"
          >
            {/* Header com indicador de dados e aviso de demonstração */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
              <span className="px-2.5 py-1 rounded-md bg-[#141210]/90 backdrop-blur-md border border-[#d4af6a]/30 text-[10px] font-mono font-bold text-[#d4af6a] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3ddc97] animate-pulse" />
                Mapa de Calor B3 • {sizeMetric === 'marketCap' ? 'Por Valor de Mercado' : 'Por Volume'}
              </span>

              {isDemoMode && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono text-amber-300 font-bold uppercase">
                  Demonstração
                </span>
              )}
            </div>

            {/* Dica de clique no canto superior direito */}
            <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#141210]/90 backdrop-blur-md border border-white/10 text-[10px] font-mono text-[#a39a8c] pointer-events-none">
              <ExternalLink className="w-3 h-3 text-[#d4af6a]" />
              <span>Clique no bloco para abrir o ativo</span>
            </div>

            {/* Componente Treemap Oficial com Recharts */}
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemapData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#0b0a09"
                nodeGap={2}
                nodeInset={3}
                isAnimationActive={false}
                content={
                  <CustomTreemapNode
                    onSelectStock={handleStockClick}
                    onHoverStock={handleHoverStock}
                    onLeaveStock={handleLeaveStock}
                    selectedSector={selectedSector}
                    searchFilter={searchFilter}
                  />
                }
              />
            </ResponsiveContainer>

            {/* Tooltip Flutuante Dinâmico com Ticker, Nome, Preço, Variação e Detalhes */}
            <AnimatePresence>
              {hoveredStock && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.12 }}
                  style={{
                    position: 'absolute',
                    left: Math.min(Math.max(tooltipPos.x + 16, 12), (containerRef.current?.clientWidth || 600) - 270),
                    top: Math.min(Math.max(tooltipPos.y + 16, 12), (containerRef.current?.clientHeight || 600) - 210),
                    pointerEvents: 'none',
                    zIndex: 50,
                  }}
                  className="w-64 p-3.5 rounded-xl bg-[#141210]/95 backdrop-blur-xl border border-[#d4af6a]/40 shadow-2xl text-xs space-y-2.5"
                >
                  {/* Cabeçalho do Tooltip */}
                  <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-base font-mono font-bold text-white tracking-wide">
                          {hoveredStock.ticker}
                        </strong>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#24201c] text-[#d4af6a] font-mono border border-[#d4af6a]/20">
                          {hoveredStock.category === 'fii' ? 'FII' : 'Ação B3'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#c2b9ac] truncate max-w-[190px]">
                        {hoveredStock.name}
                      </p>
                    </div>

                    {/* Variação Badge */}
                    <div
                      className={`px-2 py-1 rounded font-mono font-bold text-xs flex items-center gap-1 ${
                        hoveredStock.changePercent >= 0
                          ? 'bg-[#15803d]/30 text-[#4ade80] border border-[#22c55e]/40'
                          : 'bg-[#991b1b]/30 text-[#f87171] border border-[#ef4444]/40'
                      }`}
                    >
                      {hoveredStock.changePercent >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>{formatPercent(hoveredStock.changePercent)}</span>
                    </div>
                  </div>

                  {/* Informações Numéricas de Preço, Setor e Mercado */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-1.5 rounded bg-black/40">
                      <span className="text-[#8e8579] block text-[10px]">Cotação:</span>
                      <strong className="text-white text-xs">{formatBRL(hoveredStock.price)}</strong>
                    </div>

                    <div className="p-1.5 rounded bg-black/40">
                      <span className="text-[#8e8579] block text-[10px]">Oscilação R$:</span>
                      <strong className={hoveredStock.change >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'}>
                        {hoveredStock.change >= 0 ? '+' : ''}
                        {formatBRL(hoveredStock.change)}
                      </strong>
                    </div>

                    <div className="p-1.5 rounded bg-black/40">
                      <span className="text-[#8e8579] block text-[10px]">Valor Mercado:</span>
                      <strong className="text-[#f5efe6]">
                        {hoveredStock.marketCap ? formatVolumeBRL(hoveredStock.marketCap) : 'n/d'}
                      </strong>
                    </div>

                    <div className="p-1.5 rounded bg-black/40">
                      <span className="text-[#8e8579] block text-[10px]">Volume Diário:</span>
                      <strong className="text-[#f5efe6]">
                        {hoveredStock.volume ? formatVolumeBRL(hoveredStock.volume) : 'n/d'}
                      </strong>
                    </div>
                  </div>

                  {/* Setor e Dica de Ação */}
                  <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[10px] text-[#8e8579]">
                    <span className="truncate max-w-[150px]">{hoveredStock.sector || 'B3'}</span>
                    <span className="text-[#d4af6a] font-medium flex items-center gap-0.5">
                      Abrir gráfico <ChevronRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Rodapé Informativo do Mapa */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#8e8579] font-mono px-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af6a]" />
              <span>
                {baseStocks.length} ativos renderizados no Treemap • Agrupamento por {sectorStats.length} setores
              </span>
            </div>
            <div>
              Tamanho do bloco:{' '}
              <strong className="text-[#f5efe6]">
                {sizeMetric === 'marketCap' ? 'Valor de Mercado (Market Cap)' : 'Volume Financeiro'}
              </strong>
            </div>
          </div>
        </div>

        {/* Painel Lateral: Placar do Dia + Desempenho Médio por Setor */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Card 1: Placar do Dia (Market Breadth com Barra Horizontal) */}
          <div className="p-5 rounded-2xl bg-[#141210] border border-[#d4af6a]/20 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#d4af6a] font-bold">
                  Amplitude de Mercado
                </span>
                <h3 className="text-lg font-serif font-bold text-[#f5efe6]">Placar do Pregão B3</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#8e8579] block">Média Geral</span>
                <span
                  className={`text-xs font-mono font-bold ${
                    scoreboard.avgChange >= 0 ? 'text-[#3ddc97]' : 'text-[#ff5c6c]'
                  }`}
                >
                  {formatPercent(scoreboard.avgChange)}
                </span>
              </div>
            </div>

            {/* Números em Destaque */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Em Alta */}
              <div className="p-2.5 rounded-xl bg-[#1c1916] border border-[#22c55e]/25">
                <div className="flex items-center justify-center gap-1 text-[#3ddc97] mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono font-bold uppercase">Altas</span>
                </div>
                <strong className="text-xl font-mono font-bold text-white block">
                  {scoreboard.up}
                </strong>
                <span className="text-[10px] font-mono text-[#3ddc97]">
                  {scoreboard.upPct.toFixed(0)}%
                </span>
              </div>

              {/* Estáveis */}
              <div className="p-2.5 rounded-xl bg-[#1c1916] border border-zinc-700/40">
                <div className="flex items-center justify-center gap-1 text-zinc-400 mb-1">
                  <Minus className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono font-bold uppercase">Estáveis</span>
                </div>
                <strong className="text-xl font-mono font-bold text-white block">
                  {scoreboard.stable}
                </strong>
                <span className="text-[10px] font-mono text-zinc-400">
                  {scoreboard.stablePct.toFixed(0)}%
                </span>
              </div>

              {/* Em Baixa */}
              <div className="p-2.5 rounded-xl bg-[#1c1916] border border-[#ef4444]/25">
                <div className="flex items-center justify-center gap-1 text-[#ff5c6c] mb-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono font-bold uppercase">Baixas</span>
                </div>
                <strong className="text-xl font-mono font-bold text-white block">
                  {scoreboard.down}
                </strong>
                <span className="text-[10px] font-mono text-[#ff5c6c]">
                  {scoreboard.downPct.toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Barra Horizontal Dividida Proporcionalmente */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#8e8579]">
                <span>Distribuição do Pregão:</span>
                <span>{scoreboard.total} ações analisadas</span>
              </div>

              <div
                className="h-3 w-full rounded-full overflow-hidden flex bg-[#1c1916] border border-white/10 shadow-inner"
                title={`${scoreboard.up} em alta (${scoreboard.upPct.toFixed(1)}%), ${scoreboard.stable} estáveis (${scoreboard.stablePct.toFixed(1)}%), ${scoreboard.down} em baixa (${scoreboard.downPct.toFixed(1)}%)`}
              >
                {/* Segmento Alta (Verde) */}
                <div
                  style={{ width: `${scoreboard.upPct}%` }}
                  className="h-full bg-gradient-to-r from-[#15803d] to-[#22c55e] transition-all duration-300 relative group"
                />
                {/* Segmento Estável (Cinza) */}
                <div
                  style={{ width: `${scoreboard.stablePct}%` }}
                  className="h-full bg-zinc-600 transition-all duration-300 relative group"
                />
                {/* Segmento Baixa (Vermelho) */}
                <div
                  style={{ width: `${scoreboard.downPct}%` }}
                  className="h-full bg-gradient-to-r from-[#ef4444] to-[#991b1b] transition-all duration-300 relative group"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#6e675c] pt-0.5">
                <span className="text-[#3ddc97]">▲ {scoreboard.upPct.toFixed(1)}%</span>
                <span className="text-zinc-400">■ {scoreboard.stablePct.toFixed(1)}%</span>
                <span className="text-[#ff5c6c]">▼ {scoreboard.downPct.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Card 2: Desempenho Médio por Setor (Ordenado e Interativo) */}
          <div className="p-5 rounded-2xl bg-[#141210] border border-[#d4af6a]/20 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#d4af6a] font-bold">
                  Ranking Setorial
                </span>
                <h3 className="text-base font-serif font-bold text-[#f5efe6]">
                  Desempenho por Setor
                </h3>
              </div>

              {/* Alternador de Ordenação */}
              <div className="flex items-center gap-1 text-[11px] font-mono">
                <button
                  onClick={() =>
                    setSectorSortOrder((prev) =>
                      prev === 'perf_desc' ? 'perf_asc' : prev === 'perf_asc' ? 'name' : 'perf_desc'
                    )
                  }
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1c1916] text-[#c2b9ac] hover:text-[#f5efe6] border border-white/10 transition-colors cursor-pointer"
                  title="Alterar ordenação"
                >
                  <ArrowUpDown className="w-3 h-3 text-[#d4af6a]" />
                  <span>
                    {sectorSortOrder === 'perf_desc'
                      ? 'Melhores'
                      : sectorSortOrder === 'perf_asc'
                      ? 'Piores'
                      : 'Nome'}
                  </span>
                </button>
              </div>
            </div>

            <p className="text-xs text-[#8e8579] -mt-1 leading-relaxed">
              Clique em um setor para filtrar e dar zoom no mapa correspondente.
            </p>

            {/* Lista Ordenada de Setores */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 select-none">
              {sectorStats.map((sec) => {
                const isSelected = selectedSector === sec.name;
                const isPositive = sec.avgChangePercent >= 0;

                return (
                  <div
                    key={sec.name}
                    onClick={() => {
                      setSelectedSector(isSelected ? 'todos' : sec.name);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1c1916] border-[#d4af6a] shadow-md shadow-[#d4af6a]/15'
                        : 'bg-[#141210] hover:bg-[#1c1916] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isPositive ? 'bg-[#3ddc97]' : 'bg-[#ff5c6c]'
                          }`}
                        />
                        <strong className="text-xs font-medium text-white truncate max-w-[170px]">
                          {sec.name}
                        </strong>
                        <span className="text-[10px] font-mono text-[#8e8579]">
                          ({sec.stocksCount})
                        </span>
                      </div>

                      {/* Badge com média aritmética */}
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          isPositive
                            ? 'bg-[#15803d]/25 text-[#4ade80] border border-[#22c55e]/30'
                            : 'bg-[#991b1b]/25 text-[#f87171] border border-[#ef4444]/30'
                        }`}
                      >
                        {formatPercent(sec.avgChangePercent)}
                      </span>
                    </div>

                    {/* Mini Barra Indicadora de Desempenho Proporcional */}
                    <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden mb-2">
                      <div
                        style={{
                          width: `${Math.min(Math.abs(sec.avgChangePercent) * 20, 100)}%`,
                        }}
                        className={`h-full rounded-full ${
                          isPositive ? 'bg-[#3ddc97]' : 'bg-[#ff5c6c]'
                        }`}
                      />
                    </div>

                    {/* Destaque do Melhor Ativo do Setor */}
                    {sec.bestStock && (
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#8e8579]">
                        <span>
                          Destaque:{' '}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStockClick(sec.bestStock);
                            }}
                            className="text-[#f5efe6] font-bold hover:text-[#d4af6a] underline"
                          >
                            {sec.bestStock.ticker}
                          </button>
                        </span>
                        <span className={sec.bestStock.changePercent >= 0 ? 'text-[#3ddc97]' : 'text-[#ff5c6c]'}>
                          {formatPercent(sec.bestStock.changePercent)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedSector !== 'todos' && (
              <button
                onClick={() => setSelectedSector('todos')}
                className="w-full py-2 rounded-lg text-xs font-mono text-center text-[#d4af6a] bg-[#1c1916] border border-[#d4af6a]/30 hover:bg-[#24201c] transition-colors cursor-pointer"
              >
                Limpar foco setorial (ver todos)
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
