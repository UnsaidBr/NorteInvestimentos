import React from 'react';
import { Link } from 'react-router-dom';
import {
  SlidersHorizontal,
  Building2,
  Calculator,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Percent,
  Layers,
} from 'lucide-react';

// Imagens conceituais geradas para apoio visual ao entendimento
const VALUATION_IMAGE = '/src/assets/images/visual_fundamental_valuation_1794077709482.jpg';
const FIIS_IMAGE = '/src/assets/images/visual_real_estate_fiis_1794077710563.jpg';
const WEALTH_IMAGE = '/src/assets/images/visual_compound_wealth_1794077710510.jpg';
const AI_IMAGE = '/src/assets/images/visual_market_intelligence_1794077710316.jpg';

export const ToolsShowcaseSection: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-[#141210]/40 border-b border-[#d4af6a]/15 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#d4af6a]/5 blur-[160px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141210] border border-[#d4af6a]/25 text-xs font-mono font-semibold text-[#f0d9a8]">
            <Layers className="w-3.5 h-3.5 text-[#d4af6a]" />
            <span>Ferramentas Analíticas & Didáticas</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#f5efe6] tracking-tight">
            Valuation, Imóveis e Simulações sem Caixas-Pretas
          </h2>

          <p className="text-sm sm:text-base text-[#c2b9ac] font-normal leading-relaxed">
            Metodologias clássicas de investimentos traduzidas com clareza visual, dados da B3 e premissas abertas para você tomar decisões conscientes.
          </p>
        </div>

        {/* Bento Grid de Ferramentas com Imagens Conceituais */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Card 1: Rastreador Fundamentalista (Destaque Grande - 7 Colunas) */}
          <div className="lg:col-span-7 rounded-[20px] bg-[#141210] border border-[#d4af6a]/20 overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between group hover:border-[#d4af6a]/45 transition-all duration-300">
            <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[#0b0a09]">
              <img
                src={VALUATION_IMAGE}
                alt="Valuation Fundamentalista e Fórmulas de Benjamin Graham e Décio Bazin"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/40 to-transparent" />
              
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0b0a09]/80 backdrop-blur-md border border-[#d4af6a]/30 text-xs font-mono font-semibold text-[#f0d9a8]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#d4af6a]" />
                <span>Rastreador de Ações</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <h3 className="text-2xl font-serif font-bold text-[#f5efe6] group-hover:text-[#f0d9a8] transition-colors">
                Fórmulas de Graham, Bazin e Greenblatt
              </h3>
              
              <p className="text-sm text-[#c2b9ac] leading-relaxed font-normal">
                Descubra o <strong>Preço Justo de Graham</strong> (com margem de segurança) e o <strong>Preço Teto de Décio Bazin</strong> (para yield mínimo de 6%) com a fórmula aberta e os números reais substituídos passo a passo.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono text-[#d4af6a]">
                <span className="px-2.5 py-1 rounded bg-[#1c1916] border border-[#d4af6a]/15">
                  V = √(22,5 × LPA × VPA)
                </span>
                <span className="px-2.5 py-1 rounded bg-[#1c1916] border border-[#d4af6a]/15">
                  Preço Teto = DPA / 0,06
                </span>
                <span className="px-2.5 py-1 rounded bg-[#1c1916] border border-[#d4af6a]/15">
                  Fórmula Mágica (ROE + P/L)
                </span>
              </div>

              <div className="pt-3">
                <Link
                  to="/radar"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] text-[#0b0a09] font-semibold text-xs sm:text-sm shadow-md hover:from-[#dfbc77] hover:to-[#fae6b8] transition-all"
                >
                  <span>Explorar o Rastreador Fundamentalista</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Painel de Fundos Imobiliários (5 Colunas) */}
          <div className="lg:col-span-5 rounded-[20px] bg-[#141210] border border-[#d4af6a]/20 overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between group hover:border-[#d4af6a]/45 transition-all duration-300">
            <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[#0b0a09]">
              <img
                src={FIIS_IMAGE}
                alt="Fundos Imobiliários e Galpões Logísticos da B3"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/40 to-transparent" />

              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0b0a09]/80 backdrop-blur-md border border-[#d4af6a]/30 text-xs font-mono font-semibold text-[#f0d9a8]">
                <Building2 className="w-3.5 h-3.5 text-[#d4af6a]" />
                <span>Painel de FIIs</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <h3 className="text-2xl font-serif font-bold text-[#f5efe6] group-hover:text-[#f0d9a8] transition-colors">
                Radar de Fundos Imobiliários
              </h3>
              
              <p className="text-sm text-[#c2b9ac] leading-relaxed font-normal">
                Segmentação completa por <strong>Tijolo (Logística, Shoppings, Lajes)</strong>, <strong>Papel (CRIs)</strong> e <strong>FoFs</strong>. Acompanhe a vacância física, financeira e a média do IFIX.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono text-[#d4af6a]">
                <span className="px-2.5 py-1 rounded bg-[#1c1916] border border-[#d4af6a]/15">
                  Vacância Física & Financeira
                </span>
                <span className="px-2.5 py-1 rounded bg-[#1c1916] border border-[#d4af6a]/15">
                  P/VP & Yield 12m
                </span>
              </div>

              <div className="pt-3">
                <Link
                  to="/fiis"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#1c1916] hover:bg-[#24201c] border border-[#d4af6a]/30 text-[#f0d9a8] font-semibold text-xs sm:text-sm transition-all"
                >
                  <span>Acessar Painel de FIIs</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3: Simulador Patrimonial Dinâmico (5 Colunas) */}
          <div className="lg:col-span-5 rounded-[20px] bg-[#141210] border border-[#d4af6a]/20 overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between group hover:border-[#d4af6a]/45 transition-all duration-300">
            <div className="relative h-60 sm:h-64 w-full overflow-hidden bg-[#0b0a09]">
              <img
                src={WEALTH_IMAGE}
                alt="Simulador de Juros Compostos e Crescimento Patrimonial"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/40 to-transparent" />

              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0b0a09]/80 backdrop-blur-md border border-[#d4af6a]/30 text-xs font-mono font-semibold text-[#f0d9a8]">
                <Calculator className="w-3.5 h-3.5 text-[#d4af6a]" />
                <span>Simulador de Rendimento</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6] group-hover:text-[#f0d9a8] transition-colors">
                Matemática dos Juros & Tabela de IR
              </h3>
              
              <p className="text-sm text-[#c2b9ac] leading-relaxed font-normal">
                Calcule a evolução dos seus aportes mensais a partir da taxa <strong>CDI real</strong>, aplicando as alíquotas regressivas de Imposto de Renda (22,5% a 15%) com gráficos comparativos contra a Poupança.
              </p>

              <div className="pt-2">
                <Link
                  to="/simulador"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#1c1916] hover:bg-[#24201c] border border-[#d4af6a]/30 text-[#f0d9a8] font-semibold text-xs sm:text-sm transition-all"
                >
                  <span>Abrir Simulador Completo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 4: Síntese de Inteligência Artificial Explicativa (7 Colunas) */}
          <div className="lg:col-span-7 rounded-[20px] bg-[#141210] border border-[#d4af6a]/20 overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between group hover:border-[#d4af6a]/45 transition-all duration-300">
            <div className="relative h-60 sm:h-64 w-full overflow-hidden bg-[#0b0a09]">
              <img
                src={AI_IMAGE}
                alt="Inteligência Artificial Explicativa de Mercado"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/40 to-transparent" />

              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0b0a09]/80 backdrop-blur-md border border-[#d4af6a]/30 text-xs font-mono font-semibold text-[#f0d9a8]">
                <Sparkles className="w-3.5 h-3.5 text-[#d4af6a]" />
                <span>Síntese Algorítmica</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6] group-hover:text-[#f0d9a8] transition-colors">
                Entenda o que Move o Mercado em Segundos
              </h3>
              
              <p className="text-sm text-[#c2b9ac] leading-relaxed font-normal">
                Nossa IA sintetiza relatórios, commodities e dados macroeconômicos do Banco Central para formular hipóteses educativas em linguagem simples, sem jargões desnecessários e sem recomendações financeiras.
              </p>

              <div className="pt-2">
                <Link
                  to="/ia"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#1c1916] hover:bg-[#24201c] border border-[#d4af6a]/30 text-[#f0d9a8] font-semibold text-xs sm:text-sm transition-all"
                >
                  <span>Conhecer a Tecnologia Educativa</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
