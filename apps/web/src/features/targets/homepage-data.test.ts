import { describe, expect, it } from "vitest";

import { privateSessionDurations } from "@/features/observatory/homepage-data";

import { collectionFrames } from "./homepage-data";

describe("homepage demonstration data", () => {
  it("contains only the approved private session lengths", () => {
    expect(privateSessionDurations).toEqual([30, 60, 120]);
  });

  it("keeps collection examples explicitly separate from real captures", () => {
    expect(collectionFrames).toHaveLength(3);
    expect(collectionFrames.every((frame) => frame.visual.length > 0)).toBe(true);
  });
});
