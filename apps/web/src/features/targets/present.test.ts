import type { Target, TargetVisibility, TonightTarget } from "@darkview/contracts";
import { describe, expect, it } from "vitest";

import {
  formatCoordinates,
  formatWindow,
  primaryReason,
  sortTonight,
  targetVisual,
} from "./present";

const target = {
  id: "30000000-0000-4000-8000-000000000006",
  slug: "saturn",
  type: "PLANET",
  nameEn: "Saturn",
  nameKa: "სატურნი",
  positionSource: "EPHEMERIS",
  solarSystemBody: "SATURN",
  angularSizeArcmin: 0.3,
  magnitude: 0.6,
  opticalConfig: "F20_BARLOW",
  imagingProfile: "PLANETARY",
  minAltitudeDegrees: 25,
  expectedMissionMinutes: 15,
  enabled: true,
} satisfies Target;

function visibility(overrides: Partial<TargetVisibility> = {}): TargetVisibility {
  return {
    observable: true,
    evaluatedAt: "2026-09-25T18:00:00Z",
    horizontal: { altitudeDegrees: 30, azimuthDegrees: 180 },
    sunAltitudeDegrees: -24,
    moonSeparationDegrees: 70,
    risesAt: "2026-09-25T14:30:00Z",
    setsAt: "2026-09-26T01:40:00Z",
    blockReasons: [],
    ...overrides,
  };
}

function item(slug: string, overrides: Partial<TargetVisibility>): TonightTarget {
  return { target: { ...target, slug }, visibility: visibility(overrides) };
}

const templates = {
  between: "{rises} – {sets}",
  from: "From {rises}",
  until: "Until {sets}",
  none: "—",
};

describe("sortTonight", () => {
  it("puts observable targets first, then the highest in the sky", () => {
    const sorted = sortTonight([
      item("low-blocked", {
        observable: false,
        horizontal: { altitudeDegrees: 5, azimuthDegrees: 0 },
      }),
      item("low", { horizontal: { altitudeDegrees: 20, azimuthDegrees: 0 } }),
      item("high-blocked", {
        observable: false,
        horizontal: { altitudeDegrees: 80, azimuthDegrees: 0 },
      }),
      item("high", { horizontal: { altitudeDegrees: 60, azimuthDegrees: 0 } }),
    ]);
    expect(sorted.map((entry) => entry.target.slug)).toEqual([
      "high",
      "low",
      "high-blocked",
      "low-blocked",
    ]);
  });
});

describe("primaryReason", () => {
  it("is the platform's first reason, which is the one that decides", () => {
    expect(
      primaryReason(
        visibility({
          observable: false,
          blockReasons: ["SAFETY_ENVELOPE_UNMEASURED", "SUN_TOO_HIGH"],
        }),
      ),
    ).toBe("SAFETY_ENVELOPE_UNMEASURED");
    expect(primaryReason(visibility())).toBeNull();
  });
});

describe("targetVisual", () => {
  it("never draws a ringed planet for a planet without rings", () => {
    expect(targetVisual(target)).toBe("saturn");
    expect(targetVisual({ ...target, solarSystemBody: "JUPITER" })).toBe("jupiter");
    expect(targetVisual({ ...target, solarSystemBody: "MARS" })).toBe("planet");
    expect(targetVisual({ ...target, solarSystemBody: "VENUS" })).toBe("planet");
  });
});

describe("formatWindow", () => {
  it("reads rise and set in the observatory's time zone", () => {
    expect(formatWindow(visibility(), "Asia/Tbilisi", "en", templates)).toBe(
      "18:30 – 05:40",
    );
  });

  it("says only what the platform gave", () => {
    expect(
      formatWindow(visibility({ risesAt: null }), "Asia/Tbilisi", "en", templates),
    ).toBe("Until 05:40");
    expect(
      formatWindow(visibility({ setsAt: null }), "Asia/Tbilisi", "en", templates),
    ).toBe("From 18:30");
    expect(
      formatWindow(
        visibility({ risesAt: null, setsAt: null }),
        "Asia/Tbilisi",
        "en",
        templates,
      ),
    ).toBe("—");
  });
});

describe("formatCoordinates", () => {
  it("writes J2000 coordinates as an astronomer does, with a true minus", () => {
    expect(
      formatCoordinates({ raHours: 16.695, decDegrees: 36.46, epoch: "J2000" }),
    ).toBe("16h 41m 42s / +36° 27′ 36″");
    expect(formatCoordinates({ raHours: 5.588, decDegrees: -5.39, epoch: "J2000" })).toBe(
      "05h 35m 17s / −05° 23′ 24″",
    );
  });
});
