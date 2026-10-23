import { existsSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { skyPlates } from "./homepage-data";

describe("homepage data", () => {
  it("hides only our own drawn plates in the sky, Saturn first (ADR-052 §7)", () => {
    expect(skyPlates.map((plate) => plate.slug)).toEqual([
      "saturn",
      "jupiter",
      "mars",
      "moon-terminator",
      "m42-orion-nebula",
      "venus",
      "m57-ring-nebula",
      "m13-hercules-cluster",
      "albireo",
      "m27-dumbbell-nebula",
      "mizar-alcor",
    ]);
    for (const plate of skyPlates)
      expect(existsSync(`public/sky/${plate.slug}.webp`), plate.slug).toBe(true);
  });
});
