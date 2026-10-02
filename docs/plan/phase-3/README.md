# Phase 3 — Booking, sliced

2026-09-26. Traced against `darkview-platform` at
`acca64803fe81c9a6c9ef9fe3b562b7537edcbd5`.

| Slice | Surface                                       | Operations                                                          |
| ----- | --------------------------------------------- | ------------------------------------------------------------------- |
| 1     | `/app/book` — slots for a night               | `listBookableObservatories`, `listSlots`                            |
| 2     | Reserve — target for the slot, then hold it   | `createBooking` (with `Idempotency-Key`) — done, `820207f`          |
| 3     | `/app/bookings`, `/app/bookings/[id]`         | `listBookings`, `getBooking`, `cancelBooking`, `rescheduleBooking`  |
| 4     | Payment handoff                               | `PaymentIntent.redirectUrl` — done, `820207f`                       |
| 5     | Start the booked mission (ADR-018)            | `startMissionSession` — the handoff into Phase 4                    |

Refunds, loyalty points, vouchers and subscription minutes are Phase 5 (commerce), which
the plan lets overlap Phase 3. Slice 2 sends none of them.

## Found while tracing

**No payment can complete from the client.** `createBooking` opens a `SANDBOX` payment
(`features/booking/reserve.ts:476`) whose `redirectUrl` is never set, so the intent
comes back with `redirectUrl: null`. The sandbox settles only through
`receivePaymentWebhook`, which is signed with a secret this repository must never hold.
A customer can reserve a slot and then watch the hold expire. Raised as
[`sandbox-checkout.md`](../../platform-requests/sandbox-checkout.md). Slices 1–3 do not
depend on it; slice 4 does.

**No way to know whether a target is up during a slot.** `createBooking` checks length
and slot, never the target's altitude at `slotStartAt` (`features/booking/reserve.ts:335-385`),
and no operation answers visibility for an instant other than now. Offering targets by
length alone would sell missions that end `NOT_VISIBLE`. Raised as
[`target-visibility-for-a-slot.md`](../../platform-requests/target-visibility-for-a-slot.md);
slice 2 waits for it.

**One slot length, not two.** ADR-015 §2 names twenty and sixty minutes, both
provisional. The platform sells one, thirty (`lib/slots/generate.ts:19`,
`SLOT_DURATION_MINUTES`). The client shows `Slot.durationMinutes` as the platform sends
it and filters targets by it (`expectedMissionMinutes ≤ durationMinutes`), so it follows
whatever the platform decides without a change here. Not a client decision; recorded so
nobody builds a length picker the platform cannot fill.

**A paid booking cannot be cancelled.** `cancelMyBooking` refuses a CONFIRMED booking
with 409 until refunds exist (`features/booking/manage.ts:77`, maintainer decision of
2026-09-14). Slice 3 shows that as a stated rule, not an error.

**Done when** (from the plan): a customer books, sees it, changes it and cancels it, in
both languages, on a phone. Both requests were answered (platform #154, #157) and slices
2 and 4 shipped in `820207f`; the reschedule followed in `d9c20df`. What remains is
resuming a pending payment, blocked on
[`booking-payment-intent.md`](../../platform-requests/booking-payment-intent.md)
(roadmap slice C3).
