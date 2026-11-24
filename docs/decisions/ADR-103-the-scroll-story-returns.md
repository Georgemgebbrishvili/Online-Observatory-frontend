# ADR-103 — The scroll story returns

- **Date:** 2026-11-24
- **Status:** APPROVED (2026-11-24)
- **Decided by:** project maintainer (Nika), in session: "This homepage is still not it, recall
  when we made a animated scrolling experience and put that on my homepage."
- **Supersedes:** `ADR-099` (the planet hero) and `ADR-094` (the plain homepage), and the
  homepage half of `ADR-100` (living hero, instrument, closing).
- **Restores:** `ADR-087` (the pinned scroll story) with `ADR-088`'s horizon, as they stood at
  `37d6e49`, the last commit before ADR-094 took them off.
- **Keeps:** `ADR-100`'s every-page touches (the header that turns to glass, the button
  sheen, the footer's name) and all of `ADR-102`.

## Decision

The homepage is the story again: the hero's five steps over the drawn sky and the lit
horizon, tonight's showpieces sideways, one night at the telescope, the session and its
ticket, the telescope, the sign-off. GSAP and Lenis return to `apps/web`, pinned as before.
The components, styles, strings, tokens, tests and the Moon's LRO photograph are taken from
`37d6e49`.

**Fixed on the way back.** ADR-094 saw the showpieces caught between slides. The cause: the
snap only counted a scene while ScrollTrigger called it active, and a scene resting on its
first step sits exactly on its start, where it is not. Every short scroll from there read as
a fresh arrival and snapped back to the first slide. The snap now tests the scroll position.

## Consequences

- `home-hero`, `hero-sky`, `home-instrument`, `home-closing`, `home-more`, `home-quick`,
  `home-steps`, `night-chart`, `night-chart-view` and `scroll-reveal` are deleted with their
  styles, strings and the ADR-100 tokens only they used.
- `/design-system` shows the story's feed, ticket and horizon again.
- Visual baselines for `/` and `/design-system` change; the homepage is captured still, as
  reduced motion shows it.
