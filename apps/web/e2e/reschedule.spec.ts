import { expect, type Page, test } from "@playwright/test";

// A free slot for a lost one, on the board (ADR-053 §7, ADR-043), against
// e2e/fake-platform.mjs: booking ...0004 lost 18 minutes to the weather and its
// entitlement is OPEN. Albireo and Saturn are up for every slot; the night's last slot is
// taken "a moment ago".
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

const slots = (page: Page) =>
  page.getByRole("radiogroup", { name: /^Observing time/ }).getByRole("radio");
const target = (page: Page, name: RegExp) =>
  page.getByRole("radiogroup", { name: "Object" }).getByRole("radio", { name });

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
  // The board prices the replacement at nothing, and keeps the lost booking's target.
  await slots(page).first().click();
  await expect(page.locator(".board-total")).toContainText("Free");
  // The lost booking's target, the Moon, is kept but cannot be had for this slot.
  await expect(target(page, /^Moon/)).toBeDisabled();
  await target(page, /^Albireo/).click();

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
  await slots(page).last().click();
  await target(page, /^Saturn/).click();
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
  await page.getByRole("link", { name: "აირჩიე უფასო სეანსი" }).click();
  await page
    .getByRole("radiogroup", { name: /დაკვირვების დრო/ })
    .getByRole("radio")
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "ამ სეანსის უფასოდ დაჯავშნა" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});
