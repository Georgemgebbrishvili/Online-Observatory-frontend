# DV-073 — `/status` page, evidence

Captured 2026-09-23 on branch `web/dv-073-status-page`, built on
`web/dv-072-legal-pages`: a public page needs the footer fix from that branch.

Everything runs against `apps/web/e2e/fake-platform.mjs`. No hardware exists, and nothing
in this repository can address a mount or a camera.

## How to reproduce

```
cd /Users/nika/Desktop/Darkview/part-2-clients
npm run lint && npm run typecheck && npm test && npm run contracts:check
cd /Users/nika/Desktop/Darkview/part-2-clients/apps/web
npx playwright test --project=chromium status.spec.ts
```

## Checks

| Check                               | Result                                                 |
| ----------------------------------- | ------------------------------------------------------ |
| `npm run lint`                      | pass                                                   |
| `npm run typecheck`                 | pass                                                   |
| `npm test`                          | pass — 27 files, 81 tests                              |
| `npm run contracts:check`           | pass — 3 generated artifacts match the pinned contract |
| `npx playwright test` (whole suite) | pass — 49 tests                                        |

## Screenshots

| File                     | What it shows                                                                                                                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `01-status.png`          | `/en/status`. SIMULATED banner, link and weather with the operator's hold, whether an observation is running, and tonight's three bookable hours — the last of which has no stored forecast. |
| `02-status-georgian.png` | `/ka/status`, the same page in Georgian, including localised age units.                                                                                                                      |

## What the tests assert

- The page names the observatory, states the reading's age, and — because the simulator
  is answering — carries SIMULATED OBSERVATORY unmistakably.
- An hour with no stored forecast renders as unknown and carries **no numbers at all**,
  so it cannot be misread as a clear hour.
- The forecast is labelled advisory, and the page says in its own copy that a forecast
  never starts or clears a weather hold — the operator's hold above stays authoritative.
- The footer reaches `/status` in both locales.
- `readStatus` unit tests cover what end-to-end cannot reach, because the fetch is
  server-side: platform unreachable, an empty observatory list, a payload that fails
  contract validation, a forecast failure that must not take the page down, and the
  observatory named in the reader's language.

## Decisions worth challenging

**Unreachable and no-observatory are told apart.** Both render an error panel, but with
different words. A visitor who is told "no observatory is listed" learns something
different from one told "the platform did not answer".

**Nothing stale is ever shown.** The route is `force-dynamic` and `platformRequest`
already sends `cache: "no-store"`. When the platform cannot be reached the page shows an
error rather than an older reading, because a stale value presented as live is worse than
no value.

**A failed forecast does not take the page down.** Conditions are advisory (DV-110), so
they are fetched with their own catch and the status itself still renders.

## One localisation bug this found

The first Georgian render read `მიღებულია 20 min წინ`. The page was reusing `formatAge`
from the operator console, which returns English units — acceptable in an operator-only
tool, not on a public Georgian page. The status page now formats ages from its own copy
(`წმ`, `წთ`, `სთ`), which also removes a public page's dependency on
`features/operator/`.

## Note on DV-072's screenshots

`docs/evidence/dv-072/*.png` are updated in the same commit. The footer gained a Status
link, which appears in those pages' footers; leaving the old images would have made that
evidence quietly wrong. Nothing about the legal pages themselves changed.

## Risks and assumptions

- **The fake platform is not the platform.** It implements the two public routes' contract
  shapes and nothing else. Agreement with the real API is unproven.
- The page does not refresh itself. A reader sees the reading taken when the page was
  requested, and its age is stated; a live-updating chip is not part of this issue.
- `currentTargetName` is shown only when the platform sends it, which it does only while
  a session owner has opted in (ADR-007). The fake keeps it null, so the opted-in case is
  rendered but not exercised against real data.
- Hours are rendered in the observatory's timezone as `GET /observatories` reports it, not
  the reader's. For a single Tbilisi observatory that is the useful choice; it is a
  decision to revisit if a partner node in another timezone is ever listed.
- The conditions table scrolls horizontally on a narrow viewport rather than reflowing.
  DV-081 is the responsive and accessibility pass.
