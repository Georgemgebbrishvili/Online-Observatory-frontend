import type { TonightTarget } from "@darkview/contracts";
import { describe, expect, it } from "vitest";

import { quickStartTarget, simTargetId } from "@/features/observatory/console-target";

const target = (over: Record<string, unknown>) =>
  ({
    id: "t",
    slug: "saturn",
    type: "PLANET",
    catalogId: null,
    nameEn: "Saturn",
    nameKa: "სატურნი",
    positionSource: "EPHEMERIS",
    coordinates: null,
    solarSystemBody: "SATURN",
    angularSizeArcmin: 0.3,
    magnitude: 0.6,
    opticalConfig: "F20_BARLOW",
    imagingProfile: "PLANETARY",
    minAltitudeDegrees: 20,
    expectedMissionMinutes: 10,
    enabled: true,
    ...over,
  }) as unknown as TonightTarget["target"];

const item = (t: TonightTarget["target"], altitude: number, observable = true) =>
  ({
    target: t,
    visibility: { observable, horizontal: { altitudeDegrees: altitude, azimuthDegrees: 0 } },
  }) as unknown as TonightTarget;

describe("the console's catalogue mapping", () => {
  it("knows a body by its name, a fixed object by its designation, a star by its slug", () => {
    expect(simTargetId(target({}))).toBe("saturn");
    expect(simTargetId(target({ solarSystemBody: "MOON" }))).toBe("moon");
    expect(
      simTargetId(target({ positionSource: "FIXED", solarSystemBody: null, catalogId: "M13", slug: "m13-hercules-cluster" })),
    ).toBe("m13");
    expect(
      simTargetId(target({ positionSource: "FIXED", solarSystemBody: null, catalogId: "NGC 869", slug: "double-cluster" })),
    ).toBe("ngc869");
    expect(
      simTargetId(target({ positionSource: "FIXED", solarSystemBody: null, catalogId: "Alpha CMa", slug: "sirius" })),
    ).toBe("star-sirius");
    expect(
      simTargetId(target({ positionSource: "FIXED", solarSystemBody: null, catalogId: "Beta Cygni", slug: "albireo" })),
    ).toBe("star-albireo");
    expect(
      simTargetId(target({ positionSource: "FIXED", solarSystemBody: null, catalogId: "Collinder 399", slug: "coathanger" })),
    ).toBeNull();
  });

  it("points the quick start at the highest observable target the model can draw", () => {
    const coathanger = target({ id: "c", slug: "coathanger", nameEn: "Coathanger", solarSystemBody: null, positionSource: "FIXED", catalogId: "Collinder 399" });
    const saturn = target({ id: "s" });
    const venus = target({ id: "v", slug: "venus", nameEn: "Venus", solarSystemBody: "VENUS" });
    // The highest the model can draw: the Coathanger is unknown to it, Venus is not up.
    expect(quickStartTarget([item(coathanger, 70), item(saturn, 40), item(venus, 80, false)], "en")).toEqual({
      name: "Saturn",
      targetId: "saturn",
    });
    expect(quickStartTarget([item(saturn, 40)], "ka")).toEqual({ name: "სატურნი", targetId: "saturn" });
    expect(quickStartTarget([item(venus, 80, false)], "en")).toBeNull();
  });
});
