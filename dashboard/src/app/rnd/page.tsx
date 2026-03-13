/* eslint-disable @typescript-eslint/no-explicit-any */
import rndData from '@/data/rnd_incentives.json';

/* ---------------------------------------------------------------------------
   Types & helpers
--------------------------------------------------------------------------- */
interface RndCountry {
  code: string;
  country: string;
  headline_incentive: string;
  credit_type: string;
  effective_benefit_per_1m_usd: number;
  patent_box: boolean;
  patent_box_rate_pct?: number | null;
  refundable: boolean;
  legal_basis: string;
  notes: string;
}

function getAllCountries(): RndCountry[] {
  const countries = (rndData as any).countries as Record<string, any>;
  return Object.entries(countries)
    .map(([code, data]) => ({
      code,
      country: data.country,
      headline_incentive: data.headline_incentive,
      credit_type: data.credit_type ?? 'unknown',
      effective_benefit_per_1m_usd: data.effective_benefit_per_1m_usd ?? 0,
      patent_box: data.patent_box ?? false,
      patent_box_rate_pct: data.patent_box_rate_pct ?? data.patent_box_effective_rate_pct ?? null,
      refundable: data.refundable ?? false,
      legal_basis: data.legal_basis ?? '',
      notes: data.notes ?? '',
    }))
    .sort((a, b) => b.effective_benefit_per_1m_usd - a.effective_benefit_per_1m_usd);
}

function formatCreditType(type: string): string {
  const map: Record<string, string> = {
    tax_credit: 'Tax Credit',
    enhanced_deduction: 'Deduction',
    above_the_line_credit: 'ATL Credit',
    wage_tax_reduction: 'Wage Tax',
    tax_offset: 'Tax Offset',
    grant_and_reduced_rate: 'Grant + IP',
    tax_credit_or_deduction: 'Credit/Ded.',
    tax_credit_and_deduction: 'Credit+Ded.',
    deduction: 'Deduction',
    deduction_and_holiday: 'Ded.+Holiday',
    payroll_tax_reduction: 'Payroll Red.',
    none_specific: 'None',
  };
  return map[type] ?? type;
}

function barColor(benefit: number): string {
  if (benefit >= 250000) return '#0052C4';
  if (benefit >= 100000) return '#4D94E8';
  if (benefit >= 50000) return '#CC8727';
  if (benefit > 0) return '#DDE1E3';
  return '#CC2727';
}

function tagColor(type: string): string {
  if (type.includes('credit') || type === 'tax_offset' || type === 'above_the_line_credit') return 'bg-[#F0F6FE] text-[#0052C4] border-[#0052C4]/20';
  if (type.includes('deduction') || type === 'enhanced_deduction') return 'bg-[#FFFAF3] text-[#CC8727] border-[#CC8727]/20';
  if (type.includes('wage') || type.includes('payroll')) return 'bg-[#F1F3F4] text-[#3C3E40] border-[#DDE1E3]';
  if (type.includes('grant')) return 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/20';
  if (type === 'none_specific') return 'bg-[#FFF3F3] text-[#CC2727] border-[#CC2727]/20';
  return 'bg-[#F1F3F4] text-[#6A6F73] border-[#DDE1E3]';
}

/* ---------------------------------------------------------------------------
   Region groupings
--------------------------------------------------------------------------- */
const REGIONS: Record<string, { name: string; codes: string[] }> = {
  americas: {
    name: 'Americas',
    codes: ['US', 'CA', 'BR', 'MX', 'AR', 'CL', 'CO'],
  },
  europe: {
    name: 'Europe',
    codes: ['GB', 'DE', 'FR', 'NL', 'IE', 'BE', 'CH', 'AT', 'SE', 'DK', 'NO', 'FI', 'ES', 'IT', 'PT', 'PL', 'CZ', 'HU', 'TR'],
  },
  asiaPacific: {
    name: 'Asia-Pacific',
    codes: ['SG', 'AU', 'ID', 'JP', 'KR', 'CN', 'IN', 'TW', 'TH', 'VN', 'MY', 'NZ', 'PH'],
  },
  meAfrica: {
    name: 'ME & Africa',
    codes: ['AE', 'SA', 'IL', 'ZA', 'KE', 'NG'],
  },
};

