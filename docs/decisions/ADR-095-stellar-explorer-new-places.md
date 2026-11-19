# ADR-095 — Stellar Explorer: three new places

- **Date:** 2026-11-19
- **Status:** APPROVED (2026-11-19)
- **Decided by:** project maintainer (Nika), "OK go with them", on the remaining phases (new
  environments; Tbilisi city life follows).

## Decision

1. **Dusthaven, Mars.** A town west of Mars Base on levelled ground (terrain `flats`): a main
   street of lit modules with neon names, The Red Dune cantina, market stalls, street lamps,
   a gateway arch, and a shuttle pad where the Phobos shuttle lands and leaves on its own
   timetable. Its people: GRIT-4 (blaster upgrade +50 %, suit plating −30 % damage), Nadia (a drink
   that patches the suit), Pell (food), Okonkwo (credits for every gem picked up on the world),
   and townsfolk on the street.
2. **The Lantern Market, Proxima b.** West of the village, on levelled ground: stalls under
   mushroom caps hung with breathing lanterns round a lantern tree, and six traders in a new
   alien body (tall, digitigrade, light rolling down bands) selling moss, star charts, fruit,
   mending and skin-light, and singing songs.
3. **Stellar Station.** A new walkable world (`station`) in low Earth orbit, boarded from the
   dock at the ISS: with the ship docked, the landing card reads "Board Stellar Station" and L goes
   aboard (no descent: the ship is on the pad). The concourse is a railed deck under the stars
   with the station's spin ring turning overhead, Dock Control, the Exchange, the Observation
   Lounge and the crew bunks round it, and Earth's ocean and cloud far below (the deck "sea").
   Its people: DOCK-7, Halden Voss, Imani, Captain Reyes and two travellers. Leaving, the ship
   comes away beside the ISS.

## Consequences

- `WorldId` and `GemWorld` gain `station`; the station has nine gems and the station's own
  strings. Everything is built from primitives and canvas textures: no new downloads.
- Standing, credits, upgrades and the warrant are one save across all of them (`stellar_npc_v1`).
