import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, SlidersHorizontal, Building2, Calculator, BookOpen, Layers } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { AssetLogo } from './AssetLogo';
import { formatBRL, formatPercent, getFriendlyCompanyName } from '../utils/formatters';
import { FII_DATASET } from '../data/fiiData';
import { FiiItem } from '../types/fundamental';
import { StockItem, CryptoItem } from '../types/market';

interface UniversalSearchProps {
  placeholder?: string;
  className?: string;
}

export const UniversalSearch: React.FC<UniversalSearchProps> = ({
  placeholder = 'Busque por ação, FII, código ou ferramenta (ex: PETR4, HGLG11, Bazin)...',
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { marketState, setSelectedStockForChart } = useMarket();
  const { stocks, cryptos } = marketState;

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tecla Escape fecha
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Filtragem multi-entidades
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Sugestões populares por padrão
      const popularStocks: StockItem[] = stocks.filter((s: StockItem) =>
        ['PETR4', 'VALE3', 'ITUB4', 'BBAS3', 'WEGE3'].includes(s.ticker)
      );
      const popularFiis: FiiItem[] = FII_DATASET.slice(0, 3);
      return {
        stocks: popularStocks,
        fiis: popularFiis,
        cryptos: cryptos.slice(0, 2),
        tools: [
          { name: 'Rastreador de Valuation (Graham e Bazin)', path: '/radar', icon: SlidersHorizontal },
          { name: 'Painel Dedicado de FIIs', path: '/fiis', icon: Building2 },
          { name: 'Simulador Dinâmico de Juros e IR', path: '/simulador', icon: Calculator },
        ],
        isDefaultSuggestions: true,
      };
    }

    // Filtrar Ações B3
    const matchedStocks: StockItem[] = stocks.filter((s: StockItem) =>
      s.ticker.toLowerCase().includes(q) ||
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.sector && s.sector.toLowerCase().includes(q))
    ).slice(0, 4);

    // Filtrar FIIs
    const matchedFiis: FiiItem[] = FII_DATASET.filter((f: FiiItem) =>
      f.ticker.toLowerCase().includes(q) ||
      f.name.toLowerCase().includes(q) ||
      f.segment.toLowerCase().includes(q) ||
      f.administrador.toLowerCase().includes(q)
    ).slice(0, 3);

    // Filtrar Criptos
    const matchedCryptos: CryptoItem[] = cryptos.filter((c: CryptoItem) =>
      c.symbol.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q)
    ).slice(0, 2);

    // Filtrar Ferramentas & Páginas
    const allTools = [
      { name: 'Rastreador de Ações e FIIs (Screener)', path: '/radar', keywords: 'radar screener graham bazin greenblatt filtro valuation', icon: SlidersHorizontal },
      { name: 'Painel de Fundos Imobiliários', path: '/fiis', keywords: 'fiis imoveis tijolo papel vacancia dividendo shopping galpao', icon: Building2 },
      { name: 'Simulador Patrimonial com IR', path: '/simulador', keywords: 'simulador juros compostos cdi poupanca cdb aporte', icon: Calculator },
      { name: 'Comparador de Ativos', path: '/comparar', keywords: 'comparar ativos acoes cotacao rentabilidade', icon: Layers },
      { name: 'Glossário Financeiro A-Z', path: '/glossario', keywords: 'glossario termos definicao o que e p/l roe vpa lpa', icon: BookOpen },
    ];
    const matchedTools = allTools.filter((t) =>
      t.name.toLowerCase().includes(q) || t.keywords.toLowerCase().includes(q)
    ).slice(0, 3);

    return {
      stocks: matchedStocks,
      fiis: matchedFiis,
      cryptos: matchedCryptos,
      tools: matchedTools,
      isDefaultSuggestions: false,
    };
  }, [query, stocks, cryptos]);

  const hasAnyResults =
    searchResults.stocks.length > 0 ||
    searchResults.fiis.length > 0 ||
    searchResults.cryptos.length > 0 ||
    searchResults.tools.length > 0;

  return (
    <div ref={containerRef} className={`relative w-full max-w-2xl mx-auto ${className}`}>
      {/* Search Input Container */}
      <div
        className={`relative flex items-center w-full px-4 py-3.5 sm:py-4 rounded-[14px] bg-[#141210]/95 border transition-all duration-200 shadow-[0_12px_40px_rgba(0,0,0,0.6)] ${
          isOpen
            ? 'border-[#d4af6a] ring-2 ring-[#d4af6a]/20 bg-[#1c1916]'
            : 'border-[#d4af6a]/30 hover:border-[#d4af6a]/50'
        }`}
      >
        <Search className="w-5 h-5 text-[#d4af6a] shrink-0 mr-3" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent text-[#f5efe6] placeholder:text-[#8c8273] text-sm sm:text-base focus:outline-none font-sans"
        />

        {query ? (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-1 rounded-full text-[#8c8273] hover:text-[#f5efe6] hover:bg-[#24201c] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <span className="hidden sm:inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c1916] text-[#8c8273] border border-[#d4af6a]/15">
            ESC
          </span>
        )}
      </div>

      {/* Dropdown Modal de Resultados */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-[16px] bg-[#141210] border border-[#d4af6a]/25 shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl overflow-hidden divide-y divide-[#d4af6a]/10 max-h-[480px] overflow-y-auto">
          
          {/* Header discreto do Dropdown */}
          <div className="px-4 py-2.5 bg-[#1c1916]/80 flex items-center justify-between text-[11px] font-mono text-[#8c8273]">
            <span>{searchResults.isDefaultSuggestions ? '★ ATIVOS E FERRAMENTAS MAIS ACESSADOS' : `RESULTADOS PARA "${query}"`}</span>
            <span className="text-[#d4af6a]">B3 · BCB · Cripto</span>
          </div>

          {!hasAnyResults && (
            <div className="p-8 text-center text-[#c2b9ac] text-xs">
              Nenhum ativo ou ferramenta encontrado para "{query}". Tente buscar por PETR4, HGLG11 ou Bazin.
            </div>
          )}

          {/* 1. Ferramentas Rápidas */}
          {searchResults.tools.length > 0 && (
            <div className="p-2 space-y-1">
              <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#d4af6a]">
                Ferramentas da Plataforma
              </div>
              {searchResults.tools.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <button
                    key={tool.path}
                    onClick={() => {
                      setIsOpen(false);
                      navigate(tool.path);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-[10px] hover:bg-[#1c1916] transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[8px] bg-[#24201c] border border-[#d4af6a]/20 flex items-center justify-center text-[#d4af6a] group-hover:scale-105 transition-transform">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-[#f5efe6] group-hover:text-[#f0d9a8]">
                        {tool.name}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8c8273] group-hover:text-[#d4af6a] group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. Ações B3 */}
          {searchResults.stocks.length > 0 && (
            <div className="p-2 space-y-1">
              <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#d4af6a]">
                Ações da B3
              </div>
              {searchResults.stocks.map((stock: StockItem) => {
                const isUp = (stock.changePercent ?? 0) >= 0;
                return (
                  <button
                    key={stock.ticker}
                    onClick={() => {
                      setIsOpen(false);
                      setSelectedStockForChart(stock);
                      navigate('/mercado');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-[10px] hover:bg-[#1c1916] transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <AssetLogo ticker={stock.ticker} name={stock.name} size="sm" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs sm:text-sm text-[#f5efe6] group-hover:text-[#f0d9a8]">
                            {stock.ticker}
                          </span>
                          <span className="text-[10px] font-mono text-[#8c8273]">B3</span>
                        </div>
                        <div className="text-[11px] text-[#c2b9ac] truncate">
                          {getFriendlyCompanyName(stock.name, stock.ticker)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono tabular-nums text-xs sm:text-sm font-bold text-[#f5efe6]">
                        {formatBRL(stock.price)}
                      </div>
                      <span className={`inline-flex items-center gap-0.5 font-mono tabular-nums text-[10px] font-bold ${
                        isUp ? 'text-[#3ddc97]' : 'text-[#ff5c6c]'
                      }`}>
                        {isUp ? '▲' : '▼'} {formatPercent(stock.changePercent, false)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 3. Fundos Imobiliários */}
          {searchResults.fiis.length > 0 && (
            <div className="p-2 space-y-1">
              <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#d4af6a]">
                Fundos Imobiliários (FIIs)
              </div>
              {searchResults.fiis.map((fii: FiiItem) => (
                <button
                  key={fii.ticker}
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/fiis');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-[10px] hover:bg-[#1c1916] transition-colors text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <AssetLogo ticker={fii.ticker} name={fii.name} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs sm:text-sm text-[#f5efe6] group-hover:text-[#f0d9a8]">
                          {fii.ticker}
                        </span>
                        <span className="text-[10px] font-mono text-[#8c8273]">{fii.segment}</span>
                      </div>
                      <div className="text-[11px] text-[#c2b9ac] truncate">
                        {fii.name}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono tabular-nums text-xs sm:text-sm font-bold text-[#f5efe6]">
                      {formatBRL(fii.price)}
                    </div>
                    <span className="font-mono tabular-nums text-[10px] text-[#d4af6a] font-bold">
                      DY {fii.dy12m.toFixed(1)}% · P/VP {fii.pvp.toFixed(2)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 4. Criptoativos */}
          {searchResults.cryptos.length > 0 && (
            <div className="p-2 space-y-1">
              <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#d4af6a]">
                Criptomoedas
              </div>
              {searchResults.cryptos.map((crypto: CryptoItem) => (
                <button
                  key={crypto.symbol}
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/cripto');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-[10px] hover:bg-[#1c1916] transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <AssetLogo ticker={crypto.symbol} name={crypto.name} size="sm" />
                    <div>
                      <div className="font-mono font-bold text-xs sm:text-sm text-[#f5efe6] group-hover:text-[#f0d9a8]">
                        {crypto.symbol}
                      </div>
                      <div className="text-[11px] text-[#c2b9ac]">{crypto.name}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono tabular-nums text-xs sm:text-sm font-bold text-[#f5efe6]">
                      {crypto.priceBrl !== null ? formatBRL(crypto.priceBrl, 0) : 'Indisponível'}
                    </div>
                    {crypto.change24h !== null && (
                      <span className={`font-mono tabular-nums text-[10px] font-bold ${
                        crypto.change24h >= 0 ? 'text-[#3ddc97]' : 'text-[#ff5c6c]'
                      }`}>
                        {crypto.change24h >= 0 ? '▲' : '▼'} {formatPercent(crypto.change24h, false)}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Footer com link direto para o Mercado completo */}
          <div className="p-3 bg-[#1c1916] text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/mercado');
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#d4af6a] hover:text-[#f0d9a8] transition-colors"
            >
              <span>Ver todas as ações e cotações na íntegra</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
