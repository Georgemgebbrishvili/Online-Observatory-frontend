# ADR-102 — The premium pass, every page

- **Date:** 2026-11-24
- **Status:** APPROVED (2026-11-24)
- **Decided by:** project maintainer (Nika), in session: "Now make everything ultra high
  quality, go all out."
- **Builds on:** `ADR-100` (the premium pass on the homepage). It lends that pass's glass and
  light to the rest of the site.
- **Keeps:** `ADR-056`'s rule that pages carry no title block: the sign-in pages, pricing,
  status and the legal pages gain no headline. Every honesty rule stands: the gift ticket is
  a ticket, not a picture of the sky, and repeats only what the page says beside it.
  `/observatory` and its console (`ADR-101`) are not touched.

## Decision

**Every panel catches the light** (`styles/light.css`, imported once from `globals.css`).
The plates (status, collection, legal, the signed-in home), the pricing plans and tonight's
times, the guide's points and closing call, the sign-in card, every empty state and the vote
cards take the homepage's glass: dark glass with a rim that is brightest at the top-left
and brightens under the pointer, a soft light inside where the pointer is, and on the plans,
guide points and vote cards a small lift on hover. `ambient-light.tsx` now lights all of
them, and gives each the pointer's position as a fraction (`--mx`, `--my`) for what leans
toward it.

- **The featured plan** (your own slot) has a lit edge that travels slowly round it.
- **Fields** glow softly when they take the cursor. Text selection and the scrollbar take
  the night's colours. The FAQ answers open to their height instead of jumping.
- **Empty states** lose the dashed box and the "○": an empty eyepiece is drawn instead, its
  ring graduated, turning very slowly.

**Gift a night** becomes a product page like `/pricing`: the price up front, the length
beside it, the lede, two checked facts and the button, and beside them a cream ticket with
a torn stub (`components/gift/gift-ticket.tsx`), printed on the session ticket's stock. It
leans toward the pointer, light crosses it, and it settles in on arrival. The ticket shows
the gift's length and price and a row of dots where the code will be; it is hidden from
assistive technology because the page says all of it.

**Tonight, with nothing live**, fills the width: the empty eyepiece large, the sentence,
and *Book a session* beside *See the whole sky now*, over a low horizon glow.

**Sign-in and the other account pages**: a large graduated ring turns slowly behind the
card, and the card rises into place. No sentence is added.

**Scroll reveal** (`components/layout/page-reveal.tsx`) on `/pricing`, `/gift` and `/vote`:
below the fold, panels rise into place one after another as they are scrolled to. Mounted
inside each page, so it runs only after the page has hydrated.

Every motion here is held still under reduced motion, and so under the visual gate.

## Consequences

- Visual baselines change for every page with a plate, a plan, an empty state or the
  sign-in card, and for `/gift`, `/tonight` and `/design-system`. They are taken from CI's
  own renders after the push, as ADR-100's are.
- The design system shows `GiftTicket` with a price and without one; the empty
  `StatePanel` specimen shows the drawn eyepiece.
- New tokens: `--font-size-ticket`, `--font-size-ticket-ka`, `--color-mask-keep`,
  `--gradient-ticket`, `--gradient-ticket-stub`, `--color-ticket-sheen`, `--filter-ticket`,
  `--gradient-ticket-floor`, `--color-featured-lead`, `--color-featured-tail`,
  `--shadow-field-focus`, `--color-selection`, `--color-scrollbar`.
- `reticle-turn` moves to `motion.css`, shared by the homepage, the ticket, the empty
  eyepiece and the sign-in ring.
