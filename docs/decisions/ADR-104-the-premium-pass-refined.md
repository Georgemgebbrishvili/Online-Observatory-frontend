# ADR-104 — The premium pass, refined: one light, fewer effects, finer type

- **Date:** 2026-11-24
- **Status:** APPROVED (2026-11-24)
- **Decided by:** project maintainer (Nika), in session, approving the plan and its five
  choices: pin the hero and the night, the showpieces a row to swipe, the session and the
  telescope unpinned and merged as planned; Sentry's client after idle and the homepage at
  200 KB of script or less, the budget not relaxed; ADR-053/058/083's exemptions kept (the
  console, the hub and the cards take token polish only); the horizon kept as the one
  documented exception to the light, inside the scene only; the live room's blue and violet
  auroras removed.
- **Builds on:** `ADR-052` (the Skychaser visuals), `ADR-075` (the poster button and the
  cream stock), `ADR-100` and `ADR-102` (the premium pass), `ADR-103` (the scroll story).
- **Supersedes only these details:** ADR-102's travelling edge on the featured plan, the
  field's focus glow, the pointer light on every panel and the ticket's coloured shadow;
  ADR-100's showpiece halo in each object's colour, the header's animated blur and the fade
  every page arrived with; ADR-103's four pinned scenes and three canvases. Nothing else in
  them changes.

## Decision

Same look, more intention. Nothing is rebranded: the palette, the faces, the radii and
the poster button are ADR-052's and ADR-075's. This pass consolidates and deletes before it
adds.

### One light

**The key light is warm and comes from the top-left** (`--light-angle`, 150deg;
`--color-key-light`, the sunset's palest step). Every rim (`--gradient-edge`,
`--shadow-rim`), every sheen (the ticket's, the filled button's), every halo
(`--gradient-halo`, offset toward the top-left) and every drop shadow agrees with it.
`--gradient-tile` turns from 160deg to the same 150deg.

**The one other light is the horizon's** (`--shadow-horizon`, `--gradient-horizon`): a
planet's limb lit from below on the homepage's hero and sign-off and on `/tonight`'s empty
state. It is light inside the drawn scene, not light on the interface, and stays the only
exception.

**The site's backdrop** loses its blue and violet washes (`--color-sky-blue`,
`--color-sky-violet`, and `--st-sky-blue` / `--st-sky-violet` behind them). In their place,
the key light's warmth at the top-left (`--color-sky-warm`) over the red below. The live
room's atmosphere does the same, and its two blue and violet auroras are removed
(`--room-blue`, `--room-violet`).

### The glow budget

ADR-052 §4's list is the set: filled buttons (`--shadow-pill`, softened), the LIVE pill and
its LED, the console's current step, the active tab's icon; and ADR-100's eyepiece halo,
now one warm halo for every showpiece instead of a wash in each object's colour, which
read as blue and teal nebulae behind the galaxies and clusters. The horizons are the focal
glow of their screens; `/gift`'s is the floor glow under the ticket. At most one glowing
focal point a screen besides the header's button.

Taken out or brought down to a rim:

- the current nav link's white halo (`--glow-nav-current`); the drawn underline stays;
- the account button's red halo (`--glow-account`); its ring colour stays;
- the Explorer launch button's own glow (`--glow-launch`), now a filled button's;
- the featured plan's travelling lit edge (`--color-featured-lead`, `-tail`), now a still
  rim warmed by the key light;
- the field's focus halo (`--shadow-field-focus`); the border and the `--st-red-ink` focus
  ring remain;
- the ticket's orange drop shadow (`--filter-ticket` keeps its black one).

The camera badge's glow (`--glow-badge`) was never drawn; the token is removed with the
other unused ones.

**The pointer light** brightens a rim, at one radius (`--size-spot`) and in the key light's
colour, on hero-level pieces only — the pricing plans, the sign-in card, the ballot's cards
and the gift ticket — and only on a fine pointer. A touch screen never gets it, nor the
ticket's lean or its moving sheen. The button sheen stays on the filled button only.

### One glass

`--color-glass` (the bar at 80%), `--blur-glass` (`blur(20px) saturate(150%)`, was
24px/170% here, 14px/140% on the header, 18px/140% on the tab bar), the `--gradient-edge`
rim and `--shadow-glass`. The header, the phone tab bar, the panels and the dialogs take
it. Over a drawn sky or a star field it takes `--color-glass-deep` (90%), measured for AA
over a star as bright as the ink. The header's glass is a layer behind the bar, faded in
when the page scrolls; it no longer animates its own backdrop filter. No glass over glass:
the outlined button is no longer frosted.

