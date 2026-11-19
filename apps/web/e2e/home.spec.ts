import { expect, test } from "@playwright/test";

import { brand } from "../src/brand";
import { openAccountMenu } from "./selectors";

test("communicates real telescope access in the English hero", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en");

  const hero = page.locator(".home-hero");
  await expect(
    page.getByRole("heading", { level: 1, name: "The real sky, live." }),
  ).toBeVisible();
  // ADR-052 §7: the last words in red, as the Skychaser headline sets its own.
  await expect(hero.locator("h1 .hs-accent")).toHaveText("live.");
  await expect(
    hero.getByText("Book a real telescope and watch the night sky live."),
  ).toBeVisible();
  await expect(page.getByLabel(brand.en.siteName).first()).toBeVisible();
  const actions = hero.locator(".home-hero-actions");
  await expect(actions.getByRole("link", { name: "Book a session" })).toHaveAttribute(
    "href",
    "/en/app/book",
  );
  await expect(actions.getByRole("link", { name: "Watch live" })).toHaveAttribute(
    "href",
    "/en/tonight",
  );
  // ADR-076/077: no telescope model and no status chips in the hero; ADR-094: no canvas.
  await expect(hero.locator(".observatory-dome")).toHaveCount(0);
  await expect(hero.getByText("Online", { exact: true })).toHaveCount(0);
  await expect(page.locator("main canvas")).toHaveCount(0);
  // The four steps are headings a reader can reach, right under the hero.
  for (const name of [
    "Pick your time.",
    "It turns to your target.",
    "Watch it settle.",
    "Keep the picture.",
  ]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
  }
});

test("renders the Georgian hero and switches locale", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/ka");

  await expect(
    page.getByRole("heading", { level: 1, name: "შენი დრო ნამდვილ ცასთან." }),
  ).toBeVisible();
  await expect(
    page.locator(".home-hero-actions").getByRole("link", { name: "დაჯავშნე სეანსი" }),
  ).toHaveAttribute("href", "/ka/app/book");
  // Mkhedruli has no capitals: the headline and the labels are never uppercased.
  await expect(page.locator("h1.home-hero-title")).toHaveCSS("text-transform", "none");
  await expect(page.locator(".hm-label").first()).toHaveCSS("text-transform", "none");
  await page.getByRole("link", { name: "ენა: English" }).click();
  await expect(page).toHaveURL(/\/en$/);
});

test("the public homepage: five plain sections, with the platform's prices", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en");

  // ADR-094: the hero, how it works, tonight, the session, the telescope, the sign-off.
  await expect(page.locator("main section")).toHaveCount(6);
  await expect(page.getByText(/Celestron/)).toHaveCount(0);

  // Tonight's objects: each with its best time and a way to book, and a drawing says so.
  const objects = page.locator(".hm-object");
  expect(await objects.count()).toBeGreaterThan(0);
  await expect(objects.first().getByRole("link")).toHaveAttribute(
    "href",
    /^\/en\/app\/book/,
  );
  await expect(objects.first().locator(".hm-data").first()).toHaveText(/^\d\d:\d\d$/);
  await expect(
    page.locator(".hm-tonight").getByText("Illustration — not telescope output").last(),
  ).toBeVisible();

  // The session: the fake platform's price by the minute and each length's price.
  const session = page.locator(".hm-session");
  await expect(session.getByText("GEL 1.50 a minute")).toBeVisible();
  await expect(session.locator(".hm-lengths")).toContainText("GEL 45.00");
  await expect(session.locator(".hm-lengths")).toContainText("GEL 90.00");
  const questions = session.locator("details");
  await expect(questions).toHaveCount(4);
  await questions.nth(2).locator("summary").click();
  await expect(questions.nth(2)).toHaveAttribute("open", "");

  // The telescope: the observatory record's aperture, never the maker's name.
  await expect(page.locator(".hm-scope")).toContainText("203 mm");
  await expect(
    page.locator(".hm-scope").getByRole("link", { name: "See the observatory" }),
  ).toHaveAttribute("href", "/en/observatory");

  // The other ways in live in the footer, not in cards on the page.
  const footer = page.getByRole("navigation", { name: "Product" });
  for (const [name, href] of [
    ["Gift a night", "/en/gift"],
    ["Weekly vote", "/en/vote"],
    ["Weekly cards", "/en/app/cards"],
  ]) {
    await expect(footer.getByRole("link", { name })).toHaveAttribute("href", href);
  }
});

