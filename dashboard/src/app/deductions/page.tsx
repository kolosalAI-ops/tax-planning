/* eslint-disable @typescript-eslint/no-explicit-any */
import allData from '@/lib/data';
import { COUNTRY_ORDER, COUNTRY_LABELS, COUNTRY_FLAGS } from '@/lib/constants';
import { CountryCode } from '@/lib/types';
import { TableRow } from '@/lib/types';
import ComparisonTable from '@/components/cards/ComparisonTable';

/* ---------------------------------------------------------------------------
   Helper: safely dig into deductions data
--------------------------------------------------------------------------- */

function ded(code: CountryCode): any {
  return (allData[code] as any).deductions ?? {};
}

function topLevel(code: CountryCode): any {
  return allData[code] as any;
}

/* ---------------------------------------------------------------------------
   Comparison table row builders
--------------------------------------------------------------------------- */

function getDepreciation(code: CountryCode): string {
  const d = ded(code);
  if (code === 'US') {
    const bonus = d.depreciation?.bonus_depreciation_2024;
    return bonus !== undefined ? `MACRS + ${bonus}% bonus` : 'MACRS';
  }
  if (code === 'CA') return d.cca ? 'CCA (DB classes)' : 'N/A';
  if (code === 'ID') return 'SL / DB (4 groups)';
  if (code === 'BR') return 'SL + shift multiplier';
  if (code === 'MX') return 'Straight-line only';
  if (code === 'AU') return 'DV / Prime Cost';
  if (code === 'SG') return 'SL (s19 / s19A)';
  return 'N/A';
}

function getNol(code: CountryCode): string {
  const d = ded(code);
  const nol = d.nol ?? d.losses;
  if (!nol) return 'N/A';
  const cf = nol.carry_forward ?? nol.carry_forward_years ?? nol.non_capital_carry_forward ?? nol.revenue_carry_forward;
  const cb = nol.carry_back ?? nol.carry_back_years ?? nol.non_capital_carry_back ?? nol.revenue_carry_back;
  const lim = nol.limitation_pct ?? nol.annual_limitation_pct ?? nol.annual_limit_pct;
  const parts: string[] = [];
  if (cf !== undefined && cf !== false) {
    parts.push(`CF: ${cf === 'indefinite' || (typeof cf === 'number' && cf >= 99) ? 'Indef.' : cf + 'yr'}`);
  }
  if (cb !== undefined && cb !== false) {
    parts.push(`CB: ${cb}yr`);
  }
  if (lim !== undefined) {
    parts.push(`${lim}% limit`);
  }
  return parts.length ? parts.join(' · ') : 'Available';
}

function getInterestMethod(code: CountryCode): string {
  const d = ded(code);
  if (code === 'US') return `${d.interest_limitation?.pct_of_ati ?? 30}% ATI`;
  if (code === 'CA') return `${d.interest_limitation_eifel?.pct_of_ebitda ?? 30}% EBITDA (EIFEL)`;
  if (code === 'ID') return `DTE ${d.thin_capitalization?.debt_equity_ratio ?? '4:1'}`;
  if (code === 'BR') return `DTE ${d.thin_capitalization?.related_party_ratio ?? '2:1'}`;
  if (code === 'MX') return `${d.interest_limitation?.pct_of_ebitda ?? 30}% EBITDA + DTE 3:1`;
  if (code === 'AU') return `Safe harbour 60% + 30% EBITDA`;
  if (code === 'SG') return "Arm's length (TP)";
  return 'N/A';
}

function getRnd(code: CountryCode): string {
  const d = ded(code);
  const t = topLevel(code);
  if (code === 'US') return `${d.rnd?.regular_credit_rate ?? 20}% credit (ASC ${d.rnd?.asc_rate ?? 14}%)`;
  if (code === 'CA') return `SR&ED ${d.sred?.ccpc_enhanced_rate ?? 35}% (CCPC)`;
  if (code === 'ID') return `${d.rnd_super_deduction?.tier_3?.total_deduction ?? 300}% super ded.`;
  if (code === 'BR') return `Lei do Bem ${(d.rnd_lei_do_bem?.base_deduction ?? 100) + (d.rnd_lei_do_bem?.additional_deduction ?? 60)}% ded.`;
  if (code === 'MX') return `${d.rnd?.credit_rate ?? 30}% ITC (incremental)`;
  if (code === 'AU') {
    const rnd = t.rnd_tax_incentive;
    return rnd ? `${rnd.small_company?.effective_rate_25pct_entity ?? 43.5}% offset (SME)` : 'N/A';
  }
  if (code === 'SG') return `${d.rnd?.enhanced_deduction_pct ?? 250}% ded. (EIS 400%)`;
  return 'N/A';
}

