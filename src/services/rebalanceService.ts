import {
  AssetCategory,
  PortfolioPosition,
  RebalanceTargetAllocation,
  RebalanceSimulationResult,
  RebalanceClassItem,
} from '../types/portfolio';
import { StockItem } from '../types/market';
import { FII_DATASET } from '../data/fiiData';
import { BASE_FUNDAMENTAL_STOCKS } from '../data/fundamentalData';

export const REBALANCE_STORAGE_KEY = 'norteinvest_rebalance_target_v1';
export const REBALANCE_CONTRIBUTION_KEY = 'norteinvest_rebalance_contribution_v1';

export const ALL_ASSET_CATEGORIES: AssetCategory[] = [
  'acao',
  'fii',
  'renda_fixa',
  'cripto',
];

export const CATEGORY_INFO: Record<
  AssetCategory,
  { label: string; shortLabel: string; color: string; description: string }
> = {
  acao: {
    label: 'Ações B3',
    shortLabel: 'Ações',
    color: '#d4af6a', // Champagne Gold
    description: 'Empresas listadas na Bolsa com potencial de valorização e dividendos.',
  },
  fii: {
    label: 'Fundos Imobiliários',
    shortLabel: 'FIIs',
    color: '#38bdf8', // Sky Blue
    description: 'Renda passiva mensal isenta de IR com imóveis e títulos de crédito (CRIs).',
  },
  renda_fixa: {
    label: 'Renda Fixa / CDI',
    shortLabel: 'Renda Fixa',
    color: '#3ddc97', // Emerald Green
    description: 'Segurança, liquidez diária e proteção atrelada ao CDI e inflação (IPCA).',
  },
  cripto: {
    label: 'Criptomoedas',
    shortLabel: 'Cripto',
    color: '#f7931a', // Bitcoin Amber
    description: 'Ativos digitais descentralizados para descorrelação e assimetria.',
  },
};

export interface RebalancePreset {
  id: string;
  name: string;
  description: string;
  allocation: RebalanceTargetAllocation;
}

export const REBALANCE_PRESETS: RebalancePreset[] = [
  {
    id: 'moderado',
    name: 'Equilibrado / Moderado',
    description: 'Balanço clássico entre crescimento de capital, renda passiva e segurança.',
    allocation: { acao: 35, fii: 35, renda_fixa: 30, cripto: 0 },
  },
  {
    id: 'dividendos',
    name: 'Foco em Renda Passiva',
    description: 'Prioridade em fluxo de caixa mensal previsível e reinvestimento contínuo.',
    allocation: { acao: 30, fii: 45, renda_fixa: 25, cripto: 0 },
  },
  {
    id: 'conservador',
    name: 'Conservador / Preservação',
    description: 'Maior peso em renda fixa para blindagem contra volatilidade de mercado.',
    allocation: { acao: 15, fii: 25, renda_fixa: 60, cripto: 0 },
  },
  {
    id: 'agressivo',
    name: 'Crescimento & Assimetria',
    description: 'Mais exposição a ações e ativos de alto potencial de valorização no longo prazo.',
    allocation: { acao: 50, fii: 25, renda_fixa: 20, cripto: 5 },
  },
  {
    id: 'all_weather',
    name: 'All Weather (Todas as Estações)',
    description: 'Inspirado em Ray Dalio para atravessar ciclos de juros e inflação.',
    allocation: { acao: 25, fii: 20, renda_fixa: 50, cripto: 5 },
  },
];

export const DEFAULT_TARGET_ALLOCATION: RebalanceTargetAllocation = {
  acao: 35,
  fii: 35,
  renda_fixa: 30,
  cripto: 0,
};

/**
 * Carrega a meta percentual salva pelo usuário no localStorage
 */
export function getSavedTargetAllocation(): RebalanceTargetAllocation {
  if (typeof window === 'undefined') return DEFAULT_TARGET_ALLOCATION;
  try {
    const raw = localStorage.getItem(REBALANCE_STORAGE_KEY);
    if (!raw) return DEFAULT_TARGET_ALLOCATION;
    const parsed = JSON.parse(raw);
    return {
      acao: Number(parsed.acao) || 0,
      fii: Number(parsed.fii) || 0,
      renda_fixa: Number(parsed.renda_fixa) || 0,
      cripto: Number(parsed.cripto) || 0,
    };
  } catch {
    return DEFAULT_TARGET_ALLOCATION;
  }
}

/**
 * Salva a meta percentual no localStorage
 */
