export interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  dateFormatted: string;
  url: string;
  theme: 'macro' | 'acoes' | 'rendafixa' | 'cripto' | 'geral';
  themeLabel: string;
}

interface NewsApiResponse {
  success: boolean;
  count: number;
  cached: boolean;
  cachedAt: string;
  items: NewsItem[];
}

let clientCache: { data: NewsItem[]; timestamp: number; cachedAt: string } | null = null;
const CLIENT_CACHE_MS = 60 * 1000; // 60 segundos de cache local no navegador

export async function getMarketNews(forceRefresh = false): Promise<{ items: NewsItem[]; cachedAt: string }> {
  const now = Date.now();
  if (!forceRefresh && clientCache && now - clientCache.timestamp < CLIENT_CACHE_MS) {
    return { items: clientCache.data, cachedAt: clientCache.cachedAt };
  }

  try {
    const res = await fetch(`/api/news${forceRefresh ? '?refresh=true' : ''}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data: NewsApiResponse = await res.json();
    if (data.items && Array.isArray(data.items)) {
      const seenIds = new Set<string>();
      const sanitizedItems: NewsItem[] = [];
      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        let id = item.id;
        if (!id || seenIds.has(id)) {
          id = `${id || 'news'}_${i}`;
        }
        seenIds.add(id);
        sanitizedItems.push({
          ...item,
          id,
        });
      }

      clientCache = {
        data: sanitizedItems,
        timestamp: now,
        cachedAt: data.cachedAt || new Date().toISOString(),
      };
      return { items: sanitizedItems, cachedAt: data.cachedAt || new Date().toISOString() };
    }
    return { items: [], cachedAt: new Date().toISOString() };
  } catch (err) {
    if (clientCache) {
      return { items: clientCache.data, cachedAt: clientCache.cachedAt };
    }
    return { items: [], cachedAt: new Date().toISOString() };
  }
}
