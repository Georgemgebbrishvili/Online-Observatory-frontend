import { describe, expect, it } from "vitest";

import { ratioFloor } from "./quality";

describe("pixel ratio floor", () => {
  it("lets the lowest preset go under one pixel a screen pixel, and holds the others at one", () => {
    expect(ratioFloor("performance", 1.5)).toBe(0.6);
    expect(ratioFloor("balanced", 1.75)).toBe(1);
    expect(ratioFloor("high", 2)).toBe(1);
  });

  it("is never above the ceiling it is given", () => {
    expect(ratioFloor("balanced", 0.8)).toBe(0.8);
    expect(ratioFloor("performance", 0.5)).toBe(0.5);
  });
});
