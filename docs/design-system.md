# Design system

## Direction

Since ADR-074 (2026-10-25) every surface is Crimson: a deep wine night behind every page,
wine-gradient panels at 24px, glossy crimson for what is chosen or primary, cream paper for
a summary and its one button, pill buttons, and Geist headlines in sentence case. ADR-052's
roles stay — glass bars, glowing buttons and LIVE pills. Still never: purple-nebula
imagery, HUD decoration, stock space imagery presented as telescope output.

## Foundations

- Headline: Anton, uppercase (`--font-headline`, aliased as `--font-display` and
  `--font-title`) — h1, h2, `.display`, `.headline`, `.title-sunset`. Georgian falls
  through to Noto Sans Georgian at weight 800
- h3 and h4: Oswald 500, `.06em`, uppercase, as Skychaser sets them
- Spaced label: Oswald (`--font-label`) — `.kicker` / `.eyebrow` (red ink), `.label`,
  buttons (600, `.14em`), navigation (500, 15px, `.12em`), status pills (600, `.18em`).
  Georgian: Noto Sans Georgian 600, not tracked
- Body: Geist 500, then FiraGO for Mkhedruli (`--font-body`); FiraGO is self-hosted in
  `apps/web/src/app/fonts/firago/`
- Data: JetBrains Mono, then FiraGO for Georgian words (`--font-mono`) — `<time>`,
  `<code>` or `.data`; tabular figures; ink, not a colour
