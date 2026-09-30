# Phase 4, slice 2 — the room, live

2026-09-28. The room's feed and the mission channel: the customer's session, the
channel's messages, and the MJPEG stream, in the SIDERA arrangement slice 1 built
([ADR-027](../../decisions/ADR-027-the-live-room-takes-the-sidera-console-layout.md),
[ADR-011](../../decisions/ADR-011-live-view-transport.md),
[ADR-018](../../decisions/ADR-018-a-customer-starts-their-booked-mission.md)). Contract
synced at `14ac895`; handlers traced in `darkview-platform` at `73233a5`, and at `14ac895`
for `pointing`.

## Contract trace

| On screen                     | Source                                                                                                                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Start observation (SCHEDULED) | `startMissionSession` `POST /missions/{id}/start` → `MissionSession`; explicit, never retried by itself                                                                                           |
| Reopen (PREPARING–CAPTURING)  | The same call on arrival: the platform rotates the session (`features/missions/session.ts`, `LIVE_MISSION_STATES`)                                                                                |
| Slot opens at                 | `Mission.scheduledStartAt`, in the observatory's zone; the button waits for it                                                                                                                    |
| Refusals                      | `ApiError.code`: `OBSERVATORY_OFFLINE`, `WEATHER_HOLD`, `MISSION_NOT_ACTIVE`, `SAFETY_REFUSED`, `SAFETY_NOT_CONFIGURED`, `CONFLICT`, `SESSION_NOT_OWNER`, `NOT_FOUND`, `RATE_LIMITED`, `INTERNAL` |
| The channel                   | `MissionSession.missionChannelUrl` on this origin, `x-darkview-websockets.missionClient`; `CLIENT_SUBSCRIBE` with the `sessionId`, `CLIENT_PING` every 30 s                                       |
| Heading, reason, steps        | `MissionStateUpdate.state`, `failureReason`; each new state re-reads the room (history)                                                                                                           |
| Agent offline                 | `MissionTelemetryUpdate.link`                                                                                                                                                                     |
| The picture                   | `MissionStreamInfo.streamUrl` in an `<img>` (`encoding: JPEG` = `multipart/x-mixed-replace`); a failed URL reopens the channel for a fresh offer                                                  |
| Simulated badge               | `MissionStreamInfo.mode: SIMULATED`; the LIVE dot only for `REAL`                                                                                                                                 |
| Time left                     | `MissionSession.expiresAt` minus now. `remainingSeconds` is always null (`protocol.ts:83-87`)                                                                                                     |
| Session over                  | `MissionSession.expiresAt` reached: the channel and the stream close                                                                                                                              |
| Another tab holds it          | `MissionChannelError.code: FORBIDDEN` → "Watch here" starts again, rotating the session                                                                                                           |
| New capture                   | `MissionCaptureReady` → the room is re-read, since its `thumbnailUrl` is null                                                                                                                     |
| Pointing dial, telescope      | `MissionTelemetryUpdate.pointing` (0.1°): the marker travels with each report while slewing and settles while centring; `null` → "no position"; the target stays as a dashed ring               |
| Pointing dial, target         | `listTonightTargets` for the **mission's** observatory, until the channel reports a position; again once the live view closes                                                                    |

Both realtime paths, `/ws/mission/{id}` and `/stream/mission/{id}`, are same-origin, as
`/api` is: the signed `streamUrl` is on the web app's origin, because the session cookie
it checks is only sent there. `next.config.ts` rewrites them to `DARKVIEW_REALTIME_URL`
(default `127.0.0.1:4001`) in development; the reverse proxy does it in production, and
`proxy.ts` leaves both paths alone. The mount's position, [requested](../../platform-requests/mission-pointing.md),
arrived in platform `14ac895` (#160) and drives the dial.

## States, en + ka

| State                   | Where it comes from                                   | en                                              | ka                                                |
| ----------------------- | ----------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------- |
| Loading                 | `[locale]/loading.tsx`                                | shared                                          | shared                                            |
| Not started             | `SCHEDULED`, no session                               | Your slot opens at {time}. / Your slot is open. | თქვენი დრო {time}-ზე იწყება. / თქვენი დრო დაიწყო. |
| Starting                | the start in flight                                   | Starting                                        | იწყება                                            |
| Connecting              | a session, no stream yet                              | Connecting                                      | კავშირი მყარდება                                  |
| Live                    | a `MISSION_STREAM` URL on screen                      | Live · Simulator output, not telescope output.  | პირდაპირი ხედი · სიმულატორის გამოსახულება…        |
| Link lost, reconnecting | the socket closed; reopened backing off 1 → 15 s      | Reconnecting                                    | კავშირი აღდგება                                   |
| Agent offline           | `link: OFFLINE`, or the start's `OBSERVATORY_OFFLINE` | Observatory offline                             | ობსერვატორია ოფლაინშია                            |
| Weather hold            | `state: WEATHER_HOLD`, or the start's `WEATHER_HOLD`  | Weather hold                                    | მისია ამინდის გამო შეჩერდა                        |
| Session expired         | `expiresAt` reached                                   | Your time is up                                 | დრო ამოიწურა                                      |
| Closed                  | PROCESSING, COMPLETE, a failure                       | Live view closed                                | პირდაპირი ხედი დაიხურა                            |
| Refused                 | a 409, or the channel's `FORBIDDEN`                   | The live view could not open + the reason       | პირდაპირი ხედი ვერ გაიხსნა + მიზეზი               |
| Error                   | no answer, 500, 429, or a body the schema refuses     | Something went wrong + Try again                | რაღაც შეფერხდა + სცადე თავიდან                    |
| Telescope position      | `MissionTelemetryUpdate.pointing`                     | Where the telescope points                      | სად იყურება ტელესკოპი                             |
| No position             | `pointing: null`, or the channel down                 | The telescope has not reported a position.      | ტელესკოპს მდებარეობა ჯერ არ გადმოუცია.            |

The fake platform serves all of them to the e2e suite: the `fake_live` cookie picks a
scenario per browser context (`slow`, `error`, `offline`, `hold`, `drop`, `expire`,
`forbidden`, `open`), and every message it sends is parsed by the generated validators.

## Not in this slice

The commands (slice 3). `/app/live` still shows its fixture: ADR-027 moves it to the
caller's active mission's room "in slice 2", which is left for its own change because it
needs the active mission to be found from `listMissions`, and it changes that page's
baselines. The observer's view (DV-104).

## Found while building

The demo observer's `OBSERVING` mission cannot be read at all: its seeded capture id is
not a uuid ([`demo-capture-ids.md`](../../platform-requests/demo-capture-ids.md)).

Slice 1 read tonight's sky at the first-party observatory whatever the mission's was, so a
night-side mission's dial showed the target's Tbilisi position. The room now reads
`listTonightTargets` for `Mission.observatoryId`.
