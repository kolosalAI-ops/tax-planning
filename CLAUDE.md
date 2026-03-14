# Kolosal Tax Planning — Project Standards

## Project Overview

Kolosal Tax Advisory research repository: 45-country tax incentive analysis with HTML slide presentations, country-level markdown research files, structured JSON data, and cross-country analysis documents.

## Directory Structure

```
tax-planning/
├── countries/[country_code]/       # Country-specific research (lowercase 2-letter ISO codes)
│   ├── rnd_incentives.md           # R&D tax incentives (all 45 countries)
│   ├── revenue_tax.md              # Corporate/revenue tax (7 primary countries)
│   ├── deductions.md               # Deductions & allowances (7 primary countries)
│   └── international_investors.md  # Foreign investor guide (7 primary countries)
├── data/
│   ├── [country_code].json         # Structured tax data per country
│   ├── rnd_incentives.json         # Centralized 45-country R&D database
│   └── optimization.json           # Tax optimization strategies
├── analysis/
│   ├── comprehensive_tax_analysis.md
│   ├── international_investor_analysis.md
│   └── rnd_tax_incentives.md
├── presentation.html               # Foundational tax planning (Level 100)
├── presentation-201.html           # Intermediate (Level 201)
├── presentation-301.html           # Advanced (Level 301)
├── presentation-startup.html       # B2B startup focus
├── presentation-rnd.html           # R&D incentives (45-country)
└── International_Tax_Planning_Guide.html
```

### Country Coverage Tiers

- **Tier 1 (Comprehensive — 4 files each):** US, Canada, Indonesia, Brazil, Mexico, Australia, Singapore
- **Tier 2 (R&D only — 1 file each):** 38 additional countries
- **Total:** 45 countries

---

## HTML Presentation Standards

### File Naming

- Pattern: `presentation[-descriptor].html`
- Single self-contained HTML file (no external CSS/JS dependencies except Google Fonts)
- Slides are 100vw x 100vh, absolute positioned, toggled via `.active` class

### Design System — CSS Variables

```css
:root {
  /* Neutrals */
  --bg: #FFFFFF;          --fg: #0D0E0F;
  --border: #E4E7E9;      --muted: #6A6F73;
  --light: #F1F3F4;       --medium: #DDE1E3;
  --dark: #3C3E40;        --card-hover: #F8F9F9;

  /* Accent (Blue) */
  --accent: #0052C4;      --accent-light: #F0F6FE;
  --accent-mid: #0066F5;

  /* Semantic */
  --blue: #0052C4;        --blue-light: #F0F6FE;
  --amber: #CC8727;       --amber-light: #FFFAF3;
  --red: #CC2727;         --red-light: #FFF3F3;
  --green: #16a34a;       --green-light: #f0fdf4;
  --blue-alt: #2563eb;

  /* Typography */
  --sans: 'Inter', sans-serif;
  --mono: 'Geist Mono', monospace;

  /* Spacing (4px base, 8px rhythm) */
  --space-xs: 4px;   --space-sm: 8px;   --space-md: 16px;
  --space-lg: 24px;  --space-xl: 32px;  --space-2xl: 40px;
  --space-3xl: 48px; --space-4xl: 64px; --space-5xl: 72px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 2px 8px rgba(0,0,0,0.06);
  --shadow-lg: 0 4px 16px rgba(0,0,0,0.08);
}
```

### Typography Scale

| Class | Size | Weight | Transform | Usage |
|-------|------|--------|-----------|-------|
| `.label` | 10px | 700 | uppercase, 0.10em spacing | Section labels |
| `.title` | 38px | 800 | -0.035em spacing | Slide titles |
| `.title-slide .title` | 46px | 800 | -0.045em spacing | Title slide heading |
| `.subtitle` | 15px | 400 | line-height 1.7 | Title slide description |
| `.h2` | 28px | 700 | -0.02em spacing | Content slide headings |
| `.h3` | 11px | 700 | uppercase, 0.06em spacing | Card/section subheadings |
| `.mono` | — | — | — | Monospace override class |

### Slide Types

**Title slide:** `class="slide title-slide"` with `.inner.centered`
**Content slide:** `class="slide"` with `.inner.content` (top-aligned)
**Section divider:** `class="slide section-slide"` (dark bg `--fg`, white text `--bg`) with `.inner.centered`
**Compact content:** Add `.compact` to `.inner` for dense data slides (reduced padding/font sizes)

### Component Classes

