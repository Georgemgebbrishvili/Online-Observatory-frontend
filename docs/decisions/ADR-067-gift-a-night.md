# ADR-067 — Gift a Night

- **Date:** 2026-10-23
- **Status:** APPROVED (maintainer's standing approval for Phase 6 scope records, given
  2026-10-23; open to revision on review)
- **Decided by:** project maintainer
- **Relates to:** Phase 6 plan, slice 6.5; platform DV-112 (gift vouchers) and DV-111
  (refunds restore a voucher); clients ADR-058 and platform ADR-060 (card-draw prizes);
  platform ADR-062 (the email outbox)

## Context

Somebody wants to give a night at the telescope. The platform has sold gift vouchers since
DV-112 — a code that pays for one booking — but no screen sells one, the sandbox
checkout cannot take its payment, and its code reaches the recipient only by email, which
the demo does not send yet. Slice 6.5 makes buy → redeem → book work.

## Decision

### 1. A gift is one session, not an amount

A gift pays for one observation of the length slots are sold at (30 minutes today), at
the slot price. No amounts: a balance that is spent in parts is stored value, with its own
accounting and law, and nothing in Phase 1 needs it.

### 2. Twelve months, no cash

A gift is valid for twelve months from payment. It is not exchangeable for cash. If the
booking a gift paid for is cancelled or refunded, the gift comes back, with at least thirty
days left (DV-111). A refund of the gift itself is a request to us, under the refunds page,
like any other.

### 3. The buyer

`/[locale]/gift`, signed in: who it is for (a name and an email address, both optional),
a note of up to 500 characters, then the checkout. After paying, the buyer lands on
`/[locale]/gift/[voucherId]`: the code in full, how long it lasts, and **Print**, a
print-ready card (the browser saves it as PDF). The gift page lists every gift they bought,
with its state. The full code is shown only while the gift can be spent.

### 4. The recipient

They receive the code from the buyer, printed or passed on, or by email once an email
sender is configured (the buyer's name and note come with it). On the booking board they
enter it in **Have a gift code?**; the booking then costs nothing. They need an account to
book, as everybody does.

### 5. The same machinery as card prizes

A gift code is derived, hashed and shown by its last four characters exactly as a card
prize's is (platform ADR-060), and a booking takes at most one price reduction, so a gift
and a prize never stack. A prize the customer holds is still offered on the board as
before; a typed gift code takes its place.

### 6. Phone

The app's Book tab hands over to the website, so a gift is redeemed there. The app sells
nothing.

### 7. Platform

Requested in `docs/platform-requests/gift-checkout-and-code.md`: `GiftVoucher.code` (the
full code, for its buyer, while ACTIVE; never stored) and `GiftVoucher.message`; the gift's
payment intent redirects to the sandbox checkout, which pays it and returns the buyer to
the gift's page. No migration.

## Consequences

- A gift can be bought and spent end to end on the sandbox; real money waits for the real
  payment adapter, as every sale does.
- Whoever holds a code can spend it. That is what a gift card is; the code is long, and a
  wrong one is refused with the same answer as a spent one.
