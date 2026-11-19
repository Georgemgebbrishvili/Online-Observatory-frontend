# ADR-094 — The homepage is plain and short

- **Date:** 2026-11-19
- **Status:** APPROVED (2026-11-19)
- **Decided by:** project maintainer (Nika), in session: "make sure the overall landing pages
  are simple to understand, beautiful, no like extra content which load the page".
- **Supersedes:** `ADR-087` (the pinned scroll story). `ADR-088`'s hero look stays.
- **Keeps:** `ADR-052`/`ADR-075` colour, type and buttons; every honesty rule (drawings are
  captioned, no maker's name, prices only from the platform).

## Context

Measured on the live site on 2026-11-19: the homepage was 14,700 px tall on a desktop and
9,000 px on a phone, because two scenes were pinned and scrolled through. It carried about
900 KB of script, GSAP and Lenis among it, three canvases (the hero sky, a simulated camera
feed, the night chart) and a 176 KB star catalogue fetched for those canvases. A visitor who
scrolled met a showpiece carousel caught between slides as a black disc and one screen with
nothing on it while the next scene faded in.

## Decision

The homepage is five plain sections in normal page flow, rendered on the server
(`components/home/home-page.tsx`, no `"use client"`):

1. **Hero** — the headline, one line, *Book a session* and *Watch live*, over ADR-088's lit
   horizon (CSS only).
2. **How it works** — the four steps, numbered, a row on wide screens.
3. **Tonight** — tonight's best objects as cards: picture, kind, a line about it, its best time
   and height, and the open time nearest. A swipe row on phones, a grid on wide screens. The
   pictures are captioned as illustrations.
4. **Your session** — the price a minute and each length's price, from the platform; the
   cloud promise; the questions as `<details>`.
5. **The instrument** — one paragraph and three facts; then the closing call to action.

Gone from the homepage: the pinned scenes, the night chart, the simulated feed, the cream
ticket, the scroll smoothing. GSAP and Lenis leave the website's dependencies; nothing else
used them. `home-story.tsx`, `story-feed.ts` and `story-sky-canvas.ts` are deleted;
`features/sky/story-sky.ts` stays, because the server still works out tonight's objects from it.

## Consequences

- The page is about 4,500 px on a desktop and 5,000 px on a phone, and loads no animation
  library and no canvas (`e2e/home.spec.ts` holds both).
- The night chart's "one night at the telescope" lives on in Night Sky (`/sky`), linked from
  the Tonight section.
- Visual baselines for `/` and `/design-system` are regenerated; the design system shows
  `HomeObjectCard` and `HomeHorizon` in place of the story's specimens.
