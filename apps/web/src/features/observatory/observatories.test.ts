import { describe, expect, it } from "vitest";

import {
  getObservatory,
  missionOperations,
  observatories,
  observatorySafetyChecks,
} from "./observatories";

describe("observatory configuration", () => {
  it("ships one active site without inventing future partners", () => {
    expect(observatories).toHaveLength(1);
    expect(observatories[0].id).toBe("tbilisi-01");
  });

  it("supports the expected configurable MVP equipment", () => {
    const observatory = getObservatory("tbilisi-01");

    expect(observatory?.telescope).toMatchObject({
      manufacturer: "Celestron",
      model: "NexStar 6SE",
      configurationStatus: "EXPECTED_MVP",
    });
    expect(observatory?.camera.configurationStatus).toBe("EXPECTED_MVP");
  });

  it("models the complete protected mission path", () => {
    expect(missionOperations.map((step) => step.id)).toEqual([
      "request",
      "safety-validation",
      "telescope-movement",
      "position-verification",
      "imaging",
      "capture",
    ]);
    expect(observatorySafetyChecks).toHaveLength(5);
  });
});
