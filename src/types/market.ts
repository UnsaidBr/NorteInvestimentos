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

export type TimeframeFilter = '1D' | '1S' | '1M' | '6M' | '1A';

export interface CryptoItem {
  id: string;
  name: string;
  symbol: string;
  priceBrl: number;
  change24h: number;
  volume24hBrl?: number;
  marketCapBrl?: number;
  icon?: string;
}

export interface CurrencyItem {
  code: string;
  name: string;
  symbol: string;
  bid: number; // Buying price in BRL
  ask?: number;
  pctChange: number;
  high?: number;
  low?: number;
  updatedAt?: string;
}

export interface MacroIndicators {
  ibovespa: {
    points: number;
    changePercent: number;
  };
  selic: {
    rateAnnual: number;
    date: string;
    source: string;
  };
  cdi: {
    rateAnnual: number;
  };
  ipca: {
    rate12m: number;
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
