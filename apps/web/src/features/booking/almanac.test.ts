import { describe, expect, it } from "vitest";

import { localHour } from "./almanac";

describe("localHour", () => {
  it("places an hour on the site's clock", () => {
    expect(localHour("2026-10-21", 21, "Asia/Tbilisi").toISOString()).toBe(
      "2026-10-21T17:00:00.000Z",
    );
  });
});
