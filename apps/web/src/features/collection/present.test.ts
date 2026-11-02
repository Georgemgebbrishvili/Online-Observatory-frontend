import { describe, expect, it } from "vitest";

import type { CollectionEntry } from "./read";
import {
  formatCapturedAt,
  formatExposure,
  formatIntegration,
  sessionGroups,
} from "./present";

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

describe("sessionGroups (ADR-079)", () => {
  const entry = (id: string, missionId: string, targetId: string) =>
    ({
      capture: { id, missionId, targetId },
      target: null,
      retired: false,
      thumbnail: null,
    }) as unknown as CollectionEntry;

  it("groups a session's captures by the object, in the order given", () => {
    const groups = sessionGroups([
      entry("c3", "m2", "albireo"),
      entry("c2", "m2", "albireo"),
      entry("c1", "m2", "saturn"),
      entry("c0", "m1", "saturn"),
    ]);
    expect(groups.map((group) => group.entries.map((e) => e.capture.id))).toEqual([
      ["c3", "c2"],
      ["c1"],
      ["c0"],
    ]);
  });
});
