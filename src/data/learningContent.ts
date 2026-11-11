import { LearnTopic } from '../types/market';

export const LEARN_TOPICS: LearnTopic[] = [
  {
    id: 'o-que-e-acao',
    title: 'O que é uma Ação e como funciona a B3?',
    subtitle: 'Compreenda a menor fração do capital social de uma empresa e o pregão brasileiro.',
    category: 'Renda Variável',
    readTime: '3 min',
    iconName: 'Building2',
    interactiveToolId: 'socio-b3',
    content: {
      intro: 'Uma ação representa uma fração mínima do patrimônio de uma empresa de capital aberto. Ao comprar uma ação, você não está comprando um bilhete de loteria: você se torna sócio da companhia, participando diretamente de seus lucros e de seu crescimento futuro.',
      sections: [
        {
          heading: 'A B3: Onde tudo acontece',
          text: 'A B3 (Brasil, Bolsa, Balcão) é a bolsa de valores oficial do Brasil, sediada em São Paulo. Ela é o ambiente seguro e regulado pela CVM (Comissão de Valores Mobiliários) onde compradores e vendedores se encontram eletronicamente todos os dias úteis entre 10h e 17h.',
          highlight: 'O código de negociação (ticker) é composto por 4 letras e um número: ações ordinárias (ON) terminam em 3 e preferenciais (PN) em 4.',
          breakdown: [
            {
              label: 'Ações Ordinárias (ON - Final 3)',
              badge: 'Voto',
              description: 'Ex: PETR3, VALE3, BBAS3. Conferem direito a voto nas assembleias de acionistas e proteção de Tag Along.',
            },
            {
              label: 'Ações Preferenciais (PN - Final 4)',
              badge: 'Dividendos',
              description: 'Ex: PETR4, ITUB4, BBDC4. Têm prioridade legal na distribuição de dividendos e proventos em dinheiro.',
            },
            {
              label: 'Units (Final 11)',
              badge: 'Pacote',
              description: 'Ex: TAEE11, SANB11. Pacotes negociados juntos contendo tanto ações ON quanto PN da mesma empresa.',
            },
          ],
        },
        {
          heading: 'Como o investidor ganha dinheiro com ações?',
          text: 'Existem duas avenidas fundamentais de ganho no mercado de capitais brasileiro:\n\n1. Valorização Patrimonial: Conforme a empresa fatura mais, abre novas filiais e expande seus lucros, o valor de mercado de cada cota tende a subir no longo prazo.\n\n2. Proventos Recorrentes: A distribuição de lucros em dinheiro direto na sua conta da corretora (dividendos e JCP).',
        },
      ],
      realCase: {
        title: 'Estudo de Caso Real: Itaú Unibanco (ITUB4)',
        ticker: 'ITUB4',
        description: 'Um investidor que comprou ações do Itaú e reinvestiu os proventos durante 10 anos não apenas multiplicou seu patrimônio como hoje recebe mensalmente uma renda em proventos que supera o valor investido originalmente.',
        takeaway: 'O segredo não é prever a cotação de amanhã, mas ser sócio de negócios lucrativos e perenes por décadas.',
      },
      summary: 'Comprar ações é tornar-se sócio de negócios reais. Os preços oscilam diariamente no pregão por oferta e demanda de curto prazo, mas o valor real de uma ação acompanha a curva de lucro líquido da empresa no longo prazo.',
      cautionNote: 'Ações não garantem retorno fixo e seu valor oscila diariamente. Nunca coloque seu dinheiro de reserva de emergência em ações.',
    },
    quiz: [
      {
        question: 'O que você de fato adquire ao comprar 100 ações de uma empresa na B3?',
        options: [
          'Um empréstimo que a empresa deve devolver com juros garantidos',
          'Uma fração de sociedade com direito a participar dos lucros e crescimento da empresa',
          'Um título de dívida pública emitido pelo Banco Central',
          'Um contrato de aposta sobre a variação do dólar americano',
        ],
        correctIndex: 1,
        explanation: 'Ao comprar ações, você se torna co-proprietário de uma fatia da empresa. Seu retorno vem do lucro das operações reais e do crescimento do negócio ao longo dos anos.',
      },
      {
        question: 'Qual a principal diferença entre uma ação ordinária (PETR3) e uma preferencial (PETR4)?',
        options: [
          'A PETR3 é mais barata e a PETR4 é exclusiva para bilionários',
          'A ação ON (final 3) confere direito a voto, enquanto a PN (final 4) tem prioridade legal no recebimento de dividendos',
          'A PETR4 rende juros fixos como se fosse poupança',
          'Nenhuma, são apenas códigos aleatórios criados pelas corretoras',
        ],
        correctIndex: 1,
        explanation: 'Ações ON (final 3) dão direito a voto nas assembleias de acionistas. Ações PN (final 4) não votam, mas têm preferência e vantagens na hora de receber dividendos.',
      },
      {
        question: 'Como um investidor de longo prazo ganha dinheiro de verdade com ações na B3?',
        options: [
          'Tentando acertar a oscilação de centavos no pregão todos os dias úteis',
          'Por meio da valorização do patrimônio das empresas ao longo do tempo e do recebimento de proventos em dinheiro',
          'Comprando e vendendo no mesmo dia para pagar taxas de corretagem para o banco',
          'Esperando que a Bolsa feche para sacar o dinheiro no caixa eletrônico',
        ],
        correctIndex: 1,
        explanation: 'O ganho sustentável no mercado de ações vem de duas fontes: a multiplicação do valor da empresa conforme seu faturamento e lucro crescem, e o fluxo de dividendos e JCP depositados diretamente na conta.',
      },
    ],
  },
  {
    id: 'o-que-e-cdi',
    title: 'O que é o CDI e a taxa Selic?',
    subtitle: 'O termômetro de juros que dita o rendimento dos seus investimentos em Renda Fixa.',
    category: 'Renda Fixa',
    readTime: '3 min',
    iconName: 'Percent',
    interactiveToolId: 'termometro-cdi',
    content: {
      intro: 'O CDI (Certificado de Depósito Interbancário) e a Selic (Sistema Especial de Liquidação e Custódia) são os dois maiores termômetros da economia brasileira. Eles formam a régua mínima de remuneração de qualquer investimento sério no país.',
      sections: [
        {
          heading: 'A Taxa Selic: A taxa mãe da economia',
          text: 'Definida a cada 45 dias pelo Copom (Comitê de Política Monetária do Banco Central), a Selic Meta é a taxa básica de juros do Brasil. Se a inflação sobe, o Banco Central eleva a Selic para esfriar o consumo; se a inflação cai, ele reduz os juros para estimular a economia.',
          highlight: 'Quando a Selic sobe, o crédito para comprar carros ou imóveis encarece, mas os investimentos em Renda Fixa pagam rendimentos recordes.',
        },
        {
          heading: 'O CDI: O benchmark dos bancos privados',
          text: 'Por determinação legal, nenhum banco no Brasil pode fechar o dia com o caixa no negativo. Os bancos com excesso de depósitos emprestam dinheiro para os bancos deficitários por apenas 24 horas. A taxa média cobrada nesses empréstimos interbancários diários é o CDI.',
          highlight: 'Na prática diária, o CDI anda rigorosamente colado na Selic, ficando quase sempre 0,10 ponto percentual abaixo da taxa básica.',
          breakdown: [
            {
              label: '100% do CDI',
              badge: 'Padrão',
              description: 'Rende exatamente a taxa interbancária. É o mínimo aceitável para qualquer reserva de emergência (ex: CDB de liquidez diária ou Nubank/Inter).',
            },
            {
              label: 'CDB 110% a 120% do CDI',
              badge: 'Bancos Médios',
              description: 'Bancos médios pagam acima do CDI para captar recursos, com proteção do FGC (Fundo Garantidor de Créditos) até R$ 250 mil por CPF.',
            },
            {
              label: 'Tabela Regressiva de IR',
              badge: 'Imposto',
              description: 'Até 180 dias: 22,5% | 181 a 360 dias: 20% | 361 a 720 dias: 17,5% | Acima de 720 dias: 15% (menor alíquota).',
            },
          ],
        },
      ],
      realCase: {
        title: 'O Mito da Poupança vs. Tesouro Selic',
        description: 'Milhões de brasileiros ainda mantêm reservas na Poupança rendendo cerca de 6% ao ano, enquanto o Tesouro Selic e CDBs 100% do CDI chegam a render mais que o dobro (acima de 12% a 13% líquidos), com risco governamental ou garantia do FGC.',
        takeaway: 'Deixar dinheiro na Poupança com Selic de dois dígitos é perder poder de compra real para a inflação todos os meses.',
      },
      summary: 'A Selic é fixada pelo Banco Central; o CDI é a taxa real do mercado financeiro. Ambos formam o piso de rendimento do dinheiro no Brasil e servem de régua para comparar qualquer ativo.',
      cautionNote: 'Títulos pós-fixados ao CDI têm retorno flutuante. Se o Banco Central iniciar um ciclo de corte de juros, a rentabilidade nominal em reais diminui mês a mês.',
    },
    quiz: [
      {
        question: 'Quando um banco oferece um CDB pagando "100% do CDI", o que isso significa?',
        options: [
          'Que seu dinheiro vai dobrar de valor a cada 100 dias corridos',
          'Que a aplicação rende exatamente a taxa média dos empréstimos interbancários do Brasil (muito próxima à Selic)',
          'Que você só pode resgatar o dinheiro se o Banco Central autorizar',
          'Que você é obrigado a pagar 100% de imposto sobre o lucro',
        ],
        correctIndex: 1,
        explanation: '100% do CDI significa que o investimento acompanha exatamente a taxa de juros praticada entre os bancos brasileiros. Se o CDI está em 13% ao ano, você recebe 13% ao ano antes do Imposto de Renda.',
      },
      {
        question: 'Por que o CDI geralmente fica cerca de 0,10% abaixo da taxa Selic?',
        options: [
          'Porque os bancos cobram uma taxa de administração fixa para calcular a média',
          'Porque a Selic Meta é a meta do governo, e o CDI reflete as operações diárias de liquidação entre os próprios bancos privados com títulos públicos',
          'Porque o Banco Central retém 0,10% de imposto direto na fonte',
          'É uma coincidência matemática sem explicação econômica',
        ],
        correctIndex: 1,
        explanation: 'A Selic é a meta anual do governo, enquanto o CDI é a taxa efetiva real negociada nos empréstimos de 1 dia entre as instituições financeiras com lastro em títulos.',
      },
      {
        question: 'Na tabela regressiva do Imposto de Renda sobre Renda Fixa, qual é a menor alíquota e quando ela é atingida?',
        options: [
          '0% de imposto após 30 dias corridos de investimento',
          '15% de imposto sobre o lucro, atingida para investimentos mantidos por mais de 720 dias (2 anos)',
          '22,5% após 1 ano de aplicação no Tesouro Direto',
          '10% retidos a qualquer momento pelo FGC',
        ],
        correctIndex: 1,
        explanation: 'A tabela regressiva de IR premia quem deixa o dinheiro render por mais tempo: começa em 22,5% (até 180 dias) e cai até a alíquota mínima de 15% após 720 dias (2 anos) de aplicação.',
      },
    ],
  },
  {
    id: 'o-que-sao-dividendos',
    title: 'O que são Dividendos e Proventos?',
    subtitle: 'A distribuição de lucros reais diretamente na conta da sua corretora.',
    category: 'Renda Passiva',
    readTime: '3 min',
    iconName: 'Coins',
    interactiveToolId: 'bola-de-neve',
    content: {
      intro: 'Dividendos são a parcela do lucro líquido de uma empresa repassada em dinheiro vivo diretamente para os seus acionistas. No Brasil, a Lei das S/A (Lei 6.404) obriga as companhias de capital aberto a distribuir uma parte mínima de seus lucros.',
      sections: [
        {
          heading: 'Dividendos vs. JCP (Juros sobre Capital Próprio)',
          text: 'Ao investir em ações na B3, você receberá dois tipos principais de proventos:\n\n• Dividendos: São isentos de Imposto de Renda para pessoa física. O valor que você vê anunciado é exatamente o valor líquido que cai na sua conta.\n\n• JCP: Tem tributação de 15% retida na fonte pela corretora. A empresa usa esse mecanismo contábil para deduzir impostos de suas despesas financeiras.',
          highlight: 'Dividend Yield (DY): É o percentual que mede quanto a empresa pagou em proventos nos últimos 12 meses em relação ao preço atual da ação. Exemplo: ação a R$ 30,00 que pagou R$ 3,00 de proventos tem DY de 10%.',
        },
        {
          heading: 'A Mágica do Reinvestimento e a Bola de Neve',
          text: 'Se você sacar os dividendos para pagar despesas do dia a dia, sua carteira cresce apenas no ritmo dos seus próprios aportes do salário. Mas se você usar os dividendos recebidos para comprar novas ações imediatamente, você ativa os juros compostos exponenciais:\n\nMais ações geram mais dividendos no próximo trimestre, que por sua vez compram mais ações.',
        },
      ],
      realCase: {
        title: 'Estudo de Caso Real: O Método Barsi e Taesa (TAEE11)',
        ticker: 'TAEE11',
        description: 'Luiz Barsi Filho, o maior investidor individual do Brasil, construiu uma fortuna bilionária com empresas de serviços públicos essenciais (energia, bancos, saneamento) que pagam proventos faça chuva ou faça sol. Ele nunca vendeu suas ações; apenas acumulou e reinvestiu os proventos.',
        takeaway: 'Compre empresas boas pagadoras de proventos, reinvesta cada centavo no início e deixe o tempo trabalhar a seu favor.',
      },
      summary: 'Dividendos são renda passiva legítima gerada por negócios lucrativos. O grande segredo dos investidores de sucesso não é a fórmula milagrosa de compra e venda, mas a disciplina inabalável de reinvestir os proventos recebidos.',
      cautionNote: 'Dividendos passados não representam garantia de proventos futuros. Empresas com lucro em queda ou endividadas podem cortar o pagamento de dividendos de uma hora para outra.',
    },
    quiz: [
      {
        question: 'Qual é o tratamento tributário atual dos dividendos para pessoas físicas no Brasil?',
        options: [
          'São tributados em 27,5% na declaração anual de ajuste do IRPF',
          'São atualmente 100% isentos de Imposto de Renda',
          'Têm cobrança de IOF regressivo nos primeiros 30 dias',
          'Pagam 15% de imposto retido na fonte pela B3',
        ],
        correctIndex: 1,
        explanation: 'No Brasil, os dividendos pagos a pessoas físicas são isentos de Imposto de Renda. Já o JCP (Juros sobre Capital Próprio) sofre retenção de 15% na fonte.',
      },
      {
        question: 'O que significa o indicador Dividend Yield (DY) de 8% em uma ação?',
        options: [
          'Que a empresa garante que suas ações vão subir 8% no pregão de amanhã',
          'Que nos últimos 12 meses a empresa pagou em proventos o equivalente a 8% do preço atual da cotação',
          'Que a empresa reteve 8% do seu salário como taxa de corretagem',
          'Que você tem direito a 8 votos a mais na assembleia da companhia',
        ],
        correctIndex: 1,
        explanation: 'O Dividend Yield relaciona os proventos pagos por ação nos últimos 12 meses com o preço de mercado da cota. DY de 8% indica que para cada R$ 100 investidos, você recebeu R$ 8 em dinheiro vivo.',
      },
      {
        question: 'O que é a chamada "Bola de Neve" dos dividendos e por que ela é tão poderosa?',
        options: [
          'É quando o investidor fica com dívidas acumuladas na corretora',
          'É o reinvestimento contínuo dos proventos recebidos para comprar mais cotas, gerando cada vez mais dividendos sem exigir dinheiro do seu bolso',
          'É o congelamento de contas bancárias em períodos de recessão econômica',
          'É um esquema de pirâmide financeira proibido pela CVM',
        ],
        correctIndex: 1,
        explanation: 'A Bola de Neve é a manifestação prática dos juros compostos: ao reinvestir cada centavo de dividendo para comprar mais ações, a própria carteira passa a se financiar e crescer em ritmo exponencial.',
      },
    ],
  },
  {
    id: 'renda-fixa-vs-variavel',
    title: 'Renda Fixa vs. Renda Variável: Qual a diferença?',
    subtitle: 'Previsibilidade versus potencial de multiplicação: entenda o equilíbrio ideal.',
    category: 'Estratégia',
    readTime: '4 min',
    iconName: 'Scale',
    interactiveToolId: 'balanca-risco',
    content: {
      intro: 'A principal diferença entre Renda Fixa e Renda Variável reside na previsibilidade da remuneração e na relação jurídica que você estabelece com o tomador do seu dinheiro.',
      sections: [
        {
          heading: 'Renda Fixa: Você é o credor do sistema',
          text: 'Ao investir em Renda Fixa (Tesouro Direto, CDBs, LCIs, LCAs, Debêntures), você está emprestando seu capital para o governo federal, para uma instituição bancária ou para uma corporação.\n\nNo ato da aplicação, a regra de remuneração já é 100% conhecida: pode ser prefixada (ex: 12% fixos ao ano) ou pós-fixada (ex: 100% do CDI ou IPCA + 6,5% a.a.).',
          highlight: 'Conta com redes de proteção sólidas: a garantia soberana da União (Tesouro) ou a garantia do FGC até R$ 250 mil por CPF e por instituição financeira.',
        },
        {
          heading: 'Renda Variável: Você é o sócio do negócio',
          text: 'Na Renda Variável (Ações, Fundos Imobiliários, ETFs, Criptomoedas), não existe nenhuma promessa contratual de rentabilidade ou prazo de devolução.\n\nO preço de mercado sobe ou desce todo minuto no pregão eletrônico conforme o apetite dos investidores e os lucros reportados a cada trimestre.',
          highlight: 'Renda Fixa protege o capital e garante liquidez imediata; Renda Variável busca rentabilidade real superior à inflação no longo prazo.',
          breakdown: [
            {
              label: 'Renda Fixa (Segurança & Liquidez)',
              badge: 'Defesa',
              description: 'Indicada para: Reserva de emergência, metas de curto prazo (viagem, entrada de imóvel) e estabilidade emocional.',
            },
            {
              label: 'Renda Variável (Multiplicação & Renda)',
              badge: 'Ataque',
              description: 'Indicada para: Construção de patrimônio de 5 a 30 anos, aposentadoria antecipada e proteção contra a inflação com empresas fortes.',
            },
          ],
        },
      ],
      realCase: {
        title: 'O Erro de Polarizar: O Investidor Maduro não escolhe "Um ou Outro"',
        description: 'Investidores amadores costumam discutir nas redes se "renda fixa morreu" ou se "bolsa é cassino". O investidor profissional usa Renda Fixa como escudo para ter noites de sono tranquilas e Renda Variável como motor para crescer o patrimônio real.',
        takeaway: 'O segredo da tranquilidade financeira é alocar percentuais bem dosados de acordo com o seu momento de vida e tolerância à oscilação.',
      },
      summary: 'Na Renda Fixa você é credor e conhece as regras de antemão; na Renda Variável você é sócio e colhe os frutos do sucesso do negócio. Ambos são complementares e indispensáveis.',
      cautionNote: 'Renda variável exige estômago para suportar quedas momentâneas de 20% a 30% em crises sem vender ativos no desespero.',
    },
    quiz: [
      {
        question: 'Qual é o papel fundamental da Renda Fixa na carteira de um investidor inteligente?',
        options: [
          'Deixar o investidor milionário do dia para a noite com especulação',
          'Servir de reserva de segurança, garantir liquidez para emergências e dar estabilidade à carteira',
          'Evitar que o investidor precise declarar Imposto de Renda no Brasil',
          'Substituir completamente a necessidade de trabalhar',
        ],
        correctIndex: 1,
        explanation: 'A Renda Fixa atua como o escudo da carteira: preserva o patrimônio, rende com previsibilidade e garante que você não precise vender ações com prejuízo em uma emergência pessoal.',
      },
      {
        question: 'O que acontece com o preço de uma ação quando o mercado como um todo entra em crise?',
        options: [
          'O Banco Central intervém e congela os preços para ninguém perder dinheiro',
          'As cotações podem cair substancialmente no pregão por pessimismo e pânico coletivo, mesmo que a empresa continue lucrativa',
          'A empresa é obrigada a devolver o dinheiro investido para todos os acionistas',
          'O investimento é automaticamente cancelado pela B3',
        ],
        correctIndex: 1,
        explanation: 'No curto prazo, as cotações de renda variável refletem as emoções e o fluxo de compra e venda do mercado. Em momentos de pânico, ativos de altíssima qualidade ficam baratos sem que seus fundamentos tenham mudado.',
      },
      {
        question: 'Qual é o limite de cobertura do FGC (Fundo Garantidor de Créditos) para investimentos em Renda Fixa bancária?',
        options: [
          'Até R$ 250.000 por CPF e por instituição financeira (respeitando o teto global de R$ 1 milhão a cada 4 anos)',
          'Cobertura ilimitada para qualquer valor depositado',
          'Apenas R$ 10.000 por correntista',
          'O FGC só protege quem tem conta na poupança da Caixa',
        ],
        correctIndex: 0,
        explanation: 'O FGC assegura até R$ 250 mil por CPF e conglomerado financeiro em CDBs, LCIs, LCAs e depósitos em conta, garantindo segurança patrimonial caso o banco emissor sofra intervenção.',
      },
    ],
  },
  {
    id: 'como-diversificar',
    title: 'Como diversificar sua carteira sem estresse?',
    subtitle: 'Não coloque todos os ovos na mesma cesta: a única refeição grátis do mercado.',
    category: 'Gestão de Risco',
    readTime: '3 min',
    iconName: 'PieChart',
    interactiveToolId: 'resiliencia-carteira',
    content: {
      intro: 'O Prêmio Nobel de Economia Harry Markowitz definiu a diversificação como "a única refeição grátis no mundo das finanças". Ela permite reduzir drasticamente o risco de ruína de uma carteira sem reduzir o seu potencial de retorno.',
      sections: [
        {
          heading: 'A Regra de Ouro dos Setores Descorrelacionados',
          text: 'Diversificar não é comprar 15 ações de construtoras imobiliárias ou 10 fundos imobiliários do mesmo condomínio. Se o setor imobiliário passar por uma crise, toda a sua carteira sofrerá o mesmo impacto simultâneo.\n\nA verdadeira diversificação combina setores que reagem de formas opostas aos mesmos eventos econômicos.',
          highlight: 'Exemplo: Quando a taxa de juros sobe, construtoras e varejistas sofrem, mas bancos lucram com margem financeira e títulos de renda fixa pagam mais.',
          breakdown: [
            {
              label: 'Bancos e Seguradoras',
              badge: 'Financeiro',
              description: 'Ex: Itaú, Bradesco, BB Seguridade. Negócios altamente resilientes que lucram com intermediação e juros altos.',
            },
            {
              label: 'Setor Elétrico e Saneamento',
              badge: 'Perene',
              description: 'Ex: Taesa, Engie, CPFL, Sabesp. Contratos de concessão de 30 anos com receitas corrigidas pela inflação.',
            },
            {
              label: 'Commodities e Exportação',
              badge: 'Dólar',
              description: 'Ex: Vale, Petrobras, Suzano, Klabin. Faturam em moeda forte (dólar) e protegem contra a desvalorização do Real.',
            },
          ],
        },
        {
          heading: 'O Tripé de Proteção Patrimonial Brasileiro',
          text: 'Uma carteira estruturada no Brasil costuma se apoiar em três pilares fundamentais:\n\n1. Liquidez Imediata (Reserva de Emergência): Tesouro Selic ou CDB com liquidez diária.\n2. Renda Passiva Mensal: Fundos Imobiliários (FIIs) com proventos isentos caindo no mês.\n3. Crescimento & Defesa contra a Inflação: Ações de empresas geradoras de caixa e Tesouro IPCA+.',
        },
      ],
      realCase: {
        title: 'O Colapso das Lojas Americanas e a Lição da Concentração',
        description: 'Em 2023, as Lojas Americanas (AMER3) anunciaram uma inconsistência contábil de R$ 20 bilhões e as ações caíram mais de 90% em questão de dias. Quem tinha 100% do patrimônio na empresa perdeu quase tudo. Quem tinha apenas 2% de Americanas em uma carteira com 25 ativos absorveu o choque sem perder o sono.',
        takeaway: 'Nunca aloque uma fatia que você não possa perder em um único ativo ou setor.',
      },
      summary: 'Diversificar protege o investidor contra eventos inesperados de empresas individuais e tranquiliza sua rotina emocional. Espalhe seu patrimônio entre classes e setores distintos.',
      cautionNote: 'Excesso de pulverização (ter 60 ativos com valores pequenos de R$ 50) complica desnecessariamente a declaração de IR sem trazer ganhos de segurança adicionais.',
    },
    quiz: [
      {
        question: 'O que caracteriza uma diversificação verdadeiramente eficaz em uma carteira?',
        options: [
          'Comprar 20 ações diferentes, todas do setor de varejo de moda',
          'Combinar classes e setores descorrelacionados (ex: ações elétricas, bancos, commodities, FIIs e renda fixa)',
          'Ter contas abertas em 10 corretoras de valores diferentes comprando o mesmo ativo',
          'Vender todos os investimentos e comprar apenas dólares em espécie',
        ],
        correctIndex: 1,
        explanation: 'A diversificação real depende da descorrelação: reunir ativos que reagem de formas diferentes aos ciclos econômicos, amortecendo as quedas de um setor com o avanço de outro.',
      },
      {
        question: 'Por que ter uma reserva de emergência em Tesouro Selic antes de investir em ações?',
        options: [
          'Porque a B3 exige comprovante de reserva antes de liberar a compra de ações',
          'Para garantir que, caso surja um imprevisto (saúde, demissão), você não seja forçado a vender suas ações na baixa para pagar contas',
          'Para conseguir descontos nas taxas de corretagem da Bolsa',
          'Porque a reserva de emergência dobra de valor todo ano garantido por lei',
        ],
        correctIndex: 1,
        explanation: 'A reserva de emergência protege seu portfólio de ações. Sem ela, qualquer imprevisto financeiro na sua vida pessoal o obrigará a liquidar posições no pior momento possível.',
      },
      {
        question: 'Qual é o perigo de ter uma carteira ultra-concentrada em apenas 1 ou 2 empresas?',
        options: [
          'Pagar o dobro de taxa de custódia na B3',
          'Ficar exposto ao risco de ruína caso uma fraude contábil, processo bilionário ou falência atinja a companhia',
          'Ter que pagar imposto em dobro na declaração do IRPF',
          'O Banco Central bloquear as compras por 6 meses',
        ],
        correctIndex: 1,
        explanation: 'Mesmo empresas centenárias ou aparentemente sólidas podem enfrentar crises graves inesperadas (como demonstrado pelo caso Americanas). A diversificação elimina o risco específico de falência individual.',
      },
    ],
  },
  {
    id: 'erros-comuns-iniciantes',
    title: 'Os 5 erros mais comuns dos iniciantes',
    subtitle: 'Aprenda com as armadilhas clássicas antes que elas custem o seu suado dinheiro.',
    category: 'Psicologia Financeira',
    readTime: '4 min',
    iconName: 'AlertTriangle',
    interactiveToolId: 'custo-panico',
    content: {
      intro: 'Investir com sucesso tem menos a ver com adivinhar o futuro ou ter um QI genial e muito mais com evitar erros primários de comportamento financeiro que corroem o patrimônio dos iniciantes.',
      sections: [
        {
          heading: '1. Girar a carteira o tempo todo (Overtrading)',
          text: 'Comprar uma ação porque subiu 15% na semana e vender no susto porque recuou 5% no dia seguinte enriquece apenas a corretora com emolumentos e a Receita Federal com impostos. O investidor amador tenta adivinhar o fundo e o topo do mercado, mas acaba sempre comprando na euforia e vendendo no pânico.',
        },
        {
          heading: '2. Investir sem Reserva de Emergência',
          text: 'Colocar todo o dinheiro que tem em ações e fundos imobiliários é a receita perfeita para o desespero. Se o carro quebrar, o cano estourar ou surgir um problema de saúde, você será forçado a resgatar seus ativos no pior momento de mercado.',
          highlight: 'Tenha de 6 a 12 meses do seu custo de vida essencial guardados em CDB 100% do CDI ou Tesouro Selic antes de comprar a primeira ação.',
        },
        {
          heading: '3. Seguir "Dicas Quentes" em Grupos e Redes Sociais',
          text: 'Promessas milagrosas de retorno de "3% ao dia", robôs de inteligência artificial que nunca erram ou "a ação que vai subir 500% no mês que vem" são armadilhas clássicas. Quem realmente tem uma galinha dos ovos de ouro não vende cursos na internet por R$ 49,90.',
        },
        {
          heading: '4. Ficar olhando o aplicativo a cada 5 minutos',
          text: 'A cotação de uma ação oscila centavo a centavo durante o pregão. Ficar olhando o aplicativo o dia todo causa ansiedade desnecessária e estimula decisões impulsivas. Empresas de capital aberto reportam balanços a cada 3 meses; olhar o gráfico a cada 3 minutos não muda o lucro da companhia.',
        },
      ],
      realCase: {
        title: 'A Sabedoria de Peter Lynch sobre Volatilidade',
        description: 'Peter Lynch, gestor lendário do fundo Fidelity Magellan que rendeu 29% ao ano durante 13 anos, observou que muito mais dinheiro foi perdido por investidores tentando prever correções de mercado do que nas próprias correções em si.',
        takeaway: 'O tempo investido no mercado (Time in the Market) sempre supera a tentativa frustrada de adivinhar o momento certo de entrar e sair (Timing the Market).',
      },
      summary: 'Mantenha as regras simples: gaste menos do que ganha, monte sua reserva de emergência, compre frações de empresas e FIIs lucrativos todo mês e concentre sua energia na sua carreira e família.',
      cautionNote: 'Nenhum conhecimento teórico de análise gráfica ou fundamentalista compensa a falta de controle emocional ao ver a carteira oscilar durante uma crise passageira.',
    },
    quiz: [
      {
        question: 'Qual é o maior prejuízo financeiro causado pelo hábito de "girar a carteira" constantemente?',
        options: [
          'O computador esquenta muito durante as ordens no home broker',
          'Você trava perdas no fundo do mercado, paga impostos desnecessários e perde os melhores dias de alta da Bolsa',
          'A CVM bloqueia o CPF por excesso de operações em um único mês',
          'O Banco Central reduz a taxa Selic para punir o especulador',
        ],
        correctIndex: 1,
        explanation: 'Estudos mostram que quem tenta prever os movimentos de curto prazo perde os 10 melhores dias do ano da Bolsa, reduzindo drasticamente o retorno final acumulado em décadas.',
      },
      {
        question: 'O que você deve fazer quando uma ação sólida da sua carteira cai 10% por pessimismo geral do mercado, sem que nada tenha mudado em seus lucros?',
        options: [
          'Vender imediatamente para estancar a dor emocional',
          'Entrar em pânico e mandar mensagem em grupos de redes sociais',
          'Manter a calma, lembrar que você é sócio de uma empresa real e, se tiver recursos livres, aproveitar o desconto para aportar a preço mais vantajoso',
          'Tomar um empréstimo bancário com juros altos para dobrar a aposta',
        ],
        correctIndex: 2,
        explanation: 'Quedas temporárias de preço em empresas de alta qualidade e lucros crescentes são oportunidades de comprar cotas com desconto e aumentar seu Yield on Cost.',
      },
      {
        question: 'Qual é a regra de ouro recomendada para quem quer começar a investir com tranquilidade emocional?',
        options: [
          'Comprar ações com dinheiro emprestado de parentes',
          'Montar uma reserva de emergência de 6 a 12 meses de despesas em renda fixa com liquidez diária antes de aportar em renda variável',
          'Investir 100% em criptomoedas de alta volatilidade recomendadas em vídeos virais',
          'Olhar as cotações de 5 em 5 minutos para vender assim que tiver 1% de lucro',
        ],
        correctIndex: 1,
        explanation: 'A reserva de emergência é a base de toda a saúde financeira. Ela absorve imprevistos do mundo real para que você nunca precise liquidar seus investimentos de longo prazo em momentos inoportunos.',
      },
    ],
  },
];
