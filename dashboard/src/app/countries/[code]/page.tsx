import { COUNTRY_ORDER, COUNTRY_LABELS, COUNTRY_FLAGS, COUNTRY_CURRENCIES } from '@/lib/constants';
import { getCountryData } from '@/lib/data';
import { getCountrySummary } from '@/lib/transformers';
import { CountryCode } from '@/lib/types';

/* eslint-disable @typescript-eslint/no-explicit-any */

export function generateStaticParams() {
  return COUNTRY_ORDER.map((code) => ({ code }));
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#e2e8f0]">
        <h3 className="text-sm font-bold text-[#0f172a]">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex justify-between py-1.5 border-b border-[#f1f5f9] last:border-0">
      <span className="text-[11px] text-[#64748b] capitalize">{label.replace(/_/g, ' ')}</span>
      <span className="text-[11px] font-semibold text-[#0f172a] font-mono text-right max-w-[55%] truncate">
        {typeof value === 'number' ? (label.includes('rate') || label.includes('pct') ? `${value}%` : value.toLocaleString()) : String(value)}
      </span>
    </div>
  );
}

function renderObject(obj: any, depth = 0): React.ReactNode {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') {
    return <span className="text-[11px] font-semibold text-[#0f172a] font-mono">{String(obj)}</span>;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return <span className="text-[11px] text-[#64748b]">None</span>;
    // If array of primitives
    if (typeof obj[0] !== 'object') {
      return <span className="text-[11px] font-semibold text-[#0f172a]">{obj.join(', ')}</span>;
    }
    // Array of objects - show as rows
    return (
      <div className="space-y-1">
        {obj.slice(0, 10).map((item: any, i: number) => (
          <div key={i} className="pl-2 border-l-2 border-[#e2e8f0]">
            {typeof item === 'object' ? (
              Object.entries(item).slice(0, 5).map(([k, v]) => (
                <DataRow key={k} label={k} value={typeof v === 'object' ? JSON.stringify(v) : v as string | number} />
              ))
            ) : (
              <span className="text-[11px] text-[#0f172a]">{String(item)}</span>
            )}
          </div>
        ))}
      </div>
    );
  }
  // Regular object - show key/value pairs
  const entries = Object.entries(obj);
  if (entries.length === 0) return null;

  // Check if all values are primitives
  const allPrimitive = entries.every(([, v]) => typeof v !== 'object' || v === null);
  if (allPrimitive || depth >= 2) {
    return (
      <div className="space-y-0">
        {entries.slice(0, 15).map(([k, v]) => (
          <DataRow key={k} label={k} value={v === null ? 'N/A' : typeof v === 'object' ? JSON.stringify(v) : v as string | number} />
        ))}
        {entries.length > 15 && <p className="text-[10px] text-[#64748b] italic pt-1">+ {entries.length - 15} more fields</p>}
      </div>
    );
  }

  // Mixed object - separate primitives and nested
  return (
    <div className="space-y-3">
      {entries.slice(0, 12).map(([k, v]) => {
        if (v === null || v === undefined) return <DataRow key={k} label={k} value="N/A" />;
        if (typeof v !== 'object') return <DataRow key={k} label={k} value={v as string | number} />;
        return (
          <div key={k}>
            <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-1 mt-2">{k.replace(/_/g, ' ')}</p>
            {renderObject(v, depth + 1)}
          </div>
        );
      })}
    </div>
  );
}

export default async function CountryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = rawCode as CountryCode;

  if (!COUNTRY_ORDER.includes(code)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-[#64748b]">Country not found: {rawCode}</p>
      </div>
    );
  }

  const data = getCountryData(code) as any;
  const summary = getCountrySummary(code);

  // Main sections to display
  const sections: { key: string; title: string }[] = [
    { key: 'corporate_tax', title: 'Corporate Tax' },
    { key: 'deductions', title: 'Deductions & Allowances' },
    { key: 'international_investors', title: 'International Investors' },
    { key: 'income_by_source', title: 'Income by Source' },
    { key: 'sector_specific_taxes', title: 'Sector-Specific Taxes' },
  ];

  // Also detect indirect taxes key
  const indirectKey = data.vat ? 'vat' : data.gst ? 'gst' : data.vat_equivalent ? 'vat_equivalent' : null;
  if (indirectKey) {
    sections.splice(1, 0, { key: indirectKey, title: indirectKey === 'gst' ? 'GST' : indirectKey === 'vat' ? 'VAT' : 'Sales Tax / VAT Equivalent' });
  }

  // Detect payroll key
  const payrollKey = data.payroll_taxes
    ? 'payroll_taxes'
    : data.employer_contributions
      ? 'employer_contributions'
      : data.payroll_contributions_employer
        ? 'payroll_contributions_employer'
        : data.employer_social_contributions
          ? 'employer_social_contributions'
          : data.payroll_taxes_employer
            ? 'payroll_taxes_employer'
            : null;
  if (payrollKey) {
    const insertAt = indirectKey ? 2 : 1;
    sections.splice(insertAt, 0, { key: payrollKey, title: 'Payroll / Employer Contributions' });
  }

  // WHT
  const whtKey = data.withholding_taxes_nonresident
    ? 'withholding_taxes_nonresident'
    : data.withholding_taxes
      ? 'withholding_taxes'
      : null;
  if (whtKey) {
    sections.splice(sections.findIndex((s) => s.key === 'international_investors'), 0, {
      key: whtKey,
      title: 'Withholding Taxes (Non-Resident)',
    });
  }

  return (
    <div className="space-y-6">
      {/* Country Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{COUNTRY_FLAGS[code]}</span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">{COUNTRY_LABELS[code]}</h1>
            <p className="text-sm text-[#64748b]">{code} &middot; {COUNTRY_CURRENCIES[code]} &middot; Tax Year {data.tax_year}</p>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Corporate Tax', value: `${summary.corporateRate.toFixed(1)}%`, color: '#0f172a' },
          { label: 'VAT / GST', value: `${summary.vatRate.toFixed(1)}%`, color: '#0f172a' },
          { label: 'Employer Payroll', value: `${summary.payrollRate.toFixed(1)}%`, color: '#0f172a' },
          { label: 'Dividend WHT', value: `${summary.dividendWht.toFixed(1)}%`, color: summary.dividendWht === 0 ? '#0f766e' : '#0f172a' },
          { label: 'Tax Treaties', value: String(summary.treatyCount), color: '#0f766e' },
        ].map((m) => (
          <div key={m.label} className="bg-white border border-[#e2e8f0] rounded-lg p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b] mb-1">{m.label}</p>
            <p className="text-2xl font-extrabold tracking-tight font-mono" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Data Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sections.map((section) => {
          const sectionData = data[section.key];
          if (!sectionData || (typeof sectionData === 'object' && Object.keys(sectionData).length === 0)) return null;
          return (
            <SectionCard key={section.key} title={section.title}>
              {renderObject(sectionData)}
            </SectionCard>
          );
        })}
      </div>

      {/* Pass-through tax if available */}
      {data.pass_through_tax && (
        <SectionCard title="Pass-Through Tax / Individual Rates">
          {renderObject(data.pass_through_tax)}
        </SectionCard>
      )}
    </div>
  );
}
