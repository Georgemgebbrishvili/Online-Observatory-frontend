# ADR-108: A plain surface — no glow, no ornament

- **Status:** Accepted
- **Date:** 2026-11-26
- **Decided by:** the maintainer
- **Amends:** ADR-052 §4 (the glow), ADR-076 (the pill button), ADR-088 (the hero's horizon),
  ADR-100 and ADR-102 (the premium pass)

## Context

On the day of an audit the maintainer looked at the site on a phone and said it "looks AI
generated" and asked for it to be made to look legitimate. What reads that way is the
decoration every generated landing page carries: coloured glows under buttons and behind
cards, a lit horizon, glass sheen, headings that fade to grey on their second line, a
red rule before each label, ornamental rings behind cards and in empty states, and the
name set huge and faded across the footer.

## Decision

The surface is plain. What is on screen is content, state or a control.

1. **No glow.** Filled buttons are one flat vermilion with no halo, gloss or travelling
   sheen; the secondary button is an outline on nothing. The hero's horizon, the warm
   light behind the session ticket, the closing section's horizon, the page's corner and
   foot washes and the vignette are removed. The green LIVE light stays: it is state.
2. **Buttons are 10 px rectangles**, as chips already were, not pills.
3. **Headings are one colour.** No gradient through the letters, no quieter second line,
   no accent-coloured word.
4. **No ornament.** The red rule before a section label, the dots before the session's
   facts, the graduated ring behind the sign-in card, the ring in an empty state and the
   footer's large faded name are removed. An error state keeps its mark.
5. Layout, copy, type families, colour tokens for text and surfaces, the cream ticket and
   the console's own palette are unchanged.

## Consequences

- Every visual baseline changes and is adopted from CI's Linux renders.
- The tokens that carried the glows remain where rules still read them, set to `none`,
  so no page needed restructuring on the day.
