import { expect, test } from "@playwright/test";

import { brand } from "../src/brand";
import { appSidebar, bottomNavigation, liveViewport } from "./selectors";

test("communicates real telescope access in the English hero", async ({ page }) => {
  await page.goto("/en");

  await expect(page.getByRole("heading", { level: 1, name: "EARTH" })).toBeVisible();
  await expect(page.getByText("PLANET", { exact: true })).toBeVisible();
  await expect(page.getByText(/A real telescope in Tbilisi, Georgia/)).toBeVisible();
  await expect(page.getByLabel(brand.en.siteName).first()).toBeVisible();
  await expect(
    page.locator(".planet-hero").getByRole("link", { name: "RESERVE A SLOT" }),
  ).toHaveAttribute("href", "/en/app/book");
  // The clips are renders; the hero says so (CLAUDE.md, ADR-029 §4).
  await expect(
    page.getByText("Illustration — not telescope output").first(),
  ).toBeVisible();
});

test("features a side planet on press, and comes back round", async ({ page }) => {
  await page.goto("/en");

  const title = page.getByRole("heading", { level: 1 });
  const active = page.locator(".planet-hero .sky video.is-active");
  await expect(active).toHaveAttribute("data-planet", "earth");

  await page.getByRole("button", { name: "Show VENUS" }).click();
  await expect(title).toHaveText("VENUS");
  await expect(active).toHaveAttribute("data-planet", "venus");
  await expect(page.getByText(/The brightest planet in our sky/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Show EARTH" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Show MARS" })).toBeVisible();

  await page.getByRole("button", { name: "Show MARS" }).click();
  await expect(title).toHaveText("MARS");
  await page.getByRole("button", { name: "Show EARTH" }).click();
  await expect(title).toHaveText("EARTH");
  await expect(active).toHaveAttribute("data-planet", "earth");
  await expect(page.locator(".planet-l img.is-shown")).toHaveAttribute(
    "data-planet",
    "venus",
  );
  await expect(page.locator(".planet-r img.is-shown")).toHaveAttribute(
    "data-planet",
    "mars",
  );
});

test("renders Georgian content and switches locale", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/ka");

  await expect(page.getByRole("heading", { level: 1, name: "დედამიწა" })).toBeVisible();
  await expect(page.getByRole("button", { name: "აჩვენე: ვენერა" })).toBeVisible();
  await page.getByRole("link", { name: "ენა: English" }).click();
  await expect(page).toHaveURL(/\/en$/);
});

test("renders the complete data-driven public homepage", async ({ page }) => {
  await page.goto("/en");

  // ADR-030: five sections, the hero first.
  for (const heading of [
    "Three steps. One real observation.",
    "Choose what the telescope sees next.",
    "One real telescope, in Tbilisi.",
    "Your next observation starts here.",
  ]) {
    await expect(page.getByRole("heading", { level: 2, name: heading })).toBeVisible();
  }
  for (const gone of [
    "A real observatory, in motion.",
    "A visual record of where you looked.",
    "One active node. Built to grow carefully.",
  ]) {
    await expect(page.getByRole("heading", { name: gone })).toHaveCount(0);
  }

  // Tonight's list comes from GET /targets/tonight on the fake platform.
  // Scoped: the hero names planets too.
  const tonight = page.locator("#tonight");
  for (const target of ["Saturn", "Albireo", "Moon", "Hercules Cluster", "Venus"]) {
    await expect(
      tonight.getByRole("heading", { name: target, exact: true }),
    ).toBeVisible();
  }
  await expect(page.getByText("SIMULATED OBSERVATORY").first()).toBeVisible();

  for (const step of ["Choose", "Observe", "Keep"]) {
    await expect(page.getByRole("heading", { name: step, exact: true })).toBeVisible();
  }

  // The instrument is the platform's telescope, not a fixture.
  const instrument = page.locator("#live");
  await expect(instrument.getByText("150", { exact: true })).toBeVisible();
  await expect(instrument.getByText("1500", { exact: true })).toBeVisible();
  await expect(instrument.getByText("f/10", { exact: true })).toBeVisible();
  await expect(instrument.getByText("ZWO ASI585MC")).toBeVisible();
  await expect(instrument.getByText("Online", { exact: true })).toBeVisible();

  await expect(page.getByText("30 min", { exact: true })).toBeVisible();
  await expect(page.getByText("120 min", { exact: true })).toBeVisible();
  await expect(
    page.locator("#final-cta").getByRole("link", { name: "Reserve a slot" }),
  ).toHaveAttribute("href", "/en/app/book");
});