export function saveTargetAllocation(target: RebalanceTargetAllocation): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REBALANCE_STORAGE_KEY, JSON.stringify(target));
  } catch (err) {
    console.error('[RebalanceService] Erro ao salvar meta de alocação:', err);
  }
}

/**
 * Carrega o último valor de aporte simulado pelo usuário
 */
export function getSavedContributionAmount(): number {
  if (typeof window === 'undefined') return 2500;
  try {
    const raw = localStorage.getItem(REBALANCE_CONTRIBUTION_KEY);
    if (!raw) return 2500;
    const val = parseFloat(raw);
    return isNaN(val) ? 2500 : val;
  } catch {
    return 2500;
  }
}

/**
 * Salva o valor de aporte simulado
 */
export function saveContributionAmount(val: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REBALANCE_CONTRIBUTION_KEY, val.toString());
  } catch (err) {
    console.error('[RebalanceService] Erro ao salvar valor de aporte:', err);
  }
}

/**
 * Calcula a alocação atual da carteira dividida por classe de ativos com base nas cotações correntes
 */
export function calculateCurrentClassValues(
  positions: PortfolioPosition[],
  stocks: StockItem[] = [],
  cdiAnnualRate: number = 13.65
): Record<AssetCategory, number> {
  const totals: Record<AssetCategory, number> = {
    acao: 0,
    fii: 0,
    renda_fixa: 0,
    cripto: 0,
  };

  positions.forEach((pos) => {
    let currentPrice = pos.averagePrice;
    const tickerUpper = pos.ticker.toUpperCase().trim();

    if (pos.category === 'renda_fixa') {
      currentPrice = pos.averagePrice * (1 + cdiAnnualRate / 100);
    } else if (pos.category === 'fii') {
      const foundFii = FII_DATASET.find((f) => f.ticker.toUpperCase() === tickerUpper);
      if (foundFii) currentPrice = foundFii.price;
    } else if (pos.category === 'acao') {
      const live = stocks.find((s) => s.ticker.toUpperCase() === tickerUpper);
      const fund = BASE_FUNDAMENTAL_STOCKS.find((fs) => fs.ticker.toUpperCase() === tickerUpper);
      if (live && live.price > 0) currentPrice = live.price;
      else if (fund) currentPrice = fund.price;
    }

    const posValue = pos.quantity * currentPrice;
    if (totals[pos.category] !== undefined) {
      totals[pos.category] += posValue;
    } else {
      totals.acao += posValue;
    }
  });

  return totals;
}

/**
 * Motor de Simulação de Rebalanceamento Inteligente (Aporte Estratégico sem Venda)
 * Determina exatamente quanto aportar em cada classe de ativos para aproximar
 * a carteira da meta ideal pré-definida pelo usuário.
 */
