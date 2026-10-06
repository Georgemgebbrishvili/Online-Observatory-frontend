import { expect, test, type Page } from "@playwright/test";

// Phase 4 slice 3, against e2e/fake-platform.mjs: `submitMissionCommand` and the agent's
// verdict on the mission channel. The `fake_command` cookie picks the outcome for this
// browser context only: unset (accepted), refuse, cloud, silent.
const observing = "20000000-0000-4000-8000-000000000001";

async function outcome(page: Page, value: string) {
  await page
    .context()
    .addCookies([{ name: "fake_command", value, url: "http://localhost:3100" }]);
}

async function openRoom(page: Page, locale = "en") {
  // Its own room: the verdicts on other tests' commands, a stop among them, stay there.
  await page.context().addCookies([
    { name: "fake_room", value: crypto.randomUUID(), url: "http://localhost:3100" },
  ]);
  await page.goto(`/${locale}/app/missions/${observing}/session`);
  await expect(page.locator(".live-feed")).toHaveAttribute("data-live-status", "live");
}

const status = (page: Page) => page.locator(".room-controls-status");

test("a nudge is relayed, answered by the telescope, and the controls unlock", async ({
  page,
}) => {
  await openRoom(page);
  const controls = page.getByRole("region", { name: "Controls" });
  const request = page.waitForRequest((sent) =>
    sent.url().endsWith(`/api/missions/${observing}/command`),
  );
  await controls.getByRole("button", { name: "Higher, 2 arcminutes" }).click();

  expect((await request).postDataJSON()).toEqual({
    type: "NUDGE",
    nudge: { kind: "NUDGE", axis: "ALTITUDE", direction: "POSITIVE", stepArcminutes: 2 },
  });
  await expect(status(page)).toHaveText("Moved higher.");
  await expect(
    controls.getByRole("button", { name: "Lower, 2 arcminutes" }),
  ).toBeEnabled();
});

test("a capture runs, and the controls return when it is done", async ({ page }) => {
  await openRoom(page);
  const controls = page.getByRole("region", { name: "Controls" });
  // Capture is the one primary action, under the feed with the steps.
  const capture = page.locator(".live-feed-action").getByRole("button", {
    name: "Capture",
  });
  await capture.click();

  await expect(
    controls.getByText("Capturing. The controls return when it is done."),
  ).toBeVisible();
  await expect(capture).toBeVisible();
});

test("the telescope's own refusal is named, though the cloud approved it", async ({
  page,
}) => {
  await outcome(page, "refuse");
  await openRoom(page);
  await page.getByRole("button", { name: "Right, 2 arcminutes" }).click();
  await expect(status(page)).toHaveText(
    "That would go past how far you can move from the target. Re-centre to continue.",
  );
});

test("the cloud's safety refusal is named, and nothing is retried", async ({ page }) => {
  await outcome(page, "cloud");
  await openRoom(page);
  let sent = 0;
  page.on("request", (request) => {
    if (request.url().endsWith("/command")) sent += 1;
  });
  await page.getByRole("button", { name: "Re-centre" }).click();
  await expect(status(page)).toHaveText(
    "The telescope's safe range has not been measured, so it will not move.",
  );
  expect(sent).toBe(1);
});

test("a command with no answer gives up at its deadline", async ({ page }) => {
  await outcome(page, "silent");
  await openRoom(page);
  await page.getByRole("button", { name: "Left, 2 arcminutes" }).click();
  await expect(status(page)).toHaveText("No answer from the telescope. Try again.");
  await expect(page.getByRole("button", { name: "Left, 2 arcminutes" })).toBeEnabled();
});

test("stopping asks first, then ends the observation", async ({ page }) => {
  await openRoom(page);
  // Stop lives in the session panel, beside the hand control.
  const session = page.getByRole("region", { name: "Session" });
  await session.getByRole("button", { name: "Stop" }).click();

  const confirm = session.getByRole("group", { name: "Stop the observation?" });
  await expect(confirm).toContainText("your remaining time is not returned");
  await confirm.getByRole("button", { name: "Stop" }).click();

  // The customer's own stop is CANCELLED: an observation stopped short (A4).
  await expect(page.locator(".live-feed")).toHaveAttribute("data-live-status", "stopped");
  await expect(
    page.getByRole("heading", { level: 1, name: "Mission cancelled" }),
  ).toBeVisible();
  await expect(page.getByRole("region", { name: "Controls" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Session" })).toHaveCount(0);
});

test("the Georgian controls fit a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openRoom(page, "ka");
  await expect(page.getByRole("region", { name: "მართვა" })).toBeVisible();
  await expect(page.getByRole("button", { name: "გადაღება" })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});
