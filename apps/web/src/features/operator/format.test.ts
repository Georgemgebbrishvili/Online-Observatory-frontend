import { describe, expect, it } from "vitest";

import { fill, formatAge, formatEquatorial, formatHorizontal } from "./format";

describe("operator formatting", () => {
  it("writes J2000 coordinates in the brand's notation", () => {
    // M42: RA 5h 35m 17.3s, Dec −5° 23′ 28″.
    expect(
      formatEquatorial({ raHours: 5.588139, decDegrees: -5.391111, epoch: "J2000" }),
    ).toBe("RA 05h 35m 17.3s · DEC −05° 23′ 28″");
    expect(formatEquatorial({ raHours: 16.695, decDegrees: 36.46, epoch: "J2000" })).toBe(
      "RA 16h 41m 42.0s · DEC +36° 27′ 36″",
    );
  });

  it("writes altitude and azimuth to a tenth of a degree", () => {
    expect(formatHorizontal({ altitudeDegrees: 42.06, azimuthDegrees: 181.94 })).toBe(
      "ALT 42.1° · AZ 181.9°",
    );
  });

  it("states the age of a reading in the largest whole unit", () => {
    expect(formatAge(900)).toBe("1 s");
    expect(formatAge(59_000)).toBe("59 s");
    expect(formatAge(125_000)).toBe("2 min");
    expect(formatAge(7_200_000)).toBe("2 h");
    expect(formatAge(-500)).toBe("0 s");
  });

  it("fills named placeholders and leaves unknown ones visible", () => {
    expect(fill("Park refused: {reason}", { reason: "SAFETY_SUN_EXCLUSION" })).toBe(
      "Park refused: SAFETY_SUN_EXCLUSION",
    );
    expect(fill("{missing}", {})).toBe("{missing}");
  });
});
