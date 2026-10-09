import { describe, expect, it } from "vitest";

import {
  appDestinations,
  isAppDestinationSegment,
  isPlannedSegment,
  isPreviewSegment,
  plannedDestinations,
  primaryDestinations,
  sidebarDestinations,
} from "./navigation-model";

describe("app navigation model", () => {
  it("keeps the requested five destinations in order", () => {
    // The bottom bar carries these and only these. Phase 1 added planned
    // destinations to appDestinations; the primary five are unchanged.
    expect(primaryDestinations.map((destination) => destination.key)).toEqual([
      "home",
      "book",
      "live",
      "collection",
      "profile",
    ]);
  });

  it("lists booking with the working destinations in the sidebar, not as planned", () => {
    expect(sidebarDestinations.map((destination) => destination.key)).toEqual([
      "home",
      "book",
      "live",
      "collection",
      "profile",
    ]);
  });

  it("carries the planned surfaces the inventory found missing", () => {
    expect(plannedDestinations.map((destination) => destination.key)).toEqual([
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
    expect(isAppDestinationSegment("book")).toBe(true);
    // ADR-051: the catalogue has a route of its own, not a place in the bar.
    expect(isAppDestinationSegment("missions")).toBe(false);
    expect(isAppDestinationSegment("settings")).toBe(false);
    expect(isAppDestinationSegment("")).toBe(false);
  });

  it("separates segments with their own route from those the preview renders", () => {
    // These have real pages; the preview must not claim them.
    for (const segment of ["", "live", "collection", "book", "profile"]) {
      expect(isPreviewSegment(segment), segment).toBe(false);
    }
    for (const segment of ["subscription", "loyalty", "passes"]) {
      expect(isPreviewSegment(segment), segment).toBe(true);
    }
  });

  it("marks the planned segments, and only those, as not yet built", () => {
    const planned = appDestinations
      .map((destination) => destination.segment)
      .filter((segment) => isPlannedSegment(segment));
    expect(planned).toEqual(["subscription", "loyalty", "passes"]);
    expect(isPlannedSegment("profile")).toBe(false);
  });
});