/* ---------------------------------------------------------------------------
   Page component
--------------------------------------------------------------------------- */
export default function RndPage() {
  const allCountries = getAllCountries();
  const maxBenefit = allCountries[0]?.effective_benefit_per_1m_usd ?? 350000;

  const patentBoxCountries = allCountries.filter((c) => c.patent_box);
  const refundableCountries = allCountries.filter((c) => c.refundable);
  const benefits = allCountries.map((c) => c.effective_benefit_per_1m_usd).filter((b) => b > 0);
  const medianBenefit = benefits.sort((a, b) => a - b)[Math.floor(benefits.length / 2)] ?? 0;

  // Mechanism distribution
  const mechanismGroups: Record<string, RndCountry[]> = {};
  for (const c of allCountries) {
    const type = formatCreditType(c.credit_type);
    if (!mechanismGroups[type]) mechanismGroups[type] = [];
    mechanismGroups[type].push(c);
  }

  // Regional stats
  const regionStats = Object.entries(REGIONS).map(([key, region]) => {
    const regionCountries = allCountries.filter((c) => region.codes.includes(c.code));
    const avgBenefit = regionCountries.length
      ? regionCountries.reduce((sum, c) => sum + c.effective_benefit_per_1m_usd, 0) / regionCountries.length
      : 0;
    const topCountry = regionCountries[0];
    return { key, ...region, count: regionCountries.length, avgBenefit, topCountry };
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0D0E0F]">R&amp;D Tax Incentives</h1>
        <p className="text-sm text-[#6A6F73] mt-1">
          45-country comparative analysis — tax credits, enhanced deductions, patent boxes &amp; grants
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { value: '45', label: 'Countries Covered' },
          { value: `$${(maxBenefit / 1000).toFixed(0)}K`, label: `Highest Benefit (${allCountries[0]?.code})` },
          { value: `$${(medianBenefit / 1000).toFixed(0)}K`, label: 'Median Benefit' },
          { value: String(patentBoxCountries.length), label: 'Patent Box Countries' },
          { value: String(refundableCountries.length), label: 'Refundable Credits' },
          { value: '4', label: 'Mechanism Types' },
        ].map((m) => (
          <div key={m.label} className="bg-white border border-[#E4E7E9] rounded-lg p-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#0052C4]" />
            <p className="text-xl font-extrabold font-mono text-[#0D0E0F]">{m.value}</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-[#6A6F73] mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Effective Benefit Ranking — Full 45-Country Bar Chart */}
      <div className="bg-white border border-[#E4E7E9] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E4E7E9]">
          <h3 className="text-sm font-bold text-[#0D0E0F]">Effective Benefit per $1M R&amp;D Spend — All 45 Countries</h3>
          <p className="text-[10px] text-[#6A6F73] mt-0.5">Tax saved per $1M of qualifying R&amp;D expenditure at statutory CIT rate. Sorted by benefit descending.</p>
        </div>
        <div className="p-4 space-y-1">
          {allCountries.map((c) => {
            const pct = maxBenefit > 0 ? (c.effective_benefit_per_1m_usd / maxBenefit) * 100 : 0;
            return (
              <div key={c.code} className="flex items-center gap-2">
                <div className="w-24 text-right text-[10px] font-semibold text-[#3C3E40] truncate">{c.country}</div>
                <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${tagColor(c.credit_type)} w-16 text-center truncate`}>
                  {formatCreditType(c.credit_type)}
                </span>
                <div className="flex-1 h-5 bg-[#F1F3F4] rounded overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{ width: `${Math.max(pct, 0.5)}%`, backgroundColor: barColor(c.effective_benefit_per_1m_usd) }}
                  />
                </div>
                <span className="text-[11px] font-mono font-bold text-[#0D0E0F] w-14 text-right">
                  {c.effective_benefit_per_1m_usd > 0 ? `$${(c.effective_benefit_per_1m_usd / 1000).toFixed(0)}K` : '$0'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Regional Breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-[#6A6F73] uppercase tracking-wider mb-3">Regional Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {regionStats.map((r) => (
            <div key={r.key} className="bg-white border border-[#E4E7E9] rounded-lg p-4 border-l-[3px] border-l-[#0052C4]">
              <h3 className="text-xs font-bold text-[#0D0E0F]">{r.name}</h3>
              <p className="text-[10px] text-[#6A6F73] mb-3">{r.count} countries</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <p className="text-lg font-extrabold font-mono text-[#0052C4]">
                    ${(r.avgBenefit / 1000).toFixed(0)}K
                  </p>
                  <p className="text-[8px] font-bold uppercase text-[#6A6F73]">Avg Benefit</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold font-mono text-[#0D0E0F]">
                    {r.topCountry ? `$${(r.topCountry.effective_benefit_per_1m_usd / 1000).toFixed(0)}K` : '—'}
                  </p>
                  <p className="text-[8px] font-bold uppercase text-[#6A6F73]">
                    Top ({r.topCountry?.code ?? '—'})
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {r.codes.slice(0, 6).map((code) => (
                  <span key={code} className="text-[9px] font-mono font-semibold text-[#6A6F73] bg-[#F1F3F4] px-1.5 py-0.5 rounded">
                    {code}
                  </span>
                ))}
                {r.codes.length > 6 && (
                  <span className="text-[9px] font-mono text-[#6A6F73]">+{r.codes.length - 6}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mechanism Distribution */}
      <div className="bg-white border border-[#E4E7E9] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E4E7E9]">
          <h3 className="text-sm font-bold text-[#0D0E0F]">Mechanism Distribution</h3>
          <p className="text-[10px] text-[#6A6F73] mt-0.5">How countries deliver R&amp;D tax benefits</p>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(mechanismGroups)
            .sort((a, b) => b[1].length - a[1].length)
            .map(([type, countries]) => (
              <div key={type} className="border border-[#E4E7E9] rounded-lg p-3 border-l-[3px] border-l-[#0052C4]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[#0D0E0F]">{type}</h4>
                  <span className="text-[10px] font-mono font-bold text-[#0052C4]">{countries.length}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {countries.map((c) => (
                    <span key={c.code} className="text-[9px] font-mono font-semibold text-[#3C3E40] bg-[#F1F3F4] px-1.5 py-0.5 rounded">
                      {c.code}
                    </span>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Patent Box Comparison */}
      <div className="bg-white border border-[#E4E7E9] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E4E7E9]">
          <h3 className="text-sm font-bold text-[#0D0E0F]">Patent Box / IP Regimes — {patentBoxCountries.length} Countries</h3>
          <p className="text-[10px] text-[#6A6F73] mt-0.5">Preferential tax rates on income from qualifying intellectual property</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#0D0E0F]">
                <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">Country</th>
                <th className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">IP Box Rate</th>
                <th className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">Eff. Benefit / $1M</th>
                <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">Notes</th>
              </tr>
            </thead>
            <tbody>
              {patentBoxCountries
                .sort((a, b) => (a.patent_box_rate_pct ?? 99) - (b.patent_box_rate_pct ?? 99))
                .map((c, i) => (
                  <tr key={c.code} className={`border-b border-[#F1F3F4] ${i < 3 ? 'bg-[#F0F6FE]' : ''}`}>
                    <td className="px-3 py-2 text-[11px] font-semibold text-[#0D0E0F]">{c.country}</td>
                    <td className="px-3 py-2 text-[11px] font-mono font-bold text-[#0052C4] text-right">
                      {c.patent_box_rate_pct != null ? `${c.patent_box_rate_pct}%` : '—'}
                    </td>
                    <td className="px-3 py-2 text-[11px] font-mono text-right">
                      ${(c.effective_benefit_per_1m_usd / 1000).toFixed(0)}K
                    </td>
                    <td className="px-3 py-2 text-[10px] text-[#6A6F73] max-w-xs truncate">{c.notes}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refundability Matrix */}
      <div className="bg-white border border-[#E4E7E9] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E4E7E9]">
          <h3 className="text-sm font-bold text-[#0D0E0F]">Refundable R&amp;D Credits — {refundableCountries.length} Countries</h3>
          <p className="text-[10px] text-[#6A6F73] mt-0.5">Jurisdictions that provide cash refunds for R&amp;D investment, even without tax liability</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#0D0E0F]">
                <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">Country</th>
                <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">Mechanism</th>
                <th className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">Eff. Benefit / $1M</th>
                <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">Notes</th>
              </tr>
            </thead>
            <tbody>
              {refundableCountries.map((c, i) => (
                <tr key={c.code} className={`border-b border-[#F1F3F4] ${i % 2 === 0 ? '' : 'bg-[#F8F9F9]'}`}>
                  <td className="px-3 py-2 text-[11px] font-semibold text-[#0D0E0F]">{c.country}</td>
                  <td className="px-3 py-2 text-[10px] text-[#3C3E40]">{c.headline_incentive}</td>
                  <td className="px-3 py-2 text-[11px] font-mono font-bold text-[#0052C4] text-right">
                    ${(c.effective_benefit_per_1m_usd / 1000).toFixed(0)}K
                  </td>
                  <td className="px-3 py-2 text-[10px] text-[#6A6F73] max-w-xs truncate">{c.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full 45-Country Detail Table */}
      <div className="bg-white border border-[#E4E7E9] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E4E7E9]">
          <h3 className="text-sm font-bold text-[#0D0E0F]">Complete 45-Country Reference</h3>
          <p className="text-[10px] text-[#6A6F73] mt-0.5">Full data for all covered jurisdictions — headline incentive, mechanism, benefit, and legal basis</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#0D0E0F]">
                <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">Country</th>
                <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">Headline Incentive</th>
                <th className="px-3 py-2 text-center text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">Type</th>
                <th className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">Eff. / $1M</th>
                <th className="px-3 py-2 text-center text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">Patent Box</th>
                <th className="px-3 py-2 text-center text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">Refundable</th>
                <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">Legal Basis</th>
              </tr>
            </thead>
            <tbody>
              {allCountries.map((c, i) => (
                <tr key={c.code} className={`border-b border-[#F1F3F4] ${i % 2 === 0 ? '' : 'bg-[#F8F9F9]'}`}>
                  <td className="px-3 py-2 text-[11px] font-semibold text-[#0D0E0F] whitespace-nowrap">
                    <span className="font-mono text-[10px] text-[#6A6F73] mr-1.5">{c.code}</span>
                    {c.country}
                  </td>
                  <td className="px-3 py-2 text-[10px] text-[#3C3E40] max-w-[200px] truncate">{c.headline_incentive}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${tagColor(c.credit_type)}`}>
                      {formatCreditType(c.credit_type)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-[11px] font-mono font-bold text-right" style={{ color: barColor(c.effective_benefit_per_1m_usd) }}>
                    {c.effective_benefit_per_1m_usd > 0 ? `$${(c.effective_benefit_per_1m_usd / 1000).toFixed(0)}K` : '$0'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {c.patent_box ? (
                      <span className="text-[10px] font-bold text-[#0052C4]">
                        {c.patent_box_rate_pct != null ? `${c.patent_box_rate_pct}%` : 'Yes'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#DDE1E3]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {c.refundable ? (
                      <span className="text-[10px] font-bold text-[#2E7D32]">Yes</span>
                    ) : (
                      <span className="text-[10px] text-[#DDE1E3]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-[9px] font-mono text-[#6A6F73] max-w-[150px] truncate">{c.legal_basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insight */}
      <div className="bg-[#F0F6FE] border border-[#0052C4]/20 rounded-lg p-4">
        <h4 className="text-xs font-bold text-[#0052C4] uppercase tracking-wider mb-2">Strategic Insight</h4>
        <p className="text-sm text-[#0D0E0F]">
          Chile ($350K) and Portugal ($325K) offer the highest effective R&amp;D benefits per $1M spend, yet are often
          overlooked in favour of better-known regimes. For pre-revenue startups, Canada (35% refundable) and Australia
          (43.5% refundable) provide unmatched cash flow support. Patent box jurisdictions like Belgium (3.75%) and
          Ireland (6.25%) deliver the best long-term value for IP-monetising companies. The optimal multinational
          structure combines refundable credits (R&amp;D location), enhanced deductions (operating subsidiaries), and
          patent boxes (IP holding) across 2-3 jurisdictions.
        </p>
      </div>
    </div>
  );
}
