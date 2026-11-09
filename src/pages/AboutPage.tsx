import React from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { APP_NAME } from '../constants/config';
import {
  Compass,
  ShieldCheck,
  Ban,
  CheckCircle2,
  BookOpen,
  Award,
  Users,
  Building2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  usePageMeta(
    `Sobre o ${APP_NAME} | Educação Financeira com Rigor Analítico`,
    `Conheça a missão do ${APP_NAME}: democratizar o acesso à inteligência de mercado e dados reais no Brasil, com independência editorial e compromisso com o investidor.`
  );

  return (
    <div>
      <PageHeader
        badge="Nossa Identidade & Missão"
        badgeColor="gold"
        title="Sobre o"
        titleHighlight={APP_NAME}
        subtitle="Educação financeira acessível, transparência radical de dados e independência analítica com o refinamento do private banking."
        breadcrumbs={[{ label: 'Sobre' }]}
      />

      <article className="py-16 sm:py-24 bg-[#0b0a09]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-[#c2b9ac] text-sm sm:text-base leading-relaxed">

          {/* Mission Hero Banner */}
          <div className="p-8 sm:p-10 rounded-[18px] bg-gradient-to-br from-[#141210] via-[#1c1916] to-[#141210] border border-[#d4af6a]/30 shadow-xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af6a]/15 text-[#f0d9a8] font-mono text-xs uppercase tracking-wider font-semibold">
              <Compass className="w-3.5 h-3.5 text-[#d4af6a]" />
              <span>Nossa Missão Fundamental</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#f5efe6] tracking-tight leading-snug">
              Descomplicar a B3 e as finanças do Brasil sem atalhos, promessas falsas ou viés comercial.
            </h2>
            <p className="text-[#c2b9ac] text-sm sm:text-base leading-relaxed">
              O investidor brasileiro historicamente enfrenta duas barreiras: ferramentas institucionais caras e herméticas de um lado, e promessas sensacionalistas de enriquecimento rápido do outro. O <strong>{APP_NAME}</strong> nasceu para ocupar o espaço do meio: oferecer a precisão e elegância visual do private banking combinada a uma linguagem clara e acessível a quem está construindo seu patrimônio.
            </p>
          </div>

          {/* O que o site É e o que NÃO É */}
          <section className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6] tracking-tight flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-[#d4af6a]" />
              <span>O que a Plataforma É e o que NÃO É</span>
            </h2>

            <p>
              Para assegurar a máxima clareza e atender rigorosamente às normas dos órgãos reguladores do mercado de capitais brasileiro (CVM e ANBIMA), delimitamos com precisão nosso escopo de atuação:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* O QUE É */}
              <div className="p-6 rounded-[16px] bg-[#141210] border border-[#3ddc97]/30 space-y-4">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#3ddc97]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>O que o {APP_NAME} É</span>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-[#f5efe6]">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3ddc97] mt-1.5 shrink-0" />
                    <span><strong>Portal Educativo Independente:</strong> Conteúdo concebido para fomentar a alfabetização financeira e a compreensão autônoma de mercado.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3ddc97] mt-1.5 shrink-0" />
                    <span><strong>Agregador de Dados Públicos:</strong> Consolidação de cotações da B3, taxas do Banco Central e criptoativos com carimbos auditáveis.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3ddc97] mt-1.5 shrink-0" />
                    <span><strong>Ferramenta Didática de Simulação:</strong> Calculadoras com a matemática financeira real de juros compostos e tabela regressiva de IR.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3ddc97] mt-1.5 shrink-0" />
                    <span><strong>Ambiente Livre de Conflitos:</strong> Não recebemos comissões por volume de negociação, corretagem ou indicação de produtos bancários.</span>
                  </li>
                </ul>
              </div>

              {/* O QUE NÃO É */}
              <div className="p-6 rounded-[16px] bg-[#141210] border border-[#e25c5c]/30 space-y-4">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#e25c5c]">
                  <Ban className="w-4 h-4" />
                  <span>O que o {APP_NAME} NÃO É</span>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-[#f5efe6]">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e25c5c] mt-1.5 shrink-0" />
                    <span><strong>Não é Corretora de Valores:</strong> Não executamos ordens de compra e venda, não intermediamos operações nem custodiamos recursos financeiros de clientes.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e25c5c] mt-1.5 shrink-0" />
                    <span><strong>Não é Casa de Análise / Consultoria:</strong> Não emitimos recomendações individuais de investimento, carteiras recomendadas ou relatórios de compra/venda (Resolução CVM 19/20).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e25c5c] mt-1.5 shrink-0" />
                    <span><strong>Não é Banco ou Financeira:</strong> Não realizamos captação de depósitos, empréstimos ou concessão de crédito.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e25c5c] mt-1.5 shrink-0" />
                    <span><strong>Não Promete Rentabilidade:</strong> Nenhum dado aqui divulgado constitui garantia de retorno sobre o capital investido.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Pilares Institucionais */}
          <section className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6] tracking-tight flex items-center gap-2.5">
              <Award className="w-6 h-6 text-[#d4af6a]" />
              <span>Nossos Pilares Fundamentais</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-5 rounded-[14px] bg-[#141210] border border-[#d4af6a]/15 space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#d4af6a]/10 border border-[#d4af6a]/20 flex items-center justify-center text-[#d4af6a]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-[#f5efe6] text-base">Rigor nos Dados</h3>
                <p className="text-xs text-[#a39a8c] leading-relaxed">
                  Tratamos a integridade dos dados com seriedade científica. Se um indicador estiver fora do ar, mostramos claramente o status em vez de disfarçá-lo com simulações fictícias.
                </p>
              </div>

              <div className="p-5 rounded-[14px] bg-[#141210] border border-[#d4af6a]/15 space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#d4af6a]/10 border border-[#d4af6a]/20 flex items-center justify-center text-[#d4af6a]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-[#f5efe6] text-base">Pedagogia Direta</h3>
                <p className="text-xs text-[#a39a8c] leading-relaxed">
                  Traduzimos siglas financeiras complexas (como CDI, Selic, PTAX, DY e P/L) em conceitos práticos aplicáveis à realidade do poupador e investidor brasileiro.
                </p>
              </div>

              <div className="p-5 rounded-[14px] bg-[#141210] border border-[#d4af6a]/15 space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#d4af6a]/10 border border-[#d4af6a]/20 flex items-center justify-center text-[#d4af6a]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-[#f5efe6] text-base">Design & Foco</h3>
                <p className="text-xs text-[#a39a8c] leading-relaxed">
                  Interface limpa, rápida e desprovida de anúncios intrusivos ou banners promocionais de corretoras, priorizando a leitura tranquila dos mercados.
                </p>
              </div>
            </div>
          </section>

          {/* Quem somos / Comunidade */}
          <section className="p-6 sm:p-8 rounded-[16px] bg-[#141210] border border-[#d4af6a]/20 space-y-3">
            <h3 className="text-lg font-serif font-bold text-[#f5efe6] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#d4af6a]" />
              <span>Para Quem Este Portal Foi Criado</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#c2b9ac] leading-relaxed">
              O {APP_NAME} foi projetado tanto para o investidor iniciante que busca entender a rentabilidade real de sua reserva de emergência em comparação ao CDI e à inflação (IPCA), quanto para o investidor experiente que valoriza um painel estético, minimalista e confiável para acompanhar o pulso dos ativos brasileiros no dia a dia.
            </p>
          </section>

          {/* Nav links */}
          <div className="pt-6 border-t border-[#d4af6a]/15 flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/metodologia"
              className="inline-flex items-center gap-2 text-sm text-[#f0d9a8] hover:text-[#f5efe6] font-medium transition-colors"
            >
              <span>Ver metodologia e fontes de dados</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/contato"
              className="inline-flex items-center gap-2 text-sm text-[#a39a8c] hover:text-[#f0d9a8] transition-colors"
            >
              <span>Fale com nossa equipe</span>
            </Link>
          </div>

        </div>
      </article>
    </div>
  );
};