test("filters and steps through tonight's rail", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en");

  const tonight = page.locator("#tonight");
  const cards = tonight.locator(".target-card");
  await expect(cards).toHaveCount(5);

  const previous = tonight.getByRole("button", { name: "Previous targets" });
  const next = tonight.getByRole("button", { name: "Next targets" });
  await expect(previous).toBeDisabled();
  await next.click();
  await expect(previous).toBeEnabled();

  await tonight.getByRole("button", { name: "Moon" }).click();
  await expect(cards).toHaveCount(1);
  await expect(tonight.getByRole("heading", { name: "Moon", exact: true })).toBeVisible();
  await tonight.getByRole("button", { name: "All" }).click();
  await expect(cards).toHaveCount(5);
});

test("keeps the public homepage within a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
  await expect(
    page.locator(".planet-hero").getByRole("link", { name: "RESERVE A SLOT" }),
  ).toBeVisible();
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

test("operates the live capture instrument without mount controls", async ({ page }) => {
  await page.goto("/en/app/live");

  await expect(page.getByText(`${brand.en.name.toUpperCase()} LIVE`)).toBeVisible();
  await expect(liveViewport(page).getByText("Tbilisi Observatory")).toBeVisible();
  await expect(page.getByText("Observer · Public mission")).toBeVisible();
  await expect(page.getByRole("button", { name: "Enter fullscreen" })).toBeVisible();

  const brightPreset = page
    .getByRole("group", { name: "Image processing preset" })
    .getByRole("button", { name: /Bright/ });
  await brightPreset.click();
  await expect(brightPreset).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: /Capture/ }).click();
  await expect(page.getByText("Collecting light").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Capture/ })).toBeDisabled();

  await expect(page.getByText("Safe Nudge")).toHaveCount(0);
  await expect(page.getByText(/mount/i)).toHaveCount(0);
});

test("prioritizes the live viewport on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ka/app/live");

  const viewport = liveViewport(page);
  await expect(viewport).toBeVisible();
  await expect(page.getByText(`${brand.en.name.toUpperCase()} LIVE`)).toBeVisible();
  expect((await viewport.boundingBox())?.height).toBeGreaterThanOrEqual(540);

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
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
  await expect(page.locator(".home-illustration figcaption")).toHaveText("Illustration");

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
  await expect(page.getByText(/cooled|cooling/i)).toHaveCount(0);
  await expect(page.getByText("Demonstration status")).toHaveCount(0);
  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  expect(jsonLd.join("")).not.toContain("GeoCoordinates");

  await expect(
    page.getByRole("heading", { name: "Safety comes before movement" }),
  ).toBeVisible();
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

test("shows configured offerings without invented prices or checkout", async ({
  page,
}) => {
  await page.goto("/en/pricing");

  await expect(
    page.getByRole("heading", { name: "Choose how deeply you look." }),
  ).toBeVisible();
  for (const offering of ["Observer", "Explorer", "Advanced", "Private Observatory"]) {
    await expect(page.getByRole("heading", { name: offering })).toBeVisible();
  }

  await expect(page.getByText("Free", { exact: true })).toBeVisible();
  await expect(page.getByText("Price to be confirmed").first()).toBeVisible();
  await expect(page.getByText("Future · feature disabled")).toBeVisible();
  await expect(page.getByText("Payments and checkout are not enabled.")).toBeVisible();
  await expect(page.getByRole("button", { name: /checkout|subscribe|buy/i })).toHaveCount(
    0,
  );

  for (const duration of ["30", "60", "120"]) {
    await expect(page.getByText(duration, { exact: true })).toBeVisible();
  }
});

test("keeps localized pricing inside the mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ka/pricing");

  await expect(
    page.getByRole("heading", { name: "აირჩიეთ, რამდენად ღრმად გაიხედავთ." }),
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
