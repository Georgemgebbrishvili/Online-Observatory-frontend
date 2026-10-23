# ADR-066 — Tonight, Live: Anyone May Watch a Session Its Owner Opens

- **Date:** 2026-10-23
- **Status:** APPROVED (maintainer's standing approval for Phase 6 scope records, given
  2026-10-23; open to revision on review)
- **Decided by:** project maintainer
- **Relates to:** Phase 6 plan, slice 6.4; ADR-007 and ADR-036 (observer seats);
  ADR-011 (the live view is MJPEG from the realtime service); CLAUDE.md "a simulated
  stream is always badged"

## Context

A visitor who has never booked has no way to see what a session looks like. The paid way
to watch someone else's session is an observer seat (ADR-007, ADR-036): a signed-in
customer, a seat bought, ten at most, the full live view. Slice 6.4 adds a free,
anonymous way in that sells the product without giving away the seat.

## Decision

### 1. The owner opens it, per session, default off

In the room the owner sees **Show on Tonight, live**. It is off for every session until
they turn it on, and they can turn it off at any moment; the spectator stream ends at
once. It is separate from opening the session to observers: one is a paid seat for a
signed-in customer, the other a public window.

### 2. What a spectator sees

- the live feed, badged **Simulated** when it is;
- the target's name, the mission state, the time left;
- nothing about anyone: no owner, no observer count, no names, no controls, no captures.

### 3. Lower quality than a seat

Every frame the agent sends reaches the owner and the observers. A spectator gets one
frame every **four seconds**: the same picture, refreshed more slowly. No re-encoding,
so the realtime service does no extra image work.

### 4. A cap

At most **twenty** spectators per session at once. The twenty-first is told the window is
full and offered a booking. Twenty at one frame every four seconds is about 0.8 MB/s from
the realtime service at today's frame sizes, which the hosted demo carries; a bigger
audience is a media-server decision, which ADR-036 keeps closed.

### 5. The page

`/[locale]/tonight`, no sign-in, linked from the home page while a session is open to it.
It says, in English and Georgian, which of these is true: a session is live; nothing is
live; the observatory is offline; a weather hold is on. Every state offers a booking. The phone app's Tonight tab shows the same.

### 6. Platform

- `Mission.broadcast`, set by the owner with `PATCH /missions/{missionId}/broadcast`.
- `GET /tonight`: the one live session whose owner opened it, or none — target, state,
  mode, ends-at, spectators now and the cap. Public.
- `GET /stream/mission/{missionId}/spectate`: the MJPEG view at the spectator rate, no
  session, refused once the cap is reached or the owner closes it. Under the existing
  `/stream/mission/` path, so the hosted demo's front routes it with no change.

## Consequences

- A visitor can watch before they pay; the seat stays the way to watch properly.
- The fan-out is twenty plus ten plus one per session. It is load-tested on the realtime
  service in this slice and measured again on the observatory's uplink in slice 6.9.
- Nothing is recorded about spectators beyond a count held in memory.
