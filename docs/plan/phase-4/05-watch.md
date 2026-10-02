# Phase 4, slice 5 — the watch page and the observer's seat

2026-10-02. Roadmap slices A1 and A2, built as one, because a watch page that cannot sell
the seat it requires answers 402 to everyone but the owner.

The page lets a signed-in customer:

- watch a session its owner has opened (DV-104)
- buy a seat (DV-106)
- take it and leave it

It replaces the `/v1` fixture behind `/{locale}/app/missions/{id}/watch` and closes
issue #1. Contract at `14ac895`. Handlers traced in `darkview-platform` at `f2f51db`:
`getMissionWatchView` (ADR-034), `joinMissionAsObserver`, `leaveMissionAsObserver`,
`purchaseObserverPack`, and realtime `channel.ts:214` and `stream/http.ts:95` (an
attached seat may open the channel and the stream).

## What the old page got wrong

- **Wrong API.** It called seven `/v1/*` routes that the platform does not serve,
  through hand-written cross-boundary types (`features/shared-observations/`).
- **Captures for observers.** It offered "Save to collection" on shared captures.
  ADR-007 rule 4 says observers receive no captures.
- **Presence.** It showed a "watching now" presence count, which ADR-034 dropped. The
  audience is `observerCount`, the seats attached.
- **HUD vocabulary.** "Target locked" and "LIVE SHARED MISSION" are banned by the brand.

## Contract trace

| On screen                       | Source                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Target, observatory, instrument | `MissionWatchView.target`, `.observatory` (`BookableObservatory`)                                      |
| Whose session                   | `MissionWatchView.ownerDisplayName` (null shows "a Stellar observer")                                  |
| State, steps                    | `MissionWatchView.mission.state`, then `MissionStateUpdate` on the channel                             |
| Seats                           | `MissionWatchView.observerCount` of `mission.observerCapacity`                                         |
| My seat                         | `MissionWatchView.myObserverSeat` (`MissionObserver`, null if none attached)                           |
| Buy a seat                      | `purchaseObserverPack` → `ObserverPackWithPaymentIntent`, then follow `paymentIntent.redirectUrl`      |
| Price                           | `ObserverPack.priceMinor` and `currency`, known only once a pack is opened                             |
| Take the seat                   | `joinMissionAsObserver` → 201 `MissionObserver`; 402 until the payment settles                         |
| Leave                           | `leaveMissionAsObserver` → 204 (frees the connection, never the seat)                                  |
| Live view                       | WSS `/ws/mission/{id}` as an observer: `MissionStreamInfo.streamUrl`, telemetry, state; no commands    |
| Refunds                         | `ObserverPack.refundedMinor`: not readable after a close until platform #169                           |

## Found while building

**An Observer Pack cannot be paid on the platform today.** `purchaseObserverPack` opens
its `SANDBOX` payment with no `redirectUrl`, and the sandbox checkout answers only
booking payments and returns only to a booking. Raised as
[`observer-pack-checkout.md`](../../platform-requests/observer-pack-checkout.md). Until it
is answered the page says seats cannot be paid for yet; the fake platform behaves as
proposed there, so the flow is tested end to end.

**The checkout says nothing on the way back.** Its return address is built by the
platform, so before leaving for it the page notes the mission in `sessionStorage`. On
return it asks `joinMissionAsObserver` up to five times, two seconds apart, while the
answer is 402, then offers "Check again".

**A close does not hang up on an observer.** The realtime service keeps an observer's
socket after the owner closes; the stream refuses the next request
(`mayWatchMission`), and a fresh subscribe is refused. So the page treats a failed
picture and every closed channel the same way: it reads the watch view again, and a 404
or a missing seat is "closed by owner".

**Buying twice is not paying twice.** A seat outlives a connection, and
`purchaseObserverPack` returns the same pack, already `PAID`, to someone who left. The
page then joins without a checkout. After Leave it offers "Watch again"
(en "You left. Your seat stays yours until the session ends." · ka "თქვენ გახვედით.
ადგილი სესიის დასრულებამდე თქვენია." · "ხელახლა ყურება").

## States, en + ka

| State             | Where it comes from                                    | en                                                                       | ka                                                                                      |
| ----------------- | ------------------------------------------------------ | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Loading           | the read in flight                                     | Opening the session                                                      | სესია იხსნება                                                                           |
| Not open          | 404 from `getMissionWatchView`                         | This session is not open to watch.                                       | ეს სესია საყურებლად ღია არ არის.                                                       |
| Seat for sale     | `myObserverSeat` null, seats free                      | {owner} is observing {target}. {count} of {capacity} seats taken. · Buy a seat | {owner} აკვირდება: {target}. დაკავებულია {count} ადგილი {capacity}-დან. · ადგილის ყიდვა |
| Full              | 409 `OBSERVER_CAPACITY_REACHED`                        | Every seat is taken.                                                     | ყველა ადგილი დაკავებულია.                                                               |
| Paying            | back from the checkout, join answers 402               | Waiting for your payment to settle                                       | ველოდებით გადახდის დადასტურებას                                                         |
| Watching          | `myObserverSeat` set, channel open                     | You are watching. You cannot move the telescope or keep captures. · Stop watching | თქვენ უყურებთ. ტელესკოპის მართვა და კადრების შენახვა შეუძლებელია. · ყურების შეწყვეტა     |
| Agent offline     | the channel's observatory status                       | The observatory is offline.                                              | ობსერვატორია გათიშულია.                                                                 |
| Simulated         | `MissionStreamInfo.mode` = SIMULATED                   | Simulated observatory                                                    | სიმულირებული ობსერვატორია                                                               |
| Closed by owner   | the channel closes, then the read answers 404          | The owner closed this session to watchers.                               | მფლობელმა სესია მაყურებლებისთვის დახურა.                                                |
| Session over      | a final state                                          | This session has ended.                                                  | ეს სესია დასრულდა.                                                                      |
| Owner             | the caller owns the mission                            | This is your session. · Go to the live room                              | ეს თქვენი სესიაა. · ცოცხალ ოთახში გადასვლა                                              |
| Error             | no answer, 500, 429, an unreadable body                | Something went wrong. Try again.                                         | რაღაც შეფერხდა. სცადეთ თავიდან.                                                         |

## Then

- The sharing panel's watch link turns on.
- `features/shared-observations/`, `components/missions/shared-mission.*`,
  `i18n/resources/shared-observation.ts` and `styles/shared-mission.css` are deleted.
  `grep -r "/v1/" apps/web/src` returns nothing.
- The fake platform answers the five operations and opens an observer channel.
