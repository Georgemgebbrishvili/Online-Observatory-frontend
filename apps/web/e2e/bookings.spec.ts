import { expect, type Page, test } from "@playwright/test";

// Phase 3 slice 3, against e2e/fake-platform.mjs: the observer's seven bookings, one in
// every state, four to a page.

const pending = "52000000-0000-4000-8000-000000000003";
const upcoming = "51000000-0000-4000-8000-000000000002";
const lost = "53000000-0000-4000-8000-000000000004";

test("/app/book lists the nights latest slot first, four to a page", async ({ page }) => {
  await page.goto("/en/app/book");

  await expect(
    page.getByRole("heading", { level: 2, name: "Your nights" }),
  ).toBeVisible();
  const rows = page.locator(".booking-row");
  await expect(rows).toHaveCount(4);
  await expect(rows.first()).toContainText("Albireo");
  await expect(rows.first()).toContainText("Awaiting payment");
  await expect(rows.first()).toContainText("19:20–19:50");
  await expect(rows.first()).toContainText("GMT+4");
  await expect(rows.nth(1)).toContainText("Saturn");
  await expect(rows.nth(1)).toContainText("Confirmed");

  await page.getByRole("link", { name: "Older bookings" }).click();
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(0)).toContainText("Expired");
  await expect(rows.nth(1)).toContainText("Refunded");
  await expect(rows.nth(2)).toContainText("Cancelled");
  await expect(page.getByRole("link", { name: "Older bookings" })).toHaveCount(0);

  await page.getByRole("link", { name: "Latest bookings" }).click();
  await expect(rows).toHaveCount(4);
});

test("/app/bookings still lands, on the nights under /app/book", async ({ page }) => {
  await page.goto("/en/app/bookings");
  await expect(page).toHaveURL(/\/en\/app\/book$/);
  await expect(
    page.getByRole("heading", { level: 2, name: "Your nights" }),
  ).toBeVisible();
  await page.goto("/en/app/book");
  await page.getByRole("link", { name: "Your bookings" }).click();
  await expect(page).toHaveURL(/\/en\/app\/book#booking-nights$/);
});

test("a confirmed booking opens its observation and says why it cannot be cancelled", async ({
  page,
}) => {
  await page.goto(`/en/app/bookings/${upcoming}`);

  await expect(page.getByRole("heading", { level: 1, name: "Saturn" })).toBeVisible();
  await expect(page.getByText("Confirmed", { exact: true })).toBeVisible();
  await expect(page.getByText("SIMULATED OBSERVATORY")).toBeVisible();
  await expect(page.getByText("Loyalty discount")).toBeVisible();
  await expect(
    page.getByText("A paid booking cannot be cancelled until refunds are available."),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Cancel booking" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Open the observation" })).toHaveAttribute(
    "href",
    "/en/app/missions/21000000-0000-4000-8000-000000000002/session",
  );
});

test("a booking awaiting payment says how long it is held and offers the checkout", async ({
  page,
}) => {
  await page.goto(`/en/app/bookings/${pending}`);

  await expect(page.getByText("Awaiting payment", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Held for you until Wed, 16 Jan 2030, 18:35 GMT+4."),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Continue to payment" })).toHaveAttribute(
    "href",
    /\/api\/payments\/62000000-0000-4000-8000-000000000003\/sandbox-checkout$/,
  );
});

test("an unknown booking and a malformed id are both not found", async ({ page }) => {
  for (const id of ["59000000-0000-4000-8000-000000000009", "not-a-booking"]) {
    await page.goto(`/en/app/bookings/${id}`);
    await expect(page.getByRole("heading", { level: 1 })).not.toHaveText(
      "Your bookings.",
    );
    await expect(page.locator(".booking-detail")).toHaveCount(0);
  }
});

test("the Georgian bookings fit a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ka/app/book");
  await expect(
    page.getByRole("heading", { level: 2, name: "შენი ღამეები" }),
  ).toBeVisible();
  await expect(page.locator(".booking-row").first()).toContainText("გადახდას ელოდება");
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(390);

  await page.goto(`/ka/app/bookings/${lost}`);
  await expect(page.getByText(/18 წუთი ამინდის გამო დაიკარგა/)).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});

// Cancelling and refunding change the booking for the session that did it, so these sign
// in on sessions of their own and the shared observer's bookings stay as they are.
test.describe("changing a booking", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  async function signIn(page: Page) {
    await page.goto("/en/sign-in");
    await page.getByLabel("Email").fill("observer@darkview.test");
    await page.getByLabel("Password").fill("correct horse battery");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/en\/app$/);
  }

  test("a booking awaiting payment is cancelled after a confirmation", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto(`/en/app/bookings/${pending}`);

    await expect(page.getByText("Awaiting payment", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Cancel booking" }).click();
    await expect(
      page.getByText("Cancel this booking and release the slot?"),
    ).toBeVisible();

    await page.getByRole("button", { name: "Keep it" }).click();
    await page.getByRole("button", { name: "Cancel booking" }).click();
    await page.getByRole("button", { name: "Yes, cancel it" }).click();

    await expect(page.getByText("Cancelled", { exact: true })).toBeVisible();
    await expect(page.getByText("The slot has been released.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel booking" })).toHaveCount(0);
  });

  test("a slot lost to the weather is refunded", async ({ page }) => {
    await signIn(page);
    await page.goto(`/en/app/bookings/${lost}`);

    await expect(
      page.getByText(
        "18 minutes of this slot were lost to the weather. You can take a refund or a free slot until 20 October 2026.",
      ),
    ).toBeVisible();
    await page.getByRole("button", { name: "Take the refund" }).click();

    await expect(page.getByText("Refunded", { exact: true })).toBeVisible();
    await expect(
      page.getByText(
        "This slot was lost on our side, and the amount paid has been returned.",
      ),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Take the refund" })).toHaveCount(0);
  });
});
