import { COUNTRY_LABELS, COUNTRY_FLAGS } from '@/lib/constants';
import { getB2BStartupData, getProductPrincipalData } from '@/lib/data';
import { CountryCode } from '@/lib/types';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function PipelinePage() {
  const b2b = getB2BStartupData() as any;
  const pp = getProductPrincipalData() as any;

  const topStructures = b2b.top_structures as {
    incorp: CountryCode;
    ops: CountryCode;
    ipHold: CountryCode;
    investor: CountryCode;
    effectiveRate: number;
    totalAnnualTax: number;
    netToInvestor: number;
  }[];

  const singleRanking = b2b.single_entity_ranking as {
    country: CountryCode;
    effectiveRate: number;
    smeRate: number;
    payrollRate: number;
    regime: string;
  }[];

  const revSensitivity = b2b.revenue_sensitivity as {
    revenue: number;
    label: string;
    US: number;
    SG: number;
    ID: number;
    CA: number;
    BR: number;
    MX: number;
    AU: number;
    best: string;
  }[];

  const ppRankings = pp.rankings as {
    principal: CountryCode;
    name: string;
    effectiveRate: number;
    totalTax: number;
    afterTaxProfit: number;
    keyAdvantage: string;
    legalCitation: string;
  }[];

  const ppArchitectures = pp.architectures as {
    id: string;
    name: string;
    description: string;
    principal: CountryCode;
    effectiveRate: number;
    lrds: { country: CountryCode; role: string; regime: string }[];
    legalBasis: string[];
  }[];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">Tax Optimization Pipeline</h1>
        <p className="text-sm text-[#64748b] mt-1">B2B startup structures, product principal models, and revenue sensitivity analysis</p>
      </div>

      {/* Scenario */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Annual Revenue', value: '$500K', sub: 'B2B SaaS' },
          { label: 'Profit Margin', value: '15%', sub: 'Gross profit' },
          { label: 'R&D Spend', value: '15%', sub: 'Of revenue' },
          { label: 'Structures Evaluated', value: '2,401', sub: '7^4 combinations' },
        ].map((m) => (
          <div key={m.label} className="bg-white border border-[#e2e8f0] rounded-lg p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b] mb-1">{m.label}</p>
            <p className="text-2xl font-extrabold tracking-tight text-[#0f172a]">{m.value}</p>
            <p className="text-xs text-[#64748b] mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Top 10 Structures */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e2e8f0]">
          <h3 className="text-sm font-bold text-[#0f172a]">Top 10 Structures (Lowest Effective Rate)</h3>
          <p className="text-[10px] text-[#64748b] mt-0.5">Incorp / Ops / IP Hold / Investor</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-[#0f172a] text-white">
                <th className="px-3 py-2 text-left font-semibold">#</th>
                <th className="px-3 py-2 text-left font-semibold">Incorp</th>
                <th className="px-3 py-2 text-left font-semibold">Ops</th>
                <th className="px-3 py-2 text-left font-semibold">IP Hold</th>
                <th className="px-3 py-2 text-left font-semibold">Investor</th>
                <th className="px-3 py-2 text-right font-semibold">Eff. Rate</th>
                <th className="px-3 py-2 text-right font-semibold">Annual Tax</th>
                <th className="px-3 py-2 text-right font-semibold">Net to Investor</th>
              </tr>
            </thead>
            <tbody>
              {topStructures.map((s, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f1f5f9]'}>
                  <td className="px-3 py-2 font-mono font-bold text-[#0f766e]">{i + 1}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{COUNTRY_FLAGS[s.incorp]} {s.incorp}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{COUNTRY_FLAGS[s.ops]} {s.ops}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{COUNTRY_FLAGS[s.ipHold]} {s.ipHold}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{COUNTRY_FLAGS[s.investor]} {s.investor}</td>
                  <td className="px-3 py-2 text-right font-mono font-bold">{s.effectiveRate}%</td>
                  <td className="px-3 py-2 text-right font-mono">${s.totalAnnualTax.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-mono">${s.netToInvestor.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Entity Ranking */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e2e8f0]">
          <h3 className="text-sm font-bold text-[#0f172a]">Single Entity Ranking</h3>
          <p className="text-[10px] text-[#64748b] mt-0.5">Domestic-only structures ranked by total effective rate</p>
        </div>
        <div className="p-4 space-y-2">
          {singleRanking.map((r, i) => {
            const barWidth = Math.min(100, (r.effectiveRate / 40) * 100);
            return (
              <div key={r.country} className="flex items-center gap-3">
                <span className="w-5 text-[11px] font-mono font-bold text-[#0f766e]">{i + 1}</span>
                <div className="w-28 flex items-center gap-1.5">
                  <span className="text-sm">{COUNTRY_FLAGS[r.country]}</span>
                  <span className="text-[11px] font-semibold text-[#0f172a]">{COUNTRY_LABELS[r.country]}</span>
                </div>
                <div className="flex-1 h-6 bg-[#f1f5f9] rounded overflow-hidden relative">
                  <div
                    className="h-full rounded flex items-center pl-2"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: r.effectiveRate <= 10 ? '#0f766e' : r.effectiveRate <= 20 ? '#14b8a6' : r.effectiveRate <= 30 ? '#b45309' : '#b91c1c',
                    }}
                  >
                    <span className="text-[10px] font-mono font-bold text-white">{r.effectiveRate}%</span>
                  </div>
                </div>
                <span className="text-[10px] text-[#64748b] w-48 truncate hidden lg:block" title={r.regime}>{r.regime}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revenue Sensitivity */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e2e8f0]">
          <h3 className="text-sm font-bold text-[#0f172a]">Revenue Sensitivity Analysis</h3>
          <p className="text-[10px] text-[#64748b] mt-0.5">Effective tax rate (%) by revenue level and country</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-[#0f172a] text-white">
                <th className="px-3 py-2 text-left font-semibold">Revenue</th>
                <th className="px-3 py-2 text-right font-semibold">US</th>
                <th className="px-3 py-2 text-right font-semibold">CA</th>
                <th className="px-3 py-2 text-right font-semibold">SG</th>
                <th className="px-3 py-2 text-right font-semibold">ID</th>
                <th className="px-3 py-2 text-right font-semibold">AU</th>
                <th className="px-3 py-2 text-right font-semibold">MX</th>
                <th className="px-3 py-2 text-right font-semibold">BR</th>
                <th className="px-3 py-2 text-left font-semibold">Best</th>
              </tr>
            </thead>
            <tbody>
              {revSensitivity.map((r, i) => (
                <tr key={r.label} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f1f5f9]'}>
                  <td className="px-3 py-2 font-semibold text-[#0f172a] whitespace-nowrap">{r.label}</td>
                  {(['US', 'CA', 'SG', 'ID', 'AU', 'MX', 'BR'] as const).map((code) => {
                    const val = r[code];
                    const isBest = r.best === code;
                    return (
                      <td key={code} className={`px-3 py-2 text-right font-mono ${isBest ? 'font-bold text-[#0f766e]' : 'text-[#0f172a]'}`}>
                        {val.toFixed(1)}%
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-[#0f766e] font-bold whitespace-nowrap">
                    {COUNTRY_FLAGS[r.best as CountryCode]} {r.best}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Principal Rankings */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e2e8f0]">
          <h3 className="text-sm font-bold text-[#0f172a]">Product Principal Rankings</h3>
          <p className="text-[10px] text-[#64748b] mt-0.5">$5M global revenue, 35% operating margin, 20% R&amp;D spend</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-[#0f172a] text-white">
                <th className="px-3 py-2 text-left font-semibold">#</th>
                <th className="px-3 py-2 text-left font-semibold">Principal</th>
                <th className="px-3 py-2 text-right font-semibold">Eff. Rate</th>
                <th className="px-3 py-2 text-right font-semibold">Total Tax</th>
                <th className="px-3 py-2 text-right font-semibold">After-Tax Profit</th>
                <th className="px-3 py-2 text-left font-semibold">Key Advantage</th>
              </tr>
            </thead>
            <tbody>
              {ppRankings.map((r, i) => (
                <tr key={r.principal} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f1f5f9]'}>
                  <td className="px-3 py-2 font-mono font-bold text-[#0f766e]">{i + 1}</td>
                  <td className="px-3 py-2 font-semibold text-[#0f172a] whitespace-nowrap">
                    {COUNTRY_FLAGS[r.principal]} {r.name}
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-bold">{r.effectiveRate}%</td>
                  <td className="px-3 py-2 text-right font-mono">${r.totalTax.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-mono">${r.afterTaxProfit.toLocaleString()}</td>
                  <td className="px-3 py-2 text-[#64748b] max-w-xs truncate" title={r.keyAdvantage}>{r.keyAdvantage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Architectures Preview */}
      <div>
        <h2 className="text-sm font-semibold text-[#64748b] uppercase tracking-wider mb-3">Architectures</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ppArchitectures.map((arch) => (
            <div key={arch.id} className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#e2e8f0] bg-[#f1f5f9]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#0f172a]">{arch.name}</h4>
                  <span className="text-xs font-mono font-bold text-[#0f766e]">{arch.effectiveRate}%</span>
                </div>
                <p className="text-[10px] text-[#64748b] mt-1">{arch.description}</p>
              </div>
              <div className="p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-[#0f766e] font-bold">Principal:</span>
                  <span>{COUNTRY_FLAGS[arch.principal]} {COUNTRY_LABELS[arch.principal]}</span>
                </div>
                {arch.lrds.map((lrd, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-[#64748b]">
                    <span>{COUNTRY_FLAGS[lrd.country]}</span>
                    <span className="font-semibold text-[#0f172a]">{lrd.role}</span>
                    <span className="truncate" title={lrd.regime}>- {lrd.regime}</span>
                  </div>
                ))}
              </div>
              <div className="px-3 pb-3">
                <div className="flex flex-wrap gap-1">
                  {arch.legalBasis.map((lb) => (
                    <span key={lb} className="text-[9px] font-mono bg-[#f1f5f9] text-[#64748b] px-1.5 py-0.5 rounded">
                      {lb}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
