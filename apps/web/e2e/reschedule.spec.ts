import { expect, type Page, test } from "@playwright/test";

// Phase 3, a free slot for a lost one, against e2e/fake-platform.mjs: booking ...0004
// lost 18 minutes to the weather and its entitlement is OPEN. Albireo and Saturn are up
// for every slot; the ninth slot is taken "a moment ago".
//
// Claiming the entitlement changes the booking for the session that did it, so these
// sign in on their own.
test.use({ storageState: { cookies: [], origins: [] } });

const lostId = "53000000-0000-4000-8000-000000000004";

async function signIn(page: Page) {
  await page.goto("/en/sign-in");
  await page.getByLabel("Email").fill("observer@darkview.test");
  await page.getByLabel("Password").fill("correct horse battery");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/en\/app$/);
}

test("a lost slot is replaced with a free one, and the offer then closes", async ({
  page,
}) => {
  await signIn(page);
  await page.goto(`/en/app/bookings/${lostId}`);
  await page.getByRole("link", { name: "Choose a free slot" }).click();

  await expect(page).toHaveURL(new RegExp(`/en/app/book\\?reschedule=${lostId}$`));
  await expect(
    page.getByText("Choosing a free slot to replace the one that was lost."),
  ).toBeVisible();
  const first = page.locator(".slot-row").first();
  await expect(first).toContainText("Free");
  await expect(page.locator(".booking-nights a").nth(2)).toHaveAttribute(
    "href",
    new RegExp(`&reschedule=${lostId}$`),
  );

  await first.getByRole("link").click();
  await expect(page).toHaveURL(
    new RegExp(`/en/app/book/reserve\\?startAt=.+&reschedule=${lostId}$`),
  );
  await expect(page.locator(".slot-row")).toContainText("Free");
  await page.getByRole("radio", { name: /Albireo/ }).check();

  const request = page.waitForRequest(
    (sent) =>
      sent.url().endsWith(`/api/bookings/${lostId}/reschedule`) &&
      sent.method() === "POST",
  );
  await page.getByRole("button", { name: "Book this slot free" }).click();
  expect((await request).postDataJSON()).toMatchObject({
    targetId: "30000000-0000-4000-8000-000000000021",
  });

  await expect(page).toHaveURL(/\/en\/app\/bookings\/[0-9a-f-]+$/);
  expect(page.url()).not.toContain(lostId);
  await expect(page.getByRole("heading", { level: 1, name: "Albireo" })).toBeVisible();
  await expect(page.getByText("Confirmed", { exact: true })).toBeVisible();

  await page.goto(`/en/app/bookings/${lostId}`);
  await expect(page.getByRole("link", { name: "See the new booking" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Choose a free slot" })).toHaveCount(0);

  await page.goto(`/en/app/book?reschedule=${lostId}`);
  await expect(
    page.getByRole("heading", { name: "This booking has no free slot to claim." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to the booking" })).toHaveAttribute(
    "href",
    `/en/app/bookings/${lostId}`,
  );
});

test("a slot taken a moment ago is refused, and the free slot stays open", async ({
  page,
}) => {
  await signIn(page);
  await page.goto(`/en/app/book?reschedule=${lostId}`);
  await page.locator(".slot-row").nth(8).getByRole("link").click();
  await page.getByRole("radio", { name: /Saturn/ }).check();
  await page.getByRole("button", { name: "Book this slot free" }).click();

  await expect(page.locator(".booking-feedback")).toHaveText(
    "Somebody booked this slot a moment ago. Choose another.",
  );
  await page.goto(`/en/app/bookings/${lostId}`);
  await expect(page.getByRole("link", { name: "Choose a free slot" })).toBeVisible();
});

test("a booking that is not the customer's, or has nothing to claim, offers no slot", async ({
  page,
}) => {
  await signIn(page);
  for (const [id, back] of [
    ["not-a-booking", "Your bookings"],
    // Confirmed and paid, with no lost slot.
    ["51000000-0000-4000-8000-000000000002", "Back to the booking"],
  ]) {
    await page.goto(
      `/en/app/book/reserve?startAt=2030-01-15T14:00:00.000Z&reschedule=${id}`,
    );
    await expect(
      page.getByRole("heading", { name: "This booking has no free slot to claim." }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: back })).toBeVisible();
  }
});

test("the Georgian reschedule fits a phone", async ({ page }) => {
  await signIn(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/ka/app/bookings/${lostId}`);
  await page.getByRole("link", { name: "აირჩიე უფასო დრო" }).click();
  await page.locator(".slot-row").first().getByRole("link").click();
  await expect(
    page.getByRole("button", { name: "ამ დროის უფასოდ დაჯავშნა" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});
