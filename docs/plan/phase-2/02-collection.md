# Phase 2, slice 2 — the Collection

2026-09-26. `/app/collection` and `/app/collection/[captureId]`, from
`features/collection/captures.ts` to the platform. Traced against `darkview-platform` at
`acca64803fe81c9a6c9ef9fe3b562b7537edcbd5`. States and trace only; nothing is built yet.

## Contract trace

All three operations need a session. Every read is scoped to the caller in the platform's
WHERE clause (`features/captures/collection.ts`), so another user's capture and a
non-existent one both answer 404 (`app/captures/[captureId]/route.ts`).

| On screen                      | Source                                                                                              |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| The list, newest first         | `listCaptures` → `CapturePage.items`, ordered by `capturedAt` desc, `id` desc                       |
| Older captures                 | `page.hasMore`, `page.nextCursor` → `?cursor=`; keyset, forward only                                |
| Target name, type, catalogue   | `Capture.targetId` → `Target.id` in `listTargets`, paged to the end (`limit` max 100)               |
| Captured at                    | `capturedAt` (the observatory's shutter time, not `createdAt`)                                      |
| Simulated badge                | `Capture.mode` — per capture, not the observatory's current mode                                    |
| Private / in the gallery       | `visibility` — read only, see below                                                                 |
| Card image                     | `thumbnailUrl` — signed, 5-minute expiry (`DOWNLOAD_URL_TTL_SECONDS`), null when none was written   |
| Detail image                   | `getCaptureDownload(kind=IMAGE).url`, minted at render                                              |
| Download image / FITS          | `getCaptureDownload(kind=IMAGE \| FITS)`, minted at click; FITS offered only when `fitsAvailable`   |
| Profile, optics                | `imagingProfile`, `opticalConfig` (focal length from the enum's description), `solvedFocalLengthMm` |
| Exposure, gain, stack          | `exposureMilliseconds`, `gain`, `framesStacked`, `integrationSeconds`                               |
| Frame size                     | `widthPx` × `heightPx` (both nullable)                                                              |
| Capture and mission ids        | `id`, `missionId`                                                                                   |
| Observatory (detail page only) | `getMission(missionId).observatoryId` → `BookableObservatory.nameEn/Ka` from `/observatories`       |
| About the target (detail page) | `Target.descriptionEn/Ka`, labelled as the target's description, not the capture's                  |

## Not carried over, because the platform has no such data

- **The capture description.** `Capture` has none; the target's description stands in,
  labelled as such.
- **Processing preset** (Natural / Bright / Detail). No field.
- **Telescope name.** No field; `opticalConfig` is the true statement of what was in the
  train.
- **Progress collections** (Solar System, Messier Starter, Deep Sky). The platform's
  `Collection` table exists, but no endpoint reads it and nothing writes it
  (`features/captures/collection.ts`, header comment). The section goes.
- **The visibility toggle and Share.** No endpoint sets `visibility` — raised as
  [`capture-visibility.md`](../../platform-requests/capture-visibility.md). A capture page
  is owner-only, so a copied link opens for nobody else; Share goes until a gallery exists.
- **"View mission".** It links to `/app/missions/[slug]/session`, which is keyed by target
  slug and stays a fixture until Phase 4. The mission id is shown as text.
- **The featured capture's observatory on the list.** One `getMission` per capture is not
  worth it for a label; the detail page carries it.

## States, en + ka

Georgian drafts use `docs/georgian-terminology.md`; DV-080 reviews them with a native reader.

| State                        | Where it comes from                                   | en                                                                           | ka                                                                         |
| ---------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Loading                      | `loading.tsx` while the reads resolve                 | Loading your Collection…                                                     | კოლექცია იტვირთება…                                                        |
| Success                      | `items.length > 0`                                    | —                                                                            | —                                                                          |
| Empty                        | first page, `items: []`                               | Your Collection is empty. Captures from your observations appear here.       | შენი კოლექცია ცარიელია. დაკვირვებისას გადაღებული კადრები აქ გამოჩნდება.    |
| Platform unreachable         | any failure, or a body failing the generated schema   | We couldn't load your Collection. Your captures are safe; try again shortly. | კოლექციის ჩატვირთვა ვერ მოხერხდა. შენი კადრები დაცულია — სცადე ცოტა ხანში. |
| Signed out / session expired | `requireUser`, or a 401 from `/captures`              | → sign-in                                                                    | → შესვლა                                                                   |
| Simulated                    | `Capture.mode: SIMULATED`, on every card and image    | Simulated capture                                                            | სიმულირებული კადრი                                                         |
| No thumbnail                 | `thumbnailUrl: null`                                  | No preview for this capture                                                  | ამ კადრს მინიატურა არ აქვს                                                 |
| Target not in the catalogue  | `targetId` absent from `listTargets` (disabled since) | A target no longer in the catalogue                                          | ობიექტი, რომელიც კატალოგში აღარ არის                                       |
| Targets unreadable           | `listTargets` fails; captures still shown             | the imaging profile stands as the title (e.g. "Planetary")                   | სათაურად — გადაღების პროფილი                                               |
| Capture not found            | `getCapture` 404 (not yours, or no such id)           | the page 404s                                                                | the page 404s                                                              |
| Image link unavailable       | `getCaptureDownload(IMAGE)` fails at render           | The full image could not be loaded. Try again.                               | სრული კადრის ჩატვირთვა ვერ მოხერხდა. სცადე ხელახლა.                        |
| Download failed              | the click-time `getCaptureDownload` fails             | The download link could not be created. Try again.                           | ჩამოტვირთვის ბმული ვერ შეიქმნა. სცადე ხელახლა.                             |
| No FITS                      | `fitsAvailable: false`                                | FITS was not recorded for this capture                                       | ამ კადრისთვის FITS არ ჩაწერილა                                             |
| Private                      | `visibility: PRIVATE`                                 | Private                                                                      | პირადი                                                                     |
| In the gallery               | `visibility: GALLERY`                                 | In the gallery                                                               | გალერეაში                                                                  |
| Agent offline, weather hold  | not applicable: captures are stored, not live         | no notice                                                                    | no notice                                                                  |

On a freshly seeded `dev:stack` the Collection is **always empty**: the seed writes no
captures, and no mission can reach `CAPTURING` while the envelope is unmeasured
([`dev-safety-envelope.md`](../../platform-requests/dev-safety-envelope.md)). Every
populated state is exercised against `e2e/fake-platform.mjs` only, and its `GET /targets`
must first be made to answer enabled targets only, as the platform does.

## Open — needs the maintainer before building

**Where images load from.** The CSP is `img-src 'self' data: blob:`. Signed URLs point at
the bucket's origin (`S3_ENDPOINT`: `http://localhost:9000` in dev), and ADR-012 leaves
the provider unchosen: private bucket, no public path, no CDN in Phase 1. Proxying the
bytes through this app would undo ADR-012's bandwidth argument. The proposal: one
non-secret web variable, `DARKVIEW_STORAGE_ORIGIN`, added to `img-src` when set; unset, the
Collection shows the "No preview" state rather than an image the browser will block.

**Downloads open in a tab.** The URL is cross-origin, so `<a download>` is ignored and the
browser shows the image instead of saving it. Saving would need
`response-content-disposition` in the presign — a platform change, not raised unless wanted.

## Deliberate leftovers

- `features/collection/captures.ts` and `public/captures/*.svg` stay: the `/app` dashboard
  (slice 3) reads them, and `authenticated-home.tsx` uses the Saturn SVG. They go with
  their last reader.
- The homepage's collection section is drawn illustrations under a disclaimer
  (`homepage-data.ts`), not captures. There is no public gallery endpoint, so it stays.
