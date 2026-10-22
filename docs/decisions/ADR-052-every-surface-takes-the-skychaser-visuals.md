# ADR-052 — Every surface takes the Skychaser visuals; the name stays Stellar

- **Date:** 2026-10-11
- **Status:** APPROVED
- **Decided by:** project maintainer (Nika), in session: "search my stellar page, take all
  visuals logo and everything, as well as the observatory page and copy this project's
  visuals to ours … make no mistake." Asked, he chose: **keep the name Stellar**; **copy
  the glow exactly**; **every surface**; buttons in the **deeper red `#c8392a` with white
  text** (WCAG AA); the homepage sky reveals **our own drawn plates**, not photographs.
- **Supersedes:** `ADR-039` (the poster language) for colour, type, buttons and panels;
  `ADR-025` §3 (no glow outside the mark) and §4's mark glow; `ADR-041`'s navy scene
  ground; `ADR-050`'s copper console palette and Barlow Condensed.
- **Keeps:** `ADR-025`'s name (Stellar / სტელარი) and its two-stage rename;
  `ADR-027`/`ADR-050`'s content rules for the room; `ADR-051`'s five destinations; every
  honesty rule (below).
- **Source:** the maintainer's Skychaser site, `https://skychaser.io` (formerly
  `stellarr.club`), code in `~/Desktop/Skychaser/app` (formerly `~/Desktop/Stellar/app`):
  `src/styles/skychaser-*.css`, `src/components/skychaser/**`, the console at
  `src/components/skychaser/observatory/console.css`, the logo kit in `public/brand/`.
  Taken at `0f3270c7` on 2026-10-11, then brought up to `7e798b05` on 2026-10-13 (below).

## Context

ADR-039 took the Stellar project's poster language without its glow, and ADR-050 took
its observatory console for the live room. That site has since become **Skychaser**: a
red-orange accent in place of orange and copper, gold in place of yellow, white-ink
greys, a glass header with a comet-mark lockup, glowing filled buttons, a green LIVE
pill, a star-field sky, and a reworked console. The maintainer wants every surface here
to look like it, and the product to keep its name.

## Decision

1. **Palette** (all values in `tokens.css`, nowhere else):

   | Role                                              | Value                                                                        |
   | ------------------------------------------------- | ---------------------------------------------------------------------------- |
   | Canvas (page ground)                              | `#0d0d0d`; deep `#131313`; console and bars `#050507`                        |
   | Plate (raised surface) / hover                    | cream `rgba(244,232,204,.06)` / `.11`                                        |
   | Ink ramp                                          | `#f4f4f2` · `#b8b8b4` · `#969692` · disabled `#73736f`; small text `#adada8` |
   | Rules                                             | cream `rgba(241,230,207,.12)` / `.22`; on glass, white `.09` / `.22`         |
   | Accent (highlights, active tab, red words, glows) | `#e3482c`; hover `#f06a45`; text `#f0785a`                                   |
   | Action fill (filled buttons, white text, 5.1:1)   | `#c8392a`                                                                    |
   | Gold (simulated, done, "go")                      | `#e2b85a`                                                                    |
   | Live                                              | green `#2ecc71` pill                                                         |
   | Error                                             | `#ff7a6b`                                                                    |
   | Focus ring                                        | `2px solid #f0785a`, offset 3px                                              |
   | Sunset ramp                                       | `#fff4d8 → #f0c75e → #e8893a → #d9442a → #8f1f16`                            |

   Photon Blue (`#5cc8ff`) and the orange `#e8742f` leave the palette. Readouts are ink in
   JetBrains Mono.

2. **Type.** Anton for headlines and the wordmark (uppercase, tracking `.012em`, leading
   1.02); Oswald for labels (500, `.2em`), buttons (600 14px, `.14em`) and navigation
   (500 15px, `.12em`); Geist for body (500, 16px, leading 1.6); JetBrains Mono for data.
   Bowlby One and Barlow Condensed leave. **Georgian keeps Noto Sans Georgian and FiraGO**,
   never uppercased or tracked — the source loads no Georgian face.

