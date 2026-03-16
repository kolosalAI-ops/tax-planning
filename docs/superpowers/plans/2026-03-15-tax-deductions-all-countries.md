# 45-Country Corporate Tax Deductions Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create or update `deductions.md` for all 45 countries covering every corporate tax deduction category at full Tier 1 depth, with verified statutory citations and current 2024/2025 rates.

**Architecture:** Five parallel research-and-write agents, one per regional batch. Each agent performs live web research against official tax authority sources, writes markdown files following the 10-section minimum template, and commits its batch. Tier 1 files (7 countries) are verified and updated in place; Tier 2 files (38 countries) are created from scratch.

**Spec:** `docs/superpowers/specs/2026-03-15-tax-deductions-all-countries-design.md`

**Tech Stack:** Markdown, web research (official tax authority sites, Deloitte/PWC/EY country guides), git

---

## How Agents Must Approach Each Country

Before writing any file, an agent must:

1. **Search the official tax authority** for the country's corporate deduction rules (depreciation schedules, interest limitation rules, loss carry rules, thin-cap ratios).
2. **Cross-check at least one Big-4 country guide** (Deloitte, PWC, EY, or KPMG) for the same country.
3. **Cite every rate and limit** with the full statute name + section number (e.g., `Corporation Tax Act 2009 (CTA 2009) §54`).
4. **Tag unverified figures** with `[unverified — confirm with local counsel]`.
5. **Never skip a section** — if a section does not apply, write a one-line explanation why (e.g., "No formal thin-capitalisation statute; general anti-avoidance applies.").

### Template Minimum (all 10 sections required)

```
## 1. Depreciation & Capital Allowances
## 2. Business Operating Expenses
## 3. Interest & Financing Costs
## 4. Research & Development
## 5. Loss Carry-Forward & Carry-Back
## 6. Provisions & Reserves
## 7. Industry-Specific Deductions
## 8. Treaties & Transfer Pricing
## 9. Non-Deductible Items
## 10. Sources & Legal References
```

### Tier 1 Update Rule

For the 7 Tier 1 countries (US, Canada, Brazil, Mexico, Australia, Singapore, Indonesia): read the existing file first, verify every rate/limit, update stale figures, and add any missing sections. **Do not delete or restructure existing sections.**

### File Header Format

```markdown
# [Country] - Taxable Income Deductions

> **Jurisdiction**: [Federal/National] ([Tax Authority acronym])
> **Governing Law**: [Full statute name (abbreviation)]
> **Tax Year**: [see fiscal year table in spec Section 4]
> **Currency**: [CUR] ([Symbol])

---
```

### Tax Year Labels

| Country | Label |
|---|---|
| Australia | `2024/2025 (FY2025)` |
| India | `2024/2025 (AY 2025-26)` |
| UK | `2024/2025` |
| Japan | `2024/2025` |
| New Zealand | `2024/2025` |
| All others | `2024/2025` |

---

## Chunk 1: Americas Batch

## Task 1: Americas — US, Canada, Brazil, Mexico, Argentina, Chile, Colombia

**Files:**
- Update: `countries/us/deductions.md`
- Update: `countries/canada/deductions.md`
- Update: `countries/brazil/deductions.md`
- Update: `countries/mexico/deductions.md`
- Create: `countries/argentina/deductions.md`
- Create: `countries/chile/deductions.md`
- Create: `countries/colombia/deductions.md`

**Key sources per country:**

| Country | Tax Authority | Primary Statute | Notes |
|---|---|---|---|
| US | IRS (irs.gov) | Internal Revenue Code (IRC) | Pub 946 for depreciation; §163(j) interest; §172 NOLs |
| Canada | CRA (canada.ca/cra) | Income Tax Act R.S.C. 1985 (ITA) | CCA Schedule II rates; §20 deductions; §111 losses |
| Brazil | Receita Federal (gov.br/receita) | Decreto 9.580/2018 (RIR), Law 6.404/1976 | JCP (juros sobre capital próprio); CSLL; Simples vs Lucro Real |
| Mexico | SAT (sat.gob.mx) | Ley del Impuesto Sobre la Renta (LISR) | Art. 25 deductions; Art. 27 requirements; PTU deductibility |
| Argentina | AFIP (afip.gob.ar) | Ley 20.628 Impuesto a las Ganancias | Inflation adjustment rules; Art. 91 thin cap |
| Chile | SII (sii.cl) | Ley de Impuesto a la Renta (LIR) DL 824 | Art. 31 deductions; thin cap Art. 41 F; loss carryforward Art. 31 N°3 |
| Colombia | DIAN (dian.gov.co) | Estatuto Tributario (ET) | Art. 107 deductibility; Art. 118-1 thin cap; Art. 147 losses |

---

### 1.1 — United States (UPDATE)

- [ ] Read existing `countries/us/deductions.md` in full
- [ ] Search IRS website for 2024/2025 updates: Section 179 limits, bonus depreciation phase-down, §163(j) ATI, NOL rules
- [ ] Verify Section 179 limit ($1,220,000 for 2024), bonus depreciation (60% for 2024, 40% for 2025), MACRS tables
- [ ] Verify §163(j) interest limitation (30% ATI, no depreciation/amortisation add-back for non-electing taxpayers)
- [ ] Verify NOL carryforward rules (indefinite, 80% taxable income cap per TCJA)
- [ ] Update any stale figures
- [ ] Confirm all 10 template sections are present **by content topic, not by number** — the existing file uses custom section names (17 sections). Check that content equivalent to each of the 10 template sections exists: Depreciation, Business Operating Expenses, Interest/Thin-Cap, R&D (cross-ref), Losses, Provisions & Reserves, Industry-Specific, Transfer Pricing, Non-Deductible Items, Sources. Add any that are absent.

---

### 1.2 — Canada (UPDATE)

- [ ] Read existing `countries/canada/deductions.md` in full
- [ ] Search CRA website for 2024/2025 CCA class updates (Class 14.1 goodwill, Class 10.1 vehicles, Class 54/55 zero-emission vehicles)
- [ ] Verify thin capitalisation: document ITA §18(4) (1.5:1 debt-to-equity) as the **legacy** rule, superseded for most interest by EIFEL
- [ ] Verify EIFEL rules — ITA §18.2 (effective for tax years beginning on/after 1 Oct 2023): 30% tax-EBITDA limit, $250,000 threshold, 20-year carry-forward of denied excess interest, 3-year carry-forward of unused capacity; confirm the existing file documents this as the **current** primary interest limitation
- [ ] Verify SR&ED deduction rates and cross-reference to `countries/canada/rnd_incentives.md`
- [ ] Verify NOL (non-capital loss) carryback 3 years / carryforward 20 years — ITA §111(1)(a)
- [ ] Update any stale figures; add missing template sections **by content topic** (see note in 1.1 above)

---

### 1.3 — Brazil (UPDATE)

- [ ] Read existing `countries/brazil/deductions.md` in full
- [ ] Verify JCP (Juros sobre Capital Próprio) deductibility rules — Law 9.249/1995 Art. 9; TJLP rate for 2024
- [ ] Verify CSLL deductibility (financial institutions vs general)
- [ ] Verify thin capitalisation rules — Law 12.249/2010 Art. 24 (2:1 debt-to-equity for general related-party foreign loans) and Art. 25 (0.3:1 i.e. 30% of **net equity** / patrimônio líquido for tax-haven counterparties — NOT 30% of profit)
- [ ] Verify loss carryforward: unlimited carry but 30% taxable income per year cap — Lei 9.065/1995
- [ ] Update any stale figures; add missing template sections **by content topic** (see note in 1.1 above)

---

### 1.4 — Mexico (UPDATE)

