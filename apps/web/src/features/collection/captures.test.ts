import { describe, expect, it } from "vitest";

import { captures, getCollectionProgress, progressCollections } from "./captures";

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

  it("computes generic progress from collection target definitions", () => {
    expect(progressCollections.map(getCollectionProgress)).toEqual([
      { completed: 2, total: 4, percentage: 50 },
      { completed: 2, total: 5, percentage: 40 },
      { completed: 2, total: 6, percentage: 33 },
    ]);
  });
});
