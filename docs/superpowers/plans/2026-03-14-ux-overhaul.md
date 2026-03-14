# UX Overhaul "Refined Precision" Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the Kolosal Vanilla design system across all 8 HTML files with refined typography, spacing, transitions, navigation, and component polish.

**Architecture:** Each HTML file is self-contained (inline CSS/JS, no shared stylesheets). The 5 presentation files share identical CSS/JS structure. Changes are applied to `presentation.html` first as reference, then replicated to the other 4 presentations, then adapted for index, viewer, and guide.

**Tech Stack:** Pure HTML/CSS/JS, no build tools. Google Fonts (Inter + Geist Mono). Self-contained single-file architecture.

**Spec:** `docs/superpowers/specs/2026-03-14-ux-overhaul-design.md`

---

## Chunk 1: Reference Presentation (presentation.html)

### Task 1: Update CSS variables and spacing system

**Files:**
- Modify: `presentation.html:10-35` (`:root` variables)

- [ ] **Step 1: Add spacing and shadow variables to `:root`**

In `presentation.html`, inside the `:root` block (lines 12-35), add after the existing variables:

```css
/* Spacing (4px base, 8px rhythm) */
--space-xs: 4px;   --space-sm: 8px;   --space-md: 16px;
--space-lg: 24px;  --space-xl: 32px;  --space-2xl: 40px;
--space-3xl: 48px; --space-4xl: 64px; --space-5xl: 72px;

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
--shadow-md: 0 2px 8px rgba(0,0,0,0.06);
--shadow-lg: 0 4px 16px rgba(0,0,0,0.08);
```

- [ ] **Step 2: Verify file renders correctly**

Open `presentation.html` in browser, confirm no visual regression.

- [ ] **Step 3: Commit**

```bash
git add presentation.html
git commit -m "feat(ux): add spacing grid and shadow scale CSS variables"
```

---

### Task 2: Refine typography hierarchy

**Files:**
- Modify: `presentation.html:87-111` (typography classes)

- [ ] **Step 1: Update `.label` class**

Change `letter-spacing: 0.14em` → `letter-spacing: 0.10em`

- [ ] **Step 2: Update `.title` class**

Keep `font-size: 38px` (only `.title-slide .title` changes to 46px). Keep `letter-spacing: -0.035em`.

- [ ] **Step 3: Update `.subtitle` class**

Change `line-height: 1.65` → `line-height: 1.7`

- [ ] **Step 3b: Update body/card text line-height**

Find all content elements with `line-height: 1.55` (e.g., `.checklist li`, `.points li`, card body text, `.key-point`, `.timeline-desc`) and change to `line-height: 1.6`. Also bump any `font-size: 11px` body text elements to `12px` where they hold readable paragraph-level content (`.dtable` font-size: `11px` → `12px`, `.checklist li` stays at `11px`).

- [ ] **Step 4: Update `.h2` class**

Change `font-size: 26px` → `font-size: 28px`, `letter-spacing: -0.025em` → `letter-spacing: -0.02em`

- [ ] **Step 5: Update `.title-slide .title`**

Change `font-size: 44px` → `font-size: 46px`, `letter-spacing: -0.04em` → `letter-spacing: -0.045em`

- [ ] **Step 6: Update `.metric-val`**

Change `font-size: 26px` → `font-size: 28px`. Add `font-variant-numeric: tabular-nums;`

- [ ] **Step 7: Commit**

```bash
git add presentation.html
git commit -m "feat(ux): refine typography hierarchy — tighter labels, bolder titles and metrics"
```

---

### Task 3: Update spacing to 4px grid

**Files:**
- Modify: `presentation.html` — multiple CSS sections

- [ ] **Step 1: Update `.inner` padding**

Change `padding: 36px 72px 64px` → `padding: 40px 72px 64px`

- [ ] **Step 2: Update `.card` padding**

Change `padding: 18px` → `padding: 20px`

- [ ] **Step 3: Update `.two-col` gap**

Change `gap: 28px` → `gap: 32px`

