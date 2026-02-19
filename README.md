# Business Tax Planning - Multi-Country Tax Code Reference

Comprehensive business tax code mapping for **7 countries**: United States, Indonesia, Canada, Brazil, Mexico, Australia, and Singapore. Each country has detailed documentation covering revenue taxes, taxable income deductions, and **international investor considerations**, with structured data and comparative visualizations.

---

## Project Structure

```
tax-planning/
├── countries/
│   ├── us/
│   │   ├── revenue_tax.md          # Federal & state corporate tax, pass-through, international, payroll
│   │   ├── deductions.md           # Depreciation (MACRS/179/Bonus), NOL, R&D, QBI, charitable
│   │   └── international_investors.md  # CFIUS/FIRRMA, FIRPTA, branch profits tax, FTC, Subpart F/GILTI, 60+ treaties
│   ├── indonesia/
│   │   ├── revenue_tax.md          # PPh Badan, MSME regimes, VAT, WHT, Tax Holiday, KEK
│   │   ├── deductions.md           # 4-group depreciation, super deduction R&D, thin cap, losses
│   │   └── international_investors.md  # BKPM/OSS, Positive Investment List, PPh 26, CFC, 70+ DTAs
│   ├── canada/
│   │   ├── revenue_tax.md          # Federal/provincial CIT, SBD, GST/HST, CPP/EI, carbon tax
│   │   ├── deductions.md           # CCA classes, SR&ED, EIFEL, loss rules, resource deductions
│   │   └── international_investors.md  # Investment Canada Act, non-resident CGT, branch tax, FAPI, 90+ DTAs
│   ├── brazil/
│   │   ├── revenue_tax.md          # Lucro Real/Presumido/Simples, PIS/COFINS, ICMS, ISS
│   │   ├── deductions.md           # Depreciation (shift-based), JCP, Lei do Bem R&D, thin cap
│   │   └── international_investors.md  # Sector caps, BCB RDE-IED, 0% dividend WHT, universal CFC, FX law
│   ├── mexico/
│   │   ├── revenue_tax.md          # ISR 30%, RESICO, IVA, IEPS, PTU, IMSS, border zones
│   │   ├── deductions.md           # SL depreciation, NOL (10yr), interest limits, CFDI requirements
│   │   └── international_investors.md  # LIE sector restrictions, REFIPRE CFC, branch remittance tax, 60+ DTAs
│   ├── australia/
│   │   ├── revenue_tax.md          # CIT 30/25%, franking, CGT, R&D offset, GST, FBT, super
│   │   ├── deductions.md           # Div 40 decline in value, SBE write-off, thin cap, blackhole
│   │   └── international_investors.md  # FIRB/FATA screening, Div 855 non-resident CGT, franking, CFC Part X, 45+ DTAs
│   └── singapore/
│       ├── revenue_tax.md          # CIT 17%, PTE/SUTE, GST 9%, CPF, WHT, concessionary rates, BEPS Pillar 2
│       ├── deductions.md           # Capital allowances (S.19/19A), NOL, R&D 250-400%, EIS, IP WDA
│       └── international_investors.md  # Open economy, no CGT, 0% div WHT, no CFC, FTC pooling, 90+ DTAs
├── data/
│   ├── us.json                     # Structured tax data - United States
│   ├── indonesia.json              # Structured tax data - Indonesia
│   ├── canada.json                 # Structured tax data - Canada
│   ├── brazil.json                 # Structured tax data - Brazil
│   ├── mexico.json                 # Structured tax data - Mexico
│   ├── australia.json              # Structured tax data - Australia
│   └── singapore.json              # Structured tax data - Singapore
├── charts/                         # Generated comparison charts (26 charts)
│   ├── 01_corporate_tax_rates.png
│   ├── 02_combined_federal_state_rates.png
│   ├── 03_vat_gst_rates.png
│   ├── 04_employer_payroll_burden.png
│   ├── 05_depreciation_comparison.png
│   ├── 06_nol_rules.png
│   ├── 07_rnd_incentives.png
│   ├── 08_interest_limitation.png
│   ├── 09_withholding_taxes.png
│   ├── 10_deduction_categories_heatmap.png
│   ├── 11_brazil_simples_nacional.png
│   ├── 12_sme_regimes.png
│   ├── 13_tax_burden_radar.png
│   ├── 14_canada_provincial_rates.png
│   ├── 15_indonesia_tax_holiday.png
│   ├── 16_mexico_resico.png
│   ├── 17_australia_super_rates.png
│   ├── 18_comprehensive_summary_table.png
│   ├── 19_singapore_tax_incentives.png
│   ├── 20_foreign_investment_screening.png
│   ├── 21_nonresident_tax_rates.png
│   ├── 22_repatriation_ease_radar.png
│   ├── 23_investor_decision_matrix.png
│   ├── 24_capital_gains_comparison.png
│   ├── 25_dividend_interest_treatment.png
│   └── 26_sector_specific_taxes.png
├── analysis/
│   ├── comprehensive_tax_analysis.md          # Cross-referenced 7-country comparative analysis with legal citations
│   └── international_investor_analysis.md     # International investor comparative guide: screening, CGT, WHT, CFC, treaties, PE
├── scripts/
│   └── generate_charts.py          # Python script to regenerate all charts
└── README.md                       # This file
```

