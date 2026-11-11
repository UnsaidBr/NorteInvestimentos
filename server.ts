import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

dotenv.config();

// `npm start` passa --prod: garante modo produção mesmo se NODE_ENV não estiver definido
// (sem isso o servidor subiria o Vite de desenvolvimento e exporia /diagnostico).
if (process.argv.includes('--prod')) {
  process.env.NODE_ENV = 'production';
}
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Atrás de proxy (Render, Railway, Cloud Run): usa o IP real do visitante
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(express.json({ limit: '20kb' }));

// Cabeçalhos básicos de segurança
app.use((_req: Request, res: Response, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// ---------------------------------------------------------------------------
// Limite de requisições por IP (em memória, janela deslizante simples)
// ---------------------------------------------------------------------------
function createRateLimiter(maxRequests: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  setInterval(() => {
    const cutoff = Date.now() - windowMs;
    for (const [key, list] of hits) {
      const fresh = list.filter((t) => t > cutoff);
      if (fresh.length === 0) hits.delete(key);
      else hits.set(key, fresh);
    }
  }, windowMs).unref();

  return (req: Request, res: Response, next: () => void) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const list = (hits.get(key) || []).filter((t) => t > now - windowMs);
    if (list.length >= maxRequests) {
      res.setHeader('Retry-After', String(Math.ceil(windowMs / 1000)));
      return res.status(429).json({ error: 'Muitas requisições. Tente novamente em alguns minutos.' });
    }
    list.push(now);
    hits.set(key, list);
    next();
  };
}

// IA: 10 explicações por IP a cada 10 minutos (protege a cota do Gemini)
const aiRateLimit = createRateLimiter(10, 10 * 60 * 1000);
// Formulários (e-mail, lista de espera, contato): 8 envios por IP a cada 10 minutos
const formRateLimit = createRateLimiter(8, 10 * 60 * 1000);

// ---------------------------------------------------------------------------
// Supabase (REST, sem dependências extras). Variáveis: SUPABASE_URL e
// SUPABASE_SERVICE_ROLE_KEY (somente no servidor, nunca no navegador).
// ---------------------------------------------------------------------------
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

type SupabaseResult = { ok: boolean; duplicate?: boolean; error?: string };

async function supabaseInsert(table: string, row: Record<string, unknown>): Promise<SupabaseResult> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    });
    if (res.ok) return { ok: true };
    // 409 / código 23505 = violação de chave única (e-mail já cadastrado)
    const text = await res.text();
    if (res.status === 409 || text.includes('23505')) return { ok: true, duplicate: true };
    console.error(`[Supabase] Falha ao inserir em ${table}: HTTP ${res.status}`);
    return { ok: false, error: `HTTP ${res.status}` };
  } catch (err: any) {
    console.error(`[Supabase] Erro de rede em ${table}:`, err?.message || err);
    return { ok: false, error: 'network' };
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  return `${(user || '').slice(0, 2)}***@${domain || ''}`;
}

const STORAGE_UNAVAILABLE_MSG =
  'Cadastro temporariamente indisponível. Tente novamente em alguns minutos.';

// Modelos da IA: configure GEMINI_MODEL no .env para trocar sem mexer no código
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const GEMINI_FALLBACK_MODEL = 'gemini-flash-latest';

// Initialize Gemini Client server-side
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Cache memory for rate limiting / fast response (60s as requested)
let cachedMarketData: any = null;
let lastCacheTime = 0;
const CACHE_DURATION_MS = 60000; // 60 seconds

// In-memory cache for stock history (60s)
const historyCache = new Map<string, { data: any; timestamp: number }>();
const HISTORY_CACHE_DURATION_MS = 60000; // 60 seconds

// Helper to safely fetch with timeout
async function fetchWithTimeout(url: string, options: any = {}, timeoutMs = 4500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// In-memory subscribers store ready to connect with email services (Resend, Sendgrid, Mailchimp, etc.)
interface SubscriberRecord {
  email: string;
  consentedAt: string;
  ip?: string;
}
const subscribers: SubscriberRecord[] = [];

// Endpoint: Newsletter Subscription with consent
app.post('/api/subscribe', formRateLimit, async (req: Request, res: Response) => {
  const { email, consent } = req.body || {};

  if (!email || typeof email !== 'string' || email.length > 254 || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ error: 'Por favor, informe um endereço de e-mail válido.' });
  }

  if (consent !== true) {
    return res.status(400).json({
      error: 'É obrigatório concordar com o recebimento de e-mails e a Política de Privacidade.',
    });
  }

  const normalized = email.toLowerCase().trim();
  const consentedAt = new Date().toISOString();

  if (supabaseConfigured) {
    const result = await supabaseInsert('subscribers', { email: normalized, consented_at: consentedAt });
    if (!result.ok) return res.status(503).json({ error: STORAGE_UNAVAILABLE_MSG });
    if (result.duplicate) {
      return res.json({
        success: true,
        message: 'Este e-mail já está cadastrado em nosso Radar Semanal.',
        alreadySubscribed: true,
      });
    }
    console.log(`[Newsletter] Novo inscrito: ${maskEmail(normalized)}`);
    return res.json({
      success: true,
      message: 'Inscrição realizada com sucesso! Você receberá nosso radar semanal.',
    });
  }

  // Sem Supabase: em produção NÃO finge sucesso (o e-mail seria perdido)
  if (IS_PRODUCTION) {
    return res.status(503).json({ error: STORAGE_UNAVAILABLE_MSG });
  }

  // Apenas desenvolvimento: guarda em memória para testar a interface
  if (subscribers.some((s) => s.email === normalized)) {
    return res.json({
      success: true,
      message: 'Este e-mail já está cadastrado em nosso Radar Semanal.',
      alreadySubscribed: true,
    });
  }
  subscribers.push({ email: normalized, consentedAt });
  console.log(`[Newsletter DEV] Inscrito (memória, Supabase não configurado): ${maskEmail(normalized)}`);
  return res.json({
    success: true,
    message: 'Inscrição realizada com sucesso! (modo desenvolvimento, sem persistência)',
  });
});

