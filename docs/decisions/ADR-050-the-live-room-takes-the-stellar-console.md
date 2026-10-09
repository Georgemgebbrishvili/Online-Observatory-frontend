# ADR-050 — The live room takes the Stellar console

- **Date:** 2026-10-09
- **Status:** APPROVED
- **Decided by:** project maintainer (Nika), in session: "I need the live observatory to be
  copied from Stellar's current site, all the visuals also." Asked how far, he chose
  **the full look, our content**.
- **Amends:** `ADR-039-every-surface-takes-the-stellar-poster-language.md`, for the live
  room (`/app/missions/[targetSlug]/session`) and the watch page alone, as ADR-041 did for
  `/observatory`.
- **Supersedes:** `ADR-027`'s "layout, restyled" for the same screen. Its content rules —
  contract-backed controls only, plates captioned as illustration, never in the feed —
  stand.
- **Source:** the Stellar app's observatory console, `~/Desktop/Stellar/app`,
  `src/components/stellar/observatory/` (`ObservatoryConsole.tsx`, `ViewStage.tsx`,
  `panels.tsx`, `console.css`) at commit `1052314b^`, the last commit before that site
  put "coming soon" over it. Screenshots at 1440 and 390 were taken from a local build of
  that commit on 2026-10-09.

## Context

ADR-027 brought SIDERA's console into the room as layout only, in the poster language:
black ground, cream ink, flat panels, no glow. The maintainer has since built that
console out on the Stellar cards site, in its own warm language — copper and amber on
near-black, an atmosphere of drifting aurora and a dot grid, glass panels with gradient
borders, an orbiting ring round the view, Barlow Condensed labels and tabular mono
readouts, a numbered flow bar under the view with one primary action, and on a phone a
progress strip, three stats, a capture strip and a fixed dock. He wants the room here to
be that, visuals included.

## Decision

1. **The room is the console.** Its ground, atmosphere, panels, borders, type, the view
   stage with its HUD corners, status pill and tool bar, the flow bar, the right column
   (pointing dial and readouts, controls, session, sharing) and the phone layout (head,
   station strip, view, progress strip, stats, captures, dock, sheets) are copied from
   the source, class for class where the markup matches and token for token where the
   colour does. The console's CSS custom properties become room-scoped tokens
   (`--room-*`) in `tokens.css`; nothing outside the room reads them.
2. **Our content only.** Every value comes from the contract and the mission channel as
   the room reads them today. What the source has and we do not is left out, not faked:
   stations, battery, seeing, track RMS, exposure, frames to stack, gain, focus, slew
   rate, tracking toggle, the optical-train switch, survey labels and the night-mode
   filter. The controls panel offers what `ClientCommandType` offers: nudge, re-centre,
   capture, stop. The source's "Quick start" panel becomes **Tonight**: the mission's
   target, the slot, and the one primary action. "Telescopes" becomes the observatory's
   own card: link, weather, cloud cover and the next dark hour.
3. **The feed stays honest.** The view stage shows the stream when there is one, else the
   drawn plate captioned "Illustration — not telescope output". The source's photograph
   backdrop under the view is not used there: a photograph we did not take must not sit
   where telescope output could (ADR-041 §1). The atmosphere behind the panels may use a
   drawn plate; it is décor, not a feed. The reticle, brackets and scan lines are drawn
   only over the illustration, never over the stream (ADR-039 §"no reticle on telescope
   output").
4. **ADR-039's rules are lifted for this screen where the source breaks them:** glow on
   the view frame and the active step, blur behind glass panels, gradient borders, the
   aurora. The brand's orange stays the primary action's colour and yellow stays live and
   simulated; the source's copper palette is mapped to tokens in those roles where they
   coincide and kept as room tokens where they do not.
5. **The watch page** takes the same stage and ground with the observer's panels (seat,
   sharing, who is watching) in the right column, so a watcher and the owner see the
   same room.
6. **Fonts.** Barlow Condensed is loaded for the room only, as the source loads it for
   `/node` only; Georgian falls back to Noto Sans Georgian. JetBrains Mono stays the
   readout face.

## Consequences

- `room.css` is rewritten; the room's and watch page's visual baselines are regenerated
  in both languages at both widths. The e2e specs keep their roles and copy: "Progress",
  "Controls", "Session", "Start observation", "Stop", "Step n of 5".
- Every rendered or drawn object in the room is still captioned.
- The design system gains the console's panel, pill, HUD, stat, flow step and pad
  specimens, so the room's parts are seen before the room uses them.
- A later record may extend the console to the whole app; this one does not.
