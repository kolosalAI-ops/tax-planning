/* eslint-disable @typescript-eslint/no-explicit-any */
import allData from '@/lib/data';
import { COUNTRY_ORDER, COUNTRY_LABELS, COUNTRY_FLAGS } from '@/lib/constants';
import { CountryCode } from '@/lib/types';

/* ---------------------------------------------------------------------------
   Helper: dig into WHT data for a given country
--------------------------------------------------------------------------- */
function getWht(code: CountryCode): { dividends: number; interest: number; royalties: number } {
  const d = allData[code] as any;
  const wht = d.withholding_taxes_nonresident ?? d.withholding_taxes?.pph_26_nonresident;
  if (!wht) return { dividends: 0, interest: 0, royalties: 0 };
  const div = wht.dividends;
  const int = wht.interest;
  const roy = wht.royalties;
  return {
    dividends: typeof div === 'number' ? div : (div?.default ?? div?.standard ?? 0),
    interest: typeof int === 'number' ? int : (int?.default ?? int?.standard ?? 0),
    royalties: typeof roy === 'number' ? roy : (roy?.default ?? roy?.standard ?? 0),
  };
}

/* ---------------------------------------------------------------------------
   Treaty rate lookup — simplified for 7×7 grid
   Uses treaty rates where available, falls back to domestic WHT rates
--------------------------------------------------------------------------- */
function getTreatyRates(): {
  dividends: Record<string, Record<string, number>>;
  interest: Record<string, Record<string, number>>;
  royalties: Record<string, Record<string, number>>;
} {
  // Build domestic baseline rates
  const domesticRates: Record<CountryCode, { dividends: number; interest: number; royalties: number }> = {} as any;
  for (const code of COUNTRY_ORDER) {
    domesticRates[code] = getWht(code);
  }

  // Treaty rates between countries (curated from actual treaties)
  // Format: treatyRates[from][to] = rate. "from" = source country paying, "to" = recipient
  const treatyDiv: Record<string, Record<string, number>> = {};
  const treatyInt: Record<string, Record<string, number>> = {};
  const treatyRoy: Record<string, Record<string, number>> = {};

  for (const from of COUNTRY_ORDER) {
    treatyDiv[from] = {};
    treatyInt[from] = {};
    treatyRoy[from] = {};
    for (const to of COUNTRY_ORDER) {
      if (from === to) {
        treatyDiv[from][to] = 0;
        treatyInt[from][to] = 0;
        treatyRoy[from][to] = 0;
      } else {
        treatyDiv[from][to] = domesticRates[from].dividends;
        treatyInt[from][to] = domesticRates[from].interest;
        treatyRoy[from][to] = domesticRates[from].royalties;
      }
    }
  }

  // Override with known treaty rates
  // US treaties
  treatyDiv['US']['CA'] = 15; treatyDiv['US']['AU'] = 15; treatyDiv['US']['SG'] = 15;
  treatyDiv['US']['BR'] = 15; treatyDiv['US']['MX'] = 10; treatyDiv['US']['ID'] = 15;
  treatyInt['US']['CA'] = 0;  treatyInt['US']['AU'] = 10; treatyInt['US']['SG'] = 0;
  treatyInt['US']['MX'] = 10; treatyInt['US']['ID'] = 10;
  treatyRoy['US']['CA'] = 0;  treatyRoy['US']['AU'] = 5;  treatyRoy['US']['SG'] = 0;
  treatyRoy['US']['MX'] = 10; treatyRoy['US']['ID'] = 10;
  // CA treaties
  treatyDiv['CA']['US'] = 15; treatyDiv['CA']['AU'] = 15; treatyDiv['CA']['SG'] = 15;
  treatyDiv['CA']['BR'] = 15; treatyDiv['CA']['MX'] = 15; treatyDiv['CA']['ID'] = 15;
  treatyInt['CA']['US'] = 0;  treatyInt['CA']['AU'] = 10; treatyInt['CA']['SG'] = 15;
  treatyRoy['CA']['US'] = 0;  treatyRoy['CA']['AU'] = 10; treatyRoy['CA']['SG'] = 15;
  // SG treaties (0% domestic WHT on dividends)
  treatyDiv['SG']['US'] = 0;  treatyDiv['SG']['CA'] = 0;  treatyDiv['SG']['AU'] = 0;
  treatyDiv['SG']['BR'] = 0;  treatyDiv['SG']['MX'] = 0;  treatyDiv['SG']['ID'] = 0;
  treatyInt['SG']['US'] = 0;  treatyInt['SG']['AU'] = 10;
  treatyRoy['SG']['US'] = 0;  treatyRoy['SG']['AU'] = 10;
  // AU treaties
  treatyDiv['AU']['US'] = 15; treatyDiv['AU']['CA'] = 15; treatyDiv['AU']['SG'] = 15;
  treatyDiv['AU']['ID'] = 15; treatyDiv['AU']['MX'] = 15;
  treatyInt['AU']['US'] = 10; treatyInt['AU']['SG'] = 10; treatyInt['AU']['ID'] = 10;
  treatyRoy['AU']['US'] = 5;  treatyRoy['AU']['SG'] = 10; treatyRoy['AU']['ID'] = 10;
  // ID treaties
  treatyDiv['ID']['US'] = 15; treatyDiv['ID']['CA'] = 15; treatyDiv['ID']['SG'] = 10;
  treatyDiv['ID']['AU'] = 15; treatyDiv['ID']['MX'] = 20;
  treatyInt['ID']['US'] = 10; treatyInt['ID']['SG'] = 10; treatyInt['ID']['AU'] = 10;
  treatyRoy['ID']['US'] = 10; treatyRoy['ID']['SG'] = 15; treatyRoy['ID']['AU'] = 10;
  // BR treaties
  treatyDiv['BR']['US'] = 15; treatyDiv['BR']['CA'] = 15;
  treatyInt['BR']['US'] = 15; treatyInt['BR']['CA'] = 15;
  treatyRoy['BR']['CA'] = 15;
  // MX treaties
  treatyDiv['MX']['US'] = 10; treatyDiv['MX']['CA'] = 15; treatyDiv['MX']['SG'] = 0;
  treatyInt['MX']['US'] = 10; treatyRoy['MX']['US'] = 10;

  return { dividends: treatyDiv, interest: treatyInt, royalties: treatyRoy };
}

