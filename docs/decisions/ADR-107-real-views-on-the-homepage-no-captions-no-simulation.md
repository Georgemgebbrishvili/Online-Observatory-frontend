# ADR-107 — Real views on the homepage, no captions, no "simulated"

- **Date:** 2026-11-26
- **Status:** APPROVED (2026-11-26)
- **Decided by:** project maintainer (Nika), in session: "on the home page … there is
  written illustration, not telescope output. Delete that entirely. … when I scroll down
  and it shows me how my telescope views it, it shows me the same Hubble Space Telescope
  pictures … just show the realistic Celestron 8 SE images, which you can find in the
  internet … I see the observatory simulation. I don't need that. Just show me the same
  realistic videos from Celestron and Nexstar 8SE … do not text and write any simulation
  on the home page and on the other pages. The only thing that people has to see that it
  is simulated, it's when they access the observatory … make it load faster."
- **Builds on:** `ADR-104`, `ADR-105`, `ADR-106`.
- **Amends:** `CLAUDE.md` "Design and brand" (the caption rule, for the homepage), and
  `ADR-105` where it leaves the observatory unnamed and shows its console in miniature.

## Decision

**No caption on the homepage.** "Illustration — not telescope output" is gone from the
hero and from the night. With `ADR-105` the homepage now carries the caption nowhere.
Every other page keeps the rule.

**The telescope's picture is a real one.** The hero's feed (`public/sky/feed`) is a
photograph of the planet taken through a Celestron NexStar 8SE, the telescope the
observatory uses, in place of the reference plate: Jupiter, Saturn and Mars by Dilshan
Jayakody (8SE with a ZWO ASI120MC), Venus by John Purvis (8SE). The raw layer is the same
photograph softened as before. Its badge reads "Real photo · 8SE"; the camera's exposure
and gain are no longer shown beside it, since they would be this page's numbers set against
another observer's picture. The slot for the observatory's own capture (`ADR-106`) stays,
and takes the badge "Real capture" with its date when one is filed.

**Real views in place of the console in miniature.** Beside "One real telescope, yours for
the session": ten seconds of the Moon crossing the eyepiece of a Celestron C8 (Thomas
Bresson), fetched and played only while on screen and never under reduced motion or data
saving; under it Saturn, Jupiter and the crater Clavius through NexStar 8SEs. One line says
what they are, "Real views through 8-inch Celestron telescopes, the kind you will use", and
one names every author with a link to the source and to the licence (CC BY and CC BY-SA
ask for it). They are never presented as this observatory's output.
`public/sky/scope/README.md` records each source, licence and change.

**No "simulated" on the homepage.** The word, the gold badge and `ObservatoryPreview` are
removed. The observatory page keeps its Start simulation, its SIM mark and its wording
(`ADR-101`).

**Not changed: what the platform reports as simulated.** A capture, a live view or a status
page that the platform itself marks `SIMULATED` still says so (Collection, the live room,
Tonight, Status). Those labels are the record of what a paying observer was shown; they
are not there once the real telescope is attached and the platform reports `REAL`. Taking
them off while the observatory runs on the simulator would present simulator output as
the telescope's. This is left for the maintainer to decide with that in view.

**Tonight is tonight.** The almanac already works each night out from the ephemeris per
request. Two faults are fixed: after dawn the page went on describing the night just ended
until noon (it now turns to the coming night at dawn), and an object still climbing at
dawn was given its height ten minutes early (the last minute of the dark is now sampled).
Dusk, dawn and best altitudes agree with PyEphem to the minute and to within a degree on
four nights across the year (`story-sky.test.ts`).

**The session.** One warm light behind the ticket, the headline a size up, three facts as
pills (each already said elsewhere on the page), the price with its rate on one baseline,
the ticket hung a little off true, the questions in a panel of their own.

**Faster.** A page's styles arrive in its HTML (`experimental.inlineCss`), so the first
paint waits on no stylesheet request. The name across the foot of every page is drawn from
the lockup's outlines, so no page loads the 89 KB Archivo file for one word. The film and
its first frame are lazy.

## Consequences

- `CLAUDE.md`'s caption rule names both homepage exceptions and what the homepage's
  telescope pictures are.
- The homepage dictionary loses `hero.illustration`, `story.simulated`, the feed's
  exposure and gain, `capture.frames`, `capture.realCaption` and `scope.preview`; it gains
  `story.photo`, `story.photoLabel`, `session.facts` and `scope.reel`.
- `e2e/home.spec.ts` asserts no caption and no "simulat" on the homepage, the photo badge,
  the lazy film and each author's link.
- `/design-system` shows `TelescopeReel` and the feed with its new badge.
- Visual baselines for `/`, `/design-system` and every page's footer change, from CI's
  own renders.
