# UX Overhaul Design — "Refined Precision"

**Date:** 2026-03-14
**Scope:** All 8 HTML files (5 presentations, 1 guide, 1 index hub, 1 viewer)
**Approach:** Elevate existing Kolosal Vanilla design system with surgical improvements
**Constraints:** Full creative freedom — CSS, HTML structure, JS, content layout

---

## 1. Typography & Spacing System

### Typography Refinements

| Element | Current | New | Rationale |
|---------|---------|-----|-----------|
| Title slide heading | 44px, -0.04em | 46px, -0.045em | More authority at distance |
| Content H2 | 26px | 28px | Better hierarchy separation |
| Body/card text | 11-12px | 12-13px | Readability at presentation distance |
| Labels | 10px, 0.14em spacing | 10px, 0.10em spacing | Less shouty, more refined |
| Metric values | 26px mono | 28px mono + tabular-nums | Aligned columns, bolder data |
| Body line-height | 1.55 | 1.6 | More breathing room |
| Subtitle | 15px | 15px, line-height 1.7 | Slightly more open |

### 4px Base / 8px Rhythm Spacing Grid

Spacing uses a **4px base unit** with an **8px preferred rhythm**. Values snap to multiples of 4px, with 8px multiples preferred for primary spacing. 4px subdivisions are used for fine-tuning (small padding, tight gaps).

```css
--space-xs: 4px;   --space-sm: 8px;   --space-md: 16px;
--space-lg: 24px;  --space-xl: 32px;  --space-2xl: 40px;
--space-3xl: 48px; --space-4xl: 64px; --space-5xl: 72px;
```

| Property | Current | New | Grid note |
|----------|---------|-----|-----------|
| Inner slide padding | 36px 72px 64px | 40px 72px 64px | 40=8x5, 72=8x9, 64=8x8 |
| Card padding | 18px | 20px | 4x5 (fine-tune step) |
| Two-col gap | 28px | 32px | 8x4 |
| Component margins | mixed | standardize: 16/24/32px | all 8x multiples |
| Metric padding | 14px 12px | 16px | 8x2 |
| Key point padding | 12px 16px | 12px 20px | 4x3, 4x5 (fine-tune) |

---

## 2. Slide Transitions & Motion

### Slide Transition

- **Current:** `translateX(40px) scale(0.98)` with 0.45s cubic-bezier
- **New:** `translateY(12px)` with `opacity 0→1`, `0.4s cubic-bezier(0.16, 1, 0.3, 1)`
- **Rationale:** Crossfade + vertical lift feels modern. Remove scale — it creates dated zoom feel.

### Content Animations (.anim-item)

- Update `@keyframes fadeInUp` definition: `from { opacity:0; transform:translateY(16px) }` → `to { opacity:1; transform:translateY(0) }`
- Stagger: 0.04s increments (from 0.05s), cap at 0.24s (6 items)
- Duration: 0.3s (current code uses 0.5s in some files, 0.35s in others — standardize to 0.3s)

### Micro-interactions

| Element | Current | New |
|---------|---------|-----|
| Card hover | `box-shadow 0 2px 8px` | `0 4px 16px rgba(0,0,0,0.06)` + subtle border darken |
| Metric hover | `scale(1.02)` | Background tint to `var(--accent-light)` |
| Tag hover | `translateY(-1px)` | Color shift only (less jittery) |
| Nav button active | none | `transform: scale(0.97)` for tactile feel |
| H-bar fills | instant | Animate width from 0% on slide entry |
| Progress bar | 3px gradient | 2px + `box-shadow: 0 0 8px rgba(0,82,196,0.15)` |

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 3. Navigation & Wayfinding

### Bottom Nav Bar

- Height: 48px → 52px (meets 44px touch target minimum)
- Add backdrop blur: `backdrop-filter: blur(8px); background: rgba(255,255,255,0.92)`
- Nav buttons: add `border-radius: 6px`, padding `8px 20px`
- Arrow key symbols in muted mono: `←` and `→`

