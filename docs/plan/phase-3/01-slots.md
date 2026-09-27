# Phase 3, slice 1 — `/app/book`, the slots for a night

2026-09-26. Replaces the "planned" placeholder at `/app/book`. Traced against
`darkview-platform` at `acca64803fe81c9a6c9ef9fe3b562b7537edcbd5`.

## Contract trace

| On screen                    | Source                                                                                          |
| ---------------------------- | ----------------------------------------------------------------------------------------------- |
| Observatory name, simulated  | `listBookableObservatories` → the first-party node (ADR-003); `getObservatoryStatus.mode`        |
| The night                    | `?date=` — the date the night's evening falls on, as `listSlots` defines it; default is the night in progress while it has a slot to come, else tonight |
| Seven nights to choose from  | that default night and the six after it, in `BookableObservatory.timezone`; a date outside that is ignored |
| Slot time                    | `Slot.startAt` – `endAt`, in the observatory's zone, zone named                                 |
| Length                       | `Slot.durationMinutes` (30 on the platform today; see the phase README)                        |
| Price                        | `priceMinor` in `currency`, formatted with the currency's own minor-unit digits                 |
| Available, or why not        | `available`, `unavailableReason`                                                                |

Slots are generated only inside astronomical darkness and the observatory's offered
hours (`features/booking/slots.ts`); a night with none is an empty list, not an error.

## States, en + ka

| State                         | Where it comes from                              | en                                                                  | ka                                                                           |
| ----------------------------- | ------------------------------------------------ | ------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Loading                       | `[locale]/loading.tsx`                           | shared                                                              | shared                                                                       |
| Slots                         | `items.length > 0`                               | —                                                                   | —                                                                            |
| No slots this night           | `items: []`                                      | No observing time this night. Try another.                          | ამ ღამეს დაკვირვების დრო არ არის. სცადეთ სხვა ღამე.                          |
| Every slot unavailable        | no `available: true`                             | each slot says why                                                  | each slot says why                                                           |
| Unavailable reasons           | `SlotUnavailableReason`                          | Booked · Not dark enough · Weather hold · Observatory offline · Maintenance · Already started | დაჯავშნილია · საკმარისად ბნელა არ არის · ამინდის გამო შეჩერება · ობსერვატორია ოფლაინია · ტექნიკური სამუშაოები · უკვე დაიწყო |
| Simulated observatory         | `mode: SIMULATED` → `ModeNotice`                 | `/status`'s copy                                                    | `/status`'s copy                                                             |
| Reserving not open yet        | slice 2 is blocked                               | Reserving a slot opens once the platform can confirm which targets each slot can deliver. | სლოტის დაჯავშნა გაიხსნება, როცა პლატფორმა შეძლებს დაადასტუროს, რომელი ობიექტები ჩანს თითოეულ სლოტში. |
| Platform unreachable          | any failure, or a body failing the schema        | Observing times could not be loaded. Try again shortly.             | დაკვირვების დროის ჩატვირთვა ვერ მოხერხდა. სცადეთ ცოტა ხანში.                |
| No observatory                | no first-party node                              | No observatory is listed.                                           | ობსერვატორია არ არის მითითებული.                                             |
| Signed out                    | `requireUser`                                    | → sign-in                                                           | → შესვლა                                                                     |

On a daytime `dev:stack` today's slots are in the future only after 18:00 local, so the
populated states run against `e2e/fake-platform.mjs`, whose slots are fixed.
