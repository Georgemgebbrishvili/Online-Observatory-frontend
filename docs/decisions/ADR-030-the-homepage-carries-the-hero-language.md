# ADR-030 — The Homepage Carries the Hero's Language, in Five Sections

- **Date:** 2026-09-27
- **Status:** SUPERSEDED by `ADR-039-every-surface-takes-the-stellar-poster-language.md` (2026-10-02)
- **Decided by:** project maintainer
- **Extends:** ADR-029, from the homepage hero to the homepage below it.
- **Amends:** `docs/plan/02-build-phases.md`, Phase 7, for the homepage only, as ADR-026
  did for `/observatory`; the `CLAUDE.md` exception to the glow rule, in the same commit.

## Context

With the planet hero in place (ADR-029), the maintainer found the page below it not
premium: eight flat sections in Brand v2.0's type, three of them mostly placeholders
(collection frames, a one-node network, "coming later" private sessions), a
demonstration console, and nothing that moved. Asked, the maintainer chose:

1. to carry the hero's look — Prata, Hanken Grotesk, its night and cyan — down the whole
   homepage;
2. to trim the page to five sections;
3. a target rail, scroll reveals and magnetic buttons, and not a pinned scroll story.

## Decision

1. **Sections.** The hero; _How Stellar works_ (`#about`); _Tonight's sky_
   (`#tonight`); _The instrument_ (`#live`); a closing call to action. The live
   demonstration console, the collection placeholders and the network section are
   removed. The private-session lengths fold into the call to action, still marked as
   coming later.
2. **Real data only.** Tonight's rail reads `GET /targets/tonight`, as before. The
   instrument reads `BookableObservatory.telescope` (aperture, focal length; the focal
   ratio is their quotient) and `GET /observatories/{id}/state` (mode, link, weather,
   weather hold, the mission in progress) through `readObservatoryPanel`, the read
   `/observatory` already uses (ADR-026). The camera is named as `CLAUDE.md` and ADR-001
   name it. An unreachable platform shows the state panels, not fixtures.
3. **Look.** Type and colour from `--home-*` tokens in `tokens.css` and the page-root
   font variables. The hero's white pill is reused without its glow; depth is surfaces
   and lines. Brand v2.0 still governs every other surface, and the status indicators
   and the simulated notice keep their brand styling on this page.
4. **Motion and interaction.**
   - _Reveals_: titles rise out of a mask, copy and cards rise and fade, the step rules
     draw; 900–1100 ms, once, as each enters the viewport. Armed only by JavaScript, so
     the page reads in full without it, and never under reduced motion.
   - _Counters_: the instrument's numbers count up once, from a server-rendered final
     value.
   - _Target rail_: filter chips by type, previous/next buttons disabled at the ends,
     mouse drag, touch swipe, scroll snap; a drag never follows the link it ends on.
   - _Magnetic pills_: the call-to-action pills lean toward a fine pointer, at most
     10 px, and settle back; none on touch or under reduced motion.
5. **Honesty.** The closing section reuses the hero's Earth still, captioned
   "Illustration — not telescope output"; the rail's art keeps its "Catalogue
   illustration" note and the schedule note.

## Consequences

- `CollectionFrame`, `SectionHeading`, the homepage console and network fixtures, and
  their dictionary keys are deleted.
- `/design-system` shows the rail, the pills and the counters, and now loads the target
  card styles its specimens were missing.
- The homepage and `/design-system` baselines change in both languages; the visual gate
  shows every reveal in its final state.
