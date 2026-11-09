export interface StockItem {
  ticker: string;
  name: string;
  price: number;
  change: number; // absolute change
  changePercent: number; // percentage (e.g. 2.45 or -1.20)
  volume: number; // trading volume in R$
  marketCap?: number;
  sector?: string;
  logoUrl?: string;
  high24h?: number;
  low24h?: number;
  openPrice?: number;
  category?: 'acao' | 'fii';
  sparkline?: number[];
  updatedAt?: string;
  isRealData?: boolean;
  // Screener fundamental indicators (strictly undefined if not returned by API)
  dividendYield?: number; // e.g. 6.2 for 6.2%
  pl?: number; // Preço / Lucro
  pvp?: number; // Preço / Valor Patrimonial
  roe?: number; // Return on Equity (%)
  avgVolume?: number; // Average volume
}

export interface StockHistoryPoint {
  date: string;
  price: number;
  volume?: number;
  timestamp?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

export type TimeframeFilter = '1D' | '1S' | '1M' | '6M' | '1A' | '5A';

export interface DividendRecord {
  paymentDate: string;
  rate: number;
  label: string; // 'DIVIDENDO' | 'JCP' | 'RENDIMENTO'
  lastDatePrior?: string; // Data com
  approvedOn?: string;
}

export interface DividendCalendarItem {
  id: string;
  ticker: string;
  name: string;
  category: 'acao' | 'fii';
  label: 'DIVIDENDO' | 'JCP' | 'RENDIMENTO';
  rate: number;
  lastDatePrior: string; // Data COM
  paymentDate: string; // Data de Pagamento
  approvedOn?: string;
  currentPrice?: number;
  yieldApprox?: number;
}

export interface StockDetailData extends StockItem {
  fiftyTwoWeekLow?: number;
  fiftyTwoWeekHigh?: number;
  description?: string;
  website?: string;
  industry?: string;
  dividends?: DividendRecord[];
  dividendsByYear?: { year: string; total: number; count: number }[];
}

export interface CryptoItem {
  id: string;
  name: string;
  symbol: string;
  priceBrl: number | null;
  change24h: number | null;
  volume24hBrl?: number;
  marketCapBrl?: number;
  icon?: string;
  statusText?: string;
  isRealData?: boolean;
  sparkline?: number[];
}

export interface CurrencyItem {
  code: string;
  name: string;
  symbol: string;
  bid: number | null; // Buying price in BRL
  ask?: number;
  pctChange: number | null;
  high?: number;
  low?: number;
  updatedAt?: string;
  source?: string;
  statusText?: string;
  isRealData?: boolean;
  sparkline?: number[];
}

export interface MacroIndicators {
  ibovespa: {
    points: number | null;
    changePercent: number | null;
    statusText?: string;
    lastRealAt?: string;
    sparkline?: number[];
  };
  selic: {
    rateAnnual: number | null;
    date: string;
    source: string;
    warning?: string | null;
    statusText?: string;
    lastRealAt?: string;
  };
  cdi: {
    rateAnnual: number | null;
    date?: string;
    isEstimated?: boolean;
    label?: string; // "CDI (Bacen)" or "CDI estimado"
    statusText?: string;
    lastRealAt?: string;
  };
  ipca: {
    rate12m: number | null;
    date?: string;
    source?: string;
    statusText?: string;
    lastRealAt?: string;
  };
}

export interface LearnTopic {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  readTime: string;
  iconName: string;
  content: {
    intro: string;
    sections: {
      heading: string;
      text: string;
      highlight?: string;
    }[];
    summary: string;
    cautionNote: string;
  };
}

export interface SimulatorParams {
  initialAmount: number;
  monthlyDeposit: number;
  periodMonths: number;
}

export interface SimulatorComparisonData {
  month: number;
  totalDeposited: number;
  poupanca: number;
  cdi: number;
  ibovespa: number;
  dolar: number;
}
