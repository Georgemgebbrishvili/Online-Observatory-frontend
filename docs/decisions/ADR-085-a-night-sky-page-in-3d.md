# ADR-085 — A Night Sky page in 3D

- **Date:** 2026-11-07
- **Status:** APPROVED (2026-11-07)
- **Decided by:** project maintainer (Nika), in session: the brief "Stellar — loyalty, Night Sky 3D
  and Google Play", Prompt 2, "run all of them"; the record approved after review the same day.
- **Builds on:** `ADR-052` (every drawn frame is an illustration, never telescope output),
  `ADR-082` (the console's 2D sky dome and the twenty showpieces), the homepage's "Tonight's
  sky" strip (`features/sky/tonight-sky.ts`, astronomy-engine).
- **Amends:** `ADR-057`'s header (Observatory, Book, Stellar Explorer) by one entry, Night Sky.
- **Reverses, for this page only:** `ADR-076`'s removal of three.js from the homepage. The
  homepage stays without it.

## Context

Stellar has no free, open page that shows the sky as it is. The homepage strip lists tonight's
planets; the console's dome draws twenty showpieces for a booked session. A visitor who wants to
know what is up, and where, leaves for Stellarium or a phone app, and never sees that the
observatory could point at it tonight.

The pieces exist: `astronomy-engine` computes the Sun, Moon and planets exactly; the console
precesses J2000 positions (`precessJ2000ToDate`); the showpieces name what the 8SE shows best.
Missing are a full star catalogue (the console has 61 stars) and a renderer.

## Decision

1. **`/[locale]/sky`, "Night Sky" (KA "ღამის ცა").** A full-screen, real-time view of the sky
   for a place and a time, public, in the header after Book. `/tonight` links to it. It is the
   free hook into booking: every showpiece the 8SE can observe, and that the platform offers as
   a target, opens `/app/book?target=<slug>`.
2. **The renderer is three.js, and nothing else.** One new dependency, `three` pinned at
   `0.170.0` (MIT, published November 2024). Justification: WebGL by hand for a camera, a
   point-sprite shader, line sets, a textured sphere and picking is a renderer of our own to
   maintain; three.js is the smallest common one, tree-shakes, and has no runtime dependencies.
   It is imported dynamically, client-only, with no server render, so no other page carries it.
   The rest of the page (time bar, search, panel, toggles) is ordinary React.
3. **Positions come from astronomy-engine.** Sun, Moon and planets: `Equator(body, time,
   observer, ofdate, aberration)` then `Horizon(…, "normal")`, apparent topocentric alt/az with
   refraction, recomputed each frame. Stars and constellation lines are J2000 unit vectors
   uploaded once; each frame one matrix, `Rotation_EQJ_HOR(time, observer)`, turns the whole
   sky, and the shader adds the same refraction `Horizon` applies. A unit test holds the matrix
   path to astronomy-engine's own `Horizon` within 0.01°. Proper motion is ignored (under 0.1°
   for every catalogue star over a century), as the console already does.
4. **Data, and their licences.** Shipped as static files under `public/sky/data/`, built by
   `scripts/build-sky-data.mjs` from the sources below, under 400 KB compressed:
   - **Stars:** the Yale Bright Star Catalogue, 5th revised edition (Hoffleit & Warren 1991,
     CDS/ADC catalogue V/50; mirrored by the Harvard–Smithsonian Telescope Data Center),
     9,096 stars to V 6.5, with B−V. A catalogue of the NASA Astronomical Data Center,
     distributed without restriction; credited on the page. No copyleft.
   - **Constellation lines and Latin names:** `d3-celestial` by Olaf Frohn (BSD 3-Clause),
     after the IAU's figures. Credited on the page with the licence's notice in
     `public/sky/data/LICENSES.md`. Georgian names are ours.
   - **The Milky Way:** `d3-celestial`'s `mw.json` (BSD 3-Clause), five brightness steps of
     J. R. Vieira's Milky Way Outline Catalog, rasterised by the build script into an
     equirectangular texture. The underlying outline catalogue states no licence of its own;
     the maintainer should confirm it before launch, and the layer can be turned off by
     default without touching anything else.
   - **No GPL data.** Stellarium's catalogues and sky cultures are not used.
   - **Bright-star names** (EN) come from the console's own list; Georgian forms are ours.