### Slide Counter

- Format: `01 / 53 · Section Name` (section name from nearest preceding section-slide)
- Font: mono 12px (from 11px)
- Section name extraction: JS scans backwards from current slide index to find the nearest `.section-slide` or `.section-divider`, then reads its `.title` or `.section-title` text content. Falls back to empty string if no section-slide precedes current slide.

### Progress Bar

- Move from top to bottom — 2px line at top edge of nav bar
- Keeps slide area clean

### Keyboard Shortcuts

- `?` toggles help overlay (top-right, 240px, dark bg, mono text, 6px radius)
- `Home` → first slide, `End` → last slide
- Overlay auto-dismisses after 4s
- Overlay content:
  - `→` / `Space` — Next slide
  - `←` — Previous slide
  - `Home` — First slide
  - `End` — Last slide
  - `?` — Toggle this help
- Hidden on mobile (no keyboard)

### Touch

- Swipe threshold: 50px → 60px (reduce accidental triggers)
- Add velocity check: fast short swipes (>0.5px/ms) also trigger
- Brief 80ms opacity flash feedback on swipe edge

---

## 4. Component Refinements

### Cards

- Border-radius: 12px (keep)
- Left accent border: code has 4px, CLAUDE.md says 3px → standardize to 3px (aligns with CLAUDE.md spec)
- Add `border-color` transition on hover (border darkens to `var(--medium)`)
- Internal spacing tightened to 4px-base grid

### Metrics Bar

- Border-radius: 12px (keep)
- Top accent bar: 3px → 2px (thinner, more elegant)
- Accent bar: solid `var(--accent)` instead of gradient (cleaner)
- Add `font-variant-numeric: tabular-nums` to all metric values
- Separator gaps: 1px (keep, clean divider lines)

### Data Tables (.dtable)

- Header: keep dark bg but soften corners to 6px (from 8px)
- Row hover: add `background: var(--light)` on hover
- Cell padding: 7px 10px → 8px 12px (8-grid alignment)
- Alternating row shading: keep for tables with 8+ rows (aids scanability for dense tax data), remove for shorter tables

### Horizontal Bars (.hbar)

- Track height: 22px → 20px (slightly sleeker)
- Fill: keep gradients but soften — reduce end color intensity
- Track background: `var(--light)` → add 1px inset border for definition
- Animate fill width on slide entry using CSS animation triggered by `.active`

### Key Points

- Keep left-border accent treatment
- Border-radius: `0 10px 10px 0` → `0 8px 8px 0` (consistent with card radius feel)
- Slightly increase padding: `12px 16px` → `12px 20px`
- Add `font-size: 12.5px` (subtle bump for emphasis)

### Tags

- Remove hover transform entirely
- Keep color shift on hover
- Filled tags: add subtle `box-shadow: 0 1px 2px rgba(0,82,196,0.1)` for depth
- Border-radius: 5px → 6px

### Checklists

- Checkbox icon: keep `\2610` but style with `color: var(--accent)`
- Hover: softer — `background: var(--light)` instead of `var(--accent-light)`
- Remove `padding-left` shift on hover (reduces jitter)

### Timeline

- Left border: 2px gradient → 2px solid `var(--accent)` (cleaner)
- Dots: keep 8px but add `transition: background 0.2s` for future states
- Year labels: keep mono accent treatment

### Flow Diagrams

- Remove hover `translateY(-2px)` — replace with border color intensify
- Box padding: `10px 16px` → `12px 16px`
- Arrow connectors: ensure consistent sizing

---

## 5. Color Refinements

No palette change — refinement of usage patterns:

