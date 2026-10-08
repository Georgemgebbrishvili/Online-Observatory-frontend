import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import {
  appRoutes,
  locales,
  operatorRoutes,
  parameterisedRoutes,
  publicRoutes,
  signedOutRoutes,
} from "./routes";

// Roadmap E2: WCAG 2.1 A and AA, checked by axe on every page in both languages, at a
// phone and a desktop width (the 2026-10-07 audit's progress-contrast finding showed
// only on the phone). An automated pass is the floor, not conformance: the keyboard and
// screen-reader pass is still done by hand.
const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const widths = [390, 1440] as const;

// Two loads and two full scans per test; the design system alone is a long page.
test.describe.configure({ timeout: 90_000 });

async function violations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(tags).analyze();
  return violations.map((violation) => ({
    rule: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target.join(" ")),
  }));
}

function describeAxe(routes: readonly string[]) {
  for (const locale of locales) {
    for (const route of routes) {
      const path = `/${locale}${route ? `/${route}` : ""}`;
      test(`${path} has no WCAG 2.1 AA violations`, async ({ page }) => {
        for (const width of widths) {
          await page.setViewportSize({ width, height: 900 });
          await page.goto(path);
          // A streamed page shows loading.tsx's <main> beside its own for a moment.
          await expect(page.locator("main.route-loading")).toHaveCount(0);
          await expect(page.locator("main")).toBeVisible();
          // The operator's lists and console are fetched by the browser: scanned loaded,
          // as the visual gate captures them. The design system's busy specimens stay busy.
          await expect(
            page.locator(':is(.operator-list, .operator-manual)[aria-busy="true"]'),
          ).toHaveCount(0);
          // Contrast is judged on the settled page. The wordmark's endorsement fades in
          // on first paint, and a scan that lands mid-fade measures a half-opaque colour.
          await page.evaluate(() =>
            Promise.all(
              document
                .getAnimations()
                .filter(
                  (animation) =>
                    animation.effect?.getComputedTiming().iterations !== Infinity,
                )
                .map((animation) => animation.finished.catch(() => undefined)),
            ),
          );
          expect(await violations(page), `${path} at ${width}px`).toEqual([]);
        }
      });
    }
  }
}

test.describe("observer", () => {
  describeAxe([...publicRoutes, ...appRoutes, ...parameterisedRoutes]);
});

test.describe("signed out", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  describeAxe(signedOutRoutes);
});

test.describe("operator", () => {
  test.use({ storageState: "e2e/.auth/operator.json" });
  describeAxe(operatorRoutes);
});
