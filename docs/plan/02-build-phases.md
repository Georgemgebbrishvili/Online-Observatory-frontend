# Stellar — build phases

Seven phases from the current tree to a complete, responsive, navigable product in two
languages. Structure and behaviour first; visual polish is Phase 7 and deliberately last.

Read `01-surface-inventory.md` first — it is the evidence this order rests on.

## Principles

1. **A phase ends with something demonstrable in a browser**, not with a refactor.
2. **Wire before decorating.** A fixture page that looks finished hides the work left.
3. **Both languages, every phase.** Georgian is not a translation pass at the end;
   `localization.test.ts` enforces structural parity as you go.
4. **Every surface responsive at 320 / 390 / 768 / 1024 / 1440**, verified, each phase.
5. **No phase invents a contract field.** A missing field stops the phase and opens an
   issue against `darkview-platform`.

## Phase 0 — Rename and foundations

*Everything downstream carries these names and tokens, so it is first and it is short.*

- Stage A of ADR-025: every customer-visible Darkview → Stellar / სტელარი, both
  dictionaries, metadata, Open Graph, manifest, legal headings.
- The comet mark: SVG, favicon, app icon, social card, header lockup. Glow lives in the
  mark only (ADR-025 §3).
- `CLAUDE.md` edited for the name and the glow exception.
- Design system v3 token layer — `03-design-system.md`.
- ~~**File the `shared-observations` contract issue** against `darkview-platform`.~~
  Filed as [#1](https://github.com/Georgemgebbrishvili/Online-Observatory-frontend/issues/1) — see the issue for why it is filed here.
- ~~**Open the two missing issues**: subscription client surface, partner self-service.~~
  Filed as [#2](https://github.com/Georgemgebbrishvili/Online-Observatory-frontend/issues/2) and [#3](https://github.com/Georgemgebbrishvili/Online-Observatory-frontend/issues/3).
- Start Apple D-U-N-S enrolment. 5–30 days plus 1–4 weeks, gates DV-084, compressible
  by nobody.

**Done when:** no customer-visible "Darkview" remains; identifiers untouched and
correct; all tests green.

## Phase 1 — Navigation and the responsive shell

*Structure before pages. Every later phase drops into this.*

- ~~One navigation model~~ with the full route map including the pages that do not
  exist yet. `navigation-model.ts` now carries nine destinations: the five primary
  ones the bottom bar holds, and four — booking, subscription, loyalty, Observation
  Pass — that are reachable, navigable and say plainly that they are not built. Each
  planned destination records the phase that fills it, so the list cannot drift from
  this document.
- ~~Breakpoint contract fixed and documented~~; 37 width queries across 17 stylesheets
  migrated to the five named boundaries, and the stylelint rule is on with no
  exception list. Seven boundaries moved; `03-design-system.md` tables them.
- Route groups and layouts for the sections Phase 3–5 will fill. **Still open** —
  the planned destinations render from `/app/[destination]`, which is enough to make
  them reachable but is not the layout those sections will want.
- ~~Fix the two a11y defects already found.~~ Done, and the list was wrong in one
  place — see "What the shell contract found" below.
- A shell contract in `e2e/shell-contract.ts`: every route, both languages, the five
  widths, checked for horizontal overflow, landmark naming and heading outline. It is
  the mechanism behind this phase's Done-when rather than a manual pass at the end.
- ~~Empty, loading and error states as shared components.~~ `StatePanel` covers empty
  and error and now takes a `headingLevel`; `LoadingState` wraps the existing
  `Skeleton` primitive in a live region, since a page of `aria-hidden` bars is silence
  to a screen reader; `error.tsx` and `loading.tsx` give every route a designed
  fallback instead of a stack trace or a blank page.
- **A correction to `03-design-system.md`.** Its component inventory lists "Skeleton /
  loading state" as not existing. It does exist, as a primitive, and the design-system
  page uses it. The inventory was written from the plan rather than the tree; treat
  the rest of that table as needing the same check before acting on it.

**Done when:** every route in the inventory is reachable or renders an honest
"not yet available"; no horizontal scroll at 320px anywhere.

### What the shell contract found

Written before the navigation work, because a claim about a11y or responsiveness is
worth what its evidence is worth. Run across 16 routes × 2 languages, it failed 27
times on first run. What that resolved to:

| Finding | Where | In the plan? |
| --- | --- | --- |
| Unnamed `complementary` landmark | `/app/*` sidebar, at 1440 | yes |
| `StatePanel` hardcodes `h3`, so a page that *is* one has no `h1` | `/status` unreachable, `/admin` with no observatory | yes |
| Two `region` landmarks share the `h1`'s text as their name | `/pricing`, both widths | **no — new** |
| No heading at all, so no `h1` | `/app/live` | **no — new** |
| Unnamed `complementary` landmark | `/network` foundation aside | **no — new** |
| Label column's 12rem floor exceeds a 320px page | `/status` | **no — new** |
| Table wider than the page; `overflow-x` cannot shrink a grid item | `/status` | **no — new** |
| Four-column swatch row with a 7rem floor | `/design-system` | **no — new** |
| Flex child will not shrink below content | `/terms`, `/privacy`, `/refunds`, Georgian only | **no — new** |
| `white-space: nowrap` on a 293px Georgian status pill | `/design-system`, Georgian only | **no — new** |
| `.tab-list` `overflow-x` cannot shrink a flex item | `/design-system`, Georgian only | **no — new** |

**One item in the plan was wrong.** "Two navigations sharing one `aria-label`" is a
duplicate in the source only. `site-header.tsx` labels its desktop nav and its mobile
menu identically, and `app-navigation.tsx` does the same for the sidebar and the bottom
bar — but CSS gives exactly one of each pair `display: none` at every width, so only
one is ever in the accessibility tree. The contract's duplicate-name check passes at
both widths and never reproduced it. Left alone deliberately: renaming one of a pair
that is never heard together would be noise.

Four of the ten real findings are Georgian-only. A responsive pass run in English
would have found six of them.

**Deliberately not fixed:** `/app/live` uses a visually hidden `h1`. The viewport is
the page and a visible title would fight it; a screen reader still gets a title. The
`.visually-hidden` utility moved to `globals.css`, where it was duplicated in
`operator.css` and `design-system.css` before.

## Phase 2 — Wire what already exists

*Eighteen pages look finished and render fixtures. This is the largest hidden cost.*

- `/` and `/app/missions` → `/targets/tonight`, `/targets/{slug}`
- `/app/collection` → `/captures`, `/captures/{id}`, `/download`
- `/app` → `/me`
- `/app/missions/[slug]/session`, `/app/live` → `/missions/*`
- Resolve the `shared-observations` `/v1/*` debt per [#1](https://github.com/Georgemgebbrishvili/Online-Observatory-frontend/issues/1). **Do not build
  on it until it is contract-backed.**
- Delete `homepage-data.ts` and the committed capture SVGs once real data flows.

**Done when:** no customer surface renders a fixture, except where the platform has no
endpoint and the page says so.

## Phase 3 — Booking

*The revenue path, and the largest missing surface.*

- Slot picker from `/slots` — astronomical darkness, two lengths per ADR-015.
- Target selection, checkout, confirmation.
- Manage: `/bookings/{id}`, cancel, reschedule, refund per DV-111.
- Booking history in the account area.
- ADR-018: a customer starts their own booked mission — the handoff into Phase 4.

**Done when:** a customer books, sees it, changes it and cancels it, in both languages,
on a phone.

## Phase 4 — The live mission room

*The product's reason to exist. Hardest, and it depends on Phase 3 for entry.*

- Mission session: state machine, live view, capture, safe-nudge.
- Real instrument status; simulated frames badged as simulated, always.
- Observer view (DV-104) and the controller's sharing control (DV-105).
- Reconnection, heartbeat loss, weather hold, and every failure state as a designed
  screen rather than an error string.

**Done when:** a mission runs end to end against the simulator, and every failure state
in `CLAUDE.md`'s list has a screen.

## Phase 5 — Commerce and account

- Account and profile (DV-079).
- Subscription surfaces — the gap found in the inventory, [#2](https://github.com/Georgemgebbrishvili/Online-Observatory-frontend/issues/2).
- Loyalty: benefits, tier, ledger, redemption at checkout (DV-097).
- Observation Pass: buy, redeem, gift (DV-113).
- Observer seat purchase (DV-106).
- Partner node self-service registration — the second gap, [#3](https://github.com/Georgemgebbrishvili/Online-Observatory-frontend/issues/3).
- Operator: partner node review (DV-122 client half), loyalty adjustment (DV-098).

**Done when:** every platform endpoint in the inventory has a caller, or a filed reason
why not.

## Phase 6 — Mobile application

*Expo. Last, because it consumes patterns the web has already settled.*

- DV-082 shell, DV-083 live and collection and notifications, DV-099 loyalty.
- DV-084 Android internal build; iOS if enrolment has cleared.

**Done when:** an internal build runs a mission on a real phone.

## Phase 7 — Polish

*Explicitly last, by the maintainer's instruction.*

- Visual pass across every surface now that structure is settled.
- Motion, per the brand's three durations.
- DV-080 Georgian QA with a native reader.
- DV-081 accessibility, responsive and performance pass; WCAG 2.1 AA verified, not assumed.
- Fix the two `home.spec.ts` tests that fail only under full-suite load, `:76` and
  `:103`. `:103` is the hydration race — `Promise.all([waitForURL, click])` fires the
  click before hydration. `:76` times out clicking a button whose locator has already
  resolved. Both pass in isolation (26/26) and both failed in the 151-test run that
  added the Phase 1 shell contract, so the cause is contention, not the pages.
  The underlying reason is that `webServer` runs `next dev`, which compiles routes on
  demand: the shell contract visits 32 route/locale combinations at once and forces
  the whole route tree to compile under parallel load. Either cap `workers`, or build
  once and serve with `next start` for e2e. **CI is unaffected** — the workflow runs
  contracts, lint, typecheck, unit tests and build, not Playwright.

## Sequence

```
Phase 0  rename + tokens + issues        (short, blocks everything)
Phase 1  navigation + responsive shell   (structure)
Phase 2  wire the fixtures               (largest hidden cost)
Phase 3  booking                         (revenue)
Phase 4  live room                       (the product)
Phase 5  commerce + account + operator   (breadth)
Phase 6  mobile                          (Expo)
Phase 7  polish + QA                     (last, by instruction)
```

Phases 3 and 5 can overlap once Phase 2 lands. Phase 4 cannot start before Phase 3
provides the entry point. Phase 6 should not start before Phase 4 settles the live
patterns, or they get built twice.

## What could invalidate this plan

- **Hardware arrives early.** Phase 4 has attended-hardware dependencies in part one
  (DV-034/035/036). The simulator carries the client work; the plan does not change.
- **The platform renames first.** Stage B of ADR-025 then moves up, and becomes a
  phase of its own rather than a background task.
- **DV-071's real acceptance criteria surface.** They live in a planning archive outside
  both repositories. This plan was built from the contract and the route tree instead.
- **The `/v1/*` contract issue is refused.** Then `shared-observations` is removed
  rather than kept, and Phase 2 shrinks.
