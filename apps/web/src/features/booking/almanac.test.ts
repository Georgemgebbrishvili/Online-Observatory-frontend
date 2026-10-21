import { describe, expect, it } from "vitest";

import { localHour, monthAlmanac, monthDates } from "./almanac";

const zone = "Asia/Tbilisi";

describe("monthAlmanac", () => {
  it("dates October 2026's phases, showers and passes on Tbilisi's clock", () => {
    const events = monthAlmanac(2026, 10, zone);
    const moon = events.filter((e) => e.kind === "moon");
    expect(moon.map((e) => [e.date, e.kind === "moon" && e.phase])).toEqual(
      expect.arrayContaining([
        ["2026-10-10", "new"],
        ["2026-10-26", "full"],
      ]),
    );
    expect(events).toContainEqual(
      expect.objectContaining({
        kind: "meteors",
        shower: "orionids",
        date: "2026-10-21",
      }),
    );
    for (const e of events) expect(e.date.startsWith("2026-10")).toBe(true);
    const dates = events.map((e) => e.date);
    expect([...dates].sort()).toEqual(dates);
  });

  it("finds the March 2026 total lunar eclipse and the equinox", () => {
    const events = monthAlmanac(2026, 3, zone);
    expect(events).toContainEqual(
      expect.objectContaining({
        kind: "lunarEclipse",
        eclipse: "total",
        date: "2026-03-03",
      }),
    );
    expect(events).toContainEqual(
      expect.objectContaining({
        kind: "season",
        season: "marchEquinox",
        date: "2026-03-20",
      }),
    );
  });

  it("finds the August 2026 solar eclipse and says whether Tbilisi sees it", () => {
    const eclipse = monthAlmanac(2026, 8, zone).find((e) => e.kind === "solarEclipse");
    expect(eclipse?.date).toBe("2026-08-12");
  });

  it("memoises a month", () => {
    expect(monthAlmanac(2026, 10, zone)).toBe(monthAlmanac(2026, 10, zone));
  });
});

describe("calendar helpers", () => {
  it("counts a month's days", () => {
    expect(monthDates(2026, 2)).toHaveLength(28);
    expect(monthDates(2028, 2)).toHaveLength(29);
  });

  it("places an hour on the site's clock", () => {
    expect(localHour("2026-10-21", 21, zone).toISOString()).toBe(
      "2026-10-21T17:00:00.000Z",
    );
  });
});
