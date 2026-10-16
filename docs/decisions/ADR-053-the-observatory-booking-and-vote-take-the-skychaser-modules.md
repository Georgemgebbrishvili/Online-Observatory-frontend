# ADR-053 — The observatory console, the booking board and the weekly vote are the Skychaser site's modules

- **Date:** 2026-10-16
- **Status:** APPROVED
- **Decided by:** project maintainer (Nika), in session: "take the booking design and
  voting design on stellar site from skychaser. as well as observatory module, it should
  be exactly same as skychasers observatory module."
- **Builds on:** `ADR-052` (every surface takes the Skychaser visuals), `ADR-050`/`051`
  (the live room and the three verbs), `ADR-015`/`ADR-043` (slots, bookings, the hold).
- **Supersedes:** `ADR-041` (the observatory scene at `/observatory`) in full; the
  booking night-then-slot pages of Phase 3 as a layout (their reads and their flow stand).
- **Source:** `~/Desktop/Skychaser/app` at `7dc25cc5` (2026-10-14). The console as it
  stands in the tree (`src/components/skychaser/observatory/**`, `src/lib/observatory/**`,
  `src/components/observatory/LiveView.tsx`); the booking board and the vote as the site
  last served them, at `1aeca250^` (`src/components/skychaser/booking/BookingConsole.tsx`,
  `src/styles/skychaser-booking.css`, `src/app/vote/page.tsx`, `SkychaserBallot.tsx`,
  `TonightSkyChart.tsx`), since `1aeca250` replaced them with "coming soon" pages.

## Context

ADR-052 took the Skychaser site's look. The maintainer now wants three of its modules
whole: the observatory console that drives a simulated mount through connect, calibrate,
point and capture; the one-screen booking board (a night, a start, a target, the session
beside them); and the weekly vote with its ballot, its sky chart and its leading target.

This repository's rules make a literal copy impossible in three places, and this record
says how each is resolved.

## Decision

1. **`/observatory` is the console.** The Skychaser console and its sky model are ported
   as written into `components/observatory-console/` and `lib/observatory-sim/`, on
   `astronomy-engine`. The page keeps its route, its metadata and its JSON-LD; the scene
   of ADR-041 (the floating card, the field plate, the dock, the instrument and safety
   sections) is removed. The console draws its own header: the lockup, the five public
   destinations, the clocks, the badge, night mode, the language switch and the account.
2. **What the platform supplies, the console shows.** The open station carries the
   platform's name for the observatory (`BookableObservatory.nameEn`/`nameKa`); the quick
   start points at tonight's highest observable target from `GET /targets/tonight`,
   mapped to the sky model's catalogue by body, designation or slug; the cloud figure is
   the platform's forecast. Everything else in the console is the sky model's.
3. **Honesty rules stand, in the console's own dress.** Unless the platform reports
   `mode: REAL`, the header and the phone pill read **Simulated** in gold, the feed's HUD
   reads *Simulated feed*, every frame's provenance reads *Simulated · sky model*, and the
   frame carries "Illustration — not telescope output" at its foot. Skychaser's cards,
   rarities and card plates are not copied: where the source drew a card's plate, the
   console draws our own plates (`public/plates/*.webp`) or the model's disc; the one
   telescope-view illustration of Saturn (`/plates/scope/saturn.webp`) comes across as an
   illustration. The reference photographs the sky model paints with (NASA / ESA public
   domain, Wikimedia Commons, credited in `lib/observatory-sim/target-photos.ts`) are the
   model's inputs, never shown as the telescope's output.
4. **The console is exempt from the token rules, and only the console.** Its stylesheet
   `styles/observatory-console.css` keeps the source's literal colours and sizes (its
   dialogs portal to `<body>`, outside every token scope), and its components keep their
   refs and timers: stylelint's colour and type-scale rules and ESLint's colour-literal
   and React Compiler rules are turned off for those paths in `stylelint.config.mjs` and
   `eslint.config.mjs`. Its width boundaries are the five named breakpoints, with
   container queries where the source drew a line between them (`docs/plan/03-design-system.md` §3).
5. **The console speaks Georgian.** Every string lives in
   `components/observatory-console/copy.ts` in both languages; `:lang(ka)` gives the
   console the Mkhedruli faces, untracked (ADR-052 §2).
6. **The four stations after the first are the source's, listed as coming soon.** They
   are the sky model's fiction, named as the source names them, never connectable, and
   nothing on them is a claim about this product's roadmap. The maintainer may strike
   them by amending this record.
7. **`/app/book` is the booking board.** One screen: the nights, the starts, the targets,
   and the session beside them, in the board's own stylesheet rewritten on our tokens.
   The data is the platform's: `GET /slots` for each of the seven nights, `GET
   /targets/visibility` for the chosen slot, `POST /bookings` with an idempotency key
   and the checkout redirect as before (ADR-043), `POST /bookings/{id}/reschedule` for a
   lost slot. Credits, packs and card-paid sessions are Skychaser's rail and are not
   copied: the session shows the slot's price in its currency and one button to reserve
   and pay. `/app/book/reserve` redirects to the board with its slot chosen. "Your nights"
   stays under the board (ADR-051 N2).
8. **`/vote` is the weekly vote.** The ballot, the leading target, the night's sky chart
   and the week's facts, as the source laid them out, on the platform's catalogue: the
   candidates are the targets observable this week at the first-party observatory, their
   tracks drawn by the sky model. Casting a vote needs the platform (a weekly tally per
   signed-in customer), which this repository may not invent: it is filed as
   `docs/platform-requests/weekly-vote.md` and built there as the platform's ADR-050
   (`GET /votes`, `POST /votes`, one vote per customer per week, locked Sunday 13:00 UTC).
   The ballot reads the platform's week, candidates and counts, casts from the browser,
   and shows the caller's own vote; when the ballot cannot be read it shows the sky with
   nothing to cast. Skychaser's holder weights are its wallet's and are not copied.

## What stays binding

- ADR-052's palette, type, mark and glow; its honesty rules in full.
- WCAG 2.1 AA on every surface, in both languages, at 390 and 1440 (axe in CI).
- No coordinates, no "cooled" camera, no claim the platform does not back on any page.
- Nothing here addresses the mount or the camera: the console drives a model, and the
  live room (ADR-050) alone carries real commands, through the platform.

## Consequences

- `astronomy-engine` joins `apps/web`'s dependencies.
- `components/observatory/{field-plate,star-field,site-clock,observatory-page}.tsx`,
  `styles/observatory.css` and the design system's observatory-scene specimen go.
- `e2e/home.spec.ts`'s observatory tests, `e2e/visual.css` and the visual baselines for
  `/observatory`, `/app/book` and its reschedule, and the new `/vote`, change together;
  `/app/book/reserve` leaves the baseline list, since it redirects.
- Built in three slices — the console, the board, the vote — each with its gates.
