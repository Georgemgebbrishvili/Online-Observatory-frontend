# Platform request: the weekly card draw

Raised 2026-10-22 under
[ADR-058](../decisions/ADR-058-a-weekly-card-draw-with-skychaser-cards.md). **Built** on the
platform as its ADR-060 (42c4743, 2026-10-22), synced here in 5598ebf.

## What blocks

`/app/cards` deals a signed-in customer three face-down cards a week. One can hold a
free Observation Slot, a free observer seat or a discount. Nothing in the contract
deals cards, holds a week's deal, issues a prize or redeems a percentage or seat
voucher. The outcome must be decided on the platform: a page that decides a prize is a
prize anyone can take.

## Screens that need it

- `/app/cards`: the week's three cards, face down or turned; the prize won; when the
  next deal opens; the published odds.
- `/app/book/reserve`: a prize voucher offered at checkout (existing `voucherCode`).
- The observer seat flow on `/app/missions/[id]/watch`: a seat voucher offered in place
  of paying.
- `/app/profile`: the customer's unspent prizes and their expiry.

## Proposed shape

- `GET /card-draws/current` (session). Answers the caller's deal for the current week,
  creating it on first call:
  `{ week, opensNextAt, cards: [{ position: 0|1|2, turned: boolean, rarity: Rarity | null, targetSlug: string | null, prize: Prize | null }], picked: 0|1|2 | null, odds: [{ rarity, chance }] }`.
  An unturned card's `rarity`, `targetSlug` and `prize` are null, so the response never
  gives the answer away. 403 `EMAIL_UNVERIFIED` for an unverified account.
- `POST /card-draws/current/pick` (session, mutation). `{ position }`. Turns that card
  and the other two, and issues the picked card's prize in the same transaction.
  Answers the same body as `GET`. 409 `ALREADY_PICKED` on a second pick that week.
  Idempotent on `Idempotency-Key`.
- `Rarity`: `LEGENDARY | EPIC | RARE | COMMON`.
- `Prize`: `{ kind: FREE_SLOT | OBSERVER_SEAT | DISCOUNT, voucherCode, codeLast4, durationMinutes | null, percentOff | null, expiresAt }`.
  Null for COMMON.
- `GET /prizes` (session). The caller's prizes, newest first, with status
  `ACTIVE | REDEEMED | EXPIRED`.
- `POST /bookings` `voucherCode` also accepts a DISCOUNT code (reduces the price; the
  booking still pays) and a FREE_SLOT code (as a gift voucher does). A code belonging
  to another account is 422, worded as for an unknown code.
- `POST /missions/{id}/observer-pack` gains an optional `voucherCode` for an
  OBSERVER_SEAT code: the pack settles at no charge, and `paymentIntent` is null. The
  ADR-036 cap and refund rules are unchanged.

## Rules held on the platform

- The three cards are drawn when the deal is created, from odds and caps held in
  config, not in code: free slot 1% with at most 2 a week per observatory, observer
  seat 10%, discount 20% off at 25%, nothing for the rest (ADR-058 §4, proposed). When
  the week's free-slot cap is spent, a free slot drawn becomes a discount.
- One deal per account per week, in the observatory's zone, Monday to Sunday.
- Prizes are bound to the account, expire 30 days after issue, and are never paid out
  in cash. A refunded booking a prize paid for restores the prize, as DV-111 does for
  gift vouchers.
- Each deal and pick is written to the audit trail.
