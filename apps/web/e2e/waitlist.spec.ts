import { expect, type Page, test } from "@playwright/test";

// ADR-068, against e2e/fake-platform.mjs: every start carries a forecast (cloudy for the
// first six, clear after, none for the last three), and a start the fake shows as booked
// can be waited for. Places belong to the account, so these sign in on their own.
test.use({ storageState: { cookies: [], origins: [] } });

async function signIn(page: Page, locale: "en" | "ka" = "en") {
  await page.goto(`/${locale}/sign-in`);
  await page.locator('input[name="email"]').fill("observer@darkview.test");
  await page.locator('input[name="password"]').fill("correct horse battery");
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/app$`));
}

const starts = (page: Page) =>
  page.getByRole("radiogroup", { name: /^Observing time/ }).getByRole("radio");

test("each start says its cloud forecast, plainly as a forecast", async ({ page }) => {
  await signIn(page);
  await page.goto("/en/app/book");
  await expect(starts(page).first()).toHaveAccessibleName(/Forecast: 75% cloud$/);
  await expect(starts(page).last()).toHaveAccessibleName(/Forecast: No forecast yet$/);

  await starts(page).nth(7).click();
  const session = page.getByRole("complementary", { name: "Your session" });
  await expect(session).toContainText("Forecast");
  await expect(session).toContainText("15% cloud");
});

test("a booked start can be waited for, once", async ({ page }) => {
  await signIn(page);
  await page.goto("/en/app/book");
  const taken = page.locator(".board-slot.is-taken").first();
  await taken.click();
  await expect(taken).toHaveAttribute("aria-checked", "true");
  await expect(page.getByText(/Someone holds this start/)).toBeVisible();

  const request = page.waitForRequest(
    (sent) => sent.url().endsWith("/api/waitlist") && sent.method() === "POST",
  );
  await page.getByRole("button", { name: "Join the waitlist" }).click();
  expect((await request).postDataJSON()).toMatchObject({ durationMinutes: 30 });
  await expect(
    page.getByRole("status").filter({ hasText: "number 1 in line" }),
  ).toBeVisible();

  // Again: refused, and nothing is booked.
  await page.getByRole("button", { name: "Join the waitlist" }).click();
  await expect(page.locator(".booking-feedback")).toHaveText(
    /You cannot wait for this start/,
  );
  await expect(page).toHaveURL(/\/en\/app\/book$/);
});

test("the waitlist in Georgian", async ({ page }) => {
  await signIn(page, "ka");
  await page.goto("/ka/app/book");
  await page.locator(".board-slot.is-taken").first().click();
  await expect(page.getByRole("button", { name: "რიგში ჩადგომა" })).toBeVisible();
});
