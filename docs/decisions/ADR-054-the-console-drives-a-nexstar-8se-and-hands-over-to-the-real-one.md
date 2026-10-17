# ADR-054 — The console drives a NexStar 8SE, and hands the same controls to the real instrument

- **Date:** 2026-10-17
- **Status:** APPROVED
- **Decided by:** project maintainer (Nika), in session: "upgrade the observatory page
  simulator, it should be exactly like celestron nexstar 8SE would see the objects, also
  the controls should be ultra realistic, when i move telescope the object should stay
  where it is and not follow the screen. fix all simulator bugs and upgrade it to a
  highest quality, every button should work on this simulator and when telescope is
  connected they should transfer there smoothly. build such system of it."
- **Builds on:** `ADR-053` (the console is the Skychaser module), `ADR-052` (visuals and
  honesty rules), `ADR-050` (the live room carries real commands through the platform).
- **Amends:** `ADR-053` §3 (the plates in the eyepiece) and its "What stays binding" line
  that the live room alone carries real commands.
- **Sources of the numbers:** the Celestron NexStar SE instruction manual (hand-control
  rate table, direction buttons, anti-backlash, slew limits, GoTo approach, cordwrap,
  sync), Celestron's NexStar 8SE specification page (aperture 203.2 mm, focal length
  2032 mm, f/10, 64 mm / 31 % obstruction, Dawes 0.57″, Rayleigh 0.69″, nine slew speeds
  to 5°/s, DC servo motors), and ZWO's ASI585MC sheet (IMX585, 3840 × 2160 at 2.9 µm,
  11.2 × 6.3 mm, 32 µs–2000 s, 12-bit, HCG from gain 252, 40 ke⁻ full well). Every
  number in `lib/observatory-sim/instrument.ts` cites one of these.

## Context

ADR-053 ported the Skychaser console as written. Its sky was already fixed to the sky,
but three things were not: the object in the eyepiece was a DOM overlay pinned to the
centre of the frame, so a hand slew moved the stars and left the planet where it was; the
GoTo was told eight times faster than the mount moves, over a painted star stream; and the
hand control's rates, the mount's limits and the camera's exposures were a sketch of a
NexStar rather than one. The maintainer wants the model to be the instrument, and wants
the same console to drive the real instrument when the platform reports it.

## Decision

1. **The instrument is a Celestron NexStar 8SE with a ZWO ASI585MC**, as one record in
   `lib/observatory-sim/instrument.ts`, and the console's one station reads it. The
   maintainer named the 8SE in this session; `CLAUDE.md`, the platform's seed and its
   `OpticalConfig` description still say the C6 (1500 mm). That conflict is not resolved
   here: the console shows what the maintainer asked for, and the platform's own copy
   stays until he decides the fleet. The three optical configurations keep the
   platform's names (`F6_3_REDUCER`, `F10_NATIVE`, `F20_BARLOW`) at the 8SE's focal
   lengths (1280, 2032, 4064 mm).
2. **The mount is modelled as the manual describes it**, in `lib/observatory-sim/mount-drive.ts`:
   - the hand control's nine rates: 1 = 0.5×, 2 = 1×, 3 = 4×, 4 = 8×, 5 = 16×, 6 = 64×
     sidereal, 7 = 1°/s, 8 = 3°/s, 9 = 5°/s, on DC servo axes that spin up and down;
   - anti-backlash on each axis (0–99, as the hand control takes it): a reversal crosses
     the gears' play before the tube moves, and the compensation winds through it;
   - slew limits in altitude (0° to 90° by default), where an axis stalls at its stop;
   - cordwrap, off by default in Alt-Az as the manual says: on, the azimuth never crosses
     the home line and a GoTo goes the long way round;
   - GoTo approach, positive on both axes by default: the final leg of every GoTo comes
     in from the same side at a reduced rate, so backlash is taken up the same way the
     alignment was;
   - a GoTo runs both axes at rate 9 together, at the mount's real pace, and lands with
     the pointing model's error — a few arcminutes after alignment — which Sync near
     that part of the sky reduces, as the manual's Sync does;
   - **tracking holds a point on the sky, not a point on the screen.** The mount tracks
     the equatorial position it is pointed at; a hand slew moves that position when the
     key is released. So the object stays where it is on the sky, the field rotates as an
     alt-az field does, and nothing follows the screen. Sidereal, lunar and solar rates
     follow their bodies; off lets the sky drift through the field.
3. **The camera is the ASI585MC**, in `lib/observatory-sim/camera.ts`: exposures from
   0.5 ms to 60 s, gain 0–600 with the HCG step at 252, read noise and full well on ZWO's
   curve, and three read-out regions. **A frame takes its exposure time**: the feed shows
   the last completed sub, a new one lands when the exposure ends, and the stack is the
   mean of what has landed. A long exposure during a slew is a smear, as it would be.
4. **Everything in the eyepiece is drawn by the sky model on one canvas, at its true
   angular size, where it really is.** The DOM plate, the painted slew stream and the
   "backyard" Saturn go. Bodies are their reference photographs at their apparent
   diameter, with the Moon's and the inner planets' phase masked from the model's
   illumination, atmospheric extinction and dispersion by altitude, and burn-out past
   the sensor's full well; deep-sky objects as before; stars blur with the seeing and,
   out of focus, open into the SCT's donut. Field rotation follows from the projection
   and needs no special case. The platform's cloud figure thins the sky as cloud does.
5. **Every control on the console drives the model**, and the ones that could not are
   gone: the optical train and the read-out region set the field; the exposure, frames
   and gain set the frame; the pad slews at the chosen rate and the tracking selector
   holds, drifts or follows the Moon; focus in and out defocus the stars and autofocus
   runs a V-curve back; Sync improves the pointing model; the mount settings (backlash,
   cordwrap, approach, limits) are the hand control's; a GoTo to typed coordinates and
   Identify (the nearest catalogued object to the pointing) are the hand control's too.
6. **The console hands over to the real instrument.** `components/observatory-console/driver.ts`
   defines one `InstrumentDriver` the console reads and commands. `SimDriver` is the
   model. `PlatformDriver` is the live room's seam (ADR-050): with the platform in
   `mode: REAL` and the caller holding an active mission, the console starts the mission
   session, shows the platform's stream, reads the mount's pointing from the telemetry,
   and maps its controls to the contract's `ClientCommandType`: a held arrow is a run of
   bounded `NUDGE` steps at the envelope's rate, Centre is `RECENTER`, Capture is
   `CAPTURE`, Stop is `ABORT`. What the contract withholds from a customer — a free GoTo,
   a train change, park — the console withholds too, and says why. This amends ADR-053's
   last binding line: the console now carries real commands, through the platform's
   driver only, exactly as the live room does; nothing addresses hardware.
7. **Honesty rules stand.** Simulated in gold unless the platform says REAL; "Illustration
   — not telescope output" under every drawn frame; every drawn frame's provenance reads
   *Simulated · sky model*. The real stream is the platform's and is never drawn over.

## Consequences

- `components/observatory-console/SlewField.tsx` and `public/plates/scope/` go;
  `plates.ts` keeps the quick start's and the picker's illustrations.
- The GoTo takes as long as the mount takes. The step bar's estimate is the model's.
- `e2e/home.spec.ts`'s console tests, `e2e/observatory-console.spec.ts` (new: the hand
  control, the sky that stays, the camera, the settings, the real-mode handover on the
  fake platform's `fake_mode=real` cookie) and the visual baselines for `/observatory`
  change together.
- The platform's `OpticalConfig` description and `CLAUDE.md` still name the C6: a
  maintainer decision, flagged in the session report.
