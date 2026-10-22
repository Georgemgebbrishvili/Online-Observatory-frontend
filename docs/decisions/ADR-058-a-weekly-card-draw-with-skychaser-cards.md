# ADR-058 — A Weekly Card Draw, in Skychaser's Cards

- **Date:** 2026-10-22
- **Status:** APPROVED
- **Decided by:** project maintainer, in session (direction: Skychaser's cards as they
  are; signed-in, once a week; three prizes)
- **Approved:** 2026-10-22, as written, with the odds in §4
- **Amends:** ADR-052 "What stays binding", its last rule; ADR-053 §2's "Skychaser's
  cards, rarities and card plates are not copied"; CLAUDE.md, Design and brand, the line
  "Skychaser's cards, capsules, rarities and wallet are its content, not ours."
- **Relates to:** ADR-007 and ADR-036 (observer seats), DV-112 (gift vouchers),
  ADR-037 (launch order)

## Context

On 2026-10-22 the maintainer asked for "a short number of cards as a game, so people
can get free telescope time or a visitor seat if revealed". Three rules stood in the
way: CLAUDE.md and ADR-052 keep Skychaser's cards and rarities off Stellar, and ADR-053
said the same of its card plates. The contract has no way to give anyone a free slot,
a free seat or a discount.

The maintainer was asked and chose: Skychaser's cards as they are, not a Stellar
redraw; one turn per signed-in, verified account per week; three prizes: a free
Observation Slot, a free observer seat, and a discount on a booking.

## Decision

### 1. Skychaser's card, its back and its reveal come across

`SkychaserCard` (front and back), `skychaser-card.css`, the reveal and the supernova
engine are ported from `~/Desktop/Skychaser/app` as they stand. Four rarities stay and
each names a prize:

| Rarity | Prize |
| --- | --- |
| Legendary | A free Observation Slot, the shortest length sold |
| Epic | A free observer seat on a live session (ADR-007) |
| Rare | A discount on one booking |
| Common | Nothing this week; the card shows a target |

Not copied, because they make this a product people pay into: capsules, packs,
editions, the wallet, buying or trading cards. **A card is never sold.** A game that
costs money to enter is a different legal product, and this record does not approve it.

The card faces carry Skychaser's target art. Every face carries "Illustration — not
telescope output" (CLAUDE.md, Design and brand). Georgian card text is never
uppercased or tracked.

### 2. The game

- Each week (Monday 00:00 to Sunday 23:59 in the observatory's zone, as the vote's week
  runs) a verified account is dealt **three face-down cards**. It turns one. The other
  two then turn face up, showing what they held.
- The platform decides the three cards when it deals them, before the pick. The choice
  is real, and the page never decides anything: it shows what the platform answers.
- One deal per account per week. Unverified accounts are refused with the existing
  `EMAIL_UNVERIFIED`.

### 3. Prizes are vouchers, bound to the account

Each prize is issued as a voucher that only the winner's account can redeem, through the
paths that already spend vouchers. It is never exchangeable for cash.

- **Free slot:** a DV-112 voucher at price 0, redeemed with `voucherCode` on
  `POST /bookings`, as a gift voucher is today.
- **Discount:** a percentage voucher, redeemed with `voucherCode` on `POST /bookings`.
  It reduces the price instead of paying it.
- **Observer seat:** a seat voucher, redeemed on `POST /missions/{id}/observer-pack`.
  The pack settles at no charge. The ten-seat cap (ADR-036) still applies.

A prize expires 30 days after it is won.

### 4. Odds and caps are the maintainer's, held on the platform

Starting values, approved 2026-10-22. The maintainer may change them on the platform
before production:

| Per card | Chance |
| --- | --- |
| Free slot | 1%, and at most 2 won per week across the observatory |
| Observer seat | 10% |
| Discount (20%) | 25% |
| Nothing | the rest |

When the week's free-slot cap is reached, a card that would have held one holds a
discount instead. Odds are published on the page and in the Terms.

### 5. Where it lives

`/app/cards`, reached from the signed-in home and the profile menu. ADR-057's header
does not change.

## Consequences

- Platform request `docs/platform-requests/weekly-card-draw.md`; built on the platform
  under its own `CLAUDE.md`, then `npm run contracts:sync` here.
- CLAUDE.md's Design and brand line, ADR-052's last binding rule and ADR-053 §2 are
  updated to point here.
- The cards appear on `/design-system` in every state before `/app/cards` uses them.
- The Terms gain a section on the draw: free to enter, no purchase needed, the odds,
  expiry, one account per person. **The maintainer checks the Georgian rules on prize
  promotions before the draw runs in production.**
- On the demo (the simulator), the page and its prizes carry the "Simulated" badge.

## Amendment — 2026-10-22: as built

`/app/cards` was built on the platform's ADR-060 contract. Four points differ from §1 and
§5 as written, and are recorded here rather than left in the code:

1. **No supernova reveal.** Skychaser's reveal and its supernova engine are built around
   a capsule cracking open, and capsules are excluded by §1. The card turns with the
   ported card's own flip; the picked card then glows in its rarity, with a burst for
   Legendary and Epic.
2. **A new face-down side.** Skychaser's card back is the card's own field notes, which
   would give the answer away before the pick. Face down, a card shows our mark on the
   same plate and rim, and nothing else.
3. **Faces.** A face shows the catalogue target the platform dealt (`targetSlug`), with
   Skychaser's painting of it where one exists (nine of the twelve Phase 1 targets;
   Mizar and Alcor take the Big Dipper's). Albireo, M27 and M15 take a plain face in
   their rarity's colour. Every turned card is captioned "Illustration — not telescope
   output".
4. **Type floor.** The ported stylesheet keeps Skychaser's sizes but raises every text
   floor to 13 px (CLAUDE.md), and drops tracking and capitals in Georgian.

Prizes are spent where §3 says: the booking board offers an unspent free-slot or discount
prize for the observatory (a free slot only on a slot of its own length), and the watch
page offers "Use my free seat" for an observer-seat prize. Besides the signed-in home,
the profile menu links to the page (§5).
