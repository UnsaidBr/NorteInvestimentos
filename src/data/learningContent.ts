import { LearnTopic } from '../types/market';

export const LEARN_TOPICS: LearnTopic[] = [
  {
    id: 'o-que-e-acao',
    title: 'O que é uma Ação e como funciona a B3?',
    subtitle: 'Compreenda a menor fração do capital social de uma empresa e o pregão brasileiro.',
    category: 'Renda Variável',
    readTime: '3 min',
    iconName: 'Building2',
    content: {
      intro: 'Uma ação representa uma fração mínima do patrimônio de uma empresa de capital aberto. Ao comprar uma ação, você se torna sócio da companhia, participando de seus lucros e de seu crescimento futuro.',
      sections: [
        {
          heading: 'A B3: Onde tudo acontece',
          text: 'A B3 (Brasil, Bolsa, Balcão) é a bolsa de valores do Brasil, sediada em São Paulo. Ela é o ambiente seguro e regulado onde compradores e vendedores se encontram eletronicamente todos os dias úteis entre 10h e 17h.',
          highlight: 'O código de negociação (ticker) geralmente é composto por 4 letras e um número: ações ordinárias (ON) terminam em 3 e preferenciais (PN) em 4.',
        },
        {
          heading: 'Como o investidor ganha dinheiro?',
          text: 'Existem duas formas principais: pela valorização das cotas ao longo dos anos e pelo recebimento periódico de proventos (dividendos e juros sobre capital próprio).',
        },
      ],
      summary: 'Comprar ações é tornar-se sócio de negócios reais. Os preços oscilam diariamente no pregão por oferta e demanda, mas o valor real se constrói no longo prazo.',
      cautionNote: 'Ações não garantem retorno fixo e seu valor pode oscilar para baixo. Nunca invista reservas de emergência em renda variável.',
    },
  },
  {
    id: 'o-que-e-cdi',
    title: 'O que é o CDI e a taxa Selic?',
    subtitle: 'O termômetro de juros que dita o rendimento dos seus investimentos em Renda Fixa.',
    category: 'Renda Fixa',
    readTime: '3 min',
    iconName: 'Percent',
    content: {
      intro: 'O CDI (Certificado de Depósito Interbancário) e a Selic (Sistema Especial de Liquidação e de Custódia) são as duas taxas mais faladas da economia brasileira e servem de referência para empréstimos e investimentos.',
      sections: [
        {
          heading: 'A Taxa Selic: A taxa mãe da economia',
          text: 'Definida a cada 45 dias pelo Copom (Banco Central), a Selic Meta é a taxa básica de juros do país. Se a Selic sobe, o crédito fica mais caro e os investimentos em renda fixa pagam mais.',
        },
        {
          heading: 'O CDI: O benchmark dos bancos',
          text: 'O CDI é a taxa média pela qual os bancos emprestam dinheiro uns aos outros por apenas 1 dia para fechar o caixa no positivo. Na prática, ele anda colado na Selic (geralmente 0,10 ponto percentual abaixo).',
          highlight: 'Quando um CDB rende "100% do CDI", significa que ele acompanha exatamente o rendimento médio interbancário do país.',
        },
      ],
      summary: 'A Selic é a taxa definida pelo Banco Central; o CDI é a taxa real praticada no mercado bancário. Ambos formam o piso de rendimento do dinheiro no Brasil.',
      cautionNote: 'Investimentos indexados ao CDI variam conforme o Banco Central altera os juros. Quedas na Selic reduzem a remuneração nominal.',
    },
  },
  {
    id: 'o-que-sao-dividendos',
    title: 'O que são Dividendos e Proventos?',
    subtitle: 'A distribuição de lucros reais diretamente na conta da sua corretora.',
    category: 'Renda Passiva',
    readTime: '3 min',
    iconName: 'Coins',
    content: {
      intro: 'Dividendos são a parcela do lucro líquido de uma empresa que é repassada diretamente aos seus acionistas em dinheiro. No Brasil, empresas listadas na B3 são obrigadas por lei a distribuir parte de seus resultados.',
      sections: [
        {
          heading: 'Dividendos vs. JCP (Juros sobre Capital Próprio)',
          text: 'Os dividendos são atualmente isentos de Imposto de Renda para pessoa física. Já o JCP tem retenção de 15% de IR na fonte antes de cair na sua conta da corretora.',
          highlight: 'Dividend Yield (DY): É o indicador percentual que mede quanto a empresa pagou em proventos nos últimos 12 meses em relação ao preço atual da ação.',
        },
        {
          heading: 'A magia do reinvestimento',
          text: 'Ao usar os dividendos recebidos para comprar mais ações da mesma empresa, o investidor acelera o efeito dos juros compostos: mais ações geram mais dividendos no próximo ciclo.',
        },
      ],
      summary: 'Dividendos são renda passiva legítima gerada por empresas lucrativas. O segredo dos grandes investidores é reinvestir esses valores com consistência.',
      cautionNote: 'Dividendos passados não garantem dividendos futuros. Empresas em crise podem suspender ou cortar pagamentos a qualquer momento.',
    },
  },
  {
    id: 'renda-fixa-vs-variavel',
    title: 'Renda Fixa vs. Renda Variável: Qual a diferença?',
    subtitle: 'Previsibilidade versus potencial de multiplicação: entenda o equilíbrio ideal.',
    category: 'Estratégia',
    readTime: '4 min',
    iconName: 'Scale',
    content: {
      intro: 'A principal diferença entre Renda Fixa e Renda Variável está na previsibilidade das regras de remuneração no momento em que você aplica o seu dinheiro.',
      sections: [
        {
          heading: 'Renda Fixa: Você é o credor',
          text: 'Na Renda Fixa (Tesouro Direto, CDB, LCI, LCA), você empresta dinheiro para o governo, bancos ou empresas e sabe antecipadamente a regra de rendimento (ex: 10% fixos ou 100% do CDI). Tem menor volatilidade e proteção de garantias como o FGC.',
        },
        {
          heading: 'Renda Variável: Você é o sócio',
          text: 'Na Renda Variável (Ações, Fundos Imobiliários, ETFs, Cripto), não há nenhuma promessa de retorno. O preço oscila conforme resultados das empresas e humor do mercado.',
          highlight: 'Renda Fixa preserva patrimônio e garante reserva de liquidez; Renda Variável busca rentabilidade real acima da inflação.',
        },
      ],
      summary: 'Não existe um "melhor": uma carteira madura utiliza a Renda Fixa para segurança e tranquilidade, e a Renda Variável para buscar crescimento de longo prazo.',
      cautionNote: 'Renda variável exige estômago para suportar quedas momentâneas de curto prazo sem vender no desespero.',
    },
  },
  {
    id: 'como-diversificar',
    title: 'Como diversificar sua carteira sem estresse?',
    subtitle: 'Não coloque todos os ovos na mesma cesta: a única refeição grátis do mercado.',
    category: 'Gestão de Risco',
    readTime: '3 min',
    iconName: 'PieChart',
    content: {
      intro: 'Diversificar significa espalhar o seu capital entre diferentes classes de ativos, setores da economia e até moedas, reduzindo o risco geral sem sacrificar necessariamente o retorno.',
      sections: [
        {
          heading: 'A regra dos setores descorrelacionados',
          text: 'Se você tiver apenas ações de construtoras, uma alta na taxa de juros pode derrubar toda a sua carteira. Mas se mesclar bancos, energia elétrica, commodities, renda fixa atrelada ao IPCA e exposição cambial, o impacto negativo em um setor é amortecido pelo outro.',
        },
        {
          heading: 'O tripé clássico do investidor brasileiro',
          text: '1. Reserva de Emergência (Tesouro Selic/CDB 100% CDI com liquidez diária).\n2. Proteção contra a Inflação (Tesouro IPCA+).\n3. Geração de Riqueza (Ações B3 e ativos globais).',
          highlight: 'Diversificação não é ter 50 ações diferentes do mesmo setor; é ter classes de ativos que respondem de formas opostas aos ciclos econômicos.',
        },
      ],
      summary: 'A diversificação protege o investidor contra eventos inesperados de empresas individuais e tranquiliza sua rotina emocional.',
      cautionNote: 'Excesso de diversificação com valores pequenos pode pulverizar ganhos e complicar o controle tributário.',
    },
  },
  {
    id: 'erros-comuns-iniciantes',
    title: 'Os 5 erros mais comuns dos iniciantes',
    subtitle: 'Aprenda com as armadilhas clássicas antes que elas custem o seu suado dinheiro.',
    category: 'Psicologia Financeira',
    readTime: '4 min',
    iconName: 'AlertTriangle',
    content: {
      intro: 'Investir com sucesso tem menos a ver com prever o futuro e muito mais com evitar erros básicos que corroem o patrimônio dos iniciantes.',
      sections: [
        {
          heading: '1. Girar a carteira o tempo todo (Overtrading)',
          text: 'Comprar na alta por euforia e vender na baixa por pânico enriquece apenas as taxas de corretagem e a Receita Federal.',
        },
        {
          heading: '2. Investir sem Reserva de Emergência',
          text: 'Entrar na Bolsa sem ter 6 meses de gastos essenciais guardados em liquidez diária obriga você a vender ações no pior momento possível se surgir um imprevisto médico ou perda de emprego.',
        },
        {
          heading: '3. Seguir "dicas quentes" de redes sociais',
          text: 'Influenciadores e grupos de mensagens com promessas milagrosas costumam promover ativos ilíquidos ou especulações de altíssimo risco.',
          highlight: 'Regra de ouro: Se alguém lhe prometer retorno garantido muito acima da Selic sem risco, desconfie imediatamente.',
        },
        {
          heading: '4. Esquecer o Imposto de Renda e 5. Olhar as cotações todo minuto',
          text: 'O mercado de ações recompensa quem tem paciência e disciplina mensal de aportes, não quem assiste o gráfico segundo a segundo.',
        },
      ],
      summary: 'Mantenha a simplicidade: gaste menos do que ganha, monte sua reserva, invista em bons ativos todo mês e foque na sua profissão.',
      cautionNote: 'Nenhum conhecimento teórico substitui a disciplina comportamental ao ver o mercado oscilar.',
    },
  },
];
