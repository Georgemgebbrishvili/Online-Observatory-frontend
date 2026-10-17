Full test pass over Stellar, part one and part two, as of today. Follow this repository's
CLAUDE.md and the platform's own CLAUDE.md throughout. The last audit is
docs/test-audit-2026-10-07.md with evidence in docs/evidence/qa-2026-10-07/. Read both
first. Your job is to repeat that audit against the current working trees, confirm or
retire every finding in it, and surface anything new.

## Ground rules

- Audit only. No application fixes, no contract edits, no commits, no deploys, no pushes.
  Record suggested fixes in the report; do not apply them.
- Both repos: /Users/nika/Desktop/Stellar Observatory/part-2-clients and
  ../part-1-platform. Record the HEAD sha and `git status --short` of each before you start.
- Platform commands run as `git -C ../part-1-platform …` or `npm --prefix ../part-1-platform …`.
  NEVER `npm run db:migrate` there. Never overwrite ../part-1-platform/.env.
- Simulator only. No real mount, camera or focuser exists. Nothing touches production
  (stellar.astroman.ge, Fly, Vercel) in any way, read or write.
- Use fresh, separately named QA databases for anything that writes; never the dev
  `darkview` database Nika uses. Postgres is on localhost:5433, user and password
  `darkview`; `darkview_test` is the platform's own test database.
- Every result comes from a command you actually ran, with its log saved. Never summarise
  a run you did not complete; a stopped run is reported as stopped, with the log.
- Prettier failures were known last time; report the count but do not run `format`.

## Environment, already prepared

Colima and Docker are running. Postgres and SeaweedFS are up from dev/docker-compose.yml,
the platform is installed, migrated and seeded, and agent/.venv exists (Python 3.12).
Every Playwright project runs on the system Google Chrome 155 (`channel: "chrome"`), which
launches fine. Playwright's own Chromium, Firefox and WebKit cannot be installed natively:
Playwright 1.62.1 does not support macOS 13. A Firefox or WebKit follow-up, like the
visual gate, runs inside the pulled image mcr.microsoft.com/playwright:v1.62.1-noble
(see scripts/visual.mjs for the mount pattern). ../part-1-platform/.env exists with
S3 keys. Ports 3000, 3100, 4000, 4001, 4010, 4100 and 4110 were free at hand-over.

## What changed since 2026-10-07 and needs specific attention

Part two: ADR-052 Skychaser rebrand on every surface (fec347b, 83a5913), ADR-050/051 console
room and Book/Live/Collection (34d7d03 and earlier), Google sign-in (ADR-048), demo
registration that signs the user in at once (ADR-049), E2 keyboard-focus fix (36564a6),
axe gate on every route, Next.js 16.4.0. Part one: ADR-048, ADR-049, realtime reconnect
is not a restart (#182), demo capture uuid ids (#164), Fly demo machine (#185/#186).
For each of these, say explicitly whether it is covered by an automated test, by a
browser check you ran, or by neither.

## Layers, in order

1. Static. In each repo: `npm run contracts:check`, `npm run lint`, `npm run typecheck`,
   `npm run format:check`, `npm run build`. Part two also `npm run css:check`.
   Part one also `npm run lint:agent`. Record `npm audit --omit=dev` for both and triage
   advisories against the 2026-10-07 list.
2. Unit. `npm test` in each repo; `npm run test:agent` in the platform (pytest, agent/.venv).
   Rerun any failed file in isolation once and report both results.
3. Integration, part one. `npm run test:integration` in the platform with
   DATABASE_TEST_URL pointed at a new QA database you create. Then the booking-to-capture
   e2e (`npm run test:e2e` there). Note which failures are timeouts under load and
   whether they pass serially.
4. Browser, part two, fake platform. `npm run test:e2e` in apps/web. It is self-contained:
   playwright.config.ts starts the fake platform on 4110 and the web app on 3100, so do
   not run dev:fake alongside it. Run every project: setup, warm, chromium, signed-out,
   operator, operator-evidence, operator-records. Four workers first; rerun every failure
   with one worker, same assertions. Report both.
5. Visual gate. `npm run visual` from the repo root (Docker, Playwright container). Any
   diff is a finding; do not run `visual:update`.
6. Real stack. `npm run dev:stack` brings up the platform, both simulated agents and the
   web client. Confirm the agent logs `driver_mode=SIMULATED attended=False` and the
   `safety envelope: UNMEASURED` warning. Drive these by hand with Playwright or the
   Chrome tools at http://localhost:3000 (never 127.0.0.1), in English and Georgian, at
   390, 768 and 1440 px:
   - register a new address (demo mode verifies at once), sign in, sign out,
     wrong password, Google button present and routed correctly;
   - book a slot, reach sandbox checkout, pay, see the confirmed booking in Book;
   - start the booked mission, watch the live room through SLEWING to OBSERVING,
     Capture, find it in Collection; the stream badged Simulated everywhere;
   - watcher join, presence, ownership refusal for a second session;
   - operator: telemetry, target enable/disable, mode confirmation, Emergency Park on
     the simulator, mission log filters, cancellation with refund settlement;
   - stop the realtime service mid-session and restart it: the room reconnects without
     restarting the mission (#182);
   - every route reachable from the nav plus /design-system, /observatory and the 404,
     both languages: no horizontal overflow, no console errors, no broken images.
7. Accessibility and keyboard. axe on every route both languages, phone and desktop,
   after animations settle. Tab through the homepage, booking flow and live room once
   each: focus visible, kept in view, never trapped, Escape closes what Enter opened.
   Confirm the three 2026-10-07 axe findings (definition list on Observatory, mobile
   progress contrast, status scroll-region focus) are resolved or still open.
8. Brand and copy gate against ADR-052 and CLAUDE.md: no "Darkview" in customer-visible
   strings, `darkview` identifiers untouched, no white text on #E3482C, every drawn
   object captioned "Illustration — not telescope output", no long-exposure or
   NASA-class claims, Georgian never uppercased or tracked. Grep, then eyeball.
9. Boundary checks. Part two has no Prisma, no @darkview/db, no secrets, no hand-written
   cross-boundary types; the platform's Alpaca bridge config binds 127.0.0.1 only; no
   SharpCap/OBS/screen-capture path anywhere in the data flow.

## Deliverable

Write docs/test-audit-2026-10-13.md in the same shape as the 2026-10-07 report, with
evidence under docs/evidence/qa-2026-10-13/ (logs, screenshots, a checks.json manifest,
source-state.json with both shas). The report must contain:

- an assessment paragraph that says plainly whether this is a clean pass or not;
- the verification table, both repos, with a log path per row;
- a findings list ranked by severity, each with repo, file, how to reproduce, and whether
  it is new, still open from 2026-10-07, or a regression since then;
- the 2026-10-07 findings, each marked resolved or still open with evidence;
- the environment limitations you hit, including anything you could not run and why.

Leave the report and evidence uncommitted. Finish with a short list of what you would
fix first, and the exact commands to run the audit again.
