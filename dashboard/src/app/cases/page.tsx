import { COUNTRY_LABELS, COUNTRY_FLAGS } from '@/lib/constants';
import { getProductPrincipalData, getInvestmentCorridorsData, getCountryScores } from '@/lib/data';
import { CountryCode } from '@/lib/types';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function CasesPage() {
  const pp = getProductPrincipalData() as any;
  const corridors = getInvestmentCorridorsData() as any;
  const scores = getCountryScores() as {
    code: CountryCode;
    name: string;
    incorporationScore: number;
    operationsScore: number;
    ipHoldingScore: number;
    investorFriendliness: number;
  }[];

  const architectures = pp.architectures as {
    id: string;
    name: string;
    description: string;
    principal: CountryCode;
    effectiveRate: number;
    lrds: { country: CountryCode; role: string; regime: string }[];
    legalBasis: string[];
  }[];

  const ppRankings = pp.rankings as {
    principal: CountryCode;
    name: string;
    effectiveRate: number;
    totalTax: number;
    afterTaxProfit: number;
    principalCit: number;
    lrdCit: number;
    royaltyWht: number;
    payrollTax: number;
    divWht: number;
    rndTaxSaving: number;
    keyAdvantage: string;
    legalCitation: string;
  }[];

  const topCorridors = corridors.top_corridors as {
    from: string;
    to: string;
    effectiveRate: number;
    net: number;
  }[];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">Case Studies &amp; Scenarios</h1>
        <p className="text-sm text-[#64748b] mt-1">Detailed product principal architectures, corridor examples, and multi-dimensional country scoring</p>
      </div>

      {/* Architecture Case Studies */}
      <div>
        <h2 className="text-sm font-semibold text-[#64748b] uppercase tracking-wider mb-3">Product Principal Architectures</h2>
        <div className="space-y-4">
          {architectures.map((arch) => {
            const ranking = ppRankings.find((r) => r.principal === arch.principal);
            return (
              <div key={arch.id} className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-[#e2e8f0] flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{COUNTRY_FLAGS[arch.principal]}</span>
                      <h3 className="text-base font-bold text-[#0f172a]">{arch.name}</h3>
                    </div>
                    <p className="text-xs text-[#64748b] mt-1">{arch.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xl font-extrabold font-mono text-[#0f766e]">{arch.effectiveRate}%</p>
                      <p className="text-[10px] text-[#64748b] uppercase">Effective Rate</p>
                    </div>
                    {ranking && (
                      <div className="text-center">
                        <p className="text-xl font-extrabold font-mono text-[#0f172a]">${Math.round(ranking.afterTaxProfit).toLocaleString()}</p>
                        <p className="text-[10px] text-[#64748b] uppercase">After-Tax Profit</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Structure Diagram */}
                  <div>
                    <h4 className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-3">Entity Structure</h4>
                    <div className="space-y-2">
                      {/* Principal */}
                      <div className="border-2 border-[#0f766e] rounded-lg p-3 bg-[#ccfbf1]">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{COUNTRY_FLAGS[arch.principal]}</span>
                          <div>
                            <p className="text-xs font-bold text-[#0f766e]">Principal Entity</p>
                            <p className="text-[11px] text-[#0f172a]">{COUNTRY_LABELS[arch.principal]} - IP Owner &amp; Residual Profit</p>
                          </div>
                        </div>
                      </div>
                      {/* Arrow */}
                      <div className="flex justify-center">
                        <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
                          <path d="M10 0v18M4 14l6 6 6-6" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      {/* LRDs */}
                      <div className="grid grid-cols-1 gap-2">
                        {arch.lrds.map((lrd, i) => (
                          <div key={i} className="border border-[#e2e8f0] rounded-lg p-2.5 bg-white">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{COUNTRY_FLAGS[lrd.country]}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-semibold text-[#0f172a]">{lrd.role}</p>
                                <p className="text-[10px] text-[#64748b] truncate" title={lrd.regime}>{lrd.regime}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tax Breakdown */}
                  <div>
                    <h4 className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-3">Tax Breakdown ($5M Revenue)</h4>
                    {ranking ? (
                      <div className="space-y-2">
                        {[
                          { label: 'Principal CIT', value: ranking.principalCit, color: '#0f172a' },
                          { label: 'LRD CIT', value: ranking.lrdCit, color: '#374151' },
                          { label: 'Royalty WHT', value: ranking.royaltyWht, color: '#6b7280' },
                          { label: 'Payroll Tax', value: ranking.payrollTax, color: '#9ca3af' },
                          { label: 'Dividend WHT', value: ranking.divWht, color: '#cbd5e1' },
                        ].map((item) => {
                          const barWidth = Math.min(100, (item.value / (ranking.totalTax || 1)) * 100);
                          return (
                            <div key={item.label} className="flex items-center gap-2">
                              <span className="text-[11px] text-[#64748b] w-24">{item.label}</span>
                              <div className="flex-1 h-4 bg-[#f1f5f9] rounded overflow-hidden">
                                <div className="h-full rounded" style={{ width: `${barWidth}%`, backgroundColor: item.color }} />
                              </div>
                              <span className="text-[11px] font-mono font-semibold text-[#0f172a] w-16 text-right">
                                ${item.value.toLocaleString()}
                              </span>
                            </div>
                          );
                        })}
                        {ranking.rndTaxSaving > 0 && (
                          <div className="flex items-center gap-2 pt-1 border-t border-[#e2e8f0]">
                            <span className="text-[11px] text-[#0f766e] w-24 font-semibold">R&amp;D Saving</span>
                            <div className="flex-1" />
                            <span className="text-[11px] font-mono font-bold text-[#0f766e] w-16 text-right">
                              -${ranking.rndTaxSaving.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-1 border-t-2 border-[#0f172a]">
                          <span className="text-[11px] text-[#0f172a] w-24 font-bold">Total Tax</span>
                          <div className="flex-1" />
                          <span className="text-sm font-mono font-extrabold text-[#0f172a] w-16 text-right">
                            ${ranking.totalTax.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[#64748b]">Detailed breakdown not available</p>
                    )}

                    {/* Legal Basis */}
                    <div className="mt-4">
                      <h4 className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-2">Legal Basis</h4>
                      <div className="flex flex-wrap gap-1">
                        {arch.legalBasis.map((lb) => (
                          <span key={lb} className="text-[9px] font-mono bg-[#dbeafe] text-[#1d4ed8] px-2 py-0.5 rounded">
                            {lb}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Investment Corridor Examples */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e2e8f0]">
          <h3 className="text-sm font-bold text-[#0f172a]">Investment Corridor Examples</h3>
          <p className="text-[10px] text-[#64748b] mt-0.5">Per $100K gross profit repatriation</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-[#0f172a] text-white">
                <th className="px-3 py-2 text-left font-semibold">From</th>
                <th className="px-3 py-2 text-left font-semibold">To</th>
                <th className="px-3 py-2 text-right font-semibold">Eff. Rate</th>
                <th className="px-3 py-2 text-right font-semibold">Net Received</th>
                <th className="px-3 py-2 text-left font-semibold">Rating</th>
              </tr>
            </thead>
            <tbody>
              {topCorridors.map((c, i) => {
                const rating = c.effectiveRate <= 20 ? 'Excellent' : c.effectiveRate <= 28 ? 'Good' : c.effectiveRate <= 32 ? 'Moderate' : 'High';
                const ratingColor = c.effectiveRate <= 20 ? '#0f766e' : c.effectiveRate <= 28 ? '#14b8a6' : c.effectiveRate <= 32 ? '#b45309' : '#b91c1c';
                return (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f1f5f9]'}>
                    <td className="px-3 py-2 font-semibold text-[#0f172a] whitespace-nowrap">{c.from}</td>
                    <td className="px-3 py-2 font-semibold text-[#0f172a] whitespace-nowrap">{c.to}</td>
                    <td className="px-3 py-2 text-right font-mono font-bold">{c.effectiveRate}%</td>
                    <td className="px-3 py-2 text-right font-mono">${c.net.toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <span
                        className="text-[10px] font-bold uppercase px-2 py-0.5 rounded"
                        style={{ backgroundColor: ratingColor + '1a', color: ratingColor }}
                      >
                        {rating}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Country Scores Radar-like Display */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e2e8f0]">
          <h3 className="text-sm font-bold text-[#0f172a]">Multi-Dimensional Country Scoring</h3>
          <p className="text-[10px] text-[#64748b] mt-0.5">Score 0-100 per dimension; higher is better</p>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {scores
            .sort((a, b) => {
              const avgA = (a.incorporationScore + a.operationsScore + a.ipHoldingScore + a.investorFriendliness) / 4;
              const avgB = (b.incorporationScore + b.operationsScore + b.ipHoldingScore + b.investorFriendliness) / 4;
              return avgB - avgA;
            })
            .map((s) => {
              const avg = (s.incorporationScore + s.operationsScore + s.ipHoldingScore + s.investorFriendliness) / 4;
              const dims = [
                { label: 'Incorporation', value: s.incorporationScore },
                { label: 'Operations', value: s.operationsScore },
                { label: 'IP Holding', value: s.ipHoldingScore },
                { label: 'Investor Friendly', value: s.investorFriendliness },
              ];
              return (
                <div key={s.code} className="border border-[#e2e8f0] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{COUNTRY_FLAGS[s.code]}</span>
                      <span className="text-xs font-bold text-[#0f172a]">{s.name}</span>
                    </div>
                    <span className="text-sm font-extrabold font-mono text-[#0f766e]">{avg.toFixed(1)}</span>
                  </div>
                  <div className="space-y-1.5">
                    {dims.map((d) => (
                      <div key={d.label}>
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span className="text-[#64748b]">{d.label}</span>
                          <span className="font-mono font-semibold text-[#0f172a]">{d.value.toFixed(1)}</span>
                        </div>
                        <div className="h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${d.value}%`,
                              backgroundColor: d.value >= 80 ? '#0f766e' : d.value >= 60 ? '#14b8a6' : d.value >= 40 ? '#b45309' : '#b91c1c',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Key Insight */}
      <div className="bg-[#ccfbf1] border border-[#0f766e]/20 rounded-lg p-4">
        <h4 className="text-xs font-bold text-[#0f766e] uppercase tracking-wider mb-2">Strategic Summary</h4>
        <p className="text-sm text-[#0f172a]">
          The Singapore Principal architecture achieves the lowest effective rate at 8.18% by leveraging Pioneer Status
          (5% CIT), 0% dividend WHT, and 400% R&amp;D enhanced deduction. For US-centric businesses, the Dual SG+US
          architecture provides a balanced 10.0% rate with FDII benefits and QSBS exit treatment. Investment corridors
          confirm that Singapore as a destination offers the best net retention at $83K per $100K.
        </p>
      </div>
    </div>
  );
}
