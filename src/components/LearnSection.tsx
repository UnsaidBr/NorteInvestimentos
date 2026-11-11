import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LEARN_TOPICS } from '../data/learningContent';
import { LearnTopic } from '../types/market';
import { useLessonProgress } from '../hooks/useLessonProgress';
import { LessonInteractiveTool } from './LessonInteractiveTool';
import { LessonQuizWidget } from './LessonQuizWidget';
import { LessonAudioPlayer } from './LessonAudioPlayer';
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
  Sparkles,
  Award,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const LearnSection: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<LearnTopic | null>(null);
  const { completedLessons, isLessonCompleted, toggleLessonCompleted, progressPercent, completedCount } =
    useLessonProgress(LEARN_TOPICS.length);

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
        return <Building2 className="w-5 h-5 text-[#d4af6a]" />;
      case 'Percent':
        return <Percent className="w-5 h-5 text-[#3ddc97]" />;
      case 'Coins':
        return <Coins className="w-5 h-5 text-amber-400" />;
      case 'Scale':
        return <Scale className="w-5 h-5 text-cyan-400" />;
      case 'PieChart':
        return <PieChart className="w-5 h-5 text-purple-400" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-5 h-5 text-[#ff5c6c]" />;
      default:
        return <BookOpen className="w-5 h-5 text-[#d4af6a]" />;
    }
  };

  return (
    <section id="aprender" className="py-16 sm:py-24 bg-[#0b0a09] border-t border-[#d4af6a]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header com Barra de Progresso do Usuário */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#d4af6a] uppercase tracking-wider mb-2.5">
              <GraduationCap className="w-4 h-4" />
              Educação Financeira Interativa NorteInvest
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#f5efe6] tracking-tight">
              Mini-Aulas Práticas com Simuladores
            </h2>
            <p className="text-sm text-[#a39a8c] mt-2 max-w-xl font-normal leading-relaxed">
              Aprenda a investir no mercado brasileiro sem economês: cada aula conta com simuladores práticos, estudos de caso reais e desafios de fixação.
            </p>
          </div>

          {/* Card de Progresso da Trilha */}
          <div className="p-4 rounded-[14px] bg-[#141210] border border-[#d4af6a]/20 min-w-[260px] font-mono shadow-md">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#8c8273]">Seu Progresso na Trilha</span>
              <span className="text-[#f0d9a8] font-bold">
                {completedCount} de {LEARN_TOPICS.length} concluídas
              </span>
            </div>
            <div className="h-2 w-full bg-[#1c1916] rounded-full overflow-hidden">
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-[#d4af6a] to-[#3ddc97] rounded-full transition-all duration-500"
              />
            </div>
            <span className="text-[10px] text-[#8c8273] block mt-1.5 text-right">
              {progressPercent}% completado
            </span>
          </div>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LEARN_TOPICS.map((topic) => {
            const isCompleted = isLessonCompleted(topic.id);

            return (
              <div
                key={topic.id}
                onClick={() => setSelectedTopic(topic)}
                className={`p-6 sm:p-7 rounded-[16px] bg-[#141210] border transition-all duration-200 shadow-md group cursor-pointer flex flex-col justify-between ${
                  isCompleted
                    ? 'border-[#3ddc97]/40 hover:border-[#3ddc97] hover:bg-[#141812]'
                    : 'border-[#d4af6a]/15 hover:border-[#d4af6a]/40 hover:bg-[#1c1916]'
                }`}
              >
                <div>
                  {/* Card Top: Icon & Category & Time */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-11 h-11 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-150">
                      {getTopicIcon(topic.iconName)}
                    </div>

                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#3ddc97] bg-[#3ddc97]/15 px-2 py-0.5 rounded-[4px] border border-[#3ddc97]/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Concluída
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-[#a39a8c] bg-[#1c1916] px-2 py-0.5 rounded-[4px] border border-[#d4af6a]/15">
                        {topic.category}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-[#8c8273] font-mono">
                        <Clock className="w-3 h-3" />
                        {topic.readTime}
                      </span>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#f5efe6] group-hover:text-[#f0d9a8] transition-colors mb-2 leading-snug">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-[#a39a8c] leading-relaxed line-clamp-3 font-normal">
                    {topic.subtitle}
                  </p>

                  {/* Tags Interativas: Simulador + Quiz */}
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-[#d4af6a]/10 text-[11px] font-mono">
                    <span className="inline-flex items-center gap-1 text-[#d4af6a]">
                      <Sparkles className="w-3 h-3" />
                      Simulador Interativo
                    </span>
                    <span className="text-[#8c8273]">·</span>
                    <span className="inline-flex items-center gap-1 text-[#3ddc97]">
                      <HelpCircle className="w-3 h-3" />
                      Quiz de Fixação
                    </span>
                  </div>
                </div>

                {/* Card Footer Button */}
                <div className="pt-4 mt-4 border-t border-[#d4af6a]/10 flex items-center justify-between text-xs font-mono font-semibold text-[#d4af6a] group-hover:text-[#f0d9a8] transition-colors">
                  <span>{isCompleted ? 'Revisar aula interativa' : 'Iniciar mini-aula'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Link para Trilha Completa */}
        <div className="mt-12 text-center">
          <Link
            to="/aprender"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] bg-[#141210] hover:bg-[#1c1916] border border-[#d4af6a]/30 text-xs font-mono font-bold text-[#f0d9a8] hover:text-white transition-all shadow-md group cursor-pointer"
          >
            <span>Explorar Todas as Aulas e Casos Reais da Trilha</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>

      {/* Mini-lesson Reader Modal Interativo */}
      {selectedTopic && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedTopic(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-[#141210] border border-[#d4af6a]/30 rounded-[18px] shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[92vh] font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-[#d4af6a]/15 bg-gradient-to-r from-[#1c1916] to-[#141210]">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-[10px] bg-[#141210] border border-[#d4af6a]/20 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                  {getTopicIcon(selectedTopic.iconName)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[11px] font-mono font-medium text-[#d4af6a] bg-[#d4af6a]/10 px-2 py-0.5 rounded-[4px] border border-[#d4af6a]/25">
                      {selectedTopic.category}
                    </span>
                    <span className="text-[11px] text-[#8c8273] font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedTopic.readTime}
                    </span>
                    {isLessonCompleted(selectedTopic.id) && (
                      <span className="text-[10px] font-mono text-[#3ddc97] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Concluída
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-[#f5efe6] tracking-tight">
                    {selectedTopic.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="p-2 rounded-[8px] bg-[#1c1916] hover:bg-[#24201c] text-[#8c8273] hover:text-[#f5efe6] transition-colors cursor-pointer"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-7 overflow-y-auto space-y-7 text-sm">
              
              {/* Barra de Recursos: Áudio Player & Conclusão */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-[12px] bg-[#1c1916] border border-[#d4af6a]/15">
                <LessonAudioPlayer
                  title={selectedTopic.title}
                  intro={selectedTopic.content.intro}
                  sections={selectedTopic.content.sections}
                  summary={selectedTopic.content.summary}
                />

                <button
                  onClick={() => toggleLessonCompleted(selectedTopic.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-mono font-semibold transition-all cursor-pointer ${
                    isLessonCompleted(selectedTopic.id)
                      ? 'bg-[#3ddc97]/20 border border-[#3ddc97]/40 text-[#3ddc97]'
                      : 'bg-[#141210] hover:bg-[#24201c] border border-[#d4af6a]/20 text-[#c2b9ac]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {isLessonCompleted(selectedTopic.id) ? 'Concluída ✓' : 'Marcar como Concluída'}
                  </span>
                </button>
              </div>

              {/* Intro Callout */}
              <div className="p-5 rounded-[14px] bg-[#1c1916] border border-[#d4af6a]/20 text-[#f5efe6] leading-relaxed text-sm font-medium">
                {selectedTopic.content.intro}
              </div>

              {/* Lesson Sections with Structured Breakdown */}
              <div className="space-y-6">
                {selectedTopic.content.sections.map((section, idx) => (
                  <div key={idx} className="space-y-3">
                    <h4 className="text-base sm:text-lg font-serif font-bold text-[#f5efe6] flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#1c1916] border border-[#d4af6a]/30 flex items-center justify-center font-mono text-xs font-bold text-[#d4af6a]">
                        {idx + 1}
                      </span>
                      <span>{section.heading}</span>
                    </h4>

                    <p className="text-[#a39a8c] leading-relaxed text-sm whitespace-pre-line font-normal">
                      {section.text}
                    </p>

                    {section.highlight && (
                      <div className="p-3.5 rounded-[10px] bg-[#d4af6a]/10 border-l-4 border-[#d4af6a] text-xs sm:text-sm text-[#f0d9a8] font-medium leading-relaxed">
                        💡 <strong>Ponto-chave:</strong> {section.highlight}
                      </div>
                    )}

                    {section.breakdown && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {section.breakdown.map((item, bIdx) => (
                          <div
                            key={bIdx}
                            className="p-3 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/15 space-y-1 font-mono"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-[#f5efe6]">
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#d4af6a]/15 text-[#f0d9a8] font-bold">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#8c8273] font-sans leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* FERRAMENTA INTERATIVA EMBUTIDA (Simulador Prático da Aula) */}
              {selectedTopic.interactiveToolId && (
                <div className="pt-2">
                  <LessonInteractiveTool toolId={selectedTopic.interactiveToolId} />
                </div>
              )}

              {/* Estudo de Caso Real do Mercado */}
              {selectedTopic.content.realCase && (
                <div className="p-5 rounded-[14px] bg-gradient-to-r from-[#1c1916] via-[#141210] to-[#1a150c] border border-[#d4af6a]/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#f0d9a8] uppercase">
                    <Sparkles className="w-4 h-4 text-[#d4af6a]" />
                    <span>{selectedTopic.content.realCase.title}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#c2b9ac] leading-relaxed">
                    {selectedTopic.content.realCase.description}
                  </p>
                  <div className="pt-2 border-t border-[#d4af6a]/15 text-xs font-mono text-[#d4af6a]">
                    <strong>Lição prática:</strong> {selectedTopic.content.realCase.takeaway}
                  </div>
                </div>
              )}

              {/* Summary Box */}
              <div className="p-4 rounded-[12px] bg-[#1c1916] border border-[#d4af6a]/20 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#3ddc97] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#f5efe6] text-xs block uppercase font-mono tracking-wider mb-1">
                    Em Resumo
                  </strong>
                  <p className="text-[#a39a8c] text-xs leading-relaxed font-normal">
                    {selectedTopic.content.summary}
                  </p>
                </div>
              </div>

              {/* DESAFIO DE FIXAÇÃO: QUIZ RÁPIDO */}
              {selectedTopic.quiz && selectedTopic.quiz.length > 0 && (
                <div className="pt-2">
                  <LessonQuizWidget
                    quiz={selectedTopic.quiz}
                    lessonId={selectedTopic.id}
                    onComplete={() => {
                      if (!isLessonCompleted(selectedTopic.id)) {
                        toggleLessonCompleted(selectedTopic.id);
                      }
                    }}
                  />
                </div>
              )}

              {/* Caution Box */}
              <div className="p-3.5 rounded-[12px] bg-amber-500/5 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-200">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 block mb-0.5 font-mono uppercase text-[10px]">
                    Atenção ao risco:
                  </strong>
                  {selectedTopic.content.cautionNote}
                </div>
              </div>

              {/* Caution Box */}
              <div className="p-3.5 rounded-[12px] bg-amber-500/5 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-200">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 block mb-0.5 font-mono uppercase text-[10px]">
                    Atenção ao risco:
                  </strong>
                  {selectedTopic.content.cautionNote}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-[#1c1916] border-t border-[#d4af6a]/15 flex items-center justify-between font-mono">
              <span className="text-[11px] text-[#8c8273]">
                NorteInvest • Conteúdo puramente educativo
              </span>
              <button
                onClick={() => {
                  if (!isLessonCompleted(selectedTopic.id)) {
                    toggleLessonCompleted(selectedTopic.id);
                  }
                  setSelectedTopic(null);
                }}
                className="px-5 py-2 rounded-[8px] bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] hover:from-[#dfbc77] hover:to-[#fae6b8] text-[#0b0a09] font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Concluir Mini-Aula
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
