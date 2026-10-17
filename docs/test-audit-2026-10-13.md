# Stellar: Part One and Part Two test audit

Date: 13 October 2026, Asia/Tbilisi. Scope: both local working trees, the automated checks of each layer, database integration, the browser suite against the fake platform, the Linux visual gate, the real platform stack with two simulated observatories driven from a browser, accessibility and keyboard, the brand and copy gate, and the repository boundary. It repeats the [7 October audit](test-audit-2026-10-07.md) and reads each of that audit's findings against the current code.

## Assessment

REAL_STACK_ASSESSMENT

Every automated layer is green on a quiet machine: contracts, lint, Ruff, types, both production builds, the CSS gate, 273 client unit tests, 592 API and 359 realtime unit tests, 851 agent tests, 544 API and 87 realtime integration tests on a fresh database, the booking-to-capture e2e, 327 browser tests, the axe gate on 68 route scans, and 158 of 158 visual baselines once the 22 load-induced failures were rerun. The 7 October reconnect defect is fixed and its expected-failure test is now an ordinary passing test. Four of the 7 October findings are resolved in code and confirmed here; three remain open (Prettier, the agent's Python dependency ranges, and the browser suite's sensitivity to load, which this machine reproduced far more severely than last time).

This is not a clean release certification. One visual baseline is nondeterministic (the "Contents" label on the English legal pages), the agent still pins a Pillow release with 18 open advisories, and the browser suite cannot be trusted at four workers on this hardware. The working tree also moved under the audit: an unrelated commit landed in part two at 19:37, so the first half of the results describe `fec347b` and the second half `71c0fdf`; the rerun of part two's static and unit checks on `71c0fdf` is included.

No application fixes, contract changes, commits, deployments or real-hardware operations were made. The checks regenerated the committed evidence screenshots under `docs/evidence/dv-072`, `dv-073`, `dv-077` and `dv-078` and `apps/web/next-env.d.ts`, as those specs do by design; they were restored to their committed state afterwards. This report and its evidence are left uncommitted.

## Tested source and environment

- Part Two: `fec347b125393a5a60e494c5a71e9142fc241d01` at the start, with only the 7 October audit's files untracked. At 18:17 local, five tracked files changed in the tree while the browser suite was running, and at 19:37 they were committed as `71c0fdf88553ddaa7ffaeced8d48f17e2265f5c9` ("one h1 on the design system, and a still sky under the visual gate"). Neither the edit nor the commit was made by this audit. Static, unit and the first browser run tested `fec347b`; the one-worker browser run, the visual gate, the real-stack checks and the part two rerun tested `71c0fdf`. [Source state](evidence/qa-2026-10-13/source-state.json) records both, and [the patch](evidence/qa-2026-10-13/working-tree-changes-during-audit.patch) records what changed.
- Part One: `26511620e4459eb4373483fb20eba7a0ed1bfcff`, clean, unchanged throughout. The pinned client contract records the same commit; both contract checkers passed.
- Node 24.14.1; Next.js 16.4.0 in both repositories; Python 3.12.14 in the agent's venv; PostgreSQL 16 and SeaweedFS from `dev/docker-compose.yml` under Colima. The machine runs macOS 13, which Playwright 1.62.1 no longer ships browsers for: every browser project runs on the system Google Chrome 155 through `channel: "chrome"`, and the visual gate runs in `mcr.microsoft.com/playwright:v1.62.1-noble` as the repository intends. No Firefox or WebKit follow-up was run.
- Database writes went to two new databases, `darkview_qa_20261013` and `darkview_qa_20261013_integration`; the dev `darkview` database was only migrated (`prisma migrate deploy`, a no-op) and seeded by `dev:stack:setup`, which the dev README prescribes.
- Browser checks use headless Chrome. The axe gate uses axe-core through `@axe-core/playwright` with the WCAG 2 A/AA and 2.1 A/AA tags. An automated pass is a floor, not conformance.
- The machine was shared: a second Claude Code session, the Colima VM, VS Code and Chrome ran alongside, and the one-minute load average reached 236 during the four-worker browser run and stayed above 100 for most of the one-worker run. Timings below are not benchmarks.