| Component | Classes | Description |
|-----------|---------|-------------|
| **Card** | `.card` | 1px border, 3px left accent border, 12px radius, shadow-sm; hover: shadow-lg |
| **Metrics bar** | `.metrics` > `.metric` | Flex row of stat boxes with 2px solid accent top bar |
| **Metric value** | `.metric-val` | 28px mono bold, tabular-nums; `.metric-lbl` 8px uppercase muted |
| **Key point** | `.key-point` | Left accent border callout, accent-light bg, 8px right radius, 12.5px font |
| **Data table** | `.dtable` | Dark header (6px corner radius), row hover, 8px 12px cell padding |
| **Bar chart** | `.hbar` > `.hbar-row` | Label (80px) + track (20px, inset shadow) + fill + value (56px mono) |
| **Bar variants** | `.hbar-fill` | Default: accent; `.alt`: medium; `.accent`: amber; `.high`: red |
| **Tags** | `.tag` / `.tag.filled` | 8px uppercase badges, 6px radius; filled = accent bg + subtle shadow |
| **Checklist** | `.checklist` | Checkbox-prefixed list items with bottom borders |
| **Timeline** | `.timeline` > `.tl-item` | Solid accent left border with dot markers; `.tl-year` mono accent |
| **Flow diagram** | `.flow` > `.flow-node` + `.flow-arrow` | Bordered boxes with arrow connectors |
| **Layout: 2-col** | `.two-col` | CSS grid 1fr 1fr, 32px gap |
| **Layout: 3-col** | `.three-col` | CSS grid 1fr 1fr 1fr, 16px gap |
| **Slide header** | `.slide-header` | Icon box + h2, flex aligned |
| **VS comparison** | `.vs-grid` > `.vs-box` | 3-col grid: panel / divider / panel; `.vs-box.win` for winner |

### Animation

- Class `.anim-item` on elements triggers `fadeInUp` animation when parent slide gets `.active`
- Keyframe: `translateY(16px) opacity:0` to `translateY(0) opacity:1`, duration 0.3s
- Staggered: nth-child delays at 0.04s increments, capped at 6th child (0.24s)
- MutationObserver resets animations on slide change
- `prefers-reduced-motion` supported: all animations and transitions disabled

### Navigation (Bottom Bar)

```html
<nav class="nav">
  <button class="nav-btn" id="prev" onclick="go(-1)" disabled>
    <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg> Back
  </button>
  <span class="counter" id="counter">01 / NN</span>
  <button class="nav-btn" id="next" onclick="go(1)">
    Next <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
  </button>
</nav>
```

- Keyboard: ArrowRight/Space = next, ArrowLeft = back, Home = first, End = last
- `?` key toggles keyboard shortcut overlay (top-right, auto-dismiss 4s, hidden on mobile)
- Touch: swipe detection (60px threshold + velocity check >0.5px/ms), edge flash feedback
- Progress bar: fixed bottom (above nav), 2px, accent gradient with subtle glow
- Nav bar: 52px height, frosted glass (`backdrop-filter: blur(8px)`), 6px radius buttons
- Slide counter shows section name: `01 / 53 · Section Name`

### Print Styles

- `@page { size: 16in 9in; margin: 0; }` (16:9 landscape)
- Each slide: `page-break-after: always; break-after: page;`
- Nav/progress hidden; all slides visible; font sizes reduced ~15%
- Shadows and transitions removed

### Responsive

- Single breakpoint: `@media (max-width: 768px)`
- Multi-column grids collapse to single column
- Title font scales down to 30px
- Metrics wrap

---

## Markdown Research File Standards

### R&D Incentives Template (`rnd_incentives.md`)

Every file follows these 7 sections:

```
# [Country] - R&D Tax Incentives

## 1. Overview
| Parameter | Detail |
|---|---|
| **Headline Incentive** | ... |
| **Mechanism Type** | tax_credit / enhanced_deduction / wage_tax_reduction / grant |
| **Headline Rate** | X% |
| **Refundable** | Yes / No / Conditional |
| **Patent Box** | Yes (X%) / No |
| **Legal Basis** | Statute §Section |

## 2. Detailed Programs
### 2.1 [Program Name]
(Parameter table, eligibility, qualifying expenses, rate tiers, caps, carry-forward)

### 2.2 [Program Name]
...

## 3. Patent Box / IP Regime
(Details if applicable; explicit "not applicable" statement if not)

## 4. Effective Benefit Analysis
(Worked example per $1M USD spend; assumptions stated; effective rate %)

## 5. Claim Process & Documentation
### 5.1 Filing Process
### 5.2 Documentation Requirements

## 6. Recent Changes & Sunset Provisions
(Table: Date | Change | Effective)

## 7. Sources & Legal References
(Table: Reference | Citation)
```

