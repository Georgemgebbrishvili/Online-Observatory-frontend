# ADR-097 — Stellar Explorer: lighter space, a jetpack over Tbilisi, a Tbilisi that looks like itself, smarter people, secret bases

- **Date:** 2026-11-19
- **Status:** APPROVED (2026-11-19)
- **Decided by:** project maintainer (Nika): "the game still lags, too much comets in the space, too
  much tail on engine. npc too dumb and i need jet engine in Tbilisi also. make tbilisi more look
  like tbilisi. also some planets should have secret bases."

## Decision

1. **Space.** One comet instead of three. The ship's engine trail is about a third as long
   (14 / 24 hull units instead of 42 / 70, half the life, dimmer), and the exhaust plume stretches
   to its modelled length, not 1.7× it.
2. **Frame rate.** On the lowest preset the frame governor may now take the pixel ratio down to
   0.6 (it stopped at 1): a soft picture at full speed instead of a sharp one at a few frames a
   second, on the weakest GPUs. The higher presets keep their floor of 1.
3. **A jetpack in Tbilisi.** The pilot keeps the pack (not the helmet) in the city. Walls stop
   them only below their roof line; any roof is a floor to someone coming down on it from above;
   the river can be flown over. The ceiling is 320 m over the city (it was measured from the sea
   datum, which put it at Tbilisi's ground).
4. **Tbilisi's look.** Old-town houses wear pitched tin roofs (rust red, oxidised green, faded red,
   grey) wherever the outline allows; carved wooden balconies with little tin roofs hang off the
   upper storeys, painted brown, sky blue, green or white; shop signs over the ground floors are
   in the Georgian script (ღვინო, ხაჭაპური, აფთიაქი…) and are lit after dark. Balconies and signs
   are pooled round the camera: four draw calls for the whole old town.
5. **People.** On Mars and the other colonies: colonists go on errands to each other's stalls and
   doors and talk there, and the pilot overhears; anyone the pilot stands on top of says so and
   steps round; someone tailed for a while asks why; the jetpack overhead gets looked at and
   remarked on; someone the pilot has talked to greets them as known; attackers close in from
   their own sides instead of queueing. In Tbilisi: passers-by stop to talk to each other, stop and
   point at a pilot flying over the street, and greet a pilot on foot in Georgian (with the
   English).
6. **Secret bases.** Mars (Ares Black Site), Mercury (Hermes Relay) and Venus (Cytherean Vault)
   each hide a hall dug into a rocky hill off the pad, on levelled ground. The suit picks up a faint
   signal on the way; holding the key at the portal opens the blast door; inside, under the rock,
   the lights are on: a holo table, racks, crates, something parked, and a terminal whose logs the
   pilot can download. Found bases are kept on the device (`stellar_secret_bases_v1`).

## Consequences

- New modules: `world-earth-oldtown`, `world-secret-base`. `world-earth-city` gains tin hip roofs,
  roof-aware walls and `oldTownWalls`; `world-earth` a roof-aware floor and `setCrewY`;
  `makeCosmonaut`, `buildSuit` and `buildSuitGear` take the pack separately from the helmet.
- Frame rates could not be measured cleanly on the development machine this session (other
  work held its load average between 20 and 220); the space and governor changes are reasoned
  from what was measured (the flight scene is 142 visible objects, 185k triangles, and GPU-bound).
