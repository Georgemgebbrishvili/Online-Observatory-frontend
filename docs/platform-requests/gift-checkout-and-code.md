# Platform request: pay for a gift on the sandbox, and show its buyer the code

Raised 2026-10-23 from Phase 6 slice 6.5 (`docs/plan/phase-6/README.md`, ADR-067).
Against `darkview-platform` at `960ba4135e41dc0535c1a9050cb82a8777c92e05`.

## What blocks

Gift vouchers exist (DV-112): `POST /gift-vouchers`, `GET /gift-vouchers`, and a
`voucherCode` on `POST /bookings`. Two gaps stop buy -> redeem -> book:

1. The voucher's payment intent has no `redirectUrl`, and the sandbox checkout refuses
   a `GIFT_VOUCHER` payment ("not a sandbox booking or seat payment"). Nothing can pay
   for a gift outside a signed provider callback.
2. The code reaches only an email, and the demo sends none. The buyer sees
   `codeLast4`, so there is nothing to print or hand over. A card prize already
   carries its full `code` to its owner while ACTIVE (ADR-060).

## Screens that need it

`/[locale]/gift` (buy), `/[locale]/gift/[voucherId]` (the paid gift: code, Print), and
the booking board's "Have a gift code?" field.

## Proposed shape

- `GiftVoucher.code: string | null` -- the full code, for its buyer, while ACTIVE;
  derived from `VOUCHER_CODE_SECRET` on each read, never stored, as `CardPrize.code`.
- `GiftVoucher.message: string | null` -- the buyer's note, for the printed card.
- `purchaseGiftVoucher` sets `redirectUrl` to the sandbox checkout, as bookings do.
- The sandbox checkout pays a `GIFT_VOUCHER` payment while the voucher is
  `PENDING_PAYMENT` (a gift holds nothing scarce, so no deadline), and returns the buyer
  to `/{locale}/gift/{voucherId}`.

No migration: both fields already exist on the row or derive from the secret.