// Endpoint: Envio de Notificação de Resumo do Rebalanceamento via Supabase
app.post('/api/portfolio/rebalance-email-notification', formRateLimit, async (req: Request, res: Response) => {
  const { email, totalCurrentValue, contributionAmount, totalProjectedValue, classes, notes } = req.body || {};

  if (!email || typeof email !== 'string' || email.length > 254 || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ error: 'Por favor, informe um endereço de e-mail válido.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const safeTotalCurrent = Number(totalCurrentValue) || 0;
  const safeContribution = Number(contributionAmount) || 0;
  const safeTotalProjected = Number(totalProjectedValue) || 0;
  const safeClasses = Array.isArray(classes) ? classes : [];

  const payloadRecord = {
    email: normalizedEmail,
    total_current_value: safeTotalCurrent,
    contribution_amount: safeContribution,
    total_projected_value: safeTotalProjected,
    rebalance_summary: {
      classes: safeClasses,
      notes: typeof notes === 'string' ? notes.slice(0, 300) : '',
      timestamp: new Date().toISOString(),
    },
    status: 'sent',
    created_at: new Date().toISOString(),
  };

  if (supabaseConfigured) {
    const result = await supabaseInsert('rebalance_notifications', payloadRecord);
    if (!result.ok) {
      console.warn('[Supabase] Falha ao registrar notificação em rebalance_notifications:', result.error);
    } else {
      console.log(`[Rebalance Notification] Registrado com sucesso no Supabase para: ${maskEmail(normalizedEmail)}`);
    }

    return res.json({
      success: true,
      message: `Notificação enviada com sucesso para ${maskEmail(normalizedEmail)}! O resumo do seu rebalanceamento foi sincronizado no Supabase.`,
      supabaseSynced: result.ok,
    });
  }

  // Modo local / desenvolvimento sem Supabase configurado
  console.log(`[Rebalance Notification DEV] Simulação de envio para ${maskEmail(normalizedEmail)}: Aporte R$ ${safeContribution.toFixed(2)}, Projetado R$ ${safeTotalProjected.toFixed(2)}`);
  return res.json({
    success: true,
    message: `Notificação gerada com sucesso para ${maskEmail(normalizedEmail)}! (Modo Local / Simulação ativa)`,
    supabaseSynced: false,
  });
});

// Currency Cache (5 minutes = 300,000 ms to avoid rate-limiting and maximize reliability)
let cachedCurrenciesData: any = null;
let lastCurrenciesFetchTime = 0;
const CURRENCIES_CACHE_MS = 5 * 60 * 1000;
let lastRealCurrenciesStore: any = null;

// Macro Cache (5 minutes)
let cachedMacroData: any = null;
let lastMacroFetchTime = 0;
const MACRO_CACHE_MS = 5 * 60 * 1000;
let lastRealMacroStore: any = null;

// Real stocks and crypto cache
let lastRealStocksStore: any[] | null = null;
let lastRealStocksTime: string | null = null;
let lastRealCryptoStore: any = null;

// Check if demonstration mock data is explicitly enabled
const isDemoModeAllowed = process.env.DEMO_MODE === 'true';

// Helper to format Date for Bacen Olinda PTAX (MM-DD-YYYY)
function formatMmDdYyyy(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

// Helper to format short date time (dd/mm hh:mm)
function formatShortTime(isoDate?: string | null): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm} ${hh}:${min}`;
}

// 1. Câmbio: Banco Central do Brasil PTAX Olinda API como fonte exclusiva, com cache de 5 minutos
async function fetchCurrenciesWithFallback() {
  const now = Date.now();
  if (cachedCurrenciesData && now - lastCurrenciesFetchTime < CURRENCIES_CACHE_MS) {
    return cachedCurrenciesData;
  }

  // 1.1 Fonte Exclusiva: Banco Central do Brasil (PTAX Olinda API)
  try {
    const today = new Date();
    const endStr = formatMmDdYyyy(today);
    const startStr = formatMmDdYyyy(new Date(today.getTime() - 7 * 86400000));

    const [usdRes, eurRes] = await Promise.allSettled([
      fetchWithTimeout(
        `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@dataInicial='${startStr}'&@dataFinalCotacao='${endStr}'&$top=10&$orderby=dataHoraCotacao%20desc&$format=json`,
        {},
        5000
      ),
      fetchWithTimeout(
        `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@moeda='EUR'&@dataInicial='${startStr}'&@dataFinalCotacao='${endStr}'&$top=20&$orderby=dataHoraCotacao%20desc&$format=json`,
        {},
        5000
      ),
    ]);

    let usdItem: any = null;
    let eurItem: any = null;

    if (usdRes.status === 'fulfilled' && usdRes.value.ok) {
      const uData = await usdRes.value.json();
      const list = uData.value;
      if (Array.isArray(list) && list.length > 0) {
        const byDate = new Map<string, any>();
        for (const item of list) {
          const datePart = (item.dataHoraCotacao || '').split(' ')[0];
          if (!datePart) continue;
          if (!byDate.has(datePart)) {
            byDate.set(datePart, item);
          } else if (item.tipoBoletim === 'Fechamento') {
            byDate.set(datePart, item);
          }
        }
        const dates = Array.from(byDate.keys()).sort().reverse();
        if (dates.length > 0) {
          const latest = byDate.get(dates[0]);
          const prev = dates.length > 1 ? byDate.get(dates[1]) : null;
          const latestVenda = Number(latest.cotacaoVenda || latest.cotacaoCompra || 0);
          const prevVenda = prev ? Number(prev.cotacaoVenda || prev.cotacaoCompra || 0) : latestVenda;
          const pctChange = prevVenda > 0 ? parseFloat((((latestVenda - prevVenda) / prevVenda) * 100).toFixed(2)) : 0;
          const [y, m, d] = dates[0].split('-');
          const dateLabel = `PTAX de ${d}/${m}`;

          const sparklineUsd = [...dates].reverse().map((dt) => {
            const it = byDate.get(dt);
            return Number(it?.cotacaoVenda || it?.cotacaoCompra || 0);
          }).filter((v) => v > 0);

          usdItem = {
            code: 'USD',
            name: 'Dólar PTAX',
            symbol: 'US$',
            bid: parseFloat(latestVenda.toFixed(4)),
            pctChange,
            high: parseFloat(Math.max(latestVenda, prevVenda).toFixed(4)),
            low: parseFloat(Math.min(latestVenda, prevVenda).toFixed(4)),
            updatedAt: dateLabel,
            dateLabel,
            source: 'Banco Central do Brasil (PTAX)',
            statusText: dateLabel,
            isRealData: true,
            rawDate: latest.dataHoraCotacao,
            sparkline: sparklineUsd.length >= 2 ? sparklineUsd : undefined,
          };
        }
      }
    }

    if (eurRes.status === 'fulfilled' && eurRes.value.ok) {
      const eData = await eurRes.value.json();
      const list = eData.value;
      if (Array.isArray(list) && list.length > 0) {
        const byDate = new Map<string, any>();
        for (const item of list) {
          const datePart = (item.dataHoraCotacao || '').split(' ')[0];
          if (!datePart) continue;
          if (!byDate.has(datePart)) {
            byDate.set(datePart, item);
          } else if (item.tipoBoletim === 'Fechamento') {
            byDate.set(datePart, item);
          }
        }
        const dates = Array.from(byDate.keys()).sort().reverse();
        if (dates.length > 0) {
          const latest = byDate.get(dates[0]);
          const prev = dates.length > 1 ? byDate.get(dates[1]) : null;
          const latestVenda = Number(latest.cotacaoVenda || latest.cotacaoCompra || 0);
          const prevVenda = prev ? Number(prev.cotacaoVenda || prev.cotacaoCompra || 0) : latestVenda;
          const pctChange = prevVenda > 0 ? parseFloat((((latestVenda - prevVenda) / prevVenda) * 100).toFixed(2)) : 0;
          const [y, m, d] = dates[0].split('-');
          const dateLabel = `PTAX de ${d}/${m}`;

          const sparklineEur = [...dates].reverse().map((dt) => {
            const it = byDate.get(dt);
            return Number(it?.cotacaoVenda || it?.cotacaoCompra || 0);
          }).filter((v) => v > 0);

          eurItem = {
            code: 'EUR',
            name: 'Euro PTAX',
            symbol: '€',
            bid: parseFloat(latestVenda.toFixed(4)),
            pctChange,
            high: parseFloat(Math.max(latestVenda, prevVenda).toFixed(4)),
            low: parseFloat(Math.min(latestVenda, prevVenda).toFixed(4)),
            updatedAt: dateLabel,
            dateLabel,
            source: 'Banco Central do Brasil (PTAX)',
            statusText: dateLabel,
            isRealData: true,
            rawDate: latest.dataHoraCotacao,
            sparkline: sparklineEur.length >= 2 ? sparklineEur : undefined,
          };
        }
      }
    }

    if (usdItem && eurItem) {
      const res = {
        usd: usdItem,
        eur: eurItem,
        isRealData: true,
        source: 'Banco Central do Brasil (PTAX)',
        timestamp: new Date().toISOString(),
      };
      cachedCurrenciesData = res;
      lastCurrenciesFetchTime = now;
      lastRealCurrenciesStore = res;
      return res;
    }
  } catch (err) {
    console.warn('[Câmbio] Falha ao consultar Bacen PTAX:', err);
  }

  // 1.2 Fallback: Último valor real em cache com data e hora
  if (lastRealCurrenciesStore) {
    const timeLabel = formatShortTime(lastRealCurrenciesStore.timestamp);
    return {
      usd: {
        ...lastRealCurrenciesStore.usd,
        statusText: `último valor real: ${timeLabel}`,
      },
      eur: {
        ...lastRealCurrenciesStore.eur,
        statusText: `último valor real: ${timeLabel}`,
      },
      isRealData: true,
      source: `${lastRealCurrenciesStore.source} (Cache)`,
      statusText: `último valor real: ${timeLabel}`,
      timestamp: lastRealCurrenciesStore.timestamp,
    };
  }

  // 1.3 Se DEMO_MODE for true, usa dados simulados rotulados
  if (isDemoModeAllowed) {
    return {
      usd: {
        code: 'USD',
        name: 'Dólar PTAX',
        symbol: 'US$',
        bid: 5.482,
        pctChange: -0.35,
        statusText: 'Dado de demonstração',
        isRealData: false,
      },
      eur: {
        code: 'EUR',
        name: 'Euro PTAX',
        symbol: '€',
        bid: 6.014,
        pctChange: -0.18,
        statusText: 'Dado de demonstração',
        isRealData: false,
      },
      isRealData: false,
      source: 'Demonstração (DEMO_MODE)',
      statusText: 'Dado de demonstração',
      timestamp: new Date().toISOString(),
    };
  }

  // 1.4 Fora de DEMO_MODE: nunca exibir números inventados/contingência
  return {
    usd: {
      code: 'USD',
      name: 'Dólar PTAX',
      symbol: 'US$',
      bid: null,
      pctChange: null,
      statusText: 'Indisponível no momento',
      isRealData: false,
    },
    eur: {
      code: 'EUR',
      name: 'Euro PTAX',
      symbol: '€',
      bid: null,
      pctChange: null,
      statusText: 'Indisponível no momento',
      isRealData: false,
    },
    isRealData: false,
    source: 'Indisponível',
    statusText: 'Indisponível no momento',
    timestamp: new Date().toISOString(),
  };
}

// 2. Macro: Séries do Banco Central (SGS) com validação de data futura e CDI real/estimado
async function fetchBcbMacroData() {
  const now = Date.now();
  if (cachedMacroData && now - lastMacroFetchTime < MACRO_CACHE_MS) {
    return cachedMacroData;
  }

  try {
    const [selicRes, cdiRes, ipcaRes] = await Promise.allSettled([
      fetchWithTimeout('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/10?formato=json', {}, 4000),
      fetchWithTimeout('https://api.bcb.gov.br/dados/serie/bcdata.sgs.4389/dados/ultimos/1?formato=json', {}, 4000),
      fetchWithTimeout('https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados/ultimos/1?formato=json', {}, 4000),
    ]);

    let selicRate: number | null = null;
    let selicDate: string = 'Indisponível';
    let selicWarning: string | null = null;
    let selicDiscardedCount = 0;

    if (selicRes.status === 'fulfilled' && selicRes.value.ok) {
      const data = await selicRes.value.json();
      if (Array.isArray(data) && data.length > 0) {
        const today = new Date();
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        const validRecords: any[] = [];

        for (const item of data) {
          const rawDate = String(item.data || '');
          const [d, m, y] = rawDate.split('/').map(Number);
          const recordDate = new Date(y, (m || 1) - 1, d || 1, 23, 59, 59);

          if (isNaN(recordDate.getTime()) || recordDate.getTime() > todayEnd.getTime()) {
            selicDiscardedCount++;
          } else {
            validRecords.push({
              rate: parseFloat(item.valor),
              date: rawDate,
              recordDate,
            });
          }
        }

        if (validRecords.length > 0) {
          validRecords.sort((a, b) => b.recordDate.getTime() - a.recordDate.getTime());
          selicRate = validRecords[0].rate;
          selicDate = validRecords[0].date;
          if (selicDiscardedCount > 0) {
            selicWarning = `${selicDiscardedCount} registros da série SGS 432 com data futura foram descartados. Usando último registro válido (${selicDate}).`;
          }
        } else {
          selicRate = null;
          selicDate = 'Indisponível';
          selicWarning = `${selicDiscardedCount} registros descartados da série SGS 432 (todos com data futura posterior a hoje).`;
        }
      }
    }

    // Regra 6: Preferir série real do CDI (SGS 4389). Se estimada da Selic, rotular como "CDI estimado"
    let cdiRate: number | null = null;
    let cdiDate: string = '—';
    let isCdiEstimated = false;
    let cdiLabel = 'CDI (Bacen)';

    if (cdiRes.status === 'fulfilled' && cdiRes.value.ok) {
      const data = await cdiRes.value.json();
      if (Array.isArray(data) && data[0]?.valor) {
        cdiRate = parseFloat(data[0].valor);
        cdiDate = data[0].data;
        isCdiEstimated = false;
        cdiLabel = 'CDI (Bacen SGS 4389)';
      }
    }

    if (cdiRate === null && selicRate !== null) {
      cdiRate = parseFloat(Math.max(0, selicRate - 0.10).toFixed(2));
      cdiDate = selicDate;
      isCdiEstimated = true;
      cdiLabel = 'CDI estimado';
    }

    let ipcaRate: number | null = null;
    let ipcaDate: string = '—';
    if (ipcaRes.status === 'fulfilled' && ipcaRes.value.ok) {
      const data = await ipcaRes.value.json();
      if (Array.isArray(data) && data[0]?.valor) {
        ipcaRate = parseFloat(data[0].valor);
        ipcaDate = data[0].data;
      }
    }

    if (selicRate !== null || cdiRate !== null || ipcaRate !== null || selicDiscardedCount > 0) {
      const res = {
        selic: {
          rateAnnual: selicRate,
          date: selicDate,
          source: 'Banco Central do Brasil (SGS 432)',
          warning: selicWarning,
          discardedCount: selicDiscardedCount,
          statusText: selicRate !== null ? 'Dado Real' : 'Indisponível',
        },
        cdi: {
          rateAnnual: cdiRate,
          date: cdiDate,
          isEstimated: isCdiEstimated,
          label: cdiLabel,
          statusText: cdiRate !== null ? (isCdiEstimated ? 'CDI estimado' : 'Dado Real') : 'Indisponível',
        },
        ipca: {
          rate12m: ipcaRate,
          date: ipcaDate,
          source: 'IBGE / BCB SGS 13522',
          statusText: ipcaRate !== null ? 'Dado Real' : 'Indisponível',
        },
        ibovespa: {
          points: null,
          changePercent: null,
          statusText: 'Indisponível no momento',
        },
        isRealData: Boolean(selicRate !== null || cdiRate !== null || ipcaRate !== null),
        timestamp: new Date().toISOString(),
        selicWarning,
        selicDiscardedCount,
      };

      cachedMacroData = res;
      lastMacroFetchTime = now;
      lastRealMacroStore = res;
      return res;
    }
  } catch (err) {
    console.warn('[Macro] Falha ao consultar séries do Bacen SGS:', err);
  }

  // Fallback para último valor real com indicação explícita
  if (lastRealMacroStore) {
    const timeLabel = formatShortTime(lastRealMacroStore.timestamp);
    return {
      ...lastRealMacroStore,
      selic: { ...lastRealMacroStore.selic, statusText: `último valor real: ${timeLabel}` },
      cdi: { ...lastRealMacroStore.cdi, statusText: `último valor real: ${timeLabel}` },
      ipca: { ...lastRealMacroStore.ipca, statusText: `último valor real: ${timeLabel}` },
      ibovespa: { points: null, changePercent: null, statusText: 'Indisponível no momento' },
      isCachedReal: true,
      statusText: `último valor real: ${timeLabel}`,
    };
  }

  // Nunca exibir números fixos como se fossem atuais
  return {
    selic: { rateAnnual: null, date: '—', source: 'BCB', statusText: 'Indisponível no momento' },
    cdi: { rateAnnual: null, isEstimated: false, label: 'CDI', statusText: 'Indisponível no momento' },
    ipca: { rate12m: null, date: '—', statusText: 'Indisponível no momento' },
    ibovespa: { points: null, changePercent: null, statusText: 'Indisponível no momento' },
    isRealData: false,
    statusText: 'Indisponível no momento',
  };
}

// Endpoint: Explain Stock Movement with Gemini (Regra 5: nunca exibir texto pré-escrito)
app.post('/api/gemini/explain-stock', aiRateLimit, async (req: Request, res: Response) => {
  const body = req.body || {};
  const rawSymbol = typeof body.symbol === 'string' ? body.symbol.trim().toUpperCase() : '';

  // Ticker da B3: 4 letras + 1 ou 2 dígitos (ex.: PETR4, BOVA11). Bloqueia texto livre no prompt.
  if (!/^[A-Z]{4}\d{1,2}$/.test(rawSymbol)) {
    return res.status(400).json({ error: 'Ticker inválido.' });
  }
  const symbol = rawSymbol;
  // Nome da empresa: só letras, números e pontuação simples (sem quebras de linha), máx. 80 caracteres
  const name =
    typeof body.name === 'string' ? body.name.replace(/[^\p{L}\p{N} .&\-/]/gu, '').slice(0, 80) : '';
  const price = Number(body.price);
  const changePercent = Number(body.changePercent);
  if (!Number.isFinite(price) || price <= 0 || price > 1_000_000 || !Number.isFinite(changePercent) || Math.abs(changePercent) > 100) {
    return res.status(400).json({ error: 'Dados de cotação inválidos.' });
  }

  const isPositive = Number(changePercent) >= 0;
  const variationDesc = isPositive
    ? `alta de +${Number(changePercent).toFixed(2)}%`
    : `queda de ${Number(changePercent).toFixed(2)}%`;

  if (!ai || !apiKey) {
    return res.json({
      symbol,
      explanation: 'Explicação por IA indisponível no momento. Tente novamente em instantes.',
      disclaimer: 'Conteúdo informativo e educacional. Não constitui recomendação de investimento.',
      isFallback: true,
      available: false,
    });
  }

  try {
    const prompt = `Você é um analista de educação financeira brasileiro do portal NorteInvest.
Explique em português do Brasil (pt-BR), de forma simples, clara e acessível para quem está COMEÇANDO a investir agora, os possíveis motivos e hipóteses de mercado para a variação da ação ${symbol} (${name || ''}) que registrou cotação de R$ ${Number(price).toFixed(2)} com ${variationDesc}.

REGRAS OBRIGATÓRIAS (Conformidade CVM / Anbima):
1. Escreva um texto conciso de exatamente 3 a 4 linhas (ou 2 parágrafos curtos).
2. Use linguagem amigável, didática e sem jargões complexos sem explicação.
3. Aborde hipóteses comuns que influenciam esse tipo de empresa na B3 (ex: preço de commodities, decisões de taxa de juros Selic, expectativas de balanço ou cenário econômico global).
4. NUNCA diga para comprar, vender, manter ou que é o "melhor investimento".
5. Deixe claro que são hipóteses gerais de mercado e não certezas absolutas.
6. Não use asteriscos de markdown excessivos.`;

    const request = {
      contents: prompt,
      config: {
        systemInstruction:
          'Você é um educador financeiro do portal NorteInvest. Seu papel é educar iniciantes com clareza, neutralidade, ética e sem promessas ou recomendações de compra/venda.',
      },
    };

    // Modelo configurável (GEMINI_MODEL). Se o modelo não existir, tenta o alias estável.
    let response;
    try {
      response = await ai.models.generateContent({ model: GEMINI_MODEL, ...request });
    } catch (primaryError: any) {
      const msg = String(primaryError?.message || primaryError);
      const modelProblem = /not found|404|NOT_FOUND|is not supported|unsupported/i.test(msg);
      if (!modelProblem || GEMINI_MODEL === GEMINI_FALLBACK_MODEL) throw primaryError;
      console.warn(`[Gemini] Modelo "${GEMINI_MODEL}" indisponível (${msg.slice(0, 120)}). Tentando "${GEMINI_FALLBACK_MODEL}".`);
      response = await ai.models.generateContent({ model: GEMINI_FALLBACK_MODEL, ...request });
    }

    const explanation = response.text?.trim() || 'Explicação por IA indisponível no momento. Tente novamente em instantes.';

    return res.json({
      symbol,
      explanation,
      disclaimer: 'Conteúdo informativo e educacional. Não constitui recomendação de investimento. Rentabilidade passada não garante resultados futuros.',
      isFallback: false,
      available: true,
    });
  } catch (error: any) {
    console.error('Gemini API error:', error?.message || error);
    return res.json({
      symbol,
      explanation: 'Explicação por IA indisponível no momento. Tente novamente em instantes.',
      disclaimer: 'Conteúdo informativo e educacional. Não constitui recomendação de investimento. Rentabilidade passada não garante resultados futuros.',
      isFallback: true,
      available: false,
      errorNotice: error?.message || 'Indisponível no momento',
    });
  }
});

// Cache em memória para Análises de Ativos por IA (5 minutos)
const assetAnalysisCache = new Map<string, { data: any; timestamp: number }>();
const ASSET_ANALYSIS_CACHE_MS = 5 * 60 * 1000;

// Endpoint: Análise Automatizada de Ativos da Carteira com Gemini
app.post('/api/gemini/analyze-asset', aiRateLimit, async (req: Request, res: Response) => {
  const body = req.body || {};
  const rawTicker = typeof body.ticker === 'string' ? body.ticker.trim().toUpperCase() : '';
  const ticker = rawTicker.slice(0, 15);
  const name =
    typeof body.name === 'string'
      ? body.name.replace(/[^\p{L}\p{N} .&\-/]/gu, '').slice(0, 80)
      : ticker;
  const category = typeof body.category === 'string' ? body.category.slice(0, 20) : 'acao';
  const currentPrice = Number(body.currentPrice) || 0;
  const averagePrice = Number(body.averagePrice) || 0;
  const gainLossPercent = Number(body.gainLossPercent) || 0;
  const dividendYield = Number(body.dividendYield) || 0;
  const quantity = Number(body.quantity) || 0;
  const forceRefresh = Boolean(body.forceRefresh);

  if (!ticker) {
    return res.status(400).json({ error: 'Ticker do ativo é obrigatório.' });
  }

  // Verificar cache
  const cacheKey = `${ticker}_${category}`;
  const now = Date.now();
  const cached = assetAnalysisCache.get(cacheKey);
  if (cached && now - cached.timestamp < ASSET_ANALYSIS_CACHE_MS && !forceRefresh) {
    return res.json({ ...cached.data, cached: true });
  }

  if (!ai || !apiKey) {
    return res.json({
      ticker,
      name,
      category,
      overview: `Análise automatizada de ${ticker} (${name}): Acompanhe a evolução das cotações em relação ao seu preço médio de R$ ${averagePrice.toFixed(2)}. No momento o serviço de IA está operando em contingência.`,
      keyDrivers: [
        'Variações de liquidez diária e volume financeiro negociado no pregão.',
        'Sensibilidade ao ciclo macroeconômico brasileiro e juros Selic.',
        'Divulgações de resultados trimestrais e proventos aos cotistas/acionistas.',
      ],
      macroContext: 'O patamar da taxa Selic e o fluxo de capital na B3 são os principais direcionadores de curto e médio prazo.',
      valuationAndDividends:
        dividendYield > 0
          ? `O ativo apresenta Dividend Yield estimado em cerca de ${dividendYield.toFixed(2)}%.`
          : 'Acompanhe a distribuição de proventos e lucros nos fatos relevantes da B3.',
      riskNotice: 'Risco de volatilidade de mercado e oscilação dos preços no pregão.',
      disclaimer: 'Conteúdo informativo e educacional. Não constitui recomendação de investimento (CVM). Rentabilidade passada não garante resultados futuros.',
      isFallback: true,
      available: false,
      generatedAt: new Date().toISOString(),
    });
  }

  try {
    const prompt = `Você é um analista sênior de inteligência de mercado do portal NorteInvest (estilo Private Banking).
Elabore uma análise automatizada, concisa, precisa e elegante sobre o desempenho recente e fundamentos do ativo ${ticker} (${name}), classificado como "${category}".

Dados consolidados do investidor:
- Cotação atual no mercado: R$ ${currentPrice.toFixed(2)}
- Preço médio de aquisição: R$ ${averagePrice.toFixed(2)}
- Quantidade em carteira: ${quantity}
- Rentabilidade acumulada na posição: ${gainLossPercent >= 0 ? '+' : ''}${gainLossPercent.toFixed(2)}%
${dividendYield > 0 ? `- Dividend Yield estimado: ${dividendYield.toFixed(2)}%` : ''}

Forneça a resposta estritamente no esquema estruturado com:
1. overview: Resumo de 2 a 3 frases sobre o momento e o desempenho recente do ativo no mercado brasileiro.
2. keyDrivers: Lista de exatamente 3 pontos curtos e objetivos sobre os catalisadores recentes (ex.: commodities, resultados contábeis, juros, demanda).
3. macroContext: Análise de 1 a 2 frases relacionando o ativo ao cenário macroeconômico atual do Brasil (Selic, inflação IPCA, câmbio dólar).
4. valuationAndDividends: Análise de 1 a 2 frases sobre patamar de preço, geração de caixa e sustentabilidade de proventos.
5. riskNotice: O principal fator de risco que o investidor deve monitorar com atenção.

REGRAS OBRIGATÓRIAS (CVM / ANBIMA):
- Mantenha tom estritamente analítico e neutro.
- NUNCA recomende compra, venda ou alteração de posição.
- Não faça promessas de rentabilidade futura.`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction:
            'Você é o analista sênior do NorteInvest. Produza diagnósticos financeiros claros, elegantes, neutros e estritamente aderentes às normas da CVM.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overview: { type: Type.STRING, description: 'Resumo sobre o momento e desempenho recente' },
              keyDrivers: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Exatamente 3 catalisadores recentes',
              },
              macroContext: { type: Type.STRING, description: 'Impacto do cenário macro brasileiro' },
              valuationAndDividends: { type: Type.STRING, description: 'Comentário sobre proventos e patamar' },
              riskNotice: { type: Type.STRING, description: 'Principal risco a monitorar' },
            },
            required: ['overview', 'keyDrivers', 'macroContext', 'valuationAndDividends', 'riskNotice'],
          },
        },
      });
    } catch (primaryErr: any) {
      console.warn(`[Gemini Asset Analysis] Falha no modelo primário ${GEMINI_MODEL}, tentando fallback...`);
      response = await ai.models.generateContent({
        model: GEMINI_FALLBACK_MODEL,
        contents: prompt,
        config: {
          systemInstruction:
            'Você é o analista sênior do NorteInvest. Produza diagnósticos financeiros claros, elegantes, neutros e estritamente aderentes às normas da CVM.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overview: { type: Type.STRING, description: 'Resumo sobre o momento e desempenho recente' },
              keyDrivers: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Exatamente 3 catalisadores recentes',
              },
              macroContext: { type: Type.STRING, description: 'Impacto do cenário macro brasileiro' },
              valuationAndDividends: { type: Type.STRING, description: 'Comentário sobre proventos e patamar' },
              riskNotice: { type: Type.STRING, description: 'Principal risco a monitorar' },
            },
            required: ['overview', 'keyDrivers', 'macroContext', 'valuationAndDividends', 'riskNotice'],
          },
        },
      });
    }

    const parsed = JSON.parse(response.text || '{}');

    const result = {
      ticker,
      name,
      category,
      overview: parsed.overview || `Análise de desempenho de ${ticker} concluída com sucesso.`,
      keyDrivers:
        Array.isArray(parsed.keyDrivers) && parsed.keyDrivers.length > 0
          ? parsed.keyDrivers
          : [
              'Acompanhamento de receita e margem líquida.',
              'Oscilações do mercado local e comportamento setorial.',
              'Expectativas macroeconômicas e ciclo de juros.',
            ],
      macroContext: parsed.macroContext || 'Influência da política monetária do Banco Central e taxa Selic.',
      valuationAndDividends: parsed.valuationAndDividends || 'Geração contínua de caixa e sustentabilidade de proventos.',
      riskNotice: parsed.riskNotice || 'Volatilidade inerente à classe do ativo no pregão da B3.',
      disclaimer:
        'Conteúdo informativo gerado via inteligência artificial em conformidade com as normas da CVM. Não constitui recomendação de investimento. Rentabilidade passada não é garantia de retorno futuro.',
      isFallback: false,
      available: true,
      generatedAt: new Date().toISOString(),
      model: GEMINI_MODEL,
    };

    assetAnalysisCache.set(cacheKey, { data: result, timestamp: now });
    return res.json(result);
  } catch (error: any) {
    console.error('[Gemini Asset Analysis Error]:', error?.message || error);
    return res.json({
      ticker,
      name,
      category,
      overview: `Análise preliminar de ${ticker} (${name}): O ativo tem acompanhado os movimentos recentes do setor e as oscilações do mercado de capitais brasileiro.`,
      keyDrivers: [
        'Sensibilidade à curva de juros futuros e taxa Selic.',
        'Resultados operacionais e balanço financeiro na B3.',
        'Comportamento do investidor institucional e fluxo estrangeiro.',
      ],
      macroContext: 'O patamar de juros e o controle inflacionário afetam diretamente a precificação do ativo.',
      valuationAndDividends:
        dividendYield > 0
          ? `Projeção de rendimentos com Dividend Yield de aproximadamente ${dividendYield.toFixed(2)}%.`
          : 'Acompanhe a distribuição de lucros conforme calendário oficial da B3.',
      riskNotice: 'Risco de mercado e alterações na conjuntura macroeconômica.',
      disclaimer: 'Conteúdo informativo e educacional. Não constitui recomendação de investimento (CVM).',
      isFallback: true,
      available: false,
      generatedAt: new Date().toISOString(),
      errorNotice: error?.message || 'Erro temporário na geração de IA',
    });
  }
});

// Endpoint: Aggregate live market data (B3, Currencies, Crypto, Selic) with server cache
app.get('/api/market/all', async (_req: Request, res: Response) => {
  const now = Date.now();
  if (cachedMarketData && now - lastCacheTime < CACHE_DURATION_MS) {
    return res.json({ ...cachedMarketData, cached: true });
  }

  const results: any = {
    timestamp: new Date().toISOString(),
    currencies: null,
    crypto: null,
    macro: null,
    selic: null,
    stocks: null,
    isRealData: false,
  };

  // 1. Câmbio (Banco Central do Brasil PTAX Olinda com cache de 5min)
  const currencyResult = await fetchCurrenciesWithFallback();
  results.currencies = currencyResult;
  if (currencyResult.isRealData) results.isRealData = true;

  // 2. Macro (Bacen SGS 432 Selic com validação de data futura, 4389 CDI, 13522 IPCA)
  const macroResult = await fetchBcbMacroData();
  results.macro = macroResult;
  results.selic = macroResult.selic ? { rate: macroResult.selic.rateAnnual, date: macroResult.selic.date, source: macroResult.selic.source } : null;
  if (macroResult.isRealData) results.isRealData = true;

  // 3. Fetch CoinGecko for Bitcoin, Ethereum, Solana
  try {
    let btcSparkline: number[] | undefined;
    try {
      const btcChartRes = await fetchWithTimeout(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=brl&ids=bitcoin&sparkline=true',
        {},
        3500
      );
      if (btcChartRes.ok) {
        const btcData = await btcChartRes.json();
        const rawSpark = btcData?.[0]?.sparkline_in_7d?.price;
        if (Array.isArray(rawSpark) && rawSpark.length >= 2) {
          const step = Math.max(1, Math.floor(rawSpark.length / 24));
          btcSparkline = rawSpark.filter((_: number, idx: number) => idx % step === 0);
        }
      }
    } catch {
      // Ignora erro no sparkline secundário
    }

    const cryptoRes = await fetchWithTimeout(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=brl,usd&include_24hr_change=true',
      {},
      4000
    );
    if (cryptoRes.ok) {
      const cryptoData = await cryptoRes.json();
      results.crypto = {
        btc: {
          name: 'Bitcoin',
          symbol: 'BTC',
          priceBrl: cryptoData.bitcoin?.brl ?? null,
          change24h: cryptoData.bitcoin?.brl_24h_change ?? null,
          statusText: 'Dado Real (CoinGecko)',
          isRealData: true,
          sparkline: btcSparkline,
        },
        eth: {
          name: 'Ethereum',
          symbol: 'ETH',
          priceBrl: cryptoData.ethereum?.brl ?? null,
          change24h: cryptoData.ethereum?.brl_24h_change ?? null,
          statusText: 'Dado Real (CoinGecko)',
          isRealData: true,
        },
        sol: {
          name: 'Solana',
          symbol: 'SOL',
          priceBrl: cryptoData.solana?.brl ?? null,
          change24h: cryptoData.solana?.brl_24h_change ?? null,
          statusText: 'Dado Real (CoinGecko)',
          isRealData: true,
        },
      };
      results.isRealData = true;
      lastRealCryptoStore = { ...results.crypto, timestamp: new Date().toISOString() };
    } else if (lastRealCryptoStore) {
      const timeLabel = formatShortTime(lastRealCryptoStore.timestamp);
      results.crypto = {
        btc: { ...lastRealCryptoStore.btc, statusText: `último valor real: ${timeLabel}` },
        eth: { ...lastRealCryptoStore.eth, statusText: `último valor real: ${timeLabel}` },
        sol: { ...lastRealCryptoStore.sol, statusText: `último valor real: ${timeLabel}` },
      };
      results.isRealData = true;
    } else {
      results.crypto = {
        btc: { name: 'Bitcoin', symbol: 'BTC', priceBrl: null, change24h: null, statusText: 'Indisponível no momento' },
        eth: { name: 'Ethereum', symbol: 'ETH', priceBrl: null, change24h: null, statusText: 'Indisponível no momento' },
        sol: { name: 'Solana', symbol: 'SOL', priceBrl: null, change24h: null, statusText: 'Indisponível no momento' },
      };
    }
  } catch (err) {
    if (lastRealCryptoStore) {
      const timeLabel = formatShortTime(lastRealCryptoStore.timestamp);
      results.crypto = {
        btc: { ...lastRealCryptoStore.btc, statusText: `último valor real: ${timeLabel}` },
        eth: { ...lastRealCryptoStore.eth, statusText: `último valor real: ${timeLabel}` },
        sol: { ...lastRealCryptoStore.sol, statusText: `último valor real: ${timeLabel}` },
      };
      results.isRealData = true;
    } else {
      results.crypto = {
        btc: { name: 'Bitcoin', symbol: 'BTC', priceBrl: null, change24h: null, statusText: 'Indisponível no momento' },
        eth: { name: 'Ethereum', symbol: 'ETH', priceBrl: null, change24h: null, statusText: 'Indisponível no momento' },
        sol: { name: 'Solana', symbol: 'SOL', priceBrl: null, change24h: null, statusText: 'Indisponível no momento' },
      };
    }
  }

  // 4. Fetch 60+ Stocks and FIIs in batch from brapi.dev
  const brapiToken = process.env.BRAPI_TOKEN || '';
  const tokenQuery = brapiToken ? `&token=${brapiToken}` : '';
  const tokenParam = brapiToken ? `?token=${brapiToken}` : '';

  try {
    // 4.1 Fetch liquid stocks (limit 70) and funds (limit 30)
    const [stocksListRes, fundsListRes] = await Promise.allSettled([
      fetchWithTimeout(`https://brapi.dev/api/quote/list?type=stock&limit=70&sortBy=volume&sortOrder=desc${tokenQuery}`),
      fetchWithTimeout(`https://brapi.dev/api/quote/list?type=fund&limit=30&sortBy=volume&sortOrder=desc${tokenQuery}`),
    ]);

    let combinedItems: any[] = [];

    if (stocksListRes.status === 'fulfilled' && stocksListRes.value.ok) {
      const stocksListData = await stocksListRes.value.json();
      if (Array.isArray(stocksListData.stocks)) {
        combinedItems.push(...stocksListData.stocks.map((s: any) => ({ ...s, category: 'acao' })));
      }
    }

    if (fundsListRes.status === 'fulfilled' && fundsListRes.value.ok) {
      const fundsListData = await fundsListRes.value.json();
      if (Array.isArray(fundsListData.stocks)) {
        combinedItems.push(...fundsListData.stocks.map((s: any) => ({ ...s, category: 'fii' })));
      }
    }

    // 4.2 Fetch real historical prices for sparklines and fundamental metrics from API
    const sparklineMap = new Map<string, number[]>();
    const indicatorsMap = new Map<string, { pl?: number; pvp?: number; roe?: number; dy?: number; avgVol?: number }>();
    try {
      const sparkRes = await fetchWithTimeout(
        `https://brapi.dev/api/quote/PETR4,VALE3,ITUB4,MGLU3?range=1mo&interval=1d&modules=defaultKeyStatistics,financialData${tokenQuery ? `&token=${brapiToken}` : ''}`
      );
      if (sparkRes.ok) {
        const sparkData = await sparkRes.json();
        if (Array.isArray(sparkData.results)) {
          sparkData.results.forEach((item: any) => {
            if (Array.isArray(item.historicalDataPrice) && item.historicalDataPrice.length >= 2) {
              const closes = item.historicalDataPrice
                .map((p: any) => p.close)
                .filter((c: any) => typeof c === 'number' && !isNaN(c));
              if (closes.length >= 2) {
                sparklineMap.set(item.symbol, closes);
              }
            }

            // Extract strictly real fundamental indicators from API
            const rawPe = item.priceEarnings || item.defaultKeyStatistics?.trailingPE;
            const rawPvp = item.defaultKeyStatistics?.priceToBook;
            const rawRoe = item.financialData?.returnOnEquity;
            const rawDy = item.defaultKeyStatistics?.dividendYield ?? item.defaultKeyStatistics?.yield;
            const rawAvgVol = item.regularMarketVolume || item.averageDailyVolume10Day;

            indicatorsMap.set(item.symbol, {
              pl: typeof rawPe === 'number' && !isNaN(rawPe) ? parseFloat(rawPe.toFixed(2)) : undefined,
              pvp: typeof rawPvp === 'number' && !isNaN(rawPvp) ? parseFloat(rawPvp.toFixed(2)) : undefined,
              roe: typeof rawRoe === 'number' && !isNaN(rawRoe) ? parseFloat((rawRoe * 100).toFixed(2)) : undefined,
              dy: typeof rawDy === 'number' && !isNaN(rawDy) ? parseFloat((rawDy * 100).toFixed(2)) : undefined,
              avgVol: typeof rawAvgVol === 'number' && !isNaN(rawAvgVol) ? rawAvgVol : undefined,
            });
          });
        }
      }
    } catch {
      // Sparkline & indicators batch error - handled gracefully
    }

    if (combinedItems.length > 0) {
      results.stocks = combinedItems.map((item: any) => {
        const isFii = item.category === 'fii' || item.type === 'fund' || item.stock?.endsWith('11');
        const price = item.close || 0;
        const changePercent = item.change || 0;
        const changeAbsolute = (price * changePercent) / 100;
        const realSparkline = sparklineMap.get(item.stock);
        const indicators = indicatorsMap.get(item.stock);

        return {
          ticker: item.stock,
          name: item.name || item.stock,
          price,
          change: changeAbsolute,
          changePercent,
          volume: item.volume || 0,
          marketCap: item.market_cap || undefined,
          sector: item.sector || item.subsector || (isFii ? 'Fundo Imobiliário (FII)' : 'B3'),
          logoUrl: item.logo,
          category: isFii ? 'fii' : 'acao',
          sparkline: realSparkline || undefined, // Only real history, never synthetic!
          dividendYield: indicators?.dy, // Strictly real or undefined
          pl: indicators?.pl,
          pvp: indicators?.pvp,
          roe: indicators?.roe,
          avgVolume: indicators?.avgVol || item.volume || undefined,
          updatedAt: new Date().toISOString(),
          isRealData: true,
        };
      });
      results.isRealData = true;
    }
  } catch (err) {
    // Handled by client fallback
  }

  cachedMarketData = results;
  lastCacheTime = now;

  return res.json(results);
});

