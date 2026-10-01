# Phase 3, slices 2 and 4 — reserve a slot, and the payment handoff

2026-09-30. From a slot on `/app/book` to a held booking and the provider's checkout,
and back to the booking's page (slice 3). Both blockers are answered: target visibility
for a slot in platform `392e773` (#151, `listSlotTargets`), the sandbox checkout in
`471f05a` (#149). Contract synced at `14ac895`; handlers traced in `darkview-platform`
at `f2f51db` (`features/booking/reserve.ts`, `features/payments/sandbox-checkout.ts`).

The two slices ship together: a reservation nobody can pay is the state the phase README
warned about.

## The flow

1. `/app/book?date=…` — each available slot is a link to
   `/app/book/reserve?startAt=…`.
2. `/app/book/reserve` — the slot again, and the targets it can deliver. The customer
   picks one and presses "Reserve and pay".
3. The browser sends `createBooking` with an `Idempotency-Key` minted once per visit to
   the page, so a retry after a timeout returns the first booking instead of holding a
   second slot.
4. The answer's `paymentIntent.redirectUrl` is followed as a full navigation. For
   SANDBOX it is `/api/payments/{id}/sandbox-checkout` on this origin, a page the
   platform serves standing in for the provider (ADR-033). The customer pays or declines
   there.
5. The platform answers 303 to `/{locale}/app/bookings/{bookingId}` (slice 3), which
   reads the booking: CONFIRMED, or CANCELLED after a decline.

A `paymentIntent` of null (a voucher or subscription minutes paid; not offered in this
slice) goes straight to the booking's page.

## Contract trace

| On screen                  | Source                                                                                                      |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| The slot                   | `listSlots` for the slot's night, the one whose `startAt` matches; a `startAt` it does not list is not found |
| Slot price, length         | `Slot.priceMinor`, `currency`, `durationMinutes`                                                             |
| Targets on offer           | `listSlotTargets` `GET /targets/visibility?observatoryId&startAt&durationMinutes` → `SlotTargetList`         |
| Which may be picked        | `visibility.observable` **and** `target.expectedMissionMinutes ≤ durationMinutes` (ADR-015 §2)               |
| Why the others cannot      | `visibility.blockReasons` (`VisibilityBlockReason`), or "Needs {n} min" for the length rule                  |
| Reserve                    | `createBooking` `POST /bookings` + `Idempotency-Key`; body `observatoryId, targetId, slotStartAt, durationMinutes, locale` |
| Checkout                   | `BookingWithPaymentIntent.paymentIntent.redirectUrl`, followed only when it is `https:`, or this origin     |
| Hold deadline              | `paymentIntent.expiresAt` — shown on the checkout page by the platform                                      |
| Back from checkout         | `/{locale}/app/bookings/{id}` (`bookingReturnUrl`), slice 3                                                   |
| Refusals                   | 409 `SLOT_UNAVAILABLE`, `WEATHER_HOLD`, `OBSERVATORY_OFFLINE`, `CONFLICT`; 422 `TARGET_NOT_OBSERVABLE`, `VALIDATION_FAILED`; 404 |

## States, en + ka

| State                    | Where it comes from                         | en                                                                        | ka                                                                          |
| ------------------------ | ------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Loading                  | `[locale]/loading.tsx`                      | shared                                                                    | shared                                                                      |
| Targets to pick          | at least one pickable                       | Choose what to observe                                                    | აირჩიეთ, რას დააკვირდებით                                                    |
| Nothing up in this slot  | none pickable                               | Nothing in the catalogue is up for the whole of this slot. Try another.   | ამ დროის განმავლობაში კატალოგიდან არცერთი ობიექტი არ ჩანს. სცადეთ სხვა დრო. |
| Not up, and why          | `blockReasons`                              | Below the horizon · Too low · Too close to the Moon · …                   | ჰორიზონტს ქვემოთაა · ძალიან დაბლაა · მთვარესთან ძალიან ახლოსაა · …          |
| Slot not offered         | no such slot, or `available: false`         | This slot cannot be booked. + Back to the night                           | ამ დროის დაჯავშნა შეუძლებელია. + ღამეზე დაბრუნება                          |
| Reserving                | the request in flight                       | Reserving                                                                 | იჯავშნება                                                                   |
| Going to payment         | the redirect                                | Opening the payment page                                                  | იხსნება გადახდის გვერდი                                                     |
| Slot just taken          | 409 `SLOT_UNAVAILABLE`, `CONFLICT`          | Somebody booked this slot a moment ago. Choose another.                   | ეს დრო ახლახან სხვამ დაჯავშნა. აირჩიეთ სხვა.                                |
| Weather hold / offline   | 409 `WEATHER_HOLD`, `OBSERVATORY_OFFLINE`   | the observatory's state                                                   | the observatory's state                                                     |
| Target set               | 422 `TARGET_NOT_OBSERVABLE`                 | That target is no longer up for this whole slot. Choose another.          | ეს ობიექტი მთელი ამ დროის განმავლობაში აღარ ჩანს. აირჩიეთ სხვა.            |
| Error                    | no answer, 500, 429, a body the schema refuses | Something went wrong. Try again. (same key: the retry is safe)         | რაღაც შეფერხდა. სცადეთ თავიდან.                                             |
| Simulated                | the observatory's `mode: SIMULATED`         | `/status`'s copy                                                          | `/status`'s copy                                                            |
| Unreachable              | a read fails                                | Observing times could not be loaded.                                      | დაკვირვების დროის ჩატვირთვა ვერ მოხერხდა.                                   |
| Signed out               | `requireUser`, or a 401 on reserving        | → sign-in                                                                 | → შესვლა                                                                    |

The fake platform serves `listSlotTargets`, `createBooking` with its idempotency, and a
stand-in checkout page that answers 303 to the booking, so the whole loop runs in e2e.

## Not in this slice

Vouchers, loyalty points and subscription minutes at checkout (Phase 5). Rescheduling a
lost slot, which reuses this page's target picker (next change).
