# ADR-068 — Weather-Aware Booking and a Waitlist

- **Date:** 2026-10-23
- **Status:** APPROVED (maintainer's standing approval for Phase 6 scope records, given
  2026-10-23; open to revision on review)
- **Decided by:** project maintainer
- **Relates to:** Phase 6 plan, slice 6.6; platform DV-110 (viewing conditions), DV-111
  (entitlements after a lost slot), DV-064 and ADR-062 (the outbox); clients ADR-061
  (the phone's bearer session) and ADR-063 (an optional object)

## Context

A customer picks a night without knowing whether it will be clear, cannot queue for a
night someone else has taken, and rebooks a weather loss by hunting through the board.
Slice 6.6 fixes each of these with as little new surface as it can.

## Decision

### 1. A forecast on every slot, plainly a forecast

Each slot carries the forecast for the hours it touches: its cloud cover is the cloudiest
of those hours, and it is UNKNOWN when any of them has no forecast or only a stale one.
The platform fetches seven days of hourly forecast instead of two, so the whole board is
covered. The board shows it as **Forecast · 20% cloud** and never says "clear"; an unknown
hour says **No forecast yet**. It is advisory, exactly as tonight's conditions are: it
never sets or clears a weather hold, and it changes no price.

### 2. A waitlist for a taken slot

A slot somebody else holds can be waited for: **Join the waitlist**. One place per person
per slot, and at most three places at once. When the slot frees — a hold lapses, a booking
is cancelled — the first in line is offered it: the platform reserves it in their name for
**fifteen minutes**, on the best object up (ADR-063), and tells them. They pay from the
booking's page as with any reservation. If they do not, the hold lapses and the next in
line is offered it. A place ends when its slot starts, or when its holder leaves the list.
Only a slot that is taken can be waited for; a closed or weather-held one cannot.

### 3. One tap after a weather loss

A booking lost to the weather already earns a free replacement (DV-111). The board it
opens on offers **the next clear slot** — the first open slot in the coming week whose forecast is
known and at most 30% cloud — as one button. When there is none, it links to the board.

### 4. Push is deferred

Push on the phone (a device registry, a second outbox, a sender, store credentials) is
more machinery than this slice is worth today; the maintainer asked on 2026-10-23 for a
lean product. The waitlist offer goes by email, like every other notice, and the board
shows an offer to its holder whenever they look. Push is revisited when the app ships to
the stores.

### 5. Platform

Requested in `docs/platform-requests/weather-waitlist-and-push.md` (part A): `Slot.forecast`;
seven forecast days; the waitlist operations, its sweep and the offer email.

## Consequences

- The board reads the sky before the customer commits. A wrong forecast is still the
  weather's; the entitlement rules do not change.
- A freed slot goes to someone who asked for it, for fifteen minutes, then back to anyone.
- One new email, the waitlist offer.
