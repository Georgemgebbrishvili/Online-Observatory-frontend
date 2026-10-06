import { expect, test, type Page } from "@playwright/test";

import {
  appRoutes,
  locales,
  operatorRoutes,
  parameterisedRoutes,
  publicRoutes,
  signedOutRoutes,
} from "./routes";

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
    page.locator("time"),
    page.locator(".live-time"),
    // /status: the fake platform's hours and ages are relative to the server's clock.
    page.locator(".status-page tbody th"),
    page.locator("[data-field]").filter({ hasText: /\d{1,2}:\d{2}|ago|წინ/ }),
    page.locator(".status-observatory .data"),
    page.locator(".status-source"),
    // The room's forecast hour is the one the server read it in.
    page.locator(".room-reading-live"),
    // The live stream: a frame has arrived or not yet, and it is not waited on (below).
    page.locator(".live-feed [data-live-stream]"),
    // The operator overview's ages are the server's clock against the fake's readings.
    page.locator(".operator-freshness"),
    page.locator("[data-age]"),
    // A hash of the server's error, whose length changes with the code that threw it:
    // the whole line, so the mask's box does not.
    page.locator(".route-error-digest"),
    // The legal contents: Georgian rows of fractional height, whose text lands a pixel
    // apart from one run to the next.
    page.locator(".legal-toc ol"),
    // The observatory's clock is blank until it mounts, then the browser's time.
    page.locator(".site-clock"),
  ];
}

async function capture(
  page: Page,
  route: string,
  locale: string,
  width: string,
  label = route,
) {
  await page.clock.setFixedTime(fixedTime);
  await page.goto(`/${locale}${route ? `/${route}` : ""}`);
  await expect(page.locator("h1").first()).toBeAttached();
  // Every image decoded. Not "networkidle": the dev server holds connections open,
  // and on some routes it never settles.
  // The live room settles first: a feed still starting or connecting is a moment, not a
  // state. Its MJPEG stream never "completes" -- it replaces itself -- so it is not waited on.
  await page.waitForFunction(() => !document.querySelector(".room [data-live-busy]"));
  // The operator's lists are fetched by the browser: loaded, not mid-way.
  await page.waitForFunction(
    () => !document.querySelector('.operator-list[aria-busy="true"]'),
  );
  await page.waitForFunction(() =>
    [...document.images].every(
      (image) => image.complete || "liveStream" in image.dataset,
    ),
  );

  // The body face for the locale (ADR-039): Geist for English, FiraGO for Georgian.
  const bodyFace = locale === "ka" ? "firago" : "geist";
  const bodyLoaded = await page.evaluate(async (face) => {
    await document.fonts.ready;
    return [...document.fonts].some((loaded) => {
      const family = loaded.family.toLowerCase();
      // next/font also declares a "<face> Fallback" from a system font: not the face.
      return (
        family.includes(face) &&
        !family.includes("fallback") &&
        loaded.status === "loaded"
      );
    });
  }, bodyFace);
  expect(bodyLoaded, `${bodyFace} must be loaded before capture`).toBe(true);

  // A query string is part of some routes; a file name keeps letters, digits and dashes.
  const name = `${locale}-${(label || "home").replace(/[^a-z0-9-]+/gi, "-")}-${width}.png`;
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
      // verify-email: where registering lands. not-found: any address that matches no
      // route. reset-password: its "sent" answer, and a reset link (ADR-040).
      for (const route of [
        ...publicRoutes,
        ...signedOutRoutes,
        "verify-email",
        "reset-password?sent=1",
        "reset-password/a-reset-link-token-for-the-visual-gate",
        "not-found",
      ]) {
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

  test.describe(`operator at ${width}`, () => {
    test.use({ viewport, storageState: "e2e/.auth/operator.json" });

    for (const locale of locales) {
      for (const route of operatorRoutes) {
        test(`${locale} /${route}`, async ({ page }) => {
          await capture(page, route, locale, width);
        });
      }
    }
  });

  // The route error screen. The fake platform fails every catalogue read for this one
  // operator, and the targets page does not catch it.
  test.describe(`error at ${width}`, () => {
    test.use({ viewport, storageState: { cookies: [], origins: [] } });

    for (const locale of locales) {
      test(`${locale} route error`, async ({ page }) => {
        await page.goto(`/${locale}/sign-in`);
        await page.locator('input[type="email"]').fill("failing@darkview.test");
        await page.locator('input[type="password"]').fill("correct horse battery");
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL(new RegExp(`/${locale}/app$`));
        await capture(page, "admin/targets", locale, width, "error");
      });
    }
  });
}
