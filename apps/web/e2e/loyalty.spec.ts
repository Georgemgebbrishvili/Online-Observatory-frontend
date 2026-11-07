import { createHash, randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

// ADR-084: the Loyalty Club's surfaces, against e2e/fake-platform.mjs, which keeps a club
// account per user as the platform does (DV-090..096). The observer's is seeded: Member,
// 6,900 tier points of 20,000 to VIP, a marker at 5,000, three entries.

const firstCompile = 90_000;
const observerId = "00000000-0000-4000-8000-000000000001";
// The fake's referral code: as the platform's, opaque; derived so a test can know it.
const observerCode = createHash("sha256")
  .update(`ref:${observerId}`)
  .digest("hex")
  .slice(0, 8)
  .toUpperCase();

test("the club page shows the member card, the ladder, the ways to earn and the history", async ({
  page,
}) => {
  await page.goto("/en/app/loyalty");

  const card = page.locator(".club-card");
  await expect(card.getByRole("heading", { name: "Member" })).toBeVisible({ timeout: firstCompile });
  await expect(card).toContainText("10% off every session");
  await expect(card.locator('[data-field="balance"]')).toHaveText(/^\d[\d,]*$/);
  const bar = card.getByRole("progressbar", { name: "Progress to VIP" });
  await expect(bar).toHaveAttribute("aria-valuemax", "20000");
  await expect(card).toContainText(/points to VIP/);

  const ladder = page.getByRole("region", { name: "Tiers" });
  await expect(ladder.getByRole("listitem")).toHaveCount(2);
  await expect(ladder.locator('[aria-current="true"]')).toContainText("Member");
  await expect(ladder).toContainText("from 20,000 points");

  const earn = page.getByRole("region", { name: "How you earn" });
  await expect(earn).toContainText("5 points for every GEL you pay");
  await expect(earn).toContainText("Points do not expire.");

  const history = page.getByRole("region", { name: "History" });
  await expect(history).toContainText("Earned on a session");
  await expect(history).toContainText("Duplicate welcome bonus removed");
  await expect(history.getByRole("link", { name: "Booking" }).first()).toHaveAttribute(
    "href",
    "/en/app/bookings/51000000-0000-4000-8000-000000000002",
  );
});

test("the club page reads in Georgian, labels untracked", async ({ page }) => {
  await page.goto("/ka/app/loyalty");
  await expect(page.getByRole("region", { name: "დონეები" })).toBeVisible({ timeout: firstCompile });
  await expect(page.locator(".club-card")).toContainText("წევრი");
  await expect(page.getByRole("region", { name: "ისტორია" })).toContainText("დაგროვდა სეანსზე");
});

test("the referral link copies, and points to registration with the code", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/en/app/loyalty");
  const referral = page.getByRole("region", { name: "Invite a friend" });
  await expect(referral.locator('[data-field="referral-code"]')).toHaveText(observerCode, {
    timeout: firstCompile,
  });
  await referral.getByRole("button", { name: "Copy link" }).click();
  await expect(referral.getByRole("status")).toHaveText("Link copied");
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe(`http://localhost:3100/en/register?ref=${observerCode}`);
});

