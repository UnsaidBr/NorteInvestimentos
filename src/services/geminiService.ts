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
    console.warn('Erro ao chamar IA, utilizando resposta didática de contingência:', error);
    const isUp = stock.changePercent >= 0;
    return {
      symbol: stock.ticker,
      explanation: `Em termos gerais e educativos, a ${isUp ? 'alta' : 'baixa'} recente de ${stock.ticker} (${stock.name}) reflete o balanço diário de liquidez e expectativas do mercado sobre o setor de ${stock.sector || 'atuação da empresa'}. Fatores como movimentações da taxa de juros (Selic), oscilações cambiais e apetite institucional a risco costumam influenciar esse comportamento na B3.`,
      disclaimer: 'Conteúdo informativo e educacional. Não constitui recomendação de investimento. Rentabilidade passada não garante resultados futuros.',
      isFallback: true,
      errorNotice: 'Modo offline educacional.',
    };
  }
}
