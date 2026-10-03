import React from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { useMarket } from '../context/MarketContext';
import { PageHeader } from '../components/PageHeader';
import { CryptoAndWorldSection } from '../components/CryptoAndWorldSection';
import { NewsletterCta } from '../components/NewsletterCta';
import { Globe } from 'lucide-react';

export const CryptoPage: React.FC = () => {
  usePageMeta(
    'Criptomoedas & Câmbio Mundial | Cotações em Reais | NorteInvest',
    'Cotações de Bitcoin, Ethereum, Solana, Dólar comercial, Euro, Ouro e principais moedas mundiais convertidas em Reais (BRL) atualizadas a cada 60 segundos.'
  );

  const { marketState } = useMarket();

  return (
    <div>
      <PageHeader
        badge="Mercado Internacional"
        badgeColor="gold"
        title="Criptomoedas e"
        titleHighlight="Câmbio Mundial"
        subtitle="Acompanhe o valor de mercado das principais moedas digitais (Bitcoin, Ethereum, Solana) e pares cambiais soberanos (Dólar, Euro, Ouro) com calculadora de conversão instantânea para Reais."
        breadcrumbs={[{ label: 'Cripto & Câmbio' }]}
      >
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-[#141210] border border-[#d4af6a]/20 text-xs font-mono">
          <Globe className="w-4 h-4 text-[#d4af6a]" />
          <span className="text-[#c2b9ac]">Moeda Base:</span>
          <strong className="text-[#f5efe6] font-bold">Real Brasileiro (BRL)</strong>
        </div>
      </PageHeader>

      <CryptoAndWorldSection
        cryptos={marketState.cryptos}
        currencies={marketState.currencies}
        isDemoMode={marketState.isDemoMode}
        lastUpdated={marketState.lastUpdated}
      />

      <NewsletterCta
        title="Fique por dentro das oscilações de Dólar e Bitcoin"
        subtitle="Receba análises diárias sobre como o câmbio global e o apetite por criptoativos afetam a bolsa brasileira e a inflação no Brasil."
      />
    </div>
  );
};
