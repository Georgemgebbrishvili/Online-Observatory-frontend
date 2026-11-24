# ADR-101 — The observatory page is the console, and its simulation starts by hand

- **Date:** 2026-11-24
- **Status:** APPROVED (2026-11-24)
- **Decided by:** project maintainer (Nika), in session: "add a proper simulation of
  observatory. there should be a button which says start simulation and on the top right
  corner of the observatory screen it should say SIM when simulation and LIVE when real
  observation. no extra simulation or live icons or texts", and later the same session: "on
  the observatory page there should be only observatory module, no other scroll down
  sections, Only the module."
- **Amends:** `ADR-054` (the console drives a NexStar 8SE and hands over to the real one):
  the sky model no longer starts from Observe, a dome chip or Where am I? on standby.
- **Supersedes, for the observatory console only:** CLAUDE.md's rule that a simulated stream
  carries the word "Simulated" and every drawn frame the caption "Illustration — not
  telescope output" (`ADR-052`). On this one screen the SIM mark is that statement. Every
  other surface keeps both.

## Decision

1. **The page is the console.** `/[locale]/observatory` renders the site header and the
   console, nothing below it: the page guide and the site footer are gone from this page.
   The console already fills the window under the header, so the page does not scroll.
   The `observatory` guide copy and the page's caption string, used nowhere else, are
   deleted.
2. **The simulation starts by hand.** On standby the picture shows **Start simulation** and
   the Autopilot's main button reads **START SIMULATION**. Pressing either runs a simulated
   night on the sky model: connect, align (slew, plate-solve, sync), then up to three sights
   in turn (tonight's pick when it is up, then the highest showpieces), each one slewed to,
   solved, centred, exposed by auto exposure, focused by autofocus, live-stacked and
   captured into the frame strip. A capture stands for three seconds before the next GoTo.
   After the last sight the telescope stays on it, tracking.
3. **The user can take over at any moment.** Picking or observing another target, the slew
   pad, Re-centre, Capture, Where am I?, Cancel GoTo, Park, STOP and the daytime switch end
   the simulated night's plan and leave every control in the user's hands, on the same
   simulation. **End simulation**, under the Autopilot's steps, puts the console back on
   standby. The session's two-hour limit does the same.
4. **One mark says where the picture comes from.** The picture's top-right corner reads
   **SIM** (simulated gold, `#E2B85A`) from the moment the simulation starts, and **LIVE**
   (live green, `#2ECC71`, with the live glow) while the real instrument's stream is on the
   screen in a booked session (the platform console of `ADR-054` §6). On standby there is no
   mark. Its accessible name is "Simulation" or "Live observation" (Georgian:
   "სიმულაცია", "პირდაპირი დაკვირვება"). The letters are SIM and LIVE in both languages, as
   asked; they are not Georgian text, so the rule against uppercasing Georgian is not
   touched.
5. **Nothing else says it.** The "Simulated"/"Live" chip in the console's bar, the
   "Simulated" pill on the standby card, the "Simulated feed"/"Live feed" words in the
   picture's top-left readout and the illustration caption along its foot are removed. The
   readout keeps the instrument's name and optics.
6. **Captures stay honest.** A frame the sky model draws carries "Simulated · sky model" as
   its provenance, in the capture's record and inside the PNG, whatever mode the platform
   reports. Before this record a sky-model capture taken while the platform was in REAL mode
   carried the observatory's name instead; that was wrong and is fixed.

7. **The status says what the telescope is doing.** While the after-lock auto exposure or
   autofocus reads the picture, the status pill says "Auto exposure · pass n" or
   "Autofocus · pass n · k samples" instead of a bare "On target · tracking": at a deep-sky
   object's 8-second exposures they take minutes, and a still pill read as a stalled
   simulation.
8. **The tablet fits.** Between 768 and 1023 px the console's clock is hidden so STOP stays
   on the screen (it was cut off at 768 px), the field readout is hidden and the target's
   readout stands above the status pill (the three overlapped), and the start card clears
   the tool rail. From 768 px up the picture fits its grid row: the old console sheet's
   420 px floor ran it under the slew card on a short laptop (1024 × 700, live on the site
   before this record). On a short screen the start card is compact and sits below the
   optics pills; on standby the readouts it would cover step out until the simulation
   starts.

## Consequences

- The model's canvas keeps its accessible name, "Simulated telescope camera view"; the
  stream image keeps "Simulated feed" or "Live feed" as its alt text. Neither is drawn.
- `?turbo` still runs the model eight times faster for the test suite, and still skips the
  after-lock exposure and focus, so a simulated night fits a test. It is now read once into
  a ref and checked when the after-lock chain runs: the chain used to trust two state flags
  that turbo cleared from an effect, and on a slow first load (a busy machine) autofocus
  could still run after lock. The new status text made that visible in the tests.
- e2e: `observatory-console.spec.ts` and `home.spec.ts` start the model with the new button
  and assert the corner mark instead of the bar's chip and the caption.
- Visual baselines for `/observatory` (both languages) and the design system change.

## Alternatives considered

- **Keep the caption beside the SIM mark.** Rejected: the maintainer asked for no extra
  simulation text, and SIM on the picture itself says the same thing where the eye is.
- **Start the simulation from any target press, as before.** Rejected: the maintainer asked
  for a button; a press on standby now only picks the target the simulation starts with.