| Usage | Current | New |
|-------|---------|-----|
| Accent backgrounds | `var(--accent-light)` #F0F6FE | Keep — already good |
| Card hover bg | `var(--card-hover)` #F8F9F9 | Keep |
| Section divider bg | `var(--fg)` #0D0E0F | Keep |
| Gradient backgrounds | `.bg-teal`, `.bg-warm`, `.bg-blue`, `.bg-purple` | Simplify to `.bg-cool` (`linear-gradient(160deg, #fff 0%, #f0f6fe 100%)`) and `.bg-warm` (`linear-gradient(135deg, #fff 0%, #fffaf3 100%)`). Map: teal/blue→cool, warm/purple→warm |
| Shadow color | `rgba(0,0,0,0.03-0.06)` | Standardize: `rgba(0,0,0,0.04)` rest, `rgba(0,0,0,0.08)` hover |

### Shadow Scale (added to `:root` CSS variables)

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
--shadow-md: 0 2px 8px rgba(0,0,0,0.06);
--shadow-lg: 0 4px 16px rgba(0,0,0,0.08);
```

---

## 6. Index Hub (index.html) Improvements

- Hero stats: add subtle divider lines between stats (vertical 1px borders)
- Cards grid: add hover arrow animation — arrow slides right 4px on card hover
- Card badges: slightly larger `padding: 0 10px` and `height: 24px`
- Coverage tags: add subtle hover highlight
- Footer: add thin top border `1px solid var(--color-grey-800)`

---

## 7. Viewer (viewer.html) Improvements

- Sidebar thumbnails: active state gets stronger left border (3px from 2px)
- Toolbar buttons: consistent 6px radius
- Mode toggle: slightly more padding `6px 14px`
- Slide preview thumbnails: add subtle inner shadow for depth

---

## 8. International Tax Planning Guide Specific

- Apply same typography/spacing/color refinements
- Ensure table styling matches presentation `.dtable` improvements
- Navigation consistent with presentation nav bar

---

## 9. Print Styles

- Keep `@page { size: 16in 9in; margin: 0; }`
- Ensure all new shadows/transitions are stripped in print
- Progress bar and nav hidden (already done)
- All slides visible, absolute positioning removed (already done)
- Print typography scale: title 32px (from new 46px), H2 22px (from 28px), body 11px (from 12-13px)
- Backdrop-filter note: `rgba(255,255,255,0.92)` fallback on nav provides sufficient contrast even without backdrop-filter support (older browsers)

---

## 10. Responsive (768px breakpoint)

- Keep single breakpoint approach
- New: ensure 52px nav bar works on mobile (padding adjustment)
- Title scale: 46px → 30px on mobile (from 32px current — slightly tighter)
- Keyboard shortcut overlay: hidden on mobile (touch-only)
- Swipe improvements apply here

---

## Files Affected

1. `presentation.html` — Level 100 foundational (2968 lines)
2. `presentation-201.html` — Level 201 intermediate (2307 lines)
3. `presentation-301.html` — Level 301 advanced (2482 lines)
4. `presentation-startup.html` — B2B startup (2674 lines)
5. `presentation-rnd.html` — R&D 45-country (2248 lines)
6. `International_Tax_Planning_Guide.html` — Full guide (5614 lines)
7. `index.html` — Resource hub (713 lines)
8. `viewer.html` — Presentation viewer (837 lines)

**Total: ~19,843 lines across 8 files**

---

## Implementation Strategy

Each file is self-contained (no shared CSS), so each must be updated independently. The CSS changes are consistent across all presentation files. The index and viewer have different CSS structures but get the same design principles applied.

Recommended order:
1. `presentation.html` — establish the refined CSS as reference
2. Apply to remaining 4 presentations
3. `index.html` — hub-specific improvements
4. `viewer.html` — viewer-specific improvements
5. `International_Tax_Planning_Guide.html` — guide-specific improvements

## Post-Implementation

- **Update CLAUDE.md** to reflect new typography values (46px title, 28px H2, etc.), new spacing variables, shadow scale, and any component dimension changes
- **Update card border spec** in CLAUDE.md if code previously diverged (3px vs 4px)
