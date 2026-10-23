import { expect, test } from "@playwright/test";

// ADR-072: a session runs any quarter hour from 15 minutes to 4 hours, at the 30-minute
// rate per minute (e2e/fake-platform.mjs: 150 tetri a minute). The length lives in the
// address, so the server reads that length's slots from GET /slots.

test("a session can run any quarter hour from 15 minutes to 4 hours, priced by the minute", async ({
  page,
}) => {
  // Six lengths, each a fresh read of the board on the server.
  test.setTimeout(120_000);
  await page.goto("/en/app/book");

  const lengths = page.getByRole("radiogroup", { name: "Length" }).getByRole("radio");
  await expect(lengths).toHaveCount(8);
  await expect(lengths.filter({ hasText: /^30 min$/ })).toHaveAttribute(
    "aria-checked",
    "true",
  );

  // One hour: the board is read again for it, every start runs an hour, and costs 90.
  await lengths.filter({ hasText: /^1 h$/ }).click();
  await expect(page).toHaveURL(/length=60/);
  await expect(lengths.filter({ hasText: /^1 h$/ })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  const slots = page
    .getByRole("radiogroup", { name: /^Observing time/ })
    .getByRole("radio");
  const open = slots.and(page.locator(":enabled:not(.is-taken)"));
  await open.first().click();
  const session = page.locator(".board-sum");
  await expect(session).toContainText("GEL 90.00");
  await expect(session).toContainText("1 h");
  const range = /(\d{2}):(\d{2}) – (\d{2}):(\d{2})/.exec(
    (await session.textContent()) ?? "",
  );
  expect(range).not.toBeNull();
  const [, h1, m1, h2, m2] = range!.map(Number);
  expect((h2 * 60 + m2 - (h1 * 60 + m1) + 1440) % 1440).toBe(60);

  // The stepper reaches the quarter hours between: one step down is 45 minutes.
  await page.getByRole("button", { name: "Shorter" }).click();
  await expect(page).toHaveURL(/length=45/);
  await expect(page.locator(".board-length-step output")).toHaveText("45 min");
  await open.first().click();
  await expect(session).toContainText("GEL 67.50");

  // The ends: 15 minutes cannot go shorter, 4 hours cannot go longer.
  await lengths.filter({ hasText: /^15 min$/ }).click();
  await expect(page).toHaveURL(/length=15/);
  await expect(page.getByRole("button", { name: "Shorter" })).toBeDisabled();
  await lengths.filter({ hasText: /^4 h$/ }).click();
  await expect(page).toHaveURL(/length=240/);
  await expect(page.getByRole("button", { name: "Longer" })).toBeDisabled();

  // A length the address makes up is read as the default.
  await page.goto("/en/app/book?length=20");
  await expect(lengths.filter({ hasText: /^30 min$/ })).toHaveAttribute(
    "aria-checked",
    "true",
  );
});

test("the object is optional: the best-one-up tile is chosen until an object is", async ({
  page,
}) => {
  await page.goto("/en/app/book");

  const targets = page.getByRole("radiogroup", { name: "Object" });
  const any = targets.getByRole("radio", { name: /^Best in the sky/ });
  await expect(any).toHaveAttribute("aria-checked", "true");

  const slots = page
    .getByRole("radiogroup", { name: /^Observing time/ })
    .getByRole("radio");
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
