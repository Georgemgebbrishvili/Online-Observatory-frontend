import { describe, expect, it } from "vitest";

import { attitude, decide, newMind, remember, wantedFor, type Persona, type Senses, type Standing } from "./npc-brain";

const standing = (over: Partial<Standing> = {}): Standing => ({ rep: { crew: 0.2, trader: 0, hunter: 0 }, wanted: 0, recruited: false, ...over });
const senses = (over: Partial<Senses> = {}): Senses => ({
  playerDist: 20, playerVisible: true, hitBy: null, health: 1, allyAlarm: false, threatDist: Infinity, talking: false, ...over,
});
const hunter: Persona = { faction: "hunter", role: "patrol", nerve: 0.8, temper: 0.7, sight: 70 };
const scav: Persona = { faction: "scav", role: "raider", nerve: 0.5, temper: 0.9, sight: 38 };
const colonist: Persona = { faction: "crew", role: "colonist", nerve: 0.3, temper: 0, sight: 35 };
const droid: Persona = { faction: "crew", role: "companion", nerve: 0.8, temper: 0.6, sight: 40 };

describe("npc brain", () => {
  it("leaves a pilot with a clean record alone, and hunts one with a warrant", () => {
    expect(decide(hunter, newMind("patrol"), senses(), standing()).mode).toBe("patrol");
    expect(decide(hunter, newMind("patrol"), senses(), standing({ wanted: 2 }))).toEqual({ mode: "attack", target: "player" });
  });

  it("scav drones attack on sight", () => {
    expect(decide(scav, newMind("wander"), senses({ playerDist: 15 }), standing()).mode).toBe("attack");
    expect(decide(scav, newMind("wander"), senses({ playerVisible: false }), standing()).mode).toBe("wander");
  });

  it("an unarmed colonist who is shot runs", () => {
    expect(decide(colonist, newMind("wander"), senses({ hitBy: "player" }), standing()).mode).toBe("flee");
  });

  it("a hurt hunter under fire takes cover, and a beaten one runs", () => {
    const mind = newMind("attack");
    mind.grudge = 1;
    expect(decide(hunter, mind, senses({ hitBy: "player", health: 0.5 }), standing()).mode).toBe("cover");
    expect(decide(hunter, mind, senses({ hitBy: "player", health: 0.05 }), standing()).mode).toBe("flee");
  });

  it("the droid follows once signed on, and goes for a scav that comes close", () => {
    expect(decide(droid, newMind(), senses({ playerDist: 8 }), standing({ recruited: true })).mode).toBe("follow");
    expect(decide(droid, newMind(), senses({ threatDist: 15 }), standing({ recruited: true }))).toEqual({ mode: "attack", target: "threat" });
    // Not signed on: it has no reason to fight.
    expect(decide(droid, newMind(), senses({ threatDist: 15, playerDist: 30 }), standing()).mode).not.toBe("attack");
  });

  it("a signed-on droid stays loyal through a warrant", () => {
    expect(attitude(droid, standing({ recruited: true, wanted: 5 }), newMind())).toBe(1);
    // Unsigned, it is the colony's: a pilot who shot colonists and carries three stars is not welcome.
    expect(attitude(droid, standing({ wanted: 3, rep: { crew: -0.05, trader: 0, hunter: 0 } }), newMind())).toBeLessThan(-0.3);
  });

  it("talks while spoken to, and nothing gets up while down", () => {
    expect(decide(colonist, newMind(), senses({ talking: true, playerDist: 2 }), standing()).mode).toBe("talk");
    expect(decide(hunter, newMind(), senses({ health: 0 }), standing({ wanted: 5 })).mode).toBe("down");
  });

  it("goes looking where the pilot was last seen", () => {
    const mind = newMind("attack");
    mind.grudge = 1;
    mind.lastSeenAgo = 4;
    expect(decide(hunter, mind, senses({ playerVisible: false }), standing()).mode).toBe("investigate");
  });

  it("remembers a shot as a grudge that fades", () => {
    const mind = newMind();
    remember(mind, senses({ hitBy: "player" }), 0.1);
    expect(mind.grudge).toBeGreaterThan(0.4);
    expect(attitude(colonist, standing(), mind)).toBeLessThan(-0.3);
    for (let i = 0; i < 1000; i++) remember(mind, senses({ playerVisible: false }), 0.1);
    expect(mind.grudge).toBe(0);
  });

  it("charges stars for attacking the peaceful only", () => {
    expect(wantedFor("scav", false, true)).toBe(0);
    expect(wantedFor("hunter", true, false)).toBe(0);
    expect(wantedFor("crew", false, false)).toBe(1.5);
    expect(wantedFor("trader", false, true)).toBe(2.5);
  });
});
