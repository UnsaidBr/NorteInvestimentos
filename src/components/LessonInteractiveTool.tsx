import React, { useState, useMemo } from 'react';
import {
  Building2,
  Percent,
  Coins,
  Scale,
  PieChart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  Sliders,
  DollarSign,
  Flame,
} from 'lucide-react';
import { formatBRL } from '../utils/formatters';

interface LessonInteractiveToolProps {
  toolId?: 'socio-b3' | 'termometro-cdi' | 'bola-de-neve' | 'balanca-risco' | 'resiliencia-carteira' | 'custo-panico';
}

export const LessonInteractiveTool: React.FC<LessonInteractiveToolProps> = ({ toolId }) => {
  if (!toolId) return null;

  switch (toolId) {
    case 'socio-b3':
      return <SocioB3Tool />;
    case 'termometro-cdi':
      return <TermometroCdiTool />;
    case 'bola-de-neve':
      return <BolaDeNeveTool />;
    case 'balanca-risco':
      return <BalancaRiscoTool />;
    case 'resiliencia-carteira':
      return <ResilienciaCarteiraTool />;
    case 'custo-panico':
      return <CustoPanicoTool />;
    default:
      return null;
  }
};

/* -------------------------------------------------------------------------- */
/* Tool 1: Simulador de Sócio da B3                                           */
/* -------------------------------------------------------------------------- */
const REAL_COMPANIES = [
  {
    ticker: 'PETR4',
    name: 'Petrobras',
    price: 36.50,
    annualNetProfitBillion: 124.6,
    annualDividendPerShare: 4.80,
    description: 'Maior petroleira da América Latina, refinarias e pré-sal.',
  },
  {
    ticker: 'VALE3',
    name: 'Vale S.A.',
    price: 61.20,
    annualNetProfitBillion: 39.8,
    annualDividendPerShare: 4.60,
    description: 'Maior produtora global de minério de ferro de alta pureza.',
  },
  {
    ticker: 'ITUB4',
    name: 'Itaú Unibanco',
    price: 33.80,
    annualNetProfitBillion: 35.6,
    annualDividendPerShare: 2.75,
    description: 'Maior banco privado do hemisfério sul com presença internacional.',
  },
  {
    ticker: 'WEGE3',
    name: 'WEG S.A.',
    price: 52.40,
    annualNetProfitBillion: 5.7,
    annualDividendPerShare: 1.30,
    description: 'Líder multinacional em motores elétricos, automação e energia limpa.',
  },
];

