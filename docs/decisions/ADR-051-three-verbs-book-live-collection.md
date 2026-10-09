# ADR-051 — Three verbs: Book, Live, Collection

- **Date:** 2026-10-09
- **Status:** APPROVED
- **Decided by:** project maintainer (Nika), in session, choosing it over "five items,
  renamed" and "keep the current structure"
- **Amends:** `ADR-037` (what `/app/live` opens) is unchanged; `ADR-036`'s pages stand.
  This record is about where they sit.

## Context

The app's sidebar is Home, Missions, Book an observation, Live, Collection, Profile, and
three of those overlap. A mission is a booked night that became a session; "Missions"
lists targets to observe, "Book" picks a night, "Live" opens the session. A customer
asked where their next night is finds it under Bookings, their target under Missions and
the room under Live.

## Decision

The sidebar is **Home · Book · Live · Collection · Profile**. On a phone the tab bar is
the same five.

1. **Book** (`/app/book`) is where a night and a target are chosen, and where the
   customer's upcoming nights live: the bookings list (`/app/bookings`) moves under it
   as "Your nights", with reschedule and cancel where they are today. The target
   catalogue that `/app/missions` shows becomes the second step of booking and a panel
   on the booked night, not a destination of its own.
2. **Live** (`/app/live`) opens the live or imminent session's room (ADR-037). With no
   session it shows the next booked night with a countdown and the observatory's state,
   and the way to Book when there is none.
3. **Collection** (`/app/collection`) holds captures and past nights: each past mission
   appears as a night with its captures and history. `/app/missions/[targetSlug]`
   remains the mission page, reached from a booked night and from the collection.
4. **Routes keep working.** `/app/missions` and `/app/bookings` redirect to where their
   content went, so a bookmark or an email link still lands.

## Consequences

- `app-navigation.tsx`'s destinations and the dictionaries change; the shell contract
  and the visual baselines of every app page are regenerated.
- Two pages gain content (Book's nights, Collection's past nights) and one destination
  goes. The reads behind them exist already (`readBookings`, `readMyMissions`,
  `readCollection`).