## Verification results

| Check                     | Part One                                        | Part Two                                   | Evidence                                                                                              |
| ------------------------- | ----------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Generated contracts       | Passed                                          | Passed                                     | `platform-contracts-check.log`, `clients-contracts-check.log`                                         |
| ESLint / client Stylelint | Passed                                          | Passed, and again on `71c0fdf`             | `platform-lint.log`, `clients-lint.log`, `clients-lint-71c0fdf.log`                                    |
| Python Ruff               | Passed                                          | Not applicable                             | `platform-lint-agent.log`                                                                              |
| TypeScript                | Passed                                          | Passed, and again on `71c0fdf`             | `platform-typecheck.log`, `clients-typecheck.log`, `clients-typecheck-71c0fdf.log`                     |
| Production build          | Passed                                          | Passed, and again on `71c0fdf`             | `platform-build.log`, `clients-build.log`, `clients-build-71c0fdf.log`                                 |
| Compiled CSS breakpoints  | Not applicable                                  | Passed, and again on `71c0fdf`             | `clients-css-check.log`, `clients-css-check-71c0fdf.log`                                               |
| Unit                      | API 592 passed; realtime 359 passed, 0 expected failures | 273 passed, and again on `71c0fdf`  | `platform-test.log`, `clients-test.log`, `clients-test-71c0fdf.log`                                    |
| Python agent              | 851 passed                                      | Not applicable                             | `platform-test-agent.log`                                                                              |
| Integration (fresh DB)    | API 544 passed, 1 skipped; realtime 87 passed   | Not applicable                             | `platform-test-integration.log`                                                                        |
| Booking-to-capture e2e    | 1 passed                                        | Not applicable                             | `platform-test-integration.log`                                                                        |
| Browser suite, 4 workers  | Not applicable                                  | Invalid run: 28 passed, 285 failed, 18 did not run | `clients-e2e-4workers.log`, `clients-e2e-4workers.json`                                        |
| Browser suite, 1 worker   | Not applicable                                  | 327 passed, 4 failed; the 4 pass alone     | `clients-e2e-1worker.log`, `clients-e2e-failed-rerun.log`                                              |
| axe gate (in the suite)   | Not applicable                                  | 68 of 68 route scans clean                 | `clients-e2e-1worker.json`                                                                             |
| Visual gate (Linux)       | Not applicable                                  | 136 passed, 22 failed; rerun 23 of 22 + setup passed, 1 failed | `clients-visual.log`, `clients-visual-rerun.log`                                        |
| Prettier                  | Failed: 181 files (174 on 7 October)            | Failed: 120 files (50 on 7 October)        | `platform-format-check.log`, `clients-format-check.log`                                                |
| npm audit, production     | 4 high                                          | 0                                          | `platform-npm-audit.log`, `clients-npm-audit.log`                                                      |
| npm audit, all            | 13 high                                         | 11 high                                    | `platform-npm-audit-all.json`, `clients-npm-audit-all.json`                                            |
| pip-audit, agent          | pillow 11.3.0: 18 advisories; pytest 8.4.2: 1   | Not applicable                             | `agent-dependency-audit.json`                                                                          |

All evidence paths are under [the evidence directory](evidence/qa-2026-10-13/). [checks.json](evidence/qa-2026-10-13/checks.json) lists every command with its exit code and log.

### Database and complete-flow checks

`npm run test:integration` ran with `DATABASE_URL` and `DATABASE_TEST_URL` both pointed at the new integration database, so its `prisma migrate deploy` migrated that database and nothing else. The API's 35 integration files passed on the first run: **544 passed, 1 skipped**, against 522 passed and 7 timeouts on 7 October. The realtime service's 6 files passed (**87**), and the booking-to-capture e2e passed its complete flow with real PostgreSQL, API and realtime in one process and an agent-message stand-in. No physical telescope, no object-storage delivery.

### Browser, responsive, and accessibility checks