- [ ] Read existing `countries/mexico/deductions.md` in full
- [ ] Verify LISR Art. 25 deduction categories; Art. 27 requirements (payment via banking system >$2,000 pesos)
- [ ] Verify thin capitalisation ratio: 3:1 debt-to-equity — LISR Art. 28 XXVII
- [ ] Verify PTU (profit-sharing) deductibility: 10% of profits — LISR Art. 28 XXV
- [ ] Verify loss carryforward: 10 years — LISR Art. 57
- [ ] Verify depreciation rates: LISR Art. 34 (buildings 5%, computers 30%, vehicles 25%)
- [ ] Update any stale figures; add missing template sections **by content topic** (see note in 1.1 above)

---

### 1.5 — Argentina (CREATE NEW)

- [ ] Search AFIP website and Deloitte/PWC Argentina tax guide for 2024/2025
- [ ] Research depreciation: straight-line, official useful life tables (Decree 1.344/1998)
- [ ] Research inflation adjustment (ajuste por inflación impositivo) — Arts. 94–98 Ley 20.628; Art. 94 governs when the mechanism is triggered (CPI threshold); Art. 95 governs adjustments to deductions
- [ ] Research thin capitalisation: Art. 91 Ley 20.628 — 2:1 debt-to-equity for related-party loans from non-residents
- [ ] Research business expense deductibility requirements — Art. 83 Ley 20.628
- [ ] Research loss carryforward: 5 years — Art. 19 Ley 20.628
- [ ] Research industry-specific: hydrocarbons (Law 17.319), agriculture (special depreciation)
- [ ] Summarise R&D deduction mechanism in 2–3 sentences and cross-reference to `countries/argentina/rnd_incentives.md`
- [ ] Write `countries/argentina/deductions.md` with all 10 sections
- [ ] Verify all statutory citations are present and correctly formatted

---

### 1.6 — Chile (CREATE NEW)

- [ ] Search SII website and PWC/EY Chile tax guide for 2024/2025
- [ ] Research depreciation: accelerated (1/3 useful life) vs normal — LIR Art. 31 N°5 (second paragraph for accelerated option)
- [ ] Research Art. 31 deduction list: salaries, rent, interest, bad debts, royalties
- [ ] Research thin capitalisation: Art. 41 F — 3:1 debt-to-equity for related-party cross-border debt
- [ ] Research loss carryforward: indefinite — LIR Art. 31 N°3
- [ ] Research industry-specific: mining (royalty regime Law 21.591), real estate
- [ ] Summarise R&D deduction mechanism in 2–3 sentences and cross-reference to `countries/chile/rnd_incentives.md`
- [ ] Write `countries/chile/deductions.md` with all 10 sections

---

### 1.7 — Colombia (CREATE NEW)

- [ ] Search DIAN website and Deloitte/KPMG Colombia tax guide for 2024/2025
- [ ] Research depreciation: Art. 137 ET — straight-line, fiscal useful life tables; Art. 140 accelerated
- [ ] Research Art. 107 ET general deductibility (relation to income-producing activity, proportionality, necessity)
- [ ] Research thin capitalisation: Art. 118-1 ET — 2:1 debt-to-equity for related-party debt
- [ ] Research interest limitation: Art. 118-1 ET — 30% EBITDA limit
- [ ] Research loss carryforward: 12 years — Art. 147 ET
- [ ] Research industry-specific: oil & gas (petroleum royalties, depletion)
- [ ] Summarise R&D deduction mechanism in 2–3 sentences and cross-reference to `countries/colombia/rnd_incentives.md`
- [ ] Write `countries/colombia/deductions.md` with all 10 sections

---

### 1.8 — Commit Americas batch

- [ ] Verify all 7 files exist and have correct paths
- [ ] Verify each file has all 10 sections with statutory citations
- [ ] Run: `ls countries/{us,canada,brazil,mexico,argentina,chile,colombia}/deductions.md`
- [ ] Commit:
```bash
git add countries/us/deductions.md countries/canada/deductions.md \
        countries/brazil/deductions.md countries/mexico/deductions.md \
        countries/argentina/deductions.md countries/chile/deductions.md \
        countries/colombia/deductions.md
git commit -m "feat: add/update corporate tax deductions — Americas batch (7 countries)"
```

---

## Chunk 2: Europe West Batch

## Task 2: Europe West — UK, Germany, France, Italy, Spain, Netherlands, Belgium, Ireland, Portugal, Switzerland, Austria

**Files (all CREATE NEW):**
- `countries/uk/deductions.md`
- `countries/germany/deductions.md`
- `countries/france/deductions.md`
- `countries/italy/deductions.md`
- `countries/spain/deductions.md`
- `countries/netherlands/deductions.md`
- `countries/belgium/deductions.md`
- `countries/ireland/deductions.md`
- `countries/portugal/deductions.md`
- `countries/switzerland/deductions.md`
- `countries/austria/deductions.md`

**Key sources per country:**

| Country | Tax Authority | Primary Statute | Key Topics |
|---|---|---|---|
| UK | HMRC (gov.uk/hmrc) | Corporation Tax Act 2009 (CTA 2009); CTA 2010 | Capital allowances CTA 2009 Part 2; §54 trading expenses; §441 loan relationships; §269ZA loss restriction |
| Germany | BMF (bundesfinanzministerium.de) | Körperschaftsteuergesetz (KStG); Einkommensteuergesetz (EStG) | §7–14 EStG depreciation (AfA); §4h EStG Zinsschranke interest barrier; §10d EStG losses |
| France | DGFiP (impots.gouv.fr) | Code Général des Impôts (CGI) | Art. 39 CGI deductions; Art. 212 thin cap; Art. 209 losses; Art. 39 B minimum depreciation |
| Italy | AdE (agenziaentrate.gov.it) | TUIR (DPR 917/1986) | Art. 102 TUIR depreciation tables; Art. 96 TUIR interest (30% EBITDA); Art. 84 TUIR losses |
| Spain | AEAT (agenciatributaria.es) | Ley 27/2014 del Impuesto sobre Sociedades (LIS) | Art. 12 LIS depreciation tables; Art. 16 LIS thin cap; Art. 20 LIS interest (30% EBITDA); Art. 26 LIS losses |
| Netherlands | Belastingdienst (belastingdienst.nl) | Wet op de Vennootschapsbelasting 1969 (VPB) | Art. 3.30 IB depreciation; ATAD1 interest limitation (EBITDA 30%); Art. 20 VPB losses; ATAD2 hybrid |
| Belgium | FOD Financiën (financien.belgium.be) | Wetboek Inkomstenbelastingen 1992 (WIB) | Art. 61 WIB depreciation; Art. 198 §1 11° EBITDA interest; Innovation Income Deduction; RDT-DRV |
| Ireland | Revenue (revenue.ie) | Taxes Consolidation Act 1997 (TCA 1997) | Part 9 TCA capital allowances; §247 loan interest; §396 losses; §835 transfer pricing |
| Portugal | AT (portaldasfinancas.gov.pt) | Código do IRC (CIRC) | Art. 30 CIRC depreciation; Art. 67 CIRC interest (30% EBITDA); Art. 52 CIRC losses; RFAI investment incentive |
| Switzerland | ESTV (estv.admin.ch) | DBG (Bundesgesetz über die direkte Bundessteuer) | Art. 58 DBG deductions; cantonal circulars for depreciation; safe-harbour interest rates |
| Austria | BMF (bmf.gv.at) | Körperschaftsteuergesetz 1988 (KStG 1988) | §7 KStG depreciation (AfA); §12a KStG EBITDA interest; §18 KStG losses; group taxation §9 |

---

### 2.1 — United Kingdom (CREATE NEW)

