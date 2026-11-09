import React from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { APP_NAME } from '../constants/config';
import {
  Database,
  Cpu,
  TrendingUp,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Scale,
  FileCode,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MethodologyPage: React.FC = () => {
  usePageMeta(
    `Metodologia & Fontes de Dados | ${APP_NAME}`,
    'Conheça a metodologia técnica, fontes oficiais (B3, Bacen, CoinGecko), filtros de liquidez dos rankings, regras de validação da Selic/PTAX e as limitações didáticas da IA.'
  );

  return (
    <div>
      <PageHeader
        badge="Transparência & Rigor Técnico"
        badgeColor="gold"
        title="Metodologia &"
        titleHighlight="Fontes de Dados"
        subtitle="Entenda como os dados são coletados, validados e processados em tempo hábil, os critérios de liquidez dos rankings e o caráter didático de nossas análises."
        breadcrumbs={[{ label: 'Metodologia' }]}
      />

      <article className="py-16 sm:py-24 bg-[#0b0a09]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-[#c2b9ac] text-sm sm:text-base leading-relaxed">

          {/* Intro Box */}
          <div className="p-6 sm:p-8 rounded-[16px] bg-[#141210] border border-[#d4af6a]/25 shadow-lg space-y-4">
            <div className="flex items-center gap-2.5 text-xs font-mono font-semibold text-[#f0d9a8] uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-[#d4af6a]" />
              <span>Compromisso com Dados Oficiais Auditáveis</span>
            </div>
            <p className="text-[#f5efe6] font-normal leading-relaxed">
              O <strong>{APP_NAME}</strong> foi construído sobre uma premissa fundamental: transparência total. Não utilizamos valores simulados ou números arbitrários para criar falsa sensação de atividade. Todas as cotações, taxas macroeconômicas e curvas de rendimento originam-se de repositórios públicos oficiais ou APIs estruturadas do mercado financeiro.
            </p>
          </div>

          {/* Section 1: Fontes de Dados */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#d4af6a]/15 border border-[#d4af6a]/30 flex items-center justify-center text-[#d4af6a]">
                <Database className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6] tracking-tight">
                1. Mapeamento de Fontes de Dados
              </h2>
            </div>

            <p>
              Cada indicador exibido na plataforma possui uma origem oficial devidamente rastreada e validada no servidor:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-[12px] bg-[#141210] border border-[#d4af6a]/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#f0d9a8] uppercase">B3 (Ações & FIIs)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#d4af6a]/10 text-[#d4af6a]">brapi.dev</span>
                </div>
                <p className="text-xs text-[#a39a8c] leading-relaxed">
                  Cotações de abertura, fechamento, máximas, mínimas, variação percentual e histórico de preços de ações ordinárias (ON) e preferenciais (PN) negociadas na B3.
                </p>
              </div>

              <div className="p-5 rounded-[12px] bg-[#141210] border border-[#d4af6a]/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#f0d9a8] uppercase">Bacen SGS (Macroeconomia)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#d4af6a]/10 text-[#d4af6a]">SGS Bacen</span>
                </div>
                <p className="text-xs text-[#a39a8c] leading-relaxed">
                  Sistema Gerenciador de Séries Temporais do Banco Central: Selic Meta (série 432), CDI Diário e Acumulado (série 4389) e IPCA mensal acumulado (série 13522).
                </p>
              </div>

              <div className="p-5 rounded-[12px] bg-[#141210] border border-[#d4af6a]/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#f0d9a8] uppercase">Câmbio Oficial PTAX</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#d4af6a]/10 text-[#d4af6a]">Olinda OData Bacen</span>
                </div>
                <p className="text-xs text-[#a39a8c] leading-relaxed">
                  Taxas PTAX do Banco Central para Dólar Americano (<code className="text-[#f0d9a8]">CotacaoDolarPeriodo</code>) e Euro (<code className="text-[#f0d9a8]">CotacaoMoedaPeriodo</code> com moeda EUR), calculadas pela média ponderada das operações interbancárias.
                </p>
              </div>

              <div className="p-5 rounded-[12px] bg-[#141210] border border-[#d4af6a]/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#f0d9a8] uppercase">Criptoativos</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#d4af6a]/10 text-[#d4af6a]">CoinGecko API</span>
                </div>
                <p className="text-xs text-[#a39a8c] leading-relaxed">
                  Preços de mercado em Real (BRL) e Dólar (USD), volume negociado em 24h e sparklines reais de 7 dias para Bitcoin (BTC), Ethereum (ETH) e Solana (SOL).
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Frequência e Atraso */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#d4af6a]/15 border border-[#d4af6a]/30 flex items-center justify-center text-[#d4af6a]">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6] tracking-tight">
                2. Frequência de Atualização e Atraso Indicativo
              </h2>
            </div>

            <p>
              A plataforma adota uma política de atualização por lotes no servidor a cada <strong>60 segundos</strong> (<code className="text-[#f0d9a8]">AUTO_REFRESH_SECONDS = 60</code>). Essa arquitetura garante responsividade imediata para o usuário final sem sobrecarregar as APIs provedoras nem expor chaves de acesso no navegador.
            </p>

            <ul className="list-disc pl-5 space-y-2 marker:text-[#d4af6a]">
              <li>
                <strong>Cotações da B3:</strong> Seguem o regime de cotações com atraso indicativo de aproximadamente 15 minutos em relação ao livro de ofertas em tempo real da bolsa, padrão em plataformas de cunho educacional e não profissional.
              </li>
              <li>
                <strong>Câmbio PTAX:</strong> A taxa PTAX não é uma cotação contínua de balcão; trata-se de uma média aritmética apurada pelo Banco Central em 4 janelas diárias de consulta. Ela é consolidada pelo Bacen ao final do dia útil (geralmente por volta das 13h30 para a prévia e 18h00 para a taxa de fechamento).
              </li>
              <li>
                <strong>Taxa Selic & CDI:</strong> A Selic Meta é fixada pelo Copom a cada 45 dias, enquanto a taxa Selic Over e o CDI são divulgados pela B3 ao final de cada dia útil.
              </li>
            </ul>
          </section>

          {/* Section 3: Validação Selic e PTAX */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#d4af6a]/15 border border-[#d4af6a]/30 flex items-center justify-center text-[#d4af6a]">
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6] tracking-tight">
                3. Obtenção e Validação do CDI, Selic e PTAX
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-[12px] bg-[#141210] border border-[#d4af6a]/15 space-y-3">
                <h3 className="font-serif font-bold text-[#f5efe6] text-base">
                  Rigor na Série 432 (Taxa Selic)
                </h3>
                <p className="text-xs text-[#c2b9ac] leading-relaxed">
                  O endpoint do Banco Central pode retornar previsões futuras ou deliberações de reuniões do Copom agendadas com datas além do dia de hoje. Nossa rotina no servidor:
                </p>
                <ol className="list-decimal pl-5 text-xs text-[#a39a8c] space-y-1.5 font-mono">
                  <li>Consulta os últimos 10 registros da série 432 do Bacen.</li>
                  <li>Filtra estritamente registros cuja data seja menor ou igual à data atual (horário de Brasília).</li>
                  <li>Despeja registros futuros ou sem valor numérico válido, contabilizando-os para fins de auditoria no diagnóstico.</li>
                  <li>Se todos os registros forem descartados ou inválidos, exibe o estado explícito "Indisponível", jamais inventando números substitutos.</li>
                </ol>
              </div>

              <div className="p-5 rounded-[12px] bg-[#141210] border border-[#d4af6a]/15 space-y-3">
                <h3 className="font-serif font-bold text-[#f5efe6] text-base">
                  Cálculo do PTAX (Dólar & Euro) e Variação Útil
                </h3>
                <p className="text-xs text-[#c2b9ac] leading-relaxed">
                  Para acomodar fins de semana e feriados em que o mercado cambial interbancário não opera:
                </p>
                <ol className="list-decimal pl-5 text-xs text-[#a39a8c] space-y-1.5 font-mono">
                  <li>Consultamos a API Olinda para uma janela retroativa de 7 dias corridos.</li>
                  <li>Extraímos a cotação de venda (<code className="text-[#f0d9a8]">cotacaoVenda</code>) mais recente homologada e a data de fechamento correspondente.</li>
                  <li>Identificamos a cotação útil imediatamente anterior da mesma série.</li>
                  <li>Calculamos a variação percentual exata: <code className="text-[#f0d9a8]">((cotacaoAtual - cotacaoAnterior) / cotacaoAnterior) * 100</code>.</li>
                  <li>Exibimos no cabeçalho o rótulo oficial "Dólar PTAX" ou "Euro PTAX" acompanhado da data exata da cotação ("PTAX de dd/mm").</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Section 4: Rankings de Maiores Altas e Baixas */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#d4af6a]/15 border border-[#d4af6a]/30 flex items-center justify-center text-[#d4af6a]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6] tracking-tight">
                4. Metodologia dos Rankings (Altas e Baixas)
              </h2>
            </div>

            <p>
              Muitos portais exibem distorções nos rankings de maiores variações, como ações em centavos (penny stocks) que oscilam 50% com uma ordem de R$ 100, ou misturam fundos imobiliários com ações. No {APP_NAME}, aplicamos regras estritas de integridade:
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 rounded-[10px] bg-[#141210] border border-[#d4af6a]/15 flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#d4af6a] mt-1 shrink-0" />
                <div>
                  <strong className="text-[#f5efe6]">Somente Ações de Empresas:</strong>
                  <p className="text-[#a39a8c] mt-0.5 font-sans">
                    FIIs (fundos com final 11) e ETFs (como BOVA11, SMAL11) são excluídos da lista de ações para assegurar comparabilidade setorial homogênea.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-[10px] bg-[#141210] border border-[#d4af6a]/15 flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#d4af6a] mt-1 shrink-0" />
                <div>
                  <strong className="text-[#f5efe6]">Filtro de Preço Mínimo (R$ 1,00):</strong>
                  <p className="text-[#a39a8c] mt-0.5 font-sans">
                    Ativos cotados abaixo de R$ 1,00 são desconsiderados dos rankings para mitigar distorções de arredondamento e volatilidade artificial.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-[10px] bg-[#141210] border border-[#d4af6a]/15 flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#d4af6a] mt-1 shrink-0" />
                <div>
                  <strong className="text-[#f5efe6]">Volume Financeiro Mínimo Diário:</strong>
                  <p className="text-[#a39a8c] mt-0.5 font-sans">
                    Configurado em <code className="text-[#f0d9a8]">MIN_VOLUME_RANKINGS = R$ 500.000,00</code>. Exclui ativos ilíquidos cujas oscilações não refletem negociação real de mercado.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-[10px] bg-[#141210] border border-[#d4af6a]/15 flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#d4af6a] mt-1 shrink-0" />
                <div>
                  <strong className="text-[#f5efe6]">Sparklines Históricas Reais:</strong>
                  <p className="text-[#a39a8c] mt-0.5 font-sans">
                    Os mini-gráficos representam a série temporal real do pregão. Caso o histórico esteja incompleto ou indisponível, o gráfico é ocultado, recusando o uso de curvas decorativas fixas.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: IA e Limitações */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#d4af6a]/15 border border-[#d4af6a]/30 flex items-center justify-center text-[#d4af6a]">
                <Cpu className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f5efe6] tracking-tight">
                5. Como a Inteligência Artificial Opera e Suas Limitações
              </h2>
            </div>

            <p>
              O motor de IA do portal utiliza o modelo <strong>Google Gemini</strong> operando em ambiente de servidor (seguro e sem exposição de credenciais). Sua função é estritamente pedagógica: sintetizar em linguagem acessível o que os dados públicos indicam.
            </p>

            <div className="p-6 rounded-[14px] bg-[#141210] border border-[#d4af6a]/25 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#f0d9a8] uppercase">
                <ShieldAlert className="w-4 h-4 text-[#d4af6a]" />
                <span>Limitações Técnicas e Regulatórias Cruciais</span>
              </div>
              <ul className="text-xs sm:text-sm text-[#c2b9ac] space-y-2 list-disc pl-5">
                <li>
                  <strong>Ausência de Predição do Futuro:</strong> A IA analisa padrões passados e contextos públicos já conhecidos. Ela não prevê preços de fechamento futuros e não possui bola de cristal.
                </li>
                <li>
                  <strong>Dados Públicos Apenas:</strong> Não há utilização de informações privilegiadas ou dados internos não públicos de companhias abertas.
                </li>
                <li>
                  <strong>Não é Consultoria ou Recomendação:</strong> As hipóteses geradas servem para exercitar o raciocínio analítico do estudante ou investidor. Nenhuma síntese gerada pela IA constitui orientação de compra, venda ou alocação patrimonial (Resoluções CVM nº 19 e 20).
                </li>
              </ul>
            </div>
          </section>

          {/* Links Section */}
          <div className="pt-6 border-t border-[#d4af6a]/15 flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/sobre"
              className="inline-flex items-center gap-2 text-sm text-[#f0d9a8] hover:text-[#f5efe6] font-medium transition-colors"
            >
              <span>Conheça nossa missão institucional</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/faq"
              className="inline-flex items-center gap-2 text-sm text-[#a39a8c] hover:text-[#f0d9a8] transition-colors"
            >
              <span>Dúvidas Frequentes (FAQ)</span>
            </Link>
          </div>

        </div>
      </article>
    </div>
  );
};
