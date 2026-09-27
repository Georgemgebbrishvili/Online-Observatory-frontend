# Phase 4, slice 1 — the room, read

2026-09-27. Replaces the local state-machine simulator at `/app/missions/[id]/session`
with the platform's mission, in the SIDERA console's layout
([ADR-027](../../decisions/ADR-027-the-live-room-takes-the-sidera-console-layout.md)).
Traced against `darkview-platform` at `acca64803fe81c9a6c9ef9fe3b562b7537edcbd5`.

## Contract trace

| On screen                     | Source                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| The mission                   | `getMission` → `Mission` (`state`, `failureReason`, `mode`, `targetId`, `observatoryId`, `captureIds`)  |
| Heading and description       | `Mission.state`; `failureReason` stated under it                                                         |
| Target name, back link        | `Mission.targetId` → `listTargets` (`readCatalogue`) → `Target.nameEn` / `nameKa`, `slug`                 |
| Simulated notice              | `Mission.mode: SIMULATED` → `ModeNotice`, `/status`'s copy                                               |
| The five steps                | `Mission.state`; for a failure or hold, the last primary state in `listMissionEvents`                    |
| The feed's place              | No stream in this slice. A plate for Jupiter, Saturn, Mars, Venus (ADR-027 §6), else the optical ring    |
| Dial, altitude, azimuth       | `listTonightTargets` → `TargetVisibility.horizontal` for the mission's target — the **target's** position |
| Rises, sets, computed at      | `TargetVisibility.risesAt`, `setsAt`, `evaluatedAt`, in the observatory's zone                           |
| Observatory link, weather     | `getObservatoryStatus` → `link`, `weather.status`, `weather.holdActive`                                 |
| Cloud cover                   | `getObservatoryConditions` → the hour containing the read's instant, `cloudCoverPercent`; advisory      |
| Captures from this mission    | `Mission.captureIds`, the eight newest → `getCapture` → `thumbnailUrl`                                    |
| Mission history               | `listMissionEvents`, every page (bounded at five), shown newest first: `at`, `state`, `source`, `failureReason` |
| Time zone                     | `listBookableObservatories` → the mission's observatory's `timezone`; UTC if unreadable                  |

Only the mission is required. Each other read fails on its own and the room says what it
lacks.

## States, en + ka

| State                          | Where it comes from                         | en                                                                   | ka                                                                           |
| ------------------------------ | ------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Loading                        | `[locale]/loading.tsx`                      | shared                                                               | shared                                                                       |
| Not found                      | not a uuid, 404, or somebody else's mission | Observation not found                                                | shared                                                                       |
| Signed out                     | `requireUser`, or 401 from the platform     | → sign-in                                                            | → შესვლა                                                                     |
| Platform unreachable           | `getMission` fails, or its body fails the schema | This mission could not be loaded.                              | ამ მისიის ჩატვირთვა ვერ მოხერხდა.                                            |
| Before (REQUESTED–PREPARING)   | `missionPhase` → `before`                   | The live view opens here when the telescope reaches {target}.         | პირდაპირი ხედი აქ გაიხსნება, როცა ტელესკოპი ობიექტს მიაღწევს: {target}.      |
| During (SLEWING–PROCESSING)    | `missionPhase` → `during`                   | The live view is not connected on this page yet. (slice 2 replaces it) | პირდაპირი ხედი ამ გვერდზე ჯერ არ არის დაკავშირებული.                         |
| Ended (COMPLETE, any failure)  | `missionPhase` → `ended`                    | This observation has ended.                                          | ეს დაკვირვება დასრულდა.                                                     |
| Weather hold, not visible, hardware error, cancelled, failed | `Mission.state`, `failureReason` | state title + one of 17 reasons                | იგივე, ქართულად                                                              |
| Agent offline                  | `PublicObservatoryStatus.link: OFFLINE`     | Offline                                                              | ოფლაინ                                                                       |
| Simulated                      | `Mission.mode`                              | SIMULATED OBSERVATORY                                                | `/status`'s copy                                                             |
| Target below the horizon       | `horizontal.altitudeDegrees < 0`            | Below the horizon now.                                               | ახლა ჰორიზონტს ქვემოთაა.                                                    |
| Tonight unreadable             | `listTonightTargets` fails                  | Tonight's sky could not be read.                                     | ამაღამინდელი ცის წაკითხვა ვერ მოხერხდა.                                      |
| No captures                    | `captureIds: []`                            | No captures yet.                                                     | კადრები ჯერ არ არის.                                                         |
| History unreadable             | `listMissionEvents` fails                   | The history could not be loaded.                                     | ისტორიის ჩატვირთვა ვერ მოხერხდა.                                             |

The room is entered from the dashboard's upcoming missions ("Open mission"). `/app/live`
keeps its fixture until slice 2.

The fake platform serves the observing, scheduled and complete missions and now
`GET /missions/{id}/events`. It has no failed mission: adding one changes every mission
list the operator and dashboard baselines read, so the failure states are covered by
`room.test.ts` and the `MissionSteps` specimen on `/design-system` until slice 2 adds a
mission channel that can move a mission into one.
