import { describe, expect, it } from "vitest";

import { getObservatory, observatories } from "./observatories";

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
  });
});
