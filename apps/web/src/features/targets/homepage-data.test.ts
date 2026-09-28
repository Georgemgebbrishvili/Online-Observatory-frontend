import { describe, expect, it } from "vitest";

import { privateSessionDurations } from "@/features/observatory/homepage-data";

import { planets } from "./homepage-data";

describe("homepage data", () => {
  it("contains only the approved private session lengths", () => {
    expect(privateSessionDurations).toEqual([30, 60, 120]);
  });

  it("features Earth first, then the two side planets (ADR-029)", () => {
    expect(planets).toEqual(["earth", "venus", "mars"]);
  });
});
