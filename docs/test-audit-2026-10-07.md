# Stellar: Part One and Part Two test audit

Date: 7 October 2026, Asia/Tbilisi. Scope: the local platform and client working trees, automated checks, database integration, browser flows, responsive pages, accessibility, and visual regression.

## Assessment

The build, types, lint, and generated contracts are sound. The successful unit retests and real production-client checks are stronger evidence than the first runs, which suffered worker startup failures and exceptionally large elapsed-time jumps. This is not a clean release certification: a known reconnect defect remains, dependency advisories need triage, accessibility findings need correction, and the integration and browser results below must be read with their environment limitations.

No application fixes, contract changes, commits, deployments, or real-hardware operations were made for this audit. Fixes below are suggestions.

## Tested source and environment

- Part Two: `316536c7b4b716aaf9d65b50060b8f415a856598`.
- Part One: `84101b1e09cb2c661563bcb2503ae8c8723f67b5`, with existing uncommitted sandbox-checkout and Observer Pack changes. Additional platform test edits appeared during the audit. Results describe these local working trees, not an immutable clean release. [Source hashes](evidence/qa-2026-10-07/source-state.json) record the inspected state.
- The pinned client contract records the same Part One commit; both contract generators/checkers passed.
- Node 24.14.1; Next.js 16.3.6 for the client and 16.3.4 for the API; the agent's Python 3.12 environment; PostgreSQL 16.
- Original local data was kept separate: database tests used newly created QA databases, and the real-browser checks used a separately migrated and seeded QA database.
- Production builds were run locally in the platform's `demo` deployment mode: sandbox payments, simulated observatories, no real money or hardware.
- Browser checks use headless Chrome, with a follow-up in bundled Linux Firefox and WebKit. Automated accessibility checks use axe-core 4.10.3 and WCAG 2 A/AA plus 2.1 AA tags. An automated pass does not establish complete accessibility conformance.

## Verification results

| Check                     | Part One                                                  | Part Two         | Evidence                                                                                    |
| ------------------------- | --------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------- |
| Generated contracts       | Passed                                                    | Passed           | `platform-contracts-check.log`, `clients-contracts-check.log`                               |
| ESLint / client Stylelint | Passed                                                    | Passed           | `platform-lint.log`, `clients-lint.log`                                                     |
| TypeScript                | Passed                                                    | Passed           | `platform-typecheck.log`, `clients-typecheck.log`                                           |
| Production build          | Passed                                                    | Passed           | `platform-build.log`, `clients-build.log`                                                   |
| Unit retest               | API: 585 passed; realtime: 349 passed, 1 expected failure | 261 passed       | `platform-api-unit-retry.log`, `platform-realtime-unit-retry.log`, `clients-unit-retry.log` |
| Python agent              | 851 passed                                                | Not applicable   | `platform-test-agent.log`                                                                   |
| Python Ruff               | Passed                                                    | Not applicable   | `platform-lint-agent.log`                                                                   |
| Compiled CSS breakpoints  | Not applicable                                            | Passed           | `clients-css-check.log`                                                                     |
| Prettier                  | Failed: 174 files                                         | Failed: 50 files | `platform-format-check.log`, `clients-format-check.log`                                     |

All evidence paths in this table are under [the evidence directory](evidence/qa-2026-10-07/). [The original command manifest](evidence/qa-2026-10-07/checks.json) preserves the first results, including unsuccessful runs; the successful retest logs above supersede their unit-test outcomes. `@darkview/storage` has no standalone test script, so invoking one is not a product failure; storage behavior is exercised in API/realtime tests.

### Database and complete-flow checks

The API integration run completed **522 passed, 7 failed, 1 skipped** across 33 files. Six failures were Prisma transaction/start timeouts and one was a restore-drill timeout under concurrent load. All seven affected suites then passed against a fresh isolated database: **144 passed**. This supports the tested behavior but records a sensitivity to load; the initial failures are retained rather than erased. See `platform-integration-native.log` and `platform-api-integration-retest.log`.