test("the homepage is short and loads no animation library", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const scripts: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "script") scripts.push(request.url());
  });
  await page.goto("/en");
  // ADR-094: a page a reader scrolls in a few flicks, not a pinned story.
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  expect(height).toBeLessThan(6000);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  expect(scripts.filter((url) => /gsap|lenis/i.test(url))).toEqual([]);
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
      await expect(page.locator(".home-hero .button-primary").first()).toBeVisible();
      // A phone swipes tonight's objects sideways.
      await expect(page.locator(".hm-objects")).toHaveCSS("overflow-x", "auto");
    }
  }
});

test("provides the complete public navigation on desktop and mobile", async ({
  page,
}) => {
  // A visitor without a session: the profile button opens sign in and registration
  // (ADR-057); signed in, it holds the customer's own pages.
  await page.context().clearCookies();
  await page.goto("/en");

  const header = page.getByRole("banner");
  const publicNavigation = header.getByRole("navigation", {
    name: "Public navigation",
  });

  for (const [item, href] of [
    ["Observatory", "/en/observatory"],
    ["Book", "/en/app/book"],
    ["Night Sky", "/en/sky"],
    ["Stellar Explorer", "/en/explorer"],
  ]) {
    await expect(
      publicNavigation.getByRole("link", { name: item, exact: true }),
    ).toHaveAttribute("href", href);
  }
  await expect(publicNavigation.getByRole("link")).toHaveCount(4);

  // The bar's right side is the language and the profile button, nothing else.
  await expect(header.getByRole("link", { name: "Reserve a slot" })).toHaveCount(0);
  const guest = await openAccountMenu(page);
  for (const [item, href] of [
    ["Sign in", "/en/sign-in"],
    ["Create an account", "/en/register"],
    ["Reserve a slot", "/en/app/book"],
  ]) {
    await expect(guest.getByRole("link", { name: item, exact: true })).toHaveAttribute(
      "href",
      href,
    );
  }
  await page.keyboard.press("Escape");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.getByRole("button", { name: "Open navigation" }).click();

  await expect(
    header.getByRole("navigation", { name: "Public navigation" }),
  ).toBeVisible();
  await expect(header.getByRole("link", { name: "Sign in" })).toBeVisible();
});

