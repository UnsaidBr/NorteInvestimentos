import { FundamentalStock } from '../types/fundamental';

export const BASE_FUNDAMENTAL_STOCKS: Array<Omit<FundamentalStock, 'grahamPrice' | 'grahamMargin' | 'bazinPrice' | 'bazinDiscount' | 'greenblattRank' | 'scoreSaude' | 'pontosPositivos' | 'pontosAtencao'>> = [
  {
    ticker: 'PETR4',
    name: 'Petróleo Brasileiro S.A. Petrobras',
    friendlyName: 'Petrobras',
    sector: 'Petróleo, Gás e Biocombustíveis',
    price: 36.42,
    changePercent: 1.15,
    volume: 1850000000,
    pl: 4.8,
    pvp: 1.12,
    dy: 14.8,
    roe: 23.5,
    margemLiquida: 24.2,
    dividaLiquidaEbitda: 0.95,
    lpa: 7.58,
    vpa: 32.51,
    dpa12m: 5.39,
  },
  {
    ticker: 'VALE3',
    name: 'Vale S.A.',
    friendlyName: 'Vale',
    sector: 'Mineração e Siderurgia',
    price: 61.80,
    changePercent: -0.45,
    volume: 1420000000,
    pl: 6.2,
    pvp: 1.45,
    dy: 9.2,
    roe: 23.4,
    margemLiquida: 21.0,
    dividaLiquidaEbitda: 0.68,
    lpa: 9.96,
    vpa: 42.62,
    dpa12m: 5.68,
  },
  {
    ticker: 'ITUB4',
    name: 'Itaú Unibanco Holding S.A.',
    friendlyName: 'Itaú Unibanco',
    sector: 'Intermediários Financeiros',
    price: 35.80,
    changePercent: 0.85,
    volume: 980000000,
    pl: 8.9,
    pvp: 1.78,
    dy: 7.5,
    roe: 21.2,
    margemLiquida: 22.8,
    dividaLiquidaEbitda: 0.0,
    lpa: 4.02,
    vpa: 20.11,
    dpa12m: 2.68,
  },
  {
    ticker: 'BBAS3',
    name: 'Banco do Brasil S.A.',
    friendlyName: 'Banco do Brasil',
    sector: 'Intermediários Financeiros',
    price: 27.45,
    changePercent: 0.40,
    volume: 750000000,
    pl: 4.4,
    pvp: 0.82,
    dy: 10.4,
    roe: 21.8,
    margemLiquida: 18.5,
    dividaLiquidaEbitda: 0.0,
    lpa: 6.23,
    vpa: 33.47,
    dpa12m: 2.85,
  },
  {
    ticker: 'BBDC4',
    name: 'Banco Bradesco S.A.',
    friendlyName: 'Bradesco',
    sector: 'Intermediários Financeiros',
    price: 13.90,
    changePercent: -0.22,
    volume: 510000000,
    pl: 9.8,
    pvp: 0.95,
    dy: 6.8,
    roe: 10.8,
    margemLiquida: 14.2,
    dividaLiquidaEbitda: 0.0,
    lpa: 1.41,
    vpa: 14.63,
    dpa12m: 0.94,
  },
  {
    ticker: 'WEGE3',
    name: 'WEG S.A.',
    friendlyName: 'WEG',
    sector: 'Máquinas e Equipamentos',
    price: 52.10,
    changePercent: 1.60,
    volume: 480000000,
    pl: 34.5,
    pvp: 10.8,
    dy: 1.8,
    roe: 32.1,
    margemLiquida: 17.5,
    dividaLiquidaEbitda: -0.25,
    lpa: 1.51,
    vpa: 4.82,
    dpa12m: 0.93,
  },
  {
    ticker: 'EGIE3',
    name: 'Engie Brasil Energia S.A.',
    friendlyName: 'Engie Brasil',
    sector: 'Energia Elétrica',
    price: 43.15,
    changePercent: 0.35,
    volume: 120000000,
    pl: 10.2,
    pvp: 3.25,
    dy: 7.8,
    roe: 31.9,
    margemLiquida: 31.5,
    dividaLiquidaEbitda: 2.30,
    lpa: 4.23,
    vpa: 13.27,
    dpa12m: 3.36,
  },
  {
    ticker: 'TAEE11',
    name: 'Transmissora Aliança de Energia Elétrica S.A.',
    friendlyName: 'Taesa',
    sector: 'Energia Elétrica',
    price: 35.60,
    changePercent: -0.10,
    volume: 95000000,
    pl: 8.5,
    pvp: 1.82,
    dy: 9.6,
    roe: 21.5,
    margemLiquida: 45.2,
    dividaLiquidaEbitda: 3.75,
    lpa: 4.18,
    vpa: 19.56,
    dpa12m: 3.41,
  },
  {
    ticker: 'CPLE6',
    name: 'Companhia Paranaense de Energia Copel',
    friendlyName: 'Copel',
    sector: 'Energia Elétrica',
    price: 10.15,
    changePercent: 0.50,
    volume: 160000000,
    pl: 8.9,
    pvp: 1.15,
    dy: 8.2,
    roe: 13.2,
    margemLiquida: 15.6,
    dividaLiquidaEbitda: 2.10,
    lpa: 1.14,
    vpa: 8.82,
    dpa12m: 0.83,
  },
  {
    ticker: 'VIVT3',
    name: 'Telefônica Brasil S.A.',
    friendlyName: 'Vivo Telefônica',
    sector: 'Telecomunicações',
    price: 53.40,
    changePercent: 0.20,
    volume: 135000000,
    pl: 15.2,
    pvp: 1.25,
    dy: 7.9,
    roe: 8.4,
    margemLiquida: 10.1,
    dividaLiquidaEbitda: 0.45,
    lpa: 3.51,
    vpa: 42.72,
    dpa12m: 4.21,
  },
  {
    ticker: 'ABEV3',
    name: 'Ambev S.A.',
    friendlyName: 'Ambev',
    sector: 'Bebidas',
    price: 12.80,
    changePercent: -0.60,
    volume: 320000000,
    pl: 13.5,
    pvp: 2.10,
    dy: 6.2,
    roe: 15.8,
    margemLiquida: 17.8,
    dividaLiquidaEbitda: -0.32,
    lpa: 0.94,
    vpa: 6.09,
    dpa12m: 0.79,
  },
  {
    ticker: 'B3SA3',
    name: 'B3 S.A. - Brasil, Bolsa, Balcão',
    friendlyName: 'B3 Bolsa',
    sector: 'Serviços Financeiros Diversos',
    price: 11.20,
    changePercent: -1.10,
    volume: 290000000,
    pl: 14.8,
    pvp: 3.12,
    dy: 5.4,
    roe: 21.0,
    margemLiquida: 42.0,
    dividaLiquidaEbitda: 1.10,
    lpa: 0.75,
    vpa: 3.58,
    dpa12m: 0.60,
  },
  {
    ticker: 'PRIO3',
    name: 'PRIO S.A. (PetroRio)',
    friendlyName: 'PRIO',
    sector: 'Petróleo, Gás e Biocombustíveis',
    price: 43.50,
    changePercent: 2.10,
    volume: 410000000,
    pl: 7.2,
    pvp: 2.30,
    dy: 0.0,
    roe: 35.8,
    margemLiquida: 45.0,
    dividaLiquidaEbitda: 0.85,
    lpa: 6.04,
    vpa: 18.91,
    dpa12m: 0.0,
  },
  {
    ticker: 'GGBR4',
    name: 'Gerdau S.A.',
    friendlyName: 'Gerdau',
    sector: 'Mineração e Siderurgia',
    price: 18.95,
    changePercent: 0.75,
    volume: 210000000,
    pl: 5.8,
    pvp: 0.78,
    dy: 7.2,
    roe: 13.8,
    margemLiquida: 8.5,
    dividaLiquidaEbitda: 0.40,
    lpa: 3.26,
    vpa: 24.29,
    dpa12m: 1.36,
  },
  {
    ticker: 'CSNA3',
    name: 'Companhia Siderúrgica Nacional',
    friendlyName: 'CSN',
    sector: 'Mineração e Siderurgia',
    price: 11.40,
    changePercent: -1.80,
    volume: 180000000,
    pl: 7.5,
    pvp: 0.70,
    dy: 8.8,
    roe: 9.5,
    margemLiquida: 6.2,
    dividaLiquidaEbitda: 2.85,
    lpa: 1.52,
    vpa: 16.28,
    dpa12m: 1.00,
  },
  {
    ticker: 'SUZB3',
    name: 'Suzano S.A.',
    friendlyName: 'Suzano',
    sector: 'Papel e Celulose',
    price: 58.20,
    changePercent: 1.25,
    volume: 340000000,
    pl: 6.8,
    pvp: 1.85,
    dy: 3.1,
    roe: 28.5,
    margemLiquida: 26.0,
    dividaLiquidaEbitda: 2.70,
    lpa: 8.55,
    vpa: 31.45,
    dpa12m: 1.80,
  },
  {
    ticker: 'KLBN11',
    name: 'Klabin S.A.',
    friendlyName: 'Klabin',
    sector: 'Papel e Celulose',
    price: 21.60,
    changePercent: 0.15,
    volume: 145000000,
    pl: 8.2,
    pvp: 2.10,
    dy: 6.9,
    roe: 25.4,
    margemLiquida: 14.8,
    dividaLiquidaEbitda: 3.20,
    lpa: 2.63,
    vpa: 10.28,
    dpa12m: 1.49,
  },
  {
    ticker: 'RENT3',
    name: 'Localiza Rent a Car S.A.',
    friendlyName: 'Localiza',
    sector: 'Locação de Veículos',
    price: 41.20,
    changePercent: -0.80,
    volume: 280000000,
    pl: 16.5,
    pvp: 1.55,
    dy: 3.5,
    roe: 9.8,
    margemLiquida: 7.2,
    dividaLiquidaEbitda: 2.95,
    lpa: 2.49,
    vpa: 26.58,
    dpa12m: 1.44,
  },
  {
    ticker: 'JBSS3',
    name: 'JBS S.A.',
    friendlyName: 'JBS',
    sector: 'Alimentos Processados',
    price: 36.10,
    changePercent: 1.40,
    volume: 310000000,
    pl: 8.1,
    pvp: 1.62,
    dy: 5.8,
    roe: 20.4,
    margemLiquida: 3.8,
    dividaLiquidaEbitda: 2.45,
    lpa: 4.45,
    vpa: 22.28,
    dpa12m: 2.09,
  },
  {
    ticker: 'SBSP3',
    name: 'Companhia de Saneamento Básico do Estado de São Paulo - Sabesp',
    friendlyName: 'Sabesp',
    sector: 'Água e Saneamento',
    price: 94.50,
    changePercent: 0.90,
    volume: 390000000,
    pl: 12.4,
    pvp: 1.80,
    dy: 4.2,
    roe: 15.0,
    margemLiquida: 18.2,
    dividaLiquidaEbitda: 1.85,
    lpa: 7.62,
    vpa: 52.50,
    dpa12m: 3.96,
  },
  {
    ticker: 'EQTL3',
    name: 'Equatorial Energia S.A.',
    friendlyName: 'Equatorial',
    sector: 'Energia Elétrica',
    price: 32.80,
    changePercent: 0.60,
    volume: 230000000,
    pl: 11.2,
    pvp: 1.65,
    dy: 3.2,
    roe: 15.2,
    margemLiquida: 10.8,
    dividaLiquidaEbitda: 2.90,
    lpa: 2.92,
    vpa: 19.87,
    dpa12m: 1.04,
  },
  {
    ticker: 'RADL3',
    name: 'Raia Drogasil S.A.',
    friendlyName: 'Raia Drogasil',
    sector: 'Comércio Farmacêutico',
    price: 25.10,
    changePercent: -0.30,
    volume: 190000000,
    pl: 32.0,
    pvp: 5.60,
    dy: 1.4,
    roe: 18.0,
    margemLiquida: 3.2,
    dividaLiquidaEbitda: 1.15,
    lpa: 0.78,
    vpa: 4.48,
    dpa12m: 0.35,
  },
];

