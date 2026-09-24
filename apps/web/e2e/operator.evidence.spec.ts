import { expect, test } from "@playwright/test";

// DV-077 evidence. This does not assert behaviour -- operator.spec.ts does that. It
// walks the console against e2e/fake-platform.mjs and writes the screenshots that
// docs/evidence/dv-077/README.md indexes, so a reviewer sees what the tests exercise.
const evidence = "../../docs/evidence/dv-077";
const firstCompile = 90_000;

// The fake platform holds mode and parked state in process, so order matters: the
// unparked overview has to be captured before Emergency Park lands.
test.describe.configure({ mode: "serial", timeout: 2 * firstCompile });

test.use({ storageState: "e2e/.auth/operator.json" });

test("overview and control, simulated", async ({ page }) => {
  await page.goto("/en/admin");
  await expect(page.getByText("SIMULATED OBSERVATORY")).toBeVisible({
    timeout: firstCompile,
  });
  await expect(page.getByText(/Reported \d+ s ago/)).toBeVisible();
  await page.screenshot({
    path: `${evidence}/01-overview-simulated.png`,
    fullPage: true,
  });

  await page.goto("/en/admin/control");
  await expect(page.getByLabel("Target")).toBeVisible({ timeout: firstCompile });
  await page.screenshot({ path: `${evidence}/02-control-simulated.png`, fullPage: true });
});

test("the REAL switch demands an attended operator", async ({ page }) => {
  await page.goto("/en/admin/control");
  await page.getByRole("button", { name: "Switch to REAL…" }).click();

  const dialog = page.getByRole("dialog", { name: "Switch to real hardware" });
  await dialog.getByLabel("Reason").fill("Supervised first light");
  // Captured with the reason given and presence not yet affirmed: submit stays disabled.
  await expect(dialog.getByRole("button", { name: "Switch to REAL" })).toBeDisabled();
  await page.screenshot({ path: `${evidence}/03-real-switch-dialog.png` });

  await dialog.getByText("I am physically present at the observatory").click();
  await dialog.getByRole("button", { name: "Switch to REAL" }).click();
  await expect(page.getByText("REAL HARDWARE")).toBeVisible();
  await page.screenshot({ path: `${evidence}/04-real-hardware-banner.png` });

  await page.getByRole("button", { name: "Return to SIMULATED…" }).click();
  const back = page.getByRole("dialog", { name: "Return to the simulator" });
  await back.getByLabel("Reason").fill("End of supervised session");
  await back.getByRole("button", { name: "Switch to SIMULATED" }).click();
  await expect(page.getByText("SIMULATED OBSERVATORY")).toBeVisible();
});

test("the console in Georgian", async ({ page }) => {
  await page.goto("/ka/admin");
  await expect(page.getByText("SIMULATED OBSERVATORY")).toBeVisible({
    timeout: firstCompile,
  });
  await page.screenshot({ path: `${evidence}/05-overview-georgian.png`, fullPage: true });
});

test("Emergency Park", async ({ page }) => {
  await page.goto("/en/admin");
  await expect(page.getByText("SIMULATED OBSERVATORY")).toBeVisible({
    timeout: firstCompile,
  });
  await page.getByRole("button", { name: "Emergency Park" }).click();
  await expect(page.getByText("The mount reports parked.")).toBeVisible({
    timeout: 10_000,
  });
  await page.screenshot({ path: `${evidence}/06-parked.png`, fullPage: true });
});
