import { CountryCode } from './types';

export const COUNTRY_ORDER: CountryCode[] = ['US', 'ID', 'CA', 'BR', 'MX', 'AU', 'SG'];

export const COUNTRY_LABELS: Record<CountryCode, string> = {
  US: 'United States',
  ID: 'Indonesia',
  CA: 'Canada',
  BR: 'Brazil',
  MX: 'Mexico',
  AU: 'Australia',
  SG: 'Singapore',
};

export const COUNTRY_COLORS: Record<CountryCode, string> = {
  US: '#000000',
  ID: '#374151',
  CA: '#6b7280',
  BR: '#1f2937',
  MX: '#9ca3af',
  AU: '#4b5563',
  SG: '#d1d5db',
};

export const COUNTRY_FLAGS: Record<CountryCode, string> = {
  US: '\u{1F1FA}\u{1F1F8}',
  ID: '\u{1F1EE}\u{1F1E9}',
  CA: '\u{1F1E8}\u{1F1E6}',
  BR: '\u{1F1E7}\u{1F1F7}',
  MX: '\u{1F1F2}\u{1F1FD}',
  AU: '\u{1F1E6}\u{1F1FA}',
  SG: '\u{1F1F8}\u{1F1EC}',
};

export const COUNTRY_CURRENCIES: Record<CountryCode, string> = {
  US: 'USD',
  ID: 'IDR',
  CA: 'CAD',
  BR: 'BRL',
  MX: 'MXN',
  AU: 'AUD',
  SG: 'SGD',
};

export const NAV_ITEMS = [
  { label: 'Overview', href: '/' },
  { label: 'Compare', href: '/compare' },
  { label: 'Investors', href: '/investors' },
  { label: 'Deductions', href: '/deductions' },
  { label: 'R&D Incentives', href: '/rnd' },
  { label: 'Treaty & WHT', href: '/treaty' },
  { label: 'Pipeline', href: '/pipeline' },
  { label: 'Cases', href: '/cases' },
];

export const COUNTRY_NAV_ITEMS = COUNTRY_ORDER.map((code) => ({
  code,
  label: COUNTRY_LABELS[code],
  href: `/countries/${code}`,
}));
