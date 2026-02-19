export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatCurrency(value: number, currency = 'USD'): string {
  if (value >= 1e12) return `${currency} ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `${currency} ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${currency} ${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${currency} ${(value / 1e3).toFixed(0)}K`;
  return `${currency} ${value.toLocaleString()}`;
}

export function formatYears(value: number | string): string {
  if (value === 'indefinite' || (typeof value === 'number' && value >= 25)) return 'Indefinite';
  return `${value} yrs`;
}

export function formatNumber(value: number, decimals = 0): string {
  return value.toFixed(decimals);
}
