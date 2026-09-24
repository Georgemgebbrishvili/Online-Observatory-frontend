# Platform request: a simulator safety envelope for the dev seed

Raised 2026-09-24 from `chore/dev-stack-and-boundary`. Against `darkview-platform` at
`acca64803fe81c9a6c9ef9fe3b562b7537edcbd5`.

## What blocks

The development seed writes the demo observatory's `SafetyEnvelope` with
`maxAltitudeDegrees: null` (`packages/db/prisma/seed.ts:141-150`), deliberately. While it is
null both halves refuse every slew, at any hour:

- cloud: `evaluatePointing` → `SAFETY_ENVELOPE_UNMEASURED` (`apps/api/src/lib/safety/envelope.ts:214`);
  `startScheduledMission` → 409 `SAFETY_NOT_CONFIGURED` (`features/missions/session.ts:318`);
- agent: `envelope.py:208`, fed only by `CLOUD_SAFETY_ENVELOPE_UPDATE`.

Neither side has a simulator exemption. So on a freshly seeded local stack no mission can
leave `SCHEDULED`, and no screen after mission start can be built or tested against the
real platform: the live room, capture, the post-capture Collection entry, the operator's
view of a running mission.

## Why the client does not work around it

The only way to set the value is `PUT /admin/observatories/{id}/safety-envelope` with
`maxAltitudeMeasuredAt` and `maxAltitudeMeasuredBy`. Recording a number there that nobody
measured is a fabricated measurement: CLAUDE.md ("never guess it, never let a default value
ship") and `docs/SAFETY.md` §2 both forbid it outside a clearly-named fake.

## Screens that need it

`/[locale]/app` mission room (live view, capture), `/[locale]/app/collection` after a
capture, `/[locale]/admin` control while a mission runs. `dev/README.md` step 8.

## Proposed shape

No contract change. One of these, platform's choice:

1. **Seed a clearly-named fake, simulated observatory only.** The seed sets
   `maxAltitudeDegrees` to a named constant (the e2e suite already has
   `FAKE_MEASURED_MAX_ALTITUDE_DEGREES = 78`) with
   `maxAltitudeMeasuredBy = "SIMULATOR — NOT A MEASUREMENT"`, and only when
   `Observatory.mode = SIMULATED` and `isDemo = true`. `setSafetyEnvelope` and node approval
   refuse that measurer string on any non-simulated observatory, so it can never reach real
   hardware.
2. **A dev script**, e.g. `npm run db:seed:simulator-envelope`, doing the same through
   `setSafetyEnvelope` so the audit trail records it, with the same guards.

Either way the agent keeps its UNMEASURED refusal for any envelope it is not sent.
