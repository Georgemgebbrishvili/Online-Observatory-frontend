import { describe, expect, it } from "vitest";

import { precess } from "./precess";
import { storySky } from "./story-sky";

describe("storySky", () => {
  const sky = storySky(new Date("2026-11-10T16:00:00Z"), "Asia/Tbilisi")!;

  it("spans the night's astronomical dark", () => {
    expect(sky.date).toBe("2026-11-10");
    // Dusk a little after 19:00 and dawn a little after 06:00, Tbilisi time (UTC+4).
    expect(new Date(sky.start).toISOString()).toMatch(/^2026-11-10T15:[12]/);
    expect(new Date(sky.end).toISOString()).toMatch(/^2026-11-11T02:0/);
  });

  it("picks at most six showpieces, each high enough and at its best inside the dark", () => {
    expect(sky.objects.length).toBeGreaterThan(0);
    expect(sky.objects.length).toBeLessThanOrEqual(6);
    for (const o of sky.objects) {
      expect(o.altitude).toBeGreaterThanOrEqual(25);
      expect(o.best).toBeGreaterThanOrEqual(sky.start);
      expect(o.best).toBeLessThanOrEqual(sky.end);
      expect(o.from).toBeLessThanOrEqual(o.best);
      expect(o.to).toBeGreaterThanOrEqual(o.best);
    }
  });

  it("leads with the Moon and planets, and has Saturn in the evening", () => {
    const saturn = sky.objects.find((o) => o.id === "saturn")!;
    expect(saturn.kind).toBe("planet");
    // Saturn crosses the meridian in the south around 22:20 that night.
    expect(saturn.direction).toBe(4);
    expect(new Date(saturn.best).toISOString()).toMatch(/^2026-11-10T18:[12]/);
    const firstDeep = sky.objects.findIndex((o) => o.kind !== "planet" && o.kind !== "moon");
    expect(sky.objects.slice(firstDeep).every((o) => o.kind !== "planet" && o.kind !== "moon")).toBe(true);
  });

  // Reference values from PyEphem 4 for the observatory's coordinates (41.7151 N, 44.8271 E),
  // worked out apart from this code: dusk and dawn at the Sun 18 degrees down, and each
  // object's greatest altitude inside that dark.
  it.each([
    ["2026-11-26T14:00:00Z", "2026-11-26T15:11", "2026-11-27T02:25", { moon: 74.9, jupiter: 61.6, mars: 61.2 }],
    ["2026-12-24T14:00:00Z", "2026-12-24T15:15", "2026-12-25T02:45", { moon: 73.6, jupiter: 61.7, mars: 59.4 }],
    ["2027-03-15T14:00:00Z", "2027-03-15T16:39", "2027-03-16T01:38", { moon: 65.9, jupiter: 64.7, m13: 82.0 }],
    ["2027-07-10T14:00:00Z", "2027-07-10T18:42", "2027-07-10T23:29", { saturn: 27.6, m13: 84.1, m31: 56.6 }],
  ] as const)("agrees with an independent ephemeris on the night of %s", (now, dusk, dawn, best) => {
    const night = storySky(new Date(now), "Asia/Tbilisi")!;
    expect(new Date(night.start).toISOString().slice(0, 16)).toBe(dusk);
    expect(new Date(night.end).toISOString().slice(0, 16)).toBe(dawn);
    for (const [id, altitude] of Object.entries(best)) {
      const object = night.objects.find((o) => o.id === id)!;
      expect(Math.abs(object.altitude - altitude), id).toBeLessThanOrEqual(1);
    }
  });

  it("is this evening's night once dawn has come, and last evening's before it", () => {
    // 08:30 in Tbilisi, after the dawn of the 26th: tonight is the night of the 26th.
    expect(storySky(new Date("2026-11-26T04:30:00Z"), "Asia/Tbilisi")!.date).toBe("2026-11-26");
    // 02:00 in Tbilisi, still dark: the night under way began on the 25th.
    expect(storySky(new Date("2026-11-25T22:00:00Z"), "Asia/Tbilisi")!.date).toBe("2026-11-25");
  });

  it("still finds a dark at midsummer in Tbilisi", () => {
    expect(storySky(new Date("2026-06-21T16:00:00Z"), "Asia/Tbilisi")).not.toBeNull();
  });
});

describe("precess", () => {
  it("moves a J2000 position by about 50 arcseconds a year along the equator", () => {
    const [ra, dec] = precess(0, 0, 26.86);
    expect(ra).toBeCloseTo((46.1244 * 26.86) / 3600, 3);
    expect(dec).toBeCloseTo((20.0431 * 26.86) / 3600, 3);
  });
});
