# Design Spec: Corporate Tax Deductions — All 45 Countries

**Date:** 2026-03-15
**Status:** Approved
**Scope:** Create/update `deductions.md` for all 45 countries in the Kolosal Tax Planning repository

---

## 1. Objective

Produce comprehensive, verified corporate/business tax deduction reference files for all 45 countries in the repository. The 7 Tier 1 countries have existing files that need updating and verification. The 38 Tier 2 countries need new files created from scratch, matching Tier 1 depth.

---

## 2. Output Format

Each country produces one file: `countries/[directory]/deductions.md`

### Required Structure (10-section minimum template)

> **IMPORTANT:** The 10-section template below is the **minimum required structure**. Do NOT remove country-specific sections that already exist in Tier 1 files. Preserve all existing sections; add any template sections that are missing. For Tier 2 (new) files, the template is the target structure — add additional country-specific sections as warranted.

```
# [Country] - Taxable Income Deductions

> **Jurisdiction**: [Federal/National] ([Tax Authority])
> **Governing Law**: [Primary Tax Statute]
> **Tax Year**: [label per jurisdiction — see Section 4]
> **Currency**: [CUR] ([Symbol])

---

## 1. Depreciation & Capital Allowances
   - Asset classes, rates, methods (straight-line, declining balance, etc.)
   - Accelerated depreciation options
   - Year-by-year rate tables where applicable
   - Asset-specific rules and caps
   - Restrictions (e.g., motor vehicles, luxury assets)

## 2. Business Operating Expenses
   - Salaries, wages, employee costs
   - Rent and office expenses
   - Utilities, insurance, professional fees
   - Advertising and marketing
   - Travel and entertainment (with limits)
   - Meals and entertainment caps

## 3. Interest & Financing Costs
   - Thin capitalisation rules (debt:equity ratios)
   - Earnings stripping / interest limitation rules (EBITDA %)
   - Related-party interest restrictions
   - Deductibility caps and conditions

## 4. Research & Development
   - 2–3 sentence summary of the deduction mechanism
   - Cross-reference: "See [R&D Incentives](rnd_incentives.md) for full program detail."
   - Do NOT reproduce rates and qualifying expense tables already in rnd_incentives.md

## 5. Loss Carry-Forward & Carry-Back
   - Carry-forward: years allowed, any income caps (%)
   - Carry-back: years allowed, any caps
   - Restrictions on change of ownership
   - Ring-fencing rules

## 6. Provisions & Reserves
   - Bad debt provisions
   - Inventory write-downs
   - Warranty provisions
   - Other statutory reserves

## 7. Industry-Specific Deductions
   - Cover only the most commercially significant industry regimes (max 3–4)
   - For countries with a dominant extractive industry (Nigeria, Saudi Arabia, Indonesia,
     UAE, Norway), petroleum/mining deductions are mandatory
   - Other common sectors: agriculture, financial services, real estate

## 8. Treaties & Transfer Pricing
   - Transfer pricing documentation requirements
   - Related-party expense deductibility conditions
   - Thin cap interaction with treaties

## 9. Non-Deductible Items
   - Explicit statutory exclusions
   - Penalties, fines
   - Personal expenses
   - Capital expenditure (vs. revenue)

## 10. Sources & Legal References
    | Reference | Citation |
    |---|---|
```

---

## 3. Execution Strategy

### Parallel Batch Architecture

Five independent agents run simultaneously. Each agent:
1. Performs live web research for each assigned country
2. Verifies statutory rates against current tax authority sources
3. Writes the `deductions.md` file(s) to the repository
4. Cross-references existing `rnd_incentives.md` files (summarise + link, no duplication)
5. Follows all CLAUDE.md conventions (legal citations, rate formatting, etc.)

### Completion Protocol

Each agent writes all assigned files regardless of data confidence. Use `[unverified — confirm with local counsel]` for any figure not confirmed against an official source. Do not skip files due to data gaps — a partially-verified file is better than no file.

### Batch Assignments

| Batch | Agent | Countries (count) |
|---|---|---|
| Americas | Agent 1 | US, Canada, Brazil, Mexico, Argentina, Chile, Colombia (7) |
| Europe West | Agent 2 | UK, Germany, France, Italy, Spain, Netherlands, Belgium, Ireland, Portugal, Switzerland, Austria (11) |
| Europe East/Nordic | Agent 3 | Sweden, Norway, Denmark, Finland, Poland, Czech Republic, Hungary (7) |
| Asia-Pacific | Agent 4 | Australia, New Zealand, Japan, South Korea, China, India, Singapore, Taiwan, Malaysia, Thailand, Vietnam, Philippines, Indonesia (13) |
| Middle East / Africa | Agent 5 | UAE, Saudi Arabia, Israel, South Africa, Kenya, Nigeria, Turkey (7) |

**Total:** 45 countries

### Tier 1 vs Tier 2 Handling

