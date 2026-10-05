import { expect, test } from "@playwright/test";

import { brand } from "../src/brand";
import { appSidebar, bottomNavigation } from "./selectors";

test("communicates real telescope access in the English poster hero", async ({
  page,
}) => {
  await page.goto("/en");

  const hero = page.locator(".poster-hero");
  await expect(
    page.getByRole("heading", { level: 1, name: "The real sky, live." }),
  ).toBeVisible();
  await expect(hero.locator(".title-sunset")).toHaveText("live.");
  await expect(hero.getByText(/A real telescope in Tbilisi, Georgia/)).toBeVisible();
  await expect(page.getByLabel(brand.en.siteName).first()).toBeVisible();
  await expect(hero.getByRole("link", { name: "Reserve a slot" })).toHaveAttribute(
    "href",
    "/en/app/book",
  );

  // The stats are the platform's: tonight's observable count, then the telescope.
  const stats = hero.locator(".stats-row > div");
  await expect(stats).toHaveCount(3);
  await expect(stats.nth(0)).toContainText("Observable now");
  await expect(stats.nth(1)).toContainText("150");
  await expect(stats.nth(2)).toContainText("1500");

  // The fan's plates are drawings; the fan says so (CLAUDE.md, ADR-039).
  const fan = hero.locator(".plate-fan");
  await expect(fan.locator(".plate-fan-plate")).toHaveCount(3);
  for (const name of ["Jupiter", "Saturn", "Mars"]) {
    await expect(fan.getByText(name, { exact: true })).toBeVisible();
  }
  await expect(fan.getByText("Illustration — not telescope output")).toBeVisible();
});

test("renders the Georgian poster hero and switches locale", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/ka");

  await expect(
    page.getByRole("heading", { level: 1, name: "შენი დრო ნამდვილ ცასთან." }),
  ).toBeVisible();
  await expect(
    page.locator(".poster-hero").getByRole("link", { name: "დაჯავშნე დრო" }),
  ).toHaveAttribute("href", "/ka/app/book");
  await expect(
    page.locator(".plate-fan").getByText("ილუსტრაცია — არა ტელესკოპის კადრი"),
  ).toBeVisible();
  // Mkhedruli has no capitals: the headline is never uppercased.
  await expect(page.locator(".poster-hero-title .title-sunset")).toHaveCSS(
    "text-transform",
    "none",
  );
  await page.getByRole("link", { name: "ენა: English" }).click();
  await expect(page).toHaveURL(/\/en$/);
});

test("renders the complete data-driven public homepage", async ({ page }) => {
  await page.goto("/en");

  for (const heading of [
    "Four steps. One real observation.",
    "Choose what the telescope sees next.",
    "One real telescope, in Tbilisi.",
    "Your next observation starts here.",
  ]) {
    await expect(page.getByRole("heading", { level: 2, name: heading })).toBeVisible();
  }
  for (const gone of [
    "Three steps. One real observation.",
    "A real observatory, in motion.",
    "A visual record of where you looked.",
  ]) {
    await expect(page.getByRole("heading", { name: gone })).toHaveCount(0);
  }

  // How a session works: four steps, each saying it is simulated today.
  const steps = page.locator("#about .flight-plan-step");
  await expect(steps).toHaveCount(4);
  for (const step of ["Reserve", "Slew", "Watch", "Keep"]) {
    await expect(page.getByRole("heading", { name: step, exact: true })).toBeVisible();
  }
  await expect(page.locator("#about .flight-plan-status")).toHaveText(
    Array(4).fill("Simulated today"),
  );

  // Tonight's list comes from GET /targets/tonight on the fake platform.
  const tonight = page.locator("#tonight");
  for (const target of ["Saturn", "Albireo", "Moon", "Hercules Cluster", "Venus"]) {
    await expect(
      tonight.getByRole("heading", { name: target, exact: true }),
    ).toBeVisible();
  }
  await expect(tonight.getByRole("link", { name: "Saturn" })).toHaveAttribute(
    "href",
    "/en/app/missions/saturn",
  );
  await expect(
    tonight.getByRole("link", { name: "All of tonight's targets" }),
  ).toHaveAttribute("href", "/en/app/missions");
  await expect(tonight.getByText("SIMULATED OBSERVATORY")).toBeVisible();

  // The instrument is the platform's telescope, not a fixture.
  const instrument = page.locator("#live");
  await expect(instrument.getByText("Celestron NexStar 6SE")).toBeVisible();
  await expect(instrument.getByText("150", { exact: true })).toBeVisible();
  await expect(instrument.getByText("1500", { exact: true })).toBeVisible();
  await expect(instrument.getByText("f/10", { exact: true })).toBeVisible();
  await expect(instrument.getByText("ZWO ASI585MC")).toBeVisible();
  await expect(instrument.getByText(/Not long-exposure astrophotography/)).toBeVisible();
  await expect(instrument.getByText("Online", { exact: true })).toBeVisible();

  await expect(page.getByText("30 min", { exact: true })).toBeVisible();
  await expect(page.getByText("120 min", { exact: true })).toBeVisible();
  await expect(
    page.locator("#final-cta").getByRole("link", { name: "Reserve a slot" }),
  ).toHaveAttribute("href", "/en/app/book");
});