Realtime database integration passed **84 tests across 6 files**. The platform booking-to-capture E2E passed its complete flow with real PostgreSQL/API/realtime and an agent-message stand-in. It does not exercise a physical telescope or actual object-storage delivery. See `platform-realtime-integration.log` and `platform-booking-to-capture.log`.

### Browser, responsive, and accessibility checks

The independent page audit completed **174 route/locale/viewport checks**: 29 routes, English and Georgian, at 390, 768, and 1440 pixels. It detected **zero horizontal-overflow cases, broken-image cases, or uncaught page-JavaScript errors**. These counts include intentional not-found pages; successful HTTP responses alone do not prove semantic page correctness. The English booking list rendered an unexpected not-found screen in all three widths on the dev/fake stack.

Axe reported invalid definition-list structure on the Observatory page in six checks, mobile progress contrast in two checks, and a status scrolling-region focusability warning in four checks. Details and the manual keyboard qualification appear below.

Separate production-client checks against the real isolated platform completed 50 login/page/profile/responsive checks, plus 10 operator pages across both languages. The observer was denied operator access, profile changes persisted and were restored, and a real reservation reached sandbox checkout and became a confirmed booking after simulated payment. Narrow layouts at 320, 390, and 768 pixels showed no horizontal overflow. See `real-browser.json`, `real-operator.json`, and `real-commerce.json`.

The original full dev-server run was stopped after repeated dev routing failures and slow route compilation; its partial log and error contexts are preserved as `clients-e2e-final.log` and `dev-e2e-results`. It is not counted as a full-suite pass.

A temporary production-server adaptation completed the full main browser suite: **231 passed, 16 failed** across 247 tests, with four Chrome workers. Failures span booking pagination/refund, rescheduling/reservation, deletion, live state/ownership transitions, two design-system viewport tests, watcher payment flows, wrong-password feedback, and sign-out. Most are assertion or test timeouts. One Chrome worker hung and was terminated after exceeding normal timeouts; this is explicitly recorded in `browser-worker-intervention.txt`.

Fixture adaptations are documented in [production-harness.md](evidence/qa-2026-10-07/production-harness.md). The original development tests were copied temporarily; no application source or assertions were loosened. Full-run results and screenshots are in `production-e2e-parallel-results`, with the log in `production-e2e.log`.

All **16 failed browser cases passed** on a fresh, one-worker rerun with the same assertions and timeout limits: **18 passed including the two setup tests**. See `production-e2e-serial.log` and `production-e2e-results`. This makes the parallel failures load/harness-sensitive in this environment; it does not erase the first-run failures or prove the same reliability under production load.

The separate operator suite passed **8 tests including setup**, and operator-records passed **8 including setup**. They exercised telemetry, both-language 320px layouts, coordinate eligibility, mode confirmation, simulated Emergency Park, role denial, mission pagination, target enable/disable, log filters, and cancellation settlement/reason/audit behavior. These use the fake platform; no real equipment was moved. See `operator-e2e.log`, `operator-records-e2e.log`, and `operator-runs.json`.

### Linux visual regression gate — completed with successful retests

Initial attempts failed DNS resolution or the 120-second dev-server readiness limit before reaching screenshots. A fresh continuation container used the same pinned **Playwright 1.62.1 Noble image**, an isolated archive of the client HEAD, cached npm downloads, and a **300-second readiness allowance**. Test assertions and all **160 screenshot baselines remained unchanged**.

The full continuation run finished **160 passed, 2 failed across 162 tests**, including two setup tests. One failure was the English phone design-system capture exceeding the existing 15-second screenshot budget before producing an actual image. The other was a stable 13-pixel difference in the desktop Privacy page's **CONTENTS** label; both images were 1440×1796, and the differing pixels were localized around x125–127, y426–434.

Both failed comparisons then passed with the same assertions and timeout limits on a warm rerun: **4 passed including setup**. Every existing baseline comparison has therefore passed during this audit, but the initial timeout and tiny raster difference are retained as evidence of setup/capture instability; the unmodified canonical command was not certified as a clean first-run pass.

