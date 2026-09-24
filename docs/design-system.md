# Design system

## Direction

Darkview should feel like a premium optical instrument: dark, calm, exact, and trustworthy. Brand Identity System v2.0 is the source; `docs/design/brand-tokens.md` is the extraction. Photon Blue is reserved for the one active or important state on a screen (the 90 / 8 / 2 rule). Nothing glows, nothing is frosted glass, and there is no purple-nebula imagery, HUD decoration or generic space-store pattern.

## Foundations

- Display typography: Noto Serif Georgian 500–600 (`--font-display`) — heroes, h1, h2
- UI and body typography: FiraGO 400/500/600 (`--font-body`), self-hosted in `apps/web/src/app/fonts/firago/`
- Data typography: IBM Plex Mono (`--font-mono`) — coordinates, timestamps, exposures only; use `<time>`, `<code>` or `.data`
- Type scale: `--font-size-hero` … `--font-size-caption`, brand §05 at pt × 1.6 = px; UI text is 16px
- Spacing: `--space-1` … `--space-20` (4px multiples) with a fluid `--space-page` gutter
- Surfaces (§08): `--color-night`, `--color-surface-base`, `--color-surface-raised` (Observatory Blue — cards, navigation, panels), `--color-surface-hover`
- Text: `--color-text-primary` (Instrument), `--color-text-secondary`, `--color-text-tertiary`, `--color-text-technical` (Lunar Silver)
- Accent: `--color-photon`, `--color-photon-deep` (light backgrounds), `--color-on-photon` (Darkview Night text on Photon Blue)
- Semantic states: `--color-success`, `--color-warning` (degraded conditions, `WEATHER_HOLD`), `--color-error` (destructive or actionable failure — never absent data), `--color-info`, and `--color-live` for the LIVE dot
- Motion (§07): UI 160–220ms, instrument 500–1200ms (`--duration-instrument`), wonder 4–8s (`--duration-wonder`), one curve `--ease-standard`

`src/styles/tokens.css` is the only file that holds a colour literal. `src/styles/tokens.ts` mirrors the palette for `next/og`, which cannot read CSS variables; `tokens.test.ts` keeps the two equal and asserts the five `CLAUDE.md` colours. The `--dv-*` palette is private to `tokens.css`: everything else uses the semantic `--color-*` tokens.

`npm run lint` enforces this. Stylelint rejects hex, named colours, colour functions, `--dv-*` references, `backdrop-filter` and `text-shadow` in any stylesheet except `tokens.css`, and rejects raw font sizes, font weights and spacing lengths in the library stylesheets (`components.css`, `globals.css`, `navigation.css`, `design-system.css`). ESLint rejects colour literals in TypeScript outside `tokens.ts`.

Contrast for every token pair is measured in `docs/design/contrast.md`. The one pair below AA, `text-tertiary` on `surface-hover`, is never used.

## Component inventory

- Actions: `Button`, `IconButton`
- Selection and status: `Chip`, `StatusIndicator`, `Tabs`, `Dropdown`
- Surfaces: `Card`, `SurfacePanel`, `Modal`, `Sheet`, `Tooltip`
- Feedback: `Skeleton`, `StatePanel`
- Forms: `Field`, `TextInput`, `TextArea`, `Checkbox`
- Darkview motifs: `OpticalRing`, `LiveIndicator`, `ObservatoryStatus`, `TargetQuality`, `MissionStatus`

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

| Component                                             | Brand v2.0 section                                            | Checked                                                                                                                                                                                                                                   |
| ----------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tokens                                                | §04 Color, §04 Neutral scale, §11 Developer cheat sheet       | Values verbatim; `CLAUDE.md` colours asserted by test                                                                                                                                                                                     |
| Typography                                            | §05 Typography, §05 Type scale, §05 Georgian typographic rule | Three families; Georgian is never uppercased or letter-spaced (`:lang(ka)`)                                                                                                                                                               |
| `Button`                                              | §08 Button styles                                             | Primary Photon Blue with Darkview Night text, 10px radius, weight 600, no glow or gradient; secondary Observatory surface, Neutral-600 border, hover Neutral-700; ghost Neutral-300, hover Observatory; destructive error border and text |
| `IconButton`                                          | §07 Iconography                                               | 24px glyph, 1.5 stroke, round caps and joins, 8px container radius                                                                                                                                                                        |
| `Chip`, `StatusIndicator`                             | §04 Semantic colors, §04 The 90 / 8 / 2 rule                  | Text label always present; tints composited and measured                                                                                                                                                                                  |
| `LiveIndicator`                                       | §08 Live observation page, rule 04                            | Red dot only when `active`; `active` is required so no caller can default to LIVE                                                                                                                                                         |
| `ObservatoryStatus`, `MissionStatus`, `TargetQuality` | §04 Semantic colors                                           | Warning for degraded conditions, error only for failure states                                                                                                                                                                            |
| `Card`, `SurfacePanel`                                | §08 Surface mapping, §07 Iconography                          | Cards on Observatory Blue, hover Neutral-700, 16px radius; no glass                                                                                                                                                                       |
| `Modal`, `Sheet`, `Tooltip`, `Dropdown`               | §08 Surface mapping, §09 anti-pattern 04                      | Opaque scrim, no backdrop blur                                                                                                                                                                                                            |
| `Tabs`                                                | §08 Surface mapping                                           | Photon Blue marks the selected tab only; no glow under it                                                                                                                                                                                 |
| `Skeleton`, `StatePanel`                              | §02 Tone of voice, §04 Semantic colors                        | Empty state neutral; error state uses error only for an actionable failure                                                                                                                                                                |
| `Field`, `TextInput`, `TextArea`, `Checkbox`          | §05 (16px UI minimum), WCAG 1.4.11                            | 16px text; control borders 3:1 or better                                                                                                                                                                                                  |
| `OpticalRing`                                         | §06 Logo direction (Concept A geometry), §07 Motion           | Motif only, not the logo; no drop-shadow glow                                                                                                                                                                                             |
| `BrandLockup`                                         | §06 Logo rules — wordmark treatment                           | "Darkview" in sentence case, FiraGO Medium; the Aperture mark itself is not yet drawn                                                                                                                                                     |

## Brand assets

The current lockup is a text placeholder. When approved files are supplied, place them in `public/brand` and replace the placeholder without redrawing or generating a logo. Asset provenance must also be added to the private provenance record.