- [ ] Search HMRC Capital Allowances Manual (CA), Business Income Manual (BIM), Corporate Finance Manual (CFM)
- [ ] Research capital allowances: Annual Investment Allowance (AIA £1M), Full Expensing (100% for main rate plant), Writing Down Allowance (18% main pool, 6% special rate pool) — CTA 2009 Part 2
- [ ] Research trading expense deductibility — CTA 2009 §54 "wholly and exclusively"
- [ ] Research loan relationship rules — CTA 2009 Part 5 §441+; non-trading deficits
- [ ] Research corporate interest restriction (CIR) — TIOPA 2010 Part 10; 30% EBITDA; £2M de minimis
- [ ] Research loss rules — CTA 2010 §37, §45, §269ZA; 50% restriction above £5M
- [ ] Summarise R&D relief mechanism (RDEC / merged scheme from April 2024) in 2–3 sentences and cross-reference to `countries/uk/rnd_incentives.md`
- [ ] Research non-deductibles: entertainment, fines, capital, dividends
- [ ] Write `countries/uk/deductions.md` with all 10 sections

---

### 2.2 — Germany (CREATE NEW)

- [ ] Research AfA depreciation tables (BMF Abschreibungstabellen): buildings 3% (§7 Abs.4 EStG), machinery 10–25%, computers/software 33.3% (GWG §6 Abs.2 for assets ≤€800)
- [ ] Research Zinsschranke interest barrier — §4h EStG / §8a KStG: 30% EBITDA; €3M Freigrenze; standalone clause
- [ ] Research Gewerbesteuer (trade tax) add-backs (25% of interest, rent, leasing — §8 GewStG)
- [ ] Research loss carry: unlimited forward (Mindestbesteuerung 60% above €1M) — §10d EStG; 1-year carryback €10M cap
- [ ] Research business expense rules — §4 Abs.4 EStG (Betriebsausgaben)
- [ ] Research non-deductibles: §4 Abs.5 EStG (gifts >€35, entertainment 30% non-deductible)
- [ ] Summarise R&D deduction mechanism in 2–3 sentences and cross-reference to `countries/germany/rnd_incentives.md`
- [ ] Write `countries/germany/deductions.md` with all 10 sections

---

### 2.3 — France (CREATE NEW)

