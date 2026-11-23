# ADR-099 — The homepage returns to the planet hero

- **Date:** 2026-11-23
- **Status:** APPROVED (2026-11-23)
- **Decided by:** project maintainer (Nika), in session: "I dont like the current website
  visuals. take back how it was before the animated visuals."
- **Supersedes:** `ADR-094` (the plain homepage) and `ADR-088` (the horizon).
- **Restores:** `ADR-086` (a hero with tonight's planet and four panels), as it stood at
  `f576b61` (2026-11-10), the last homepage before the scroll story of `ADR-087`.
- **Keeps:** `ADR-052`/`ADR-075` colour, type and buttons; every honesty rule (drawings are
  captioned, prices only from the platform); the 2026-11-16 rule that the site names neither
  Tbilisi nor Georgia in its copy.

## Decision

The homepage is ADR-086's again: the headline and two buttons beside tonight's best placed
planet in an eyepiece, captioned as an illustration, three side facts on wide screens, four
panels (tonight's open times, Live, the price a minute, Night Sky), the night chart, How it
works, More to explore and the questions. The components, styles, strings and tests are
taken from `f576b61`, with two changes: the hero's line drops "in Georgia", and two Georgian
answers keep their 2026-11-16 shorter wording.

`components/home/home-page.tsx` and `features/sky/story-sky.ts` are deleted; nothing else
used them, and neither did the horizon and hero-size tokens ADR-087 and ADR-088 added to
`tokens.css`, which are deleted with them.

## Consequences

- No scroll pinning, no GSAP, no Lenis. The hero's words rise once and the planet floats,
  as ADR-086 had them; reduced motion stills both.
- Visual baselines for `/` and `/design-system` are regenerated; the design system shows
  `HomeHero`, `HomeQuick` and `HomeSteps` again.

## Amendment — polish (2026-11-23)

The maintainer, the same day: "now polish it, get rid of additional things, make little
smooth animations, and fix the mistakes".

- **Fewer things.** The three facts down the side leave (each repeated a panel or said
  little); the Live panel leaves (the hero's *Watch live* button is the same door); More to
  explore leaves (vote, gift and cards are in the footer, Stellar Explorer in the header).
  The hero keeps three panels: the next open time, the price a minute, Night Sky.
- **Mistakes fixed.** The Moon was always drawn half lit, whatever tonight's phase. It is
  now NASA's photograph (`public/sky/moon-full.webp`, cropped from the LRO mosaic ADR-087
  used) with tonight's night side laid over it from the almanac's lit fraction, credited
  under the caption. The panels' figures were set in the mono face and the rest of the
  page in Geist: they take Geist with tabular figures. With the platform unreadable the
  first panel no longer claims "no open times tonight", and the price panel no longer
  repeats its own heading. The hero's headline and line are balanced, so no word hangs
  alone, and tonight's readout no longer stretches to the chart's height.
- **Motion.** The planet and the panels rise in after the words, one after another; the
  little moon goes round its orbit once a minute; tonight's bars draw in from dusk when the
  chart scrolls into view, and the Now tag glows softly. Reduced motion stills all of it.
  The visual gate freezes each one.
