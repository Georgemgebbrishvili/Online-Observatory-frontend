# ADR-110: The night on the app pages, and no numbered headings

- **Status:** Accepted
- **Date:** 2026-11-27
- **Decided by:** the maintainer, in session, on screenshots of `/app/bookings`, `/app/cards`
  and `/app/book`: "make visuals more Cosmic, efficient and better allocated, with more
  content on main screens", and "get rid of the numberings next to headers on all pages".
- **Amends:** ADR-108 (a plain surface) for the panels named below; ADR-074 (the board's
  numbered steps); ADR-058 (the card's "No." line and its caption per card)

## Decision

**No heading carries a number.** The board's 01/02/03 steps, the weekly card's "No. 01",
the page guides' step numbers, the homepage's tonight list numbers and the legal pages'
section and contents numbers are removed.

**The app pages show the night.** Panels on `/app/book`, `/app/bookings` and `/app/cards` are
a piece of the night sky: blue-black at the top falling to the page's dark, with the
site's star tile in them. ADR-108 still holds: no glow under buttons or behind cards, no
horizon, sheen or rings, flat buttons.

1. **The booking board** is as wide as the header and fits one laptop screen: the nights
   strip, then the night's quarter hours (two hours side by side where the panel has room),
   the objects in a column beside them, and the ticket. A **night band** above the grid
   draws the chosen night from sunset to sunrise — twilight either side of the dark the
   slots are sold in, the stretches with the Moon up, the hours, and the chosen session —
   from the same astronomy the board already computes (`features/booking/night-sky.ts`).
2. **Your nights** leads with the next night ahead, large, with its object's drawn picture;
   every row carries its object's picture; a side column holds three figures (nights
   ahead, nights observed, hours booked) when every booking is on the page, and the ways on
   (cards, captures, gifts).
3. **The weekly cards** sit on a night panel, three smaller cards; the prizes and the odds
   are a column beside them. One caption under the row, "Illustrations — not telescope
   output", covers the three faces in place of one under each card.

New colour tokens: `--color-night`, `--color-night-deep`, `--color-twilight`,
`--color-dusk`, `--color-moonlight`, `--color-panel-night`, `--color-panel-edge`.

## Consequences

- Visual baselines for the three pages, the design system, the guides, the homepage's
  tonight list and the legal pages change and are adopted from CI's Linux renders.
- The night band follows the server's tonight, so the visual gate masks it.
- The next-night card picks by the clock; the visual gate masks it and the figures.