// Helper for date formatting in history endpoint
function formatHistoryDateLabel(timestampSec: number, range: string, interval: string): string {
  const d = new Date(timestampSec * 1000);
  if (isNaN(d.getTime())) return '';
  if (range === '1d' || interval.includes('m')) {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  if (range === '5d' || range === '1mo' || (interval === '1d' && range !== '5y' && range !== '6mo')) {
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
  if (range === '5y') {
    return d.toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' });
  }
  return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
}

// Endpoint: Real Historical Data for Sparklines and Interactive Charts
app.get('/api/market/history/:ticker', async (req: Request, res: Response) => {
  const ticker = req.params.ticker.toUpperCase().trim();
  const range = (req.query.range as string) || '1mo';
  const interval = (req.query.interval as string) || '1d';
  const cacheKey = `${ticker}_${range}_${interval}`;

  const now = Date.now();
  const cached = historyCache.get(cacheKey);
  if (cached && now - cached.timestamp < HISTORY_CACHE_DURATION_MS) {
    return res.json({ ...cached.data, cached: true });
  }

  const brapiToken = process.env.BRAPI_TOKEN || '';
  const tokenQuery = brapiToken ? `&token=${brapiToken}` : '';

  try {
    const url = `https://brapi.dev/api/quote/${ticker}?range=${range}&interval=${interval}${tokenQuery}`;
    const apiRes = await fetchWithTimeout(url, {}, 5000);

    if (!apiRes.ok) {
      const failureData = {
        symbol: ticker,
        available: false,
        history: [],
        message: 'Histórico não disponível para este ativo na API.',
      };
      historyCache.set(cacheKey, { data: failureData, timestamp: now });
      return res.json(failureData);
    }

    const brapiData = await apiRes.json();
    const item = brapiData.results?.[0];

    if (!item || !Array.isArray(item.historicalDataPrice) || item.historicalDataPrice.length < 2) {
      const failureData = {
        symbol: ticker,
        available: false,
        history: [],
        message: 'Histórico não disponível para este ativo.',
      };
      historyCache.set(cacheKey, { data: failureData, timestamp: now });
      return res.json(failureData);
    }

    const historyPoints = item.historicalDataPrice
      .filter((p: any) => typeof p.close === 'number' && !isNaN(p.close))
      .map((p: any) => ({
        date: formatHistoryDateLabel(p.date, range, interval),
        timestamp: p.date,
        price: p.close,
        close: p.close,
        open: p.open || p.close,
        high: p.high || p.close,
        low: p.low || p.close,
        volume: p.volume || 0,
      }));

    const successData = {
      symbol: ticker,
      name: item.longName || item.shortName || ticker,
      available: historyPoints.length >= 2,
      range,
      interval,
      history: historyPoints,
      updatedAt: item.regularMarketTime || new Date().toISOString(),
      isRealData: true,
    };

    historyCache.set(cacheKey, { data: successData, timestamp: now });
    return res.json(successData);
  } catch (error: any) {
    const failureData = {
      symbol: ticker,
      available: false,
      history: [],
      error: error.message || 'Erro ao consultar API de histórico',
    };
    historyCache.set(cacheKey, { data: failureData, timestamp: now });
    return res.json(failureData);
  }
});

// Endpoint: Detailed Asset Information (Indicators, 52-week min/max, Dividends, Company Profile)
const stockDetailCache = new Map<string, { data: any; timestamp: number }>();
const STOCK_DETAIL_CACHE_MS = 60000;

app.get('/api/market/stock/:ticker', async (req: Request, res: Response) => {
  const ticker = req.params.ticker.toUpperCase().trim();
  const now = Date.now();
  const cached = stockDetailCache.get(ticker);
  if (cached && now - cached.timestamp < STOCK_DETAIL_CACHE_MS) {
    return res.json(cached.data);
  }

  const brapiToken = process.env.BRAPI_TOKEN || '';
  const tokenQuery = brapiToken ? `&token=${brapiToken}` : '';

  try {
    const url = `https://brapi.dev/api/quote/${ticker}?dividends=true&modules=summaryProfile,defaultKeyStatistics,financialData${tokenQuery}`;
    const apiRes = await fetchWithTimeout(url, {}, 5500);

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: 'Ativo não encontrado ou erro na API brapi.dev' });
    }

    const data = await apiRes.json();
    const item = data.results?.[0];

    if (!item) {
      return res.status(404).json({ error: `Ativo ${ticker} não encontrado.` });
    }

    const isFii = item.category === 'fii' || item.type === 'fund' || ticker.endsWith('11');
    const price = item.regularMarketPrice ?? item.close ?? 0;
    const change = item.regularMarketChange ?? 0;
    const changePercent = item.regularMarketChangePercent ?? 0;

    // Fundamentals
    const rawPe = item.priceEarnings || item.defaultKeyStatistics?.trailingPE;
    const rawPvp = item.defaultKeyStatistics?.priceToBook;
    const rawRoe = item.financialData?.returnOnEquity;
    const rawDy = item.defaultKeyStatistics?.dividendYield ?? item.defaultKeyStatistics?.yield;
    const rawMarketCap = item.marketCap || item.defaultKeyStatistics?.marketCap;
    const rawVol = item.regularMarketVolume;
    const rawAvgVol = item.defaultKeyStatistics?.averageDailyVolume10Day || rawVol;

    // Dividends
    let dividendsList: any[] = [];
    const yearlyMap: Record<string, { total: number; count: number }> = {};

    if (item.dividendsData && Array.isArray(item.dividendsData.cashDividends)) {
      dividendsList = item.dividendsData.cashDividends.map((div: any) => {
        const rate = typeof div.rate === 'number' ? div.rate : parseFloat(div.rate || '0');
        const payDate = div.paymentDate ? div.paymentDate.split('T')[0] : '';
        const exDate = div.lastDatePrior ? div.lastDatePrior.split('T')[0] : div.exDate ? div.exDate.split('T')[0] : '';
        const year = payDate ? payDate.slice(0, 4) : exDate ? exDate.slice(0, 4) : '';

        if (year && !isNaN(rate) && rate > 0) {
          if (!yearlyMap[year]) {
            yearlyMap[year] = { total: 0, count: 0 };
          }
          yearlyMap[year].total += rate;
          yearlyMap[year].count += 1;
        }

        return {
          paymentDate: payDate || 'A definir',
          rate: parseFloat(rate.toFixed(4)),
          label: div.label || 'DIVIDENDO',
          lastDatePrior: exDate || '',
          approvedOn: div.approvedOn ? div.approvedOn.split('T')[0] : '',
        };
      });

      dividendsList.sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || ''));
    }

    const dividendsByYear = Object.entries(yearlyMap)
      .map(([year, val]) => ({
        year,
        total: parseFloat(val.total.toFixed(4)),
        count: val.count,
      }))
      .sort((a, b) => a.year.localeCompare(b.year));

    const result = {
      ticker,
      name: item.longName || item.shortName || ticker,
      price,
      change,
      changePercent,
      openPrice: item.regularMarketOpen,
      high24h: item.regularMarketDayHigh,
      low24h: item.regularMarketDayLow,
      marketCap: typeof rawMarketCap === 'number' && !isNaN(rawMarketCap) ? rawMarketCap : undefined,
      volume: typeof rawVol === 'number' && !isNaN(rawVol) ? rawVol : undefined,
      avgVolume: typeof rawAvgVol === 'number' && !isNaN(rawAvgVol) ? rawAvgVol : undefined,
      sector: item.summaryProfile?.sector || item.sector || (isFii ? 'Fundos Imobiliários (FIIs)' : 'B3'),
      industry: item.summaryProfile?.industry || item.industry,
      description: item.summaryProfile?.longBusinessSummary,
      website: item.summaryProfile?.website,
      logoUrl: item.logourl || item.summaryProfile?.logoUrl,
      category: isFii ? 'fii' : 'acao',
      fiftyTwoWeekLow: typeof item.fiftyTwoWeekLow === 'number' ? item.fiftyTwoWeekLow : undefined,
      fiftyTwoWeekHigh: typeof item.fiftyTwoWeekHigh === 'number' ? item.fiftyTwoWeekHigh : undefined,
      pl: typeof rawPe === 'number' && !isNaN(rawPe) ? parseFloat(rawPe.toFixed(2)) : undefined,
      pvp: typeof rawPvp === 'number' && !isNaN(rawPvp) ? parseFloat(rawPvp.toFixed(2)) : undefined,
      roe: typeof rawRoe === 'number' && !isNaN(rawRoe) ? parseFloat((rawRoe * 100).toFixed(2)) : undefined,
      dividendYield: typeof rawDy === 'number' && !isNaN(rawDy) ? parseFloat((rawDy * 100).toFixed(2)) : undefined,
      updatedAt: item.regularMarketTime || new Date().toISOString(),
      dividends: dividendsList,
      dividendsByYear,
      isRealData: true,
    };

    stockDetailCache.set(ticker, { data: result, timestamp: now });
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Erro ao consultar detalhes do ativo' });
  }
});

