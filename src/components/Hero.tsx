import React from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { APP_NAME } from '../constants/config';
import { useMarket } from '../context/MarketContext';
import { DataSourceBadge } from './DataSourceBadge';
import { UniversalSearch } from './UniversalSearch';
import { CategoryShortcuts } from './CategoryShortcuts';
import { formatBRL, formatPercent, formatNumberBR } from '../utils/formatters';

export const Hero: React.FC = () => {
  const { marketState } = useMarket();
  const { isDemoMode, lastUpdated, macro, currencies, cryptos } = marketState;

  // Sparkline real: apenas se houver dados reais (sem curva fixa decorativa)
  const renderHeroSparkline = (data?: number[]) => {
    if (!Array.isArray(data) || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 24;
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * (width - 4) + 2;
      const y = height - ((v - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const lastPt = pts[pts.length - 1].split(',');

    return (
      <div className="w-20 h-6 shrink-0 overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <polyline
            fill="none"
            stroke="#d4af6a"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pts.join(' ')}
          />
          <circle cx={lastPt[0]} cy={lastPt[1]} r="2" fill="#d4af6a" />
        </svg>
      </div>
    );
  };

  // Macro Tickers data
  const ibov = macro.ibovespa;
  const usd = currencies.find((c) => c.code === 'USD');
  const btc = cryptos.find((c) => c.symbol === 'BTC');
  const selic = macro.selic;

  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-14 sm:pb-20 border-b border-[#d4af6a]/15 bg-[#0b0a09]">
      {/* 1. Discreet Subtle Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.25]"
        style={{
          backgroundImage: `radial-gradient(rgba(212, 175, 106, 0.2) 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, #000 70%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, #000 70%, transparent 100%)',
        }}
      />

      {/* 2. Ambient Warm Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#d4af6a]/8 blur-[180px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
        {/* Top Badges & Origin Tag */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#141210] border border-[#d4af6a]/25 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-[#d4af6a] shadow-[0_0_8px_#d4af6a]" />
            <span className="text-xs font-semibold text-[#f5efe6] tracking-wide font-sans">
              {APP_NAME}
            </span>
            <span className="text-[#8c8273]">•</span>
            <span className="text-xs text-[#c2b9ac] font-normal">
              Inteligência e Valuation da B3
            </span>
          </div>

          <DataSourceBadge isDemoMode={isDemoMode} lastUpdated={lastUpdated} />
        </div>

        {/* Hero Title & Subtitle: Amplo, Convidativo e Limpo */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl lg:text-[64px] font-serif font-bold text-[#f5efe6] tracking-tight leading-[1.08]"
          >
            A inteligência da bolsa <br />
            em{' '}
            <span className="bg-gradient-to-r from-[#d4af6a] via-[#f0d9a8] to-[#dfbc77] bg-clip-text text-transparent">
              uma visão ampla
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg text-[#c2b9ac] max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Cotações da B3 atualizadas a cada 60 segundos, múltiplos contábeis, fórmulas consagradas de Benjamin Graham e Décio Bazin, radar completo de FIIs e simulações patrimoniais dinâmicas.
          </motion.p>
        </div>

        {/* Universal Search Bar (Centro da Experiência) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <UniversalSearch />
        </motion.div>

        {/* Category Shortcuts Tiles (Atalhos Visuais Estilo Investidor10) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <CategoryShortcuts />
        </motion.div>

        {/* Ticker Macro Strip: 4 Ativos em Linha Fluida (IBOV, DÓLAR, SELIC, BITCOIN) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* 1. IBOVESPA */}
          <div className="p-4 rounded-[14px] bg-[#141210]/95 border border-[#d4af6a]/15 hover:border-[#d4af6a]/35 transition-all shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-[#f5efe6]">IBOVESPA</span>
              {ibov.changePercent !== null && (
                <span className={`inline-flex items-center gap-0.5 font-mono tabular-nums text-xs font-bold ${
                  (ibov.changePercent ?? 0) >= 0 ? 'text-[#3ddc97]' : 'text-[#ff5c6c]'
                }`}>
                  {(ibov.changePercent ?? 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {formatPercent(ibov.changePercent)}
                </span>
              )}
            </div>
            <div className="flex items-end justify-between gap-2">
              <div>
                <div className="font-mono tabular-nums font-bold text-base sm:text-lg text-[#f5efe6]">
                  {ibov.points !== null ? `${formatNumberBR(ibov.points)} pts` : (ibov.statusText || 'Indisponível')}
                </div>
                <span className="text-[10px] text-[#8c8273] font-mono">Bolsa Brasileira B3</span>
              </div>
              {renderHeroSparkline(ibov.sparkline)}
            </div>
          </div>

          {/* 2. DÓLAR PTAX */}
          <div className="p-4 rounded-[14px] bg-[#141210]/95 border border-[#d4af6a]/15 hover:border-[#d4af6a]/35 transition-all shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-[#f5efe6]">DÓLAR PTAX</span>
              {usd?.pctChange !== null && usd?.pctChange !== undefined && (
                <span className={`inline-flex items-center gap-0.5 font-mono tabular-nums text-xs font-bold ${
                  usd.pctChange >= 0 ? 'text-[#3ddc97]' : 'text-[#ff5c6c]'
                }`}>
                  {usd.pctChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {formatPercent(usd.pctChange)}
                </span>
              )}
            </div>
            <div className="flex items-end justify-between gap-2">
              <div>
                <div className="font-mono tabular-nums font-bold text-base sm:text-lg text-[#f5efe6]">
                  {usd?.bid !== null && usd?.bid !== undefined ? formatBRL(usd.bid) : (usd?.statusText || 'Indisponível')}
                </div>
                <span className="text-[10px] text-[#8c8273] font-mono">Banco Central</span>
              </div>
              {renderHeroSparkline(usd?.sparkline)}
            </div>
          </div>

          {/* 3. TAXA SELIC */}
          <div className="p-4 rounded-[14px] bg-[#141210]/95 border border-[#d4af6a]/15 hover:border-[#d4af6a]/35 transition-all shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-[#f5efe6]">TAXA SELIC</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1c1916] text-[#d4af6a] border border-[#d4af6a]/15">
                COPOM
              </span>
            </div>
            <div className="flex items-end justify-between gap-2">
              <div>
                <div className="font-mono tabular-nums font-bold text-base sm:text-lg text-[#f0d9a8]">
                  {selic.rateAnnual !== null ? `${selic.rateAnnual.toFixed(2)}% a.a.` : (selic.statusText || 'Indisponível')}
                </div>
                <span className="text-[10px] text-[#8c8273] font-mono">Meta Oficial BCB</span>
              </div>
              <div className="text-[10px] font-mono text-[#c2b9ac]">
                CDI {macro.cdi.rateAnnual ? `${macro.cdi.rateAnnual.toFixed(2)}%` : '—'}
              </div>
            </div>
          </div>

          {/* 4. BITCOIN */}
          <div className="p-4 rounded-[14px] bg-[#141210]/95 border border-[#d4af6a]/15 hover:border-[#d4af6a]/35 transition-all shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-[#f5efe6]">BITCOIN</span>
              {btc?.change24h !== null && btc?.change24h !== undefined && (
                <span className={`inline-flex items-center gap-0.5 font-mono tabular-nums text-xs font-bold ${
                  btc.change24h >= 0 ? 'text-[#3ddc97]' : 'text-[#ff5c6c]'
                }`}>
                  {btc.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {formatPercent(btc.change24h)}
                </span>
              )}
            </div>
            <div className="flex items-end justify-between gap-2">
              <div>
                <div className="font-mono tabular-nums font-bold text-base sm:text-lg text-[#f5efe6]">
                  {btc?.priceBrl !== null && btc?.priceBrl !== undefined ? formatBRL(btc.priceBrl, 0) : (btc?.statusText || 'Indisponível')}
                </div>
                <span className="text-[10px] text-[#8c8273] font-mono">CoinGecko BRL</span>
              </div>
              {renderHeroSparkline(btc?.sparkline)}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
