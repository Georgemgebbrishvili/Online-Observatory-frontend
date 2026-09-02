import { describe, expect, it } from "vitest";

import { captures } from "@/features/collection/captures";
import { targetRank } from "@/features/missions/targets";

import { getHomeDashboard } from "./dashboard";

describe("authenticated home dashboard", () => {
  it("recommends the strongest observable target", () => {
    const dashboard = getHomeDashboard();

    expect(dashboard.tonight.slug).toBe("saturn");
    expect(
      dashboard.continueExploring.every(
        (target) => targetRank(target) <= targetRank(dashboard.tonight),
      ),
    ).toBe(true);
  });

  it("only suggests targets that are not already captured", () => {
    const capturedTargetIds = new Set(captures.map((capture) => capture.targetId));

    expect(
      getHomeDashboard().continueExploring.every(
        (target) => !capturedTargetIds.has(target.id),
      ),
    ).toBe(true);
  });

  it("derives collection progress from capture records", () => {
    const collection = getHomeDashboard().collection;

    expect(collection.observationsCompleted).toBe(captures.length);
    expect(collection.uniqueObjects).toBe(4);
    expect(collection.recentCaptures).toEqual(captures.slice(0, 3));
  });

  it("only exposes a public live observation", () => {
    expect(getHomeDashboard().liveObservation?.publicSharingEnabled).toBe(true);
  });
});