### Type

Twelve steps: display, hero, h1, h2, h3, section, figure, body-lg, body, label, caption,
mono, with kicker (13px) as the floor. Folded into them: hint and tab (kicker), stat
(body-lg), price-big (figure), readout, time and tile (h3), closer and hero-horizon (hero).
The hero now follows the height as well as the width. Georgian has its own steps at about
0.85x (`--font-size-hero-ka`, `--font-size-section-ka`) and headline leading of 1.18
(`--leading-display-ka`), so descenders never clip; Mkhedruli is never uppercased or
tracked. Kept outside the scale, each for its reason: the bar's 15px links, the wordmark's
box, the footer's decorative name, the phone hero's height-only step, and the Explorer
title and gift ticket title, which join the scale in their own pages' passes. The 12px
Georgian tab size is gone: the tab bar gives the room instead. Headlines balance their
lines. Anton tracks by size (`--tracking-display`, `--tracking-hero`,
`--tracking-headline`); the story's Geist titles share `--tracking-tight`.

`--font-size-small` (sign-in) and `--color-border` (collection, gift), referenced but never
defined, now point at the scale and the subtle rule.

### Motion

One entrance: `@keyframes enter`, a rise of `--distance-enter` (1rem) and a fade over
`--duration-enter` (750ms) on the out-expo ease, staggered by `--stagger` (75ms).
Transform and opacity only: the blur is gone from the scroll reveal and the sign-in card.
What is on screen when a page opens only settles (`@keyframes settle`, a rise without a
fade) — the sign-in card, the gift ticket, the homepage's lede — so its words are painted,
and counted as the page's largest paint, at once. ADR-100's fade of the whole page on
arrival is removed for the same reason: it held every page's largest text back by its
length.
The homepage's first screen arrives in order — the headline's words, the lede, the buttons,
the horizon — done by 1.2s. Answers in the FAQs open at once and their words fade up; no
height is animated. Reduced motion holds everything still, unpinned, with no smooth
scrolling, no drift, no twinkle and no meteor.

### The homepage (ADR-103's story)

- **Two pinned scenes:** the hero (+120% of the screen, was +200%; +70% on a phone) and
  the night (+100%, was +240%; +50% on a phone). On a phone the showpiece row is at most
  42rem tall.
- **The showpieces are a row to swipe**, native scroll snapping, with Previous and Next
  arrows on a wide screen and dots. Each object sits in its eyepiece with a graduated ring
  drawn in SVG and the one warm halo; plates through `next/image`, AVIF or WebP at the
  size each screen needs.
- **The session** is in the page's flow; its ticket prints as it is scrolled to.
- **The telescope joins the sign-off**: its facts as a row above *The night is yours*, the
  same words, one screen, over the closing horizon.
- **One canvas**, fixed under the header behind the two pinned scenes, draws the hero's
  sky or the night's, whichever is in view, paused when neither is or the tab is hidden,
  at most twice the CSS resolution. The stars lie in three depths that drift 0.3, 0.6 and
  1 of a small shift with a fine pointer; they twinkle slowly (three to seven seconds,
  never below 60%); a meteor crosses at most once in twenty seconds.
- **The feed** is two layers of one drawing (`public/sky/feed/`): a raw sub and the
  settled stack, cross-faded by opacity under moving grain; badged Simulated, captioned
  as an illustration.
- **Loading:** GSAP, ScrollTrigger and the sky's code arrive once the page is idle; Lenis
  only on a fine pointer; the star catalogue once the sky is in view. The sky no longer
  brings astronomy-engine to the browser (the catalogue reader and `precess` moved to
  their own modules).

### Script on every page

- `instrumentation-client.ts` sets zod's `jitless` from zod's core, not the whole of zod,
  and starts Sentry once the page is idle (its Web Vitals read buffered entries).
- The tonight banner loads its platform reader and the contract's schema with the read;
  the response is still validated before anything shows.
- **The sign-out button** (`components/auth/sign-out-button.tsx`) loads the sign-out call
  and the navigation helper on the click instead of with every header. Same calls, same
  order, same destination; noted here because the file is an auth component.

## Measured

Local production build (`next build && next start`) against `e2e/fake-platform.mjs`, on
the maintainer's MacBook Pro (2017).

