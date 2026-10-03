import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Mail,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Zap,
  Bot,
  Globe2,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { APP_NAME } from '../constants/config';
import { useMarket } from '../context/MarketContext';
import { DataSourceBadge } from './DataSourceBadge';
import { subscribeToNewsletter } from '../services/newsletterService';
import { formatTimeBR } from '../utils/formatters';

export const Hero: React.FC = () => {
  const { marketState } = useMarket();
  const { isDemoMode, lastUpdated } = marketState;

  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setFeedback({ success: false, message: 'Por favor, informe um endereço de e-mail válido.' });
      return;
    }

    if (!consent) {
      setFeedback({
        success: false,
        message: 'É obrigatório concordar com o recebimento de e-mails e a Política de Privacidade.',
      });
      return;
    }

    setLoading(true);
    setFeedback(null);

    const result = await subscribeToNewsletter(email, consent);
    setLoading(false);
    setFeedback({ success: result.success, message: result.message });

    if (result.success) {
      setEmail('');
      setConsent(false);
    }
  };

  // Sparkline data coordinates for drawing
  const sparklineIbov = "M 0,38 Q 20,32 40,36 T 80,26 T 120,30 T 160,18 T 200,12 L 220,8";
  const sparklineDolar = "M 0,10 Q 25,14 50,18 T 100,24 T 150,30 T 190,34 L 220,38";
  const sparklineBtc = "M 0,40 Q 25,36 55,28 T 110,32 T 160,16 T 195,12 L 220,6";

  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-[#d4af6a]/15 bg-[#0b0a09]">
      {/* 1. Subtle Discreet Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.2]"
        style={{
          backgroundImage: `radial-gradient(rgba(212, 175, 106, 0.2) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, #000 70%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, #000 70%, transparent 100%)',
        }}
      />

      {/* 2. Warm Champagne Radial Glow Behind Title */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[#d4af6a]/8 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/4 w-[600px] h-[400px] bg-[#b58d46]/8 blur-[160px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Column: Headline, Newsletter & Credibility */}
          <div className="lg:col-span-7 text-left space-y-6 sm:space-y-8">
            
            {/* Tag Badge with Origin Indicator */}
            <div className="flex flex-wrap items-center gap-3">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#141210] border border-[#d4af6a]/25 shadow-sm"
              >
                <span className="flex h-2 w-2 rounded-full bg-[#d4af6a] shadow-[0_0_8px_#d4af6a]" />
                <span className="text-xs font-semibold text-[#f5efe6] tracking-wide font-sans">
                  {APP_NAME}
                </span>
                <span className="text-[#8c8273]">•</span>
                <span className="text-xs text-[#c2b9ac] font-normal">
                  Inteligência de mercado em português
                </span>
              </motion.div>

              <DataSourceBadge isDemoMode={isDemoMode} lastUpdated={lastUpdated} />
            </div>

            {/* Title: "Entenda o mercado em minutos" */}
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl lg:text-[68px] font-serif font-bold text-[#f5efe6] tracking-tight leading-[1.06]"
            >
              Entenda o mercado <br />
              em{' '}
              <span className="bg-gradient-to-r from-[#d4af6a] via-[#f0d9a8] to-[#dfbc77] bg-clip-text text-transparent">
                minutos
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="text-base sm:text-lg text-[#c2b9ac] max-w-xl font-normal leading-relaxed"
            >
              Cotações da B3 ao vivo, análise macroeconômica e taxas do Banco Central. Tradução didática das forças que movem as ações com inteligência artificial para explicar o mercado.
            </motion.p>

            {/* Email Capture Form with Consent Checkbox */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-lg space-y-3"
            >
              <form
                onSubmit={handleSubscribe}
                className="space-y-2.5"
              >
                <div className="relative flex flex-col sm:flex-row gap-2 p-1.5 sm:p-2 rounded-[14px] bg-[#141210] border border-[#d4af6a]/25 focus-within:border-[#d4af6a]/60 shadow-[0_12px_36px_rgba(0,0,0,0.6)] transition-all duration-200">
                  <div className="relative flex-1 flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-[#a39a8c]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Seu melhor e-mail para o Radar Semanal..."
                      className="w-full pl-10 pr-3 py-3 bg-transparent text-sm text-[#f5efe6] placeholder:text-[#8c8273] rounded-[10px] focus:outline-none font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded-[10px] bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] hover:from-[#dfbc77] hover:to-[#fae6b8] text-[#0b0a09] font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(212,175,106,0.25)] active:scale-[0.98] transition-all duration-150 cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    <span>{loading ? 'Cadastrando...' : 'Receber Radar Grátis'}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* Mandatory Consent Checkbox */}
                <div className="flex items-start gap-2.5 text-left text-xs text-[#c2b9ac] pl-1">
                  <input
                    type="checkbox"
                    id="hero-newsletter-consent"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-[#d4af6a]/30 bg-[#1c1916] accent-[#d4af6a] cursor-pointer shrink-0"
                  />
                  <label htmlFor="hero-newsletter-consent" className="cursor-pointer select-none leading-relaxed text-[11px] sm:text-xs">
                    Concordo em receber e-mails e com a{' '}
                    <Link to="/privacidade" className="text-[#f0d9a8] underline hover:text-white font-medium">
                      Política de Privacidade
                    </Link>
                    .
                  </label>
                </div>
              </form>

              {/* Feedback Messages */}
              {feedback && (
                <div
                  className={`p-3 rounded-[10px] text-xs font-medium flex items-center gap-2 text-left animate-fadeIn ${
                    feedback.success
                      ? 'bg-[#1c1916] border border-[#3ddc97]/30 text-[#3ddc97]'
                      : 'bg-[#1c1916] border border-[#ff5c6c]/30 text-[#ff5c6c]'
                  }`}
                >
                  {feedback.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}
            </motion.div>

            {/* Three Credibility Metrics Below */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="pt-6 border-t border-[#d4af6a]/12 grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-[#141210] border border-[#d4af6a]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-4 h-4 text-[#d4af6a]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#f5efe6] font-mono uppercase tracking-wide">
                    Atualização
                  </h4>
                  <p className="text-[11px] text-[#c2b9ac] mt-0.5 leading-snug">
                    Atualizado a cada 60 segundos
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-[#141210] border border-[#d4af6a]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-[#d4af6a]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#f5efe6] font-mono uppercase tracking-wide">
                    Síntese com IA
                  </h4>
                  <p className="text-[11px] text-[#c2b9ac] mt-0.5 leading-snug">
                    Explicações claras sem jargões
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-[#141210] border border-[#d4af6a]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Globe2 className="w-4 h-4 text-[#d4af6a]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#f5efe6] font-mono uppercase tracking-wide">
                    Conteúdo educacional
                  </h4>
                  <p className="text-[11px] text-[#c2b9ac] mt-0.5 leading-snug">
                    Foco 100% em alfabetização financeira
                  </p>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Floating Glass Mockup with 3 Mini-Cards and Exact Origin Time */}
          <div className="lg:col-span-5 relative flex items-center justify-center w-full mt-6 lg:mt-0">
            
            {/* Ambient Warm Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#d4af6a]/15 via-[#b58d46]/10 to-transparent blur-[90px] rounded-[32px] pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[460px]"
            >
              
              {/* Floating Wrapper */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                className="transform lg:-rotate-1 hover:rotate-0 transition-transform duration-500 relative"
              >
                {/* Main Glassmorphism Frame */}
                <div className="p-5 sm:p-7 rounded-[22px] bg-[#141210]/85 border border-[#d4af6a]/25 shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl space-y-4">
                  
                  {/* Top Bar with clear origin and demo flag */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#d4af6a]/15">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#d4af6a] animate-pulse" />
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#f5efe6]">
                        Termômetro do Mercado
                      </span>
                    </div>

                    {isDemoMode ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300 text-[10px] font-mono font-bold uppercase">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span>Dados de demonstração</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1c1916] text-[#c2b9ac] border border-[#d4af6a]/20">
                        Às {formatTimeBR(lastUpdated)}
                      </span>
                    )}
                  </div>

                  {/* 1. Mini-Card: IBOVESPA */}
                  <div className="p-4 rounded-[14px] bg-[#1c1916]/90 border border-[#d4af6a]/15 hover:border-[#d4af6a]/35 transition-all shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#f5efe6]">
                          IBOVESPA
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#141210] text-[#c2b9ac] border border-[#d4af6a]/10">
                          B3
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-0.5 font-mono tabular-nums text-xs font-bold text-[#3ddc97] bg-[#3ddc97]/10 px-2 py-0.5 rounded-full">
                        <TrendingUp className="w-3 h-3 text-[#3ddc97]" />
                        +0,68%
                      </span>
                    </div>

                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <div className="font-mono tabular-nums font-bold text-lg text-[#f5efe6]">
                          131.820 <span className="text-xs font-normal text-[#a39a8c]">pts</span>
                        </div>
                        <span className="text-[10px] text-[#8c8273] font-mono">
                          Mín: 130.950 • Máx: 132.140
                        </span>
                      </div>

                      {/* Animated Gold Sparkline */}
                      <div className="w-28 h-9 shrink-0 overflow-hidden">
                        <svg viewBox="0 0 220 50" className="w-full h-full overflow-visible">
                          <motion.path
                            d={sparklineIbov}
                            fill="none"
                            stroke="#d4af6a"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.6, delay: 0.2, ease: 'easeInOut' }}
                          />
                          <circle cx="220" cy="8" r="3" fill="#d4af6a" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* 2. Mini-Card: DÓLAR COMERCIAL */}
                  <div className="p-4 rounded-[14px] bg-[#1c1916]/90 border border-[#d4af6a]/15 hover:border-[#d4af6a]/35 transition-all shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#f5efe6]">
                          DÓLAR COMERCIAL
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#141210] text-[#c2b9ac] border border-[#d4af6a]/10">
                          USD/BRL
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-0.5 font-mono tabular-nums text-xs font-bold text-[#ff5c6c] bg-[#ff5c6c]/10 px-2 py-0.5 rounded-full">
                        <TrendingDown className="w-3 h-3 text-[#ff5c6c]" />
                        -0,35%
                      </span>
                    </div>

                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <div className="font-mono tabular-nums font-bold text-lg text-[#f5efe6]">
                          R$ 5,482
                        </div>
                        <span className="text-[10px] text-[#8c8273] font-mono">
                          Mín: R$ 5,465 • Máx: R$ 5,502
                        </span>
                      </div>

                      {/* Animated Gold Sparkline */}
                      <div className="w-28 h-9 shrink-0 overflow-hidden">
                        <svg viewBox="0 0 220 50" className="w-full h-full overflow-visible">
                          <motion.path
                            d={sparklineDolar}
                            fill="none"
                            stroke="#d4af6a"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.6, delay: 0.4, ease: 'easeInOut' }}
                          />
                          <circle cx="220" cy="38" r="3" fill="#d4af6a" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* 3. Mini-Card: BITCOIN */}
                  <div className="p-4 rounded-[14px] bg-[#1c1916]/90 border border-[#d4af6a]/15 hover:border-[#d4af6a]/35 transition-all shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#f5efe6]">
                          BITCOIN
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#141210] text-[#c2b9ac] border border-[#d4af6a]/10">
                          BTC/BRL
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-0.5 font-mono tabular-nums text-xs font-bold text-[#3ddc97] bg-[#3ddc97]/10 px-2 py-0.5 rounded-full">
                        <TrendingUp className="w-3 h-3 text-[#3ddc97]" />
                        +2,34%
                      </span>
                    </div>

                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <div className="font-mono tabular-nums font-bold text-lg text-[#f5efe6]">
                          R$ 362.450
                        </div>
                        <span className="text-[10px] text-[#8c8273] font-mono">
                          Volume 24h: R$ 1,84 bi
                        </span>
                      </div>

                      {/* Animated Gold Sparkline */}
                      <div className="w-28 h-9 shrink-0 overflow-hidden">
                        <svg viewBox="0 0 220 50" className="w-full h-full overflow-visible">
                          <motion.path
                            d={sparklineBtc}
                            fill="none"
                            stroke="#d4af6a"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.6, delay: 0.6, ease: 'easeInOut' }}
                          />
                          <circle cx="220" cy="6" r="3" fill="#d4af6a" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Micro Footer inside glass frame with real update time and interval */}
                  <div className="pt-2 flex items-center justify-between text-[11px] text-[#8c8273] font-mono">
                    <span className="flex items-center gap-1.5 text-[#c2b9ac]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3ddc97] animate-ping" />
                      {isDemoMode ? 'Demonstração' : `Às ${formatTimeBR(lastUpdated)}`}
                    </span>
                    <span className="text-[#d4af6a] font-semibold">
                      Atualizado a cada 60 segundos
                    </span>
                  </div>

                </div>
              </motion.div>

            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
};