test("keeps the one site header on the signed-in pages", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/app/book");

  const header = page.getByRole("banner");
  const publicNavigation = header.getByRole("navigation", { name: "Public navigation" });
  await expect(header.getByLabel(brand.en.siteName)).toBeVisible();
  await expect(publicNavigation.getByRole("link")).toHaveCount(4);
  await expect(publicNavigation.getByRole("link", { name: "Book" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(header.getByRole("link", { name: "Sign in" })).toHaveCount(0);

  const menu = await openAccountMenu(page);
  for (const [item, href] of [
    ["Overview", "/en/app"],
    ["Live", "/en/app/live"],
    ["Collection", "/en/app/collection"],
    ["Profile", "/en/app/profile"],
  ]) {
    await expect(menu.getByRole("link", { name: item, exact: true })).toHaveAttribute(
      "href",
      href,
    );
  }
  await expect(menu.getByRole("button", { name: "Sign out" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();

  // The pages not built yet, under their own name above the footer.
  await expect(
    page
      .getByRole("navigation", { name: "Not yet available" })
      .getByRole("link", { name: "Subscription" }),
  ).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.getByRole("button", { name: "Open navigation" }).click();
  const phoneAccount = header.locator("#public-mobile-menu").getByRole("navigation", {
    name: "Account",
  });
  await expect(phoneAccount.getByRole("link", { name: "Live" })).toBeVisible();
  await Promise.all([
    page.waitForURL(/\/en\/app\/collection$/),
    phoneAccount.getByRole("link", { name: "Collection" }).click(),
  ]);

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
  await expect(page.getByRole("tabpanel", { name: "Visibility" })).toContainText(
    "Altitude",
  );
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
  await expect(page.getByText("SIMULATED OBSERVATORY")).toHaveCount(0);

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

  await expect(page.getByRole("heading", { name: "ამაღამის ობიექტები" })).toBeVisible();
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

  test("/app/live shows the next night and the way to book, in the caller's language", async ({
    page,
  }) => {
    await page.goto("/ka/sign-in");
    await page.locator('input[type="email"]').fill("watcher@darkview.test");
    await page.locator('input[type="password"]').fill("correct horse battery");
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/ka\/app$/);

    await page.goto("/ka/app/live");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "ახლა პირდაპირი დაკვირვება არ მიმდინარეობს.",
      }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("link", { name: "ღამის დაჯავშნა" })).toHaveAttribute(
      "href",
      "/ka/app/book",
    );
  });
});

test("the /app dashboard reads the platform, section by section", async ({ page }) => {
  await page.goto("/en/app");

  await expect(
    page.getByRole("heading", { name: "Welcome back, Observer." }),
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
  await expect(observatory.getByText("203 mm · 2032 mm")).toBeVisible();

  const upcoming = page.locator(".home-upcoming");
  await expect(upcoming.getByRole("heading", { name: "Saturn" })).toBeVisible();
  await expect(upcoming.getByText("15 January 2030")).toBeVisible();
  await expect(upcoming.getByText("Simulated")).toHaveCount(0);

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

  await expect(page.getByRole("heading", { name: "გამარჯობა, Observer!" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "ალბირეო ამაღამ ჩანს" })).toBeVisible();

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
});

test("the observatory console stands by on the sky model, badged simulated, with the platform's name and forecast", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/observatory");

  // The site header, as on every page (ADR-057); the console's own bar holds the clocks
  // and the badge.
  await expect(page.getByRole("banner")).toHaveCount(1);
  await expect(
    page.getByRole("banner").getByRole("link", { name: "Observatory", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".oh-head .oh-badge")).toHaveText(/Simulated/);

  // The one station is the platform's observatory; its forecast is the platform's.
  await expect(page.locator(".oh-head .oh-bt b")).toHaveText("Stellar Tbilisi");
  // ADR-053 §6 as amended: no stations the product has no plan behind.
  await expect(page.getByText("Coming soon")).toHaveCount(0);
  await expect(page.locator(".oh")).not.toHaveAttribute("aria-busy", "true");
  // The hub's steps: Setup is under More, the Autopilot under Point.
  await page.locator(".oh-stepnav").getByRole("button", { name: "More" }).click();
  await page.getByRole("tab", { name: "Setup" }).click();
  await expect(page.getByRole("tabpanel").getByText("12%")).toBeVisible();
  await page.locator(".oh-stepnav").getByRole("button", { name: /Point/ }).click();

  // The Autopilot starts on tonight's highest observable target from the catalogue.
  const autopilot = page.getByRole("region", { name: "Autopilot" });
  await expect(autopilot.locator(".oh-big")).toHaveText("Albireo");
  await expect(autopilot.getByRole("button", { name: /OBSERVE/ })).toBeEnabled();

  // Nothing is drawn as the telescope's output: standby, captioned, no step under way.
  const view = page.getByRole("region", { name: "Telescope view" });
  await expect(view.getByText("Illustration — not telescope output")).toBeVisible();
  await expect(view.getByRole("status")).toHaveText("Standby");
  await expect(autopilot.locator(".oh-pipe [aria-current=step]")).toHaveCount(0);

  // Claims the platform does not back are gone.
  await expect(page.getByText(/41\.72/)).toHaveCount(0);
  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  expect(jsonLd.join("")).not.toContain("GeoCoordinates");
});

test("the console connects, aligns and points at the quick start's target", async ({
  page,
}) => {
  // The chain runs on the model's own clock (ADR-054): two seconds to connect, the
  // alignment slew and its solve, then the GoTo at the mount's pace. `?turbo` runs the
  // slews eight times faster so the chain fits a test; the model is otherwise its own.
  test.setTimeout(120_000);
  // The model's sky is the browser's clock: an evening when Albireo is up.
  await page.clock.install({ time: new Date("2026-09-25T20:00:00+04:00") });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/observatory?turbo");
  await page.getByRole("button", { name: /OBSERVE/ }).click();

  // Align and point run as one chain; the feed is the sky model's.
  await expect(page.locator(".oh-pipe [aria-current=step]")).toContainText("Align", {
    timeout: 15_000,
  });
  const view = page.getByRole("region", { name: "Telescope view" });
  await expect(
    view.getByRole("img", { name: "Simulated telescope camera view" }),
  ).toBeVisible({
    timeout: 20_000,
  });
  await expect(view.getByText(/Simulated feed/)).toBeVisible();
  await expect(view.getByRole("status")).toHaveText(/On target · tracking/, {
    timeout: 60_000,
  });
  await expect(view.getByText(/^Albireo/)).toBeVisible();
  await page.locator(".oh-stepnav").getByRole("button", { name: /Shoot/ }).click();
  await expect(
    page.getByRole("button", { name: /^Capture \d+ × \d+ m?s/ }),
  ).toBeEnabled();

  // Park drives the mount home.
  await page.locator(".oh-head").getByRole("button", { name: "Park" }).click();
  await expect(view.getByRole("status")).toHaveText(/Parking|Parked/);
});

test("/network is folded into the observatory page", async ({ page }) => {
  const response = await page.request.get("/en/network", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toMatch(/\/en\/observatory#network$/);

  await page.goto("/ka/network");
  await expect(page).toHaveURL(/\/ka\/observatory#network$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("ობსერვატორია");
});
test("preserves observatory locale and mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ka/observatory");

  // The sr-only h1 carries the platform's name for the observatory (nameKa).
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /ობსერვატორია — სტელარი თბილისი/,
  );
  // The site header on the phone too; the console's bar keeps the station and the badge.
  await expect(page.getByRole("banner")).toHaveCount(1);
  await expect(page.locator(".oh-head .oh-bt b")).toHaveText("სტელარი თბილისი");
  await expect(page.locator(".oh-head .oh-badge")).toHaveText("სიმულირებული");

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
});

test("shows what exists today, priced by the platform, without concept tiers", async ({
  page,
}) => {
  await page.goto("/en/pricing");

  await expect(page.getByRole("heading", { level: 1, name: "Pricing" })).toBeVisible();
  for (const offering of ["Browse", "Watch a live session", "Your own slot"]) {
    await expect(page.getByRole("heading", { name: offering })).toBeVisible();
  }
  await expect(page.getByText("Free", { exact: true })).toBeVisible();
  // The slot price is the fake platform's GET /slots figure, not one written on the page.
  await expect(page.getByText("GEL 45.00").first()).toBeVisible();
  await expect(page.getByText("for 30 minutes", { exact: true })).toBeVisible();
  await expect(page.getByText("Price on the link", { exact: true })).toBeVisible();
  // The club comes from GET /loyalty/scheme.
  await expect(
    page.getByRole("heading", { name: /Observe more, pay less/ }),
  ).toBeVisible();
  await expect(page.getByText("10%", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /^Book a (slot|session)$/ }).first(),
  ).toHaveAttribute("href", "/en/app/book");

  // Provisional once, and the future in one note.
  await expect(page.getByText(/Prices may change before launch/)).toHaveCount(1);
  await expect(
    page.getByText(/Subscriptions, passes and private sessions/),
  ).toBeVisible();

  // The internal configuration is not the public's business.
  await expect(
    page.getByText(/2026-08-draft|Configuration version|concept/i),
  ).toHaveCount(0);
});

test("keeps localized pricing inside the mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ka/pricing");

  await expect(page.getByRole("heading", { level: 1, name: "ფასები" })).toBeVisible();
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
