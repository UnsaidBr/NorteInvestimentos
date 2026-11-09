import React, { useState } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { APP_NAME, LEGAL_DISCLAIMER } from '../constants/config';
import {
  HelpCircle,
  ChevronDown,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface FaqItem {
  id: string;
  question: string;
  category: 'Geral' | 'Dados & Cotações' | 'Simulador & IA' | 'Regulatório & Segurança';
  answer: React.ReactNode;
}

export const FaqPage: React.FC = () => {
  usePageMeta(
    `Perguntas Frequentes (FAQ) | ${APP_NAME}`,
    `Tire dúvidas sobre as cotações B3, fontes do Banco Central, simulador de CDI com IR, sínteses da IA e o caráter educativo do portal ${APP_NAME}.`
  );

  const [openId, setOpenId] = useState<string | null>('faq-1');
  const [searchTerm, setSearchTerm] = useState('');

  const faqs: FaqItem[] = [
    {
      id: 'faq-1',
      question: `O que é o ${APP_NAME}?`,
      category: 'Geral',
      answer: (
        <p>
          O <strong>{APP_NAME}</strong> é um portal brasileiro de inteligência de mercado e educação financeira. Nosso propósito é descomplicar a B3, as taxas de juros (CDI e Selic) e a inflação (IPCA), oferecendo ferramentas intuitivas de simulação patrimonial e sínteses didáticas auxiliadas por inteligência artificial, sempre com rigor visual e técnico inspirado no private banking.
        </p>
      ),
    },
    {
      id: 'faq-2',
      question: 'O acesso às cotações e ferramentas é gratuito?',
      category: 'Geral',
      answer: (
        <p>
          Sim. Todas as cotações de ações da B3, cotações cambiais oficiais PTAX, criptoativos, notícias de mercado, mini-aulas educativas e o simulador dinâmico de juros compostos são de livre acesso e gratuitos. Oferecemos também o plano <strong>NorteInvest Black</strong> com ferramentas avançadas de inteligência, relatórios aprofundados e histórico expandido de proventos para investidores que desejam um acompanhamento ainda mais completo.
        </p>
      ),
    },
    {
      id: 'faq-3',
      question: 'As sínteses geradas pela Inteligência Artificial são recomendações de investimento?',
      category: 'Simulador & IA',
      answer: (
        <p>
          <strong>Não, de maneira alguma.</strong> O motor de inteligência artificial (Google Gemini) atua como um assistente puramente pedagógico, explicando oscilações passadas, fundamentos contábeis históricos divulgados pelas empresas e conceitos econômicos gerais. Nenhuma síntese constitui recomendação de compra, venda ou alocação patrimonial, em estrita observância às Resoluções CVM nº 19 e 20.
        </p>
      ),
    },
    {
      id: 'faq-4',
      question: 'De onde vêm as cotações e indicadores macroeconômicos?',
      category: 'Dados & Cotações',
      answer: (
        <p>
          Todos os dados derivam de fontes oficiais e públicas auditáveis: cotações da B3 via <em>brapi.dev</em>, taxas Selic (série 432), CDI (série 4389) e IPCA (série 13522) diretamente do Sistema Gerenciador de Séries Temporais (SGS) do Banco Central do Brasil, Dólar e Euro PTAX via API Olinda OData do Bacen, e cotações de criptomoedas via CoinGecko. Não inventamos nem simulamos cotações arbitrariamente.
        </p>
      ),
    },
    {
      id: 'faq-5',
      question: 'Com que frequência as informações do portal são atualizadas?',
      category: 'Dados & Cotações',
      answer: (
        <p>
          Nossos servidores consultam e renovam os dados a cada <strong>60 segundos</strong>. As cotações da B3 operam com o atraso indicativo usual de 15 minutos dos provedores públicos de mercado, perfeitamente adequado para acompanhamento analítico e educacional. O câmbio PTAX segue o calendário oficial do Banco Central com consolidação ao término dos dias úteis.
        </p>
      ),
    },
    {
      id: 'faq-6',
      question: 'Como são calculados os rankings de Maiores Altas e Maiores Baixas?',
      category: 'Dados & Cotações',
      answer: (
        <p>
          Para assegurar que o ranking reflita o mercado real e não distorções estatísticas, aplicamos três filtros rigorosos: <strong>(1)</strong> consideramos exclusivamente ações de empresas (ON e PN), excluindo fundos imobiliários e fundos de índice (ETFs); <strong>(2)</strong> exigimos preço mínimo de corte de R$ 1,00 para descartar ações em centavos (penny stocks); e <strong>(3)</strong> aplicamos um volume financeiro mínimo negociado no dia (R$ 500 mil) para eliminar ativos ilíquidos sem representatividade.
        </p>
      ),
    },
    {
      id: 'faq-7',
      question: 'Como funciona o simulador de investimentos e a tabela regressiva de IR?',
      category: 'Simulador & IA',
      answer: (
        <p>
          O simulador calcula o rendimento do CDI atual de forma 100% dinâmica. Ele desconta a alíquota regressiva oficial do Imposto de Renda sobre aplicações financeiras no Brasil: <strong>22,5%</strong> até 180 dias; <strong>20,0%</strong> de 181 a 360 dias; <strong>17,5%</strong> de 361 a 720 dias; e <strong>15,0%</strong> acima de 720 dias. O cenário comparativo com a Bolsa/Ibovespa é explicitamente rotulado como cenário hipotético com rentabilidade anual estimada editável pelo usuário.
        </p>
      ),
    },
    {
      id: 'faq-8',
      question: 'A NorteInvest é uma corretora de valores? Posso depositar dinheiro aqui para investir?',
      category: 'Regulatório & Segurança',
      answer: (
        <p>
          <strong>Não.</strong> A {APP_NAME} não é corretora, distribuidora de títulos e valores mobiliários nem instituição bancária. Não recebemos depósitos, não mantemos custódia de recursos financeiros de terceiros e não emitimos ordens de compra e venda no pregão da B3. Todas as aplicações práticas devem ser executadas pelo próprio investidor através de uma corretora autorizada e fiscalizada pelo Banco Central e pela CVM.
        </p>
      ),
    },
    {
      id: 'faq-9',
      question: 'Como a plataforma protege os meus dados pessoais e endereço de e-mail?',
      category: 'Regulatório & Segurança',
      answer: (
        <p>
          Operamos em rigorosa conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018). Coletamos apenas dados estritamente essenciais fornecidos voluntariamente pelo usuário (como e-mail em formulários de contato ou lista de espera) sob conexão segura criptografada (HTTPS/TLS). Jamais comercializamos, alugamos ou compartilhamos dados com terceiros para fins de publicidade dirigida.
        </p>
      ),
    },
    {
      id: 'faq-10',
      question: 'O que significa o selo de dados reais e como posso auditar a origem das informações?',
      category: 'Regulatório & Segurança',
      answer: (
        <p>
          O selo de dados reais atesta que cada valor numérico exibido (cotações, Selic, CDI, PTAX, inflação) originou-se de uma resposta válida de API oficial. No ambiente de desenvolvimento, disponibilizamos um painel aberto de diagnóstico (<code className="text-[#f0d9a8]">/diagnostico</code>) que audita em tempo real a latência, códigos HTTP (200, 429), filtros de registros futuros descartados e inventário dinâmico de contingência de cada provedor.
        </p>
      ),
    },
  ];

  const filteredFaqs = faqs.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAccordion = (id: string) => {
    setOpenId((curr) => (curr === id ? null : id));
  };

  return (
    <div>
      <PageHeader
        badge="Dúvidas & Respostas"
        badgeColor="gold"
        title="Perguntas"
        titleHighlight="Frequentes"
        subtitle="Encontre respostas claras sobre fontes de dados, simulador com imposto de renda, inteligência artificial e nosso papel educativo."
        breadcrumbs={[{ label: 'FAQ' }]}
      />

      <article className="py-16 sm:py-24 bg-[#0b0a09]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#d4af6a] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar dúvida (ex: Selic, simulador, imposto de renda, corretora, IA)..."
              className="w-full pl-11 pr-4 py-3 rounded-[12px] bg-[#141210] border border-[#d4af6a]/25 text-xs sm:text-sm text-[#f5efe6] placeholder-[#8c8273] focus:outline-none focus:border-[#d4af6a] transition-all shadow-inner"
            />
          </div>

          {/* Accordion List */}
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center rounded-[14px] bg-[#141210] border border-[#d4af6a]/15 text-[#a39a8c] text-sm">
                Nenhuma resposta encontrada para &quot;{searchTerm}&quot;. Tente outro termo ou entre em contato direto.
              </div>
            ) : (
              filteredFaqs.map((item, idx) => {
                const isOpen = openId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`rounded-[14px] border transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? 'bg-[#141210] border-[#d4af6a]/40 shadow-md'
                        : 'bg-[#141210]/60 hover:bg-[#141210] border-[#d4af6a]/15'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccordion(item.id)}
                      className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#d4af6a]/10 text-[#f0d9a8]">
                            {item.category}
                          </span>
                          <span className="font-mono text-xs text-[#8c8273]">
                            #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                          </span>
                        </div>
                        <h3 className="font-serif text-base sm:text-lg font-bold text-[#f5efe6] leading-snug">
                          {item.question}
                        </h3>
                      </div>

                      <div
                        className={`w-7 h-7 rounded-full bg-[#1c1916] border border-[#d4af6a]/20 flex items-center justify-center text-[#d4af6a] shrink-0 mt-1 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 bg-[#d4af6a]/15 border-[#d4af6a]' : ''
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-6 sm:px-6 pt-0 text-xs sm:text-sm text-[#c2b9ac] leading-relaxed border-t border-[#d4af6a]/10 mt-1 pt-4">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Legal Notice Banner at the bottom */}
          <div className="p-6 sm:p-8 rounded-[16px] bg-[#141210] border border-[#d4af6a]/30 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-[#f0d9a8] uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-[#d4af6a]" />
              <span>Aviso Legal & Regulatório de Encerramento</span>
            </div>
            <p className="text-xs sm:text-sm text-[#f5efe6] leading-relaxed">
              {LEGAL_DISCLAIMER}
            </p>
            <p className="text-xs text-[#a39a8c] leading-relaxed">
              O portal <strong>{APP_NAME}</strong> e todas as suas ferramentas são exclusivamente direcionados ao aprimoramento da alfabetização financeira dos cidadãos brasileiros. Não substituem o parecer de profissionais de investimento devidamente habilitados e credenciados junto à CVM, ANBIMA ou APIMEC.
            </p>
          </div>

          {/* Bottom navigation links */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <Link
              to="/metodologia"
              className="inline-flex items-center gap-1.5 text-[#f0d9a8] hover:text-[#f5efe6] transition-colors"
            >
              <span>Ver detalhes na Metodologia completa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/contato"
              className="inline-flex items-center gap-1.5 text-[#c2b9ac] hover:text-[#f0d9a8] transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#d4af6a]" />
              <span>Ainda tem dúvidas? Fale conosco</span>
            </Link>
          </div>

        </div>
      </article>
    </div>
  );
};
