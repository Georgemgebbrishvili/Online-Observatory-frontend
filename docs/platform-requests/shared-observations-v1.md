# Platform request: the shared-observation calls (issue #1)

Raised 2026-09-24 from `chore/contract-sync`. Against the contract pinned in
`packages/contracts/SOURCE.json` (`darkview-platform` `acca64803fe81c9a6c9ef9fe3b562b7537edcbd5`).

The watch page, `/[locale]/app/missions/[targetSlug]/watch`
(`apps/web/src/app/[locale]/app/missions/[targetSlug]/watch/page.tsx`, rendering
`components/missions/shared-mission.tsx`), calls six `/v1/*` endpoints that are not in the
contract. It sends `input: unknown` bodies and asserts responses with hand-written types
(`features/shared-observations/actions.ts`, `data.ts`). The page is unchanged by this
document.

## A conflict to settle first: shared captures against ADR-007

`joinMissionAsObserver` in the contract (ADR-007): _"An observer receives mission state and
the live view and nothing else. It grants no command capability and no captures: nothing
from this mission enters the observer's Collection."_

The watch page offers a joined viewer **Save to Collection** on the owner's captures
(`saveSharedCaptureAction`, `canSave`, `allowSharedCaptures`), and the platform's own
development seed carries `allowSharedCaptures` and a `liveCaptureAccess` id. The two cannot
both be right. That is a maintainer decision, recorded as an ADR amending ADR-007 or as the
removal of the save path. It must come before any contract shape for call 4's
`saveableCaptureIds`, call 6, and `captures[].canSave`.

## The six calls

| #   | Call                                | Sent                               | What the page uses from the response                        | Covered by the contract?                                                                                                                                                                                                                                                                 |
| --- | ----------------------------------- | ---------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `GET /v1/missions/{id}/shared-view` | —                                  | The whole `SharedMissionView` below. 403/404 → `notFound()` | **Partly.** `getMission` returns `Mission`, but only to its **owner** ("One mission owned by the signed-in user"). A viewer cannot read it. See the field table.                                                                                                                         |
| 2   | `POST /v1/missions/presence`        | `{ locale, missionId }`            | `viewerCount`, shown as the live audience                   | **No.** `Mission.observerCount` counts seated observers, not everyone watching. `listMissionObservers` is owner- and operator-only ("Observers see only the count"). There is no presence or heartbeat operation.                                                                        |
| 3   | `POST /v1/missions/presence/leave`  | `{ locale, missionId }`            | nothing (fire and forget on unmount)                        | **No.** Same as 2.                                                                                                                                                                                                                                                                       |
| 4   | `POST /v1/missions/shared/join`     | `{ locale, missionId }`            | `saveableCaptureIds` → which captures show **Save**         | **Partly.** `POST /missions/{missionId}/observers` (`joinMissionAsObserver`) takes a seat and returns `MissionObserver { id, missionId, userId, joinedAt, leftAt }`. It needs a settled Observer Pack payment, which the page never asks for, and it carries no capture ids, by ADR-007. |
| 5   | `POST /v1/missions/shared/leave`    | `{ locale, missionId }`            | `joined: false` (drives the toggle)                         | **Yes, apart from the verb.** `DELETE /missions/{missionId}/observers` (`leaveMissionAsObserver`), 204. The page would read the result from the status code instead of `joined`.                                                                                                         |
| 6   | `POST /v1/captures/save-shared`     | `{ locale, missionId, captureId }` | `saved`, `captureId` → marks the capture saved              | **No**, and ADR-007 forbids it as written (above).                                                                                                                                                                                                                                       |

`locale` in every body is the page's own concern (it is used for `revalidatePath`) and should
not cross the boundary.

### Call 1, field by field

| `SharedMissionView` field                        | Used for                    | Contract source                                                                                 |
| ------------------------------------------------ | --------------------------- | ----------------------------------------------------------------------------------------------- |
| `id`                                             | links, action input         | `Mission.id`                                                                                    |
| `state` (7 live states)                          | state badge                 | `Mission.state` (`MissionState`; the page re-declares a subset locally)                         |
| `target.commonName`, `georgianName`, `catalogId` | heading                     | `Target.nameEn`, `nameKa`, `catalogId`, via `Mission.targetId` → `listTargets` (no `getTarget`) |
| `observatory.nameEn`, `nameKa`                   | subheading                  | `BookableObservatory` via `Mission.observatoryId` → `listBookableObservatories`                 |
| `telescope`                                      | subheading                  | `BookableObservatory.telescope` (structured, not a string)                                      |
| `ownerName`                                      | "Controlled by …"           | **none**: no operation exposes another user's display name                                      |
| `initialElapsedSeconds`                          | session clock               | derivable from `Mission.startedAt`                                                              |
| `viewerCount`                                    | audience                    | **none** (see call 2); `Mission.observerCount` is seats only                                    |
| `participantStatus`                              | the viewer's own seat state | **none**; `MissionObserver` exists only as the join response                                    |
| `canJoin`                                        | join button                 | partly `Mission.observable` and `observerCapacity`; payment state **none**                      |
| `canControl`                                     | owner controls              | **none** (the owner is `Mission.userId === me.id`)                                              |
| `allowSharedCaptures`                            | save section                | **none**, see the ADR-007 conflict                                                              |
| `simulated`                                      | "simulated" badge           | `Mission.mode === "SIMULATED"`                                                                  |
| `captures[].id`, `thumbnailUrl`, `capturedAt`    | capture strip               | `Capture` fields, but `listCaptures` / `getCapture` return **the caller's own** Collection only |
| `captures[].processingPreset`                    | preset label                | **none**: `Capture` has no `processingPreset`                                                   |
| `captures[].canSave`                             | save button                 | **none**, see the ADR-007 conflict                                                              |

## Proposed shape

No shape is proposed for the save path until the ADR-007 conflict is settled. For the rest:

- **`GET /missions/{missionId}/watch`** (`getMissionWatchView`), readable by the owner, a
  seated observer and, where the owner made the session public, any signed-in user. It
  returns a closed `MissionWatchView` built from existing schemas: `mission: Mission`,
  `target: Target`, `observatory: BookableObservatory`, `ownerDisplayName`,
  `viewerCount`, `myObserverSeat: MissionObserver | null`. This replaces call 1 and the
  client-side joins.
- **Presence** as `POST /missions/{missionId}/presence` (a heartbeat returning
  `{ viewerCount }`) and `DELETE` to leave. Or drop presence and show
  `Mission.observerCount`: a product choice for the platform.
- **Join/leave**: use `joinMissionAsObserver` / `leaveMissionAsObserver` as they stand,
  with the Observer Pack payment step (`purchaseObserverPack`) in front of join.
- `processingPreset` on `Capture`, if the preset label is to stay.

## What it blocks

The watch page cannot move to generated types or Zod validation until these exist.
`docs/plan/02-build-phases.md` Phase 2 (the live room on `/missions/*`) builds on the same
seam, and says not to until it is contract-backed.
