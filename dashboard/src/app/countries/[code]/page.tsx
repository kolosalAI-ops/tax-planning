/* eslint-disable @typescript-eslint/no-explicit-any */
import { COUNTRY_ORDER, COUNTRY_LABELS, COUNTRY_FLAGS, COUNTRY_CURRENCIES } from '@/lib/constants';
import { getCountryData } from '@/lib/data';
import { getCountrySummary } from '@/lib/transformers';
import { CountryCode } from '@/lib/types';

export function generateStaticParams() {
  return COUNTRY_ORDER.map((code) => ({ code }));
}

/* ────────────────────────────── Primitives ────────────────────────────── */

function SectionCard({ title, icon, children }: { title: string; icon?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E4E7E9] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E4E7E9] flex items-center gap-2">
        {icon && <span className="text-sm">{icon}</span>}
        <h3 className="text-sm font-bold text-[#0D0E0F]">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function DataRow({ label, value, accent, mono = true }: { label: string; value: React.ReactNode; accent?: string; mono?: boolean }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-[#F1F3F4] last:border-0 gap-4">
      <span className="text-[11px] text-[#6A6F73] shrink-0">{label}</span>
      <span className={`text-[11px] font-semibold text-right ${mono ? 'font-mono' : ''}`} style={{ color: accent || '#0D0E0F' }}>
        {value}
      </span>
    </div>
  );
}

function Badge({ children, color = 'teal' }: { children: React.ReactNode; color?: 'teal' | 'amber' | 'red' | 'blue' | 'gray' }) {
  const colors = {
    teal: 'bg-[#F0F6FE] text-[#0052C4] border-[#0052C4]/20',
    amber: 'bg-[#FFFAF3] text-[#CC8727] border-[#CC8727]/20',
    red: 'bg-[#FFF3F3] text-[#CC2727] border-[#CC2727]/20',
    blue: 'bg-[#F0F6FE] text-[#0052C4] border-[#0052C4]/20',
    gray: 'bg-[#F1F3F4] text-[#6A6F73] border-[#E4E7E9]',
  };
  return (
    <span className={`inline-block text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${colors[color]}`}>
      {children}
    </span>
  );
}

