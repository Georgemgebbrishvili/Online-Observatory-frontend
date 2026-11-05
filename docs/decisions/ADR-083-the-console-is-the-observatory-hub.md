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

1. **The hub's cockpit, on `/observatory`.** One header bar (name, Simulated or Live badge,
   Mount / Camera / Focuser device pills, local time and sidereal time, Night, Park, STOP); a
   left column of Tonight (sunset, sunrise, darkness, Moon), Targets (best right now, search,
   Solar system / Stars / Deep sky / Custom / All) and the sky dome; the view between a View rail
   (reticle, grid, invert, mirror, flip, full) and an Optics rail (train, crop, auto exposure,
   focus, PNG); a Controls card under it with Mount (the hand controller's faceplate beside the
   hand control), Align, Focus, Capture, Setup and Log; a right column of Autopilot, Camera and
   Pointing.
2. **The hub's flow.** Pick a target, press **Find & Track**: the Autopilot connects and aligns
   if it must, slews, solves, centres and tracks, and its pipeline (Align, Slew, Solve, Center,
   Track) shows where it is, with Off target, Pass and Solve time. **Where am I?**, **GoTo only**
   and **Sync** sit under it, as in the hub. Custom targets are typed in by RA and Dec.
3. **The hub's colours.** Navy and blue, three tokens (background `6,10,28`, accent `59,112,246`,
   ink `230,237,255`) on glass cards, `observatory-hub.css`; night mode turns all three red.
   `observatory-console.css` keeps the dialogs and the dome in the same blue. Gold still badges
   anything simulated; green still marks Live.
4. **The hand controller** is drawn as the hub draws it: red LCD with two lines, arrows, the
   numbered keys. Its LCD shows the mount's state and position; MOTOR SPEED and a digit set the
   rate; 1–3 filter Targets; 5 opens Focus; 6 opens Mount settings; 9 steps through the best
   targets. Its maker is not named (`ADR-055`): the faceplate reads STELLAR.
5. **The real instrument takes the same cockpit** (`platform-console.tsx`): the booked target in
   the Autopilot, the pipeline from the mission's state, Capture on the Camera card, nudges from
   the faceplate, STOP asking once for confirmation.

## What stays binding

Every drawn frame is still captioned "Illustration — not telescope output" and the simulated
stream is badged Simulated (`ADR-052`). Clients never touch hardware: the real instrument is
reached only through the platform. Nothing here crosses a process boundary or touches the
contract. The site header and the rest of the site keep `ADR-075`'s colours.

## Consequences

The console's visual baselines change everywhere and need a refresh. The station list, quick
start, five-step bar, target-search dialog and phone dock are deleted, with their copy and CSS.
On a phone the console shows one of Live, Targets or Controls at a time from its own tab row.