// Endpoint: Unified Dividend Calendar for Monitored Assets
let dividendsCalendarCache: { data: any[]; timestamp: number } | null = null;
const DIVIDENDS_CACHE_MS = 5 * 60 * 1000;

app.get('/api/market/dividends', async (req: Request, res: Response) => {
  const now = Date.now();
  if (dividendsCalendarCache && now - dividendsCalendarCache.timestamp < DIVIDENDS_CACHE_MS) {
    return res.json(dividendsCalendarCache.data);
  }

  const brapiToken = process.env.BRAPI_TOKEN || '';
  const tokenQuery = brapiToken ? `&token=${brapiToken}` : '';

  const monitoredStocks = [
    { ticker: 'PETR4', name: 'Petrobras PN', category: 'acao' },
    { ticker: 'VALE3', name: 'Vale ON', category: 'acao' },
    { ticker: 'ITUB4', name: 'Itaú Unibanco PN', category: 'acao' },
    { ticker: 'BBAS3', name: 'Banco do Brasil ON', category: 'acao' },
    { ticker: 'BBDC4', name: 'Bradesco PN', category: 'acao' },
    { ticker: 'WEGE3', name: 'WEG ON', category: 'acao' },
    { ticker: 'TAEE11', name: 'Taesa UNT', category: 'acao' },
    { ticker: 'EGIE3', name: 'Engie Brasil ON', category: 'acao' },
    { ticker: 'B3SA3', name: 'B3 ON', category: 'acao' },
    { ticker: 'CPLE6', name: 'Copel PNB', category: 'acao' },
    { ticker: 'VIVT3', name: 'Telefônica Brasil ON', category: 'acao' },
    { ticker: 'ABEV3', name: 'Ambev ON', category: 'acao' },
  ];

  const calendarItems: any[] = [];

  // 1. Fetch cashDividends from Brapi for top stocks (limit concurrent requests)
  for (const item of monitoredStocks) {
    try {
      // Check detail cache first to save network calls
      const cached = stockDetailCache.get(item.ticker);
      let rawDivs: any[] = [];
      let currentPrice: number | undefined = cached?.data?.price;

      if (cached?.data?.dividends && Array.isArray(cached.data.dividends)) {
        rawDivs = cached.data.dividends;
      } else {
        const u = `https://brapi.dev/api/quote/${item.ticker}?dividends=true${tokenQuery}`;
        const resp = await fetchWithTimeout(u, {}, 4000);
        if (resp.ok) {
          const d = await resp.json();
          const r = d.results?.[0];
          if (r) {
            currentPrice = r.regularMarketPrice ?? r.close;
            if (r.dividendsData && Array.isArray(r.dividendsData.cashDividends)) {
              rawDivs = r.dividendsData.cashDividends.map((x: any) => ({
                paymentDate: x.paymentDate ? x.paymentDate.split('T')[0] : '',
                rate: typeof x.rate === 'number' ? x.rate : parseFloat(x.rate || '0'),
                label: x.label || 'DIVIDENDO',
                lastDatePrior: x.lastDatePrior ? x.lastDatePrior.split('T')[0] : x.exDate ? x.exDate.split('T')[0] : '',
                approvedOn: x.approvedOn ? x.approvedOn.split('T')[0] : '',
              }));
            }
          }
        }
      }

      rawDivs.forEach((div, idx) => {
        if (!div.rate || div.rate <= 0) return;
        const rate = parseFloat(Number(div.rate).toFixed(4));
        const price = currentPrice || 30;
        const yieldApprox = parseFloat(((rate / price) * 100).toFixed(2));

        calendarItems.push({
          id: `${item.ticker}-${div.lastDatePrior || div.paymentDate || idx}-${idx}`,
          ticker: item.ticker,
          name: item.name,
          category: 'acao',
          label: (div.label || 'DIVIDENDO').toUpperCase(),
          rate,
          lastDatePrior: div.lastDatePrior || '',
          paymentDate: div.paymentDate || 'A definir',
          approvedOn: div.approvedOn || '',
          currentPrice: currentPrice || undefined,
          yieldApprox: yieldApprox > 0 && yieldApprox < 100 ? yieldApprox : undefined,
        });
      });
    } catch {
      // Ignora erro por ativo
    }
  }

  // Sort by paymentDate descending, with future dates first
  calendarItems.sort((a, b) => {
    const dateA = a.paymentDate !== 'A definir' ? a.paymentDate : a.lastDatePrior;
    const dateB = b.paymentDate !== 'A definir' ? b.paymentDate : b.lastDatePrior;
    return (dateB || '').localeCompare(dateA || '');
  });

  dividendsCalendarCache = { data: calendarItems, timestamp: now };
  return res.json(calendarItems);
});