- [ ] Research depreciation: Art. 39 B CGI minimum annuity method; components approach; buildings 2–5%, equipment 10–33%
- [ ] Research Art. 212 bis CGI thin cap: 3 conditions (10× earnings, 30% EBITDA, arm's-length); standalone EBITDA test
- [ ] Research loss carry: unlimited forward (50% cap above €1M annually) — Art. 209 CGI; 3-year carryback €1M cap
- [ ] Research CIR (Crédit Impôt Recherche) — summarise and link to `rnd_incentives.md`
- [ ] Research TVA (VAT) treatment of expenses
- [ ] Research non-deductibles: Art. 39-4 CGI — deductible amortisation base capped at €18,300 for high-emission vehicles and €30,000 for low-emission vehicles (2024); yachts and hunting expenses fully non-deductible
- [ ] Research participation exemption (quote-part 5% of dividends non-deductible)
- [ ] Write `countries/france/deductions.md` with all 10 sections

---

### 2.4 — Italy (CREATE NEW)

- [ ] Research TUIR Art. 102 depreciation tables (Ministerial Decree): buildings 3%, machinery 10–25%, vehicles 25%
- [ ] Research Art. 96 TUIR interest: 30% EBITDA limit (net interest expense); deferred excess indefinitely
- [ ] Note: ACE (Aiuto alla Crescita Economica) was **repealed effective 1 January 2024** by Legge di Bilancio 2024 (L. 213/2023, Art. 1, para. 137); document it as repealed with effective date; research whether any replacement incentive applies for 2024
- [ ] Research loss carry: unlimited forward (80% cap) — Art. 84 TUIR; no carryback
- [ ] Research IRAP base (regional production tax) — addbacks differ from IRES
- [ ] Research non-deductibles: Art. 99 TUIR (taxes paid, fines); Art. 100 (charity caps)
- [ ] Summarise R&D deduction mechanism in 2–3 sentences and cross-reference to `countries/italy/rnd_incentives.md`
- [ ] Write `countries/italy/deductions.md` with all 10 sections

---

### 2.5 — Spain (CREATE NEW)

- [ ] Research LIS Art. 12 depreciation tables (Reglamento IS): buildings 3%, machinery 12%, IT equipment 25%; Art. 12.3 accelerated SME
- [ ] Research Art. 16 LIS thin cap (replaced by ATAD): 30% EBITDA; €1M de minimis — Art. 20 LIS
- [ ] Research loss carry: indefinite forward; 70% cap above €20M revenue; 25% cap above €60M — Art. 26 LIS; no carryback
- [ ] Research Patent Box (Art. 23 LIS) — link to `rnd_incentives.md`
- [ ] Research non-deductibles: Art. 15 LIS (fines, gifts, financial expenses over limit, shareholder remuneration above market)
- [ ] Write `countries/spain/deductions.md` with all 10 sections

---

### 2.6 — Netherlands (CREATE NEW)

- [ ] Research depreciation: Art. 3.30 IB/Art. 8 VPB — 20% declining balance for machinery; buildings limited to 50% (tax) of WOZ value
- [ ] Research ATAD1 interest limitation — Art. 15b VPB: 20% EBITDA (2024); €1M de minimis; group ratio rule
- [ ] Research Innovation Box (Art. 12b VPB) — effective 9% rate on IP income — link to `rnd_incentives.md`
- [ ] Research loss carry: 1 year back, unlimited forward (50% cap above €1M) — Art. 20 VPB
- [ ] Research participation exemption and hybrid mismatch rules (ATAD2)
- [ ] Research non-deductibles: Art. 10 VPB (related-party interest disguised as equity, hybrid instruments)
- [ ] Write `countries/netherlands/deductions.md` with all 10 sections

---

### 2.7 — Belgium (CREATE NEW)

- [ ] Research depreciation: straight-line or declining balance — Art. 61–64 WIB; buildings 3%, machinery 10–20%
- [ ] Research ATAD interest limitation: 30% EBITDA — Art. 198 §1 11° WIB; €3M de minimis
- [ ] Research Innovation Income Deduction (IID) — 85% deduction on qualifying IP income — link to `rnd_incentives.md`
- [ ] Research Investment Deduction — Art. 68 WIB
- [ ] Research loss carry: indefinite forward; no carryback (except COVID measures)
- [ ] Research notional interest deduction (NID/DCR) — if applicable for 2024
- [ ] Research non-deductibles: Art. 53 WIB (excessive remuneration, fines, 50% restaurant/entertainment)
- [ ] Write `countries/belgium/deductions.md` with all 10 sections

---

### 2.8 — Ireland (CREATE NEW)

- [ ] Research capital allowances: 12.5% straight-line over 8 years for plant/machinery — TCA 1997 §284; industrial buildings 4% over 25 years
- [ ] Research trading deductions: wholly and exclusively — TCA 1997 §81
- [ ] Research interest: loan interest deductible if for trading purposes — TCA 1997 §247; ATAD EBITDA rule from 2022
- [ ] Research Knowledge Development Box (KDB) — 6.25% rate on qualifying IP income — link to `rnd_incentives.md`
- [ ] Research loss carry: 1 year back (terminal loss), indefinite forward — TCA 1997 §396–396B
- [ ] Research transfer pricing — TCA 1997 §835A–835ZF; OECD arm's-length
- [ ] Research non-deductibles: TCA 1997 §81 (entertainment, private use, capital)
- [ ] Write `countries/ireland/deductions.md` with all 10 sections

---

### 2.9 — Portugal (CREATE NEW)

- [ ] Research depreciation: CIRC Art. 30–34; Decreto Regulamentar 25/2009 tables; buildings 2–5%, equipment 12.5–20%
- [ ] Research ATAD interest limitation: Art. 67 CIRC — 30% EBITDA; €1M de minimis
- [ ] Research loss carry: 12 years forward; 80% cap per year — Art. 52 CIRC; no carryback
- [ ] Research RFAI (investment tax credit) and SIFIDE II (R&D) — summarise and link to `rnd_incentives.md`
- [ ] Research RETGS (tax group consolidation) rules
- [ ] Research non-deductibles: Art. 23-A CIRC (fines, penalties, taxes, excessive depreciation)
- [ ] Write `countries/portugal/deductions.md` with all 10 sections

---

### 2.10 — Switzerland (CREATE NEW)

- [ ] Research depreciation: ESTV circular safe-harbour rates (Merkblatt Abschreibungen): buildings 4–8%, machinery 20–40%, vehicles 40%; effective method (declining balance) preferred
- [ ] Research interest: arm's-length safe-harbour rates published annually by ESTV (Rundschreiben Zinssätze); no formal thin-cap rule but 6:1 total debt/equity substance test
- [ ] Research PATENT BOX: cantonal level — 10% effective rate on IP income from 2020 (STAF reform)
- [ ] Research loss carry: 7 years — DBG Art. 67; no carryback
- [ ] Research cantonal variations (Zurich, Zug, Geneva) where material
- [ ] Research non-deductibles: private expenditure, tax-deductible donations up to 20% of profit — DBG Art. 59
- [ ] Summarise R&D deduction mechanism in 2–3 sentences and cross-reference to `countries/switzerland/rnd_incentives.md`
- [ ] Write `countries/switzerland/deductions.md` with all 10 sections

---

### 2.11 — Austria (CREATE NEW)

- [ ] Research depreciation: EStG §7–8; buildings 2.5–3%, machinery 10–33.3%; computer/IP 33.3%; Halbjahresabschreibung (half-year rule)
- [ ] Research ATAD interest limitation: §12a KStG 1988 — 30% EBITDA; €3M de minimis (from 2021)
- [ ] Research group taxation (Gruppenbesteuerung) §9 KStG — loss pooling
- [ ] Research loss carry: indefinite forward; 75% taxable income cap — §8 Abs.4 KStG; no carryback (except COVID)
- [ ] Research investment premium (Investitionsprämie) — if relevant for 2024
- [ ] Research non-deductibles: §12 KStG (fines, 50% meals/entertainment cap)
- [ ] Summarise R&D deduction mechanism in 2–3 sentences and cross-reference to `countries/austria/rnd_incentives.md`
- [ ] Write `countries/austria/deductions.md` with all 10 sections

---

### 2.12 — Commit Europe West batch

- [ ] Verify all 11 files exist at correct paths
- [ ] Spot-check 3 random files: confirm 10 sections present with statutory citations
- [ ] Run: `ls countries/{uk,germany,france,italy,spain,netherlands,belgium,ireland,portugal,switzerland,austria}/deductions.md`
- [ ] Commit:
```bash
git add countries/uk/deductions.md countries/germany/deductions.md \
        countries/france/deductions.md countries/italy/deductions.md \
        countries/spain/deductions.md countries/netherlands/deductions.md \
        countries/belgium/deductions.md countries/ireland/deductions.md \
        countries/portugal/deductions.md countries/switzerland/deductions.md \
        countries/austria/deductions.md
git commit -m "feat: add corporate tax deductions — Europe West batch (11 countries)"
```

---

## Chunk 3: Europe East/Nordic Batch

## Task 3: Europe East/Nordic — Sweden, Norway, Denmark, Finland, Poland, Czech Republic, Hungary

**Files (all CREATE NEW):**
- `countries/sweden/deductions.md`
- `countries/norway/deductions.md`
- `countries/denmark/deductions.md`
- `countries/finland/deductions.md`
- `countries/poland/deductions.md`
- `countries/czech_republic/deductions.md`
- `countries/hungary/deductions.md`

**Key sources per country:**

| Country | Tax Authority | Primary Statute | Key Topics |
|---|---|---|---|
| Sweden | Skatteverket (skatteverket.se) | Inkomstskattelag 1999:1229 (IL) | Ch.18–20 IL depreciation; Ch.24 IL interest (30% EBITDA); Ch.40 IL losses |
| Norway | Skatteetaten (skatteetaten.no) | Skatteloven 1999 (Sktl.) | §14-40/§14-41 Sktl. depreciation saldometode (groups in §14-41); §6-41 Sktl. interest (25% EBITDA); §14-6 Sktl. losses |
| Denmark | Skattestyrelsen (skat.dk) | Selskabsskatteloven (SEL); Afskrivningsloven (AL) | §5–7 AL depreciation; §11B SEL asset test + §11C SEL EBITDA (30%); §12 SEL losses |
| Finland | Vero (vero.fi) | Laki elinkeinotulon verottamisesta (EVL) | §30–42 EVL depreciation; §18a EVL interest (EBITDA); §119 EVL losses |
| Poland | KAS (podatki.gov.pl) | Ustawa o CIT (CIT Act) | Art. 16a–16m CIT depreciation; Art. 15c CIT interest (30% EBITDA); Art. 7 CIT losses |
| Czech Republic | Finanční správa (financnisprava.cz) | Zákon o daních z příjmů č. 586/1992 (ZDP) | §26–33 ZDP depreciation; §23e ZDP interest (30% EBITDA); §38n ZDP losses |
| Hungary | NAV (nav.gov.hu) | Társasági adóról szóló törvény 1996 (TAO) | §1 TAO melléklet depreciation; Art. 8 TAO EBITDA interest; §17 TAO losses |

---

### 3.1 — Sweden (CREATE NEW)

- [ ] Research depreciation: Ch.18 IL machinery (30% declining balance or 20% straight-line); Ch.19 IL buildings (progressive table 2–5%); Ch.20 IL other assets
- [ ] Research interest limitation: Ch.24 §21–29 IL — 30% EBITDA; SEK 5M de minimis; group ratio rule
- [ ] Research loss carry: indefinite forward; no cap; no carryback — Ch.40 IL
- [ ] Research business expense rules: Ch.16 IL — wholly for business purposes
- [ ] Research provisions: bad debt deductions and inventory write-down rules under Ch.17 IL
- [ ] Research non-deductibles: Ch.9 §2 IL (fines, penalties)
- [ ] Summarise R&D deduction: enhanced deduction under IL Ch.16 §37a — summarise in 2–3 sentences and cross-reference to `countries/sweden/rnd_incentives.md`
- [ ] Write `countries/sweden/deductions.md` with all 10 sections

---

### 3.2 — Norway (CREATE NEW)

- [ ] Research saldometode depreciation groups: §14-41 Sktl. — Group A (furniture 20%), B (vehicles 20%), C (machinery 20%), D (machinery 20%), E (ships 14%), F (aircraft/helicopters 12%), G (technical installations in buildings 10%), H (buildings 4%)
- [ ] Research interest limitation: §6-41 Sktl. — 25% EBITDA; NOK 25M de minimis
- [ ] Research Petroleum Tax Act deductions for oil companies — Petroleumsskatteloven §3
- [ ] Research loss carry: indefinite forward — §14-6 Sktl.; 2-year carryback for petroleum companies
- [ ] Research provisions: bad debt deductions — §6-2 Sktl. (actual loss required); inventory write-down rules
- [ ] Research non-deductibles: §6-22 Sktl. (fines), §6-51 Sktl. (cash payments >NOK 10,000)
- [ ] Summarise Skattefunn R&D tax credit (§16-40/§16-41 Sktl.) in 2–3 sentences and cross-reference to `countries/norway/rnd_incentives.md`
- [ ] Write `countries/norway/deductions.md` with all 10 sections

---

### 3.3 — Denmark (CREATE NEW)

- [ ] Research depreciation: AL §5 (25% declining balance for plant/machinery); §14 AL buildings (4% straight-line); §15D AL special assets
- [ ] Research interest limitation: two-tier Danish rule — §11B Selskabsskatteloven (SEL) asset test (1% of tax value of assets); §11C SEL EBITDA test (30% EBITDA); both apply independently; combined cap; DKK 21.3M de minimis
- [ ] Research loss carry: indefinite forward; 60% cap above DKK 8.775M — §12 SEL; no carryback
- [ ] Research joint taxation rules — SEL §31
- [ ] Research provisions: bad debt deductions and inventory write-down rules under Kursgevinstloven
- [ ] Research non-deductibles: §6 Ligningsloven (LL) (private expenses, fines, 25% meal/entertainment)
- [ ] Summarise R&D enhanced deduction (130% super-deduction under Ligningsloven §8B) in 2–3 sentences and cross-reference to `countries/denmark/rnd_incentives.md`
- [ ] Write `countries/denmark/deductions.md` with all 10 sections

---

### 3.4 — Finland (CREATE NEW)

- [ ] Research depreciation: EVL §30 machinery (25% declining balance); §34 buildings (7% industrial, 4% office); §37 goodwill (10 years straight-line)
- [ ] Research interest limitation: EVL §18a — 25% EBITDA; €500k de minimis; exempt for non-related-party
- [ ] Research loss carry: 10 years forward; no cap; no carryback — EVL §119
- [ ] Research R&D extra deduction — link to `rnd_incentives.md`
- [ ] Research non-deductibles: EVL §16 (fines, penalties, income taxes, 50% entertainment)
- [ ] Write `countries/finland/deductions.md` with all 10 sections

---

### 3.5 — Poland (CREATE NEW)

- [ ] Research depreciation: CIT Art. 16a–16m; Annex 1 rates — buildings 2.5%, machinery 10–14%, computers 30%; accelerated for R&D equipment
- [ ] Research EBITDA interest limitation: CIT Art. 15c — 30% EBITDA; PLN 3M de minimis
- [ ] Research loss carry: 5 years forward (or 5× in one year from 2022 option) — CIT Art. 7; no carryback
- [ ] Research Estonian CIT option (CIT on distributed profit only — CIT Art. 28c–28t)
- [ ] Research non-deductibles: CIT Art. 16 (fines, penalties, 50% meal deduction for board members)
- [ ] Write `countries/poland/deductions.md` with all 10 sections

---

### 3.6 — Czech Republic (CREATE NEW)

- [ ] Research depreciation groups: ZDP §30 — Group 1 (3 years), Group 2 (5 years), Group 3 (10 years), Group 4 (20 years), Group 5 (30 years), Group 6 (50 years); straight-line vs declining balance options
- [ ] Research interest limitation: ZDP §23e — 30% EBITDA; CZK 80M de minimis
- [ ] Research loss carry: 5 years forward — ZDP §38n (daňová ztráta — tax loss carry provision); no carryback
- [ ] Research R&D deduction — 100% + 100% extra — link to `rnd_incentives.md`
- [ ] Research non-deductibles: ZDP §25 (fines, penalties, excessive depreciation, 50% entertainment)
- [ ] Write `countries/czech_republic/deductions.md` with all 10 sections

---

### 3.7 — Hungary (CREATE NEW)

- [ ] Research depreciation: TAO Annex 1 — buildings 2%, machinery 14.5–33%, vehicles 20%, computers 33%
- [ ] Research interest limitation: TAO §8 (1) dz — 30% EBITDA; HUF 939M de minimis
- [ ] Research loss carry: indefinite forward; 50% cap per year — TAO §17; no carryback
- [ ] Research development reserve (fejlesztési tartalék) — up to 50% of pre-tax profit, max HUF 10Bn — TAO §7 (1) f
- [ ] Research provisions: bad debt deductions under TAO §7 (1) n; inventory write-down rules
- [ ] Research non-deductibles: TAO §8 (fines, penalties, non-business expenses)
- [ ] Summarise R&D deduction under TAO §7 (1) t (development tax allowance / Fejlesztési adókedvezmény) in 2–3 sentences and cross-reference to `countries/hungary/rnd_incentives.md`
- [ ] Write `countries/hungary/deductions.md` with all 10 sections

---

### 3.8 — Commit Europe East/Nordic batch

- [ ] Verify all 7 files exist at correct paths
- [ ] Run: `ls countries/{sweden,norway,denmark,finland,poland,czech_republic,hungary}/deductions.md`
- [ ] Commit:
```bash
git add countries/sweden/deductions.md countries/norway/deductions.md \
        countries/denmark/deductions.md countries/finland/deductions.md \
        countries/poland/deductions.md countries/czech_republic/deductions.md \
        countries/hungary/deductions.md
git commit -m "feat: add corporate tax deductions — Europe East/Nordic batch (7 countries)"
```

---

## Chunk 4: Asia-Pacific Batch

## Task 4: Asia-Pacific — Australia, New Zealand, Japan, South Korea, China, India, Singapore, Taiwan, Malaysia, Thailand, Vietnam, Philippines, Indonesia

**Files:**
- Update: `countries/australia/deductions.md`
- Update: `countries/singapore/deductions.md`
- Update: `countries/indonesia/deductions.md`
- Create: `countries/new_zealand/deductions.md`
- Create: `countries/japan/deductions.md`
- Create: `countries/south_korea/deductions.md`
- Create: `countries/china/deductions.md`
- Create: `countries/india/deductions.md`
- Create: `countries/taiwan/deductions.md`
- Create: `countries/malaysia/deductions.md`
- Create: `countries/thailand/deductions.md`
- Create: `countries/vietnam/deductions.md`
- Create: `countries/philippines/deductions.md`

**Key sources per country:**

| Country | Tax Authority | Primary Statute | Key Topics |
|---|---|---|---|
| Australia | ATO (ato.gov.au) | Income Tax Assessment Act 1997 (ITAA 1997) | Div 40 UCA depreciation; Div 7A loans; §8-1 general deductions; thin cap Div 820 |
| New Zealand | IRD (ird.govt.nz) | Income Tax Act 2007 (ITA 2007) | Subpart EE depreciation; §DB 6 thin cap; §IA 3 losses |
| Japan | NTA (nta.go.jp) | Corporation Tax Act (法人税法 — CTA); Special Taxation Measures Law (STML) | Art. 31 CTA depreciation; earnings stripping §66-5b STML; §57 CTA losses |
| South Korea | NTS (nts.go.kr) | Corporate Tax Act (법인세법 — CTA); Act for Coordination of International Tax Affairs (ACITA) | Art. 23 CTA depreciation; Art. 28 CTA thin cap (2:1); §45 CTA losses (이월결손금) |
| China | SAT (chinatax.gov.cn) | Enterprise Income Tax Law (EITL) 2007; EITL Regulations | Art. 11 EITL depreciation; Art. 46 EITL thin cap (2:1 general, 5:1 financial); Art. 18 EITL losses |
| India | IT Dept (incometax.gov.in) | Income Tax Act 1961 (ITA 1961) | §32 ITA depreciation (WDV); §94B ITA thin cap; §72 ITA losses; §36 ITA deductions |
| Singapore | IRAS (iras.gov.sg) | Income Tax Act (ITA Cap 134) | §19–19A capital allowances; §14 deductibility; §37 losses |
| Taiwan | MOF (mof.gov.tw) | Income Tax Act (所得稅法 — ITA); Business Mergers Act | Art. 51 ITA depreciation; Art. 43-2 ITA thin cap (3:1); Art. 39 ITA losses |
| Malaysia | LHDN/IRB (hasil.gov.my) | Income Tax Act 1967 (ITA 1967) | §42/Sch 3 capital allowances; §33 ITA deductions; thin cap guidelines |
| Thailand | RD (rd.go.th) | Revenue Code (RC) | §65 RC depreciation; §65 ter RC non-deductibles; thin cap via transfer pricing |
| Vietnam | GDT (gdt.gov.vn) | Corporate Income Tax Law 14/2008 (CIT Law); Decree 218/2013 | Art. 6 CIT deductions; Circular 78/2014; thin cap Decree 132/2020 (3:1) |
| Philippines | BIR (bir.gov.ph) | National Internal Revenue Code (NIRC); Tax Reform Act (TRAIN/CREATE) | §34 NIRC deductions; §107 NIRC depreciation rates |
| Indonesia | DJP (pajak.go.id) | Income Tax Law 36/2008 (PPh Law); GR 55/2022 | Art. 11 PPh depreciation groups; Art. 18 PPh thin cap (4:1); Art. 6 PPh deductions |

---

### 4.1 — Australia (UPDATE)

- [ ] Read existing `countries/australia/deductions.md` in full
- [ ] Verify Div 40 Uniform Capital Allowance (UCA) effective lives; instant asset write-off threshold for 2024/2025 (check if $20,000 for SBE or different threshold applies)
- [ ] Verify thin capitalisation Div 820 — AASB/OECD aligned rules from 1 July 2023 (debt deduction creation rules, fixed ratio test 30% EBITDA)
- [ ] Verify loss carry: unlimited forward; no carryback (COVID carryback expired 2023)
- [ ] Update any stale figures; add missing template sections

---

### 4.2 — Singapore (UPDATE)

- [ ] Read existing `countries/singapore/deductions.md` in full
- [ ] Verify capital allowance rates §19/19A/19B ITA; S$300,000 renovation cap §14Q; working capital deduction §14C/14D
- [ ] Verify interest restriction: no formal thin-cap statute; arm's-length via transfer pricing
- [ ] Verify loss carry: 1 year back (up to S$100,000 for YA2024 — check current limit); indefinite forward — §37 ITA
- [ ] Update any stale figures; add missing template sections

---

### 4.3 — Indonesia (UPDATE)

- [ ] Read existing `countries/indonesia/deductions.md` in full
- [ ] Verify PPh Law Art. 11 depreciation groups: Group 1 (4 years, 25%/50% acc), Group 2 (8 years), Group 3 (16 years), Group 4 (20 years); buildings 20 years
- [ ] Verify thin cap: 4:1 debt-to-equity (Ministry of Finance Regulation 169/2015)
- [ ] Verify loss carry: 5 years forward (extendable to 10 in certain regions/sectors) — PPh Art. 6(2); no carryback
- [ ] Update any stale figures; add missing template sections

---

### 4.4 — New Zealand (CREATE NEW)

- [ ] Research depreciation: Subpart EE ITA 2007 — diminishing value or straight-line; IRD publishes DEP rates by asset type; buildings generally 0% from 2011 (except temporary measures)
- [ ] Research general deductions: §DA 1 ITA — incurred in deriving assessable income
- [ ] Research interest limitation: thin capitalisation §FE 6–FE 18 ITA — 60% asset-based; outbound 110% of worldwide group ratio
- [ ] Research loss carry: indefinite forward; continuity 49% ownership — §IA 3–IA 5 ITA; no carryback (COVID measure expired)
- [ ] Research R&D tax credit — link to `rnd_incentives.md`
- [ ] Research non-deductibles: §DA 2 ITA (private, capital, exempt income)
- [ ] Write `countries/new_zealand/deductions.md` with all 10 sections

---

### 4.5 — Japan (CREATE NEW)

- [ ] Research depreciation: CTA Art. 31; Ministry of Finance Ordinance on Useful Lives; declining balance (定率法) vs straight-line (定額法); buildings post-April 2007 straight-line only; machinery 5–10 years typical; immediate expensing for SMEs (§28 STML)
- [ ] Research earnings stripping: §66-5b STML — 20% EBITDA (net interest / adjusted income); JPY 20M de minimis
- [ ] Research loss carry: 10 years forward; 1 year carryback (for SMEs/liquidation only) — CTA §57
- [ ] Research special depreciation for green/digital investment (STML §42–68)
- [ ] Research non-deductibles: CTA §38 (entertainment 50% or full deduction limit by industry)
- [ ] Write `countries/japan/deductions.md` with all 10 sections

---

### 4.6 — South Korea (CREATE NEW)

- [ ] Research depreciation: CTA Art. 23 — declining balance (정률법) or straight-line (정액법); useful life by asset class per Enforcement Decree; buildings 20–40 years
- [ ] Research thin capitalisation: CTA Art. 28 — 2:1 debt-to-equity for related-party overseas loans; excess interest non-deductible
- [ ] Research EBITDA interest limitation: §22-4 Act for Coordination of International Tax Affairs (ACITA) — 30% EBITDA for overseas related-party interest
- [ ] Research loss carry: 15 years forward; no carryback — CTA §45 (이월결손금, net operating loss carryforward)
- [ ] Research R&D deduction rates — link to `rnd_incentives.md`
- [ ] Research non-deductibles: CTA Art. 21 (entertainment allowances, fines)
- [ ] Write `countries/south_korea/deductions.md` with all 10 sections

---

### 4.7 — China (CREATE NEW)

- [ ] Research depreciation: EITL Art. 11; Regulation Art. 57–60; min useful lives: buildings 20 years, aircraft/trains 10 years, machinery 10 years, IT equipment/vehicles 5 years, production tools 3 years; 100% expensing for manufacturing SMEs (Announcement 12/2023)
- [ ] Research thin capitalisation: EITL Art. 46 — 2:1 for general enterprises, 5:1 for financial institutions; GAAR backstop
- [ ] Research loss carry: 5 years forward (10 years for HNTE and encouraged industries from 2018) — EITL Art. 18; no carryback
- [ ] Research special industries: High-New Tech Enterprise (HNTE) 15% rate; Western Development incentives
- [ ] Research non-deductibles: EITL Regulation Art. 49–55 (entertainment 60% up to 0.5% revenue; advertising 15% revenue)
- [ ] Write `countries/china/deductions.md` with all 10 sections

---

### 4.8 — India (CREATE NEW)

- [ ] Research depreciation: ITA §32 — WDV method; rates per Appendix I to Income Tax Rules 1962; buildings 5–10%, plant/machinery 15–100% (special rates for energy/pollution control equipment); optional §32(1)(iia) 20% additional depreciation for manufacturing
- [ ] Research thin capitalisation: §94B ITA — 30% EBITDA for interest paid to AE (associated enterprise); INR 10 crore de minimis; 5-year carry of excess
- [ ] Research loss carry: 8 years forward (business losses); indefinite for unabsorbed depreciation — §72 ITA; no carryback
- [ ] Research deductions under §36 ITA: bad debts, family planning, securities transaction tax, employer's contribution to PF/gratuity
- [ ] Research §43B payments deductible only on actual payment (PF, gratuity, bonus, interest on government loans)
- [ ] Research non-deductibles: §37(1) proviso (CSR expenditure non-deductible from AY 2015-16 onwards)
- [ ] Write `countries/india/deductions.md` with all 10 sections

---

### 4.9 — Taiwan (CREATE NEW)

- [ ] Research depreciation: Art. 51 ITA — straight-line or declining balance; Ministry of Finance asset life tables; machinery 3–10 years; buildings 10–60 years
- [ ] Research thin capitalisation: Art. 43-2 ITA — 3:1 debt-to-equity for related-party overseas borrowings
- [ ] Research loss carry: 10 years forward — Art. 39 ITA; no carryback
- [ ] Research Statute for Industrial Innovation deductions (研發投資抵減) — link to `rnd_incentives.md`
- [ ] Research AMT (Alternative Minimum Tax) interaction with deductions
- [ ] Research non-deductibles: Art. 38 ITA (fines, penalties, 30% entertainment, political donations)
- [ ] Write `countries/taiwan/deductions.md` with all 10 sections

---

### 4.10 — Malaysia (CREATE NEW)

- [ ] Research capital allowances: ITA 1967 Schedule 3 — initial allowance (20%) + annual allowance (industrial buildings 3%, plant/machinery 10–20%, computers 20–40%, vehicles 20%)
- [ ] Research general deductibility: §33 ITA 1967 — wholly and exclusively for producing income
- [ ] Research interest restriction: no formal thin-cap statute; IRB guidelines apply arm's-length; Labuan entity rules differ
- [ ] Research loss carry: indefinite forward; no carryback — §44 ITA 1967
- [ ] Research Reinvestment Allowance (RA) — 60% of QCE for 15 years
- [ ] Research transfer pricing: §140A ITA 1967 and IRB Transfer Pricing Guidelines 2012 — related-party expense deductibility conditions; Labuan entity interplay
- [ ] Research non-deductibles: §39 ITA 1967 (private expenses, capital, taxes, fines)
- [ ] Write `countries/malaysia/deductions.md` with all 10 sections

---

### 4.11 — Thailand (CREATE NEW)

- [ ] Research depreciation: RC §65 — straight-line; Revenue Department guidance on useful lives: buildings 5–40 years, machinery 5–20 years; 40% accelerated for start of operations
- [ ] Research BOI (Board of Investment) incentive deductions
- [ ] Research interest restriction: no formal thin-cap statute; arm's-length via transfer pricing Ministerial Regulation 161
- [ ] Research loss carry: 5 years forward — RC §65 ter (12); no carryback
- [ ] Research double deduction for training and R&D — link to `rnd_incentives.md`
- [ ] Research non-deductibles: RC §65 ter (entertainment 0.3% of income, max THB 10M; fines; personal tax)
- [ ] Write `countries/thailand/deductions.md` with all 10 sections

---

### 4.12 — Vietnam (CREATE NEW)

- [ ] Research depreciation: Circular 45/2013 — straight-line; Ministry of Finance asset life tables: buildings 25–50 years, machinery 7–15 years, transport 6–10 years; max accelerated 2× useful life
- [ ] Research thin capitalisation: Decree 132/2020 — 3:1 debt-to-equity for related-party total loans; 30% EBITDA cap on net interest; 5-year carry of excess
- [ ] Research general deductions: Decree 218/2013 Art. 6 — business-related, invoiced, non-cash >VND 20M
- [ ] Research loss carry: 5 years forward — CIT Law Art. 9; no carryback
- [ ] Research non-deductibles: Art. 9(2) CIT Law (non-business expenses, fines, excess depreciation, uninvoiced >VND 20M)
- [ ] Write `countries/vietnam/deductions.md` with all 10 sections

---

### 4.13 — Philippines (CREATE NEW)

- [ ] Research depreciation: NIRC §34(F) — straight-line, declining balance, sum-of-years-digits, or unit of production; no official asset-life table (taxpayer determines, subject to BIR scrutiny); 10-year straight-line common
- [ ] Research general deductions: NIRC §34(A)–(L) — business expenses, interest, taxes, losses, bad debts, depreciation, depletion, charitable contributions (up to 10% of taxable income)
- [ ] Research interest expense limitation: NIRC §34(B)(1) — reduce deductible interest by 33% of interest income subject to final tax (CREATE Act reduction from 38%)
- [ ] Research loss carry: 3 years forward (NOLCO) — NIRC §34(D)(3); CREATE Act extended to 5 years for 2020-2021 losses; no carryback
- [ ] Research MCIT (Minimum Corporate Income Tax) of 1% (CREATE Act) vs 2% normal; excess MCIT carry
- [ ] Research non-deductibles: NIRC §36 (personal expenses, gifts, bribes, fines, capital losses beyond gains)
- [ ] Write `countries/philippines/deductions.md` with all 10 sections

---

### 4.14 — Commit Asia-Pacific batch

- [ ] Verify all 13 files exist at correct paths
- [ ] Run: `ls countries/{australia,new_zealand,japan,south_korea,china,india,singapore,taiwan,malaysia,thailand,vietnam,philippines,indonesia}/deductions.md`
- [ ] Commit:
```bash
git add countries/australia/deductions.md countries/new_zealand/deductions.md \
        countries/japan/deductions.md countries/south_korea/deductions.md \
        countries/china/deductions.md countries/india/deductions.md \
        countries/singapore/deductions.md countries/taiwan/deductions.md \
        countries/malaysia/deductions.md countries/thailand/deductions.md \
        countries/vietnam/deductions.md countries/philippines/deductions.md \
        countries/indonesia/deductions.md
git commit -m "feat: add/update corporate tax deductions — Asia-Pacific batch (13 countries)"
```

---

## Chunk 5: Middle East / Africa Batch + Final Verification

## Task 5: Middle East / Africa — UAE, Saudi Arabia, Israel, South Africa, Kenya, Nigeria, Turkey

**Files (all CREATE NEW):**
- `countries/uae/deductions.md`
- `countries/saudi_arabia/deductions.md`
- `countries/israel/deductions.md`
- `countries/south_africa/deductions.md`
- `countries/kenya/deductions.md`
- `countries/nigeria/deductions.md`
- `countries/turkey/deductions.md`

**Key sources per country:**

| Country | Tax Authority | Primary Statute | Key Topics |
|---|---|---|---|
| UAE | MoF / FTA (tax.gov.ae) | Federal Decree-Law No. 47/2022 (CT Law) | Art. 28 CT depreciation; Art. 30 CT interest (30% EBITDA); Art. 38 CT losses; qualifying free zone |
| Saudi Arabia | ZATCA (zatca.gov.sa) | Income Tax Regulations (ITR) Ministerial Resolution 1535 | Art. 7 ITR deductions; Art. 23 ITR depreciation; Art. 11 ITR thin cap (3:1); Art. 16 ITR losses |
| Israel | ITA (taxes.gov.il) | Income Tax Ordinance (ITO) [New Version] | §21 ITO depreciation (Regulations); §32 ITO non-deductibles; §28 ITO losses; §17(1) ITO interest |
| South Africa | SARS (sars.gov.za) | Income Tax Act 58/1962 (ITA) | §11(e) ITA depreciation; §23M ITA interest (40% EBITDA); §20 ITA assessed loss; §11(j) doubtful debts |
| Kenya | KRA (kra.go.ke) | Income Tax Act Cap 470 (ITA) | 2nd Schedule ITA investment deductions; §15 ITA deductions; §56 ITA thin cap (3:1); §15(5) ITA losses |
| Nigeria | FIRS (firs.gov.ng) | Companies Income Tax Act (CITA) Cap C21; Petroleum Profits Tax Act (PPTA) | §24 CITA deductions; 3rd Schedule CITA depreciation; §16 CITA thin cap (transferred from law); §27 CITA losses |
| Turkey | GİB (gib.gov.tr) | Kurumlar Vergisi Kanunu No. 5520 (KVK); Vergi Usul Kanunu (VUK) | Art. 313 VUK depreciation (straight-line, optional declining balance); Art. 12 KVK thin cap (3:1); Art. 9 KVK losses |

---

### 5.1 — UAE (CREATE NEW)

- [ ] Research UAE CT Law (effective June 2023): Art. 28 — depreciation per IFRS acceptable; no specific asset-life table in the law
- [ ] Research interest deduction: Art. 30 — 30% EBITDA limit; AED 12M de minimis; general interest deductible if for business
- [ ] Research loss carry: indefinite forward — Art. 38 CT Law; no carryback; 75% taxable income cap
- [ ] Research Qualifying Free Zone Person (QFZP) 0% rate vs 9% rate distinction; deductions in free zones
- [ ] Research transfer pricing: Ministerial Decision 97/2023; OECD arm's-length
- [ ] Research non-deductibles: Art. 33 CT (fines, penalties, dividends, entertainment 50%)
- [ ] Research Islamic finance: profit-sharing payments treated as interest equivalent
- [ ] Write `countries/uae/deductions.md` with all 10 sections

---

### 5.2 — Saudi Arabia (CREATE NEW)

- [ ] Research ITR Art. 23 depreciation: straight-line; buildings 4–10%, plant 10–25%, vehicles 25%, computers 40%; accelerated for energy-efficient assets
- [ ] Research Art. 7 ITR general deductibility requirements (actual, for business, documented, arm's-length)
- [ ] Research thin capitalisation: Art. 11 ITR — 3:1 debt-to-equity ratio for related-party debt; excess interest non-deductible
- [ ] Research Zakat vs Income Tax: Saudi nationals and GCC nationals pay Zakat (2.5% net worth); non-Saudi entities pay income tax; mixed ownership — proportional split
- [ ] Research loss carry: 10 years forward — Art. 16 ITR; no carryback
- [ ] Research Aramco/petroleum sector: Ministerial Resolution for oil companies (different rates)
- [ ] Research non-deductibles: Art. 8 ITR (fines, personal expenses, undisclosed payments)
- [ ] Write `countries/saudi_arabia/deductions.md` with all 10 sections

---

### 5.3 — Israel (CREATE NEW)

- [ ] Research depreciation: ITO §21 + Income Tax Regulations (Depreciation Rates) 5746-1985 (and subsequent amendments) — buildings 2–5%, machinery 7–15%, vehicles 15%, computers 33%; optional accelerated under special programs
- [ ] Research interest: §17(1) ITO — deductible if for income-producing purposes; CFC rules
- [ ] Research thin capitalisation: no formal statute; transfer pricing Order §85A ITO applies
- [ ] Research Technological Preferred Enterprise benefits (15% tax) — link to `rnd_incentives.md`
- [ ] Research loss carry: indefinite forward — §28 ITO; carryback 2 years for capital losses only
- [ ] Research non-deductibles: §32 ITO (private, capital, voluntary payments, entertainment 80% non-deductible)
- [ ] Write `countries/israel/deductions.md` with all 10 sections

---

### 5.4 — South Africa (CREATE NEW)

- [ ] Research §11(e) ITA wear and tear: SARS Interpretation Note 47 (IN47) — machinery 5 years, computers 3 years, vehicles 5 years; straight-line using prescribed rates
- [ ] Research §12C manufacturing asset allowance (40/20/20/20) and §12E SBC accelerated depreciation
- [ ] Research §23M interest limitation: 40% of "adjusted taxable income" (similar to EBITDA); applies to debt owed to connected person not subject to SA tax
- [ ] Research assessed loss: indefinite carry forward — §20 ITA; ring-fenced for companies
- [ ] Research §11(j) doubtful debt allowance; §25D foreign currency translation
- [ ] Research mining capital expenditure — §36 ITA (capex deductible over 3 years or upfront for gold mines)
- [ ] Research non-deductibles: §23 ITA (personal, capital, non-connected to income)
- [ ] Write `countries/south_africa/deductions.md` with all 10 sections

---

### 5.5 — Kenya (CREATE NEW)

- [ ] Research investment deductions: 2nd Schedule ITA Cap 470 — 100% in year 1 for industrial buildings; 50% wear and tear for machinery (reducing balance); 12.5% for computers; 25% for vehicles
- [ ] Research general deductions: §15 ITA — wholly and exclusively for producing income
- [ ] Research thin capitalisation: §16(2)(j) ITA — disallows interest where foreign debt exceeds 3× equity; KRA practice
- [ ] Research loss carry: 4 years forward — §15(5) ITA; no carryback; ring-fenced for real estate
- [ ] Research Export Processing Zone (EPZ) and Special Economic Zone (SEZ) deductions
- [ ] Research non-deductibles: §16 ITA (capital, private, domestic, taxes, fines, contingent payments)
- [ ] Write `countries/kenya/deductions.md` with all 10 sections

---

### 5.6 — Nigeria (CREATE NEW)

- [ ] Research 3rd Schedule CITA depreciation: initial allowance (25–95%) + annual allowance (5–33%); petroleum companies under PPTA different
- [ ] Research §24 CITA deductibility requirements: wholly, reasonably, and exclusively for producing income; arm's-length
- [ ] Research thin capitalisation: §16 CITA — total debt not to exceed 70% of total assets (a 70:100 debt-to-assets ratio, equivalent to approximately 2.33:1 debt-to-equity); interest on excess non-deductible from 2022
- [ ] Research loss carry: 4 years forward (6 years for agricultural) — §27 CITA; no carryback
- [ ] Research Pioneer Status Incentive (tax holiday) deductions during holiday period
- [ ] Research PPTA (Petroleum Profits Tax) deductions for upstream oil companies — separate regime
- [ ] Research non-deductibles: §25 CITA (capital, taxes, fines, reserves, excessive management fees)
- [ ] Write `countries/nigeria/deductions.md` with all 10 sections

---

### 5.7 — Turkey (CREATE NEW)

- [ ] Research VUK Art. 313–321 depreciation: straight-line (normal) or declining balance (hızlandırılmış amortisман); useful lives in VUK general communiqué tables; buildings 2–5%, machinery 10–25%; optional accelerated to 2×
- [ ] Research thin capitalisation: KVK Art. 12 — 3:1 debt-to-equity ratio for total shareholder debt; excess interest non-deductible + subject to withholding
- [ ] Research general deductibility: KVK Art. 8 + GVK Art. 40 — business-related, documented
- [ ] Research loss carry: 5 years forward — KVK Art. 9; no carryback
- [ ] Research R&D centres and Technology Development Zones deductions — link to `rnd_incentives.md`
- [ ] Research inflation adjustment (enflasyon düzeltmesi) effective 2024 — impact on depreciable assets
- [ ] Research non-deductibles: KVK Art. 11 (fines, penalties, bribery, 50% entertainment, income taxes)
- [ ] Write `countries/turkey/deductions.md` with all 10 sections

---

### 5.8 — Commit Middle East/Africa batch

- [ ] Verify all 7 files exist at correct paths
- [ ] Run: `ls countries/{uae,saudi_arabia,israel,south_africa,kenya,nigeria,turkey}/deductions.md`
- [ ] Commit:
```bash
git add countries/uae/deductions.md countries/saudi_arabia/deductions.md \
        countries/israel/deductions.md countries/south_africa/deductions.md \
        countries/kenya/deductions.md countries/nigeria/deductions.md \
        countries/turkey/deductions.md
git commit -m "feat: add corporate tax deductions — Middle East/Africa batch (7 countries)"
```

---

## Task 6: Final Verification

- [ ] Verify all 45 files exist:
```bash
for d in us canada brazil mexico argentina chile colombia \
          uk germany france italy spain netherlands belgium ireland portugal switzerland austria \
          sweden norway denmark finland poland czech_republic hungary \
          australia new_zealand japan south_korea china india singapore taiwan malaysia thailand vietnam philippines indonesia \
          uae saudi_arabia israel south_africa kenya nigeria turkey; do
  if [ -f "countries/$d/deductions.md" ]; then
    echo "✓ $d"
  else
    echo "✗ MISSING: $d"
  fi
done
```
Expected: 45 lines all showing ✓

- [ ] Verify all 10 sections present in each file:
```bash
for d in us canada brazil mexico argentina chile colombia \
          uk germany france italy spain netherlands belgium ireland portugal switzerland austria \
          sweden norway denmark finland poland czech_republic hungary \
          australia new_zealand japan south_korea china india singapore taiwan malaysia thailand vietnam philippines indonesia \
          uae saudi_arabia israel south_africa kenya nigeria turkey; do
  count=$(grep -c "^## [0-9]" "countries/$d/deductions.md" 2>/dev/null || echo 0)
  echo "$d: $count sections"
done
```
Expected: all countries showing 10+ sections

- [ ] Spot-check 5 files across different batches for statutory citation format
- [ ] Final commit if any cleanup needed:
```bash
git add countries/*/deductions.md
git commit -m "chore: final cleanup — 45-country corporate tax deductions complete"
```
