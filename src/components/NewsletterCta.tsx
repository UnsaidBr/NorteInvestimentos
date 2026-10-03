import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, Sparkles, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { subscribeToNewsletter } from '../services/newsletterService';

interface NewsletterCtaProps {
  title?: string;
  subtitle?: string;
}

export const NewsletterCta: React.FC<NewsletterCtaProps> = ({
  title = 'Receba o briefing matinal do mercado antes da abertura da B3',
  subtitle = 'Resumo semanal gratuito: cotações fundamentais, taxas de juros do Copom e sínteses de inteligência artificial direto no seu e-mail. Conteúdo exclusivo para investidores brasileiros.',
}) => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
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

  return (
    <section className="py-16 sm:py-24 bg-[#0b0a09] border-t border-[#d4af6a]/15 relative overflow-hidden">
      {/* Background radial gold glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#d4af6a]/6 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
        <div className="p-8 sm:p-12 rounded-[16px] bg-[#141210] border border-[#d4af6a]/25 shadow-[0_16px_50px_rgba(0,0,0,0.6)] text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1c1916] border border-[#d4af6a]/20 text-xs font-mono font-medium text-[#f0d9a8] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af6a]" />
            <span>Radar Semanal Gratuito • NorteInvest</span>
          </div>

          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#f5efe6] tracking-tight leading-snug max-w-2xl mx-auto">
            {title}
          </h3>

          <p className="text-xs sm:text-sm text-[#c2b9ac] mt-3 max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto space-y-3.5">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a39a8c]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu melhor e-mail..."
                  className="w-full pl-10 pr-4 py-3 bg-[#1c1916] border border-[#d4af6a]/20 focus:border-[#d4af6a] rounded-[10px] text-sm text-[#f5efe6] placeholder:text-[#8c8273] focus:outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-[10px] bg-gradient-to-r from-[#d4af6a] to-[#f0d9a8] hover:from-[#dfbc77] hover:to-[#fae6b8] text-[#0b0a09] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(212,175,106,0.25)] active:scale-95 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <span>{loading ? 'Cadastrando...' : 'Inscrever-se'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mandatory Consent Checkbox */}
            <div className="flex items-start gap-2.5 text-left text-xs text-[#c2b9ac] pt-1">
              <input
                type="checkbox"
                id="newsletter-consent"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#d4af6a]/30 bg-[#1c1916] accent-[#d4af6a] cursor-pointer shrink-0"
              />
              <label htmlFor="newsletter-consent" className="cursor-pointer select-none leading-relaxed text-[11px] sm:text-xs">
                Concordo em receber e-mails e com a{' '}
                <Link to="/privacidade" className="text-[#f0d9a8] underline hover:text-white font-medium">
                  Política de Privacidade
                </Link>
                .
              </label>
            </div>

            {/* Feedback alert */}
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
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-[#8c8273] font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#d4af6a]" />
            <span>Privacidade garantida conforme a LGPD. Cancele a qualquer momento.</span>
          </div>

        </div>
      </div>
    </section>
  );
};
