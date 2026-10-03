import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { NewsletterCta } from '../components/NewsletterCta';
import { LEARN_TOPICS } from '../data/learningContent';
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

export const LessonDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const currentIndex = LEARN_TOPICS.findIndex((t) => t.id === slug);
  const topic = LEARN_TOPICS[currentIndex];

  usePageMeta(
    topic ? `${topic.title} | Educação Financeira NorteInvest` : 'Aula Não Encontrada | NorteInvest',
    topic ? topic.subtitle : 'Aprenda sobre o mercado financeiro com a trilha educativa do NorteInvest.'
  );

  if (!topic) {
    return <Navigate to="/aprender" replace />;
  }

  const prevTopic = currentIndex > 0 ? LEARN_TOPICS[currentIndex - 1] : null;
  const nextTopic =
    currentIndex < LEARN_TOPICS.length - 1 ? LEARN_TOPICS[currentIndex + 1] : null;

  return (
    <div>
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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#141210] border border-[#d4af6a]/20 text-xs font-mono text-[#a39a8c]">
            <Clock className="w-3.5 h-3.5 text-[#d4af6a]" />
            <span>Leitura: {topic.readTime}</span>
          </div>

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
                  <div className="p-4 rounded-[10px] bg-[#1c1916] border-l-4 border-[#d4af6a] text-[#f5efe6] text-xs sm:text-sm font-medium leading-relaxed">
                    <strong className="text-[#f0d9a8] block mb-1 font-mono uppercase text-[10px] tracking-wider">
                      Ponto-chave para fixar:
                    </strong>
                    {section.highlight}
                  </div>
                )}
              </section>
            ))}
          </div>

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

          {/* Regulatory & Risk Caution Card */}
          <div className="p-5 sm:p-6 rounded-[14px] bg-[#141210] border border-[#d4af6a]/20 flex items-start gap-3.5 text-xs text-[#a39a8c]">
            <ShieldAlert className="w-5 h-5 text-[#d4af6a] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-[#f0d9a8] font-semibold block text-sm">
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
