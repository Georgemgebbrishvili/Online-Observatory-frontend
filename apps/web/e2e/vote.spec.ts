import { expect, test } from "@playwright/test";

// The weekly vote (ADR-053 §8), against e2e/fake-platform.mjs: Albireo and Saturn are
// observable tonight, so they are the week's candidates; the tally waits on the platform.

test("/vote lists the week's candidates from the catalogue, drawn through the night, with the vote still to open", async ({
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

  // No tally yet: the buttons say so, and nothing claims a lead.
  const buttons = page.getByRole("button", { name: "Opens with first light" });
  await expect(buttons).toHaveCount(2);
  await expect(buttons.first()).toBeDisabled();
  await expect(page.getByText("Leading", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/^Voting opens with first light/)).toBeVisible();

  // The poster leads with the highest; the chart draws both.
  await expect(page.locator(".vote-poster .kicker")).toHaveText("Highest that night");
  await expect(page.locator(".vote-poster-object figcaption")).toHaveText(
    "Illustration — not telescope output",
  );
  await expect(page.locator(".vote-skychart-path")).toHaveCount(2);
  await expect(page.locator(".vote-skychart-path-lead")).toHaveCount(1);
});

test("the Georgian vote fits a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ka/vote");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("კვირის კენჭისყრა");
  await expect(page.getByRole("button", { name: "იხსნება პირველი სინათლით" }).first()).toBeVisible();
  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
});