Evidence: `visual-continuation.log`, `visual-continuation-results`, `visual-continuation-retest.log`, `visual-continuation-retest-results`, and `continuation-environment.json`. No baselines were regenerated. The independent audit also produced 44 standalone screenshots for layout review.

### Firefox and WebKit follow-up

The first run finished **61 passed, 3 failed across 64 tests**. All **56 page checks** passed: seven routes in both languages at 390 and 1440 pixels, checking HTTP responses, headings, language, overflow, image loading, and uncaught JavaScript errors. Both operator-access denial checks passed. Firefox passed the status-table keyboard check; WebKit failed it.

The two sign-in timeouts occurred in the custom context's `close()` cleanup after reaching the dashboard. Replacing that temporary harness with Playwright's standard page fixture produced **4 passes including setup**, with unchanged sign-in assertions and timeout limits. This follow-up exercises bundled Linux browsers against the fake platform; it does not establish behavior in native Safari or iOS.

Evidence: `cross-browser.log`, `cross-browser-results`, `cross-browser-signin-retest.log`, `cross-browser-signin-retest-results`, and the preserved temporary specifications/configuration.

## Prioritized findings and fix suggestions

### P1 — Dependency versions need security maintenance

A fresh npm audit reports **17 high and 1 critical package findings in Part One**; with `--omit=dev`, it still reports **7 high and 1 critical**. Part Two reports **15 high**, or **2 high with development dependencies omitted** (sharp and source-map-js). These are package-tree findings, not proof of eight or eighteen exploitable application endpoints. Raw results are in `dependency-audit-platform.json`, `dependency-audit-platform-production.json`, `dependency-audit-clients.json`, and `dependency-audit-clients-production.json`.

Part One pins Next.js **16.3.4**, within the affected range for **GHSA-vcvr-r3jv-pc5j / CVE-2026-94545**. The maintainer identifies the vulnerable path as Node.js `next/og` image generation using attacker-controlled SVG values and gives **16.3.6** as patched. No `next/og` or `ImageResponse` use was found in Part One's application/packages; therefore exploitability through the reviewed source was not established. Part Two already uses 16.3.6, and its Open Graph renderer uses static brand values. [Next.js maintainer advisory](https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j).

