import { describe, expect, it } from "vitest";

import { reserveCopy } from "@/i18n/resources/reserve";
import { targetCopy } from "@/i18n/resources/targets";
import { ApiRequestError } from "@/lib/platform/browser";

import { readRefusal } from "./refusal";

const copy = reserveCopy.en.form;
const reasons = targetCopy.en.reasons;
const refused = (status: number, code: string, details?: Record<string, unknown>) =>
  new ApiRequestError(status, { code, message: "refused", ...(details && { details }) } as never);

describe("readRefusal", () => {
  it("takes a slot somebody else booked off the board", () => {
    expect(readRefusal(refused(409, "SLOT_UNAVAILABLE"), copy, reasons)).toEqual({
      message: copy.taken,
      slotGone: true,
      skyChanged: false,
    });
    expect(readRefusal(refused(409, "CONFLICT"), copy, reasons).slotGone).toBe(true);
  });

  it("names why a target is not observable, once each", () => {
    const refusal = readRefusal(
      refused(422, "TARGET_NOT_OBSERVABLE", {
        blockReasons: ["TOO_CLOSE_TO_MOON", "BELOW_MIN_ALTITUDE", "TOO_CLOSE_TO_MOON"],
      }),
      copy,
      reasons,
    );
    expect(refusal.message).toBe(
      "That target is no longer up for this whole slot. Why: Too close to the Moon, Too low in the sky. Choose another.",
    );
    expect(refusal.skyChanged).toBe(true);
    expect(refusal.slotGone).toBe(false);
  });

  it("falls back to the plain sentence when the reasons are missing or unknown", () => {
    for (const details of [undefined, { blockReasons: ["NOT_A_REASON"] }, { blockReasons: "x" }])
      expect(
        readRefusal(refused(422, "TARGET_NOT_OBSERVABLE", details), copy, reasons).message,
      ).toBe(copy.notObservable);
  });

  it("says the Georgian reasons in Georgian", () => {
    const message = readRefusal(
      refused(422, "TARGET_NOT_OBSERVABLE", { blockReasons: ["BELOW_HORIZON"] }),
      reserveCopy.ka.form,
      targetCopy.ka.reasons,
    ).message;
    expect(message).toContain(targetCopy.ka.reasons.BELOW_HORIZON);
  });

  it("keeps the weather, offline and unknown answers", () => {
    expect(readRefusal(refused(409, "WEATHER_HOLD"), copy, reasons).message).toBe(copy.weatherHold);
    expect(readRefusal(refused(503, "OBSERVATORY_OFFLINE"), copy, reasons).message).toBe(copy.offline);
    expect(readRefusal(new Error("network"), copy, reasons).message).toBe(copy.failed);
  });
});
