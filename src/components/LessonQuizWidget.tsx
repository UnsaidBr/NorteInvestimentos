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
  TrendingUp,
} from 'lucide-react';
import { LessonQuizQuestion } from '../types/market';

interface LessonQuizWidgetProps {
  quiz: LessonQuizQuestion[];
  onComplete?: () => void;
  lessonId: string;
}

export const LessonQuizWidget: React.FC<LessonQuizWidgetProps> = ({
  quiz,
  onComplete,
  lessonId,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  if (!quiz || quiz.length === 0) return null;

  const currentQ = quiz[currentQuestionIndex];
  const selectedOption = selectedAnswers[currentQuestionIndex];
  const hasAnswered = selectedOption !== undefined;
  const isCorrect = hasAnswered && selectedOption === currentQ.correctIndex;

  // Cálculo de pontuação (100 pontos base total)
  const pointsPerQuestion = Math.round(100 / quiz.length);
  const totalCorrect = Object.entries(selectedAnswers).filter(
    ([qIdx, ansIdx]) => quiz[Number(qIdx)]?.correctIndex === ansIdx
  ).length;

  // Pontuação acumulada até o momento
  const currentEarnedPoints = Object.entries(selectedAnswers).reduce((acc, [qIdx, ansIdx]) => {
    return quiz[Number(qIdx)]?.correctIndex === ansIdx ? acc + pointsPerQuestion : acc;
  }, 0);

  const finalScore = Math.min(100, totalCorrect * pointsPerQuestion);
  const percentage = Math.round((totalCorrect / quiz.length) * 100);

  const handleSelectOption = (optionIndex: number) => {
    if (hasAnswered) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      if (onComplete) onComplete();
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setIsCompleted(false);
  };

  return (
    <div
      id="quiz-rapido"
      className="rounded-[18px] bg-gradient-to-b from-[#141210] to-[#0f0e0c] border border-[#d4af6a]/30 p-6 sm:p-8 shadow-2xl space-y-6 font-mono relative overflow-hidden"
    >
      {/* Glow decorativo de fundo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af6a]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header do Quiz Rápido */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#d4af6a]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#d4af6a]/15 border border-[#d4af6a]/40 flex items-center justify-center text-[#f0d9a8] shadow-sm">
            <Zap className="w-5 h-5 text-[#d4af6a]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#d4af6a]/20 border border-[#d4af6a]/30 text-[10px] font-bold text-[#f0d9a8] uppercase tracking-wider">
                Quiz Rápido
              </span>
              <span className="text-[11px] text-[#8c8273]">Fixação & Avaliação</span>
            </div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#f5efe6] mt-0.5">
              Teste seu Conhecimento
            </h3>
          </div>
        </div>

        {/* Indicador de Pontuação e Progresso */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {!isCompleted && (
            <div className="px-3.5 py-1.5 rounded-[8px] bg-[#1c1916] border border-[#d4af6a]/25 flex items-center gap-2 text-xs">
              <span className="text-[#8c8273]">Pontuação:</span>
              <span className="font-bold text-[#d4af6a]">
                {currentEarnedPoints} <span className="text-[10px] text-[#6e675c]">/ 100 pts</span>
              </span>
            </div>
          )}

          <div className="px-3 py-1.5 rounded-[8px] bg-[#1c1916] border border-[#d4af6a]/20 text-xs font-bold text-[#f0d9a8]">
            {isCompleted ? 'Resultado Final' : `Q${currentQuestionIndex + 1} de ${quiz.length}`}
          </div>
        </div>
      </div>

      {!isCompleted ? (
        <div className="space-y-5">
          {/* Barra de Progresso do Quiz */}
          <div className="w-full h-1.5 rounded-full bg-[#1c1916] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#d4af6a] to-[#3ddc97] transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / quiz.length) * 100}%`,
              }}
            />
          </div>

          {/* Pergunta */}
          <div className="p-4 rounded-[12px] bg-[#1a1714] border border-[#d4af6a]/15">
            <span className="text-[10px] font-bold text-[#d4af6a] uppercase tracking-wider block mb-1.5">
              Pergunta {currentQuestionIndex + 1}:
            </span>
            <h4 className="text-sm sm:text-base font-serif font-bold text-[#f5efe6] leading-relaxed">
              {currentQ.question}
            </h4>
          </div>

          {/* Opções de Resposta */}
          <div className="space-y-2.5">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = selectedOption === optIdx;
              const isRightAnswer = optIdx === currentQ.correctIndex;

              let buttonStyle =
                'bg-[#181512] border-[#d4af6a]/20 text-[#c2b9ac] hover:border-[#d4af6a]/50 hover:bg-[#1f1b17] hover:text-[#f5efe6]';
              let badgeStyle = 'border-[#d4af6a]/30 text-[#d4af6a] bg-[#141210]';

              if (hasAnswered) {
                if (isRightAnswer) {
                  buttonStyle =
                    'bg-[#3ddc97]/15 border-[#3ddc97] text-[#3ddc97] font-semibold ring-1 ring-[#3ddc97]/30';
                  badgeStyle = 'border-[#3ddc97] text-[#3ddc97] bg-[#3ddc97]/20';
                } else if (isSelected) {
                  buttonStyle =
                    'bg-[#ff5c6c]/15 border-[#ff5c6c] text-[#ff5c6c] ring-1 ring-[#ff5c6c]/30';
                  badgeStyle = 'border-[#ff5c6c] text-[#ff5c6c] bg-[#ff5c6c]/20';
                } else {
                  buttonStyle = 'bg-[#141210] border-white/5 text-[#6e675c] opacity-40';
                  badgeStyle = 'border-white/10 text-[#6e675c] bg-[#141210]';
                }
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  disabled={hasAnswered}
                  className={`w-full p-4 rounded-[12px] border text-left flex items-start gap-3.5 text-xs sm:text-sm transition-all cursor-pointer disabled:cursor-default ${buttonStyle}`}
                >
                  <span
                    className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold font-mono mt-0.5 ${badgeStyle}`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="flex-1 font-sans leading-relaxed">{option}</span>

                  {hasAnswered && isRightAnswer && (
                    <div className="flex items-center gap-1.5 shrink-0 text-[#3ddc97] text-xs font-bold font-mono">
                      <span>+{pointsPerQuestion} pts</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                  {hasAnswered && isSelected && !isRightAnswer && (
                    <div className="flex items-center gap-1.5 shrink-0 text-[#ff5c6c] text-xs font-bold font-mono">
                      <span>0 pts</span>
                      <XCircle className="w-4 h-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback Explicativo Imediato */}
          {hasAnswered && (
            <div
              className={`p-4 sm:p-5 rounded-[12px] border text-xs sm:text-sm leading-relaxed space-y-2 animate-fade-in ${
                isCorrect
                  ? 'bg-[#3ddc97]/10 border-[#3ddc97]/40 text-[#f5efe6]'
                  : 'bg-[#ff5c6c]/10 border-[#ff5c6c]/40 text-[#f5efe6]'
              }`}
            >
              <div className="flex items-center justify-between font-bold font-mono">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#3ddc97]" />
                      <span className="text-[#3ddc97]">Resposta Correta! (+{pointsPerQuestion} pts)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-[#ff5c6c]" />
                      <span className="text-[#ff5c6c]">Resposta Incorreta (0 pts)</span>
                    </>
                  )}
                </div>

                <span className="text-[11px] font-mono opacity-80">
                  {isCorrect ? 'Excelente raciocínio!' : 'Aprenda com a explicação:'}
                </span>
              </div>

              <div className="p-3 rounded-[8px] bg-[#0b0a09]/70 border border-white/5 font-sans text-xs text-[#c2b9ac] leading-relaxed">
                <strong className="text-[#f5efe6] font-mono text-[11px] block mb-1">
                  Explicação do Conceito:
                </strong>
                {currentQ.explanation}
              </div>
            </div>
          )}

          {/* Botão de Avanço do Quiz */}
          {hasAnswered && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#8c8273] font-sans">
                {currentQuestionIndex < quiz.length - 1
                  ? 'Avance para a próxima pergunta'
                  : 'Você respondeu todas as perguntas!'}
              </span>

              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[8px] bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] hover:from-[#dfbc77] hover:to-[#fae6b8] text-[#0b0a09] font-bold text-xs shadow-lg transition-all cursor-pointer"
              >
                <span>
                  {currentQuestionIndex < quiz.length - 1
                    ? 'Próxima Questão'
                    : 'Finalizar Quiz & Ver Pontuação'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Tela de Pontuação Final do Quiz Rápido */
        <div className="py-8 px-4 text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-[#d4af6a]/20 to-[#3ddc97]/20 border-2 border-[#d4af6a]/50 flex items-center justify-center text-[#f0d9a8] shadow-lg">
            <Award className="w-8 h-8 text-[#d4af6a]" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-mono font-bold text-[#d4af6a] uppercase tracking-wider">
              Quiz Rápido Finalizado
            </span>
            <h4 className="font-serif font-bold text-2xl text-[#f5efe6]">
              Pontuação: {finalScore} / 100 pontos
            </h4>
            <p className="text-xs text-[#a39a8c] font-sans">
              Você acertou <strong className="text-[#3ddc97]">{totalCorrect}</strong> de{' '}
              <strong className="text-[#f5efe6]">{quiz.length}</strong> perguntas ({percentage}% de aproveitamento)
            </p>
          </div>

          {/* Feedback de Desempenho */}
          <div className="max-w-md mx-auto p-4 rounded-[12px] bg-[#1c1916] border border-[#d4af6a]/25 text-xs text-[#f5efe6] font-sans leading-relaxed">
            {finalScore >= 90 ? (
              <div className="flex items-center justify-center gap-2 text-[#3ddc97] font-bold">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Excelente! Você dominou todos os conceitos desta aula com maestria.</span>
              </div>
            ) : finalScore >= 60 ? (
              <div className="flex items-center justify-center gap-2 text-[#f0d9a8] font-medium">
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span>Bom trabalho! Você compreendeu a estrutura essencial do conteúdo.</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-[#c2b9ac]">
                <HelpCircle className="w-4 h-4 text-[#d4af6a] shrink-0" />
                <span>Vale a pena revisar a aula e refazer o teste para fixar 100% dos fundamentos.</span>
              </div>
            )}
          </div>

          {/* Resumo visual por pergunta */}
          <div className="max-w-md mx-auto grid grid-cols-3 gap-2 text-[11px] font-mono">
            {quiz.map((q, idx) => {
              const isQCorrect = selectedAnswers[idx] === q.correctIndex;
              return (
                <div
                  key={idx}
                  className={`p-2 rounded-[8px] border flex items-center justify-center gap-1.5 ${
                    isQCorrect
                      ? 'bg-[#3ddc97]/10 border-[#3ddc97]/30 text-[#3ddc97]'
                      : 'bg-[#ff5c6c]/10 border-[#ff5c6c]/30 text-[#ff5c6c]'
                  }`}
                >
                  {isQCorrect ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Questão {idx + 1}</span>
                </div>
              );
            })}
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-[#1c1916] hover:bg-[#24201c] border border-[#d4af6a]/30 text-[#f5efe6] hover:text-[#f0d9a8] text-xs font-semibold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#d4af6a]" />
              <span>Refazer Quiz Rápido</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