The browser suite is self-contained: `playwright.config.ts` starts the fake platform on port 4110 and `next dev` on 3100. **The four-worker run is recorded but not counted.** It started at 18:27 with the one-minute load average already above 70, five source files changed in the tree at 18:17 and 18:28 (the dev server recompiled under the tests, which is what `net::ERR_ABORTED; maybe frame was detached` means), and after 45 minutes it had 28 passed, 285 failed and 18 not run, with even the passing axe scans taking 30 to 80 seconds each.

The one-worker run on `71c0fdf` took 75 minutes: **327 passed, 4 failed**. The four were a reschedule, two reserve-and-pay flows and the Georgian live room on a phone; each failed at a 30-second test timeout or a 5-second visibility wait, one with a closed CDP session. Rerun alone with the same assertions and limits, **all 4 passed** in 5 to 14 seconds each. This repeats the 7 October finding that the suite is load-sensitive; it does not make the first failures disappear. Every one of the 68 axe scans (34 routes, both languages, 390 and 1440 px) passed in the one-worker run, including `/design-system`, which `71c0fdf` had just given a single h1.

The operator, operator-evidence and operator-records projects passed (6, 4 and 6 tests). They write the committed evidence under `docs/evidence/dv-077` and `dv-078` and the legal and status screenshots under `dv-072` and `dv-073`; those regenerated files were restored to the committed state at the end.

### Linux visual regression gate

`npm run visual` on `71c0fdf`, in the pinned container: **136 passed, 22 failed** in 84 minutes with the load average above 100. Nineteen of the 22 were 120-second test timeouts or aborted navigations; three were pixel differences: English terms and privacy at 1440 (111 pixels each) and the Georgian operator overview at 1440 (191,255 pixels, 14 percent, [diff](evidence/qa-2026-10-13/clients-visual-artifacts/visual-operator-at-1440-ka-admin-visual/ka-admin-1440-diff.png)). The 22 were rerun in the container with a title filter: **23 passed (including setup), 1 failed**. The operator overview and the terms page matched their baselines on the rerun, so those were capture-state differences under load. The English privacy page failed again with the same 111 pixels, all inside the glyphs of the "Contents" label beside the masked table of contents ([diff](evidence/qa-2026-10-13/clients-visual-rerun-artifacts/visual-public-at-1440-en-privacy-visual/en-privacy-1440-diff.png)); the finding below records it.

### Real platform stack

REAL_STACK_SECTION

## Coverage of the changes since 7 October

| Change                                                  | Automated test                                                                                               | Checked here in a browser                                                     |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| ADR-052 Skychaser visuals (fec347b, 83a5913)            | 83a5913 touched 7 test files; the shell contract, home and room specs and all 158 visual baselines           | Real stack: every route, both languages, three widths; see the sweep         |
| ADR-050/051 console room, Book / Live / Collection      | room, room-live, room-controls, watch, bookings and collection specs; design-system specimens in the visual gate | Real stack: live room, Book, bookings, Collection                          |
| ADR-048 Google sign-in                                  | Platform `google.test.ts` and `google.integration.test.ts`; client `auth.spec.ts` (redirect, refusal, Georgian link) | Real stack: link present and routed on sign-in and register, both languages; the start route with no Google client configured locally sends the visitor back to sign-in with the localized refusal |
| ADR-049 demo registration verifies at once              | Platform `demo-registration.integration.test.ts`; client `auth.spec.ts` ("lands in the app when the platform verified the address at once") | Not exercised: the dev stack has a verification webhook (the mail sink), so registration took the email path, which was checked instead |
| E2 keyboard focus (36564a6)                             | `room-controls.spec.ts` and `room-sharing.spec.ts` cover the focus moves                                     | Real stack: Tab sweeps of the homepage, Book and a room                      |
| axe gate on every route                                 | `a11y.spec.ts`, 68 scans, all passed                                                                         | Real stack: axe on every route, both languages, 390 and 1440 px              |
| Next.js 16.4.0                                          | Every suite above                                                                                            | Every browser check above                                                     |
| #182 a reconnect is not a restart                       | `mission-state.test.ts:106` is now an ordinary test ("keeps an OBSERVING mission live when the agent reconnects holding it") beside the restart cases; `inbound.integration.test.ts` on a real database | Not exercised: `dev:stack` stops every process when one exits, so the realtime service cannot be restarted under it; see limits |
| #164 demo capture uuid ids                              | `development-seed.test.ts` (fixed uuids, contract `format: uuid`)                                            | Real stack: Collection and a capture page render from the seed               |
| #185/#186 Fly demo machine, `postgres://` URLs          | `env.test.ts` for the URL forms; the Fly config is deploy material, not testable here                        | Not applicable; production was not touched                                    |

