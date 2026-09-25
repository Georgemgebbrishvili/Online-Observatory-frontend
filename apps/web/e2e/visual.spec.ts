import { expect, test, type Page } from "@playwright/test";

import { appRoutes, locales, parameterisedRoutes, publicRoutes } from "./routes";
import { liveViewport } from "./selectors";

/**
 * The visual gate. Every public and every /app route, both languages, phone and
 * desktop, compared against baselines generated only inside the Playwright container
 * (`npm run visual:update`). Fonts rasterise differently on macOS, so a baseline
 * from anywhere else would fail CI for reasons that are not changes to the product.
 */
test.skip(
  process.platform !== "linux",
  "Visual baselines exist only for the Playwright container: run `npm run visual`.",
);

// A fixed instant for everything the browser computes. What the server renders from
// its own clock is masked instead.
const fixedTime = new Date("2026-09-25T20:00:00+04:00");

const widths = [
  { name: "390", viewport: { width: 390, height: 844 } },
  { name: "1440", viewport: { width: 1440, height: 900 } },
] as const;

function masks(page: Page) {
  return [
    liveViewport(page),
    page.locator("time"),
    page.locator(".live-time"),
    // /status: the fake platform's hours and ages are relative to the server's clock.
    page.locator(".status-page tbody th"),
    page.locator("[data-field]").filter({ hasText: /\d{1,2}:\d{2}|ago|წინ/ }),
    page.locator(".status-observatory .data"),
    page.locator(".status-source"),
  ];
}

async function capture(page: Page, route: string, locale: string, width: string) {
  await page.clock.setFixedTime(fixedTime);
  await page.goto(`/${locale}${route ? `/${route}` : ""}`);
  await expect(page.locator("h1").first()).toBeAttached();
  // Every image decoded. Not "networkidle": the dev server holds connections open,
  // and on some routes it never settles.
  await page.waitForFunction(() => [...document.images].every((image) => image.complete));

  const firaGOLoaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].some(
      (face) => /firago/i.test(face.family) && face.status === "loaded",
    );
  });
  expect(firaGOLoaded, "FiraGO must be loaded before capture").toBe(true);

  const name = `${locale}-${(route || "home").replaceAll("/", "-")}-${width}.png`;
  await expect(page).toHaveScreenshot(name, {
    fullPage: true,
    mask: masks(page),
    stylePath: "e2e/visual.css",
  });
}

for (const { name: width, viewport } of widths) {
  test.describe(`public at ${width}`, () => {
    test.use({ viewport, storageState: { cookies: [], origins: [] } });

    for (const locale of locales) {
      for (const route of publicRoutes) {
        test(`${locale} /${route}`, async ({ page }) => {
          await capture(page, route, locale, width);
        });
      }
    }
  });

  test.describe(`app at ${width}`, () => {
    test.use({ viewport, storageState: "e2e/.auth/observer.json" });

    for (const locale of locales) {
      for (const route of [...appRoutes, ...parameterisedRoutes]) {
        test(`${locale} /${route}`, async ({ page }) => {
          await capture(page, route, locale, width);
        });
      }
    }
  });
}
