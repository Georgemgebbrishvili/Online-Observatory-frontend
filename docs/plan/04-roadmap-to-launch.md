# Stellar — the roadmap to launch

Written 2026-10-02 from an audit of the plan, the code, and `darkview-platform` at
`f2f51db`. It replaces the "Sequence" in [`02-build-phases.md`](02-build-phases.md),
which stays the record of Phases 0–4. The decisions behind it:

- [ADR-036](../decisions/ADR-036-ten-observers-and-a-refund-for-the-time-a-close-takes.md):
  ten observers, and a refund when a session is closed.
- [ADR-037](../decisions/ADR-037-web-first-launch-and-design-before-breadth.md): web
  first, design before breadth, `/app/live` redirects.
- [ADR-038](../decisions/ADR-038-the-app-takes-the-homepage-type-and-night.md): the app
  takes the homepage's type and night.

## Where we are

| Phase                                         | State       | Evidence                                                                                          |
| --------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| 0 Rename, tokens, issues                      | Done        | `074d4cc`, `0071602`, issues #1–#3                                                                |
| 1 Shell, breakpoints, shell contract          | Done        | One item open: route groups and layouts, plus `[targetSlug]` carrying a mission id                |
| 2 Targets, collection, dashboard              | Done        | `d059f31`, `da33bd2`, `e77e36c`                                                                   |
| 2 `/v1/*` shared-observation debt (#1)        | **Open**    | Answered by the platform (#159, `getMissionWatchView`, ADR-034), never adopted here               |
| 3 Slots, reserve, checkout, bookings, refunds | Done        | `43b45f6`, `820207f`, `78f6961`, `d9c20df`                                                        |
| 3 Resume a pending payment                    | Blocked     | [booking-payment-intent](../platform-requests/booking-payment-intent.md), unanswered              |
| 4.1–4.3 Room: read, live, controls            | Done        | `992e476`, `c10d979`, `1ce8b84`, `5c6528e`                                                        |
| 4.4 Sharing control                           | Done here   | [`phase-4/04-sharing.md`](phase-4/04-sharing.md); the watch link waits for 4.5                    |
| 4.5–4.8 Watch, seats, `/app/live`, failures   | Not started | Track A below                                                                                     |
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

### Track B — The design pass (ADR-037, ADR-038)

Direction: **the instrument at night.** Cosmic through precision and the real sky, solid
through one type system, one night, and a surface ramp used with intent. Every slice
regenerates its baselines.

| #   | Slice                                                                                                                                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| B1  | **Tokens (ADR-038):** the homepage night and ramp, the type pair on `:root` through `next/font` in the root layout, AA contrast re-verified. Delete the stale stylelint exemptions (including the missing `mission-session.css`). Every baseline regenerated |
| B2  | **App shell:** full-height sticky sidebar. Booking moves out of "Not yet available". A compact one-line simulated banner under the header. Check the 390 bottom nav against content                                                                          |
| B3  | **Georgian pass:** translate "Observer", "Tbilisi" and the simulated badge. Apply the `min()` cap to app headings. Set a minimum label size under `:lang(ka)`                                                                                                |
| B4  | **Hierarchy:** one app heading scale (`--font-size-h1`; hero size only on marketing heroes and a target's name). Three surfaces with clear jobs (well, panel, featured). Delete the radial washes in seven files                                             |
| B5  | **`NightContext` component**, shown on `/design-system` first: darkness window, moon phase, twilight, coordinates in mono                                                                                                                                    |
| B6  | **`/app` home:** `NightContext` on top, and the bento grid rebalanced so it has no empty halves and no orphan card                                                                                                                                           |
| B7  | **Booking:** a night timeline above the slot table (`/app/book`). Booking detail in two columns, with the target, the hold countdown, and the primary action above the destructive one                                                                       |
| B8  | **Live room:** a mono instrument readout strip (values from `MissionTelemetryUpdate` only). Tighten the controls panel                                                                                                                                       |
| B9  | **Star-field texture** token and utility, on marketing sections and app page headers only. Never behind a feed or a capture                                                                                                                                  |
| B10 | **Collection:** an archive that reads as one even when it holds one capture. Simulated captures look deliberate, not like placeholders                                                                                                                       |
| B11 | **Marketing:** fold `/network` into `/observatory` (one site exists). Observatory reads as instrument, then safety, then site. Pricing shows what exists today, with no internal config panel                                                                |
| B12 | **Placeholders:** Profile, Subscription, Loyalty and Passes get a consistent "coming" state with a real reason, until they are built                                                                                                                         |
| B13 | **Visual gate coverage:** baselines for auth, 404, error, watch and the operator console                                                                                                                                                                     |

Track A slices that come after B4 are built in the new system, so nothing is styled twice.

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
         B1–B4 design foundations
         A2–A4 on the new system
         B5–B13 page by page
         C1 filed immediately; C3–C4 as the platform answers
parallel D demo as soon as the maintainer's five items land; E runs against it
gated    F (outside parties), G (hardware)
then     launch, web only
```
