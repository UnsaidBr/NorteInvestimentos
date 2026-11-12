export interface FundamentalStock {
  ticker: string;
  name: string;
  friendlyName: string;
  sector: string;
  price: number;
  changePercent: number;
  volume: number;
  pl: number; // Preço / Lucro
  pvp: number; // Preço / Valor Patrimonial
  dy: number; // Dividend Yield nos últimos 12 meses (%)
  roe: number; // Return on Equity (%)
  margemLiquida: number | null; // Margem Líquida (%) - null = não informado
  dividaLiquidaEbitda: number | null; // Dívida Líquida / EBITDA - null = não informado
  lpa: number; // Lucro por Ação (R$)
  vpa: number; // Valor Patrimonial por Ação (R$)
  dpa12m: number; // Dividendos pagos por Ação em 12m (R$)
  grahamPrice: number; // Preço Justo Graham: sqrt(22.5 * lpa * vpa)
  grahamMargin: number; // Margem de segurança de Graham (%)
  bazinPrice: number; // Preço Teto Bazin: dpa12m / 0.06
  bazinDiscount: number; // Margem de desconto frente ao Preço Teto (%)
  greenblattRank?: number; // Posição ordinal na Fórmula Mágica
  scoreSaude: number; // Score de consistência fundamentalista de 0 a 10
  pontosPositivos: string[];
  pontosAtencao: string[];
}

export type FiiSegment =
  | 'Logística'
  | 'Lajes Corporativas'
  | 'Shoppings'
  | 'Renda Urbana'
  | 'Papel / CRIs'
  | 'Fundos de Fundos (FoF)'
  | 'Fiagro'
  | 'Outros';

export type FiiType = 'Tijolo' | 'Papel' | 'FoF' | 'Fiagro' | 'Híbrido';

export interface FiiItem {
  ticker: string;
  name: string;
  friendlyName: string;
  segment: FiiSegment;
  type: FiiType;
  price: number;
  changePercent: number;
  pvp: number;
  dy12m: number; // % ao ano
  lastDividend: number; // R$ por cota
  lastDividendDate?: string;
  vacanciaFisica: number; // %
  vacanciaFinanceira: number; // %
  numImoveis: number;
  liquidezDiaria: number; // R$ diários
  patrimonioLiquido: number; // em R$
  administrador: string;
  pontosDestaque: string[];
}

export interface ScreenerFilterState {
  preset: 'todos' | 'graham' | 'bazin' | 'greenblatt' | 'dividendos';
  sector: string;
  minPrice: number;
  maxPrice: number;
  minPl: number;
  maxPl: number;
  minPvp: number;
  maxPvp: number;
  minDy: number;
  maxDy: number;
  minRoe: number;
  minMargem: number;
  minVolume: number;
  bazinYieldReq: number; // % exigido para o Preço Teto Bazin (padrão 6%)
  grahamMultiplier: number; // multiplicador padrão 22.5
}
