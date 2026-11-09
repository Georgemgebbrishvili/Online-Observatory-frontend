# ADR-086 — A hero with tonight's planet and four panels

- **Date:** 2026-11-09
- **Status:** APPROVED (2026-11-09)
- **Decided by:** project maintainer (Nika), in session: "make same style for Stellar
  observatory frontend website, but stellar style and typography stays", after the Skychaser
  homepage was rebuilt the same day (skychaser.io, a325662b).
- **Builds on:** `ADR-052` (every drawn object is an illustration, never telescope output),
  `ADR-076` to `ADR-078` (pill buttons, glass panels, the night chart, the scroll reveal),
  `ADR-085` (Night Sky and `features/sky/tonight-sky.ts`).
- **Amends:** `ADR-076` §3 and `ADR-078` (the homepage's sections, the hero and the steps).

## Context

The Skychaser homepage was rebuilt as a short page: a hero that holds the main object, a column
of facts and a row of glass panels, then a few short sections. The maintainer asked for the
same layout on Stellar, keeping Stellar's own colours, type and buttons. The Stellar homepage
ran to seven sections; its hero was the words over an interactive drawn sky, and the price, the
steps and a last call each took a section of their own.

## Decision

1. **The hero.** The headline, the lede and the two buttons on the left, set as before (Geist
   bold on the glossy title gradient, the last words in red; the vermilion and glass pills).
   Beside them, tonight's best placed planet, drawn large in an eyepiece: the brightest body
   with a drawn plate that climbs past 20° tonight (Saturn when there is no sky). A glass tag
   gives its best time, highest altitude and compass direction from `tonightSky`, and opens
   Night Sky. The drawing is captioned "Illustration — not telescope output".
2. **Three facts down the side** (wide screens only): the aperture from the observatory record,
   the price a minute and the open slots this week from the platform. A fact the platform cannot
   give is left out.
3. **Four panels** under the hero: the next open time tonight with its price (the booking board
   at that time), Watch live (`/tonight`), the price a minute with the cloud guarantee
   (`/pricing`), and how many bodies are up tonight (Night Sky).
4. **Five sections, not seven.** The hero, Tonight (the night chart, unchanged), How it works
   as four numbered tiles that each open their page, More to explore, Questions. The price
   picker and the last call leave the homepage; the price lives on the hero's panels and
   `/pricing`. The interactive drawn sky (`sky-reveal.tsx`, `homepage-data.ts`), the tabbed
   steps (`flight-plan.tsx`) and the picker (`price-picker.tsx`) are deleted.
5. **The scroll reveal** covers the sections under the hero only; the hero is on screen from the
   start and never hides.
6. **The visual gate** masks what reads the server's tonight: the drawn planet and its tag, the
   side facts, and the panels' figures. The design system shows the hero with no sky, so its
   specimen never changes.

## Consequences

- Nothing on the homepage reads below 14 px (`ADR-076` §4) and no colour is written outside
  `tokens.css`.
- Two strings groups are new in both languages, `home.hero.panels` and `home.hero.rail`; the
  plate names, the sky's hint, the steps' "open", the price picker's lines and the last call
  are removed from both dictionaries.
