# ADR-083 — The console is the Observatory Hub

- **Date:** 2026-11-05
- **Status:** PROPOSED
- **Decided by:** project maintainer (Nika), in session: "connect to my observatory agent, then
  connect to stellar observatory and implement this agent into the observatory, so the visuals
  and technicals should be the same."
- **Supersedes, for the observatory console only:** `ADR-075`'s console red on near-black, and the
  console layout of `ADR-053` (quick start, station list, five-step bar, phone dock).
- **Builds on:** `ADR-054` (the console drives a NexStar 8SE, and the real one through the
  platform), `ADR-076` (platform: the mount over the hand controller's serial port), `ADR-082`
  (showpieces, sky dome, a feed that settles).

## Context

The maintainer runs the real telescope from the Observatory Hub, a local app on the observatory
Mac (`~/telescope`): the NexStar mount over the hand controller's serial cable, the AUX focuser,
the ASI585MC, plate solving. Its cockpit is what the maintainer knows and has tested on the
hardware. The website's console was a different instrument panel in a different palette, with a
different flow (connect, align, choose, point, capture as five steps).

The platform agent already speaks to the same hardware the hub does (`ADR-076`): NexStar serial
mount, AUX focuser by exact GoTo position (the hub found the motor's slow native rates do not
turn it), ASI585MC full-sensor RAW16 with the Bayer mosaic kept. The difference left was the
website.

## Decision

1. **One screen.** The console fills the window under the site's header and never scrolls:
   the picture in the middle, the controls under it, the Autopilot and capture on the right,
   the targets on the left. The side columns scroll inside themselves; the picture and the
   controls stay put. Below 1240 px the targets go; on a phone the picture stays on top and a
   row of tabs (Track, Move, Camera, Targets, More) shows one group of controls at a time.
2. **The controls are capture software's, drawn well.** Under the picture, left to right: a
   round **mount slew pad**, eight arrows on a ring with the re-centre button in the middle and
   the rate on a slider with a pill that names it (a diagonal drives both axes); a **focuser
   dial**, a knob that turns by drag or keyboard, the position in its centre and two rotate
   buttons that hold a direction at the chosen speed (the hub's measured 2–350 steps a second);
   and the **exposure panel**, tick sliders for exposure (50 µs to 60 s, log scale) and gain,
   with the auto exposure row and the stack depth. The view's toggles (reticle, grid, invert,
   mirror, flip, auto exposure, autofocus, PNG, full screen) sit over the picture's left edge,
   the optical train and crop over its top right.
3. **Auto exposure reads the picture** (`lib/observatory-sim/metering.ts`,
   `use-auto.ts`): the frame's median, bright tail, maximum and clipped share, the stars it
   finds. It names the scene first, daylight, Moon, planet, star, deep sky or finder, from the
   picture before the target, then moves exposure and gain toward that scene's goal within its
   range, exposure before gain, and re-reads until the level holds. Each scene can be forced;
   **Keep adjusting** meters again when the picture drifts.
4. **Autofocus reads the picture too.** A coarse sweep of nine positions, then a fine one of
   seven around the best, every position approached from the same side for the gear's
   backlash. Stars are measured by their half-flux radius and fitted with a V; anything else,
   the Moon, a planet or a daylight scene, by contrast and fitted with a parabola; on Auto the
   measure is chosen after the first sweep, when the sharp positions have shown whether there
   are stars to measure. The curve, the fit and the best position are charted on the Focus
   tab. Both run by themselves after the Autopilot locks on, when their switches are on.
5. **Daytime observing.** The **Day** switch puts the sky clock back on the wall clock and
   waives the night gate: the Moon, Venus, Jupiter and the bright stars can be found in daylight
   with a daylight exposure. The Sun's 30° keep-out is never waived, and a clipped daylight
   sky is white on every sub: no stack brings it back.
6. **The hub's flow.** Pick a target, press **Find & Track**: the Autopilot connects and aligns
   if it must, slews, solves, centres and tracks; its pipeline shows where it is, with Off
   target, Pass and Solve time. **Where am I?**, **GoTo only** and **Sync** sit under it.
   Custom targets are typed in by RA and Dec.
7. **The hub's colours.** Navy and blue, three tokens (background `6,10,28`, accent `59,112,246`,
   ink `230,237,255`) on glass cards, `observatory-hub.css`; night mode turns all three red.
   `observatory-console.css` keeps the dialogs and the dome in the same blue. Gold still badges
   anything simulated; green still marks Live.
8. **The real instrument takes the same cockpit** (`platform-console.tsx`): the booked target
   in the Autopilot, the pipeline from the mission's state, nudges from the slew pad, Capture on
   its card, STOP asking once for confirmation. The focuser and the auto controls show and stay
   the operator's.

9. **Glass without blur, and panels that keep still.** Measured on the production build at a
   quarter of the CPU: with `backdrop-filter` blur on every card the phone drew 4–5 frames a
   second and the desk 3; without it, 30. So the blur is kept only on the small overlays over the
   picture, and never on a phone or where the system asks for reduced transparency. The panels
   that need no tick (targets, the dome's crosshair in half-degree steps) keep their props between
   ticks and are not drawn again four times a second. After both: 47–57 fps on the throttled
   phone, 62 on the desk, through alignment, slewing, the live stack, auto exposure and autofocus.
10. **Nothing meters while the mount moves.** A connect, an alignment, a GoTo, a park or the
    session's end stops auto exposure and autofocus and halts the focus motor; the auto controls
    and the dial are disabled until the mount has stopped; auto exposure's *Keep adjusting* waits
    while autofocus runs; the focuser dial never restarts the live stack.

## What stays binding

Every drawn frame is still captioned "Illustration — not telescope output" and the simulated
stream is badged Simulated (`ADR-052`). Clients never touch hardware: the real instrument is
reached only through the platform. Nothing here crosses a process boundary or touches the
contract. The site header and the rest of the site keep `ADR-075`'s colours.

## Consequences

The console's visual baselines change everywhere and need a refresh. The station list, quick
start, five-step bar, target-search dialog, phone dock, hand-controller faceplate and the old
camera panel are deleted, with their copy and CSS. The simulator's focuser is a model now: a
position, a GoTo speed, hold rates, a best focus per optical train that drifts with the night.
