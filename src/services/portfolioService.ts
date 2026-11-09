import {
  PortfolioPosition,
  EnrichedPosition,
  PortfolioSummary,
  AllocationByClass,
  MonthlyDividendProjection,
  AssetCategory,
} from '../types/portfolio';
import { StockItem } from '../types/market';
import { FII_DATASET } from '../data/fiiData';
import { BASE_FUNDAMENTAL_STOCKS } from '../data/fundamentalData';

export { PortfolioManager, portfolioManager } from './portfolioManager';
export type { AssetInput, UpdateAssetInput } from './portfolioManager';

// Carteira inicial demonstrativa e realista para o usuário explorar de imediato
export const INITIAL_DEMO_PORTFOLIO: PortfolioPosition[] = [
  {
    id: 'pos-1',
    ticker: 'PETR4',
    name: 'Petróleo Brasileiro S.A. Petrobras',
    category: 'acao',
    quantity: 100,
    averagePrice: 32.50,
    createdAt: '2026-01-15',
  },
  {
    id: 'pos-2',
    ticker: 'VALE3',
    name: 'Vale S.A.',
    category: 'acao',
    quantity: 50,
    averagePrice: 65.80,
    createdAt: '2026-02-10',
  },
  {
    id: 'pos-3',
    ticker: 'ITUB4',
    name: 'Itaú Unibanco Holding S.A.',
    category: 'acao',
    quantity: 120,
    averagePrice: 31.20,
    createdAt: '2026-03-05',
  },
  {
    id: 'pos-4',
    ticker: 'BBAS3',
    name: 'Banco do Brasil S.A.',
    category: 'acao',
    quantity: 80,
    averagePrice: 26.40,
    createdAt: '2026-03-20',
  },
  {
    id: 'pos-5',
    ticker: 'HGLG11',
    name: 'CSHG Logística FII',
    category: 'fii',
    quantity: 25,
    averagePrice: 158.50,
    createdAt: '2026-01-20',
  },
  {
    id: 'pos-6',
    ticker: 'MXRF11',
    name: 'Maxi Renda FII',
    category: 'fii',
    quantity: 250,
    averagePrice: 9.90,
    createdAt: '2026-02-01',
  },
  {
    id: 'pos-7',
    ticker: 'XPML11',
    name: 'XP Malls FII',
    category: 'fii',
    quantity: 30,
    averagePrice: 104.20,
    createdAt: '2026-02-15',
  },
  {
    id: 'pos-8',
    ticker: 'TESOURO_SELIC',
    name: 'Tesouro Selic / Reserva CDI 100%',
    category: 'renda_fixa',
    quantity: 1,
    averagePrice: 12500.00,
    createdAt: '2026-01-01',
  },
];

const MONTH_LABELS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

// Meses de distribuição sazonal típica por ativo (para projeção realista de fluxo)
const TYPICAL_DIVIDEND_MONTHS: Record<string, number[]> = {
  PETR4: [4, 7, 10, 11], // Mai, Ago, Nov, Dez
  VALE3: [2, 8],         // Mar, Set
  ITUB4: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // Mensal + Trimestral
  BBAS3: [2, 5, 8, 11],  // Mar, Jun, Set, Dez
  TAEE11: [4, 7, 10, 11],
  WEGE3: [2, 7],
  ABEV3: [11],
  RENT3: [2, 5, 8, 11],
};

/**
 * Enriquece as posições com cotações ao vivo e calcula os múltiplos consolidados
 */