## The 7 October findings

| 7 October finding                                                  | Now                                                                                                                                                                                   |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1 dependency versions (Next.js 16.3.4, sharp 0.35.4, fast-uri, source-map-js) | **Resolved.** Both repositories pin Next.js 16.4.0 and sharp 0.35.5; production-tree audits are 0 (part two) and 4 (part one, below). `clients-npm-audit.log`, `platform-npm-audit.log` |
| P2 Python agent dependency ranges exclude audited fixes            | **Still open.** `pillow==11.3.0` (18 advisories, fixes through 12.3.0) and `pytest==8.4.2` (1, fixed in 9.0.3) are unchanged; `pyproject.toml` still requires `pillow<12` and `pytest<9`. `agent-dependency-audit.json` |
| P1 an agent reconnect can end a paid live observation              | **Resolved** by platform #182 (745a45d). The `it.fails` is gone; the test passes as written, with restart cases beside it. `platform-test.log`                                           |
| P2 invalid definition-list structure on the Observatory page       | **Resolved** by 52942c3: each fact is its own `<dl>` beside its icon. axe passes `/en/observatory` and `/ka/observatory` at both widths in the suite and on the real stack.              |
| P2 mobile mission progress indicator contrast                      | **Resolved** by 52942c3: the dot's number is transparent at every state's specificity and hidden from assistive technology. axe passes the three session rooms at 390 px.                |
| P2 booking pages fail in the development-server browser run        | **Not reproduced.** `/en/app/bookings` and `/ka/app/bookings` render in the suite (bookings spec, 9 tests) and on the real stack. Last time's cause was never found; this run gives no new lead. |
| P2 requests have no application-level timeout                      | **Resolved** by 52942c3: `platformRequest` aborts after 10 s and `apiRequest` after 15 s, with tests in `browser.test.ts`.                                                                |
| P2 browser verification is sensitive to parallel load              | **Still open, worse on this machine.** See the browser section: the four-worker run is unusable here, and even one worker lost 4 tests to timeouts that pass alone.                       |
| P3 formatting checks are red                                       | **Still open and growing.** Part one 174 to 181 files (4 in `apps/api`, 1 in `apps/realtime`, 1 ADR, `.vercel/project.json`); part two 50 to 120, of which 67 are the 7 October audit's own evidence JSON files, 5 are in `apps/web`, 1 in `docs/plan`. |
| P2 WebKit cannot reach the overflowing status table with Tab       | **Resolved in code** by 52942c3 and d4b6c0c (`role="region"`, a label, `tabIndex={0}`, a focus ring). Chrome reaches it here; WebKit was not retested, see limits.                        |

## Prioritized findings and fix suggestions

### P2 — The agent still pins Pillow and pytest releases with open advisories

Unchanged since 7 October: `agent/requirements-dev.txt` pins `pillow==11.3.0` and `pytest==8.4.2`, and `agent/pyproject.toml` caps them below the fixed majors. pip-audit on the pinned file reports 18 distinct Pillow advisories (fixes through 12.3.0) and one pytest advisory (fixed in 9.0.3). The exposure qualification from last time stands: the agent builds images from arrays and encodes them; no `Image.open`, `ImageCms` or `ImageShow` call was found. [Audit output](evidence/qa-2026-10-13/agent-dependency-audit.json).

