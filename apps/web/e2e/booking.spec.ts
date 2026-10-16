import { expect, test } from "@playwright/test";

// The booking board (ADR-053 §7), against e2e/fake-platform.mjs: nine 30-minute slots
// from 18:00 Tbilisi every night, the second booked; Albireo and Saturn up for the whole
// of every slot, the Moon, M13 and Venus not.

test("/app/book is one board: the nights, a night's slots, and what is up for a chosen slot", async ({
  page,
}) => {
  await page.goto("/en/app/book");

  await expect(
    page.getByRole("heading", { level: 1, name: "Time on the telescope." }),
  ).toBeVisible();
  await expect(page.getByText("SIMULATED OBSERVATORY")).toBeVisible();

  const nights = page.getByRole("radiogroup", { name: "Choose a night" }).getByRole("radio");
  await expect(nights).toHaveCount(7);
  await expect(nights.first()).toHaveAttribute("aria-checked", "true");
  await expect(nights.first()).toContainText("8 open");

  const slots = page.getByRole("radiogroup", { name: /^Observing time/ }).getByRole("radio");
  await expect(slots).toHaveCount(9);
  await expect(slots.first()).toHaveText("18:00");
  await expect(slots.nth(1)).toBeDisabled();
  await expect(slots.nth(1)).toHaveAccessibleName(/Booked/);
  await expect(page.getByText(/Observatory time · GMT\+4/)).toBeVisible();

  // Nothing chosen: the session asks for a start, and the button waits.
  const session = page.locator(".board-sum");
  await expect(session).toContainText("Pick a half-hour");
  await expect(page.getByRole("button", { name: "Reserve and pay" })).toBeDisabled();

  // A start chosen: the price, the times in the observatory's zone, and the sky for it.
  await slots.first().click();
  await expect(session).toContainText("18:00 – 18:30 GMT+4");
  await expect(session).toContainText("GEL");
  const targets = page.getByRole("radiogroup", { name: "Target" });
  await expect(targets.getByRole("radio", { name: /^Saturn, Up for the whole slot/ })).toBeEnabled();
  await expect(targets.getByRole("radio", { name: /^Albireo, Up for the whole slot/ })).toBeEnabled();
  await expect(targets.getByRole("radio", { name: /Hercules Cluster, Too low in the sky/ })).toBeDisabled();
  await expect(targets.getByRole("radio", { name: /Venus, Below the horizon/ })).toBeDisabled();
  await expect(targets.getByRole("radio", { name: /Moon, Larger than/ })).toBeDisabled();

  // Another night is a tab on the same board; its slots take the place of the first's.
  await nights.nth(2).click();
  await expect(nights.nth(2)).toHaveAttribute("aria-checked", "true");
  await expect(session).toContainText("Pick a half-hour");
});

test("the old reserve link lands on the board with its slot chosen", async ({ page }) => {
  await page.goto("/en/app/book/reserve?startAt=2026-09-25T14:00:00.000Z");
  await expect(page).toHaveURL(/\/en\/app\/book\?startAt=2026-09-25T14%3A00%3A00\.000Z$/);
  await expect(
    page.getByRole("radiogroup", { name: /^Observing time/ }).getByRole("radio").first(),
  ).toHaveAttribute("aria-checked", "true");
  await expect(page.locator(".board-sum")).toContainText("18:00 – 18:30");
});

test("the Georgian booking board fits a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ka/app/book");
  await expect(
    page.getByRole("heading", { level: 1, name: "დრო ტელესკოპთან." }),
  ).toBeVisible();
  await expect(
    page.getByRole("radiogroup", { name: /დაკვირვების დრო/ }).getByRole("radio").nth(1),
  ).toHaveAccessibleName(/დაჯავშნილია/);
  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);

  // The page keeps a side gutter: nothing runs to the screen's edge.
  for (const box of [
    await page.locator("h1").boundingBox(),
    await page.locator(".board-slots").boundingBox(),
  ]) {
    expect(box?.x).toBeGreaterThanOrEqual(16);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(390 - 16);
  }
});
