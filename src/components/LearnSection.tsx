import React, { useState, useEffect } from 'react';
import { LEARN_TOPICS } from '../data/learningContent';
import { LearnTopic } from '../types/market';
import {
  GraduationCap,
  Clock,
  BookOpen,
  ArrowRight,
  X,
  Building2,
  Percent,
  Coins,
  Scale,
  PieChart,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

export const LearnSection: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<LearnTopic | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedTopic(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getTopicIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2':
        return <Building2 className="w-5 h-5 text-[#818cf8]" />;
      case 'Percent':
        return <Percent className="w-5 h-5 text-[var(--color-gain)]" />;
      case 'Coins':
        return <Coins className="w-5 h-5 text-amber-400" />;
      case 'Scale':
        return <Scale className="w-5 h-5 text-cyan-400" />;
      case 'PieChart':
        return <PieChart className="w-5 h-5 text-purple-400" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-5 h-5 text-[var(--color-loss)]" />;
      default:
        return <BookOpen className="w-5 h-5 text-[#818cf8]" />;
    }
  };

  return (
    <section id="aprender" className="py-16 sm:py-24 bg-[var(--bg-app)] border-t border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-10 sm:mb-14">
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-purple-400 uppercase tracking-wider mb-2.5">
            <GraduationCap className="w-4 h-4" />
            Educação Financeira NorteInvest
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Guia Rápido para Iniciantes
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-xl font-normal leading-relaxed">
            Mini-aulas práticas e diretas ao ponto para você dominar os conceitos fundamentais do mercado brasileiro sem termos difíceis.
          </p>
        </div>

        {/* 6 Cards Grid (16px radius) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {LEARN_TOPICS.map((topic) => (
            <div
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className="p-6 rounded-[16px] bg-[var(--surface-1)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-2)]/60 transition-all duration-150 shadow-[0_4px_20px_rgba(0,0,0,0.3)] group cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Icon & Category & Time */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="w-10 h-10 rounded-[10px] bg-[var(--surface-2)] border border-[var(--border-subtle)] flex items-center justify-center group-hover:scale-105 transition-transform duration-150">
                    {getTopicIcon(topic.iconName)}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-medium text-[var(--text-secondary)] bg-[var(--surface-2)] px-2 py-0.5 rounded-[6px] border border-[var(--border-subtle)]">
                      {topic.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-mono">
                      <Clock className="w-3 h-3" />
                      {topic.readTime}
                    </span>
                  </div>
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-base font-bold text-white group-hover:text-[#a5b4fc] transition-colors mb-2 leading-snug">
                  {topic.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3 font-normal">
                  {topic.subtitle}
                </p>
              </div>

              {/* Card Footer Button */}
              <div className="pt-4 mt-5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-semibold text-[#818cf8] group-hover:text-white transition-colors">
                <span>Abrir mini-aula</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Mini-lesson Reader Modal */}
      {selectedTopic && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedTopic(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-[var(--border-subtle)] bg-[var(--surface-2)]/60">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-[10px] bg-[var(--surface-3)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 mt-0.5">
                  {getTopicIcon(selectedTopic.iconName)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono font-medium text-[#818cf8] bg-[#4f46e5]/10 px-2 py-0.5 rounded-[6px] border border-[#4f46e5]/20">
                      {selectedTopic.category}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedTopic.readTime} de leitura
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {selectedTopic.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedTopic(null)}
                className="p-2 rounded-[8px] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-sm">
              
              {/* Intro Callout */}
              <div className="p-4 rounded-[12px] bg-[var(--surface-2)] border border-[var(--border-subtle)] text-[var(--text-primary)] leading-relaxed text-sm font-medium">
                {selectedTopic.content.intro}
              </div>

              {/* Lesson Sections */}
              <div className="space-y-5">
                {selectedTopic.content.sections.map((section, idx) => (
                  <div key={idx} className="space-y-2">
                    <h4 className="text-base font-bold text-white">
                      {section.heading}
                    </h4>
                    <p className="text-[var(--text-secondary)] leading-relaxed text-sm whitespace-pre-line font-normal">
                      {section.text}
                    </p>
                    {section.highlight && (
                      <div className="p-3.5 rounded-[10px] bg-[#4f46e5]/10 border-l-2 border-[#4f46e5] text-xs text-[#c7d2fe] font-medium">
                        💡 <strong>Dica prática:</strong> {section.highlight}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary Box */}
              <div className="p-4 rounded-[12px] bg-[var(--surface-2)]/60 border border-[var(--border-subtle)] flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[var(--color-gain)] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white text-xs block uppercase font-mono tracking-wider mb-1">
                    Em Resumo
                  </strong>
                  <p className="text-[var(--text-secondary)] text-xs leading-relaxed font-normal">
                    {selectedTopic.content.summary}
                  </p>
                </div>
              </div>

              {/* Caution Box */}
              <div className="p-3.5 rounded-[12px] bg-amber-500/5 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-200">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 block mb-0.5">Atenção ao risco:</strong>
                  {selectedTopic.content.cautionNote}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-[var(--surface-2)]/60 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <span className="text-[11px] text-[var(--text-muted)] font-mono">
                NorteInvest • Conteúdo puramente educacional
              </span>
              <button
                onClick={() => setSelectedTopic(null)}
                className="px-5 py-2 rounded-[10px] bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold text-xs shadow-md shadow-[#4f46e5]/20 transition-colors cursor-pointer"
              >
                Concluir mini-aula
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
