# Phase 2, slice 1 — tonight's targets

2026-09-25. `/`'s Tonight section, `/app/missions` and `/app/missions/[slug]`, moved from
fixtures to the platform. Traced against `darkview-platform` at
`acca64803fe81c9a6c9ef9fe3b562b7537edcbd5`.

## Contract trace

All three operations are public (`security: []`). `listTonightTargets` needs the
observatory id, read from `GET /observatories` (the first-party one, ADR-003) as
`/status` does.

| On screen                         | Source                                                                                 |
| --------------------------------- | -------------------------------------------------------------------------------------- |
| Name                              | `Target.nameEn` / `nameKa`                                                             |
| Type · catalogue                  | `Target.type` · `catalogId` (nullable)                                                 |
| Description                       | `descriptionEn` / `descriptionKa` (nullable)                                           |
| Available, or why not             | `TargetVisibility.observable`, `blockReasons[0]`                                       |
| Altitude                          | `visibility.horizontal.altitudeDegrees`                                                |
| Window tonight                    | `risesAt` – `setsAt`, in `BookableObservatory.timezone`                                |
| Mission length                    | `expectedMissionMinutes`                                                               |
| Coordinates                       | `coordinates` (null for ephemeris targets, so not shown)                               |
| Magnitude, size, minimum altitude | `magnitude`, `angularSizeArcmin`, `minAltitudeDegrees`                                 |
| Observatory, simulated badge      | `BookableObservatory.nameEn/Ka`; `PublicObservatoryStatus.mode`                        |
| Picture                           | The drawn illustration for `type` (and `solarSystemBody` for planets), labelled as one |

`blockReasons[0]` is the reason that decides: the platform evaluates the envelope, then
disabled, offline, weather, then the sky, in that order (`lib/ephemeris/visibility.ts:101`).

## Not carried over, because the platform has no such data

Quality rating, difficulty, "what to expect", best months, rank, the Galaxy filter and
M31 (the catalogue excludes it). The filters are the contract's six `TargetType`s, and
only those tonight's list holds.

`previewImageUrl` is null for every seeded target and the CSP allows images from this
origin only, so it is not rendered yet. It needs a hosting decision first — Phase 2
slice 2 (captures) meets the same question.

## States, en + ka

| State                               | Where it comes from                                       |
| ----------------------------------- | --------------------------------------------------------- |
| Some targets observable             | `observable: true` on at least one                        |
| Nothing observable, with the reason | every `observable: false`; the first item's first reason  |
| Simulated observatory               | `mode: SIMULATED` → `ModeNotice`                          |
| Platform unreachable                | any failure or a response that fails the generated schema |
| No observatory                      | `/observatories` lists no first-party node                |
| Unknown or disabled target          | `GET /targets/{slug}` 404 → the page 404s                 |
| Visibility unreadable, target known | the detail page keeps the target and says so              |

On a freshly seeded `dev:stack` every target is blocked by `SAFETY_ENVELOPE_UNMEASURED`
(`docs/platform-requests/dev-safety-envelope.md`), so the observable state is exercised
against `e2e/fake-platform.mjs` only.

## Deliberate leftovers

- `features/missions/targets.ts` stays: the session page (Phase 4) and the `/app`
  dashboard (slice 3) still read it. It goes with its last reader.
- The homepage's live console, collection preview, network and private-session
  sections are still fixture; collection is slice 2, the live console Phase 4.
- The detail page's "Book an observation" goes to `/app/book`, which says booking is
  Phase 3.
