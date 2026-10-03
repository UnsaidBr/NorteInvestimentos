import React from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { useMarket } from '../context/MarketContext';
import { PageHeader } from '../components/PageHeader';
import { SimulatorSection } from '../components/SimulatorSection';
import { NewsletterCta } from '../components/NewsletterCta';
import { Landmark } from 'lucide-react';

export const SimulatorPage: React.FC = () => {
  usePageMeta(
    'Simulador de Investimentos | Compare Poupança, CDI, Ibovespa e Dólar | NorteInvest',
    'Simule a evolução do seu patrimônio com juros compostos. Compare o rendimento de 100% do CDI com a Poupança tradicional, a média histórica do Ibovespa e o Dólar.'
  );

  const { marketState } = useMarket();

  return (
    <div>
      <PageHeader
        badge="Juros Compostos"
        badgeColor="gold"
        title="Simulador Patrimonial"
        titleHighlight="Comparativo"
        subtitle="Calcule a projeção do seu patrimônio ao longo do tempo aplicando aportes regulares e compare o rendimento real da Renda Fixa (CDI) frente à Poupança, ações da B3 e valorização cambial."
        breadcrumbs={[{ label: 'Simulador' }]}
      >
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-[#141210] border border-[#d4af6a]/20 text-xs font-mono">
          <Landmark className="w-4 h-4 text-[#d4af6a]" />
          <span className="text-[#c2b9ac]">Selic Meta:</span>
          <strong className="text-[#f5efe6] font-bold">{marketState.macro.selic.rateAnnual.toFixed(2)}% a.a.</strong>
        </div>
      </PageHeader>

      <SimulatorSection
        macro={marketState.macro}
        isDemoMode={marketState.isDemoMode}
        lastUpdated={marketState.lastUpdated}
      />

      <NewsletterCta
        title="Planeje seu futuro com inteligência e disciplina"
        subtitle="Receba dicas práticas sobre como montar sua reserva de emergência e otimizar aportes mensais para acelerar o efeito dos juros compostos."
      />
    </div>
  );
};