- **Tier 1 (7 countries):** Read existing file first → verify each figure against current statute → update outdated rates → add any template sections that are missing. **Do not delete or restructure existing country-specific sections.**
- **Tier 2 (38 countries):** Research from scratch → write new file → follow full 10-section template → add additional sections for significant country-specific deductions.

---

## 4. Research & Labelling Standards

### Tax Year Labels by Jurisdiction

| Jurisdiction | Fiscal Year | Label to Use |
|---|---|---|
| Most countries | Calendar year | `2024/2025` or `2025` |
| Australia | 1 Jul 2024 – 30 Jun 2025 | `2024/2025 (FY2025)` |
| India | 1 Apr 2024 – 31 Mar 2025 | `2024/2025 (AY 2025-26)` |
| United Kingdom | 6 Apr 2024 – 5 Apr 2025 | `2024/2025` |
| Japan | 1 Apr 2024 – 31 Mar 2025 (statutory) | `2024/2025` |
| South Korea | Calendar year | `2024/2025` |
| New Zealand | 1 Apr 2024 – 31 Mar 2025 | `2024/2025` |

### Source Standards

- Verify against official tax authority websites or IBFD/Deloitte/PWC country guides
- All rates as floats in tables, `%` suffix in prose
- Legal citations: full statute name first, then abbreviation — e.g., `Corporation Tax Act 2009 (CTA 2009) §54`
- Mark unverifiable data with `[unverified — confirm with local counsel]`

### CLAUDE.md Conventions

- Rates: `30%` (no space before %)
- Monetary: currency prefix — `€1M`, `¥1M`, `£1M`, `A$1M`
- Percentages always include `%` sign
- Time: "Tax year 2024/2025"
- Legal citations: full statute then abbreviation

---

## 5. Directory Mapping

All files written to: `countries/[directory]/deductions.md` using the exact directory name below.

| Country | Directory (exact) | Status |
|---|---|---|
| United States | `us` | UPDATE existing |
| Canada | `canada` | UPDATE existing |
| Brazil | `brazil` | UPDATE existing |
| Mexico | `mexico` | UPDATE existing |
| Australia | `australia` | UPDATE existing |
| Singapore | `singapore` | UPDATE existing |
| Indonesia | `indonesia` | UPDATE existing |
| United Kingdom | `uk` | CREATE NEW |
| Germany | `germany` | CREATE NEW |
| France | `france` | CREATE NEW |
| Italy | `italy` | CREATE NEW |
| Spain | `spain` | CREATE NEW |
| Netherlands | `netherlands` | CREATE NEW |
| Belgium | `belgium` | CREATE NEW |
| Ireland | `ireland` | CREATE NEW |
| Portugal | `portugal` | CREATE NEW |
| Switzerland | `switzerland` | CREATE NEW |
| Austria | `austria` | CREATE NEW |
| Sweden | `sweden` | CREATE NEW |
| Norway | `norway` | CREATE NEW |
| Denmark | `denmark` | CREATE NEW |
| Finland | `finland` | CREATE NEW |
| Poland | `poland` | CREATE NEW |
| Czech Republic | `czech_republic` | CREATE NEW |
| Hungary | `hungary` | CREATE NEW |
| Japan | `japan` | CREATE NEW |
| South Korea | `south_korea` | CREATE NEW |
| China | `china` | CREATE NEW |
| India | `india` | CREATE NEW |
| Taiwan | `taiwan` | CREATE NEW |
| Malaysia | `malaysia` | CREATE NEW |
| Thailand | `thailand` | CREATE NEW |
| Vietnam | `vietnam` | CREATE NEW |
| Philippines | `philippines` | CREATE NEW |
| New Zealand | `new_zealand` | CREATE NEW |
| UAE | `uae` | CREATE NEW |
| Saudi Arabia | `saudi_arabia` | CREATE NEW |
| Israel | `israel` | CREATE NEW |
| Turkey | `turkey` | CREATE NEW |
| South Africa | `south_africa` | CREATE NEW |
| Kenya | `kenya` | CREATE NEW |
| Nigeria | `nigeria` | CREATE NEW |
| Argentina | `argentina` | CREATE NEW |
| Chile | `chile` | CREATE NEW |
| Colombia | `colombia` | CREATE NEW |

---

## 6. Success Criteria

- All 45 countries have a `deductions.md` file at the correct path
- Every file covers all 10 template sections (plus any pre-existing country-specific sections for Tier 1)
- Statutory citations present for every deduction category
- Rates current for the appropriate tax year per jurisdiction (see Section 4)
- No hardcoded colors, no HTML — pure markdown
- Existing Tier 1 files verified and updated where rates have changed; no existing sections deleted
- Unverified figures tagged with `[unverified — confirm with local counsel]`
- **JSON data files (`data/*.json`) are out of scope for this task.** Rates in existing JSON files will be reconciled in a separate pass.