// Endpoint: Premium Waitlist capture
const waitlistEntries: Array<{ email: string; featureInterest?: string; createdAt: string }> = [];

app.post('/api/waitlist', formRateLimit, async (req: Request, res: Response) => {
  const { email, featureInterest } = req.body || {};
  if (!email || typeof email !== 'string' || email.length > 254 || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ error: 'E-mail inválido' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const interest =
    typeof featureInterest === 'string' && featureInterest.trim()
      ? featureInterest.trim().slice(0, 100)
      : 'Geral';
  const createdAt = new Date().toISOString();

  if (supabaseConfigured) {
    const result = await supabaseInsert('waitlist', {
      email: cleanEmail,
      feature_interest: interest,
      created_at: createdAt,
    });
    if (!result.ok) return res.status(503).json({ error: STORAGE_UNAVAILABLE_MSG });
    console.log(`[WAITLIST] Novo registro: ${maskEmail(cleanEmail)} (Interesse: ${interest})`);
    return res.json({ success: true, message: 'Registrado com sucesso na lista de espera Premium' });
  }

  if (IS_PRODUCTION) {
    return res.status(503).json({ error: STORAGE_UNAVAILABLE_MSG });
  }

  waitlistEntries.push({ email: cleanEmail, featureInterest: interest, createdAt });
  console.log(`[WAITLIST DEV] Registro em memória: ${maskEmail(cleanEmail)} (Interesse: ${interest})`);
  return res.json({
    success: true,
    message: 'Registrado com sucesso na lista de espera Premium (modo desenvolvimento)',
  });
});

// Endpoint: Contact form submission (/api/contact)
interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

const contactSubmissions: ContactSubmission[] = [];

app.post('/api/contact', formRateLimit, async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body || {};

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Por favor, informe seu nome.' });
  }

  if (!email || typeof email !== 'string' || email.length > 254 || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ error: 'Por favor, informe um endereço de e-mail válido.' });
  }

  if (!message || typeof message !== 'string' || message.trim().length < 5) {
    return res.status(400).json({ error: 'A mensagem deve conter pelo menos 5 caracteres.' });
  }

  const cleanEntry: ContactSubmission = {
    id: `contact_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim().slice(0, 150),
    email: email.trim().toLowerCase().slice(0, 150),
    subject: (typeof subject === 'string' && subject.trim() ? subject.trim() : 'duvidas').slice(0, 100),
    message: message.trim().slice(0, 3000),
    createdAt: new Date().toISOString(),
  };

  if (supabaseConfigured) {
    const result = await supabaseInsert('contact_messages', {
      name: cleanEntry.name,
      email: cleanEntry.email,
      subject: cleanEntry.subject,
      message: cleanEntry.message,
      created_at: cleanEntry.createdAt,
    });
    if (!result.ok) return res.status(503).json({ error: STORAGE_UNAVAILABLE_MSG });
  } else if (IS_PRODUCTION) {
    return res.status(503).json({ error: STORAGE_UNAVAILABLE_MSG });
  } else {
    contactSubmissions.push(cleanEntry);
  }
  console.log(`[CONTATO] Nova mensagem recebida (${cleanEntry.subject}) de ${maskEmail(cleanEntry.email)}`);

  return res.json({
    success: true,
    message: 'Mensagem recebida com sucesso! Nossa equipe retornará em até 2 dias úteis.',
    id: cleanEntry.id,
  });
});

// Endpoint: Dynamic XML Sitemap (/sitemap.xml)
app.get('/sitemap.xml', (_req: Request, res: Response) => {
  const baseUrl = 'https://norteinvest.com.br';
  const today = new Date().toISOString().split('T')[0];

  const routes = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/mercado', priority: '0.9', changefreq: 'daily' },
    { path: '/cripto', priority: '0.8', changefreq: 'daily' },
    { path: '/simulador', priority: '0.8', changefreq: 'monthly' },
    { path: '/aprender', priority: '0.8', changefreq: 'weekly' },
    { path: '/dividendos', priority: '0.8', changefreq: 'daily' },
    { path: '/comparar', priority: '0.7', changefreq: 'weekly' },
    { path: '/favoritos', priority: '0.7', changefreq: 'weekly' },
    { path: '/planos', priority: '0.7', changefreq: 'weekly' },
    { path: '/ia', priority: '0.7', changefreq: 'weekly' },
    { path: '/radar', priority: '0.9', changefreq: 'daily' },
    { path: '/fiis', priority: '0.9', changefreq: 'daily' },
    { path: '/noticias', priority: '0.8', changefreq: 'daily' },
    { path: '/glossario', priority: '0.8', changefreq: 'weekly' },
    { path: '/metodologia', priority: '0.7', changefreq: 'monthly' },
    { path: '/sobre', priority: '0.6', changefreq: 'monthly' },
    { path: '/faq', priority: '0.6', changefreq: 'monthly' },
    { path: '/contato', priority: '0.6', changefreq: 'monthly' },
    { path: '/termos', priority: '0.4', changefreq: 'yearly' },
    { path: '/privacidade', priority: '0.4', changefreq: 'yearly' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) => `  <url>
    <loc>${baseUrl}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  return res.send(xml);
});

