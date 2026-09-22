import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { palette } from "./tokens";

const tokensCss = fs.readFileSync(path.join(import.meta.dirname, "tokens.css"), "utf8");
const contrastDoc = path.join(import.meta.dirname, "../../../../docs/design/contrast.md");

type Rgba = [number, number, number, number];

const declarations = new Map(
  [...tokensCss.matchAll(/^\s*(--[a-z0-9-]+):\s*([^;]+);/gm)].map((match) => [
    match[1],
    match[2].trim(),
  ]),
);

function parseHex(hex: string): Rgba {
  const digits = hex.slice(1);
  const full = digits.length === 3 ? [...digits].map((d) => d + d).join("") : digits;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)).concat(1) as Rgba;
}

function resolve(value: string): Rgba {
  const reference = value.match(/^var\((--[a-z0-9-]+)\)$/);
  if (reference) return resolve(declarations.get(reference[1])!);
  if (value.startsWith("#")) return parseHex(value);
  const mix = value.match(
    /^color-mix\(in srgb, (var\([^)]+\)) (\d+)%, (transparent|var\([^)]+\))\)$/,
  );
  if (!mix) throw new Error(`Unresolvable token value: ${value}`);
  const weight = Number(mix[2]) / 100;
  const first = resolve(mix[1]);
  if (mix[3] === "transparent") return [first[0], first[1], first[2], weight];
  const second = resolve(mix[3]);
  return [0, 1, 2]
    .map((i) => first[i] * weight + second[i] * (1 - weight))
    .concat(1) as Rgba;
}

function token(name: string): Rgba {
  return resolve(`var(--color-${name})`);
}

function over(top: Rgba, bottom: Rgba): Rgba {
  const alpha = top[3];
  return [0, 1, 2].map((i) => top[i] * alpha + bottom[i] * (1 - alpha)).concat(1) as Rgba;
}

function luminance([r, g, b]: Rgba) {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(foreground: Rgba, background: Rgba) {
  const [light, dark] = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a,
  );
  return (light + 0.05) / (dark + 0.05);
}

const surfaces = ["night", "surface-base", "surface-raised", "surface-hover"];
const textTokens = [
  "text-primary",
  "text-secondary",
  "text-tertiary",
  "text-technical",
  "photon",
  "success",
  "warning",
  "error",
  "info",
];
// Measured below AA and therefore never paired in the library.
const restricted = new Set(["text-tertiary on surface-hover"]);

type Pair = {
  foreground: string;
  background: string;
  use: string;
  minimum: number;
  ratio: number;
};

function measure(
  foreground: string,
  background: string,
  use: string,
  minimum: number,
  fill?: string,
): Pair {
  const base = token(background);
  const ground = fill ? over(token(fill), base) : base;
  const label = fill ? `${fill} over ${background}` : background;
  return {
    foreground,
    background: label,
    use,
    minimum,
    ratio: contrast(token(foreground), ground),
  };
}

const pairs: Pair[] = [
  ...textTokens.flatMap((fg) => surfaces.map((bg) => measure(fg, bg, "text", 4.5))),
  measure("on-photon", "photon", "primary button label", 4.5),
  measure("on-photon", "photon-hover", "primary button label, hover", 4.5),
  ...["border-control", "photon", "error"].flatMap((fg) =>
    surfaces.map((bg) => measure(fg, bg, "control boundary / focus ring (1.4.11)", 3)),
  ),
  ...[
    ["photon", "photon-muted"],
    ["success", "success-muted"],
    ["warning", "warning-muted"],
    ["error", "error-muted"],
  ].flatMap(([fg, fill]) =>
    ["surface-base", "surface-raised"].map((bg) =>
      measure(fg, bg, "status indicator text", 4.5, fill),
    ),
  ),
];

function table() {
  const rows = pairs.map((pair) => {
    const key = `${pair.foreground} on ${pair.background}`;
    const verdict =
      pair.ratio >= pair.minimum
        ? "pass"
        : restricted.has(key)
          ? "**restricted**"
          : "FAIL";
    return `| \`${pair.foreground}\` | \`${pair.background}\` | ${pair.use} | ${pair.ratio.toFixed(2)}:1 | ${pair.minimum}:1 | ${verdict} |`;
  });
  return [
    "| Foreground | Background | Use | Measured | AA minimum | Result |",
    "| --- | --- | --- | --- | --- | --- |",
    ...rows,
  ].join("\n");
}

describe("design tokens", () => {
  it("uses the five core colours CLAUDE.md names, exactly", () => {
    expect(declarations.get("--dv-neutral-950")).toBe("#05080d");
    expect(declarations.get("--dv-neutral-800")).toBe("#111722");
    expect(declarations.get("--dv-photon")).toBe("#5cc8ff");
    expect(declarations.get("--dv-neutral-100")).toBe("#f2f5f7");
    expect(declarations.get("--dv-neutral-300")).toBe("#aab4be");
    expect(token("night")).toEqual(parseHex("#05080d"));
    expect(token("surface-raised")).toEqual(parseHex("#111722"));
    expect(token("photon")).toEqual(parseHex("#5cc8ff"));
    expect(token("text-primary")).toEqual(parseHex("#f2f5f7"));
    expect(token("text-secondary")).toEqual(parseHex("#aab4be"));
  });

  it("keeps tokens.ts identical to the palette in tokens.css", () => {
    const cssPalette = Object.fromEntries(
      [...declarations]
        .filter(([name]) => name.startsWith("--dv-"))
        .map(([name, value]) => [name, value]),
    );
    const tsPalette = Object.fromEntries(
      Object.entries(palette).map(([name, value]) => [
        `--dv-${name.replace(/([A-Z0-9]+)/g, (part) => `-${part.toLowerCase()}`)}`,
        value,
      ]),
    );
    expect(tsPalette).toEqual(cssPalette);
  });

  it("meets WCAG 2.1 AA for every pair the library uses", () => {
    const failing = pairs
      .filter((pair) => pair.ratio < pair.minimum)
      .map((pair) => `${pair.foreground} on ${pair.background}`);
    expect(new Set(failing)).toEqual(restricted);
  });

  it("records every measurement in docs/design/contrast.md", () => {
    if (process.env.UPDATE_CONTRAST) {
      const document = fs.readFileSync(contrastDoc, "utf8");
      fs.writeFileSync(
        contrastDoc,
        document.replace(
          /<!-- table -->[\s\S]*<!-- \/table -->/,
          `<!-- table -->\n${table()}\n<!-- /table -->`,
        ),
      );
    }
    // Compare cell by cell so Prettier's column padding does not matter.
    const cells = (markdown: string) =>
      markdown
        .split("\n")
        .filter((line) => line.startsWith("|"))
        .map((line) => line.split("|").map((cell) => cell.trim().replace(/^-+$/, "---")));
    const recorded = fs
      .readFileSync(contrastDoc, "utf8")
      .match(/<!-- table -->([\s\S]*)<!-- \/table -->/)![1];
    expect(cells(recorded)).toEqual(cells(table()));
  });
});
