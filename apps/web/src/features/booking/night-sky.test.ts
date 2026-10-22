import { describe, expect, it } from "vitest";

import { nightSky } from "@/features/booking/night-sky";

const zone = "Asia/Tbilisi";
const clock = (at: number) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(at);

describe("nightSky", () => {
  it("orders a Tbilisi October night: sunset, dusk, midnight, dawn, sunrise", () => {
    const night = nightSky("2026-10-21", zone)!;
    expect(night.sunset).toBeLessThan(night.dusk);
    expect(night.dusk).toBeLessThan(night.midnight);
    expect(night.midnight).toBeLessThan(night.dawn);
    expect(night.dawn).toBeLessThan(night.sunrise);
    // Tbilisi keeps UTC+4: an October sunset falls a little after six in the evening.
    expect(clock(night.sunset)).toMatch(/^18:/);
    expect(clock(night.midnight)).toBe("00:00");
    expect(clock(night.sunrise)).toMatch(/^07:/);
  });

  it("finds the Moon up through the evening a few days after first quarter", () => {
    // First quarter 2026-10-18: a waxing gibbous Moon sets after midnight.
    const night = nightSky("2026-10-21", zone)!;
    expect(night.moonUp.length).toBeGreaterThan(0);
    expect(night.moonUp[0].from).toBe(night.sunset);
  });
});
