import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { StockItem } from '../types/market';
import { getStockAiExplanation, AiExplanationResponse } from '../services/geminiService';
import { formatBRL, formatPercent } from '../utils/formatters';
import {
  Sparkles,
  X,
  Check,
  Copy,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { LEGAL_DISCLAIMER } from '../constants/config';

interface AiExplainerModalProps {
  stock: StockItem | null;
  onClose: () => void;
}

export const AiExplainerModal: React.FC<AiExplainerModalProps> = ({ stock, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AiExplanationResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const [displayedWords, setDisplayedWords] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const fullTextRef = useRef<string>('');

  useEffect(() => {
    if (!stock) return;
    setLoading(true);
    setData(null);
    setDisplayedWords([]);
    setIsTyping(false);

    getStockAiExplanation(stock).then((res) => {
      setData(res);
      setLoading(false);
      fullTextRef.current = res.explanation;

      const words = res.explanation.split(' ');
      let currentIdx = 0;
      setIsTyping(true);

      const interval = setInterval(() => {
        currentIdx += 2;
        setDisplayedWords(words.slice(0, currentIdx));

        if (currentIdx >= words.length) {
          clearInterval(interval);
          setDisplayedWords(words);
          setIsTyping(false);
        }
      }, 35);

      return () => clearInterval(interval);
    });
  }, [stock]);

  if (!stock) return null;

  const isUp = stock.changePercent >= 0;

  const handleSkipTyping = () => {
    if (fullTextRef.current) {
      setDisplayedWords(fullTextRef.current.split(' '));
      setIsTyping(false);
    }
  };

  const handleCopy = () => {
    if (data?.explanation) {
      navigator.clipboard.writeText(
        `[NorteInvest IA - Síntese do Pregão]\nAtivo: ${stock.ticker} (${stock.name})\nVariação: ${formatPercent(stock.changePercent)}\n\n${data.explanation}\n\nAviso Legal: ${LEGAL_DISCLAIMER}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative w-full max-w-2xl bg-[#141210] border border-[#d4af6a]/25 rounded-[16px] shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#d4af6a]/15 bg-[#1c1916]/80">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-[10px] bg-gradient-to-tr from-[#d4af6a] via-[#f0d9a8] to-[#b58d46] p-[1.5px] shadow-[0_4px_16px_rgba(212,175,106,0.25)]">
                <div className="w-full h-full rounded-[8.5px] bg-[#141210] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#d4af6a] animate-pulse" />
                </div>
              </div>
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af6a] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4af6a]" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#d4af6a]/15 text-[#f0d9a8] border border-[#d4af6a]/30">
                  NorteInvest IA • Síntese de Mercado
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#f5efe6] tracking-tight mt-1">
                Por que {stock.ticker} {isUp ? 'subiu' : 'caiu'} hoje?
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-[8px] bg-[#141210] hover:bg-[#1c1916] text-[#a39a8c] hover:text-[#f5efe6] border border-[#d4af6a]/15 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stock Snapshot Banner */}
        <div className="px-5 sm:px-6 py-3.5 bg-[#141210] border-b border-[#d4af6a]/15 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-mono tabular-nums font-bold text-lg text-[#f5efe6]">
              {stock.ticker}
            </span>
            <span className="text-xs text-[#a39a8c] truncate max-w-[200px]">
              {stock.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono tabular-nums font-bold text-[#f5efe6] text-sm">
              {formatBRL(stock.price)}
            </span>
            <span
              className={`inline-flex items-center gap-1 font-mono tabular-nums text-xs font-bold px-2.5 py-1 rounded-full ${
                isUp
                  ? 'text-[#3ddc97] bg-[#3ddc97]/10 border border-[#3ddc97]/25'
                  : 'text-[#ff5c6c] bg-[#ff5c6c]/10 border border-[#ff5c6c]/25'
              }`}
            >
              <span>{isUp ? '▲' : '▼'}</span>
              <span>{formatPercent(stock.changePercent, false)}</span>
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-5 overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center space-y-4">
              <div className="flex items-center justify-center gap-2 py-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d4af6a] animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#f0d9a8] animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#b58d46] animate-bounce" />
              </div>
              <p className="text-sm font-serif font-semibold text-[#f5efe6] tracking-wide">
                Cruzando variáveis macroeconômicas, commodities e setor com IA...
              </p>
              <p className="text-xs text-[#a39a8c] max-w-sm mx-auto font-normal">
                Mapeando as forças que impulsionaram ou pressionaram o ativo no pregão da B3.
              </p>
            </div>
          ) : (
            <>
              {/* AI Answer Card */}
              <div className="rounded-[14px] bg-[#1c1916] border border-[#d4af6a]/30 shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden">
                <div className="p-5 pb-3 border-b border-[#d4af6a]/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[6px] bg-gradient-to-tr from-[#d4af6a] to-[#f0d9a8] flex items-center justify-center shadow-md">
                      <Sparkles className="w-4 h-4 text-[#0b0a09]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-serif font-bold text-[#f5efe6] tracking-tight">
                        Síntese Inteligente do Pregão
                      </h4>
                      <span className="text-[10px] font-mono text-[#d4af6a]">
                        Linguagem Clara • Sem Jargões
                      </span>
                    </div>
                  </div>

                  {isTyping && (
                    <button
                      onClick={handleSkipTyping}
                      className="text-[11px] font-mono text-[#a39a8c] hover:text-[#f0d9a8] transition-colors cursor-pointer"
                    >
                      Exibir tudo →
                    </button>
                  )}
                </div>

                <div className="p-5 sm:p-6 text-sm sm:text-base text-[#f5efe6] leading-relaxed font-normal whitespace-pre-line min-h-[120px]">
                  {displayedWords.join(' ')}
                  {isTyping && (
                    <span className="inline-block w-1.5 h-4 ml-1.5 bg-[#d4af6a] animate-pulse rounded-sm align-middle" />
                  )}
                </div>

                <div className="px-5 py-3.5 bg-[#141210]/60 border-t border-[#d4af6a]/10 flex items-start gap-2.5 text-[11px] text-[#a39a8c]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#d4af6a] shrink-0 mt-0.5" />
                  <span className="leading-snug">
                    <strong className="text-[#f0d9a8] font-medium">Aviso Regulatório:</strong> As análises da IA são sínteses educacionais baseadas em dados públicos de mercado e não constituem recomendação de investimento. {LEGAL_DISCLAIMER}
                  </span>
                </div>
              </div>

              {/* Drivers Box */}
              <div className="p-4 rounded-[12px] bg-[#1c1916]/80 border border-[#d4af6a]/15 space-y-2 text-xs">
                <div className="font-semibold text-[#f5efe6] flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#d4af6a]" />
                  <span>O que costuma mover ações desse segmento na B3?</span>
                </div>
                <ul className="text-[#a39a8c] space-y-1.5 list-disc list-inside">
                  <li>Decisões sobre a taxa de juros básica (Selic) e dados de inflação (IPCA).</li>
                  <li>Cotação internacional de commodities de referência (petróleo Brent, minério de ferro).</li>
                  <li>Divulgação de balanços corporativos trimestrais e fluxo de capital estrangeiro.</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:p-5 bg-[#1c1916]/80 border-t border-[#d4af6a]/15 flex items-center justify-between">
          <button
            onClick={handleCopy}
            disabled={loading || !data}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#141210] hover:bg-[#1c1916] text-xs font-medium text-[#a39a8c] hover:text-[#f0d9a8] border border-[#d4af6a]/15 transition-colors disabled:opacity-40 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#3ddc97]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar Resumo'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-[8px] bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] hover:from-[#dfbc77] hover:to-[#fae6b8] text-[#0b0a09] font-semibold text-xs shadow-[0_4px_16px_rgba(212,175,106,0.25)] transition-all cursor-pointer"
          >
            Entendido
          </button>
        </div>

      </motion.div>
    </div>
  );
};
