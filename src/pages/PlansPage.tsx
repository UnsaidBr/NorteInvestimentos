import React, { useState } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { usePlan } from '../context/PlanContext';
import { PageHeader } from '../components/PageHeader';
import {
  Sparkles,
  Zap,
  Check,
  X,
  Crown,
  ArrowRight,
  ShieldCheck,
  Sliders,
  Star,
  Scale,
  Download,
  Bell,
  HelpCircle,
  Mail,
  CheckCircle2,
  Calendar,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

export const PlansPage: React.FC = () => {
  usePageMeta(
    'Planos Gratuito e Premium | NorteInvest',
    'Compare os planos Gratuito e Premium do NorteInvest. Screener com filtros avançados, favoritos salvos, inteligência artificial para o mercado B3, comparador de ativos e exportação CSV.'
  );

  const { plan, isPremium, setPlan, openWaitlistModal, joinWaitlist, isWaitlistSubscribed } = usePlan();

  const [inlineEmail, setInlineEmail] = useState('');
  const [inlineSubmitting, setInlineSubmitting] = useState(false);
  const [inlineFeedback, setInlineFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineEmail || !inlineEmail.includes('@')) {
      setInlineFeedback({ text: 'Por favor, informe um e-mail válido.', isError: true });
      return;
    }

    setInlineSubmitting(true);
    setInlineFeedback(null);
    const res = await joinWaitlist(inlineEmail, 'Página de Planos (/planos)');
    setInlineSubmitting(false);

    if (res.success) {
      setInlineFeedback({ text: res.message, isError: false });
    } else {
      setInlineFeedback({ text: res.message, isError: true });
    }
  };

  const matrixFeatures = [
    {
      category: 'Ferramentas de Triagem & Filtros',
      items: [
        {
          name: 'Filtros simultâneos no Screener',
          desc: 'Combine indicadores como P/L, P/VP, Dividend Yield, ROE e Volume.',
          free: 'Até 3 filtros',
          premium: 'Ilimitados (todos os filtros)',
          highlight: true,
        },
        {
          name: 'Filtros rápidos pré-configurados (Presets)',
          desc: 'Maiores dividend yields, maior liquidez, menores múltiplos.',
          free: true,
          premium: true,
        },
        {
          name: 'Personalização de colunas da tabela',
          desc: 'Exiba ou oculte colunas conforme sua preferência de análise.',
          free: true,
          premium: true,
        },
        {
          name: 'Exportação de dados para planilha (CSV)',
          desc: 'Download completo dos ativos filtrados para Excel ou Google Sheets.',
          free: false,
          premium: true,
          highlight: true,
        },
      ],
    },
    {
      category: 'Monitoramento & Carteira',
      items: [
        {
          name: 'Ativos Favoritos Salvos',
          desc: 'Acompanhe cotações atualizadas a cada 60 segundos e variações em um painel único.',
          free: 'Até 5 ativos',
          premium: 'Ilimitados',
          highlight: true,
        },
        {
          name: 'Gráficos Sparkline de tendência diária',
          desc: 'Mini-gráficos de performance em cada ativo monitorado.',
          free: true,
          premium: true,
        },
        {
          name: 'Alertas de Preço por E-mail',
          desc: 'Avisos quando um ativo atingir cotações mínimas ou máximas configuradas.',
          free: false,
          premium: true,
          highlight: true,
        },
        {
          name: 'Calendário de Dividendos e Proventos',
          desc: 'Datas-com, datas de pagamento e rendimentos estimados de ações e FIIs.',
          free: 'Acesso Padrão',
          premium: 'Acesso Padrão + Alertas',
        },
      ],
    },
    {
      category: 'Inteligência Artificial & Análise',
      items: [
        {
          name: 'Explicações Didáticas com IA por dia',
          desc: 'Sínteses das oscilações da B3 em linguagem acessível e conformidade CVM.',
          free: '3 consultas / dia',
          premium: 'Ilimitadas',
          highlight: true,
        },
        {
          name: 'Comparador de Ativos Simultâneos',
          desc: 'Gráfico normalizado na Base 100 e tabela lado a lado com destaques neutros.',
          free: 'Até 2 ativos',
          premium: 'Até 4 ativos',
          highlight: true,
        },
        {
          name: 'Comparação com a Mediana do Setor',
          desc: 'Múltiplos do ativo ao lado da mediana dos pares no mesmo segmento.',
          free: true,
          premium: true,
        },
      ],
    },
    {
      category: 'Educação & Simulação',
      items: [
        {
          name: 'Página por Ativo (/mercado/:ticker)',
          desc: 'Gráficos históricos (1D a 5A), candles, proventos e indicadores completos.',
          free: true,
          premium: true,
        },
        {
          name: 'Simulador de Renda Fixa vs CDI',
          desc: 'Comparativo de CDB, LCI/LCA, Tesouro Selic e Poupança com tabela regressiva.',
          free: true,
          premium: true,
        },
        {
          name: 'Aprender Investir (Aulas Didáticas)',
          desc: 'Trilhas do iniciante ao intermediário com linguagem simples sem jargões.',
          free: true,
          premium: true,
        },
      ],
    },
  ];

  return (
    <div className="w-full pb-16">
      {/* Header */}
      <PageHeader
        badge="Transparência NorteInvest"
        title="Planos & Recursos"
        subtitle="Transparência total para sua jornada como investidor. Comece gratuitamente com dados reais da B3 e entre na lista prioritária para desbloquear o NorteInvest Premium."
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Planos & Recursos' },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-16">
        {/* Current Plan Indicator Banner */}
        <div className="bg-[#141210] border border-[#d4af6a]/30 rounded-[16px] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-[12px] border ${isPremium ? 'bg-[#d4af6a]/15 border-[#d4af6a]/40 text-[#f0d9a8]' : 'bg-[#1c1916] border-[#d4af6a]/20 text-amber-400'}`}>
              {isPremium ? <Crown className="w-5 h-5 text-[#d4af6a]" /> : <Zap className="w-5 h-5 text-amber-400" />}
            </div>
            <div>
              <div className="text-xs font-mono text-[#8c8273]">Status da sua sessão:</div>
              <div className="text-base font-bold text-[#f5efe6] flex items-center gap-2">
                <span>Plano Atual: <strong className="text-[#f0d9a8]">{isPremium ? 'Premium ⭐' : 'Gratuito ⚡'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setPlan(isPremium ? 'free' : 'premium')}
              className="w-full sm:w-auto px-4 py-2 rounded-[10px] bg-[#1c1916] hover:bg-[#25221d] text-[#f0d9a8] border border-[#d4af6a]/30 text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-2"
              title="Alternar plano para testar a experiência"
            >
              <span>Alternar para {isPremium ? 'Gratuito' : 'Premium'}</span>
            </button>
            {!isPremium && (
              <button
                onClick={() => openWaitlistModal('Acesso ao Plano Premium')}
                className="w-full sm:w-auto px-4 py-2 rounded-[10px] bg-gradient-to-r from-[#d4af6a] to-[#e6ca85] hover:brightness-110 text-[#0a0908] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Entrar na Lista VIP</span>
              </button>
            )}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card Gratuito */}
          <div className={`relative rounded-[20px] bg-[#141210] border ${!isPremium ? 'border-[#d4af6a]/40 ring-1 ring-[#d4af6a]/20' : 'border-[#d4af6a]/20'} p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-all`}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c1916] border border-[#d4af6a]/20 text-[#c2b9ac] text-xs font-mono font-semibold">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Acesso Aberto</span>
                </div>
                {!isPremium && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Plano Ativo
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-serif font-bold text-[#f5efe6]">Gratuito</h3>
                <p className="text-xs text-[#8c8273] mt-1">
                  Ideal para investidores que desejam acompanhar cotações reais da B3 com ferramentas essenciais e foco didático.
                </p>
              </div>

              {/* Price */}
              <div className="py-2 border-y border-[#d4af6a]/15">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-serif font-bold text-[#f5efe6]">R$ 0</span>
                  <span className="text-xs text-[#8c8273] font-mono">/ para sempre</span>
                </div>
                <div className="text-[11px] text-[#8c8273] mt-1 font-mono">
                  Sem necessidade de cartão de crédito.
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#f5efe6] uppercase tracking-wider font-mono">
                  O que está incluso:
                </div>
                <ul className="space-y-2.5 text-xs text-[#c2b9ac]">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Screener:</strong> até 3 filtros simultâneos</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Favoritos:</strong> até 5 ativos monitorados com sparkline</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>IA Didática:</strong> até 3 explicações por dia</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Comparador:</strong> até 2 ativos na Base 100</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Página completa por ativo B3 com gráficos 1D a 5A</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Calendário de proventos e histórico de dividendos</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Simulador de Renda Fixa vs CDI e Trilhas Educativas</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={() => setPlan('free')}
                disabled={!isPremium}
                className={`w-full py-3 px-4 rounded-[12px] text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  !isPremium
                    ? 'bg-[#1c1916] text-[#8c8273] border border-[#d4af6a]/15 cursor-default'
                    : 'bg-[#1c1916] hover:bg-[#25221d] text-[#f0d9a8] border border-[#d4af6a]/30'
                }`}
              >
                {!isPremium ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Seu Plano Atual</span>
                  </>
                ) : (
                  <span>Alternar para Gratuito</span>
                )}
              </button>
            </div>
          </div>

          {/* Card Premium */}
          <div className={`relative rounded-[20px] bg-gradient-to-b from-[#1c1916] to-[#141210] border-2 ${isPremium ? 'border-[#d4af6a] ring-2 ring-[#d4af6a]/30' : 'border-[#d4af6a]/50'} p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden`}>
            {/* Ambient gold glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#d4af6a]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af6a]/20 border border-[#d4af6a]/40 text-[#f0d9a8] text-xs font-mono font-bold">
                  <Crown className="w-3.5 h-3.5 text-[#d4af6a]" />
                  <span>Experiência Definitiva</span>
                </div>
                {isPremium ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#d4af6a]/20 border border-[#d4af6a]/40 text-[#f0d9a8] text-xs font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af6a]" />
                    Plano Ativo
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold">
                    Lista de Espera VIP
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-serif font-bold text-[#f5efe6] flex items-center gap-2">
                  <span>Premium</span>
                  <Sparkles className="w-5 h-5 text-[#d4af6a]" />
                </h3>
                <p className="text-xs text-[#c2b9ac] mt-1">
                  Para investidores analíticos que exigem triagem ampla sem limites, comparadores completos e inteligência contínua.
                </p>
              </div>

              {/* Price: Em breve */}
              <div className="py-2 border-y border-[#d4af6a]/20">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-serif font-bold text-[#f0d9a8]">Em breve</span>
                </div>
                <div className="text-[11px] text-[#8c8273] mt-1 font-mono">
                  Valores e condições especiais serão enviados aos inscritos na lista prioritária.
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#f0d9a8] uppercase tracking-wider font-mono">
                  Tudo do Gratuito, mais:
                </div>
                <ul className="space-y-2.5 text-xs text-[#f5efe6]">
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#d4af6a]/20 text-[#d4af6a] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <span><strong>Screener Ilimitado:</strong> combine todos os filtros sem restrições</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#d4af6a]/20 text-[#d4af6a] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <span><strong>Favoritos Ilimitados:</strong> monitore centenas de ativos na sua carteira</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#d4af6a]/20 text-[#d4af6a] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <span><strong>IA Ilimitada:</strong> sem teto diário de explicações didáticas</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#d4af6a]/20 text-[#d4af6a] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <span><strong>Comparador de 4 Ativos:</strong> análise simultânea na Base 100</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#d4af6a]/20 text-[#d4af6a] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <span><strong>Exportação CSV:</strong> baixe planilhas de cotações e indicadores</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#d4af6a]/20 text-[#d4af6a] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <span><strong>Alertas por E-mail:</strong> avisos de preço e proventos em tempo real</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#d4af6a]/20 text-[#d4af6a] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>Acesso antecipado a novos módulos e suporte prioritário</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 relative z-10">
              <button
                onClick={() => openWaitlistModal('Acesso ao Plano Premium via /planos')}
                className="w-full py-3.5 px-4 rounded-[12px] bg-gradient-to-r from-[#d4af6a] to-[#e6ca85] hover:brightness-110 text-[#0a0908] text-xs font-bold font-mono transition-all shadow-lg shadow-[#d4af6a]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Entrar na lista de espera Premium</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Comparison Table Matrix */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#f5efe6]">
              Comparação Completa de Recursos
            </h2>
            <p className="text-xs sm:text-sm text-[#c2b9ac] max-w-2xl mx-auto">
              Veja lado a lado as capacidades de cada plano e descubra como o Premium potencializa suas análises de investimentos.
            </p>
          </div>

          <div className="overflow-x-auto bg-[#141210] border border-[#d4af6a]/25 rounded-[18px] shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#d4af6a]/20 bg-[#0c0b0a]">
                  <th className="py-4 px-6 text-xs font-bold text-[#f5efe6] font-mono uppercase tracking-wider w-1/2">
                    Recurso / Capacidade
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-center text-[#c2b9ac] font-mono uppercase tracking-wider w-1/4">
                    Gratuito
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-center text-[#f0d9a8] font-mono uppercase tracking-wider w-1/4 bg-[#d4af6a]/5">
                    Premium ⭐
                  </th>
                </tr>
              </thead>
              <tbody>
                {matrixFeatures.map((cat, catIdx) => (
                  <React.Fragment key={catIdx}>
                    <tr className="bg-[#181512] border-y border-[#d4af6a]/15">
                      <td colSpan={3} className="py-2.5 px-6 text-xs font-mono font-bold text-[#d4af6a] uppercase tracking-wider">
                        {cat.category}
                      </td>
                    </tr>
                    {cat.items.map((item, itemIdx) => (
                      <tr
                        key={itemIdx}
                        className={`border-b border-[#d4af6a]/10 hover:bg-[#1a1714] transition-colors ${
                          item.highlight ? 'bg-[#d4af6a]/[0.02]' : ''
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div className="font-semibold text-xs text-[#f5efe6]">{item.name}</div>
                          <div className="text-[11px] text-[#8c8273] mt-0.5">{item.desc}</div>
                        </td>
                        <td className="py-4 px-6 text-center text-xs font-mono">
                          {typeof item.free === 'boolean' ? (
                            item.free ? (
                              <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-[#8c8273] mx-auto opacity-50" />
                            )
                          ) : (
                            <span className="text-[#c2b9ac] font-semibold">{item.free}</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center text-xs font-mono bg-[#d4af6a]/5">
                          {typeof item.premium === 'boolean' ? (
                            item.premium ? (
                              <Check className="w-4 h-4 text-[#d4af6a] mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-[#8c8273] mx-auto opacity-50" />
                            )
                          ) : (
                            <span className="text-[#f0d9a8] font-bold">{item.premium}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dedicated Waitlist CTA Section */}
        <div className="bg-gradient-to-r from-[#1c1916] via-[#141210] to-[#1c1916] border border-[#d4af6a]/40 rounded-[20px] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af6a]/15 border border-[#d4af6a]/30 text-[#f0d9a8] text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af6a]" />
              <span>Lista de Espera Prioritária</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#f5efe6]">
              Garanta acesso antecipado ao NorteInvest Premium
            </h3>

            <p className="text-xs sm:text-sm text-[#c2b9ac] leading-relaxed">
              Estamos preparando a liberação em lotes controlados para garantir a máxima performance dos servidores. Os inscritos na lista de espera terão acesso primeiro e garantirão desconto vitalício de lançamento.
            </p>

            {isWaitlistSubscribed ? (
              <div className="p-4 rounded-[12px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Seu e-mail já está registrado na lista prioritária VIP!</span>
              </div>
            ) : (
              <form onSubmit={handleInlineSubmit} className="pt-2 max-w-md mx-auto space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8273]" />
                    <input
                      type="email"
                      required
                      value={inlineEmail}
                      onChange={(e) => setInlineEmail(e.target.value)}
                      placeholder="Seu melhor e-mail..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-[10px] bg-[#0c0b0a] border border-[#d4af6a]/30 focus:border-[#d4af6a] text-xs text-[#f5efe6] placeholder-[#6b6255] focus:outline-none focus:ring-1 focus:ring-[#d4af6a]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={inlineSubmitting}
                    className="px-5 py-2.5 rounded-[10px] bg-gradient-to-r from-[#d4af6a] to-[#e6ca85] hover:brightness-110 text-[#0a0908] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {inlineSubmitting ? <span>Enviando...</span> : <span>Entrar na Lista</span>}
                  </button>
                </div>

                {inlineFeedback && (
                  <div
                    className={`text-xs p-2.5 rounded-[8px] ${
                      inlineFeedback.isError
                        ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {inlineFeedback.text}
                  </div>
                )}
              </form>
            )}

            <div className="flex items-center justify-center gap-6 text-[11px] text-[#8c8273] font-mono pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Sem spam
              </span>
              <span>•</span>
              <span>Cancele a qualquer momento</span>
              <span>•</span>
              <span>Sem cobrança imediata</span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-6 pt-4">
          <div className="text-center space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6]">
              Perguntas Frequentes
            </h3>
            <p className="text-xs text-[#8c8273]">
              Tudo o que você precisa saber sobre o modelo de planos do NorteInvest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <div className="bg-[#141210] border border-[#d4af6a]/15 rounded-[14px] p-4 space-y-1.5">
              <h4 className="text-xs font-bold text-[#f5efe6] flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-[#d4af6a]" />
                O plano gratuito continuará existindo?
              </h4>
              <p className="text-xs text-[#8c8273] leading-relaxed">
                Sim! Nossa missão primordial é democratizar o acesso à educação financeira e a cotações reais da B3. O plano Gratuito continuará acessível para sempre com ferramentas essenciais.
              </p>
            </div>

            <div className="bg-[#141210] border border-[#d4af6a]/15 rounded-[14px] p-4 space-y-1.5">
              <h4 className="text-xs font-bold text-[#f5efe6] flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-[#d4af6a]" />
                Qual será o valor do plano Premium?
              </h4>
              <p className="text-xs text-[#8c8273] leading-relaxed">
                O valor oficial está sendo calibrado para ser extremamente acessível a investidores de qualquer porte. Os participantes da lista de espera receberão descontos exclusivos e garantia de preço congelado.
              </p>
            </div>

            <div className="bg-[#141210] border border-[#d4af6a]/15 rounded-[14px] p-4 space-y-1.5">
              <h4 className="text-xs font-bold text-[#f5efe6] flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-[#d4af6a]" />
                Como funciona a IA e qual é a limitação?
              </h4>
              <p className="text-xs text-[#8c8273] leading-relaxed">
                No plano Gratuito, você tem até 3 consultas por dia para gerar sínteses didáticas de oscilações da B3. No plano Premium, as consultas de IA são ilimitadas para você navegar por todo o mercado.
              </p>
            </div>

            <div className="bg-[#141210] border border-[#d4af6a]/15 rounded-[14px] p-4 space-y-1.5">
              <h4 className="text-xs font-bold text-[#f5efe6] flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-[#d4af6a]" />
                Como funciona a exportação CSV?
              </h4>
              <p className="text-xs text-[#8c8273] leading-relaxed">
                Com o Premium, você pode exportar com um único clique a lista de ativos filtrados no Screener para arquivos compatíveis com Excel, LibreOffice e Google Planilhas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
