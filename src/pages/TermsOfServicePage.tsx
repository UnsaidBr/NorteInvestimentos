import React from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { FileText, AlertTriangle, Scale, BookOpen } from 'lucide-react';
import { APP_NAME } from '../constants/config';

export const TermsOfServicePage: React.FC = () => {
  usePageMeta(
    `Termos de Uso | ${APP_NAME}`,
    'Leia os Termos de Uso do portal NorteInvest. Conheça as diretrizes éticas, aviso legal de risco e as regras de utilização do nosso conteúdo educativo.'
  );

  return (
    <div>
      <PageHeader
        badge="Termos & Condições"
        badgeColor="gold"
        title="Termos de"
        titleHighlight="Uso"
        subtitle="Regras de utilização, condições legais e o caráter estritamente educativo das ferramentas, cotações e inteligência do portal NorteInvest."
        breadcrumbs={[{ label: 'Termos de Uso' }]}
      />

      <article className="py-16 sm:py-24 bg-[#0b0a09]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-sm sm:text-base leading-relaxed text-[#c2b9ac]">
          
          {/* Important Regulatory Card */}
          <div className="p-6 sm:p-8 rounded-[16px] bg-[#141210] border border-[#d4af6a]/25 shadow-md space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#f0d9a8] uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-[#d4af6a]" />
              <span>Aviso Legal Fundamental • Conteúdo Educacional</span>
            </div>
            <p className="text-[#f5efe6] font-normal leading-relaxed">
              O portal <strong>{APP_NAME}</strong> é uma publicação digital de educação financeira e inteligência analítica. O portal não é uma instituição financeira, corretora de valores mobiliários, distribuidora ou consultoria de investimentos credenciada perante a Comissão de Valores Mobiliários (CVM). Nenhuma informação veiculada constitui oferta de compra, venda ou recomendação de qualquer ativo financeiro.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6] tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-[#d4af6a]" />
              <span>1. Finalidade do Portal</span>
            </h2>
            <p>
              O conteúdo disponibilizado, incluindo cotações da B3, cotações cambiais, preços de criptoativos, calculadoras, simulações patrimoniais e sínteses produzidas por Inteligência Artificial, tem o objetivo exclusivo de fomentar a alfabetização financeira e a compreensão crítica do mercado brasileiro pelo cidadão.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6] tracking-tight flex items-center gap-2.5">
              <Scale className="w-5 h-5 text-[#d4af6a]" />
              <span>2. Riscos de Mercado e Isenção de Garantia</span>
            </h2>
            <p>
              Investimentos em renda variável (ações, fundos imobiliários, índices, moedas e criptoativos) envolvem riscos significativos de oscilação e potencial perda do capital alocado.
            </p>
            <p>
              <strong>Rentabilidade passada não representa garantia de rentabilidade futura.</strong> As projeções do simulador e as hipóteses geradas por Inteligência Artificial constituem exercícios matemáticos e educacionais simplificados, não devendo ser utilizadas como base única para decisões de investimento.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6] tracking-tight flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-[#d4af6a]" />
              <span>3. Fontes de Dados e Atrasos Indicativos</span>
            </h2>
            <p>
              As cotações e taxas são agregadas a partir de provedores externos públicos (como brapi.dev, Banco Central do Brasil, AwesomeAPI e CoinGecko). Apesar dos melhores esforços para manter a precisão dos dados exibidos, o portal não garante a ausência de atrasos técnicos, falhas de conectividade ou erros nas APIs de terceiros.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6] tracking-tight">
              4. Propriedade Intelectual
            </h2>
            <p>
              Todos os elementos de interface, marcas, logotipos, monogramas e textos produzidos pela equipe do <strong>{APP_NAME}</strong> são protegidos pela legislação brasileira de direitos autorais e propriedade intelectual (Lei nº 9.610/1998). A reprodução comercial não autorizada é vedada.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6] tracking-tight">
              5. Foro e Legislação Aplicável
            </h2>
            <p>
              Estes Termos de Uso são regidos e interpretados segundo a legislação da República Federativa do Brasil. Para a resolução de eventuais controvérsias decorrentes da utilização dos serviços, fica eleito o foro da comarca do domicílio do usuário.
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
