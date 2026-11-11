import { jsPDF } from 'jspdf';
import {
  PortfolioPosition,
  PortfolioSummary,
  RebalanceSimulationResult,
} from '../types/portfolio';
import { formatBRL, formatPercent } from '../utils/formatters';

export interface GeneratePortfolioPdfReportParams {
  summary: PortfolioSummary;
  positions: PortfolioPosition[];
  currentPricesMap: Record<string, number>;
  annualDividendsMap?: Record<string, number>;
  rebalanceSimulation?: RebalanceSimulationResult;
  cdiRate?: number;
}

/**
 * Remove caracteres especiais ou emojis que possam quebrar a renderização do core font do jsPDF
 */
function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[^\x00-\x7F\xC0-\xFF]/g, '') // Mantém caracteres ASCII e ISO-8859-1 (acentos em português)
    .trim();
}

export function generatePortfolioPdfReport({
  summary,
  positions,
  currentPricesMap,
  annualDividendsMap = {},
  rebalanceSimulation,
  cdiRate = 13.65,
}: GeneratePortfolioPdfReportParams): void {
  // Inicializa documento A4 em milímetros
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm
  let currentY = margin;

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('pt-BR');
  const timeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Cores institucionais
  const colors = {
    darkBg: [18, 16, 14] as [number, number, number],
    cardBg: [248, 246, 242] as [number, number, number],
    cardBorder: [220, 205, 175] as [number, number, number],
    gold: [195, 150, 75] as [number, number, number],
    goldLight: [244, 235, 218] as [number, number, number],
    green: [35, 140, 85] as [number, number, number],
    greenBg: [230, 248, 238] as [number, number, number],
    red: [205, 55, 65] as [number, number, number],
    redBg: [253, 235, 237] as [number, number, number],
    blue: [30, 120, 180] as [number, number, number],
    textPrimary: [25, 23, 20] as [number, number, number],
    textSecondary: [90, 85, 75] as [number, number, number],
    textMuted: [140, 135, 125] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
  };

  const drawHeader = () => {
    // Banner superior escuro
    doc.setFillColor(...colors.darkBg);
    doc.rect(margin, currentY, contentWidth, 26, 'F');

    // Faixa dourada decorativa na borda inferior do cabeçalho
    doc.setFillColor(...colors.gold);
    doc.rect(margin, currentY + 25, contentWidth, 1.2, 'F');

    // Marca / Subtítulo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...colors.gold);
    doc.text('NORTEINVEST | PRIVATE WEALTH INTELLIGENCE', margin + 6, currentY + 7);

    // Título Principal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...colors.white);
    doc.text('RELATORIO PATRIMONIAL & REBALANCEAMENTO', margin + 6, currentY + 15);

    // Metadados à direita
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(200, 195, 185);
    doc.text(`Emissao: ${dateFormatted} as ${timeFormatted}`, pageWidth - margin - 6, currentY + 7, { align: 'right' });
    doc.text(`Referencia: B3 em Tempo Real | CDI: ${cdiRate.toFixed(2)}% a.a.`, pageWidth - margin - 6, currentY + 13, { align: 'right' });
    doc.text(`Posicoes Custodiadas: ${positions.length} ativos`, pageWidth - margin - 6, currentY + 19, { align: 'right' });

    currentY += 31;
  };

  const drawFooter = (pageNum: number, totalPages: number) => {
    const footerY = pageHeight - 10;
    doc.setDrawColor(...colors.cardBorder);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...colors.textMuted);
    doc.text(
      'NorteInvest - Inteligencia de Mercado B3. Documento estritamente informativo para gestao patrimonial (CVM).',
      margin,
      footerY + 2
    );

    doc.text(
      `Pagina ${pageNum} de ${totalPages}`,
      pageWidth - margin,
      footerY + 2,
      { align: 'right' }
    );
  };

  // 1. Cabeçalho Principal
  drawHeader();

  // 2. Cartões de Resumo Executivo (KPIs)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...colors.textPrimary);
  doc.text('1. RESUMO EXECUTIVO DA CARTEIRA', margin, currentY);
  currentY += 4;

  const cardWidth = (contentWidth - 9) / 4; // 4 cartões com espaçamento de 3mm
  const cardHeight = 22;

  // KPI 1: Patrimônio Atual
  doc.setFillColor(...colors.cardBg);
  doc.setDrawColor(...colors.cardBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...colors.textSecondary);
  doc.text('PATRIMONIO ATUAL', margin + 3.5, currentY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...colors.textPrimary);
  doc.text(formatBRL(summary.currentValue), margin + 3.5, currentY + 12.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...colors.textMuted);
  doc.text(`Custo: ${formatBRL(summary.totalInvested)}`, margin + 3.5, currentY + 18);

  // KPI 2: Rentabilidade Total
  const kpi2X = margin + cardWidth + 3;
  const isProfit = summary.totalGainLossBrl >= 0;
  doc.setFillColor(...(isProfit ? colors.greenBg : colors.redBg));
  doc.roundedRect(kpi2X, currentY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...(isProfit ? colors.green : colors.red));
  doc.text('RENTABILIDADE TOTAL', kpi2X + 3.5, currentY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(
    `${isProfit ? '+' : ''}${formatPercent(summary.totalGainLossPercent, false)}`,
    kpi2X + 3.5,
    currentY + 12.5
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(
    `${isProfit ? '+' : ''}${formatBRL(summary.totalGainLossBrl)}`,
    kpi2X + 3.5,
    currentY + 18
  );

  // KPI 3: Proventos Anuais
  const kpi3X = margin + (cardWidth + 3) * 2;
  doc.setFillColor(...colors.cardBg);
  doc.roundedRect(kpi3X, currentY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...colors.textSecondary);
  doc.text('PROVENTOS ANUAIS', kpi3X + 3.5, currentY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...colors.gold);
  doc.text(formatBRL(summary.projectedAnnualDividends), kpi3X + 3.5, currentY + 12.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...colors.textMuted);
  doc.text(`Media: ${formatBRL(summary.projectedMonthlyAverage)}/mes`, kpi3X + 3.5, currentY + 18);

  // KPI 4: Yield on Cost
  const kpi4X = margin + (cardWidth + 3) * 3;
  doc.setFillColor(...colors.cardBg);
  doc.roundedRect(kpi4X, currentY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...colors.textSecondary);
  doc.text('YIELD ON COST (YOC)', kpi4X + 3.5, currentY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...colors.textPrimary);
  doc.text(`${summary.averageYieldOnCost.toFixed(2)}%`, kpi4X + 3.5, currentY + 12.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...colors.textMuted);
  doc.text(`DY a Mercado: ${summary.currentDividendYield.toFixed(2)}%`, kpi4X + 3.5, currentY + 18);

  currentY += cardHeight + 7;

  // 3. Seção de Alocação por Classe de Ativos
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...colors.textPrimary);
  doc.text('2. ALOCACAO ATUAL POR CLASSE DE ATIVOS', margin, currentY);
  currentY += 4;

  // Tabela de Alocação
  const allocTableY = currentY;
  const colWidths = [45, 34, 34, 34, 35]; // Total = 182mm
  const headers = ['Classe de Ativos', 'Saldo Atual', 'Alocacao Atual', 'Meta Ideal', 'Diferenca'];

  // Cabeçalho da tabela de alocação
  doc.setFillColor(...colors.darkBg);
  doc.rect(margin, allocTableY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...colors.white);

  let currentX = margin;
  headers.forEach((h, i) => {
    const align = i === 0 ? 'left' : 'right';
    const textX = i === 0 ? currentX + 3 : currentX + colWidths[i] - 3;
    doc.text(h, textX, allocTableY + 4.2, { align });
    currentX += colWidths[i];
  });

  currentY += 6;

  // Linhas da tabela de alocação baseadas na simulação ou na distribuição padrão
  const rebalanceClasses = rebalanceSimulation?.classes || [];
  const classesToShow = [
    { key: 'acao', label: 'Acoes B3', color: [195, 150, 75] },
    { key: 'fii', label: 'Fundos Imobiliarios (FIIs)', color: [56, 189, 248] },
    { key: 'renda_fixa', label: 'Renda Fixa / CDI', color: [61, 220, 151] },
    { key: 'cripto', label: 'Criptomoedas', color: [247, 147, 26] },
  ];

  classesToShow.forEach((cat, idx) => {
    const rebalanceItem = rebalanceClasses.find((c) => c.category === cat.key);
    const allocItem = summary.allocationByClass.find((a) => a.category === cat.key);

    const currentValue = allocItem ? allocItem.totalValue : 0;
    const currentPercent = allocItem ? allocItem.percent : 0;
    const targetPercent = rebalanceItem ? rebalanceItem.targetPercent : 0;
    const diffPercent = currentPercent - targetPercent;

    const rowY = currentY;
    const isEven = idx % 2 === 0;

    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 246, isEven ? 255 : 242);
    doc.rect(margin, rowY, contentWidth, 6, 'F');
    doc.setDrawColor(...colors.cardBorder);
    doc.setLineWidth(0.15);
    doc.line(margin, rowY + 6, margin + contentWidth, rowY + 6);

    // Círculo com cor da classe
    doc.setFillColor(cat.color[0], cat.color[1], cat.color[2]);
    doc.circle(margin + 4, rowY + 3, 1.3, 'F');

    // Nome
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...colors.textPrimary);
    doc.text(cat.label, margin + 7.5, rowY + 4.2);

    // Saldo
    doc.setFont('helvetica', 'normal');
    doc.text(formatBRL(currentValue), margin + colWidths[0] + colWidths[1] - 3, rowY + 4.2, { align: 'right' });

    // Alocação Atual
    doc.setFont('helvetica', 'bold');
    doc.text(`${currentPercent.toFixed(1)}%`, margin + colWidths[0] + colWidths[1] + colWidths[2] - 3, rowY + 4.2, { align: 'right' });

    // Meta
    doc.setFont('helvetica', 'normal');
    doc.text(`${targetPercent}%`, margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] - 3, rowY + 4.2, { align: 'right' });

    // Diferença com cor
    if (diffPercent < -1) {
      doc.setTextColor(...colors.green);
      doc.text(`Abaixo (${diffPercent.toFixed(1)}%)`, margin + contentWidth - 3, rowY + 4.2, { align: 'right' });
    } else if (diffPercent > 1) {
      doc.setTextColor(...colors.gold);
      doc.text(`Acima (+${diffPercent.toFixed(1)}%)`, margin + contentWidth - 3, rowY + 4.2, { align: 'right' });
    } else {
      doc.setTextColor(...colors.textMuted);
      doc.text('Em Meta (OK)', margin + contentWidth - 3, rowY + 4.2, { align: 'right' });
    }

    currentY += 6;
  });

  // Barra de Alocação Visual (Horizontal Stacked Bar)
  currentY += 2;
  const barHeight = 4.5;
  let barX = margin;

  classesToShow.forEach((cat) => {
    const allocItem = summary.allocationByClass.find((a) => a.category === cat.key);
    const pct = allocItem ? allocItem.percent : 0;
    const segWidth = (pct / 100) * contentWidth;
    if (segWidth > 0.5) {
      doc.setFillColor(cat.color[0], cat.color[1], cat.color[2]);
      doc.rect(barX, currentY, segWidth, barHeight, 'F');
      barX += segWidth;
    }
  });

  currentY += barHeight + 7;

  // 4. Seção: Sugestões de Rebalanceamento Inteligente
  if (rebalanceSimulation) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...colors.textPrimary);
    doc.text('3. SUGESTOES DE REBALANCEAMENTO DE CARTEIRA', margin, currentY);
    currentY += 4;

    // Box resumo do Aporte
    doc.setFillColor(...colors.cardBg);
    doc.setDrawColor(...colors.cardBorder);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, contentWidth, 14, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...colors.textSecondary);
    doc.text('Aporte Mensal Simulado:', margin + 4, currentY + 5.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.gold);
    doc.text(formatBRL(rebalanceSimulation.contributionAmount), margin + 42, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.textSecondary);
    doc.text('Patrimonio Projetado:', margin + 70, currentY + 5.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.textPrimary);
    doc.text(formatBRL(rebalanceSimulation.totalProjectedValue), margin + 104, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...colors.textMuted);
    doc.text(
      'Metodologia: O algoritmo sugere compras exclusivas nas classes abaixo da meta, sem gerar vendas tributaveis.',
      margin + 4,
      currentY + 10.5
    );

    currentY += 17;

    // Tabela das Sugestões de Aporte
    const rebColWidths = [45, 34, 34, 34, 35];
    const rebHeaders = ['Classe', 'Aporte Sugerido', 'Meta Definida', 'Alocacao Projetada', 'Status Acao'];

    doc.setFillColor(...colors.darkBg);
    doc.rect(margin, currentY, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...colors.white);

    let rebX = margin;
    rebHeaders.forEach((h, i) => {
      const align = i === 0 ? 'left' : 'right';
      const textX = i === 0 ? rebX + 3 : rebX + rebColWidths[i] - 3;
      doc.text(h, textX, currentY + 4.2, { align });
      rebX += rebColWidths[i];
    });

    currentY += 6;

    rebalanceSimulation.classes.forEach((c, idx) => {
      const rowY = currentY;
      const isEven = idx % 2 === 0;

      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 246, isEven ? 255 : 242);
      doc.rect(margin, rowY, contentWidth, 6, 'F');
      doc.setDrawColor(...colors.cardBorder);
      doc.setLineWidth(0.15);
      doc.line(margin, rowY + 6, margin + contentWidth, rowY + 6);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...colors.textPrimary);
      doc.text(c.label, margin + 3, rowY + 4.2);

      // Aporte sugerido em destaque
      const hasContribution = c.suggestedContribution > 0;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...(hasContribution ? colors.green : colors.textMuted));
      doc.text(
        hasContribution ? `+${formatBRL(c.suggestedContribution)}` : 'R$ 0,00',
        margin + rebColWidths[0] + rebColWidths[1] - 3,
        rowY + 4.2,
        { align: 'right' }
      );

      // Meta
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.textPrimary);
      doc.text(`${c.targetPercent}%`, margin + rebColWidths[0] + rebColWidths[1] + rebColWidths[2] - 3, rowY + 4.2, { align: 'right' });

      // Projetado
      doc.setFont('helvetica', 'bold');
      doc.text(
        `${c.projectedPercent.toFixed(1)}%`,
        margin + rebColWidths[0] + rebColWidths[1] + rebColWidths[2] + rebColWidths[3] - 3,
        rowY + 4.2,
        { align: 'right' }
      );

      // Status
      if (hasContribution) {
        doc.setTextColor(...colors.green);
        doc.text('Aportar (Comprar)', margin + contentWidth - 3, rowY + 4.2, { align: 'right' });
      } else {
        doc.setTextColor(...colors.textMuted);
        doc.text('Aguardar (Em meta)', margin + contentWidth - 3, rowY + 4.2, { align: 'right' });
      }

      currentY += 6;
    });

    currentY += 8;
  }

  // 5. Tabela de Detalhamento de Posições (Ativos)
  // Se faltar espaço para o cabeçalho e pelo menos 4 linhas na página 1, quebramos página
  if (currentY + 35 > pageHeight - 20) {
    drawFooter(1, 2);
    doc.addPage();
    currentY = margin;
    drawHeader();
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...colors.textPrimary);
  doc.text('4. DETALHAMENTO DE POSICOES EM CUSTODIA', margin, currentY);
  currentY += 4;

  const posColWidths = [24, 40, 18, 16, 22, 22, 22, 18]; // Total = 182mm
  const posHeaders = ['Ticker', 'Empresa / Nome', 'Classe', 'Qtd', 'Preco Medio', 'Preco B3', 'Saldo Total', 'Rentab.'];

  const drawPositionTableHeader = () => {
    doc.setFillColor(...colors.darkBg);
    doc.rect(margin, currentY, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...colors.white);

    let pX = margin;
    posHeaders.forEach((h, i) => {
      const align = i <= 2 ? 'left' : 'right';
      const textX = i <= 2 ? pX + 2.5 : pX + posColWidths[i] - 2.5;
      doc.text(h, textX, currentY + 4.2, { align });
      pX += posColWidths[i];
    });

    currentY += 6;
  };

  drawPositionTableHeader();

  positions.forEach((pos, idx) => {
    // Quebra de página automática se ultrapassar limite
    if (currentY + 8 > pageHeight - 16) {
      doc.addPage();
      currentY = margin;
      drawHeader();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...colors.textPrimary);
      doc.text('4. DETALHAMENTO DE POSICOES EM CUSTODIA (CONTINUACAO)', margin, currentY);
      currentY += 4;
      drawPositionTableHeader();
    }

    const price = currentPricesMap[pos.ticker.toUpperCase()] || pos.averagePrice;
    const totalCost = pos.quantity * pos.averagePrice;
    const currentValue = pos.quantity * price;
    const gainLossBrl = currentValue - totalCost;
    const gainLossPercent = totalCost > 0 ? (gainLossBrl / totalCost) * 100 : 0;
    const isRowProfit = gainLossBrl >= 0;

    const rowY = currentY;
    const isEven = idx % 2 === 0;

    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 246, isEven ? 255 : 242);
    doc.rect(margin, rowY, contentWidth, 5.5, 'F');
    doc.setDrawColor(...colors.cardBorder);
    doc.setLineWidth(0.15);
    doc.line(margin, rowY + 5.5, margin + contentWidth, rowY + 5.5);

    let pX = margin;

    // Ticker
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...colors.gold);
    doc.text(pos.ticker, pX + 2.5, rowY + 3.8);
    pX += posColWidths[0];

    // Nome
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...colors.textPrimary);
    const cleanName = cleanText(pos.name).substring(0, 22);
    doc.text(cleanName, pX + 2.5, rowY + 3.8);
    pX += posColWidths[1];

    // Categoria
    const catShort =
      pos.category === 'acao'
        ? 'Acao'
        : pos.category === 'fii'
        ? 'FII'
        : pos.category === 'renda_fixa'
        ? 'R. Fixa'
        : 'Cripto';
    doc.setFontSize(6.5);
    doc.setTextColor(...colors.textSecondary);
    doc.text(catShort, pX + 2.5, rowY + 3.8);
    pX += posColWidths[2];

    // Quantidade
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...colors.textPrimary);
    doc.text(String(pos.quantity), pX + posColWidths[3] - 2.5, rowY + 3.8, { align: 'right' });
    pX += posColWidths[3];

    // Preço Médio
    doc.text(formatBRL(pos.averagePrice), pX + posColWidths[4] - 2.5, rowY + 3.8, { align: 'right' });
    pX += posColWidths[4];

    // Preço Atual
    doc.setFont('helvetica', 'bold');
    doc.text(formatBRL(price), pX + posColWidths[5] - 2.5, rowY + 3.8, { align: 'right' });
    pX += posColWidths[5];

    // Saldo Total
    doc.text(formatBRL(currentValue), pX + posColWidths[6] - 2.5, rowY + 3.8, { align: 'right' });
    pX += posColWidths[6];

    // Rentabilidade
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...(isRowProfit ? colors.green : colors.red));
    const rentText = `${isRowProfit ? '+' : ''}${formatPercent(gainLossPercent, false)}`;
    doc.text(rentText, pX + posColWidths[7] - 2.5, rowY + 3.8, { align: 'right' });

    currentY += 5.5;
  });

  // Linha de Totais da Tabela de Posições
  currentY += 1.5;
  doc.setFillColor(...colors.cardBg);
  doc.rect(margin, currentY, contentWidth, 6, 'F');
  doc.setDrawColor(...colors.gold);
  doc.setLineWidth(0.3);
  doc.rect(margin, currentY, contentWidth, 6, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...colors.textPrimary);
  doc.text('TOTAL CONSOLIDADO EM CARTEIRA', margin + 3, currentY + 4.2);

  const totalValueStr = formatBRL(summary.currentValue);
  doc.setTextColor(...colors.gold);
  doc.text(
    totalValueStr,
    margin + posColWidths[0] + posColWidths[1] + posColWidths[2] + posColWidths[3] + posColWidths[4] + posColWidths[5] + posColWidths[6] - 2.5,
    currentY + 4.2,
    { align: 'right' }
  );

  const totalRentText = `${summary.totalGainLossBrl >= 0 ? '+' : ''}${formatPercent(summary.totalGainLossPercent, false)}`;
  doc.setTextColor(...(summary.totalGainLossBrl >= 0 ? colors.green : colors.red));
  doc.text(totalRentText, margin + contentWidth - 2.5, currentY + 4.2, { align: 'right' });

  // Adiciona rodapés em todas as páginas criadas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(i, totalPages);
  }

  // Nome do arquivo com timestamp sanitizado
  const fileDate = now.toISOString().slice(0, 10);
  doc.save(`norteinvest-relatorio-carteira-${fileDate}.pdf`);
}
