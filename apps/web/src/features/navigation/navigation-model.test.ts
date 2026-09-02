import { describe, expect, it } from "vitest";

import { appDestinations, isAppDestinationSegment } from "./navigation-model";

describe("app navigation model", () => {
  it("keeps the requested five destinations in order", () => {
    expect(appDestinations.map((destination) => destination.key)).toEqual([
      "home",
      "missions",
      "live",
      "collection",
      "profile",
    ]);
  });

  it("accepts only routed destination segments", () => {
    expect(isAppDestinationSegment("missions")).toBe(true);
    expect(isAppDestinationSegment("settings")).toBe(false);
    expect(isAppDestinationSegment("")).toBe(false);
  });
});