---

## Quick Country Comparison

| Metric | US | Indonesia | Canada | Brazil | Mexico | Australia | Singapore |
|---|---|---|---|---|---|---|---|
| **Corporate Rate** | 21% (fed) | 22% | 15% (fed) | 34%* | 30% | 30% / 25% | 17% |
| **SME Rate** | 21% (flat) | 0.5% final | 9% (fed) | 4-19%** | 1-2.5%*** | 25% | 4.25%**** |
| **VAT/GST** | No fed VAT | 11% | 5-15% | 9.25%+ | 16% | 10% | 9% |
| **Employer Payroll** | ~7.65% | ~11% | ~8.3% | ~35.8% | ~30% | ~11.5% | ~17.25% |
| **WHT Dividends** | 30% | 20% | 25% | 0% | 10% | 30%***** | 0% |
| **NOL Carry-Fwd** | Indefinite | 5 years | 20 years | Indefinite | 10 years | Indefinite | Indefinite |
| **NOL Limit** | 80% | 100% | 100% | 30% | 100% | 100% | 100% |
| **R&D Incentive** | 20% credit | 300% super ded. | 35% ITC (CCPC) | 80% extra ded. | 30% credit | 48.5% offset | EIS 400% |
| **Depreciation** | MACRS | 4 Groups | CCA Classes | RFB Rates | SL Only | Div 40 | CA S.19/19A |
| **Interest Limit** | 30% ATI | DER 4:1 | 30% EBITDA | DER 2:1 | 30% EBITDA | 30% EBITDA | Arm's length |
| **CGT (Listed Shares)** | 21% | 0.1% final | ~7.5% (50% incl.) | 15% | 10% | 30% | **0%** |
| **Inter-Corp Dividends** | DRD 50-100% | Exempt | Deductible (§112) | Exempt | CUFIN: 0% | Franking | Exempt (one-tier) |
| **Digital Services Tax** | No | No (VAT) | 3% DST | No | No (ISR ret.) | No (MAAL) | No (OVR GST) |

\* Brazil combined IRPJ 25% + CSLL 9% under Lucro Real
\** Brazil Simples Nacional (commerce Annex I)
\*** Mexico RESICO for individuals
\**** Singapore Startup Tax Exemption Scheme (SUTE) on first S$100K
\***** Australia: unfranked dividends; franked dividends 0%

### International Investor Comparison

| Metric | US | Indonesia | Canada | Brazil | Mexico | Australia | Singapore |
|---|---|---|---|---|---|---|---|
| **Screening Body** | CFIUS | BKPM/OSS | Inv. Canada Act | Central Bank | CNIE | FIRB | ACRA/MAS |
| **CGT on Shares** | 0%/15%* | 5% final | 25% WHT | 15% | 10% | 12.5% WHT** | **0%** |
| **Dividend WHT** | 30% | 20% | 25% | **0%** | 10% | 30%/0%*** | **0%** |
| **Branch Profits Tax** | 30% | 20% | 25% | **0%** | 10% | **0%** | **0%** |
| **FX Controls** | None | Moderate | None | Moderate | None | None | None |
| **CFC Rules** | GILTI+SubF | Deemed Div. | FAPI | Universal | REFIPRE | Part X | **None** |
| **Treaty Network** | 60+ | 70+ | 90+ | 35+ | 60+ | 45+ | 90+ |
| **Investor Score** | 6.2/10 | 5.4/10 | 6.7/10 | 5.6/10 | 6.6/10 | 7.2/10 | **9.3/10** |

