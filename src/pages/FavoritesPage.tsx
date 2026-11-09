import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useMarket } from '../context/MarketContext';
import { useFavorites } from '../hooks/useFavorites';
import { usePlan } from '../context/PlanContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { Sparkline } from '../components/Sparkline';
import { formatBRL, formatPercent, formatVolumeBRL } from '../utils/formatters';
import {
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ArrowRight,
  Trash2,
  Scale,
  Search,
  ExternalLink,
  Plus,
  SlidersHorizontal,
  Layers,
  BarChart2,
  ShieldAlert,
  Crown,
  Lock,
} from 'lucide-react';

export const FavoritesPage: React.FC = () => {
  usePageMeta(
    'Meus Ativos Favoritos',
    'Acompanhe cotações atualizadas a cada 60 segundos, variação diária, gráficos sparkline e indicadores fundamentalistas dos seus ativos salvos da B3.'
  );

  const navigate = useNavigate();
  const { marketState } = useMarket();
  const { favorites, toggleFavorite, addFavorite, clearFavorites, count } = useFavorites();
  const { isPremium, limits, openWaitlistModal } = usePlan();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'acao' | 'fii'>('all');
  const [sortBy, setSortBy] = useState<'ticker' | 'change' | 'price' | 'dy'>('change');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Suggestions for empty state
  const popularSuggestions = [
    { ticker: 'PETR4', name: 'Petrobras PN', sector: 'Petróleo & Gás', category: 'acao' },
    { ticker: 'VALE3', name: 'Vale ON', sector: 'Mineração', category: 'acao' },
    { ticker: 'ITUB4', name: 'Itaú Unibanco PN', sector: 'Financeiro', category: 'acao' },
    { ticker: 'WEGE3', name: 'WEG ON', sector: 'Bens Industriais', category: 'acao' },
    { ticker: 'MXRF11', name: 'Maxi Renda FII', sector: 'Fundos Imobiliários', category: 'fii' },
    { ticker: 'HGLG11', name: 'CSHG Logística FII', sector: 'Fundos Imobiliários', category: 'fii' },
  ];

  // Resolve favorited stocks with live marketState data
  const favoritedStocks = useMemo(() => {
    return favorites.map((ticker) => {
      const live = marketState.stocks.find(
        (s) => s.ticker.toUpperCase() === ticker.toUpperCase()
      );
      if (live) return live;
      // Fallback placeholder if not in top active list yet
      const isFii = ticker.endsWith('11');
      return {
        ticker,
        name: ticker,
        price: 0,
        change: 0,
        changePercent: 0,
        volume: 0,
        sector: isFii ? 'Fundo Imobiliário (FII)' : 'B3',
        category: (isFii ? 'fii' : 'acao') as 'acao' | 'fii',
        sparkline: undefined,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [favorites, marketState.stocks]);

  // Filter & Search
  const filteredStocks = useMemo(() => {
    return favoritedStocks
      .filter((stock) => {
        const matchesSearch =
          stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (stock.sector || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
          filterCategory === 'all' || stock.category === filterCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'ticker') diff = a.ticker.localeCompare(b.ticker);
        else if (sortBy === 'price') diff = a.price - b.price;
        else if (sortBy === 'change') diff = a.changePercent - b.changePercent;
        else if (sortBy === 'dy') diff = (a.dividendYield || 0) - (b.dividendYield || 0);

        return sortOrder === 'desc' ? -diff : diff;
      });
  }, [favoritedStocks, searchTerm, filterCategory, sortBy, sortOrder]);

  // Portfolio metrics summary
  const stats = useMemo(() => {
    if (favoritedStocks.length === 0) return null;
    const valid = favoritedStocks.filter((s) => s.price > 0);
    if (valid.length === 0) return null;

    const avgChange = valid.reduce((acc, s) => acc + s.changePercent, 0) / valid.length;
    const best = [...valid].sort((a, b) => b.changePercent - a.changePercent)[0];
    const worst = [...valid].sort((a, b) => a.changePercent - b.changePercent)[0];
    const withDy = valid.filter((s) => typeof s.dividendYield === 'number' && s.dividendYield > 0);
    const avgDy = withDy.length > 0 ? withDy.reduce((acc, s) => acc + (s.dividendYield || 0), 0) / withDy.length : null;

    return {
      count: valid.length,
      avgChange,
      best,
      worst,
      avgDy,
    };
  }, [favoritedStocks]);

  const handleToggle = (ticker: string) => {
    const isNowFavorite = toggleFavorite(ticker);
    setToastMessage(
      isNowFavorite
        ? `${ticker} adicionado aos favoritos!`
        : `${ticker} removido dos favoritos.`
    );
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCompareAll = () => {
    const tickersToCompare = favoritedStocks.slice(0, 4).map((s) => s.ticker);
    if (tickersToCompare.length > 0) {
      navigate(`/comparar?tickers=${tickersToCompare.join(',')}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-50 px-4 py-2.5 rounded-lg bg-[#141210] border border-[#d4af6a]/40 text-[#f5efe6] shadow-xl text-xs font-mono flex items-center gap-2"
          >
            <Star className="w-4 h-4 text-[#d4af6a] fill-[#d4af6a]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#d4af6a]/15">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#d4af6a] uppercase tracking-wider mb-2">
            <Star className="w-4 h-4 fill-[#d4af6a]" />
            <span>Monitoramento Pessoal</span>
            <span className="text-[#6b6255]">•</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isPremium ? 'bg-[#d4af6a]/20 text-[#f0d9a8] border border-[#d4af6a]/30' : 'bg-[#1c1916] text-[#c2b9ac] border border-[#d4af6a]/15'}`}>
              {isPremium ? '⭐ Premium: Ilimitados' : `Capacidade: ${favorites.length}/5 (Gratuito)`}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#f5efe6] tracking-tight">
            Meus Ativos Favoritos
          </h1>
          <p className="mt-1 text-sm text-[#a39a8c]">
            Acompanhe a performance diária, múltiplos e gráficos rápidos dos ativos que você salvou.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-3">
          {count > 1 && (
            <button
              onClick={handleCompareAll}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#d4af6a]/15 hover:bg-[#d4af6a]/25 text-[#f0d9a8] border border-[#d4af6a]/30 text-xs font-medium transition-all cursor-pointer"
            >
              <Scale className="w-4 h-4" />
              <span>Comparar Selecionados ({Math.min(count, isPremium ? 4 : 2)})</span>
            </button>
          )}

          <Link
            to="/mercado"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1714] hover:bg-[#24201c] text-[#a39a8c] hover:text-[#f5efe6] border border-[#d4af6a]/15 text-xs font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Explorar Mercado</span>
          </Link>
        </div>
      </div>

      {/* Free Plan Limit Notice when at capacity */}
      {!isPremium && favorites.length >= limits.maxFavorites && (
        <div className="mt-6 p-4 rounded-[14px] bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[10px] bg-amber-500/20 text-amber-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#f5efe6]">
                Limite de 5 ativos favoritos atingido no plano Gratuito
              </div>
              <div className="text-[11px] text-[#c2b9ac]">
                Quer monitorar mais ativos? Desbloqueie favoritos ilimitados e alertas de preço no plano Premium.
              </div>
            </div>
          </div>
          <button
            onClick={() => openWaitlistModal('Favoritos Ilimitados (limite de 5 no plano Gratuito)')}
            className="px-3.5 py-1.5 rounded-[8px] bg-gradient-to-r from-[#d4af6a] to-[#e6ca85] text-[#0a0908] text-xs font-bold transition-all hover:brightness-110 flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Desbloquear Ilimitados</span>
          </button>
        </div>
      )}

      {/* Stats summary bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
          <div className="p-4 rounded-xl bg-[#141210] border border-[#d4af6a]/15">
            <span className="text-[11px] font-mono text-[#8c8273] uppercase block">Total Monitorados</span>
            <div className="text-2xl font-mono font-bold text-[#f5efe6] mt-1">{stats.count}</div>
            <span className="text-[11px] text-[#a39a8c]">salvos no seu navegador</span>
          </div>

          <div className="p-4 rounded-xl bg-[#141210] border border-[#d4af6a]/15">
            <span className="text-[11px] font-mono text-[#8c8273] uppercase block">Variação Média Hoje</span>
            <div
              className={`text-2xl font-mono font-bold mt-1 flex items-center gap-1.5 ${
                stats.avgChange >= 0 ? 'text-[#34d399]' : 'text-[#f87171]'
              }`}
            >
              {stats.avgChange >= 0 ? '+' : ''}
              {stats.avgChange.toFixed(2)}%
            </div>
            <span className="text-[11px] text-[#a39a8c]">média aritmética simples</span>
          </div>

          <div className="p-4 rounded-xl bg-[#141210] border border-[#d4af6a]/15">
            <span className="text-[11px] font-mono text-[#8c8273] uppercase block">Maior Alta</span>
            <div className="text-lg font-mono font-bold text-[#34d399] mt-1 truncate">
              {stats.best.ticker} (+{stats.best.changePercent.toFixed(2)}%)
            </div>
            <span className="text-[11px] text-[#8c8273] truncate block">{formatBRL(stats.best.price)}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#141210] border border-[#d4af6a]/15">
            <span className="text-[11px] font-mono text-[#8c8273] uppercase block">Maior Baixa</span>
            <div className="text-lg font-mono font-bold text-[#f87171] mt-1 truncate">
              {stats.worst.ticker} ({stats.worst.changePercent.toFixed(2)}%)
            </div>
            <span className="text-[11px] text-[#8c8273] truncate block">{formatBRL(stats.worst.price)}</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {favorites.length === 0 ? (
        <div className="my-12 py-16 px-6 text-center rounded-2xl bg-[#12100e] border border-[#d4af6a]/20 shadow-2xl max-w-2xl mx-auto">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#d4af6a]/10 border border-[#d4af6a]/30 flex items-center justify-center text-[#d4af6a] mb-5">
            <Star className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#f5efe6]">
            Sua lista de favoritos está vazia
          </h2>
          <p className="mt-2 text-sm text-[#a39a8c] max-w-md mx-auto leading-relaxed">
            Você pode favoritar qualquer ativo da B3 clicando no ícone de estrela nas tabelas, screener ou na página de detalhes de cada ação e fundo imobiliário.
          </p>

          {/* Quick suggestions */}
          <div className="mt-8 text-left">
            <span className="text-xs font-mono text-[#d4af6a] uppercase tracking-wider block mb-3 text-center">
              Sugestões rápidas para começar:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {popularSuggestions.map((item) => (
                <div
                  key={item.ticker}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#1a1714] border border-[#d4af6a]/15 hover:border-[#d4af6a]/40 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#f5efe6]">{item.ticker}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#24201c] text-[#a39a8c]">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-xs text-[#8c8273] block">{item.name}</span>
                  </div>
                  <button
                    onClick={() => handleToggle(item.ticker)}
                    className="p-2 rounded-lg bg-[#d4af6a]/15 hover:bg-[#d4af6a]/25 text-[#d4af6a] border border-[#d4af6a]/30 text-xs flex items-center gap-1 transition-all"
                    title="Adicionar aos favoritos"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Favoritar</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#d4af6a]/15 flex items-center justify-center">
            <Link
              to="/mercado"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af6a] to-[#b38e46] text-[#0b0a09] font-medium text-sm shadow-lg hover:brightness-110 transition-all"
            >
              <span>Navegar pelo Mercado B3</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Favorites Table & Grid */
        <div className="mt-6 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#141210] border border-[#d4af6a]/15">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8273]" />
              <input
                type="text"
                placeholder="Buscar por ticker, nome ou setor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0b0a09] border border-[#d4af6a]/20 text-xs text-[#f5efe6] placeholder-[#8c8273] focus:outline-none focus:border-[#d4af6a]"
              />
            </div>

            {/* Filter buttons & sorting */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex p-0.5 rounded-lg bg-[#0b0a09] border border-[#d4af6a]/20">
                {(['all', 'acao', 'fii'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1 rounded-md text-xs font-mono uppercase transition-all ${
                      filterCategory === cat
                        ? 'bg-[#d4af6a]/20 text-[#f0d9a8] font-bold'
                        : 'text-[#8c8273] hover:text-[#f5efe6]'
                    }`}
                  >
                    {cat === 'all' ? 'Todos' : cat === 'acao' ? 'Ações' : 'FIIs'}
                  </button>
                ))}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1 rounded-lg bg-[#0b0a09] border border-[#d4af6a]/20 text-xs text-[#a39a8c] focus:outline-none focus:border-[#d4af6a]"
              >
                <option value="change">Ordenar por Variação</option>
                <option value="price">Ordenar por Preço</option>
                <option value="ticker">Ordenar por Ticker</option>
                <option value="dy">Ordenar por Dividend Yield</option>
              </select>

              <button
                onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                className="px-2.5 py-1 rounded-lg bg-[#0b0a09] border border-[#d4af6a]/20 text-xs font-mono text-[#a39a8c] hover:text-[#f5efe6]"
                title="Inverter ordem"
              >
                {sortOrder === 'desc' ? 'Decrescente' : 'Crescente'}
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja remover todos os ativos dos favoritos?')) {
                    clearFavorites();
                  }
                }}
                className="p-1.5 rounded-lg text-[#8c8273] hover:text-[#f87171] hover:bg-[#f87171]/10 transition-colors"
                title="Limpar todos os favoritos"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table of Favorited Assets */}
          <div className="overflow-x-auto rounded-xl border border-[#d4af6a]/15 bg-[#12100e] shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#d4af6a]/15 bg-[#161412] text-[11px] font-mono text-[#8c8273] uppercase tracking-wider">
                  <th className="py-3 px-4 w-10 text-center">Fav</th>
                  <th className="py-3 px-4">Ativo</th>
                  <th className="py-3 px-4 text-right">Cotação</th>
                  <th className="py-3 px-4 text-right">Variação Hoje</th>
                  <th className="py-3 px-4 text-center">Gráfico Sparkline</th>
                  <th className="py-3 px-4 text-right hidden sm:table-cell">P/L</th>
                  <th className="py-3 px-4 text-right hidden sm:table-cell">P/VP</th>
                  <th className="py-3 px-4 text-right hidden md:table-cell">DY (12M)</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d4af6a]/10 text-sm font-sans">
                {filteredStocks.map((stock) => {
                  const isUp = stock.changePercent > 0;
                  const isDown = stock.changePercent < 0;

                  return (
                    <tr
                      key={stock.ticker}
                      className="hover:bg-[#1a1714]/60 transition-colors group"
                    >
                      {/* Star Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggle(stock.ticker)}
                          className="p-1 rounded hover:bg-[#d4af6a]/20 transition-all text-[#d4af6a]"
                          title="Remover dos favoritos"
                        >
                          <Star className="w-4 h-4 fill-[#d4af6a]" />
                        </button>
                      </td>

                      {/* Ticker & Name */}
                      <td className="py-3 px-4">
                        <Link
                          to={`/mercado/${stock.ticker}`}
                          className="flex items-center gap-3 group-hover:text-[#f0d9a8] transition-colors"
                        >
                          {stock.logoUrl ? (
                            <img
                              src={stock.logoUrl}
                              alt={stock.ticker}
                              className="w-8 h-8 rounded-lg bg-[#1f1b17] object-contain p-1 border border-[#d4af6a]/20 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-[#24201c] border border-[#d4af6a]/20 flex items-center justify-center font-mono font-bold text-xs text-[#d4af6a] shrink-0">
                              {stock.ticker.slice(0, 3)}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-sm text-[#f5efe6] group-hover:text-[#d4af6a]">
                                {stock.ticker}
                              </span>
                              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#1f1b17] text-[#a39a8c] border border-[#d4af6a]/10">
                                {stock.category}
                              </span>
                            </div>
                            <span className="text-xs text-[#8c8273] truncate block max-w-[160px] sm:max-w-[220px]">
                              {stock.name}
                            </span>
                          </div>
                        </Link>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#f5efe6]">
                        {stock.price > 0 ? formatBRL(stock.price) : '—'}
                      </td>

                      {/* Variation */}
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-semibold ${
                            isUp
                              ? 'text-[#34d399] bg-[#34d399]/10'
                              : isDown
                              ? 'text-[#f87171] bg-[#f87171]/10'
                              : 'text-[#a39a8c] bg-[#a39a8c]/10'
                          }`}
                        >
                          {isUp && <TrendingUp className="w-3 h-3" />}
                          {isDown && <TrendingDown className="w-3 h-3" />}
                          {!isUp && !isDown && <Minus className="w-3 h-3" />}
                          {formatPercent(stock.changePercent)}
                        </span>
                      </td>

                      {/* Sparkline Chart */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center">
                          <Sparkline
                            data={stock.sparkline}
                            width={90}
                            height={28}
                            isPositive={stock.changePercent >= 0}
                          />
                        </div>
                      </td>

                      {/* P/L */}
                      <td className="py-3 px-4 text-right font-mono text-xs text-[#a39a8c] hidden sm:table-cell">
                        {typeof stock.pl === 'number' ? stock.pl.toFixed(2) : '—'}
                      </td>

                      {/* P/VP */}
                      <td className="py-3 px-4 text-right font-mono text-xs text-[#a39a8c] hidden sm:table-cell">
                        {typeof stock.pvp === 'number' ? stock.pvp.toFixed(2) : '—'}
                      </td>

                      {/* Dividend Yield */}
                      <td className="py-3 px-4 text-right font-mono text-xs text-[#f0d9a8] font-medium hidden md:table-cell">
                        {typeof stock.dividendYield === 'number'
                          ? `${stock.dividendYield.toFixed(2)}%`
                          : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/comparar?tickers=${stock.ticker}`}
                            className="p-1.5 rounded-lg bg-[#1a1714] hover:bg-[#d4af6a]/20 text-[#a39a8c] hover:text-[#d4af6a] border border-[#d4af6a]/15 transition-all"
                            title={`Comparar ${stock.ticker}`}
                          >
                            <Scale className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            to={`/mercado/${stock.ticker}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#d4af6a]/15 hover:bg-[#d4af6a]/25 text-[#f0d9a8] border border-[#d4af6a]/30 text-xs font-medium transition-all"
                          >
                            <span>Detalhes</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