- [ ] **Step 4: Update `.metric` padding**

Change `padding: 14px 12px` → `padding: 16px`

- [ ] **Step 5: Update `.key-point` padding**

Change `padding: 12px 16px` → `padding: 12px 20px`

- [ ] **Step 6: Commit**

```bash
git add presentation.html
git commit -m "feat(ux): align spacing to 4px base grid"
```

---

### Task 4: Refine slide transitions and animations

**Files:**
- Modify: `presentation.html:42-51` (slide structure CSS)
- Modify: `presentation.html:580-614` (keyframes)

- [ ] **Step 1: Update slide transition**

In `.slide` class (~line 47-48), change:
```css
transition: opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1), transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
transform: translateX(40px) scale(0.98);
```
to:
```css
transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
transform: translateY(12px);
```

Also update `.slide.active` (~line 51) — change `transform: translateX(0) scale(1)` → `transform: translateY(0)`

- [ ] **Step 2: Update `@keyframes fadeInUp`**

Replace the existing `fadeInUp` keyframe with:
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 3: Update `.anim-item` stagger timing**

Change animation duration references from `0.5s` or `0.35s` to `0.3s`.
Update stagger increments: nth-child delays use `0.04s` intervals, cap at 6th child (`0.24s`).

- [ ] **Step 4: Add `prefers-reduced-motion` support**

Add before the responsive `@media` block:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add presentation.html
git commit -m "feat(ux): modernize slide transitions, add reduced-motion support"
```

---

### Task 5: Refine micro-interactions

**Files:**
- Modify: `presentation.html` — card, metric, tag, flow, nav-btn CSS sections

- [ ] **Step 1: Update card hover and border**

Change `.card` `border-left: 4px` → `border-left: 3px`. Add `transition: box-shadow 0.2s ease, border-color 0.2s ease;`
Change `.card:hover` to: `box-shadow: var(--shadow-lg); border-color: var(--medium);`

- [ ] **Step 2: Update metric hover**

Remove `.metric:hover { transform: scale(1.02); }` and `.metric { transition: transform 0.2s; }`
Replace with: `.metric { transition: background 0.2s ease; }` and `.metric:hover { background: var(--accent-light); }`

- [ ] **Step 3: Update tag hover**

Remove from `.tag:hover` the `transform: translateY(-1px)` and `box-shadow`.
Keep only color change. Add to `.tag.filled`: `box-shadow: 0 1px 2px rgba(0,82,196,0.1);`
Change `.tag` `border-radius: 5px` → `border-radius: 6px`.

- [ ] **Step 4: Update flow box hover and padding**

Change `.flow-box:hover` — remove `transform: translateY(-2px)` and `box-shadow`, replace with `border-color: var(--accent-mid);`
Change `.flow-box` padding from `10px 16px` → `12px 16px`.

- [ ] **Step 5: Add nav button active state**

Add: `.nav-btn:active { transform: scale(0.97); }`

- [ ] **Step 6: Update progress bar**

Change `.progress` `height: 3px` → `height: 2px`. Add `box-shadow: 0 0 8px rgba(0,82,196,0.15);`

- [ ] **Step 7: Commit**

```bash
git add presentation.html
git commit -m "feat(ux): refine micro-interactions — subtler hovers, tactile nav buttons"
```

---

### Task 6: Refine remaining components

**Files:**
- Modify: `presentation.html` — metrics, key-point, dtable, hbar, checklist, timeline CSS

- [ ] **Step 1: Update metric accent bar**

In `.metric::after`, change `height: 3px` → `height: 2px`. Change `background: linear-gradient(90deg, var(--accent), var(--accent-mid))` → `background: var(--accent);`

- [ ] **Step 2: Update key-point**

Change `border-radius: 0 10px 10px 0` → `border-radius: 0 8px 8px 0`. Change `font-size: 12px` → `font-size: 12.5px`.

- [ ] **Step 3: Update data table**

Change `.dtable th:first-child` border-radius from `8px` → `6px`. Change `.dtable th:last-child` from `8px` → `6px`.
Change `.dtable td` padding from `7px 10px` → `8px 12px`.
Add: `.dtable tr:hover td { background: var(--light); }`

- [ ] **Step 4: Update horizontal bars**

Change `.hbar-track` `height: 22px` → `height: 20px`.
Add to `.hbar-track`: `box-shadow: inset 0 1px 2px rgba(0,0,0,0.04);` (inset border for definition per spec).

- [ ] **Step 5: Update checklist hover**

Change `.checklist li:hover` from `background: var(--accent-light)` → `background: var(--light)`. Remove `padding-left: 28px` from hover (keep `padding-left: 24px`).

- [ ] **Step 6: Update timeline**

Change `.timeline::before` from `background: linear-gradient(180deg, var(--accent), var(--accent-mid))` → `background: var(--accent);`

- [ ] **Step 7: Simplify gradient backgrounds**

Replace all 4 gradient background classes with 2 simplified ones:
- `.bg-teal` (was `#f0fdfa` green-tint) and `.bg-blue` (was `#f0f9ff` blue-tint) → `.bg-cool { background: linear-gradient(160deg, var(--bg) 0%, #f0f6fe 100%); }` (unified blue-tint)
- `.bg-warm` (was `#f8fffe`) and `.bg-purple` (was `#f5f3ff` purple-tint) → `.bg-warm { background: linear-gradient(135deg, var(--bg) 0%, #fffaf3 100%); }` (unified warm amber-tint)

