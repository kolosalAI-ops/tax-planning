import { COUNTRY_ORDER } from '@/lib/constants';
import { getKpiData } from '@/lib/transformers';
import MetricCard from '@/components/cards/MetricCard';
import CountryCard from '@/components/cards/CountryCard';
import CorporateTaxRatesChart from '@/components/charts/CorporateTaxRatesChart';
import VatGstChart from '@/components/charts/VatGstChart';
import PayrollBurdenChart from '@/components/charts/PayrollBurdenChart';
import TaxBurdenRadar from '@/components/charts/TaxBurdenRadar';
import ComparisonTable from '@/components/cards/ComparisonTable';
import { getComprehensiveSummary } from '@/lib/transformers';

export default function HomePage() {
  const kpis = getKpiData();
  const summaryData = getComprehensiveSummary();

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
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Countries</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {COUNTRY_ORDER.map((code) => (
            <CountryCard key={code} code={code} />
          ))}
        </div>
      </div>

      {/* Overview Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CorporateTaxRatesChart />
        <VatGstChart />
      </div>

      <PayrollBurdenChart />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaxBurdenRadar />
        <div>
          <ComparisonTable title="Comprehensive Tax Summary" data={summaryData} />
        </div>
      </div>
    </div>
  );
}
