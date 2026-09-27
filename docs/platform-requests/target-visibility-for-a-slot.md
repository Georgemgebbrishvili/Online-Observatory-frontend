# Platform request: which targets a slot can actually deliver

Raised 2026-09-26 from Phase 3 (`docs/plan/phase-3/README.md`). Against
`darkview-platform` at `acca64803fe81c9a6c9ef9fe3b562b7537edcbd5`.

## What blocks

The booking flow is: choose a slot, then choose a target for it. The client can filter
targets by length (`expectedMissionMinutes ≤ durationMinutes`, ADR-015 §2), but not by
whether the target is **up** during that slot.

- `createBooking` checks the slot, the length and the observatory's state
  (`features/booking/reserve.ts:335-385`). It does not check the target's altitude,
  horizon or Sun separation at `slotStartAt`, so it accepts Saturn for a slot after
  Saturn has set.
- `listTonightTargets` evaluates visibility at the moment of the request
  (`TargetVisibility.evaluatedAt`), for tonight only. It says nothing about a slot at
  23:30, or about any other night.
- No operation takes a target and an instant, or a slot, and answers "observable".

A customer would pay for a mission that ends `NOT_VISIBLE` before it starts. ADR-015's
own rule — "a customer never sees a target the slot cannot deliver" — cannot be kept by
the client alone.

## Screens that need it

Phase 3 slice 2, the target step after `/app/book`. Slice 1 (the slot list) does not
depend on it.

## Proposed shape

Either, platform's choice — the first is the smaller change:

1. **`GET /slots` takes an optional `targetId`.** With it, each `Slot` whose target is
   not observable across the slot is `available: false` with a new
   `SlotUnavailableReason`, `TARGET_NOT_VISIBLE`. The client then asks for the target
   first and the time second, which is also the order `/app/missions/[slug]` already
   leads into ("Book an observation").
2. **`GET /targets/visibility?observatoryId&startAt&durationMinutes`**, answering the
   `TonightTargetList` shape evaluated across that interval.

And in both cases **`createBooking` refuses a target that is not observable across the
slot** — 422, `VALIDATION_FAILED` — so the rule is enforced where the money is taken,
not only where the list is drawn.