**Note:** This intentionally shifts green-tint slides to blue-tint and purple-tint to warm amber — aligning with the Kolosal blue+amber semantic palette.

Search the HTML body for `class="slide bg-teal"`, `bg-blue`, `bg-purple` and rename to `bg-cool` or `bg-warm` as mapped above. Keep any `bg-warm` references as-is (name stays the same, gradient value changes).

- [ ] **Step 8: Commit**

```bash
git add presentation.html
git commit -m "feat(ux): refine components — thinner accents, cleaner tables, simplified gradients"
```

---

### Task 7: Upgrade navigation and wayfinding

**Files:**
- Modify: `presentation.html:65-86` (nav CSS)
- Modify: `presentation.html:2926-2966` (JS)

- [ ] **Step 1: Update nav bar CSS**

Change `.nav` `height: 48px` → `height: 52px`. Change `background: var(--bg)` → `background: rgba(255,255,255,0.92); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);`
Change `.nav-btn` — add `border-radius: 6px;`, change padding to `8px 20px`.

Update nav button text to include arrow key hints. In the HTML nav bar, update:
- Back button: add `←` symbol in muted mono before "Back"
- Next button: add `→` symbol in muted mono after "Next"

Example: `<button class="nav-btn" id="prev" onclick="go(-1)" disabled><span class="nav-key">←</span> Back</button>`

Add CSS: `.nav-key { font-family: var(--mono); font-size: 9px; color: var(--muted); opacity: 0.6; }`

- [ ] **Step 2: Move progress bar to nav**

Change `.progress` from `position: fixed; top: 0;` → `position: fixed; bottom: 52px;` (sits on top edge of nav).
Update `z-index` to be above nav content.

- [ ] **Step 3: Update slide counter font size**

Change `.counter` `font-size: 11px` → `font-size: 12px`.

- [ ] **Step 4: Add keyboard shortcut overlay HTML**

Before `</body>`, add:
```html
<div class="kb-help" id="kbHelp">
  <div class="kb-title">Keyboard Shortcuts</div>
  <div class="kb-row"><kbd>&rarr;</kbd> / <kbd>Space</kbd><span>Next slide</span></div>
  <div class="kb-row"><kbd>&larr;</kbd><span>Previous slide</span></div>
  <div class="kb-row"><kbd>Home</kbd><span>First slide</span></div>
  <div class="kb-row"><kbd>End</kbd><span>Last slide</span></div>
  <div class="kb-row"><kbd>?</kbd><span>Toggle this help</span></div>
</div>
```

