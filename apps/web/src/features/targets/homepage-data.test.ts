import { describe, expect, it } from "vitest";

import { privateSessionDurations } from "@/features/observatory/homepage-data";

import { collectionFrames, homepageTargets } from "./homepage-data";

describe("homepage demonstration data", () => {
  it("contains the six requested unique targets", () => {
    expect(homepageTargets.map((target) => target.id)).toEqual([
      "moon",
      "saturn",
      "m31",
      "m13",
      "m27",
      "m57",
    ]);
    expect(new Set(homepageTargets.map((target) => target.id)).size).toBe(6);
  });

  it("contains only the approved private session lengths", () => {
    expect(privateSessionDurations).toEqual([30, 60, 120]);
  });

  it("keeps collection examples explicitly separate from real captures", () => {
    expect(collectionFrames).toHaveLength(3);
    expect(collectionFrames.every((frame) => frame.visual.length > 0)).toBe(true);
  });
});
