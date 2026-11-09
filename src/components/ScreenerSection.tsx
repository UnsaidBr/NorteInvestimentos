import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { StockItem } from '../types/market';
import { formatBRL, formatPercent, formatVolumeBRL } from '../utils/formatters';
import { MiniSparkline } from './StocksSection';
import {
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Download,
  Check,
  X,
  Sparkles,
  BarChart2,
  Lock,
  Columns3,
  Search,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Info,
  Crown,
} from 'lucide-react';
import { usePlan } from '../context/PlanContext';

export interface ScreenerSectionProps {
  stocks: StockItem[];
  isDemoMode?: boolean;
  onSelectStockForChart: (stock: StockItem) => void;
  onSelectStockForAi: (stock: StockItem) => void;
}

export type PresetKey = 'none' | 'dividend' | 'liquidity' | 'pl_low' | 'market_cap';

export interface ScreenerFilters {
  searchTerm: string;
  category: 'all' | 'acao' | 'fii';
  selectedSectors: string[];
  minPrice?: number;
  maxPrice?: number;
  changeType: 'all' | 'up' | 'down' | 'strong_up' | 'strong_down';
  minDividendYield?: number;
  minPl?: number;
  maxPl?: number;
  minPvp?: number;
  maxPvp?: number;
  minRoe?: number;
  minMarketCap?: number;
  minVolume?: number;
}

const DEFAULT_FILTERS: ScreenerFilters = {
  searchTerm: '',
  category: 'all',
  selectedSectors: [],
  minPrice: undefined,
  maxPrice: undefined,
  changeType: 'all',
  minDividendYield: undefined,
  minPl: undefined,
  maxPl: undefined,
  minPvp: undefined,
  maxPvp: undefined,
  minRoe: undefined,
  minMarketCap: undefined,
  minVolume: undefined,
};

export type ColumnKey =
  | 'ticker'
  | 'category'
  | 'price'
  | 'change'
  | 'dy'
  | 'pl'
  | 'pvp'
  | 'roe'
  | 'marketCap'
  | 'volume'
  | 'sparkline'
  | 'actions';

interface ColumnConfig {
  key: ColumnKey;
  label: string;
  defaultVisible: boolean;
  sortable: boolean;
  align?: 'left' | 'right' | 'center';
}

const ALL_COLUMNS: ColumnConfig[] = [
  { key: 'ticker', label: 'Ativo / Empresa', defaultVisible: true, sortable: true, align: 'left' },
  { key: 'category', label: 'Tipo', defaultVisible: true, sortable: true, align: 'center' },
  { key: 'price', label: 'Cotação', defaultVisible: true, sortable: true, align: 'right' },
  { key: 'change', label: 'Var. Dia', defaultVisible: true, sortable: true, align: 'right' },
  { key: 'dy', label: 'Div. Yield', defaultVisible: true, sortable: true, align: 'right' },
  { key: 'pl', label: 'P/L', defaultVisible: true, sortable: true, align: 'right' },
  { key: 'pvp', label: 'P/VP', defaultVisible: true, sortable: true, align: 'right' },
  { key: 'roe', label: 'ROE', defaultVisible: true, sortable: true, align: 'right' },
  { key: 'marketCap', label: 'Val. Mercado', defaultVisible: true, sortable: true, align: 'right' },
  { key: 'volume', label: 'Volume Diário', defaultVisible: true, sortable: true, align: 'right' },
  { key: 'sparkline', label: 'Tendência', defaultVisible: true, sortable: false, align: 'center' },
  { key: 'actions', label: 'Ações', defaultVisible: true, sortable: false, align: 'center' },
];

