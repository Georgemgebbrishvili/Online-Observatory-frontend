import { expect, test } from "@playwright/test";
import { field } from "./selectors";

// Against e2e/fake-platform.mjs: one simulated first-party observatory with a live
// mission. The fake keeps state across requests, so these run in order.
const observatoryId = "10000000-0000-4000-8000-000000000001";
const firstCompile = 90_000;
test.describe.configure({ mode: "serial", timeout: 2 * firstCompile });

test.describe("operator", () => {
  test.use({ storageState: "e2e/.auth/operator.json" });

  test("shows live telemetry, SIMULATED, and Emergency Park on both routes", async ({
    page,
  }) => {
    for (const path of ["/en/admin", "/en/admin/control"]) {
      await page.goto(path);
      await expect(page.getByText("SIMULATED OBSERVATORY")).toBeVisible({
        timeout: firstCompile,
      });
      await expect(page.getByRole("button", { name: "Emergency Park" })).toBeEnabled();
    }

    await page.goto("/en/admin");
    await expect(page.getByText("RA 16h 41m 42.0s · DEC +36° 27′ 36″")).toBeVisible();
    await expect(page.getByText("UNMEASURED — every slew is refused")).toBeVisible();
    await expect(page.getByText(/Reported \d+ s ago/)).toBeVisible();
  });

  test("offers GoTo only for targets with fixed coordinates", async ({ page }) => {
    await page.goto("/en/admin/control");
    const options = page.getByLabel("Target").locator("option");
    await expect(options).toHaveText(["M13 · Hercules Cluster"]);
  });

  test("switches to REAL only after presence is affirmed, then back", async ({
    page,
  }) => {
    await page.goto("/en/admin/control");
    await page.getByRole("button", { name: "Switch to REAL…" }).click();

    const dialog = page.getByRole("dialog", { name: "Switch to real hardware" });
    await expect(
      dialog.getByText("A physically present operator is required.", { exact: false }),
    ).toBeVisible();
    const submit = dialog.getByRole("button", { name: "Switch to REAL" });
    await dialog.getByLabel("Reason").fill("Supervised first light");
    await expect(submit).toBeDisabled();
    await dialog.getByText("I am physically present at the observatory").click();
    await expect(submit).toBeEnabled();

    const request = page.waitForRequest(
      `**/api/admin/observatories/${observatoryId}/mode`,
    );
    await submit.click();
    expect((await request).postDataJSON()).toEqual({
      mode: "REAL",
      reason: "Supervised first light",
      attendedOperatorPresent: true,
    });
    await expect(page.getByText("REAL HARDWARE")).toBeVisible();

    await page.getByRole("button", { name: "Return to SIMULATED…" }).click();
    const back = page.getByRole("dialog", { name: "Return to the simulator" });
    await back.getByLabel("Reason").fill("End of supervised session");
    await back.getByRole("button", { name: "Switch to SIMULATED" }).click();
    await expect(page.getByText("SIMULATED OBSERVATORY")).toBeVisible();
  });

  test("Emergency Park parks the simulated mission in one click", async ({ page }) => {
    await page.goto("/en/admin");
    await expect(page.getByText("SIMULATED OBSERVATORY")).toBeVisible({
      timeout: firstCompile,
    });

    const override = page.waitForResponse("**/api/admin/override");
    await page.getByRole("button", { name: "Emergency Park" }).click();
    const response = await override;
    expect(response.status()).toBe(202);
    expect(response.request().postDataJSON()).toMatchObject({
      type: "PARK",
      payload: { kind: "PARK" },
    });

    await expect(page.getByText("The mount reports parked.")).toBeVisible({
      timeout: 10_000,
    });
    await expect(field(page, "parked").locator("dd")).toHaveText("Yes");
  });
});

test.describe("non-operator", () => {
  test.use({ storageState: "e2e/.auth/observer.json" });

  test("is sent back to the app, and the API refuses the console's data", async ({
    page,
  }) => {
    await page.goto("/en/admin/control");
    await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });

    const response = await page.request.get(
      `/api/admin/observatories/${observatoryId}/state`,
    );
    expect(response.status()).toBe(403);
  });
});
