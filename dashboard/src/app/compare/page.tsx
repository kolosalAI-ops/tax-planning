import { COUNTRY_ORDER, COUNTRY_LABELS, COUNTRY_FLAGS } from '@/lib/constants';
import { getComprehensiveSummary, getCountrySummary } from '@/lib/transformers';
import { getCountryScores } from '@/lib/data';
import ComparisonTable from '@/components/cards/ComparisonTable';
import { CountryCode, TableRow } from '@/lib/types';

function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            backgroundColor: pct >= 80 ? '#0f766e' : pct >= 60 ? '#14b8a6' : pct >= 40 ? '#b45309' : '#b91c1c',
          }}
        />
      </div>
      <span className="text-[11px] font-mono font-semibold text-[#0f172a] w-10 text-right">{value.toFixed(1)}</span>
    </div>
  );
}

export default function ComparePage() {
  const summaryData = getComprehensiveSummary();
  const scores = getCountryScores() as {
    code: CountryCode;
    name: string;
    incorporationScore: number;
    operationsScore: number;
    ipHoldingScore: number;
    investorFriendliness: number;
  }[];

  // Build additional comparison rows
  const additionalRows: TableRow[] = [];

  const currencyRow: TableRow = { metric: 'Currency' };
  const yearRow: TableRow = { metric: 'Tax Year' };
  for (const code of COUNTRY_ORDER) {
    const summary = getCountrySummary(code);
    const label = COUNTRY_LABELS[code];
    currencyRow[label] = ({ US: 'USD', ID: 'IDR', CA: 'CAD', BR: 'BRL', MX: 'MXN', AU: 'AUD', SG: 'SGD' } as Record<CountryCode, string>)[code];
    yearRow[label] = '2024/2025';
    void summary;
  }
  additionalRows.push(currencyRow, yearRow);

  const allRows = [...additionalRows, ...summaryData];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">Cross-Country Comparison</h1>
        <p className="text-sm text-[#64748b] mt-1">Side-by-side tax analysis across all 7 Tier 1 jurisdictions</p>
      </div>

      {/* Country Quick Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {COUNTRY_ORDER.map((code) => {
          const s = getCountrySummary(code);
          return (
            <div key={code} className="bg-white border border-[#e2e8f0] rounded-lg p-3 text-center">
              <span className="text-2xl">{COUNTRY_FLAGS[code]}</span>
              <p className="text-xs font-bold text-[#0f172a] mt-1">{COUNTRY_LABELS[code]}</p>
              <p className="text-lg font-extrabold text-[#0f766e] font-mono mt-1">{s.corporateRate.toFixed(1)}%</p>
              <p className="text-[10px] text-[#64748b] uppercase tracking-wider">CIT Rate</p>
            </div>
          );
        })}
      </div>

      {/* Main Comparison Table */}
      <ComparisonTable title="Comprehensive Tax Comparison" data={allRows} />

      {/* Country Scores */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e2e8f0]">
          <h3 className="text-sm font-bold text-[#0f172a]">Country Tax Scores (0-100)</h3>
          <p className="text-[11px] text-[#64748b] mt-0.5">Higher is better across four dimensions of tax competitiveness</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-[#0f172a] text-white">
                <th className="px-3 py-2 text-left font-semibold">Country</th>
                <th className="px-3 py-2 text-left font-semibold">Incorporation</th>
                <th className="px-3 py-2 text-left font-semibold">Operations</th>
                <th className="px-3 py-2 text-left font-semibold">IP Holding</th>
                <th className="px-3 py-2 text-left font-semibold">Investor Friendly</th>
                <th className="px-3 py-2 text-right font-semibold">Average</th>
              </tr>
            </thead>
            <tbody>
              {scores
                .sort((a, b) => {
                  const avgA = (a.incorporationScore + a.operationsScore + a.ipHoldingScore + a.investorFriendliness) / 4;
                  const avgB = (b.incorporationScore + b.operationsScore + b.ipHoldingScore + b.investorFriendliness) / 4;
                  return avgB - avgA;
                })
                .map((s, i) => {
                  const avg = (s.incorporationScore + s.operationsScore + s.ipHoldingScore + s.investorFriendliness) / 4;
                  return (
                    <tr key={s.code} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f1f5f9]'}>
                      <td className="px-3 py-2 font-semibold text-[#0f172a] whitespace-nowrap">
                        {COUNTRY_FLAGS[s.code]} {s.name}
                      </td>
                      <td className="px-3 py-2 w-40"><ScoreBar value={s.incorporationScore} /></td>
                      <td className="px-3 py-2 w-40"><ScoreBar value={s.operationsScore} /></td>
                      <td className="px-3 py-2 w-40"><ScoreBar value={s.ipHoldingScore} /></td>
                      <td className="px-3 py-2 w-40"><ScoreBar value={s.investorFriendliness} /></td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-[#0f766e]">{avg.toFixed(1)}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend / Notes */}
      <div className="bg-[#ccfbf1] border border-[#0f766e]/20 rounded-lg p-4">
        <h4 className="text-xs font-bold text-[#0f766e] uppercase tracking-wider mb-2">Key Takeaway</h4>
        <p className="text-sm text-[#0f172a]">
          Singapore leads across all four dimensions, with a perfect 100 in incorporation, operations, and IP holding.
          The US and Indonesia also rank highly for incorporation and operations respectively. Brazil and Mexico are
          competitive for specific use cases such as Simples Nacional or the border zone incentive.
        </p>
      </div>
    </div>
  );
}
