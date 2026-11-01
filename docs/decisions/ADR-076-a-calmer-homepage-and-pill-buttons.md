# ADR-076: A calmer homepage and pill buttons

- Status: APPROVED (maintainer request, 2026-11-01)
- Amends: ADR-052 §7 (hero), ADR-057 (observatory at the hero's foot), ADR-075 (buttons, homepage chapters)

## Decision

1. The 3D observatory and telescope leave the homepage hero. The drawn sky stays.
   `observatory-dome.tsx`, `observatory-scene.ts` and the `three` dependency are removed.
2. Buttons site-wide become one pill: Geist 600 at body size, sentence case, 48 px
   (56 px large). Primary is solid action vermilion with cream letters and a soft glow;
   secondary is a lighter surface with a hairline. Replaces the 10 px Oswald poster button.
3. The homepage is: hero (book + watch live, two status chips), Tonight (open start
   times beside the Moon and planets up), How it works (four cards), Pay by the minute
   (one tile per length, cloud guarantee), More to explore, Questions, last call.
   The duplicated "observatory now" and "what the telescope can see" cards and the
   three-step booking chapter are dropped; kickers above headlines are gone.
4. Nothing on the homepage reads below 14 px. Georgian section heads set in the body
   face, never uppercased.

## Why

The maintainer asked for no animated telescope, a different style for every button and
section, mobile-first layout, and only necessary text with nothing small.

## Amendment (ADR-077, 2026-11-01, maintainer request)

- The hero loses its status chips; the observatory's state lives on /status and /tonight.
- iPhone-style glass: frosted tiles (24 px corners, bright top edge, backdrop blur) over
  soft ambient light; headlines in Geist bold with a glossy gradient; glossy pill buttons
  (vermilion #D9442A to #B8321F, cream letters, AA). Section buttons are medium size.
- Sections rise into place as they scroll in (IntersectionObserver; nothing is hidden
  without the script or with reduced motion).

## Amendment (ADR-078, 2026-11-01, maintainer request)

The maintainer asked for a premium finish: small buttons, interactive information below
the hero, nothing extra.

- Tonight is one night chart, sunset to sunrise: each body's rise-to-set bar peaking at
  its best time, the open start times as pins on the same clock, a "now" line, and the
  first four open times as chips. Picking a row fills a readout — best time, highest
  altitude, compass direction, visible window — with a button that books the open time
  nearest its best. Every value is the almanac's or the platform's; with no sky to chart
  the open-times card shows instead.
- How it works is four tabs beside one stage; the bar under the open tab fills and hands
  on while in view, holds on hover or focus, and does not move with reduced motion.
- Pay by the minute is a length picker: the platform's price for the chosen length, a
  bar for its share of the four-hour maximum, and one button to book it.
- More to explore is a bento of four doors with line drawings; Questions sits beside its
  heading as hairline rows; the last call is a panel with a sunset on its horizon.
- Sections are numbered after a short red rule and split by fading hairlines; panels sit
  on a faint dot grid. Homepage buttons are 40 px pills with 14 px labels.
- The scroll reveal also shows anything a fast scroll carried past the screen.
- 2026-11-01, later (maintainer): the section numbers are dropped, and every panel is
  tightened — smaller padding, chart rows and readout, step stage, price and bento tiles —
  so the page uses its space compactly. Hour labels under the "now" tag step aside.
- 2026-11-01, later still (maintainer): back-to-back open times read as one band on the
  chart instead of a tick each, with the chip under the pointer marked on it; the
  altitude gauge is dropped; every panel gets a rim that catches light at the top-left;
  the bento doors carry their drawings large and faint, cropped by the tile's corner.