function getCharitable(code: CountryCode): string {
  const d = ded(code);
  const ch = d.charitable;
  if (!ch) return 'N/A';
  if (code === 'US') return `${ch.cash_limit_pct}% of TI`;
  if (code === 'CA') return `${ch.max_pct_of_income}% of net income`;
  if (code === 'ID') return 'Select categories only';
  if (code === 'BR') return `OSCIP ${ch.oscip_limit_pct_operating_profit}% + incentive laws`;
  if (code === 'MX') return `${ch.limit_pct_prior_year_income}% of prior yr income`;
  if (code === 'AU') return 'No cap (DGR required)';
  if (code === 'SG') return `${ch.deduction_multiplier}x multiplier`;
  return 'N/A';
}

function getMeals(code: CountryCode): string {
  const d = ded(code);
  if (code === 'US') return `${d.meals_deduction_pct ?? 50}% meals / ${d.entertainment_deduction_pct ?? 0}% ent.`;
  if (code === 'CA') return `${d.meals_entertainment?.general ?? 50}% general`;
  if (code === 'ID') return 'Entertainment list required';
  if (code === 'BR') return 'Not deductible (personal)';
  if (code === 'MX') return `${d.meals?.restaurant_deductible_pct ?? 91.5}% restaurant`;
  if (code === 'AU') return 'Subject to FBT';
  if (code === 'SG') return `${d.meals_deduction_pct ?? 100}% (business purpose)`;
  return 'N/A';
}

function getHomeOffice(code: CountryCode): string {
  if (code === 'US') return `$${(ded(code).home_office_simplified_max ?? 1500).toLocaleString()} simplified`;
  if (code === 'CA') return 'Flat rate or detailed';
  if (code === 'ID') return 'Not specifically allowed';
  if (code === 'BR') return 'Limited provisions';
  if (code === 'MX') return 'Not deductible';
  if (code === 'AU') return 'Fixed rate 67c/hr';
  if (code === 'SG') return 'Not deductible';
  return 'N/A';
}

/* ---------------------------------------------------------------------------
   R&D effective benefit rate (numeric) for bar charts
--------------------------------------------------------------------------- */

function getRndEffectiveRate(code: CountryCode): { rate: number; label: string; type: string } {
  const d = ded(code);
  const t = topLevel(code);
  switch (code) {
    case 'US': return { rate: 20, label: '20% tax credit', type: 'Tax Credit' };
    case 'CA': return { rate: 35, label: '35% ITC (CCPC)', type: 'Refundable Credit' };
    case 'ID': return { rate: 44, label: '300% super ded. (≈44% benefit)', type: 'Super Deduction' };
    case 'BR': return { rate: 20.4, label: '160% ded. (≈20.4% benefit)', type: 'Enhanced Deduction' };
    case 'MX': return { rate: 30, label: '30% ITC (incremental)', type: 'Tax Credit' };
    case 'AU': {
      const r = t.rnd_tax_incentive?.small_company?.offset_premium ?? 18.5;
      return { rate: r, label: `${r}% offset premium (SME)`, type: 'Tax Offset' };
    }
    case 'SG': return { rate: 37.4, label: 'EIS 400% ded. (≈37.4% benefit)', type: 'Enhanced Deduction' };
    default: return { rate: 0, label: 'N/A', type: '' };
  }
}

/* ---------------------------------------------------------------------------
   NOL numeric data for bar charts
--------------------------------------------------------------------------- */

function getNolData(code: CountryCode): { cfYears: number; cfLabel: string; cbYears: number; limitPct: number } {
  const d = ded(code);
  const nol = d.nol ?? d.losses;
  if (!nol) return { cfYears: 0, cfLabel: 'N/A', cbYears: 0, limitPct: 100 };

  const cfRaw = nol.carry_forward ?? nol.carry_forward_years ?? nol.non_capital_carry_forward ?? nol.revenue_carry_forward;
  const cbRaw = nol.carry_back ?? nol.carry_back_years ?? nol.non_capital_carry_back ?? nol.revenue_carry_back;
  const lim = nol.limitation_pct ?? nol.annual_limitation_pct ?? nol.annual_limit_pct ?? 100;

  const isIndef = cfRaw === 'indefinite' || (typeof cfRaw === 'number' && cfRaw >= 99);
  const cfYears = isIndef ? 99 : (typeof cfRaw === 'number' ? cfRaw : 0);
  const cfLabel = isIndef ? 'Indefinite' : `${cfYears} years`;
  const cbYears = cbRaw === false || cbRaw === undefined ? 0 : (typeof cbRaw === 'number' ? cbRaw : 0);

  return { cfYears, cfLabel, cbYears, limitPct: lim };
}

