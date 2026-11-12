// Converte a resposta bruta da brapi.dev para o formato do Rastreador.
// Regra de ouro: só usa números que a brapi realmente informou (ou que são derivados
// diretamente deles). Quando faltar um dado, devolve null/descarta o ativo, nunca inventa.

export interface LiveFundamentalBase {
  ticker: string;
  name: string;
  friendlyName: string;
  sector: string;
  price: number;
  changePercent: number;
  volume: number;
  pl: number;
  pvp: number;
  dy: number;
  roe: number;
  margemLiquida: number | null;
  dividaLiquidaEbitda: number | null;
  lpa: number;
  vpa: number;
  dpa12m: number;
}

const num = (v: unknown): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) ? v : undefined;
const r2 = (v: number) => parseFloat(v.toFixed(2));

export function sumDividends12m(item: any, nowMs: number): number | undefined {
  const list = item?.dividendsData?.cashDividends;
  if (!Array.isArray(list)) return undefined;
  const limit = nowMs - 365 * 24 * 60 * 60 * 1000;
  let total = 0;
  for (const d of list) {
    const rate = num(d?.rate);
    const when = Date.parse(d?.paymentDate || d?.lastDatePrior || d?.approvedOn || '');
    if (rate === undefined || !Number.isFinite(when)) continue;
    if (when >= limit && when <= nowMs) total += rate;
  }
  return total;
}

export function mapBrapiStock(item: any, nowMs = Date.now()): LiveFundamentalBase | null {
  const ticker = typeof item?.symbol === 'string' ? item.symbol.toUpperCase() : '';
  const price = num(item?.regularMarketPrice);
  if (!ticker || !price || price <= 0) return null;

  const stats = item.defaultKeyStatistics || {};
  const fin = item.financialData || {};

  const pl = num(item.priceEarnings) ?? num(stats.trailingPE);
  const pvp = num(stats.priceToBook);
  const roeRaw = num(fin.returnOnEquity);
  if (pl === undefined || pvp === undefined || roeRaw === undefined) return null;

  // LPA e VPA: usa o valor informado; senão deriva (preço / múltiplo)
  const lpa = num(item.earningsPerShare) ?? (pl !== 0 ? price / pl : undefined);
  const vpa = num(stats.bookValue) ?? (pvp !== 0 ? price / pvp : undefined);
  if (lpa === undefined || vpa === undefined) return null;

  // Dividendos: soma dos proventos pagos nos últimos 12 meses; fallback no yield informado
  let dpa12m = sumDividends12m(item, nowMs);
  let dy: number | undefined;
  if (dpa12m !== undefined) {
    dy = (dpa12m / price) * 100;
  } else {
    const rawDy = num(stats.dividendYield) ?? num(stats.yield);
    if (rawDy === undefined) return null;
    dy = rawDy * 100;
    dpa12m = (dy / 100) * price;
  }

  const sector: string = item.summaryProfile?.sector || item.sector || 'B3';
  const isFinancial = /financ|banco|seguro/i.test(sector);

  const margem = num(fin.profitMargins);
  const ebitda = num(fin.ebitda);
  const debt = num(fin.totalDebt);
  const cash = num(fin.totalCash);
  const divEbitda =
    !isFinancial && ebitda !== undefined && ebitda > 0 && debt !== undefined && cash !== undefined
      ? r2((debt - cash) / ebitda)
      : null;

  return {
    ticker,
    name: item.longName || item.shortName || ticker,
    friendlyName: item.shortName || item.longName || ticker,
    sector,
    price: r2(price),
    changePercent: r2(num(item.regularMarketChangePercent) ?? 0),
    volume: num(item.regularMarketVolume) ?? 0,
    pl: r2(pl),
    pvp: r2(pvp),
    dy: r2(dy),
    roe: r2(roeRaw * 100),
    margemLiquida: margem !== undefined ? r2(margem * 100) : null,
    dividaLiquidaEbitda: divEbitda,
    lpa: r2(lpa),
    vpa: r2(vpa),
    dpa12m: r2(dpa12m),
  };
}