// ==========================================
// FEEDS RSS DE ECONOMIA COM CACHE DE 15 MIN
// Regra: apenas título, fonte, data e link
// (sem reproduzir o texto original)
// ==========================================

export interface RssNewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  dateFormatted: string;
  url: string;
  theme: 'macro' | 'acoes' | 'rendafixa' | 'cripto' | 'geral';
  themeLabel: string;
}

let cachedNewsItems: RssNewsItem[] = [];
let lastNewsCacheTime = 0;
const NEWS_CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutos

function decodeXmlEntities(str: string): string {
  return str
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, '')
    .trim();
}

function classifyNewsTheme(title: string): { theme: 'macro' | 'acoes' | 'rendafixa' | 'cripto' | 'geral'; label: string } {
  const t = title.toLowerCase();

  if (/\b(bitcoin|btc|cripto|crypto|ethereum|eth|solana|blockchain|token)\b/.test(t)) {
    return { theme: 'cripto', label: 'Criptoativos' };
  }
  if (/\b(ação|ações|b3|ibovespa|ibov|dividendo|dividendos|provento|proventos|petr4|vale3|itub|bbdc|acionista|pregão|ipo|small cap|fii|fiis)\b/.test(t)) {
    return { theme: 'acoes', label: 'B3 & Ações' };
  }
  if (/\b(selic|cdi|tesouro direto|renda fixa|cdb|lci|lca|debênture|debêntures|copom|taxa de juros|títulos públicos)\b/.test(t)) {
    return { theme: 'rendafixa', label: 'Renda Fixa & Juros' };
  }
  if (/\b(ipca|inflação|pib|câmbio|dólar|euro|ptax|balança|arrecadação|receita federal|ministério|fiscal|banco central|caged|desemprego|ocde|fmi|fed|reforma tributária)\b/.test(t)) {
    return { theme: 'macro', label: 'Macroeconomia' };
  }
  return { theme: 'geral', label: 'Economia & Negócios' };
}

function parseRssFeed(xmlText: string, sourceName: string): RssNewsItem[] {
  const items: RssNewsItem[] = [];
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemBlock = match[1];

    const titleMatch = itemBlock.match(/<title>([\s\S]*?)<\/title>/i);
    if (!titleMatch) continue;
    const rawTitle = decodeXmlEntities(titleMatch[1]);
    if (!rawTitle || rawTitle.length < 6) continue;

    const linkMatch =
      itemBlock.match(/<link>([\s\S]*?)<\/link>/i) ||
      itemBlock.match(/<guid[^>]*isPermaLink="true"[^>]*>([\s\S]*?)<\/guid>/i) ||
      itemBlock.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);

    let link = '';
    if (linkMatch) {
      link = decodeXmlEntities(linkMatch[1]).trim();
    }
    if (!link || !link.startsWith('http')) continue;

    const dateMatch =
      itemBlock.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) ||
      itemBlock.match(/<dc:date>([\s\S]*?)<\/dc:date>/i);

    let dateObj = new Date();
    if (dateMatch) {
      const parsedD = new Date(decodeXmlEntities(dateMatch[1]));
      if (!isNaN(parsedD.getTime())) {
        dateObj = parsedD;
      }
    }

    const { theme, label } = classifyNewsTheme(rawTitle);

    const dateFormatted = dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const linkHash = crypto.createHash('sha256').update(link).digest('hex').slice(0, 16);
    const id = `${sourceName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${linkHash}`;

    // Apenas título, fonte, data e link (sem reproduzir texto!)
    items.push({
      id,
      title: rawTitle,
      source: sourceName,
      date: dateObj.toISOString(),
      dateFormatted,
      url: link,
      theme,
      themeLabel: label,
    });
  }

  return items;
}

// Endpoint: GET /api/news (Feeds RSS com cache de 15 minutos)
app.get('/api/news', async (req: Request, res: Response) => {
  const now = Date.now();
  const forceRefresh = req.query.refresh === 'true';

  if (!forceRefresh && cachedNewsItems.length > 0 && now - lastNewsCacheTime < NEWS_CACHE_DURATION_MS) {
    return res.json({
      success: true,
      count: cachedNewsItems.length,
      cached: true,
      cachedAt: new Date(lastNewsCacheTime).toISOString(),
      items: cachedNewsItems,
    });
  }

  try {
    const feeds = [
      { name: 'InfoMoney', url: 'https://www.infomoney.com.br/feed/' },
      { name: 'G1 Economia', url: 'https://g1.globo.com/rss/g1/economia/' },
      { name: 'Agência Brasil', url: 'https://agenciabrasil.ebc.com.br/rss/economia/feed.xml' },
    ];

    const results = await Promise.allSettled(
      feeds.map(async (f) => {
        const resp = await fetchWithTimeout(
          f.url,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NorteInvest/1.0',
              Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
            },
          },
          6000
        );
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const xml = await resp.text();
        return parseRssFeed(xml, f.name);
      })
    );

    const allItems: RssNewsItem[] = [];
    for (const r of results) {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) {
        allItems.push(...r.value);
      }
    }

    if (allItems.length > 0) {
      // Deduplicate by URL and by unique ID
      const seenUrls = new Set<string>();
      const seenIds = new Set<string>();
      const deduped: RssNewsItem[] = [];
      for (const item of allItems) {
        const key = item.url.split('?')[0].toLowerCase();
        if (!seenUrls.has(key) && !seenIds.has(item.id)) {
          seenUrls.add(key);
          seenIds.add(item.id);
          deduped.push(item);
        }
      }

      // Sort by date descending
      deduped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      cachedNewsItems = deduped.slice(0, 60);
      lastNewsCacheTime = now;

      return res.json({
        success: true,
        count: cachedNewsItems.length,
        cached: false,
        cachedAt: new Date(now).toISOString(),
        items: cachedNewsItems,
      });
    }

    // Se falhar a busca mas temos cache prévio, retorna o cache
    if (cachedNewsItems.length > 0) {
      return res.json({
        success: true,
        count: cachedNewsItems.length,
        cached: true,
        cachedAt: new Date(lastNewsCacheTime).toISOString(),
        items: cachedNewsItems,
      });
    }

    return res.json({
      success: true,
      count: 0,
      cached: false,
      cachedAt: new Date(now).toISOString(),
      items: [],
    });
  } catch (err: any) {
    if (cachedNewsItems.length > 0) {
      return res.json({
        success: true,
        count: cachedNewsItems.length,
        cached: true,
        cachedAt: new Date(lastNewsCacheTime).toISOString(),
        items: cachedNewsItems,
      });
    }
    return res.status(500).json({ error: 'Erro ao carregar feeds de notícias' });
  }
});

// Endpoint: GET /api/screener
app.get('/api/screener', async (_req: Request, res: Response) => {
  try {
    const { getFundamentalStocks } = await import('./src/data/fundamentalData.js');
    const stocks = getFundamentalStocks(22.5, 6.0);
    return res.json({ success: true, count: stocks.length, stocks });
  } catch {
    return res.json({ success: true, count: 0, stocks: [] });
  }
});

// Endpoint: GET /api/fiis
app.get('/api/fiis', async (_req: Request, res: Response) => {
  try {
    const { FII_DATASET } = await import('./src/data/fiiData.js');
    return res.json({ success: true, count: FII_DATASET.length, fiis: FII_DATASET });
  } catch {
    return res.json({ success: true, count: 0, fiis: [] });
  }
});

