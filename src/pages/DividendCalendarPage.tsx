import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useMarket } from '../context/MarketContext';
import { useFavorites } from '../hooks/useFavorites';
import { usePageMeta } from '../hooks/usePageMeta';
import { fetchDividendsCalendar } from '../services/marketService';
import { DividendCalendarItem } from '../types/market';
import { formatBRL, formatPercent } from '../utils/formatters';
import {
  Calendar,
  DollarSign,
  Star,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Layers,
  Sparkles,
  ExternalLink,
  Scale,
} from 'lucide-react';

export const DividendCalendarPage: React.FC = () => {
  usePageMeta(
    'Calendário de Dividendos B3',
    'Acompanhe as datas-com, datas de pagamento, dividendos, JCP e rendimentos de FIIs agendados na bolsa brasileira.'
  );

  const { marketState } = useMarket();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const [calendarItems, setCalendarItems] = useState<DividendCalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterMode, setFilterMode] = useState<'all' | 'favorites'>('all');
  const [filterType, setFilterType] = useState<'all' | 'DIVIDENDO' | 'JCP' | 'RENDIMENTO'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'acao' | 'fii'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dataCom' | 'paymentDate' | 'rate' | 'yield'>('dataCom');

  // Load calendar events
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchDividendsCalendar()
      .then((data) => {
        if (!isMounted) return;
        setCalendarItems(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn('Erro ao carregar calendário de dividendos:', err);
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Filter & Search Logic
  const filteredItems = useMemo(() => {
    return calendarItems
      .filter((item) => {
        // Mode: all vs favorites
        if (filterMode === 'favorites' && !favorites.includes(item.ticker.toUpperCase())) {
          return false;
        }

        // Search
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim();
          const matches =
            item.ticker.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // Type
        if (filterType !== 'all' && item.label !== filterType) {
          return false;
        }

        // Category
        if (filterCategory !== 'all' && item.category !== filterCategory) {
          return false;
        }

        // Month filter (YYYY-MM)
        if (monthFilter !== 'all') {
          const itemMonth = (item.lastDatePrior || item.paymentDate || '').slice(0, 7);
          if (itemMonth !== monthFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'dataCom') {
          return (b.lastDatePrior || '').localeCompare(a.lastDatePrior || '');
        }
        if (sortBy === 'paymentDate') {
          return (b.paymentDate || '').localeCompare(a.paymentDate || '');
        }
        if (sortBy === 'rate') {
          return b.rate - a.rate;
        }
        if (sortBy === 'yield') {
          return (b.yieldApprox || 0) - (a.yieldApprox || 0);
        }
        return 0;
      });
  }, [calendarItems, filterMode, favorites, searchTerm, filterType, filterCategory, monthFilter, sortBy]);

  // Unique months available for selection
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    calendarItems.forEach((item) => {
      const d = item.lastDatePrior || item.paymentDate;
      if (d && d.length >= 7) {
        set.add(d.slice(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [calendarItems]);

  // Top KPI Stats
  const stats = useMemo(() => {
    const upcomingCom = calendarItems
      .filter((it) => it.lastDatePrior && it.lastDatePrior >= todayStr)
      .sort((a, b) => a.lastDatePrior.localeCompare(b.lastDatePrior))[0];

    const upcomingPayments = calendarItems.filter(
      (it) => it.paymentDate && it.paymentDate >= todayStr && it.paymentDate !== 'A definir'
    );

    const highestRate = [...calendarItems].sort((a, b) => b.rate - a.rate)[0];

    return {
      upcomingCom,
      upcomingPaymentsCount: upcomingPayments.length,
      highestRate,
      totalCount: calendarItems.length,
    };
  }, [calendarItems, todayStr]);

  // Format date helper: YYYY-MM-DD -> DD/MM/YYYY
  const formatDateBR = (iso?: string) => {
    if (!iso || iso === 'A definir') return 'A definir';
    const parts = iso.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return iso;
  };

  // Helper to compute countdown in days
  const getDaysDiff = (targetIso: string) => {
    if (!targetIso || targetIso === 'A definir') return null;
    const target = new Date(`${targetIso}T12:00:00`);
    const today = new Date(`${todayStr}T12:00:00`);
    const diffTime = target.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#d4af6a]/15">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#d4af6a] uppercase tracking-wider mb-2">
            <Calendar className="w-4 h-4" />
            <span>Renda Passiva & Dividendos</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#f5efe6] tracking-tight">
            Calendário de Dividendos B3
          </h1>
          <p className="mt-1 text-sm text-[#a39a8c]">
            Acompanhe as próximas datas-com (prazo para ter direito) e datas de pagamento dos ativos monitorados da bolsa.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/favoritos"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1714] hover:bg-[#24201c] text-[#a39a8c] hover:text-[#f5efe6] border border-[#d4af6a]/15 text-xs font-medium transition-all"
          >
            <Star className="w-4 h-4 text-[#d4af6a]" />
            <span>Meus Favoritos ({favorites.length})</span>
          </Link>

          <Link
            to="/comparar"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#d4af6a]/15 hover:bg-[#d4af6a]/25 text-[#f0d9a8] border border-[#d4af6a]/30 text-xs font-medium transition-all"
          >
            <Scale className="w-4 h-4" />
            <span>Comparador</span>
          </Link>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 my-6">
        <div className="p-4 rounded-xl bg-[#141210] border border-[#d4af6a]/20 shadow-md">
          <div className="flex items-center justify-between text-[#8c8273] mb-1">
            <span className="text-[11px] font-mono uppercase">Próxima Data-Com</span>
            <Clock className="w-4 h-4 text-[#d4af6a]" />
          </div>
          {stats.upcomingCom ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-mono font-bold text-[#f0d9a8]">
                  {stats.upcomingCom.ticker}
                </span>
                <span className="text-xs font-mono text-[#f5efe6]">
                  {formatDateBR(stats.upcomingCom.lastDatePrior)}
                </span>
              </div>
              <span className="text-[11px] text-[#34d399] font-mono mt-0.5 block">
                {(() => {
                  const diff = getDaysDiff(stats.upcomingCom.lastDatePrior);
                  if (diff === 0) return 'Data-com é HOJE!';
                  if (diff === 1) return 'Amanhã';
                  if (diff && diff > 1) return `Em ${diff} dias`;
                  return 'Recente';
                })()}
              </span>
            </div>
          ) : (
            <span className="text-xs font-mono text-[#8c8273] block mt-2">Nenhuma data-com imediata</span>
          )}
        </div>

        <div className="p-4 rounded-xl bg-[#141210] border border-[#d4af6a]/20 shadow-md">
          <div className="flex items-center justify-between text-[#8c8273] mb-1">
            <span className="text-[11px] font-mono uppercase">Pagamentos Previstos</span>
            <DollarSign className="w-4 h-4 text-[#34d399]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#f5efe6]">
            {stats.upcomingPaymentsCount}
          </div>
          <span className="text-[11px] text-[#a39a8c] block mt-0.5">
            agendados nos próximos meses
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#141210] border border-[#d4af6a]/20 shadow-md">
          <div className="flex items-center justify-between text-[#8c8273] mb-1">
            <span className="text-[11px] font-mono uppercase">Maior Provento Anunciado</span>
            <Sparkles className="w-4 h-4 text-[#d4af6a]" />
          </div>
          {stats.highestRate ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-mono font-bold text-[#34d399]">
                  {formatBRL(stats.highestRate.rate)}
                </span>
                <span className="text-xs font-mono text-[#a39a8c]">
                  por cota ({stats.highestRate.ticker})
                </span>
              </div>
              <span className="text-[11px] text-[#8c8273] block mt-0.5 truncate">
                {stats.highestRate.label} • {stats.highestRate.name}
              </span>
            </div>
          ) : (
            <span className="text-xs font-mono text-[#8c8273] block mt-2">—</span>
          )}
        </div>

        <div className="p-4 rounded-xl bg-[#141210] border border-[#d4af6a]/20 shadow-md">
          <div className="flex items-center justify-between text-[#8c8273] mb-1">
            <span className="text-[11px] font-mono uppercase">Eventos Monitorados</span>
            <Layers className="w-4 h-4 text-[#a39a8c]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#f5efe6]">
            {stats.totalCount}
          </div>
          <span className="text-[11px] text-[#a39a8c] block mt-0.5">
            distribuições de ações e FIIs
          </span>
        </div>
      </div>

      {/* Filter and Mode Bar */}
      <div className="p-4 rounded-xl bg-[#141210] border border-[#d4af6a]/20 my-6 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Mode Switcher: Todos vs Favoritos */}
          <div className="inline-flex p-1 rounded-xl bg-[#0b0a09] border border-[#d4af6a]/20">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono uppercase transition-all ${
                filterMode === 'all'
                  ? 'bg-[#d4af6a] text-[#0b0a09] font-bold shadow-sm'
                  : 'text-[#8c8273] hover:text-[#f5efe6]'
              }`}
            >
              Todos os Ativos ({calendarItems.length})
            </button>
            <button
              onClick={() => setFilterMode('favorites')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-mono uppercase transition-all ${
                filterMode === 'favorites'
                  ? 'bg-[#d4af6a] text-[#0b0a09] font-bold shadow-sm'
                  : 'text-[#8c8273] hover:text-[#f5efe6]'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Apenas Meus Favoritos ({favorites.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8273]" />
            <input
              type="text"
              placeholder="Buscar por ticker ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0b0a09] border border-[#d4af6a]/20 text-xs text-[#f5efe6] placeholder-[#8c8273] focus:outline-none focus:border-[#d4af6a]"
            />
          </div>
        </div>

        {/* Detailed Secondary Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#d4af6a]/10 text-xs">
          {/* Category */}
          <div className="inline-flex p-0.5 rounded-lg bg-[#0b0a09] border border-[#d4af6a]/15">
            {(['all', 'acao', 'fii'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase transition-all ${
                  filterCategory === cat
                    ? 'bg-[#d4af6a]/20 text-[#f0d9a8] font-bold'
                    : 'text-[#8c8273] hover:text-[#f5efe6]'
                }`}
              >
                {cat === 'all' ? 'Categorias' : cat === 'acao' ? 'Ações' : 'FIIs'}
              </button>
            ))}
          </div>

          {/* Type */}
          <div className="inline-flex p-0.5 rounded-lg bg-[#0b0a09] border border-[#d4af6a]/15">
            {(['all', 'DIVIDENDO', 'JCP', 'RENDIMENTO'] as const).map((tp) => (
              <button
                key={tp}
                onClick={() => setFilterType(tp)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
                  filterType === tp
                    ? 'bg-[#d4af6a]/20 text-[#f0d9a8] font-bold'
                    : 'text-[#8c8273] hover:text-[#f5efe6]'
                }`}
              >
                {tp === 'all' ? 'Todos os Tipos' : tp}
              </button>
            ))}
          </div>

          {/* Month selector */}
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-[#0b0a09] border border-[#d4af6a]/20 text-xs text-[#a39a8c] focus:outline-none focus:border-[#d4af6a]"
          >
            <option value="all">Todos os Meses</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1 rounded-lg bg-[#0b0a09] border border-[#d4af6a]/20 text-xs text-[#a39a8c] focus:outline-none focus:border-[#d4af6a] ml-auto"
          >
            <option value="dataCom">Ordenar por Data-Com</option>
            <option value="paymentDate">Ordenar por Data de Pagamento</option>
            <option value="rate">Ordenar por Valor (R$)</option>
            <option value="yield">Ordenar por Yield Aprox (%)</option>
          </select>
        </div>
      </div>

      {/* Calendar List Table */}
      <div className="rounded-2xl bg-[#12100e] border border-[#d4af6a]/20 shadow-2xl overflow-hidden mb-12">
        <div className="p-4 sm:p-5 border-b border-[#d4af6a]/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#d4af6a]">
              Tabela Cronológica de Proventos
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#1c1916] text-[#a39a8c]">
              {filteredItems.length} registros
            </span>
          </div>

          <span className="text-xs text-[#8c8273] hidden sm:block">
            Valores brutos por ação/cota anunciados em fatos relevantes da B3
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-xs font-mono text-[#8c8273]">
            <div className="w-8 h-8 border-2 border-[#d4af6a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Consultando agenda de proventos...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#8c8273]">
            {filterMode === 'favorites' ? (
              <div className="max-w-md mx-auto space-y-3">
                <Star className="w-8 h-8 text-[#d4af6a] mx-auto opacity-50" />
                <p>Nenhum provento agendado encontrado para seus ativos favoritados.</p>
                <button
                  onClick={() => setFilterMode('all')}
                  className="px-4 py-2 rounded-lg bg-[#d4af6a]/20 text-[#f0d9a8] border border-[#d4af6a]/30 text-xs font-medium"
                >
                  Exibir todos os ativos monitorados
                </button>
              </div>
            ) : (
              <p>Nenhum evento corresponde aos filtros selecionados.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#d4af6a]/15 bg-[#161412] text-[11px] font-mono text-[#8c8273] uppercase tracking-wider">
                  <th className="py-3 px-4 w-10 text-center">Fav</th>
                  <th className="py-3 px-4">Ativo</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Data COM (Direito)</th>
                  <th className="py-3 px-4">Data Pagamento</th>
                  <th className="py-3 px-4 text-right">Valor por Cota</th>
                  <th className="py-3 px-4 text-right hidden sm:table-cell">Yield Aprox</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d4af6a]/10 text-sm font-sans">
                {filteredItems.map((item) => {
                  const fav = isFavorite(item.ticker);
                  const isFutureCom = item.lastDatePrior && item.lastDatePrior >= todayStr;
                  const daysToCom = getDaysDiff(item.lastDatePrior);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#1a1714]/60 transition-colors group"
                    >
                      {/* Favorite Button */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => toggleFavorite(item.ticker)}
                          className="p-1 rounded hover:bg-[#d4af6a]/20 text-[#8c8273] hover:text-[#d4af6a] transition-all"
                          title={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              fav ? 'fill-[#d4af6a] text-[#d4af6a]' : ''
                            }`}
                          />
                        </button>
                      </td>

                      {/* Ticker & Name */}
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/mercado/${item.ticker}`}
                          className="flex items-center gap-2 group-hover:text-[#f0d9a8] transition-colors"
                        >
                          <div className="w-7 h-7 rounded bg-[#1f1b17] border border-[#d4af6a]/20 flex items-center justify-center font-mono font-bold text-xs text-[#d4af6a] shrink-0">
                            {item.ticker.slice(0, 3)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-sm text-[#f5efe6] group-hover:text-[#d4af6a]">
                                {item.ticker}
                              </span>
                              <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-[#1c1916] text-[#8c8273]">
                                {item.category}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#8c8273] block truncate max-w-[150px] sm:max-w-[190px]">
                              {item.name}
                            </span>
                          </div>
                        </Link>
                      </td>

                      {/* Type Pill */}
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            item.label === 'DIVIDENDO'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : item.label === 'JCP'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                          }`}
                        >
                          {item.label}
                        </span>
                      </td>

                      {/* Data COM */}
                      <td className="py-3.5 px-4 font-mono text-xs text-[#f5efe6]">
                        <div>
                          <span className="font-semibold">{formatDateBR(item.lastDatePrior)}</span>
                          {isFutureCom && typeof daysToCom === 'number' && (
                            <span className="block text-[10px] text-[#34d399] font-semibold">
                              {daysToCom === 0 ? 'Data COM é HOJE!' : daysToCom === 1 ? 'Amanhã' : `Em ${daysToCom} dias`}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Data de Pagamento */}
                      <td className="py-3.5 px-4 font-mono text-xs text-[#a39a8c]">
                        {formatDateBR(item.paymentDate)}
                      </td>

                      {/* Rate */}
                      <td className="py-3.5 px-4 text-right font-mono text-xs font-bold text-[#34d399]">
                        {formatBRL(item.rate)}
                      </td>

                      {/* Yield Approx */}
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-[#f0d9a8] hidden sm:table-cell">
                        {item.yieldApprox ? `${item.yieldApprox.toFixed(2)}%` : '—'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center font-mono text-xs">
                        {isFutureCom ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Com Direito</span>
                          </span>
                        ) : item.paymentDate && item.paymentDate >= todayStr ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px]">
                            <span>Aguardando Pagamento</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1c1916] text-[#8c8273] text-[10px]">
                            <span>Data-Com Encerrada</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/mercado/${item.ticker}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#d4af6a]/15 hover:bg-[#d4af6a]/25 text-[#f0d9a8] border border-[#d4af6a]/30 text-xs font-medium transition-all"
                        >
                          <span>Ver</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Educational Guide Box */}
      <div className="p-6 rounded-2xl bg-[#141210] border border-[#d4af6a]/20">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-[#d4af6a]" />
          <h3 className="text-lg font-serif font-bold text-[#f5efe6]">
            Guia Rápido: Como funcionam os proventos na B3
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#a39a8c] leading-relaxed">
          <div className="p-3.5 rounded-xl bg-[#0b0a09] border border-[#d4af6a]/10">
            <span className="font-mono font-bold text-[#f0d9a8] uppercase block mb-1">
              1. Data COM (Direito)
            </span>
            <p>
              É o último dia útil em que você precisa terminar o pregão com as ações ou cotas em carteira para ter direito a receber o provento anunciado.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0b0a09] border border-[#d4af6a]/10">
            <span className="font-mono font-bold text-[#f0d9a8] uppercase block mb-1">
              2. Data EX (Sem Direito)
            </span>
            <p>
              No dia útil imediatamente seguinte à Data COM, as ações passam a ser negociadas "Ex-proventos". Quem comprar nessa data não receberá este provento específico.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0b0a09] border border-[#d4af6a]/10">
            <span className="font-mono font-bold text-[#f0d9a8] uppercase block mb-1">
              3. Data de Pagamento
            </span>
            <p>
              Dia em que o dinheiro é creditado diretamente na conta da sua corretora de valores. Dividendos de ações e FIIs são isentos de IR para pessoa física; JCP possui 15% retido na fonte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
