export type AssetCategory = 'acao' | 'fii' | 'renda_fixa' | 'cripto';

export interface PortfolioPosition {
  id: string;
  ticker: string;
  name: string;
  category: AssetCategory;
  quantity: number;
  averagePrice: number;
  createdAt: string;
}

export interface EnrichedPosition extends PortfolioPosition {
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  gainLossBrl: number;
  gainLossPercent: number;
  annualDividendPerShare: number;
  projectedAnnualDividend: number;
  portfolioSharePercent: number;
  dividendYieldOnCost: number; // DY sobre o preço médio
}

export interface MonthlyDividendProjection {
  monthIndex: number; // 0 = Jan, 11 = Dez
  monthLabel: string;
  projectedValue: number;
  assets: Array<{
    ticker: string;
    value: number;
  }>;
}

export interface AllocationByClass {
  category: AssetCategory;
  label: string;
  color: string;
  totalValue: number;
  percent: number;
  count: number;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalGainLossBrl: number;
  totalGainLossPercent: number;
  projectedAnnualDividends: number;
  projectedMonthlyAverage: number;
  averageYieldOnCost: number;
  currentDividendYield: number;
  positionsCount: number;
  allocationByClass: AllocationByClass[];
  monthlyProjections: MonthlyDividendProjection[];
}

export type RebalanceTargetAllocation = Record<AssetCategory, number>;

export interface RebalanceClassItem {
  category: AssetCategory;
  label: string;
  color: string;
  currentValue: number;
  currentPercent: number;
  targetPercent: number;
  targetValue: number;
  differenceValue: number;
  suggestedContribution: number;
  projectedValue: number;
  projectedPercent: number;
  status: 'underweight' | 'balanced' | 'overweight';
}

export interface RebalanceSimulationResult {
  totalCurrentValue: number;
  contributionAmount: number;
  totalProjectedValue: number;
  classes: RebalanceClassItem[];
  isTargetValid: boolean;
  targetSum: number;
  underweightCount: number;
  overweightCount: number;
}

