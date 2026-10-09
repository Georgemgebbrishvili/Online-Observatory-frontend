# Phase 5 — The console room and the three verbs

Two records from 2026-10-09: [ADR-050](../../decisions/ADR-050-the-live-room-takes-the-stellar-console.md)
(the room takes the Stellar console, visuals included) and
[ADR-051](../../decisions/ADR-051-three-verbs-book-live-collection.md) (Book · Live ·
Collection). Built in slices, each with baselines in both languages and a commit on
`main`.

| #  | Slice                                                                                                                     | Done when                                                                      |
| -- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| R1 | **Room tokens and ground.** `--room-*` tokens; the atmosphere layer; panel, pill, HUD, stat, flow-step, pad on `/design-system` | The specimens render; nothing outside the room changes                         |
| R2 | **Desk layout.** The three-column grid; Tonight, Observatory and Session on the left; the view stage with HUD, status pill and tool bar; the flow bar with the primary action; pointing, controls, sharing on the right | Room e2e green; en/ka baselines at 1440                                        |
| R3 | **Phone layout.** Head, station strip, view, progress strip, stats, captures strip, fixed dock, hand-control sheet        | Room e2e green at 390; en/ka baselines at 390                                  |
| R4 | **Watch page** on the same stage and ground                                                                              | Watch e2e green; baselines                                                     |
| N1 | **Navigation.** Five destinations; `/app/missions` and `/app/bookings` redirect                                          | Shell contract and app baselines regenerated                                   |
| N2 | **Book carries your nights**; the target step inside booking                                                             | Booking e2e green                                                              |
| N3 | **Live without a session** shows the next night; **Collection carries past nights**                                      | Collection e2e green                                                           |

Source for R1–R4: the Stellar app's `src/components/stellar/observatory/` at `1052314b^`
(see ADR-050). Screenshots of it at 1440 and 390 are in the session's scratchpad, not in
this repository.
