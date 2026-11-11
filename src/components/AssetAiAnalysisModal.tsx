import React, { useState, useEffect } from 'react';
import { PortfolioPosition } from '../types/portfolio';
import { AssetLogo } from './AssetLogo';
import { formatBRL, formatPercent, getFriendlyCompanyName } from '../utils/formatters';
import {
  Sparkles,
  X,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Copy,
  Check,
  ShieldAlert,
  Landmark,
  Coins,
  Compass,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface AssetAiAnalysisData {
  ticker: string;
  name: string;
  category: string;
  overview: string;
  keyDrivers: string[];
  macroContext: string;
  valuationAndDividends: string;
  riskNotice: string;
  disclaimer: string;
  isFallback: boolean;
  available: boolean;
  generatedAt: string;
  model?: string;
  cached?: boolean;
}

interface AssetAiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: PortfolioPosition | null;
  currentPrice: number;
  annualDividend?: number;
}

export const AssetAiAnalysisModal: React.FC<AssetAiAnalysisModalProps> = ({
  isOpen,
  onClose,
  position,
  currentPrice,
  annualDividend = 0,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AssetAiAnalysisData | null>(null);
  const [copied, setCopied] = useState(false);

  // Fecha no ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Carrega análise ao abrir o modal para o ativo
  useEffect(() => {
    if (!isOpen || !position) {
      setAnalysis(null);
      setError(null);
      return;
    }

    fetchAnalysis(false);
  }, [isOpen, position?.id]);

  const fetchAnalysis = async (forceRefresh = false) => {
    if (!position) return;
    setLoading(true);
    setError(null);

    const totalCost = position.quantity * position.averagePrice;
    const currentValue = position.quantity * currentPrice;
    const gainLossBrl = currentValue - totalCost;
    const gainLossPercent = totalCost > 0 ? (gainLossBrl / totalCost) * 100 : 0;
    const estimatedDy =
      currentPrice > 0 && annualDividend > 0
        ? (annualDividend / currentPrice) * 100
        : position.averagePrice > 0 && annualDividend > 0
        ? (annualDividend / position.averagePrice) * 100
        : 0;

    try {
      const res = await fetch('/api/gemini/analyze-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: position.ticker,
          name: position.name,
          category: position.category,
          currentPrice,
          averagePrice: position.averagePrice,
          quantity: position.quantity,
          gainLossPercent,
          dividendYield: estimatedDy,
          forceRefresh,
        }),
      });

      if (!res.ok) {
        throw new Error(`Erro na requisição: HTTP ${res.status}`);
      }

      const data = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      console.error('Falha ao obter análise Gemini do ativo:', err);
      setError(
        'Não foi possível conectar ao serviço de inteligência artificial no momento. Tente novamente em instantes.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysis || !position) return;
    const textToCopy = `[NorteInvest AI] Análise Automatizada: ${position.ticker} (${position.name})
Cotação: ${formatBRL(currentPrice)} | Preço Médio: ${formatBRL(position.averagePrice)}

VISÃO GERAL:
${analysis.overview}

CATALISADORES RECENTES:
${analysis.keyDrivers.map((d, i) => `${i + 1}. ${d}`).join('\n')}

CENÁRIO MACRO:
${analysis.macroContext}

VALUATION & PROVENTOS:
${analysis.valuationAndDividends}

ATENÇÃO AO RISCO:
${analysis.riskNotice}

${analysis.disclaimer}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen || !position) return null;

  const totalCost = position.quantity * position.averagePrice;
  const currentValue = position.quantity * currentPrice;
  const gainLossBrl = currentValue - totalCost;
  const gainLossPercent = totalCost > 0 ? (gainLossBrl / totalCost) * 100 : 0;
  const isProfit = gainLossBrl >= 0;

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'acao':
        return 'Ação B3';
      case 'fii':
        return 'Fundo Imobiliário';
      case 'renda_fixa':
        return 'Renda Fixa';
      case 'cripto':
        return 'Criptoativo';
      default:
        return 'Ativo';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#141210] border border-[#d4af6a]/30 rounded-[18px] shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[92vh] font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow decorativo */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#d4af6a]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-[#d4af6a]/15 bg-gradient-to-r from-[#1c1916] via-[#141210] to-[#1a1610] shrink-0">
          <div className="flex items-start gap-3.5">
            <AssetLogo ticker={position.ticker} name={position.name} size="md" />
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-mono font-bold text-[#f0d9a8]">
                  {position.ticker}
                </span>
                <span className="text-[10px] font-mono font-semibold text-[#d4af6a] bg-[#d4af6a]/15 px-2 py-0.5 rounded-[4px] border border-[#d4af6a]/25">
                  {getCategoryLabel(position.category)}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#3ddc97] bg-[#3ddc97]/15 px-2 py-0.5 rounded-[4px] border border-[#3ddc97]/30">
                  <Sparkles className="w-2.5 h-2.5 text-[#3ddc97]" />
                  <span>Gemini IA</span>
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#f5efe6] tracking-tight">
                Análise Automatizada de Desempenho
              </h3>
              <p className="text-xs text-[#8c8273] font-sans">
                {getFriendlyCompanyName(position.name, position.ticker)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-[8px] bg-[#1c1916] hover:bg-[#24201c] text-[#8c8273] hover:text-[#f5efe6] transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Métricas Rápidas da Carteira */}
        <div className="px-5 sm:px-6 py-3.5 bg-[#181512] border-b border-[#d4af6a]/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono shrink-0">
          <div>
            <span className="text-[10px] text-[#8c8273] uppercase tracking-wider block">
              Preço Atual B3
            </span>
            <span className="text-sm font-bold text-[#f5efe6]">
              {formatBRL(currentPrice)}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#8c8273] uppercase tracking-wider block">
              Preço Médio
            </span>
            <span className="text-sm font-semibold text-[#c2b9ac]">
              {formatBRL(position.averagePrice)}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#8c8273] uppercase tracking-wider block">
              Rentabilidade
            </span>
            <div className="flex items-center gap-1">
              {isProfit ? (
                <TrendingUp className="w-3.5 h-3.5 text-[#3ddc97]" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-[#ff5c6c]" />
              )}
              <span
                className={`text-sm font-bold ${
                  isProfit ? 'text-[#3ddc97]' : 'text-[#ff5c6c]'
                }`}
              >
                {isProfit ? '+' : ''}
                {formatPercent(gainLossPercent, false)}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-[#8c8273] uppercase tracking-wider block">
              Saldo em Carteira
            </span>
            <span className="text-sm font-bold text-[#f0d9a8]">
              {formatBRL(currentValue)}
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm leading-relaxed">
          {loading ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#d4af6a]/15 border border-[#d4af6a]/30 flex items-center justify-center text-[#f0d9a8] animate-pulse">
                <Sparkles className="w-7 h-7 text-[#d4af6a] animate-spin duration-1000" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-base text-[#f5efe6]">
                  Gerando síntese com IA...
                </h4>
                <p className="text-xs text-[#8c8273] font-mono">
                  Cruzando cotação em tempo real, rentabilidade e conjuntura de mercado via Gemini
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-5 rounded-[12px] bg-[#ff5c6c]/10 border border-[#ff5c6c]/30 text-xs text-[#f5efe6] space-y-3">
              <div className="flex items-center gap-2 font-bold text-[#ff5c6c]">
                <AlertCircle className="w-4 h-4" />
                <span>Indisponibilidade Temporária</span>
              </div>
              <p className="text-[#c2b9ac] leading-relaxed">{error}</p>
              <button
                onClick={() => fetchAnalysis(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#1c1916] hover:bg-[#24201c] border border-[#ff5c6c]/30 text-xs text-[#f5efe6] font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Tentar Novamente</span>
              </button>
            </div>
          ) : analysis ? (
            <div className="space-y-4 animate-fade-in font-mono">
              {/* Badge informativa do modelo */}
              <div className="flex items-center justify-between text-[11px] pb-1 border-b border-[#d4af6a]/15 text-[#8c8273]">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#d4af6a]" />
                  <span>Modelo: {analysis.model || 'Gemini 3.8 Flash'}</span>
                  {analysis.cached && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1c1916] text-[#c2b9ac]">
                      em cache
                    </span>
                  )}
                </div>
                <span>
                  {new Date(analysis.generatedAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* 1. Visão Geral */}
              <div className="p-4 sm:p-5 rounded-[14px] bg-[#181512] border border-[#d4af6a]/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#f0d9a8] uppercase tracking-wider">
                  <Compass className="w-4 h-4 text-[#d4af6a]" />
                  <span>Visão Geral do Desempenho</span>
                </div>
                <p className="text-xs sm:text-sm text-[#f5efe6] font-sans leading-relaxed">
                  {analysis.overview}
                </p>
              </div>

              {/* 2. Catalisadores e Fatores de Mercado */}
              <div className="p-4 sm:p-5 rounded-[14px] bg-[#181512] border border-[#d4af6a]/20 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#3ddc97] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#3ddc97]" />
                  <span>Catalisadores & Fatores Recentes</span>
                </div>
                <div className="space-y-2 pt-1 font-sans">
                  {analysis.keyDrivers.map((driver, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-[8px] bg-[#141210] border border-[#d4af6a]/10 flex items-start gap-2.5 text-xs text-[#c2b9ac]"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#d4af6a]/15 text-[#f0d9a8] flex items-center justify-center shrink-0 font-mono text-[10px] font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{driver}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Grid: Cenário Macro + Valuation & Proventos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Cenário Macro */}
                <div className="p-4 rounded-[12px] bg-[#181512] border border-[#d4af6a]/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#d4af6a] uppercase tracking-wider">
                    <Landmark className="w-4 h-4" />
                    <span>Cenário Macroeconômico</span>
                  </div>
                  <p className="text-xs text-[#a39a8c] font-sans leading-relaxed">
                    {analysis.macroContext}
                  </p>
                </div>

                {/* Valuation & Proventos */}
                <div className="p-4 rounded-[12px] bg-[#181512] border border-[#d4af6a]/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#f0d9a8] uppercase tracking-wider">
                    <Coins className="w-4 h-4 text-[#d4af6a]" />
                    <span>Valuation & Proventos</span>
                  </div>
                  <p className="text-xs text-[#a39a8c] font-sans leading-relaxed">
                    {analysis.valuationAndDividends}
                  </p>
                </div>
              </div>

              {/* 4. Gestão de Risco & Atenção */}
              <div className="p-4 rounded-[12px] bg-amber-500/5 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-200">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="font-sans leading-relaxed">
                  <strong className="text-amber-300 font-mono uppercase text-[10px] tracking-wider block mb-1">
                    Ponto de Atenção & Risco:
                  </strong>
                  {analysis.riskNotice}
                </div>
              </div>

              {/* Disclaimer CVM */}
              <p className="text-[10px] text-[#6e675c] font-sans leading-relaxed pt-2 border-t border-[#d4af6a]/10">
                {analysis.disclaimer}
              </p>
            </div>
          ) : null}
        </div>

        {/* Modal Footer com Ações */}
        <div className="p-4 sm:p-5 border-t border-[#d4af6a]/15 bg-[#181512] flex flex-wrap items-center justify-between gap-3 text-xs font-mono shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAnalysis(true)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#1c1916] hover:bg-[#24201c] border border-[#d4af6a]/20 text-[#c2b9ac] hover:text-[#f5efe6] transition-colors cursor-pointer disabled:opacity-50"
              title="Atualizar análise com dados recentes"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-[#d4af6a] ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>

            {analysis && (
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#1c1916] hover:bg-[#24201c] border border-[#d4af6a]/20 text-[#c2b9ac] hover:text-[#f5efe6] transition-colors cursor-pointer"
                title="Copiar resumo da análise"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#3ddc97]" />
                    <span className="text-[#3ddc97]">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#d4af6a]" />
                    <span>Copiar Síntese</span>
                  </>
                )}
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-[8px] bg-[#d4af6a] hover:bg-[#dfbc77] text-[#0b0a09] font-bold shadow-md transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
