export type CountryCode = 'US' | 'ID' | 'CA' | 'BR' | 'MX' | 'AU' | 'SG';

export interface CountryData {
  country: string;
  country_code: CountryCode;
  currency: string;
  tax_year: string;
  corporate_tax: Record<string, unknown>;
  deductions: Record<string, unknown>;
  international_investors: Record<string, unknown>;
  income_by_source: Record<string, unknown>;
  sector_specific_taxes: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface HeatmapCell {
  row: string;
  col: string;
  value: number;
  label?: string;
}

export interface RadarDataPoint {
  category: string;
  [key: string]: string | number;
}

export interface TableRow {
  metric: string;
  [key: string]: string | number;
}

export interface PipelineStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  keyMetrics: { label: string; value: string }[];
  considerations: string[];
  countryNotes: { code: CountryCode; note: string }[];
}

export interface DecisionNode {
  id: string;
  type: 'question' | 'outcome';
  label: string;
  detail?: string;
  yes?: string;
  no?: string;
  x: number;
  y: number;
}

export interface BranchSubsidiaryComparison {
  code: CountryCode;
  name: string;
  branchRate: number;
  subsidiaryRate: number;
  branchTax: number;
  recommendation: 'Branch' | 'Subsidiary' | 'Either';
  reason: string;
}

export interface TaxChainStep {
  step: string;
  rate: number;
  amount: number;
  cumulative: number;
  legalCitation: string;
}

export interface InvestmentCorridor {
  id: string;
  from: CountryCode;
  to: CountryCode;
  fromName: string;
  toName: string;
  grossProfit: number;
  effectiveRate: number;
  netReceived: number;
  steps: TaxChainStep[];
}

export interface TreatyCorridorRate {
  from: string;
  to: string;
  dividendWht: number;
  interestWht: number;
  royaltyWht: string;
}

export interface CfcRanking {
  code: CountryCode;
  name: string;
  severity: number;
  regimeName: string;
  description: string;
  activeExemption: boolean;
}
