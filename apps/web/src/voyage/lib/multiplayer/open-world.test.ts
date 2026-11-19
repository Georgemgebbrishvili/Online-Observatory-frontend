import { describe, expect, it } from "vitest";

import { anyoneHere, pickWorld, WORLD_MAX, worldCounts, type RosterEntry } from "./useExploreRoom";

const meta = (world: unknown) => [{ world, phx_ref: String(Math.random()) }];

describe("the open world's copies", () => {
  it("counts each explorer once, under the copy they are in", () => {
    const counts = worldCounts({ a: meta(1), b: meta(1), c: meta(2), d: meta(0), e: meta("x"), f: [...meta(1), ...meta(1)] });
    expect([...counts]).toEqual([[1, 3], [2, 1]]);
  });

  it("sends a newcomer to the first copy with a free place", () => {
    expect(pickWorld(new Map())).toBe(1);
    expect(pickWorld(new Map([[1, WORLD_MAX - 1]]))).toBe(1);
    expect(pickWorld(new Map([[1, WORLD_MAX]]))).toBe(2);
    expect(pickWorld(new Map([[1, WORLD_MAX], [2, 3]]))).toBe(2);
    // Copy 1 freed up: newcomers fill it again before copy 2.
    expect(pickWorld(new Map([[1, WORLD_MAX - 5], [2, WORLD_MAX]]))).toBe(1);
  });

  it("skips a copy found full on the way in", () => {
    expect(pickWorld(new Map([[1, 2]]), new Set([1]))).toBe(2);
  });
});

describe("whether a pose is worth sending", () => {
  const entry = (id: string, scene: RosterEntry["scene"], world = "", self = false): RosterEntry => ({ id, name: id, scene, world, joinedAt: 0, self });

  it("needs someone else in the same place", () => {
    const roster = [entry("me", "flight", "", true), entry("b", "surface", "moon")];
    expect(anyoneHere(roster, "flight", "")).toBe(false);
    expect(anyoneHere(roster, "surface", "moon")).toBe(true);
    expect(anyoneHere(roster, "surface", "mars")).toBe(false);
    expect(anyoneHere([...roster, entry("c", "flight")], "flight", "")).toBe(true);
  });

  it("never sends from the system view", () => {
    expect(anyoneHere([entry("b", "orbit")], "orbit", "")).toBe(false);
  });
});
