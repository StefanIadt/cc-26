# CC 26 — Handoff Brief

## What this is

A static HTML proposal site for a new computing degree at IADT (Institute of Art, Design + Technology), Dún Laoghaire, Ireland. The site makes an internal case to colleagues for a new Level 8 BSc that combines genuine programming depth with IADT's design culture — a position no other Irish computing degree currently occupies.

The site has four sections:

| # | Page | Status | Purpose |
|---|------|--------|---------|
| 01 | The gap | Built, needs minor fixes | Landscape analysis of 37 Irish computing degrees |
| 02 | The argument | Not built | The case for the degree — "developers with taste" |
| 03 | The structure | Not built | Sprint-based Level 8 programme structure |
| 04 | The model | Not built | FDND-inspired framework adapted for IADT |

---

## Tech stack

- **Vanilla HTML** — no framework, no templating engine
- **Vanilla CSS** — CUBE CSS methodology (cube.fyi)
- **Vanilla JS** — ES modules, no bundler, no build step
- **Font** — Inter via rsms.me/inter (loaded from CDN)

No npm. No Webpack. No React. Open `index.html` in a browser via Live Server and it works.

---

## File structure

```
CC_26/
  index.html              ← Home / navigation
  01-gap.html             ← The gap page
  02-argument.html        ← Not built yet
  03-structure.html       ← Not built yet
  04-model.html           ← Not built yet
  css/
    style.css             ← Single shared stylesheet — all pages link here
  js/
    gap.js                ← Gap page logic: canvas, tooltip, table, sort
  data/
    programmes.json       ← Single source of truth for all 37 degree records
  HANDOFF.md              ← This file
```

---

## CSS — read this before touching anything

The stylesheet is structured in four CUBE CSS layers, in this order:

1. **Reset** — box-sizing, margin, padding
2. **Design tokens** — everything in `:root`
3. **Base** — minimal browser defaults
4. **Composition** — Every Layout primitives (`.stack`, `.cluster`, `.sidebar`, `.switcher`, `.cover`, `.flow`)
5. **Utilities** — single-responsibility classes (`.u-step-0`, `.u-caps`, `.u-visually-hidden` etc.)
6. **Blocks** — component styles (`.site-header`, `.methodology`, `.prog-panel` etc.)
7. **Exceptions** — data-attribute driven state variants

### The golden rule — everything is a token

**Nothing is hardcoded.** Every value that could change lives in `:root` as a CSS custom property. Before adding any value — colour, size, weight, radius, duration — check if a token already exists. If it does, use it. If it doesn't, add it to `:root` first, then use it.

Key token groups:

```css
/* Type scale — Utopia fluid (step--1 to step-4) */
--step-0, --step-1, --step-2, --step-3, --step-4

/* Space scale — Utopia fluid (3xs to 3xl) */
--space-3xs through --space-3xl
--space-s-m, --space-m-l, --space-l-xl  /* one-up pairs */

/* Font weights */
--weight-thin: 200
--weight-light: 300
--weight-regular: 400
--weight-medium: 500
--weight-bold: 700

/* Line heights — unitless ratios (piccalil.li/blog/line-heights-in-css-work-better-with-ratios) */
--lh-flat: 1
--lh-tight: 1.1
--lh-snug: 1.3
--lh-body: 1.6

/* Letter spacing */
--tracking-caps: 0.1em
--tracking-wide: 0.06em
--tracking-tight: -0.02em
--tracking-display: -0.03em

/* Colours */
--color-bg, --color-surface, --color-text, --color-muted
--color-border, --color-accent, --color-orange, --color-focus
--color-surface-iadt, --color-surface-proposed
--color-dot-university/tu/other/iadt/proposed

/* Borders */
--border-width-thin: 1px
--border-width-medium: 2px
--border-width-accent: 3px
--border-thin, --border-medium

/* Radii */
--radius-s: 3px
--radius-m: 6px
--radius-full: 9999px

/* Shadows */
--shadow-s

/* Motion */
--duration-fast: 150ms
--duration-normal: 220ms
--ease-out
--ease-spring

/* Layout */
--site-padding      ← body padding-inline — one variable controls all page margins
--chevron-indent    ← indent for expanded panel content
--tooltip-max-w
--measure-prose: 72ch
--measure-desc: 48ch
```

Dark mode is handled entirely by overriding tokens in `@media (prefers-color-scheme: dark)`. No duplicate rules anywhere.

### Composition classes in use

