import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { useMarket } from '../context/MarketContext';
import { Hero } from '../components/Hero';
import { MarketHighlightsTabs } from '../components/MarketHighlightsTabs';
import { ToolsShowcaseSection } from '../components/ToolsShowcaseSection';
import { NewsletterCta } from '../components/NewsletterCta';
import { LatestNewsSection } from '../components/LatestNewsSection';
import { formatBRL } from '../utils/formatters';
import { LEARN_TOPICS } from '../data/learningContent';
import {
  ArrowRight,
  Calculator,
  GraduationCap,
  Clock,
  Building2,
  Percent,
  Scale,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  usePageMeta(
    'NorteInvest | Inteligência, Valuation e Múltiplos da B3',
    'Portal de inteligência de mercado, rastreador fundamentalista de ações e FIIs com fórmulas de Graham e Bazin, cotações atualizadas a cada 60 segundos e simulações patrimoniais com IR.'
  );

  const { marketState } = useMarket();
  const { macro } = marketState;

  // Simulação patrimonial dinâmica na Home a partir do CDI atual com tabela regressiva de IR
  const homeSimulation = useMemo(() => {
    const cdiAnnual = macro.cdi.rateAnnual || 13.65;
    const poupancaAnnual = 6.17;
    const ibovAnnual = 12.0;
    const initAmt = 5000;
    const monthlyAmt = 500;
    const months = 36;
    const monthlyCdi = Math.pow(1 + cdiAnnual / 100, 1 / 12) - 1;
    const monthlyPoup = Math.pow(1 + poupancaAnnual / 100, 1 / 12) - 1;
    const monthlyIbov = Math.pow(1 + ibovAnnual / 100, 1 / 12) - 1;

    let bCdi = initAmt;
    let bPoup = initAmt;
    let bIbov = initAmt;
    let totalDep = initAmt;

    for (let m = 1; m <= months; m++) {
      bCdi = (bCdi + monthlyAmt) * (1 + monthlyCdi);
      bPoup = (bPoup + monthlyAmt) * (1 + monthlyPoup);
      bIbov = (bIbov + monthlyAmt) * (1 + monthlyIbov);
      totalDep += monthlyAmt;
    }

    const cdiGross = Math.round(bCdi);
    const cdiProfit = Math.max(0, cdiGross - totalDep);
    // 36 meses = 1080 dias (> 720 dias) => 15% IR
    const cdiTax = Math.round(cdiProfit * 0.15);
    const cdiNet = cdiGross - cdiTax;

    return {
      cdiAnnual,
      totalDeposited: Math.round(totalDep),
      cdiGross,
      cdiNet,
      cdiTax,
      poupanca: Math.round(bPoup),
      ibovespa: Math.round(bIbov),
    };
  }, [macro.cdi.rateAnnual]);

  const previewLessons = useMemo(() => {
    return LEARN_TOPICS.slice(0, 3);
  }, []);

  const getLessonIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2':
        return <Building2 className="w-5 h-5 text-[#d4af6a]" />;
      case 'Percent':
        return <Percent className="w-5 h-5 text-[#d4af6a]" />;
      case 'Scale':
        return <Scale className="w-5 h-5 text-[#d4af6a]" />;
      default:
        return <GraduationCap className="w-5 h-5 text-[#d4af6a]" />;
    }
  };

  return (
    <div className="space-y-0">
      {/* 1. Hero Amplo com Busca Central e Atalhos de Categorias */}
      <Hero />

      {/* 2. Destaques Rápidos em Abas Estilo Investidor10 */}
      <MarketHighlightsTabs />

      {/* 3. Vitrine Visual das Ferramentas com Ilustrações Conceituais de Apoio */}
      <ToolsShowcaseSection />

      {/* 4. Prévia do Simulador de Investimentos (Cálculo Dinâmico do CDI e IR) */}
      <section className="py-20 sm:py-28 bg-[#0b0a09] border-b border-[#d4af6a]/15 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141210] border border-[#d4af6a]/25 text-xs font-mono font-semibold text-[#f0d9a8]">
                <Calculator className="w-3.5 h-3.5 text-[#d4af6a]" />
                <span>Simulador Patrimonial</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#f5efe6] tracking-tight leading-tight">
                A matemática do juro composto
              </h2>

              <p className="text-sm text-[#c2b9ac] leading-relaxed font-normal">
                Com o CDI referencial em <strong>{macro.cdi.rateAnnual !== null ? `${macro.cdi.rateAnnual.toFixed(2)}% ao ano` : (macro.cdi.statusText || 'Indisponível')}</strong>, compare a evolução do patrimônio com aportes regulares frente à Poupança e outros indicadores.
              </p>

              <div className="p-5 rounded-[12px] bg-[#141210] border border-[#d4af6a]/15 space-y-2.5 text-xs font-mono">
                <div className="flex justify-between items-center text-[#c2b9ac]">
                  <span>Aporte inicial R$ 5.000 + R$ 500/mês por 3 anos:</span>
                </div>
                <div className="flex justify-between items-center text-[#c2b9ac] pt-2 border-t border-[#d4af6a]/10">
                  <span>Poupança (6,17% a.a. - Isenta):</span>
                  <span className="font-semibold text-[#f5efe6]">{formatBRL(homeSimulation.poupanca, 0)}</span>
                </div>
                <div className="flex justify-between items-center text-[#d4af6a] font-bold">
                  <span>CDI 100% Líquido ({homeSimulation.cdiAnnual.toFixed(2)}% a.a.):</span>
                  <span className="text-sm">{formatBRL(homeSimulation.cdiNet, 0)} (descontado IR 15%)</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/simulador"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] hover:from-[#dfbc77] hover:to-[#fae6b8] text-[#0b0a09] font-semibold text-xs sm:text-sm shadow-[0_4px_16px_rgba(212,175,106,0.25)] transition-all cursor-pointer active:scale-95"
                >
                  <span>Abrir Simulador Completo com Gráfico</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="p-6 sm:p-8 rounded-[16px] bg-[#141210] border border-[#d4af6a]/20 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-xs uppercase font-mono text-[#c2b9ac] tracking-wider">
                      Descolamento da Curva
                    </span>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-[#f5efe6]">
                      Evolução de Patrimônio
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#d4af6a] bg-[#1c1916] px-2.5 py-1 rounded-full border border-[#d4af6a]/25 font-semibold">
                    {macro.cdi.rateAnnual !== null ? `CDI ${macro.cdi.rateAnnual.toFixed(2)}% a.a.` : (macro.cdi.statusText || 'CDI Indisponível')}
                  </span>
                </div>

                <div className="space-y-4 text-xs font-mono">
                  <div>
                    <div className="flex justify-between text-[#f5efe6] mb-1.5">
                      <span className="flex items-center gap-1.5 text-[#d4af6a] font-bold">
                        <span className="w-2 h-2 rounded-full bg-[#d4af6a]" /> 100% do CDI (Bruto {formatBRL(homeSimulation.cdiGross, 0)})
                      </span>
                      <span className="font-bold text-[#d4af6a]">{formatBRL(homeSimulation.cdiNet, 0)} (Líquido)</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#1c1916] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#b58d46] to-[#f0d9a8] rounded-full w-[95%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#f5efe6] mb-1.5">
                      <span className="flex items-center gap-1.5 text-[#3ddc97]">
                        <span className="w-2 h-2 rounded-full bg-[#3ddc97]" /> Ibovespa (Cenário Hipotético 12% a.a.)
                      </span>
                      <span className="font-bold text-[#f5efe6]">{formatBRL(homeSimulation.ibovespa, 0)}</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#1c1916] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#2ea872] to-[#3ddc97] rounded-full w-[100%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#c2b9ac] mb-1.5">
                      <span className="flex items-center gap-1.5 text-[#c2b9ac]">
                        <span className="w-2 h-2 rounded-full bg-[#6e675c]" /> Poupança Tradicional (6,17% a.a. - Isenta)
                      </span>
                      <span>{formatBRL(homeSimulation.poupanca, 0)}</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#1c1916] rounded-full overflow-hidden">
                      <div className="h-full bg-[#6e675c] rounded-full w-[80%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#8c8273] mb-1.5">
                      <span className="flex items-center gap-1.5 text-[#8c8273]">
                        <span className="w-2 h-2 rounded-full bg-[#3d3830]" /> Total Investido (Sem Juros)
                      </span>
                      <span>{formatBRL(homeSimulation.totalDeposited, 0)}</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#1c1916] rounded-full overflow-hidden">
                      <div className="h-full bg-[#3d3830] rounded-full w-[65%]" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#d4af6a]/10 flex items-center justify-between text-xs text-[#c2b9ac]">
                  <span>Projeção para 36 meses calculada pelo CDI atual com tabela regressiva de IR.</span>
                  <Link to="/simulador" className="text-[#d4af6a] hover:text-[#f0d9a8] font-semibold">
                    Simular outros valores →
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Mini-Aulas para Iniciantes */}
      <section className="py-20 sm:py-28 bg-[#141210]/40 border-b border-[#d4af6a]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#d4af6a] uppercase tracking-wider mb-2.5">
                <GraduationCap className="w-4 h-4" />
                Educação Financeira
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#f5efe6] tracking-tight">
                Mini-Aulas para Iniciantes
              </h2>
              <p className="text-sm text-[#c2b9ac] mt-2 max-w-xl font-normal leading-relaxed">
                Conteúdos diretos e objetivos para você dominar os conceitos fundamentais do mercado brasileiro com clareza.
              </p>
            </div>

            <Link
              to="/aprender"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#141210] hover:bg-[#1c1916] border border-[#d4af6a]/25 text-xs sm:text-sm font-semibold text-[#f0d9a8] transition-all shadow-sm shrink-0"
            >
              <span>Ver todas as 6 aulas</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {previewLessons.map((lesson) => (
              <Link
                key={lesson.id}
                to={`/aprender/${lesson.id}`}
                className="p-6 sm:p-7 rounded-[14px] bg-[#141210] border border-[#d4af6a]/15 hover:border-[#d4af6a]/40 hover:bg-[#1c1916] transition-all duration-200 shadow-md flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-[8px] bg-[#1c1916] border border-[#d4af6a]/15 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {getLessonIcon(lesson.iconName)}
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1c1916] text-[#c2b9ac] border border-[#d4af6a]/10">
                      {lesson.category}
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-bold text-[#f5efe6] group-hover:text-[#f0d9a8] transition-colors leading-snug">
                    {lesson.title}
                  </h3>

                  <p className="text-xs text-[#c2b9ac] mt-2.5 line-clamp-2 leading-relaxed font-normal">
                    {lesson.subtitle}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#d4af6a]/10 flex items-center justify-between text-xs text-[#8c8273]">
                  <div className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#c2b9ac]" />
                    <span className="text-[#c2b9ac]">{lesson.readTime}</span>
                  </div>
                  <span className="font-semibold text-[#d4af6a] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-mono">
                    Ler aula <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Bloco de Últimas Notícias (Feeds RSS Oficiais) */}
      <LatestNewsSection />

      {/* 7. Newsletter Capture */}
      <NewsletterCta />
    </div>
  );
};
