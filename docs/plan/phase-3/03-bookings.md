# Phase 3, slice 3 — `/app/bookings`, `/app/bookings/[id]`

2026-09-30. The customer's bookings, one booking, and what can be done with it. Contract
synced at `14ac895`; handlers traced in `darkview-platform` at `f2f51db`
(`features/booking/manage.ts`, `features/booking/entitlement.ts`,
`features/payments/sandbox-checkout.ts`).

`/app/bookings/[id]` is also where the sandbox checkout returns the customer
(`bookingReturnUrl`, `/{locale}/app/bookings/{bookingId}`), so it lands before slice 2's
reserve step sends anyone there.

## Contract trace

| On screen                        | Source                                                                                                    |
| -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| The list, latest slot first      | `listBookings` `GET /bookings` → `BookingPage`; ordered by `slotStartAt` desc on the platform              |
| Older bookings                   | `?cursor=` → `page.nextCursor`; an unknown cursor is an empty page, not an error                          |
| Slot time                        | `Booking.slotStartAt` + `durationMinutes`, in the observatory's zone (`BookableObservatory.timezone`)      |
| Observatory                      | `Booking.observatoryId` → `listBookableObservatories`                                                     |
| Target                           | `Booking.targetId` → `listTargets` (enabled only); a target not in it is named "A target no longer offered" |
| Status                           | `Booking.status`: `PENDING_PAYMENT`, `CONFIRMED`, `CANCELLED`, `EXPIRED`, `REFUNDED`                      |
| Price paid                       | `priceMinor` in `currency`; `tierDiscountMinor`, `loyaltyPointsRedeemed`, `subscriptionMinutesSpent` when non-zero |
| The observation                  | `Booking.missionId` → `/app/missions/{missionId}/session` (the room, ADR-018)                              |
| One booking                      | `getBooking` `GET /bookings/{id}`; 404 for one that is not the caller's                                   |
| Continue to payment, held until  | `Booking.paymentIntent` (ADR-043): `redirectUrl` followed as the reserve step follows it; `expiresAt` the hold's deadline. A past deadline offers nothing |
| Cancel                           | `cancelBooking` `POST /bookings/{id}/cancel`; only `PENDING_PAYMENT` — 409 otherwise                      |
| Paid, cannot cancel              | `CONFIRMED`: a stated rule (`manage.ts`, maintainer decision of 2026-09-14), not a control                |
| Lost slot                        | `entitlement` `OPEN`: `cause`, `minutesLost`, `expiresAt`                                                 |
| Refund                           | `refundBooking` `POST /bookings/{id}/refund`; 503 when the provider has no refund integration              |
| Free new slot                    | `rescheduleBooking` — its own change, after this one                                                      |
| Rescheduled / refunded           | `entitlement.status` `RESCHEDULED` → `rescheduledBookingId`; `REFUNDED`                                   |

## States, en + ka

| State                    | Where it comes from                         | en                                                                   | ka                                                                      |
| ------------------------ | ------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Loading                  | `[locale]/loading.tsx`                      | shared                                                               | shared                                                                  |
| No bookings              | `items: []`, no cursor                      | You have no bookings yet. + Book a slot                              | ჯავშნები ჯერ არ გაქვთ. + დაჯავშნეთ დრო                                   |
| No more                  | `items: []` with a cursor                   | No older bookings.                                                   | უფრო ძველი ჯავშნები არ არის.                                           |
| Unreachable              | any failure, or a body the schema refuses   | Your bookings could not be loaded. Try again shortly.                | ჯავშნების ჩატვირთვა ვერ მოხერხდა. სცადეთ ცოტა ხანში.                    |
| Not found                | 404                                         | the app's not-found page                                             | the app's not-found page                                                |
| Awaiting payment         | `PENDING_PAYMENT`, `paymentIntent` present  | Awaiting payment. Held for you until {time}. + Continue to payment                 | გადახდას ელოდება. დრო შენთვის დაკავებულია {time}-მდე. + გადახდის გაგრძელება            |
| Hold lapsed, not yet swept | `PENDING_PAYMENT`, `expiresAt` past       | The hold has ended, and the slot is no longer held for you.                        | ვადა ამოიწურა და დრო შენთვის აღარ არის დაკავებული.                                     |
| Confirmed                | `CONFIRMED`                                 | Confirmed. + Open the observation                                    | დადასტურებულია. + დაკვირვების გახსნა                                    |
| Cannot cancel a paid one | `CONFIRMED`                                 | A paid booking cannot be cancelled until refunds are available.      | გადახდილი ჯავშნის გაუქმება შეუძლებელია, სანამ თანხის დაბრუნება არ ამოქმედდება. |
| Cancelled                | `CANCELLED`                                 | Cancelled. The slot has been released.                               | გაუქმებულია. დრო გათავისუფლდა.                                          |
| Expired                  | `EXPIRED`                                   | The hold lapsed before payment. The slot has been released.          | გადახდამდე ვადა ამოიწურა. დრო გათავისუფლდა.                             |
| Refunded                 | `REFUNDED`                                  | Refunded.                                                            | თანხა დაბრუნებულია.                                                     |
| Lost slot                | `entitlement.status: OPEN`                  | {minutes} minutes were lost to {weather / an observatory fault}. Take a refund until {date}. | {minutes} წუთი დაიკარგა {ამინდის / ობსერვატორიის ხარვეზის} გამო. თანხის დაბრუნება შესაძლებელია {date}-მდე. |
| Cancelling / refunding   | the request in flight                       | Cancelling · Refunding                                               | უქმდება · ბრუნდება                                                      |
| Refused                  | 409, or 503 on refund                       | The platform's reason                                                | the platform's reason                                                   |
| Simulated                | the observatory's `mode: SIMULATED`         | `/status`'s copy                                                     | `/status`'s copy                                                        |
| Signed out               | `requireUser`                               | → sign-in                                                            | → შესვლა                                                                |

## Found while tracing

**A held booking could not be paid from its page.** `Booking` carried `paymentId`, not
the intent: `redirectUrl` and the hold's `expiresAt` arrived only in `createBooking`'s
answer. Raised as
[`booking-payment-intent.md`](../../platform-requests/booking-payment-intent.md), answered
by platform ADR-043 (#176) with `Booking.paymentIntent`, and built on 2026-10-07. The
page never builds a checkout URL from the payment id: that would hard-code the sandbox
provider's path in the client.
