# ADR-038 — The App Takes the Homepage's Type and Night

- **Date:** 2026-10-02
- **Status:** APPROVED
- **Decided by:** project maintainer
- **Amends:** `ADR-030-the-homepage-carries-the-hero-language.md`, which confined the
  hero's fonts, night and cyan to the homepage. Brand Identity System v2.0 for typography
  and the page night, as recorded below.

## Context

The homepage (ADR-029, ADR-030) runs its own type and colour:

- Prata for display and Hanken Grotesk for body (`homepage.css`, `planet-hero.css`)
- `--home-night` (`#04101f`) as the page night
- `--home-cyan` and white ink

Every other page uses Brand v2.0's Noto Serif Georgian and FiraGO on Stellar Night
`#05080D`, with Photon Blue `#5CC8FF`. The design audit of 2026-10-02 ranked this its
first problem: "Reserve a slot" leaves one brand and lands in another.

The maintainer chose to carry the homepage's type and night into the app, rather than
pull the homepage back to the core tokens.

## Decision

1. **Type.** Every surface uses the homepage's pair:
   - Display: `var(--font-prata), var(--font-noto-serif-georgian), Georgia, serif`.
   - Body: `var(--font-hanken-grotesk), var(--font-firago), system-ui, sans-serif`.

   Georgian keeps its own faces through the fallbacks, because Prata and Hanken carry no
   Mkhedruli. Plex Mono stays for data: coordinates, times, exposure.

2. **Night.** `--color-night` becomes the homepage's night. The surface ramp
   (base, raised, overlay) is re-derived from it, step for step, so the elevation order
   is unchanged.
3. **Photon Blue stays the action and data colour** in the app: buttons, links, focus,
   live values. `--home-cyan` stays the homepage's accent. The two are harmonised in
   Track B only if a measured contrast check requires it.
4. **Not carried:**
   - the hero's white button glow, its blur, and its rendered planets. ADR-029's
     exception remains the hero's alone.
   - The glow ban, the glassmorphism ban and the "Illustration — not telescope output"
     caption rule stand unchanged.

## "Cosmic", inside the rules

The maintainer's word is "cosmic and solid". It is reached through precision and the
real sky, never through decoration:

- **A night-context band.** Darkness window, moon phase and illumination, twilight, and
  the observatory's coordinates, in mono. Real values only, computed or traced to the
  contract.
- **A data readout in the room.** RA/Dec, alt/az, exposure, gain, stack count and frame
  time, with tabular numerals.
- **A sparse static star-field texture** on the page night only:
  - no twinkle, no nebula colour, no glow;
  - never behind the feed or a capture, so it cannot be mistaken for telescope output.
- **Depth from the surface ramp.** The radial "vignette" washes in seven stylesheets are
  glow in all but name, and they go.

Still banned: nebula gradients, reticles and "target locked" chrome, scanlines, frosted
panels, and stock or generated space imagery presented as output.

## Consequences

- Token change in `tokens.css`: `--color-night` and the ramp, and the two font stacks on
  `:root`. Contrast pairs are re-verified at WCAG 2.1 AA, since text sits on a new night.
- Every visual baseline changes once. The token commit regenerates them all, with the
  container runtime, in both languages.
- ADR-030's "No other surface may cite either" no longer applies to the fonts or the
  night. It still applies to the hero's glow and blur. `CLAUDE.md`'s second design
  exception is to be read with this record. Its text is the maintainer's to amend.
