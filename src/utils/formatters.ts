/**
 * Utilitários de formatação para moeda (R$), percentuais e números em padrão pt-BR.
 */

export function formatBRL(value: number | null | undefined, decimals = 2, fallback = '—'): string {
  if (value === null || value === undefined || isNaN(value)) return fallback;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number | null | undefined, showSign = true, fallback = '—'): string {
  if (value === null || value === undefined || isNaN(value)) return fallback;
  const formatted = Math.abs(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (value > 0 && showSign) return `+${formatted}%`;
  if (value < 0 && showSign) return `-${formatted}%`;
  return `${formatted}%`;
}

export function formatVolumeBRL(value: number): string {
  if (!value || isNaN(value)) return 'R$ 0';
  if (value >= 1_000_000_000) {
    return `R$ ${(value / 1_000_000_000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} bi`;
  }
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mi`;
  }
  if (value >= 1_000) {
    return `R$ ${(value / 1_000).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} mil`;
  }
  return formatBRL(value, 0);
}

export function formatDateTimeBR(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatFullDateTimeBR(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  const d = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const t = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return `${d} às ${t}`;
}

export function formatTimeBR(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatDateBR(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatNumberBR(value: number, decimals = 0): string {
  if (isNaN(value)) return '0';
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

const KNOWN_FRIENDLY_NAMES: Record<string, string> = {
  TEND3: 'Tenda',
  CEAB3: 'CEA Modas',
  PETR4: 'Petrobras',
  PETR3: 'Petrobras',
  VALE3: 'Vale',
  ITUB4: 'Itaú Unibanco',
  ITUB3: 'Itaú Unibanco',
  BBDC4: 'Bradesco',
  BBDC3: 'Bradesco',
  BBAS3: 'Banco do Brasil',
  ABEV3: 'Ambev',
  WEGE3: 'WEG',
  MGLU3: 'Magazine Luiza',
  RENT3: 'Localiza',
  LREN3: 'Lojas Renner',
  B3SA3: 'B3',
  VIVT3: 'Telefônica (Vivo)',
  EGIE3: 'Engie Brasil',
  TAEE11: 'Taesa',
  TAEE4: 'Taesa',
  TAEE3: 'Taesa',
  CPLE6: 'Copel',
  CPLE3: 'Copel',
  SBSP3: 'Sabesp',
  CSNA3: 'CSN',
  USIM5: 'Usiminas',
  USIM3: 'Usiminas',
  GGBR4: 'Gerdau',
  GOAU4: 'Metalúrgica Gerdau',
  JBSS3: 'JBS',
  BRFS3: 'BRF',
  SUZB3: 'Suzano',
  KLBN11: 'Klabin',
  RADL3: 'RaiaDrogasil',
  PRIO3: 'PRIO',
  VBBR3: 'Vibra Energia',
  EMBR3: 'Embraer',
  ASAI3: 'Assaí',
  CRFB3: 'Carrefour Brasil',
  ELET3: 'Eletrobras',
  ELET6: 'Eletrobras',
  EQTL3: 'Equatorial',
  HYPE3: 'Hypera Pharma',
  BPAC11: 'BTG Pactual',
  SANB11: 'Santander Brasil',
  COGN3: 'Cogna',
  CYRE3: 'Cyrela',
  MRVE3: 'MRV',
  MULT3: 'Multiplan',
  BEEF3: 'Minerva',
  MRFG3: 'Marfrig',
  ALOS3: 'Allos',
  AZUL4: 'Azul',
  GOLL4: 'Gol',
  CMIN3: 'CSN Mineração',
  SMTO3: 'São Martinho',
  SLCE3: 'SLC Agrícola',
  YDUQ3: 'Yduqs',
  DXCO3: 'Dexco',
  TOTS3: 'Totvs',
  LWSA3: 'Locaweb',
  CASH3: 'Méliuz',
  ENEV3: 'Eneva',
  CPFE3: 'CPFL Energia',
  CSAN3: 'Cosan',
  VAMO3: 'Vamos',
  ARZZ3: 'Arezzo',
  SOMA3: 'Grupo Soma',
  CCRO3: 'CCR',
  ECOR3: 'Ecorodovias',
  HAPV3: 'Hapvida',
  RDOR3: "Rede D'Or",
  FLRY3: 'Fleury',
  QUAL3: 'Qualicorp',
  BRAP4: 'Bradespar',
  BRKM5: 'Braskem',
  TIMS3: 'TIM Brasil',
  STBP3: 'Santos Brasil',
  RAIL3: 'Rumo',
  UGPA3: 'Ultrapar',
  MOVI3: 'Movida',
  SIMH3: 'Simpar',
  ALPA4: 'Alpargatas',
  AMER3: 'Americanas',
  PCAR3: 'Pão de Açúcar',
  HGLG11: 'CSHG Logística',
  MXRF11: 'Maxi Renda',
  KNIP11: 'Kinea Índices de Preços',
  KNCR11: 'Kinea Rendimentos',
  XPLG11: 'XP Logística',
  VISC11: 'Vinci Shopping Centers',
  BTLG11: 'BTG Logística',
  HGRU11: 'CSHG Renda Urbana',
  XPML11: 'XP Malls',
  CPTS11: 'Capitânia Securities',
  IRDM11: 'Iridium Recebíveis',
  TGAR11: 'TG Ativo Real',
  RECR11: 'REC Renda Imobiliária',
};

export function getFriendlyCompanyName(rawName: string, ticker?: string): string {
  if (!rawName) return ticker || '';
  const cleanTicker = (ticker || '').toUpperCase().trim();
  if (cleanTicker && KNOWN_FRIENDLY_NAMES[cleanTicker]) {
    return KNOWN_FRIENDLY_NAMES[cleanTicker];
  }

  let name = rawName.trim();
  if (/c&a|cea/i.test(name) && /moda/i.test(name)) return 'CEA Modas';
  if (/tenda/i.test(name)) return 'Tenda';

  name = name
    .replace(/\b(S\.?A\.?|S\/A|HOLDING|PARTICIPACOES|PARTICIPAÇÕES|EMPREENDIMENTOS|ADMINISTRACAO|ADMINISTRAÇÃO)\b/gi, '')
    .replace(/\b(CIA|COMPANHIA|CONSTRUTORA|INCORPORADORA|DISTRIBUIDORA|COMERCIAL|INDÚSTRIA|INDUSTRIA)\b/gi, '')
    .replace(/\b(ON|PN|UNT|PNA|PNB|EJ|ED|NM|N1|N2|DRN|BDR)\b/gi, '')
    .replace(/[-–—/\\|•]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (name === name.toUpperCase()) {
    name = name
      .toLowerCase()
      .split(' ')
      .map((w) => (w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
      .join(' ');
  }

  return name || rawName;
}
