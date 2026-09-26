import { describe, expect, it } from "vitest";

import { formatCapturedAt, formatExposure, formatIntegration } from "./present";

describe("capture formatting", () => {
  it("states the shutter time in the observatory's zone and names the zone", () => {
    const text = formatCapturedAt("2026-09-25T18:40:00Z", "Asia/Tbilisi", "en");
    expect(text).toContain("25 September 2026");
    expect(text).toContain("22:40");
    expect(text).toMatch(/GMT\+4/);
    expect(formatCapturedAt("2026-09-25T18:40:00Z", "UTC", "en")).toContain("18:40");
  });

  it("writes exposure in ms under a second and in s above", () => {
    expect(formatExposure(12, "en")).toBe("12 ms");
    expect(formatExposure(2500, "en")).toBe("2.5 s");
    expect(formatExposure(2500, "ka")).toBe("2,5 s");
  });

  it("writes integration in seconds, then minutes, without a 60 s remainder", () => {
    expect(formatIntegration(4.8, "en")).toBe("4.8 s");
    expect(formatIntegration(120, "en")).toBe("2 min");
    expect(formatIntegration(119.6, "en")).toBe("2 min");
    expect(formatIntegration(252, "en")).toBe("4 min 12 s");
  });
});
