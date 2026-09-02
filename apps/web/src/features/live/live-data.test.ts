import { describe, expect, it } from "vitest";

import { formatElapsedTime } from "./live-data";
import { createSafeNudgeRequest } from "./nudge";

describe("live observation helpers", () => {
  it("formats elapsed mission time as an instrument readout", () => {
    expect(formatElapsedTime(1062)).toBe("00:17:42");
    expect(formatElapsedTime(3723)).toBe("01:02:03");
  });

  it("creates a bounded request that cannot directly command hardware", () => {
    expect(createSafeNudgeRequest("LEFT")).toEqual({
      kind: "SAFE_NUDGE_REQUEST",
      direction: "LEFT",
      arcseconds: 5,
      status: "AWAITING_SERVER_VALIDATION",
      directlyCommandsHardware: false,
    });
  });
});
