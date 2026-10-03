import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { useMarket } from '../context/MarketContext';
import { PageHeader } from '../components/PageHeader';
import { NewsletterCta } from '../components/NewsletterCta';
import {
  Sparkles,
  Activity,
  Cpu,
  BookOpenCheck,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { formatBRL } from '../utils/formatters';

export const AiPage: React.FC = () => {
  usePageMeta(
    'Inteligência Artificial Aplicada ao Mercado B3 | NorteInvest',
    'Conheça a tecnologia de inteligência artificial que traduz oscilações da B3 em explicações didáticas com dados atualizados a cada 60 segundos. Veja exemplos práticos e conformidade CVM.'
  );

  const { setSelectedStockForAi, marketState } = useMarket();

  const [activeExampleTab, setActiveExampleTab] = useState<'PETR4' | 'VALE3' | 'ITUB4' | 'MGLU3'>('PETR4');

  const steps = [
    {
      number: '01',
      title: 'Varredura Multimercado Contínua',
      badge: 'B3 • SGS Bacen • Câmbio Comercial',
      icon: <Activity className="w-5 h-5 text-[#d4af6a]" />,
      iconBg: 'from-[#1c1916] to-[#141210] border-[#d4af6a]/30',
      description:
        'Nossos coletores monitoram continuamente o livro de ofertas da B3, cotações de commodities de referência mundial (petróleo Brent, minério de ferro em Dalian), câmbio do Dólar e atas do Copom/Banco Central.',
    },
    {
      number: '02',
      title: 'Cruzamento de Hipóteses com LLM',
      badge: 'LLMs de Alta Precisão',
      icon: <Cpu className="w-5 h-5 text-[#d4af6a]" />,
      iconBg: 'from-[#1c1916] to-[#141210] border-[#d4af6a]/30',
      description:
        'Modelos de linguagem avançados correlacionam a oscilação da ação com notícias corporativas, balanços trimestrais e fluxo de capital estrangeiro para formular as hipóteses mais plausíveis do pregão.',
    },
    {
      number: '03',
      title: 'Síntese Acessível sem Jargões',
      badge: 'Linguagem Clara • Conteúdo educacional',
      icon: <BookOpenCheck className="w-5 h-5 text-[#d4af6a]" />,
      iconBg: 'from-[#1c1916] to-[#141210] border-[#d4af6a]/30',
      description:
        'A IA gera hipóteses em linguagem simples sobre o que pode ter influenciado o preço. 100% voltado à educação financeira, sem recomendações de compra ou venda e em caráter pedagógico.',
    },
  ];

  const examples = {
    PETR4: {
      ticker: 'PETR4',
      name: 'Petrobras PN',
      price: 38.45,
      change: '+2,40%',
      isUp: true,
      factor: 'Commodities Globais (Petróleo Brent)',
      summary:
        'A alta recente das ações da Petrobras reflete a valorização de mais de 2% do barril de petróleo Brent no mercado internacional, associada ao anúncio de novos recordes operacionais de extração no pré-sal da Bacia de Santos.',
      drivers: [
        'Cotação internacional do barril Brent em Londres.',
        'Fluxo de investidores estrangeiros comprando ações de valor.',
        'Expectativas quanto a proventos e dividendos do trimestre.',
      ],
    },
    VALE3: {
      ticker: 'VALE3',
      name: 'Vale S.A. ON',
      price: 61.2,
      change: '-1,15%',
      isUp: false,
      factor: 'Demanda na Ásia e Minério de Ferro',
      summary:
        'A desvalorização da Vale acompanhou o recuo nos contratos futuros de minério de ferro na bolsa de mercadorias de Dalian (China), refletindo cautela quanto ao ritmo de novos investimentos na construção civil chinesa.',
      drivers: [
        'Preço da tonelada de minério de ferro nos portos chineses.',
        'Dados econômicos de importação e produção industrial na Ásia.',
        'Oscilações da taxa de câmbio Dólar/Real (empresa exportadora).',
      ],
    },
    ITUB4: {
      ticker: 'ITUB4',
      name: 'Itaú Unibanco PN',
      price: 34.8,
      change: '+1,05%',
      isUp: true,
      factor: 'Spread Bancário e Taxa Selic',
      summary:
        'O avanço do Itaú decorre do cenário de juros básicos elevados (Selic a dois dígitos), que beneficia o resultado de intermediação financeira e carteiras de crédito corporativo, além de baixa taxa de inadimplência.',
      drivers: [
        'Decisões de política monetária do Copom (Selic).',
        'Margem financeira líquida com clientes e spread bancário.',
        'Índice de inadimplência de pessoas físicas e jurídicas.',
      ],
    },
    MGLU3: {
      ticker: 'MGLU3',
      name: 'Magazine Luiza ON',
      price: 10.45,
      change: '-3,20%',
      isUp: false,
      factor: 'Juros Futuros e Varejo de Consumo',
      summary:
        'As ações de varejo e comércio eletrônico são altamente sensíveis à curva de juros longos (DI). Uma alta nas taxas futuras encarece o financiamento de bens duráveis e pressiona as margens financeiras do setor.',
      drivers: [
        'Curva de juros futuros (Contratos DI na B3).',
        'Nível de endividamento e poder de compra das famílias.',
        'Custos logísticos e competição com plataformas digitais.',
      ],
    },
  };

  const currentExample = examples[activeExampleTab];

  const handleOpenAiForExample = (ticker: string) => {
    const stock = marketState.stocks.find((s) => s.ticker === ticker);
    if (stock) {
      setSelectedStockForAi(stock);
    }
  };

  return (
    <div>
      <PageHeader
        badge="Tecnologia Proprietária"
        badgeColor="gold"
        title="Inteligência Artificial"
        titleHighlight="NorteInvest"
        subtitle="Entenda como nossa tecnologia proprietária transforma milhões de dados públicos do mercado financeiro brasileiro em sínteses didáticas para quem investe com propósito."
        breadcrumbs={[{ label: 'Inteligência Artificial' }]}
      >
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-[#141210] border border-[#d4af6a]/20 text-xs font-mono">
          <Sparkles className="w-4 h-4 text-[#d4af6a]" />
          <span className="text-[#a39a8c]">Modelo:</span>
          <strong className="text-[#f5efe6] font-bold">Google Gemini 3.8 Flash</strong>
        </div>
      </PageHeader>

      {/* 1. The 3 Steps Section */}
      <section className="py-20 sm:py-28 bg-[#0b0a09] border-b border-[#d4af6a]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#f5efe6] tracking-tight">
              O Fluxo de Análise em 3 Etapas
            </h2>
            <p className="text-sm sm:text-base text-[#a39a8c] mt-3 leading-relaxed">
              O caminho analítico que uma oscilação na bolsa percorre até chegar na sua tela como uma explicação clara e desprovida de jargões.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {steps.map((step) => (
              <div
                key={step.number}
                className="p-8 rounded-[16px] bg-[#141210] border border-[#d4af6a]/15 shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-12 h-12 rounded-[10px] bg-gradient-to-tr ${step.iconBg} border flex items-center justify-center shadow-md`}
                    >
                      {step.icon}
                    </div>
                    <span className="font-mono text-2xl font-black text-[#d4af6a]/25">
                      {step.number}
                    </span>
                  </div>

                  <span className="inline-block text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#1c1916] text-[#a39a8c] border border-[#d4af6a]/15 mb-2 font-semibold">
                    {step.badge}
                  </span>

                  <h3 className="text-xl font-serif font-bold text-[#f5efe6] tracking-tight">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#a39a8c] leading-relaxed font-normal mt-3">
                    {step.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-[#d4af6a]/10 text-xs text-[#d4af6a] font-semibold flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-[#d4af6a]" />
                  <span>Processamento Automatizado em Nuvem</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 2. Interactive Examples Section */}
      <section className="py-20 sm:py-28 bg-[#141210]/50 border-b border-[#d4af6a]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c1916] border border-[#d4af6a]/25 text-xs font-mono font-semibold text-[#f0d9a8] mb-3">
              <Zap className="w-3.5 h-3.5 text-[#d4af6a]" />
              <span>Exemplos Práticos Reais</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#f5efe6] tracking-tight">
              A IA Interpretando a B3
            </h2>
            <p className="text-sm text-[#a39a8c] mt-2">
              Selecione uma companhia abaixo para inspecionar como a inteligência analisa diferentes setores econômicos.
            </p>
          </div>

          {/* Example Selector Tabs */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-10">
            {(['PETR4', 'VALE3', 'ITUB4', 'MGLU3'] as const).map((ticker) => {
              const isActive = activeExampleTab === ticker;
              return (
                <button
                  key={ticker}
                  onClick={() => setActiveExampleTab(ticker)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-mono font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] text-[#0b0a09] shadow-lg shadow-[#d4af6a]/25 font-bold'
                      : 'bg-[#141210] text-[#a39a8c] hover:text-[#f5efe6] border border-[#d4af6a]/20'
                  }`}
                >
                  {ticker} • {examples[ticker].name.split(' ')[0]}
                </button>
              );
            })}
          </div>

          {/* Active Example Card */}
          <div className="max-w-4xl mx-auto p-6 sm:p-10 rounded-[16px] bg-[#141210] border border-[#d4af6a]/25 shadow-[0_16px_50px_rgba(0,0,0,0.6)]">
            
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#d4af6a]/12 mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/25 flex items-center justify-center font-mono font-bold text-[#f0d9a8] text-base shadow-sm">
                  {currentExample.ticker.slice(0, 3)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xl text-[#f5efe6]">
                      {currentExample.ticker}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c1916] text-[#a39a8c] border border-[#d4af6a]/10">
                      B3
                    </span>
                    {activeExampleTab === 'PETR4' && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141210] text-[#d4af6a] border border-[#d4af6a]/25 font-semibold">
                        Exemplo ilustrativo
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#a39a8c]">
                    {currentExample.name} • Cotação: {formatBRL(currentExample.price)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1 font-mono tabular-nums text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full ${
                    currentExample.isUp
                      ? 'text-[#3ddc97] bg-[#3ddc97]/10 border border-[#3ddc97]/25'
                      : 'text-[#ff5c6c] bg-[#ff5c6c]/10 border border-[#ff5c6c]/25'
                  }`}
                >
                  <span>{currentExample.isUp ? '▲' : '▼'}</span>
                  <span>{currentExample.change}</span>
                </span>

                <button
                  onClick={() => handleOpenAiForExample(currentExample.ticker)}
                  className="px-4 py-1.5 rounded-[8px] bg-[#1c1916] hover:bg-[#24201c] border border-[#d4af6a]/30 text-xs font-semibold text-[#f0d9a8] transition-colors cursor-pointer"
                >
                  Consultar ao Vivo
                </button>
              </div>
            </div>

            {/* Explanation & Drivers */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#d4af6a] block mb-2 font-semibold">
                  Síntese Didática Produzida pela IA:
                </span>
                <p className="text-base sm:text-lg text-[#f5efe6] leading-relaxed font-normal p-5 rounded-[12px] bg-[#1c1916] border border-[#d4af6a]/10">
                  "{currentExample.summary}"
                </p>
              </div>

              <div className="p-5 rounded-[12px] bg-[#1c1916]/80 border border-[#d4af6a]/15 space-y-2.5 text-xs">
                <strong className="text-[#f5efe6] font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#d4af6a]" />
                  <span>Fatores determinantes mapeados pelo algoritmo:</span>
                </strong>
                <ul className="space-y-1.5 text-[#a39a8c] list-disc list-inside">
                  {currentExample.drivers.map((driver, idx) => (
                    <li key={idx}>{driver}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/20 text-[#a39a8c] text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#d4af6a] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong className="text-[#f0d9a8]">Conteúdo educacional:</strong> As explicações da IA são hipóteses educacionais para auxiliar na compreensão do mercado. Não configuram recomendação de investimento.
                </span>
              </div>
            </div>

          </div>

          <div className="mt-10 text-center">
            <Link
              to="/mercado"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] hover:from-[#dfbc77] hover:to-[#fae6b8] text-[#0b0a09] font-semibold text-xs sm:text-sm shadow-[0_4px_16px_rgba(212,175,106,0.25)] transition-all cursor-pointer active:scale-95"
            >
              <span>Ir para a tabela completa e testar em qualquer ativo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* 3. Regulatory Safety Section */}
      <section className="py-16 sm:py-24 bg-[#0b0a09] border-b border-[#d4af6a]/15">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-[10px] bg-[#141210] border border-[#d4af6a]/25 flex items-center justify-center mx-auto text-[#d4af6a]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#f5efe6] tracking-tight">
            Compromisso Ético e Regulatório
          </h3>
          <p className="text-xs sm:text-sm text-[#a39a8c] leading-relaxed max-w-2xl mx-auto font-normal">
            Nossos prompts e modelos de inteligência artificial foram calibrados com diretrizes estritas da <strong>Comissão de Valores Mobiliários (CVM)</strong> e <strong>ANBIMA</strong>: nunca prometer retornos, nunca recomendar ativos específicos e priorizar a alfabetização financeira com transparência.
          </p>
        </div>
      </section>

      <NewsletterCta
        title="Receba briefings diários com síntese da IA"
        subtitle="Entenda os bastidores da bolsa brasileira todas as manhãs direto no seu e-mail."
      />
    </div>
  );
};
