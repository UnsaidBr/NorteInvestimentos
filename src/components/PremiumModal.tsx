import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlan } from '../context/PlanContext';
import {
  Sparkles,
  X,
  CheckCircle2,
  Sliders,
  Star,
  Scale,
  Download,
  Bell,
  Mail,
  ArrowRight,
  ShieldCheck,
  Lock,
  Crown,
} from 'lucide-react';

export const PremiumModal: React.FC = () => {
  const {
    isWaitlistModalOpen,
    waitlistFeatureReason,
    closeWaitlistModal,
    joinWaitlist,
    isWaitlistSubscribed,
  } = usePlan();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [justSubscribed, setJustSubscribed] = useState(false);

  if (!isWaitlistModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatusMessage({ text: 'Por favor, informe um e-mail válido.', isError: true });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const res = await joinWaitlist(email, waitlistFeatureReason);
    setIsSubmitting(false);

    if (res.success) {
      setJustSubscribed(true);
      setStatusMessage({ text: res.message, isError: false });
    } else {
      setStatusMessage({ text: res.message, isError: true });
    }
  };

  const benefits = [
    {
      icon: <Sliders className="w-4 h-4 text-[#d4af6a]" />,
      title: 'Screener sem restrições',
      desc: 'Combine mais de 3 filtros fundamentalistas simultaneamente e filtre toda a bolsa.',
    },
    {
      icon: <Star className="w-4 h-4 text-[#d4af6a]" />,
      title: 'Favoritos Ilimitados',
      desc: 'Monitore mais de 5 ativos na sua carteira personalizada com cotações e sparklines ao vivo.',
    },
    {
      icon: <Sparkles className="w-4 h-4 text-[#d4af6a]" />,
      title: 'IA Ilimitada Todos os Dias',
      desc: 'Sem teto de 3 consultas diárias. Sínteses didáticas instantâneas para qualquer ticker.',
    },
    {
      icon: <Scale className="w-4 h-4 text-[#d4af6a]" />,
      title: 'Comparador de 4 Ativos',
      desc: 'Gráfico normalizado Base 100 e múltiplos lado a lado para 4 ativos ao mesmo tempo.',
    },
    {
      icon: <Download className="w-4 h-4 text-[#d4af6a]" />,
      title: 'Exportação de Planilhas CSV',
      desc: 'Baixe todos os dados filtrados para trabalhar em Excel, Google Sheets ou Python.',
    },
    {
      icon: <Bell className="w-4 h-4 text-[#d4af6a]" />,
      title: 'Alertas de Preço & Data-Com',
      desc: 'Receba avisos por e-mail quando ações atingirem seu preço-alvo ou anunciarem proventos.',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeWaitlistModal}
          className="fixed inset-0 bg-[#0a0908]/85 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-xl bg-[#141210] border border-[#d4af6a]/40 rounded-[20px] shadow-2xl overflow-hidden my-auto z-10"
        >
          {/* Top Golden Light Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4af6a] to-transparent" />

          {/* Close Button */}
          <button
            onClick={closeWaitlistModal}
            className="absolute top-4 right-4 text-[#8c8273] hover:text-[#f5efe6] p-1.5 rounded-full hover:bg-[#1c1916] transition-colors z-20 cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Header Badge & Title */}
            <div className="text-center space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af6a]/15 border border-[#d4af6a]/30 text-[#f0d9a8] text-xs font-mono font-semibold">
                <Crown className="w-3.5 h-3.5 text-[#d4af6a]" />
                <span>Recurso do Plano Premium</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#f5efe6] tracking-tight">
                Eleve sua análise na B3 para o próximo nível
              </h2>

              {waitlistFeatureReason ? (
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/25 px-3 py-2 rounded-[10px] max-w-md mx-auto">
                  <Lock className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>{waitlistFeatureReason}</span>
                </div>
              ) : (
                <p className="text-sm text-[#c2b9ac] max-w-md mx-auto font-sans">
                  Acesso completo e irrestrito a todas as ferramentas analíticas da plataforma NorteInvest.
                </p>
              )}
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {benefits.map((b, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-[12px] bg-[#1c1916]/70 border border-[#d4af6a]/15 hover:border-[#d4af6a]/30 transition-colors"
                >
                  <div className="p-1.5 rounded-[8px] bg-[#141210] border border-[#d4af6a]/25 shrink-0">
                    {b.icon}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-[#f5efe6]">{b.title}</h4>
                    <p className="text-[11px] text-[#8c8273] leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Email Capture or Already Subscribed */}
            <div className="bg-[#0c0b0a] border border-[#d4af6a]/25 rounded-[16px] p-5 space-y-4">
              {justSubscribed || isWaitlistSubscribed ? (
                <div className="text-center py-2 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-[#f5efe6]">
                      Você está na lista prioritária!
                    </h4>
                    <p className="text-xs text-[#c2b9ac] max-w-sm mx-auto">
                      Já registramos o seu interesse. Você receberá um convite exclusivo com condições especiais assim que o NorteInvest Premium for liberado.
                    </p>
                  </div>
                  <button
                    onClick={closeWaitlistModal}
                    className="mt-2 px-5 py-2 rounded-[10px] bg-[#1c1916] hover:bg-[#25221d] text-[#f0d9a8] border border-[#d4af6a]/30 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Continuar Navegando
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#d4af6a]" />
                    <span className="text-xs font-bold text-[#f5efe6]">
                      Entre na lista de espera exclusiva
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#d4af6a]/15 text-[#f0d9a8] ml-auto">
                      Em breve
                    </span>
                  </div>

                  <p className="text-xs text-[#8c8273]">
                    Cadastre-se para receber acesso antecipado e desconto de lançamento:
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8273]" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Digite seu e-mail principal..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-[10px] bg-[#141210] border border-[#d4af6a]/30 focus:border-[#d4af6a] text-xs text-[#f5efe6] placeholder-[#6b6255] focus:outline-none focus:ring-1 focus:ring-[#d4af6a]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-[10px] bg-gradient-to-r from-[#d4af6a] to-[#e6ca85] hover:brightness-110 text-[#0a0908] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Enviando...</span>
                      ) : (
                        <>
                          <span>Entrar na lista de espera Premium</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>

                  {statusMessage && (
                    <div
                      className={`text-xs p-2.5 rounded-[8px] ${
                        statusMessage.isError
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {statusMessage.text}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-[#8c8273] pt-1">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      100% livre de spam
                    </span>
                    <span>Sem cobrança agora • Convite antecipado</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
