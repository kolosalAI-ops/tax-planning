/* eslint-disable @typescript-eslint/no-explicit-any */
import { COUNTRY_ORDER, COUNTRY_LABELS, COUNTRY_FLAGS } from '@/lib/constants';
import { getInvestmentCorridorsData, getB2BStartupData } from '@/lib/data';
import { getCountrySummary } from '@/lib/transformers';
import { CountryCode } from '@/lib/types';
import allData from '@/lib/data';

/* ── helpers ─────────────────────────────────────────────────── */

function getWht(code: CountryCode) {
  const d = allData[code] as any;
  return d.withholding_taxes_nonresident ?? d.withholding_taxes?.pph_26_nonresident ?? {};
}

function whtRate(val: any): number | null {
  if (val == null) return null;
  if (typeof val === 'number') return val;
  if (typeof val === 'object') {
    if (val.default !== undefined) return val.default;
    if (val.general !== undefined) return val.general;
    if (val.min !== undefined) return val.min;
  }
  return null;
}

function getInterestWht(code: CountryCode): number | null {
  const wht = getWht(code);
  if (wht.interest) return whtRate(wht.interest);
  if (wht.interest_general) return whtRate(wht.interest_general);
  if (wht.interest_banks !== undefined) return wht.interest_banks;
  return null;
}

function getRoyaltyWht(code: CountryCode): number | null {
  const wht = getWht(code);
  if (wht.royalties) return whtRate(wht.royalties);
  return null;
}

function getDividendWhtRaw(code: CountryCode): number | null {
  const wht = getWht(code);
  if (wht.dividends !== undefined) return whtRate(wht.dividends);
  if (wht.dividends_unfranked !== undefined) return whtRate(wht.dividends_unfranked);
  return null;
}

function getII(code: CountryCode) {
  return (allData[code] as any).international_investors ?? {};
}

function fmtPct(v: number | null | undefined): string {
  if (v == null) return '—';
  return `${v.toFixed(1)}%`;
}

function fxColor(fx: string): string {
  if (!fx) return '#64748b';
  const l = fx.toLowerCase();
  if (l === 'none') return '#0f766e';
  if (l === 'moderate') return '#b45309';
  return '#b91c1c';
}

function fxLabel(fx: string): string {
  if (!fx) return 'Unknown';
  const l = fx.toLowerCase();
  if (l === 'none') return 'None';
  if (l === 'moderate') return 'Moderate';
  return fx;
}

/* ── page ────────────────────────────────────────────────────── */