const SocioB3Tool: React.FC = () => {
  const [selectedTicker, setSelectedTicker] = useState('ITUB4');
  const [investmentAmount, setInvestmentAmount] = useState(3000);

  const company = REAL_COMPANIES.find((c) => c.ticker === selectedTicker) || REAL_COMPANIES[0];
  const sharesBought = Math.floor(investmentAmount / company.price);
  const totalInvested = sharesBought * company.price;
  const estimatedAnnualDividends = sharesBought * company.annualDividendPerShare;
  const dividendYieldPct = (company.annualDividendPerShare / company.price) * 100;

  return (
    <div className="p-5 sm:p-7 rounded-[16px] bg-[#141210] border border-[#d4af6a]/30 space-y-5 font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-[#d4af6a]/15">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#d4af6a]" />
          <h4 className="font-serif font-bold text-base text-[#f5efe6]">
            Simulador Prático: Tornando-se Sócio de uma Gigante da B3
          </h4>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#d4af6a]/15 text-[#f0d9a8]">
          Interativo
        </span>
      </div>

      <p className="text-xs text-[#a39a8c] font-sans">
        Uma ação não é apenas um código piscando na tela: é um pedaço de uma empresa real que lucra todos os dias.
      </p>

      {/* Seletor de Empresa */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {REAL_COMPANIES.map((c) => (
          <button
            key={c.ticker}
            onClick={() => setSelectedTicker(c.ticker)}
            className={`p-2.5 rounded-[10px] text-left border transition-all cursor-pointer ${
              selectedTicker === c.ticker
                ? 'bg-[#d4af6a]/20 border-[#d4af6a] text-[#f5efe6] shadow-md'
                : 'bg-[#1c1916] border-[#d4af6a]/15 text-[#8c8273] hover:text-[#f5efe6]'
            }`}
          >
            <div className="font-bold text-xs text-[#f0d9a8]">{c.ticker}</div>
            <div className="text-[10px] truncate">{c.name}</div>
          </button>
        ))}
      </div>

      {/* Slider de Aporte */}
      <div className="space-y-2 p-3.5 rounded-[12px] bg-[#1c1916]">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#8c8273]">Quanto você quer aplicar para virar sócio?</span>
          <span className="font-bold text-[#f0d9a8]">{formatBRL(investmentAmount)}</span>
        </div>
        <input
          type="range"
          min="500"
          max="30000"
          step="500"
          value={investmentAmount}
          onChange={(e) => setInvestmentAmount(Number(e.target.value))}
          className="w-full accent-[#d4af6a] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[#8c8273]">
          <span>R$ 500</span>
          <span>R$ 15.000</span>
          <span>R$ 30.000</span>
        </div>
      </div>

      {/* Resultados da Sociedade */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/15">
          <span className="text-[10px] text-[#8c8273] block uppercase">Suas Ações Adquiridas</span>
          <span className="text-xl font-bold text-[#f5efe6]">{sharesBought} cotas</span>
          <span className="text-[11px] text-[#8c8273] block mt-0.5">
            a {formatBRL(company.price)} cada
          </span>
        </div>

        <div className="p-3.5 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/15">
          <span className="text-[10px] text-[#8c8273] block uppercase">Lucro Líquido da Empresa</span>
          <span className="text-xl font-bold text-[#3ddc97]">
            R$ {company.annualNetProfitBillion} Bilhões
          </span>
          <span className="text-[11px] text-[#8c8273] block mt-0.5">no último exercício fiscal</span>
        </div>

        <div className="p-3.5 rounded-[10px] bg-[#1c1916] border border-[#3ddc97]/30 shadow-[0_0_12px_rgba(61,220,151,0.1)]">
          <span className="text-[10px] text-[#3ddc97] font-bold block uppercase">
            Seus Proventos Estimados
          </span>
          <span className="text-xl font-bold text-[#3ddc97]">
            +{formatBRL(estimatedAnnualDividends)}/ano
          </span>
          <span className="text-[11px] text-[#f0d9a8] block mt-0.5">
            DY estimado de {dividendYieldPct.toFixed(1)}% ao ano
          </span>
        </div>
      </div>

      <div className="p-3.5 rounded-[10px] bg-[#d4af6a]/10 border border-[#d4af6a]/30 text-xs text-[#f5efe6] font-sans">
        💡 <strong>Conclusão do Sócio:</strong> Comprando {sharesBought} ações da {company.name}, você tem direito direto a uma fatia desse lucro de bilhões. Se a ação cair R$ 1,00 amanhã, o lucro e as operações continuam funcionando.
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Tool 2: Termômetro Selic & CDI ao Vivo                                      */
/* -------------------------------------------------------------------------- */
const TermometroCdiTool: React.FC = () => {
  const [selicRate, setSelicRate] = useState(13.75);
  const [initialCapital, setInitialCapital] = useState(10000);

  const cdiRate = selicRate - 0.10; // regra padrão Bacen
  const poupancaRate = 6.17; // aprox 0,5% am + TR moderada

  // Rentabilidade bruta e líquida em 1 ano (17.5% de IR sobre o lucro)
  const rendimentoPoupanca = initialCapital * (poupancaRate / 100);
  const saldoPoupanca = initialCapital + rendimentoPoupanca;

  const lucroBrutoCdb100 = initialCapital * (cdiRate / 100);
  const lucroLiquidoCdb100 = lucroBrutoCdb100 * (1 - 0.175);
  const saldoCdb100 = initialCapital + lucroLiquidoCdb100;

  const lucroBrutoCdb115 = initialCapital * ((cdiRate * 1.15) / 100);
  const lucroLiquidoCdb115 = lucroBrutoCdb115 * (1 - 0.175);
  const saldoCdb115 = initialCapital + lucroLiquidoCdb115;

  const diferencaPoupancaVsCdb = lucroLiquidoCdb100 - rendimentoPoupanca;

  return (
    <div className="p-5 sm:p-7 rounded-[16px] bg-[#141210] border border-[#d4af6a]/30 space-y-5 font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-[#d4af6a]/15">
        <div className="flex items-center gap-2">
          <Percent className="w-5 h-5 text-[#3ddc97]" />
          <h4 className="font-serif font-bold text-base text-[#f5efe6]">
            Termômetro Selic & CDI: O Impacto Real no Seu Bolso
          </h4>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#3ddc97]/15 text-[#3ddc97] font-bold">
          Renda Fixa
        </span>
      </div>

      {/* Controles: Slider Selic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-3.5 rounded-[12px] bg-[#1c1916] space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-[#8c8273]">Taxa Selic Meta Simulada:</span>
            <span className="font-bold text-[#f0d9a8]">{selicRate.toFixed(2)}% a.a.</span>
          </div>
          <input
            type="range"
            min="6.5"
            max="15.0"
            step="0.25"
            value={selicRate}
            onChange={(e) => setSelicRate(Number(e.target.value))}
            className="w-full accent-[#d4af6a] cursor-pointer"
          />
          <div className="flex items-center justify-between text-[11px] text-[#8c8273]">
            <span>CDI equivalente: <strong className="text-[#f5efe6]">{cdiRate.toFixed(2)}% a.a.</strong></span>
            <button
              onClick={() => setSelicRate(13.75)}
              className="text-[#d4af6a] hover:underline cursor-pointer"
            >
              Restaurar atual
            </button>
          </div>
        </div>

        <div className="p-3.5 rounded-[12px] bg-[#1c1916] space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-[#8c8273]">Valor Aplicado (1 ano):</span>
            <span className="font-bold text-[#f5efe6]">{formatBRL(initialCapital)}</span>
          </div>
          <input
            type="range"
            min="1000"
            max="50000"
            step="1000"
            value={initialCapital}
            onChange={(e) => setInitialCapital(Number(e.target.value))}
            className="w-full accent-[#3ddc97] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#8c8273]">
            <span>R$ 1.000</span>
            <span>R$ 25.000</span>
            <span>R$ 50.000</span>
          </div>
        </div>
      </div>

      {/* Comparativo de 3 Aplicações */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-[12px] bg-[#1c1916] border border-[#ff5c6c]/20">
          <span className="text-[10px] text-[#ff5c6c] font-bold uppercase block">
            Caderneta de Poupança
          </span>
          <span className="text-lg font-bold text-[#f5efe6] mt-1 block">
            {formatBRL(saldoPoupanca)}
          </span>
          <span className="text-xs text-[#8c8273] block mt-1">
            Rendimento: +{formatBRL(rendimentoPoupanca)}
          </span>
          <span className="text-[10px] text-[#ff5c6c] block mt-1 font-sans">
            Isenta de IR, mas perde para o CDI em qualquer cenário
          </span>
        </div>

        <div className="p-4 rounded-[12px] bg-[#1c1916] border border-[#3ddc97]/30 shadow-[0_0_12px_rgba(61,220,151,0.08)]">
          <span className="text-[10px] text-[#3ddc97] font-bold uppercase block">
            CDB 100% do CDI (Líquido)
          </span>
          <span className="text-lg font-bold text-[#3ddc97] mt-1 block">
            {formatBRL(saldoCdb100)}
          </span>
          <span className="text-xs text-[#3ddc97] block mt-1">
            Lucro Líquido: +{formatBRL(lucroLiquidoCdb100)}
          </span>
          <span className="text-[10px] text-[#8c8273] block mt-1 font-sans">
            Já descontado IR de 17,5% da tabela regressiva
          </span>
        </div>

        <div className="p-4 rounded-[12px] bg-[#1c1916] border border-[#d4af6a]/30">
          <span className="text-[10px] text-[#f0d9a8] font-bold uppercase block">
            CDB 115% do CDI (Líquido)
          </span>
          <span className="text-lg font-bold text-[#f0d9a8] mt-1 block">
            {formatBRL(saldoCdb115)}
          </span>
          <span className="text-xs text-[#f0d9a8] block mt-1">
            Lucro Líquido: +{formatBRL(lucroLiquidoCdb115)}
          </span>
          <span className="text-[10px] text-[#8c8273] block mt-1 font-sans">
            Típico de bancos médios garantidos pelo FGC
          </span>
        </div>
      </div>

      <div className="p-3.5 rounded-[10px] bg-[#3ddc97]/10 border border-[#3ddc97]/30 text-xs text-[#f5efe6] font-sans flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-[#3ddc97] shrink-0 mt-0.5" />
        <span>
          Ao trocar a Poupança por um simples CDB 100% do CDI, você ganha{' '}
          <strong className="text-[#3ddc97]">+{formatBRL(diferencaPoupancaVsCdb)} a mais no primeiro ano</strong>, com exatamente o mesmo nível de risco e garantia do FGC até R$ 250 mil.
        </span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Tool 3: Calculadora da Bola de Neve (Reinvestimento)                        */
/* -------------------------------------------------------------------------- */
const BolaDeNeveTool: React.FC = () => {
  const [monthlyAporte, setMonthlyAporte] = useState(1000);
  const [annualYield, setAnnualYield] = useState(9.5);
  const [years, setYears] = useState(10);

  const months = years * 12;
  const monthlyRate = Math.pow(1 + annualYield / 100, 1 / 12) - 1;

  // Sem reinvestir: apenas guarda o aporte e gasta os dividendos
  const totalSemReinvestir = monthlyAporte * months;
  const proventosGastosTotal = monthlyAporte * (annualYield / 100) * ((months * (months + 1)) / (2 * 12));

  // Com reinvestir: juros compostos com FV
  // FV = PMT * ((1 + r)^n - 1) / r
  const totalComReinvestir = monthlyRate > 0
    ? monthlyAporte * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
    : totalSemReinvestir;

  const dividendoMensalFinal = totalComReinvestir * (annualYield / 100 / 12);
  const ganhoExtra = totalComReinvestir - totalSemReinvestir;

  return (
    <div className="p-5 sm:p-7 rounded-[16px] bg-[#141210] border border-[#d4af6a]/30 space-y-5 font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-[#d4af6a]/15">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-400" />
          <h4 className="font-serif font-bold text-base text-[#f5efe6]">
            A Máquina de Renda Passiva: O Efeito Bola de Neve
          </h4>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 font-bold">
          Juros Compostos
        </span>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-[12px] bg-[#1c1916] space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-[#8c8273]">Aporte Mensal:</span>
            <span className="font-bold text-[#f0d9a8]">{formatBRL(monthlyAporte)}</span>
          </div>
          <input
            type="range"
            min="300"
            max="5000"
            step="100"
            value={monthlyAporte}
            onChange={(e) => setMonthlyAporte(Number(e.target.value))}
            className="w-full accent-[#d4af6a] cursor-pointer"
          />
        </div>

        <div className="p-3.5 rounded-[12px] bg-[#1c1916] space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-[#8c8273]">Dividend Yield:</span>
            <span className="font-bold text-[#3ddc97]">{annualYield.toFixed(1)}% a.a.</span>
          </div>
          <input
            type="range"
            min="6.0"
            max="14.0"
            step="0.5"
            value={annualYield}
            onChange={(e) => setAnnualYield(Number(e.target.value))}
            className="w-full accent-[#3ddc97] cursor-pointer"
          />
        </div>

        <div className="p-3.5 rounded-[12px] bg-[#1c1916] space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-[#8c8273]">Prazo:</span>
            <span className="font-bold text-[#f5efe6]">{years} anos</span>
          </div>
          <input
            type="range"
            min="3"
            max="25"
            step="1"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full accent-[#d4af6a] cursor-pointer"
          />
        </div>
      </div>

      {/* Comparação dos Resultados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-[12px] bg-[#1c1916] border border-white/5 space-y-2">
          <span className="text-[10px] text-[#8c8273] uppercase font-bold block">
            Estratégia 1: Gastar os Proventos Todo Mês
          </span>
          <div className="text-xl font-bold text-[#c2b9ac]">
            {formatBRL(totalSemReinvestir)}
          </div>
          <p className="text-xs text-[#8c8273] font-sans">
            Você apenas acumulou os aportes nominais do seu próprio trabalho. O efeito multiplicador não aconteceu.
          </p>
        </div>

        <div className="p-4 rounded-[12px] bg-[#1c1916] border border-[#3ddc97]/40 shadow-[0_0_15px_rgba(61,220,151,0.12)] space-y-2">
          <span className="text-[10px] text-[#3ddc97] uppercase font-bold block">
            Estratégia 2: Reinvestir 100% dos Dividendos
          </span>
          <div className="text-2xl font-bold text-[#3ddc97]">
            {formatBRL(totalComReinvestir)}
          </div>
          <div className="text-xs text-[#f0d9a8] font-bold">
            + {formatBRL(ganhoExtra)} gerados puramente pelos juros compostos!
          </div>
          <p className="text-xs text-[#8c8273] font-sans">
            Renda passiva mensal gerada no ano {years}: <strong className="text-[#3ddc97]">{formatBRL(dividendoMensalFinal)}/mês</strong>.
          </p>
        </div>
      </div>

      <div className="p-3.5 rounded-[10px] bg-amber-400/10 border border-amber-400/30 text-xs text-amber-200 font-sans">
        🚀 <strong>Ponto de Inflexão da Bola de Neve:</strong> No início, os proventos pagam um cafezinho. Mas após alguns anos de reinvestimento, os próprios dividendos compram sozinhos mais cotas do que o seu aporte original!
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Tool 4: Balança de Risco x Retorno                                         */
/* -------------------------------------------------------------------------- */
const BalancaRiscoTool: React.FC = () => {
  const [scenario, setScenario] = useState<'crisis' | 'normal' | 'bull'>('crisis');
  const [profile, setProfile] = useState<'conservador' | 'moderado' | 'arrojado'>('moderado');

  const profileConfigs = {
    conservador: { rf: 85, rv: 15, label: 'Conservador' },
    moderado: { rf: 50, rv: 50, label: 'Moderado' },
    arrojado: { rf: 15, rv: 85, label: 'Arrojado' },
  };

  const scenarioReturns = {
    crisis: { rv: -28, rf: +12, desc: 'Ano de Crise Severa (Bolsa despenca -28%, Selic segura com +12%)' },
    normal: { rv: +14, rf: +11, desc: 'Ano Normal de Mercado (Bolsa valoriza +14%, Selic rende +11%)' },
    bull: { rv: +42, rf: +9, desc: 'Ano de Bull Market / Euforia (Bolsa dispara +42%, Selic em +9%)' },
  };

  const currentProfile = profileConfigs[profile];
  const currentScenario = scenarioReturns[scenario];

  const totalReturn = (currentProfile.rf * currentScenario.rf + currentProfile.rv * currentScenario.rv) / 100;
  const isPositive = totalReturn >= 0;

  return (
    <div className="p-5 sm:p-7 rounded-[16px] bg-[#141210] border border-[#d4af6a]/30 space-y-5 font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-[#d4af6a]/15">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-cyan-400" />
          <h4 className="font-serif font-bold text-base text-[#f5efe6]">
            Balança de Risco & Retorno: Teste seu Estômago
          </h4>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-400/15 text-cyan-300 font-bold">
          Volatilidade
        </span>
      </div>

      {/* Seleção de Perfil e Cenário */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-[#8c8273] block mb-2 uppercase">1. Seu Perfil de Alocação:</label>
          <div className="grid grid-cols-3 gap-2">
            {(['conservador', 'moderado', 'arrojado'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setProfile(p)}
                className={`py-2 px-3 rounded-[8px] border text-xs capitalize cursor-pointer transition-all ${
                  profile === p
                    ? 'bg-[#d4af6a] text-[#0b0a09] font-bold border-[#d4af6a]'
                    : 'bg-[#1c1916] text-[#8c8273] border-[#d4af6a]/15 hover:text-[#f5efe6]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-[#8c8273] mt-2 block">
            {currentProfile.rf}% Renda Fixa / {currentProfile.rv}% Renda Variável
          </span>
        </div>

        <div>
          <label className="text-xs text-[#8c8273] block mb-2 uppercase">2. Teste de Estresse do Mercado:</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'crisis', label: 'Crise (-28%)' },
              { id: 'normal', label: 'Normal (+14%)' },
              { id: 'bull', label: 'Bull (+42%)' },
            ].map((sc) => (
              <button
                key={sc.id}
                onClick={() => setScenario(sc.id as any)}
                className={`py-2 px-3 rounded-[8px] border text-xs cursor-pointer transition-all ${
                  scenario === sc.id
                    ? 'bg-[#1c1916] text-[#f0d9a8] border-[#d4af6a] font-bold shadow-sm'
                    : 'bg-[#141210] text-[#8c8273] border-white/5 hover:text-[#f5efe6]'
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-[#8c8273] mt-2 block font-sans truncate">
            {currentScenario.desc}
          </span>
        </div>
      </div>

      {/* Resultado Consolidado do Teste */}
      <div className={`p-4 rounded-[12px] border flex flex-col sm:flex-row items-center justify-between gap-3 ${
        isPositive ? 'bg-[#3ddc97]/10 border-[#3ddc97]/30 text-[#3ddc97]' : 'bg-[#ff5c6c]/10 border-[#ff5c6c]/30 text-[#ff5c6c]'
      }`}>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider block">
            Resultado da Carteira no Cenário
          </span>
          <span className="text-2xl font-bold">
            {isPositive ? '+' : ''}{totalReturn.toFixed(2)}% no ano
          </span>
        </div>

        <div className="text-xs font-sans text-[#c2b9ac] max-w-sm text-right">
          {isPositive ? (
            <span>A diversificação amorteceu oscilações e garantiu retorno positivo mesmo com ruídos de mercado.</span>
          ) : (
            <span>A queda de {totalReturn.toFixed(1)}% testa a disciplina do investidor: quem vende no pânico consolida o prejuízo.</span>
          )}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Tool 5: Simulador de Resiliência a Crises                                  */
/* -------------------------------------------------------------------------- */
const ResilienciaCarteiraTool: React.FC = () => {
  const [crisisType, setCrisisType] = useState<'juros' | 'commodities' | 'recessao'>('juros');

  const crisisData = {
    juros: {
      title: 'Choque de Juros (Selic dispara para 15%)',
      concentradoName: '100% Construtoras / Varejo',
      concentradoDrop: -42,
      diversificadoDrop: -3.5,
      explanation: 'Empresas muito endividadas sofrem com juros altos, mas a parte em Renda Fixa e FIIs de CRI da carteira diversificada protege o patrimônio.',
    },
    commodities: {
      title: 'Queda Brusca das Commodities (Minério e Petróleo caem -35%)',
      concentradoName: '100% Petrobras & Vale',
      concentradoDrop: -36,
      diversificadoDrop: -4.8,
      explanation: 'Petrobras e Vale sofrem, mas o setor elétrico (Taesa, Eletrobras) e Renda Fixa continuam gerando proventos constantes.',
    },
    recessao: {
      title: 'Pânico Global / Eleições Conturbadas',
      concentradoName: '100% Ações Small Caps',
      concentradoDrop: -48,
      diversificadoDrop: -8.0,
      explanation: 'O dólar e o Tesouro IPCA sobem com o estresse, compensando quase metade das quedas das ações.',
    },
  };

  const selected = crisisData[crisisType];

  return (
    <div className="p-5 sm:p-7 rounded-[16px] bg-[#141210] border border-[#d4af6a]/30 space-y-5 font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-[#d4af6a]/15">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-purple-400" />
          <h4 className="font-serif font-bold text-base text-[#f5efe6]">
            Simulador de Choque de Mercado: Por que Diversificar?
          </h4>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-400/15 text-purple-300 font-bold">
          Gestão de Risco
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'juros', label: '1. Choque de Juros' },
          { id: 'commodities', label: '2. Crise de Commodities' },
          { id: 'recessao', label: '3. Pânico Global' },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setCrisisType(btn.id as any)}
            className={`px-3 py-1.5 rounded-[8px] text-xs transition-all cursor-pointer border ${
              crisisType === btn.id
                ? 'bg-[#d4af6a] text-[#0b0a09] font-bold border-[#d4af6a]'
                : 'bg-[#1c1916] text-[#8c8273] border-[#d4af6a]/15 hover:text-[#f5efe6]'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Comparação Gráfica */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-[12px] bg-[#1c1916] border border-[#ff5c6c]/30 space-y-2">
          <span className="text-[10px] text-[#ff5c6c] font-bold uppercase block">
            Carteira Concentrada ({selected.concentradoName})
          </span>
          <div className="text-2xl font-bold text-[#ff5c6c]">
            {selected.concentradoDrop}% de queda
          </div>
          <div className="h-2 w-full bg-[#141210] rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.abs(selected.concentradoDrop)}%` }}
              className="h-full bg-[#ff5c6c] rounded-full"
            />
          </div>
          <span className="text-xs text-[#8c8273] block font-sans">
            R$ 100.000 viram <strong>{formatBRL(100000 * (1 + selected.concentradoDrop / 100))}</strong>
          </span>
        </div>

        <div className="p-4 rounded-[12px] bg-[#1c1916] border border-[#3ddc97]/40 space-y-2 shadow-[0_0_12px_rgba(61,220,151,0.08)]">
          <span className="text-[10px] text-[#3ddc97] font-bold uppercase block">
            Carteira NorteInvest Diversificada (Ações + FIIs + RF + Dólar)
          </span>
          <div className="text-2xl font-bold text-[#3ddc97]">
            {selected.diversificadoDrop}% de oscilação
          </div>
          <div className="h-2 w-full bg-[#141210] rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.abs(selected.diversificadoDrop) * 3}%` }}
              className="h-full bg-[#3ddc97] rounded-full"
            />
          </div>
          <span className="text-xs text-[#3ddc97] block font-sans font-bold">
            R$ 100.000 preservam <strong>{formatBRL(100000 * (1 + selected.diversificadoDrop / 100))}</strong>
          </span>
        </div>
      </div>

      <p className="text-xs text-[#c2b9ac] font-sans p-3 rounded-[8px] bg-[#1c1916] border border-[#d4af6a]/15">
        🛡️ <strong>Como a mágica acontece:</strong> {selected.explanation}
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Tool 6: Calculadora do Custo do Pânico                                      */
/* -------------------------------------------------------------------------- */
const CustoPanicoTool: React.FC = () => {
  const [initialValue, setInitialValue] = useState(50000);
  const dropPercent = 25; // queda de -25%
  const recoveryPercent = 65; // alta posterior de +65% em 3 anos

  const valueNoFundo = initialValue * (1 - dropPercent / 100);

  // Decisão A: Vendeu no fundo (-25%) e colocou na poupança (6% a.a por 3 anos)
  const panicoSaldoFinal = valueNoFundo * Math.pow(1.06, 3);

  // Decisão B: Manteve as ações e recuperou
  const recuperacaoSaldoFinal = valueNoFundo * (1 + recoveryPercent / 100);

  const prejuizoDoPanico = recuperacaoSaldoFinal - panicoSaldoFinal;

  return (
    <div className="p-5 sm:p-7 rounded-[16px] bg-[#141210] border border-[#d4af6a]/30 space-y-5 font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-[#d4af6a]/15">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#ff5c6c]" />
          <h4 className="font-serif font-bold text-base text-[#f5efe6]">
            Calculadora Comportamental: O Custo do Pânico
          </h4>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#ff5c6c]/15 text-[#ff5c6c] font-bold">
          Psicologia do Investidor
        </span>
      </div>

      <div className="p-3.5 rounded-[12px] bg-[#1c1916] space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-[#8c8273]">Patrimônio Investido Antes da Crise:</span>
          <span className="font-bold text-[#f5efe6]">{formatBRL(initialValue)}</span>
        </div>
        <input
          type="range"
          min="10000"
          max="200000"
          step="5000"
          value={initialValue}
          onChange={(e) => setInitialValue(Number(e.target.value))}
          className="w-full accent-[#ff5c6c] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[#8c8273]">
          <span>R$ 10.000</span>
          <span>R$ 100.000</span>
          <span>R$ 200.000</span>
        </div>
      </div>

      <div className="p-3 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/15 text-xs text-[#8c8273]">
        Cenário: O Ibovespa passa por uma correção normal de <strong>-{dropPercent}%</strong>. Seu patrimônio recua para <strong className="text-[#ff5c6c]">{formatBRL(valueNoFundo)}</strong>. O que acontece 3 anos depois dependendo da sua reação?
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-[12px] bg-[#1c1916] border border-[#ff5c6c]/30 space-y-2">
          <span className="text-[10px] text-[#ff5c6c] font-bold uppercase block">
            Reação 1: Vendeu no pânico e fugiu para a poupança
          </span>
          <div className="text-2xl font-bold text-[#c2b9ac]">
            {formatBRL(panicoSaldoFinal)}
          </div>
          <span className="text-xs text-[#ff5c6c] block font-sans">
            Você travou o prejuízo na mínima histórica e demorou anos para recuperar o valor nominal.
          </span>
        </div>

        <div className="p-4 rounded-[12px] bg-[#1c1916] border border-[#3ddc97]/40 space-y-2 shadow-[0_0_15px_rgba(61,220,151,0.1)]">
          <span className="text-[10px] text-[#3ddc97] font-bold uppercase block">
            Reação 2: Manteve a disciplina e continuou investido
          </span>
          <div className="text-2xl font-bold text-[#3ddc97]">
            {formatBRL(recuperacaoSaldoFinal)}
          </div>
          <span className="text-xs text-[#3ddc97] block font-sans font-bold">
            O mercado se recuperou e gerou +{formatBRL(prejuizoDoPanico)} a mais no seu bolso!
          </span>
        </div>
      </div>

      <div className="p-3.5 rounded-[10px] bg-[#ff5c6c]/10 border border-[#ff5c6c]/30 text-xs text-[#f5efe6] font-sans">
        🧠 <strong>Lição do Barão de Rothschild & Warren Buffett:</strong> O dinheiro no mercado financeiro flui dos impacientes para os pacientes. O maior inimigo do retorno do investidor não é a B3, é o próprio medo.
      </div>
    </div>
  );
};
