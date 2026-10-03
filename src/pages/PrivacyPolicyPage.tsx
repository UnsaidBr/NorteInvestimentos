import React from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { APP_NAME } from '../constants/config';

export const PrivacyPolicyPage: React.FC = () => {
  usePageMeta(
    `Política de Privacidade | ${APP_NAME}`,
    'Conheça nossa Política de Privacidade em conformidade com a Lei Geral de Proteção de Dados (LGPD). Saiba como tratamos seus dados com segurança e respeito.'
  );

  return (
    <div>
      <PageHeader
        badge="Transparência & LGPD"
        badgeColor="gold"
        title="Política de"
        titleHighlight="Privacidade"
        subtitle="Nosso compromisso inegociável com a segurança, sigilo e privacidade dos seus dados pessoais, em estrita observância à Lei Geral de Proteção de Dados (Lei nº 13.709/2018)."
        breadcrumbs={[{ label: 'Privacidade' }]}
      />

      <article className="py-16 sm:py-24 bg-[#0b0a09]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-sm sm:text-base leading-relaxed text-[#c2b9ac]">
          
          {/* Quick Notice Card */}
          <div className="p-6 sm:p-8 rounded-[16px] bg-[#141210] border border-[#d4af6a]/20 shadow-md space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#f0d9a8] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#d4af6a]" />
              <span>Resumo do Compromisso de Privacidade</span>
            </div>
            <p className="text-[#f5efe6] font-normal leading-relaxed">
              O <strong>{APP_NAME}</strong> não comercializa, não aluga e não compartilha endereços de e-mail ou dados de navegação com terceiros. As informações coletadas mediante consentimento livre e inequívoco destinam-se exclusivamente ao envio do nosso boletim informativo educacional (*Radar Semanal*).
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6] tracking-tight flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-[#d4af6a]" />
              <span>1. Controlador e Dados Coletados</span>
            </h2>
            <p>
              O controlador dos dados para os efeitos desta política é a plataforma editorial <strong>{APP_NAME}</strong>. Coletamos exclusivamente:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><strong>Endereço de e-mail:</strong> fornecido ativamente pelo usuário através dos formulários de inscrição do boletim informativo;</li>
              <li><strong>Registros de consentimento:</strong> data, hora e endereço IP no momento da submissão do formulário, em conformidade com as diretrizes do Marco Civil da Internet (Lei nº 12.965/2014) e da LGPD;</li>
              <li><strong>Preferências locais de navegação:</strong> configurações salvas no dispositivo do usuário através de armazenamento local (*localStorage*), sem rastreamento invasivo entre sites.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6] tracking-tight flex items-center gap-2.5">
              <Eye className="w-5 h-5 text-[#d4af6a]" />
              <span>2. Finalidade e Base Legal do Tratamento</span>
            </h2>
            <p>
              O tratamento dos dados pessoais baseia-se primordialmente no <strong>consentimento expresso</strong> do titular (art. 7º, inciso I da LGPD). A finalidade exclusiva é o encaminhamento do Radar Semanal contendo análises de mercado, indicadores macroeconômicos e sínteses didáticas de educação financeira.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6] tracking-tight flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#d4af6a]" />
              <span>3. Direitos do Titular de Dados</span>
            </h2>
            <p>
              Em conformidade com o artigo 18 da LGPD, o titular de dados possui o direito garantido de, a qualquer momento e mediante requisição simples:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Confirmar a existência de tratamento de seus dados;</li>
              <li>Acessar as informações mantidas pelo portal;</li>
              <li>Revogar o consentimento e cancelar imediatamente a assinatura do boletim através do link disponível no rodapé de cada e-mail recebido;</li>
              <li>Solicitar a eliminação definitiva e permanente dos seus dados de nossas bases.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6] tracking-tight flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-[#d4af6a]" />
              <span>4. Armazenamento e Segurança</span>
            </h2>
            <p>
              Empregamos protocolos modernos de segurança da informação, como criptografia em trânsito (HTTPS / TLS 1.3) e infraestrutura de servidores com controle rigoroso de acesso para proteger seus dados contra perda, extravio, destruição ou acessos não autorizados.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6] tracking-tight">
              5. Contato e Encarregado de Proteção de Dados (DPO)
            </h2>
            <p>
              Para esclarecer quaisquer dúvidas sobre esta Política de Privacidade ou para exercer os direitos assegurados pela LGPD, entre em contato através do canal de atendimento pelo e-mail <strong>privacidade@norteinvest.com.br</strong>.
            </p>
            <p className="text-xs text-[#8c8273] font-mono pt-4 border-t border-[#d4af6a]/10">
              Última atualização: Outubro de 2026.
            </p>
          </section>

        </div>
      </article>
    </div>
  );
};
