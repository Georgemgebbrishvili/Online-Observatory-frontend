# ADR-090 — Stellar Explorer is an open world

- **Date:** 2026-11-19
- **Status:** APPROVED (2026-11-19)
- **Decided by:** project maintainer (Nika), in session: "add multiplayer to our game, this
  should be open world and people can also create private rooms." Asked which realtime
  service and how the world holds its players, he chose a new Supabase project for Stellar
  and an open world that opens a second copy when one is full.
- **Supersedes:** `ADR-089` §3 in part (single-player, no rooms). The rest of ADR-089 stands:
  no accounts, no leaderboard, no Stars credit, progress on the device, nothing reaches
  Skychaser.

## Decision

1. **Multiplayer is on, for guests.** The title offers Multiplayer wherever the build has a
   realtime service. Nobody signs in: a player flies under a callsign kept on the device
   ("Pilot 7KQ2"), and may rename it.
2. **Open space is the default.** "Enter open space" puts the player in the one solar system
   everyone online shares, and the game starts as soon as they are in. A copy holds 40
   explorers; a newcomer goes to the first copy with a free place (Open space, Open space 2, …),
   so the copies fill in order and the later ones empty out.
3. **Private rooms stay.** "Create private room" opens a room of up to 8 under a five-letter
   code, shared by code or by the `?room=` link. Private rooms are never listed. Skychaser's
   list of public rooms and its quick play are gone: open space replaces them.
4. **The service is Supabase Realtime**, broadcast and presence only: no tables, no auth, no
   database. It is a separate Supabase project for Stellar, not Skychaser's. The build reads
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (a public key); without them
   Multiplayer is not offered. The game's page alone may open a socket to that host (CSP
   `connect-src`).
5. **Traffic is kept down.** A player sends their position only while someone else is in the
   same place (in flight, or on the same world), at most five times a second, and nothing from
   the system view. The radar points at the nearest twelve pilots.
6. **The room styles are restored.** Skychaser deleted the room panel's base styles with its
   archived Explore copy (its `71bac16e`), so the copy this site took had none; they are taken
   from Skychaser's `stellar-explore-app` branch into `solar-system.css`.

## Consequences

- Stellar now depends on one outside service for the game. If it is down, Multiplayer says it
  cannot reach the server and Free Fly and Story play as before.
- Supabase's free plan limits concurrent connections and messages a second. A busy open world
  can reach those limits; the measure is the project's usage page, and the answer is the paid
  plan or smaller copies (`WORLD_MAX`), not a new service.
- Anyone can type any name. Names are cleaned of control characters and markup and capped at
  24 characters; there is no moderation.
- A refresh of the engine from Skychaser must keep these changes: the open world lives in
  `useExploreRoom.ts`, `ExploreRoomPanel.tsx`, `ExploreRoomBadge.tsx` and the room styles.
