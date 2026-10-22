import { expect, type Page, test } from "@playwright/test";

// Reserving from the board (ADR-053 §7, ADR-043), against e2e/fake-platform.mjs: a
// night's quarter-hour starts from dusk to dawn, the fifth booked with its neighbours, and the last taken "a moment ago"; Albireo
// and Saturn up for the whole slot, the Moon, M13 and Venus not. The fake's sandbox
// checkout answers 303 to the booking's page, as the platform's does.
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

async function chooseSlot(page: Page, index: number | "last") {
  await page.goto("/en/app/book");
  const slots = page.getByRole("radiogroup", { name: /^Observing time/ }).getByRole("radio");
  await (index === "last" ? slots.last() : slots.nth(index)).click();
  // The sky for the slot has been read when a target can be chosen.
  await expect(
    page.getByRole("radiogroup", { name: "Object" }).getByRole("radio", { name: /^Saturn, Up/ }),
  ).toBeEnabled();
}

const target = (page: Page, name: RegExp) =>
  page.getByRole("radiogroup", { name: "Object" }).getByRole("radio", { name });

test("a slot is reserved, paid at the sandbox checkout, and confirmed", async ({
  page,
}) => {
  await signIn(page);
  await chooseSlot(page, 0);

  // The object is optional: a start alone is enough to reserve.
  const reserve = page.getByRole("button", { name: "Reserve and pay" });
  await expect(reserve).toBeEnabled();
  await expect(target(page, /Hercules Cluster/)).toContainText("Too low in the sky");
  await expect(target(page, /Venus/)).toContainText("Below the horizon");
  await target(page, /^Saturn/).click();
  await expect(page.locator(".board-sum")).toContainText("Saturn");

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

test("a customer who left the checkout pays from the booking's own page", async ({
  page,
}) => {
  await signIn(page);
  await chooseSlot(page, 7);
  await target(page, /^Saturn/).click();
  // The page navigates to the checkout as soon as the reservation answers, and Chrome
  // drops a response body once its page has navigated away, so the body is read here,
  // before the page sees it.
  let bookingId = "";
  await page.route("**/api/bookings", async (route) => {
    const response = await route.fetch();
    if (response.status() === 201)
      bookingId = ((await response.json()) as { booking: { id: string } }).booking.id;
    await route.fulfill({ response });
  });
  await page.getByRole("button", { name: "Reserve and pay" }).click();
  await expect(page).toHaveURL(/\/api\/payments\/[0-9a-f-]+\/sandbox-checkout$/);
  expect(bookingId).toMatch(/^[0-9a-f-]{36}$/);

  // Leaves without answering, and comes back to the booking.
  await page.goto(`/en/app/bookings/${bookingId}`);
  await expect(page.getByText("Awaiting payment", { exact: true })).toBeVisible();
  await expect(page.getByText(/^Held for you until /)).toBeVisible();

  await page.getByRole("link", { name: "Continue to payment" }).click();
  await expect(page).toHaveURL(/\/api\/payments\/[0-9a-f-]+\/sandbox-checkout$/);
  await page.getByRole("button", { name: "Pay" }).click();

  await expect(page).toHaveURL(/\/en\/app\/bookings\/[0-9a-f-]+$/);
  await expect(page.getByText("Confirmed", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Continue to payment" })).toHaveCount(0);
});

test("declining at the checkout cancels the booking", async ({ page }) => {
  await signIn(page);
  await chooseSlot(page, 8);
  await target(page, /^Albireo/).click();
  await page.getByRole("button", { name: "Reserve and pay" }).click();

  await page.getByRole("button", { name: "Decline" }).click();
  await expect(page).toHaveURL(/\/en\/app\/bookings\/[0-9a-f-]+$/);
  await expect(page.getByText("Cancelled", { exact: true })).toBeVisible();
});

test("a slot taken a moment ago is refused, struck out, and the board stays", async ({ page }) => {
  await signIn(page);
  await chooseSlot(page, "last");
  await target(page, /^Saturn/).click();
  await page.getByRole("button", { name: "Reserve and pay" }).click();

  await expect(page.locator(".booking-feedback")).toHaveText(
    "Somebody booked this slot a moment ago. Choose another.",
  );
  await expect(page).toHaveURL(/\/en\/app\/book$/);
  await expect(
    page.getByRole("radiogroup", { name: /^Observing time/ }).getByRole("radio").last(),
  ).toBeDisabled();
  await expect(page.getByRole("button", { name: "Reserve and pay" })).toBeDisabled();
});

test("a booked slot, or no slot at all, cannot be reserved", async ({ page }) => {
  await signIn(page);
  await page.goto("/en/app/book");
  await expect(
    page.getByRole("radiogroup", { name: /^Observing time/ }).getByRole("radio").nth(4),
  ).toBeDisabled();

  // Ten minutes into a slot is no slot's start; a time that is not a time names none.
  for (const startAt of ["2030-01-15T14:10:00.000Z", "not-a-time"]) {
    await page.goto(`/en/app/book/reserve?startAt=${startAt}`);
    await expect(page).toHaveURL(/\/en\/app\/book\?startAt=/);
    await expect(page.locator(".board-sum")).toContainText("Pick a start");
    await expect(page.getByRole("button", { name: "Reserve and pay" })).toBeDisabled();
  }
});

test("the Georgian board reserves from a phone", async ({ page }) => {
  await signIn(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ka/app/book");
  await page
    .getByRole("radiogroup", { name: /დაკვირვების დრო/ })
    .getByRole("radio")
    .first()
    .click();
  await expect(page.getByRole("button", { name: "დაჯავშნა და გადახდა" })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});