test("keeps the public homepage within a mobile viewport", async ({ page }) => {
  for (const locale of ["en", "ka"]) {
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/${locale}`);

      const viewport = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(viewport.scrollWidth, `${locale} at ${width}px`).toBe(viewport.clientWidth);
      await expect(page.locator(".poster-hero .button-primary")).toBeVisible();
      await expect(page.locator(".plate-fan-caption")).toBeVisible();
    }
  }
});

test("provides the complete public navigation on desktop and mobile", async ({
  page,
}) => {
  await page.goto("/en");

  const header = page.getByRole("banner");
  const publicNavigation = header.getByRole("navigation", {
    name: "Public navigation",
  });

  for (const item of ["Explore", "Live", "Observatory", "Pricing", "About"]) {
    await expect(publicNavigation.getByRole("link", { name: item })).toBeVisible();
  }

  await expect(header.getByRole("link", { name: "Sign in" })).toBeVisible();
  await expect(header.getByRole("link", { name: "Start Exploring" })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.getByRole("button", { name: "Open navigation" }).click();

  await expect(
    header.getByRole("navigation", { name: "Public navigation" }),
  ).toBeVisible();
  await expect(header.getByRole("link", { name: "Sign in" })).toBeVisible();
});

test("uses a desktop sidebar and native-style mobile app navigation", async ({
  page,
}) => {
  await page.goto("/en/app");

  const sidebar = appSidebar(page);
  await expect(sidebar).toBeVisible();
  await expect(sidebar.getByLabel(brand.en.siteName)).toBeVisible();
  await expect(sidebar.getByText("Tbilisi Observatory")).toBeVisible();
  await expect(sidebar.getByText("Simulated status")).toBeVisible();

  for (const item of ["Home", "Missions", "Live", "Collection", "Profile"]) {
    await expect(sidebar.getByRole("link", { name: item })).toBeVisible();
  }

  await expect(sidebar.getByRole("link", { name: "Home" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();

  const bottomNav = bottomNavigation(page);
  await expect(sidebar).toBeHidden();
  await expect(bottomNav).toBeVisible();
  await expect(page.getByRole("banner").getByText("Online")).toBeVisible();
  const mobileMissionsLink = bottomNav.getByRole("link", { name: "Missions" });
  await expect(mobileMissionsLink).toBeVisible();
  await Promise.all([
    page.waitForURL(/\/en\/app\/missions$/),
    mobileMissionsLink.click(),
  ]);
  await expect(bottomNav.getByRole("link", { name: "Missions" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
});

test("shows and operates the internal visual system", async ({ page }) => {
  await page.goto("/design-system");

  await expect(page).toHaveURL(/\/en\/design-system$/);
  await expect(page.getByRole("heading", { name: "Visual system" })).toBeVisible();
  await expect(page.getByText("Weather hold", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Processing")).toBeVisible();

  await page.getByRole("button", { name: "Open modal" }).click();
  const dialog = page.getByRole("dialog", { name: "Confirm observation" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Close" }).first().click();
  await expect(dialog).not.toBeVisible();

  await page.getByRole("tab", { name: "Visibility" }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Altitude");
});

test("keeps the visual system within a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/design-system");

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
  await page.getByRole("button", { name: "Open sheet" }).click();
  await expect(page.getByRole("dialog", { name: "Observation settings" })).toBeVisible();
});

test("lists tonight's targets observable-first, with the platform's reasons", async ({
  page,
}) => {
  await page.goto("/en/app/missions");

  await expect(page.getByRole("heading", { name: "Tonight's targets" })).toBeVisible();
  const cards = page.getByRole("article");
  await expect(cards).toHaveCount(5);
  // Observable first, then highest: Albireo at 61°, then Saturn at 38°.
  await expect(cards.nth(0)).toContainText("Albireo");
  await expect(cards.nth(0)).toContainText("Observable now");
  await expect(cards.nth(1)).toContainText("Saturn");
  await expect(page.getByRole("article").filter({ hasText: "Venus" })).toContainText(
    "Below the horizon",
  );

  // Filters are the contract's types, and only those tonight's list holds.
  await expect(page.getByRole("button", { name: "Galaxies" })).toHaveCount(0);
  await page.getByRole("button", { name: "Double stars" }).click();
  await expect(cards).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Albireo" })).toBeVisible();
});

test("shows a target from the platform, and books rather than starting a fake mission", async ({
  page,
}) => {
  await page.goto("/en/app/missions/saturn");

  await expect(page.getByRole("heading", { name: "Saturn", exact: true })).toBeVisible();
  await expect(page.getByText("Observable now")).toBeVisible();
  // 14:30Z and 01:40Z, read in the observatory's time zone.
  await expect(page.getByText("18:30 – 05:40")).toBeVisible();
  await expect(page.getByText("SIMULATED OBSERVATORY")).toBeVisible();

  // The sidebar lists booking too; this is the page's own action.
  const book = page.getByRole("main").getByRole("link", { name: "Book an observation" });
  await expect(book).toHaveAttribute("href", "/en/app/book");
  await expect(page.getByRole("link", { name: "Start Mission" })).toHaveCount(0);
});

test("reads fixed-position coordinates in the technical details", async ({ page }) => {
  await page.goto("/en/app/missions/albireo");

  await expect(page.getByText("19h 30m 43s / +27° 57′ 36″")).toBeHidden();
  await page.getByText("Advanced technical information").click();
  await expect(page.getByText("19h 30m 43s / +27° 57′ 36″")).toBeVisible();
});

test("answers an unknown target with the not-found page", async ({ page }) => {
  // Streamed behind the route's loading.tsx, so the status line is already 200 when
  // the platform's 404 arrives; the page is what tells the reader.
  await page.goto("/en/app/missions/no-such-target");
  await expect(
    page.getByRole("heading", { name: "Observation not found" }),
  ).toBeVisible();
});

test("keeps missions usable inside a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ka/app/missions");

  await expect(page.getByRole("heading", { name: "დღევანდელი ობიექტები" })).toBeVisible();
  await page.getByRole("link", { name: "ობიექტის ნახვა" }).first().click();
  await expect(page.getByRole("link", { name: "დაჯავშნე დაკვირვება" })).toBeVisible();

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
});

// ADR-037: /app/live is the caller's live or imminent mission's room, or booking.
test("/app/live opens the observer's live mission room", async ({ page }) => {
  await page.goto("/en/app/live");
  // Client-side: the shared loading state streams before the page can redirect.
  await expect(page).toHaveURL(
    "/en/app/missions/20000000-0000-4000-8000-000000000001/session",
    { timeout: 15_000 },
  );
  await expect(page.locator(".live-feed")).toBeVisible();
});

test.describe("with no live or imminent mission", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("/app/live goes to booking, in the caller's language", async ({ page }) => {
    await page.goto("/ka/sign-in");
    await page.locator('input[type="email"]').fill("watcher@darkview.test");
    await page.locator('input[type="password"]').fill("correct horse battery");
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/ka\/app$/);

    await page.goto("/ka/app/live");
    await expect(page).toHaveURL("/ka/app/book", { timeout: 15_000 });
  });
});

test("the /app dashboard reads the platform, section by section", async ({ page }) => {
  await page.goto("/en/app");

  await expect(
    page.getByRole("heading", { name: "Good evening, Observer" }),
  ).toBeVisible();
  // The highest observable target in the fake's fixed sky.
  await expect(
    page.getByRole("heading", { name: "Albireo is up tonight" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Observe Albireo" })).toHaveAttribute(
    "href",
    "/en/app/missions/albireo",
  );
  // Albireo has no drawn plate, so the recommendation shows no picture at all.
  await expect(page.locator(".home-illustration")).toHaveCount(0);

  const observatory = page.locator(".home-observatory");
  await expect(
    observatory.getByRole("heading", { name: "Stellar Tbilisi" }),
  ).toBeVisible();
  await expect(observatory.getByText("Simulated observatory")).toBeVisible();
  await expect(
    observatory.getByText("Celestron NexStar 6SE · 150 mm · 1500 mm"),
  ).toBeVisible();

  const upcoming = page.locator(".home-upcoming");
  await expect(upcoming.getByRole("heading", { name: "Saturn" })).toBeVisible();
  await expect(upcoming.getByText("15 January 2030")).toBeVisible();
  await expect(upcoming.getByText("Simulated")).toBeVisible();

  await expect(page.getByRole("heading", { name: "Also up tonight" })).toBeVisible();
  await expect(page.locator(".home-recent-captures a")).toHaveCount(2);
  await expect(page.locator(".home-capture-simulated")).toHaveCount(2);

  // Nothing the platform cannot back.
  await expect(page.getByRole("heading", { name: "Live now" })).toBeHidden();
  await expect(page.getByText("41.72")).toBeHidden();
  await expect(page.getByText(/excellent/i)).toBeHidden();
});

test("keeps the Georgian authenticated home within a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ka/app");

  await expect(
    page.getByRole("heading", { name: "საღამო მშვიდობისა, Observer" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "ალბირეო დღეს ღამით ჩანს" }),
  ).toBeVisible();

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
});

test("the observatory's first screen carries status, tonight, the instrument and both actions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/observatory");

  await expect(
    page.getByRole("heading", { level: 1, name: "Stellar Tbilisi" }),
  ).toBeVisible();

  const status = page.locator(".observatory-live");
  await expect(status.getByText("SIMULATED OBSERVATORY")).toBeVisible();
  await expect(status.getByText("Online", { exact: true })).toBeVisible();
  await expect(status.getByText("Clear", { exact: true })).toBeVisible();

  const tonight = page.locator(".observatory-tonight");
  await expect(tonight.getByRole("link", { name: /Albireo/ })).toHaveAttribute(
    "href",
    "/en/app/missions/albireo",
  );

  const instrument = page.locator(".observatory-instrument");
  await expect(instrument.getByText("Celestron NexStar 6SE")).toBeVisible();
  await expect(instrument.getByText("ZWO ASI585MC")).toBeVisible();

  const primary = page.getByRole("link", { name: "See tonight's targets" });
  const live = page.getByRole("link", { name: "Open the live view" });
  await expect(primary).toHaveAttribute("href", "/en/app/missions");
  await expect(live).toHaveAttribute("href", "/en/app/live");

  // All of it before any scrolling.
  for (const locator of [status, tonight, instrument, primary, live]) {
    const box = await locator.boundingBox();
    expect(box && box.y + box.height).toBeLessThanOrEqual(900);
  }

  // Claims the platform does not back are gone.
  await expect(page.getByText(/41\.72/)).toHaveCount(0);
  await expect(page.getByText(/\b(cooled|cooling)\b/i)).toHaveCount(0);
  await expect(page.getByText("Demonstration status")).toHaveCount(0);
  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  expect(jsonLd.join("")).not.toContain("GeoCoordinates");

  await expect(
    page.getByRole("heading", { name: "Nothing moves until it is allowed to." }),
  ).toBeVisible();
  await expect(
    page.getByText("Illustration — not telescope output", { exact: true }),
  ).toBeVisible();
});

test("/network is folded into the observatory page", async ({ page }) => {
  const response = await page.request.get("/en/network", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toMatch(/\/en\/observatory#network$/);

  await page.goto("/ka/network");
  await expect(page).toHaveURL(/\/ka\/observatory#network$/);
  await expect(page.locator("#network")).toContainText("დღეს — ერთი ადგილი.");
});
test("preserves observatory locale and mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ka/observatory");

  await expect(
    page.getByRole("heading", {
      level: 1,
      // The platform's name for the observatory (BookableObservatory.nameKa).
      name: "სტელარი თბილისი",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "ნავიგაციის გახსნა" }).click();
  await expect(page.getByRole("link", { name: "ენა: English" })).toHaveAttribute(
    "href",
    "/en/observatory",
  );

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
});

test("shows what exists today, without invented prices or concept tiers", async ({
  page,
}) => {
  await page.goto("/en/pricing");

  await expect(
    page.getByRole("heading", { level: 1, name: "What it costs today." }),
  ).toBeVisible();
  for (const offering of ["Watch", "An observation slot"]) {
    await expect(page.getByRole("heading", { name: offering })).toBeVisible();
  }
  await expect(page.getByText("Free", { exact: true })).toBeVisible();
  await expect(page.getByText("Priced per slot", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Book an observation" })).toHaveAttribute(
    "href",
    "/en/app/book",
  );

  // Provisional once, and the future in one note.
  await expect(page.getByText(/provisional/i)).toHaveCount(1);
  await expect(
    page.getByText(/Subscriptions, observation passes and private sessions/),
  ).toBeVisible();

  // The internal configuration is not the public's business.
  await expect(
    page.getByText(/2026-08-draft|Configuration version|concept/i),
  ).toHaveCount(0);
  await expect(page.getByText(/\d+(\.\d+)?\s?(GEL|₾)/)).toHaveCount(0);
});

test("keeps localized pricing inside the mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ka/pricing");

  await expect(
    page.getByRole("heading", { level: 1, name: "რა ღირს დღეს." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "ნავიგაციის გახსნა" }).click();
  await expect(page.getByRole("link", { name: "ენა: English" })).toHaveAttribute(
    "href",
    "/en/pricing",
  );

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
});