- [ ] **Step 5: Add keyboard overlay CSS**

```css
.kb-help {
  position: fixed; top: 16px; right: 16px; width: 240px;
  background: var(--fg); color: var(--bg); border-radius: 6px;
  padding: 16px; z-index: 200; font-size: 12px;
  opacity: 0; pointer-events: none;
  transition: opacity 0.15s ease;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}
.kb-help.visible { opacity: 1; pointer-events: auto; }
.kb-title { font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 12px; }
.kb-row { display: flex; justify-content: space-between; padding: 4px 0; font-family: var(--mono); font-size: 11px; }
.kb-row kbd { background: var(--dark); padding: 2px 6px; border-radius: 4px; font-size: 10px; min-width: 24px; text-align: center; }
.kb-row span { color: var(--medium); }
@media (max-width: 768px) { .kb-help { display: none; } }
```

- [ ] **Step 6: Update JavaScript — enhanced navigation**

Replace the entire `<script>` block with updated JS that includes:
- `go(d)` function (same logic)
- Section name extraction in counter: scan backwards for `.section-slide` or `.section-divider`, get `.title` or `.section-title` text
- `Home` key → `go(-cur)` (first slide), `End` key → go to last
- `?` key toggles `.kb-help.visible`, auto-dismiss after 4s
- Touch handling with 60px threshold + velocity check (distance/time > 0.5)
- MutationObserver for animation reset (existing)
- H-bar fill animation trigger on slide `.active`

The full JS:
```javascript
const S=document.querySelectorAll('.slide'), T=S.length, P=document.getElementById('progress'),
      C=document.getElementById('counter'), prev=document.getElementById('prev'), next=document.getElementById('next');
let cur=0, kbTimer=null;

function getSectionName(idx) {
  for (let i = idx; i >= 0; i--) {
    if (S[i].classList.contains('section-slide') || S[i].classList.contains('section-divider')) {
      const el = S[i].querySelector('.section-title') || S[i].querySelector('.title');
      if (el) return el.textContent.trim();
    }
  }
  return '';
}

function go(d) {
  S[cur].classList.remove('active');
  cur = Math.max(0, Math.min(T-1, cur+d));
  S[cur].classList.add('active');
  P.style.width = ((cur+1)/T*100)+'%';
  const section = getSectionName(cur);
  C.textContent = String(cur+1).padStart(2,'0')+' / '+String(T).padStart(2,'0') + (section ? ' \u00b7 '+section : '');
  prev.disabled = cur===0;
  next.disabled = cur===T-1;
  // Animate h-bar fills
  S[cur].querySelectorAll('.hbar-fill').forEach(el => {
    const w = el.style.width; el.style.width = '0%';
    requestAnimationFrame(() => { el.style.width = w; });
  });
}

document.addEventListener('keydown', e => {
  if (e.key==='ArrowRight'||e.key===' ') { e.preventDefault(); go(1); }
  else if (e.key==='ArrowLeft') { e.preventDefault(); go(-1); }
  else if (e.key==='Home') { e.preventDefault(); go(-cur); }
  else if (e.key==='End') { e.preventDefault(); go(T-1-cur); }
  else if (e.key==='?') {
    const h = document.getElementById('kbHelp');
    h.classList.toggle('visible');
    clearTimeout(kbTimer);
    if (h.classList.contains('visible')) { kbTimer = setTimeout(() => h.classList.remove('visible'), 4000); }
  }
});

let tx=0, ty=0, tt=0;
document.addEventListener('touchstart', e => { tx=e.changedTouches[0].screenX; ty=e.changedTouches[0].screenY; tt=Date.now(); });
document.addEventListener('touchend', e => {
  const dx=e.changedTouches[0].screenX-tx, dy=e.changedTouches[0].screenY-ty;
  const dt=Date.now()-tt, velocity=Math.abs(dx)/dt;
  if (Math.abs(dx) > Math.abs(dy) && (Math.abs(dx) > 60 || velocity > 0.5)) {
    // Brief edge flash feedback
    const flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;top:0;'+(dx<0?'right':'left')+':0;width:40px;height:100vh;background:linear-gradient('+(dx<0?'to left':'to right')+',rgba(0,82,196,0.08),transparent);z-index:999;pointer-events:none;';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 80);
    go(dx < 0 ? 1 : -1);
  }
});

// Animation reset on slide change
new MutationObserver(muts => {
  muts.forEach(m => {
    if (m.target.classList.contains('active')) {
      m.target.querySelectorAll('.anim-item').forEach(el => {
        el.style.animation = 'none';
        el.offsetHeight;
        el.style.animation = '';
      });
    }
  });
}).observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });

go(0);
```

