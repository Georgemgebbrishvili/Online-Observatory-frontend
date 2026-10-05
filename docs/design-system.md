# Design system

## Direction

Stellar should feel like a premium optical instrument: dark, calm, exact, and trustworthy. Brand Identity System v2.0 is the source; `docs/design/brand-tokens.md` is the extraction. Photon Blue is reserved for the one active or important state on a screen (the 90 / 8 / 2 rule). Nothing glows, nothing is frosted glass, and there is no purple-nebula imagery, HUD decoration or generic space-store pattern.

## Foundations

Since ADR-039 (2026-10-02) every surface takes the Stellar poster language.

- Headline: Anton, uppercase (`--font-headline`, aliased as `--font-display`) — h1–h4, `.display`, `.headline`. Georgian falls through to Noto Sans Georgian, condensed (`wdth` 75) at weight 800
- Sunset title: Bowlby One (`--font-title`) with `--gradient-sunset` as a text fill, `.title-sunset` — one line per page at most. Georgian: Noto Sans Georgian, condensed, 900
- Spaced label: Oswald, uppercase, tracked (`--font-label`) — `.kicker` / `.eyebrow` (orange ink), `.label`, buttons, chips, status pills. Georgian: Noto Sans Georgian, condensed, 600, not tracked
- Body: Geist, then FiraGO for Mkhedruli (`--font-body`); FiraGO is self-hosted in `apps/web/src/app/fonts/firago/`
- Data: JetBrains Mono, then FiraGO for Georgian words (`--font-mono`) — use `<time>`, `<code>` or `.data`; tabular figures
- Under `:lang(ka)` nothing is uppercased or letter-spaced, and the headline, title and label weights switch through `--font-weight-headline`, `--font-weight-title`, `--font-weight-label`
- Ground: `--color-night` (#000), `--color-surface-base` (#050505, wells), `--color-surface-raised` / `--color-surface-hover` (the plate, cream at 4.5% / 8.5%, mixed over night so overlays stay opaque)
- Ink: `--color-text-primary` (#f6ecd8), `--color-text-secondary` / `-tertiary` / `-disabled` (cream at 76% / 56% / 34%)
- Rules: `--color-border-subtle` / `--color-border-strong` (cream at 11% / 20%); `--color-border-control` (cream at 40%) for form-control edges, which need 3:1
- Orange for actions: `--color-accent`, `--color-accent-hover`, `--gradient-accent` (the primary fill), `--color-on-accent` (#1a0f08), `--color-accent-ink` (orange text on night)
- Yellow for anything live or current: `--color-live`, `--color-simulated` — status dots, the `active` status tone, the simulated badge (`.capture-simulated`) and the mode chip
- Photon Blue for data and focus: `--color-photon`, `--focus-ring`
- Semantic states: `--color-success`, `--color-warning` (degraded conditions, `WEATHER_HOLD`), `--color-error`
- Panels: plate, strong rule, `--radius-panel` (14px); buttons and small panels `--radius-control` (10px). No glow, no shadow halo, no `backdrop-filter`
- Type scale: `--font-size-display` … `--font-size-caption`, plus `--font-size-stat` and `--font-size-kicker`
- Spacing: `--space-1` … `--space-20` with a fluid `--space-page` gutter
- Motion: UI 160–220ms, instrument 500–1200ms (`--duration-instrument`), one curve `--ease-standard`

`src/styles/tokens.css` is the only file that holds a colour literal. `src/styles/tokens.ts` mirrors the palette for `next/og`, which cannot read CSS variables; `tokens.test.ts` keeps the two equal and asserts the five `CLAUDE.md` colours. The `--st-*` palette is private to `tokens.css`: everything else uses the semantic `--color-*` tokens.

`npm run lint` enforces this. Stylelint rejects hex, named colours, colour functions, `--st-*` references, `backdrop-filter` and `text-shadow` in any stylesheet except `tokens.css`. Since v3 it also rejects a `font-size` that does not come from the scale in **every** stylesheet, not only the library four — the permitted shapes are `var(--font-size-*)` and `min(var(--font-size-*), Nvw)`, the measured cap that stops a long Georgian compound breaking mid-word. Five stylesheets are exempt while they await the Phase 1 migration and are named in `stylelint.config.mjs`; that list only shrinks. Raw font weights and spacing lengths are still rejected in the library stylesheets (`components.css`, `globals.css`, `navigation.css`, `footer.css`, `design-system.css`). ESLint rejects colour literals in TypeScript outside `tokens.ts`.

Breakpoints are named, not written by hand. `src/styles/breakpoints.css` declares the five v3 boundaries plus their `below-` forms as `@custom-media`, resolved by `postcss-custom-media` after Tailwind inlines the import graph. A stylesheet writes `@media (--md)`, never `@media (min-width: 48rem)`. `tokens.test.ts` fails if a sixth appears.

Contrast for every token pair is measured in `docs/design/contrast.md`; since ADR-039 every pair the library uses passes AA.

## Component inventory

- Actions: `Button`, `IconButton`
- Selection and status: `Chip`, `StatusIndicator`, `Tabs`, `Dropdown`
- Surfaces: `Card`, `SurfacePanel`, `Modal`, `Sheet`, `Tooltip`
- Feedback: `Skeleton`, `StatePanel`
- Forms: `Field`, `TextInput`, `TextArea`, `Checkbox`
- Stellar motifs: `OpticalRing`, `LiveIndicator`, `ObservatoryStatus`, `TargetAvailability`, `MissionStatus`, `ModeNotice`, `TargetCard`, `CaptureCard`

The internal `/design-system` route redirects to the active locale and renders every supported component state. It is marked `noindex` and is not a product feature page.

## Operational semantics

Status components accept typed values and select a semantic tone internally. The visible label is always present, so color is never the only signal. Callers may supply a translated label without changing the stable state value.

`OpticalRing` is an interface motif, not a logo replacement. It uses a small inline SVG with tokenized strokes and must remain visually secondary to content.

## Interaction rules

- Use one primary button per focused section.
- Photon Blue indicates active, selected, or target-lock state only. The LIVE indicator's red dot appears only when the caller asserts the camera is genuinely live (`active` is required).
- Use native dialog and select behavior for predictable keyboard and assistive-technology support.
- Modal and sheet content must have a title and an explicit close action.
- Tabs support Arrow Left, Arrow Right, Home, and End.
- Loading placeholders are decorative; their surrounding region provides the accessible label.
- Error states use `role="alert"`; empty states use a non-destructive status presentation.

## Accessibility

- Interactive controls require visible keyboard focus.
- Touch targets are at least 44px.
- Status must use text or an icon in addition to color.
- Body copy targets WCAG 2.1 AA contrast.
- Motion must respect `prefers-reduced-motion`.
- Semantic landmarks and headings must remain ordered and discoverable.

## Brand v2.0 check (DV-070 acceptance criterion 6)

| Component                                                  | Brand v2.0 section                                            | Checked                                                                                                                                                                                                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tokens                                                     | §04 Color, §04 Neutral scale, §11 Developer cheat sheet       | Values verbatim; `CLAUDE.md` colours asserted by test                                                                                                                                                                                    |
| Typography                                                 | §05 Typography, §05 Type scale, §05 Georgian typographic rule | Three families; Georgian is never uppercased or letter-spaced (`:lang(ka)`)                                                                                                                                                              |
| `Button`                                                   | §08 Button styles                                             | Primary Photon Blue with Stellar Night text, 10px radius, weight 600, no glow or gradient; secondary Observatory surface, Neutral-600 border, hover Neutral-700; ghost Neutral-300, hover Observatory; destructive error border and text |
| `IconButton`                                               | §07 Iconography                                               | 24px glyph, 1.5 stroke, round caps and joins, 8px container radius                                                                                                                                                                       |
| `Chip`, `StatusIndicator`                                  | §04 Semantic colors, §04 The 90 / 8 / 2 rule                  | Text label always present; tints composited and measured                                                                                                                                                                                 |
| `LiveIndicator`                                            | §08 Live observation page, rule 04                            | Red dot only when `active`; `active` is required so no caller can default to LIVE                                                                                                                                                        |
| `ObservatoryStatus`, `MissionStatus`, `TargetAvailability` | §04 Semantic colors                                           | Warning for degraded conditions, error only for failure states                                                                                                                                                                           |
| `Card`, `SurfacePanel`                                     | §08 Surface mapping, §07 Iconography                          | Cards on Observatory Blue, hover Neutral-700, 16px radius; no glass                                                                                                                                                                      |
| `Modal`, `Sheet`, `Tooltip`, `Dropdown`                    | §08 Surface mapping, §09 anti-pattern 04                      | Opaque scrim, no backdrop blur                                                                                                                                                                                                           |
| `Tabs`                                                     | §08 Surface mapping                                           | Photon Blue marks the selected tab only; no glow under it                                                                                                                                                                                |
| `Skeleton`, `StatePanel`                                   | §02 Tone of voice, §04 Semantic colors                        | Empty state neutral; error state uses error only for an actionable failure                                                                                                                                                               |
| `Field`, `TextInput`, `TextArea`, `Checkbox`               | §05 (16px UI minimum), WCAG 1.4.11                            | 16px text; control borders 3:1 or better                                                                                                                                                                                                 |
| `OpticalRing`                                              | §06 Logo direction (Concept A geometry), §07 Motion           | Motif only, not the logo; no drop-shadow glow                                                                                                                                                                                            |
| `BrandLockup`                                              | §06 Logo rules — wordmark treatment                           | "Stellar" in sentence case, FiraGO Medium; the Aperture mark itself is not yet drawn                                                                                                                                                     |

## Brand assets

The current lockup is a text placeholder. When approved files are supplied, place them in `public/brand` and replace the placeholder without redrawing or generating a logo. Asset provenance must also be added to the private provenance record.

## The product name

The name, its Georgian case forms, both taglines and the maker line live in
`apps/web/src/brand.ts` and nowhere else. A string names the case it needs —
`brand.ka.genitive`, `brand.ka.on` — because Georgian declines the name and no single
token is right in every sentence. `src/brand.test.ts` fails if the name is spelled out
anywhere else in `apps/web/src`.

## Visual gate

Every public, signed-out, `/app` and `/admin` route, the 404 and the route error screen,
in English and Georgian, at 390 and 1440, is compared against a committed baseline by
the Playwright project `visual` (`apps/web/e2e/visual.spec.ts`). The error screen comes
from `failing@darkview.test`, a fake operator whose catalogue reads fail.

- Baselines are generated **only** inside `mcr.microsoft.com/playwright:v<version>-noble`,
  by `npm run visual:update`. Never from the host: macOS rasterises fonts differently,
  and the spec skips itself outside Linux. `npm run visual` compares in the same image.
  Both need a container runtime (OrbStack or Docker).
- CI runs `visual` in the same image, with no retries.
- A visual change is a baseline update **in the same commit** as the change, with the
  before and after images shown alongside it — in the pull request description, or in
  the hand-over while work is committed straight to `main`.
- A baseline that changes with no product change is a determinism bug in the gate. Fix
  the gate — a mask, the clock, a font wait — rather than regenerating around it.
