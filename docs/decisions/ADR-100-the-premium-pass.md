# ADR-100 — The premium pass

- **Date:** 2026-11-24
- **Status:** APPROVED (2026-11-24)
- **Decided by:** project maintainer (Nika), in session: "Make my website homepage and other
  pages ultra premium. with ultra high quality visuals, buttons, animation and flow."
- **Builds on:** `ADR-099` (the planet hero, polished). Nothing it removed comes back: no
  scroll pinning, no GSAP, no Lenis, no facts down the side, no Live panel.
- **Keeps:** `ADR-052`/`ADR-075` colour, type and buttons; every honesty rule (drawings are
  captioned, prices only from the platform, no stock space picture beside the product); the
  2026-11-16 rule that the copy names neither Tbilisi nor Georgia; `ADR-076`'s rule that the
  homepage names no telescope or camera model.

## Decision

**Every page.**

- The header is clear over the top of a page and turns to glass once the page scrolls
  (`components/layout/ambient-light.tsx` sets `html[data-top]`). Without the script, or with
  the phone menu open, it is glass as before.
- A glass panel's rim brightens where the pointer is, and a soft light follows it inside the
  tile (`--px`/`--py`, fine pointers only).
- A filled button sends a band of light across itself as the pointer arrives
  (`--gradient-sheen`, unused until now). Reduced motion keeps it still.
- A page other than the homepage fades in (opacity only, so no fixed child is re-parented).
- The footer sets STELLAR large across its foot in Archivo Expanded Black, fading into the
  night. It is decoration and hidden from assistive technology.

**The homepage.**

- **Hero.** A kicker ("Live remote observatory"; a red dot, not the LIVE green, since the
  page cannot know the telescope's state) sits over the headline, whose words rise one by
  one out of their own masks; the headline is larger. Under the buttons, the instrument in
  three facts. Behind it all, a drawn star field (`hero-sky.tsx`, 2D canvas, seeded) in
  three depths that leans away from the pointer, drifts with the scroll, twinkles, and now
  and then lets a meteor through; it pauses off screen. The eyepiece gains a graduated ring
  that turns once in four minutes and a warm halo that breathes, and leans against the
  pointer while tonight's tag leans with it.
- **The instrument** (new, after Tonight): "Real glass. Real light." A wide tile with the
  Schmidt-Cassegrain light path drawn as a diagram, light pulses running through it, and
  the lede; four figures (203 mm aperture, 2032 mm at f/10, three optical setups, an 8.3 MP
  colour camera); the rule that every command is checked twice. The figures are the ones
  `/observatory` already states. No photograph: the target images in `public/sky/targets`
  are stock (M42 is Hubble's), and beside the product they would read as its output.
- **The closing** (new, last): "Tonight, the sky is yours." over a planet's lit edge rising
  from the foot of the card, with *Book a session* and *Gift a night*.

## Consequences

- The homepage has six sections (`home.spec.ts`). The design system shows `HomeInstrument`
  and `HomeClosing`.
- The visual gate hides the star field and holds every new motion still (`e2e/visual.css`).
  Baselines for `/` and `/design-system` change, and every page's foot changes with the
  footer's name: they are taken from CI's own renders after the push, as ADR-099's were.
- New tokens: `--font-size-figure`, `--font-size-footer-mark`, `--ease-out-expo`, and the
  pass's light (`--color-spot*`, `--color-reticle*`, `--gradient-halo`, `--gradient-limb*`,
  `--gradient-footer-mark`, `--gradient-figure`, `--color-ray`, `--glow-kicker`).
