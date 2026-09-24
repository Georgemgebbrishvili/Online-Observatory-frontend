import { expect, test, type Page } from "@playwright/test";

import { locales } from "./routes";

// docs/plan/02-build-phases.md Phase 1: every surface verified at these five widths,
// every phase, in both languages — not at the end.
export const widths = [320, 390, 768, 1024, 1440] as const;

const landmarkRoles = new Set([
  "banner",
  "navigation",
  "main",
  "complementary",
  "contentinfo",
  "search",
  "form",
  "region",
]);

// Landmarks that convey nothing without a name. banner, main and contentinfo are
// unique per page and are named by their role alone.
const mustBeNamed = ["navigation", "complementary", "region", "form"];

type Landmark = { role: string; name: string };

// An aria snapshot contains only what is actually exposed, so a landmark hidden by
// display:none at this width never appears. That is the point: the question is what a
// screen reader reaches at this width, not what the source happens to contain.
async function landmarks(page: Page): Promise<Landmark[]> {
  const snapshot = await page.locator("body").ariaSnapshot();
  return snapshot
    .split("\n")
    .map((line) => line.trim().match(/^- ([a-z]+)(?: "([^"]*)")?/))
    .filter((match): match is RegExpMatchArray => match !== null)
    .filter((match) => landmarkRoles.has(match[1]))
    .map((match) => ({ role: match[1], name: match[2] ?? "" }));
}

function headingLevels(page: Page) {
  return page.locator("h1, h2, h3, h4, h5, h6").evaluateAll((nodes) =>
    nodes
      // checkVisibility, not offsetParent: a position:fixed heading has no
      // offsetParent and would read as hidden when it is on screen.
      .filter((node) => (node as HTMLElement).checkVisibility())
      .map((node) => Number(node.tagName.slice(1))),
  );
}

export function describeShellContract(routes: readonly string[]) {
  for (const locale of locales) {
    for (const route of routes) {
      const path = `/${locale}${route ? `/${route}` : ""}`;

      test(`${path} holds its shape at every width`, async ({ page }) => {
        await page.goto(path);
        await expect(page.locator("main")).toBeVisible();

        for (const width of widths) {
          await page.setViewportSize({ width, height: 900 });
          // Phase 1 Done-when: no horizontal scroll at 320px anywhere. Checked at
          // every width, because a layout that overflows at 768 is just as broken.
          const overflow = await page.evaluate(
            () =>
              document.documentElement.scrollWidth - document.documentElement.clientWidth,
          );
          expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);
        }
      });

      test(`${path} exposes one unambiguous landmark set`, async ({ page }) => {
        await page.goto(path);

        // 390 and 1440 are the two that matter: the sidebar and the bottom bar swap
        // places between them, and a duplicate landmark would appear in that swap.
        for (const width of [390, 1440]) {
          await page.setViewportSize({ width, height: 900 });
          const exposed = await landmarks(page);

          expect(
            exposed.filter((landmark) => landmark.role === "main"),
            `main landmarks at ${width}px`,
          ).toHaveLength(1);

          expect(
            exposed
              .filter(
                (landmark) => landmark.name === "" && mustBeNamed.includes(landmark.role),
              )
              .map((landmark) => landmark.role),
            `landmarks with no accessible name at ${width}px`,
          ).toEqual([]);

          // WCAG 1.3.1: two landmarks of the same role must be told apart by name.
          const seen = exposed.map((landmark) => `${landmark.role}:${landmark.name}`);
          expect(
            seen.filter((key, index) => seen.indexOf(key) !== index),
            `landmarks sharing a role and a name at ${width}px`,
          ).toEqual([]);
        }
      });

      test(`${path} starts its heading outline at h1`, async ({ page }) => {
        await page.goto(path);
        await page.setViewportSize({ width: 1440, height: 900 });

        const levels = await headingLevels(page);
        expect(
          levels.length,
          "the page has at least one visible heading",
        ).toBeGreaterThan(0);
        expect(levels[0], "the first visible heading is the page's h1").toBe(1);
        expect(
          levels.filter((level) => level === 1),
          "exactly one h1",
        ).toHaveLength(1);
      });
    }
  }
}