\* US: 0% on non-USRPI shares; 15% FIRPTA withholding on USRPI
\** Australia: 12.5% withholding on TAP >AUD 750K; 0% on non-TAP
\*** Australia: 30% unfranked; 0% franked dividends

---

## Revenue Tax Codes (Tax on Business Revenue)

### What's Covered Per Country

Each `revenue_tax.md` file documents:

- **Corporate Income Tax** - Standard rates, brackets, flat vs. progressive structures
- **SME/Small Business Regimes** - Reduced rates, simplified compliance, thresholds
- **VAT/GST/Sales Tax** - Rates, registration thresholds, input credit mechanisms
- **Payroll & Social Security** - Employer-side contributions, wage bases
- **Withholding Taxes** - Domestic and international (treaty vs. default rates)
- **Excise & Special Taxes** - Industry-specific levies
- **Regional/State Taxes** - Sub-national tax rates and thresholds
- **International Tax Provisions** - Transfer pricing, anti-avoidance, CFC rules
- **Income by Source Type** - Service income, royalty/IP licensing, rental/lease, capital gains, dividends received, interest income — tax rates and treatment per income type
- **Sector-Specific Revenue Taxes** - Digital services taxation, natural resource/extractive taxes, insurance premium taxes, financial transaction taxes, gaming/betting taxes, agricultural income taxation

---

## Taxable Income Deductions

### What's Covered Per Country

Each `deductions.md` file documents:

- **Depreciation/Amortization** - Methods (SL, DB, MACRS, CCA), rates, asset classifications
- **Net Operating Losses** - Carry-forward/back periods, annual utilization limits
- **Interest Deductibility** - EBITDA-based limits, thin capitalization rules, DER ratios
- **R&D Tax Incentives** - Credits, super deductions, eligible expenditures
- **Charitable Contributions** - Limits, eligible recipients, carry-forward
- **Employee Compensation** - Deductible benefits, social security, pension contributions
- **Meals & Entertainment** - Partial deductibility rules
- **Bad Debts** - Write-off requirements and documentation
- **Vehicle & Travel** - Mileage rates, per diem, automobile caps
- **Non-Deductible Expenses** - Comprehensive list per jurisdiction
- **Transfer Pricing** - Documentation requirements, accepted methods, penalties

---

## International Investor Guide

### What's Covered Per Country

Each `international_investors.md` file documents what changes when a company has foreign/international investors:

- **Foreign Ownership Restrictions** - Investment screening frameworks, sector-specific caps, land restrictions
- **Non-Resident Investor Taxation** - Capital gains on share disposal, dividend WHT, exit tax
- **Repatriation of Profits** - FX controls, central bank registration, dividend payment procedures
- **Branch vs. Subsidiary** - Tax rate comparison, profit remittance tax, loss utilization, incentive eligibility
- **Foreign Tax Credit Mechanisms** - Unilateral relief, limitation methods, carry-forward rules
- **CFC Rules Impact** - Controlled foreign company regimes, ownership thresholds, active income exemptions
- **Tax Treaty Network** - Treaty counts, key corridor rates, LOB/PPT anti-avoidance
- **Permanent Establishment Risk** - Construction PE, service PE, agent PE, digital PE thresholds

---

## Charts & Visualizations

Run the chart generator:

```bash
python3 scripts/generate_charts.py
```

### Chart Index

