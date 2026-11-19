# ADR-096 — Stellar Explorer: street life in Tbilisi

- **Date:** 2026-11-19
- **Status:** APPROVED (2026-11-19)
- **Decided by:** project maintainer (Nika), "OK go with last phase make it good", on the Tbilisi
  city-life phase planned in ADR-091 ("Full GTA style") and ADR-095.

## Decision

Tbilisi gets the street life of an open-world city game, built on the real streets already in the
bake (OpenStreetMap roads, the river, the landmarks):

1. **Any car can be taken.** Beside a car in the traffic (or one left parked), E takes it: the
   driver is pulled out and runs, and the pilot drives off in that car — hatchback, saloon, the
   yellow marshrutka, or a patrol car. The car the pilot leaves stands parked where it was. Cars
   share one set of bodies (`world-earth-carshape`): the traffic instances them, the pilot's car
   and the patrols build them part by part. Knocks wear a car down; below a third it smokes, at
   nothing the engine is dead.
2. **Crime and the police.** Taking a car where someone sees it, knocking someone down, or
   ramming a patrol car raises the wanted level (one to five stars); taking a patrol car is two
   stars whoever saw it. Patrol cars (one a star, up to four) come in out of sight, find their way
   along the streets (A* on the road graph), go straight for the pilot when they can see them, and
   ram from three stars. Out of their sight and out of the search circle round where they last saw
   the pilot, long enough, and the pilot gets away; cornered for a couple of seconds, the pilot is
   **busted**: fined a fifth of their cash (at least 20 ₾) and set down by the pad. Nobody is hurt
   by the police; there are no guns in Tbilisi.
3. **People.** Pedestrians step out of the way of the pilot and of cars (a fast car is seen late),
   are knocked down by a car that reaches them — thrown, on the ground a moment, up again and
   running — and run from crime they see.
4. **Fares.** Driving with a clean record, people at the kerb wave for a ride: stop beside them and
   take them to one of the city's places. They pay the meter, plus a tip for a quick, smooth ride;
   late, half, and no tip. Cash (₾) is kept on the device (`stellar_city_v1`).
5. **GPS, minimap and map.** A round minimap (streets, river, route, patrols, the pilot's car, the
   fare) turns with the view. Tab (or the map key) opens the city map, holding the world still:
   click anywhere, or pick a named place, for a GPS route along the streets.
6. **Car radio and sound.** Three stations whose music is composed and played in the browser
   (Web Audio, nothing recorded, nobody else's music): Mtatsminda Lo-Fi, Kartuli Voices, Orbit
   101.3. Q at the wheel changes station. R / click is the horn; patrols have sirens; held-up
   traffic honks; crashes sound.

## Consequences

- New modules: `world-earth-roads` (graph, nearest, ring, A*), `world-earth-rules` (stars,
  getaway, arrest, fines, fares — tested), `world-earth-carshape`, `world-earth-police`,
  `world-earth-radio`, `world-earth-street` (the orchestration), and `CityHud`.
  `world-earth-traffic` now drives the shared graph and takes parked cars; `world-earth-car`
  takes a body kind, health and smoke; `world-earth-people` adds knockdown, flight and hailing.
- The traffic is eight instanced draw calls (four bodies, their lamps); each patrol car on the
  street costs about twenty.
- Keys: R / click (horn) and Q (radio) only while driving, where they had no use; Tab opens the
  city map on Earth only.
- Copy is English (the Explorer's messages are English-only).
