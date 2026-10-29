import { expect, type Browser, type Page, test } from "@playwright/test";

// ADR-067, against e2e/fake-platform.mjs: the observer bought one gift, 70…01, for Nino,
// ready to give (code STLR-GIFT-7K2Q). A gift bought here is paid at the fake's sandbox
// checkout, which returns the buyer to the gift's page, and spent on the booking board.
// Purchases belong to the session that made them, so these sign in on their own.
test.use({ storageState: { cookies: [], origins: [] } });

const seeded = "70000000-0000-4000-8000-000000000001";

async function signIn(page: Page, locale: "en" | "ka" = "en") {
  await page.goto(`/${locale}/sign-in`);
  await page.locator('input[name="email"]').fill("observer@darkview.test");
  await page.locator('input[name="password"]').fill("correct horse battery");
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/app$`));
}

async function buy(page: Page, answer: "Pay" | "Decline") {
  await page.goto("/en/gift");
  await page.getByLabel("Their name (optional)").fill("Dato");
  await page.getByLabel("A note (optional)").fill("Happy birthday");
  await page.getByRole("button", { name: "Continue to payment" }).click();
  await expect(page).toHaveURL(/\/api\/payments\/[0-9a-f-]+\/sandbox-checkout$/);
  await page.getByRole("button", { name: answer }).click();
  await expect(page).toHaveURL(/\/en\/gift\/[0-9a-f-]+$/);
}

/** The night's first start nobody holds. */
const openSlot = (page: Page) =>
  page
    .getByRole("group", { name: /^Observing time/ })
    .locator(".time-cell.is-open")
    .first();

async function stranger(browser: Browser) {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  return { context, page: await context.newPage() };
}

test("a stranger reads what a gift is and is asked to sign in, in both languages", async ({
  browser,
}) => {
  const { context, page } = await stranger(browser);
  await page.goto("/en/gift");
  await expect(
    page.getByRole("heading", { level: 2, name: "Gift a night" }),
  ).toBeVisible();
  await expect(page.getByText("Valid for twelve months from payment")).toBeVisible();
  await expect(page.locator("[data-gift-price] strong")).toHaveText(/GEL|₾/);
  await expect(page.getByRole("link", { name: "Sign in to buy a gift" })).toHaveAttribute(
    "href",
    "/en/sign-in",
  );
  await expect(page.getByRole("button", { name: "Continue to payment" })).toHaveCount(0);

  await page.goto("/ka/gift");
  await expect(page.getByRole("heading", { level: 2, name: "აჩუქე ღამე" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "შედი, რომ საჩუქარი იყიდო" }),
  ).toBeVisible();

  // A gift's page is its buyer's alone.
  await page.goto(`/en/gift/${seeded}`);
  await expect(page).toHaveURL(/\/en\/sign-in$/);
  await context.close();
});

test("the buyer opens a gift ready to give: the code, the note, and Print", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/en/gift");
  const row = page.locator(`[data-gift-row="ACTIVE"]`).filter({ hasText: "Nino" });
  await expect(row).toContainText("Ready to give");
  await row.getByRole("link", { name: "Open" }).click();
  await expect(page).toHaveURL(`/en/gift/${seeded}`);

  const card = page.locator("[data-gift-card]");
  await expect(card).toContainText("For Nino");
  await expect(card).toContainText("For the clearest night of the year.");
  await expect(card.locator("[data-gift-code]")).toHaveText("STLR-GIFT-7K2Q");
  await expect(card).toContainText("Use it by 22 September 2027");
  await expect(page.getByRole("button", { name: "Print the card" })).toBeVisible();

  await page.goto(`/ka/gift/${seeded}`);
  await expect(page.locator("[data-gift-card]")).toContainText("ვისთვის: Nino");
  await expect(page.getByRole("button", { name: "ბარათის დაბეჭდვა" })).toBeVisible();
});

test("a gift is bought, paid, and spent on the booking board for nothing", async ({
  page,
}) => {
  await signIn(page);
  await buy(page, "Pay");
  const code = await page.locator("[data-gift-code]").textContent();
  expect(code).toMatch(/^STLR-/);
  await expect(page.locator("[data-gift-card]")).toContainText("For Dato");
  await expect(page.locator("[data-gift-card]")).toContainText("Happy birthday");

  await page.goto("/en/app/book");
  await openSlot(page).click();
  await page.getByText("Have a gift code?").click();
  await page.getByLabel("Gift code").fill(code!.toLowerCase());
  await expect(page.locator(".board-total strong")).toHaveText("Paid by the gift");

  const request = page.waitForRequest(
    (sent) => sent.url().endsWith("/api/bookings") && sent.method() === "POST",
  );
  await page.getByRole("button", { name: "Reserve and pay" }).click();
  expect((await request).postDataJSON()).toMatchObject({
    voucherCode: code!.toLowerCase(),
  });
  // No checkout: the gift paid, so the booking's page is next.
  await expect(page).toHaveURL(/\/en\/app\/bookings\/[0-9a-f-]+$/);

  // Spent: the code is gone from the buyer's view.
  await page.goto("/en/gift");
  await expect(
    page.locator('[data-gift-row="REDEEMED"]').filter({ hasText: "Dato" }),
  ).toContainText("Booked");
});

test("a declined payment leaves a gift with no code", async ({ page }) => {
  await signIn(page);
  await buy(page, "Decline");
  await expect(page.locator('[data-gift="CANCELLED"]')).toContainText(
    "The payment was declined, so this gift has no code.",
  );
  await expect(page.locator("[data-gift-code]")).toHaveCount(0);
});

test("a wrong gift code is refused on the board, and nothing is booked", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/en/app/book");
  await openSlot(page).click();
  await page.getByText("Have a gift code?").click();
  await page.getByLabel("Gift code").fill("STLR-NOPE-0000");
  await page.getByRole("button", { name: "Reserve and pay" }).click();
  await expect(page.locator(".booking-feedback")).toHaveText(
    "That code is invalid, used or expired.",
  );
  await expect(page).toHaveURL(/\/en\/app\/book/);
});

test("a deployment that sells no gifts says so", async ({ page, context }) => {
  await signIn(page);
  await context.addCookies([
    { name: "fake_gift", value: "unconfigured", url: "http://localhost:3100" },
  ]);
  await page.goto("/en/gift");
  await page.getByRole("button", { name: "Continue to payment" }).click();
  await expect(page.locator(".booking-feedback")).toHaveText(
    "Gifts cannot be sold here just now.",
  );
});