5. **It is labelled a computed sky.** The page says, always visible: "Computed sky, not a
   telescope view" (KA "გამოთვლილი ცა და არა ტელესკოპის გამოსახულება"). The Moon is a lit
   sphere and the planets are discs: illustrations, by `ADR-052`'s rule, never presented as
   what the telescope sees.
6. **Place and time.** The observer defaults to the observatory (`features/booking/almanac.ts`).
   "Use my location" asks the browser; the position stays in the browser and is never sent to
   the platform. Time runs live, with ±1 h, ±1 day, speeds ×1/×60/×600/×3600 and Now; the clock
   shows Asia/Tbilisi and the viewer's zone.
7. **Sky brightness** follows the Sun: day above −0.833°, then civil, nautical and astronomical
   twilight at −6°, −12° and −18°, night below. Stars fade in by the sky's brightness; the Moon
   brightens the sky by its phase and altitude.
8. **Performance.** One draw call for the stars; device pixel ratio capped at 2; rendering
   pauses while the tab is hidden; the target is 60 fps on a mid-range phone (Chrome 4× CPU
   throttle).
9. **Accessibility.** Without WebGL the page lists what is up now (the `/tonight` sky list);
   keyboard arrows look around and +/− zoom; reduced motion turns inertia off.

## Consequences

- One dependency added; the page's script is loaded only on `/sky`.
- The star file, the lines and the texture are build outputs committed with the script that
  makes them, so a reviewer can rebuild and compare.
- `/app/book` learns `?target=<slug>`: the board opens with that object chosen when it is
  bookable.
- The header has four links.

## Amendment — 2026-11-08

Decided by the maintainer (Nika), in session: "make it visible on the Stellar website and
also on mobile".

- **The phone tab bar gains Night Sky**, between Book and Profile: four tabs where there
  were three. On a phone the header's links sit behind the menu, so without this the page
  was two taps deep. The labels lose their side padding and half their tracking so
  OBSERVATORY fits a 360 px tab whole; Georgian on a phone narrower than 480 px drops to
  12 px (`--font-size-tab-tight`).
- **The panel's rise, highest and set are one pass**, in order: for an object up now, the
  rise it is in, its highest, the set ahead; for one down, its next rise and the highest and
  set after it. Searched independently from twelve hours back, the panel could show the
  morning's set under the evening's rise.
- **The controls stack in flow**, top and foot, instead of sitting at fixed offsets that a
  wrapped Georgian row or a taller time bar ran into; the page subtracts the desk header's
  real 77 px, so the time bar no longer ends below the window.

## Amendment — 2026-11-08, later

Decided by the maintainer (Nika), in session: "it should look more like Stellarium with the
probable path of the object I choose … I have to be able to zoom in and see how the object
looks … it should also indicate which ones are above the horizon".

- **The selected object's path.** Twelve hours either side of the page's instant, in
  ten-minute steps from astronomy-engine (`skyPath`, held to the panel's own positions by
  test), drawn on a 2D overlay over the sky: solid above the horizon, dashed below it when
  the ground is seen through, a dot and a Tbilisi time at each whole hour, an arrow for the
  way it moves, and its rise, highest and set marked. A toggle ("Path of what you pick")
  turns it off. A turning four-arc marker shows what is selected.
- **Zoom to 1.2′.** The field narrows from 5° to 0.02°. "Look closer" (or a double tap)
  frames the object, and the view follows it as the sky turns, until the visitor drags.
  - **Planets and the Moon:** each is drawn on a disc at its true apparent size, from the
    photographs the console already ships (`target-photos.ts`, credited on the page). The
    disc is turned to the body's IAU pole and lit from the body's own direction to the Sun,
    so its phase and the tilt of its terminator are right. By day the disc's dark side lets
    the sky through.
  - **Venus** is a plain cloud deck: its photograph is a radar map of the ground.
  - **Saturn** is a globe with rings in 3D, so the rings open as they do from here, with the
    globe's shadow on them and theirs on the globe.
  - **Jupiter's four moons** come from astronomy-engine, light-time corrected; they agree
    with PyEphem to within 1″.
  - **Deep-sky showpieces:** their painted plates (ADR-082) at true size, north up.
  - **Doubles:** framed tight enough to split.
  - **Out of focus:** a planet too small for a disc is a point of light sized like a star of
    its magnitude.
  - **The caption:** when the view is narrower than 3°, the time bar's caption reads
    "Illustration — not telescope output" in place of "Computed sky".
