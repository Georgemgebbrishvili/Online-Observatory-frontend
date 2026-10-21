# Platform request: say whether the booking confirmation was emailed

Raised 2026-10-20 while adding the post-payment state to the booking page. Revised
2026-10-21 after reading the delivery path.

## What blocks

After the sandbox checkout the customer lands on `/app/bookings/{bookingId}`, which shows
what happens next. It cannot say "the confirmation was emailed". The platform writes a
`BOOKING_CONFIRMED` row to its email outbox (`EmailNotification`, dedupe key
`booking-confirmed:{bookingId}`) when a payment settles, a voucher pays, or a lost slot is
replaced. Nothing in the contract tells a client what became of that row.

The realtime service sends the outbox only when `NOTIFICATION_WEBHOOK_URL` and
`NOTIFICATION_WEBHOOK_SECRET` are set. Without them the row stays PENDING for good: the
hosted demo is in that state. So PENDING cannot be read as "on its way", and the client
must only ever claim what has happened.

## Screen that needs it

`/app/bookings/{bookingId}` for a CONFIRMED booking: one line, "Confirmation emailed on
{date}", shown only when the email was sent. Nothing for any other state.

## Proposed shape

On `Booking`, an optional, read-only `confirmationEmail`, filled by `getBooking` only:

```yaml
confirmationEmail:
  description: |
    The BOOKING_CONFIRMED email's outbox state. Absent when no confirmation was queued
    (the booking is not CONFIRMED). QUEUED is not a promise of delivery: a deployment
    with no sender leaves it QUEUED.
  oneOf:
    - type: object
      additionalProperties: false
      required: [status, sentAt]
      properties:
        status: { type: string, enum: [QUEUED, SENT, FAILED, SKIPPED] }
        sentAt: { type: [string, "null"], format: date-time }
    - type: "null"
```

The address is not part of it: the outbox stores ids only, and reads the address at the
moment of sending. The client says when, not where.
