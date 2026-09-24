# Stellar design system v3

An upgrade of the Darkview token layer, not a replacement. The colours, typefaces and
contrast guarantees survive; what changes is the parts that were ad-hoc, unenforced, or
too weak to be seen.

Current state: `apps/web/src/styles/tokens.css` (146 lines), mirrored in `tokens.ts`,
with `tokens.test.ts` enforcing WCAG contrast against `docs/design/contrast.md`.

## What v2 got right — keep

- **One file may hold a colour literal.** Stylelint enforces it. Keep.
- **Contrast is tested, not asserted.** Every text/surface pair is measured and the
  table regenerates from the tokens. One pair is marked restricted rather than quietly
  used. Keep, and extend to every new pair.
- **Georgian-capable typefaces.** FiraGO and Noto Serif Georgian were chosen because
  they carry Georgian. This is why the Sidera and Orbitron direction was refused.
- **Motion has meaning** — UI 160–220ms, instrument 500–1200ms, wonder 4–8s.
- **`prefers-reduced-motion` honoured** in seven stylesheets already.

## What v3 fixes

### 1. The surface ramp is too dark to read as a ramp

`--color-night` `#05080D` and `--color-surface-base` `#0B0F15` differ by six sRGB units.
Sections alternated between them and looked flat; the fix during DV-071 was to use
`--color-surface-raised` `#111722` instead.

v3 makes that the rule rather than a patch:

| Token | Value | Use |
| --- | --- | --- |
| `--color-night` | `#05080D` | page background, the deepest level |
| `--color-surface-base` | `#0B0F15` | recessed wells — a viewport inside a panel |
| `--color-surface-raised` | `#111722` | panels, cards, alternating sections |
| `--color-surface-hover` | `#1A2330` | interactive hover only |

**Rule:** a surface adjacent to another must be at least two steps apart on this ramp.
`night` beside `surface-base` is not a boundary anyone can see.

### 2. Elevation is stated, not improvised

Three levels, each a surface step plus a border, never a glow:

- **Flat** — `surface-raised` + `border-subtle`. Cards, list rows.
- **Raised** — `surface-raised` + `border-strong` + `--shadow-small`. Panels.
- **Overlay** — `surface-raised` + `border-strong` + `--shadow-dialog` + scrim. Dialogs.

### 3. Breakpoints become tokens

Today the stylesheets use **eleven** distinct widths: 36, 42, 43.99, 44, 47.99, 48, 55,
64, 70, 72, 80 and 92rem. Several are one-off fixes for a single component, and
43.99/44 and 47.99/48 are the same boundary written twice.

v3 defines five and permits no others:

| Name | Width | Target |
| --- | --- | --- |
| `xs` | 20rem / 320px | smallest supported phone |
| `sm` | 30rem / 480px | large phone |
| `md` | 48rem / 768px | tablet, sidebar appears |
| `lg` | 64rem / 1024px | laptop, multi-column |
| `xl` | 80rem / 1280px | desktop, widest grids |

Custom media queries via PostCSS so they are named in source. A component needing a
sixth boundary is a component that wants container queries instead.

**Verified at 320 / 390 / 768 / 1024 / 1440 every phase**, not at the end.

### 4. The type scale becomes enforceable

DV-071 moved every public stylesheet onto the token scale and removed 40-odd hardcoded
sizes — the homepage hero had been 128px against the brand's 64px.

v3 keeps that from returning: **a stylelint rule fails any `font-size` outside
`tokens.css`.** The scale is already fluid where it needs to be; a component wanting a
size that is not in it is asking for a scale change, which is a token change.

One measured exception is allowed and must carry its measurement in a comment: capping
a heading by viewport width so long Georgian compounds do not break mid-word. See
`min(var(--font-size-hero), 10.6vw)` on the page heroes.

### 5. Spacing closes its gaps

The scale is 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20 — a 4pt scale missing 7, 9, 11, 14.
Components reach for `clamp()` or a literal when they need those. v3 completes the
scale and adds semantic aliases: `--space-section`, `--space-card`, `--space-stack`.

