# Stellar — the roadmap to launch

Written 2026-10-02 from an audit of the plan, the code, and `darkview-platform` at
`f2f51db`. It replaces the "Sequence" in [`02-build-phases.md`](02-build-phases.md),
which stays the record of Phases 0–4. The decisions behind it:

- [ADR-036](../decisions/ADR-036-ten-observers-and-a-refund-for-the-time-a-close-takes.md):
  ten observers, and a refund when a session is closed.
- [ADR-037](../decisions/ADR-037-web-first-launch-and-design-before-breadth.md): web
  first, design before breadth, `/app/live` redirects.
- [ADR-039](../decisions/ADR-039-every-surface-takes-the-stellar-poster-language.md): every
  surface takes the Stellar poster language (ADR-038 superseded).

## Where we are

| Phase                                         | State       | Evidence                                                                                          |
| --------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| 0 Rename, tokens, issues                      | Done        | `074d4cc`, `0071602`, issues #1–#3                                                                |
| 1 Shell, breakpoints, shell contract          | Done        | One item open: route groups and layouts, plus `[targetSlug]` carrying a mission id                |
| 2 Targets, collection, dashboard              | Done        | `d059f31`, `da33bd2`, `e77e36c`                                                                   |
| 2 `/v1/*` shared-observation debt (#1)        | Done here   | Deleted by 4.5 ([`phase-4/05-watch.md`](phase-4/05-watch.md)), on `getMissionWatchView`           |
| 3 Slots, reserve, checkout, bookings, refunds | Done        | `43b45f6`, `820207f`, `78f6961`, `d9c20df`                                                        |
| 3 Resume a pending payment                    | Blocked     | [booking-payment-intent](../platform-requests/booking-payment-intent.md), unanswered              |
| 4.1–4.3 Room: read, live, controls            | Done        | `992e476`, `c10d979`, `1ce8b84`, `5c6528e`                                                        |
| 4.4 Sharing control                           | Done here   | [`phase-4/04-sharing.md`](phase-4/04-sharing.md); the watch link is on since 4.5                  |
| 4.5–4.6 Watch page, observer seat             | Done here   | [`05-watch.md`](phase-4/05-watch.md); paying needs platform request `observer-pack-checkout`      |
| 4.7 `/app/live` redirect                      | Done here   | A3: the live or imminent mission's room, else booking (`features/missions/active.ts`)             |
| 4.8 Failure screens                           | Not started | Track A below                                                                                     |
| 5 Commerce and account                        | Not started | Split by ADR-037: account before launch, the rest after                                           |
| 6 Mobile                                      | Not started | After launch (ADR-037); no `apps/mobile`                                                          |
| Hosted demo                                   | Paused      | Platform PR #166 unmerged; production Vercel has no env vars                                      |
| Hardware                                      | None        | No mount, camera or focuser on site. `MAX_ALT_SAFE` is unmeasured; the camera binding is unpinned |

## What was wrong with the plan

Ranked. Each one is fixed by the tracks below.

1. **It shipped a broken link.** Slice 4 copied a watch link to a page that still calls
   the retired `/v1/*`, which the platform does not serve. On a real platform every
   shared link would fail. The link is now held back until 4.5 rebuilds that page.
2. **It had no launch.** It ended at "polish". Nothing covered:
   - the real payment provider (no adapter exists)
   - live refunds (sandbox only)
   - legal text (sections still "pending")
   - the notification emails (verification only)
   - production secrets
   - the domain
   - error monitoring
   - the hardware first light

   Track F and Track G now cover these.

3. **Breadth came before what a launch needs.** Loyalty, vouchers, subscriptions and
   partner self-service sat ahead of Georgian QA, accessibility and the visual pass.
4. **Account basics are absent from the contract.** There is no password reset, email
   change or account deletion. Deletion is a personal-data obligation. DV-079 had
   nothing to wire.
5. **Phase 2's "done" was false.** `/app/live` and the watch page still render
   fixtures, with hand-written types that cross the process boundary, against
   `CLAUDE.md`.
6. **The hardware was a risk, not a dependency.** Several things cannot be verified on
   the simulator:
   - `MAX_ALT_SAFE`
   - nudge orientation on the image
   - ten-observer fan-out on the uplink
   - real frame metadata

   Phase 1 cannot launch before them.

7. **Phase 4's "every failure state has a screen" had no owner.** No slice listed the
   states.
8. **Mobile's lead time was unrecorded.** The Apple enrolment status is unknown.
9. **The design was two products.** The homepage and the app ran different type and
   night (ADR-038). The app sidebar stopped halfway down long pages. One bordered box
   served every purpose. Every app page used the hero type size. Georgian pages carried
   Latin strings ("Observer", "Tbilisi", the simulated badge).

## The order of work

Every slice follows the surface loop in `CLAUDE.md`:

- states listed in en and ka
- contract trace
- build on the stack
- e2e and visual baselines in both languages
- adversarial review, then commit on `main`

"Blocked" names who unblocks it.

### Track A — Finish the live room (Phase 4)

| #   | Slice                                                                                                                                                                                 | Done when                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| A1  | **4.5 Watch page** on `getMissionWatchView`, join and leave. Delete `features/shared-observations` and every `/v1` call (closes #1). Turn the sharing panel's watch link on.          | `grep -r "/v1/" apps/web/src` is empty; an observer watches the simulated session |
| A2  | **4.6 Observer seat** purchase (DV-106) through `purchaseObserverPack` and the sandbox checkout                                                                                       | A second account pays and joins, and the owner's count rises on reload            |
| A3  | **4.7 `/app/live` redirects** to the active session, or to booking (ADR-037). Delete `features/live/`                                                                                 | No fixture behind `/app/live`                                                     |
| A4  | **4.8 Failure screens**: `WEATHER_HOLD`, `NOT_VISIBLE`, `HARDWARE_ERROR`, `CANCELLED`, `FAILED`, heartbeat loss, agent offline. One `fake-platform.mjs` scenario each                 | Each state has a designed screen and an e2e test in both languages                |
| A5  | **4.9 Close refund copy**: the close confirmation and the watch page say what an observer gets back. Blocked on platform #168 merging and #169 (the read path), then `contracts:sync` | The copy matches `ObserverPack.refundedMinor`                                     |

### Track B — The design pass ([ADR-039](../decisions/ADR-039-every-surface-takes-the-stellar-poster-language.md))

The maintainer rejected the built look on 2026-10-02 and chose the Stellar project's
poster language (`stellarr.club`): pitch black, cream ink, Anton and Oswald, orange
actions, yellow for live, and the console's panels in the live room. No glow, no
reticle. ADR-038's direction was superseded before it was built. Every slice regenerates
its baselines in both languages.

| #   | Slice                                                                                                                                                                                                                 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | **Foundations:** tokens, fonts (Georgian included), buttons, panels, chips, kickers, stats, form controls. The app shell's header, sidebar and footer. `/design-system` shows them all. Stale stylelint exemptions go |
| B2  | **Homepage:** a poster hero in place of the planet hero, then the sections below it (how a session works as a step row, the targets, the observatory, the call to book)                                               |
| B3  | **Live room and watch page:** the console's panels, step tracker, dial and controls, with one orange action under a clean picture                                                                                     |
| B4  | **Public pages:** observatory (with `/network` folded in), status, pricing, and the legal pages                                                                                                                       |
| B5  | **App pages:** home (no empty halves), targets and a target, booking and its night, bookings, collection, and the coming-soon placeholders                                                                            |
| B6  | **Visual gate coverage:** auth, 404, error and the operator console get baselines                                                                                                                                     |

Track A slices that come after B1 are built in the new language, so nothing is styled
twice.

### Track C — Launch-critical platform and account

| #   | Slice                                                                                                         | Blocked on                                       |
| --- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| C1  | Platform requests: password reset, email change, account deletion. File them, then build them in the platform | Nothing                                          |
| C2  | Merge platform #163 (capture ids), #166 (hosted demo) and #168 (observers, refund; #169 follows)              | Green CI and the maintainer's approval per merge |
| C3  | **3.6 Resume a pending payment** from booking detail                                                          | booking-payment-intent                           |
| C4  | **5a Account and profile** (DV-079): name, email, password, delete account                                    | C1                                               |

### Track D — The hosted demo

[`hosting.md`](hosting.md), in its order. The front is now a temporary astroman.ge
subdomain through a small Fly proxy, not Cloudflare. A new domain comes later.

Blocked on the maintainer:

- `fly auth login` and a card
- the subdomain name
- `vercel --prod`
- approval to merge #166
- the production migration request

Done when hosting.md step 6's smoke test passes on the live host.

### Track E — Launch QA, against the demo

- E1 **DV-080 Georgian QA** with a native reader, every page.
- E2 **DV-081 accessibility and performance:** WCAG 2.1 AA verified with tools and by
  hand, keyboard, screen reader, Core Web Vitals on a phone.
- E3 The two `home.spec.ts` load-only failures: e2e serves a production build, or caps
  workers.

### Track F — Launch readiness (maintainer and outside parties)

- F1 A real payment provider adapter in the platform (ADR-022), and live refunds,
  including ADR-036's partial ones.
- F2 Final prices (the slot and the Observer Pack are both PROVISIONAL in the platform).
- F3 Legal text reviewed by a lawyer, in both languages: terms, privacy, refunds.
- F4 The notification emails beyond verification.
- F5 Error monitoring. A new service, so it needs the maintainer's approval.
- F6 Production secrets, environment, domain, and the production migration, on the
  maintainer's explicit request.

### Track G — The hardware (blocked until it arrives)

- G1 An attended first light with an operator, outside the test workflow.
- G2 Measure `MAX_ALT_SAFE` from the optical train. Never a default.
- G3 Pin the camera binding (`zwoasi` or another) against the ASI585MC, in the README.
- G4 Verify nudge orientation on the real image (`phase-4/03-controls.md`).
- G5 Measure ten-observer fan-out on the observatory uplink (ADR-036). If it fails, the
  cap comes down by a new record.
- G6 Real `ZwoCamera` and `AlpacaMount` runs. Real captures replace catalogue art,
  labelled with date and exposure.

### Launch (web)

The gate: A, B, C, E, F and G complete, and the demo has run without a defect for a week
of nights.

### After launch

Subscriptions (#2), loyalty (DV-097/098), the Observation Pass (DV-113), the capture
visibility toggle (platform #158, already served), partner self-service (#3) and its
operator review (DV-122), and the mobile application (DV-082–084). Mobile is gated on
Apple enrolment, which starts now.

## Sequence

```
now      A1 watch page (unblocks the sharing link)
         B1 design foundations, B2 homepage, B3 live room
         A3–A4 on the new system
         B4–B6 page by page
         C1 filed immediately; C3–C4 as the platform answers
parallel D demo as soon as the maintainer's five items land; E runs against it
gated    F (outside parties), G (hardware)
then     launch, web only
```
