import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { brand } from "./brand";

const src = import.meta.dirname;
const spelled = /Stellar|STELLAR|სტელარ/;

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? files(full) : [full];
  });
}

describe("brand", () => {
  it("is spelled out only in brand.ts", () => {
    const offenders = files(src)
      .filter((file) => file !== path.join(src, "brand.ts"))
      .filter((file) => !/\.test\.[^/]+$/.test(file))
      .flatMap((file) =>
        readFileSync(file, "utf8")
          .split("\n")
          .flatMap((line, index) =>
            spelled.test(line) ? [`${path.relative(src, file)}:${index + 1}`] : [],
          ),
      );

    expect(offenders).toEqual([]);
  });

  it("declines the Georgian name from one stem", () => {
    const stem = brand.ka.nominative.slice(0, -1);

    expect(brand.ka.genitive).toBe(`${stem}ის`);
    expect(brand.ka.dative).toBe(`${stem}ს`);
    expect(brand.ka.on).toBe(`${stem}ზე`);
  });
});
