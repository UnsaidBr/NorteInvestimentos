import React, { useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';

interface IndicatorExplainerProps {
  ticker: string;
  pl?: number | null;
  pvp?: number | null;
  dividendYield?: number | null;
  roe?: number | null;
  marketCap?: number | null;
}

interface IndicatorInfo {
  key: string;
  name: string;
  formula: string;
  simple: string;
  howToRead: string;
  caution: string;
  format: (v: number) => string;
  value?: number | null;
  /** Texto neutro e fatual sobre o valor atual do ativo (sem juízo de "bom/ruim") */
  describe: (v: number, ticker: string) => string;
}

const brNumber = (v: number, digits = 2) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

const bigBRL = (v: number) => {
  if (v >= 1e12) return `R$ ${brNumber(v / 1e12, 2)} tri`;
  if (v >= 1e9) return `R$ ${brNumber(v / 1e9, 2)} bi`;
  if (v >= 1e6) return `R$ ${brNumber(v / 1e6, 2)} mi`;
  return `R$ ${brNumber(v, 0)}`;
};

export const IndicatorExplainer: React.FC<IndicatorExplainerProps> = ({
  ticker,
  pl,
  pvp,
  dividendYield,
  roe,
  marketCap,
}) => {
  const [openKey, setOpenKey] = useState<string | null>('pl');

  const items: IndicatorInfo[] = [
    {
      key: 'pl',
      name: 'P/L (Preço sobre Lucro)',
      formula: 'Preço da ação ÷ lucro por ação',
      simple:
        'Mostra quantos anos de lucro, no ritmo atual, seriam necessários para a empresa "devolver" o preço da ação.',
      howToRead:
        'Compare com empresas do mesmo setor e com o próprio histórico da empresa. Setores diferentes costumam ter P/L bem diferentes.',
      caution:
        'Lucro extraordinário (venda de um ativo, por exemplo) distorce o P/L. Com lucro negativo, o indicador perde sentido.',
      format: (v) => `${brNumber(v)}x`,
      value: pl,
      describe: (v, t) =>
        v > 0
          ? `Com o P/L de ${brNumber(v)}x, ${t} está sendo negociada a cerca de ${brNumber(v, 1)} vezes o lucro por ação.`
          : `O P/L de ${t} é ${brNumber(v)}, o que indica lucro zero ou negativo no período; nesse caso o indicador não é comparável.`,
    },
    {
      key: 'pvp',
      name: 'P/VP (Preço sobre Valor Patrimonial)',
      formula: 'Preço da ação ÷ patrimônio líquido por ação',
      simple:
        'Compara o preço de mercado com o valor contábil da empresa, ou seja, o que sobraria no balanço depois de pagar as dívidas.',
      howToRead:
        'Abaixo de 1x, o mercado cobra menos que o valor contábil; acima de 1x, cobra mais. Isso depende muito do setor e da qualidade dos ativos.',
      caution:
        'Valor contábil nem sempre reflete o valor real dos ativos. Em empresas que dependem de marca ou tecnologia, o P/VP tende a ser alto.',
      format: (v) => `${brNumber(v)}x`,
      value: pvp,
      describe: (v, t) =>
        `Com o P/VP de ${brNumber(v)}x, o mercado negocia ${t} a ${
          v < 1 ? 'um valor menor' : v > 1 ? 'um valor maior' : 'um valor igual'
        } ao patrimônio contábil por ação.`,
    },
    {
      key: 'dy',
      name: 'Dividend Yield (DY)',
      formula: 'Dividendos pagos nos últimos 12 meses ÷ preço da ação',
      simple:
        'Mostra quanto a empresa distribuiu em dividendos, em relação ao preço atual, no último ano.',
      howToRead:
        'É um retrato do passado, não uma promessa. Olhe a regularidade dos pagamentos ao longo dos anos na tabela de proventos.',
      caution:
        'DY alto pode vir de queda do preço ou de pagamento único (extraordinário). Não garante pagamentos futuros.',
      format: (v) => `${brNumber(v)}%`,
      value: dividendYield,
      describe: (v, t) =>
        `O DY de ${brNumber(v)}% indica que, nos últimos 12 meses, os proventos de ${t} equivaleram a ${brNumber(v)}% do preço atual da ação.`,
    },
    {
      key: 'roe',
      name: 'ROE (Retorno sobre o Patrimônio)',
      formula: 'Lucro líquido ÷ patrimônio líquido',
      simple:
        'Mede quanto lucro a empresa gera a cada R$ 100 de patrimônio dos acionistas.',
      howToRead:
        'Serve para comparar a eficiência entre empresas do mesmo setor e acompanhar a evolução ao longo dos anos.',
      caution:
        'Empresas muito endividadas podem ter ROE alto sem serem mais sólidas. Veja o indicador junto com a dívida.',
      format: (v) => `${brNumber(v)}%`,
      value: roe,
      describe: (v, t) =>
        `Com o ROE de ${brNumber(v)}%, ${t} gerou cerca de R$ ${brNumber(v, 1)} de lucro para cada R$ 100 de patrimônio líquido.`,
    },
    {
      key: 'mcap',
      name: 'Valor de Mercado',
      formula: 'Preço da ação × número total de ações',
      simple: 'É o "preço" da empresa inteira na bolsa neste momento.',
      howToRead:
        'Ajuda a entender o tamanho da empresa. Empresas maiores tendem a ter mais liquidez; menores, mais oscilação.',
      caution:
        'Valor de mercado não é o mesmo que o valor da empresa: ele muda todo dia com o preço da ação.',
      format: (v) => bigBRL(v),
      value: marketCap,
      describe: (v, t) => `O valor de mercado de ${t} é de aproximadamente ${bigBRL(v)}.`,
    },
  ];

  return (
    <section
      aria-labelledby="entenda-indicadores"
      className="p-6 rounded-2xl bg-[#141210] border border-[#d4af6a]/20 space-y-4"
    >
      <div>
        <h2 id="entenda-indicadores" className="text-xl font-mono font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#d4af6a]" aria-hidden="true" />
          <span>Entenda os indicadores de {ticker}</span>
        </h2>
        <p className="text-xs text-[#a39a8c] mt-1">
          Explicações em português simples, com o valor atual do ativo. É conteúdo educacional: um indicador
          isolado não diz se um investimento é bom ou ruim.
        </p>
      </div>

      <ul className="divide-y divide-white/5">
        {items.map((item) => {
          const hasValue = typeof item.value === 'number' && Number.isFinite(item.value);
          const open = openKey === item.key;
          return (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => setOpenKey(open ? null : item.key)}
                aria-expanded={open}
                className="w-full flex items-center justify-between gap-3 py-3 text-left cursor-pointer"
              >
                <span className="text-sm font-semibold text-[#f5efe6]">{item.name}</span>
                <span className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-sm text-[#f0d9a8]">
                    {hasValue ? item.format(item.value as number) : 'n/d'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#8e8579] transition-transform ${open ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </span>
              </button>

              {open && (
                <div className="pb-4 space-y-3 text-sm text-[#c2b9ac] leading-relaxed">
                  <p>{item.simple}</p>
                  <p className="font-mono text-xs text-[#d4af6a]">Fórmula: {item.formula}</p>
                  {hasValue ? (
                    <p className="rounded-lg bg-[#1c1916] border border-[#d4af6a]/15 px-3 py-2 text-[#f5efe6]">
                      {item.describe(item.value as number, ticker)}
                    </p>
                  ) : (
                    <p className="rounded-lg bg-[#1c1916] border border-white/10 px-3 py-2 text-[#8e8579]">
                      Este indicador não está disponível na fonte de dados para {ticker} no momento (n/d).
                    </p>
                  )}
                  <p>
                    <strong className="text-[#f5efe6]">Como ler:</strong> {item.howToRead}
                  </p>
                  <p>
                    <strong className="text-[#f5efe6]">Cuidado:</strong> {item.caution}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="text-[11px] text-[#6e675c]">
        Conteúdo informativo e educacional. Não constitui recomendação de investimento. Rentabilidade passada
        não garante resultados futuros.
      </p>
    </section>
  );
};
