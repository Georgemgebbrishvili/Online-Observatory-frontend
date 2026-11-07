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

test("the Night Sky reads in Georgian", async ({ page }) => {
  await page.goto("/ka/sky");
  await expect(page.locator("canvas.sky-canvas")).toBeAttached({ timeout: firstCompile });
  await expect(page.getByText("გამოთვლილი ცა და არა ტელესკოპის გამოსახულება")).toBeVisible();
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
