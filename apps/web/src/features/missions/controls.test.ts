import { zSubmitMissionCommandBody } from "@darkview/contracts/zod";
import { describe, expect, it } from "vitest";

import {
  commandRequest,
  NUDGE_STEP_ARCMINUTES,
  offeredControls,
  outcomeOf,
} from "./controls";

describe("commandRequest", () => {
  it("sends intent only, each one a body the contract accepts", () => {
    for (const control of ["up", "down", "left", "right", "recenter", "stop"] as const) {
      expect(
        zSubmitMissionCommandBody.safeParse(commandRequest(control, null)).success,
      ).toBe(true);
    }
    expect(
      zSubmitMissionCommandBody.safeParse(commandRequest("capture", "PLANETARY")).success,
    ).toBe(true);
  });

  it("maps the arrows to the sky's axes, one bounded step each", () => {
    expect(commandRequest("up", null)).toEqual({
      type: "NUDGE",
      nudge: {
        kind: "NUDGE",
        axis: "ALTITUDE",
        direction: "POSITIVE",
        stepArcminutes: NUDGE_STEP_ARCMINUTES,
      },
    });
    expect(commandRequest("left", null).nudge).toMatchObject({
      axis: "AZIMUTH",
      direction: "NEGATIVE",
    });
  });

  it("re-centres without coordinates, captures with the target's profile, stops with no reason", () => {
    expect(commandRequest("recenter", null)).toEqual({ type: "RECENTER" });
    expect(commandRequest("capture", "GLOBULAR_CLUSTER")).toEqual({
      type: "CAPTURE",
      capture: { kind: "CAPTURE", imagingProfile: "GLOBULAR_CLUSTER" },
    });
    expect(commandRequest("stop", null)).toEqual({ type: "ABORT", reason: null });
    expect(() => commandRequest("capture", null)).toThrow();
  });
});

describe("offeredControls", () => {
  it("offers everything while observing, and capture only with a profile", () => {
    expect(offeredControls("OBSERVING", true, "PLANETARY")).toEqual({
      move: true,
      capture: true,
      stop: true,
      waiting: null,
    });
    expect(offeredControls("OBSERVING", true, null).capture).toBe(false);
  });

  it("offers only stop before the target is centred, and while capturing", () => {
    for (const state of ["PREPARING", "SLEWING", "VERIFYING", "CENTERING"] as const) {
      expect(offeredControls(state, true, "PLANETARY")).toEqual({
        move: false,
        capture: false,
        stop: true,
        waiting: "centring",
      });
    }
    expect(offeredControls("CAPTURING", true, "PLANETARY").waiting).toBe("capturing");
  });

  it("offers nothing unconnected, or outside a live state", () => {
    expect(offeredControls("OBSERVING", false, "PLANETARY").stop).toBe(false);
    for (const state of [
      "SCHEDULED",
      "PROCESSING",
      "COMPLETE",
      "WEATHER_HOLD",
    ] as const) {
      expect(offeredControls(state, true, "PLANETARY").stop).toBe(false);
    }
  });
});

describe("outcomeOf", () => {
  it("counts only ACCEPTED and COMPLETED as done, and names every refusal", () => {
    expect(outcomeOf({ status: "ACCEPTED", rejectionReason: null })).toEqual({
      kind: "done",
    });
    expect(outcomeOf({ status: "COMPLETED", rejectionReason: null })).toEqual({
      kind: "done",
    });
    expect(
      outcomeOf({ status: "REJECTED", rejectionReason: "SAFETY_NUDGE_LIMIT_EXCEEDED" }),
    ).toEqual({ kind: "refused", reason: "SAFETY_NUDGE_LIMIT_EXCEEDED" });
    expect(outcomeOf({ status: "EXPIRED", rejectionReason: null })).toEqual({
      kind: "refused",
      reason: "COMMAND_EXPIRED",
    });
    expect(outcomeOf({ status: "FAILED", rejectionReason: null })).toEqual({
      kind: "refused",
      reason: null,
    });
  });
});
