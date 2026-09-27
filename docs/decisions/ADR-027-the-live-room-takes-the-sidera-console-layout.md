# ADR-027 — The Live Room Takes the SIDERA Console's Layout, Wired in Phase 4

- **Date:** 2026-09-27
- **Status:** APPROVED
- **Decided by:** project maintainer
- **Amends:** `docs/plan/02-build-phases.md` — Phase 4 starts before Phase 3 is done,
  and Phase 7's visual pass is brought forward for the live room only, as ADR-026 did for
  `/observatory`.

## Context

On 2026-09-27 the maintainer asked for the observatory room and visuals of the SIDERA
project (`~/Desktop/Sidera`, its `ObservatoryConsole` at `/node`, designs in
`designs/observatory/`) to be brought into Stellar.

A literal port conflicts with this repository's controlling documents:

- **Brand v2.0.** Violet gradients, a glowing Capture button, HUD corner brackets,
  Orbitron and Barlow Condensed.
- **Honest claims.** A "−4.0 °C COOLED" sensor (the ASI585MC is uncooled; ADR-026),
  five stations where there is one node, Bortle ratings and a battery the platform does
  not report.
- **Customer commands.** Its hand control, focus, gain, exposure, frames-to-stack, slew
  rate and tracking switch. `ClientCommandType` allows `NUDGE`, `CAPTURE`, `RECENTER`
  and `ABORT`; GOTO, FOCUS, PARK and SET_PROFILE are never client-initiated.
- **Illustration as output.** Its plates stand where the camera image belongs.

Asked, the maintainer chose (1) the layout, restyled in Stellar's brand, not a port;
(2) the pointing dial, the step flow, the phone layout and the plates; (3) to build it
as the start of Phase 4, wired to the platform, rather than as a restyle of the fixture
the session page runs on — the plan moved that wiring to Phase 4 "so the live room is
not built twice", and restyling the fixture would build it twice; (4) plates only as a
target preview, never in the feed.

## Decision

1. `/app/missions/[id]/session` becomes the live room, in SIDERA's arrangement:
   - **desktop** — the feed at the centre; the step flow beneath it; the pointing
     dial and readings to its right; the mission's captures below;
   - **phone** — the feed first, then the step flow, the readings, the captures, and
     the one primary action fixed at the bottom of the screen.
   The route keeps its `[targetSlug]` segment name (Next.js needs one name for a
   segment); its value is the mission's id, as `/watch` already uses it.
2. It is built on the platform, in three slices (`docs/plan/phase-4/README.md`):
   state and history; the live feed over `/ws/mission/{id}`; the commands. The local
   state-machine simulator the page runs on today is removed with slice 1. The
   platform's simulator (`mode: SIMULATED`) replaces it.
3. **Pointing dial.** It is drawn in inline SVG, horizon at the rim and zenith at the
   centre, north up and east to the right, as SIDERA draws it. Until
   `docs/platform-requests/mission-pointing.md` is answered, it shows the **target's**
   position from `listTonightTargets` and says so. It never draws a mount position the
   platform did not send.
4. **Step flow.** Five steps, derived from `MissionState` only: *Prepare*
   (REQUESTED, SCHEDULED, PREPARING), *Slew* (SLEWING), *Centre* (VERIFYING,
   CENTERING), *Observe* (OBSERVING), *Capture* (CAPTURING, PROCESSING, COMPLETE). A
   failure or hold state stops the flow at the last step reached and is shown as a
   state, never as a step: the contract forbids `MissionFailureReason` in a progress
   indicator.
5. **Controls.** Only what `ClientCommandType` allows: nudge, re-centre, capture,
   abort (slice 3). A command request is never retried automatically, because
   `submitMissionCommand` has no idempotency key and each request mints a new command.
6. **Plates.** Four of SIDERA's code-drawn plates, for Jupiter, Saturn, Mars and Venus,
   are copied into `apps/web/public/plates/` as SIDERA's own WebP renders of them. They appear only as the target's preview,
   in the target panel and in the feed area **before a stream exists**, always captioned
   "Illustration — not telescope output". Once a stream exists, the feed shows the
   stream and nothing else. The deep-sky plates are not taken: M57's rainbow ring, M42's
   pink cloud and the sparkle-starred clusters read as Hubble-class or cartoon
   astronomy, which the brand forbids, and promise more than live stacking on a 6SE
   shows.
7. **Brand.** Stellar's tokens, type and surface ramp throughout. No glow, no glass, no
   HUD brackets. Amber marks two things only: the simulated notice, and a mission
   stopped by a failure or hold.
8. Phase 7 is unchanged for every other surface.

## Provenance

The plates and the dial geometry come from SIDERA (`~/Desktop/Sidera`), which predates
this use. The plates are drawn by code (`designs/observatory/generator/cards.py`,
`app/scripts/sidera-plates/`); no sourced imagery is involved. They are copied
unmodified from SIDERA's `app/public/cards/plate/<NAME>/object.webp` (rendered from the
SVGs by `app/scripts/sidera-plates/raster.mjs`), as of SIDERA commit `fc78c63`
(2026-09-26), and belong in the private provenance record with that origin, not
presented as new work here.

## Consequences

- Readings the platform does not publish are not shown: mount pointing (requested),
  live exposure and gain (shown from a `Capture` once one exists), seeing (null from
  the forecast source), FOV and pixel scale.
- `/app/live` keeps its fixture until slice 2, then leads to the caller's active
  mission's room.
- `e2e/fake-platform.mjs` grows `GET /missions/{id}/events` in slice 1, and the
  session start, the mission channel, the stream and the command endpoint in slices 2
  and 3.
