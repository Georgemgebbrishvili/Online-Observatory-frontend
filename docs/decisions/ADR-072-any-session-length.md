# ADR-072 — A Session of Any Quarter Hour, from 15 Minutes to 4 Hours

- **Date:** 2026-10-23
- **Status:** APPROVED (maintainer, in session, 2026-10-23: "make it so like any timeframe
  can be choosen from 15 minutes to 4 hours", priced at the same rate per minute)
- **Decided by:** project maintainer
- **Relates to:** ADR-053 §7 (the booking board), ADR-063 (quarter-hour starts and an
  optional object), ADR-068 (forecast and waitlist); platform DV-052, DV-054, DV-066

## Context

The board sold one length, 30 minutes, because the platform generated only 30-minute
slots (`SLOT_DURATION_MINUTES`) and refused any other length. The maintainer wants a
customer to choose how long they have the telescope: a quarter hour, half an hour, 45
minutes, an hour, or longer.

## Decision

1. **Any quarter hour from 15 minutes to 4 hours.** `GET /slots` takes an optional
   `durationMinutes` (15 to 240, a multiple of 15; 30 when omitted) and returns slots of
   that length; `POST /bookings` and `POST /waitlist` accept the same range. A start is
   offered only where the whole session and its 10-minute turnaround fit inside darkness,
   the hours the observatory is available, and clear of held bookings. Starts stay on the
   quarter-hour grid.
2. **The same rate per minute.** A session costs the default length's price per minute:
   150 tetri a minute while 30 minutes is 45.00 GEL (15 minutes 22.50, 1 hour 90.00,
   4 hours 360.00). Tier discounts and discount prizes apply as before. A gift voucher or
   a free-slot prize pays only for the length it was issued for, which is 30 minutes.
3. **Targets still have to fit.** A target whose `expectedMissionMinutes` exceeds the
   session is never offered for it, so a short session cannot sell M13.
4. **On the board** the length is a row of quick lengths (15 min, 30 min, 45 min, 1 h,
   1 h 30 min, 2 h, 3 h, 4 h) and a stepper that reaches every quarter hour between. The
   length lives in the address (`/app/book?length=60`), so the server reads that length's
   slots and the back button keeps it. A replacement for a lost slot keeps its booking's
   own length and shows no picker.
5. **The object picker** opens with a "Best in the sky" tile, chosen until an object is;
   the objects are quiet tiles (art, name, one line), and once a start is chosen the ones
   that can be booked for it come first.

## Consequences

- One platform change (`apps/api/src/lib/slots/generate.ts`, the `GET /slots` route,
  reservation and waitlist validation) and a contract update; the client syncs it.
- Longer sessions take more of the night per customer; the price per minute is unchanged.
- The prices remain the platform's provisional ones (DV-054 note) until the maintainer
  sets real ones.
