import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StockItem, CryptoItem, CurrencyItem, MacroIndicators } from '../types/market';
import { fetchMarketData, MarketDataState } from '../services/marketService';
import { INITIAL_STOCKS, INITIAL_CRYPTOS, INITIAL_CURRENCIES, INITIAL_MACRO } from '../data/mockMarketData';
import { AUTO_REFRESH_SECONDS } from '../constants/config';

interface MarketContextType {
  marketState: MarketDataState;
  isRefreshing: boolean;
  refreshData: () => Promise<void>;
  selectedStockForChart: StockItem | null;
  setSelectedStockForChart: (stock: StockItem | null) => void;
  selectedStockForAi: StockItem | null;
  setSelectedStockForAi: (stock: StockItem | null) => void;
  handleExplainFromChart: (stock: StockItem) => void;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [marketState, setMarketState] = useState<MarketDataState>({
    stocks: INITIAL_STOCKS,
    cryptos: INITIAL_CRYPTOS,
    currencies: INITIAL_CURRENCIES,
    macro: INITIAL_MACRO,
    lastUpdated: new Date(),
    isDemoMode: false,
    isLoading: true,
    error: null,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedStockForChart, setSelectedStockForChart] = useState<StockItem | null>(null);
  const [selectedStockForAi, setSelectedStockForAi] = useState<StockItem | null>(null);

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const data = await fetchMarketData();
      setMarketState(data);
    } catch (err) {
      console.warn('Erro ao atualizar dados do mercado, mantendo cache:', err);
    } finally {
      if (isManual) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  }, []);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  useEffect(() => {
    const timer = setInterval(() => {
      loadData(false);
    }, AUTO_REFRESH_SECONDS * 1000);
    return () => clearInterval(timer);
  }, [loadData]);

  const handleExplainFromChart = (stock: StockItem) => {
    setSelectedStockForChart(null);
    setSelectedStockForAi(stock);
  };

  return (
    <MarketContext.Provider
      value={{
        marketState,
        isRefreshing,
        refreshData: () => loadData(true),
        selectedStockForChart,
        setSelectedStockForChart,
        selectedStockForAi,
        setSelectedStockForAi,
        handleExplainFromChart,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
