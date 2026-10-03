import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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
app.post('/api/subscribe', (req: Request, res: Response) => {
  const { email, consent } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ error: 'Por favor, informe um endereço de e-mail válido.' });
  }

  if (!consent) {
    return res.status(400).json({
      error: 'É obrigatório concordar com o recebimento de e-mails e a Política de Privacidade.',
    });
  }

  const normalized = email.toLowerCase().trim();
  const alreadySubscribed = subscribers.some((s) => s.email === normalized);

  if (alreadySubscribed) {
    return res.json({
      success: true,
      message: 'Este e-mail já está cadastrado em nosso Radar Semanal.',
      alreadySubscribed: true,
    });
  }

  const newSubscriber: SubscriberRecord = {
    email: normalized,
    consentedAt: new Date().toISOString(),
    ip: req.ip,
  };

  subscribers.push(newSubscriber);
  console.log(`[Newsletter Subscribe] Novo inscrito registrado: ${normalized}`);

  return res.json({
    success: true,
    message: 'Inscrição realizada com sucesso! Você receberá nosso radar semanal.',
    totalSubscribers: subscribers.length,
  });
});

// Endpoint: Explain Stock Movement with Gemini
app.post('/api/gemini/explain-stock', async (req: Request, res: Response) => {
  const { symbol, name, price, changePercent, volume, context } = req.body;

  if (!symbol) {
    return res.status(400).json({ error: 'Ticker symbol is required' });
  }

  const isPositive = Number(changePercent) >= 0;
  const variationDesc = isPositive
    ? `alta de +${Number(changePercent).toFixed(2)}%`
    : `queda de ${Number(changePercent).toFixed(2)}%`;

  if (!ai || !apiKey) {
    // Graceful fallback explanation when API key is not configured
    return res.json({
      symbol,
      explanation: `Em termos gerais e didáticos, a ${isPositive ? 'valorização' : 'desvalorização'} recente de ${symbol} (${name || 'ativo B3'}) pode estar associada a fluxos de capital setorial, expectativas quanto a lucros e políticas macroeconômicas (como juros e câmbio). No mercado de renda variável, oscilações diárias refletem o equilíbrio dinâmico entre ordens compradoras e vendedoras institucionais.`,
      disclaimer: 'Conteúdo informativo e educacional. Não constitui recomendação de investimento. Rentabilidade passada não garante resultados futuros.',
      isFallback: true,
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'Você é um educador financeiro do portal NorteInvest. Seu papel é educar iniciantes com clareza, neutralidade, ética e sem promessas ou recomendações de compra/venda.',
      },
    });

    const explanation = response.text?.trim() || 'Não foi possível gerar a explicação no momento.';

    return res.json({
      symbol,
      explanation,
      disclaimer: 'Conteúdo informativo e educacional. Não constitui recomendação de investimento. Rentabilidade passada não garante resultados futuros.',
      isFallback: false,
    });
  } catch (error: any) {
    console.error('Gemini API error:', error?.message || error);
    return res.json({
      symbol,
      explanation: `A variação de ${variationDesc} observada em ${symbol} reflete o sentimento atual dos investidores e a liquidez do pregão. Variações como essa costumam derivar de ajustes de carteira institucionais, divulgações de dados macroeconômicos ou notícias corporativas do setor.`,
      disclaimer: 'Conteúdo informativo e educacional. Não constitui recomendação de investimento. Rentabilidade passada não garante resultados futuros.',
      isFallback: true,
      errorNotice: 'Gerado por modelo de contingência.',
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
    selic: null,
    stocks: null,
    isRealData: false,
  };

  // 1. Fetch AwesomeAPI for USD, EUR
  try {
    const currRes = await fetchWithTimeout('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL');
    if (currRes.ok) {
      const data = await currRes.json();
      results.currencies = {
        usd: {
          code: 'USD',
          name: 'Dólar Comercial',
          bid: parseFloat(data.USDBRL?.bid || '5.45'),
          pctChange: parseFloat(data.USDBRL?.pctChange || '0.15'),
          high: parseFloat(data.USDBRL?.high || '5.50'),
          low: parseFloat(data.USDBRL?.low || '5.40'),
          updateTime: data.USDBRL?.create_date,
        },
        eur: {
          code: 'EUR',
          name: 'Euro Comercial',
          bid: parseFloat(data.EURBRL?.bid || '6.02'),
          pctChange: parseFloat(data.EURBRL?.pctChange || '-0.20'),
          high: parseFloat(data.EURBRL?.high || '6.08'),
          low: parseFloat(data.EURBRL?.low || '5.98'),
          updateTime: data.EURBRL?.create_date,
        },
      };
      results.isRealData = true;
    }
  } catch (err) {
    // Handled by client/mock fallback
  }

  // 2. Fetch CoinGecko for Bitcoin, Ethereum, Solana
  try {
    const cryptoRes = await fetchWithTimeout(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=brl,usd&include_24hr_change=true'
    );
    if (cryptoRes.ok) {
      const cryptoData = await cryptoRes.json();
      results.crypto = {
        btc: {
          name: 'Bitcoin',
          symbol: 'BTC',
          priceBrl: cryptoData.bitcoin?.brl || 360000,
          change24h: cryptoData.bitcoin?.brl_24h_change || 1.8,
        },
        eth: {
          name: 'Ethereum',
          symbol: 'ETH',
          priceBrl: cryptoData.ethereum?.brl || 15500,
          change24h: cryptoData.ethereum?.brl_24h_change || -0.5,
        },
        sol: {
          name: 'Solana',
          symbol: 'SOL',
          priceBrl: cryptoData.solana?.brl || 890,
          change24h: cryptoData.solana?.brl_24h_change || 3.2,
        },
      };
      results.isRealData = true;
    }
  } catch (err) {
    // Handled by client fallback
  }

  // 3. Fetch Selic from BCB SGS API (Meta Selic ou CDI diário)
  try {
    const bcbRes = await fetchWithTimeout(
      'https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json'
    );
    if (bcbRes.ok) {
      const bcbData = await bcbRes.json();
      if (Array.isArray(bcbData) && bcbData[0]?.valor) {
        results.selic = {
          rate: parseFloat(bcbData[0].valor),
          date: bcbData[0].data,
          source: 'Banco Central do Brasil (SGS 432)',
        };
      }
    }
  } catch (err) {
    // Handled by client fallback
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

    // 4.2 Fetch real historical prices for sparklines of flagship liquid assets
    const sparklineMap = new Map<string, number[]>();
    try {
      const sparkRes = await fetchWithTimeout(
        `https://brapi.dev/api/quote/PETR4,VALE3,ITUB4,MGLU3?range=1mo&interval=1d${tokenQuery ? `&token=${brapiToken}` : ''}`
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
          });
        }
      }
    } catch {
      // Sparkline batch error - handled gracefully
    }

    if (combinedItems.length > 0) {
      results.stocks = combinedItems.map((item: any) => {
        const isFii = item.category === 'fii' || item.type === 'fund' || item.stock?.endsWith('11');
        const price = item.close || 0;
        const changePercent = item.change || 0;
        const changeAbsolute = (price * changePercent) / 100;
        const realSparkline = sparklineMap.get(item.stock);

        return {
          ticker: item.stock,
          name: item.name || item.stock,
          price,
          change: changeAbsolute,
          changePercent,
          volume: item.volume || 0,
          marketCap: item.market_cap || 0,
          sector: item.sector || item.subsector || (isFii ? 'Fundo Imobiliário (FII)' : 'B3'),
          logoUrl: item.logo,
          category: isFii ? 'fii' : 'acao',
          sparkline: realSparkline || undefined, // Only real history, never synthetic!
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
  if (range === '5d' || range === '1mo' || interval === '1d') {
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
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

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
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
