# ADR-041 — `/observatory` takes the Stellar app's observatory scene

- **Date:** 2026-10-05
- **Status:** APPROVED
- **Decided by:** project maintainer (Nika), in session
- **Amends:** `ADR-039-every-surface-takes-the-stellar-poster-language.md`, for
  `/observatory` alone. ADR-040 is the platform's (password reset).
- **Supersedes:** `ADR-026`'s layout for that page. Its content rules stand.

## Context

The maintainer asked for the observatory page of the Stellar app
(`app.stellarr.club/observatory`, source `~/Desktop/Stellar/app/src/app/(stellar)/observatory`)
to be copied here, and for "Observatory" in the navigation to open it. Asked how far, the
maintainer chose **its look, our content**: the scene and its parts, filled with what
this product has.

That page differs from ADR-039 in its ground and its parts: a navy night under a field
of stars, a floating instrument card, a to-scale field plate, a site-time clock, a dock of
numbered ways in, and an instrument card. It also carries features this product does not
have — a simulator, capture requests, partner nodes and an operator's earnings.

## Decision

1. `/observatory` is rebuilt as the Stellar observatory scene:
   - a **star-field ground** in the page's own night, scoped to the page;
   - a **floating instrument card**: the observatory's name and city, its live state as a
     pill, the telescope and camera, the title, a one-line count, the cloud cover and the
     next dark hour as two status facts, and the actions;
   - a **field plate**: the Moon with the ASI585MC's field drawn to scale from the
     telescope's focal length, captioned "Illustration — not telescope output". Unlike the
     Stellar page, the Moon is drawn, not photographed (a photograph we did not take must
     not sit where telescope output could), at its mean size, and Jupiter is left out:
     tonight's sizes need an ephemeris the contract does not carry;
   - a **site-time clock** in the observatory's zone;
   - a **dock of numbered ways in**: book a slot, watch a live session, see tonight's
     targets;
   - below, **the instrument card** (aperture, focal length, focal ratio, field of view,
     camera), **tonight's targets**, the **ways** as a numbered list, and the page's
     existing **safety rules** and **site and network** sections, each as a floating
     panel. No session price is shown: the contract carries none for this page.
2. **Our content only.** Every value comes from the contract as the page does today
   (`getObservatoryStatus`, `getObservatoryConditions`, `listBookableObservatories`,
   `listTonightTargets`). The sensor's size is the ASI585MC's datasheet figure, the camera
   the page already names. The simulator, capture requests, partner nodes, operator
   earnings and their links are left out; nothing links to a page that does not exist.
3. **ADR-039's rules hold where they are rules, not taste:** no glow on panels, cards,
   buttons, pills or the plate, and no blur behind the panels (they are opaque enough
   without it); no reticle on telescope output; the brand's orange for
   the primary action and yellow for live and simulated; type from ADR-039's families.
   The navy ground and the floating panels are this page's exception.
4. The navigation's "Observatory" opens `/{locale}/observatory`, as it does today.

## Consequences

- One page differs from the rest of the site's ground. If the maintainer later wants the
  whole site in this scene, that is a new record superseding ADR-039.
- The page's visual baselines are regenerated in both languages.
