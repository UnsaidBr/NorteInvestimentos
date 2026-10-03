import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { MarketProvider, useMarket } from './context/MarketContext';
import { ScrollToTop } from './components/ScrollToTop';
import { Navbar } from './components/Navbar';
import { MarketTicker } from './components/MarketTicker';
import { DemonstrationBanner } from './components/DemonstrationBanner';
import { Footer } from './components/Footer';
import { StockChartModal } from './components/StockChartModal';
import { AiExplainerModal } from './components/AiExplainerModal';

// Pages
import { HomePage } from './pages/HomePage';
import { StocksPage } from './pages/StocksPage';
import { CryptoPage } from './pages/CryptoPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { LearnIndexPage } from './pages/LearnIndexPage';
import { LessonDetailPage } from './pages/LessonDetailPage';
import { AiPage } from './pages/AiPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { NotFoundPage } from './pages/NotFoundPage';

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="flex-1"
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/mercado" element={<StocksPage />} />
          <Route path="/cripto" element={<CryptoPage />} />
          <Route path="/simulador" element={<SimulatorPage />} />
          <Route path="/aprender" element={<LearnIndexPage />} />
          <Route path="/aprender/:slug" element={<LessonDetailPage />} />
          <Route path="/ia" element={<AiPage />} />
          <Route path="/privacidade" element={<PrivacyPolicyPage />} />
          <Route path="/termos" element={<TermsOfServicePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const AppLayout: React.FC = () => {
  const {
    marketState,
    isRefreshing,
    refreshData,
    selectedStockForChart,
    setSelectedStockForChart,
    selectedStockForAi,
    setSelectedStockForAi,
    handleExplainFromChart,
  } = useMarket();

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[#d4af6a]/30 selection:text-[#f0d9a8]">
      <ScrollToTop />

      {/* Header & Shared Navigation */}
      <Navbar
        lastUpdated={marketState.lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={refreshData}
      />

      {/* Optional fallback notice */}
      <DemonstrationBanner
        isDemoMode={marketState.isDemoMode}
        onRetry={refreshData}
        isRetrying={isRefreshing}
      />

      {/* Live Market Ticker with real update time and demo badge */}
      <MarketTicker
        macro={marketState.macro}
        currencies={marketState.currencies}
        cryptos={marketState.cryptos}
        isDemoMode={marketState.isDemoMode}
        lastUpdated={marketState.lastUpdated}
      />

      {/* Animated Route Content */}
      <main className="flex-1 flex flex-col">
        <AnimatedRoutes />
      </main>

      {/* Shared Footer */}
      <Footer />

      {/* Global Interactive Modals (Stock chart and AI explainer) */}
      <StockChartModal
        stock={selectedStockForChart}
        onClose={() => setSelectedStockForChart(null)}
        onExplainAi={handleExplainFromChart}
      />

      <AiExplainerModal
        stock={selectedStockForAi}
        onClose={() => setSelectedStockForAi(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <MarketProvider>
        <AppLayout />
      </MarketProvider>
    </BrowserRouter>
  );
}
