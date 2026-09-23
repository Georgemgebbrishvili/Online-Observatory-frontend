# DV-078 — Operator missions, targets and logs, evidence

Captured 2026-09-23 on branch `web/dv-078-operator-missions`, which is built on
`web/dv-077-operator-console` rather than on `web/dv-072-legal-pages`: DV-078's only
dependency is DV-077.

Everything runs against `apps/web/e2e/fake-platform.mjs`. No hardware exists, and nothing
in this repository can address a mount or a camera.

## How to reproduce

```
cd /Users/nika/Desktop/Darkview/part-2-clients
npm run lint && npm run typecheck && npm test && npm run contracts:check
cd /Users/nika/Desktop/Darkview/part-2-clients/apps/web
npx playwright test --project=operator-records   # rewrites the screenshots below
```

Run the operator projects separately. All three drive the same fake platform, and this
one cancels a mission and disables a target.

## Checks

| Check                               | Result                                                 |
| ----------------------------------- | ------------------------------------------------------ |
| `npm run lint`                      | pass                                                   |
| `npm run typecheck`                 | pass                                                   |
| `npm test`                          | pass — 26 files, 75 tests                              |
| `npm run contracts:check`           | pass — 3 generated artifacts match the pinned contract |
| `npx playwright test` (whole suite) | pass — 45 tests                                        |

## Screenshots

| File                   | What it shows                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `01-missions.png`      | `/en/admin/missions`, all three fixture missions after paging. State, mode, requested and started times, capture count, and a per-row link to that mission's logs. |
| `02-targets.png`       | `/en/admin/targets`. The approved catalogue with J2000 coordinates for the fixed target and the body for the ephemeris one.                                        |
| `03-logs.png`          | `/en/admin/logs`, three correlated audit events with their structured detail.                                                                                      |
| `04-cancel-dialog.png` | The cancel dialog with no reason yet given: settlement defaults to "No settlement" and submit is disabled.                                                         |
| `05-cancelled.png`     | After cancelling: the row reads CANCELLED and no longer offers a cancel.                                                                                           |

## What the tests assert

- Missions page two at a time and the cursor is followed, so paging is exercised rather
  than assumed. Filtering by state narrows the list and resets to a first page.
- A mission in a terminal state (COMPLETE, CANCELLED, FAILED) offers no cancel.
- Cancelling posts `{reason, resolution}`, is refused by the form until a reason of at
  least four characters is given, and the cancelled row updates in place.
- The cancellation appears in the audit log with its reason recorded verbatim.
- Disabling a target posts `{enabled: false}` and the row reflects the platform's answer,
  not an optimistic local flip.
- The audit log filters by category and by mission, and the missions table's per-row link
  carries `?mission=<id>` into that filter.
- A signed-in non-operator is redirected to `/en/app`, and `/api/admin/missions` answers
  `403` for them.

## Two bugs this work found

**A dialog rendered inside a table cell is laid out with that cell.** The first cancel
dialog was one `<Modal>` per row, inside the actions cell. It opened, but its panel's
contents were displaced: measured, the panel sat at x=368 while its heading and submit
button rendered at x=68. `showModal()` puts the element in the top layer, but the box
still takes the static position of where it was rendered.

Fixed structurally rather than with CSS: `Dialog` gained an optional controlled mode
(`open` / `onClose`, no built-in trigger), and `MissionTable` now renders one dialog
outside the table, driven by which mission is being cancelled. That also replaces one
dialog per row with one per table. The uncontrolled path is untouched, and DV-077's
mode-switch dialog still renders identically.

**Playwright's full-page screenshots composite `position: fixed` elements.** The skip
link, correctly off-screen in the browser (`bottom: -12px`, unfocused), appeared over a
heading in the stitched image. Verified as a capture artifact, not a product defect, and
hidden for the capture only.

## Risks and assumptions

- **The fake platform is not the platform.** It implements these four routes' contract
  shapes and nothing else; agreement with the real API is unproven until
  `darkview-platform` DV-063 runs.
- Cancelling sets `CANCELLED` and records an audit row in the fake. What a real
  `resolution` of `REFUND` or `RESCHEDULE` actually does to a booking is the platform's
  behaviour, and none of it is proven here.
- Mission and actor identifiers are shown as the first eight characters. That is fine for
  random UUIDs, but the fixtures had to be given distinct prefixes before the column was
  readable at all.
- Enabling and disabling a target is proven against the fake. The claim in the page's own
  copy — that disabling removes a target from every customer surface — is the platform's
  to keep, and is not tested here.
- Targets are fetched once server-side with `limit=100`, as the control page does. A
  catalogue larger than that would need paging.