- [ ] **Step 7: Update responsive and print styles**

In responsive block (`@media max-width: 768px`):
- Change `.title-slide .title` mobile size to `30px` (from 32px current)
- Ensure `.kb-help { display: none; }` is in the responsive block (already added in overlay CSS)

In print styles (`@media print`):
- Change `.title` to `32px` (from current 30px print size)
- Change `.title-slide .title` to `38px` (keep current print size, matches new scale proportion)
- `.h2` stays at `22px` (already correct)
- Body text: `11px` in print (from 12-13px screen)
- Add `.kb-help { display: none !important; }`
- Add `.nav-key { display: none; }`

- [ ] **Step 8: Commit**

```bash
git add presentation.html
git commit -m "feat(ux): upgrade navigation — backdrop blur, keyboard overlay, section counter, touch velocity"
```

---

## Chunk 2: Replicate to remaining presentations

### Task 8: Apply to presentation-201.html

**Files:**
- Modify: `presentation-201.html:11-745` (CSS), `presentation-201.html:2265-2305` (JS)

- [ ] **Step 1: Apply all CSS changes from Tasks 1-7**

The CSS structure is identical to `presentation.html`. Apply the same changes to:
- `:root` variables (add spacing + shadow vars)
- Typography (`.label`, `.title`, `.h2`, `.subtitle`, `.title-slide .title`, `.metric-val`)
- Spacing (`.inner`, `.card`, `.two-col`, `.metric`, `.key-point`)
- Slide transition (`.slide` transform + transition)
- Animations (`@keyframes fadeInUp`, stagger timing)
- Micro-interactions (card, metric, tag, flow, nav-btn hover/active)
- Components (metric accent bar, key-point, dtable, hbar, checklist, timeline)
- Gradient backgrounds (replace old classes with `.bg-cool`/`.bg-warm`)
- Navigation CSS (nav height, backdrop blur, button radius, progress bar position)
- Add keyboard overlay CSS
- Add `prefers-reduced-motion`
- Update responsive + print

- [ ] **Step 2: Replace JS block with updated navigation script**

Same JS as Task 7 Step 6. Adapt if this file has any unique JS (check for PDF export button or other extras).

- [ ] **Step 3: Add keyboard overlay HTML before `</body>`**

Same HTML as Task 7 Step 4.

- [ ] **Step 4: Update any HTML slide classes referencing old gradient names**

Replace `bg-teal`/`bg-blue` → `bg-cool`, `bg-purple` → `bg-warm` in HTML body.

- [ ] **Step 5: Verify in browser, commit**

```bash
git add presentation-201.html
git commit -m "feat(ux): apply refined precision overhaul to presentation-201"
```

---

### Task 9: Apply to presentation-301.html

**Files:**
- Modify: `presentation-301.html:11-745` (CSS), `presentation-301.html:2441-2480` (JS)

- [ ] **Step 1-5: Same process as Task 8**

Apply identical CSS changes, replace JS, add keyboard overlay HTML, update gradient class names.

- [ ] **Step 6: Commit**

```bash
git add presentation-301.html
git commit -m "feat(ux): apply refined precision overhaul to presentation-301"
```

---

### Task 10: Apply to presentation-startup.html

**Files:**
- Modify: `presentation-startup.html:11-749` (CSS), `presentation-startup.html:2628-2672` (JS)

