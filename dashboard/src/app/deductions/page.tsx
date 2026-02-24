import allData from '@/lib/data';
import { COUNTRY_ORDER, COUNTRY_LABELS, COUNTRY_FLAGS } from '@/lib/constants';
import { CountryCode } from '@/lib/types';
import { TableRow } from '@/lib/types';
import ComparisonTable from '@/components/cards/ComparisonTable';

/* eslint-disable @typescript-eslint/no-explicit-any */

function getDeductionDetail(code: CountryCode, key: string): string {
  const d = allData[code] as any;
  const ded = d.deductions;
  if (!ded) return 'N/A';

  if (key === 'depreciation') {
    const dep = ded.depreciation;
    if (!dep) return 'N/A';
    if (dep.bonus_depreciation !== undefined) return `Bonus ${dep.bonus_depreciation}%`;
    if (dep.methods) return Array.isArray(dep.methods) ? dep.methods.join(', ') : String(dep.methods);
    if (dep.capital_allowances) return 'Capital Allowances';
    return 'Available';
  }

  if (key === 'nol') {
    const nol = ded.nol;
    if (!nol) return 'N/A';
    const parts: string[] = [];
    if (nol.carry_forward_years !== undefined) {
      parts.push(`CF: ${nol.carry_forward_years >= 25 ? 'Indefinite' : nol.carry_forward_years + 'yr'}`);
    }
    if (nol.carry_back_years !== undefined) {
      parts.push(`CB: ${nol.carry_back_years}yr`);
    }
    if (nol.annual_limit_pct !== undefined) {
      parts.push(`Limit: ${nol.annual_limit_pct}%`);
    }
    return parts.length ? parts.join(', ') : 'Available';
  }

  if (key === 'interest') {
    const int = ded.interest_limitation ?? ded.thin_capitalization;
    if (!int) return 'N/A';
    if (int.ebitda_limit_pct !== undefined) return `${int.ebitda_limit_pct}% EBITDA`;
    if (int.dti_ratio !== undefined) return `DTI ${int.dti_ratio}:1`;
    if (int.ratio !== undefined) return `DTE ${int.ratio}:1`;
    return 'Limited';
  }

  if (key === 'rnd') {
    const rnd = ded.rnd ?? ded.rnd_super_deduction;
    if (!rnd) return 'N/A';
    if (rnd.credit_rate_pct !== undefined) return `${rnd.credit_rate_pct}% credit`;
    if (rnd.deduction_rate_pct !== undefined) return `${rnd.deduction_rate_pct}% deduction`;
    if (rnd.super_deduction_pct !== undefined) return `${rnd.super_deduction_pct}% super ded.`;
    if (rnd.enhanced_deduction_pct !== undefined) return `${rnd.enhanced_deduction_pct}% enhanced`;
    return 'Available';
  }

  if (key === 'charitable') {
    const ch = ded.charitable;
    if (!ch) return 'N/A';
    if (ch.limit_pct_taxable_income !== undefined) return `Up to ${ch.limit_pct_taxable_income}%`;
    if (ch.limit_pct !== undefined) return `Up to ${ch.limit_pct}%`;
    return 'Available';
  }

  return 'N/A';
}

function CountryDeductionCard({ code }: { code: CountryCode }) {
  const d = allData[code] as any;
  const ded = d.deductions;
  if (!ded) {
    return (
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{COUNTRY_FLAGS[code]}</span>
          <h3 className="text-sm font-bold text-[#0f172a]">{COUNTRY_LABELS[code]}</h3>
        </div>
        <p className="text-xs text-[#64748b]">Deduction data not available</p>
      </div>
    );
  }

  const items = Object.keys(ded).map((key) => {
    const val = ded[key];
    let display: string;
    if (val === null || val === undefined) {
      display = 'N/A';
    } else if (typeof val === 'number') {
      display = String(val) + (key.includes('pct') || key.includes('rate') ? '%' : '');
    } else if (typeof val === 'string') {
      display = val;
    } else if (typeof val === 'object') {
      display = Object.entries(val)
        .slice(0, 3)
        .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${typeof v === 'number' ? v : String(v)}`)
        .join('; ');
    } else {
      display = String(val);
    }
    return { key: key.replace(/_/g, ' '), display };
  });

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#e2e8f0] flex items-center gap-2">
        <span className="text-lg">{COUNTRY_FLAGS[code]}</span>
        <h3 className="text-sm font-bold text-[#0f172a]">{COUNTRY_LABELS[code]}</h3>
        <span className="text-[10px] font-mono text-[#64748b] ml-auto">{d.tax_year}</span>
      </div>
      <div className="divide-y divide-[#e2e8f0]">
        {items.map((item) => (
          <div key={item.key} className="px-4 py-2 flex justify-between gap-4">
            <span className="text-[11px] text-[#64748b] capitalize whitespace-nowrap">{item.key}</span>
            <span className="text-[11px] font-semibold text-[#0f172a] text-right truncate max-w-[60%]" title={item.display}>
              {item.display.length > 80 ? item.display.slice(0, 77) + '...' : item.display}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DeductionsPage() {
  // Build comparison table
  const rows: TableRow[] = [];
  const categories = ['depreciation', 'nol', 'interest', 'rnd', 'charitable'];
  const categoryLabels: Record<string, string> = {
    depreciation: 'Depreciation / Cap. Allow.',
    nol: 'Net Operating Losses',
    interest: 'Interest Limitation',
    rnd: 'R&D Incentive',
    charitable: 'Charitable Deduction',
  };

  for (const cat of categories) {
    const row: TableRow = { metric: categoryLabels[cat] };
    for (const code of COUNTRY_ORDER) {
      row[COUNTRY_LABELS[code]] = getDeductionDetail(code, cat);
    }
    rows.push(row);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">Deductions &amp; Allowances</h1>
        <p className="text-sm text-[#64748b] mt-1">Comparative analysis of deductible expenses, loss carry rules, and R&amp;D incentives</p>
      </div>

      {/* Summary Comparison Table */}
      <ComparisonTable title="Deductions Summary" data={rows} />

      {/* Per-country detail cards */}
      <div>
        <h2 className="text-sm font-semibold text-[#64748b] uppercase tracking-wider mb-3">Country Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {COUNTRY_ORDER.map((code) => (
            <CountryDeductionCard key={code} code={code} />
          ))}
        </div>
      </div>

      {/* Key Insight */}
      <div className="bg-[#ccfbf1] border border-[#0f766e]/20 rounded-lg p-4">
        <h4 className="text-xs font-bold text-[#0f766e] uppercase tracking-wider mb-2">Key Takeaway</h4>
        <p className="text-sm text-[#0f172a]">
          Most jurisdictions offer indefinite or long-term net operating loss carry-forward. The US provides 100% bonus
          depreciation (phasing down) and 20% R&amp;D credit. Canada&apos;s SR&amp;ED program offers up to 35% refundable
          investment tax credit. Indonesia provides a 300% super deduction for qualifying R&amp;D activities. Interest
          deductions are universally capped, most commonly at 30% of EBITDA or through debt-to-equity ratios.
        </p>
      </div>
    </div>
  );
}