### 6. Glow exists, for the mark only

ADR-025 §3. The comet mark carries its blue glow as a logo. A `--glow-mark` token is
defined next to the logo component and **is not reachable from component CSS**. No
glow on panels, buttons, focus rings or live badges; the anti-pattern rule is otherwise
unchanged.

### 7. Naming

`--dv-*` → `--st-*`, and `--color-darkview-*` → `--color-stellar-*`.

These are CSS custom properties, local to this repository. They are **not** the
cross-boundary identifiers ADR-025 defers to Stage B, so they rename in Phase 0 with
everything else. `tokens.ts` and its equality test move with them.

## Component inventory

**Exists and is reusable:** button, dialog, container, state-panel, status-indicator,
brand-lockup, section-heading, legal-document, navigation, live-indicator, optical-ring,
target-card, collection-frame, capture-detail, mission-status, auth-form.

**Phase 1 needs, and none exist:**

| Component | Wanted by |
| --- | --- |
| Skeleton / loading state | every wired surface, Phase 2 |
| Empty state | collection, bookings, loyalty |
| Error boundary surface | every route |
| Form field set — label, hint, error, required | booking, account, partner registration |
| Date and slot picker | booking, Phase 3 |
| Data table with paging | operator, account history |
| Tabs | account, loyalty, operator |
| Toast / inline confirmation | every mutation |
| Pagination | collection, logs |
| Money and date formatters, locale-aware | booking, subscription, loyalty |

The last one is not decoration: Georgian and English format dates and currency
differently, and getting it wrong is visible on every commerce surface.

## Enforcement

| Rule | Enforced by |
| --- | --- |
| Colour literals only in `tokens.css` | stylelint |
| `font-size` only from tokens | stylelint — **new in v3** |
| Media queries only at the five breakpoints | stylelint — **new in v3** |
| Contrast meets WCAG 2.1 AA | `tokens.test.ts` vs `contrast.md` |
| `tokens.ts` matches `tokens.css` | `tokens.test.ts` |
| Both dictionaries structurally identical | `localization.test.ts` |
| No horizontal scroll at 320px | Playwright, per phase |

A design system nobody can violate by accident is worth more than a document describing
one. The three new rules are the difference between v2 and v3.

## What Phase 0 landed, and what it did not

Phase 0 is the token layer. It delivered:

- the `--st-*` rename, `--color-stellar-*`, and every document that named the old prefix;
- the surface ramp and the three elevations, written into `tokens.css` as the rule
  rather than left in this file;
- the completed spacing scale — 7, 9, 11, 14 — and `--space-section`, `--space-card`,
  `--space-stack`;
- `styles/breakpoints.css`: the five boundaries and their `below-` forms as
  `@custom-media`, wired through `postcss-custom-media` and proven to resolve in a
  production build (`@media (--md)` → `@media (min-width:48rem)`);
- the v3 `font-size` rule, live in every stylesheet but eight.

It deliberately did not migrate call sites. Eight stylesheets still hold 60 hardcoded
font sizes and the eleven ad-hoc widths; `stylelint.config.mjs` names them in
`awaitingV3Migration`. Moving them changes layout at real widths, and re-verifying
every surface at 320 / 390 / 768 / 1024 / 1440 is Phase 1's stated Done-when. The
media-query rule turns on at the end of that migration, when it can be turned on
without an exception list.

The `--glow-mark` token is also deferred, to the commit that brings the comet mark in.
Its only consumer is the mark, and a token nothing uses is a token nobody can check.


## Open questions for the maintainer

1. **A Stellar Brand Identity System document.** ADR-006 pinned a Darkview PDF as the
   brand source. Until a Stellar equivalent exists, this file plus `CLAUDE.md` are the
   brand authority for everything except the name and mark.
2. **The comet mark needs its source vector.** The supplied file is a raster. Favicon,
   app icon and social card all want SVG.
3. **Dark mode only?** Every token today assumes a dark interface, which suits an
   observatory product. If a light mode is ever wanted, it is cheaper to decide now.
