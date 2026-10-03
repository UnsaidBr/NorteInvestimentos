import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Activity, Cpu, BookOpenCheck, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const AiExplainerSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Varredura Multimercado a Cada 60 Segundos',
      icon: <Activity className="w-5 h-5 text-[#38bdf8]" />,
      badge: 'B3 • SGS Bacen • Câmbio',
      iconBg: 'from-[#38bdf8]/20 to-[#4f46e5]/20 border-[#38bdf8]/40',
      description:
        'Nossa infraestrutura monitora sem parar o livro de cotações da B3, o valor internacional de commodities (petróleo Brent, minério de ferro), o câmbio do Dólar e as taxas do Banco Central.',
    },
    {
      number: '02',
      title: 'Correlação de Variáveis por IA',
      icon: <Cpu className="w-5 h-5 text-[#c084fc]" />,
      badge: 'LLM • Inteligência Artificial',
      iconBg: 'from-[#a855f7]/20 to-[#ec4899]/20 border-[#a855f7]/40',
      description:
        'Algoritmos de inteligência artificial cruzam a variação da ação com notícias corporativas, balanços trimestrais e apetite de capital estrangeiro para mapear os vetores do pregão.',
    },
    {
      number: '03',
      title: 'Síntese Acessível sem Jargões',
      icon: <BookOpenCheck className="w-5 h-5 text-[#10d9a0]" />,
      badge: 'Linguagem Clara • Regulação CVM',
      iconBg: 'from-[#10d9a0]/20 to-teal-500/20 border-[#10d9a0]/40',
      description:
        'Em segundos, relatórios densos são sintetizados em português direto e didático. Sem termos difíceis, com 100% de foco educativo e em total conformidade com a regulamentação.',
    },
  ];

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 bg-[var(--bg-app)] border-t border-[var(--border-subtle)]">
      {/* Subtle purple-emerald ambient glow behind the section */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#a855f7]/10 via-[#4f46e5]/10 to-[#10d9a0]/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface-1)] border border-[#a855f7]/30 text-xs font-mono font-medium text-[#d8b4fe] mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#c084fc]" />
            <span>Tecnologia Exclusiva • Inteligência Artificial B3</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Como a IA do NorteInvest{' '}
            <span className="bg-gradient-to-r from-[#c084fc] via-[#818cf8] to-[#10d9a0] bg-clip-text text-transparent">
              funciona na prática
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-3 leading-relaxed font-normal">
            Eliminamos a barreira do "economês". Entenda como transformamos oscilações bruscas da bolsa brasileira em explicações didáticas e instantâneas para qualquer pessoa.
          </p>
        </div>

        {/* 3 Illustrated Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative p-6 sm:p-7 rounded-[16px] bg-[var(--surface-1)] border border-[var(--border-subtle)] hover:border-[#a855f7]/40 hover:bg-[var(--surface-2)]/60 transition-all duration-200 shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex flex-col justify-between group"
            >
              <div>
                {/* Step Header with Step Number & Badge */}
                <div className="flex items-center justify-between mb-5">
                  <div
                    className={`w-12 h-12 rounded-[14px] bg-gradient-to-tr ${step.iconBg} border flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200`}
                  >
                    {step.icon}
                  </div>
                  <span className="font-mono text-2xl font-black text-white/20 group-hover:text-white/40 transition-colors">
                    {step.number}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border-subtle)] mb-2">
                    {step.badge}
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-[#d8b4fe] transition-colors">
                    {step.title}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-normal mt-2">
                  {step.description}
                </p>
              </div>

              {/* Step indicator highlight line at bottom */}
              <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center gap-1.5 text-xs font-semibold text-[#818cf8]">
                <span>Etapa {step.number}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Interactive CTA Banner */}
        <div className="p-6 sm:p-8 rounded-[16px] bg-gradient-to-r from-[#141b29] via-[var(--surface-1)] to-[#141b29] border border-[#a855f7]/30 shadow-[0_12px_36px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[12px] bg-gradient-to-tr from-[#4f46e5] to-[#a855f7] flex items-center justify-center shrink-0 shadow-lg shadow-[#a855f7]/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Experimente a IA agora mesmo
              </h4>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5 font-normal">
                Clique no botão <strong>✨ Explicar com IA</strong> ao lado de qualquer ação do painel da B3 para ver uma análise didática instantânea.
              </p>
            </div>
          </div>

          <a
            href="#mercado"
            className="px-6 py-3 rounded-[12px] bg-gradient-to-r from-[#4f46e5] to-[#a855f7] hover:from-[#4338ca] hover:to-[#9333ea] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#4f46e5]/30 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Explorar Ações da B3</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </a>
        </div>

      </div>
    </section>
  );
};