| # | Chart | Description |
|---|---|---|
| 01 | Corporate Tax Rates | Standard vs. SME rates across all 7 countries |
| 02 | Combined Fed+State | Various federal+state/provincial rate scenarios |
| 03 | VAT/GST Rates | Indirect tax rate comparison |
| 04 | Employer Payroll Burden | Total employer social security/payroll cost |
| 05 | Depreciation Comparison | Annual rates by asset type (6 categories) |
| 06 | NOL Rules | Carry-forward/back periods and annual limits |
| 07 | R&D Incentives | Credit rates, super deductions, carry-forward |
| 08 | Interest Limitation | EBITDA limits and thin capitalization rules |
| 09 | Withholding Taxes | Default vs. treaty rates for dividends, interest, royalties |
| 10 | Deduction Heatmap | Deductibility matrix across 12 expense categories |
| 11 | Brazil Simples | Simples Nacional progressive rates by Annex |
| 12 | SME Regimes | Effective SME tax rates at various revenue levels |
| 13 | Tax Burden Radar | Overall business tax burden (6-axis radar) |
| 14 | Canada Provincial | Combined federal+provincial rates by province |
| 15 | Indonesia Tax Holiday | Investment-tier tax holiday durations |
| 16 | Mexico RESICO | Simplified trust regime brackets vs. standard rate |
| 17 | Australia Super | Superannuation guarantee rate progression |
| 18 | Summary Table | Comprehensive side-by-side comparison table |
| 19 | Singapore Incentives | PTE vs. SUTE effective rates & concessionary programmes |
| 20 | Foreign Investment Screening | Investment screening frameworks, thresholds, restrictiveness |
| 21 | Non-Resident Tax Rates | CGT on shares, dividend WHT, branch profits tax |
| 22 | Repatriation Ease Radar | International investor friendliness (6-axis radar) |
| 23 | Investor Decision Matrix | Scored heatmap across 10 investor-relevant dimensions |
| 24 | Capital Gains Comparison | CGT rates on listed shares, non-listed shares, real property across 7 countries |
| 25 | Dividend & Interest Treatment | Inter-corporate dividend effective rates + interest income concessionary rates |
| 26 | Sector-Specific Taxes | Heatmap of 6 sector tax types × 7 countries with annotated rates |

---

## Key Highlights by Country

### United States
- Flat 21% federal corporate rate (post-TCJA 2017)
- No federal VAT; state sales taxes 0-10.25%
- MACRS depreciation with 60% bonus depreciation (2024, phasing down)
- Section 179 immediate expensing up to $1.22M
- R&D expenses must be amortized over 5 years (since 2022)
- NOL limited to 80% of taxable income, indefinite carry-forward

### Indonesia
- 22% standard rate; 0.5% final tax for MSMEs (<IDR 4.8B)
- Generous tax holidays: 5-20 years of 100% CIT exemption for pioneer industries
- R&D super deduction up to 300% of costs
- 4-group depreciation system (4/8/16/20 years)
- Only 5-year NOL carry-forward (extendable to 10 under tax allowance)

### Canada
- Two-tier system: 15% general, 9% small business (federal)
- SR&ED program: 35% refundable ITC for CCPCs (first $3M)
- CCA depreciation with 50+ asset classes
- EIFEL rules: 30% of tax-EBITDA interest limitation
- 20-year NOL carry-forward, 3-year carry-back

### Brazil
- Four regimes: Lucro Real (34%), Presumido (~6-11%), Simples (4-33%), Arbitrado
- Unique JCP (Interest on Equity) deduction mechanism
- 30% annual cap on NOL utilization
- Highest employer payroll burden (~35.8%)
- Major tax reform underway: CBS/IBS replacing PIS/COFINS/ICMS/ISS by 2033

### Mexico
- Flat 30% corporate rate; RESICO for small individuals (1-2.5%)
- Border zone incentives: effective ~20% ISR and 8% IVA
- Straight-line depreciation only (no declining balance)
- 10-year NOL carry-forward, inflation-adjusted
- 91.5% business meals deduction; strict CFDI invoice requirements

### Australia
- Two-tier: 30% general, 25% base rate entities (<$50M turnover)
- Full imputation (franking credit) system eliminates dividend double-taxation
- R&D tax incentive: up to 48.5% refundable offset for small companies
- $20,000 instant asset write-off for small business entities
- Loss carry-back (1 year) available for companies <$5B turnover

