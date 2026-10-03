/**
 * Utilitários de formatação para moeda (R$), percentuais e números em padrão pt-BR.
 */

export function formatBRL(value: number, decimals = 2): string {
  if (isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, showSign = true): string {
  if (isNaN(value)) return '0,00%';
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