**Suggested fix:** widen the ranges deliberately (`pillow>=12.3,<13`, `pytest>=9.0.3,<10`), regenerate `requirements-dev.txt`, and rerun the 851 agent tests plus the capture encoding and overlay tests. Keep the runtime Pillow finding separate from the pytest tooling finding.

### P2 — Four high advisories remain in part one's production tree, all under Prisma

`npm audit --omit=dev` reports `prisma` 7.9.1 and `@prisma/config` with `deepmerge-ts` 7.1.5 (stack exhaustion on recursive merge) and `mysql2` 3.15.3 (auth-plugin downgrade, unbounded inflate) beneath them. `mysql2` is pulled in by the Prisma CLI, not by anything the API calls; the API talks to PostgreSQL. Part two has none. Down from 8 on 7 October. [Audit output](evidence/qa-2026-10-13/platform-npm-audit.log).

**Suggested fix:** move to the Prisma release that drops the affected `@prisma/config` range when one is published, or confirm the CLI is not shipped in the production image (the Fly Dockerfile is the place to check) and record the advisories as tooling-only. Do not run `npm audit fix --force`.

### P3 — The English legal pages' "Contents" label renders nondeterministically under the visual gate

`public at 1440 › en /privacy` failed twice in a row with the same 111 pixels, and `en /terms` once, all inside the glyphs of the `legal-toc` heading ("Contents"); everything else on both pages matched, and the table of contents itself is already masked. This is a text-rasterisation flake at one size, not a layout change, but it makes the 1440 legal baselines fail on a loaded host. Location: the heading at `apps/web/src/components/legal/legal-document.tsx:42`, styled in `apps/web/src/styles/legal.css`. [Diff](evidence/qa-2026-10-13/clients-visual-rerun-artifacts/visual-public-at-1440-en-privacy-visual/en-privacy-1440-diff.png).

**Suggested fix:** extend the gate's mask in `e2e/visual.css` to the `.legal-toc` heading, or give the gate a `maxDiffPixels` of a few hundred for the legal pages only. Keep the rest of the page unmasked.

### P2 — The browser suite needs a quiet machine; four workers are not viable on this host

Still open from 7 October. Numbers above. The suite's own design (one `next dev` compiling on demand, four Chrome workers, 90-second axe scans of a 32,000-pixel design-system page) multiplies with any other load on the machine. CI runs on `ubuntu-latest` with the same four workers; this audit cannot say how close CI runs to its limits.

**Suggested fix:** run the suite against `next start` of a production build in CI and locally (the 7 October production-harness notes still apply), keep `--workers=1` as the documented local default on this hardware, and record first-run failures even when a rerun passes.

### P3 — Formatting is red and the count grew in both repositories

See the table above. In part two, 67 of the 120 files are JSON under `docs/evidence/qa-2026-10-07/`, which the previous audit left unformatted; once that evidence is committed or formatted the part two count returns to 53.

**Suggested fix:** as before: one housekeeping change per repository, excluding generated artifacts and the pinned contract; then `format:check` in CI.

REAL_STACK_FINDINGS

## Brand, copy and boundary gates

- **Brand and copy** ([grep log](evidence/qa-2026-10-13/brand-copy-grep.log)): no "Darkview" in `apps/web/src` or its i18n resources; `darkview` identifiers remain in `brand.ts`, the proxy and the admin routes as ADR-025 requires. The accent `#e3482c` is `--st-red`, used for glows, borders, the LIVE pill and highlights; the filled action is `--st-red-fill: #c8392a`, so no white-on-`#E3482C` surface was found in the tokens. "Illustration — not telescope output" appears 8 times in English and 7 in Georgian across the home, observatory, missions and room resources, plus "Simulator output, not telescope output" on the simulated feed; the room spec asserts the caption is absent from the real feed. No long-exposure, Hubble, JWST, NASA or "professional-grade" claim outside the legal test that asserts its absence. `:lang(ka)` forces `letter-spacing: normal` and `text-transform: none` with `!important`, and the Georgian headline fonts are Noto Sans Georgian.
- **Boundary** ([grep log](evidence/qa-2026-10-13/boundary-checks.log)): part two imports no Prisma, `@prisma/client` or `@darkview/db`; it reads six environment variables, none a secret (`APP_URL`, the platform, realtime and storage URLs, `NODE_ENV`, `UPDATE_CONTRAST`); no Alpaca, ZWO or ASCOM reference outside tests; no `agent/`, `apps/api/`, `apps/realtime/`, `packages/db/` or `contracts/` path exists here. In part one, `agent/darkview_agent/devices/alpaca.py` refuses any Alpaca host that is not a literal loopback IP (tests cover `192.168.1.20`, `0.0.0.0`, `localhost`), and `test_link_no_listening_ports.py` asserts the agent opens no listening socket. No SharpCap, OBS, screen-capture, `mss` or `getDisplayMedia` reference in either repository's source.

