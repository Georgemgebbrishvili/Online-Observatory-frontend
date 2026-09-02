import { describe, expect, it } from "vitest";

import { isLocale } from "./config";

describe("isLocale", () => {
  it("accepts English and Georgian locale routes", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("ka")).toBe(true);
  });

  it("rejects unsupported locale routes", () => {
    expect(isLocale("fr")).toBe(false);
  });
});
