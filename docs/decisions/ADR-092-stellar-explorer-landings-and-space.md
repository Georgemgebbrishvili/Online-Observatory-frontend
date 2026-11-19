# ADR-092 — Stellar Explorer: landings, launches and a livelier sky

- **Date:** 2026-11-19
- **Status:** APPROVED (2026-11-19)
- **Decided by:** project maintainer (Nika), in session: "work more on the space and landings, the
  animation of landing, the speed of landing, and the takeoff ... polish now existing landing sites
  that we have on other planets ... ultra high quality movements, add some different NPC actions,
  and maybe ... distant supernova explosions, maybe some asteroids or comets." Tbilisi city life is
  left for its own session.

## What was measured

Recorded from the entry (as after L in flight) on Mars, Mercury and Jupiter: landing 16–19 s,
fine; takeoff 40–50 s, slow (about 6 s on the pad, then the whole climb to orbit at real time).
The camera cut hard where the powered descent took over, snapped onto the pilot on stepping out,
and at launch sat under the hull.

## Decision

1. **Takeoff in about 20 seconds.** The engines spool faster, the lander hands over to the climb
   at 4.2 s instead of 6, and the climb to orbit runs 3.4 times faster than its own clock, eased in
   over 2.5 s so the speed never jumps (`ASCENT_PACE`, `ASCENT_RAMP_S`). Landing pace unchanged.
2. **No camera cuts that are not meant.** Every hand-off between cameras (the flight's chase to the
   descent's, the descent's to the pilot's) blends position, rotation and field of view over
   1.6–2.2 s; stepping out arcs over the ship rather than through it. Boarding cuts on purpose to a
   wide launch shot from off the pad. On every world and the Moon.
3. **Landing sites.** Mars and the outposts get pad lights (a ring that breathes while waiting,
   chases inward on approach, strobes at launch, red mast strobes). Each outpost has two residents
   (`outpostCast`): a caretaker droid who patches suits and knows the world, and a technician on
   their rounds, with lines true to the place. Lightning flickers in Venus's overcast and in the
   cloud seas under the giants' decks, lifting the sky light, with thunder after the distance.
4. **NPC actions.** Colonists kneel and work at their stops, stop to chat when they meet, and wave
   at the pilot; hunters sweep the horizon at patrol points; scav drones drop to salvage; PIP-7
   celebrates a kill; everyone near stops to watch the pilot's ship land and leave, and a colonist
   greets the landing.
5. **Space.** Supernovae now and then on the far sky (a rise in two seconds, diffraction spikes,
   a half-minute fade from blue-white to red and a swelling remnant shell), smaller novae between;
   three comets whose tails stream; and an asteroid field that travels with the ship — thick in
   the main belt, a scatter elsewhere, none inside a world — tumbling boulders that dent the shields
   when flown into and break up when shot, sometimes with salvage.

## Consequences

- All of it is built from primitives and canvas textures: no new downloads.
- The asteroid field adds up to 240 instanced rocks (130 on lite) round the ship.
- Outpost residents share the colony's standing and warrant (one save on the device).
