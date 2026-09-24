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

- One navigation model: public header, authenticated sidebar, mobile bottom bar,
  with the full route map including the pages that do not exist yet.
- Route groups and layouts for the sections Phase 3–5 will fill.
- Breakpoint contract fixed and documented; every existing page re-verified against it.
- Fix the two a11y defects already found: `/app` has an unnamed `complementary`
  landmark and two navigations sharing one `aria-label`; the `/status` unreachable
  fallback renders an `h3` as the page's only heading.
- Empty, loading and error states as shared components, since every phase needs them.

**Done when:** every route in the inventory is reachable or renders an honest
"not yet available"; no horizontal scroll at 320px anywhere.

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
- Fix the `home.spec.ts:103` hydration race — `Promise.all([waitForURL, click])` fires
  the click before hydration and fails intermittently under load.

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
