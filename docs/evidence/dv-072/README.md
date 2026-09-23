# DV-072 — Legal pages, evidence

Captured 2026-09-23 on branch `web/dv-072-legal-pages`.

The three documents are **not in force**. Every page says so, in both locales. What is
still missing, and who has to supply it, is listed in `docs/legal-source.md`.

## How to reproduce

```
cd /Users/nika/Desktop/Darkview/part-2-clients
npm run lint && npm run typecheck && npm test && npm run contracts:check
cd /Users/nika/Desktop/Darkview/part-2-clients/apps/web
npx playwright test --project=chromium legal.spec.ts
```

## Checks

| Check                               | Result                    |
| ----------------------------------- | ------------------------- |
| `npm run lint`                      | pass                      |
| `npm run typecheck`                 | pass                      |
| `npm test`                          | pass — 26 files, 75 tests |
| `npm run contracts:check`           | pass                      |
| `npx playwright test` (whole suite) | pass — 44 tests           |

## Screenshots

| File                   | What it shows                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| `terms.png`            | `/en/terms`. Two settled sections, six awaiting legal review, draft notice above them all. |
| `privacy.png`          | `/en/privacy`. One settled section (session cookies), seven pending.                       |
| `refunds.png`          | `/en/refunds`. Three settled sections from ADR-022, four pending.                          |
| `refunds-georgian.png` | `/ka/refunds`, the same document and the same draft notice in Georgian.                    |

## What the tests assert

- Each document renders, carries the "not yet in force" notice, and shows at least one
  section awaiting legal review.
- A pending section renders exactly one paragraph — the shared explanation — so no
  section can quietly acquire invented legal text.
- A settled section renders its decided text.
- The terms page states that Darkview is not a long-exposure astrophotography service.
- The footer reaches all three documents in both `en` and `ka`.

## One fix outside DV-072's scope, and why it is here

`.site-footer`, `.footer-grid` and `.footer-nav` lived in `homepage.css`, which only
`app/[locale]/page.tsx` imports. Every other route using `SiteFooter` — `/pricing`,
`/observatory`, `/network`, and now the legal pages — rendered the footer unstyled, with
its links running together as one unbroken line.

The rules moved verbatim to `styles/footer.css`, imported by `globals.css`. No rule
changed. The home page footer was re-checked against the previous rendering and is
unchanged. It is a separate commit so it can be reviewed or reverted on its own.

Without this, DV-072's own acceptance — legal documents reachable from the footer —
could not be met on the pages it adds.

## Risks and assumptions

- **Nothing here is legal advice and no document is in force.** The settled sections
  restate decisions already recorded in `CLAUDE.md` and the ADRs; they are not drafted law
  and have had no legal review.
- Five of the missing items block payment onboarding, not just launch. They are listed
  first in `docs/legal-source.md`.
- The pages are indexable. A cached draft policy may be worse than no page; applying
  `privatePageMetadata` is a maintainer decision and was not taken here.
- The evidence screenshots are written by `legal.spec.ts` in the default Playwright
  project. The DV-077 evidence run must still be invoked on its own — the two operator
  projects share the fake platform's mutable state.
