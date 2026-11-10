# ADR-088 — The homepage stands on a horizon

- **Date:** 2026-11-11
- **Status:** APPROVED (2026-11-11)
- **Decided by:** project maintainer (Nika), in session: "scrap these design systems from
  pinterest and redising me my stellar observatory website. go all out, make no mistake, be
  premium and bold. minimalistic and elegant", pointing at Pinterest's "website design" search.
- **Builds on:** `ADR-087` (the scroll story, its six scenes, its numbers and its honesty rules,
  all kept), `ADR-052`/`ADR-075` (colour, type, buttons, the cream ticket, all kept).
- **Amends:** `ADR-087` §2 (where the hero's words, open times and capture sit) and the glass of
  `ADR-077` on the homepage.

## Context

The maintainer asked for a redesign after the references on that Pinterest board. The ones that
fit an observatory share four things: a near-black page with one warm light source, most often a
planet's limb glowing at the foot of the screen; a centred hero with a small tracked label, a
headline in a medium weight set tight, one line of text and pill buttons; flat panels with
hairline edges in place of glossy glass; and pictures that sit on the page without a frame.

Stellar already had the black page, the red, the pills and the story. What it lacked was the
composition: the hero's words sat bottom-left over a busy chart, the headlines were bold, the
panels glossy and the Moon boxed.

## Decision

1. **The horizon.** A planet's limb, lit from behind in the accent red, lies at the foot of the
   hero and stays there through all five steps. It is drawn in CSS (`--shadow-horizon`,
   `--mask-horizon`), is decoration only, and joins the glows listed in CLAUDE.md. The drawn sky
   keeps the upper half of the hero; a shade hides its lower half, so the words stand on black.
2. **A centred hero.** A label with the observatory's place from its record, the headline, the
   lede and the two buttons are centred above the horizon. The two halves of each headline share
   a line when it fits. The open times come up as one row of four, centred above the words; the
   camera's picture and the kept capture sit centred above them, sized to the room the screen
   leaves. The step counter stays bottom-right.
3. **Type.** The homepage's headlines are Geist medium, tracked −0.045 to −0.05em, in place of
   bold; names and tile heads follow. The hero headline takes `--font-size-hero-horizon`, which
   also answers to the screen's height. A scene's first label opens with a short red rule.
4. **Quiet panels.** The homepage's glass (`.hs-glass`) is a hairline edge on a dark, blurred
   ground at the panel radius: no sheen, no drop shadow. The eyepiece gains one hairline ring.
5. **The Moon stands free**, cut to its own disc, with its credit under it.
6. **Unchanged:** every scene, number, link and string of ADR-087 (one string is added to no
   dictionary: the place comes from the observatory record); the palette, the button, the ticket;
   the "Illustration" captions and the "Simulated" badge; reduced motion, which gets the same
   centred hero still.

## Consequences

- `/design-system` shows the horizon beside the story's feed and ticket.
- The visual baselines of the homepage and `/design-system` change in both languages and widths.
- Nothing crosses a process boundary; the contract is untouched.
