import { describe, expect, it } from "vitest";

import { nightDate, tonightSky } from "./tonight-sky";

const tz = "Asia/Tbilisi";

describe("tonightSky", () => {
  it("belongs to last night before local noon", () => {
    expect(nightDate(new Date("2026-10-31T05:00:00Z"), tz)).toBe("2026-10-30");
    expect(nightDate(new Date("2026-10-31T15:00:00Z"), tz)).toBe("2026-10-31");
  });

  it("lists bodies up at night, brightest first", () => {
    const sky = tonightSky(new Date("2026-10-31T15:00:00Z"), tz)!;
    expect(sky.objects.length).toBeGreaterThan(2);
    const mags = sky.objects.map((o) => o.magnitude);
    expect([...mags].sort((a, b) => a - b)).toEqual(mags);
    for (const o of sky.objects) {
      expect(o.altitude).toBeGreaterThanOrEqual(10);
      expect(o.best).toBeGreaterThanOrEqual(sky.sunset);
      expect(o.best).toBeLessThanOrEqual(sky.sunrise);
    }
  });
});
