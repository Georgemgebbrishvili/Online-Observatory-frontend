# Phase 4 — The live mission room, sliced

2026-09-27. Started ahead of Phase 3's end by
[ADR-027](../../decisions/ADR-027-the-live-room-takes-the-sidera-console-layout.md), in
the SIDERA console's layout. Traced against `darkview-platform` at
`acca64803fe81c9a6c9ef9fe3b562b7537edcbd5`.

| Slice | Surface                                                 | Operations                                                                                                                     |
| ----- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1     | The room, read: state, steps, target, history, captures | `getMission`, `listMissionEvents`, `listTonightTargets`, `getObservatoryStatus`, `getObservatoryConditions`, `getCapture`      |
| 2     | The room, live: the feed and the mission channel        | `startMissionSession`, WSS `/ws/mission/{id}` (`MissionChannelMessage`), the MJPEG `streamUrl`                                 |
| 3     | The room, controlled: nudge, re-centre, capture, abort  | `submitMissionCommand`, WSS `MissionCommandResult`                                                                             |
| 4     | The owner's sharing control (DV-105)                    | `setMissionObservation`, [`04-sharing.md`](04-sharing.md)                                                                      |
| 5     | The watch page and the observer's seat (DV-104, DV-106) | `getMissionWatchView`, `purchaseObserverPack`, `joinMissionAsObserver`, `leaveMissionAsObserver`, [`05-watch.md`](05-watch.md) |

The rest of Phase 4 (`/app/live`, every failure state, the close refund copy) is Track A of
[`../04-roadmap-to-launch.md`](../04-roadmap-to-launch.md).

## Found while tracing

**The mount's position is not published to customers.** `MissionTelemetryUpdate` drops
`pointingHorizontal` on purpose (`apps/realtime/src/mission/protocol.ts:94-99`). Raised as
[`mission-pointing.md`](../../platform-requests/mission-pointing.md), answered in platform
`14ac895` as `MissionTelemetryUpdate.pointing`; slice 2 wires the dial to it.

**No live camera metadata.** Exposure, gain, stacked-frame count and frame sequence
(`LiveFrameHeader`) travel agent → cloud only, and the MJPEG stream carries no headers.
The room shows them from a `Capture` once one exists, never as live readings.

**Seeing is always null** from the Open-Meteo source
(`apps/realtime/src/conditions/open-meteo.ts:61`). Cloud cover is available, hourly and
advisory.

**No FOV or pixel scale.** Only `OpticalConfig` (F20_BARLOW / F10_NATIVE / F6_3_REDUCER),
whose focal lengths live in description text. The room names the configuration and
derives nothing.

**`MissionStateUpdate.remainingSeconds` is always null** (`protocol.ts:83-87`). The time
left is `MissionSession.expiresAt` minus now (slice 2).

**Commands have no idempotency key.** Each `submitMissionCommand` mints a fresh
`commandId` (`features/missions/command.ts`); the `Idempotency-Key` header is
booking-only. A retried request is a second command. Slice 3 never retries a command by
itself and disables the control until `MissionCommandResult` answers.

**`MissionCaptureReady.capture.thumbnailUrl` is always null** on the channel
(`protocol.ts:185-188`). Slice 2 re-reads the capture with `getCapture`.

**`listCaptures` cannot filter by mission.** The room reads `Mission.captureIds` and
`getCapture` for each, bounded.

**Done when** (from the plan): a mission runs end to end against the simulator, and every
failure state is a designed screen.