export function simulateRebalance(
  currentTotals: Record<AssetCategory, number>,
  targetAllocation: RebalanceTargetAllocation,
  contributionAmount: number
): RebalanceSimulationResult {
  const safeContribution = Math.max(0, contributionAmount);
  const totalCurrentValue = ALL_ASSET_CATEGORIES.reduce(
    (acc, cat) => acc + (currentTotals[cat] || 0),
    0
  );

  const totalProjectedValue = totalCurrentValue + safeContribution;
  const targetSum = ALL_ASSET_CATEGORIES.reduce(
    (acc, cat) => acc + (targetAllocation[cat] || 0),
    0
  );
  const isTargetValid = Math.abs(targetSum - 100) < 0.1;

  // Se a meta não for 100%, normalizar provisoriamente para evitar distorções
  const normalizedTargets: Record<AssetCategory, number> = {
    acao: targetSum > 0 ? ((targetAllocation.acao || 0) / targetSum) * 100 : 25,
    fii: targetSum > 0 ? ((targetAllocation.fii || 0) / targetSum) * 100 : 25,
    renda_fixa: targetSum > 0 ? ((targetAllocation.renda_fixa || 0) / targetSum) * 100 : 25,
    cripto: targetSum > 0 ? ((targetAllocation.cripto || 0) / targetSum) * 100 : 25,
  };

  // 1. Calcular o valor alvo ideal que cada classe deveria ter após o novo total projetado
  const deficits: Record<AssetCategory, number> = {
    acao: 0,
    fii: 0,
    renda_fixa: 0,
    cripto: 0,
  };

  let totalDeficit = 0;

  ALL_ASSET_CATEGORIES.forEach((cat) => {
    const targetVal = totalProjectedValue * (normalizedTargets[cat] / 100);
    const currVal = currentTotals[cat] || 0;
    const diff = targetVal - currVal;

    if (diff > 0) {
      deficits[cat] = diff;
      totalDeficit += diff;
    } else {
      deficits[cat] = 0;
    }
  });

  // 2. Alocar o aporte disponível prioritariamente para as classes em déficit
  const suggestedContributions: Record<AssetCategory, number> = {
    acao: 0,
    fii: 0,
    renda_fixa: 0,
    cripto: 0,
  };

  if (safeContribution > 0) {
    if (totalDeficit > 0) {
      if (safeContribution <= totalDeficit) {
        // O aporte cobre apenas parte do déficit: distribui proporcionalmente ao tamanho do déficit
        ALL_ASSET_CATEGORIES.forEach((cat) => {
          if (deficits[cat] > 0) {
            suggestedContributions[cat] = safeContribution * (deficits[cat] / totalDeficit);
          }
        });
      } else {
        // O aporte é maior que todo o déficit: supre 100% dos déficits e distribui o restante conforme o alvo
        const surplus = safeContribution - totalDeficit;
        ALL_ASSET_CATEGORIES.forEach((cat) => {
          suggestedContributions[cat] =
            deficits[cat] + surplus * (normalizedTargets[cat] / 100);
        });
      }
    } else {
      // Nenhuma classe em déficit (carteira perfeitamente equilibrada ou vazia):
      // Aporta seguindo exatamente a proporção da meta ideal
      ALL_ASSET_CATEGORIES.forEach((cat) => {
        suggestedContributions[cat] = safeContribution * (normalizedTargets[cat] / 100);
      });
    }
  }

  // 3. Montar a lista detalhada para renderização
  let underweightCount = 0;
  let overweightCount = 0;

  const classes: RebalanceClassItem[] = ALL_ASSET_CATEGORIES.map((cat) => {
    const currentValue = currentTotals[cat] || 0;
    const currentPercent =
      totalCurrentValue > 0 ? (currentValue / totalCurrentValue) * 100 : 0;
    const targetPercent = targetAllocation[cat] || 0;
    const targetValue = totalProjectedValue * (normalizedTargets[cat] / 100);
    const differenceValue = targetValue - currentValue;
    const suggestedContribution = suggestedContributions[cat];
    const projectedValue = currentValue + suggestedContribution;
    const projectedPercent =
      totalProjectedValue > 0 ? (projectedValue / totalProjectedValue) * 100 : 0;

    // Tolerância de 1.5% para considerar equilibrado
    let status: 'underweight' | 'balanced' | 'overweight' = 'balanced';
    if (currentPercent < targetPercent - 1.5) {
      status = 'underweight';
      underweightCount++;
    } else if (currentPercent > targetPercent + 1.5) {
      status = 'overweight';
      overweightCount++;
    }

    return {
      category: cat,
      label: CATEGORY_INFO[cat].label,
      color: CATEGORY_INFO[cat].color,
      currentValue,
      currentPercent,
      targetPercent,
      targetValue,
      differenceValue,
      suggestedContribution,
      projectedValue,
      projectedPercent,
      status,
    };
  });

  return {
    totalCurrentValue,
    contributionAmount: safeContribution,
    totalProjectedValue,
    classes,
    isTargetValid,
    targetSum,
    underweightCount,
    overweightCount,
  };
}

/**
 * Normaliza os valores de meta para somarem exatamente 100%
 */
export function normalizeTargetAllocation(
  target: RebalanceTargetAllocation
): RebalanceTargetAllocation {
  const sum = ALL_ASSET_CATEGORIES.reduce((acc, cat) => acc + (target[cat] || 0), 0);
  if (sum === 0) return DEFAULT_TARGET_ALLOCATION;

  const factor = 100 / sum;
  const normalized: RebalanceTargetAllocation = {
    acao: Math.round(target.acao * factor * 10) / 10,
    fii: Math.round(target.fii * factor * 10) / 10,
    renda_fixa: Math.round(target.renda_fixa * factor * 10) / 10,
    cripto: Math.round(target.cripto * factor * 10) / 10,
  };

  // Ajusta arredondamento no maior valor se faltar ou sobrar 0.1%
  const newSum = normalized.acao + normalized.fii + normalized.renda_fixa + normalized.cripto;
  const diff = Math.round((100 - newSum) * 10) / 10;
  if (diff !== 0) {
    normalized.acao = Math.round((normalized.acao + diff) * 10) / 10;
  }

  return normalized;
}