function RateBar({ label, value, max = 50, color = '#0052C4' }: { label: string; value: number; max?: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-[10px] text-[#6A6F73] w-[100px] shrink-0 truncate">{label}</span>
      <div className="flex-1 h-4 bg-[#F1F3F4] rounded overflow-hidden">
        <div className="h-full rounded transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-mono font-bold text-[#0D0E0F] w-[48px] text-right shrink-0">{value}%</span>
    </div>
  );
}

function MiniTable({ headers, rows }: { headers: string[]; rows: (string | number | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[10px]">
        <thead>
          <tr className="bg-[#0D0E0F] text-white">
            {headers.map((h, i) => (
              <th key={i} className="px-2 py-1.5 text-left font-bold uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F8F9F9]'}>
              {row.map((cell, j) => (
                <td key={j} className="px-2 py-1.5 border-b border-[#F1F3F4] font-mono">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 first:mt-0">
      <p className="text-[10px] font-bold text-[#6A6F73] uppercase tracking-[0.1em] mb-2 pb-1 border-b border-[#F1F3F4]">{title}</p>
      {children}
    </div>
  );
}

function KeyInsight({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#F0F6FE] border border-[#0052C4]/20 rounded-lg p-3 mt-3">
      <p className="text-[10px] font-bold text-[#0052C4] uppercase tracking-wider mb-1">Key Insight</p>
      <p className="text-[11px] text-[#0D0E0F] leading-relaxed">{children}</p>
    </div>
  );
}

function fmtNum(n: number | null | undefined, suffix = ''): string {
  if (n === null || n === undefined) return 'N/A';
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)}B${suffix}`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)}M${suffix}`;
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(0)}K${suffix}`;
  return `${n}${suffix}`;
}

function fmtPct(v: any): string {
  if (v === null || v === undefined) return 'N/A';
  if (typeof v === 'number') return `${v}%`;
  return String(v);
}

function fmtRate(v: any): string {
  if (v === null || v === undefined) return 'N/A';
  if (typeof v === 'number') return `${v}%`;
  if (typeof v === 'string') return v.includes('%') ? v : `${v}%`;
  if (typeof v === 'object' && v.default !== undefined) return `${v.default}%`;
  return String(v);
}

function humanKey(k: string): string {
  return k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/Pct$/, '').replace(/Usd$/, ' (USD)').replace(/Cad$/, ' (CAD)')
    .replace(/Aud$/, ' (AUD)').replace(/Sgd$/, ' (SGD)').replace(/Idr$/, ' (IDR)');
}

/* ────────────────────────── Section Renderers ─────────────────────────── */

function CorporateTaxSection({ ct, code }: { ct: any; code: string }) {
  if (!ct) return null;

  // Determine headline rate
  const headline = ct.federal_rate ?? ct.headline_rate ?? ct.standard_rate ?? ct.general_rate ?? ct.federal_general_rate ?? null;

  return (
    <SectionCard title="Corporate Tax" icon="🏢">
      {/* Headline */}
      {headline !== null && (
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[#E4E7E9]">
          <div className="text-3xl font-extrabold font-mono text-[#0D0E0F]">{headline}%</div>
          <div>
            <p className="text-[11px] font-bold text-[#0D0E0F]">
              {ct.federal_rate !== undefined ? 'Federal Rate' : 'Headline Rate'}
            </p>
            <div className="flex gap-1.5 mt-1 flex-wrap">
              {ct.rate_type && <Badge color="gray">{humanKey(ct.rate_type)}</Badge>}
              {ct.territorial_system && <Badge color="teal">Territorial</Badge>}
              {ct.capital_gains_tax === false && <Badge color="teal">No CGT</Badge>}
              {ct.imputation && <Badge color="blue">Imputation</Badge>}
            </div>
          </div>
        </div>
      )}

      {/* US: Combined effective rates */}
      {ct.combined_effective_rates && (
        <SubSection title="Combined Effective Rates (Federal + State)">
          {Object.entries(ct.combined_effective_rates).map(([k, v]) => (
            <RateBar key={k} label={humanKey(k)} value={v as number} max={40} />
          ))}
        </SubSection>
      )}

      {/* US: AMT */}
      {ct.alternative_minimum_tax && (
        <SubSection title="Alternative Minimum Tax">
          <DataRow label="AMT Rate" value={`${ct.alternative_minimum_tax.rate}%`} />
          <DataRow label="Threshold" value={`$${fmtNum(ct.alternative_minimum_tax.threshold)}`} />
          <DataRow label="Description" value={ct.alternative_minimum_tax.description} mono={false} />
        </SubSection>
      )}

      {/* CA: Two-tier federal */}
      {ct.federal_general_rate !== undefined && (
        <SubSection title="Federal Rates">
          <DataRow label="General Rate" value={`${ct.federal_general_rate}%`} />
          <DataRow label="Small Business Rate" value={`${ct.federal_small_business_rate}%`} />
          {ct.investment_income_rate && <DataRow label="Investment Income" value={`${ct.investment_income_rate}%`} />}
        </SubSection>
      )}

      {/* CA: Small Business Deduction */}
      {ct.small_business_deduction && (
        <SubSection title="Small Business Deduction">
          <DataRow label="Business Limit" value={`$${fmtNum(ct.small_business_deduction.business_limit)}`} />
          <DataRow label="Capital Phaseout Start" value={`$${fmtNum(ct.small_business_deduction.taxable_capital_phaseout_start)}`} />
          <DataRow label="Capital Phaseout End" value={`$${fmtNum(ct.small_business_deduction.taxable_capital_phaseout_end)}`} />
          <DataRow label="CCPC Required" value={ct.small_business_deduction.ccpc_required ? 'Yes' : 'No'} />
        </SubSection>
      )}

      {/* AU: Two-tier */}
      {ct.base_rate_entity_rate !== undefined && (
        <SubSection title="Base Rate Entity">
          <DataRow label="Reduced Rate" value={`${ct.base_rate_entity_rate}%`} accent="#0052C4" />
          {ct.base_rate_entity && (
            <>
              <DataRow label="Turnover Threshold" value={`$${fmtNum(ct.base_rate_entity.turnover_threshold)}`} />
              <DataRow label="Passive Income Test" value={`${ct.base_rate_entity.passive_income_test}% max`} />
            </>
          )}
        </SubSection>
      )}

      {/* AU: Imputation */}
      {ct.imputation && (
        <SubSection title="Dividend Imputation">
          <DataRow label="Max Franking (General)" value={`${ct.imputation.max_franking_rate_general}%`} />
          <DataRow label="Max Franking (Base)" value={`${ct.imputation.max_franking_rate_base}%`} />
          <DataRow label="Refundable" value={ct.imputation.refundable ? 'Yes' : 'No'} accent={ct.imputation.refundable ? '#0052C4' : undefined} />
        </SubSection>
      )}

      {/* ID: Listed company rate */}
      {ct.listed_company_rate !== undefined && (
        <SubSection title="Listed Company Incentive">
          <DataRow label="Listed Rate" value={`${ct.listed_company_rate}%`} accent="#0052C4" />
          <DataRow label="Discount" value={`${ct.listed_discount}% reduction`} />
        </SubSection>
      )}

      {/* ID: SME Regimes */}
      {ct.sme_regimes && (
        <SubSection title="SME Regimes">
          {ct.sme_regimes.msme_final_tax && (
            <div className="mb-2">
              <p className="text-[10px] font-semibold text-[#0D0E0F] mb-1">MSME Final Tax</p>
              <DataRow label="Rate" value={`${ct.sme_regimes.msme_final_tax.rate}% of gross turnover`} accent="#0052C4" />
              <DataRow label="Threshold" value={`IDR ${fmtNum(ct.sme_regimes.msme_final_tax.threshold)}`} />
              <DataRow label="Duration" value={ct.sme_regimes.msme_final_tax.duration_corporate} mono={false} />
            </div>
          )}
          {ct.sme_regimes.article_31e_reduction && (
            <div>
              <p className="text-[10px] font-semibold text-[#0D0E0F] mb-1">Art. 31E 50% Reduction</p>
              <DataRow label="Effective Rate on Portion" value={`${ct.sme_regimes.article_31e_reduction.effective_rate_on_portion}%`} accent="#0052C4" />
              <DataRow label="Max Gross Revenue" value={`IDR ${fmtNum(ct.sme_regimes.article_31e_reduction.max_gross_revenue)}`} />
            </div>
          )}
        </SubSection>
      )}

      {/* ID: Tax Holiday */}
      {ct.tax_holiday?.tiers && (
        <SubSection title="Tax Holiday">
          <MiniTable
            headers={['Investment (IDR)', 'Years', 'Reduction']}
            rows={ct.tax_holiday.tiers.map((t: any) => [
              `${fmtNum(t.min_investment)} - ${t.max_investment ? fmtNum(t.max_investment) : '∞'}`,
              `${t.years} yrs`,
              <Badge key="r" color="teal">{t.reduction_pct}%</Badge>,
            ])}
          />
          {ct.tax_holiday.transition_reduction && (
            <p className="text-[10px] text-[#6A6F73] mt-1">+ {ct.tax_holiday.transition_years} yr transition at {ct.tax_holiday.transition_reduction}% reduction</p>
          )}
        </SubSection>
      )}

      {/* SG: Partial Tax Exemption */}
      {ct.partial_tax_exemption && (
        <SubSection title="Partial Tax Exemption">
          {ct.partial_tax_exemption.first_10k && (
            <DataRow label="First S$10K" value={`${ct.partial_tax_exemption.first_10k.effective_rate}% effective (${ct.partial_tax_exemption.first_10k.exemption_pct}% exempt)`} accent="#0052C4" />
          )}
          {ct.partial_tax_exemption.next_190k && (
            <DataRow label="Next S$190K" value={`${ct.partial_tax_exemption.next_190k.effective_rate}% effective (${ct.partial_tax_exemption.next_190k.exemption_pct}% exempt)`} accent="#0052C4" />
          )}
          {ct.partial_tax_exemption.above_200k && (
            <DataRow label="Above S$200K" value={`${ct.partial_tax_exemption.above_200k.rate}%`} />
          )}
        </SubSection>
      )}

      {/* SG: Startup Tax Exemption */}
      {ct.startup_tax_exemption && (
        <SubSection title="Startup Tax Exemption (First 3 YAs)">
          <DataRow label="First S$100K" value={`${ct.startup_tax_exemption.first_100k.effective_rate}% effective`} accent="#0052C4" />
          <DataRow label="Next S$100K" value={`${ct.startup_tax_exemption.next_100k.effective_rate}% effective`} accent="#0052C4" />
          <DataRow label="Max Exemption/YA" value={`S$${fmtNum(ct.startup_tax_exemption.max_exemption_per_ya)}`} />
          <p className="text-[9px] text-[#6A6F73] mt-1 leading-relaxed">{ct.startup_tax_exemption.eligibility}</p>
        </SubSection>
      )}

      {/* SG: Concessionary Rates */}
      {ct.concessionary_rates && (
        <SubSection title="Concessionary Tax Rates">
          {Object.entries(ct.concessionary_rates).map(([k, v]: [string, any]) => (
            <div key={k} className="flex items-center justify-between py-1 border-b border-[#F1F3F4] last:border-0">
              <span className="text-[10px] text-[#6A6F73]">{humanKey(k)}</span>
              <div className="flex gap-1.5">
                {v.rate_range && <Badge color="teal">{v.rate_range}</Badge>}
                {v.rate !== undefined && <Badge color="teal">{v.rate}%</Badge>}
                {v.duration_years && <Badge color="gray">{v.duration_years} yrs</Badge>}
              </div>
            </div>
          ))}
        </SubSection>
      )}

      {/* SG: BEPS Pillar 2 */}
      {ct.minimum_effective_tax_rate && (
        <SubSection title="Minimum Tax (BEPS Pillar 2)">
          <DataRow label="Rate" value={`${ct.minimum_effective_tax_rate.rate}%`} />
          <DataRow label="Revenue Threshold" value={`€${fmtNum(ct.minimum_effective_tax_rate.threshold_global_revenue)}`} />
          <DataRow label="Effective Date" value={ct.minimum_effective_tax_rate.effective_date} mono={false} />
          <DataRow label="Domestic Top-Up" value={ct.minimum_effective_tax_rate.domestic_top_up_tax ? 'Yes' : 'No'} />
        </SubSection>
      )}

      {/* SG: Foreign Sourced Income */}
      {ct.foreign_sourced_income_exemption && (
        <SubSection title="Foreign Sourced Income Exemption">
          <p className="text-[10px] text-[#6A6F73] mb-1">Conditions:</p>
          <ul className="space-y-0.5">
            {ct.foreign_sourced_income_exemption.conditions.map((c: string, i: number) => (
              <li key={i} className="text-[10px] text-[#0D0E0F] flex items-start gap-1">
                <span className="text-[#0052C4] shrink-0">✓</span> {c}
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-[#6A6F73] mt-1">Applies to: {ct.foreign_sourced_income_exemption.applicable_to.join(', ')}</p>
        </SubSection>
      )}

      {/* BR: Multiple Regimes */}
      {ct.regimes && (
        <SubSection title="Tax Regimes">
          <div className="flex flex-wrap gap-1 mb-2">
            {ct.regimes.map((r: string) => <Badge key={r} color="gray">{r}</Badge>)}
          </div>
        </SubSection>
      )}

      {/* BR: Lucro Real */}
      {ct.lucro_real && (
        <SubSection title="Lucro Real (Standard Regime)">
          <DataRow label="IRPJ Standard" value={`${ct.lucro_real.irpj.standard_rate}%`} />
          <DataRow label="IRPJ Surtax" value={`${ct.lucro_real.irpj.surtax_rate}% above R$${fmtNum(ct.lucro_real.irpj.surtax_annual_threshold)}/yr`} />
          <DataRow label="CSLL" value={`${ct.lucro_real.csll.general}%`} />
          <DataRow label="Combined (High Income)" value={`${ct.lucro_real.combined_effective.above_240k}%`} accent="#CC2727" />
          {ct.lucro_real.pis_cofins_noncumulative && (
            <>
              <DataRow label="PIS + COFINS" value={`${ct.lucro_real.pis_cofins_noncumulative.combined}% (non-cumulative)`} />
              <DataRow label="Effective After Credits" value={`${ct.lucro_real.pis_cofins_noncumulative.effective_after_credits.min}-${ct.lucro_real.pis_cofins_noncumulative.effective_after_credits.max}%`} accent="#0052C4" />
            </>
          )}
        </SubSection>
      )}

      {/* BR: Lucro Presumido */}
      {ct.lucro_presumido && (
        <SubSection title="Lucro Presumido (Simplified)">
          <DataRow label="Revenue Limit" value={`R$${fmtNum(ct.lucro_presumido.revenue_limit)}`} />
          <DataRow label="Effective (Commerce 8%)" value={`${ct.lucro_presumido.effective_rates_on_revenue.commerce_8pct_margin}%`} accent="#0052C4" />
          <DataRow label="Effective (Services 32%)" value={`${ct.lucro_presumido.effective_rates_on_revenue.services_32pct_margin}%`} />
        </SubSection>
      )}

      {/* MX: Regional incentives */}
      {ct.regional_incentives && (
        <SubSection title="Regional Incentive Zones">
          {Object.entries(ct.regional_incentives).map(([zone, info]: [string, any]) => (
            <div key={zone} className="mb-2 last:mb-0">
              <p className="text-[10px] font-semibold text-[#0D0E0F] mb-0.5">{humanKey(zone)}</p>
              <DataRow label="ISR Effective Rate" value={`${info.isr_effective_rate}%`} accent="#0052C4" />
              <DataRow label="IVA Rate" value={`${info.iva_rate}%`} accent="#0052C4" />
              {info.municipalities && <DataRow label="Municipalities" value={info.municipalities} />}
            </div>
          ))}
        </SubSection>
      )}

      {/* CA/US: State/Provincial Rates - top and bottom */}
      {(ct.state_rates?.rates_by_state || ct.provincial_rates?.general) && (() => {
        const rates = ct.state_rates?.rates_by_state || ct.provincial_rates?.general || {};
        const sorted = Object.entries(rates).sort((a: any, b: any) => a[1] - b[1]);
        const lowest3 = sorted.slice(0, 3);
        const highest3 = sorted.slice(-3).reverse();
        return (
          <SubSection title={ct.state_rates ? 'State Tax Rates (Select)' : 'Provincial Rates (General)'}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[9px] font-bold text-[#0052C4] uppercase tracking-wider mb-1">Lowest</p>
                {lowest3.map(([k, v]: any) => (
                  <DataRow key={k} label={k.replace(/_/g, ' ')} value={`${v}%`} accent="#0052C4" />
                ))}
              </div>
              <div>
                <p className="text-[9px] font-bold text-[#CC2727] uppercase tracking-wider mb-1">Highest</p>
                {highest3.map(([k, v]: any) => (
                  <DataRow key={k} label={k.replace(/_/g, ' ')} value={`${v}%`} accent="#CC2727" />
                ))}
              </div>
            </div>
          </SubSection>
        );
      })()}

      {/* Generic remaining scalar fields */}
      {code === 'SG' && ct.corporate_income_tax_rebate && (
        <SubSection title="CIT Rebate">
          {Object.entries(ct.corporate_income_tax_rebate).map(([k, v]: [string, any]) => (
            <DataRow key={k} label={humanKey(k)} value={`${v.rebate_pct}% (cap S$${fmtNum(v.cap)})`} />
          ))}
        </SubSection>
      )}
    </SectionCard>
  );
}

function IndirectTaxSection({ data }: { data: any }) {
  // Find the indirect tax key
  const vat = data.vat;
  const gst = data.gst;
  const gstHst = data.gst_hst;
  const vatEq = data.vat_equivalent;
  const iva = data.iva;

  const source = vat || gst || gstHst || vatEq || iva;
  if (!source) return null;

  const title = gstHst ? 'GST / HST' : gst ? 'GST' : iva ? 'IVA (VAT)' : vat ? 'VAT' : 'Sales Tax / VAT Equivalent';

  return (
    <SectionCard title={title} icon="🧾">
      {/* Standard rate */}
      {source.standard_rate !== undefined && (
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl font-extrabold font-mono text-[#0D0E0F]">{source.standard_rate}%</div>
          <p className="text-[11px] text-[#6A6F73]">Standard rate</p>
        </div>
      )}
      {source.federal_gst !== undefined && (
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl font-extrabold font-mono text-[#0D0E0F]">{source.federal_gst}%</div>
          <p className="text-[11px] text-[#6A6F73]">Federal GST</p>
        </div>
      )}

      {/* US: Sales tax */}
      {vatEq && (
        <div className="mb-3">
          <Badge color="amber">No Federal VAT/GST</Badge>
          {vatEq.state_range && (
            <div className="mt-2">
              <DataRow label="State Sales Tax Range" value={`${vatEq.state_range.min}% - ${vatEq.state_range.max}%`} />
            </div>
          )}
          {vatEq.note && <p className="text-[10px] text-[#6A6F73] mt-1">{vatEq.note}</p>}
        </div>
      )}

      {/* ID: Planned increase */}
      {source.planned_increase_2025 && (
        <DataRow label="Planned 2025 Rate" value={`${source.planned_increase_2025}%`} accent="#CC8727" />
      )}

      {/* Registration threshold */}
      {source.registration_threshold !== undefined && (
        <DataRow label="Registration Threshold" value={fmtNum(source.registration_threshold)} />
      )}

      {/* MX: Border zone */}
      {source.border_zone_rate !== undefined && (
        <DataRow label="Border Zone Rate" value={`${source.border_zone_rate}%`} accent="#0052C4" />
      )}

      {/* Exempt / Zero-rated */}
      {source.exempt_supplies && (
        <SubSection title="Exempt">
          <div className="flex flex-wrap gap-1">
            {source.exempt_supplies.map((s: string) => <Badge key={s} color="gray">{humanKey(s)}</Badge>)}
          </div>
        </SubSection>
      )}
      {source.exempt_items && (
        <SubSection title="Exempt">
          <div className="flex flex-wrap gap-1">
            {source.exempt_items.map((s: string) => <Badge key={s} color="gray">{humanKey(s)}</Badge>)}
          </div>
        </SubSection>
      )}
      {source.zero_rated && (
        <SubSection title="Zero-Rated">
          <div className="flex flex-wrap gap-1">
            {source.zero_rated.map((s: string) => <Badge key={s} color="teal">{humanKey(s)}</Badge>)}
          </div>
        </SubSection>
      )}
      {source.zero_rate_items && (
        <SubSection title="Zero-Rated">
          <div className="flex flex-wrap gap-1">
            {source.zero_rate_items.map((s: string) => <Badge key={s} color="teal">{humanKey(s)}</Badge>)}
          </div>
        </SubSection>
      )}
      {source.gst_free && (
        <SubSection title="GST-Free">
          <div className="flex flex-wrap gap-1">
            {source.gst_free.map((s: string) => <Badge key={s} color="teal">{humanKey(s)}</Badge>)}
          </div>
        </SubSection>
      )}
      {source.input_taxed && (
        <SubSection title="Input Taxed (No Credit)">
          <div className="flex flex-wrap gap-1">
            {source.input_taxed.map((s: string) => <Badge key={s} color="amber">{humanKey(s)}</Badge>)}
          </div>
        </SubSection>
      )}

      {/* CA: Provincial HST rates */}
      {gstHst?.rates_by_province && (
        <SubSection title="Provincial Rates">
          <MiniTable
            headers={['Province', 'Rate', 'Type']}
            rows={Object.entries(gstHst.rates_by_province).slice(0, 10).map(([prov, info]: [string, any]) => [
              prov.replace(/_/g, ' '),
              `${info.rate}%`,
              <Badge key="t" color="gray">{info.type}</Badge>,
            ])}
          />
        </SubSection>
      )}

      {/* SG: Reverse charge & OVR */}
      {source.reverse_charge && (
        <SubSection title="Reverse Charge">
          <DataRow label="Applicable" value={source.reverse_charge.applicable ? 'Yes' : 'No'} />
          <DataRow label="For Imported Services" value={source.reverse_charge.for_imported_services ? 'Yes' : 'No'} />
        </SubSection>
      )}
    </SectionCard>
  );
}

function PayrollSection({ data }: { data: any }) {
  // Find payroll key
  const payroll = data.payroll_taxes || data.employer_contributions || data.payroll_contributions_employer ||
    data.employer_social_contributions || data.payroll_taxes_employer || data.employer_social_security ||
    data.imss_employer_contributions;
  if (!payroll) return null;

  // Also handle superannuation (AU), state payroll (AU, MX)
  const superannuation = data.superannuation;
  const statePayroll = data.payroll_tax_state || data.state_payroll_tax;

  // Extract total
  const total = payroll.total_employer_approximate ?? payroll.total_employer_approximate_pct ?? payroll.total_approximate;
  const totalVal = typeof total === 'object' ? `${total.min}-${total.max}%` : total !== undefined ? `${total}%` : null;

  return (
    <SectionCard title="Payroll / Employer Contributions" icon="👥">
      {totalVal && (
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[#E4E7E9]">
          <div className="text-2xl font-extrabold font-mono text-[#0D0E0F]">{totalVal}</div>
          <p className="text-[11px] text-[#6A6F73]">Total employer burden (approx.)</p>
        </div>
      )}

      {/* Render each component as a bar */}
      <SubSection title="Component Breakdown">
        {Object.entries(payroll).filter(([k]) =>
          !['total_employer_approximate', 'total_employer_approximate_pct', 'total_approximate', 'uma_2024_daily', 'uma_2024_monthly'].includes(k)
        ).map(([k, v]: [string, any]) => {
          if (typeof v === 'number') {
            return <RateBar key={k} label={humanKey(k)} value={v} max={25} />;
          }
          if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
            // Object with rate or min/max
            if (v.rate !== undefined) return <RateBar key={k} label={humanKey(k)} value={v.rate} max={25} />;
            if (v.min !== undefined && v.max !== undefined) {
              return (
                <div key={k} className="flex items-center gap-2 py-1">
                  <span className="text-[10px] text-[#6A6F73] w-[100px] shrink-0 truncate">{humanKey(k)}</span>
                  <div className="flex-1 h-4 bg-[#F1F3F4] rounded overflow-hidden">
                    <div className="h-full rounded bg-[#DDE1E3]" style={{ width: `${(v.max / 25) * 100}%` }} />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#0D0E0F] w-[48px] text-right shrink-0">{v.min}-{v.max}%</span>
                </div>
              );
            }
            // For objects like CPF or EI with sub-fields
            return (
              <div key={k} className="mt-2">
                <p className="text-[10px] font-semibold text-[#0D0E0F] mb-0.5">{humanKey(k)}</p>
                {Object.entries(v).filter(([, sv]) => typeof sv === 'number' || typeof sv === 'string').slice(0, 5).map(([sk, sv]) => (
                  <DataRow key={sk} label={humanKey(sk)} value={typeof sv === 'number' && sk.includes('rate') ? `${sv}%` : String(sv as any)} />
                ))}
              </div>
            );
          }
          if (typeof v === 'string') {
            return <DataRow key={k} label={humanKey(k)} value={v} mono={false} />;
          }
          return null;
        })}
      </SubSection>

      {/* AU: Superannuation */}
      {superannuation && (
        <SubSection title="Superannuation Guarantee">
          <DataRow label="Current Rate" value={`${superannuation.sg_rate_2024_25}%`} accent="#0052C4" />
          <DataRow label="Next Year" value={`${superannuation.sg_rate_2025_26}%`} />
          <DataRow label="Concessional Cap" value={`A$${fmtNum(superannuation.concessional_cap)}`} />
          <DataRow label="Deductible" value={superannuation.deductible ? 'Yes' : 'No'} />
        </SubSection>
      )}

      {/* State payroll taxes */}
      {statePayroll && (
        <SubSection title="State/Provincial Payroll Tax">
          {Object.entries(statePayroll).filter(([k]) => k !== 'range').slice(0, 8).map(([k, v]: [string, any]) => {
            if (typeof v === 'number') return <RateBar key={k} label={humanKey(k)} value={v} max={10} color="#6A6F73" />;
            if (typeof v === 'object' && v.rate !== undefined) return <RateBar key={k} label={humanKey(k)} value={v.rate} max={10} color="#6A6F73" />;
            return null;
          })}
          {statePayroll.range && (
            <p className="text-[10px] text-[#6A6F73] mt-1">Range: {statePayroll.range.min}% - {statePayroll.range.max}%</p>
          )}
        </SubSection>
      )}
    </SectionCard>
  );
}

function WithholdingTaxSection({ data }: { data: any }) {
  const wht = data.withholding_taxes_nonresident ?? data.withholding_taxes?.pph_26_nonresident;
  if (!wht) return null;

  const rows: { type: string; rate: string; treaty?: string }[] = [];

  for (const [k, v] of Object.entries(wht)) {
    if (v === null || v === undefined) continue;
    if (typeof v === 'number') {
      rows.push({ type: humanKey(k), rate: `${v}%`, treaty: undefined });
    } else if (typeof v === 'object') {
      const obj = v as any;
      const defaultRate = obj.default ?? obj.general ?? obj.min;
      const treaty = obj.treaty_range ?? obj.us_treaty ?? obj.treaty;
      rows.push({
        type: humanKey(k),
        rate: defaultRate !== undefined ? `${defaultRate}%` : JSON.stringify(v),
        treaty: treaty !== undefined ? String(treaty) : undefined,
      });
    }
  }

  return (
    <SectionCard title="Withholding Taxes (Non-Resident)" icon="🌐">
      <MiniTable
        headers={['Income Type', 'Default Rate', 'Treaty Rate']}
        rows={rows.map((r) => [
          r.type,
          <span key="r" className="font-bold" style={{ color: parseFloat(r.rate) === 0 ? '#0052C4' : parseFloat(r.rate) >= 25 ? '#CC2727' : '#0D0E0F' }}>{r.rate}</span>,
          r.treaty ? <Badge key="t" color="teal">{r.treaty}</Badge> : <span key="t" className="text-[#DDE1E3]">—</span>,
        ])}
      />

      {/* ID: Domestic WHT */}
      {data.withholding_taxes?.pph_23_domestic && (
        <SubSection title="Domestic WHT (PPh 23)">
          {Object.entries(data.withholding_taxes.pph_23_domestic).map(([k, v]: [string, any]) => (
            <DataRow key={k} label={humanKey(k)} value={`${v}%`} />
          ))}
        </SubSection>
      )}

      {/* ID: Final taxes */}
      {data.withholding_taxes?.pph_4_2_final && (
        <SubSection title="Final Taxes (PPh 4(2))">
          {Object.entries(data.withholding_taxes.pph_4_2_final).map(([k, v]: [string, any]) => {
            if (typeof v === 'number') return <DataRow key={k} label={humanKey(k)} value={`${v}%`} />;
            if (typeof v === 'object' && v.min !== undefined) return <DataRow key={k} label={humanKey(k)} value={`${v.min}-${v.max}%`} />;
            return null;
          })}
        </SubSection>
      )}
    </SectionCard>
  );
}

function DeductionsSection({ ded, data }: { ded: any; data: any }) {
  if (!ded) return null;

  return (
    <SectionCard title="Deductions & Allowances" icon="📋">
      {/* Depreciation */}
      {(ded.depreciation || ded.cca || ded.decline_in_value || ded.capital_allowances) && (() => {
        const dep = ded.depreciation || ded.cca || ded.decline_in_value || ded.capital_allowances;

        // US: MACRS Classes
        if (dep.macrs_classes) {
          return (
            <SubSection title="Depreciation (MACRS)">
              <DataRow label="Section 179 Limit" value={`$${fmtNum(dep.section_179_limit)}`} accent="#0052C4" />
              <DataRow label="Bonus Depreciation (2024)" value={`${dep.bonus_depreciation_2024}%`} />
              <MiniTable
                headers={['Years', 'Method', 'Example']}
                rows={dep.macrs_classes.map((c: any) => [
                  `${c.years} yr`,
                  <Badge key="m" color="gray">{c.method}</Badge>,
                  c.example,
                ])}
              />
            </SubSection>
          );
        }

        // CA: CCA Classes
        if (dep.major_classes) {
          return (
            <SubSection title="Capital Cost Allowance (CCA)">
              {dep.immediate_expensing_ccpc && (
                <DataRow label="Immediate Expensing (CCPC)" value={`$${fmtNum(dep.immediate_expensing_ccpc.limit)}`} accent="#0052C4" />
              )}
              <MiniTable
                headers={['Class', 'Rate', 'Method', 'Description']}
                rows={dep.major_classes.map((c: any) => [
                  `${c.class}`,
                  `${c.rate}%`,
                  <Badge key="m" color="gray">{c.method}</Badge>,
                  c.description,
                ])}
              />
            </SubSection>
          );
        }

        // AU: Decline in Value
        if (dep.key_assets && dep.methods) {
          return (
            <SubSection title="Decline in Value">
              <div className="flex gap-1 mb-2">
                {dep.methods.map((m: string) => <Badge key={m} color="gray">{humanKey(m)}</Badge>)}
              </div>
              <MiniTable
                headers={['Asset', 'Life', 'DV Rate', 'PC Rate']}
                rows={dep.key_assets.map((a: any) => [
                  a.asset,
                  typeof a.life === 'number' ? `${a.life} yr` : a.life,
                  a.dv_rate ? `${a.dv_rate}%` : a.rate ? `${a.rate}%` : '—',
                  a.pc_rate ? `${a.pc_rate}%` : '—',
                ])}
              />
              {dep.car_limit_2024_25 && <DataRow label="Car Depreciation Limit" value={`A$${fmtNum(dep.car_limit_2024_25)}`} />}
            </SubSection>
          );
        }

        // SG: Capital Allowances
        if (dep.key_assets && dep.section_19) {
          return (
            <SubSection title="Capital Allowances">
              <DataRow label="Standard Write-Off (S.19)" value={`${dep.section_19.years} years @ ${dep.section_19.annual_rate_pct}%`} />
              {dep.section_19a?.one_year_option && <DataRow label="Accelerated (S.19A)" value="1-year option available" accent="#0052C4" />}
              <MiniTable
                headers={['Asset', 'Years', 'Rate']}
                rows={dep.key_assets.map((a: any) => [
                  a.asset,
                  `${a.years} yr`,
                  `${a.rate_pct}%`,
                ])}
              />
            </SubSection>
          );
        }

        // ID: Tangible depreciation groups
        if (dep.tangible_non_building) {
          return (
            <SubSection title="Depreciation">
              <p className="text-[10px] font-semibold text-[#0D0E0F] mb-1">Tangible Assets (Non-Building)</p>
              <MiniTable
                headers={['Group', 'Life', 'SL Rate', 'DB Rate', 'Examples']}
                rows={dep.tangible_non_building.map((g: any) => [
                  `Grp ${g.group}`,
                  `${g.useful_life} yr`,
                  `${g.sl_rate}%`,
                  `${g.db_rate}%`,
                  g.examples,
                ])}
              />
              {dep.buildings && (
                <>
                  <p className="text-[10px] font-semibold text-[#0D0E0F] mt-2 mb-1">Buildings</p>
                  {dep.buildings.map((b: any, i: number) => (
                    <DataRow key={i} label={humanKey(b.type)} value={`${b.rate}% (${b.useful_life} yr)`} />
                  ))}
                </>
              )}
            </SubSection>
          );
        }

        // BR/MX: Simple rate tables
        if (dep.rates) {
          return (
            <SubSection title={dep.method ? `Depreciation (${humanKey(dep.method)})` : 'Depreciation'}>
              <MiniTable
                headers={['Asset', 'Rate', 'Life']}
                rows={Object.entries(dep.rates).map(([k, v]: [string, any]) => [
                  humanKey(k),
                  typeof v === 'object' ? `${v.rate}%` : `${v}%`,
                  typeof v === 'object' && v.life ? `${v.life} yr` : '—',
                ])}
              />
              {dep.vehicle_cap && <DataRow label="Vehicle Cap" value={fmtNum(dep.vehicle_cap)} />}
              {dep.accelerated_shifts && (
                <>
                  <p className="text-[10px] font-semibold text-[#0D0E0F] mt-2 mb-1">Shift Multipliers</p>
                  {Object.entries(dep.accelerated_shifts).map(([k, v]) => (
                    <DataRow key={k} label={humanKey(k)} value={`${v}x`} />
                  ))}
                </>
              )}
            </SubSection>
          );
        }

        return null;
      })()}

      {/* NOL / Losses */}
      {(ded.nol || ded.losses) && (() => {
        const nol = ded.nol || ded.losses;
        return (
          <SubSection title="Net Operating Losses">
            <DataRow label="Carry Forward" value={nol.carry_forward ?? nol.revenue_carry_forward ?? nol.non_capital_carry_forward ?? nol.carry_forward_years ?? 'N/A'} />
            <DataRow label="Carry Back" value={
              nol.carry_back === false ? 'Not allowed' :
              nol.carry_back === true ? 'Allowed' :
              nol.carry_back === 0 ? 'Not allowed' :
              nol.revenue_carry_back ?? nol.non_capital_carry_back ?? nol.carry_back ?? 'N/A'
            } accent={nol.carry_back === false || nol.carry_back === 0 ? '#CC2727' : '#0052C4'} />
            {nol.limitation_pct !== undefined && <DataRow label="Annual Limitation" value={`${nol.limitation_pct}% of taxable income`} />}
            {nol.annual_limitation_pct !== undefined && <DataRow label="Annual Limitation" value={`${nol.annual_limitation_pct}% of taxable income`} />}
            {nol.carry_back_cap && <DataRow label="Carry Back Cap" value={fmtNum(nol.carry_back_cap)} />}
            {nol.group_relief !== undefined && <DataRow label="Group Relief" value={nol.group_relief ? 'Available' : 'No'} accent={nol.group_relief ? '#0052C4' : undefined} />}
            {nol.continuity_of_ownership_test !== undefined && <DataRow label="Continuity Test" value="Required" />}
            {nol.capital_gains_inclusion_rate !== undefined && <DataRow label="Capital Gains Inclusion" value={`${nol.capital_gains_inclusion_rate}%`} />}
          </SubSection>
        );
      })()}

      {/* Interest Limitation */}
      {(ded.interest_limitation || ded.thin_capitalization || ded.thin_capitalisation || ded.interest_limitation_eifel) && (() => {
        const il = ded.interest_limitation || ded.interest_limitation_eifel;
        const tc = ded.thin_capitalization || ded.thin_capitalisation;
        return (
          <SubSection title="Interest Deduction Limits">
            {il?.pct_of_ati && <DataRow label="EBITDA Limit" value={`${il.pct_of_ati}% of ATI`} />}
            {il?.pct_of_ebitda && <DataRow label="EBITDA Limit" value={`${il.pct_of_ebitda}%`} />}
            {il?.exemption_threshold && <DataRow label="Exemption Threshold" value={fmtNum(il.exemption_threshold)} />}
            {il?.de_minimis && <DataRow label="De Minimis" value={fmtNum(il.de_minimis)} />}
            {il?.transfer_pricing_based && <DataRow label="Method" value="Transfer pricing (arm&apos;s length)" mono={false} />}
            {il?.no_specific_thin_cap_rule && <Badge color="teal">No Fixed Thin Cap Ratio</Badge>}
            {tc?.debt_equity_ratio && <DataRow label="Debt-Equity Ratio" value={tc.debt_equity_ratio} />}
            {tc?.related_party_ratio && <DataRow label="Related Party D/E" value={tc.related_party_ratio} />}
            {tc?.safe_harbour_pct && <DataRow label="Safe Harbour" value={`${tc.safe_harbour_pct}% debt-to-assets`} />}
            {tc?.tax_haven_ratio && <DataRow label="Tax Haven D/E" value={tc.tax_haven_ratio} accent="#CC2727" />}
            {tc?.new_fixed_ratio_test_pct_ebitda && <DataRow label="New EBITDA Test" value={`${tc.new_fixed_ratio_test_pct_ebitda}%`} />}
          </SubSection>
        );
      })()}

      {/* R&D */}
      {(ded.rnd || ded.rnd_super_deduction || ded.rnd_lei_do_bem || ded.sred || data.rnd_tax_incentive) && (() => {
        const rnd = ded.rnd;
        const srd = ded.rnd_super_deduction;
        const lei = ded.rnd_lei_do_bem;
        const sred = ded.sred;
        const auRnd = data.rnd_tax_incentive;

        return (
          <SubSection title="R&D Tax Incentives">
            {/* US */}
            {rnd?.regular_credit_rate && (
              <>
                <DataRow label="Regular Credit Rate" value={`${rnd.regular_credit_rate}%`} accent="#0052C4" />
                <DataRow label="Alternative Simplified Credit" value={`${rnd.asc_rate}%`} />
                <DataRow label="Domestic Amortization" value={`${rnd.amortization_domestic_years} years`} />
              </>
            )}
            {/* MX */}
            {rnd?.credit_rate && (
              <>
                <DataRow label="Credit Rate" value={`${rnd.credit_rate}%`} accent="#0052C4" />
                <DataRow label="Max Credit" value={fmtNum(rnd.max_credit)} />
                <DataRow label="Basis" value={humanKey(rnd.basis)} mono={false} />
              </>
            )}
            {/* SG */}
            {rnd?.enhanced_deduction_pct && !rnd.regular_credit_rate && (
              <>
                <DataRow label="Enhanced Deduction" value={`${rnd.enhanced_deduction_pct}%`} accent="#0052C4" />
                <DataRow label="IP Registration" value={`${rnd.ip_registration_enhanced_pct}% deduction`} />
                {rnd.innovation_allowance && (
                  <div className="mt-1 bg-[#F0F6FE] border border-[#0052C4]/20 rounded p-2">
                    <p className="text-[9px] font-bold text-[#0052C4] uppercase mb-1">Enterprise Innovation Scheme (EIS)</p>
                    <DataRow label="Enhanced Deduction" value={`${rnd.innovation_allowance.enhanced_deduction_pct}%`} accent="#0052C4" />
                    <DataRow label="Cap Per Activity" value={`S$${fmtNum(rnd.innovation_allowance.cap_per_activity)}`} />
                    <DataRow label="Cash Payout Option" value={`${rnd.innovation_allowance.cash_payout_rate_pct}% (cap S$${fmtNum(rnd.innovation_allowance.cash_payout_cap)})`} accent="#0052C4" />
                  </div>
                )}
              </>
            )}
            {/* CA: SR&ED */}
            {sred && (
              <>
                <DataRow label="CCPC Enhanced Rate" value={`${sred.ccpc_enhanced_rate}%`} accent="#0052C4" />
                <DataRow label="Expenditure Limit" value={`C$${fmtNum(sred.ccpc_expenditure_limit)}`} />
                <DataRow label="Other Corp Rate" value={`${sred.other_corp_rate}%`} />
                <DataRow label="Refundable (CCPC)" value={sred.refundable_ccpc ? 'Yes' : 'No'} accent={sred.refundable_ccpc ? '#0052C4' : undefined} />
                <DataRow label="Carry Forward" value={`${sred.carry_forward_years} years`} />
              </>
            )}
            {/* ID: Super Deduction */}
            {srd && (
              <MiniTable
                headers={['Tier', 'Deduction', 'Requirement']}
                rows={Object.entries(srd).map(([k, v]: [string, any]) => [
                  humanKey(k),
                  <Badge key="d" color="teal">{v.total_deduction}%</Badge>,
                  v.requirement,
                ])}
              />
            )}
            {/* BR: Lei do Bem */}
            {lei && (
              <>
                <DataRow label="Base Deduction" value={`${lei.base_deduction}%`} />
                <DataRow label="Additional" value={`+${lei.additional_deduction}%`} accent="#0052C4" />
                <DataRow label="If Headcount Increase" value={`+${lei.additional_if_headcount_increase}%`} accent="#0052C4" />
                <DataRow label="If Patent Filed" value={`+${lei.additional_if_patent}%`} accent="#0052C4" />
              </>
            )}
            {/* AU: R&D Tax Incentive */}
            {auRnd && (
              <>
                <p className="text-[10px] font-semibold text-[#0D0E0F] mb-0.5">Small Company (&lt;A$20M turnover)</p>
                <DataRow label="Offset Rate" value={`${auRnd.small_company.effective_rate_25pct_entity}%`} accent="#0052C4" />
                <DataRow label="Refundable" value={auRnd.small_company.refundable ? 'Yes' : 'No'} accent="#0052C4" />
                <DataRow label="Refund Cap" value={`A$${fmtNum(auRnd.small_company.refund_cap)}`} />
                <p className="text-[10px] font-semibold text-[#0D0E0F] mt-2 mb-0.5">Large Company</p>
                <DataRow label="Base Rate" value={`${auRnd.large_company.effective_rate_30pct_entity}%`} />
                <DataRow label="Intensity Premium" value={`${auRnd.large_company.intensity_effective_rate}% (above ${auRnd.large_company.intensity_threshold_pct}% R&D intensity)`} accent="#0052C4" />
                <DataRow label="Annual Cap" value={`A$${fmtNum(auRnd.large_company.annual_cap)}`} />
              </>
            )}
          </SubSection>
        );
      })()}

      {/* Charitable */}
      {ded.charitable && (
        <SubSection title="Charitable Deductions">
          {ded.charitable.cash_limit_pct && <DataRow label="Cash Limit" value={`${ded.charitable.cash_limit_pct}% of taxable income`} />}
          {ded.charitable.max_pct_of_income && <DataRow label="Max" value={`${ded.charitable.max_pct_of_income}% of income`} />}
          {ded.charitable.deduction_multiplier && <DataRow label="Multiplier" value={`${ded.charitable.deduction_multiplier}x`} accent="#0052C4" />}
          {ded.charitable.limit_pct_prior_year_income && <DataRow label="Limit" value={`${ded.charitable.limit_pct_prior_year_income}% of prior year income`} />}
          {ded.charitable.oscip_limit_pct_operating_profit && <DataRow label="OSCIP Limit" value={`${ded.charitable.oscip_limit_pct_operating_profit}% of operating profit`} />}
          {ded.charitable.carry_forward_years && <DataRow label="Carry Forward" value={`${ded.charitable.carry_forward_years} years`} />}
          {ded.charitable.max_deduction === 'no_cap' && <Badge color="teal">No Cap</Badge>}
          {ded.charitable.deductible_categories && (
            <div className="flex flex-wrap gap-1 mt-1">
              {ded.charitable.deductible_categories.map((c: string) => <Badge key={c} color="gray">{humanKey(c)}</Badge>)}
            </div>
          )}
        </SubSection>
      )}

      {/* Other deductions */}
      {ded.meals_deduction_pct !== undefined && (
        <DataRow label="Meals Deduction" value={`${ded.meals_deduction_pct}%`} />
      )}
      {ded.entertainment_deduction_pct !== undefined && (
        <DataRow label="Entertainment Deduction" value={`${ded.entertainment_deduction_pct}%`} accent={ded.entertainment_deduction_pct === 0 ? '#CC2727' : undefined} />
      )}

      {/* BR: JCP */}
      {ded.jcp_interest_on_equity && (
        <SubSection title="Interest on Equity (JCP)">
          <DataRow label="Deductible" value="Yes" accent="#0052C4" />
          <DataRow label="Rate Limit" value={ded.jcp_interest_on_equity.rate_limit} mono={false} />
          <DataRow label="WHT on Payment" value={`${ded.jcp_interest_on_equity.wht_on_payment}%`} />
          <DataRow label="Net Benefit" value={`${ded.jcp_interest_on_equity.net_benefit_pct}%`} accent="#0052C4" />
        </SubSection>
      )}

      {/* AU: Small business */}
      {ded.small_business && (
        <SubSection title="Small Business Concessions">
          <DataRow label="Instant Write-Off" value={`A$${fmtNum(ded.small_business.instant_write_off_threshold)}`} accent="#0052C4" />
          <DataRow label="Pool First Year" value={`${ded.small_business.pool_first_year_rate}%`} />
          <DataRow label="Pool Subsequent" value={`${ded.small_business.pool_subsequent_rate}%`} />
          <DataRow label="Turnover Threshold" value={`A$${fmtNum(ded.small_business.turnover_threshold)}`} />
        </SubSection>
      )}
    </SectionCard>
  );
}

function InternationalInvestorsSection({ ii, data }: { ii: any; data: any }) {
  if (!ii) return null;

  return (
    <SectionCard title="International Investors" icon="🌍">
      {/* Screening */}
      {ii.screening && (
        <SubSection title="Foreign Investment Screening">
          <DataRow label="Body" value={ii.screening.body} mono={false} />
          {ii.screening.threshold && <DataRow label="Threshold" value={humanKey(String(ii.screening.threshold))} mono={false} />}
          {ii.screening.review_timeline_days && <DataRow label="Review Timeline" value={`${ii.screening.review_timeline_days} days`} />}
          {ii.screening.wto_threshold_cad && <DataRow label="WTO Threshold" value={`C$${fmtNum(ii.screening.wto_threshold_cad)}`} />}
          {ii.screening.business_threshold_agreement_aud && <DataRow label="Business Threshold" value={`A$${fmtNum(ii.screening.business_threshold_agreement_aud)}`} />}
          {ii.screening.minimum_investment_idr && <DataRow label="Min Investment" value={`IDR ${fmtNum(ii.screening.minimum_investment_idr)}`} />}
          {ii.screening.restricted_zone && <DataRow label="Restricted Zone" value={ii.screening.restricted_zone} mono={false} />}
          {ii.screening.mandatory_filing_sectors && (
            <div className="flex flex-wrap gap-1 mt-1">
              {ii.screening.mandatory_filing_sectors.map((s: string) => <Badge key={s} color="amber">{humanKey(s)}</Badge>)}
            </div>
          )}
          {ii.screening.legal_basis && <p className="text-[9px] text-[#6A6F73] mt-1 font-mono">{ii.screening.legal_basis}</p>}
        </SubSection>
      )}

      {/* Branch vs Subsidiary */}
      {ii.branch_vs_subsidiary && (
        <SubSection title="Branch vs Subsidiary">
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-[#E4E7E9] rounded-lg p-3">
              <p className="text-[9px] font-bold text-[#6A6F73] uppercase tracking-wider mb-2">Branch</p>
              <DataRow label="Tax Rate" value={`${ii.branch_vs_subsidiary.branch_tax_rate_pct}%`} />
              <DataRow label="Profits Tax" value={`${ii.branch_vs_subsidiary.branch_profits_tax_pct ?? ii.branch_vs_subsidiary.branch_remittance_tax_pct ?? 0}%`}
                accent={ii.branch_vs_subsidiary.branch_profits_tax_pct === 0 ? '#0052C4' : undefined} />
              <p className="text-[10px] font-mono font-bold mt-1">
                Total: {(ii.branch_vs_subsidiary.branch_tax_rate_pct + (ii.branch_vs_subsidiary.branch_profits_tax_pct ?? ii.branch_vs_subsidiary.branch_remittance_tax_pct ?? 0)).toFixed(1)}%
              </p>
            </div>
            <div className="border border-[#E4E7E9] rounded-lg p-3">
              <p className="text-[9px] font-bold text-[#6A6F73] uppercase tracking-wider mb-2">Subsidiary</p>
              <DataRow label="Tax Rate" value={`${ii.branch_vs_subsidiary.subsidiary_tax_rate_pct}%`} />
              <DataRow label="Dividend WHT" value={`${ii.branch_vs_subsidiary.subsidiary_dividend_wht_pct ?? ii.branch_vs_subsidiary.subsidiary_dividend_wht_unfranked_pct ?? 0}%`}
                accent={(ii.branch_vs_subsidiary.subsidiary_dividend_wht_pct ?? ii.branch_vs_subsidiary.subsidiary_dividend_wht_unfranked_pct ?? 0) === 0 ? '#0052C4' : undefined} />
              <p className="text-[10px] font-mono font-bold mt-1">
                Total: {(ii.branch_vs_subsidiary.subsidiary_tax_rate_pct + (ii.branch_vs_subsidiary.subsidiary_dividend_wht_pct ?? ii.branch_vs_subsidiary.subsidiary_dividend_wht_unfranked_pct ?? 0)).toFixed(1)}%
              </p>
              {ii.branch_vs_subsidiary.subsidiary_pte_eligible && <Badge color="teal">PTE Eligible</Badge>}
            </div>
          </div>
        </SubSection>
      )}

      {/* Repatriation */}
      {ii.repatriation && (
        <SubSection title="Repatriation">
          <DataRow label="FX Controls" value={humanKey(ii.repatriation.fx_controls)} mono={false}
            accent={ii.repatriation.fx_controls === 'none' ? '#0052C4' : '#CC8727'} />
          <DataRow label="Dividend Restrictions" value={humanKey(ii.repatriation.dividend_restrictions ?? 'none')} mono={false} />
          <DataRow label="Central Bank Registration" value={ii.repatriation.central_bank_registration ? 'Required' : 'Not required'}
            accent={ii.repatriation.central_bank_registration ? '#CC8727' : '#0052C4'} />
          {ii.repatriation.iof_on_fx && <Badge color="amber">IOF on FX Applies</Badge>}
          {ii.repatriation.cide_on_royalties_pct && <DataRow label="CIDE on Royalties" value={`${ii.repatriation.cide_on_royalties_pct}%`} accent="#CC8727" />}
        </SubSection>
      )}

      {/* FTC */}
      {ii.foreign_tax_credit && (
        <SubSection title="Foreign Tax Credit">
          <DataRow label="Method" value={humanKey(ii.foreign_tax_credit.method)} mono={false} />
          <DataRow label="Limitation" value={humanKey(ii.foreign_tax_credit.limitation)} mono={false} />
          {ii.foreign_tax_credit.carry_forward_years !== undefined && (
            <DataRow label="Carry Forward" value={ii.foreign_tax_credit.carry_forward_years === 0 ? 'None' : `${ii.foreign_tax_credit.carry_forward_years} years`} />
          )}
          {ii.foreign_tax_credit.carry_back_years !== undefined && ii.foreign_tax_credit.carry_back_years > 0 && (
            <DataRow label="Carry Back" value={`${ii.foreign_tax_credit.carry_back_years} year(s)`} accent="#0052C4" />
          )}
          {ii.foreign_tax_credit.reciprocity_required && <Badge color="amber">Reciprocity Required</Badge>}
          {ii.foreign_tax_credit.unilateral_credit && <Badge color="teal">Unilateral Credit</Badge>}
        </SubSection>
      )}

      {/* CFC Rules */}
      {ii.cfc_rules && (
        <SubSection title="CFC Rules">
          {ii.cfc_rules.has_cfc ? (
            <>
              <div className="flex gap-1.5 mb-2">
                <Badge color="amber">CFC Regime Active</Badge>
                {ii.cfc_rules.active_income_exemption && <Badge color="teal">Active Income Exempt</Badge>}
              </div>
              <DataRow label="Regime" value={ii.cfc_rules.regime_name} mono={false} />
              {ii.cfc_rules.ownership_threshold_pct && <DataRow label="Ownership Threshold" value={`${ii.cfc_rules.ownership_threshold_pct}%`} />}
              {ii.cfc_rules.minimum_effective_rate_pct && <DataRow label="Min Effective Rate" value={`${ii.cfc_rules.minimum_effective_rate_pct}%`} />}
              {ii.cfc_rules.effective_rate_threshold_pct && <DataRow label="Effective Rate Threshold" value={`${ii.cfc_rules.effective_rate_threshold_pct}%`} />}
            </>
          ) : (
            <div className="flex gap-1.5">
              <Badge color="teal">No CFC Rules</Badge>
              {ii.cfc_rules.territorial_system && <Badge color="teal">Territorial System</Badge>}
            </div>
          )}
        </SubSection>
      )}

      {/* Treaty Network */}
      {(ii.treaty_network || data.double_tax_agreements) && (() => {
        const tn = ii.treaty_network || {};
        const dta = data.double_tax_agreements || {};
        const count = tn.total_comprehensive_treaties ?? dta.number_of_treaties ?? 0;
        return (
          <SubSection title="Treaty Network">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl font-extrabold font-mono text-[#0052C4]">{count}</div>
              <p className="text-[11px] text-[#6A6F73]">comprehensive treaties</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {tn.has_lob && <Badge color="gray">LOB Clauses</Badge>}
              {tn.has_ppt && <Badge color="gray">PPT Clauses</Badge>}
              {tn.limited_treaties && <Badge color="gray">{tn.limited_treaties} Limited Treaties</Badge>}
            </div>
            {tn.notable_missing && (
              <p className="text-[10px] text-[#CC8727] mt-1">Notable missing: {tn.notable_missing.join(', ')}</p>
            )}
            {dta.key_treaties && (
              <div className="flex flex-wrap gap-1 mt-1">
                {dta.key_treaties.slice(0, 10).map((t: string) => <Badge key={t} color="blue">{t}</Badge>)}
              </div>
            )}
          </SubSection>
        );
      })()}

      {/* PE Rules */}
      {ii.pe_rules && (
        <SubSection title="Permanent Establishment Rules">
          <DataRow label="Construction PE" value={`${ii.pe_rules.construction_pe_months} months`} />
          {ii.pe_rules.service_pe_days && <DataRow label="Service PE" value={`${ii.pe_rules.service_pe_days} days`} />}
          {ii.pe_rules.service_pe_months && <DataRow label="Service PE" value={`${ii.pe_rules.service_pe_months} months`} />}
          <DataRow label="Digital PE" value={ii.pe_rules.digital_pe ? 'Yes' : 'No'} accent={ii.pe_rules.digital_pe ? '#CC8727' : '#0052C4'} />
          <DataRow label="Dependent Agent PE" value={ii.pe_rules.dependent_agent_pe ? 'Yes' : 'No'} />
          {ii.pe_rules.maquiladora_safe_harbor && <Badge color="teal">Maquiladora Safe Harbor</Badge>}
          {ii.pe_rules.dpt_rate_pct && <DataRow label="Diverted Profits Tax" value={`${ii.pe_rules.dpt_rate_pct}%`} accent="#CC2727" />}
        </SubSection>
      )}

      {/* Nonresident taxation extras */}
      {ii.nonresident_taxation && (
        <SubSection title="Nonresident Taxation">
          {ii.nonresident_taxation.capital_gains_tax === false && <Badge color="teal">No Capital Gains Tax</Badge>}
          {ii.nonresident_taxation.cgt_shares_default_pct !== undefined && ii.nonresident_taxation.cgt_shares_default_pct === 0 && <Badge color="teal">No CGT on Shares</Badge>}
          {ii.nonresident_taxation.exit_tax === false && <Badge color="teal">No Exit Tax</Badge>}
          {ii.nonresident_taxation.cgt_usrpi_pct && <DataRow label="CGT on US Real Property" value={`${ii.nonresident_taxation.cgt_usrpi_pct}%`} />}
          {ii.nonresident_taxation.firpta_withholding_pct && <DataRow label="FIRPTA Withholding" value={`${ii.nonresident_taxation.firpta_withholding_pct}%`} />}
          {ii.nonresident_taxation.cgt_tap_only && <Badge color="teal">CGT on Taxable AU Property Only</Badge>}
          {ii.nonresident_taxation.cgt_withholding_pct && <DataRow label="CGT Withholding" value={`${ii.nonresident_taxation.cgt_withholding_pct}%`} />}
          {ii.nonresident_taxation.cgt_shares_unlisted_pct && <DataRow label="CGT Unlisted Shares" value={`${ii.nonresident_taxation.cgt_shares_unlisted_pct}%`} />}
          {ii.nonresident_taxation.cgt_shares_listed_pct !== undefined && <DataRow label="CGT Listed Shares" value={`${ii.nonresident_taxation.cgt_shares_listed_pct}%`} />}
          {ii.nonresident_taxation.stamp_duty_shares_pct && <DataRow label="Stamp Duty (Shares)" value={`${ii.nonresident_taxation.stamp_duty_shares_pct}%`} />}
          {ii.nonresident_taxation.dividend_wht_reinvested_pct !== undefined && ii.nonresident_taxation.dividend_wht_reinvested_pct === 0 && (
            <Badge color="teal">0% WHT if Reinvested</Badge>
          )}
        </SubSection>
      )}
    </SectionCard>
  );
}

function IncomeBySourceSection({ ibs }: { ibs: any }) {
  if (!ibs) return null;

  const sources = Object.entries(ibs);
  if (sources.length === 0) return null;

  return (
    <SectionCard title="Income by Source" icon="💰">
      {sources.map(([key, info]: [string, any]) => {
        if (!info || typeof info !== 'object') return null;
        const legalBasis = info.legal_basis;
        // Get the primary rate
        const rateKeys = Object.keys(info).filter(k =>
          (k.includes('rate') || k.includes('pct')) && typeof info[k] === 'number' && k !== 'legal_basis'
        );
        const primaryRateKey = rateKeys.find(k => k.includes('domestic_rate') || k.includes('standard_rate') || k.includes('corporate_rate') || k === 'rate_pct') || rateKeys[0];
        const primaryRate = primaryRateKey ? info[primaryRateKey] : null;

        return (
          <div key={key} className="py-2.5 border-b border-[#F1F3F4] last:border-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-bold text-[#0D0E0F]">{humanKey(key)}</p>
              {primaryRate !== null && (
                <span className="text-[11px] font-mono font-bold text-[#0D0E0F]">{primaryRate}%</span>
              )}
            </div>
            {/* Notable fields */}
            <div className="flex flex-wrap gap-1 mb-1">
              {info.patent_box === false && <Badge color="gray">No Patent Box</Badge>}
              {info.patent_box === true && <Badge color="teal">Patent Box</Badge>}
              {info.domestic_exempt && <Badge color="teal">Domestic Exempt</Badge>}
              {info.one_tier_exempt && <Badge color="teal">One-Tier Exempt</Badge>}
              {info.has_cgt === false && <Badge color="teal">No CGT</Badge>}
              {info.like_kind_exchange && <Badge color="teal">1031 Exchange</Badge>}
              {info.municipal_bond_exempt && <Badge color="teal">Muni Bonds Exempt</Badge>}
              {info.fsie_exempt && <Badge color="teal">FSIE Exempt</Badge>}
              {info.section_245a_exemption && <Badge color="teal">245A Participation</Badge>}
              {info.conduit_foreign_income_exempt && <Badge color="teal">CFI Exempt</Badge>}
              {info.intercorporate_deduction && <Badge color="teal">Intercorp Deduction</Badge>}
              {info.foreign_exempt_if_reinvested && <Badge color="teal">Foreign Exempt if Reinvested</Badge>}
              {info.inflation_adjustment && <Badge color="gray">Inflation Adjusted</Badge>}
            </div>
            {/* Key secondary fields */}
            {info.fdii_effective_rate_pct && <DataRow label="FDII Effective" value={`${info.fdii_effective_rate_pct}%`} accent="#0052C4" />}
            {info.qsbs_exclusion_pct && <DataRow label="QSBS Exclusion" value={`${info.qsbs_exclusion_pct}% (${info.qsbs_holding_years}yr hold)`} accent="#0052C4" />}
            {info.rnd_enhanced_deduction_pct && <DataRow label="R&D Enhanced Deduction" value={`${info.rnd_enhanced_deduction_pct}%`} accent="#0052C4" />}
            {info.qds_concessionary_pct && <DataRow label="QDS Concessionary" value={`${info.qds_concessionary_pct}%`} accent="#0052C4" />}
            {info.lcge_qsbc_cad && <DataRow label="LCGE (QSBC)" value={`C$${fmtNum(info.lcge_qsbc_cad)}`} accent="#0052C4" />}
            {info.listed_shares_resident_pct !== undefined && <DataRow label="Listed Shares (Resident)" value={`${info.listed_shares_resident_pct}%`} />}
            {info.listed_shares_final_pct !== undefined && <DataRow label="Listed Shares (Final)" value={`${info.listed_shares_final_pct}%`} />}
            {info.land_building_final_pct !== undefined && <DataRow label="Land/Building (Final)" value={`${info.land_building_final_pct}%`} />}
            {info.bank_deposit_final_pct !== undefined && <DataRow label="Bank Deposit (Final)" value={`${info.bank_deposit_final_pct}%`} />}
            {info.drd_below_20_pct && <DataRow label="DRD (<20%)" value={`${info.drd_below_20_pct}%`} />}
            {info.drd_20_to_80_pct && <DataRow label="DRD (20-80%)" value={`${info.drd_20_to_80_pct}%`} />}
            {info.drd_80_plus_pct && <DataRow label="DRD (80%+)" value={`${info.drd_80_plus_pct}%`} accent="#0052C4" />}
            {info.jcp_irrf_pct && <DataRow label="JCP IRRF" value={`${info.jcp_irrf_pct}%`} />}
            {info.sreit_wht_pct !== undefined && <DataRow label="S-REIT WHT" value={`${info.sreit_wht_pct}%`} />}
            {/* Legal basis */}
            {legalBasis && <p className="text-[9px] text-[#6A6F73] font-mono mt-1">{legalBasis}</p>}
          </div>
        );
      })}
    </SectionCard>
  );
}

function SectorSpecificSection({ sst }: { sst: any }) {
  if (!sst) return null;
  const sectors = Object.entries(sst);
  if (sectors.length === 0) return null;

  return (
    <SectionCard title="Sector-Specific Taxes" icon="🏭">
      {sectors.map(([key, info]: [string, any]) => {
        if (!info || typeof info !== 'object') return null;

        return (
          <div key={key} className="py-2.5 border-b border-[#F1F3F4] last:border-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-bold text-[#0D0E0F]">{humanKey(key)}</p>
              {info.has_dst !== undefined && (
                <Badge color={info.has_dst ? 'amber' : 'teal'}>{info.has_dst ? 'Active' : 'No DST'}</Badge>
              )}
              {info.has_ftt !== undefined && (
                <Badge color={info.has_ftt ? 'amber' : 'teal'}>{info.has_ftt ? 'Active' : 'No FTT'}</Badge>
              )}
              {info.has_ipt !== undefined && (
                <Badge color={info.has_ipt ? 'amber' : 'gray'}>{info.has_ipt ? 'Active' : 'No IPT'}</Badge>
              )}
            </div>
            {/* Notable rate fields */}
            {Object.entries(info).filter(([k, v]) =>
              !['has_dst', 'has_ftt', 'has_ipt', 'has_mining_tax', 'has_agri_regime', 'legal_basis', 'note', 'gambling_legal', 'casino_legal'].includes(k) &&
              typeof v === 'number'
            ).slice(0, 4).map(([k, v]) => (
              <DataRow key={k} label={humanKey(k)} value={fmtPct(v)} />
            ))}
            {/* Range fields */}
            {Object.entries(info).filter(([, v]) =>
              typeof v === 'object' && v !== null && (v as any).min !== undefined && (v as any).max !== undefined
            ).slice(0, 2).map(([k, v]: [string, any]) => (
              <DataRow key={k} label={humanKey(k)} value={`${v.min}-${v.max}%`} />
            ))}
            {/* Note */}
            {info.note && <p className="text-[9px] text-[#6A6F73] mt-0.5 leading-relaxed">{info.note}</p>}
            {info.legal_basis && <p className="text-[9px] text-[#6A6F73] font-mono mt-0.5">{info.legal_basis}</p>}
          </div>
        );
      })}
    </SectionCard>
  );
}

function PassThroughSection({ pt }: { pt: any }) {
  if (!pt) return null;

  return (
    <SectionCard title="Pass-Through / Individual Rates" icon="👤">
      {pt.brackets_single_2024 && (
        <MiniTable
          headers={['Min', 'Max', 'Rate']}
          rows={pt.brackets_single_2024.map((b: any) => [
            `$${fmtNum(b.min)}`,
            b.max ? `$${fmtNum(b.max)}` : '∞',
            <span key="r" className="font-bold">{b.rate}%</span>,
          ])}
        />
      )}
      {pt.qbi_deduction_rate && <DataRow label="QBI Deduction" value={`${pt.qbi_deduction_rate}%`} accent="#0052C4" />}
      {pt.niit_rate && <DataRow label="Net Investment Income Tax" value={`${pt.niit_rate}%`} />}
    </SectionCard>
  );
}

function AdditionalDataSection({ data }: { data: any }) {
  const sections: { key: string; title: string; icon: string }[] = [];

  if (data.fbt) sections.push({ key: 'fbt', title: 'Fringe Benefits Tax', icon: '🎁' });
  if (data.carbon_tax) sections.push({ key: 'carbon_tax', title: 'Carbon Tax', icon: '🌱' });
  if (data.stamp_duty) sections.push({ key: 'stamp_duty', title: 'Stamp Duty', icon: '📄' });
  if (data.ptu_profit_sharing) sections.push({ key: 'ptu_profit_sharing', title: 'Profit Sharing (PTU)', icon: '🤝' });
  if (data.ieps_excise) sections.push({ key: 'ieps_excise', title: 'Excise Tax (IEPS)', icon: '🍺' });
  if (data.mining_tax) sections.push({ key: 'mining_tax', title: 'Mining Tax', icon: '⛏️' });
  if (data.diverted_profits_tax) sections.push({ key: 'diverted_profits_tax', title: 'Diverted Profits Tax', icon: '🔍' });
  if (data.transfer_pricing) sections.push({ key: 'transfer_pricing', title: 'Transfer Pricing', icon: '🔗' });
  if (data.inflation_adjustment) sections.push({ key: 'inflation_adjustment', title: 'Inflation Adjustment', icon: '📈' });
  if (data.tax_reform_2024) sections.push({ key: 'tax_reform_2024', title: 'Tax Reform 2024', icon: '🔄' });
  if (data.cgt_concessions_small_business) sections.push({ key: 'cgt_concessions_small_business', title: 'Small Business CGT Concessions', icon: '🏪' });
  if (data.icms_state_tax) sections.push({ key: 'icms_state_tax', title: 'ICMS State Tax', icon: '🏛️' });

  if (sections.length === 0) return null;

  return (
    <>
      {sections.map(({ key, title, icon }) => {
        const sectionData = data[key];
        if (!sectionData) return null;

        return (
          <SectionCard key={key} title={title} icon={icon}>
            {typeof sectionData === 'object' && !Array.isArray(sectionData) ? (
              <div className="space-y-0">
                {Object.entries(sectionData).map(([k, v]: [string, any]) => {
                  if (v === null || v === undefined) return null;
                  if (typeof v === 'number') {
                    const isRate = k.includes('rate') || k.includes('pct') || k.includes('surcharge');
                    return <DataRow key={k} label={humanKey(k)} value={isRate ? `${v}%` : fmtNum(v)} />;
                  }
                  if (typeof v === 'boolean') return <DataRow key={k} label={humanKey(k)} value={v ? 'Yes' : 'No'} />;
                  if (typeof v === 'string') return <DataRow key={k} label={humanKey(k)} value={v} mono={false} />;
                  if (typeof v === 'object' && v.min !== undefined && v.max !== undefined) {
                    return <DataRow key={k} label={humanKey(k)} value={`${v.min} - ${v.max}`} />;
                  }
                  if (typeof v === 'object' && !Array.isArray(v)) {
                    return (
                      <div key={k} className="mt-2">
                        <p className="text-[10px] font-semibold text-[#0D0E0F] mb-0.5">{humanKey(k)}</p>
                        {Object.entries(v).slice(0, 6).map(([sk, sv]: [string, any]) => {
                          if (typeof sv === 'number') return <DataRow key={sk} label={humanKey(sk)} value={sk.includes('pct') || sk.includes('rate') ? `${sv}%` : fmtNum(sv)} />;
                          if (typeof sv === 'string') return <DataRow key={sk} label={humanKey(sk)} value={sv} mono={false} />;
                          if (typeof sv === 'boolean') return <DataRow key={sk} label={humanKey(sk)} value={sv ? 'Yes' : 'No'} />;
                          return null;
                        })}
                      </div>
                    );
                  }
                  if (Array.isArray(v) && v.length > 0) {
                    if (typeof v[0] === 'string') {
                      return (
                        <div key={k} className="mt-1">
                          <span className="text-[10px] text-[#6A6F73]">{humanKey(k)}: </span>
                          <span className="text-[10px] text-[#0D0E0F]">{v.join(', ')}</span>
                        </div>
                      );
                    }
                    if (typeof v[0] === 'object') {
                      return (
                        <div key={k} className="mt-2">
                          <p className="text-[10px] font-semibold text-[#0D0E0F] mb-0.5">{humanKey(k)}</p>
                          {v.slice(0, 6).map((item: any, i: number) => (
                            <div key={i} className="pl-2 border-l-2 border-[#E4E7E9] mb-1">
                              {Object.entries(item).slice(0, 4).map(([ik, iv]) => (
                                <DataRow key={ik} label={humanKey(ik)} value={typeof iv === 'number' ? (ik.includes('rate') ? `${iv}%` : fmtNum(iv)) : String(iv)} />
                              ))}
                            </div>
                          ))}
                        </div>
                      );
                    }
                  }
                  return null;
                })}
              </div>
            ) : (
              <p className="text-[11px] text-[#0D0E0F]">{JSON.stringify(sectionData)}</p>
            )}
          </SectionCard>
        );
      })}
    </>
  );
}

/* ─────────────────────────── Main Page ──────────────────────────────── */

export default async function CountryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = rawCode as CountryCode;

  if (!COUNTRY_ORDER.includes(code)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-[#6A6F73]">Country not found: {rawCode}</p>
      </div>
    );
  }

  const data = getCountryData(code) as any;
  const summary = getCountrySummary(code);

  // Determine system type
  const ct = data.corporate_tax;
  const isTerritorial = ct?.territorial_system;
  const hasNoCgt = ct?.capital_gains_tax === false;
  const systemType = isTerritorial ? 'Territorial' : 'Worldwide';

  return (
    <div className="space-y-6">
      {/* Country Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{COUNTRY_FLAGS[code]}</span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0D0E0F]">{COUNTRY_LABELS[code]}</h1>
            <p className="text-sm text-[#6A6F73]">{code} &middot; {COUNTRY_CURRENCIES[code]} &middot; Tax Year {data.tax_year}</p>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Badge color={isTerritorial ? 'teal' : 'gray'}>{systemType}</Badge>
          {hasNoCgt && <Badge color="teal">No CGT</Badge>}
          {ct?.imputation && <Badge color="blue">Imputation</Badge>}
          {ct?.regimes && <Badge color="gray">{ct.regimes.length} Tax Regimes</Badge>}
          {ct?.listed_company_rate && <Badge color="teal">Listed Discount</Badge>}
          {ct?.concessionary_rates && <Badge color="teal">Concessionary Rates</Badge>}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Corporate Tax', value: `${summary.corporateRate.toFixed(1)}%`, color: '#0D0E0F', sub: ct?.rate_type ? humanKey(ct.rate_type) : undefined },
          { label: 'VAT / GST', value: `${summary.vatRate.toFixed(1)}%`, color: '#0D0E0F', sub: data.vat_equivalent ? 'Sales tax (state)' : undefined },
          { label: 'Employer Payroll', value: `${summary.payrollRate.toFixed(1)}%`, color: summary.payrollRate > 20 ? '#CC2727' : '#0D0E0F', sub: summary.payrollRate > 20 ? 'High burden' : undefined },
          { label: 'Dividend WHT', value: `${summary.dividendWht.toFixed(1)}%`, color: summary.dividendWht === 0 ? '#0052C4' : summary.dividendWht >= 25 ? '#CC2727' : '#0D0E0F', sub: summary.dividendWht === 0 ? 'Tax efficient' : undefined },
          { label: 'Tax Treaties', value: String(summary.treatyCount), color: '#0052C4', sub: summary.treatyCount >= 80 ? 'Extensive network' : undefined },
        ].map((m) => (
          <div key={m.label} className="bg-white border border-[#E4E7E9] rounded-lg p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6A6F73] mb-1">{m.label}</p>
            <p className="text-2xl font-extrabold tracking-tight font-mono" style={{ color: m.color }}>{m.value}</p>
            {m.sub && <p className="text-[9px] text-[#6A6F73] mt-0.5">{m.sub}</p>}
          </div>
        ))}
      </div>

      {/* Main Data Sections - 2 column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CorporateTaxSection ct={data.corporate_tax} code={code} />
        <IndirectTaxSection data={data} />
        <PayrollSection data={data} />
        <WithholdingTaxSection data={data} />
        <DeductionsSection ded={data.deductions} data={data} />
        <InternationalInvestorsSection ii={data.international_investors} data={data} />
        <IncomeBySourceSection ibs={data.income_by_source} />
        <SectorSpecificSection sst={data.sector_specific_taxes} />
        <PassThroughSection pt={data.pass_through_tax} />
        <AdditionalDataSection data={data} />
      </div>

      {/* Key Insight Callout */}
      <KeyInsight>
        {code === 'SG' && 'Singapore offers one of the most competitive tax regimes globally: 17% headline CIT with effective rates as low as 4.25% for first S$10K, 0% WHT on dividends, no capital gains tax, territorial system with foreign income exemption, and extensive concessionary rates from 0-10% for qualifying activities. The Enterprise Innovation Scheme provides up to 400% R&D deduction.'}
        {code === 'US' && 'The US 21% federal rate is competitive among developed nations, but state taxes (0-11.5%) create significant variation. Key advantages: FDII deduction (13.125% effective for export income), QSBS exclusion (100% for qualified small business), and R&D credits up to 20%. Key challenge: worldwide taxation with Subpart F and GILTI anti-deferral regimes.'}
        {code === 'ID' && 'Indonesia offers aggressive incentives for investment: 0.5% MSME final tax, up to 20-year tax holidays for large investments, and R&D super deductions up to 300%. However, the 20% WHT on dividends and profits (reducible by treaty), moderate FX controls, and mandatory BKPM registration add compliance complexity.'}
        {code === 'CA' && 'Canada\'s combined federal-provincial rates (23-31%) are offset by powerful SR&ED credits: 35% refundable credit for CCPCs on first C$3M. Alberta offers the lowest combined rate (23%). Key advantages: extensive 90-treaty network, 0% interest WHT under treaty with US, and immediate expensing for CCPCs up to C$1.5M.'}
        {code === 'BR' && 'Brazil\'s 34% combined rate (IRPJ + CSLL) is among the highest, but 0% dividend WHT and multiple regime choices (Lucro Real vs Presumido vs Simples) allow optimization. The JCP mechanism provides a deductible equity return with only 15% WHT. Major reform underway: CBS + IBS replacing PIS/COFINS/ICMS/ISS by 2033 at an estimated 26.5% combined rate.'}
        {code === 'MX' && 'Mexico\'s flat 30% CIT is partially offset by northern/southeast border zone incentives (20% effective ISR, 8% IVA) and a 30% R&D credit on incremental spending. The maquiladora safe harbor provides PE protection for foreign manufacturers. Key challenge: 10% dividend WHT on post-2013 earnings and 10% profit-sharing (PTU) obligation.'}
        {code === 'AU' && 'Australia\'s imputation system eliminates dividend double-taxation domestically (refundable franking credits). The 25% base rate entity rate benefits smaller companies. R&D incentives are generous: 43.5% refundable offset for SMEs. Key challenge: 40% Diverted Profits Tax targets profit-shifting, and thin capitalisation rules apply a 30% EBITDA test.'}
      </KeyInsight>
    </div>
  );
}
