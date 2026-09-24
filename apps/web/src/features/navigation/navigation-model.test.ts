import { describe, expect, it } from "vitest";

import {
  appDestinations,
  isAppDestinationSegment,
  isPlannedSegment,
  isPreviewSegment,
  plannedDestinations,
  primaryDestinations,
} from "./navigation-model";

describe("app navigation model", () => {
  it("keeps the requested five destinations in order", () => {
    // The bottom bar carries these and only these. Phase 1 added planned
    // destinations to appDestinations; the primary five are unchanged.
    expect(primaryDestinations.map((destination) => destination.key)).toEqual([
      "home",
      "missions",
      "live",
      "collection",
      "profile",
    ]);
  });

  it("carries the planned surfaces the inventory found missing", () => {
    expect(plannedDestinations.map((destination) => destination.key)).toEqual([
      "book",
      "subscription",
      "loyalty",
      "passes",
    ]);
  });

  it("gives every planned destination a phase, so the list cannot drift", () => {
    for (const destination of plannedDestinations) {
      expect(destination.phase, destination.key).toBeGreaterThan(1);
    }
  });

  it("accepts only routed destination segments", () => {
    expect(isAppDestinationSegment("missions")).toBe(true);
    expect(isAppDestinationSegment("settings")).toBe(false);
    expect(isAppDestinationSegment("")).toBe(false);
  });

  it("separates segments with their own route from those the preview renders", () => {
    // These four have real pages; the preview must not claim them.
    for (const segment of ["", "missions", "live", "collection"]) {
      expect(isPreviewSegment(segment), segment).toBe(false);
    }
    for (const segment of ["profile", "book", "subscription", "loyalty", "passes"]) {
      expect(isPreviewSegment(segment), segment).toBe(true);
    }
  });

  it("marks the planned segments, and only those, as not yet built", () => {
    const planned = appDestinations
      .map((destination) => destination.segment)
      .filter((segment) => isPlannedSegment(segment));
    expect(planned).toEqual(["book", "subscription", "loyalty", "passes"]);
    // profile is a preview, but it is not advertised as unbuilt.
    expect(isPlannedSegment("profile")).toBe(false);
  });
});
