# ADR-105 — The showpieces centred, the observatory unnamed

- **Date:** 2026-11-25
- **Status:** APPROVED (2026-11-25)
- **Decided by:** project maintainer (Nika), in session: "make this moon section better, moon
  should be in the middle, and every others in the middle. get rid of the illustration note
  at bottom right. also make instrument section better, don't mention which telescope is
  it, just observatory and some telescope observing animation or observatory page preview
  animation. also delete references from this section. fix Georgian as well." Asked whether
  the showpieces should carry a photo credit instead, the maintainer chose to remove both
  the caption and the credits; asked which animation, the observatory page preview.
- **Builds on:** `ADR-104` (the premium pass, refined) and `ADR-103` (the scroll story).
- **Amends:** `CLAUDE.md` "Design and brand", for the homepage's showpieces only (below).

## Decision

**The showpieces, centred.** The heading sits over the row, centred and on one line where it
fits. Each object is in the middle of the screen in its eyepiece, with its graduated ring
and the one warm halo; under it, centred, its best time, its name, its note, its height and
direction, and its booking link; under those, the row's dots with the Previous and Next
arrows either side, on every width. The eyepiece takes the height the words leave it, so
no script fits it any more. The kind is dropped where the name says it already: the Moon is
"Best time 02:01 · The Moon", not "Moon · Best time 02:01 · The Moon".

**No caption on the showpieces, no picture credits on the homepage.** The bottom-right
"Illustration — not telescope output" under the showpieces and the closing paragraph of
picture and data credits are removed. This is an exception to `CLAUDE.md`'s rule that every
drawn object is so captioned, for the homepage's showpieces only, by the maintainer's
decision; the drawn skies of the hero and the night keep their caption, the simulated feed
keeps its "Simulated" badge, and every other page keeps the rule. The star data's sources
and licences stay where they are recorded, `public/sky/data/LICENSES.md`.

**The observatory, unnamed.** The section that was "The instrument" names no telescope: no
type, aperture, focal length or mount. It is "The observatory": one real telescope, yours
for the session, and what it does for you — turns to your target, finds it in the sky,
centres it and follows it. Beside it, the observatory page in miniature
(`ObservatoryPreview`): its console's five steps (Align, Slew, Solve, Center, Track, as the
console names them) lit in turn, the field sliding past as the telescope slews, the reticle
closing on the solved field, tonight's target centred and its frames stacking up, the
altitude counting to tonight's. A ten-second loop in CSS — transform, opacity and three
registered counters — run only while it is on screen; under reduced motion it stands still
with Track lit and the stack complete. It is badged "Simulated" and named as a simulation
for a screen reader.

**Georgian.** The hero's lede reads "დაჯავშნე ნამდვილი ტელესკოპი და უყურე ცას პირდაპირ
ეთერში." ("live" is "პირდაპირ ეთერში", not a bare "პირდაპირ"); the night card's slewing
line reads "მიემართება ობიექტისკენ: {name}…"; the observatory's words are new in both
languages, with the console's own Georgian for its steps. Mkhedruli is never uppercased or
tracked: the steps drop the label tracking in Georgian, and wrap rather than cut a word
short on a phone.

**The feed's ground.** The feed's two layers are screened onto the black and fade out toward
their edges, so a plate's not-quite-black ground leaves no square behind the object, in
the hero and in the preview alike.

## Measured

Local production build against `e2e/fake-platform.mjs`:

| Homepage height | English | Georgian | Target |
| --- | --- | --- | --- |
| 1440 × 900 | 6,908 px | 6,928 px | ≤ 7,000 |
| 390 × 844 | 5,783 px | 5,990 px | ≤ 6,000 |

On a phone the pinned scenes scroll through +65% (the hero) and +40% (the night) of the
screen, the showpiece row is at most 40rem tall, the preview's view is 16:9, and the
observatory keeps its own link while the Night Sky's is left to the tab bar. Two pinned
scenes, one canvas and no horizontal scroll at 360, 390, 768, 1024 and 1440 in both
languages.

## Consequences

- `CLAUDE.md`'s caption rule names this exception and this ADR.
- `e2e/home.spec.ts` asserts the new state: no caption under the showpieces and no credits;
  the night's caption kept; no telescope type, aperture or focal length; the preview named
  as a simulation and badged; the arrows on a phone. The English hero test follows the
  2026-11-16 copy, which names neither Tbilisi nor Georgia.
- `/design-system` shows `ObservatoryPreview`, and the eyepiece without a caption.
- The homepage dictionary loses `scope.optics`, `scope.focal`, `scope.mount` and
  `closer.credits`, and gains `scope.preview` and the new observatory copy; `home-shell`
  no longer reads the observatory record's telescope.
- Visual baselines for `/` and `/design-system` change, taken from CI's own renders.
