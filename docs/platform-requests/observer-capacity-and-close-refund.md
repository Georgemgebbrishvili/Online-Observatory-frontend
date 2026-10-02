# Platform request: ten observer seats, and a refund when the owner closes

Raised 2026-10-02 from Phase 4 slice 4 (`docs/plan/phase-4/04-sharing.md`), under
[ADR-036](../decisions/ADR-036-ten-observers-and-a-refund-for-the-time-a-close-takes.md).
Against `darkview-platform` at `f2f51db`. Filed as [#167](https://github.com/Bekatsertsvadzee/Online-Observatory/issues/167);
built in pull request #168 (`eccf334`), not yet merged. Reading the refund back is
[`observer-refund-read.md`](observer-refund-read.md) (#169).

## What blocks

- **Capacity.** The contract caps `Mission.observerCapacity` at `maximum: 5` with a
  `default: 5`. The database enforces the same cap (`Mission_observer_capacity_within_adr007`,
  migration `20260907170000_dv100_observer_seats`), and `MAX_OBSERVER_CAPACITY = 5` in
  `apps/api/src/features/missions/observers.ts`. ADR-036 sets ten.
- **Refund.** `setMissionObservation` with `observable: false` marks every attached seat
  `LEFT` and gives nothing back. ADR-036 refunds each paid seat the time it loses.
  `packages/db/refunds.ts` refunds whole payments only.

## Screens that need it

The owner's close confirmation in the live room (slice 4), which today can only say
that anyone watching is removed. And slice 5's watch page, which has to tell an observer
that the session was closed and what they get back.

## Proposed shape

- `Mission.observerCapacity`: `maximum: 10`, `default: 10`. A migration replaces the
  CHECK, and `MAX_OBSERVER_CAPACITY` becomes 10.
- On close, in the same transaction that marks the seats `LEFT`, each seat whose
  `ObserverPack` payment is `CAPTURED` gets
  `ceil(priceMinor × (expiresAt − closedAt) ÷ (expiresAt − paidAt))`, at most
  `priceMinor`. Sandbox payments are refunded. Any other provider's refund is recorded as
  owed, as DV-111 does today.
- `ObserverPack` gains `refundedMinor` (integer, minor units, null until a refund). The
  platform decides whether `PaymentStatus` needs a partial-refund value or a refund row
  of its own. The client reads only `refundedMinor`.
- An email to each refunded observer, alongside the existing refund notifications.

## Until then

The client confirms every close, so a stale observer count never skips the warning, and
promises no refund.