- Wordmark: STELLAR in Archivo Expanded Black (`--font-archivo`, `font-stretch: 125%`, 900) beside the kit's comet mark (`public/brand/logo-mark.svg`), in `--color-mark`
- Under `:lang(ka)` nothing is uppercased or letter-spaced
- Ground: the page is deep space — `body::before` lays the star tile at three scales with
  blue, violet and red light over `--color-console` (#050507), grain and a vignette over
  it. `--color-night` (#0d0d0d) is the canvas of a section that needs one;
  `--color-surface-base` (#131313) wells; `--color-surface-raised` /
  `--color-surface-hover` the plate, cream at 6% / 11% mixed over the canvas
- Ink: `--color-text-primary` (#f4f4f2), `--color-text-secondary` (#b8b8b4),
  `--color-text-tertiary` (#969692), `--color-text-disabled` (#73736f),
  `--color-text-small` (#adada8) for text under 14px
- Rules: `--color-border-subtle` / `--color-border-strong` (cream at 12% / 22%);
  `--color-line` / `--color-line-strong` (white at 9% / 22%) on glass;
  `--color-border-control` (cream at 40%) for form-control edges, which need 3:1
- Red: `--color-accent` (#e3482c) for highlights, the active tab, the current step and every
  glow; `--color-action` (#c8392a) under `--color-on-action` (white) for filled buttons —
  white on the accent is 4.0:1 and is never used; `--color-accent-ink` (#f0785a) for red
  text and the focus ring
- Green for LIVE and online (`--color-live`, #2ecc71); gold for simulated, done and
  degraded (`--color-simulated`, `--color-warning`, #e2b85a); `--color-error` (#ff7a6b)
- Glass: `--color-bar` under `backdrop-filter: blur(14px) saturate(140%)` for the header
  and the phone tab bar
- Glow (ADR-052 §4): `--glow-action` under filled buttons, `--glow-live` and
  `--glow-live-led` on the LIVE pill, `--glow-badge`, `--glow-pulse-*` on the console's
  current step, `--glow-tab-icon`, `--glow-nav-current`
- Panels: plate, strong rule, `--radius-panel` (14px); the console's `--radius-console`
  (12px) with corner ticks; buttons and chips `--radius-control` (6px), 50px tall
- Type scale: `--font-size-display` … `--font-size-caption`, plus `--font-size-stat`,
  `--font-size-kicker`, `--font-size-nav`, `--font-size-tab`, `--font-size-wordmark` and the
  homepage sky's three
- Spacing: `--space-1` … `--space-20` with a fluid `--space-page` gutter
- Motion: UI 160–220ms, instrument 500–1200ms; Skychaser's `--ease-sky` and `--ease-spring`

`src/styles/tokens.css` is the only file that holds a colour literal. `src/styles/tokens.ts` mirrors the palette for `next/og` and the homepage sky's canvas, which cannot read CSS variables, and offers `withAlpha` for a canvas colour at an opacity; `tokens.test.ts` keeps the two equal and asserts ADR-074's roles exactly. The `--st-*` palette is private to `tokens.css`: everything else uses the semantic `--color-*` tokens.

`npm run lint` enforces this. Stylelint rejects hex, named colours, colour functions and `--st-*` references in any stylesheet except `tokens.css`; since ADR-052 it allows `backdrop-filter` and `text-shadow`. Since v3 it also rejects a `font-size` that does not come from the scale in **every** stylesheet, not only the library four — the permitted shapes are `var(--font-size-*)` and `min(var(--font-size-*), Nvw)`, the measured cap that stops a long Georgian compound breaking mid-word. Five stylesheets are exempt while they await the Phase 1 migration and are named in `stylelint.config.mjs`; that list only shrinks. Raw font weights and spacing lengths are still rejected in the library stylesheets (`components.css`, `globals.css`, `navigation.css`, `footer.css`, `design-system.css`). ESLint rejects hex literals and colour-function strings in TypeScript outside `tokens.ts`.

Breakpoints are named, not written by hand. `src/styles/breakpoints.css` declares the five v3 boundaries plus their `below-` forms as `@custom-media`, resolved by `postcss-custom-media` after Tailwind inlines the import graph. A stylesheet writes `@media (--md)`, never `@media (min-width: 48rem)`. `tokens.test.ts` fails if a sixth appears.

Contrast for every token pair is measured in `docs/design/contrast.md`; every pair the library uses passes AA.

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
- Red marks the active tab, the current step and the one filled action. The LIVE indicator's dot appears only when the caller asserts the camera is genuinely live (`active` is required).
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

## ADR-052 check

| Component                          | Skychaser source                                          | Checked                                                                                           |
| ---------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Tokens                             | `skychaser-theme.css`, `skychaser-odyssey.css`            | Values verbatim except the action fill (#c8392a for AA); asserted by test                         |
| Typography                         | `skychaser-type.css`                                      | Anton h1/h2, Oswald h3/h4, labels, buttons and nav; Georgian never uppercased or letter-spaced    |
| `Button`                           | `.sd-btn`, `skychaser-mobile.css`, `skychaser-motion.css` | 50px, 6px, Oswald 600 `.14em`; filled with the red halo, lift, sheen, press; outline at white 22% |
| `StatusIndicator`, `LiveIndicator` | `.sdo-pill--live`                                         | The green LIVE pill and LED glow; text label always present                                       |
| `ModeNotice`, `.capture-simulated` | —                                                         | Gold outline for simulated                                                                        |
| Header, tab bar                    | `.sd-bar`, `SkychaserTabBar`                              | Glass, Oswald nav with drawn underline and current glow; the tab bar's red current tab            |
| `BrandLockup`                      | `Wordmark.tsx`, `public/brand/`                           | The kit's mark; STELLAR set in Archivo Expanded Black at the kit's size                           |
| Homepage hero                      | `SkyReveal.tsx`, `skychaser-home.css`                     | The sky, ported; our four drawn plates, captioned                                                 |

## Brand assets

`public/brand/logo-mark.svg`, `src/app/icon.svg`, `src/app/favicon.ico` and
`src/app/apple-icon.png` are the Skychaser logo kit's mark, supplied by the maintainer. The
kit's wordmark spells Skychaser and is not used; STELLAR is set in its face. Asset
provenance must also be added to the private provenance record.

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
