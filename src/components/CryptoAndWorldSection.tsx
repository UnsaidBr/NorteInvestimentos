import React, { useState } from 'react';
import { CryptoItem, CurrencyItem } from '../types/market';
import { formatBRL, formatPercent } from '../utils/formatters';
import { TrendingUp, TrendingDown, Coins, Globe, ArrowRightLeft } from 'lucide-react';
import { DataSourceBadge } from './DataSourceBadge';

interface CryptoAndWorldSectionProps {
  cryptos: CryptoItem[];
  currencies: CurrencyItem[];
  isDemoMode?: boolean;
  lastUpdated?: Date;
}

export const CryptoAndWorldSection: React.FC<CryptoAndWorldSectionProps> = ({
  cryptos,
  currencies,
  isDemoMode = false,
  lastUpdated = new Date(),
}) => {
  const [convertAmount, setConvertAmount] = useState<number>(100);
  const [selectedAsset, setSelectedAsset] = useState<string>('USD');

  const getRate = (): number | null => {
    if (selectedAsset === 'USD') return currencies.find((c) => c.code === 'USD')?.bid ?? null;
    if (selectedAsset === 'EUR') return currencies.find((c) => c.code === 'EUR')?.bid ?? null;
    if (selectedAsset === 'BTC') return cryptos.find((c) => c.symbol === 'BTC')?.priceBrl ?? null;
    if (selectedAsset === 'ETH') return cryptos.find((c) => c.symbol === 'ETH')?.priceBrl ?? null;
    if (selectedAsset === 'SOL') return cryptos.find((c) => c.symbol === 'SOL')?.priceBrl ?? null;
    return 1;
  };

  const rate = getRate();
  const convertedBrl = rate !== null ? convertAmount * rate : null;

  return (
    <section id="cripto-mundo" className="py-16 sm:py-24 bg-[#0b0a09]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-10 sm:mb-14">
          <div className="flex flex-wrap items-center gap-3 mb-2.5">
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#d4af6a] uppercase tracking-wider">
              <Globe className="w-4 h-4 text-[#d4af6a]" />
              Mercado Global
            </div>
            <DataSourceBadge isDemoMode={isDemoMode} lastUpdated={lastUpdated} />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#f5efe6] tracking-tight">
            Criptoativos & Câmbio Internacional
          </h2>
          <p className="text-sm text-[#c2b9ac] mt-2 max-w-xl font-normal leading-relaxed">
            Precificação de moedas digitais e pares soberanos mundiais com conversão direta para Reais (BRL).
          </p>
        </div>

        {/* Grid 1: Cryptocurrencies */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-5 text-xs font-mono font-medium uppercase tracking-wider text-[#c2b9ac]">
            <Coins className="w-4 h-4 text-[#d4af6a]" />
            <span>Principais Criptoativos (Cotação em Reais)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cryptos.map((crypto) => {
              const isUp = (crypto.change24h ?? 0) >= 0;
              return (
                <div
                  key={crypto.id}
                  className="p-5 rounded-[14px] bg-[#141210] border border-[#d4af6a]/15 hover:border-[#d4af6a]/35 transition-all duration-200 shadow-md group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[8px] bg-[#1c1916] border border-[#d4af6a]/20 flex items-center justify-center font-bold text-[#d4af6a] text-xs font-mono">
                        {crypto.symbol}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#f5efe6] group-hover:text-[#f0d9a8] transition-colors">
                          {crypto.name}
                        </h4>
                        <span className="text-[11px] text-[#8c8273] font-mono">
                          {crypto.symbol}/BRL
                        </span>
                      </div>
                    </div>

                    {crypto.change24h !== null && crypto.change24h !== undefined && (
                      <span
                        className={`inline-flex items-center gap-0.5 font-mono tabular-nums text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isUp
                            ? 'text-[#3ddc97] bg-[#3ddc97]/10 border border-[#3ddc97]/20'
                            : 'text-[#ff5c6c] bg-[#ff5c6c]/10 border border-[#ff5c6c]/20'
                        }`}
                      >
                        {isUp ? <TrendingUp className="w-3 h-3 text-[#3ddc97]" /> : <TrendingDown className="w-3 h-3 text-[#ff5c6c]" />}
                        {formatPercent(crypto.change24h, false)}
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#d4af6a]/10">
                    <span className="text-[10px] text-[#8c8273] uppercase font-mono tracking-wider block">
                      Preço em Reais
                    </span>
                    <span className="font-mono tabular-nums font-bold text-xl text-[#f5efe6] mt-0.5 block">
                      {crypto.priceBrl !== null && crypto.priceBrl !== undefined
                        ? formatBRL(crypto.priceBrl, crypto.priceBrl < 1000 ? 2 : 0)
                        : (crypto.statusText || 'Indisponível no momento')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid 2: Global Currencies & Gold */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-5 text-xs font-mono font-medium uppercase tracking-wider text-[#c2b9ac]">
            <Globe className="w-4 h-4 text-[#d4af6a]" />
            <span>Pares Cambiais e Commodities Monetárias</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currencies.map((curr) => {
              const isUp = (curr.pctChange ?? 0) >= 0;
              return (
                <div
                  key={curr.code}
                  className="p-5 rounded-[14px] bg-[#141210] border border-[#d4af6a]/15 hover:border-[#d4af6a]/35 transition-all duration-200 shadow-md group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono tabular-nums font-bold text-base text-[#f5efe6] group-hover:text-[#f0d9a8] transition-colors">
                          {curr.code} / BRL
                        </span>
                      </div>
                      <span className="text-xs text-[#c2b9ac] block mt-0.5">
                        {curr.name}
                      </span>
                    </div>

                    {curr.pctChange !== null && curr.pctChange !== undefined && (
                      <span
                        className={`inline-flex items-center gap-0.5 font-mono tabular-nums text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isUp
                            ? 'text-[#3ddc97] bg-[#3ddc97]/10 border border-[#3ddc97]/20'
                            : 'text-[#ff5c6c] bg-[#ff5c6c]/10 border border-[#ff5c6c]/20'
                        }`}
                      >
                        {isUp ? <TrendingUp className="w-3 h-3 text-[#3ddc97]" /> : <TrendingDown className="w-3 h-3 text-[#ff5c6c]" />}
                        {formatPercent(curr.pctChange, false)}
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#d4af6a]/10 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-[#8c8273] uppercase font-mono tracking-wider block">
                        Compra (Bid)
                      </span>
                      <span className="font-mono tabular-nums font-bold text-xl text-[#f5efe6] mt-0.5 block">
                        {curr.bid !== null && curr.bid !== undefined
                          ? formatBRL(curr.bid, 4)
                          : (curr.statusText || 'Indisponível no momento')}
                      </span>
                    </div>

                    <div className="text-right text-[11px] font-mono text-[#8c8273]">
                      <span>{curr.high ? `Máx: ${formatBRL(curr.high, 2)}` : (curr.statusText || '—')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Converter Card */}
        <div className="p-6 sm:p-8 rounded-[16px] bg-[#141210] border border-[#d4af6a]/20 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="max-w-md">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#d4af6a] uppercase tracking-wider mb-1.5">
                <ArrowRightLeft className="w-4 h-4 text-[#d4af6a]" />
                Calculadora Cambial Instantânea
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6]">
                Converta Ativos para Reais (BRL)
              </h3>
              <p className="text-xs sm:text-sm text-[#c2b9ac] mt-1 font-normal leading-relaxed">
                Utilize as cotações da B3 e dados cambiais atualizados a cada 60 segundos para simular conversões imediatas.
              </p>
            </div>

            <div className="flex-1 max-w-lg bg-[#1c1916] p-4 sm:p-5 rounded-[12px] border border-[#d4af6a]/15 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-medium text-[#c2b9ac] uppercase mb-1.5">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={convertAmount}
                    onChange={(e) => setConvertAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3.5 py-2.5 bg-[#141210] border border-[#d4af6a]/20 focus:border-[#d4af6a] rounded-[8px] text-base font-mono tabular-nums font-bold text-[#f5efe6] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-medium text-[#c2b9ac] uppercase mb-1.5">
                    Ativo de Origem
                  </label>
                  <select
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#141210] border border-[#d4af6a]/20 focus:border-[#d4af6a] rounded-[8px] text-xs font-mono font-bold text-[#f0d9a8] focus:outline-none cursor-pointer"
                  >
                    <option value="USD">Dólar PTAX (USD)</option>
                    <option value="EUR">Euro PTAX (EUR)</option>
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="SOL">Solana (SOL)</option>
                  </select>
                </div>
              </div>

              {/* Conversion Result Display */}
              <div className="p-4 rounded-[10px] bg-[#141210] border border-[#d4af6a]/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8c8273] block">
                    Valor Convertido em Reais
                  </span>
                  <span className="font-mono tabular-nums text-2xl font-bold text-[#f0d9a8]">
                    {convertedBrl !== null ? formatBRL(convertedBrl, 2) : 'Indisponível no momento'}
                  </span>
                </div>
                <div className="text-right text-[11px] font-mono text-[#c2b9ac]">
                  <span>1 {selectedAsset} = {rate !== null ? formatBRL(rate, 2) : 'Indisponível'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