Both lockfiles include sharp **0.35.4**. Its upstream librsvg advisory concerns SVG decoding on glibc Linux under runtime-specific conditions; **0.35.5** contains the patched dependency. No direct sharp calls were found in these application sources; Next.js uses sharp transitively. This warrants a dependency update and exposure review, not a claim of demonstrated RCE. [sharp maintainer advisory](https://github.com/lovell/sharp/security/advisories/GHSA-wq5f-xc86-pv6w).

**Suggested fix:** upgrade Part One's Next.js to a compatible patched release, refresh the sharp lockfile resolution within the supported dependency range, then rerun builds, contracts, browser/image checks, and audits. Triage remaining runtime/tooling findings by their actual input paths. npm's aggregate recommendations include major changes and even downgrades of Prisma/ESLint packages; do not apply `npm audit fix --force` indiscriminately.

### P2 — Python agent dependency constraints exclude audited fixes

The corrected audit of the agent's **45 installed packages** reports **37 advisory records in two packages**. De-duplicating advisory IDs gives **18 for Pillow 11.3.0 and 1 for pytest 8.4.2**. Duplicate alias records must not be presented as 37 distinct defects. Evidence: `agent-installed-packages.json`, `agent-dependency-audit.json`, and `agent-dependency-audit.log`. The initial audit accidentally inspected the base interpreter's three packages; its superseded output is preserved separately and is not a result for the agent.

The reported Pillow fixes extend through **12.3.0**, while `agent/pyproject.toml` requires `pillow>=11,<12`. The pytest advisory lists **9.0.3** as fixed, while the development dependency requires `pytest>=8.3,<9`. Both current ranges exclude these fixes. The pytest maintainer documents its temporary-directory security fix in the [9.0.3 changelog](https://docs.pytest.org/en/stable/changelog.html#pytest-9-0-3).

**Exposure qualification:** this is an installed-dependency finding, not demonstrated exploitation. The inspected agent creates images from arrays and encodes outputs; no direct `Image.open`, `ImageCms`, or `ImageShow` use was found. For example, the reviewed Pillow advisories involve a Windows viewer command and a caller-supplied ImageCms output-mode mismatch, neither of which is used by the inspected agent. [Pillow Windows viewer advisory](https://github.com/python-pillow/Pillow/security/advisories/GHSA-4x4j-2g7c-83w6), [Pillow ImageCms advisory](https://github.com/python-pillow/Pillow/security/advisories/GHSA-9hw9-ch79-4vh6).

**Suggested fix:** assess compatibility with patched Pillow and pytest releases, update the dependency ranges deliberately, and rerun the agent suite plus JPEG/PNG encoding, overlays, image dimensions, and simulator capture tests. Keep runtime Pillow findings separate from the pytest development-tool finding. Do not call the agent dependency audit green.

### P1 — An agent reconnect can end a paid live observation

**Confirmed known defect, rather than a newly introduced failure.** The realtime suite deliberately marks `keeps an OBSERVING mission live when the agent reconnects holding it` with `it.fails`. Its regular tests passing does not remove this known failure.

The agent announces the held mission in its hello on a reconnect. The cloud treats that hello as recovery from a process restart: `resolveResumedMission` marks a live mission `FAILED / AGENT_LINK_LOST`, records a restart event, and revokes its session. A short network interruption can therefore end the observation even when the agent process has remained alive.

Locations: `../part-1-platform/apps/realtime/src/link/mission-state.test.ts:117`, `agent-link.ts:666`, and `prisma-store.ts:481` in that same directory. The test's comment explicitly identifies a conflict between the contract's restart meaning and the agent's reconnect behavior.

**Suggested fix:** decide the protocol semantics first. Distinguish a reconnect within the same agent process from recovery after a restart, using a recorded boot identity or an explicit agreed contract field. Keep the existing fail-safe restart/heartbeat-loss behavior. Verify the decision with real PostgreSQL and simulator tests for a short blip, a new process, an expired owner, a terminal mission, and a genuinely lost heartbeat. Convert the expected-failure test into an ordinary passing regression test only when the behavior is resolved.

### P2 — Invalid definition-list structure on the Observatory page

**Reproduced by axe on the rendered page.** The `definition-list` and `dlitem` rules flag `.observatory-facts`: `<dt>` and `<dd>` are nested inside an extra text wrapper, and icon spans appear in the groups where only valid term/description grouping is allowed.

Location: [observatory-page.tsx](../apps/web/src/components/observatory/observatory-page.tsx), `SceneFacts`, around line 134. Styling: `apps/web/src/styles/observatory.css:217`.

**Suggested fix:** use a normal outer container and make each fact's text wrapper a `<dl>` whose children are directly `<dt>` and `<dd>`. Keep the decorative icon beside the list and reset the inner list's margin. Recheck both languages and phone/tablet/desktop layouts, as well as the two axe rules.

### P2 — Mobile mission progress indicator has a contrast/decoration problem

**Rendered-page axe finding.** The current step's numeric text is reported at 1.62:1 against its orange bar, below the 4.5:1 threshold for small text. The mobile layout compresses the numbered circle into a 4px bar, but the higher-specificity current-step color rule overrides the mobile rule's transparent text.

Location: `apps/web/src/styles/room.css:544` and the mobile overrides around line 579; target `li[data-status="current"] > .mission-step-dot`.

**Suggested fix:** make the bar genuinely decorative on mobile: apply transparent text with matching specificity to state-specific dots and hide redundant dot content from assistive technology when the step name already communicates the state. Keep desktop step numbers readable. Verify computed colors and the screenshot, not just the axe result.

### P2 — Booking pages fail in the development-server browser run

The browser suite and independent audit have rendered the localized not-found screen at `/en/app/bookings`. The list assertion fails because `Your bookings.` is absent. Confirmed-booking and awaiting-payment tests also fail in this run. Both booking routes are present in the development and production app-path manifests.

**Important scope:** the real-platform production client successfully rendered both `/en/app/bookings` and `/ka/app/bookings`. This does not establish a production booking-list failure. The fresh isolated Linux dev/fake stack also matched the English phone booking-list baseline during continuation. This narrows the earlier failure to the original local dev environment or its generated state; the exact cache/routing cause remains unresolved.

**Suggested investigation:** reproduce one failed route with only the fake platform and dev server running; retain the server's route/status logs. Check static booking routes against the sibling `[destination]` and missing-route fallbacks, clear only the generated dev cache in an isolated checkout, and compare direct navigation with client navigation. Preserve a production-server E2E check so development routing behavior cannot be mistaken for a release regression.

### P2 — Requests have no application-level timeout

**Code-review finding, not a measured production outage.** Both `platformRequest` and browser `apiRequest` call `fetch` without a timeout or cancellation budget. A backend connection that remains open without answering can leave a server-rendered page or a submitting form waiting until the browser/network stack eventually gives up.

Locations: `apps/web/src/lib/platform/client.ts` and `apps/web/src/lib/platform/browser.ts`.

**Suggested fix:** add a bounded request budget for ordinary API requests, map an abort to the existing localized unavailable/error state, and restore form controls after failure. Do not apply the same timeout to intentional long-lived live streams. Test an unanswered API request and subsequent retry, preserving reservation idempotency.

### P2 — Browser verification is sensitive to parallel load

The four-worker production run reported 16 failures, mainly at five-second assertions or the 30-second test limit. Several paid-booking/account actions passed when rerun with one worker using unchanged limits. The development harness also has cold-compilation/startup failures, and the initial Linux visual gate attempts failed before assertions. The continuation reached comparisons and passed all baselines after two retests.

**Suggested fix:** give browser jobs dedicated resources and run the stateful booking/operator groups in a deterministic order. Keep independent read-only page tests parallel. Adopt a supported production-server test configuration that sets API/realtime rewrites and storage CSP at build time and uses production cookies, rather than relying on temporary fixture adaptations. Preserve failure artifacts and report first-run failures even when retests pass. Measure normal route/action latency before changing timeout budgets; increasing every timeout would hide slow behavior.

### P3 — Formatting checks are red

Part One reports 174 files and Part Two 50. This includes existing docs and recently added form/test code, not just one isolated file.

**Suggested fix:** format hand-authored files in a separate housekeeping change. Exclude generated artifacts and the client's pinned `packages/contracts/openapi.yaml` where appropriate; never fix that vendored contract by hand. Then add `format:check` to CI once the repository has a green baseline.

### P2 — WebKit cannot reach the overflowing status table with Tab

Axe flags `.status-table-scroll` as not focusable. At a 390-pixel viewport, bundled Linux WebKit could not reach the overflowing region after 70 Tab presses. Chrome and Firefox reached it and scrolled with ArrowRight. This is a confirmed WebKit keyboard-access failure; native Safari/iOS behavior remains untested. [Chrome result](evidence/qa-2026-10-07/status-keyboard.json).

Location: `apps/web/src/components/status/status-page.tsx:250`.

**Suggested fix:** add `tabIndex={0}`, `role="region"`, and `aria-labelledby="status-conditions"` to the scrolling wrapper; the heading already supplies that ID. Add a visible focus indicator using the existing `--focus-ring` token. Retest keyboard scrolling in all three engines and native Safari/iOS.

A temporary DOM-only prototype with those attributes made the WebKit region reachable and ArrowRight scrolled it by 50 pixels; its viewport was 358 pixels wide with 713 pixels of content. The original behavior still failed on the repeat check, so that failure is retained. Application source was not changed. [WebKit measurements](evidence/qa-2026-10-07/cross-browser-keyboard-results/qa-cross-browser-smoke-sta-bd5d9-reachable-when-it-overflows-webkit/keyboard-result.json) · [Firefox measurements](evidence/qa-2026-10-07/cross-browser-keyboard-results/qa-cross-browser-smoke-sta-bd5d9-reachable-when-it-overflows-firefox/keyboard-result.json).

## Visual and page review

The captured public pages have a consistent poster-style hierarchy, orange primary actions, readable English/Georgian layouts, and explicit separation of illustrations/simulator output from telescope output. The pricing page describes per-seat/per-slot pricing without inventing checkout amounts. Planned subscription, loyalty, and pass destinations explicitly state that they are not available; their presence is not a completed commerce feature.

The mobile live room keeps the feed and capture action prominent and stacks controls, sharing, observatory status, captures, and history below it. The progress-bar finding above should be corrected. Full-page screenshots also include the Next development indicator where the dev server supplies it; this is not a production branding element.

The separate real-platform production checks rendered the primary authenticated/public data pages in both languages and tested narrower layouts at 320, 390, and 768 pixels. These checks are distinct from the fake-platform visual baselines and do not certify the physical telescope, real payments, external email delivery, or mobile native application.

[Desktop homepage](evidence/qa-2026-10-07/audit-en-public-home-1440.png) · [Phone pricing](evidence/qa-2026-10-07/audit-en-public-pricing-390.png) · [Phone live room](evidence/qa-2026-10-07/audit-en-observer-app-missions-20000000-0000-4000-8000-000000000001-session-390.png) · [Real-platform production checks](evidence/qa-2026-10-07/real-browser.json)

## Remaining coverage limits

Native Safari, iOS/Android native clients, physical telescope drivers, real payment-provider settlement, external email delivery, and a deployed production environment were not exercised. Bundled Linux Firefox/WebKit coverage was limited to the follow-up described above. Simulator captures and integration stand-ins cannot certify real hardware or actual bucket delivery. Browser timings were affected by concurrent local workloads and are not load/performance benchmarks. The Linux screenshot baseline gate completed with two successful retests; automated axe checks also leave manual screen-reader and interaction review outstanding.

## Test-environment cleanup

Temporary application/browser services and the owned sleep inhibitor were stopped. QA databases were retained for reproduction. Initial Docker cleanup commands timed out, but follow-up queries confirmed that the old isolated visual container and cached QA image were gone and storage was stopped. The continuation container was also removed after exporting its evidence, and its owned sleep inhibitor was stopped. The pre-existing PostgreSQL service was left alone. [Cleanup record](evidence/qa-2026-10-07/cleanup.json) includes each result.

## Reproduction and evidence

From Part Two:

```bash
npm run contracts:check
npm run lint
npm run typecheck
npm run build
npm run css:check
npm run test --workspace @darkview/web -- --maxWorkers=1
npm run format:check
cd apps/web
npx playwright test --project=chromium --project=signed-out --workers=1 --reporter=list
```

From Part One:

```bash
npm run contracts:check
npm run lint
npm run typecheck
npm run build
npm run test --workspace @darkview/api -- --maxWorkers=1
npm run test --workspace @darkview/realtime -- --maxWorkers=1
npm run test:agent
npm run lint:agent
npm run format:check
```

For database suites, explicitly set both `DATABASE_URL` and `DATABASE_TEST_URL` to a newly created scratch database before running `npm run test:integration`. These tests delete fixture rows, and the restore drill creates/drops named scratch databases. Never point them at normal development or production data.

The canonical visual command is `npm run visual`. Baselines are Linux/Playwright-image specific; macOS screenshot differences are not valid baseline failures. Do not use `visual:update` to hide a failure. The initial container run failed DNS resolution of the npm registry; later container attempts and any results are recorded separately.

The full rendered-page audit is stored in [browser-audit.json](evidence/qa-2026-10-07/browser-audit.json), including route, locale, viewport, heading, overflow, broken images, browser errors, and axe violations. Early connection-refused runs are preserved separately and do not count as successful page coverage.
