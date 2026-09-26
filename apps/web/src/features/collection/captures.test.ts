import { describe, expect, it } from "vitest";

import { captures } from "./captures";

describe("capture collection model", () => {
  it("records the complete capture provenance model", () => {
    for (const capture of captures) {
      expect(capture).toMatchObject({
        id: expect.any(String),
        targetId: expect.any(String),
        capturedAt: expect.any(String),
        telescope: expect.any(String),
        missionId: expect.any(String),
        processingPreset: expect.stringMatching(/NATURAL|BRIGHT|DETAIL/),
        thumbnailUrl: expect.stringMatching(/^\/captures\//),
        originalAssetUrl: expect.stringMatching(/^\/captures\//),
        visibility: expect.stringMatching(/PUBLIC|PRIVATE/),
      });
    }
  });
});
