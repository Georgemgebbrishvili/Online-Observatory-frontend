# DV-077 — Operator console, evidence

Captured 2026-09-23 on branch `web/dv-077-operator-console` at commit `484f42e`.

Everything below runs against `apps/web/e2e/fake-platform.mjs`, a simulated first-party
observatory with one live mission. No hardware exists yet, and nothing in this repository
can address a mount or a camera.

## How to reproduce

```
cd /Users/nika/Desktop/Darkview/part-2-clients
npm run lint && npm run typecheck && npm test && npm run contracts:check
cd /Users/nika/Desktop/Darkview/part-2-clients/apps/web
npx playwright test --project=operator            # the assertions
npx playwright test --project=operator-evidence   # rewrites the screenshots below
```

Run the two Playwright projects separately. Both drive the same fake platform, and the
evidence run mutates its mode and parked state.

## Checks

| Check                         | Result                                                 |
| ----------------------------- | ------------------------------------------------------ |
| `npm run lint`                | pass                                                   |
| `npm run typecheck`           | pass                                                   |
| `npm test`                    | pass — 25 files, 71 tests                              |
| `npm run contracts:check`     | pass — 3 generated artifacts match the pinned contract |
| `--project=operator`          | pass — 7 tests                                         |
| `--project=operator-evidence` | pass — 6 tests                                         |

## Screenshots

| File                          | What it shows                                                                                                                                                               |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `01-overview-simulated.png`   | `/en/admin`. SIMULATED banner, device health, telemetry, active mission, safety envelope. Tracking yes, parked no. `MAX_ALT_SAFE` reads UNMEASURED — every slew is refused. |
| `02-control-simulated.png`    | `/en/admin/control`. Hardware mode and manual control, each command an audited override.                                                                                    |
| `03-real-switch-dialog.png`   | The REAL switch with a reason given and presence not yet affirmed. Submit is disabled.                                                                                      |
| `04-real-hardware-banner.png` | After affirming presence: REAL HARDWARE banner, "Commands move the physical telescope."                                                                                     |
| `05-overview-georgian.png`    | `/ka/admin`, the same overview in Georgian.                                                                                                                                 |
| `06-parked.png`               | After Emergency Park: parked yes, tracking no, ALT 0.0° AZ 180.0°.                                                                                                          |

## What the assertions cover, beyond the pictures

- Both routes show the mode banner and an enabled Emergency Park.
- GoTo is offered only for targets carrying fixed coordinates.
- The REAL switch posts `{mode, reason, attendedOperatorPresent}` and refuses to submit
  until presence is affirmed. The platform rejects `REAL` without it.
- Emergency Park posts `type: PARK` and is accepted `202`.
- A signed-in non-operator is redirected to `/en/app`, and the console's own API call
  returns `403` for them.

## Risks and assumptions

- **Simulator only.** No frame here came from a telescope. `MAX_ALT_SAFE` is unmeasured
  and must be measured from the physical optical train before any real slew.
- **The fake platform is not the platform.** It implements the pinned contract's shapes
  for these routes and nothing else. Agreement with the real API is unproven until
  `darkview-platform` DV-063 is running.
- The REAL switch is proven only as a client-side gate plus a request body. The refusal
  that matters is the agent's, and it is not in this repository.
- `ბოლო heartbeat` on the Georgian overview mixes scripts. Intentional or not, it is a
  DV-080 question; `docs/georgian-terminology.md` has no agreed term for heartbeat.
