# Platform request: where the mount is pointing, on the mission channel

Raised 2026-09-27 from Phase 4 (`docs/plan/phase-4/README.md`). Against
`darkview-platform` at `acca64803fe81c9a6c9ef9fe3b562b7537edcbd5`.

**Answered** by platform `14ac895` (#160): `MissionTelemetryUpdate.pointing`, as proposed,
sent to the owner and to seated observers. The room's dial reads it since Phase 4 slice 2
(`docs/plan/phase-4/02-live.md`).

## What blocks

The live room shows a pointing dial: the sky as a circle, horizon at the rim, zenith at
the centre, and a marker for where the telescope is. The customer watches the marker
travel during `SLEWING` and settle during `CENTERING`.

No client-facing message carries the mount's position.

- `ObservatoryTelemetry.pointingHorizontal` and `pointingEquatorial` exist, but only on
  `adminGetObservatoryState`.
- `MissionTelemetryUpdate` drops them on purpose: `missionTelemetryUpdate()` in
  `apps/realtime/src/mission/protocol.ts:94-99` says "the pointing coordinates ... stop
  here. Adding a field to this function is a contract change."

Until this is answered, the dial shows the **target's** position from
`listTonightTargets` (`TargetVisibility.horizontal`), labelled as the target's, not
the telescope's. That position is correct, but it does not move while the mount slews,
and it cannot show a mount that has missed.

## Screens that need it

`/app/missions/[id]/session`, the pointing panel: Phase 4 slice 2, where the room
subscribes to `/ws/mission/{missionId}`.

## Proposed shape

On `MissionTelemetryUpdate`, one nullable field:

```yaml
pointing:
  oneOf:
    - $ref: "#/components/schemas/HorizontalCoordinates"
    - type: "null"
  description: |
    Where the mount is pointing, rounded to 0.1°. Null when the agent has not reported
    a position. Sent only on the channel of the mission it belongs to.
```

Why this is narrow enough to publish:

- **Horizontal only.** No equatorial pair, no device identity, no driver state, none of
  what the narrowing comment protects.
- **Rounded to 0.1°.** Enough for a dial 140 px across; not a precision instrument
  readout.
- **Only on the owner's mission channel,** which already carries `tracking` and
  `residualArcminutes`. Observers (ADR-007) may be given it or not; the platform
  decides.
- **It reveals nothing about the site.** Where the telescope points in the sky follows
  from the target and the time, both already public.

## Not asked for

Pixel scale, FOV and live exposure/gain metadata are also absent from the client
contract (`LiveFrameHeader` travels agent → cloud only). The room does without them for
now: optics are named by `OpticalConfig`, exposure and gain appear once a `Capture`
exists. They are recorded in the Phase 4 README, not requested here.
