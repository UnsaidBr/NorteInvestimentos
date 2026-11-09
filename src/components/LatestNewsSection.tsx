import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, ExternalLink, ArrowRight, Clock, RefreshCw } from 'lucide-react';
import { getMarketNews, NewsItem } from '../services/newsService';

export const LatestNewsSection: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getMarketNews()
      .then(({ items }) => {
        if (isMounted) {
          setNews(items.slice(0, 4));
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

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
    <section className="py-16 sm:py-20 bg-[#0e0c0b] border-t border-[#d4af6a]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af6a]/10 border border-[#d4af6a]/25 text-[#f0d9a8] text-xs font-mono font-semibold uppercase tracking-wider mb-3">
              <Newspaper className="w-3.5 h-3.5 text-[#d4af6a]" />
              <span>Radar Econômico • Feeds RSS Oficiais</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#f5efe6] tracking-tight">
              Últimas <span className="bg-gradient-to-r from-[#d4af6a] via-[#f0d9a8] to-[#dfbc77] bg-clip-text text-transparent">Notícias</span>
            </h2>
            <p className="text-sm text-[#c2b9ac] mt-2 max-w-xl font-normal leading-relaxed">
              Manchetes apuradas pelos principais veículos de economia do Brasil via RSS público, com link direto para a apuração original.
            </p>
          </div>

          <Link
            to="/noticias"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#141210] hover:bg-[#1c1916] border border-[#d4af6a]/25 text-xs sm:text-sm font-semibold text-[#f0d9a8] transition-all shadow-sm shrink-0"
          >
            <span>Ver todas as notícias</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="p-6 rounded-[14px] bg-[#141210] border border-[#d4af6a]/10 animate-pulse space-y-4"
              >
                <div className="h-4 w-28 bg-[#1c1916] rounded" />
                <div className="h-5 w-full bg-[#1c1916] rounded" />
                <div className="h-4 w-3/4 bg-[#1c1916] rounded" />
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="p-8 text-center rounded-[14px] bg-[#141210] border border-[#d4af6a]/15 text-[#a39a8c] text-sm">
            Nenhuma notícia carregada no momento. Os feeds são atualizados periodicamente.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {news.map((item, idx) => (
              <a
                key={`${item.id}-${idx}`}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-[14px] bg-[#141210] border border-[#d4af6a]/15 hover:border-[#d4af6a]/40 hover:bg-[#181614] transition-all duration-200 shadow-md flex flex-col justify-between group cursor-pointer"
              >
                <div className="space-y-3">
                  {/* Meta badges: Source, Theme, Date */}
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

                  {/* Title in Fraunces Serif / High Contrast */}
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#f5efe6] group-hover:text-[#f0d9a8] transition-colors leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                </div>

                {/* Bottom link prompt */}
                <div className="mt-5 pt-3.5 border-t border-[#d4af6a]/10 flex items-center justify-between text-xs text-[#8c8273]">
                  <span className="text-[11px] font-mono text-[#8c8273]">
                    Matéria na íntegra no veículo original
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[#d4af6a] font-medium group-hover:translate-x-0.5 transition-transform">
                    <span>Ler original</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Disclaimer Notice */}
        <div className="mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#8c8273] font-mono border-t border-[#d4af6a]/10">
          <div>
            Agregação automática via RSS público com cache de 15 minutos no servidor.
          </div>
          <Link to="/noticias" className="text-[#f0d9a8] hover:underline">
            Acessar painel completo de notícias por tema →
          </Link>
        </div>

      </div>
    </section>
  );
};
