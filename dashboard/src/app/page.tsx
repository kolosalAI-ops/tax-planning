import Link from 'next/link';
import { COUNTRY_ORDER, COUNTRY_LABELS, COUNTRY_FLAGS, COUNTRY_CURRENCIES } from '@/lib/constants';
import { getKpiData, getCountrySummary } from '@/lib/transformers';
import MetricCard from '@/components/cards/MetricCard';
import CountryCard from '@/components/cards/CountryCard';
import CorporateTaxRatesChart from '@/components/charts/CorporateTaxRatesChart';
import VatGstChart from '@/components/charts/VatGstChart';
import PayrollBurdenChart from '@/components/charts/PayrollBurdenChart';
import TaxBurdenRadar from '@/components/charts/TaxBurdenRadar';
import EffectiveTaxChart from '@/components/charts/EffectiveTaxChart';
import ComparisonTable from '@/components/cards/ComparisonTable';
import { getComprehensiveSummary } from '@/lib/transformers';
import { getCountryScores } from '@/lib/data';
import { CountryCode } from '@/lib/types';

export default function HomePage() {
  const kpis = getKpiData();
  const summaryData = getComprehensiveSummary();
  const scores = getCountryScores() as {
    code: CountryCode;
    name: string;
    incorporationScore: number;
    operationsScore: number;
    ipHoldingScore: number;
    investorFriendliness: number;
  }[];

  // Compute best country per dimension
  const bestIncorp = scores.reduce((a, b) => a.incorporationScore > b.incorporationScore ? a : b);
  const bestOps = scores.reduce((a, b) => a.operationsScore > b.operationsScore ? a : b);
  const bestIp = scores.reduce((a, b) => a.ipHoldingScore > b.ipHoldingScore ? a : b);
  const bestInvestor = scores.reduce((a, b) => a.investorFriendliness > b.investorFriendliness ? a : b);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi) => (
          <MetricCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Country Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#6A6F73] uppercase tracking-wider">Countries</h2>
          <Link href="/compare" className="text-[10px] font-bold uppercase tracking-wider text-[#0052C4] hover:underline">
            Compare All →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {COUNTRY_ORDER.map((code) => (
            <CountryCard key={code} code={code} />
          ))}
        </div>
      </div>

      {/* Quick Wins - Best Countries by Dimension */}
      <div className="bg-white border border-[#E4E7E9] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E4E7E9]">
          <h3 className="text-sm font-bold text-[#0D0E0F]">Top Jurisdictions by Use Case</h3>
          <p className="text-[10px] text-[#6A6F73] mt-0.5">Based on multi-dimensional tax competitiveness scoring (0-100)</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#E4E7E9]">
          {[
            { label: 'Incorporation', country: bestIncorp, score: bestIncorp.incorporationScore, desc: 'Company formation, startup incentives, admin burden' },
            { label: 'Operations', country: bestOps, score: bestOps.operationsScore, desc: 'Payroll costs, CIT rate, deductions, R&D incentives' },
            { label: 'IP Holding', country: bestIp, score: bestIp.ipHoldingScore, desc: 'Patent box, royalty WHT, IP amortisation, treaties' },
            { label: 'Investor Friendly', country: bestInvestor, score: bestInvestor.investorFriendliness, desc: 'Dividend WHT, CGT, repatriation, FX controls' },
          ].map((dim) => (
            <Link key={dim.label} href={`/countries/${dim.country.code}`} className="p-4 hover:bg-[#F8F9F9] transition-colors group">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6A6F73] mb-2">{dim.label}</p>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{COUNTRY_FLAGS[dim.country.code]}</span>
                <div>
                  <p className="text-sm font-bold text-[#0D0E0F] group-hover:text-[#0052C4] transition-colors">{dim.country.name}</p>
                  <p className="text-lg font-extrabold font-mono text-[#0052C4]">{dim.score.toFixed(0)}</p>
                </div>
              </div>
              <p className="text-[10px] text-[#6A6F73] leading-tight">{dim.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Overview Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CorporateTaxRatesChart />
        <VatGstChart />
      </div>

      <PayrollBurdenChart />

      <EffectiveTaxChart />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaxBurdenRadar />
        <div>
          <ComparisonTable title="Comprehensive Tax Summary" data={summaryData} />
        </div>
      </div>

      {/* WHT Snapshot */}
      <div className="bg-white border border-[#E4E7E9] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E4E7E9]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0D0E0F]">Dividend WHT & Net Retention</h3>
            <Link href="/investors" className="text-[10px] font-bold uppercase tracking-wider text-[#0052C4] hover:underline">
              Full Analysis →
            </Link>
          </div>
          <p className="text-[10px] text-[#6A6F73] mt-0.5">Net amount an investor receives per $100K of pre-tax corporate profit</p>
        </div>
        <div className="p-4 space-y-2">
          {COUNTRY_ORDER.map((code) => {
            const s = getCountrySummary(code);
            const combined = s.corporateRate + s.dividendWht * (1 - s.corporateRate / 100);
            const net = Math.round(100000 * (1 - combined / 100));
            const barWidth = Math.min(100, (net / 90000) * 100);
            return (
              <div key={code} className="flex items-center gap-3">
                <div className="w-28 flex items-center gap-1.5">
                  <span className="text-sm">{COUNTRY_FLAGS[code]}</span>
                  <span className="text-[11px] font-semibold text-[#0D0E0F]">{COUNTRY_LABELS[code]}</span>
                </div>
                <div className="flex-1 h-5 bg-[#F1F3F4] rounded overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: net >= 80000 ? '#0052C4' : net >= 70000 ? '#0066F5' : net >= 60000 ? '#CC8727' : '#CC2727',
                    }}
                  />
                </div>
                <span className="text-[11px] font-mono font-bold text-[#0D0E0F] w-16 text-right">${net.toLocaleString()}</span>
                <span className="text-[10px] font-mono text-[#6A6F73] w-12 text-right">{combined.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { href: '/deductions', label: 'Deductions', desc: 'R&D incentives, depreciation, NOL rules', icon: '📋' },
          { href: '/investors', label: 'Investors', desc: 'WHT rates, corridors, repatriation', icon: '🌍' },
          { href: '/rnd', label: 'R&D Incentives', desc: '45-country R&D credits, deductions, patent boxes', icon: '🔬' },
          { href: '/treaty', label: 'Treaty & WHT', desc: 'Treaty heatmaps, optimal corridors', icon: '🤝' },
          { href: '/pipeline', label: 'Optimization', desc: 'B2B structures, product principal models', icon: '⚡' },
          { href: '/cases', label: 'Case Studies', desc: 'Architecture breakdowns, tax scoring', icon: '📊' },
        ].map((nav) => (
          <Link key={nav.href} href={nav.href} className="bg-white border border-[#E4E7E9] rounded-lg p-4 hover:shadow-md hover:border-[#0052C4]/30 transition-all group">
            <span className="text-xl">{nav.icon}</span>
            <p className="text-sm font-bold text-[#0D0E0F] mt-2 group-hover:text-[#0052C4] transition-colors">{nav.label}</p>
            <p className="text-[11px] text-[#6A6F73] mt-1">{nav.desc}</p>
          </Link>
        ))}
      </div>

      {/* Key Insight */}
      <div className="bg-[#F0F6FE] border border-[#0052C4]/20 rounded-lg p-4">
        <h4 className="text-xs font-bold text-[#0052C4] uppercase tracking-wider mb-2">Strategic Overview</h4>
        <p className="text-sm text-[#0D0E0F]">
          Across the 7 Tier 1 jurisdictions, Singapore consistently leads with the lowest effective combined rate
          (17% CIT + 0% dividend WHT), strongest treaty network (90 treaties), and most competitive IP holding regime.
          For B2B SaaS startups, the US offers the best domestic-only rate through QSBS exclusion and R&amp;D credits.
          Indonesia provides the most generous R&amp;D super deduction at 300% for university partnerships. Brazil&apos;s
          Simples Nacional regime offers the lowest entry-level rates for small businesses.
        </p>
      </div>
    </div>
  );
}
