import allData from './data';
import { COUNTRY_ORDER, COUNTRY_LABELS } from './constants';
import { CountryCode, TableRow } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */

function getCorporateRate(code: CountryCode): number {
  const d = allData[code] as any;
  const ct = d.corporate_tax;
  if (ct.federal_rate !== undefined) return ct.federal_rate; // US
  if (ct.headline_rate !== undefined) return ct.headline_rate; // SG
  if (ct.standard_rate !== undefined) return ct.standard_rate; // ID, MX
  if (ct.general_rate !== undefined) return ct.general_rate; // AU
  if (ct.federal_general_rate !== undefined) return ct.federal_general_rate + 12; // CA (federal + avg provincial)
  if (ct.lucro_real) return ct.lucro_real.combined_effective?.above_240k ?? 34; // BR
  return 0;
}

function getVatRate(code: CountryCode): number {
  const d = allData[code] as any;
  if (d.vat_equivalent) return d.vat_equivalent.state_range?.max ?? 0; // US
  if (d.gst?.standard_rate !== undefined) return d.gst.standard_rate; // SG, AU
  if (d.vat?.standard_rate !== undefined) return d.vat.standard_rate; // ID, MX
  if (d.indirect_taxes?.pis_cofins_cumulative?.combined !== undefined) return d.indirect_taxes.pis_cofins_cumulative.combined; // BR fallback
  // BR: try different paths
  const ct = d.corporate_tax;
  if (ct?.lucro_real?.pis_cofins_noncumulative?.combined) return ct.lucro_real.pis_cofins_noncumulative.combined;
  return 0;
}

function getPayrollRate(code: CountryCode): number {
  const d = allData[code] as any;
  if (d.payroll_taxes?.total_employer_approximate !== undefined) return d.payroll_taxes.total_employer_approximate;
  if (d.employer_contributions?.total_employer_approximate_pct !== undefined) return d.employer_contributions.total_employer_approximate_pct;
  if (d.payroll_contributions_employer?.total_approximate) {
    const t = d.payroll_contributions_employer.total_approximate;
    return typeof t === 'object' ? (t.min + t.max) / 2 : t;
  }
  if (d.employer_social_contributions?.total_employer_approximate_pct !== undefined) return d.employer_social_contributions.total_employer_approximate_pct;
  if (d.payroll_taxes_employer?.total_employer_approximate_pct !== undefined) return d.payroll_taxes_employer.total_employer_approximate_pct;
  return 0;
}

function getDividendWht(code: CountryCode): number {
  const d = allData[code] as any;
  const wht = d.withholding_taxes_nonresident ?? d.withholding_taxes?.pph_26_nonresident;
  if (!wht) return 0;
  const div = wht.dividends;
  if (!div) return 0;
  if (typeof div === 'number') return div;
  return div.default ?? 0;
}

function getTreatyCount(code: CountryCode): number {
  const d = allData[code] as any;
  const ii = d.international_investors;
  if (!ii) return 0;
  const tn = ii.treaty_network;
  if (tn?.total_comprehensive_treaties) return tn.total_comprehensive_treaties;
  const dta = d.double_tax_agreements;
  if (dta?.number_of_treaties) return dta.number_of_treaties;
  return 0;
}

export interface KpiItem {
  label: string;
  value: string;
  sub?: string;
}

export function getKpiData(): KpiItem[] {
  const rates = COUNTRY_ORDER.map(getCorporateRate);
  const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
  const min = Math.min(...rates);
  const max = Math.max(...rates);
  const minCode = COUNTRY_ORDER[rates.indexOf(min)];
  const maxCode = COUNTRY_ORDER[rates.indexOf(max)];

  const vatRates = COUNTRY_ORDER.map(getVatRate);
  const avgVat = vatRates.reduce((a, b) => a + b, 0) / vatRates.length;

  const payrollRates = COUNTRY_ORDER.map(getPayrollRate);
  const avgPayroll = payrollRates.reduce((a, b) => a + b, 0) / payrollRates.length;

  const treatyCounts = COUNTRY_ORDER.map(getTreatyCount);
  const totalTreaties = treatyCounts.reduce((a, b) => a + b, 0);

  return [
    { label: 'Countries', value: '7', sub: 'Tier 1 coverage' },
    { label: 'Avg CIT Rate', value: `${avg.toFixed(1)}%`, sub: '7-country average' },
    { label: 'Lowest CIT', value: `${min.toFixed(1)}%`, sub: COUNTRY_LABELS[minCode] },
    { label: 'Highest CIT', value: `${max.toFixed(1)}%`, sub: COUNTRY_LABELS[maxCode] },
    { label: 'Avg VAT/GST', value: `${avgVat.toFixed(1)}%`, sub: 'Indirect tax avg' },
    { label: 'Treaty Network', value: `${totalTreaties}`, sub: 'Total treaties' },
  ];
}

export function getComprehensiveSummary(): TableRow[] {
  const rows: TableRow[] = [];

  const citRow: TableRow = { metric: 'Corporate Tax Rate' };
  const vatRow: TableRow = { metric: 'VAT / GST Rate' };
  const payrollRow: TableRow = { metric: 'Employer Payroll (%)' };
  const divWhtRow: TableRow = { metric: 'Dividend WHT (%)' };
  const treatyRow: TableRow = { metric: 'Tax Treaties' };

  for (const code of COUNTRY_ORDER) {
    const label = COUNTRY_LABELS[code];
    citRow[label] = `${getCorporateRate(code).toFixed(1)}%`;
    vatRow[label] = `${getVatRate(code).toFixed(1)}%`;
    payrollRow[label] = `${getPayrollRate(code).toFixed(1)}%`;
    divWhtRow[label] = `${getDividendWht(code).toFixed(1)}%`;
    treatyRow[label] = getTreatyCount(code);
  }

  rows.push(citRow, vatRow, payrollRow, divWhtRow, treatyRow);
  return rows;
}

export function getCorporateRatesChartData() {
  return COUNTRY_ORDER.map((code) => ({
    name: COUNTRY_LABELS[code],
    code,
    rate: getCorporateRate(code),
  }));
}

export function getVatChartData() {
  return COUNTRY_ORDER.map((code) => ({
    name: COUNTRY_LABELS[code],
    code,
    rate: getVatRate(code),
  }));
}

export function getPayrollChartData() {
  return COUNTRY_ORDER.map((code) => ({
    name: COUNTRY_LABELS[code],
    code,
    rate: getPayrollRate(code),
  }));
}

export function getRadarData() {
  // Normalize each dimension to 0-100 scale for radar
  const maxCit = 35;
  const maxVat = 25;
  const maxPayroll = 30;
  const maxWht = 30;
  const maxTreaty = 100;

  return COUNTRY_ORDER.map((code) => ({
    country: COUNTRY_LABELS[code],
    code,
    'Corporate Tax': Math.round((getCorporateRate(code) / maxCit) * 100),
    'VAT/GST': Math.round((getVatRate(code) / maxVat) * 100),
    'Payroll Tax': Math.round((getPayrollRate(code) / maxPayroll) * 100),
    'Dividend WHT': Math.round((getDividendWht(code) / maxWht) * 100),
    'Treaty Network': Math.round((getTreatyCount(code) / maxTreaty) * 100),
  }));
}

export function getCountrySummary(code: CountryCode) {
  return {
    corporateRate: getCorporateRate(code),
    vatRate: getVatRate(code),
    payrollRate: getPayrollRate(code),
    dividendWht: getDividendWht(code),
    treatyCount: getTreatyCount(code),
  };
}