/**
 * Calcula métricas fundamentadas: Graham, Bazin, Greenblatt e Checklist
 */
export function calculateFundamentals(
  stock: (typeof BASE_FUNDAMENTAL_STOCKS)[0],
  grahamMultiplier = 22.5,
  bazinYieldReq = 6.0
): FundamentalStock {
  const { price, lpa, vpa, dpa12m, pl, pvp, dy, roe, margemLiquida, dividaLiquidaEbitda } = stock;

  // 1. Graham: Preço Justo = sqrt(multiplicador * LPA * VPA)
  let grahamPrice = 0;
  let grahamMargin = 0;
  if (lpa > 0 && vpa > 0) {
    grahamPrice = parseFloat(Math.sqrt(grahamMultiplier * lpa * vpa).toFixed(2));
    grahamMargin = parseFloat((((grahamPrice - price) / grahamPrice) * 100).toFixed(1));
  }

  // 2. Bazin: Preço Teto = DPA / (yieldReq / 100)
  let bazinPrice = 0;
  let bazinDiscount = 0;
  if (dpa12m > 0 && bazinYieldReq > 0) {
    bazinPrice = parseFloat((dpa12m / (bazinYieldReq / 100)).toFixed(2));
    bazinDiscount = parseFloat((((bazinPrice - price) / price) * 100).toFixed(1));
  }

  // 3. Pontos positivos e de atenção
  const pontosPositivos: string[] = [];
  const pontosAtencao: string[] = [];

  if (roe >= 15) pontosPositivos.push(`ROE elevado de ${roe}% (rentabilidade sobre capital acima da média)`);
  else if (roe < 10) pontosAtencao.push(`ROE modesto de ${roe}% (abaixo do custo de oportunidade)`);

  if (dy >= 6) pontosPositivos.push(`Dividend Yield robusto de ${dy}% nos últimos 12 meses`);
  else if (dy < 2) pontosAtencao.push(`Dividend Yield baixo de ${dy}% (foco em reinvestimento ou retenção)`);

  if (pl > 0 && pl <= 10) pontosPositivos.push(`Múltiplo P/L atrativo de ${pl}x (abaixo de 10 anos de lucro)`);
  else if (pl > 25) pontosAtencao.push(`Múltiplo P/L esticado de ${pl}x (precifica alto crescimento futuro)`);

  if (pvp > 0 && pvp <= 1.5) pontosPositivos.push(`P/VP comedido de ${pvp}x (próximo ou abaixo do patrimônio líquido)`);

  if (dividaLiquidaEbitda > 0 && dividaLiquidaEbitda <= 2.0) {
    pontosPositivos.push(`Endividamento controlado com Dívida Líq./EBITDA de ${dividaLiquidaEbitda}x`);
  } else if (dividaLiquidaEbitda > 3.0) {
    pontosAtencao.push(`Alavancagem requer atenção: Dívida Líq./EBITDA de ${dividaLiquidaEbitda}x`);
  }

  if (margemLiquida >= 15) pontosPositivos.push(`Margem líquida expressiva de ${margemLiquida}%`);
  else if (margemLiquida < 5) pontosAtencao.push(`Margem líquida apertada de ${margemLiquida}%`);

  // Score de Saúde (0 a 10)
  let score = 5;
  if (roe >= 15) score += 1.5;
  if (dy >= 6) score += 1.0;
  if (pl > 0 && pl <= 12) score += 1.0;
  if (pvp > 0 && pvp <= 2.0) score += 0.5;
  if (dividaLiquidaEbitda <= 2.5) score += 1.0;
  if (margemLiquida >= 10) score += 1.0;
  if (pl > 25) score -= 1.0;
  if (dividaLiquidaEbitda > 3.5) score -= 1.5;
  const scoreSaude = Math.min(10, Math.max(1, parseFloat(score.toFixed(1))));

  return {
    ...stock,
    grahamPrice,
    grahamMargin,
    bazinPrice,
    bazinDiscount,
    scoreSaude,
    pontosPositivos,
    pontosAtencao,
  };
}

