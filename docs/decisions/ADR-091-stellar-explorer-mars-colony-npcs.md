# ADR-091 — Stellar Explorer: a living colony on Mars

- **Date:** 2026-11-19
- **Status:** APPROVED (2026-11-19)
- **Decided by:** project maintainer (Nika), in session: "make the game better in visuals, and
  environments, add some star wars NPC's but intelligent NPCs, make it look more like GTA, with
  traffic, movements, options and etc." Offered phases, he chose smart NPCs first; asked how far
  the GTA side should go, he chose the full style: combat, wanted stars, hunters.

## Decision

1. **Original characters only.** No Star Wars (or GTA) names, likenesses, art or sounds. The
   cast is Stellar's own, in the spirit of the genre: PIP-7 (a rolling utility droid), KERN
   (the base's quartermaster droid), Vex Marrow (a smuggler), Rook and Sable (guild bounty
   hunters), Oda and Tamsin (colonists), and six scav drones out in the dunes.
2. **They think.** Each one senses (distance, line of sight round the base's buildings, who shot
   whom), remembers (grudges that fade, where the pilot was last seen) and picks what to do by
   scoring every option against its personality (`npc-brain.ts`, pure and unit-tested): patrol,
   wander, keep a post, follow, talk, investigate, fight at the range its weapon suits while
   side-stepping, take cover behind a habitat when hurt, run when beaten, go down and get up.
3. **Talk and trade.** Walking up to a character and pressing the interact key opens a
   conversation with numbered answers that depend on what the pilot has done: sign PIP-7 on as
   a companion (it follows, scans for gems, fights scavs), take KERN's contract (disable three
   scav drones for 120 credits), buy repairs, a gem tip or an overshield, hear rumours, or pick a
   fight.
4. **The GTA side.** The pilot has a blaster on Mars (R, a click with the mouse captured, the
   gamepad's left, or the touch crosshair key). Shooting anyone who had not drawn first raises
   **wanted stars** (up to five) and puts every hunter on the trail; the stars cool one at a time
   once no hunter has seen the pilot for 40 seconds, or KERN clears them for a fee. The suit has
   integrity that seals itself slowly; at zero the colony medics drag the pilot back to the pad
   and take half their credits. Nobody dies: people and droids are knocked down and get up;
   scav drones are replaced out in the dunes.
5. **Where.** Mars Base only, for now. Standing, credits, the warrant and the contract are kept
   on the device (`stellar_npc_v1`), like the rest of the game's progress.
6. **Brand.** The rest of the site keeps CLAUDE.md's rules. The game is a game: its HUD (stars,
   crosshair, hit flash) belongs to the game page only.

## Consequences

- The colony is local to each player: in multiplayer every explorer sees their own colony and
  their own warrant, not a shared one.
- Every character is built from primitives: no new downloads, a few draw calls each.
- Next phases offered and not yet built: city life in Tbilisi (get into any car, minimap and
  GPS, radio, smarter traffic, pedestrians who react), a visuals pass, and new places (a station
  hub, a Mars colony town, an alien market).
