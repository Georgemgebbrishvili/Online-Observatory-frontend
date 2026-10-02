# Platform request: an Observer Pack can be paid at the sandbox checkout

Raised 2026-10-02 from Phase 4 slice 5 ([`phase-4/05-watch.md`](../plan/phase-4/05-watch.md),
roadmap A2). Against `darkview-platform` at `f2f51db` with #168 applied (`a95f73a`). Filed as [#170](https://github.com/Bekatsertsvadzee/Online-Observatory/issues/170).

## What blocks

The watch page sells a seat with `purchaseObserverPack` and follows
`paymentIntent.redirectUrl`, as the booking flow does. On the platform today nobody can
pay for one:

- `purchaseObserverPack` creates its `SANDBOX` payment without a `redirectUrl`
  (`apps/api/src/features/missions/observer-pack.ts`, the `payment.create` in
  `purchaseObserverPack`), so the intent it answers carries `redirectUrl: null`.
- The sandbox checkout (#149, `features/payments/sandbox-checkout.ts` `loadCheckout`)
  answers 409 to any payment whose `purpose` is not `BOOKING`, and its return address
  is always the booking's page (`bookingReturnUrl`).

So a seat is held for five minutes and lapses, `joinMissionAsObserver` answers 402 for
the whole session, and nobody but the owner can watch. A1 (watch, join, leave) works for
an observer who already holds a paid pack; A2 (a second account pays and joins) cannot
pass against the real platform.

## Screens that need it

`/{locale}/app/missions/{id}/watch`, the seat for sale and paying states.

## Proposed shape

No contract change; the contract already says the client follows `redirectUrl`.

- `purchaseObserverPack` gives its `SANDBOX` payment `redirectUrl: sandboxCheckoutUrl(paymentId)`,
  exactly as `createBooking` does.
- `loadCheckout` accepts `purpose: "OBSERVER_PACK"` as well. A pack is payable while it is
  `PENDING_PAYMENT` and its `holdExpiresAt` has not passed; settling it is
  `settlePayment`, which already handles the purpose.
- The checkout returns an Observer Pack to the watch page, built from `APP_URL`, the
  account's locale and the pack's mission, never from the request:
  `{APP_URL}/{locale}/app/missions/{missionId}/watch`.

## What the client does meanwhile

The watch page follows `redirectUrl` when there is one. When there is none it says seats
cannot be paid for yet and holds nothing further; it never shows a payment as made. After
a checkout it asks `joinMissionAsObserver` a bounded number of times while the answer is
402, then offers to check again.

The fake platform (`apps/web/e2e/fake-platform.mjs`) behaves as proposed here, so the
end-to-end tests exercise the flow the platform is asked to provide.