### Singapore
- Low 17% flat corporate rate; effective rate as low as 4.25% under SUTE for startups
- No capital gains tax; territorial tax system with foreign-sourced income exemptions
- No withholding tax on dividends (one-tier corporate tax system)
- Generous R&D incentives: 250% enhanced deduction, up to 400% under EIS
- Aggressive capital allowance write-offs: 1-year accelerated for computers, software, plant & machinery
- No statutory thin capitalization or EBITDA interest limitation (arm's length only)
- Extensive concessionary tax rates: 0-15% for qualifying Pioneer, DEI, GTP, FSI, and IDI activities
- BEPS Pillar 2 domestic top-up tax effective 1 Jan 2025 for large MNE groups (15% minimum)
- 2.5x deduction multiplier on charitable donations to approved IPCs
- Indefinite NOL carry-forward with 1-year carry-back (capped at S$100K)

---

## Comprehensive Analysis

### General Tax Analysis

The `analysis/comprehensive_tax_analysis.md` document provides a detailed cross-referenced comparative analysis across all 7 countries covering:

1. **Corporate Income Tax** — Rates, AMT/minimum taxes, residence rules, BEPS Pillar 2
2. **VAT/GST** — Standard rates, exempt categories, registration thresholds
3. **Employer Payroll** — Social security, pension, unemployment, with legal citations
4. **Withholding Taxes** — Default and treaty rates for dividends, interest, royalties
5. **Depreciation & Capital Allowances** — Methods, immediate expensing, asset-specific rates
6. **Net Operating Losses** — Carry-forward/back, annual caps, ownership change rules
7. **R&D Incentives** — Credits vs. deductions, cash payout options, qualifying expenditure
8. **Interest Limitations** — EBITDA-based vs. DER frameworks, safe harbours
9. **Business Expenses** — Meals, entertainment, charitable, vehicles
10. **SME & Special Regimes** — Reduced rates, simplified compliance
11. **Transfer Pricing** — Documentation, methods, penalties
12. **Anti-Avoidance & International Tax** — GAAR, CFC rules, BEPS Pillar 2
13. **Statutory Authority Index** — Complete citation reference for all 7 jurisdictions
14. **Key Strategic Observations** — Comparative insights and planning recommendations
15. **Income Source Taxation** — Service, royalty, rental, capital gains, dividend, interest income comparison
16. **Sector-Specific Revenue Taxation** — Digital services, natural resources, insurance, FTT, gaming, agriculture

### International Investor Analysis

The `analysis/international_investor_analysis.md` document provides a cross-country comparative guide specifically for international investors:

1. **Foreign Investment Screening & Restrictions** — Screening bodies, thresholds, sector restrictions, land rules
2. **Non-Resident Investor Taxation** — CGT on shares, dividend WHT, branch profits tax, exit tax
3. **Repatriation of Profits & FX Controls** — FX controls, central bank registration, repatriation ease ranking
4. **Branch vs. Subsidiary Comparison** — Decision framework with combined tax rate analysis
5. **Foreign Tax Credit Mechanisms** — Methods, limitations, carry-forward/back rules
6. **CFC Rules Impact** — Regime comparison, severity ranking, active income exemptions
7. **Tax Treaty Network & Benefits** — Treaty counts, key corridor WHT rates, anti-treaty shopping
8. **Permanent Establishment Risk** — Construction, service, agent, and digital PE thresholds
9. **International Investor Decision Matrix** — Scored assessment across 10 dimensions
10. **Key Investment Corridors** — Worked examples with effective tax rate calculations (SG→ID, US→CA, SG→AU, CA→BR)
11. **Statutory Authority Index** — Complete legislation references for international investor topics

Every entry includes specific legal citations (IRC sections, ITA sections, UU/PP/PMK references, Lei/Artigo numbers, LISR Articulos, ITAA 1997 Divisions/Sections).

---

## Data Format

JSON files in `data/` contain structured, machine-readable tax data for each country. Key sections:

- `corporate_tax` - Rates, brackets, regime details
- `vat` / `gst` / `iva` - Indirect tax rates and thresholds
- `withholding_taxes` - WHT rates (default and treaty)
- `payroll_taxes` / `employer_contributions` - Social security burden
- `deductions` - Depreciation rates, NOL rules, interest limits, R&D incentives
- `international_investors` - Screening, non-resident taxation, repatriation, branch vs. subsidiary, FTC, CFC, treaties, PE rules
- `income_by_source` - Tax rates on service, royalty, rental, capital gains, dividend, and interest income
- `sector_specific_taxes` - Digital services, natural resources, insurance, financial transactions, gaming, agriculture

---

## Sources & Legal Basis

| Country | Primary Legislation |
|---|---|
| US | Internal Revenue Code (IRC), TCJA 2017, IRA 2022 |
| Indonesia | UU No. 7/2021 (HPP), UU No. 36/2008, PP 55/2022 |
| Canada | Income Tax Act (ITA), Excise Tax Act |
| Brazil | RIR/2018 (Decreto 9.580/2018), Lei 9.249/1995, LC 123/2006 |
| Mexico | Ley del ISR (LISR), CFF, Ley del IVA |
| Australia | ITAA 1997, ITAA 1936, FBT Act 1986 |
| Singapore | Income Tax Act 1947 (ITA), GST Act 1993, CPF Act 1953 |

All data reflects 2024/2025 tax year rates. Tax laws change frequently; always verify current rates with official sources.
