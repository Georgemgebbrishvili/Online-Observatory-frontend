import { expect, type Locator, type Page, test } from "@playwright/test";

// ADR-074: the board is the night's quarter hours (e2e/fake-platform.mjs: the fifth start
// booked, so with its turnaround the fourth to seventh quarter hours are taken). A tap
// sets the start and runs it for the address's length, 30 minutes by default; a later
// tap sets the end. A session runs 15 minutes to 4 hours at 150 tetri a minute
// (ADR-072), its price read from GET /slots at its length.

const cells = (page: Page) =>
  page.getByRole("group", { name: /^Observing time/ }).getByRole("button");

async function minutesOf(session: Locator) {
  const range = /(\d{2}):(\d{2}) – (\d{2}):(\d{2})/.exec(
    (await session.textContent()) ?? "",
  );
  expect(range).not.toBeNull();
  const [, h1, m1, h2, m2] = range!.map(Number);
  return (h2 * 60 + m2 - (h1 * 60 + m1) + 1440) % 1440;
}

test("a tap sets the start and a later tap the end, any quarter hour to 4 hours, priced by the minute", async ({
  page,
}) => {
  await page.goto("/en/app/book");
  const session = page.locator(".board-sum");

  // A start alone runs the default half hour.
  await cells(page).nth(7).click();
  await expect(session).toContainText("GEL 45.00");
  await expect(session.locator("output")).toHaveText("30 min");
  expect(await minutesOf(session)).toBe(30);

  // A later tap is the end: the eighth to the eleventh quarter hour is an hour.
  await cells(page).nth(10).click();
  await expect(session).toContainText("GEL 90.00");
  await expect(session.locator("output")).toHaveText("1 h");
  expect(await minutesOf(session)).toBe(60);
  await expect(cells(page).nth(9)).toHaveAttribute("aria-pressed", "true");

  // The stepper moves the end a quarter hour at a time.
  await page.getByRole("button", { name: "Shorter" }).click();
  await expect(session.locator("output")).toHaveText("45 min");
  await expect(session).toContainText("GEL 67.50");

  // Four hours is the longest: an end tapped later stops there.
  await cells(page).nth(7).click();
  await cells(page).nth(30).click();
  await expect(session.locator("output")).toHaveText("4 h");
  await expect(session).toContainText("GEL 360.00");
  await expect(session).toContainText("4 hours is the longest session.");

  // A run cannot cross a booking: it stops before the taken quarter hours.
  await cells(page).first().click();
  await cells(page).nth(5).click();
  await expect(session.locator("output")).toHaveText("45 min");
  await expect(session).toContainText("the time after it is taken");
  await expect(session).toContainText("GEL 67.50");

  // The start again ends the run at once: 15 minutes cannot go shorter.
  await cells(page).first().click();
  await cells(page).first().click();
  await expect(session.locator("output")).toHaveText("15 min");
  await expect(page.getByRole("button", { name: "Shorter" })).toBeDisabled();
});

test("the address's length is what a first tap chooses; one it makes up is read as 30 minutes", async ({
  page,
}) => {
  const session = page.locator(".board-sum");
  await page.goto("/en/app/book?length=60");
  await cells(page).nth(7).click();
  await expect(session.locator("output")).toHaveText("1 h");
  await expect(session).toContainText("GEL 90.00");

  await page.goto("/en/app/book?length=20");
  await cells(page).nth(7).click();
  await expect(session.locator("output")).toHaveText("30 min");
});

test("the object is optional: the best-one-up tile is chosen until an object is", async ({
  page,
}) => {
  await page.goto("/en/app/book");

  const targets = page.getByRole("radiogroup", { name: "Object" });
  const any = targets.getByRole("radio", { name: /^Best in the sky/ });
  await expect(any).toHaveAttribute("aria-checked", "true");

  const slots = page.getByRole("group", { name: /^Observing time/ }).getByRole("button");
  await slots.and(page.locator(":enabled:not(.is-taken)")).first().click();
  const saturn = targets.getByRole("radio", { name: /^Saturn, Up for the whole slot/ });
  await saturn.click();
  await expect(saturn).toHaveAttribute("aria-checked", "true");
  await expect(any).toHaveAttribute("aria-checked", "false");
  await expect(page.locator(".board-sum")).toContainText("Saturn");

  await any.click();
  await expect(any).toHaveAttribute("aria-checked", "true");
  await expect(page.locator(".board-sum")).toContainText("Best in the sky");
});
