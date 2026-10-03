import React from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { useMarket } from '../context/MarketContext';
import { PageHeader } from '../components/PageHeader';
import { StocksSection } from '../components/StocksSection';
import { NewsletterCta } from '../components/NewsletterCta';
import { formatFullDateTimeBR } from '../utils/formatters';
import { Activity, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export const StocksPage: React.FC = () => {
  usePageMeta(
    'Cotações da B3 Atualizadas a Cada 60 Segundos | Ações, FIIs e Gráficos | NorteInvest',
    'Acompanhe as cotações da B3 atualizadas a cada 60 segundos. Consulte maiores altas, maiores baixas, FIIs, gráficos interativos com sparklines reais e sínteses didáticas com IA.'
  );

  const { marketState, setSelectedStockForChart, setSelectedStockForAi } = useMarket();

  const stocksCount = marketState.stocks.filter((s) => s.category !== 'fii' && !s.ticker.endsWith('11')).length;
  const fiisCount = marketState.stocks.filter((s) => s.category === 'fii' || s.ticker.endsWith('11')).length;
  const updateLabel = formatFullDateTimeBR(marketState.lastUpdated);

  return (
    <div>
      <PageHeader
        badge="Pregão B3 • Cotações Oficiais"
        badgeColor="gold"
        title="Mercado Acionário"
        titleHighlight="Bolsa do Brasil"
        subtitle="Acompanhe as cotações da B3 atualizadas a cada 60 segundos com mini gráficos de tendência diária (sparklines), volumes negociados e síntese didática gerada por Inteligência Artificial."
        breadcrumbs={[{ label: 'Mercado B3' }]}
      >
        <div className="flex flex-wrap items-center gap-3">
          {/* Tracked Assets Metric */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-[#141210] border border-[#d4af6a]/20 text-xs font-mono">
            <Activity className="w-4 h-4 text-[#d4af6a]" />
            <span className="text-[#c2b9ac]">Ativos monitorados:</span>
            <strong className="text-[#f5efe6] font-bold">
              {marketState.stocks.length} ativos ({stocksCount} ações • {fiisCount} FIIs)
            </strong>
          </div>

          {/* Exact Timestamp */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-[#141210] border border-[#d4af6a]/20 text-xs font-mono text-[#c2b9ac]">
            <Clock className="w-3.5 h-3.5 text-[#d4af6a]" />
            <span>Atualizado em {updateLabel}</span>
          </div>

          {/* Prominent Demo Mode Badge or Verified Real Data Badge */}
          {marketState.isDemoMode ? (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Dados de demonstração</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/25 text-[#f0d9a8] text-xs font-mono">
              <ShieldCheck className="w-4 h-4 text-[#3ddc97]" />
              <span>API brapi.dev conectada</span>
            </div>
          )}
        </div>
      </PageHeader>

      <StocksSection
        stocks={marketState.stocks}
        isLoading={marketState.isLoading}
        isDemoMode={marketState.isDemoMode}
        lastUpdated={marketState.lastUpdated}
        onSelectStockForChart={setSelectedStockForChart}
        onSelectStockForAi={setSelectedStockForAi}
      />

      <NewsletterCta
        title="Receba alertas diários de cotações da B3"
        subtitle="Mantenha-se informado sobre os ativos que mais movimentaram o pregão com síntese didática e sem jargões direto na sua caixa de entrada."
      />
    </div>
  );
};
