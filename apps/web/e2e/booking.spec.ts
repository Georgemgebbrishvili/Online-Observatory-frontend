import { expect, test } from "@playwright/test";

import { fakeLocalTime, fakeSlotAt } from "./fake-night.mjs";

// The booking board (ADR-053 §7), against e2e/fake-platform.mjs: every night's
// 30-minute slots starting every quarter hour from astronomical dusk to dawn at Tbilisi
// (e2e/fake-night.mjs), the fifth booked and its neighbours held with it; Albireo and Saturn up for the whole of every slot, the Moon, M13 and
// Venus not.

// The old reserve link's slot: the first of a fixed night, and its end half an hour on.
const linkedSlot = fakeSlotAt("2026-09-25", 0);
const linkedStart = fakeLocalTime(linkedSlot);
const linkedEnd = fakeLocalTime(new Date(Date.parse(linkedSlot) + 30 * 60_000).toISOString());

test("/app/book is one board: the nights, a night's slots, and what is up for a chosen slot", async ({
  page,
}) => {
  await page.goto("/en/app/book");

  await expect(
    page.getByRole("heading", { level: 1, name: "Time on the telescope." }),
  ).toBeVisible();
  await expect(page.getByText(/simulated/i)).toHaveCount(0);

  const nights = page.getByRole("radiogroup", { name: "Choose a night" }).getByRole("radio");
  await expect(nights).toHaveCount(7);
  await expect(nights.first()).toHaveAttribute("aria-checked", "true");
  // Every start of the night is open but the booked one and the four it overlaps.
  // From the accessible name: the visible text runs the day's number into the count.
  const open = Number(/, (\d+) open/.exec((await nights.first().getAttribute("aria-label")) ?? "")?.[1]);
  expect(open).toBeGreaterThan(4);

  const slots = page.getByRole("radiogroup", { name: /^Observing time/ }).getByRole("radio");
  await expect(slots).toHaveCount(open + 5);
  const first = (await slots.first().locator("time").textContent())?.trim() ?? "";
  expect(first).toMatch(/^\d{2}:\d{2}$/);
  // Taken starts are struck out; they can be waited for, never reserved (ADR-068).
  for (const index of [2, 3, 4, 5, 6]) await expect(slots.nth(index)).toHaveClass(/is-taken/);
  await expect(slots.nth(4)).toHaveAccessibleName(/Booked/);
  await expect(slots.nth(7)).toBeEnabled();
  // Quarter-hour starts.
  expect(Number(first.slice(3)) % 15).toBe(0);
  await expect(page.getByText(/Observatory time · GMT\+4/)).toBeVisible();

  // Nothing chosen: the session asks for a start, and the button waits. The object is optional.
  const session = page.locator(".board-sum");
  await expect(session).toContainText("Pick a start");
  await expect(session).toContainText("Best in the sky");
  await expect(page.getByRole("button", { name: "Reserve and pay" })).toBeDisabled();

  // A start chosen: the price, the times in the observatory's zone, and the sky for it.
  await slots.first().click();
  await expect(session).toContainText(new RegExp(`${first} – \\d{2}:\\d{2} GMT\\+4`));
  await expect(session).toContainText("GEL");
  const targets = page.getByRole("radiogroup", { name: "Object" });
  await expect(targets.getByRole("radio", { name: /^Saturn, Up for the whole slot/ })).toBeEnabled();
  await expect(targets.getByRole("radio", { name: /^Albireo, Up for the whole slot/ })).toBeEnabled();
  await expect(targets.getByRole("radio", { name: /Hercules Cluster, Too low in the sky/ })).toBeDisabled();
  await expect(targets.getByRole("radio", { name: /Venus, Below the horizon/ })).toBeDisabled();
  await expect(targets.getByRole("radio", { name: /Moon, Larger than/ })).toBeDisabled();

  // Another night is a tab on the same board; its slots take the place of the first's.
  await nights.nth(2).click();
  await expect(nights.nth(2)).toHaveAttribute("aria-checked", "true");
  await expect(session).toContainText("Pick a start");
});

test("the old reserve link lands on the board with its slot chosen", async ({ page }) => {
  await page.goto(`/en/app/book/reserve?startAt=${linkedSlot}`);
  await expect(page).toHaveURL(
    new RegExp(`/en/app/book\\?startAt=${encodeURIComponent(linkedSlot).replace(/\./g, "\\.")}$`),
  );
  await expect(
    page.getByRole("radiogroup", { name: /^Observing time/ }).getByRole("radio").first(),
  ).toHaveAttribute("aria-checked", "true");
  await expect(page.locator(".board-sum")).toContainText(`${linkedStart} – ${linkedEnd}`);
});

test("the Georgian booking board fits a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ka/app/book");
  await expect(
    page.getByRole("heading", { level: 1, name: "დრო ტელესკოპთან." }),
  ).toBeVisible();
  await expect(
    page.getByRole("radiogroup", { name: /დაკვირვების დრო/ }).getByRole("radio").nth(4),
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