export default function InvestorsPage() {
  const corridors = getInvestmentCorridorsData() as {
    top_corridors: { from: string; to: string; effectiveRate: number; net: number }[];
  };
  const b2b = getB2BStartupData() as {
    best_per_investor: Record<string, { structure: string; effectiveRate: number }>;
  };

  /* Pre-compute branch vs subsidiary data */
  const branchSubData = COUNTRY_ORDER.map((code) => {
    const ii = getII(code);
    const bs = ii.branch_vs_subsidiary ?? {};
    const branchRate = bs.branch_tax_rate_pct ?? 0;
    const bpt = bs.branch_profits_tax_pct ?? bs.branch_remittance_tax_pct ?? 0;
    const subRate = bs.subsidiary_tax_rate_pct ?? 0;
    const divWht = bs.subsidiary_dividend_wht_pct ?? bs.subsidiary_dividend_wht_unfranked_pct ?? 0;
    const branchEffective = branchRate + bpt * (1 - branchRate / 100);
    const subEffective = subRate + divWht * (1 - subRate / 100);
    const recommendation =
      branchEffective < subEffective - 1
        ? 'Branch'
        : subEffective < branchEffective - 1
          ? 'Subsidiary'
          : 'Either';
    return { code, branchRate, bpt, subRate, divWht, branchEffective, subEffective, recommendation };
  });

  /* Treaty data for bar chart */
  const treatyData = COUNTRY_ORDER.map((code) => {
    const ii = getII(code);
    const tn = ii.treaty_network ?? {};
    return {
      code,
      count: tn.total_comprehensive_treaties ?? 0,
      lob: tn.has_lob ?? false,
      ppt: tn.has_ppt ?? false,
    };
  });
  const maxTreaty = Math.max(...treatyData.map((t) => t.count));

  /* CFC data */
  const cfcData = COUNTRY_ORDER.map((code) => {
    const ii = getII(code);
    const cfc = ii.cfc_rules ?? {};
    return {
      code,
      hasCfc: cfc.has_cfc ?? false,
      name: cfc.regime_name ?? '—',
      ownershipThreshold: cfc.ownership_threshold_pct ?? cfc.control_threshold_pct ?? null,
      activeExemption: cfc.active_income_exemption ?? false,
      territorial: cfc.territorial_system ?? false,
    };
  });

  /* Repatriation data */
  const repatData = COUNTRY_ORDER.map((code) => {
    const ii = getII(code);
    const r = ii.repatriation ?? {};
    return {
      code,
      fxControls: r.fx_controls ?? 'unknown',
      dividendRestrictions: r.dividend_restrictions ?? '—',
      centralBank: r.central_bank_registration ?? false,
    };
  });

  /* PE data */
  const peData = COUNTRY_ORDER.map((code) => {
    const ii = getII(code);
    const pe = ii.pe_rules ?? {};
    return {
      code,
      constructionMonths: pe.construction_pe_months ?? null,
      serviceDays: pe.service_pe_days ?? pe.service_pe_months ? (pe.service_pe_months ? pe.service_pe_months * 30 : pe.service_pe_days) : null,
      digitalPe: pe.digital_pe ?? false,
      dependentAgent: pe.dependent_agent_pe ?? false,
    };
  });

  /* Foreign tax credit data */
  const ftcData = COUNTRY_ORDER.map((code) => {
    const ii = getII(code);
    const ftc = ii.foreign_tax_credit ?? {};
    return {
      code,
      method: ftc.method ?? '—',
      limitation: ftc.limitation ?? '—',
      carryForward: ftc.carry_forward_years ?? ftc.business_carry_forward_years ?? 0,
      carryBack: ftc.carry_back_years ?? ftc.business_carry_back_years ?? 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">International Investors</h1>
        <p className="text-sm text-[#64748b] mt-1">
          Comprehensive cross-border investment analysis: WHT rates, entity structuring, CFC rules, treaty networks, and repatriation controls across 7 jurisdictions
        </p>
      </div>

      {/* ─── 1. WHT Comparison (enriched) ─── */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e2e8f0]">
          <h3 className="text-sm font-bold text-[#0f172a]">Withholding Tax Rates — Dividends, Interest &amp; Royalties</h3>
          <p className="text-[10px] text-[#64748b] mt-0.5">Default (non-treaty) rates for payments to non-residents</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-[#0f172a] text-white">
                <th className="px-3 py-2 text-left font-semibold">Country</th>
                <th className="px-3 py-2 text-right font-semibold">Dividend WHT</th>
                <th className="px-3 py-2 text-right font-semibold">Interest WHT</th>
                <th className="px-3 py-2 text-right font-semibold">Royalty WHT</th>
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
                const intWht = getInterestWht(code);
                const royWht = getRoyaltyWht(code);
                return (
                  <tr key={code} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f1f5f9]'}>
                    <td className="px-3 py-2 font-semibold text-[#0f172a] whitespace-nowrap">
                      {COUNTRY_FLAGS[code]} {COUNTRY_LABELS[code]}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      <span style={{ color: s.dividendWht === 0 ? '#0f766e' : s.dividendWht >= 25 ? '#b91c1c' : '#0f172a' }}>
                        {s.dividendWht.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      <span style={{ color: intWht === 0 ? '#0f766e' : (intWht ?? 0) >= 25 ? '#b91c1c' : '#0f172a' }}>
                        {fmtPct(intWht)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      <span style={{ color: royWht === 0 ? '#0f766e' : (royWht ?? 0) >= 25 ? '#b91c1c' : '#0f172a' }}>
                        {fmtPct(royWht)}
                      </span>
                    </td>
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

      {/* ─── 2. Branch vs Subsidiary ─── */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e2e8f0]">
          <h3 className="text-sm font-bold text-[#0f172a]">Branch vs Subsidiary Comparison</h3>
          <p className="text-[10px] text-[#64748b] mt-0.5">Effective tax on repatriated profits — branch (CIT + BPT) vs subsidiary (CIT + dividend WHT)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-[#0f172a] text-white">
                <th className="px-3 py-2 text-left font-semibold">Country</th>
                <th className="px-3 py-2 text-right font-semibold">Branch CIT</th>
                <th className="px-3 py-2 text-right font-semibold">Branch Profits Tax</th>
                <th className="px-3 py-2 text-right font-semibold">Branch Effective</th>
                <th className="px-3 py-2 text-right font-semibold">Subsidiary CIT</th>
                <th className="px-3 py-2 text-right font-semibold">Dividend WHT</th>
                <th className="px-3 py-2 text-right font-semibold">Subsidiary Effective</th>
                <th className="px-3 py-2 text-center font-semibold">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {branchSubData.map((row, i) => {
                const winner = row.branchEffective <= row.subEffective ? 'branch' : 'sub';
                return (
                  <tr key={row.code} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f1f5f9]'}>
                    <td className="px-3 py-2 font-semibold text-[#0f172a] whitespace-nowrap">
                      {COUNTRY_FLAGS[row.code]} {COUNTRY_LABELS[row.code]}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{row.branchRate.toFixed(1)}%</td>
                    <td className="px-3 py-2 text-right font-mono">{row.bpt.toFixed(1)}%</td>
                    <td className="px-3 py-2 text-right font-mono font-semibold" style={{ color: winner === 'branch' ? '#0f766e' : '#0f172a' }}>
                      {row.branchEffective.toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{row.subRate.toFixed(1)}%</td>
                    <td className="px-3 py-2 text-right font-mono">{row.divWht.toFixed(1)}%</td>
                    <td className="px-3 py-2 text-right font-mono font-semibold" style={{ color: winner === 'sub' ? '#0f766e' : '#0f172a' }}>
                      {row.subEffective.toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className="text-[9px] font-mono px-2 py-0.5 rounded font-bold"
                        style={{
                          backgroundColor:
                            row.recommendation === 'Either' ? '#dbeafe' :
                            row.recommendation === 'Branch' ? '#ccfbf1' : '#fef3c7',
                          color:
                            row.recommendation === 'Either' ? '#1d4ed8' :
                            row.recommendation === 'Branch' ? '#0f766e' : '#b45309',
                        }}
                      >
                        {row.recommendation}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 3. CFC Rules + 4. Treaty Network (side by side) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CFC Rules */}
        <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e2e8f0]">
            <h3 className="text-sm font-bold text-[#0f172a]">CFC Rules Comparison</h3>
            <p className="text-[10px] text-[#64748b] mt-0.5">Controlled foreign corporation regimes and key thresholds</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-[#0f172a] text-white">
                  <th className="px-3 py-2 text-left font-semibold">Country</th>
                  <th className="px-3 py-2 text-left font-semibold">Regime</th>
                  <th className="px-3 py-2 text-right font-semibold">Ownership</th>
                  <th className="px-3 py-2 text-center font-semibold">Active Exemption</th>
                </tr>
              </thead>
              <tbody>
                {cfcData.map((row, i) => (
                  <tr key={row.code} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f1f5f9]'}>
                    <td className="px-3 py-2 font-semibold text-[#0f172a] whitespace-nowrap">
                      {COUNTRY_FLAGS[row.code]} {COUNTRY_LABELS[row.code]}
                    </td>
                    <td className="px-3 py-2 text-[#0f172a]">
                      {row.hasCfc ? (
                        <span className="font-mono text-[10px]">{row.name}</span>
                      ) : (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#ccfbf1] text-[#0f766e] font-bold">
                          {row.territorial ? 'Territorial' : 'No CFC'}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {row.hasCfc && row.ownershipThreshold != null ? `${row.ownershipThreshold}%` : '—'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {row.hasCfc ? (
                        <span
                          className="text-[9px] font-mono px-2 py-0.5 rounded font-bold"
                          style={{
                            backgroundColor: row.activeExemption ? '#ccfbf1' : '#fee2e2',
                            color: row.activeExemption ? '#0f766e' : '#b91c1c',
                          }}
                        >
                          {row.activeExemption ? 'Yes' : 'No'}
                        </span>
                      ) : (
                        <span className="text-[#64748b]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Treaty Network Bar Chart */}
        <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e2e8f0]">
            <h3 className="text-sm font-bold text-[#0f172a]">Treaty Network Coverage</h3>
            <p className="text-[10px] text-[#64748b] mt-0.5">Comprehensive double-tax treaties in force + LOB/PPT provisions</p>
          </div>
          <div className="p-4 space-y-2.5">
            {treatyData
              .sort((a, b) => b.count - a.count)
              .map((row) => {
                const barWidth = maxTreaty > 0 ? (row.count / maxTreaty) * 100 : 0;
                return (
                  <div key={row.code}>
                    <div className="flex items-center gap-3">
                      <div className="w-24 text-[11px] font-semibold text-[#0f172a] whitespace-nowrap truncate">
                        {COUNTRY_FLAGS[row.code]} {COUNTRY_LABELS[row.code]}
                      </div>
                      <div className="flex-1 h-5 bg-[#f1f5f9] rounded overflow-hidden">
                        <div
                          className="h-full rounded"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: row.count >= 60 ? '#0f766e' : row.count >= 40 ? '#b45309' : '#b91c1c',
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-[#0f172a] w-8 text-right">{row.count}</span>
                      <div className="flex gap-1 w-16">
                        {row.lob && (
                          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-[#dbeafe] text-[#1d4ed8] font-bold">
                            LOB
                          </span>
                        )}
                        {row.ppt && (
                          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-[#fef3c7] text-[#b45309] font-bold">
                            PPT
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* ─── 5. FX Controls & Repatriation ─── */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e2e8f0]">
          <h3 className="text-sm font-bold text-[#0f172a]">FX Controls &amp; Repatriation Risk</h3>
          <p className="text-[10px] text-[#64748b] mt-0.5">Capital repatriation restrictions, FX controls, and central bank requirements</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-[#0f172a] text-white">
                <th className="px-3 py-2 text-left font-semibold">Country</th>
                <th className="px-3 py-2 text-center font-semibold">FX Controls</th>
                <th className="px-3 py-2 text-left font-semibold">Dividend Restrictions</th>
                <th className="px-3 py-2 text-center font-semibold">Central Bank Reg.</th>
                <th className="px-3 py-2 text-center font-semibold">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {repatData.map((row, i) => {
                const riskScore = (row.fxControls.toLowerCase() !== 'none' ? 2 : 0) + (row.centralBank ? 1 : 0);
                const riskLabel = riskScore === 0 ? 'Low' : riskScore <= 2 ? 'Moderate' : 'High';
                const riskColor = riskScore === 0 ? '#0f766e' : riskScore <= 2 ? '#b45309' : '#b91c1c';
                const riskBg = riskScore === 0 ? '#ccfbf1' : riskScore <= 2 ? '#fef3c7' : '#fee2e2';
                return (
                  <tr key={row.code} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f1f5f9]'}>
                    <td className="px-3 py-2 font-semibold text-[#0f172a] whitespace-nowrap">
                      {COUNTRY_FLAGS[row.code]} {COUNTRY_LABELS[row.code]}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className="text-[9px] font-mono px-2 py-0.5 rounded font-bold"
                        style={{ color: fxColor(row.fxControls), backgroundColor: fxColor(row.fxControls) + '18' }}
                      >
                        {fxLabel(row.fxControls)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[#0f172a] capitalize">{row.dividendRestrictions.replace(/_/g, ' ')}</td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className="text-[9px] font-mono px-2 py-0.5 rounded font-bold"
                        style={{
                          backgroundColor: row.centralBank ? '#fef3c7' : '#ccfbf1',
                          color: row.centralBank ? '#b45309' : '#0f766e',
                        }}
                      >
                        {row.centralBank ? 'Required' : 'Not Required'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className="text-[9px] font-mono px-2 py-0.5 rounded font-bold"
                        style={{ backgroundColor: riskBg, color: riskColor }}
                      >
                        {riskLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 6. PE Thresholds + 8. Foreign Tax Credit (side by side) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PE Thresholds */}
        <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e2e8f0]">
            <h3 className="text-sm font-bold text-[#0f172a]">Permanent Establishment Thresholds</h3>
            <p className="text-[10px] text-[#64748b] mt-0.5">Construction PE (months) and service PE (days) trigger points</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-[#0f172a] text-white">
                  <th className="px-3 py-2 text-left font-semibold">Country</th>
                  <th className="px-3 py-2 text-right font-semibold">Construction PE</th>
                  <th className="px-3 py-2 text-right font-semibold">Service PE</th>
                  <th className="px-3 py-2 text-center font-semibold">Digital PE</th>
                  <th className="px-3 py-2 text-center font-semibold">Agent PE</th>
                </tr>
              </thead>
              <tbody>
                {peData.map((row, i) => (
                  <tr key={row.code} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f1f5f9]'}>
                    <td className="px-3 py-2 font-semibold text-[#0f172a] whitespace-nowrap">
                      {COUNTRY_FLAGS[row.code]} {COUNTRY_LABELS[row.code]}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      <span style={{ color: (row.constructionMonths ?? 0) <= 6 ? '#b91c1c' : '#0f172a' }}>
                        {row.constructionMonths != null ? `${row.constructionMonths} mo` : '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      <span style={{ color: (row.serviceDays ?? 999) <= 90 ? '#b91c1c' : '#0f172a' }}>
                        {row.serviceDays != null ? `${row.serviceDays} days` : '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className="text-[9px] font-mono px-2 py-0.5 rounded font-bold"
                        style={{
                          backgroundColor: row.digitalPe ? '#fee2e2' : '#f1f5f9',
                          color: row.digitalPe ? '#b91c1c' : '#64748b',
                        }}
                      >
                        {row.digitalPe ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className="text-[9px] font-mono px-2 py-0.5 rounded font-bold"
                        style={{
                          backgroundColor: row.dependentAgent ? '#fef3c7' : '#f1f5f9',
                          color: row.dependentAgent ? '#b45309' : '#64748b',
                        }}
                      >
                        {row.dependentAgent ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Foreign Tax Credit Methods */}
        <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e2e8f0]">
            <h3 className="text-sm font-bold text-[#0f172a]">Foreign Tax Credit Methods</h3>
            <p className="text-[10px] text-[#64748b] mt-0.5">Relief method, limitation basis, and carry forward/back periods</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-[#0f172a] text-white">
                  <th className="px-3 py-2 text-left font-semibold">Country</th>
                  <th className="px-3 py-2 text-left font-semibold">Method</th>
                  <th className="px-3 py-2 text-left font-semibold">Limitation</th>
                  <th className="px-3 py-2 text-right font-semibold">Carry Fwd</th>
                  <th className="px-3 py-2 text-right font-semibold">Carry Back</th>
                </tr>
              </thead>
              <tbody>
                {ftcData.map((row, i) => (
                  <tr key={row.code} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f1f5f9]'}>
                    <td className="px-3 py-2 font-semibold text-[#0f172a] whitespace-nowrap">
                      {COUNTRY_FLAGS[row.code]} {COUNTRY_LABELS[row.code]}
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#dbeafe] text-[#1d4ed8] font-bold capitalize">
                        {row.method.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-[10px] text-[#0f172a] capitalize">{row.limitation.replace(/_/g, ' ')}</td>
                    <td className="px-3 py-2 text-right font-mono">
                      <span style={{ color: row.carryForward > 0 ? '#0f766e' : '#64748b' }}>
                        {row.carryForward > 0 ? `${row.carryForward} yr` : 'None'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      <span style={{ color: row.carryBack > 0 ? '#0f766e' : '#64748b' }}>
                        {row.carryBack > 0 ? `${row.carryBack} yr` : 'None'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── 7. Corridors + Optimal Structures (existing, preserved) ─── */}
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
                    {c.from} &rarr; {c.to}
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

      {/* ─── 9. Key Takeaway Callout ─── */}
      <div className="bg-[#ccfbf1] border border-[#0f766e]/20 rounded-lg p-4">
        <h4 className="text-xs font-bold text-[#0f766e] uppercase tracking-wider mb-2">Key Takeaways for International Investors</h4>
        <div className="space-y-2 text-sm text-[#0f172a]">
          <p>
            <span className="font-bold">Lowest WHT corridor:</span> Singapore&apos;s 0% dividend WHT and 17% CIT delivers an unmatched 17% combined rate for any investor domicile.
            Brazil also imposes 0% outbound dividend WHT (Lei 9.249/1995), but its 34% CIT erodes the benefit.
          </p>
          <p>
            <span className="font-bold">Branch vs subsidiary:</span> In most jurisdictions the effective rate is identical, but the US and Canada impose a 25-30% branch profits tax making subsidiaries the clear default.
            Singapore and Brazil impose no BPT, making branches viable for short-term projects.
          </p>
          <p>
            <span className="font-bold">CFC risk:</span> The US GILTI regime (10.5% minimum) and Brazil&apos;s universal CFC rules (no active income exemption) are the most aggressive.
            Singapore has no CFC regime at all due to its territorial system.
          </p>
          <p>
            <span className="font-bold">Repatriation:</span> Indonesia and Brazil require central bank registration for FX transfers and impose moderate controls.
            All other covered jurisdictions have free capital movement with no restrictions on dividend repatriation.
          </p>
        </div>
      </div>
    </div>
  );
}