```html
<!-- Stack: vertical flex with gap -->
<main class="stack">               <!-- --stack-space overrides gap -->

<!-- Cluster: horizontal wrapping -->
<ul class="cluster">               <!-- --cluster-space overrides gap -->

<!-- Sidebar: 70/30 two-column, stacks below threshold -->
<div class="sidebar">              <!-- --sidebar-min, --sidebar-gap -->

<!-- Flow: prose rhythm via margin-block-start -->
<div class="flow">
```

Always apply composition classes in HTML, not CSS. The composition layer is layout-only — no colour, type or decoration.

---

## JS — gap.js

Async IIFE, ES module. Loaded with `type="module"` so it needs a server (Live Server works fine).

Key pattern — CSS tokens are read at runtime, not duplicated:

```js
const styles = getComputedStyle(document.documentElement);
const token  = name => styles.getPropertyValue(name).trim();

// Canvas colours come from CSS tokens
ctx.fillStyle = token("--color-text");
ctx.fillStyle = token("--color-dot-iadt");
```

This means changing a colour in CSS automatically updates the canvas. Never hardcode a colour in JS.

Alpha variants (zone highlight tint) are the only exception — CSS custom properties don't support alpha-modified versions natively. These are commented in the code.

---

## Data — programmes.json

37 Irish computing degree programmes. Each record:

```json
{
  "name": "BSc Computer Science",
  "full_name": "BSc (Hons) Computer Science",
  "institution": "TCD",
  "institution_full": "Trinity College Dublin (TCD)",
  "location": "Dublin",
  "cao_code": "TR033",
  "cao_points": 555,
  "award": "BSc (Hons)",
  "nfq_level": 8,
  "stages": 4,
  "x": 10,
  "y": 1,
  "type": "university",
  "note": "",
  "modules": { ... },
  "modules_note": "",
  "work_placement": false,
  "programme_url": "https://..."
}
```

`x` = technical depth score (1–10)
`y` = creative ambition score (1–10)
`type` = `"university"` | `"tu"` | `"other"` | `"iadt"` | `"proposed"`

**The creative ambition scores (y) need review** — they were flagged as potentially too low for some programmes. The scores should be revisited before the site is shared externally.

---

## Accessibility principles

This site is built accessibility-first, progressively enhanced.

- Content order in HTML reflects the logical reading order
- The canvas matrix is a progressive enhancement — the data table below it is the primary accessible content
- Canvas has `aria-label` and a text `<p>` fallback inside it for no-JS/no-canvas environments
- Decorative elements have `aria-hidden="true"` — numbers, arrows, dots
- Navigation subtitles are `aria-hidden="true"` — screen readers get number + title only
- Table rows have `tabindex="0"` and `aria-expanded` for keyboard expand/collapse
- Table scroll container has `role="region"` and `tabindex="0"` for keyboard scrolling
- `thead` is `position: sticky` so headers remain visible when scrolling
- `:focus-visible` handles keyboard focus — mouse users see no ring
- `@media (prefers-reduced-motion: reduce)` disables all transitions
- No empty elements, no layout hacks

---

## What still needs doing

### Immediate (gap page)
- [ ] Creative ambition scores in `programmes.json` — review and agree final values
- [ ] Canvas matrix improvements — dots still need work at small viewport sizes
- [ ] Responsive check on the expanded programme panel at narrow widths

### Pages to build
- [ ] `02-argument.html` — The argument ("developers with taste")
- [ ] `03-structure.html` — The structure (sprint-based Level 8)
- [ ] `04-model.html` — The model

### When building new pages
- Link `css/style.css` and `js/[pagename].js`
- Follow the same HTML structure as `01-gap.html`
- All new CSS goes in `style.css` — no page-level `<style>` tags
- Page-specific JS goes in `js/[pagename].js`
- Use existing tokens — add new ones to `:root` if genuinely needed

---

## Design intent

The visual language is minimal and editorial. Inter at various weights, Utopia fluid type and space scales, a warm off-white background (`#f7f6f3`), and acid green (`#c8ff00`) as the single accent. The design should feel like a considered internal document, not a marketing site.

The accent green appears on:
- Nav item hover fill
- Skip link background
- Asterisk markers
- Score bar highlights
- The proposed degree diamond on the matrix

Orange (`#ff6b00`) appears on:
- Methodology marker and toggle only

Do not introduce new colours without adding them as tokens first.

---

## Contact

Programme: MA/MSc User Experience Design + new degree proposal
Institution: IADT, Dún Laoghaire, Ireland
