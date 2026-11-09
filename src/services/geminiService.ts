import { StockItem } from '../types/market';

export interface AiExplanationResponse {
  symbol: string;
  explanation: string;
  disclaimer: string;
  isFallback: boolean;
  errorNotice?: string;
}

export async function getStockAiExplanation(stock: StockItem): Promise<AiExplanationResponse> {
  try {
    const response = await fetch('/api/gemini/explain-stock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol: stock.ticker,
        name: stock.name,
        price: stock.price,
        changePercent: stock.changePercent,
        volume: stock.volume,
      }),
    });

    if (!response.ok) {
      throw new Error(`Falha no servidor (${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.warn('Falha ou ausência da chave Gemini:', error?.message || error);
    return {
      symbol: stock.ticker,
      explanation: 'Explicação por IA indisponível no momento. Tente novamente em instantes.',
      disclaimer: 'Conteúdo informativo e educacional. Não constitui recomendação de investimento. Rentabilidade passada não garante resultados futuros.',
      isFallback: true,
      errorNotice: 'Explicação por IA indisponível no momento.',
    };
  }
}