- **Stellarium's look.** It is a look, not a copy of Stellarium's art:
  - **Stars:** bright stars carry a soft halo. Near the horizon, stars dim and redden by
    airmass (0.22 mag per airmass) and twinkle; there is no twinkle with reduced motion.
  - **The sky:** it has a faint glow low down at night, a blue day paler toward the horizon,
    and a warm twilight band on the Sun's side.
  - **The horizon:** a silhouette of far hills and a near tree line, never above 2.4°. It is
    an illustration, not the observatory's measured horizon, and rise and set stay
    geometric.
  - **The Milky Way:** it fades out below a 12° field, where it would only grey the
    background.
- **Above or below the horizon, everywhere.**
  - **Search results:** each carries "Up 34°" or "Below".
  - **The panel:** it opens with "Above the horizon · 49° up, S", "Below the horizon · rises
    …", "never sets here" or "never rises here".
  - **The list:** it now holds the Moon, the planets and the showpieces: those up, by
    height, with their direction, and those below, with their next rise; each one flies
    there.
  - **Labels:** below the horizon, with the ground seen through, they dim.
- **On a phone** "Look closer" folds the panel to its head (Details unfolds it), so the
  object shows above it; an opened list sits above the panel, and the desk panel ends above
  the time bar and the list button instead of covering them.

## Amendment — 2026-11-11

Decided by the maintainer (Nika), in session: "Upgrade the night sky experience, its graphic
and accuracy. Make sure it's accurate every day."

- **Stars move to the day.** `stars.bin` now carries each star's proper motion (seven
  numbers a star). The page carries every star from epoch 2000 to the day it opens
  (`starsAtDate`); Arcturus has gone an arcminute since 2000, which a close view shows. This
  replaces decision 3's "proper motion is ignored". A named star takes the catalogue star's
  moved place.
- **Stars lean by aberration.** The Earth's velocity over light's (`aberration`,
  astronomy-engine's `BaryState`) is added to every star, line and Milky Way direction in the
  shader and in `horizontal()`, up to 20.5″, as astronomy-engine already leans the planets.
  A star and a planet now keep their true distance apart. `fixedAltAz` and a star's path
  go through the same sum as the shader.
- **The clock is the wall clock.** The simulated instant is anchored to `Date.now()`, not
  `performance.now()`, which stops while a laptop sleeps: a tab left open overnight shows the
  sky of the moment, not of the evening before. The page starts from the visitor's clock
  unless it runs more than five minutes behind the server's.
- **A test against JPL.** `accuracy.test.ts` holds the Sun, Moon and planets to NASA JPL
  Horizons at nine instants each from November 2026 to June 2030 (apparent, topocentric):
  within 30″ and 0.25 magnitude. Measured on the day: 20″ at worst (Saturn), under 12″ for
  the Sun, Moon, Mercury, Mars and Jupiter. The reference values are a fixture in the
  repository; the test needs no network.
- **Coordinates round whole.** The panel rounded minutes after splitting off the degrees and
  could print `+45° 60′`; it now rounds first.
- **The Milky Way is NASA's.** Deep Star Maps 2020 (NASA/Goddard Space Flight Center
  Scientific Visualization Studio; Gaia DR2: ESA/Gaia/DPAC; not copyrighted, credited on the
  page), tone-mapped to a 2048 × 1024 texture in colour, with its dust lanes. It replaces the
  five outline steps of d3-celestial's `mw.json` and with them decision 4's open licence
  question about the outline catalogue. It fades toward the horizon and with twilight. The
  build script decodes the OpenEXR source with `ffmpeg`.
- **Stars read as stars.** A star's drawn size and glow grow with its brightness along the
  whole scale, the core whitens and the colour lives in the glow; a star at the limiting
  magnitude is a faint point instead of nothing. Constellation lines are fainter than the
  stars they join.
- **A planet the sky hides is not labelled.** Neptune, at any wide view, has no label until
  the view is narrow enough to show it, or it is picked.
- **The time bar is one row shorter on a desk.**
- **Data size.** `stars.bin` 255 KB and `milkyway.webp` 157 KB before transfer compression.
