import { expect, test, type Page } from "@playwright/test";

// Phase 6.10, the keyboard half of roadmap E2: the Phase 6 surfaces worked from the
// keyboard alone. Each Tab lands on something named and visibly focused; nothing is
// reachable only by pointer. Screen-reader wording is checked through accessible names.

/** Tab until the focused element's name matches, up to a limit; fail with what was visited. */
async function tabTo(page: Page, name: RegExp, limit = 60) {
  const seen: string[] = [];
  for (let i = 0; i < limit; i += 1) {
    await page.keyboard.press("Tab");
    // Roughly the accessible name -- aria-label, then a <label>, then the text -- and
    // whether the eye can see where focus is: an outline or a box-shadow.
    const focused = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement | null;
      if (!element || element === document.body) return null;
      const style = getComputedStyle(element);
      return {
        // textContent, not innerText: a label styled in capitals is not shouted to a
        // screen reader, and neither should it be here.
        name: (
          element.getAttribute("aria-label") ??
          (element as HTMLInputElement).labels?.[0]?.textContent ??
          element.textContent ??
          ""
        )
          .replace(/\s+/g, " ")
          .trim(),
        ring:
          (style.outlineStyle !== "none" && style.outlineWidth !== "0px") ||
          style.boxShadow !== "none",
      };
    });
    if (!focused) continue;
    seen.push(focused.name);
    if (name.test(focused.name)) {
      expect(focused.ring, `focus ring on ${focused.name}`).toBe(true);
      return page.locator(":focus");
    }
  }
  throw new Error(`never reached ${name}; visited: ${seen.join(" | ")}`);
}

test("the skip link goes straight to the content", async ({ page }) => {
  await page.goto("/en/tonight");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toHaveText("Skip to content");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
});

test("Tonight, live is read and left by keyboard", async ({ page }) => {
  await page.goto("/en/tonight");
  await expect(
    page.getByRole("heading", { level: 1, name: "Tonight, live" }),
  ).toBeAttached();
  const book = await tabTo(page, /^Book a session$/);
  await book.press("Enter");
  await expect(page).toHaveURL(/\/en\/app\/book/);
});

test("the gift form is filled and sent by keyboard", async ({ page }) => {
  await page.goto("/en/gift");
  await tabTo(page, /^Their name \(optional\)/);
  await page.keyboard.type("Dato");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toHaveAccessibleName(/^Their email \(optional\)/);
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toHaveAccessibleName(/^A note \(optional\)/);
  await tabTo(page, /Continue to payment/);
});

test("a taken start is waited for by keyboard, and the answer is spoken", async ({
  page,
}) => {
  await page.goto("/en/app/book");
  // Not the first: e2e/waitlist.spec.ts waits for that one as the same account.
  const taken = page.locator(".time-cell.is-taken").nth(2);
  await taken.focus();
  await expect(taken).toHaveAccessibleName(/Booked, Forecast: /);
  await page.keyboard.press("Enter");
  await expect(taken).toHaveAttribute("aria-pressed", "true");
  const join = await tabTo(page, /Join the waitlist/, 20);
  await join.press("Enter");
  // A role=status region: a screen reader says it without moving focus.
  await expect(page.getByRole("status").filter({ hasText: "in line" })).toBeVisible();
});

test("the presenter view is switched on and off by keyboard", async ({ page }) => {
  await page.goto("/en/app/missions/20000000-0000-4000-8000-000000000001/session");
  const on = await tabTo(page, /^Presenter view$/);
  await on.press("Enter");
  await expect(page).toHaveURL(/\?present/);
  const off = await tabTo(page, /^Leave presenter view$/);
  await off.press("Enter");
  await expect(page).not.toHaveURL(/\?present/);
});

test("the quarter hours are one Tab stop: the arrow keys move, Enter sets the start and the end", async ({
  page,
}) => {
  await page.goto("/en/app/book");
  const starts = page
    .getByRole("group", { name: /^Observing time/ })
    .getByRole("button");
  // One start takes Tab; the rest wait for the arrow keys.
  await expect(starts.and(page.locator('[tabindex="0"]'))).toHaveCount(1);
  const open = page.locator(".time-cell.is-open").first();
  await open.focus();
  await open.press("Enter");
  await expect(open).toHaveAttribute("aria-pressed", "true");
  // The arrows move focus without choosing; Enter on a later quarter hour is the end.
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".time-cell:focus")).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("Enter");
  await expect(page.locator(".time-cell:focus")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".board-sum output")).toHaveText("45 min");
});
