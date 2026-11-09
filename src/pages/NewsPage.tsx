import React, { useState, useEffect, useMemo } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { APP_NAME } from '../constants/config';
import { getMarketNews, NewsItem } from '../services/newsService';
import {
  Newspaper,
  ExternalLink,
  Search,
  RefreshCw,
  Clock,
  ShieldCheck,
  TrendingUp,
  Percent,
  Coins,
  Globe,
  Filter,
} from 'lucide-react';

type ThemeFilter = 'todos' | 'macro' | 'acoes' | 'rendafixa' | 'cripto';

export const NewsPage: React.FC = () => {
  usePageMeta(
    `Radar de Notícias de Economia | ${APP_NAME}`,
    'Acompanhe as principais manchetes de mercado, B3, taxa Selic, inflação e criptoativos agregadas via feeds RSS públicos com links diretos para os veículos originais.'
  );

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cachedAt, setCachedAt] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<ThemeFilter>('todos');
  const [selectedSource, setSelectedSource] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const loadNews = async (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const { items, cachedAt: stamp } = await getMarketNews(forceRefresh);
      setNews(items);
      setCachedAt(stamp);
    } catch {
      // Keep existing state
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadNews(false);
  }, []);

  const sourcesList = useMemo(() => {
    const set = new Set<string>();
    news.forEach((n) => set.add(n.source));
    return Array.from(set);
  }, [news]);

  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      // Theme filter
      if (selectedTheme !== 'todos' && item.theme !== selectedTheme) {
        return false;
      }
      // Source filter
      if (selectedSource !== 'todos' && item.source !== selectedSource) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchSource = item.source.toLowerCase().includes(query);
        const matchTheme = item.themeLabel.toLowerCase().includes(query);
        if (!matchTitle && !matchSource && !matchTheme) {
          return false;
        }
      }
      return true;
    });
  }, [news, selectedTheme, selectedSource, searchQuery]);

  const themes: Array<{ id: ThemeFilter; label: string; icon: React.ReactNode }> = [
    { id: 'todos', label: 'Todos os Temas', icon: <Filter className="w-3.5 h-3.5" /> },
    { id: 'macro', label: 'Macroeconomia & Juros', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'acoes', label: 'B3 & Ações', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'rendafixa', label: 'Renda Fixa & Títulos', icon: <Percent className="w-3.5 h-3.5" /> },
    { id: 'cripto', label: 'Criptoativos', icon: <Coins className="w-3.5 h-3.5" /> },
  ];

  const getThemeBadgeColor = (theme: NewsItem['theme']) => {
    switch (theme) {
      case 'acoes':
        return 'bg-[#3ddc97]/10 text-[#3ddc97] border-[#3ddc97]/25';
      case 'rendafixa':
        return 'bg-[#d4af6a]/15 text-[#f0d9a8] border-[#d4af6a]/30';
      case 'cripto':
        return 'bg-[#f59e0b]/10 text-[#fbbf24] border-[#f59e0b]/25';
      case 'macro':
        return 'bg-[#60a5fa]/10 text-[#93c5fd] border-[#60a5fa]/25';
      default:
        return 'bg-[#1c1916] text-[#c2b9ac] border-[#d4af6a]/15';
    }
  };

  const getSourceBadgeColor = (source: string) => {
    if (source.includes('InfoMoney')) return 'text-[#f0d9a8] border-[#d4af6a]/25 bg-[#d4af6a]/10';
    if (source.includes('G1')) return 'text-[#f87171] border-[#ef4444]/25 bg-[#ef4444]/10';
    return 'text-[#6ee7b7] border-[#10b981]/25 bg-[#10b981]/10';
  };

  return (
    <div>
      <PageHeader
        badge="Feeds RSS Públicos Oficiais"
        badgeColor="gold"
        title="Radar de"
        titleHighlight="Notícias"
        subtitle="Manchetes dos principais veículos de jornalismo econômico do Brasil com cache inteligente de 15 minutos e link direto para as fontes originais."
        breadcrumbs={[{ label: 'Notícias' }]}
      >
        <button
          onClick={() => loadNews(true)}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#141210] hover:bg-[#1c1916] border border-[#d4af6a]/25 text-xs font-mono font-medium text-[#f0d9a8] transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#d4af6a]' : ''}`} />
          <span>{isRefreshing ? 'Atualizando...' : 'Atualizar Feeds'}</span>
        </button>
      </PageHeader>

      <div className="py-12 sm:py-16 bg-[#0b0a09]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Controls: Search, Theme Filters, Source Filters */}
          <div className="space-y-4">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#d4af6a] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por assunto ou palavra-chave (ex: Selic, Petrobras, dólar, inflação, balanço)..."
                className="w-full pl-11 pr-4 py-3 rounded-[12px] bg-[#141210] border border-[#d4af6a]/20 text-xs sm:text-sm text-[#f5efe6] placeholder-[#8c8273] focus:outline-none focus:border-[#d4af6a] transition-all shadow-inner"
              />
            </div>

            {/* Theme Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {themes.map((t) => {
                const isActive = selectedTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTheme(t.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#d4af6a] text-[#0b0a09] border-[#d4af6a] font-bold shadow-md'
                        : 'bg-[#141210] text-[#c2b9ac] border-[#d4af6a]/20 hover:border-[#d4af6a]/40 hover:text-[#f5efe6]'
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Source Filter Pills and Meta status */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs font-mono border-t border-[#d4af6a]/10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[#8c8273]">Filtrar por Veículo:</span>
                <button
                  onClick={() => setSelectedSource('todos')}
                  className={`px-2.5 py-1 rounded-[6px] transition-colors cursor-pointer ${
                    selectedSource === 'todos'
                      ? 'bg-[#1c1916] text-[#f0d9a8] border border-[#d4af6a]/30'
                      : 'text-[#8c8273] hover:text-[#c2b9ac]'
                  }`}
                >
                  Todos ({news.length})
                </button>
                {sourcesList.map((src) => {
                  const count = news.filter((n) => n.source === src).length;
                  return (
                    <button
                      key={src}
                      onClick={() => setSelectedSource(src)}
                      className={`px-2.5 py-1 rounded-[6px] transition-colors cursor-pointer ${
                        selectedSource === src
                          ? 'bg-[#1c1916] text-[#f0d9a8] border border-[#d4af6a]/30'
                          : 'text-[#8c8273] hover:text-[#c2b9ac]'
                      }`}
                    >
                      {src} ({count})
                    </button>
                  );
                })}
              </div>

              {cachedAt && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#8c8273]">
                  <Clock className="w-3 h-3 text-[#d4af6a]" />
                  <span>Cache do servidor (15 min): {new Date(cachedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
            </div>

          </div>

          {/* Headlines List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="p-5 rounded-[14px] bg-[#141210] border border-[#d4af6a]/10 animate-pulse space-y-3"
                >
                  <div className="h-4 w-32 bg-[#1c1916] rounded" />
                  <div className="h-5 w-3/4 bg-[#1c1916] rounded" />
                </div>
              ))}
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="p-12 text-center rounded-[16px] bg-[#141210] border border-[#d4af6a]/20 space-y-3">
              <Newspaper className="w-8 h-8 text-[#d4af6a] mx-auto opacity-70" />
              <h3 className="font-serif text-lg font-bold text-[#f5efe6]">
                Nenhuma notícia encontrada
              </h3>
              <p className="text-xs text-[#a39a8c] max-w-md mx-auto">
                Não encontramos manchetes com os filtros selecionados ou para o termo &quot;{searchQuery}&quot;. Experimente selecionar outro tema ou limpar a busca.
              </p>
              <button
                onClick={() => {
                  setSelectedTheme('todos');
                  setSelectedSource('todos');
                  setSearchQuery('');
                }}
                className="mt-2 px-4 py-2 rounded-[8px] bg-[#1c1916] border border-[#d4af6a]/25 text-xs text-[#f0d9a8] hover:bg-[#25221e] cursor-pointer"
              >
                Limpar todos os filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {filteredNews.map((item, idx) => (
                <a
                  key={`${item.id}-${idx}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-6 rounded-[14px] bg-[#141210] border border-[#d4af6a]/15 hover:border-[#d4af6a]/40 hover:bg-[#181614] transition-all duration-200 shadow-md flex flex-col justify-between group cursor-pointer"
                >
                  <div className="space-y-3">
                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                      <span className={`px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getSourceBadgeColor(item.source)}`}>
                        {item.source}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border ${getThemeBadgeColor(item.theme)}`}>
                        {item.themeLabel}
                      </span>
                      <span className="text-[#8c8273] flex items-center gap-1 ml-auto">
                        <Clock className="w-3 h-3 text-[#8c8273]" />
                        <span>{item.dateFormatted}</span>
                      </span>
                    </div>

                    {/* Headline Title */}
                    <h2 className="text-base sm:text-lg font-serif font-bold text-[#f5efe6] group-hover:text-[#f0d9a8] transition-colors leading-snug">
                      {item.title}
                    </h2>
                  </div>

                  {/* External link CTA */}
                  <div className="mt-5 pt-3.5 border-t border-[#d4af6a]/10 flex items-center justify-between text-xs text-[#8c8273]">
                    <span className="text-[11px] font-mono text-[#8c8273]">
                      Ler reportagem completa no veículo
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[#d4af6a] font-medium group-hover:translate-x-0.5 transition-transform">
                      <span>Acessar</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Footer Notice respecting original journalism */}
          <div className="p-6 rounded-[14px] bg-[#141210] border border-[#d4af6a]/20 flex flex-col sm:flex-row items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-[#d4af6a]/10 border border-[#d4af6a]/25 flex items-center justify-center text-[#d4af6a] shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs text-[#c2b9ac] leading-relaxed">
              <h4 className="font-mono font-bold uppercase text-[#f5efe6] text-xs">
                Aviso Editorial e Direitos Autorais
              </h4>
              <p>
                O <strong>{APP_NAME}</strong> agrega estritamente manchetes públicas, metadados de publicação e links diretos para os veículos originários de imprensa através de seus feeds RSS abertos, sem reproduzir o corpo do texto jornalístico. Todos os direitos e créditos intelectuais pertencem com exclusividade aos respectivos veículos (InfoMoney, G1 Economia, Agência Brasil e parceiros).
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