**The homepage**, at `f860be1` and after this pass:

| | Before | After | Target |
| --- | --- | --- | --- |
| Height, 1440 × 900, English / Georgian | 14,868 / 14,886 px | 6,609 / 6,652 px | ≤ 7,000 |
| Height, 390 × 844, English / Georgian | 8,993 / 9,089 px | 5,837 / 5,971 px | ≤ 6,000 |
| Pinned scenes, desktop / phone | 4 / 2 | 2 / 2 | ≤ 2 |
| Canvases | 3 | 1 | 1 |
| Lenis on a touch screen | on | off | off |
| Horizontal scroll, 360–1440 | none | none | none |
| Script in the first load (gzip) | 299 KB | 161 KB | ≤ 200 KB |
| All script by the end of the load, deferred included | 299 KB | 262 KB | — |

First-load script on the other pages: pricing 152 KB, tonight 155 KB, terms 152 KB (zod no
longer loads with the header); gift 194 KB and sign-in 196 KB, whose forms validate.

**Lighthouse**, mobile preset (simulated slow 4G, 4× CPU), median of three runs each:

| Page | Performance | LCP | CLS | TBT |
| --- | --- | --- | --- | --- |
| `/` | 48 → 53 | 5.17 → 4.42 s | 0 → 0 | 5,589 → 3,014 ms |
| `/pricing` | 52 → 81 | 4.83 → 3.99 s | 0 → 0 | 5,149 → 208 ms |
| `/tonight` | 54 → 81 | 4.52 → 2.90 s | 0 → 0 | 3,571 → 507 ms |
| `/gift` | 49 → 75 | 4.84 → 4.03 s | 0 → 0 | 9,302 → 488 ms |
| `/sign-in` | 54 → 67 | 4.50 → 3.78 s | 0 → 0 | 2,031 → 1,034 ms |

This machine scores 598–1,466 on Lighthouse's own CPU benchmark from run to run, and the
4× slowdown is applied on top of it, so the same runs with the slowdown at 2× are
recorded too: `/` 49 → 77, `/pricing` 62 → 86, `/tonight` 72 → 93, `/gift` 67 → 87,
`/sign-in` 55 → 80 (LCP 3.2–4.1 s, CLS 0).

**Not met: LCP ≤ 2.5 s and Performance ≥ 85 on every page at the 4× preset.** Measured in
the browser under the same 4× slowdown, each page's largest paint now comes 0.5–0.9 s
after its first, not at the end of an animation. What remains is `app/[locale]/loading.tsx`:
it puts every page behind a Suspense boundary, so the page's own content streams in after
the loading shell and is swapped in by React's inline script, which waits for the main
bundle. That is the loading state and the data's streaming, not the visual pass; it is
left to its own decision. On the homepage the rest of the blocking time is GSAP setting up
its two scenes once the page is idle.

## Consequences

- Visual baselines change for every page (the backdrop, the header, the glass), most of
  all `/` and `/design-system`. They are taken from CI's own renders after the push, as
  ADR-099, ADR-100 and ADR-102's were.
- `/design-system` shows the eyepiece, the row's arrows (at rest, as on hover, as on
  keyboard focus, disabled), the feed at both depths, and the filled and outlined buttons
  as on hover and on focus.
- `docs/design/brand-tokens.md` is marked stale: the v2.0 palette, which ADR-052 replaced.
- About eighty unused tokens are removed, among them the fourteen `--planet-*` of a sky
  strip ADR-103 deleted.
- `e2e/home.spec.ts` follows the story: five sections, one canvas, two pins, the arrows,
  the night's caption, no Lenis under reduced motion. `e2e/a11y.spec.ts` scans the booking
  board after its reads: the board dims its targets to 60% while it reads them (2.93:1,
  below AA), reads them more than once as it opens, and ADR-100's page fade no longer
  covers that moment. The same scan fails 1 time in 24 at `f860be1` too; the dim itself is
  for the booking page's pass.
- Three end-to-end tests already fail at `f860be1` and still do: the English hero's
  "in Georgia" line and `/tonight`'s "live from Georgia" heading, both removed from the
  copy on 2026-11-16 (`da7800a`), and the phone-pointing sky test, which reads a
  `window.__sky` hook the page no longer has.
- Left for the pages' own passes: the booking board's target washes (cluster, nebula and
  star blues) and the live room's glass recipe; the console, the hub and the cards keep
  their ADR-053/058/083 exemptions and take token polish only.
