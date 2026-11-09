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

import { PlanProvider } from './context/PlanContext';
import { DevPlanSwitcher } from './components/DevPlanSwitcher';
import { PremiumModal } from './components/PremiumModal';

// Pages
import { HomePage } from './pages/HomePage';
import { StocksPage } from './pages/StocksPage';
import { CryptoPage } from './pages/CryptoPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { LearnIndexPage } from './pages/LearnIndexPage';
import { LessonDetailPage } from './pages/LessonDetailPage';
import { AiPage } from './pages/AiPage';
import { StockDetailPage } from './pages/StockDetailPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ComparePage } from './pages/ComparePage';
import { DividendCalendarPage } from './pages/DividendCalendarPage';
import { PlansPage } from './pages/PlansPage';
import { DiagnosticPage } from './pages/DiagnosticPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { AboutPage } from './pages/AboutPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { NewsPage } from './pages/NewsPage';
import { GlossaryPage } from './pages/GlossaryPage';
import { ScreenerPage } from './pages/ScreenerPage';
import { FiisPage } from './pages/FiisPage';
import { PortfolioPage } from './pages/PortfolioPage';
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
          <Route path="/mercado/:ticker" element={<StockDetailPage />} />
          <Route path="/radar" element={<ScreenerPage />} />
          <Route path="/rastreador" element={<ScreenerPage />} />
          <Route path="/fiis" element={<FiisPage />} />
          <Route path="/carteira" element={<PortfolioPage />} />
          <Route path="/favoritos" element={<FavoritesPage />} />
          <Route path="/comparar" element={<ComparePage />} />
          <Route path="/dividendos" element={<DividendCalendarPage />} />
          <Route path="/planos" element={<PlansPage />} />
          {import.meta.env.DEV && <Route path="/diagnostico" element={<DiagnosticPage />} />}
          <Route path="/cripto" element={<CryptoPage />} />
          <Route path="/simulador" element={<SimulatorPage />} />
          <Route path="/aprender" element={<LearnIndexPage />} />
          <Route path="/aprender/:slug" element={<LessonDetailPage />} />
          <Route path="/ia" element={<AiPage />} />
          <Route path="/noticias" element={<NewsPage />} />
          <Route path="/glossario" element={<GlossaryPage />} />
          <Route path="/glossario/:termSlug" element={<GlossaryPage />} />
          <Route path="/sobre" element={<AboutPage />} />
          <Route path="/metodologia" element={<MethodologyPage />} />
          <Route path="/contato" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
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
    <div className={`min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[#d4af6a]/30 selection:text-[#f0d9a8] ${
      marketState.isDemoMode ? 'pt-7 sm:pt-8' : ''
    }`}>
      <ScrollToTop />

      {/* Faixa fixa no topo quando em modo demonstração */}
      <DemonstrationBanner
        isDemoMode={marketState.isDemoMode}
        onRetry={refreshData}
        isRetrying={isRefreshing}
      />

      {/* Header & Shared Navigation */}
      <Navbar
        lastUpdated={marketState.lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={refreshData}
        isDemoMode={marketState.isDemoMode}
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

      {/* Premium Feature & Waitlist Modal */}
      <PremiumModal />

      {/* Seletor DEV: Premium apenas em ambiente de desenvolvimento */}
      {import.meta.env.DEV && <DevPlanSwitcher />}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <PlanProvider>
        <MarketProvider>
          <AppLayout />
        </MarketProvider>
      </PlanProvider>
    </BrowserRouter>
  );
}
