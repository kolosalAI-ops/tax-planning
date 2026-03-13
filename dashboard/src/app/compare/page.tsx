import Link from 'next/link';
import { COUNTRY_ORDER, COUNTRY_LABELS, COUNTRY_FLAGS } from '@/lib/constants';
import { getComprehensiveSummary, getCountrySummary } from '@/lib/transformers';
import { getCountryScores } from '@/lib/data';
import ComparisonTable from '@/components/cards/ComparisonTable';
import { CountryCode, TableRow } from '@/lib/types';

function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-[#F1F3F4] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            backgroundColor: pct >= 80 ? '#0052C4' : pct >= 60 ? '#0066F5' : pct >= 40 ? '#CC8727' : '#CC2727',
          }}
        />
      </div>
      <span className="text-[11px] font-mono font-semibold text-[#0D0E0F] w-10 text-right">{value.toFixed(1)}</span>
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
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0D0E0F]">Cross-Country Comparison</h1>
        <p className="text-sm text-[#6A6F73] mt-1">Side-by-side tax analysis across all 7 Tier 1 jurisdictions</p>
      </div>

      {/* Country Quick Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {COUNTRY_ORDER.map((code) => {
          const s = getCountrySummary(code);
          return (
            <Link key={code} href={`/countries/${code}`} className="block bg-white border border-[#E4E7E9] rounded-lg p-3 text-center hover:shadow-md hover:border-[#0052C4]/30 transition-all group">
              <span className="text-2xl">{COUNTRY_FLAGS[code]}</span>
              <p className="text-xs font-bold text-[#0D0E0F] mt-1 group-hover:text-[#0052C4] transition-colors">{COUNTRY_LABELS[code]}</p>
              <p className="text-lg font-extrabold text-[#0052C4] font-mono mt-1">{s.corporateRate.toFixed(1)}%</p>
              <p className="text-[10px] text-[#6A6F73] uppercase tracking-wider">CIT Rate</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#0052C4] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Details →</p>
            </Link>
          );
        })}
      </div>

      {/* Main Comparison Table */}
      <ComparisonTable title="Comprehensive Tax Comparison" data={allRows} />

      {/* Country Scores */}
      <div className="bg-white border border-[#E4E7E9] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E4E7E9]">
          <h3 className="text-sm font-bold text-[#0D0E0F]">Country Tax Scores (0-100)</h3>
          <p className="text-[11px] text-[#6A6F73] mt-0.5">Higher is better across four dimensions of tax competitiveness</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-[#0D0E0F] text-white">
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
                    <tr key={s.code} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F1F3F4]'}>
                      <td className="px-3 py-2 font-semibold text-[#0D0E0F] whitespace-nowrap">
                        {COUNTRY_FLAGS[s.code]} {s.name}
                      </td>
                      <td className="px-3 py-2 w-40"><ScoreBar value={s.incorporationScore} /></td>
                      <td className="px-3 py-2 w-40"><ScoreBar value={s.operationsScore} /></td>
                      <td className="px-3 py-2 w-40"><ScoreBar value={s.ipHoldingScore} /></td>
                      <td className="px-3 py-2 w-40"><ScoreBar value={s.investorFriendliness} /></td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-[#0052C4]">{avg.toFixed(1)}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend / Notes */}
      <div className="bg-[#F0F6FE] border border-[#0052C4]/20 rounded-lg p-4">
        <h4 className="text-xs font-bold text-[#0052C4] uppercase tracking-wider mb-2">Key Takeaway</h4>
        <p className="text-sm text-[#0D0E0F]">
          Singapore leads across all four dimensions, with a perfect 100 in incorporation, operations, and IP holding.
          The US and Indonesia also rank highly for incorporation and operations respectively. Brazil and Mexico are
          competitive for specific use cases such as Simples Nacional or the border zone incentive.
        </p>
      </div>
    </div>
  );
}