3. **The mark and lockup.** The Skychaser kit's comet mark (`public/brand/logo-mark.svg`:
   the comet in cream `#f6f1e7` round a sunset core `#ff8146 → #c8102e`), 22px, beside
   **STELLAR** set in Archivo Expanded Black in the mark's cream, at the size that fills
   the kit's 28px wordmark box — the kit's own wordmark spells its name, so ours is set,
   not copied. The favicon, `favicon.ico` and the app icon are the kit's mark. "by
   Astroman" moves to the footer.

4. **Glow, copied.** Filled buttons carry `0 10px 26px -14px #e3482c`; the LIVE pill and
   its LED glow green; the camera badge, the console's current step and the active tab
   icon glow red; the current nav link carries a soft white text glow. The header and the
   phone tab bar are glass (`rgba(5,5,8,.82)`, blur 14px). Stylelint's bans on
   `backdrop-filter` and `text-shadow` are lifted for the files that need them.

5. **Shape.** Buttons and chips 6px; panels 14px on pages and 12px with corner ticks in
   the console; buttons 50px tall; the bar 76px (56px on a phone); the phone tab bar with
   icons and Geist labels, its active tab red.

6. **Shell.** The app's desktop sidebar becomes Skychaser's top bar — lockup, the five
   destinations, the observatory's status pill, account — and the phone keeps the bottom
   bar in Skychaser's style. The not-yet-available pages move to the footer.

7. **The homepage hero** copies Skychaser's sky: the star canvas, the pointer light, the
   red glow, the centred Anton headline with its red words, the lede, one filled button,
   and "explore the sky · n/N found". What the visitor uncovers is our own drawn plates,
   each captioned "Illustration — not telescope output". No photograph appears.

8. **The console and `/observatory`** take `/node`'s current look: the `#050507` ground
   with stars and blue, violet and red radials, monolith panels with corner ticks, the
   red current step, the neutral hand pad with a red centre, the green LIVE pill.

## What stays binding

- The name is Stellar; identifiers that read `darkview` stay until the platform renames.
- Every drawn or rendered object is captioned "Illustration — not telescope output";
  a simulated stream is always badged "Simulated" (now gold). No photograph is presented
  as the telescope's, and nothing implies Hubble-class or long-exposure results.
- WCAG 2.1 AA: every text colour on every surface ≥ 4.5:1, controls ≥ 3:1. White on
  `#e3482c` (4.0:1) is therefore never used for text; filled buttons use `#c8392a`.
- Content and copy stay ours; Skychaser's cards, capsules, rarities and wallet are not
  copied.

## Consequences

- `tokens.css`, `tokens.ts`, `tokens.test.ts` and `docs/design/contrast.md` change
  together; every visual baseline is regenerated in both languages at both widths.
- CLAUDE.md's Design section and `docs/design-system.md` are rewritten to this record.
- Built in slices — tokens, type and shell; the homepage sky; the console and
  `/observatory`; then every remaining surface — each with its baselines.

## Amendment — 2026-10-13: the source moved, and its logo changed

Between the snapshot of 2026-10-11 and 2026-10-13 the maintainer moved the source to
`~/Desktop/Skychaser/app`, the site to `skychaser.io`, and gave Skychaser a new logo from
its logo kit (`9038617d`): the comet with a sunset core, and an outlined wordmark in
Archivo Expanded Black. §3 above is written to the new logo. The other changes in those
commits are Skychaser's own content — wallets, credits, rarities, voting — and change
nothing copied here.

## Amendment — 2026-10-22: the weekly card draw

[ADR-058](ADR-058-a-weekly-card-draw-with-skychaser-cards.md) brings Skychaser's card,
its back, its rarities and its reveal across for the weekly card draw at `/app/cards`,
and nowhere else. Capsules, packs, editions and the wallet stay out; a card is never sold.