test.describe("a referred newcomer", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("registers through a member's link, spends points on a booking, and both get the bonus", async ({
    page,
  }) => {
    test.setTimeout(240_000);
    await page.goto(`/en/register?ref=${observerCode}`);
    await expect(page.locator("[data-referral]")).toHaveText(/Invited by a member/, {
      timeout: firstCompile,
    });
    await page.getByLabel("Name").fill("Referred Newcomer");
    await page.getByLabel("Email").fill(`referred-${randomUUID().slice(0, 8)}@demo.test`);
    await page.getByLabel("Password").fill("a long enough password");
    await page.getByRole("button", { name: /Create account/ }).click();
    await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });

    // The welcome bonus (100 points) is GEL 1.00 at 100 points a GEL.
    await page.goto("/en/app/book");
    const session = page.locator(".board-sum");
    await expect(page.getByRole("button", { name: "Reserve and pay" })).toBeEnabled({
      timeout: firstCompile,
    });
    await expect(session).toContainText("You have 100 points, worth GEL 1.00.");
    await expect(session).toContainText("Up to 100 on this session");
    await session.getByText("Use points").click();

    const lines = session.locator(".board-breakdown");
    await expect(lines).toContainText("GEL 45.00");
    await expect(lines).toContainText("Member discount, 10%");
    await expect(lines).toContainText("−GEL 4.50");
    await expect(lines).toContainText("100 points");
    await expect(session.locator(".board-total strong")).toHaveText("GEL 39.50");
    // One reduction: the gift field is locked while points are in use.
    await session.getByText("Have a gift code?").click().catch(() => {});
    await expect(session.locator('input[name="giftCode"]')).toBeDisabled();

    await page.getByRole("button", { name: "Reserve and pay" }).click();
    await expect(page).toHaveURL(/\/api\/payments\/[0-9a-f-]+\/sandbox-checkout/, {
      timeout: firstCompile,
    });
    await page.getByRole("button", { name: "Pay" }).click();
    await expect(page).toHaveURL(/\/en\/app\/bookings\/[0-9a-f-]+$/, { timeout: firstCompile });
    await expect(page.getByText("Points spent")).toBeVisible();
    await expect(page.getByText("Loyalty discount")).toBeVisible();

    await page.goto("/en/app/loyalty");
    const history = page.getByRole("region", { name: "History" });
    await expect(history).toContainText("Referral bonus", { timeout: firstCompile });
    await expect(history).toContainText("Spent on a booking");
    await expect(history).toContainText("Earned on a session");
  });
});

test.describe("the operator", () => {
  test.use({ storageState: "e2e/.auth/operator.json" });

  test("adjusts a balance, and refuses a removal below zero and an unknown customer", async ({
    page,
  }) => {
    await page.goto("/en/admin/loyalty");
    const form = page.getByRole("region", { name: "Loyalty adjustment" });
    await expect(form).toBeVisible({ timeout: firstCompile });

    await form.getByLabel("Customer id").fill(randomUUID());
    await form.getByLabel("Points").fill("100");
    await form.getByLabel("Reason").fill("Goodwill");
    await form.getByRole("button", { name: "Adjust balance" }).click();
    await expect(form.getByRole("alert")).toHaveText("No customer has that id.");

    await form.getByLabel("Customer id").fill(observerId);
    await form.getByLabel("Points").fill("-99999999");
    await form.getByRole("button", { name: "Adjust balance" }).click();
    await expect(form.getByRole("alert")).toHaveText(/below zero/);

    await form.getByLabel("Points").fill("300");
    await form.getByLabel("Reason").fill("Clouded-out session goodwill");
    await form.getByRole("button", { name: "Adjust balance" }).click();
    await expect(form.getByRole("status")).toContainText(`Customer ${observerId} now has`);
  });
});

test("an operator's adjustment appears in the customer's history", async ({ page, browser }) => {
  const operator = await browser.newContext({ storageState: "e2e/.auth/operator.json" });
  const console = await operator.newPage();
  await console.goto("/en/admin/loyalty");
  const form = console.getByRole("region", { name: "Loyalty adjustment" });
  await form.getByLabel("Customer id").fill(observerId, { timeout: firstCompile });
  await form.getByLabel("Points").fill("150");
  await form.getByLabel("Reason").fill("Thank you for the feedback");
  await form.getByRole("button", { name: "Adjust balance" }).click();
  await expect(form.getByRole("status")).toContainText("now has");
  await operator.close();

  await page.goto("/en/app/loyalty");
  const history = page.getByRole("region", { name: "History" });
  await expect(history).toContainText("Thank you for the feedback", { timeout: firstCompile });
  await expect(history).toContainText("Adjusted by the observatory");
});
