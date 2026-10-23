# Platform request: a session of any quarter hour, 15 minutes to 4 hours (ADR-072)

**Screen:** the booking board, `/app/book` (`components/booking/booking-board.tsx`).

**Needs:** the customer chooses how long they have the telescope. Today `GET /slots`
returns only 30-minute slots and `POST /bookings` refuses any other length
("Slots are 30 minutes.").

**Proposed contract:**

- `GET /slots` gains an optional query `durationMinutes` (integer, 15 to 240, a multiple
  of 15, default 30). Every slot returned has that `durationMinutes`, its `endAt`, and a
  `priceMinor` at the default length's rate per minute (150 tetri a minute while 30
  minutes is 4500). Availability counts the whole session plus the turnaround against
  held bookings and waitlist offers.
- `CreateBookingRequest.durationMinutes` and `JoinWaitlistRequest.durationMinutes`:
  15 to 240, a multiple of 15. A start is accepted when `GET /slots` would offer it for
  that length.
- Unchanged: gift vouchers and free-slot prizes pay only for the length they were issued
  for; `GET /targets/visibility` already takes `durationMinutes`.

**Blocks:** the length picker on the board; without it the board can only sell 30 minutes.

**Built on:** `darkview-platform` branch `feat/any-session-length`.