- [ ] **Step 1-4: Same CSS and HTML changes as Task 8**

- [ ] **Step 5: Preserve PDF export functionality**

This file has a `exportPDF()` function and PDF export button. Keep those in the updated JS. Merge the new navigation JS with the existing export function.

- [ ] **Step 6: Commit**

```bash
git add presentation-startup.html
git commit -m "feat(ux): apply refined precision overhaul to presentation-startup"
```

---

### Task 11: Apply to presentation-rnd.html

**Files:**
- Modify: `presentation-rnd.html:10-748` (CSS), `presentation-rnd.html:2208-2246` (JS)

- [ ] **Step 1-5: Same process as Task 8**

Apply identical CSS changes, replace JS, add keyboard overlay HTML, update gradient class names.

- [ ] **Step 6: Commit**

```bash
git add presentation-rnd.html
git commit -m "feat(ux): apply refined precision overhaul to presentation-rnd"
```

---

## Chunk 3: Index hub, viewer, and guide

### Task 12: Update index.html

**Files:**
- Modify: `index.html:10-442` (CSS)

This file uses the Kolosal color system (`--color-*` naming) not the presentation shorthand. Apply the same design principles adapted to this naming convention.

- [ ] **Step 1: Update typography**

- `.hero h1`: `font-size: 44px` → `46px`, `letter-spacing: -1px` → `-1.2px`
- `.section-title`: `font-size: 22px` → add `letter-spacing: -0.4px`
- `.section-label`: `letter-spacing: -0.2px` (keep)
- `.card-title`: `font-size: 15px` → keep, add `letter-spacing: -0.4px`
- `.hero-stat-val`: `font-size: 32px` → keep, add `font-variant-numeric: tabular-nums`

- [ ] **Step 2: Add hero stat dividers**

Add to CSS:
```css
.hero-stat { position: relative; }
.hero-stat + .hero-stat::before {
  content: ''; position: absolute; left: -28px; top: 0; bottom: 0;
  width: 1px; background: var(--color-grey-800);
}
```

- [ ] **Step 3: Improve card hover interactions**

Add arrow slide animation:
```css
.card:hover .card-arrow svg { transform: translateX(4px); }
.card-arrow svg { transition: transform 0.2s ease; }
```
Update `.card-badge`: `height: 22px` → `height: 24px`, `padding: 0 8px` → `padding: 0 10px`.

- [ ] **Step 4: Add coverage tag hover**

```css
.country-tag { transition: background 0.15s ease; cursor: default; }
.country-tag:hover { opacity: 0.8; }
```

- [ ] **Step 5: Add footer top border**

```css
.site-footer { border-top: 1px solid var(--color-grey-800); }
```

- [ ] **Step 6: Refine animation timing**

Update `@keyframes fadeUp` — keep existing, but change stagger from `0.04s` increments to match (already close, verify).

