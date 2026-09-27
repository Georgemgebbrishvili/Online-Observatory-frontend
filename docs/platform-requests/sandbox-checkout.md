# Platform request: a sandbox checkout the customer can complete

Raised 2026-09-26 from Phase 3 (`docs/plan/phase-3/README.md`). Against
`darkview-platform` at `acca64803fe81c9a6c9ef9fe3b562b7537edcbd5`.

## What blocks

`createBooking` answers with a `PaymentIntent` whose `redirectUrl` is null: the `SANDBOX`
payment is created without one (`apps/api/src/features/booking/reserve.ts:476-484`).
The sandbox settles only when `POST /payments/webhook` receives a callback signed with
the provider secret (`features/payments/provider.ts`). The web client holds no secret
(`CLAUDE.md`, "Repository boundary") and cannot sign one.

So on every environment today a reserved slot stays `PENDING_PAYMENT` until the hold
expires. No customer can reach `CONFIRMED` by paying, and nothing after it — the booked
mission, ADR-018's start — can be exercised through the product.

## Screens that need it

The checkout step after `/app/book` (Phase 3 slice 4), and everything that follows a
confirmed booking.

## Proposed shape

No contract change. The contract already says `redirectUrl` "is supplied by the
provider". For `SANDBOX`, the platform supplies one: a page it serves itself that
offers "Pay" and "Fail", posts the signed callback server-side, and redirects back to a
return URL on this app. Something like
`{API_ORIGIN}/sandbox/checkout/{paymentId}?return={APP_URL}/{locale}/app/bookings/{bookingId}`.

- Never reachable where `SANDBOX` is not selectable (production), as the
  `PaymentProvider` description already requires.
- The return URL is fixed to this app's origin (`APP_URL`), never taken from the
  request, so it cannot be used as an open redirect.

The client then treats `SANDBOX` and `BOG_IPAY` the same way: follow `redirectUrl`, come
back, read the booking.

## What the client does meanwhile

Slices 1–3 (slots, reserve, manage) do not depend on this. After a reservation the
booking page says payment is not yet available and shows the hold's `expiresAt`; it
does not pretend a payment happened.
