import React, { useState } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { APP_NAME } from '../constants/config';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Clock,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const ContactPage: React.FC = () => {
  usePageMeta(
    `Contato & Suporte | ${APP_NAME}`,
    `Entre em contato com a equipe editorial e técnica do ${APP_NAME}. Tire dúvidas, envie sugestões de melhorias ou relate inconsistências de dados.`
  );

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    subject: 'duvidas',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    // Validações básicas no cliente
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!form.email.includes('@') || !form.email.includes('.')) {
      setErrorMessage('Por favor, forneça um endereço de e-mail válido.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível enviar sua mensagem no momento.');
      }

      setSuccessMessage(
        data.message || 'Mensagem recebida com sucesso! Nossa equipe retornará em até 2 dias úteis.'
      );
      setForm({
        name: '',
        email: '',
        subject: 'duvidas',
        message: '',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na conexão com o servidor.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        badge="Canal Direto"
        badgeColor="gold"
        title="Fale com a"
        titleHighlight="Nossa Equipe"
        subtitle="Dúvidas, sugestões editoriais, relatos de dados ou parcerias institucionais. Estamos à disposição."
        breadcrumbs={[{ label: 'Contato' }]}
      />

      <div className="py-16 sm:py-24 bg-[#0b0a09]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Left Column: Context & Guidelines */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <span className="font-mono text-xs text-[#f0d9a8] uppercase tracking-wider font-semibold">
                  Atendimento & Transparência
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#f5efe6] tracking-tight leading-snug">
                  Valorizamos o feedback da nossa comunidade.
                </h2>
                <p className="text-sm text-[#c2b9ac] leading-relaxed">
                  Se você identificou alguma divergência em cotações, gostaria de sugerir novas métricas para o simulador ou tem dúvidas conceituais sobre os dados de mercado, entre em contato direto.
                </p>
              </div>

              {/* Service Cards */}
              <div className="space-y-4">
                <div className="p-4 rounded-[12px] bg-[#141210] border border-[#d4af6a]/15 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#d4af6a]/10 border border-[#d4af6a]/20 flex items-center justify-center text-[#d4af6a] shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-[#f5efe6] uppercase">Prazo Médio de Resposta</h4>
                    <p className="text-xs text-[#a39a8c] mt-0.5">
                      Respondemos a todas as mensagens em até <strong>24 a 48 horas úteis</strong> (horário de Brasília).
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-[12px] bg-[#141210] border border-[#d4af6a]/15 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#d4af6a]/10 border border-[#d4af6a]/20 flex items-center justify-center text-[#d4af6a] shrink-0 mt-0.5">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-[#f5efe6] uppercase">Antes de Escrever</h4>
                    <p className="text-xs text-[#a39a8c] mt-0.5">
                      Consulte nossa seção de <Link to="/faq" className="text-[#f0d9a8] underline hover:text-[#f5efe6]">Perguntas Frequentes (FAQ)</Link>. Sua dúvida sobre cotações ou IA pode já estar respondida.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-[12px] bg-[#141210] border border-[#d4af6a]/15 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#d4af6a]/10 border border-[#d4af6a]/20 flex items-center justify-center text-[#d4af6a] shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-[#f5efe6] uppercase">Canal Institucional</h4>
                    <p className="text-xs font-mono text-[#f0d9a8] mt-0.5">
                      contato@norteinvest.com.br
                    </p>
                  </div>
                </div>
              </div>

              {/* Legal Note Box */}
              <div className="p-4 rounded-[12px] bg-[#141210]/60 border border-[#d4af6a]/10 text-[11px] text-[#8c8273] leading-relaxed">
                <strong>Nota Regulamentar:</strong> Por vedação expressa da Resolução CVM nº 19, nossa equipe de suporte não emite recomendações particulares de investimento, análises de carteiras pessoais ou consultorias individualizadas.
              </div>
            </div>

            {/* Right Column: Interactive Form */}
            <div className="lg:col-span-7">
              <div className="p-6 sm:p-8 rounded-[18px] bg-[#141210] border border-[#d4af6a]/25 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af6a]/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative space-y-6">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#d4af6a]" />
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#f5efe6]">
                      Envie uma Mensagem
                    </h3>
                  </div>

                  {/* Feedback Banners */}
                  {successMessage && (
                    <div className="p-4 rounded-[10px] bg-[#3ddc97]/10 border border-[#3ddc97]/30 text-[#3ddc97] text-xs sm:text-sm flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Mensagem enviada com sucesso!</p>
                        <p className="text-xs text-[#f5efe6] mt-0.5">{successMessage}</p>
                      </div>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="p-4 rounded-[10px] bg-[#e25c5c]/10 border border-[#e25c5c]/30 text-[#e25c5c] text-xs sm:text-sm flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Atenção</p>
                        <p className="text-xs text-[#f5efe6] mt-0.5">{errorMessage}</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-1.5">
                        <label htmlFor="contact-name" className="block text-xs font-mono font-medium text-[#c2b9ac]">
                          Seu Nome <span className="text-[#d4af6a]">*</span>
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          name="name"
                          required
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Ex: Carlos Eduardo"
                          className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/20 text-xs sm:text-sm text-[#f5efe6] placeholder-[#8c8273] focus:outline-none focus:border-[#d4af6a] transition-all"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <label htmlFor="contact-email" className="block text-xs font-mono font-medium text-[#c2b9ac]">
                          Seu E-mail <span className="text-[#d4af6a]">*</span>
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          name="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          placeholder="Ex: carlos@exemplo.com.br"
                          className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/20 text-xs sm:text-sm text-[#f5efe6] placeholder-[#8c8273] focus:outline-none focus:border-[#d4af6a] transition-all"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-1.5">
                      <label htmlFor="contact-subject" className="block text-xs font-mono font-medium text-[#c2b9ac]">
                        Assunto <span className="text-[#d4af6a]">*</span>
                      </label>
                      <select
                        id="contact-subject"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/20 text-xs sm:text-sm text-[#f5efe6] focus:outline-none focus:border-[#d4af6a] transition-all"
                      >
                        <option value="duvidas">Dúvidas sobre o funcionamento da plataforma</option>
                        <option value="dados">Relatar divergência ou erro em cotações/dados</option>
                        <option value="sugestao">Sugestão de funcionalidade ou conteúdo educativo</option>
                        <option value="parceria">Parcerias institucionais e imprensa</option>
                        <option value="outro">Outro assunto</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div className="space-y-1.5">
                      <label htmlFor="contact-message" className="block text-xs font-mono font-medium text-[#c2b9ac]">
                        Mensagem <span className="text-[#d4af6a]">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Escreva detalhadamente sua dúvida ou mensagem..."
                        className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/20 text-xs sm:text-sm text-[#f5efe6] placeholder-[#8c8273] focus:outline-none focus:border-[#d4af6a] transition-all resize-y"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[10px] bg-gradient-to-r from-[#d4af6a] via-[#f0d9a8] to-[#dfbc77] text-[#0b0a09] font-mono font-bold text-xs uppercase tracking-wider hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-lg"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-[#0b0a09] border-t-transparent rounded-full animate-spin" />
                            <span>Enviando mensagem...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Enviar Mensagem</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-[#8c8273] text-center pt-1">
                      Seus dados estão protegidos conforme as diretrizes da nossa{' '}
                      <Link to="/privacidade" className="text-[#f0d9a8] underline hover:text-[#f5efe6]">
                        Política de Privacidade (LGPD)
                      </Link>.
                    </p>
                  </form>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
