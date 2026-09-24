# Platform request: running a simulated mission during the working day

Raised 2026-09-24 from `chore/dev-stack-and-boundary`. Against `darkview-platform` at
`acca64803fe81c9a6c9ef9fe3b562b7537edcbd5`. Depends on
[dev-safety-envelope.md](dev-safety-envelope.md): until that is resolved every slew is
refused at any hour, so daylight is the second blocker, not the first.

## What blocks

At 14:00 Tbilisi a simulated mission cannot be booked, let alone slewed:

| Layer          | Rule                                                                                                  | Where                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Slots          | Only astronomical darkness (Sun ≤ −18°), narrowed to the seeded availability window 18:00–23:59 local | `lib/slots/darkness.ts:21,101-133`, `seed.ts:232-250`  |
| Reserve        | Only an instant the same grid regenerates                                                             | `features/booking/reserve.ts:335-346, 983-1020`        |
| Start          | `now >= slotStartAt`, then `evaluatePointing` with no override                                        | `features/missions/session.ts:297, 329-338`            |
| Cloud pointing | Daylight lock from the **database** observatory's coordinates, capped at `min(configured, 0)`         | `lib/safety/envelope.ts:81-85, 260-268`, `store.ts:85` |
| Agent pointing | Daylight lock from its own `DARKVIEW_AGENT_SITE_*`                                                    | `agent/darkview_agent/safety/envelope.py`              |
| Targets        | `SUN_TOO_HIGH` above −12°/−18°                                                                        | `lib/ephemeris/visibility.ts:30-33, 137-138`           |

No runtime clock injection exists: routes use `new Date()`, the agent `datetime.now(UTC)`.

## Options investigated, without patching the platform

**(a) Dev-only night-side coordinates.** Agent-only coordinates do not work: the cloud
evaluates daylight from the database row first and refuses. Moving the database row
too needs direct SQL (no route updates an observatory's lat/lon/timezone), plus a new
`timezone` and new `NetworkAvailabilityWindow` rows, because slots are cut from
18:00–23:59 in `Observatory.timezone`. That is hand-editing platform data to get past
safety rules. Forecast, tonight's targets and email times would then describe a site that
is not the demo observatory. Rejected: a workaround, which the platform rules forbid.

**(b) `DARKVIEW_AGENT_ATTENDED=1` with `SIMULATED`.** The agent does start that way, and
its `operator_override` is `attended and envelope.issued_by_operator_id is not None`
(`command/validator.py:397-411`). But the cloud never sets it: `POST /admin/override`
calls `evaluatePointing` with no override parameter (`features/admin/override.ts:283-325`,
"there is no parameter here that could carry one"). The customer path carries no operator
id at all. There are also no daylight slots. Unreachable. It would also misuse
`ATTENDED`, which asserts that an operator is physically at the observatory. Rejected.

**(c) Anything the platform already has.** Nothing at runtime. `ManualClock` and the
`now:` arguments exist only for tests (`e2e/booking-to-capture.integration.test.ts:96`).

## Proposed shape

No contract change. **Recommended: a second seeded demo observatory on the night side**,
`SIMULATED`, `isDemo`, with an APPROVED node, its own device token, availability windows
covering its whole night, and coordinates and timezone that agree. For example,
Mauna Kea (19.82, −155.47, `Pacific/Honolulu`): 14:00 Tbilisi is about 00:00 there, and
its astronomical night covers roughly 09:00–18:00 Tbilisi. Every safety rule runs as
written on both sides. Nothing is exempted; it simply is night there. The client stack
then starts a second agent against it, and `dev:stack` already reads ids from
`development-seed.ts`.

The alternative, a process-wide dev clock offset in API, realtime and agent, touches
session expiry, command TTLs and every audit timestamp. It is much riskier and not
recommended.

## Screens that need it

The same as dev-safety-envelope.md, whenever the work is done in daylight.