/* ---------------------------------------------------------------------------
   Cell colour helper
--------------------------------------------------------------------------- */
function cellBg(rate: number, isSelf: boolean): string {
  if (isSelf) return 'bg-[#0D0E0F] text-[#6A6F73]';
  if (rate === 0) return 'bg-[#E8F5E9] text-[#2E7D32] font-bold';
  if (rate <= 5) return 'bg-[#F0F6FE] text-[#0052C4] font-bold';
  if (rate <= 10) return 'bg-[#FFFAF3] text-[#CC8727] font-semibold';
  if (rate <= 15) return 'bg-white text-[#3C3E40]';
  return 'bg-[#FFF3F3] text-[#CC2727] font-semibold';
}

/* ---------------------------------------------------------------------------
   Heatmap table component
--------------------------------------------------------------------------- */
function HeatmapTable({
  title,
  subtitle,
  data,
}: {
  title: string;
  subtitle: string;
  data: Record<string, Record<string, number>>;
}) {
  return (
    <div className="bg-white border border-[#E4E7E9] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E4E7E9]">
        <h3 className="text-sm font-bold text-[#0D0E0F]">{title}</h3>
        <p className="text-[10px] text-[#6A6F73] mt-0.5">{subtitle}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-center">
          <thead>
            <tr className="bg-[#0D0E0F]">
              <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">
                From ↓ / To →
              </th>
              {COUNTRY_ORDER.map((to) => (
                <th key={to} className="px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">
                  <span className="text-base mr-1">{COUNTRY_FLAGS[to]}</span>
                  <br />{to}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COUNTRY_ORDER.map((from) => (
              <tr key={from} className="border-b border-[#F1F3F4] hover:bg-[#F8F9F9]">
                <td className="px-3 py-2 text-left text-[11px] font-semibold text-[#0D0E0F]">
                  <span className="text-base mr-1.5">{COUNTRY_FLAGS[from]}</span>
                  {COUNTRY_LABELS[from]}
                </td>
                {COUNTRY_ORDER.map((to) => {
                  const rate = data[from]?.[to] ?? 0;
                  const isSelf = from === to;
                  return (
                    <td key={to} className={`px-3 py-2 text-[11px] font-mono ${cellBg(rate, isSelf)}`}>
                      {isSelf ? '—' : `${rate}%`}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Page
--------------------------------------------------------------------------- */
export default function TreatyPage() {
  const treatyRates = getTreatyRates();

  // Compute summary stats
  const allDivRates: number[] = [];
  const allRoyRates: number[] = [];
  for (const from of COUNTRY_ORDER) {
    for (const to of COUNTRY_ORDER) {
      if (from !== to) {
        allDivRates.push(treatyRates.dividends[from]?.[to] ?? 0);
        allRoyRates.push(treatyRates.royalties[from]?.[to] ?? 0);
      }
    }
  }
  const avgDiv = allDivRates.reduce((a, b) => a + b, 0) / allDivRates.length;
  const minDiv = Math.min(...allDivRates);
  const maxDiv = Math.max(...allDivRates);
  const zeroDiv = allDivRates.filter((r) => r === 0).length;
  const avgRoy = allRoyRates.reduce((a, b) => a + b, 0) / allRoyRates.length;

  // Find best corridors (lowest combined WHT)
  const corridors: { from: CountryCode; to: CountryCode; div: number; int: number; roy: number; total: number }[] = [];
  for (const from of COUNTRY_ORDER) {
    for (const to of COUNTRY_ORDER) {
      if (from !== to) {
        const div = treatyRates.dividends[from]?.[to] ?? 0;
        const int = treatyRates.interest[from]?.[to] ?? 0;
        const roy = treatyRates.royalties[from]?.[to] ?? 0;
        corridors.push({ from, to, div, int, roy, total: div + int + roy });
      }
    }
  }
  corridors.sort((a, b) => a.total - b.total);
  const bestCorridors = corridors.slice(0, 10);
  const worstCorridors = corridors.slice(-5).reverse();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0D0E0F]">Treaty &amp; WHT Analysis</h1>
        <p className="text-sm text-[#6A6F73] mt-1">
          Withholding tax rates across 7 Tier 1 jurisdictions — domestic and treaty rates
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { value: `${avgDiv.toFixed(1)}%`, label: 'Avg Dividend WHT' },
          { value: `${minDiv}%`, label: 'Lowest Dividend WHT' },
          { value: `${maxDiv}%`, label: 'Highest Dividend WHT' },
          { value: String(zeroDiv), label: 'Zero-Rate Corridors' },
          { value: `${avgRoy.toFixed(1)}%`, label: 'Avg Royalty WHT' },
          { value: '42', label: 'Treaty Pairs' },
        ].map((m) => (
          <div key={m.label} className="bg-white border border-[#E4E7E9] rounded-lg p-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#0052C4]" />
            <p className="text-xl font-extrabold font-mono text-[#0D0E0F]">{m.value}</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-[#6A6F73] mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Heatmaps */}
      <HeatmapTable
        title="Dividend Withholding Tax Rates"
        subtitle="Treaty-reduced rates on dividend payments between jurisdictions. Lower = better for repatriation."
        data={treatyRates.dividends}
      />

      <HeatmapTable
        title="Interest Withholding Tax Rates"
        subtitle="Treaty-reduced rates on intercompany interest payments. Critical for debt-funded structures."
        data={treatyRates.interest}
      />

      <HeatmapTable
        title="Royalty Withholding Tax Rates"
        subtitle="Treaty-reduced rates on royalty/licensing payments. Key for IP-based structures."
        data={treatyRates.royalties}
      />

      {/* Best & Worst Corridors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Best corridors */}
        <div className="bg-white border border-[#E4E7E9] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E4E7E9]">
            <h3 className="text-sm font-bold text-[#0D0E0F]">Most Tax-Efficient Corridors</h3>
            <p className="text-[10px] text-[#6A6F73] mt-0.5">Lowest combined WHT (Div + Int + Roy)</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-[#0D0E0F]">
                <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">From</th>
                <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">To</th>
                <th className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">Div</th>
                <th className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">Int</th>
                <th className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">Roy</th>
                <th className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">Total</th>
              </tr>
            </thead>
            <tbody>
              {bestCorridors.map((c, i) => (
                <tr key={`${c.from}-${c.to}`} className={`border-b border-[#F1F3F4] ${i < 3 ? 'bg-[#F0F6FE]' : ''}`}>
                  <td className="px-3 py-2 text-[11px]">
                    <span className="mr-1">{COUNTRY_FLAGS[c.from]}</span>{c.from}
                  </td>
                  <td className="px-3 py-2 text-[11px]">
                    <span className="mr-1">{COUNTRY_FLAGS[c.to]}</span>{c.to}
                  </td>
                  <td className="px-3 py-2 text-[11px] font-mono text-right">{c.div}%</td>
                  <td className="px-3 py-2 text-[11px] font-mono text-right">{c.int}%</td>
                  <td className="px-3 py-2 text-[11px] font-mono text-right">{c.roy}%</td>
                  <td className="px-3 py-2 text-[11px] font-mono font-bold text-[#0052C4] text-right">{c.total}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Worst corridors */}
        <div className="bg-white border border-[#E4E7E9] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E4E7E9]">
            <h3 className="text-sm font-bold text-[#0D0E0F]">Highest WHT Corridors</h3>
            <p className="text-[10px] text-[#6A6F73] mt-0.5">Corridors with highest combined withholding burden</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-[#0D0E0F]">
                <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">From</th>
                <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">To</th>
                <th className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">Div</th>
                <th className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">Int</th>
                <th className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">Roy</th>
                <th className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider text-[#DDE1E3]">Total</th>
              </tr>
            </thead>
            <tbody>
              {worstCorridors.map((c) => (
                <tr key={`${c.from}-${c.to}`} className="border-b border-[#F1F3F4]">
                  <td className="px-3 py-2 text-[11px]">
                    <span className="mr-1">{COUNTRY_FLAGS[c.from]}</span>{c.from}
                  </td>
                  <td className="px-3 py-2 text-[11px]">
                    <span className="mr-1">{COUNTRY_FLAGS[c.to]}</span>{c.to}
                  </td>
                  <td className="px-3 py-2 text-[11px] font-mono text-right">{c.div}%</td>
                  <td className="px-3 py-2 text-[11px] font-mono text-right">{c.int}%</td>
                  <td className="px-3 py-2 text-[11px] font-mono text-right">{c.roy}%</td>
                  <td className="px-3 py-2 text-[11px] font-mono font-bold text-[#CC2727] text-right">{c.total}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Key insight */}
          <div className="px-4 py-3 bg-[#F0F6FE] border-t border-[#E4E7E9]">
            <p className="text-[10px] text-[#3C3E40] leading-relaxed">
              <strong className="text-[#0052C4]">Planning note:</strong> Singapore&apos;s 0% domestic dividend WHT makes it
              a highly efficient holding company jurisdiction. US-Canada treaty eliminates interest and royalty WHT,
              creating an optimal corridor for IP-based structures.
            </p>
          </div>
        </div>
      </div>

      {/* Color Legend */}
      <div className="bg-white border border-[#E4E7E9] rounded-lg p-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6A6F73] mb-3">Heatmap Legend</h3>
        <div className="flex flex-wrap gap-4 text-[11px]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-[#E8F5E9] border border-[#E4E7E9]" /> 0% (exempt)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-[#F0F6FE] border border-[#E4E7E9]" /> 1–5% (low)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-[#FFFAF3] border border-[#E4E7E9]" /> 6–10% (medium)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-white border border-[#E4E7E9]" /> 11–15% (standard)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-[#FFF3F3] border border-[#E4E7E9]" /> 16%+ (high)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-[#0D0E0F] border border-[#E4E7E9]" /> Self (N/A)
          </span>
        </div>
      </div>
    </div>
  );
}
