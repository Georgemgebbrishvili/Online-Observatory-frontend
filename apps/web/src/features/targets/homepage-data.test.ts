import { describe, expect, it } from "vitest";

import { plateFor } from "@/features/missions/room";
import { privateSessionDurations } from "@/features/observatory/homepage-data";

import { skyPlates } from "./homepage-data";

describe("homepage data", () => {
  it("contains only the approved private session lengths", () => {
    expect(privateSessionDurations).toEqual([30, 60, 120]);
  });

  it("hides only our own drawn plates in the sky, Saturn first (ADR-052 §7)", () => {
    expect(skyPlates.map((plate) => plate.slug)).toEqual([
      "saturn",
      "jupiter",
      "mars",
      "venus",
    ]);
    for (const plate of skyPlates) expect(plateFor(plate.slug)).not.toBeNull();
  });
});
