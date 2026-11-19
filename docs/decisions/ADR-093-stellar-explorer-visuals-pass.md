# ADR-093 — Stellar Explorer: a visuals pass

- **Date:** 2026-11-19
- **Status:** APPROVED (2026-11-19)
- **Decided by:** project maintainer (Nika), choosing "Visuals pass" as the next phase after
  ADR-092 (Tbilisi city life is its own session).

## What was found

The renderer already carries quality presets, bloom, god rays, a lens flare, a colour grade,
MSAA, raymarched clouds and image-based lighting on every world, so the pass targeted what
looked wrong rather than adding passes. Checked in headless captures and in a real Chrome on a
real GPU:

- **Space was navy, not black.** On the presets without MSAA (performance, balanced: most
  players) empty space rendered about rgb(0, 6, 50). The flight's clear colour was a blue
  near-black (`#01030a`) and came out lifted into a visible navy; at `#000000` it is black.
- **The grade tinted black.** Its cool shadow tint applied down to zero, so true black took a
  blue cast; it now fades out over the bottom few percent of luminance.
- **Landing plumes were solid cones** of one flat colour.
- **The NPCs (ADR-091) were the plainest models on screen.**

## Decision

1. Flight clears to pure black.
2. The grade leaves true black untinted (shadows keep their cool cast).
3. Lander plumes are a flame shader: white-hot at the throat cooling to the drive's colour,
   soft at the silhouette, fading to the tip, with shock diamonds and a travelling flicker in
   the core.
4. NPCs: lacquered shells and polished metal that take each world's sky, gold-mirrored visors,
   belts, cuffs, knee pads, lit chest panels and helmet lamps, ribbed waists and chest plates on
   the tall droids, a blinking antenna light on the scav drones, and self-shadowing.

## Consequences

- No new passes and no new downloads; the cost is a handful of extra primitives per character.
- Ambient occlusion was considered and left out: the surfaces draw sky, globe and ground as
  three layered passes, and it would only have run on the top preset.