export function calculatePortfolioSummary(
  positions: PortfolioPosition[],
  liveStocks: StockItem[] = [],
  cdiAnnualRate: number = 13.65
): PortfolioSummary {
  if (positions.length === 0) {
    return {
      totalInvested: 0,
      currentValue: 0,
      totalGainLossBrl: 0,
      totalGainLossPercent: 0,
      projectedAnnualDividends: 0,
      projectedMonthlyAverage: 0,
      averageYieldOnCost: 0,
      currentDividendYield: 0,
      positionsCount: 0,
      allocationByClass: [],
      monthlyProjections: MONTH_LABELS.map((monthLabel, monthIndex) => ({
        monthIndex,
        monthLabel,
        projectedValue: 0,
        assets: [],
      })),
    };
  }

  // 1. Passo: calcular cotação atual e provento anual por ativo
  const preliminaryEnriched = positions.map((pos) => {
    let currentPrice = pos.averagePrice;
    let annualDividendPerShare = 0;

    if (pos.category === 'renda_fixa') {
      // Rendimento anual baseado no CDI real
      currentPrice = pos.averagePrice * (1 + cdiAnnualRate / 100);
      annualDividendPerShare = pos.averagePrice * (cdiAnnualRate / 100);
    } else if (pos.category === 'fii') {
      const foundFii = FII_DATASET.find((f) => f.ticker.toUpperCase() === pos.ticker.toUpperCase());
      if (foundFii) {
        currentPrice = foundFii.price;
        annualDividendPerShare = foundFii.lastDividend * 12; // Provento anualizado
      }
    } else if (pos.category === 'acao') {
      const foundStock = liveStocks.find((s) => s.ticker.toUpperCase() === pos.ticker.toUpperCase());
      const foundFund = BASE_FUNDAMENTAL_STOCKS.find((fs) => fs.ticker.toUpperCase() === pos.ticker.toUpperCase());

      if (foundStock && foundStock.price > 0) {
        currentPrice = foundStock.price;
      } else if (foundFund) {
        currentPrice = foundFund.price;
      }

      if (foundFund && foundFund.dpa12m > 0) {
        annualDividendPerShare = foundFund.dpa12m;
      }
    }

    const totalInvested = pos.quantity * pos.averagePrice;
    const currentValue = pos.quantity * currentPrice;
    const gainLossBrl = currentValue - totalInvested;
    const gainLossPercent = totalInvested > 0 ? (gainLossBrl / totalInvested) * 100 : 0;
    const projectedAnnualDividend = pos.quantity * annualDividendPerShare;
    const dividendYieldOnCost = totalInvested > 0 ? (projectedAnnualDividend / totalInvested) * 100 : 0;

    return {
      ...pos,
      currentPrice,
      totalInvested,
      currentValue,
      gainLossBrl,
      gainLossPercent,
      annualDividendPerShare,
      projectedAnnualDividend,
      dividendYieldOnCost,
      portfolioSharePercent: 0, // calculado no passo 2
    };
  });

  // 2. Passo: calcular totais consolidados
  const totalInvested = preliminaryEnriched.reduce((acc, p) => acc + p.totalInvested, 0);
  const currentValue = preliminaryEnriched.reduce((acc, p) => acc + p.currentValue, 0);
  const totalGainLossBrl = currentValue - totalInvested;
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLossBrl / totalInvested) * 100 : 0;
  const projectedAnnualDividends = preliminaryEnriched.reduce((acc, p) => acc + p.projectedAnnualDividend, 0);
  const projectedMonthlyAverage = projectedAnnualDividends / 12;
  const averageYieldOnCost = totalInvested > 0 ? (projectedAnnualDividends / totalInvested) * 100 : 0;
  const currentDividendYield = currentValue > 0 ? (projectedAnnualDividends / currentValue) * 100 : 0;

  // 3. Passo: calcular participação percentual de cada posição
  const enrichedPositions: EnrichedPosition[] = preliminaryEnriched.map((pos) => ({
    ...pos,
    portfolioSharePercent: currentValue > 0 ? (pos.currentValue / currentValue) * 100 : 0,
  }));

  // 4. Passo: Gráfico de Alocação por Classe de Ativos
  const classTotals: Record<AssetCategory, { totalValue: number; count: number }> = {
    acao: { totalValue: 0, count: 0 },
    fii: { totalValue: 0, count: 0 },
    renda_fixa: { totalValue: 0, count: 0 },
    cripto: { totalValue: 0, count: 0 },
  };

  enrichedPositions.forEach((p) => {
    if (classTotals[p.category]) {
      classTotals[p.category].totalValue += p.currentValue;
      classTotals[p.category].count += 1;
    }
  });

  const categoryConfigs: Record<AssetCategory, { label: string; color: string }> = {
    acao: { label: 'Ações B3', color: '#d4af6a' },
    fii: { label: 'Fundos Imobiliários', color: '#38bdf8' },
    renda_fixa: { label: 'Renda Fixa / CDI', color: '#3ddc97' },
    cripto: { label: 'Criptomoedas', color: '#f7931a' },
  };

  const allocationByClass: AllocationByClass[] = (
    Object.keys(classTotals) as AssetCategory[]
  )
    .filter((cat) => classTotals[cat].count > 0)
    .map((cat) => {
      const catVal = classTotals[cat].totalValue;
      return {
        category: cat,
        label: categoryConfigs[cat].label,
        color: categoryConfigs[cat].color,
        totalValue: catVal,
        percent: currentValue > 0 ? (catVal / currentValue) * 100 : 0,
        count: classTotals[cat].count,
      };
    })
    .sort((a, b) => b.totalValue - a.totalValue);

  // 5. Passo: Projeção de Dividendos Mensais (Jan a Dez)
  const monthlyProjections: MonthlyDividendProjection[] = MONTH_LABELS.map((monthLabel, monthIndex) => {
    let monthTotal = 0;
    const assetsInMonth: Array<{ ticker: string; value: number }> = [];

    enrichedPositions.forEach((pos) => {
      if (pos.projectedAnnualDividend <= 0) return;

      if (pos.category === 'fii') {
        // FIIs pagam religiosamente todo mês
        const monthlyFii = pos.projectedAnnualDividend / 12;
        monthTotal += monthlyFii;
        assetsInMonth.push({ ticker: pos.ticker, value: monthlyFii });
      } else if (pos.category === 'renda_fixa') {
        // Renda fixa / CDI tem rendimento contínuo mensal
        const monthlyRf = pos.projectedAnnualDividend / 12;
        monthTotal += monthlyRf;
        assetsInMonth.push({ ticker: pos.ticker, value: monthlyRf });
      } else if (pos.category === 'acao') {
        // Ações: verificar meses sazonais típicos
        const activeMonths = TYPICAL_DIVIDEND_MONTHS[pos.ticker.toUpperCase()] || [2, 5, 8, 11]; // trimestral por padrão
        if (activeMonths.includes(monthIndex)) {
          const installment = pos.projectedAnnualDividend / activeMonths.length;
          monthTotal += installment;
          assetsInMonth.push({ ticker: pos.ticker, value: installment });
        }
      }
    });

    return {
      monthIndex,
      monthLabel,
      projectedValue: Math.round(monthTotal * 100) / 100,
      assets: assetsInMonth,
    };
  });

  return {
    totalInvested,
    currentValue,
    totalGainLossBrl,
    totalGainLossPercent,
    projectedAnnualDividends,
    projectedMonthlyAverage,
    averageYieldOnCost,
    currentDividendYield,
    positionsCount: enrichedPositions.length,
    allocationByClass,
    monthlyProjections,
  };
}