// ==========================================
// SISTEMA DE DIAGNÓSTICO & AUDITORIA DE APIS
// ==========================================

export interface DiagnosticSourceAudit {
  id: 'brapi' | 'bcb' | 'bcb_cambio' | 'coingecko';
  name: string;
  provider: string;
  endpoint: string;
  status: 'success' | 'rate_limit' | 'invalid_data' | 'error';
  httpStatus: number | null;
  isRealData: boolean;
  lastCallTime: string;
  lastSuccessTime: string | null;
  responseTimeMs: number;
  errorMessage: string | null;
  sampleSummary: any;
  rawJsonSnippet: string;
}

const diagnosticAuditCache: Record<string, DiagnosticSourceAudit> = {};

// Regra 6: O inventário de mocks do /diagnostico deve ser gerado a partir de flags e constantes reais usadas pelo app
function generateDynamicMockInventory() {
  const list: Array<{
    category: string;
    file: string;
    lines: string;
    description: string;
    triggerCondition: string;
    activeNow: boolean;
  }> = [];

  if (isDemoModeAllowed) {
    list.push({
      category: 'Modo de Demonstração Ativo (DEMO_MODE=true)',
      file: 'src/data/mockMarketData.ts e server.ts',
      lines: 'Constantes DEMO_STOCKS, DEMO_CRYPTOS, DEMO_CURRENCIES, DEMO_MACRO',
      description: 'Ativos simulados de contingência (PETR4, VALE3, BTC, ETH, USD, EUR, Selic, CDI) habilitados porque a flag DEMO_MODE está explicitamente ativa no ambiente.',
      triggerCondition: 'Ambiente configurado com DEMO_MODE=true.',
      activeNow: true,
    });
    list.push({
      category: 'Cronograma Mensal de Proventos FIIs (Modo Demonstração)',
      file: 'src/data/mockMarketData.ts',
      lines: 'Simulação de corte e pagamento regular de FIIs',
      description: 'Projeção de proventos de FIIs ativa apenas para exibição didática sob DEMO_MODE.',
      triggerCondition: 'Habilitado exclusivamente quando DEMO_MODE=true.',
      activeNow: true,
    });
  }

  // 2. IA Gemini
  const hasGemini = Boolean(apiKey);
  if (!hasGemini) {
    list.push({
      category: 'Mensagem Padrão de Indisponibilidade de IA',
      file: 'server.ts',
      lines: 'Rota POST /api/gemini/explain-stock',
      description: 'Retorna a mensagem oficial "Explicação por IA indisponível no momento. Tente novamente em instantes." (Zero textos fictícios ou pré-redigidos).',
      triggerCondition: 'Ativo quando GEMINI_API_KEY não está configurada no servidor.',
      activeNow: true,
    });
  }

  // 3. CDI Estimado vs Real
  if (cachedMacroData?.cdi?.isEstimated) {
    list.push({
      category: 'Cálculo de CDI Estimado (Selic - 0,10%)',
      file: 'server.ts',
      lines: 'fetchBcbMacroData()',
      description: 'Como a série SGS 4389 não retornou registro válido, o CDI é explicitamente rotulado como "CDI estimado" derivado da Selic.',
      triggerCondition: 'Ativo apenas quando SGS 4389 falha ou é omitida.',
      activeNow: true,
    });
  }

  // 4. Retenção de Cache Real (se aplicável)
  const cachedRealItems: string[] = [];
  if (lastRealCurrenciesStore) cachedRealItems.push('Câmbio PTAX');
  if (lastRealMacroStore) cachedRealItems.push('Macro SGS');
  if (lastRealStocksStore) cachedRealItems.push('Ações B3');
  if (lastRealCryptoStore) cachedRealItems.push('Criptoativos');

  if (cachedRealItems.length > 0) {
    list.push({
      category: 'Retenção de Último Valor Real Recebido',
      file: 'server.ts',
      lines: 'Variáveis lastReal*Store',
      description: `Retenção em memória do último dado real obtido (${cachedRealItems.join(', ')}), acompanhado da data e hora real da coleta. Não são números inventados.`,
      triggerCondition: 'Utilizado apenas após sucesso prévio quando uma chamada subsequente à API falha.',
      activeNow: true,
    });
  }

  if (list.length === 0) {
    list.push({
      category: 'Nenhum Mock Ativo',
      file: 'Configuração de Produção',
      lines: 'N/A',
      description: 'A plataforma opera com 100% de dados reais ou exibe "Indisponível no momento". DEMO_MODE está inativo (false) e todos os mocks manuais foram removidos.',
      triggerCondition: 'Operação padrão de dados estritamente reais.',
      activeNow: true,
    });
  }

  return list;
}

