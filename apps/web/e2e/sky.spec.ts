import { expect, test } from "@playwright/test";

// ADR-085: the Night Sky. A smoke test: the page draws (or keeps its list without WebGL),
// the time bar moves time, and search flies to an object and opens its panel, whose
// "Observe it with Stellar" links to the booking board with the object chosen.

const firstCompile = 90_000;

test.use({ storageState: { cookies: [], origins: [] } });

test("the Night Sky draws, its time bar moves time, and search finds Saturn", async ({ page }) => {
  await page.goto("/en/sky");
  await expect(page.locator("canvas.sky-canvas")).toBeAttached({ timeout: firstCompile });
  await expect(page.getByText("Computed sky, not a telescope view")).toBeVisible();

  const timeBar = page.getByRole("group", { name: "Time" });
  await expect(timeBar).toBeVisible();
  const clock = timeBar.locator(".sky-clock b").first();
  const before = await clock.textContent();
  await timeBar.getByRole("button", { name: "One hour later" }).click();
  await expect(clock).not.toHaveText(before ?? "");
  await timeBar.getByRole("button", { name: "Now" }).click();
  await timeBar.getByRole("radio", { name: "×600" }).click();
  await expect(timeBar.getByRole("radio", { name: "×600" })).toHaveAttribute("aria-checked", "true");

  const search = page.getByRole("combobox", { name: "Find in the sky" });
  await search.fill("satu");
  await page.getByRole("option").getByRole("button", { name: "Saturn" }).click();
  const panel = page.getByRole("complementary", { name: "Saturn" });
  await expect(panel).toBeVisible();
  await expect(panel).toContainText("Planet");
  await expect(panel).toContainText("Right ascension");
  await expect(panel).toContainText("Illustration — not telescope output");
  await expect(panel.getByRole("link", { name: "Observe it with Stellar" })).toHaveAttribute(
    "href",
    "/en/app/book?target=saturn",
  );

  // A constellation, by its Georgian or English name.
  await search.fill("Orion");
  await search.press("Enter");
  await expect(page.getByRole("complementary", { name: "Orion" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Orion" })).toContainText("Constellation");
});

test("the Night Sky says what is up, and looks closer at what is picked", async ({ page }) => {
  // Polaris never sets from Tbilisi (41.7° N), so this holds at any hour the suite runs.
  await page.goto("/en/sky");
  await expect(page.locator("canvas.sky-canvas")).toBeAttached({ timeout: firstCompile });
  const search = page.getByRole("combobox", { name: "Find in the sky" });
  await search.fill("Polaris");
  await expect(page.getByRole("option").first()).toContainText(/Up \d+°/);
  await search.press("Enter");
  const panel = page.getByRole("complementary", { name: "Polaris" });
  await expect(panel).toContainText(/Above the horizon · \d+° up, N/);
  await expect(panel).toContainText("never sets here");

  // A closer look narrows the view onto it, and the time bar then names what is drawn.
  const timeBar = page.getByRole("group", { name: "Time" });
  await expect(timeBar).toContainText("Computed sky, not a telescope view");
  await panel.getByRole("button", { name: "Look closer" }).click();
  await expect(page.locator(".sky")).toHaveAttribute("data-close", "true", { timeout: 10_000 });
  await expect(timeBar).toContainText("Illustration — not telescope output");
  await panel.getByRole("button", { name: "Whole sky" }).click();
  await expect(page.locator(".sky")).toHaveAttribute("data-close", "false", { timeout: 10_000 });

  // The list: what is up, by height, and what is below with its next rise; each one a way there.
  await page.getByText("What is up, as a list").click();
  const list = page.locator(".sky-list");
  await expect(list.getByRole("heading", { name: /Up now|Below the horizon/ }).first()).toBeVisible();
  await expect(list.locator(".sky-roster button").first()).toBeVisible();
  const first = list.locator(".sky-roster button").first();
  const name = (await first.locator(".sky-status").textContent())!;
  await first.click();
  await expect(page.getByRole("complementary", { name })).toBeVisible();
});

test("on a phone a closer look folds the panel so the object shows", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/sky");
  await expect(page.locator("canvas.sky-canvas")).toBeAttached({ timeout: firstCompile });
  const search = page.getByRole("combobox", { name: "Find in the sky" });
  await search.fill("Polaris");
  await search.press("Enter");
  const panel = page.getByRole("complementary", { name: "Polaris" });
  await expect(panel.locator("dl")).toBeVisible();
  await panel.getByRole("button", { name: "Look closer" }).click();
  await expect(panel).toHaveAttribute("data-folded", "true");
  await expect(panel.locator("dl")).toBeHidden();
  const details = panel.getByRole("button", { name: "Details" });
  await expect(details).toHaveAttribute("aria-expanded", "false");
  await details.click();
  await expect(panel.locator("dl")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
});

test("the Night Sky reads in Georgian", async ({ page }) => {
  await page.goto("/ka/sky");
  await expect(page.locator("canvas.sky-canvas")).toBeAttached({ timeout: firstCompile });
  await expect(page.getByText("გამოთვლილი ცა, არა ტელესკოპის ხედი")).toBeVisible();
  await expect(page.getByRole("group", { name: "დრო" })).toBeVisible();
  const search = page.getByRole("combobox", { name: "იპოვე ცაზე" });
  await search.fill("ვეგა");
  await search.press("Enter");
  await expect(page.getByRole("complementary", { name: "ვეგა" })).toContainText("ვარსკვლავი");
});

test("the header and /tonight lead to the Night Sky", async ({ page }) => {
  await page.goto("/en/tonight");
  await expect(page.getByRole("link", { name: "See the whole sky now" })).toHaveAttribute("href", "/en/sky", {
    timeout: firstCompile,
  });
  await expect(
    page.getByRole("banner").getByRole("navigation", { name: "Public navigation" }).getByRole("link", { name: "Night Sky" }),
  ).toHaveAttribute("href", "/en/sky");
});

test("on a phone the tab bar leads to the Night Sky, and lights it there", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/en/observatory");
  const sky = page.locator("nav.phone-tab-bar").getByRole("link", { name: "Night Sky" });
  await expect(sky).toBeVisible({ timeout: firstCompile });
  await expect(sky).toHaveAttribute("href", "/en/sky");
  await sky.click();
  await expect(page).toHaveURL(/\/en\/sky$/);
  await expect(page.locator("canvas.sky-canvas")).toBeAttached({ timeout: firstCompile });
  await expect(page.locator("nav.phone-tab-bar").getByRole("link", { name: "Night Sky" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  // Four tabs on a 360 px phone: every label shows whole -- none cut to an ellipsis --
  // and none spills off the bar.
  for (const label of await page.locator("nav.phone-tab-bar .phone-tab-label").all()) {
    const box = await label.boundingBox();
    expect(box && box.x >= 0 && box.x + box.width <= 360).toBe(true);
    expect(await label.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  }
});

test.describe("a visitor outside Tbilisi", () => {
  // The server renders in its own zone (UTC on Vercel, Tbilisi on a dev machine); a
  // browser elsewhere must hydrate the page without a mismatch. Production threw React
  // error #418 on every load from the "your time" clock line (2026-11-08).
  test.use({ timezoneId: "America/New_York" });

  test("hydrates the Night Sky without a mismatch, then shows their own clock", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto("/en/sky");
    await expect(page.locator("canvas.sky-canvas")).toBeAttached({ timeout: firstCompile });
    await expect(page.getByRole("group", { name: "Time" })).toContainText("Your time");
    expect(errors.filter((error) => /hydrat|#418|did not match/i.test(error))).toEqual([]);
  });
});
