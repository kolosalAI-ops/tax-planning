import { COUNTRY_ORDER, COUNTRY_LABELS, COUNTRY_FLAGS } from '@/lib/constants';
import { getInvestmentCorridorsData, getB2BStartupData } from '@/lib/data';
import { getCountrySummary } from '@/lib/transformers';
import { CountryCode } from '@/lib/types';

export default function InvestorsPage() {
  const corridors = getInvestmentCorridorsData() as {
    top_corridors: { from: string; to: string; effectiveRate: number; net: number }[];
  };
  const b2b = getB2BStartupData() as {
    best_per_investor: Record<string, { structure: string; effectiveRate: number }>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">International Investors</h1>
        <p className="text-sm text-[#64748b] mt-1">Investment corridors, withholding tax rates, and optimal structures by investor domicile</p>
      </div>

      {/* WHT Comparison */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e2e8f0]">
          <h3 className="text-sm font-bold text-[#0f172a]">Withholding Tax Rates &amp; Treaty Networks</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-[#0f172a] text-white">
                <th className="px-3 py-2 text-left font-semibold">Country</th>
                <th className="px-3 py-2 text-right font-semibold">Dividend WHT</th>
                <th className="px-3 py-2 text-right font-semibold">Corporate Tax</th>
                <th className="px-3 py-2 text-right font-semibold">Combined Rate</th>
                <th className="px-3 py-2 text-right font-semibold">Tax Treaties</th>
                <th className="px-3 py-2 text-right font-semibold">Net per $100K</th>
              </tr>
            </thead>
            <tbody>
              {COUNTRY_ORDER.map((code, i) => {
                const s = getCountrySummary(code);
                const combined = s.corporateRate + s.dividendWht * (1 - s.corporateRate / 100);
                const netPer100k = Math.round(100000 * (1 - combined / 100));
                return (
                  <tr key={code} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f1f5f9]'}>
                    <td className="px-3 py-2 font-semibold text-[#0f172a] whitespace-nowrap">
                      {COUNTRY_FLAGS[code]} {COUNTRY_LABELS[code]}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{s.dividendWht.toFixed(1)}%</td>
                    <td className="px-3 py-2 text-right font-mono">{s.corporateRate.toFixed(1)}%</td>
                    <td className="px-3 py-2 text-right font-mono font-semibold">{combined.toFixed(1)}%</td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-[#0f766e]">{s.treatyCount}</td>
                    <td className="px-3 py-2 text-right font-mono font-semibold">${netPer100k.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Investment Corridors */}
        <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e2e8f0]">
            <h3 className="text-sm font-bold text-[#0f172a]">Top Investment Corridors</h3>
            <p className="text-[10px] text-[#64748b] mt-0.5">Ranked by effective tax rate on repatriated profits (per $100K gross)</p>
          </div>
          <div className="p-4 space-y-2">
            {corridors.top_corridors.map((c, i) => {
              const barWidth = Math.min(100, (c.effectiveRate / 40) * 100);
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-24 text-[11px] font-semibold text-[#0f172a] whitespace-nowrap truncate">
                    {c.from} → {c.to}
                  </div>
                  <div className="flex-1 h-5 bg-[#f1f5f9] rounded overflow-hidden relative">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: c.effectiveRate <= 20 ? '#0f766e' : c.effectiveRate <= 30 ? '#b45309' : '#b91c1c',
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#0f172a] w-12 text-right">{c.effectiveRate}%</span>
                  <span className="text-[10px] font-mono text-[#64748b] w-16 text-right">${c.net.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Best Structure Per Investor */}
        <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e2e8f0]">
            <h3 className="text-sm font-bold text-[#0f172a]">Optimal Structure by Investor Country</h3>
            <p className="text-[10px] text-[#64748b] mt-0.5">B2B startup scenario ($500K revenue, 15% margin)</p>
          </div>
          <div className="p-4 space-y-2">
            {Object.entries(b2b.best_per_investor).map(([code, info]) => (
              <div key={code} className="flex items-center justify-between p-2 rounded-lg border border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{COUNTRY_FLAGS[code as CountryCode]}</span>
                  <div>
                    <p className="text-xs font-bold text-[#0f172a]">{COUNTRY_LABELS[code as CountryCode]} Investor</p>
                    <p className="text-[10px] font-mono text-[#64748b]">{info.structure}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold font-mono text-[#0f766e]">{info.effectiveRate}%</p>
                  <p className="text-[10px] text-[#64748b]">effective rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Insight */}
      <div className="bg-[#ccfbf1] border border-[#0f766e]/20 rounded-lg p-4">
        <h4 className="text-xs font-bold text-[#0f766e] uppercase tracking-wider mb-2">Key Insight</h4>
        <p className="text-sm text-[#0f172a]">
          Singapore offers the lowest effective corridor rate at 17% for any investor origin due to its 0% dividend WHT
          and extensive treaty network. For US-based investors, a domestic US structure achieves 7.80% effective rate
          through QSBS and R&amp;D credits. Brazilian investors benefit from 0% outbound dividend WHT under Lei 9.249/1995.
        </p>
      </div>
    </div>
  );
}
