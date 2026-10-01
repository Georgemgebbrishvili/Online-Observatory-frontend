# Phase 4, slice 3 — the room, controlled

2026-10-01. The customer's controls during the live observation: nudge, re-centre,
capture and stop, in the SIDERA arrangement
([ADR-027](../../decisions/ADR-027-the-live-room-takes-the-sidera-console-layout.md)).
Contract at `14ac895`; handlers traced in `darkview-platform` at `f2f51db`
(`apps/api/src/features/missions/command.ts`, `apps/realtime/src/mission/protocol.ts`,
`agent/darkview_agent/supervisor.py`, `agent/darkview_agent/command/validator.py`).

## How a command travels

1. The room sends intent only: `submitMissionCommand` `POST /missions/{id}/command`
   with `MissionCommandRequest` `{ type, nudge?, capture?, reason? }`. The cloud mints the
   envelope (id, session, user, issued, expires) and checks ownership, state and, for
   NUDGE and RECENTER, the safety envelope.
2. 202 `MissionCommandAccepted` means **relayed**, not done. The control stays locked.
3. The agent validates again and answers once: `MISSION_COMMAND_RESULT` on the channel,
   matched by `commandId`, `ACCEPTED` or `REJECTED` with a `CommandRejectionReason`. The
   agent sends no COMPLETED (`supervisor.py`), so the control unlocks here.
4. A finished capture arrives as `MISSION_CAPTURE_READY`, which slice 2 already handles.

Commands carry no idempotency key: each request is a new command. The room never
retries one by itself, and a control is locked from the press until its answer, or until
the envelope's `expiresAt` passes with none (then: "No answer from the telescope").

## Contract trace

| On screen            | Source                                                                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Nudge ↑ ↓ ← →        | `type: NUDGE`, `nudge: { kind: NUDGE, axis: ALTITUDE \| AZIMUTH, direction: POSITIVE \| NEGATIVE, stepArcminutes }`                      |
| Step                 | 2′ per press, a client constant: `stepArcminutes` is the client's to choose, bounded by the envelope                                     |
| Re-centre            | `type: RECENTER`: the cloud turns it into a GOTO to the booked target (`buildPayload`)                                                   |
| Capture              | `type: CAPTURE`, `capture: { kind: CAPTURE, imagingProfile: Target.imagingProfile }`, frames left to the profile                         |
| Stop                 | `type: ABORT`, `reason: null` (the cloud records `CUSTOMER_ABORT`); after an in-page confirmation                                        |
| When each is offered | Nudge, re-centre, capture: `OBSERVING`. Stop: every live state. Nothing without a session and an open channel                            |
| Accepted / refused   | `MissionCommandResult.status`, `rejectionReason`                                                                                         |
| Refused by the cloud | 409 `SAFETY_REFUSED` + `details.rejectionReason`, `MISSION_NOT_ACTIVE`, `SESSION_NOT_OWNER`; 403 `COMMAND_NOT_PERMITTED_FOR_CLIENT`; 422 |

## Found while tracing

**No nudge budget on screen.** `MissionTelemetryUpdate.nudgeUsedDegrees` is always null
(`protocol.ts`: `AgentStateDelta` does not carry it), and `nudgeMaxDegrees` is in
`SafetyEnvelopeConfig`, which only operators read. The room shows the refusal
(`SAFETY_NUDGE_LIMIT_EXCEEDED`) and offers re-centre; it does not invent a gauge. Not
requested: the refusal is enough for Phase 1.

**Which way is "up" on the picture is unverified.** Altitude + is up in the sky and
azimuth + is to the right for someone facing the target, but the camera's orientation on
the image, and field rotation on an alt-az mount, are unknown until the hardware exists.
The arrows are labelled by the sky (higher, lower, left, right), not by the picture.

**A capture needs the target's profile.** `CapturePayload.imagingProfile` is required and
the cloud passes it through. When the target is no longer in the catalogue
(`Target` null), the room has no profile and offers no capture.

## States, en + ka

| State             | Where it comes from                            | en                                                                                   | ka                                                                              |
| ----------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Controls          | `OBSERVING`, live                              | Controls · Higher · Lower · Left · Right · Re-centre · Capture · Stop                | მართვა · მაღლა · დაბლა · მარცხნივ · მარჯვნივ · ცენტრირება · გადაღება · შეჩერება |
| Not yet           | a live state before `OBSERVING`                | The controls open once the target is centred.                                        | მართვა გაიხსნება, როცა ობიექტი ცენტრში მოექცევა.                                |
| Capturing         | `CAPTURING`                                    | Capturing. The controls return when it is done.                                      | მიმდინარეობს გადაღება. მართვა დასრულების შემდეგ დაბრუნდება.                     |
| Sending           | the request, then the wait for the agent       | Sending · Waiting for the telescope                                                  | იგზავნება · ველოდებით ტელესკოპს                                                 |
| Done              | `ACCEPTED`                                     | Done                                                                                 | შესრულდა                                                                        |
| Refused, with why | `REJECTED` or a 409 + `rejectionReason`        | e.g. That would go past how far you can move from the target. Re-centre to continue. | მაგ. ეს ობიექტიდან დასაშვებზე მეტად გადაწევდა. გააგრძელეთ ცენტრირებით.          |
| No answer         | the envelope's `expiresAt` passed              | No answer from the telescope. Try again.                                             | ტელესკოპმა არ უპასუხა. სცადეთ თავიდან.                                          |
| Confirm stop      | the Stop press                                 | Stop the observation? Your remaining time is not returned. · Stop · Keep observing   | შევაჩეროთ დაკვირვება? დარჩენილი დრო არ ბრუნდება. · შეჩერება · გაგრძელება        |
| Error             | no answer, 500, 429, a body the schema refuses | Something went wrong. Try again.                                                     | რაღაც შეფერხდა. სცადეთ თავიდან.                                                 |
| Simulated         | `mode: SIMULATED`                              | slice 2's badge                                                                      | slice 2's badge                                                                 |

"Your remaining time is not returned" is the platform's rule: a customer who ends the
session themselves is entitled to nothing (`apps/realtime/src/refunds/entitlements.ts`,
maintainer rules of 2026-09-15); only weather and an observatory fault are causes.

The fake platform answers `submitMissionCommand` and sends `MISSION_COMMAND_RESULT` on the
channel, with one scenario per outcome, so the e2e suite drives each state.
