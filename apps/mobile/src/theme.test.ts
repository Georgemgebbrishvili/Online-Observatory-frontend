import { describe, expect, it } from "vitest";

import { palette as web } from "../../web/src/styles/tokens";
import { palette } from "./theme";

describe("theme", () => {
  it("paints with the website's colours, unchanged", () => {
    for (const [name, value] of Object.entries(palette)) {
      expect(value, name).toBe(web[name as keyof typeof web]);
    }
  });
});