/* ---------------------------------------------------------------------------
   Depreciation comparison data
--------------------------------------------------------------------------- */

interface DepRow {
  asset: string;
  US: string; ID: string; CA: string; BR: string; MX: string; AU: string; SG: string;
}

const depreciationRows: DepRow[] = [
  {
    asset: 'Buildings',
    US: '39yr SL (commercial)',
    ID: '20yr SL 5%',
    CA: 'Class 1 — 4% DB',
    BR: '25yr SL 4%',
    MX: '20yr SL 5%',
    AU: '40yr SL 2.5%',
    SG: 'IBA 25% + 3%/yr',
  },
  {
    asset: 'Computers',
    US: '5yr 200% DB',
    ID: 'Grp 1 — 4yr (50% DB)',
    CA: 'Class 50 — 55% DB',
    BR: '5yr SL 20%',
    MX: 'SL 30%',
    AU: '4yr (50% DV)',
    SG: '1yr 100% write-off',
  },
  {
    asset: 'Vehicles',
    US: '5yr 200% DB',
    ID: 'Grp 2 — 8yr (25% DB)',
    CA: 'Class 10 — 30% DB',
    BR: '5yr SL 20%',
    MX: 'SL 25% (cap MXN 175K)',
    AU: '8yr (25% DV)',
    SG: '3yr SL 33.3%',
  },
  {
    asset: 'Machinery',
    US: '7yr 200% DB',
    ID: 'Grp 2–3 — 8–16yr',
    CA: 'Class 8 — 20% DB',
    BR: '10yr SL 10%',
    MX: 'SL 10%',
    AU: '10–15yr (13–20% DV)',
    SG: '3yr SL 33.3%',
  },
  {
    asset: 'Software',
    US: '3–5yr (or s179)',
    ID: 'Grp 1 — 4yr',
    CA: 'Class 12 — 100% DB',
    BR: '5yr SL 20%',
    MX: 'SL 30%',
    AU: '5yr (40% DV)',
    SG: '1yr 100% write-off',
  },
  {
    asset: 'Accelerated / Bonus',
    US: '60% bonus (2024)',
    ID: 'DB method available',
    CA: 'CCPC $1.5M imm. exp.',
    BR: '2x for 2+ shifts',
    MX: '100% mining/renewable',
    AU: 'SME $20K instant',
    SG: 's19A 1-yr option',
  },
];

/* ---------------------------------------------------------------------------
   Country detail card
--------------------------------------------------------------------------- */

