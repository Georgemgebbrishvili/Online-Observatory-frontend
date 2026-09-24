import { expect, test, type Page } from "@playwright/test";

// DV-078, against e2e/fake-platform.mjs: three missions, three audit events, two
// targets, paged two at a time so the cursor is exercised rather than assumed.
const evidence = "../../docs/evidence/dv-078";
const firstCompile = 90_000;
const liveMissionId = "20000000-0000-4000-8000-000000000001";

// The fake holds mission and target state in process, so cancel runs last.
test.describe.configure({ mode: "serial", timeout: 2 * firstCompile });

test.use({ storageState: "e2e/.auth/operator.json" });

/**
 * The skip link is correctly off-screen in the browser -- fixed, translated above the
 * viewport, unfocused -- but a full-page screenshot composites position:fixed elements
 * into the stitched image, where it lands over a heading. Hidden for the capture only;
 * nothing about the page itself changes.
 */
/** The audit stream, found by its section's name rather than its list's class. */
function auditEvents(page: Page) {
  return page.getByRole("region", { name: "Audit log" }).getByRole("listitem");
}

async function shoot(page: Page, path: string, fullPage = true) {
  const style = await page.addStyleTag({ content: ".skip-link { display: none; }" });
  // animations: "disabled" finishes the dialog's transition first, so a capture taken
  // the moment a dialog opens shows it settled rather than half faded in.
  await page.screenshot({ path, fullPage, animations: "disabled" });
  await style.evaluate((node: Element) => node.remove());
}

test("missions list, filter by state, and page", async ({ page }) => {
  await page.goto("/en/admin/missions");
  await expect(page.getByRole("heading", { name: "Missions" })).toBeVisible({
    timeout: firstCompile,
  });

  // Two of three on the first page: the third needs the cursor.
  await expect(page.locator("tbody tr")).toHaveCount(2);
  await page.getByRole("button", { name: "Load more" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(3);
  await expect(page.getByRole("table").getByText("Observing")).toBeVisible();

  await shoot(page, `${evidence}/01-missions.png`);

  await page.getByLabel("State").selectOption("COMPLETE");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Load more" })).toBeHidden();
});

test("a completed mission offers no cancel", async ({ page }) => {
  await page.goto("/en/admin/missions");
  await page.getByLabel("State").selectOption("COMPLETE");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Cancel mission…" })).toBeHidden();
});

test("targets enable and disable against the platform's answer", async ({ page }) => {
  await page.goto("/en/admin/targets");
  await expect(page.getByRole("heading", { name: "Targets" })).toBeVisible({
    timeout: firstCompile,
  });

  const saturn = page.locator("tbody tr", { hasText: "Saturn" });
  await expect(saturn.getByText("Yes", { exact: true })).toBeVisible();
  await shoot(page, `${evidence}/02-targets.png`);

  const request = page.waitForRequest(
    (candidate) =>
      candidate.url().includes("/api/admin/targets/") && candidate.method() === "PATCH",
  );
  await saturn.getByRole("button", { name: "Disable" }).click();
  expect((await request).postDataJSON()).toEqual({ enabled: false });

  await expect(page.getByText("Saturn is now disabled.")).toBeVisible();
  await expect(saturn.getByText("No", { exact: true })).toBeVisible();
  await expect(saturn.getByRole("button", { name: "Enable" })).toBeVisible();
});

test("the audit log filters by category, and by mission from the missions table", async ({
  page,
}) => {
  await page.goto("/en/admin/logs");
  await expect(page.getByRole("heading", { name: "Audit log" })).toBeVisible({
    timeout: firstCompile,
  });
  await expect(auditEvents(page)).toHaveCount(2);
  await page.getByRole("button", { name: "Load more" }).click();
  await expect(auditEvents(page)).toHaveCount(3);
  await shoot(page, `${evidence}/03-logs.png`);

  await page.getByLabel("Category").selectOption("AGENT_LINK");
  await expect(auditEvents(page)).toHaveCount(1);
  await expect(page.getByText("agent.connected")).toBeVisible();

  // The missions table links straight to this mission's correlated events.
  await page.goto(`/en/admin/logs?mission=${liveMissionId}`);
  await expect(auditEvents(page)).toHaveCount(2);
  await expect(page.getByText("agent.connected")).toBeHidden();

  // Clearing the filter starts a fresh first page rather than appending to the old
  // one, so the third event needs the cursor again.
  await page.getByRole("button", { name: "Show every mission" }).click();
  await expect(auditEvents(page)).toHaveCount(2);
  await page.getByRole("button", { name: "Load more" }).click();
  await expect(page.getByText("agent.connected")).toBeVisible();
});

test("cancelling a mission demands a settlement and a reason, and is audited", async ({
  page,
}) => {
  await page.goto("/en/admin/missions");
  await expect(page.getByRole("heading", { name: "Missions" })).toBeVisible({
    timeout: firstCompile,
  });

  await page
    .locator("tbody tr", { hasText: "Observing" })
    .getByRole("button", { name: "Cancel mission…" })
    .click();

  const dialog = page.getByRole("dialog", { name: "Cancel this mission" });
  const submit = dialog.getByRole("button", { name: "Cancel mission" });
  await expect(submit).toBeDisabled();
  await shoot(page, `${evidence}/04-cancel-dialog.png`, false);

  await dialog.getByLabel("Settlement").selectOption("REFUND");
  await dialog.getByLabel("Reason").fill("Cloud closed in");
  await expect(submit).toBeEnabled();

  const request = page.waitForRequest((candidate) =>
    candidate.url().includes(`/api/admin/missions/${liveMissionId}/cancel`),
  );
  await submit.click();
  expect((await request).postDataJSON()).toEqual({
    reason: "Cloud closed in",
    resolution: "REFUND",
  });

  await expect(page.locator("tbody tr").first().getByText("Cancelled")).toBeVisible();
  await shoot(page, `${evidence}/05-cancelled.png`);

  // The cancellation is in the audit log, with the reason recorded verbatim.
  await page.goto("/en/admin/logs");
  await expect(page.getByText("mission.cancelled")).toBeVisible();
  await expect(page.getByText(/Cloud closed in/)).toBeVisible();
});

test("a non-operator reaches none of it", async ({ browser }) => {
  const context = await browser.newContext({ storageState: "e2e/.auth/observer.json" });
  const observer = await context.newPage();
  await observer.goto("/en/admin/missions");
  await expect(observer).toHaveURL(/\/en\/app$/, { timeout: firstCompile });

  const response = await observer.request.get("/api/admin/missions");
  expect(response.status()).toBe(403);
  await context.close();
});