### Revenue Tax / Deductions / International Investors Templates

- Same table-heavy format with pipe-delimited markdown tables
- Sections cover: rates, regimes, thresholds, methods, worked examples
- Cross-references use relative paths: `[deductions](deductions.md)`

### Writing Conventions

- Legal citations: full statute name then abbreviation — `Income Tax Act (ITA) §127`
- Rates: `30%` (no space before %), `€1M`, `C$3M`, `A$20M` (currency prefix)
- Percentages in text: always include `%` sign
- Time references: "Tax year 2024/2025", "effective from [date]"
- Terminology: "qualifying R&D expenditure", "tax credit", "enhanced deduction", "patent box" (lowercase mid-sentence)
- Refundability: use exactly "refundable" / "non-refundable" / "partially refundable"
- All benefit calculations must state assumptions explicitly

---

## JSON Data Standards

### Country Data Files (`data/[code].json`)

```json
{
  "country": "Full Country Name",
  "country_code": "XX",
  "currency": "CUR",
  "tax_year": "YYYY/YYYY",
  "corporate_tax": { },
  "pass_through_tax": { },
  "vat_equivalent": { },
  "payroll_taxes": { },
  "withholding_taxes_nonresident": { },
  "deductions": { },
  "international_investors": { }
}
```

### Field Naming

- Rates: `*_rate_pct` (float, e.g. `21.0` not `"21%"`)
- Monetary: `*_usd`, `*_cad`, `*_eur` (currency suffix)
- Limits: `*_cap`, `*_limit`, `*_threshold`
- Booleans: `refundable`, `patent_box`, `fx_controls` (lowercase true/false)
- Time: `carry_forward_years`, `carry_back_years` (integer)
- Arrays: `qualifying_expenses: ["wages", "materials", ...]`
- Null for inapplicable fields (not `0` or empty string)

### R&D Database (`data/rnd_incentives.json`)

```json
{
  "metadata": {
    "title": "...",
    "version": "1.0",
    "last_updated": "YYYY-MM-DD",
    "countries_covered": 45,
    "currency_base": "USD"
  },
  "countries": {
    "XX": {
      "country": "Full Name",
      "headline_incentive": "...",
      "credit_type": "tax_credit|enhanced_deduction|wage_tax_reduction|grant_and_reduced_rate|none_specific",
      "effective_benefit_per_1m_usd": 250000,
      "legal_basis": "Statute §Section",
      "notes": "..."
    }
  },
  "comparison_summary": { }
}
```

---

## Analysis Document Standards

### Structure

1. Executive Summary (key findings, scope)
2. Themed sections with cross-country comparison tables (7-column for primary countries)
3. Regional breakdowns
4. Rankings and league tables
5. Strategic observations and recommendations
6. Statutory Authority Index

### Tables

- All cross-country comparisons: one column per country
- Consistent ordering: US, Canada, UK, Germany, France, then region-specific
- Include "Source" or "Legal Basis" column where applicable

---

## Semantic Color Usage

| Color | Variable | Usage |
|-------|----------|-------|
| Blue | `--accent` | Primary highlights, positive states, key data, success |
| Medium gray | `--medium` | Secondary/alternate bar fills |
| Amber | `--amber` | Warnings, diminished benefits, alternate emphasis |
| Red | `--red` | Negative outcomes, worst case, errors, no-incentive |
| Blue | `--blue` | Informational highlights, links |

---

## Quality Checklist — New Materials

### New Presentation
- [ ] Uses all CSS variables from design system (no hardcoded colors)
- [ ] Includes title slide, section dividers, content slides, closing slide
- [ ] Navigation bar with prev/next + keyboard + touch + progress bar
- [ ] Print styles with `@page { size: 16in 9in; margin: 0; }`
- [ ] `.anim-item` on content blocks for staggered fade-in
- [ ] Responsive breakpoint at 768px
- [ ] Google Fonts loaded: Inter (400–800) + Geist Mono (400–700)
- [ ] Every slide has `data-s="N"` attribute
- [ ] Key points end each content slide with strategic takeaway

### New Country File
- [ ] Follows 7-section template exactly
- [ ] Overview table includes all standard parameters
- [ ] Legal citations with statute and section numbers
- [ ] Effective benefit calculation with stated assumptions
- [ ] Recent changes section with dates
- [ ] Sources table at end

### New JSON Data
- [ ] Follows field naming conventions (`_pct`, `_usd`, `_cap`)
- [ ] Rates as floats (21.0), not strings
- [ ] Null for inapplicable fields
- [ ] `country`, `country_code`, `currency` at top level
- [ ] Consistent with existing schema structure
