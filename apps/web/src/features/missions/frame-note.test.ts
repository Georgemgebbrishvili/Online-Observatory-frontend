import { describe, expect, it } from "vitest";

import { roomCopy } from "@/i18n/resources/room";

import { frameNote } from "./frame-note";

describe("frameNote", () => {
  it("says how many frames of what length the stack holds", () => {
    expect(
      frameNote(
        { exposureMilliseconds: 2000, gain: 200, stackedFrames: 12 },
        roomCopy.en.live.frame,
        "en",
      ),
    ).toBe("12 × 2 s stacked · gain 200");
    expect(
      frameNote(
        { exposureMilliseconds: 2500, gain: 200, stackedFrames: 3 },
        roomCopy.ka.live.frame,
        "ka",
      ),
    ).toBe("3 × 2,5 წმ დაჯამებული · გაძლიერება 200");
  });

  it("says a single sub-exposure is one, in milliseconds when short", () => {
    expect(
      frameNote(
        { exposureMilliseconds: 250, gain: 150, stackedFrames: null },
        roomCopy.en.live.frame,
        "en",
      ),
    ).toBe("250 ms exposure · gain 150");
  });
});
