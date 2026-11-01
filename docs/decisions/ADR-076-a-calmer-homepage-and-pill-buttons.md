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
