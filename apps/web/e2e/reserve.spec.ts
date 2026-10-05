import { expect, type Page, test } from "@playwright/test";

// Phase 3 slices 2 and 4, against e2e/fake-platform.mjs: nine slots from 18:00 Tbilisi,
// the second booked and the ninth taken "a moment ago"; Albireo and Saturn up for the
// whole slot, the Moon, M13 and Venus not. The fake's sandbox checkout answers 303 to the
// booking's page, as the platform's does.
//
// A reservation belongs to the session that made it, so these sign in on their own.
test.use({ storageState: { cookies: [], origins: [] } });

async function signIn(page: Page) {
  await page.goto("/en/sign-in");
  await page.getByLabel("Email").fill("observer@darkview.test");
  await page.getByLabel("Password").fill("correct horse battery");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/en\/app$/);
}

async function openSlot(page: Page, index: number) {
  await page.goto("/en/app/book");
  await page.locator(".slot-row").nth(index).getByRole("link").click();
  await expect(page).toHaveURL(/\/en\/app\/book\/reserve\?startAt=/);
}

test("a slot is reserved, paid at the sandbox checkout, and confirmed", async ({
  page,
}) => {
  await signIn(page);
  await openSlot(page, 0);

  await expect(
    page.getByRole("heading", { level: 1, name: "What will you observe?" }),
  ).toBeVisible();
  const choices = page.getByRole("radio");
  await expect(choices).toHaveCount(2);
  await expect(page.getByRole("radio", { name: /Albireo/ })).toBeVisible();
  await expect(page.getByRole("radio", { name: /Saturn/ })).toBeVisible();

  const withheld = page.getByRole("region", { name: "Not up for the whole slot" });
  await expect(withheld).toContainText("Hercules Cluster");
  await expect(withheld).toContainText("Too low in the sky");
  await expect(withheld).toContainText("Below the horizon");

  const reserve = page.getByRole("button", { name: "Reserve and pay" });
  await expect(reserve).toBeDisabled();
  await page.getByRole("radio", { name: /Saturn/ }).check();

  const request = page.waitForRequest(
    (sent) => sent.url().endsWith("/api/bookings") && sent.method() === "POST",
  );
  await reserve.click();
  expect((await request).headers()["idempotency-key"]).toMatch(/^[0-9a-f-]{36}$/);

  await expect(page).toHaveURL(/\/api\/payments\/[0-9a-f-]+\/sandbox-checkout$/);
  await page.getByRole("button", { name: "Pay" }).click();

  await expect(page).toHaveURL(/\/en\/app\/bookings\/[0-9a-f-]+$/);
  await expect(page.getByRole("heading", { level: 1, name: "Saturn" })).toBeVisible();
  await expect(page.getByText("Confirmed", { exact: true })).toBeVisible();

  await page.goto("/en/app/bookings");
  await expect(page.locator(".booking-row", { hasText: "Saturn" }).first()).toBeVisible();
});

test("declining at the checkout cancels the booking", async ({ page }) => {
  await signIn(page);
  await openSlot(page, 2);
  await page.getByRole("radio", { name: /Albireo/ }).check();
  await page.getByRole("button", { name: "Reserve and pay" }).click();

  await page.getByRole("button", { name: "Decline" }).click();
  await expect(page).toHaveURL(/\/en\/app\/bookings\/[0-9a-f-]+$/);
  await expect(page.getByText("Cancelled", { exact: true })).toBeVisible();
});

test("a slot taken a moment ago is refused, and the customer is sent elsewhere", async ({
  page,
}) => {
  await signIn(page);
  await openSlot(page, 8);
  await page.getByRole("radio", { name: /Saturn/ }).check();
  await page.getByRole("button", { name: "Reserve and pay" }).click();

  await expect(page.locator(".booking-feedback")).toHaveText(
    "Somebody booked this slot a moment ago. Choose another.",
  );
  await expect(page).toHaveURL(/\/en\/app\/book\/reserve/);
});

test("a booked slot, or no slot at all, cannot be reserved", async ({ page }) => {
  await signIn(page);
  await page.goto("/en/app/book");
  await expect(page.locator(".slot-row").nth(1).getByRole("link")).toHaveCount(0);

  // Ten minutes into a slot is no slot's start; the fake offers every night's slots.
  for (const startAt of ["2030-01-15T14:10:00.000Z", "not-a-time"]) {
    await page.goto(`/en/app/book/reserve?startAt=${startAt}`);
    await expect(
      page.getByRole("heading", { name: "This slot cannot be booked." }),
    ).toBeVisible();
  }
});

test("the Georgian reserve page fits a phone", async ({ page }) => {
  await signIn(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ka/app/book");
  await page.locator(".slot-row").first().getByRole("link").click();
  await expect(
    page.getByRole("heading", { level: 1, name: "რას დააკვირდები?" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "დაჯავშნა და გადახდა" })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});
