import { expect, test } from "@playwright/test";

// ADR-058, against e2e/fake-platform.mjs, which deals every account the same three
// cards: a discount, an observer seat and nothing. Two accounts of their own turn one each:
// the player the seat, the lucky one the discount.
const firstCompile = 90_000;
test.describe.configure({ mode: "serial", timeout: 2 * firstCompile });

test("turns one of three cards, shows the prize and its code, and keeps it", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/en/sign-in");
  await page.getByLabel("Email").fill("player@darkview.test");
  await page.getByLabel("Password").fill("correct horse battery");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });

  // Reached from the signed-in home.
  await page.getByRole("link", { name: "Turn a card" }).click();
  await expect(page).toHaveURL(/\/en\/app\/cards$/, { timeout: firstCompile });
  await expect(page.getByRole("button", { name: /^Turn card/ })).toHaveCount(3);
  await expect(page.getByText("No prizes yet.")).toBeVisible();

  await page.getByRole("button", { name: "Turn card 2 of 3" }).click();
  await expect(page.getByRole("heading", { name: "Epic: A free observer seat." })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Turn card/ })).toHaveCount(0);
  await expect(page.getByText("Illustration — not telescope output")).toHaveCount(3);

  const prizes = page.getByRole("region", { name: "Your prizes" });
  await expect(prizes.getByText("Ready to use")).toBeVisible();
  await expect(prizes.locator("code")).toHaveText(/^STLR[0-9A-F]{8}$/);

  // The week's turn is spent: a reload shows the same turned cards, nothing to turn.
  await page.reload();
  await expect(page.getByRole("heading", { name: "Epic: A free observer seat." })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Turn card/ })).toHaveCount(0);
});

test("is in the profile menu, and in Georgian", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/en/sign-in");
  await page.getByLabel("Email").fill("player@darkview.test");
  await page.getByLabel("Password").fill("correct horse battery");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });

  await page.getByRole("button", { name: "Account" }).click();
  await page.getByRole("link", { name: "Weekly cards" }).click();
  await expect(page).toHaveURL(/\/en\/app\/cards$/, { timeout: firstCompile });

  await page.goto("/ka/app/cards");
  await expect(
    page.getByRole("heading", { name: "ეპიკური: დამკვირვებლის უფასო ადგილი." }),
  ).toBeVisible();
  await expect(page.getByText("ახალი ბარათები: ორშაბათი 28 სექტემბერი, 00:00.")).toBeVisible();
});

test("spends the won seat on a live session, at no charge", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/en/sign-in");
  await page.getByLabel("Email").fill("player@darkview.test");
  await page.getByLabel("Password").fill("correct horse battery");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });

  // Nino's session open to watchers, in the fake.
  await page.goto("/en/app/missions/23000000-0000-4000-8000-000000000004/watch");
  await page.getByRole("button", { name: "Use my free seat" }).click();
  await expect(
    page.getByText("You are watching. You cannot move the telescope or keep captures."),
  ).toBeVisible();

  await page.goto("/en/app/cards");
  const prizes = page.getByRole("region", { name: "Your prizes" });
  await expect(prizes.getByText("Used")).toBeVisible();
  await expect(prizes.locator("code")).toHaveCount(0);
});

test("spends a won discount on a booking, through the checkout", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/en/sign-in");
  await page.getByLabel("Email").fill("lucky@darkview.test");
  await page.getByLabel("Password").fill("correct horse battery");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });

  await page.goto("/en/app/cards");
  await page.getByRole("button", { name: "Turn card 1 of 3" }).click();
  await expect(page.getByRole("heading", { name: "Rare: 20% off one booking." })).toBeVisible();

  await page.getByRole("link", { name: "Book with it" }).first().click();
  await expect(page).toHaveURL(/\/en\/app\/book$/, { timeout: firstCompile });
  await page.getByRole("radiogroup", { name: /^Observing time/ }).getByRole("radio").first().click();
  await page
    .getByRole("radiogroup", { name: "Object" })
    .getByRole("radio", { name: /^Saturn, Up for the whole slot/ })
    .click();
  const session = page.locator(".board-sum");
  await session.getByLabel("Use a prize").selectOption({ index: 1 });
  await expect(session).toContainText("20% off at checkout");

  await page.getByRole("button", { name: "Reserve and pay" }).click();
  await expect(page).toHaveURL(/\/api\/payments\/[0-9a-f-]+\/sandbox-checkout/, {
    timeout: firstCompile,
  });

  await page.goto("/en/app/cards");
  await expect(page.getByRole("region", { name: "Your prizes" }).getByText("Used")).toBeVisible();
});
