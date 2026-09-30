# Platform request: a held booking's payment intent, readable again

Raised 2026-09-30 while tracing Phase 3 slice 3 (`/app/bookings/[id]`). Against
`darkview-platform` at `f2f51db` (contract synced at `14ac895`).

## What blocks

`createBooking` answers `BookingWithPaymentIntent`, and that answer is the only place the
client ever sees the intent's `redirectUrl` and `expiresAt` (the hold's deadline). `Booking`
carries `paymentId` only, and no operation reads a payment.

A customer who reserves a slot, leaves the checkout before answering it, and comes back to
`/app/bookings/{id}` sees a `PENDING_PAYMENT` booking they cannot pay and whose hold they
cannot see the end of. They can cancel it or wait for it to lapse. Retrying
`createBooking` with the original `Idempotency-Key` would return the intent, but that key
lives only in the tab that made the booking.

The client will not build the checkout URL from `paymentId`: that path is the sandbox
provider's, and a real provider's `redirectUrl` is its own.

## Proposed shape

Either of:

- `Booking.paymentIntent`: the same `PaymentIntent | null` `createBooking` returns, present
  while the booking is `PENDING_PAYMENT` and null otherwise; or
- `Booking.holdExpiresAt` plus `GET /bookings/{bookingId}/payment-intent` → `PaymentIntent`,
  404 when the booking is not `PENDING_PAYMENT`.

The first is one read for the page and needs no new operation.

## Screen that needs it

`/[locale]/app/bookings/[id]` in the `PENDING_PAYMENT` state (`docs/plan/phase-3/03-bookings.md`):
"Continue to payment" and "Held until {time}". Until then the page offers Cancel only.