- [ ] **Step 7: Add `prefers-reduced-motion` support**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "feat(ux): refine index hub — stat dividers, card hover polish, tag interactions"
```

---

### Task 13: Update viewer.html

**Files:**
- Modify: `viewer.html:10-415` (CSS), `viewer.html:510-835` (JS)

- [ ] **Step 1: Update toolbar styling**

- `.toolbar`: add `backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);` (already has blur, verify)
- `.toolbar-btn`, `.toolbar-back`: ensure `border-radius: 6px` (already close, verify consistency)

- [ ] **Step 2: Update sidebar active state**

Change `.slide-thumb.active` `border-left: 2px` → `border-left: 3px`.

- [ ] **Step 3: Update mode toggle padding**

Change `.mode-btn` `padding: 5px 12px` → `padding: 6px 14px`.

- [ ] **Step 4: Add thumbnail depth**

```css
.slide-thumb-preview { box-shadow: inset 0 1px 3px rgba(0,0,0,0.06); }
```

- [ ] **Step 5: Add `prefers-reduced-motion`**

Same block as other files.

- [ ] **Step 6: Commit**

```bash
git add viewer.html
git commit -m "feat(ux): refine viewer — stronger active state, thumbnail depth, consistent radii"
```

---

### Task 14: Update International_Tax_Planning_Guide.html

**Files:**
- Modify: `International_Tax_Planning_Guide.html:6-248` (CSS)

- [ ] **Step 1: Read the full CSS to understand structure**

This file is document-style (not slides). Read lines 6-248 to map the exact CSS properties. Note: this file uses its own `:root` variables (lines 7-29) with the same color values as presentations but different variable names.

- [ ] **Step 2: Update typography**

Read the current values from the file first, then apply these principles:
- `h1`: add `letter-spacing: -0.03em` if not present
- `h2`: add `letter-spacing: -0.02em` if not present
- Body text (`p`, `li`): ensure `line-height` is at least `1.6`
- `font-variant-numeric: tabular-nums` on any numeric display elements

- [ ] **Step 3: Update table styling**

Read the current `table`/`th`/`td` CSS, then match presentation refinements:
- Header border-radius: ensure first/last child have `6px` corner radius
- Cell padding: standardize to `8px 12px`
- Add: `tbody tr:hover td { background: var(--light, #F1F3F4); }` (use fallback if var not defined)

- [ ] **Step 4: Add `prefers-reduced-motion`**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add International_Tax_Planning_Guide.html
git commit -m "feat(ux): refine International Tax Guide — typography, table polish"
```

---

## Chunk 4: Post-implementation

### Task 15: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update Typography Scale table**

Update values:
- `.title`: `36-42px` → `38px` (unchanged from code, just tighten the documented range)
- `.title-slide .title`: `40-48px` → `46px`
- `.h2`: `22-28px` → `28px`
- `.label`: update letter-spacing from `0.14em` to `0.10em`

- [ ] **Step 2: Update Component Classes table**

- Card: update to `3px left accent border`
- Metric value: add `tabular-nums` note
- Key point: update border-radius to `8px`
- Tag: update border-radius to `6px`

- [ ] **Step 3: Add spacing variables and shadow scale to Design System section**

Add the new `--space-*` and `--shadow-*` variables.

- [ ] **Step 4: Add Navigation section update**

Note new nav height (52px), backdrop blur, keyboard overlay (`?`), Home/End support, section name in counter.

- [ ] **Step 5: Add reduced motion note**

Document `prefers-reduced-motion` support.

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md to reflect UX overhaul design changes"
```

---

### Task 16: Final verification

- [ ] **Step 1: Open each file in browser and verify**

Check all 8 files:
1. `presentation.html` — slides navigate, transitions smooth, keyboard overlay works, counter shows section
2. `presentation-201.html` — same checks
3. `presentation-301.html` — same checks
4. `presentation-startup.html` — same checks + PDF export still works
5. `presentation-rnd.html` — same checks
6. `index.html` — hero stat dividers, card hover arrows, coverage tag hover
7. `viewer.html` — sidebar active state, mode toggle, thumbnail shadows
8. `International_Tax_Planning_Guide.html` — typography, table styling

- [ ] **Step 2: Test keyboard shortcuts in presentations**

- `→` / `Space` navigate forward
- `←` navigates back
- `Home` goes to first slide
- `End` goes to last slide
- `?` shows/hides overlay
- Overlay auto-dismisses after 4s

- [ ] **Step 3: Test touch swipe in presentations**

- Swipe left = next, swipe right = back
- Fast short swipe triggers navigation
- No accidental triggers on vertical scroll

- [ ] **Step 4: Test reduced motion**

In browser DevTools, enable "Emulate prefers-reduced-motion: reduce" (Rendering tab). Verify:
- No slide transition animations
- No content fade-in animations
- No hover transitions
- Page remains fully functional

- [ ] **Step 5: Test print output**

Print preview for `presentation.html` — verify 16:9 slides render, no nav/progress visible, keyboard overlay hidden, typography scales correctly.

- [ ] **Step 6: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix(ux): post-verification adjustments"
```
