# ADR-029 — The Homepage Hero Is the Reference Planet Hero, Transcribed

- **Date:** 2026-09-27
- **Status:** SUPERSEDED by `ADR-039-every-surface-takes-the-stellar-poster-language.md` (2026-10-02)
- **Decided by:** project maintainer
- **Supersedes:** ADR-028.
- **Overrides:** Brand Identity System v2.0 (§05 typography, §04 palette, §09
  anti-pattern 04 — glow and glassmorphism) for the homepage hero only; the `CLAUDE.md`
  glow rule, by an exception added to it in the same commit.

## Context

The maintainer asked for the homepage hero to match a reference spec ("SpaceEdu":
a full-screen looping planet video, a very large serif name, flanking planet cut-outs
that feature themselves on press), carrying Stellar's information. ADR-028 kept the
composition and restyled it in the brand; on 2026-09-27 the maintainer saw it and asked
for the reference exactly. Asked, the maintainer confirmed that:

1. the reference's nine assets — three clips, three stills, three cut-outs — are the
   maintainer's to use, and are to be copied into the repository rather than
   hot-linked;
2. the reference's navbar replaces the site header on the homepage, with Stellar's
   links;
3. the glow, glass, fonts and colours are wanted, and `CLAUDE.md` is amended to allow
   them on this hero.

## Decision

1. The homepage hero is `PlanetHero` (`apps/web/src/components/home/planet-hero.tsx`)
   and `apps/web/src/styles/planet-hero.css`, transcribed from the spec: its `--u`
   design unit, measured lengths, six responsive tiers, entrance sequence, planet
   switcher and burger menu. Every selector is scoped under `.planet-hero`.
2. **Planets.** Earth (featured on load), Venus and Mars, as in the spec. The copy is
   Stellar's: the observatory, the slot, the real camera feed. "RESERVE A SLOT" goes to
   `/app/book`.
3. **Assets.** In `apps/web/public/planets/`: the clips unchanged; stills and cut-outs
   converted from PNG to WebP at the same pixel size (5–7 MB each to 0.2–0.5 MB).
4. **Honest imagery.** The clips are renders, not telescope output. `CLAUDE.md` forbids
   presenting them as such, and ranks above this record, so the hero carries the
   "Illustration — not telescope output" caption the spec does not have.
5. **Navbar.** The spec's navbar, over the video, with the public links, the language
   switch, Sign in and "Start Exploring" as the pill. The underline marks Explore. Every
   other page keeps `SiteHeader`.
6. **Deviations the page forces.** The spec's stage is `position: fixed` over a page
   that never scrolls; here it is one viewport tall and the homepage's sections follow
   it, so the scroll control scrolls to them. The entrance classes sit on the hero, not
   on `<html>`, set by React after the fonts load, rather than by a blocking script. The
   pill widens to fit "Start Exploring". Georgian falls back to FiraGO and Noto Serif
   Georgian, which the reference fonts lack.
7. **Lint.** `stylelint.config.mjs` exempts `planet-hero.css`, and only it, from the
   brand rules on colour literals, colour functions, `backdrop-filter`, type sizes and
   `min-width`/`max-width` queries.

## Consequences

- The homepage and `/design-system` baselines change, in both languages, at 390 and
  1440; the visual gate hides the videos and captures the stills, which are
  deterministic.
- The repository carries 26 MB of video.
- Everything else in the product stays under Brand v2.0.
