import type { TonightTarget } from "@darkview/contracts";
import { describe, expect, it } from "vitest";

import { addDays, nightWindow, voteCandidates, weekOf } from "@/features/vote/sky";

const saturn = {
  id: "30000000-0000-4000-8000-000000000011",
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
} as const;

const albireo = {
  ...saturn,
  id: "30000000-0000-4000-8000-000000000021",
  slug: "albireo",
  type: "DOUBLE_STAR",
  nameEn: "Albireo",
  nameKa: "ალბირეო",
  positionSource: "FIXED",
  coordinates: { raHours: 19.512, decDegrees: 27.96, epoch: "J2000" },
  solarSystemBody: null,
} as const;

const visible = (observable: boolean) => ({
  observable,
  evaluatedAt: "2026-09-25T18:00:00Z",
  horizontal: { altitudeDegrees: 40, azimuthDegrees: 180 },
  sunAltitudeDegrees: -30,
  moonSeparationDegrees: 90,
  risesAt: null,
  setsAt: null,
  blockReasons: [],
});

describe("the week's vote", () => {
  it("names the week by its Monday and counts days on the calendar", () => {
    expect(weekOf("2026-10-16")).toBe("2026-10-12");
    expect(weekOf("2026-10-12")).toBe("2026-10-12");
    expect(weekOf("2026-10-18")).toBe("2026-10-12");
    expect(addDays("2026-10-30", 3)).toBe("2026-11-02");
  });

  it("finds a dark window for a September night in Tbilisi", () => {
    const window = nightWindow(new Date("2026-09-25T16:00:00Z"));
    expect(Date.parse(window.dawn) - Date.parse(window.dusk)).toBeGreaterThan(8 * 3_600_000);
    expect(Date.parse(window.dawn) - Date.parse(window.dusk)).toBeLessThan(12 * 3_600_000);
  });

  it("draws every observable target through the night, highest first, and skips the rest", () => {
    const items = [
      { target: saturn, visibility: visible(true) },
      { target: albireo, visibility: visible(true) },
      { target: { ...saturn, id: "x", slug: "venus", nameEn: "Venus", solarSystemBody: "VENUS" }, visibility: visible(false) },
    ] as unknown as TonightTarget[];
    const window = nightWindow(new Date("2026-09-25T16:00:00Z"));
    const candidates = voteCandidates(items, window, "en", 20);

    expect(candidates.map((c) => c.name)).toEqual(["Albireo", "Saturn"]);
    for (const c of candidates) {
      expect(c.track).toHaveLength(21);
      expect(c.altitudeDeg).toBe(Math.max(...c.track.map((p) => p.alt)));
      expect(c.track.some((p) => p.at === c.at)).toBe(true);
      expect(c.votes).toBe(0);
    }
    expect(voteCandidates(items, window, "ka", 4)[0].name).toBe("ალბირეო");
  });
});
