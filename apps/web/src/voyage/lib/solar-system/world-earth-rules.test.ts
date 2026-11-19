import { describe, expect, it } from "vitest";

import { commit, evadeSeconds, fareFor, farePay, fineFor, newWanted, searchRadius, tickWanted, unitsFor } from "./world-earth-rules";

/** Far from the crime at (0, 0) unless told otherwise. */
const run = (w: ReturnType<typeof newWanted>, seconds: number, sense: { seen: boolean; cornered: boolean; x?: number; z?: number }) => {
  let out: string | null = null;
  for (let t = 0; t < seconds && !out; t += 0.05) out = tickWanted(w, 0.05, { x: 1000, z: 0, ...sense });
  return out;
};

describe("Tbilisi street rules", () => {
  it("only a seen crime raises the stars, except taking or ramming a patrol car", () => {
    const w = newWanted();
    expect(commit(w, "jack", false)).toBe(false);
    expect(w.stars).toBe(0);
    expect(commit(w, "jack", true)).toBe(true);
    expect(w.stars).toBe(1);
    expect(commit(w, "jackPolice", false)).toBe(true);
    expect(w.stars).toBe(3);
  });

  it("never goes past five stars", () => {
    const w = newWanted();
    for (let i = 0; i < 9; i++) commit(w, "jackPolice", true);
    expect(w.stars).toBe(5);
  });

  it("counts a run of rams on a patrol car as one until it has cooled", () => {
    const w = newWanted();
    expect(commit(w, "ramPolice", false)).toBe(true);
    expect(commit(w, "ramPolice", false)).toBe(false);
    run(w, 4.1, { seen: true, cornered: false });
    expect(commit(w, "ramPolice", false)).toBe(true);
    expect(w.stars).toBe(2);
  });

  it("loses the police after long enough out of sight, and not while seen", () => {
    const w = newWanted();
    commit(w, "jack", true);
    commit(w, "jack", true);
    expect(run(w, 30, { seen: true, cornered: false })).toBeNull();
    expect(w.stars).toBe(2);
    // Seen at (1000, 0); now well away from there.
    expect(run(w, evadeSeconds(2) - 1, { seen: false, cornered: false, x: 0 })).toBeNull();
    expect(w.evade).toBeGreaterThan(0.8);
    expect(run(w, 2, { seen: false, cornered: false, x: 0 })).toBe("cleared");
    expect(w.stars).toBe(0);
  });

  it("a sighting starts the getaway again", () => {
    const w = newWanted();
    commit(w, "jack", true);
    run(w, evadeSeconds(1) - 2, { seen: false, cornered: false });
    tickWanted(w, 0.05, { seen: true, cornered: false, x: 1000, z: 0 });
    expect(w.evade).toBe(0);
  });

  it("hiding near where they were last seen does not lose them", () => {
    const w = newWanted();
    commit(w, "jack", true, 100, 100);
    expect(run(w, 60, { seen: false, cornered: false, x: 100 + searchRadius(1) - 5, z: 100 })).toBeNull();
    expect(w.stars).toBe(1);
    expect(w.evade).toBe(0);
    // Seen somewhere else, the search moves there.
    tickWanted(w, 0.05, { seen: true, cornered: false, x: 600, z: 600 });
    expect(run(w, 60, { seen: false, cornered: false, x: 610, z: 600 })).toBeNull();
    expect(run(w, evadeSeconds(1) + 1, { seen: false, cornered: false, x: 600 + searchRadius(1) + 5, z: 600 })).toBe("cleared");
  });

  it("is busted after a couple of seconds cornered, and breaking away lets the arrest fall back", () => {
    const w = newWanted();
    commit(w, "jack", true);
    run(w, 1.5, { seen: true, cornered: true });
    expect(w.bust).toBeGreaterThan(0.5);
    run(w, 1.5, { seen: true, cornered: false });
    expect(w.bust).toBe(0);
    expect(run(w, 3, { seen: true, cornered: true })).toBe("busted");
    expect(w.stars).toBe(0);
  });

  it("sends more patrols the more stars there are", () => {
    expect([0, 1, 2, 3, 4, 5].map(unitsFor)).toEqual([0, 1, 2, 3, 4, 4]);
  });

  it("fines a fifth, at least 20 ₾, and never more than there is", () => {
    expect(fineFor(500)).toBe(100);
    expect(fineFor(60)).toBe(20);
    expect(fineFor(12)).toBe(12);
    expect(fineFor(0)).toBe(0);
  });

  it("pays the meter, tips a quick ride, and halves a late one", () => {
    const f = fareFor(1700);
    expect(f.base).toBe(25);
    expect(f.allowed).toBe(230);
    expect(farePay(f, f.allowed, 0)).toEqual({ pay: 25, tip: 15 });
    expect(farePay(f, f.allowed, 10).tip).toBe(0);
    expect(farePay(f, 0, 0)).toEqual({ pay: 13, tip: 0 });
  });
});
