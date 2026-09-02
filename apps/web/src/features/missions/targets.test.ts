import { describe, expect, it } from "vitest";

import {
  configuredSafetyAltitude,
  missionTargets,
  rankedMissionTargets,
  targetRank,
} from "./targets";

describe("mission target ranking", () => {
  it("keeps every target above the configured and target safety altitude", () => {
    expect(rankedMissionTargets.length).toBeGreaterThan(0);

    for (const target of rankedMissionTargets) {
      expect(target.currentVisibility.altitude).toBeGreaterThanOrEqual(
        Math.max(configuredSafetyAltitude, target.minimumAltitude),
      );
    }
  });

  it("sorts tonight's targets by the composite rank", () => {
    const ranks = rankedMissionTargets.map(targetRank);
    expect(ranks).toEqual([...ranks].sort((a, b) => b - a));
  });

  it("supports every required consumer target category", () => {
    expect(new Set(missionTargets.map((target) => target.type))).toEqual(
      new Set(["Planet", "Moon", "Galaxy", "Nebula", "Cluster", "Star"]),
    );
  });
});
