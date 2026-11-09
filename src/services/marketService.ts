import {
  StockItem,
  CryptoItem,
  CurrencyItem,
  MacroIndicators,
  StockHistoryPoint,
  TimeframeFilter,
  StockDetailData,
  DividendCalendarItem,
} from '../types/market';
import { INITIAL_STOCKS, INITIAL_CRYPTOS, INITIAL_CURRENCIES, DEMO_MACRO } from '../data/mockMarketData';

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
  const isDemoModeAllowed = import.meta.env.VITE_DEMO_MODE === 'true';

  try {
    const res = await fetch('/api/market/all', {
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Servidor respondeu com status ${res.status}`);
    }

    const data = await res.json();
    const serverDemoMode = data.isDemoMode === true;
    const isDemoActive = isDemoModeAllowed || serverDemoMode;

    // Process Currencies
    let currencies: CurrencyItem[] = [];
    if (data.currencies?.usd || data.currencies?.eur) {
      const list: CurrencyItem[] = [];
      if (data.currencies.usd) {
        list.push({
          code: 'USD',
          name: data.currencies.usd.name || 'Dólar PTAX',
          symbol: 'US$',
          bid: data.currencies.usd.bid,
          pctChange: data.currencies.usd.pctChange,
          high: data.currencies.usd.high,
          low: data.currencies.usd.low,
          updatedAt: data.currencies.usd.updatedAt || 'Bacen PTAX',
          statusText: data.currencies.usd.statusText || (data.currencies.usd.bid ? 'Dado Real' : 'Indisponível no momento'),
          isRealData: data.currencies.usd.isRealData ?? (data.currencies.usd.bid !== null),
          sparkline: data.currencies.usd.sparkline,
        });
      }
      if (data.currencies.eur) {
        list.push({
          code: 'EUR',
          name: data.currencies.eur.name || 'Euro PTAX',
          symbol: '€',
          bid: data.currencies.eur.bid,
          pctChange: data.currencies.eur.pctChange,
          high: data.currencies.eur.high,
          low: data.currencies.eur.low,
          updatedAt: data.currencies.eur.updatedAt || 'Bacen PTAX',
          statusText: data.currencies.eur.statusText || (data.currencies.eur.bid ? 'Dado Real' : 'Indisponível no momento'),
          isRealData: data.currencies.eur.isRealData ?? (data.currencies.eur.bid !== null),
          sparkline: data.currencies.eur.sparkline,
        });
      }
      currencies = list;
    } else {
      currencies = isDemoActive ? [...INITIAL_CURRENCIES] : [
        { code: 'USD', name: 'Dólar PTAX', symbol: 'US$', bid: null, pctChange: null, statusText: 'Indisponível no momento', isRealData: false },
        { code: 'EUR', name: 'Euro PTAX', symbol: '€', bid: null, pctChange: null, statusText: 'Indisponível no momento', isRealData: false },
      ];
    }

    // Process Cryptos
    let cryptos: CryptoItem[] = [];
    if (data.crypto?.btc || data.crypto?.eth || data.crypto?.sol) {
      const cList: CryptoItem[] = [];
      if (data.crypto.btc) {
        cList.push({
          id: 'bitcoin',
          name: 'Bitcoin',
          symbol: 'BTC',
          priceBrl: data.crypto.btc.priceBrl,
          change24h: data.crypto.btc.change24h,
          statusText: data.crypto.btc.statusText || (data.crypto.btc.priceBrl ? 'Dado Real' : 'Indisponível no momento'),
          isRealData: data.crypto.btc.isRealData ?? (data.crypto.btc.priceBrl !== null),
          sparkline: data.crypto.btc.sparkline,
        });
      }
      if (data.crypto.eth) {
        cList.push({
          id: 'ethereum',
          name: 'Ethereum',
          symbol: 'ETH',
          priceBrl: data.crypto.eth.priceBrl,
          change24h: data.crypto.eth.change24h,
          statusText: data.crypto.eth.statusText || (data.crypto.eth.priceBrl ? 'Dado Real' : 'Indisponível no momento'),
          isRealData: data.crypto.eth.isRealData ?? (data.crypto.eth.priceBrl !== null),
          sparkline: data.crypto.eth.sparkline,
        });
      }
      if (data.crypto.sol) {
        cList.push({
          id: 'solana',
          name: 'Solana',
          symbol: 'SOL',
          priceBrl: data.crypto.sol.priceBrl,
          change24h: data.crypto.sol.change24h,
          statusText: data.crypto.sol.statusText || (data.crypto.sol.priceBrl ? 'Dado Real' : 'Indisponível no momento'),
          isRealData: data.crypto.sol.isRealData ?? (data.crypto.sol.priceBrl !== null),
          sparkline: data.crypto.sol.sparkline,
        });
      }
      cryptos = cList;
    } else {
      cryptos = isDemoActive ? [...INITIAL_CRYPTOS] : [
        { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', priceBrl: null, change24h: null, statusText: 'Indisponível no momento', isRealData: false },
        { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', priceBrl: null, change24h: null, statusText: 'Indisponível no momento', isRealData: false },
        { id: 'solana', name: 'Solana', symbol: 'SOL', priceBrl: null, change24h: null, statusText: 'Indisponível no momento', isRealData: false },
      ];
    }

    // Process Macro / Selic / CDI / IPCA / Ibovespa
    let macro: MacroIndicators = {
      selic: {
        rateAnnual: data.macro?.selic?.rateAnnual ?? data.selic?.rate ?? null,
        date: data.macro?.selic?.date ?? data.selic?.date ?? '—',
        source: data.macro?.selic?.source ?? data.selic?.source ?? 'Banco Central do Brasil',
        warning: data.macro?.selic?.warning,
        statusText: data.macro?.selic?.statusText ?? (data.macro?.selic?.rateAnnual ? 'Dado Real' : 'Indisponível no momento'),
      },
      cdi: {
        rateAnnual: data.macro?.cdi?.rateAnnual ?? (data.selic?.rate ? Math.max(0, data.selic.rate - 0.10) : null),
        isEstimated: data.macro?.cdi?.isEstimated ?? true,
        label: data.macro?.cdi?.label ?? (data.macro?.cdi?.isEstimated ? 'CDI estimado' : 'CDI (Bacen)'),
        statusText: data.macro?.cdi?.statusText ?? (data.macro?.cdi?.rateAnnual ? (data.macro?.cdi?.isEstimated ? 'CDI estimado' : 'Dado Real') : 'Indisponível no momento'),
      },
      ipca: {
        rate12m: data.macro?.ipca?.rate12m ?? null,
        date: data.macro?.ipca?.date ?? '—',
        statusText: data.macro?.ipca?.statusText ?? (data.macro?.ipca?.rate12m ? 'Dado Real' : 'Indisponível no momento'),
      },
      ibovespa: {
        points: data.macro?.ibovespa?.points ?? null,
        changePercent: data.macro?.ibovespa?.changePercent ?? null,
        statusText: data.macro?.ibovespa?.statusText ?? 'Indisponível no momento',
        sparkline: data.macro?.ibovespa?.sparkline,
      },
    };

    // Process Stocks & FIIs
    let stocks: StockItem[] = [];
    if (Array.isArray(data.stocks) && data.stocks.length > 0) {
      stocks = data.stocks
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
            isRealData: item.isRealData ?? true,
          };
        });
    } else if (isDemoActive) {
      stocks = [...INITIAL_STOCKS];
    } else {
      stocks = [];
    }

    const serverTime = data.timestamp ? new Date(data.timestamp) : new Date();

    return {
      stocks,
      cryptos,
      currencies,
      macro,
      lastUpdated: serverTime,
      isDemoMode: isDemoActive && (stocks === INITIAL_STOCKS || serverDemoMode),
      isLoading: false,
      error: null,
    };
  } catch (err: any) {
    console.warn('Erro ao carregar dados do mercado:', err.message);
    if (isDemoModeAllowed) {
      return {
        stocks: INITIAL_STOCKS,
        cryptos: INITIAL_CRYPTOS,
        currencies: INITIAL_CURRENCIES,
        macro: DEMO_MACRO,
        lastUpdated: new Date(),
        isDemoMode: true,
        isLoading: false,
        error: null,
      };
    }
    return {
      stocks: [],
      cryptos: [],
      currencies: [],
      macro: {
        selic: { rateAnnual: null, date: '—', source: 'BCB', statusText: 'Indisponível no momento' },
        cdi: { rateAnnual: null, isEstimated: false, label: 'CDI', statusText: 'Indisponível no momento' },
        ipca: { rate12m: null, date: '—', statusText: 'Indisponível no momento' },
        ibovespa: { points: null, changePercent: null, statusText: 'Indisponível no momento' },
      },
      lastUpdated: new Date(),
      isDemoMode: false,
      isLoading: false,
      error: 'Serviço de cotações indisponível no momento',
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
    '5A': { range: '5y', interval: '1wk' },
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

/**
 * Consulta dados fundamentalistas completos, histórico de proventos e métricas
 * de um ativo específico da B3 na API. NUNCA inventa dados.
 */
export async function fetchStockDetail(ticker: string): Promise<StockDetailData | null> {
  try {
    const res = await fetch(`/api/market/stock/${encodeURIComponent(ticker)}`, {
      headers: { 'Accept': 'application/json' },
    });
    const isDemoModeAllowed = import.meta.env.VITE_DEMO_MODE === 'true';
    if (!res.ok) {
      if (isDemoModeAllowed) {
        const fallback = INITIAL_STOCKS.find((s) => s.ticker.toUpperCase() === ticker.toUpperCase());
        if (fallback) {
          return {
            ...fallback,
            isRealData: false,
            dividends: [],
            dividendsByYear: [],
          };
        }
      }
      return null;
    }
    const data: StockDetailData = await res.json();
    return data;
  } catch (err) {
    console.warn(`Erro ao buscar detalhes do ativo ${ticker}:`, err);
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      const fallback = INITIAL_STOCKS.find((s) => s.ticker.toUpperCase() === ticker.toUpperCase());
      if (fallback) {
        return {
          ...fallback,
          isRealData: false,
          dividends: [],
          dividendsByYear: [],
        };
      }
    }
    return null;
  }
}

/**
 * Consulta a lista consolidada do calendário de proventos (dividendos, JCP e rendimentos FII)
 * para os ativos monitorados da B3.
 */
export async function fetchDividendsCalendar(): Promise<DividendCalendarItem[]> {
  try {
    const res = await fetch('/api/market/dividends', {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('Erro ao consultar calendário de dividendos:', err);
    return [];
  }
}

