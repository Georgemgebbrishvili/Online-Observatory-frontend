# ADR-028 — The Homepage Hero Takes the Target-Showcase Composition

- **Date:** 2026-09-27
- **Status:** APPROVED
- **Decided by:** project maintainer
- **Amends:** `docs/plan/02-build-phases.md`, Phase 7, for the homepage hero only, as
  ADR-026 did for `/observatory` and ADR-027 for the live room; ADR-027 §6, which kept
  the plates to the live room.

## Context

On 2026-09-27 the maintainer asked for the homepage to be made "exactly like" a
reference hero built for another site ("SpaceEdu"): a full-screen looping planet video
as the backdrop, a small eyebrow, a very large serif planet name, a short rule, a
paragraph and one button, with two further planets cropped by the screen edges either
side of the button. Clicking a side planet features it.

A literal copy conflicts with this repository's controlling documents:

- **Imagery.** The backdrop and cut-outs are rendered Earth, Venus and Mars clips,
  hot-linked from a third party's CDN with no known licence. `CLAUDE.md` forbids stock
  space imagery presented as telescope output, and Earth is not a target.
- **Brand v2.0.** A white glow on both buttons, Prata, Hanken Grotesk and Poppins, a
  cyan outside the palette, a blurred-glass scroll button.
- **Idea.** Its copy sells courses; Stellar sells observation time on one real
  telescope.

Asked, the maintainer chose to keep the composition and the interaction, carrying
Stellar's own content and brand, and to revisit a literal copy only if this does not
satisfy.

## Decision

1. The homepage hero is replaced by a target showcase in the reference's arrangement:
   the tagline as the eyebrow, the featured target's name as the `h1`, a Photon rule, a
   paragraph about observing that target with the 6SE, "Book an observation" to
   `/app/book`, and two further targets cropped by the screen edges, each a button that
   features it. A link to the next section sits at the foot.
2. **Targets.** Saturn (featured on load), Jupiter and Mars — planets a 6SE shows in a
   live stack. The paragraphs claim only what live-view / EAA delivers.
3. **Imagery.** The ADR-027 plates for those three, already in `public/plates/`. No
   video, nothing hot-linked, nothing new sourced. The plates appear here as
   illustration and are captioned "Illustration — not telescope output" on the hero,
   as ADR-027 §6 requires wherever a plate is shown. ADR-027 §6 is amended to allow this
   second place; the feed rule is unchanged.
4. **Brand.** Stellar's tokens, type and brand button throughout: no glow, no glass,
   Photon for the rule and focus. The name is set in the display face at one new
   scale step, `--font-size-showcase`, used by this hero only. Layout uses the five
   named breakpoints; the reference's pixel-derived tiers are not reproduced.
5. **Motion.** One load sequence within the instrument range (≤ 1.2 s) and 220 ms
   state changes, all of it off under `prefers-reduced-motion`.
6. The hero shows no platform value, so there is no contract trace for it. The
   sections below it are unchanged.

## Consequences

- `HeroObservatoryVisual` and its styles are deleted; the hero's dictionary keys are
  replaced.
- The homepage visual baselines change, in both languages, at 390 and 1440.
- If the maintainer later chooses the literal copy, that is a new record overriding
  Brand v2.0 for this surface, and needs the video's licence first.
