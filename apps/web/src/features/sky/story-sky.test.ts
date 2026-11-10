import { describe, expect, it } from "vitest";

import { precess, storySky } from "./story-sky";

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