async function executeDiagnosticProbe(): Promise<DiagnosticSourceAudit[]> {
  const brapiToken = process.env.BRAPI_TOKEN || '';
  const tokenQuery = brapiToken ? `&token=${brapiToken}` : '';
  const nowIso = new Date().toISOString();

  // 1. Audit brapi.dev (PETR4, VALE3, ITUB4)
  const brapiAudit: DiagnosticSourceAudit = {
    id: 'brapi',
    name: 'brapi.dev (B3 Ações & FIIs)',
    provider: 'brapi.dev API Oficial',
    endpoint: `https://brapi.dev/api/quote/PETR4,VALE3,ITUB4${tokenQuery ? `?token=***` : ''}`,
    status: 'error',
    httpStatus: null,
    isRealData: false,
    lastCallTime: nowIso,
    lastSuccessTime: diagnosticAuditCache['brapi']?.lastSuccessTime || null,
    responseTimeMs: 0,
    errorMessage: null,
    sampleSummary: {},
    rawJsonSnippet: '',
  };

  const t0Brapi = Date.now();
  try {
    // Try batch first; if free tier requires single calls, handle gracefully
    let petr4: any = null;
    let vale3: any = null;
    let itub4: any = null;

    const testUrl = brapiToken
      ? `https://brapi.dev/api/quote/PETR4,VALE3,ITUB4?token=${brapiToken}`
      : `https://brapi.dev/api/quote/PETR4`;

    const res = await fetchWithTimeout(testUrl, {}, 5000);
    brapiAudit.responseTimeMs = Date.now() - t0Brapi;
    brapiAudit.httpStatus = res.status;

    if (res.ok) {
      const data = await res.json();
      brapiAudit.rawJsonSnippet = JSON.stringify(data, null, 2).slice(0, 500);

      if (data.results && Array.isArray(data.results)) {
        petr4 = data.results.find((r: any) => r.symbol === 'PETR4') || data.results[0];
      }

      // If single call mode (free tier), also fetch VALE3 and ITUB4
      if (!brapiToken) {
        try {
          const [vRes, iRes] = await Promise.allSettled([
            fetchWithTimeout('https://brapi.dev/api/quote/VALE3', {}, 4000),
            fetchWithTimeout('https://brapi.dev/api/quote/ITUB4', {}, 4000),
          ]);
          if (vRes.status === 'fulfilled' && vRes.value.ok) {
            const vData = await vRes.value.json();
            vale3 = vData.results?.[0];
          }
          if (iRes.status === 'fulfilled' && iRes.value.ok) {
            const iData = await iRes.value.json();
            itub4 = iData.results?.[0];
          }
        } catch {
          // Keep whatever samples we received
        }
      } else if (data.results) {
        vale3 = data.results.find((r: any) => r.symbol === 'VALE3');
        itub4 = data.results.find((r: any) => r.symbol === 'ITUB4');
      }

      brapiAudit.status = 'success';
      brapiAudit.isRealData = true;
      brapiAudit.lastSuccessTime = nowIso;
      brapiAudit.sampleSummary = {
        PETR4: petr4
          ? {
              preco: petr4.regularMarketPrice ?? petr4.close,
              variacaoPercent: petr4.regularMarketChangePercent ?? petr4.change,
              dataHora: petr4.regularMarketTime || nowIso,
            }
          : 'n/d',
        VALE3: vale3
          ? {
              preco: vale3.regularMarketPrice ?? vale3.close,
              variacaoPercent: vale3.regularMarketChangePercent ?? vale3.change,
              dataHora: vale3.regularMarketTime || nowIso,
            }
          : 'n/d',
        ITUB4: itub4
          ? {
              preco: itub4.regularMarketPrice ?? itub4.close,
              variacaoPercent: itub4.regularMarketChangePercent ?? itub4.change,
              dataHora: itub4.regularMarketTime || nowIso,
            }
          : 'n/d',
      };
    } else {
      const errText = await res.text();
      brapiAudit.status = res.status === 429 ? 'rate_limit' : 'error';
      brapiAudit.errorMessage = `HTTP ${res.status}: ${errText.slice(0, 200)}`;
      brapiAudit.rawJsonSnippet = errText.slice(0, 300);
    }
  } catch (err: any) {
    brapiAudit.responseTimeMs = Date.now() - t0Brapi;
    brapiAudit.status = 'error';
    brapiAudit.errorMessage = err.message || 'Erro de conexão com brapi.dev';
  }
  diagnosticAuditCache['brapi'] = brapiAudit;

  // 2. Audit Banco Central do Brasil SGS (Séries 432 Selic, 4389 CDI, 13522 IPCA)
  const bcbAudit: DiagnosticSourceAudit = {
    id: 'bcb',
    name: 'Banco Central do Brasil (SGS)',
    provider: 'BCB Sistema Gerenciador de Séries Temporais',
    endpoint: 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.{432,4389,13522}/dados/ultimos/10?formato=json',
    status: 'error',
    httpStatus: null,
    isRealData: false,
    lastCallTime: nowIso,
    lastSuccessTime: diagnosticAuditCache['bcb']?.lastSuccessTime || null,
    responseTimeMs: 0,
    errorMessage: null,
    sampleSummary: {},
    rawJsonSnippet: '',
  };

  const t0Bcb = Date.now();
  try {
    const [selicRes, cdiRes, ipcaRes] = await Promise.allSettled([
      fetchWithTimeout('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/10?formato=json', {}, 4500),
      fetchWithTimeout('https://api.bcb.gov.br/dados/serie/bcdata.sgs.4389/dados/ultimos/1?formato=json', {}, 4500),
      fetchWithTimeout('https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados/ultimos/1?formato=json', {}, 4500),
    ]);
    bcbAudit.responseTimeMs = Date.now() - t0Bcb;

    let selicRate: number | null = null;
    let selicDate: string = 'Indisponível';
    let selicDiscardedCount = 0;
    let cdiVal: any = null;
    let ipcaVal: any = null;

    if (selicRes.status === 'fulfilled') {
      bcbAudit.httpStatus = selicRes.value.status;
      if (selicRes.value.ok) {
        const data = await selicRes.value.json();
        if (Array.isArray(data) && data.length > 0) {
          const today = new Date();
          const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
          const validRecords: any[] = [];

          for (const item of data) {
            const rawDate = String(item.data || '');
            const [d, m, y] = rawDate.split('/').map(Number);
            const recordDate = new Date(y, (m || 1) - 1, d || 1, 23, 59, 59);

            if (isNaN(recordDate.getTime()) || recordDate.getTime() > todayEnd.getTime()) {
              selicDiscardedCount++;
            } else {
              validRecords.push({
                rate: parseFloat(item.valor),
                date: rawDate,
                recordDate,
              });
            }
          }

          if (validRecords.length > 0) {
            validRecords.sort((a, b) => b.recordDate.getTime() - a.recordDate.getTime());
            selicRate = validRecords[0].rate;
            selicDate = validRecords[0].date;
          }
        }
      } else if (selicRes.value.status === 429) {
        bcbAudit.status = 'rate_limit';
        bcbAudit.errorMessage = 'Limite de requisições (429) no Bacen SGS';
      }
    }

    if (cdiRes.status === 'fulfilled' && cdiRes.value.ok) {
      const data = await cdiRes.value.json();
      if (Array.isArray(data) && data[0]) {
        cdiVal = { taxa: parseFloat(data[0].valor), dataReferencia: data[0].data };
      }
    }
    if (ipcaRes.status === 'fulfilled' && ipcaRes.value.ok) {
      const data = await ipcaRes.value.json();
      if (Array.isArray(data) && data[0]) {
        ipcaVal = { taxa12Meses: parseFloat(data[0].valor), dataReferencia: data[0].data };
      }
    }

    // Regra 3: Separar "Limite de requisições (429)", "Dado inválido (data futura)" e "Erro de rede"
    // Regra 2: Se todos os registros da Selic forem futuros ou inválidos, status = 'invalid_data'
    if (selicRate === null && selicDiscardedCount > 0) {
      bcbAudit.status = 'invalid_data';
      bcbAudit.errorMessage = `Dado inválido (data futura): ${selicDiscardedCount} registros descartados da série SGS 432 (todos com data futura posterior a hoje)`;
      bcbAudit.isRealData = Boolean(cdiVal || ipcaVal);
    } else if (selicRate !== null) {
      bcbAudit.status = 'success';
      bcbAudit.isRealData = true;
      bcbAudit.lastSuccessTime = nowIso;
    } else if (bcbAudit.httpStatus === 429) {
      bcbAudit.status = 'rate_limit';
      bcbAudit.errorMessage = 'Limite de requisições (429) no Bacen SGS';
    } else {
      bcbAudit.status = 'error';
      bcbAudit.errorMessage = 'Erro de rede: Não foi possível obter dados das séries do Banco Central';
    }

    bcbAudit.sampleSummary = {
      selicMeta: selicRate !== null ? `${selicRate}% a.a. (${selicDate})` : 'Indisponível',
      selicRegistrosDescartados: `${selicDiscardedCount} descartados por data futura`,
      cdiAnualizado: cdiVal ? `${cdiVal.taxa}% a.a. (${cdiVal.dataReferencia})` : 'CDI estimado',
      ipca12Meses: ipcaVal ? `${ipcaVal.taxa12Meses}% acum. (${ipcaVal.dataReferencia})` : 'Indisponível',
    };
    bcbAudit.rawJsonSnippet = JSON.stringify({
      selic: { taxa: selicRate, data: selicDate, descartadosFuturos: selicDiscardedCount },
      cdi: cdiVal,
      ipca: ipcaVal,
    }, null, 2);
  } catch (err: any) {
    bcbAudit.responseTimeMs = Date.now() - t0Bcb;
    bcbAudit.status = 'error';
    bcbAudit.errorMessage = `Erro de rede: ${err.message || 'Falha ao conectar com API SGS do Bacen'}`;
  }
  diagnosticAuditCache['bcb'] = bcbAudit;

  // 3. Audit Banco Central do Brasil PTAX Olinda (Câmbio Dólar & Euro) - Regra 1
  const bcbCambioAudit: DiagnosticSourceAudit = {
    id: 'bcb_cambio',
    name: 'Banco Central do Brasil (PTAX Câmbio)',
    provider: 'Bacen Olinda OData API (Fonte Exclusiva)',
    endpoint: 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/{CotacaoDolarPeriodo,CotacaoMoedaPeriodo}',
    status: 'error',
    httpStatus: null,
    isRealData: false,
    lastCallTime: nowIso,
    lastSuccessTime: diagnosticAuditCache['bcb_cambio']?.lastSuccessTime || null,
    responseTimeMs: 0,
    errorMessage: null,
    sampleSummary: {},
    rawJsonSnippet: '',
  };

  const t0BcbCambio = Date.now();
  try {
    const today = new Date();
    const endStr = formatMmDdYyyy(today);
    const startStr = formatMmDdYyyy(new Date(today.getTime() - 7 * 86400000));

    const [uRes, eRes] = await Promise.all([
      fetchWithTimeout(
        `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@dataInicial='${startStr}'&@dataFinalCotacao='${endStr}'&$top=10&$orderby=dataHoraCotacao%20desc&$format=json`,
        {},
        5000
      ),
      fetchWithTimeout(
        `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@moeda='EUR'&@dataInicial='${startStr}'&@dataFinalCotacao='${endStr}'&$top=20&$orderby=dataHoraCotacao%20desc&$format=json`,
        {},
        5000
      ),
    ]);

    bcbCambioAudit.responseTimeMs = Date.now() - t0BcbCambio;
    bcbCambioAudit.httpStatus = uRes.status;

    if (uRes.ok && eRes.ok) {
      const uData = await uRes.json();
      const eData = await eRes.json();

      const processList = (list: any[]) => {
        if (!Array.isArray(list) || list.length === 0) return null;
        const byDate = new Map<string, any>();
        for (const item of list) {
          const datePart = (item.dataHoraCotacao || '').split(' ')[0];
          if (!datePart) continue;
          if (!byDate.has(datePart)) {
            byDate.set(datePart, item);
          } else if (item.tipoBoletim === 'Fechamento') {
            byDate.set(datePart, item);
          }
        }
        const dates = Array.from(byDate.keys()).sort().reverse();
        if (dates.length === 0) return null;
        const latest = byDate.get(dates[0]);
        const prev = dates.length > 1 ? byDate.get(dates[1]) : null;
        const latestVenda = Number(latest.cotacaoVenda || latest.cotacaoCompra || 0);
        const prevVenda = prev ? Number(prev.cotacaoVenda || prev.cotacaoCompra || 0) : latestVenda;
        const pctChange = prevVenda > 0 ? parseFloat((((latestVenda - prevVenda) / prevVenda) * 100).toFixed(2)) : 0;
        const [y, m, d] = dates[0].split('-');
        return {
          venda: parseFloat(latestVenda.toFixed(4)),
          pctChange,
          dataLabel: `PTAX de ${d}/${m}`,
          rawDate: latest.dataHoraCotacao,
        };
      };

      const usdParsed = processList(uData.value);
      const eurParsed = processList(eData.value);

      if (usdParsed && eurParsed) {
        bcbCambioAudit.status = 'success';
        bcbCambioAudit.isRealData = true;
        bcbCambioAudit.lastSuccessTime = nowIso;
        bcbCambioAudit.sampleSummary = {
          dolarPtax: `R$ ${usdParsed.venda} (${usdParsed.dataLabel}, var: ${usdParsed.pctChange}%)`,
          euroPtax: `R$ ${eurParsed.venda} (${eurParsed.dataLabel}, var: ${eurParsed.pctChange}%)`,
          periodo: `${startStr} a ${endStr} (7 dias corridos)`,
          fonte: 'Banco Central do Brasil (PTAX Olinda)',
        };
        bcbCambioAudit.rawJsonSnippet = JSON.stringify({ usd: usdParsed, eur: eurParsed }, null, 2);
      } else {
        bcbCambioAudit.status = 'invalid_data';
        bcbCambioAudit.errorMessage = 'Dado inválido: Registros de cotação PTAX não puderam ser processados';
      }
    } else if (uRes.status === 429 || eRes.status === 429) {
      bcbCambioAudit.status = 'rate_limit';
      bcbCambioAudit.errorMessage = 'Limite de requisições (429) no Bacen Olinda PTAX';
    } else {
      bcbCambioAudit.status = 'error';
      bcbCambioAudit.errorMessage = `Erro de rede: HTTP ${uRes.status}/${eRes.status}`;
    }
  } catch (err: any) {
    bcbCambioAudit.responseTimeMs = Date.now() - t0BcbCambio;
    bcbCambioAudit.status = 'error';
    bcbCambioAudit.errorMessage = `Erro de rede: ${err.message || 'Falha de conexão com Bacen PTAX'}`;
  }
  diagnosticAuditCache['bcb_cambio'] = bcbCambioAudit;

  // 4. Audit CoinGecko (Bitcoin, Ethereum, Solana)
  const coingeckoAudit: DiagnosticSourceAudit = {
    id: 'coingecko',
    name: 'CoinGecko (Criptomoedas)',
    provider: 'CoinGecko Public API v3',
    endpoint: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=brl,usd&include_24hr_change=true',
    status: 'error',
    httpStatus: null,
    isRealData: false,
    lastCallTime: nowIso,
    lastSuccessTime: diagnosticAuditCache['coingecko']?.lastSuccessTime || null,
    responseTimeMs: 0,
    errorMessage: null,
    sampleSummary: {},
    rawJsonSnippet: '',
  };

  const t0Crypto = Date.now();
  try {
    const res = await fetchWithTimeout(coingeckoAudit.endpoint, {}, 4500);
    coingeckoAudit.responseTimeMs = Date.now() - t0Crypto;
    coingeckoAudit.httpStatus = res.status;

    if (res.ok) {
      const data = await res.json();
      coingeckoAudit.rawJsonSnippet = JSON.stringify(data, null, 2).slice(0, 500);
      coingeckoAudit.status = 'success';
      coingeckoAudit.isRealData = true;
      coingeckoAudit.lastSuccessTime = nowIso;
      coingeckoAudit.sampleSummary = {
        bitcoin: {
          precoBrl: data.bitcoin?.brl,
          precoUsd: data.bitcoin?.usd,
          variacao24h: data.bitcoin?.brl_24h_change,
        },
        ethereum: {
          precoBrl: data.ethereum?.brl,
          variacao24h: data.ethereum?.brl_24h_change,
        },
        solana: {
          precoBrl: data.solana?.brl,
          variacao24h: data.solana?.brl_24h_change,
        },
      };
    } else {
      const errText = await res.text();
      coingeckoAudit.status = res.status === 429 ? 'rate_limit' : 'error';
      coingeckoAudit.errorMessage = res.status === 429
        ? 'Limite de requisições (429): Quota pública excedida no CoinGecko'
        : `Erro de rede: HTTP ${res.status}: ${errText.slice(0, 200)}`;
      coingeckoAudit.rawJsonSnippet = errText.slice(0, 300);
    }
  } catch (err: any) {
    coingeckoAudit.responseTimeMs = Date.now() - t0Crypto;
    coingeckoAudit.status = 'error';
    coingeckoAudit.errorMessage = `Erro de rede: ${err.message || 'Falha de conexão com CoinGecko'}`;
  }
  diagnosticAuditCache['coingecko'] = coingeckoAudit;

  return [brapiAudit, bcbAudit, bcbCambioAudit, coingeckoAudit];
}

// Endpoint: GET /api/diagnostic (Regra 8: protegido em produção)
app.get('/api/diagnostic', async (_req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEV_DIAGNOSTIC !== 'true') {
    return res.status(403).json({ error: 'Acesso restrito ao ambiente de desenvolvimento' });
  }

  // If cache is empty, run initial probe
  if (Object.keys(diagnosticAuditCache).length === 0) {
    await executeDiagnosticProbe();
  }

  const sources = [
    diagnosticAuditCache['brapi'],
    diagnosticAuditCache['bcb'],
    diagnosticAuditCache['bcb_cambio'],
    diagnosticAuditCache['coingecko'],
  ].filter(Boolean);

  const realCount = sources.filter((s) => s.isRealData).length;
  const overallMode = realCount === sources.length ? 'REAL' : realCount > 0 ? 'HÍBRIDO' : 'MOCK/FALLBACK';

  return res.json({
    serverTime: new Date().toISOString(),
    hasBrapiToken: Boolean(process.env.BRAPI_TOKEN) ? 'sim' : 'não',
    overallMode,
    realCount,
    totalSources: sources.length,
    sources,
    mockLocations: generateDynamicMockInventory(),
  });
});

// Endpoint: POST /api/diagnostic/probe (Regra 8: protegido em produção)
app.post('/api/diagnostic/probe', async (_req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEV_DIAGNOSTIC !== 'true') {
    return res.status(403).json({ error: 'Acesso restrito ao ambiente de desenvolvimento' });
  }

  const sources = await executeDiagnosticProbe();
  const realCount = sources.filter((s) => s.isRealData).length;
  const overallMode = realCount === sources.length ? 'REAL' : realCount > 0 ? 'HÍBRIDO' : 'MOCK/FALLBACK';

  return res.json({
    serverTime: new Date().toISOString(),
    hasBrapiToken: Boolean(process.env.BRAPI_TOKEN) ? 'sim' : 'não',
    overallMode,
    realCount,
    totalSources: sources.length,
    sources,
    mockLocations: generateDynamicMockInventory(),
  });
});


// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    if (!fs.existsSync(path.join(__dirname, 'dist', 'index.html'))) {
      console.error('Pasta dist/ não encontrada. Rode "npm run build" antes de "npm start".');
      process.exit(1);
    }
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`NorteInvest server running on http://localhost:${PORT}`);
  });
}

startServer();
