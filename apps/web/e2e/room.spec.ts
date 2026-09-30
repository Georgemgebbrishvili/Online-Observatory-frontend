import { expect, test } from "@playwright/test";

// Phase 4 slice 1, against e2e/fake-platform.mjs: an observing M13 mission, a
// scheduled Saturn one, and a complete M13 one with three captures.
const observing = "20000000-0000-4000-8000-000000000001";
const scheduled = "21000000-0000-4000-8000-000000000002";
const complete = "22000000-0000-4000-8000-000000000003";

test("the room reads an observing mission from the platform", async ({ page }) => {
  await page.goto(`/en/app/missions/${observing}/session`);

  await expect(
    page.getByRole("heading", { level: 1, name: "Observing Hercules Cluster" }),
  ).toBeVisible();
  await expect(page.getByText("SIMULATED OBSERVATORY")).toBeVisible();

  // The steps come from the mission's state: Observe is the fourth.
  const steps = page.getByRole("region", { name: "Progress" });
  await expect(steps.getByText("Step 4 of 5")).toBeVisible();
  await expect(steps.locator('[aria-current="step"]')).toContainText("Observe");

  // The dial says whose position it shows.
  await expect(page.getByRole("img", { name: /Sky dial/ })).toBeVisible();
  await expect(
    page.getByText(/The target's position, not the telescope's/),
  ).toBeVisible();

  // Every page of the history, newest first.
  const history = page.getByRole("region", { name: "Mission history" }).locator("li");
  await expect(history).toHaveCount(7);
  await expect(history.first()).toContainText("Live observation started");
  await expect(history.last()).toContainText("Mission request created");

  // M13 has no plate: nothing on the page is presented as an illustration.
  await expect(page.getByText("Illustration — not telescope output")).toHaveCount(0);
});

test("a scheduled planet shows its plate, captioned as an illustration", async ({
  page,
}) => {
  await page.goto(`/en/app/missions/${scheduled}/session`);

  await expect(
    page.getByRole("heading", { level: 1, name: "Observation scheduled" }),
  ).toBeVisible();
  const preview = page.locator(".target-preview");
  await expect(preview.locator("img")).toHaveAttribute("src", "/plates/saturn.webp");
  // Served, not redirected to a localised path: the image decodes.
  await expect
    .poll(() =>
      preview.locator("img").evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);
  await expect(preview).toContainText("Illustration — not telescope output");
});

test("a complete mission shows its captures and every step done", async ({ page }) => {
  await page.goto(`/en/app/missions/${complete}/session`);

  await expect(
    page.getByRole("heading", { level: 1, name: "Observation complete" }),
  ).toBeVisible();
  await expect(page.locator('.mission-steps li[data-status="done"]')).toHaveCount(5);
  await expect(page.locator(".room-captures .capture-card")).toHaveCount(3);
});

test("the dashboard's upcoming mission opens its room", async ({ page }) => {
  await page.goto("/en/app");
  await expect(page.getByRole("link", { name: "Open mission: Saturn" })).toHaveAttribute(
    "href",
    `/en/app/missions/${scheduled}/session`,
  );
});

test("a mission that is not the caller's, or not a mission, is not found", async ({
  page,
}) => {
  // Not the status code: the loading boundary has already begun the stream.
  for (const id of ["DV-SIM-001", "29000000-0000-4000-8000-000000000009"]) {
    await page.goto(`/en/app/missions/${id}/session`);
    await expect(page.getByRole("heading", { level: 1 }), id).toHaveText(
      "Observation not found",
    );
  }
});

test("the Georgian room fits a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/ka/app/missions/${observing}/session`);

  await expect(
    page.getByRole("heading", { level: 1, name: "დაკვირვება მიმდინარეობს" }),
  ).toBeVisible();
  // On a phone only the current step keeps its name.
  await expect(
    page.locator(".mission-steps li[aria-current] .mission-step-name"),
  ).toBeVisible();
  const hidden = await page
    .locator(".mission-steps li:not([aria-current]) .mission-step-name")
    .first()
    .boundingBox();
  expect(hidden?.width).toBeLessThanOrEqual(1);

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);

  for (const box of [
    await page.locator("h1").boundingBox(),
    await page.locator(".live-feed").boundingBox(),
  ]) {
    expect(box?.x).toBeGreaterThanOrEqual(16);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(390 - 16);
  }
});