## Remaining coverage limits

- The realtime service could not be restarted mid-session: `dev:stack` stops every process when any one exits, by design. The #182 behaviour is covered by the realtime unit and integration tests only.
- No real mission was started from a booking: the Tbilisi observatory had no open slot at the hour of the check and the night-side observatory's first bookable slot was in the future, so the start control is correctly absent. The live room, Capture, watcher presence and ownership refusal were exercised in the suite against the fake platform, not on the real stack.
- ADR-049's verify-at-once path is not reachable on the dev stack, which has a verification webhook; it is covered by the platform integration test and the client spec.
- Firefox and WebKit were not run: Playwright 1.62.1 does not support macOS 13, and the container run was spent on the visual gate. Native Safari and iOS, the physical telescope, real payments, external email and the deployed demo were not exercised.
- Load on this machine was abnormal for the whole browser and visual phase. Every timing here is suspect; only the pass/fail of reruns on a quieter machine should be read as product signal.

## Test-environment cleanup

The dev stack was stopped with SIGTERM (the agents park on it). Postgres and SeaweedFS were left running for the next `dev:stack`. The two QA databases were kept for reproduction. The regenerated evidence screenshots under `docs/evidence/dv-072`, `dv-073`, `dv-077`, `dv-078` and `apps/web/next-env.d.ts` were restored with `git checkout --`. A scratch virtualenv for pip-audit lives in the session scratchpad, not in either repository. A directory my first real-stack script created by mistake at `~/Desktop/Stellar%20Observatory` (a percent-encoded path) held only that script's screenshots and was removed.

## Reproduction

From part two, in order, on an otherwise idle machine:

```bash
cd "/Users/nika/Desktop/Stellar Observatory/part-2-clients"
npm run contracts:check && npm run lint && npm run typecheck && npm run format:check && npm run css:check && npm run build
npm test
npm audit --omit=dev
npm --prefix ../part-1-platform run contracts:check
npm --prefix ../part-1-platform run lint && npm --prefix ../part-1-platform run lint:agent
npm --prefix ../part-1-platform run typecheck && npm --prefix ../part-1-platform run format:check && npm --prefix ../part-1-platform run build
npm --prefix ../part-1-platform test
npm --prefix ../part-1-platform run test:agent
docker exec darkview-dev-postgres-1 psql -U darkview -d postgres -c "CREATE DATABASE darkview_qa_<date>;"
DATABASE_URL=postgresql://darkview:darkview@localhost:5433/darkview_qa_<date> DATABASE_TEST_URL=postgresql://darkview:darkview@localhost:5433/darkview_qa_<date> npm --prefix ../part-1-platform run test:integration
(cd apps/web && npx playwright test --project=setup --project=warm --project=chromium --project=signed-out --project=operator --project=operator-evidence --project=operator-records --workers=1 --reporter=list)
npm run visual
npm run dev:stack            # in another terminal; then:
node docs/evidence/qa-2026-10-13/real-stack/run.mjs
git checkout -- docs/evidence/dv-072 docs/evidence/dv-073 docs/evidence/dv-077 docs/evidence/dv-078 apps/web/next-env.d.ts
```
