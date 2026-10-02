import { describe, expect, it } from "vitest";

import { plateFor } from "@/features/missions/room";
import { privateSessionDurations } from "@/features/observatory/homepage-data";

import { fanPlates } from "./homepage-data";

describe("homepage data", () => {
  it("contains only the approved private session lengths", () => {
    expect(privateSessionDurations).toEqual([30, 60, 120]);
  });

  it("fans three planets, Saturn in front, each with a plate (ADR-039)", () => {
    expect(fanPlates).toEqual(["jupiter", "saturn", "mars"]);
    for (const plate of fanPlates) expect(plateFor(plate)).not.toBeNull();
  });
});
