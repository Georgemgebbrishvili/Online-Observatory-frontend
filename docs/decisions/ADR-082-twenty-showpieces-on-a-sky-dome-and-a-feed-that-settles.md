# ADR-082 — Twenty showpieces on a sky dome, and a feed that boils, then settles

- **Date:** 2026-11-04
- **Status:** APPROVED
- **Decided by:** project maintainer (Nika), in session: "analyze this app [xSky], take 20 best
  objects from here and lets add them in our simulator observatory on stellar.astroman. when i
  press each visible object the telescope mount should realisticly go there, center it and show
  the live feed, the feed should have the similar look as from telescope celestron 8 SE. with the
  atmosphere waves and etc. but the final shot should be clean and good visually."
- **Builds on:** `ADR-054` (the console drives a NexStar 8SE), `ADR-056` (sensor, atmosphere),
  `ADR-027` §6 (deep-sky plates stay modest), `ADR-052` (every drawn frame is an illustration).

## Context

xSky lists categories, not objects: the Sun, the Moon, the planets and the Galilean moons, stars
and galaxies, found by pressing them on a sky. The console could already point at about fifty
objects, but only through a search dialog, kept the camera on 8 s subs whatever it pointed at (a
planet burned out), drew the air as blur and tip-tilt only, and drew most deep-sky objects as plain
ellipses.

## Decision

1. **Twenty showpieces** (`lib/observatory-sim/showpieces.ts`), chosen so a good handful is up on
   any night: the Moon, Venus, Mars, Jupiter, Saturn; Albireo, Almach, Mizar; M42, M31, M57, M27,
   M1, M13, M15, the Double Cluster, M51, M81, M82, M104. The Sun is left out: the safety envelope
   refuses it.
2. **A sky dome** (`components/observatory-console/sky-dome.tsx`), on the desk under Quick start
   and on the phone under the step: tonight's sky over the station, zenith in the middle, north up
   and east right as the Pointing compass draws it, the bright stars for shape, the showpieces where
   they are and the telescope's crosshair where the tube points. Objects below the horizon are
   counted, not drawn; objects under the safety floor or behind the mask stay pressable so the
   refusal can say why. One press from anywhere runs the whole chain: connect, align, GoTo, solve,
   centre.
3. **Each showpiece brings its camera recipe**: the optical train and read-out region that frame
   it, the sub and gain that suit it, and the depth of the live stack. Planets at f/20 on the
   640 crop with millisecond subs; doubles at f/20 on the 1080 crop; deep sky at f/6.3 or f/10 with
   1–4 s subs.
4. **The feed boils, then settles.** On target, four seconds of raw video, then a live stack.
   The air is a warp of the frame (`warpBySeeing`): rows and columns slide against each other by a
   correlated, drifting offset sized from the seeing, the plate scale and the sub, which fades as
   the stack grows. Atmospheric dispersion separates the colour channels; the stack registers
   them. A lucky stack's star is a sharp core in the seeing's halo, brighter as it sharpens. The
   stack's display stretch pulls the black point down. A planetary stack registers on the disc.
   The Moon is framed on its lit part, as an observer frames a crescent.
5. **A body's burn-out follows the plate scale**: a Barlow spreads the same light over four times
   the pixels, so planets no longer clip at f/20.
6. **Deep-sky plates painted by code** (`scripts/paint-sky-plates.py`, output
   `public/sky/plates/`): eleven showpieces, north up, on black, fading out before their edge, at
   the look of a live stack on this instrument: soft arms, muted colour, resolved clusters. No
   photograph is used. M57 keeps its reference photograph. Every frame stays captioned
   "Illustration — not telescope output" and badged Simulated.

## What stays binding

The real instrument's console (`platform-console.tsx`) gets no dome: a booked session's target is
the platform's. Nothing here crosses a process boundary or touches the contract.

## Consequences

Albireo, the quick start's usual target, is now a showpiece, so its GoTo switches the camera to its
recipe; the console e2e expectations follow that. Observatory visual baselines need a refresh.