function CountryDetailCard({ code }: { code: CountryCode }) {
  const d = ded(code);
  const t = topLevel(code);
  const rnd = getRndEffectiveRate(code);
  const nol = getNolData(code);

  // R&D detail
  let rndDetails: { label: string; value: string }[] = [];
  if (code === 'US') {
    rndDetails = [
      { label: 'Regular Credit', value: `${d.rnd?.regular_credit_rate}%` },
      { label: 'ASC Method', value: `${d.rnd?.asc_rate}%` },
      { label: 'Amortization (domestic)', value: `${d.rnd?.amortization_domestic_years}yr` },
      { label: 'Legal Basis', value: 'IRC §41, §174' },
    ];
  } else if (code === 'CA') {
    rndDetails = [
      { label: 'CCPC Enhanced Rate', value: `${d.sred?.ccpc_enhanced_rate}%` },
      { label: 'Other Corp Rate', value: `${d.sred?.other_corp_rate}%` },
      { label: 'Expenditure Limit', value: `C$${(d.sred?.ccpc_expenditure_limit / 1e6).toFixed(0)}M` },
      { label: 'Refundable (CCPC)', value: d.sred?.refundable_ccpc ? 'Yes' : 'No' },
      { label: 'Legal Basis', value: 'ITA §127(9), ITR 2900' },
    ];
  } else if (code === 'ID') {
    rndDetails = [
      { label: 'Tier 1 (Priority)', value: '200% deduction' },
      { label: 'Tier 2 (University)', value: '250% deduction' },
      { label: 'Tier 3 (Nat\'l Body)', value: '300% deduction' },
      { label: 'Legal Basis', value: 'GR 45/2019, PMK 153/2020' },
    ];
  } else if (code === 'BR') {
    rndDetails = [
      { label: 'Base + Additional', value: `${d.rnd_lei_do_bem?.base_deduction}% + ${d.rnd_lei_do_bem?.additional_deduction}%` },
      { label: 'If Headcount Up', value: `${d.rnd_lei_do_bem?.additional_if_headcount_increase}% extra` },
      { label: 'If Patent Filed', value: `${d.rnd_lei_do_bem?.additional_if_patent}% extra` },
      { label: 'Legal Basis', value: 'Lei 11,196/2005 (Lei do Bem)' },
    ];
  } else if (code === 'MX') {
    rndDetails = [
      { label: 'Credit Rate', value: `${d.rnd?.credit_rate}%` },
      { label: 'Max Credit', value: `MXN ${(d.rnd?.max_credit / 1e6).toFixed(0)}M` },
      { label: 'Basis', value: 'Incremental (3yr avg)' },
      { label: 'Legal Basis', value: 'LISR Art. 202–204' },
    ];
  } else if (code === 'AU') {
    const rndInc = t.rnd_tax_incentive;
    rndDetails = [
      { label: 'SME Offset', value: `${rndInc?.small_company?.effective_rate_25pct_entity}% (refundable)` },
      { label: 'Large Co. Base', value: `${rndInc?.large_company?.effective_rate_30pct_entity}%` },
      { label: 'Intensity Bonus', value: `${rndInc?.large_company?.intensity_effective_rate}% (>2% intensity)` },
      { label: 'Annual Cap', value: `A$${(rndInc?.large_company?.annual_cap / 1e6).toFixed(0)}M` },
      { label: 'Legal Basis', value: 'ITAA97 Div 355' },
    ];
  } else if (code === 'SG') {
    rndDetails = [
      { label: 'Enhanced Ded.', value: `${d.rnd?.enhanced_deduction_pct}%` },
      { label: 'EIS Enhanced', value: `${d.rnd?.innovation_allowance?.enhanced_deduction_pct}% (cap S$400K)` },
      { label: 'Cash Payout', value: `${d.rnd?.innovation_allowance?.cash_payout_rate_pct}% (cap S$100K)` },
      { label: 'IP Write-Down', value: `${d.rnd?.writing_down_ip_years}yr or ${d.rnd?.writing_down_ip_alternative_years}yr` },
      { label: 'Legal Basis', value: 'ITA s14C, s14E, s14U' },
    ];
  }

  // Depreciation highlights
  let depHighlight = '';
  if (code === 'US') depHighlight = `MACRS with ${d.depreciation?.bonus_depreciation_2024 ?? 60}% bonus depreciation (2024). §179 up to $${((d.depreciation?.section_179_limit ?? 0) / 1000).toFixed(0)}K.`;
  else if (code === 'CA') depHighlight = `Capital Cost Allowance (CCA) classes. CCPC immediate expensing up to C$${((d.cca?.immediate_expensing_ccpc?.limit ?? 0) / 1e6).toFixed(1)}M.`;
  else if (code === 'ID') depHighlight = '4 asset groups (4–20yr). Straight-line or declining balance. Buildings: permanent 20yr, non-permanent 10yr.';
  else if (code === 'BR') depHighlight = 'Fixed SL rates. Accelerated via shift multiplier (2x for R&D equipment, 1.5x–2x for multi-shift operations).';
  else if (code === 'MX') depHighlight = `Straight-line only. 100% first-year for mining & renewable energy equipment. Vehicle cap MXN ${((d.depreciation?.vehicle_cap ?? 0) / 1000).toFixed(0)}K.`;
  else if (code === 'AU') depHighlight = `Diminishing value or prime cost. SME instant write-off up to A$${((d.small_business?.instant_write_off_threshold ?? 0) / 1000).toFixed(0)}K per asset.`;
  else if (code === 'SG') depHighlight = 'Section 19: mandatory 3-year SL. Section 19A: 1-year accelerated option. Computers & software — 100% in year 1.';

  // Interest limitation
  const intMethod = getInterestMethod(code);

  // Charitable
  const charStr = getCharitable(code);

  return (
    <div className="bg-white border border-[#E4E7E9] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E4E7E9] flex items-center gap-3">
        <span className="text-xl">{COUNTRY_FLAGS[code]}</span>
        <div>
          <h3 className="text-sm font-bold text-[#0D0E0F]">{COUNTRY_LABELS[code]}</h3>
          <span className="text-[10px] font-mono text-[#5A5E62]">{t.tax_year}</span>
        </div>
      </div>

      {/* R&D Callout */}
      <div className="px-5 py-3 bg-[#F0F6FE] border-b border-[#E4E7E9]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#0052C4]">R&D Incentive</span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#F0F6FE] text-[#0052C4]">{rnd.type}</span>
        </div>
        <div className="text-lg font-extrabold text-[#0052C4] font-mono">{rnd.rate}%</div>
        <div className="text-[10px] text-[#5A5E62]">{rnd.label}</div>
        <div className="mt-2 space-y-1">
          {rndDetails.map((item) => (
            <div key={item.label} className="flex justify-between text-[10px]">
              <span className="text-[#6A6F73]">{item.label}</span>
              <span className="font-semibold text-[#0D0E0F] font-mono">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* NOL, Depreciation, Interest, Charitable */}
      <div className="px-5 py-3 space-y-3">
        {/* NOL */}
        <div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#6A6F73]">Net Operating Losses</span>
          <div className="mt-1 flex gap-3">
            <div className="flex-1 bg-[#F1F3F4] rounded px-2 py-1.5 text-center">
              <div className="text-xs font-bold text-[#0D0E0F] font-mono">{nol.cfLabel}</div>
              <div className="text-[8px] text-[#6A6F73] uppercase">Carry-Forward</div>
            </div>
            <div className="flex-1 bg-[#F1F3F4] rounded px-2 py-1.5 text-center">
              <div className="text-xs font-bold text-[#0D0E0F] font-mono">{nol.cbYears > 0 ? `${nol.cbYears}yr` : 'None'}</div>
              <div className="text-[8px] text-[#6A6F73] uppercase">Carry-Back</div>
            </div>
            <div className="flex-1 bg-[#F1F3F4] rounded px-2 py-1.5 text-center">
              <div className="text-xs font-bold font-mono" style={{ color: nol.limitPct < 100 ? '#CC8727' : '#0052C4' }}>{nol.limitPct}%</div>
              <div className="text-[8px] text-[#6A6F73] uppercase">Annual Limit</div>
            </div>
          </div>
        </div>

        {/* Depreciation Highlights */}
        <div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#6A6F73]">Depreciation</span>
          <p className="text-[11px] text-[#0D0E0F] mt-1 leading-relaxed">{depHighlight}</p>
        </div>

        {/* Interest Limitation */}
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#6A6F73]">Interest Limitation</span>
          <span className="text-[10px] font-mono font-semibold text-[#0D0E0F]">{intMethod}</span>
        </div>

        {/* Charitable */}
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#6A6F73]">Charitable Deduction</span>
          <span className="text-[10px] font-mono font-semibold text-[#0D0E0F]">{charStr}</span>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================================
   Main Page
=========================================================================== */

export default function DeductionsPage() {
  /* --- Expanded Comparison Table Rows --- */
  const rows: TableRow[] = [];
  const rowBuilders: { label: string; fn: (c: CountryCode) => string }[] = [
    { label: 'Depreciation System', fn: getDepreciation },
    { label: 'R&D Incentive', fn: getRnd },
    { label: 'NOL Carry Rules', fn: getNol },
    { label: 'Interest Limitation', fn: getInterestMethod },
    { label: 'Charitable Deduction', fn: getCharitable },
    { label: 'Meals & Entertainment', fn: getMeals },
    { label: 'Home Office', fn: getHomeOffice },
  ];
  for (const { label, fn } of rowBuilders) {
    const row: TableRow = { metric: label };
    for (const code of COUNTRY_ORDER) {
      row[COUNTRY_LABELS[code]] = fn(code);
    }
    rows.push(row);
  }

  /* --- R&D bar chart data --- */
  const rndBars = COUNTRY_ORDER.map((code) => {
    const r = getRndEffectiveRate(code);
    return { code, ...r };
  }).sort((a, b) => b.rate - a.rate);
  const maxRnd = Math.max(...rndBars.map((b) => b.rate));

  /* --- NOL bar chart data --- */
  const nolBars = COUNTRY_ORDER.map((code) => {
    const n = getNolData(code);
    return { code, ...n };
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0D0E0F]">Deductions &amp; Allowances</h1>
        <p className="text-sm text-[#6A6F73] mt-1">
          Comprehensive comparison of depreciation, R&amp;D incentives, loss carry rules, interest limitations, and other deductible expenses across 7 jurisdictions
        </p>
      </div>

      {/* ── Summary Comparison Table ── */}
      <ComparisonTable title="Deductions & Allowances — Cross-Country Summary" data={rows} />

      {/* ── Depreciation Methods Comparison ── */}
      <div className="bg-white border border-[#E4E7E9] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E4E7E9]">
          <h3 className="text-sm font-bold text-[#0D0E0F]">Depreciation Methods — Key Asset Classes</h3>
          <p className="text-[10px] text-[#5A5E62] mt-0.5">SL = Straight-Line, DB = Declining Balance, DV = Diminishing Value, IBA = Industrial Building Allowance</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="bg-[#0D0E0F] text-white">
                <th className="px-3 py-2 text-left font-semibold">Asset Class</th>
                {COUNTRY_ORDER.map((code) => (
                  <th key={code} className="px-3 py-2 text-center font-semibold whitespace-nowrap">
                    {COUNTRY_FLAGS[code]} {code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {depreciationRows.map((row, i) => (
                <tr key={row.asset} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F1F3F4]'}>
                  <td className="px-3 py-2 font-semibold text-[#0D0E0F] whitespace-nowrap">{row.asset}</td>
                  {COUNTRY_ORDER.map((code) => {
                    const val = row[code];
                    const is100 = val.includes('100%');
                    return (
                      <td key={code} className="px-3 py-2 text-center whitespace-nowrap" style={{ color: is100 ? '#0052C4' : '#0D0E0F' }}>
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── R&D Incentives Comparison ── */}
      <div className="bg-white border border-[#E4E7E9] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E4E7E9]">
          <h3 className="text-sm font-bold text-[#0D0E0F]">R&amp;D Incentive — Effective Benefit Rate Comparison</h3>
          <p className="text-[10px] text-[#5A5E62] mt-0.5">Estimated effective tax benefit per dollar of qualifying R&amp;D expenditure (higher = more generous)</p>
        </div>
        <div className="px-4 py-4 space-y-3">
          {rndBars.map((bar) => (
            <div key={bar.code} className="flex items-center gap-3">
              <div className="w-[76px] flex items-center gap-1.5 shrink-0">
                <span className="text-sm">{COUNTRY_FLAGS[bar.code]}</span>
                <span className="text-[11px] font-semibold text-[#0D0E0F]">{bar.code}</span>
              </div>
              <div className="flex-1 h-7 bg-[#F1F3F4] rounded relative overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-500"
                  style={{
                    width: `${(bar.rate / maxRnd) * 100}%`,
                    backgroundColor: bar.rate >= 35 ? '#0052C4' : bar.rate >= 20 ? '#0066F5' : bar.rate >= 15 ? '#CC8727' : '#DDE1E3',
                  }}
                />
                <span className="absolute inset-y-0 right-2 flex items-center text-[10px] font-mono font-bold text-[#0D0E0F]">
                  {bar.rate}%
                </span>
              </div>
              <div className="w-[160px] shrink-0 hidden lg:block">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#F1F3F4] text-[#6A6F73]">{bar.type}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 pb-3">
          <div className="flex flex-wrap gap-4 text-[9px] text-[#6A6F73]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#0052C4] inline-block" /> &ge;35% benefit</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#0066F5] inline-block" /> 20–34%</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#CC8727] inline-block" /> 15–19%</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#DDE1E3] inline-block" /> &lt;15%</span>
          </div>
        </div>
      </div>

      {/* ── NOL Rules Visual Comparison ── */}
      <div className="bg-white border border-[#E4E7E9] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E4E7E9]">
          <h3 className="text-sm font-bold text-[#0D0E0F]">Net Operating Loss (NOL) Rules Comparison</h3>
          <p className="text-[10px] text-[#5A5E62] mt-0.5">Carry-forward periods, carry-back availability, and annual utilisation limits</p>
        </div>
        <div className="p-4">
          {/* NOL Header Row */}
          <div className="grid grid-cols-[100px_1fr_80px_80px_80px] gap-2 text-[9px] font-bold uppercase tracking-wider text-[#6A6F73] mb-2 px-1">
            <span>Country</span>
            <span>Carry-Forward Period</span>
            <span className="text-center">Carry-Back</span>
            <span className="text-center">Annual Limit</span>
            <span className="text-center">Inflation Adj.</span>
          </div>
          <div className="space-y-2">
            {nolBars.map((bar) => {
              const isIndef = bar.cfYears >= 99;
              const barWidth = isIndef ? 100 : (bar.cfYears / 25) * 100;
              return (
                <div key={bar.code} className="grid grid-cols-[100px_1fr_80px_80px_80px] gap-2 items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{COUNTRY_FLAGS[bar.code]}</span>
                    <span className="text-[11px] font-semibold text-[#0D0E0F]">{COUNTRY_LABELS[bar.code]}</span>
                  </div>
                  <div className="h-4 bg-[#F1F3F4] rounded relative overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${Math.min(barWidth, 100)}%`,
                        backgroundColor: isIndef ? '#0052C4' : bar.cfYears >= 15 ? '#0066F5' : '#CC8727',
                      }}
                    />
                    <span className="absolute inset-y-0 left-2 flex items-center text-[9px] font-mono font-bold text-white mix-blend-difference">
                      {bar.cfLabel}
                    </span>
                  </div>
                  <div className="text-center">
                    {bar.cbYears > 0 ? (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#F0F6FE] text-[#0052C4]">{bar.cbYears}yr</span>
                    ) : (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#FFF3F3] text-[#CC2727]">None</span>
                    )}
                  </div>
                  <div className="text-center">
                    <span
                      className="text-[9px] font-mono px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: bar.limitPct >= 100 ? '#F0F6FE' : bar.limitPct >= 80 ? '#FFFAF3' : '#FFF3F3',
                        color: bar.limitPct >= 100 ? '#0052C4' : bar.limitPct >= 80 ? '#CC8727' : '#CC2727',
                      }}
                    >
                      {bar.limitPct}%
                    </span>
                  </div>
                  <div className="text-center">
                    {bar.code === 'MX' ? (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#F0F6FE] text-[#0052C4]">Yes</span>
                    ) : (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#F1F3F4] text-[#6A6F73]">No</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Country Detail Cards ── */}
      <div>
        <h2 className="text-sm font-semibold text-[#6A6F73] uppercase tracking-wider mb-3">Detailed Country Profiles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {COUNTRY_ORDER.map((code) => (
            <CountryDetailCard key={code} code={code} />
          ))}
        </div>
      </div>

      {/* ── Key Takeaway ── */}
      <div className="bg-[#F0F6FE] border border-[#0052C4]/20 rounded-lg p-5">
        <h4 className="text-xs font-bold text-[#0052C4] uppercase tracking-wider mb-3">Key Takeaways</h4>
        <div className="space-y-2 text-sm text-[#0D0E0F]">
          <p>
            <strong>R&amp;D leadership:</strong> Indonesia (300% super deduction, ~44% effective benefit) and Singapore (EIS 400% enhanced deduction) offer the most generous R&amp;D incentives.
            Canada&apos;s SR&amp;ED at 35% is the highest refundable tax credit among the seven countries. The US 20% regular credit and Mexico&apos;s 30% incremental credit round out the top tier.
          </p>
          <p>
            <strong>Loss utilisation:</strong> Four of seven countries (US, Brazil, Australia, Singapore) allow indefinite NOL carry-forward, though Brazil caps annual use at 30% of taxable income — the most restrictive limit. Mexico inflation-adjusts carried losses, a unique advantage.
          </p>
          <p>
            <strong>Depreciation:</strong> Singapore stands out with 100% first-year write-off for computers and software. The US bonus depreciation is phasing down (60% in 2024, declining 20pp/yr). Canada&apos;s CCA system favours technology assets (Class 50 at 55% DB).
          </p>
          <p>
            <strong>Interest deduction:</strong> The 30% EBITDA cap is the emerging global standard (US, Canada, Mexico, Australia), while Indonesia and Brazil use debt-to-equity ratios (4:1 and 2:1 respectively). Singapore uniquely has no fixed ratio, relying on arm&apos;s length principles.
          </p>
        </div>
      </div>
    </div>
  );
}
