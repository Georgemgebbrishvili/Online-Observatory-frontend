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
      aperture: "203 mm",
      focalLength: "2032 mm",
      configurationStatus: "EXPECTED_MVP",
    });
  });
});
