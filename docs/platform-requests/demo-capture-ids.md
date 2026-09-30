# Platform request: the demo seed's capture ids are not uuids

Raised 2026-09-28 while building Phase 4 slice 2 (the live room). Against
`darkview-platform` at `73233a5` (contract synced at `471f05a`); still open at `14ac895`,
whose seed keeps the ids and whose contract keeps `format: uuid`.

## What blocks

The development seed gives its demo captures the ids `CAP-DEMO-0001`, `CAP-DEMO-0002`,
`CAP-DEMO-0003` and `CAP-DEMO-LIVE-0001` (`packages/db/prisma/development-seed.ts:163-217`).
The contract types every capture id, and `Mission.captureIds`, as `format: uuid`.

`GET /missions/00000000-0000-4000-8000-000000000205` — the demo observer's one
`OBSERVING` mission — therefore answers a body the generated `zGetMissionResponse` refuses
(`captureIds: ["CAP-DEMO-LIVE-0001"]`), and the room renders "This mission could not be
loaded." The same ids reach `listCaptures` and `getCapture`.

It blocks the one live mission the dev stack has from being opened in the room, so the
live session, the mission channel and the stream cannot be seen against the real
platform until a booked mission's slot opens.

## Proposed shape

No contract change. Seed the demo captures with uuids, as every other seeded row has
(`00000000-0000-4000-8000-0000000003xx`, say), and keep `CAP-DEMO-*` as a display
reference if one is wanted.

## Screen that needs it

`/[locale]/app/missions/[id]/session` (Phase 4, `docs/plan/phase-4/02-live.md`).
