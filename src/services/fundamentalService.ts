import { FundamentalStock, FiiItem, ScreenerFilterState } from '../types/fundamental';
import { getFundamentalStocks, FundamentalBase } from '../data/fundamentalData';
import { FII_DATASET } from '../data/fiiData';

export type ScreenerSource = 'live' | 'static';

let liveCache: { stocks: FundamentalBase[]; updatedAt: string; fetchedAt: number } | null = null;
const LIVE_CLIENT_CACHE_MS = 10 * 60 * 1000;

async function loadLiveBase(): Promise<{ stocks: FundamentalBase[]; updatedAt: string } | null> {
  if (liveCache && Date.now() - liveCache.fetchedAt < LIVE_CLIENT_CACHE_MS) return liveCache;
  try {
    const res = await fetch('/api/screener/fundamentals');
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data?.stocks) || data.stocks.length < 5) return null;
    liveCache = { stocks: data.stocks, updatedAt: data.updatedAt, fetchedAt: Date.now() };
    return liveCache;
  } catch {
    return null;
  }
}

export async function getScreenerStocks(
  filters: ScreenerFilterState
): Promise<{ stocks: FundamentalStock[]; totalCount: number; source: ScreenerSource; updatedAt?: string }> {
  // Dados reais (brapi) quando disponíveis; senão, conjunto estático de referência (com aviso na tela)
  const live = await loadLiveBase();
  let list = getFundamentalStocks(filters.grahamMultiplier, filters.bazinYieldReq, live?.stocks);

  // Aplicar Presets consagrados
  if (filters.preset === 'graham') {
    // Graham: P/L > 0 e <= 15, P/VP <= 1.5, margem de segurança positiva
    list = list.filter((s) => s.pl > 0 && s.pl <= 15 && s.pvp <= 1.5 && s.grahamMargin > 0);
    list.sort((a, b) => b.grahamMargin - a.grahamMargin);
  } else if (filters.preset === 'bazin') {
    // Bazin: DY >= bazinYieldReq, Preço Teto > Preço Atual, dívida controlada
    list = list.filter((s) => s.dy >= filters.bazinYieldReq && s.bazinDiscount > 0 && s.dividaLiquidaEbitda !== null && s.dividaLiquidaEbitda <= 3.0);
    list.sort((a, b) => b.bazinDiscount - a.bazinDiscount);
  } else if (filters.preset === 'greenblatt') {
    // Fórmula Mágica: ordenada pelo ranking combinado Greenblatt
    list = list.filter((s) => s.greenblattRank !== undefined);
    list.sort((a, b) => (a.greenblattRank || 999) - (b.greenblattRank || 999));
  } else if (filters.preset === 'dividendos') {
    // Dividendos Sustentáveis: DY >= 6%, ROE >= 10%, P/L <= 15
    list = list.filter((s) => s.dy >= 6.0 && s.roe >= 10.0 && s.pl > 0 && s.pl <= 16);
    list.sort((a, b) => b.dy - a.dy);
  }

  // Filtros manuais
  if (filters.sector && filters.sector !== 'TODOS') {
    list = list.filter((s) => s.sector.toLowerCase().includes(filters.sector.toLowerCase()));
  }

  if (filters.minPrice > 0) {
    list = list.filter((s) => s.price >= filters.minPrice);
  }
  if (filters.maxPrice < 1000) {
    list = list.filter((s) => s.price <= filters.maxPrice);
  }

  if (filters.minPl > 0) {
    list = list.filter((s) => s.pl >= filters.minPl);
  }
  if (filters.maxPl < 100) {
    list = list.filter((s) => s.pl <= filters.maxPl);
  }

  if (filters.minPvp > 0) {
    list = list.filter((s) => s.pvp >= filters.minPvp);
  }
  if (filters.maxPvp < 20) {
    list = list.filter((s) => s.pvp <= filters.maxPvp);
  }

  if (filters.minDy > 0) {
    list = list.filter((s) => s.dy >= filters.minDy);
  }
  if (filters.maxDy < 50) {
    list = list.filter((s) => s.dy <= filters.maxDy);
  }

  if (filters.minRoe > 0) {
    list = list.filter((s) => s.roe >= filters.minRoe);
  }

  if (filters.minMargem > 0) {
    list = list.filter((s) => s.margemLiquida !== null && s.margemLiquida >= filters.minMargem);
  }

  if (filters.minVolume > 0) {
    list = list.filter((s) => s.volume >= filters.minVolume);
  }

  return {
    stocks: list,
    totalCount: list.length,
    source: live ? 'live' : 'static',
    updatedAt: live?.updatedAt,
  };
}

export interface FiiOverviewMetrics {
  avgPvp: number;
  avgDy12m: number;
  avgVacanciaFisica: number;
  totalFunds: number;
  totalMarketCap: number;
}

export async function getFiisList(
  segment: string = 'TODOS',
  typeFilter: string = 'TODOS',
  maxPvp?: number,
  minDy?: number,
  maxVacancia?: number
): Promise<{ fiis: FiiItem[]; overview: FiiOverviewMetrics }> {
  let list = [...FII_DATASET];

  if (segment !== 'TODOS') {
    list = list.filter((f) => f.segment === segment);
  }

  if (typeFilter !== 'TODOS') {
    list = list.filter((f) => f.type === typeFilter);
  }

  if (maxPvp !== undefined && maxPvp > 0) {
    list = list.filter((f) => f.pvp <= maxPvp);
  }

  if (minDy !== undefined && minDy > 0) {
    list = list.filter((f) => f.dy12m >= minDy);
  }

  if (maxVacancia !== undefined && maxVacancia < 100) {
    list = list.filter((f) => f.vacanciaFisica <= maxVacancia);
  }

  // Calcular overview metrics da lista total
  const total = FII_DATASET.length;
  const avgPvp = parseFloat((FII_DATASET.reduce((acc, f) => acc + f.pvp, 0) / total).toFixed(2));
  const avgDy12m = parseFloat((FII_DATASET.reduce((acc, f) => acc + f.dy12m, 0) / total).toFixed(1));
  const brickFunds = FII_DATASET.filter((f) => f.type === 'Tijolo');
  const avgVacanciaFisica = parseFloat(
    (brickFunds.reduce((acc, f) => acc + f.vacanciaFisica, 0) / (brickFunds.length || 1)).toFixed(1)
  );
  const totalMarketCap = FII_DATASET.reduce((acc, f) => acc + f.patrimonioLiquido, 0);

  return {
    fiis: list,
    overview: {
      avgPvp,
      avgDy12m,
      avgVacanciaFisica,
      totalFunds: total,
      totalMarketCap,
    },
  };
}
