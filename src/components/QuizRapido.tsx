import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Award,
  Zap,
  Target,
  Trophy,
  BookOpen,
} from 'lucide-react';
import { LessonQuizQuestion } from '../types/market';

export interface QuizRapidoProps {
  quiz: LessonQuizQuestion[];
  lessonId: string;
  lessonTitle?: string;
  onComplete?: (score: number, maxScore: number) => void;
  nextLessonHref?: string;
  isLessonCompleted?: boolean;
  onToggleComplete?: () => void;
}

export const QuizRapido: React.FC<QuizRapidoProps> = ({
  quiz,
  lessonId,
  lessonTitle,
  onComplete,
  nextLessonHref,
  isLessonCompleted,
  onToggleComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showReview, setShowReview] = useState(false);

  if (!quiz || quiz.length === 0) return null;

  const currentQ = quiz[currentIndex];
  const selectedOption = selectedAnswers[currentIndex];
  const hasAnswered = selectedOption !== undefined;
  const isCorrect = hasAnswered && selectedOption === currentQ.correctIndex;

  // Pontuação: 100 pontos por acerto
  const pointsPerQuestion = 100;
  const totalQuestions = quiz.length;
  const maxScore = totalQuestions * pointsPerQuestion;

  const correctCount = Object.entries(selectedAnswers).filter(
    ([qIdx, ansIdx]) => quiz[Number(qIdx)]?.correctIndex === ansIdx
  ).length;

  const currentScore = correctCount * pointsPerQuestion;
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

  const handleSelectOption = (optionIndex: number) => {
    if (hasAnswered) return;
    const newAnswers = {
      ...selectedAnswers,
      [currentIndex]: optionIndex,
    };
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      const finalCorrect = Object.entries(selectedAnswers).filter(
        ([qIdx, ansIdx]) => quiz[Number(qIdx)]?.correctIndex === ansIdx
      ).length;
      const finalScore = finalCorrect * pointsPerQuestion;
      if (onComplete) {
        onComplete(finalScore, maxScore);
      }
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsCompleted(false);
    setShowReview(false);
  };

  return (
    <div
      id="quiz-rapido"
      className="rounded-[18px] bg-[#141210] border border-[#d4af6a]/30 p-5 sm:p-8 shadow-2xl space-y-6 font-mono transition-all"
    >
      {/* Header do Quiz Rápido */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#d4af6a]/15">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#d4af6a]/25 to-[#f0d9a8]/10 border border-[#d4af6a]/40 flex items-center justify-center text-[#f0d9a8] shrink-0 shadow-inner">
            <Zap className="w-5 h-5 text-[#d4af6a]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-[#d4af6a]/20 text-[#f0d9a8] border border-[#d4af6a]/30">
                Quiz Rápido
              </span>
              <span className="text-[11px] text-[#8c8273]">Feedback Imediato</span>
            </div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#f5efe6] mt-0.5">
              Teste seu Conhecimento
            </h3>
          </div>
        </div>

        {/* Indicadores de Pontuação e Progresso em tempo real */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1 rounded-[8px] bg-[#1c1916] border border-[#d4af6a]/20 text-xs flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-[#d4af6a]" />
            <span className="text-[#a39a8c]">Pontos:</span>
            <span className="text-[#f0d9a8] font-bold">
              {currentScore}/{maxScore}
            </span>
          </div>

          {!isCompleted && (
            <div className="px-3 py-1 rounded-[8px] bg-[#1c1916] border border-[#d4af6a]/20 text-xs text-[#a39a8c]">
              Questão <span className="text-[#f5efe6] font-bold">{currentIndex + 1}</span>/{totalQuestions}
            </div>
          )}
        </div>
      </div>

      {/* Barra de Progresso do Quiz */}
      {!isCompleted && (
        <div className="w-full bg-[#1c1916] h-1.5 rounded-full overflow-hidden border border-[#d4af6a]/10">
          <div
            className="bg-gradient-to-r from-[#d4af6a] to-[#3ddc97] h-full transition-all duration-300"
            style={{ width: `${((currentIndex + (hasAnswered ? 1 : 0)) / totalQuestions) * 100}%` }}
          />
        </div>
      )}

      {/* Estado Ativo: Respondendo Questão */}
      {!isCompleted ? (
        <div className="space-y-5 animate-fade-in">
          {/* Enunciado da Pergunta */}
          <div className="space-y-1">
            <span className="text-[11px] text-[#8c8273] uppercase tracking-wider">
              Questão {currentIndex + 1} de {totalQuestions}
            </span>
            <h4 className="text-base sm:text-lg font-serif font-bold text-[#f5efe6] leading-snug">
              {currentQ.question}
            </h4>
          </div>

          {/* Opções de Resposta */}
          <div className="space-y-2.5 pt-1">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = selectedOption === optIdx;
              const isRightAnswer = optIdx === currentQ.correctIndex;

              let buttonStyle =
                'bg-[#1c1916] border-[#d4af6a]/15 text-[#c2b9ac] hover:border-[#d4af6a]/40 hover:text-[#f5efe6] hover:bg-[#221e1a]';

              if (hasAnswered) {
                if (isRightAnswer) {
                  buttonStyle =
                    'bg-[#3ddc97]/15 border-[#3ddc97] text-[#3ddc97] font-semibold shadow-[0_0_15px_rgba(61,220,151,0.15)]';
                } else if (isSelected) {
                  buttonStyle =
                    'bg-[#ff5c6c]/15 border-[#ff5c6c] text-[#ff5c6c]';
                } else {
                  buttonStyle =
                    'bg-[#141210] border-white/5 text-[#8c8273] opacity-30 cursor-not-allowed';
                }
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  disabled={hasAnswered}
                  className={`w-full p-4 rounded-[12px] border text-left flex items-start justify-between gap-3 text-xs sm:text-sm transition-all cursor-pointer disabled:cursor-default ${buttonStyle}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold font-mono mt-0.5 ${
                        hasAnswered && isRightAnswer
                          ? 'border-[#3ddc97] bg-[#3ddc97]/20 text-[#3ddc97]'
                          : hasAnswered && isSelected
                          ? 'border-[#ff5c6c] bg-[#ff5c6c]/20 text-[#ff5c6c]'
                          : 'border-current text-[#a39a8c]'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="font-sans leading-relaxed pt-0.5">{option}</span>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 ml-2 mt-0.5">
                    {hasAnswered && isRightAnswer && (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-[#3ddc97] bg-[#3ddc97]/20 px-2 py-0.5 rounded-[6px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Correta (+100 pts)
                      </span>
                    )}
                    {hasAnswered && isSelected && !isRightAnswer && (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-[#ff5c6c] bg-[#ff5c6c]/20 px-2 py-0.5 rounded-[6px] font-bold">
                        <XCircle className="w-3.5 h-3.5" />
                        Incorreta
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback Explicativo Imediato */}
          {hasAnswered && (
            <div
              className={`p-4 sm:p-5 rounded-[12px] border leading-relaxed space-y-2 animate-fade-in ${
                isCorrect
                  ? 'bg-gradient-to-r from-[#3ddc97]/15 to-[#3ddc97]/5 border-[#3ddc97]/40 text-[#f5efe6]'
                  : 'bg-gradient-to-r from-[#ff5c6c]/15 to-[#ff5c6c]/5 border-[#ff5c6c]/40 text-[#f5efe6]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold font-mono text-xs">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#3ddc97]" />
                      <span className="text-[#3ddc97]">Resposta Certa! Excelente raciocínio.</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-[#ff5c6c]" />
                      <span className="text-[#ff5c6c]">Ops, resposta incorreta! Veja a explicação:</span>
                    </>
                  )}
                </div>
                <span className="text-[10px] font-mono text-[#a39a8c] uppercase tracking-wider">
                  Feedback Explicativo
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#e0d6c8] font-sans">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Botão de Avançar */}
          {hasAnswered && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#8c8273]">
                {currentIndex < totalQuestions - 1
                  ? 'Pressione para ir à próxima pergunta'
                  : 'Finalize o quiz para ver seu resultado completo'}
              </span>
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] hover:from-[#dfbc77] hover:to-[#fae6b8] text-[#0b0a09] font-bold text-xs shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-95"
              >
                <span>
                  {currentIndex < totalQuestions - 1 ? 'Próxima Questão' : 'Ver Pontuação Final'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Tela de Conclusão e Pontuação Final */
        <div className="py-4 space-y-6 animate-fade-in">
          {/* Card Central de Resultado */}
          <div className="p-6 sm:p-8 rounded-[16px] bg-gradient-to-b from-[#1c1916] to-[#141210] border border-[#d4af6a]/30 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#d4af6a]/30 to-[#f0d9a8]/10 border border-[#d4af6a]/50 flex items-center justify-center text-[#f0d9a8] shadow-lg">
              {scorePercentage >= 80 ? (
                <Trophy className="w-8 h-8 text-[#d4af6a]" />
              ) : scorePercentage >= 50 ? (
                <Award className="w-8 h-8 text-[#f0d9a8]" />
              ) : (
                <BookOpen className="w-8 h-8 text-[#a39a8c]" />
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-[#d4af6a] font-bold">
                Resultado do Quiz Rápido
              </span>
              <h4 className="font-serif font-bold text-2xl text-[#f5efe6]">
                {scorePercentage === 100
                  ? 'Desempenho Impecável!'
                  : scorePercentage >= 60
                  ? 'Muito Bom Trabalho!'
                  : 'Bom Esforço de Fixação!'}
              </h4>
              <p className="text-xs text-[#a39a8c] font-sans max-w-md mx-auto">
                {scorePercentage === 100
                  ? 'Você acertou todas as questões e demonstrou domínio completo dos conceitos práticos desta mini-aula.'
                  : scorePercentage >= 60
                  ? 'Você compreendeu os principais fundamentos econômicos e estratégicos abordados na aula.'
                  : 'Recomendamos uma rápida releitura dos pontos-chave para consolidar o conhecimento.'}
              </p>
            </div>

            {/* Placar de Pontos e Porcentagem */}
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto pt-2">
              <div className="p-3 rounded-[10px] bg-[#141210] border border-[#d4af6a]/20">
                <span className="block text-[10px] text-[#8c8273] uppercase">Pontuação</span>
                <strong className="text-lg text-[#f0d9a8]">{currentScore}</strong>
                <span className="text-[10px] text-[#8c8273]"> / {maxScore}</span>
              </div>
              <div className="p-3 rounded-[10px] bg-[#141210] border border-[#d4af6a]/20">
                <span className="block text-[10px] text-[#8c8273] uppercase">Acertos</span>
                <strong className="text-lg text-[#3ddc97]">
                  {correctCount}/{totalQuestions}
                </strong>
                <span className="text-[10px] text-[#8c8273]"> questões</span>
              </div>
              <div className="p-3 rounded-[10px] bg-[#141210] border border-[#d4af6a]/20">
                <span className="block text-[10px] text-[#8c8273] uppercase">Aproveitamento</span>
                <strong className="text-lg text-[#f5efe6]">{scorePercentage}%</strong>
                <span className="text-[10px] text-[#8c8273]"> de acerto</span>
              </div>
            </div>
          </div>

          {/* Botão para Exibir/Ocultar Revisão Detalhada */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => setShowReview(!showReview)}
              className="text-xs text-[#d4af6a] hover:text-[#f0d9a8] underline underline-offset-4 cursor-pointer transition-colors"
            >
              {showReview ? 'Ocultar revisão das questões ▲' : 'Ver gabarito e explicação detalhada de todas as questões ▼'}
            </button>
          </div>

          {/* Gabarito Detalhado das Questões */}
          {showReview && (
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-[#d4af6a] uppercase tracking-wider mb-2">
                Revisão do Gabarito:
              </div>
              {quiz.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const wasCorrect = userAns === q.correctIndex;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-[12px] bg-[#1c1916] border border-[#d4af6a]/15 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-serif font-bold text-[#f5efe6] text-sm">
                        {idx + 1}. {q.question}
                      </span>
                      {wasCorrect ? (
                        <span className="shrink-0 flex items-center gap-1 text-[#3ddc97] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Acertou (+100)
                        </span>
                      ) : (
                        <span className="shrink-0 flex items-center gap-1 text-[#ff5c6c] font-bold">
                          <XCircle className="w-3.5 h-3.5" /> Errou
                        </span>
                      )}
                    </div>
                    <p className="text-[#a39a8c] font-sans">
                      <strong className="text-[#3ddc97]">Resposta Correta:</strong> {q.options[q.correctIndex]}
                    </p>
                    <p className="text-[11px] text-[#8c8273] font-sans pt-1 border-t border-[#d4af6a]/10">
                      <strong>Explicação:</strong> {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ações Finais: Refazer ou Avançar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#d4af6a]/15">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-[#1c1916] hover:bg-[#24201c] border border-[#d4af6a]/20 text-[#c2b9ac] hover:text-[#f5efe6] text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#d4af6a]" />
              <span>Refazer Quiz Rápido</span>
            </button>

            <div className="flex items-center gap-2">
              {onToggleComplete && (
                <button
                  onClick={onToggleComplete}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] text-xs font-semibold transition-all cursor-pointer ${
                    isLessonCompleted
                      ? 'bg-[#3ddc97]/20 border border-[#3ddc97]/40 text-[#3ddc97]'
                      : 'bg-[#1c1916] hover:bg-[#24201c] border border-[#d4af6a]/20 text-[#f5efe6]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isLessonCompleted ? 'Aula Concluída ✓' : 'Marcar Aula como Concluída'}</span>
                </button>
              )}

              {nextLessonHref && (
                <a
                  href={nextLessonHref}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] hover:from-[#dfbc77] hover:to-[#fae6b8] text-[#0b0a09] font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <span>Próxima Aula</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
