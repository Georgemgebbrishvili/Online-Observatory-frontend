import { expect, test } from "@playwright/test";

// Phase 4 slice 4, against e2e/fake-platform.mjs: the owner opens the observing mission
// to observers, copies the watch link, and closes it again.
const observing = "20000000-0000-4000-8000-000000000001";

test("the owner opens the session, copies the watch link, and closes it again", async ({
  page,
}) => {
  await page.goto(`/en/app/missions/${observing}/session`);
  const sharing = page.getByRole("region", { name: "Sharing" });
  await expect(sharing).toContainText("Only you can see this session.");

  const request = page.waitForRequest((sent) =>
    sent.url().endsWith(`/api/missions/${observing}/observation`),
  );
  await sharing.getByRole("button", { name: "Let others watch" }).click();
  expect((await request).postDataJSON()).toEqual({ observable: true });
  await expect(sharing).toContainText("Others can watch. 0 of 5 seats taken.");

  // The link to slice 5's watch page, absolute, on the clipboard.
  await page
    .context()
    .grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: "http://localhost:3100",
    });
  await sharing.getByRole("button", { name: "Copy watch link" }).click();
  await expect(sharing).toContainText("Link copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    `http://localhost:3100/en/app/missions/${observing}/watch`,
  );

  await sharing.getByRole("button", { name: "Stop sharing" }).click();
  await sharing
    .getByRole("group", { name: "Stop sharing?" })
    .getByRole("button", { name: "Stop sharing" })
    .click();
  await expect(sharing).toContainText("Only you can see this session.");
});

test("the Georgian sharing panel fits a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/ka/app/missions/${observing}/session`);
  const sharing = page.getByRole("region", { name: "გაზიარება" });
  await sharing.getByRole("button", { name: "ნება დართეთ სხვებს უყურონ" }).click();
  await expect(sharing).toContainText("დაკავებულია 0 ადგილი 5-დან.");
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});
