import { expect, test } from "@playwright/test";

// Phase 3 slice 1, against e2e/fake-platform.mjs: nine 30-minute slots from 18:00
// Tbilisi every night, the second booked.

test("/app/book lists a night's slots from the platform, each open one a way to reserve it", async ({
  page,
}) => {
  await page.goto("/en/app/book");

  await expect(
    page.getByRole("heading", { level: 1, name: "Time on the telescope." }),
  ).toBeVisible();
  await expect(page.getByText("SIMULATED OBSERVATORY")).toBeVisible();

  const nights = page
    .getByRole("navigation", { name: "Choose a night" })
    .getByRole("link");
  await expect(nights).toHaveCount(7);
  await expect(nights.first()).toHaveAttribute("aria-current", "date");

  const slots = page.locator(".slot-row");
  await expect(slots).toHaveCount(9);
  await expect(slots.first()).toContainText("18:00");
  await expect(slots.first()).toContainText("18:30");
  await expect(slots.first()).toContainText("GMT+4");
  await expect(slots.first()).toContainText("30 min");
  await expect(slots.first()).toContainText("GEL");
  await expect(
    slots.first().getByRole("link", { name: "Choose 18:00–18:30" }),
  ).toHaveAttribute("href", /\/en\/app\/book\/reserve\?startAt=.+T14%3A00%3A00\.000Z$/);
  await expect(slots.nth(1)).toContainText("Booked");
  await expect(slots.nth(1).getByRole("link")).toHaveCount(0);

  // Another night is a link to the same page for that date.
  const third = nights.nth(2);
  const href = await third.getAttribute("href");
  await third.click();
  await expect(page).toHaveURL(new RegExp(`${href?.replace("?", "\\?")}$`));
  await expect(
    page.getByRole("navigation", { name: "Choose a night" }).getByRole("link").nth(2),
  ).toHaveAttribute("aria-current", "date");
});

test("a date outside the seven nights shows tonight instead", async ({ page }) => {
  await page.goto("/en/app/book?date=2020-01-01");
  const nights = page
    .getByRole("navigation", { name: "Choose a night" })
    .getByRole("link");
  await expect(nights.first()).toHaveAttribute("aria-current", "date");
});

test("the Georgian booking page fits a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ka/app/book");
  await expect(
    page.getByRole("heading", { level: 1, name: "დრო ტელესკოპთან." }),
  ).toBeVisible();
  await expect(page.locator(".slot-row").nth(1)).toContainText("დაჯავშნილია");
  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);

  // The page keeps a side gutter: nothing runs to the screen's edge.
  for (const box of [
    await page.locator("h1").boundingBox(),
    await page.locator(".slot-list").boundingBox(),
  ]) {
    expect(box?.x).toBeGreaterThanOrEqual(16);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(390 - 16);
  }
});
