import { expect, type Page, test } from "@playwright/test";

// The weekly vote (ADR-053 §8, platform ADR-050), against e2e/fake-platform.mjs:
// Albireo and Saturn are observable tonight, so they are the week's candidates; the
// fake counts votes in memory, one per customer, and starts the run at zero.

test("/vote lists the week's candidates from the platform's ballot, drawn through the night", async ({
  page,
}) => {
  await page.goto("/en/vote");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("The week's vote");
  await expect(page.getByRole("heading", { level: 2, name: /^The week's vote · / })).toBeVisible();

  const cards = page.locator(".vote-card");
  await expect(cards).toHaveCount(2);
  await expect(cards.getByRole("heading", { level: 3, name: "Albireo" })).toBeVisible();
  await expect(cards.getByRole("heading", { level: 3, name: "Saturn" })).toBeVisible();
  await expect(cards.first().getByText(/^highest \d+° at \d{2}:\d{2}$/)).toBeVisible();
  await expect(cards.first().getByRole("link", { name: /target page/ })).toHaveAttribute(
    "href",
    /\/en\/app\/missions\/(albireo|saturn)$/,
  );

  // The poster leads with the highest while nothing is cast; the chart draws both.
  await expect(page.locator(".vote-poster-object figcaption")).toHaveText(
    "Illustration — not telescope output",
  );
  await expect(page.locator(".vote-skychart-path")).toHaveCount(2);
  await expect(page.locator(".vote-skychart-path-lead")).toHaveCount(1);
});

test.describe("casting", () => {
  // A vote is the session's own, so this signs in on its own.
  test.use({ storageState: { cookies: [], origins: [] } });

  async function signIn(page: Page) {
    await page.goto("/en/sign-in");
    await page.getByLabel("Email").fill("observer@darkview.test");
    await page.getByLabel("Password").fill("correct horse battery");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/en\/app$/);
  }

  test("a visitor is sent to sign in; a customer's vote shows at once, counts once, and moves", async ({
    page,
  }) => {
    await page.goto("/en/vote");
    await expect(page.getByRole("link", { name: "Sign in to vote for Saturn" })).toHaveAttribute(
      "href",
      "/en/sign-in",
    );

    await signIn(page);
    await page.goto("/en/vote");
    const saturn = page.locator(".vote-card", { hasText: "Saturn" });
    const albireo = page.locator(".vote-card", { hasText: "Albireo" });

    const request = page.waitForRequest(
      (sent) => sent.url().endsWith("/api/votes") && sent.method() === "POST",
    );
    await saturn.getByRole("button", { name: "Vote for Saturn" }).click();
    expect((await request).postDataJSON()).toMatchObject({
      targetId: "30000000-0000-4000-8000-000000000006",
    });
    await expect(saturn.getByRole("button", { name: "Vote for Saturn" })).toHaveText("Your vote");
    await expect(saturn.locator(".vote-count b")).toHaveText("1");
    await expect(saturn.getByText("Leading", { exact: true })).toBeVisible();
    await expect(page.getByRole("status")).toHaveText("Your vote is on Saturn.");

    // Casting again elsewhere moves the one vote rather than adding a second.
    await albireo.getByRole("button", { name: "Vote for Albireo" }).click();
    await expect(albireo.locator(".vote-count b")).toHaveText("1");
    await expect(saturn.locator(".vote-count b")).toHaveText("0");
    await expect(albireo.getByRole("button", { name: "Vote for Albireo" })).toHaveText("Your vote");

    // The vote is the platform's, so a fresh load reads it back.
    await page.reload();
    await expect(
      page.locator(".vote-card", { hasText: "Albireo" }).getByRole("button", { name: "Vote for Albireo" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".vote-poster .kicker")).toHaveText("Leading the vote");
  });
});

test("the Georgian vote fits a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ka/vote");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("კვირის კენჭისყრა");
  await expect(page.getByRole("button", { name: /ხმის მიცემა/ }).first()).toBeVisible();
  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
});
