# ADR-026 — The `/observatory` Page Is Redesigned Ahead of Phase 7

- **Date:** 2026-09-26
- **Status:** APPROVED
- **Decided by:** project maintainer
- **Amends:** `docs/plan/02-build-phases.md`, Phase 7 ("Polish — explicitly last, by the
  maintainer's instruction"), for one page only.

## Context

The build plan puts the visual pass and motion in Phase 7, after the structure has
settled, so that nothing is polished twice. On 2026-09-26 the maintainer asked for the
observatory page to be reworked now, with every necessary element and button on its
first screen. Asked how to record it, the maintainer chose a redesign of `/observatory`
alone, leaving Phase 7 in place for every other surface.

The page as it stood put a title, one sentence and one button above the fold. Status,
telescope and camera came below it, and there was no way into the live view. It also
read a fixture (`features/observatory/observatories.ts`) that:

- labelled its status "Demonstration status", while the platform publishes a real one
  (`GET /observatories/{id}/state`);
- printed site coordinates, `41.72° N · 44.79° E`, although `PublicObservatoryStatus`
  "deliberately excludes coordinates precise enough to be actionable";
- described the camera as "cooled" with "regulated sensor cooling". `CLAUDE.md` names the
  ZWO ASI585MC, the uncooled model; the cooled one is the ASI585MC Pro.

## Decision

1. `/observatory` is redesigned now. Its first screen, at 1440×900 and at 390×844 in
   order of reading, carries:
   - **live status** — link, weather, weather hold and mode, from `getObservatoryStatus`,
     with a link to `/status`;
   - **tonight's targets and the way to book** — up to three observable targets from
     `listTonightTargets`, and "See tonight's targets" (`/app/missions`) as the primary
     action;
   - **telescope and camera** — the telescope from `BookableObservatory.telescope`; the
     camera as `CLAUDE.md` and ADR-001 name it, ZWO ASI585MC, one-shot colour (ADR-021),
     with no cooling claim;
   - **the live view** — "Open the live view" (`/app/live`). The live room remains a
     fixture until Phase 4; the link is the entry point, not a claim that it is wired.
2. Status and tonight's list are read from the platform. The page therefore renders per
   request, not at build time.
3. The coordinates and the cooling claim are removed. The status block reports what the
   platform reports and nothing else.
4. Motion on this page follows the brand's durations only: one load sequence at
   `--duration-instrument`, UI transitions at 160–220 ms, all of it off under
   `prefers-reduced-motion`. No glow, no glass: depth comes from the surface ramp and
   borders, as `CLAUDE.md` requires.
5. Phase 7 is unchanged for every other surface.

## Consequences

- The fixture keeps its other readers (`features/network/network.ts`,
  `features/observatory/homepage-data.ts`). Its camera record had no other reader and is
  deleted. Its coordinates are still printed by `/network` (`network-page.tsx`) and the
  homepage (`visualLocation` in `i18n/dictionaries`); this record does not reach those
  pages, and they are raised with the maintainer separately.
- `/observatory` answers a platform outage with its copy intact and the status block
  saying the status is unavailable.
- If Phases 3 or 4 reshape the booking or live-room entry points, this page's two
  actions move with them.
