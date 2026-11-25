import { existsSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { heroCaptures, heroPicture } from "@/features/home/captures";

describe("heroPicture", () => {
  it("is the 8SE photograph, undated, for an object with no capture of our own", () => {
    expect(heroPicture("saturn", {})).toEqual({
      feed: { raw: "/sky/feed/saturn-raw.webp", settled: "/sky/feed/saturn.webp" },
      capturedOn: null,
    });
  });

  it("is the real capture, dated, where one is filed", () => {
    const capture = { src: "/sky/captures/jupiter.webp", capturedOn: "2026-12-01" };
    expect(heroPicture("jupiter", { jupiter: capture })).toEqual({
      feed: { raw: capture.src, settled: capture.src },
      capturedOn: "2026-12-01",
    });
  });

  it("names only captures that are in public/sky/captures, with a real date", () => {
    for (const capture of Object.values(heroCaptures)) {
      expect(capture!.src).toMatch(/^\/sky\/captures\/[a-z]+\.webp$/);
      expect(existsSync(path.join(process.cwd(), "public", capture!.src))).toBe(true);
      expect(Number.isNaN(Date.parse(`${capture!.capturedOn}T00:00:00Z`))).toBe(false);
    }
  });
});
