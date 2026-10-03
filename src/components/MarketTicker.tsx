import React from 'react';
import { MacroIndicators, CurrencyItem, CryptoItem } from '../types/market';
import { formatBRL, formatPercent, formatNumberBR, formatTimeBR } from '../utils/formatters';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

interface MarketTickerProps {
  macro: MacroIndicators;
  currencies: CurrencyItem[];
  cryptos: CryptoItem[];
  isDemoMode?: boolean;
  lastUpdated?: Date;
}

export const MarketTicker: React.FC<MarketTickerProps> = ({
  macro,
  currencies,
  cryptos,
  isDemoMode = false,
  lastUpdated = new Date(),
}) => {
  const usd = currencies.find((c) => c.code === 'USD');
  const eur = currencies.find((c) => c.code === 'EUR');
  const btc = cryptos.find((c) => c.symbol === 'BTC');

  const tickerItems = [
    {
      category: 'B3',
      label: 'IBOVESPA',
      value: `${formatNumberBR(macro.ibovespa.points)} pts`,
      change: macro.ibovespa.changePercent,
      isRate: false,
    },
    {
      category: 'CÂMBIO',
      label: 'DÓLAR COMERCIAL',
      value: usd ? formatBRL(usd.bid) : 'R$ 5,48',
      change: usd ? usd.pctChange : -0.35,
      isRate: false,
    },
    {
      category: 'CÂMBIO',
      label: 'EURO',
      value: eur ? formatBRL(eur.bid) : 'R$ 6,01',
      change: eur ? eur.pctChange : -0.18,
      isRate: false,
    },
    {
      category: 'CRIPTO',
      label: 'BITCOIN',
      value: btc ? formatBRL(btc.priceBrl, 0) : 'R$ 362.450',
      change: btc ? btc.change24h : 2.34,
      isRate: false,
    },
    {
      category: 'JUROS',
      label: 'TAXA SELIC',
      value: `${macro.selic.rateAnnual.toFixed(2)}% a.a.`,
      change: 0,
      isRate: true,
      tag: 'Meta BCB',
    },
    {
      category: 'JUROS',
      label: 'CDI',
      value: `${macro.cdi.rateAnnual.toFixed(2)}% a.a.`,
      change: 0,
      isRate: true,
      tag: 'Benchmark',
    },
    {
      category: 'JUROS',
      label: 'IPCA (12M)',
      value: `${macro.ipca.rate12m.toFixed(2)}% a.a.`,
      change: 0,
      isRate: true,
      tag: 'Inflação',
    },
  ];

  // Duplicate items for infinite seamless scroll
  const duplicatedItems = [...tickerItems, ...tickerItems];

  return (
    <div className="w-full bg-[#141210]/95 border-b border-[#d4af6a]/15 overflow-hidden py-2 backdrop-blur-sm relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-3 sm:gap-4">
        
        {/* Radar B3 Live Badge (Pinned on Left with Origin and Time) */}
        <div className="flex items-center gap-2 font-mono font-bold uppercase tracking-wider text-[11px] shrink-0 pr-3 border-r border-[#d4af6a]/15 z-10 bg-[#141210]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d4af6a] shadow-[0_0_8px_#d4af6a]" />
          <span className="text-[#f0d9a8] tracking-widest">RADAR B3</span>
          
          {isDemoMode ? (
            <span className="hidden sm:inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/35">
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>Dados de demonstração</span>
            </span>
          ) : (
            <span className="hidden sm:inline text-[9px] text-[#8c8273] font-normal lowercase">
              às {formatTimeBR(lastUpdated)} • a cada 60s
            </span>
          )}
        </div>

        {/* Continuous Smooth Loop Marquee with Edge Fades */}
        <div
          className="flex-1 overflow-hidden relative cursor-default"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)',
          }}
          title="Passe o cursor para pausar a rolagem"
        >
          <div className="animate-marquee items-center gap-6 py-0.5 text-xs whitespace-nowrap">
            {duplicatedItems.map((item, idx) => {
              const isPositive = item.change > 0;
              const isNegative = item.change < 0;

              return (
                <div key={idx} className="inline-flex items-center gap-2 group shrink-0">
                  <span className="text-[9px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1c1916] text-[#c2b9ac] border border-[#d4af6a]/15">
                    {item.category}
                  </span>

                  <span className="text-[#c2b9ac] font-normal text-xs">
                    {item.label}:
                  </span>

                  <span className="font-mono tabular-nums font-semibold text-[#f5efe6] text-xs">
                    {item.value}
                  </span>

                  {!item.isRate ? (
                    <span
                      className={`inline-flex items-center gap-0.5 font-mono tabular-nums text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                        isPositive
                          ? 'text-[#3ddc97] bg-[#3ddc97]/10 border border-[#3ddc97]/20'
                          : isNegative
                          ? 'text-[#ff5c6c] bg-[#ff5c6c]/10 border border-[#ff5c6c]/20'
                          : 'text-[#c2b9ac] bg-[#1c1916]'
                      }`}
                    >
                      {isPositive && <TrendingUp className="w-3 h-3 text-[#3ddc97]" />}
                      {isNegative && <TrendingDown className="w-3 h-3 text-[#ff5c6c]" />}
                      {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
                      {formatPercent(item.change, false)}
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#f0d9a8] bg-[#d4af6a]/10 px-2 py-0.5 rounded-full font-mono font-medium border border-[#d4af6a]/20">
                      {item.tag}
                    </span>
                  )}

                  <span className="text-[#d4af6a]/25 select-none font-thin text-xs ml-3">
                    •
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
