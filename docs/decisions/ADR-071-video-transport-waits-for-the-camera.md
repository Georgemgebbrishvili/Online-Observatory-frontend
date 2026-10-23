# ADR-071 — Video Transport Waits for the Camera

- **Date:** 2026-10-23
- **Status:** APPROVED (maintainer's standing approval for Phase 6 scope records, given
  2026-10-23; open to revision on review)
- **Decided by:** project maintainer
- **Relates to:** Phase 6 plan, slice 6.9 ("Waits on: hardware measured"); ADR-011 (the live
  view is MJPEG); ADR-066 (spectators at a slower rate); CLAUDE.md "no extra services
  without a measured need"

## Context

Slice 6.9 asks whether WebRTC through a small media server, or low-latency HLS, should
replace today's MJPEG. Its own rule is to measure first, on the simulator and on the
ASI585MC. There is no camera at the observatory yet, and the simulator's frames are drawn
by code, so their size and cadence say little about a real sky.

## Decision

1. **No transport is built in Phase 6.** MJPEG stays: it needs no extra service, the
   observatory still only dials out, and the phone app reads it.
2. **What to measure, once the camera is on the mini-PC**, for one 30-minute session at the
   agent's live-stack cadence, on the observatory's real uplink:
   - bytes per frame and frames per second leaving the agent, and at the realtime service;
   - end-to-end latency, from the agent's frame timestamp to the browser painting it;
   - CPU on the mini-PC (agent) and on the realtime machine, with one owner, ten observers
     and twenty spectators watching (ADR-066's cap);
   - the same with the browser on a phone over mobile data.
3. **When to reopen it:** if those numbers show the uplink or the realtime machine cannot
   carry the audience ADR-066 allows, or latency makes the controls feel broken. Then an
   ADR compares WebRTC and LL-HLS against the numbers, with MJPEG kept as the fallback.

## Consequences

- No new service, no new cost, nothing to maintain until there is a measured reason.
- The numbers above are the first hardware evidence slice 6.9 needs; they are recorded in
  `docs/evidence/` when taken.
