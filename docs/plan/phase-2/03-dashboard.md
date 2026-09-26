# Phase 2, slice 3 — the `/app` dashboard

2026-09-26. `/app` (`components/home/authenticated-home.tsx`), from
`features/home/dashboard.ts` to the platform. Traced against `darkview-platform` at
`acca64803fe81c9a6c9ef9fe3b562b7537edcbd5`. States and trace only; nothing is built yet.

## Contract trace, section by section

| Section (fixture)                          | Source                                                                                                                                              |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Greeting, "Good evening, Observer"         | `getCurrentUser` → `User.displayName` (nullable: the greeting then has no name). The `/app` layout already reads `/me`.                             |
| Tonight's recommendation                   | `readTonight` (slice 1): the first observable item after `sortTonight`. Window from `risesAt`/`setsAt`, altitude from `visibility.horizontal`.      |
| Recommendation picture                     | The drawn illustration for the target's type, labelled as one, as slice 1 does. Not the Saturn capture SVG.                                         |
| Observatory panel: name, city              | `BookableObservatory.nameEn/Ka`, `city`                                                                                                             |
| Observatory panel: telescope               | `BookableObservatory.telescope` (`manufacturer`, `model`, `apertureMm`, `focalLengthMm`)                                                            |
| Observatory panel: online, conditions      | `getObservatoryStatus` → `link` (`ObservatoryStatus`), `weather.status`, `weather.holdActive`, `mode`                                               |
| Upcoming missions                          | `listMissions` → `state: SCHEDULED` and `scheduledStartAt` in the future, soonest first. Name from `targetId` via `listTargets`; badge from `mode`. |
| Upcoming mission link                      | `/app/missions/{target slug}` — the target page. The session page is Phase 4.                                                                       |
| Also up tonight (was "Continue exploring") | The remaining observable items of `readTonight`, after the recommendation, at most three                                                            |
| Collection: recent captures                | `listCaptures?limit=3` through slice 2's reader, so thumbnails obey the same storage-origin rule                                                    |

`listMissions` is ordered by `requestedAt` desc, `id` desc (`features/missions/mine.ts:25`),
not by start time. Upcoming missions are therefore filtered and sorted here, over every
page, bounded as slice 2 bounds the catalogue.

## Not carried over, because the platform has no such data

- **"Excellent visibility" / "Saturn is excellent tonight".** No quality rating exists;
  the recommendation is the first observable target, and says only that.
- **Coordinates, "41.72° N · 44.79° E".** `PublicObservatoryStatus` "deliberately
  excludes coordinates precise enough to be actionable". The fixture prints them anyway.
  They go; the panel shows the city.
- **"Live now" — a public observation, its owner and viewer count.** There is no
  contract list of observable missions; the fixture reads `features/live/live-data.ts`,
  and the only other path is the `shared-observations` `/v1/*` debt, which the plan says
  not to build on. The section goes. `missionInProgress` and `currentTargetName` could
  say "observing now" in the observatory panel, but with no way to watch.
- **Observation and unique-object counts.** `PageMeta` has no total. Counting means
  reading every page of `/captures`, which grows without bound. The counts go; the
  Collection link stays.
- **"Continue exploring" as "targets you have not captured".** Needs every capture's
  `targetId`, the same unbounded read. It becomes "Also up tonight".

## States, en + ka

Formal register, as the page already uses. DV-080 reviews the Georgian.

| State                               | Where it comes from                                      | en                                                         | ka                                                                  |
| ----------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------- |
| Loading                             | `[locale]/loading.tsx`                                   | the shared loading state                                   | the shared loading state                                            |
| Success                             | every read answered                                      | —                                                          | —                                                                   |
| No name                             | `displayName: null`                                      | Good evening.                                              | საღამო მშვიდობისა.                                                  |
| Nothing observable tonight          | no `observable: true`; `TonightNotices` gives the reason | slice 1's copy                                             | slice 1's copy                                                      |
| Tonight unreachable, no observatory | `readTonight` kinds                                      | slice 1's copy                                             | slice 1's copy                                                      |
| Simulated observatory               | `mode: SIMULATED` → `ModeNotice`                         | slice 1's copy                                             | slice 1's copy                                                      |
| Agent offline / degraded            | `link: OFFLINE \| DEGRADED`                              | `ObservatoryStatus`'s labels                               | `ObservatoryStatus`'s labels                                        |
| Weather hold                        | `weather.holdActive`                                     | the `/status` page's "Observing is held"                   | the `/status` page's                                                |
| Weather unknown / cloudy / unsafe   | `weather.status`                                         | the `/status` page's labels                                | the `/status` page's labels                                         |
| Observatory status unreadable       | `getObservatoryStatus` fails; the rest of the page stays | Observatory status is unavailable right now.               | ობსერვატორიის სტატუსი ახლა მიუწვდომელია.                            |
| No upcoming missions                | nothing `SCHEDULED` in the future                        | No upcoming observations. Book one from tonight's targets. | დაგეგმილი დაკვირვება არ არის. დაჯავშნეთ ამაღამ ხილული ობიექტებიდან. |
| Missions unreadable                 | `listMissions` fails                                     | Your upcoming observations could not be loaded.            | დაგეგმილი დაკვირვებების ჩატვირთვა ვერ მოხერხდა.                     |
| Upcoming mission simulated          | `Mission.mode: SIMULATED`                                | Simulated                                                  | სიმულაცია                                                           |
| Nothing else up tonight             | one or no observable target                              | the section is left out                                    | the section is left out                                             |
| Collection empty                    | `listCaptures` answers `items: []`                       | slice 2's empty copy, with the link                        | slice 2's empty copy                                                |
| Collection unreadable               | `listCaptures` fails                                     | slice 2's unreachable copy                                 | slice 2's unreachable copy                                          |
| Signed out / session expired        | `requireUser`, or a 401 from `/missions` or `/captures`  | → sign-in                                                  | → შესვლა                                                            |

Each section fails on its own: one unreadable read never blanks the page.

On a freshly seeded `dev:stack` the observer has no missions and no captures (the seed
writes none, and none can run while the envelope is unmeasured), so upcoming and
Collection are empty there. The populated states run against `e2e/fake-platform.mjs`,
whose observer has one scheduled mission (`21000000-…-0002`, Saturn, 2026-09-24) —
already in the past against the visual gate's fixed clock, which needs a future one.

## Open — needs the maintainer before building

**The fake needs a future scheduled mission.** Adding one changes the operator missions
table (`/admin/missions`, paged two at a time) and the DV-078 evidence it photographs.
The alternative is to move the existing scheduled mission's date forward, which changes
the same table less. The proposal: move the date, and leave the evidence as recorded.

## Deliberate leftovers

- `features/missions/targets.ts` stays for the session page (Phase 4).
- `features/live/live-data.ts` stays for `/app/live` (Phase 4).
- `features/home/dashboard.ts`, `features/collection/captures.ts` and
  `public/captures/*.svg` go with this slice: the dashboard is their last reader.