export const ScreenerSection: React.FC<ScreenerSectionProps> = ({
  stocks,
  isDemoMode = false,
  onSelectStockForChart,
  onSelectStockForAi,
}) => {
  const { isPremium, limits, openWaitlistModal } = usePlan();
  const [filters, setFilters] = useState<ScreenerFilters>(DEFAULT_FILTERS);
  const [activePreset, setActivePreset] = useState<PresetKey>('none');
  const [showFiltersPanel, setShowFiltersPanel] = useState(true);
  const [showColumnsModal, setShowColumnsModal] = useState(false);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>(() => {
    const init: Record<string, boolean> = {};
    ALL_COLUMNS.forEach((col) => {
      init[col.key] = col.defaultVisible;
    });
    return init as Record<ColumnKey, boolean>;
  });

  // Sorting state
  const [sortField, setSortField] = useState<ColumnKey>('volume');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Dropdown ref for columns menu
  const columnsDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (columnsDropdownRef.current && !columnsDropdownRef.current.contains(event.target as Node)) {
        setShowColumnsModal(false);
      }
    }
    if (showColumnsModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColumnsModal]);

  // Extract all distinct sectors from current stocks list
  const availableSectors = useMemo(() => {
    const set = new Set<string>();
    stocks.forEach((s) => {
      if (s.sector && s.sector.trim()) {
        set.add(s.sector.trim());
      }
    });
    return Array.from(set).sort();
  }, [stocks]);

  // Handle Preset Clicks (Neutral names only: Maiores dividend yields, Maior liquidez, Menores P/L por setor, Maior valor de mercado)
  const applyPreset = (preset: PresetKey) => {
    setActivePreset(preset);
    setCurrentPage(1);

    if (preset === 'dividend') {
      setFilters({
        ...DEFAULT_FILTERS,
        minDividendYield: 4,
      });
      setSortField('dy');
      setSortDirection('desc');
    } else if (preset === 'liquidity') {
      setFilters({
        ...DEFAULT_FILTERS,
        minVolume: 50000000, // 50M+
      });
      setSortField('volume');
      setSortDirection('desc');
    } else if (preset === 'pl_low') {
      setFilters({
        ...DEFAULT_FILTERS,
        minPl: 0.1,
        maxPl: 15,
      });
      setSortField('pl');
      setSortDirection('asc');
    } else if (preset === 'market_cap') {
      setFilters({
        ...DEFAULT_FILTERS,
        minMarketCap: 10000000000, // 10B+
      });
      setSortField('marketCap');
      setSortDirection('desc');
    } else {
      setFilters(DEFAULT_FILTERS);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setActivePreset('none');
    setCurrentPage(1);
  };

  // Helper to count active filters for a given filter set
  const countFiltersObject = (f: ScreenerFilters): number => {
    let count = 0;
    if (f.searchTerm.trim()) count++;
    if (f.category !== 'all') count++;
    if (f.selectedSectors.length > 0) count += f.selectedSectors.length;
    if (f.minPrice !== undefined || f.maxPrice !== undefined) count++;
    if (f.changeType !== 'all') count++;
    if (f.minDividendYield !== undefined) count++;
    if (f.minPl !== undefined || f.maxPl !== undefined) count++;
    if (f.minPvp !== undefined || f.maxPvp !== undefined) count++;
    if (f.minRoe !== undefined) count++;
    if (f.minMarketCap !== undefined) count++;
    if (f.minVolume !== undefined) count++;
    return count;
  };

  // Safe filter updater that enforces 3 filters max on Free plan
  const updateFilterSafely = (
    updater: (prev: ScreenerFilters) => ScreenerFilters,
    featureLabel?: string
  ) => {
    setFilters((prev) => {
      const next = updater(prev);
      const prevC = countFiltersObject(prev);
      const nextC = countFiltersObject(next);
      if (!isPremium && nextC > 3 && nextC > prevC) {
        openWaitlistModal(
          featureLabel ||
            'Você atingiu o limite de 3 filtros simultâneos no plano Gratuito. Passe para o Premium para usar todos os filtros!'
        );
        return prev;
      }
      return next;
    });
    setActivePreset('none');
    setCurrentPage(1);
  };

  // Toggle sector selection
  const toggleSector = (sector: string) => {
    updateFilterSafely((prev) => {
      const exists = prev.selectedSectors.includes(sector);
      const updated = exists
        ? prev.selectedSectors.filter((s) => s !== sector)
        : [...prev.selectedSectors, sector];
      return { ...prev, selectedSectors: updated };
    }, 'Seleção múltipla de setores no Screener (limite de 3 filtros no plano Gratuito)');
  };

  // Check if any filter is actively applied
  const activeFiltersCount = useMemo(() => {
    return countFiltersObject(filters);
  }, [filters]);

  // Handle CSV Export (Real download on Premium, Waitlist modal on Free)
  const handleExportCsv = () => {
    if (!isPremium) {
      openWaitlistModal('Exportação completa de dados do Screener em planilhas CSV');
      return;
    }

    const headers = [
      'Ticker',
      'Nome',
      'Categoria',
      'Setor',
      'Preço (R$)',
      'Variação (%)',
      'Dividend Yield (%)',
      'P/L',
      'P/VP',
      'ROE (%)',
      'Valor de Mercado',
      'Volume Diário',
    ];

    const rows = sortedStocks.map((s) => [
      s.ticker,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      s.category === 'fii' ? 'FII' : 'Ação',
      `"${(s.sector || '').replace(/"/g, '""')}"`,
      s.price ? s.price.toFixed(2) : '',
      s.changePercent ? s.changePercent.toFixed(2) : '',
      s.dividendYield !== undefined ? s.dividendYield.toFixed(2) : '',
      s.pl !== undefined ? s.pl.toFixed(2) : '',
      s.pvp !== undefined ? s.pvp.toFixed(2) : '',
      s.roe !== undefined ? s.roe.toFixed(2) : '',
      s.marketCap !== undefined ? s.marketCap : '',
      s.avgVolume || s.volume || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `norteinvest-screener-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Sort Change
  const handleSort = (column: ColumnKey) => {
    if (sortField === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(column);
      setSortDirection('desc');
    }
  };

  // Filter stocks
  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      // 1. Search text
      if (filters.searchTerm.trim()) {
        const q = filters.searchTerm.toLowerCase().trim();
        const matchesTicker = stock.ticker.toLowerCase().includes(q);
        const matchesName = stock.name.toLowerCase().includes(q);
        const matchesSector = (stock.sector || '').toLowerCase().includes(q);
        if (!matchesTicker && !matchesName && !matchesSector) return false;
      }

      // 2. Category (acao vs fii)
      if (filters.category === 'acao') {
        const isFii = stock.category === 'fii' || stock.ticker.endsWith('11');
        if (isFii) return false;
      } else if (filters.category === 'fii') {
        const isFii = stock.category === 'fii' || stock.ticker.endsWith('11');
        if (!isFii) return false;
      }

      // 3. Sector
      if (filters.selectedSectors.length > 0) {
        if (!stock.sector || !filters.selectedSectors.includes(stock.sector)) {
          return false;
        }
      }

      // 4. Price range
      if (filters.minPrice !== undefined && stock.price < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && stock.price > filters.maxPrice) return false;

      // 5. Day change
      if (filters.changeType === 'up' && stock.changePercent <= 0) return false;
      if (filters.changeType === 'down' && stock.changePercent >= 0) return false;
      if (filters.changeType === 'strong_up' && stock.changePercent < 2) return false;
      if (filters.changeType === 'strong_down' && stock.changePercent > -2) return false;

      // 6. Dividend Yield
      // Strict rule: if indicator not available, we filter out ONLY IF a threshold is set
      if (filters.minDividendYield !== undefined) {
        if (stock.dividendYield === undefined || stock.dividendYield < filters.minDividendYield) {
          return false;
        }
      }

      // 7. P/L
      if (filters.minPl !== undefined) {
        if (stock.pl === undefined || stock.pl < filters.minPl) return false;
      }
      if (filters.maxPl !== undefined) {
        if (stock.pl === undefined || stock.pl > filters.maxPl) return false;
      }

      // 8. P/VP
      if (filters.minPvp !== undefined) {
        if (stock.pvp === undefined || stock.pvp < filters.minPvp) return false;
      }
      if (filters.maxPvp !== undefined) {
        if (stock.pvp === undefined || stock.pvp > filters.maxPvp) return false;
      }

      // 9. ROE
      if (filters.minRoe !== undefined) {
        if (stock.roe === undefined || stock.roe < filters.minRoe) return false;
      }

      // 10. Market Cap
      if (filters.minMarketCap !== undefined) {
        if (stock.marketCap === undefined || stock.marketCap < filters.minMarketCap) return false;
      }

      // 11. Volume
      if (filters.minVolume !== undefined) {
        const vol = stock.avgVolume || stock.volume;
        if (vol < filters.minVolume) return false;
      }

      return true;
    });
  }, [stocks, filters]);

  // Sort filtered stocks
  const sortedStocks = useMemo(() => {
    const list = [...filteredStocks];

    list.sort((a, b) => {
      let aVal: any = undefined;
      let bVal: any = undefined;

      switch (sortField) {
        case 'ticker':
          return sortDirection === 'asc'
            ? a.ticker.localeCompare(b.ticker)
            : b.ticker.localeCompare(a.ticker);
        case 'category': {
          const aCat = a.category === 'fii' || a.ticker.endsWith('11') ? 'fii' : 'acao';
          const bCat = b.category === 'fii' || b.ticker.endsWith('11') ? 'fii' : 'acao';
          return sortDirection === 'asc' ? aCat.localeCompare(bCat) : bCat.localeCompare(aCat);
        }
        case 'price':
          aVal = a.price;
          bVal = b.price;
          break;
        case 'change':
          aVal = a.changePercent;
          bVal = b.changePercent;
          break;
        case 'dy':
          aVal = a.dividendYield;
          bVal = b.dividendYield;
          break;
        case 'pl':
          aVal = a.pl;
          bVal = b.pl;
          break;
        case 'pvp':
          aVal = a.pvp;
          bVal = b.pvp;
          break;
        case 'roe':
          aVal = a.roe;
          bVal = b.roe;
          break;
        case 'marketCap':
          aVal = a.marketCap;
          bVal = b.marketCap;
          break;
        case 'volume':
          aVal = a.avgVolume || a.volume;
          bVal = b.avgVolume || b.volume;
          break;
        default:
          aVal = a.volume;
          bVal = b.volume;
      }

      // Place undefined / n/d at the end regardless of direction
      if (aVal === undefined && bVal === undefined) return 0;
      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    return list;
  }, [filteredStocks, sortField, sortDirection]);

  // Pagination calculation
  const totalItems = sortedStocks.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedStocks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedStocks.slice(start, start + itemsPerPage);
  }, [sortedStocks, currentPage, itemsPerPage]);

  // Format cell value or strictly render "n/d"
  const renderCellIndicator = (val: number | undefined, formatFn: (v: number) => string) => {
    if (val === undefined || val === null || isNaN(val)) {
      return (
        <span className="text-[#8c8273] font-mono text-xs" title="Dado não fornecido pela API">
          n/d
        </span>
      );
    }
    return <span className="font-mono tabular-nums text-xs font-semibold text-[#f5efe6]">{formatFn(val)}</span>;
  };

  return (
    <div className="w-full space-y-6">
      {/* Demo Mode Notice when active */}
      {isDemoMode && (
        <div className="flex items-center gap-2 p-3 rounded-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Dados de demonstração:</strong> Os filtros e indicadores utilizam cotações de amostra. Indicadores sem registro oficial na API são exibidos estritamente como &quot;n/d&quot;.
          </span>
        </div>
      )}

      {/* Top Controls: Presets + Search + Export CSV + Column Config */}
      <div className="bg-[#141210] border border-[#d4af6a]/20 rounded-[14px] p-5 shadow-lg">
        
        {/* Preset Buttons Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#d4af6a]/15">
          <div className="flex items-center gap-2 text-xs font-mono text-[#c2b9ac]">
            <Sliders className="w-4 h-4 text-[#d4af6a]" />
            <span className="font-semibold text-[#f5efe6]">Filtros Rápidos:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'dividend', label: 'Maiores dividend yields' },
              { id: 'liquidity', label: 'Maior liquidez' },
              { id: 'pl_low', label: 'Menores P/L por setor' },
              { id: 'market_cap', label: 'Maior valor de mercado' },
            ].map((p) => {
              const isSelected = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => applyPreset(isSelected ? 'none' : (p.id as PresetKey))}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] text-[#0b0a09] font-bold shadow-md shadow-[#d4af6a]/20'
                      : 'bg-[#1c1916] text-[#c2b9ac] hover:text-[#f5efe6] border border-[#d4af6a]/20 hover:border-[#d4af6a]/40'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Action buttons: Filter Toggle + Column Toggle + CSV Export */}
          <div className="flex items-center gap-2.5 self-end lg:self-auto">
            <button
              onClick={() => setShowFiltersPanel((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-mono border transition-colors cursor-pointer ${
                showFiltersPanel
                  ? 'bg-[#1c1916] border-[#d4af6a]/40 text-[#f0d9a8]'
                  : 'bg-[#141210] border-[#d4af6a]/20 text-[#a39a8c] hover:text-[#f5efe6]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#d4af6a]" />
              <span>{showFiltersPanel ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
            </button>

            {/* Config Colunas Dropdown */}
            <div className="relative" ref={columnsDropdownRef}>
              <button
                onClick={() => setShowColumnsModal((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-mono bg-[#1c1916] border border-[#d4af6a]/20 hover:border-[#d4af6a]/40 text-[#c2b9ac] hover:text-[#f5efe6] transition-colors cursor-pointer"
              >
                <Columns3 className="w-3.5 h-3.5 text-[#d4af6a]" />
                <span>Colunas</span>
              </button>

              {showColumnsModal && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#141210] border border-[#d4af6a]/30 rounded-[12px] p-3 shadow-2xl z-40 space-y-2">
                  <div className="text-xs font-mono font-bold text-[#f5efe6] pb-2 border-b border-[#d4af6a]/15">
                    Colunas da Tabela
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 text-xs font-mono">
                    {ALL_COLUMNS.map((col) => (
                      <label
                        key={col.key}
                        className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-[#1c1916] cursor-pointer text-[#c2b9ac]"
                      >
                        <span>{col.label}</span>
                        <input
                          type="checkbox"
                          checked={visibleColumns[col.key]}
                          disabled={col.key === 'ticker' || col.key === 'price'}
                          onChange={(e) => {
                            setVisibleColumns((prev) => ({
                              ...prev,
                              [col.key]: e.target.checked,
                            }));
                          }}
                          className="w-3.5 h-3.5 accent-[#d4af6a] rounded"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filter capacity badge */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-xs font-mono border ${
              !isPremium && activeFiltersCount >= 3
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-[#1c1916] border-[#d4af6a]/20 text-[#c2b9ac]'
            }`}>
              <Sliders className="w-3.5 h-3.5 text-[#d4af6a]" />
              <span>Filtros:</span>
              <span className="font-bold text-[#f5efe6]">{activeFiltersCount}</span>
              <span className="text-[#8c8273]">/ {isPremium ? '∞' : '3'}</span>
              {!isPremium && activeFiltersCount >= 3 && (
                <button
                  onClick={() => openWaitlistModal('Filtros ilimitados no Screener')}
                  className="ml-1 text-[10px] text-[#f0d9a8] hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                >
                  <Crown className="w-3 h-3 text-[#d4af6a]" />
                  <span>VIP</span>
                </button>
              )}
            </div>

            {/* Exportar CSV */}
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-mono bg-[#1c1916] hover:bg-[#24201c] border border-[#d4af6a]/30 text-[#f0d9a8] transition-all cursor-pointer group"
              title={isPremium ? "Baixar planilha CSV com ativos filtrados" : "Exportação CSV disponível no plano Premium"}
            >
              <Download className="w-3.5 h-3.5 text-[#d4af6a] group-hover:translate-y-0.5 transition-transform" />
              <span>Exportar CSV</span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider border ${
                isPremium
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-[#d4af6a]/20 text-[#f0d9a8] border-[#d4af6a]/30'
              }`}>
                {isPremium ? 'Liberado ⭐' : 'Premium'}
              </span>
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        <AnimatePresence>
          {showFiltersPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden pt-5 space-y-4"
            >
              {/* Row 1: Search, Category, Price Range, Day Change */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-[11px] font-mono text-[#c2b9ac] mb-1.5">
                    Buscar Ticker / Razão Social
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8c8273]" />
                    <input
                      type="text"
                      value={filters.searchTerm}
                      onChange={(e) => {
                        setFilters((prev) => ({ ...prev, searchTerm: e.target.value }));
                        setActivePreset('none');
                        setCurrentPage(1);
                      }}
                      placeholder="Ex: PETR4, MXRF11, Vale..."
                      className="w-full pl-9 pr-3 py-2 bg-[#1c1916] border border-[#d4af6a]/20 focus:border-[#d4af6a] rounded-[8px] text-xs font-mono text-[#f5efe6] placeholder:text-[#8c8273] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Category (Todas, Ações, FIIs) */}
                <div>
                  <label className="block text-[11px] font-mono text-[#c2b9ac] mb-1.5">
                    Categoria do Ativo
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-[#1c1916] p-1 rounded-[8px] border border-[#d4af6a]/20 text-xs font-mono">
                    {(['all', 'acao', 'fii'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setFilters((prev) => ({ ...prev, category: cat }));
                          setActivePreset('none');
                          setCurrentPage(1);
                        }}
                        className={`py-1 rounded text-center transition-colors cursor-pointer ${
                          filters.category === cat
                            ? 'bg-[#d4af6a] text-[#0b0a09] font-bold'
                            : 'text-[#c2b9ac] hover:text-[#f5efe6]'
                        }`}
                      >
                        {cat === 'all' ? 'Todos' : cat === 'acao' ? 'Ações' : 'FIIs'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-[11px] font-mono text-[#c2b9ac] mb-1.5">
                    Faixa de Preço (R$)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="any"
                      placeholder="Mínimo (R$)"
                      value={filters.minPrice ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                        setFilters((prev) => ({ ...prev, minPrice: val }));
                        setActivePreset('none');
                        setCurrentPage(1);
                      }}
                      className="w-full px-2.5 py-2 bg-[#1c1916] border border-[#d4af6a]/20 focus:border-[#d4af6a] rounded-[8px] text-xs font-mono text-[#f5efe6] placeholder:text-[#8c8273] focus:outline-none"
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Máximo (R$)"
                      value={filters.maxPrice ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                        setFilters((prev) => ({ ...prev, maxPrice: val }));
                        setActivePreset('none');
                        setCurrentPage(1);
                      }}
                      className="w-full px-2.5 py-2 bg-[#1c1916] border border-[#d4af6a]/20 focus:border-[#d4af6a] rounded-[8px] text-xs font-mono text-[#f5efe6] placeholder:text-[#8c8273] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Day Change Filter */}
                <div>
                  <label className="block text-[11px] font-mono text-[#c2b9ac] mb-1.5">
                    Variação do Dia
                  </label>
                  <select
                    value={filters.changeType}
                    onChange={(e) => {
                      setFilters((prev) => ({ ...prev, changeType: e.target.value as any }));
                      setActivePreset('none');
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 bg-[#1c1916] border border-[#d4af6a]/20 focus:border-[#d4af6a] rounded-[8px] text-xs font-mono text-[#f5efe6] focus:outline-none cursor-pointer"
                  >
                    <option value="all">Todas as variações</option>
                    <option value="up">Em alta (&gt; 0%)</option>
                    <option value="down">Em baixa (&lt; 0%)</option>
                    <option value="strong_up">Alta forte (&gt; +2%)</option>
                    <option value="strong_down">Baixa forte (&lt; -2%)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Fundamental Indicators (DY, P/L, P/VP, ROE, Market Cap, Volume) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                {/* Dividend Yield */}
                <div>
                  <label className="block text-[10px] font-mono text-[#c2b9ac] mb-1">
                    Div. Yield Mín. (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Ex: 6.0"
                    value={filters.minDividendYield ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                      setFilters((prev) => ({ ...prev, minDividendYield: val }));
                      setActivePreset('none');
                      setCurrentPage(1);
                    }}
                    className="w-full px-2.5 py-1.5 bg-[#1c1916] border border-[#d4af6a]/20 rounded-[8px] text-xs font-mono text-[#f5efe6] placeholder:text-[#8c8273] focus:outline-none"
                  />
                </div>

                {/* P/L (Max) */}
                <div>
                  <label className="block text-[10px] font-mono text-[#c2b9ac] mb-1">
                    P/L Máximo
                  </label>
                  <input
                    type="number"
                    step="1"
                    placeholder="Ex: 15"
                    value={filters.maxPl ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                      setFilters((prev) => ({ ...prev, maxPl: val }));
                      setActivePreset('none');
                      setCurrentPage(1);
                    }}
                    className="w-full px-2.5 py-1.5 bg-[#1c1916] border border-[#d4af6a]/20 rounded-[8px] text-xs font-mono text-[#f5efe6] placeholder:text-[#8c8273] focus:outline-none"
                  />
                </div>

                {/* P/VP (Max) */}
                <div>
                  <label className="block text-[10px] font-mono text-[#c2b9ac] mb-1">
                    P/VP Máximo
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 1.5"
                    value={filters.maxPvp ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                      setFilters((prev) => ({ ...prev, maxPvp: val }));
                      setActivePreset('none');
                      setCurrentPage(1);
                    }}
                    className="w-full px-2.5 py-1.5 bg-[#1c1916] border border-[#d4af6a]/20 rounded-[8px] text-xs font-mono text-[#f5efe6] placeholder:text-[#8c8273] focus:outline-none"
                  />
                </div>

                {/* ROE (Min) */}
                <div>
                  <label className="block text-[10px] font-mono text-[#c2b9ac] mb-1">
                    ROE Mín. (%)
                  </label>
                  <input
                    type="number"
                    step="1"
                    placeholder="Ex: 10"
                    value={filters.minRoe ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                      setFilters((prev) => ({ ...prev, minRoe: val }));
                      setActivePreset('none');
                      setCurrentPage(1);
                    }}
                    className="w-full px-2.5 py-1.5 bg-[#1c1916] border border-[#d4af6a]/20 rounded-[8px] text-xs font-mono text-[#f5efe6] placeholder:text-[#8c8273] focus:outline-none"
                  />
                </div>

                {/* Valor de Mercado (Min) */}
                <div>
                  <label className="block text-[10px] font-mono text-[#c2b9ac] mb-1">
                    Val. Mercado Mín.
                  </label>
                  <select
                    value={filters.minMarketCap ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                      setFilters((prev) => ({ ...prev, minMarketCap: val }));
                      setActivePreset('none');
                      setCurrentPage(1);
                    }}
                    className="w-full px-2 py-1.5 bg-[#1c1916] border border-[#d4af6a]/20 rounded-[8px] text-xs font-mono text-[#f5efe6] focus:outline-none cursor-pointer"
                  >
                    <option value="">Qualquer</option>
                    <option value="1000000000">&gt; R$ 1 Bi</option>
                    <option value="5000000000">&gt; R$ 5 Bi</option>
                    <option value="10000000000">&gt; R$ 10 Bi</option>
                    <option value="50000000000">&gt; R$ 50 Bi</option>
                  </select>
                </div>

                {/* Volume Médio / 24h (Min) */}
                <div>
                  <label className="block text-[10px] font-mono text-[#c2b9ac] mb-1">
                    Volume Mínimo
                  </label>
                  <select
                    value={filters.minVolume ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                      setFilters((prev) => ({ ...prev, minVolume: val }));
                      setActivePreset('none');
                      setCurrentPage(1);
                    }}
                    className="w-full px-2 py-1.5 bg-[#1c1916] border border-[#d4af6a]/20 rounded-[8px] text-xs font-mono text-[#f5efe6] focus:outline-none cursor-pointer"
                  >
                    <option value="">Qualquer</option>
                    <option value="5000000">&gt; R$ 5 Mi</option>
                    <option value="20000000">&gt; R$ 20 Mi</option>
                    <option value="50000000">&gt; R$ 50 Mi</option>
                    <option value="100000000">&gt; R$ 100 Mi</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Multiselection Sector Pills */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-mono text-[#c2b9ac]">
                    Setores de Atuação (multisseleção):
                  </label>
                  {filters.selectedSectors.length > 0 && (
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, selectedSectors: [] }))}
                      className="text-[10px] font-mono text-[#d4af6a] hover:underline cursor-pointer"
                    >
                      Limpar setores ({filters.selectedSectors.length})
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {availableSectors.map((sector) => {
                    const isSelected = filters.selectedSectors.includes(sector);
                    return (
                      <button
                        key={sector}
                        onClick={() => toggleSector(sector)}
                        className={`px-2.5 py-1 rounded-[6px] text-[11px] font-mono transition-colors cursor-pointer border ${
                          isSelected
                            ? 'bg-[#d4af6a]/20 border-[#d4af6a] text-[#f0d9a8] font-semibold'
                            : 'bg-[#1c1916] border-white/5 text-[#a39a8c] hover:text-[#f5efe6] hover:border-white/10'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 inline mr-1 text-[#d4af6a]" />}
                        {sector}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filter Chips & Counter Row */}
        <div className="mt-4 pt-3 border-t border-[#d4af6a]/15 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-[#c2b9ac]">
              Filtros ativos ({activeFiltersCount}):
            </span>

            {activeFiltersCount === 0 && (
              <span className="text-xs font-mono text-[#8c8273] italic">
                Nenhum filtro aplicado. Exibindo todos os ativos.
              </span>
            )}

            {/* Chips */}
            {filters.searchTerm && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1c1916] border border-[#d4af6a]/30 text-xs font-mono text-[#f0d9a8]">
                Busca: &quot;{filters.searchTerm}&quot;
                <button
                  onClick={() => setFilters((p) => ({ ...p, searchTerm: '' }))}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.category !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1c1916] border border-[#d4af6a]/30 text-xs font-mono text-[#f0d9a8]">
                Tipo: {filters.category === 'acao' ? 'Ações' : 'FIIs'}
                <button
                  onClick={() => setFilters((p) => ({ ...p, category: 'all' }))}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.selectedSectors.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1c1916] border border-[#d4af6a]/30 text-xs font-mono text-[#f0d9a8]"
              >
                Setor: {s}
                <button onClick={() => toggleSector(s)} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1c1916] border border-[#d4af6a]/30 text-xs font-mono text-[#f0d9a8]">
                Preço: R$ {filters.minPrice ?? 0} a R$ {filters.maxPrice ?? '∞'}
                <button
                  onClick={() =>
                    setFilters((p) => ({ ...p, minPrice: undefined, maxPrice: undefined }))
                  }
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.changeType !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1c1916] border border-[#d4af6a]/30 text-xs font-mono text-[#f0d9a8]">
                Variação: {filters.changeType}
                <button
                  onClick={() => setFilters((p) => ({ ...p, changeType: 'all' }))}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.minDividendYield !== undefined && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1c1916] border border-[#d4af6a]/30 text-xs font-mono text-[#f0d9a8]">
                DY: ≥ {filters.minDividendYield}%
                <button
                  onClick={() => setFilters((p) => ({ ...p, minDividendYield: undefined }))}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.maxPl !== undefined && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1c1916] border border-[#d4af6a]/30 text-xs font-mono text-[#f0d9a8]">
                P/L: ≤ {filters.maxPl}
                <button
                  onClick={() => setFilters((p) => ({ ...p, maxPl: undefined }))}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.maxPvp !== undefined && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1c1916] border border-[#d4af6a]/30 text-xs font-mono text-[#f0d9a8]">
                P/VP: ≤ {filters.maxPvp}
                <button
                  onClick={() => setFilters((p) => ({ ...p, maxPvp: undefined }))}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.minRoe !== undefined && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1c1916] border border-[#d4af6a]/30 text-xs font-mono text-[#f0d9a8]">
                ROE: ≥ {filters.minRoe}%
                <button
                  onClick={() => setFilters((p) => ({ ...p, minRoe: undefined }))}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.minMarketCap !== undefined && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1c1916] border border-[#d4af6a]/30 text-xs font-mono text-[#f0d9a8]">
                Val. Mercado: ≥ {formatVolumeBRL(filters.minMarketCap)}
                <button
                  onClick={() => setFilters((p) => ({ ...p, minMarketCap: undefined }))}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.minVolume !== undefined && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1c1916] border border-[#d4af6a]/30 text-xs font-mono text-[#f0d9a8]">
                Volume: ≥ {formatVolumeBRL(filters.minVolume)}
                <button
                  onClick={() => setFilters((p) => ({ ...p, minVolume: undefined }))}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Clear Filters Button */}
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-xs font-mono text-[#ff5c6c] hover:bg-[#ff5c6c]/10 border border-[#ff5c6c]/30 transition-colors cursor-pointer ml-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpar filtros</span>
              </button>
            )}
          </div>

          {/* Results Counter */}
          <div className="text-xs font-mono text-[#c2b9ac]">
            Resultados: <strong className="text-[#f5efe6]">{totalItems}</strong> de{' '}
            <strong className="text-[#c2b9ac]">{stocks.length}</strong> ativos
          </div>
        </div>
      </div>

      {/* Screener Table */}
      <div className="bg-[#141210] border border-[#d4af6a]/20 rounded-[14px] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#d4af6a]/20 bg-[#1c1916]/80 text-[11px] font-mono text-[#a39a8c] uppercase tracking-wider select-none">
                {ALL_COLUMNS.map((col) => {
                  if (!visibleColumns[col.key]) return null;

                  const isSorted = sortField === col.key;
                  return (
                    <th
                      key={col.key}
                      onClick={() => col.sortable && handleSort(col.key)}
                      className={`px-4 py-3.5 font-medium transition-colors ${
                        col.sortable ? 'cursor-pointer hover:text-[#f5efe6]' : ''
                      } ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                    >
                      <div
                        className={`inline-flex items-center gap-1.5 ${
                          col.align === 'right'
                            ? 'justify-end'
                            : col.align === 'center'
                            ? 'justify-center'
                            : 'justify-start'
                        }`}
                      >
                        <span>{col.label}</span>
                        {col.sortable && (
                          <span className="text-[#d4af6a]">
                            {isSorted ? (
                              sortDirection === 'asc' ? (
                                <ArrowUp className="w-3 h-3" />
                              ) : (
                                <ArrowDown className="w-3 h-3" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-[#6e675c] opacity-60" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.04] text-xs">
              {paginatedStocks.length === 0 ? (
                <tr>
                  <td colSpan={ALL_COLUMNS.length} className="px-6 py-16 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-10 h-10 rounded-full bg-[#1c1916] border border-[#d4af6a]/20 flex items-center justify-center mx-auto text-[#d4af6a]">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-serif font-bold text-[#f5efe6]">
                        Nenhum ativo encontrado com estes filtros
                      </p>
                      <p className="text-xs text-[#a39a8c] font-sans">
                        Tente relaxar alguns parâmetros ou clique em &quot;Limpar filtros&quot; para voltar a visualizar a lista completa de ativos da B3.
                      </p>
                      <button
                        onClick={resetFilters}
                        className="px-4 py-1.5 rounded-[8px] bg-[#d4af6a] text-[#0b0a09] text-xs font-mono font-bold hover:bg-[#f0d9a8] transition-colors cursor-pointer"
                      >
                        Redefinir Filtros
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedStocks.map((stock) => {
                  const isUp = stock.changePercent >= 0;
                  const isFii = stock.category === 'fii' || stock.ticker.endsWith('11');

                  return (
                    <tr
                      key={stock.ticker}
                      className="hover:bg-[#1c1916]/50 transition-colors group"
                    >
                      {/* Ativo / Empresa */}
                      {visibleColumns.ticker && (
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {stock.logoUrl ? (
                              <img
                                src={stock.logoUrl}
                                alt={stock.ticker}
                                className="w-7 h-7 rounded-full object-contain bg-white/5 border border-white/10 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#24201c] to-[#141210] border border-[#d4af6a]/25 flex items-center justify-center font-mono font-bold text-[10px] text-[#d4af6a] shrink-0">
                                {stock.ticker.slice(0, 3)}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-1.5">
                                <Link
                                  to={`/mercado/${stock.ticker}`}
                                  className="font-mono font-bold text-sm text-[#f5efe6] tracking-tight group-hover:text-[#d4af6a] hover:underline transition-colors"
                                >
                                  {stock.ticker}
                                </Link>
                              </div>
                              <span
                                className="text-[11px] text-[#a39a8c] line-clamp-1 max-w-[170px]"
                                title={stock.name}
                              >
                                {stock.name}
                              </span>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Categoria */}
                      {visibleColumns.category && (
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                              isFii
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                : 'bg-[#d4af6a]/10 border-[#d4af6a]/30 text-[#f0d9a8]'
                            }`}
                          >
                            {isFii ? 'FII' : 'Ação'}
                          </span>
                        </td>
                      )}

                      {/* Preço */}
                      {visibleColumns.price && (
                        <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono tabular-nums text-sm font-bold text-[#f5efe6]">
                          {formatBRL(stock.price)}
                        </td>
                      )}

                      {/* Variação Dia */}
                      {visibleColumns.change && (
                        <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono tabular-nums text-xs">
                          <span
                            className={`font-bold inline-flex items-center gap-0.5 ${
                              isUp ? 'text-[#3ddc97]' : 'text-[#ff5c6c]'
                            }`}
                          >
                            <span>{isUp ? '+' : ''}</span>
                            <span>{formatPercent(stock.changePercent)}</span>
                          </span>
                        </td>
                      )}

                      {/* Dividend Yield */}
                      {visibleColumns.dy && (
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          {renderCellIndicator(stock.dividendYield, (v) => `${v.toFixed(2)}%`)}
                        </td>
                      )}

                      {/* P/L */}
                      {visibleColumns.pl && (
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          {renderCellIndicator(stock.pl, (v) => v.toFixed(2))}
                        </td>
                      )}

                      {/* P/VP */}
                      {visibleColumns.pvp && (
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          {renderCellIndicator(stock.pvp, (v) => v.toFixed(2))}
                        </td>
                      )}

                      {/* ROE */}
                      {visibleColumns.roe && (
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          {renderCellIndicator(stock.roe, (v) => `${v.toFixed(2)}%`)}
                        </td>
                      )}

                      {/* Valor de Mercado */}
                      {visibleColumns.marketCap && (
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          {renderCellIndicator(stock.marketCap, (v) => formatVolumeBRL(v))}
                        </td>
                      )}

                      {/* Volume Diário */}
                      {visibleColumns.volume && (
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <span className="font-mono tabular-nums text-xs text-[#c2b9ac]">
                            {formatVolumeBRL(stock.avgVolume || stock.volume)}
                          </span>
                        </td>
                      )}

                      {/* Tendência Sparkline */}
                      {visibleColumns.sparkline && (
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <div className="flex justify-center">
                            <MiniSparkline stock={stock} width={68} height={24} />
                          </div>
                        </td>
                      )}

                      {/* Ações */}
                      {visibleColumns.actions && (
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onSelectStockForChart(stock)}
                              className="p-1.5 rounded-[6px] bg-[#1c1916] hover:bg-[#24201c] border border-[#d4af6a]/20 text-[#d4af6a] hover:text-[#f0d9a8] transition-colors cursor-pointer"
                              title="Visualizar gráfico interativo"
                            >
                              <BarChart2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onSelectStockForAi(stock)}
                              className="p-1.5 rounded-[6px] bg-[#1c1916] hover:bg-[#24201c] border border-[#d4af6a]/20 text-[#f0d9a8] hover:text-white transition-colors cursor-pointer"
                              title="Síntese didática com IA"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-[#d4af6a]" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Rows per page Footer */}
        <div className="px-4 py-3.5 bg-[#1c1916]/80 border-t border-[#d4af6a]/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#c2b9ac]">
          <div className="flex items-center gap-3">
            <span>
              Mostrando {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a{' '}
              {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} ativos
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-[#8c8273]">Por página:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-[#141210] border border-[#d4af6a]/20 rounded px-2 py-0.5 text-xs font-mono text-[#f5efe6] focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Page Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded bg-[#141210] border border-[#d4af6a]/20 text-[#c2b9ac] hover:text-[#f5efe6] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2.5 py-1 rounded bg-[#141210] border border-[#d4af6a]/20 text-xs font-bold text-[#f5efe6]">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded bg-[#141210] border border-[#d4af6a]/20 text-[#c2b9ac] hover:text-[#f5efe6] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Próxima página"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Disclaimers & Notes on indicators */}
      <div className="p-4 rounded-[12px] bg-[#141210] border border-[#d4af6a]/15 flex items-start gap-3 text-xs text-[#a39a8c]">
        <Info className="w-4 h-4 text-[#d4af6a] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p>
            <strong className="text-[#f5efe6]">Critério de Transparência de Dados:</strong> O indicador identificado como &quot;n/d&quot; sinaliza que a informação não foi reportada pela fonte oficial da API (brapi.dev) no momento da consulta. Conforme a política da NorteInvest, nunca geramos estimativas ou números fictícios.
          </p>
          <p className="text-[11px] text-[#8c8273]">
            Conteúdo estritamente informativo e educacional. Não constitui recomendação de compra ou venda de ativos mobiliários.
          </p>
        </div>
      </div>
    </div>
  );
};
