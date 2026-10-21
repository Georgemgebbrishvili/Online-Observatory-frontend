# ADR-057 — The observatory dome, Stellar Explorer in the header, and a calendar board

- **Date:** 2026-10-21
- **Status:** APPROVED
- **Decided by:** project maintainer (Nika), in session, with reference screenshots (a
  domed observatory on a hill; a dark planet-selector game interface): "build this dome
  telescope in the below middle area of my home landing page, when I point mouse on any
  direction the telescope should follow it … get rid of the whole right side section of
  home nav bar, only leave language changer and profile icon … add the game Stellar
  Explorer in the top menu nav bar instead of prices … work on booking page … calendar
  looking dates, with also some info of special nights, like full moon, new moon, some
  celestial conjunction."
- **Amends:** `ADR-056` §3 (navigation) and the CLAUDE.md "Design and brand" line that
  the header carries Observatory, Book, Pricing.

## Decision

1. **Header.** The header carries Observatory, Book and Stellar Explorer. Its right side
   holds only the language switch and a round profile button, which opens a small menu:
   sign in, create an account and book for a visitor; overview, live, collection,
   profile and sign out for a customer. The "Reserve a slot" button leaves the header;
   the hero, the final call to action and the Book link still reach the board. Pricing
   stays reachable from the footer.
2. **The observatory dome.** The homepage hero carries a drawn observatory — a dome on a
   drum, on a hill above Tbilisi — at its foot. Its telescope slews to wherever the sky
   reveal's light rests (the pointer, or the reveal's own tour), and the dome turns its
   slit after it. It is an illustration of the building, drawn on a canvas, in the
   site's palette; it is not telescope output and shows none. The sky reveal no longer
   flashes: a plate comes into focus, and a faint ring marks the field being looked at.
3. **Stellar Explorer.** `/[locale]/explorer` is a launch screen for Skychaser's Voyage
   game (`skychaser.io/voyage`, the maintainer's own), which plays on its own site:
   skychaser.io refuses to be framed, and its engine, wallets and assets do not belong
   in this repository. The page's backdrop is a still of the game's title screen,
   captioned as a game image.
4. **The booking board** shows its nights on a month calendar with the Moon's phase on
   every day and the month's special nights — Moon phases, close approaches of the Moon
   and planets, oppositions, equinoxes and solstices, eclipses and meteor-shower peaks —
   computed in the browser with `astronomy-engine`, as the Moon glyph already was. Only
   the platform's seven nights can be booked; every other day is information. The
   whole board fits one laptop screen.

## Consequences

- Header tests that looked for "Pricing", "Sign in" or "Reserve a slot" in the header
  change; the Account menu is opened by the profile button, still named "Account".
- The almanac is astronomy, not platform data: it crosses no process boundary and needs
  no contract field. A visitor's local timezone never shifts it; dates are the
  observatory's.
- Skychaser's cards, capsules and wallet stay its content; Stellar only links to the game.
