# ADR-037 — A Web-First Launch, and Design Before Breadth

- **Date:** 2026-10-02
- **Status:** APPROVED
- **Decided by:** project maintainer
- **Amends:** `docs/plan/02-build-phases.md`. Its "Sequence" section and Phase 7's
  "explicitly last, by the maintainer's instruction". Phases 0–4 stand as built.

## Context

On 2026-10-02 the maintainer asked for an evaluation of the remaining plan. The audit
(recorded in `docs/plan/04-roadmap-to-launch.md`) found:

- The plan ends at Phase 7, "polish". Nothing in it launches the product. No phase
  covers a real payment provider, legal text, production secrets, the domain, error
  monitoring, or the hardware first light that `MAX_ALT_SAFE` depends on.
- Phase 5 aims for "every endpoint has a caller": loyalty, vouchers, subscriptions,
  partner self-service. That sits ahead of Georgian QA, accessibility and the visual
  pass, none of which a launch can skip.
- The mobile application is Phase 6, and its iOS lead time (Apple enrolment, D-U-N-S)
  has no recorded status.
- `/app/live` still renders a fixture, and it duplicates the live room that Phase 4
  built at `/app/missions/[id]/session`.

The maintainer then decided three things.

## Decision

1. **The first launch is web only.** The mobile application (Phase 6, DV-082–084) moves
   after launch. Apple developer enrolment starts now regardless, because it takes weeks.
2. **The design pass moves ahead of commerce breadth.** The maintainer wants every page
   "ideal, cosmic and solid". The visual pass that Phase 7 held back is sliced into
   `04-roadmap-to-launch.md` Track B. It runs after Phase 4's open slices and before the
   launch QA. Loyalty, vouchers, subscriptions, the Observation Pass and partner
   self-service move after launch.
3. **`/app/live` redirects to the live room.** A signed-in customer with a live or
   imminent mission goes to its session. Anyone else goes to booking. The fixture page
   and `features/live/live-data.ts` are deleted. One room, built once.

## Consequences

- `docs/plan/04-roadmap-to-launch.md` is now the order of work, and `02-build-phases.md`
  remains the record of Phases 0–4.
- A launch track exists, gated on the hardware first light: Phase 1 does not launch on
  the simulator.
- "Polish" is no longer an end phase. Each Track B slice ships with its own visual
  baselines in both languages, under the existing surface loop in `CLAUDE.md`.
- Nothing here relaxes the brand rules. "Cosmic" is reached inside them; see ADR-038.
