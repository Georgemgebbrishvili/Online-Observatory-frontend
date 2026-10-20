# Platform request: say whether the booking confirmation was emailed

Raised 2026-10-20 while adding the post-payment state to the booking page.

## What blocks

After the sandbox checkout the customer lands on `/app/bookings/{bookingId}`, which now
shows what happens next. It cannot say "a confirmation was sent to you@example.com".
The platform queues a `BOOKING_CONFIRMED` row in its email outbox when a payment
settles, but nothing in the contract tells a client whether that email went out, is
waiting, or will never go because the deployment has no email sender (the hosted demo
has none). Saying "sent" from the client would be false on the demo, so the line is
left out.

## Screen that needs it

`/app/bookings/{bookingId}` for a CONFIRMED booking: one line under the facts,
"Confirmation sent to {email}" or "Confirmation on its way to {email}". Later, the
observer seat after its checkout, on the watch page.

## Proposed shape

On `Booking`, an optional, read-only `confirmationEmail`:

```yaml
confirmationEmail:
  type: object
  required: [status, to]
  properties:
    status: { type: string, enum: [QUEUED, SENT, FAILED, NOT_SENT] }
    to: { type: string, format: email }
    sentAt: { type: string, format: date-time }
```

`NOT_SENT` is a deployment with no sender. Absent means the booking is not CONFIRMED.
`to` is the address at the time of queuing, so a later email change does not rewrite it.
