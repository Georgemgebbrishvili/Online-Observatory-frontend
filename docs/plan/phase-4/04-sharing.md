# Phase 4, slice 4 — the controller's sharing control

2026-10-01. The session owner opens the live session to observers, or closes it, and
hands out the watch link (DV-105, [ADR-007](../../decisions/ADR-007-observer-pack.md),
ADR-034 in `darkview-platform`). The watch page itself, seat purchase and joining are
slice 5. Contract at `14ac895`; handler traced in `darkview-platform` at `f2f51db`
(`apps/api/src/app/missions/[missionId]/observation/route.ts`,
`apps/api/src/features/missions/observers.ts` `setMissionObservation`).

## Contract trace

| On screen          | Source                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| Private / open     | `Mission.observable` (private by default)                                                        |
| Seats taken        | `Mission.observerCount` of `Mission.observerCapacity` (5 today; 10 after #167, ADR-036)          |
| Open, close        | `setMissionObservation` `PATCH /missions/{id}/observation` `{ observable }` → 200 `Mission`      |
| When it is offered | the live states only: the handler answers 409 `MISSION_NOT_ACTIVE` outside `LIVE_MISSION_STATES` |
| Who                | the owner: anyone else gets 404, operators included (consent is the owner's)                     |
| Watch link         | `/{locale}/app/missions/{id}/watch` (slice 5's page), copied to the clipboard                    |
| Refusals           | 409 `MISSION_NOT_ACTIVE`, 404, 429 `RATE_LIMITED`                                                |

The count is the server's at the page's render and after each change; nothing streams it
(`MissionTelemetryUpdate` does not carry it). Reloading the room reads it again.

## Found while tracing

**Closing removes paying observers, with no refund rule.** Closing marks every attached
seat LEFT, and a closed session refuses `joinMissionAsObserver`, so an observer who paid
for a seat lost it. The maintainer decided on 2026-10-02
([ADR-036](../../decisions/ADR-036-ten-observers-and-a-refund-for-the-time-a-close-takes.md)):
a close refunds each paid seat the time it loses, and a session takes ten observers.
Both are platform changes
([request](../../platform-requests/observer-capacity-and-close-refund.md)). Until they
merge, the close confirmation says only that anyone watching is removed.

**The count can be stale.** Nothing streams `observerCount`, so the panel always confirms
a close, and the confirmation names no number.

## States, en + ka

| State         | Where it comes from                     | en                                                                                    | ka                                                                                                         |
| ------------- | --------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Private       | `observable: false`                     | Only you can see this session. · Let others watch                                     | ამ სესიას მხოლოდ თქვენ ხედავთ. · ნება დართეთ სხვებს უყურონ                                                 |
| Open          | `observable: true`                      | Others can watch. {count} of {capacity} seats taken. · Copy watch link · Stop sharing | სხვებს შეუძლიათ უყურონ. დაკავებულია {count} ადგილი {capacity}-დან. · ბმულის კოპირება · გაზიარების შეწყვეტა |
| Copied        | the clipboard write                     | Link copied                                                                           | ბმული დაკოპირდა                                                                                            |
| Confirm close | Stop sharing, always                    | Stop sharing? Anyone watching is removed. · Stop sharing · Keep sharing               | შევწყვიტოთ გაზიარება? ყველა მაყურებელი გაითიშება. · შეწყვეტა · გაგრძელება                                  |
| Saving        | the request in flight                   | Saving                                                                                | ინახება                                                                                                    |
| Session over  | 409 `MISSION_NOT_ACTIVE`                | This session has ended.                                                               | ეს სესია დასრულდა.                                                                                         |
| Error         | no answer, 500, 429, an unreadable body | Something went wrong. Try again.                                                      | რაღაც შეფერხდა. სცადეთ თავიდან.                                                                            |

The fake platform answers `setMissionObservation` for the observing mission, per session.
