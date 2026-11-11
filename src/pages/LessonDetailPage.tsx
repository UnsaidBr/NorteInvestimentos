import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { NewsletterCta } from '../components/NewsletterCta';
import { LEARN_TOPICS } from '../data/learningContent';
import { useLessonProgress } from '../hooks/useLessonProgress';
import { LessonInteractiveTool } from '../components/LessonInteractiveTool';
import { LessonQuizWidget } from '../components/LessonQuizWidget';
import { LessonAudioPlayer } from '../components/LessonAudioPlayer';
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Award,
  Zap,
} from 'lucide-react';

export const LessonDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isLessonCompleted, toggleLessonCompleted } = useLessonProgress(LEARN_TOPICS.length);

  const currentIndex = LEARN_TOPICS.findIndex((t) => t.id === slug);
  const topic = LEARN_TOPICS[currentIndex];

  usePageMeta(
    topic ? `${topic.title} | Educação Financeira NorteInvest` : 'Aula Não Encontrada | NorteInvest',
    topic ? topic.subtitle : 'Aprenda sobre o mercado financeiro com a trilha educativa do NorteInvest.'
  );

  if (!topic) {
    return <Navigate to="/aprender" replace />;
  }

  const isCompleted = isLessonCompleted(topic.id);
  const prevTopic = currentIndex > 0 ? LEARN_TOPICS[currentIndex - 1] : null;
  const nextTopic =
    currentIndex < LEARN_TOPICS.length - 1 ? LEARN_TOPICS[currentIndex + 1] : null;

  return (
    <div className="bg-[#0b0a09] text-[#f5efe6] min-h-screen">
      <PageHeader
        badge={topic.category}
        badgeColor="gold"
        title={topic.title}
        subtitle={topic.subtitle}
        breadcrumbs={[
          { label: 'Aprender', href: '/aprender' },
          { label: topic.title },
        ]}
      >
        <div className="flex flex-wrap items-center gap-2.5 font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#141210] border border-[#d4af6a]/20 text-xs text-[#a39a8c]">
            <Clock className="w-3.5 h-3.5 text-[#d4af6a]" />
            <span>Leitura: {topic.readTime}</span>
          </div>

          <a
            href="#quiz-rapido"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#d4af6a]/15 hover:bg-[#d4af6a]/25 border border-[#d4af6a]/30 text-xs font-semibold text-[#f0d9a8] transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-[#d4af6a]" />
            <span>Quiz Rápido ({topic.quiz?.length || 3}Q)</span>
          </a>

          <button
            onClick={() => toggleLessonCompleted(topic.id)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] text-xs font-semibold transition-all cursor-pointer ${
              isCompleted
                ? 'bg-[#3ddc97]/20 border border-[#3ddc97]/40 text-[#3ddc97]'
                : 'bg-[#141210] hover:bg-[#1c1916] border border-[#d4af6a]/20 text-[#c2b9ac]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isCompleted ? 'Aula Concluída ✓' : 'Marcar como Concluída'}</span>
          </button>

          <Link
            to="/aprender"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] bg-[#141210] hover:bg-[#1c1916] text-xs font-semibold text-[#f5efe6] border border-[#d4af6a]/20 hover:border-[#d4af6a]/40 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Todas as Aulas</span>
          </Link>
        </div>
      </PageHeader>

      <article className="py-12 sm:py-20 bg-[#0b0a09]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Barra de Áudio Player e Recursos */}
          <div className="p-4 rounded-[14px] bg-[#141210] border border-[#d4af6a]/20 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <LessonAudioPlayer
              title={topic.title}
              intro={topic.content.intro}
              sections={topic.content.sections}
              summary={topic.content.summary}
            />

            <a
              href="#quiz-rapido"
              className="text-xs font-mono text-[#d4af6a] hover:text-[#f0d9a8] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Zap className="w-3 h-3" />
              <span>{topic.quiz?.length || 3} perguntas de Quiz Rápido ao final ↓</span>
            </a>
          </div>

          {/* Article Intro */}
          <div className="p-6 sm:p-8 rounded-[16px] bg-[#141210] border border-[#d4af6a]/15 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#d4af6a] uppercase tracking-wider mb-3">
              <BookOpen className="w-4 h-4" />
              <span>Visão Geral do Conceito</span>
            </div>
            <p className="text-base sm:text-lg text-[#f5efe6] leading-relaxed font-normal">
              {topic.content.intro}
            </p>
          </div>

          {/* Structured Sections */}
          <div className="space-y-8">
            {topic.content.sections.map((section, idx) => (
              <section
                key={idx}
                className="p-6 sm:p-8 rounded-[16px] bg-[#141210] border border-[#d4af6a]/15 space-y-4"
              >
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6] tracking-tight flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#1c1916] border border-[#d4af6a]/30 flex items-center justify-center font-mono text-xs font-bold text-[#d4af6a]">
                    {idx + 1}
                  </span>
                  <span>{section.heading}</span>
                </h2>

                <p className="text-sm sm:text-base text-[#a39a8c] leading-relaxed font-normal whitespace-pre-line">
                  {section.text}
                </p>

                {section.highlight && (
                  <div className="p-4 rounded-[10px] bg-[#1c1916] border-l-4 border-[#d4af6a] text-[#f5efe6] text-xs sm:text-sm font-medium leading-relaxed font-sans">
                    <strong className="text-[#f0d9a8] block mb-1 font-mono uppercase text-[10px] tracking-wider">
                      Ponto-chave para fixar:
                    </strong>
                    {section.highlight}
                  </div>
                )}

                {section.breakdown && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono">
                    {section.breakdown.map((item, bIdx) => (
                      <div
                        key={bIdx}
                        className="p-3.5 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/15 space-y-1.5"
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
              </section>
            ))}
          </div>

          {/* SIMULADOR PRÁTICO EMBUTIDO */}
          {topic.interactiveToolId && (
            <div>
              <LessonInteractiveTool toolId={topic.interactiveToolId} />
            </div>
          )}

          {/* Estudo de Caso Real do Mercado */}
          {topic.content.realCase && (
            <div className="p-6 sm:p-8 rounded-[16px] bg-gradient-to-r from-[#1c1916] via-[#141210] to-[#1a150c] border border-[#d4af6a]/30 space-y-3 font-mono">
              <div className="flex items-center gap-2 text-xs font-bold text-[#f0d9a8] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#d4af6a]" />
                <span>{topic.content.realCase.title}</span>
              </div>
              <p className="text-sm sm:text-base text-[#c2b9ac] font-sans leading-relaxed">
                {topic.content.realCase.description}
              </p>
              <div className="pt-2 border-t border-[#d4af6a]/20 text-xs text-[#d4af6a]">
                <strong>Lição prática do investidor:</strong> {topic.content.realCase.takeaway}
              </div>
            </div>
          )}

          {/* Key Takeaways Summary Card */}
          <div className="p-6 sm:p-8 rounded-[16px] bg-gradient-to-r from-[#d4af6a]/12 via-[#141210] to-[#d4af6a]/5 border border-[#d4af6a]/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#f0d9a8] uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-[#d4af6a]" />
              <span>Resumo & Conclusão</span>
            </div>
            <p className="text-sm sm:text-base text-[#f5efe6] leading-relaxed font-medium">
              {topic.content.summary}
            </p>
          </div>

          {/* QUIZ RÁPIDO AO FINAL DA MINI-AULA */}
          {topic.quiz && topic.quiz.length > 0 && (
            <section className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 font-mono">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#d4af6a] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#d4af6a]" />
                  <span>Avaliação Final da Mini-Aula</span>
                </div>
                <span className="text-[11px] text-[#8c8273]">
                  Feedback imediato e pontuação para consolidar o conhecimento
                </span>
              </div>

              <LessonQuizWidget
                quiz={topic.quiz}
                lessonId={topic.id}
                onComplete={() => {
                  if (!isCompleted) toggleLessonCompleted(topic.id);
                }}
              />
            </section>
          )}

          {/* Regulatory & Risk Caution Card */}
          <div className="p-5 sm:p-6 rounded-[14px] bg-[#141210] border border-[#d4af6a]/20 flex items-start gap-3.5 text-xs text-[#a39a8c]">
            <ShieldAlert className="w-5 h-5 text-[#d4af6a] shrink-0 mt-0.5" />
            <div className="space-y-1 font-sans">
              <strong className="text-[#f0d9a8] font-semibold block text-sm font-mono">
                Atenção ao risco financeiro:
              </strong>
              <p className="leading-relaxed">
                {topic.content.cautionNote} Conteúdo estritamente didático e informativo em conformidade com as diretrizes da CVM. Rentabilidade passada não representa garantia de retorno futuro.
              </p>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="pt-8 border-t border-[#d4af6a]/15 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevTopic ? (
              <Link
                to={`/aprender/${prevTopic.id}`}
                className="p-4 rounded-[12px] bg-[#141210] hover:bg-[#1c1916] border border-[#d4af6a]/15 hover:border-[#d4af6a]/40 transition-all flex flex-col justify-between group"
              >
                <span className="text-[10px] font-mono text-[#6e675c] uppercase tracking-wider mb-1">
                  ← Aula Anterior
                </span>
                <span className="text-sm font-serif font-bold text-[#f5efe6] group-hover:text-[#f0d9a8] transition-colors line-clamp-1">
                  {prevTopic.title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {nextTopic && (
              <Link
                to={`/aprender/${nextTopic.id}`}
                className="p-4 rounded-[12px] bg-[#141210] hover:bg-[#1c1916] border border-[#d4af6a]/15 hover:border-[#d4af6a]/40 transition-all flex flex-col justify-between text-right group"
              >
                <span className="text-[10px] font-mono text-[#6e675c] uppercase tracking-wider mb-1">
                  Próxima Aula →
                </span>
                <span className="text-sm font-serif font-bold text-[#f5efe6] group-hover:text-[#f0d9a8] transition-colors line-clamp-1">
                  {nextTopic.title}
                </span>
              </Link>
            )}
          </div>

        </div>
      </article>

      <NewsletterCta
        title="Deseja receber novos estudos como este semanalmente?"
        subtitle="Inscreva-se gratuitamente e receba nossos briefings sobre Tesouro Direto, Fundos Imobiliários e análise de balanços da B3."
      />
    </div>
  );
};
