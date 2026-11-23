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
