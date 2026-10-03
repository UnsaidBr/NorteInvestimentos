import { StockItem, CryptoItem, CurrencyItem, MacroIndicators, StockHistoryPoint, TimeframeFilter } from '../types/market';
import { INITIAL_STOCKS, INITIAL_CRYPTOS, INITIAL_CURRENCIES, INITIAL_MACRO } from '../data/mockMarketData';

export interface MarketDataState {
  stocks: StockItem[];
  cryptos: CryptoItem[];
  currencies: CurrencyItem[];
  macro: MacroIndicators;
  lastUpdated: Date;
  isDemoMode: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface StockHistoryResponse {
  symbol: string;
  available: boolean;
  history: StockHistoryPoint[];
  updatedAt?: string;
  range?: string;
  interval?: string;
  isRealData?: boolean;
}

export async function fetchMarketData(): Promise<MarketDataState> {
  try {
    const res = await fetch('/api/market/all', {
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Servidor respondeu com status ${res.status}`);
    }

    const data = await res.json();
    let hasLiveAny = false;

    // Process Currencies
    let currencies = [...INITIAL_CURRENCIES];
    if (data.currencies?.usd) {
      hasLiveAny = true;
      currencies = currencies.map((c) => {
        if (c.code === 'USD' && data.currencies.usd) {
          return {
            ...c,
            bid: data.currencies.usd.bid,
            pctChange: data.currencies.usd.pctChange,
            high: data.currencies.usd.high,
            low: data.currencies.usd.low,
            updatedAt: 'Agora',
          };
        }
        if (c.code === 'EUR' && data.currencies.eur) {
          return {
            ...c,
            bid: data.currencies.eur.bid,
            pctChange: data.currencies.eur.pctChange,
            high: data.currencies.eur.high,
            low: data.currencies.eur.low,
            updatedAt: 'Agora',
          };
        }
        return c;
      });
    }

    // Process Cryptos
    let cryptos = [...INITIAL_CRYPTOS];
    if (data.crypto?.btc) {
      hasLiveAny = true;
      cryptos = cryptos.map((cr) => {
        if (cr.symbol === 'BTC' && data.crypto.btc) {
          return {
            ...cr,
            priceBrl: data.crypto.btc.priceBrl,
            change24h: data.crypto.btc.change24h,
          };
        }
        if (cr.symbol === 'ETH' && data.crypto.eth) {
          return {
            ...cr,
            priceBrl: data.crypto.eth.priceBrl,
            change24h: data.crypto.eth.change24h,
          };
        }
        if (cr.symbol === 'SOL' && data.crypto.sol) {
          return {
            ...cr,
            priceBrl: data.crypto.sol.priceBrl,
            change24h: data.crypto.sol.change24h,
          };
        }
        return cr;
      });
    }

    // Process Macro / Selic
    let macro = { ...INITIAL_MACRO };
    if (data.selic?.rate) {
      hasLiveAny = true;
      macro.selic = {
        rateAnnual: data.selic.rate,
        date: data.selic.date,
        source: data.selic.source || 'Banco Central do Brasil',
      };
      // Keep CDI synced ~0.10 below Selic
      macro.cdi = {
        rateAnnual: Math.max(0, data.selic.rate - 0.10),
      };
    }

    // Process Stocks & FIIs
    let stocks = [...INITIAL_STOCKS];
    if (Array.isArray(data.stocks) && data.stocks.length > 0) {
      hasLiveAny = true;
      const parsedStocks: StockItem[] = data.stocks
        .filter((item: any) => (item.ticker || item.symbol) && (item.ticker || item.symbol) !== '^BVSP')
        .map((item: any) => {
          const ticker = item.ticker || item.symbol;
          const isFii = item.category === 'fii' || ticker.endsWith('11');
          return {
            ticker,
            name: item.name || item.longName || item.shortName || ticker,
            price: item.price ?? item.regularMarketPrice ?? 0,
            change: item.change ?? item.regularMarketChange ?? 0,
            changePercent: item.changePercent ?? item.regularMarketChangePercent ?? 0,
            volume: item.volume ?? ((item.regularMarketVolume || 0) * (item.price || 30)),
            openPrice: item.openPrice ?? item.regularMarketOpen,
            high24h: item.high24h ?? item.regularMarketDayHigh,
            low24h: item.low24h ?? item.regularMarketDayLow,
            marketCap: item.marketCap ?? item.market_cap ?? 0,
            sector: item.sector ?? (isFii ? 'Fundo Imobiliário (FII)' : 'B3'),
            logoUrl: item.logoUrl ?? item.logo,
            category: isFii ? 'fii' : 'acao',
            sparkline: Array.isArray(item.sparkline) && item.sparkline.length >= 2 ? item.sparkline : undefined,
            updatedAt: item.updatedAt || data.timestamp,
            isRealData: true,
          };
        });

      if (parsedStocks.length >= 5) {
        stocks = parsedStocks;
      }
    }

    const serverTime = data.timestamp ? new Date(data.timestamp) : new Date();

    return {
      stocks,
      cryptos,
      currencies,
      macro,
      lastUpdated: serverTime,
      isDemoMode: !hasLiveAny,
      isLoading: false,
      error: null,
    };
  } catch (err: any) {
    console.warn('Utilizando dados de demonstração devido a:', err.message);
    return {
      stocks: INITIAL_STOCKS,
      cryptos: INITIAL_CRYPTOS,
      currencies: INITIAL_CURRENCIES,
      macro: INITIAL_MACRO,
      lastUpdated: new Date(),
      isDemoMode: true,
      isLoading: false,
      error: null,
    };
  }
}

/**
 * Consulta histórico REAL de preços na API brapi.dev via backend com range/interval.
 * NUNCA gera dados fictícios. Se indisponível, available: false.
 */
export async function fetchStockHistory(
  ticker: string,
  timeframe: TimeframeFilter
): Promise<StockHistoryResponse> {
  const timeframeMap: Record<TimeframeFilter, { range: string; interval: string }> = {
    '1D': { range: '1d', interval: '5m' },
    '1S': { range: '5d', interval: '15m' },
    '1M': { range: '1mo', interval: '1d' },
    '6M': { range: '6mo', interval: '1d' },
    '1A': { range: '1y', interval: '1wk' },
  };

  const { range, interval } = timeframeMap[timeframe] || { range: '1mo', interval: '1d' };

  try {
    const res = await fetch(`/api/market/history/${encodeURIComponent(ticker)}?range=${range}&interval=${interval}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      return { symbol: ticker, available: false, history: [] };
    }
    const data = await res.json();
    return {
      symbol: ticker,
      available: data.available === true && Array.isArray(data.history) && data.history.length >= 2,
      history: Array.isArray(data.history) ? data.history : [],
      updatedAt: data.updatedAt,
      range,
      interval,
      isRealData: data.isRealData ?? false,
    };
  } catch (err) {
    console.warn(`Erro ao buscar histórico para ${ticker}:`, err);
    return { symbol: ticker, available: false, history: [] };
  }
}
