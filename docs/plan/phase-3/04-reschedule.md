# Phase 3 — a free slot for one that was lost

2026-10-01. A booking whose slot was lost to weather or an observatory fault carries an
OPEN entitlement: a refund (slice 3) or a free replacement slot, until
`entitlement.expiresAt`. This change offers the replacement, reusing slice 2's night and
target picker. Contract at `14ac895`; handler traced in `darkview-platform` at `f2f51db`
(`app/bookings/[bookingId]/reschedule/route.ts`, `features/booking/entitlement.ts`
`rescheduleMyBooking`). No platform request is needed.

## The flow

1. `/app/bookings/{id}` with an OPEN entitlement — "Choose a free slot" next to the
   refund, a link to `/app/book?reschedule={id}`.
2. `/app/book?reschedule={id}` — the booking's telescope, its nights; a slot is a link
   only when it is available and of the booking's length. Night links keep the parameter.
3. `/app/book/reserve?startAt=…&reschedule={id}` — the slot and its targets as in slice
   2, the lost booking's target chosen when it is offered, the price shown as free.
4. "Book this slot free" sends `rescheduleBooking` and goes to the new booking's page,
   which is CONFIRMED at once.

## Contract trace

| On screen                    | Source                                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| Whether a reschedule is open | `getBooking` → `entitlement.status === OPEN`; lapsing is the platform's to judge (409 `CONFLICT`)          |
| Which telescope              | `Booking.observatoryId` → `listBookableObservatories`; not the first-party default                         |
| Which slots                  | `listSlots` for that telescope; `available` and `durationMinutes === Booking.durationMinutes` (handler 422s otherwise) |
| Targets                      | `listSlotTargets`, same rules as slice 2                                                                  |
| Preselected target           | `Booking.targetId`, when it is among the offered                                                          |
| Price                        | free: the handler creates the booking at `priceMinor: 0`                                                  |
| Book                         | `rescheduleBooking` `POST /bookings/{id}/reschedule` `{ slotStartAt, targetId }` → 201 `Booking`          |
| Afterwards                   | the new `Booking.id` → `/app/bookings/{id}`; the old one reads `RESCHEDULED` → `rescheduledBookingId`     |
| Refusals                     | 409 `CONFLICT` (no open entitlement), `SLOT_UNAVAILABLE`, `WEATHER_HOLD`, `OBSERVATORY_OFFLINE`; 422 `TARGET_NOT_OBSERVABLE`, `VALIDATION_FAILED`; 404 |

`rescheduleBooking` takes no `Idempotency-Key`. A retry cannot double-book: the
entitlement is claimed conditionally, so a second request is 409 `CONFLICT`. That answer
sends the customer to the lost booking's page, which then shows what became of it.

## States, en + ka

| State                    | Where it comes from                                   | en                                                              | ka                                                                    |
| ------------------------ | ----------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------- |
| Offer                    | OPEN entitlement on the booking page                  | Choose a free slot                                              | აირჩიეთ უფასო დრო                                                     |
| Lost slot notice         | OPEN entitlement; slice 3's, now naming both          | … You can take a refund or a free slot until {date}.            | … {date}-მდე შეგიძლიათ დაიბრუნოთ თანხა ან აირჩიოთ უფასო დრო.          |
| Replacing                | `reschedule` on `/app/book` and the reserve page      | Choosing a free slot to replace the one that was lost.          | ირჩევთ უფასო დროს დაკარგულის ნაცვლად.                                 |
| Free                     | the price on the reserve page                         | Free                                                            | უფასო                                                                 |
| Book                     | the button                                            | Book this slot free                                             | ამ დროის უფასოდ დაჯავშნა                                              |
| Booking                  | the request in flight                                 | Booking                                                         | იჯავშნება                                                             |
| Not open any more        | no OPEN entitlement, a booking not found, or 409 `CONFLICT` | This booking has no free slot to claim. → the booking      | ამ ჯავშანზე უფასო დრო აღარ არის. → ჯავშანი                            |
| Slot just taken, weather, offline, target set | as slice 2                       | slice 2's copy                                                  | slice 2's copy                                                        |
| Error                    | no answer, 500, 429                                   | slice 2's copy                                                  | slice 2's copy                                                        |
| Simulated, unreachable, signed out | as slice 2                                  | slice 2's copy                                                  | slice 2's copy                                                        |

The fake platform serves `rescheduleBooking` against its booking lost to the weather.
