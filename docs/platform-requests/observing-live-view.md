# Platform request: the live view runs while OBSERVING

Raised 2026-10-22 while verifying the mobile live room on the simulator stack
(platform 475b1b5). It affects the website's live view the same way.

## What happens

`MissionRunner._do_observing` (agent/darkview_agent/mission/runner.py) waits for a
Capture or the timeout and exposes nothing, so no frame reaches `show` during
OBSERVING. Frames are shown only while VERIFYING (each plate-solve exposure) and while
CAPTURING (the stack). The realtime service releases a frame 30 s after it arrives
(`LIVE_FRAME_MAX_AGE_SECONDS`).

So, during the state the customer is there for:

- A client that subscribes within 30 s of OBSERVING starting is offered a stream, and
  is served the last plate-solve exposure, unchanged, as the live view.
- A client that subscribes later (a reopened app, a second device, a reload) gets no
  `MISSION_STREAM` at all, and the room shows "Connecting to the telescope" until
  Capture.
- A nudge or re-centre during OBSERVING never shows on screen.

The docstring of `_do_observing` says "Hold on the target with the live view running",
and the comment above `_do_capturing` says the customer should "watch the same picture
get better". The behaviour does not match either.

## Evidence

Mission ae021d8d-c8cc-4e43-b25d-acdae6ac0f08 (Albireo, Tbilisi demo observatory,
16:25Z slot), agent log: OBSERVING at 16:26:12Z, the next agent activity is the capture
at 16:27:08Z. The Georgian session, opened at about 16:26:20Z, showed a frame; the
English session on the same mission, about 30 s later, never received a stream. Shots
in `docs/evidence/mobile-live-room-2026-10-22/`.

## Proposed

No contract change. While OBSERVING, the runner keeps exposing at the mission's
exposure and gain and shows each frame stacked (or each frame on its own, which is
cheaper; the stacking decision is the platform's), so `LiveView` sends one at its
existing rate limit. The stack resets after a nudge or re-centre, as it already does
after a focus change.

## What it blocks

Nothing in the clients' code. The website and the app both handle a stream that
arrives late or never. Until this lands, a live session shows the sky only during
verification and capture.