/**
 * Calcula lista consolidada com ordenações e ranqueamento Greenblatt
 */
export function getFundamentalStocks(grahamMultiplier = 22.5, bazinYieldReq = 6.0): FundamentalStock[] {
  const list = BASE_FUNDAMENTAL_STOCKS.map((s) => calculateFundamentals(s, grahamMultiplier, bazinYieldReq));

  // Cálculo da Fórmula Mágica de Joel Greenblatt:
  // Rank 1: Menor P/L (excluindo P/L negativo)
  // Rank 2: Maior ROE
  const positivePl = list.filter((s) => s.pl > 0);
  const byPl = [...positivePl].sort((a, b) => a.pl - b.pl);
  const byRoe = [...positivePl].sort((a, b) => b.roe - a.roe);

  const plRankMap = new Map<string, number>();
  byPl.forEach((s, idx) => plRankMap.set(s.ticker, idx + 1));

  const roeRankMap = new Map<string, number>();
  byRoe.forEach((s, idx) => roeRankMap.set(s.ticker, idx + 1));

  const combined = positivePl.map((s) => {
    const r1 = plRankMap.get(s.ticker) || 999;
    const r2 = roeRankMap.get(s.ticker) || 999;
    return { ticker: s.ticker, score: r1 + r2 };
  });

  combined.sort((a, b) => a.score - b.score);
  const greenblattRankMap = new Map<string, number>();
  combined.forEach((item, idx) => greenblattRankMap.set(item.ticker, idx + 1));

  return list.map((s) => ({
    ...s,
    greenblattRank: greenblattRankMap.get(s.ticker) || undefined,
  }));
}
