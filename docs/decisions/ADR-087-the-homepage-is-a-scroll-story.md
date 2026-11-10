# ADR-087 — The homepage is a scroll story

- **Date:** 2026-11-10
- **Status:** APPROVED (2026-11-10)
- **Decided by:** project maintainer (Nika), in session: "make a same scrolling experience for
  Stellar observatory that we have on skychaser. but with stellar information and style and
  typography. go all out", after the Skychaser homepage became a pinned scroll story the same
  day (skychaser.io, 70cd438c).
- **Builds on:** `ADR-052` (every drawn object is an illustration; a simulated feed is badged),
  `ADR-072` (any session length, by the minute), `ADR-075` (the cream ticket), `ADR-082` (the
  showpieces, their recipes, a feed that boils then settles), `ADR-085` (the Night Sky data).
- **Supersedes:** `ADR-086` (the hero with tonight's planet and four panels) and what was left of
  `ADR-076` §3 and `ADR-078` on the homepage (the night chart, the steps, the scroll reveal).

## Context

Skychaser's homepage tells its product as one scroll: pinned scenes that play as the page is
scrolled, snapping from step to step. The maintainer asked for the same experience on Stellar,
telling Stellar's product with Stellar's colours, type and buttons.

## Decision

1. **Six scenes**, each the height of the screen under the site header. GSAP ScrollTrigger pins
   and scrubs them; Lenis smooths the wheel. Both are new dependencies of `apps/web`, pinned.
2. **The hero: how a session goes, in five steps.** The headline and lede as before, over
   tonight's drawn sky with the telescope's reticle on tonight's brightest planet; then *pick
   your time* (the platform's next open times on glass), *it turns to your target* (the view
   dives onto the reticle and a raw camera frame arrives), *watch it settle* (the live stack
   grows with the scroll and the picture clears), *keep the picture* (the frame shrinks into a
   capture on the ticket's cream stock). The two buttons stay under every step. A short scroll
   snaps to the next step.
3. **Tonight's showpieces**, sideways: up to six of the showpieces that stand 25° or higher in
   tonight's dark (the Moon and planets first), each in an eyepiece with its name set large
   behind it, its best time, height and direction from the almanac, and the open time nearest
   its best. On a phone the slides are swiped.
4. **One night at the telescope**: the drawn sky from astronomical dusk to dawn, the scroll as
   the clock. The reticle visits each showpiece near its best; a glass card gives the time,
   where the telescope points, and the open time to book; the timeline marks the open times.
5. **The session**: the price for 15, 30, 60 and 120 minutes at the platform's rate, the session
   printed on the cream ticket, and the four questions. **The telescope**: the observatory
   record's optics, and the Moon. **The sign-off**: the two buttons and the four other ways in.
6. **Honesty.** The sky is drawn from the Bright Star Catalogue and astronomy-engine and is
   captioned "Illustration — not telescope output" in every scene that shows it. The camera
   feed is drawn from a reference photograph, badged "Simulated", and kept as soft as 203 mm of
   aperture allows even when settled. The Moon is NASA's photograph and says so. Sources are
   credited at the sign-off. The maker's name stays off the page.
7. **Reduced motion** gets every scene still and unpinned: the headline with the four steps
   listed under it, the showpieces as a swiped row, the night at one moment. The visual gate
   captures the homepage this way and masks what follows the server's tonight.
8. **Every number is worked out on the server** (`components/layout/home-shell.tsx`,
   `features/sky/story-sky.ts`) from the almanac, `GET /slots` through the booking board's read,
   and the observatory record. Nothing here crosses a process boundary or touches the contract.

## Consequences

- `home-hero`, `home-steps`, `home-more`, `home-quick`, `night-chart`, `night-chart-view` and
  `scroll-reveal` are deleted with their styles and strings; `home.story` is new in both
  languages. `/design-system` shows the story's feed (a raw sub and the settled stack) and the
  ticket in place of the old hero and panels.
- With no astronomical dark, or nothing 25° up, the showpieces and the night scenes are left
  out; with the platform unreachable the open times and prices are left out and the buttons
  still open the booking board.
- The homepage's visual baselines change in both languages and widths.
