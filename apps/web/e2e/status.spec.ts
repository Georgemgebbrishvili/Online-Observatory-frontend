import { expect, test, type Page } from "@playwright/test";
import { field } from "./selectors";

// DV-073, against e2e/fake-platform.mjs: one simulated first-party observatory and
// three bookable hours, the last with no stored forecast.
const evidence = "../../docs/evidence/dv-073";
const firstCompile = 90_000;

test.describe.configure({ timeout: 2 * firstCompile });

async function shoot(page: Page, path: string) {
  const style = await page.addStyleTag({ content: ".skip-link { display: none; }" });
  await page.screenshot({ path, fullPage: true, animations: "disabled" });
  await style.evaluate((node: Element) => node.remove());
}

test("reports the observatory, and says the simulator is answering", async ({ page }) => {
  await page.goto("/en/status");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
    timeout: firstCompile,
  });
  // A page fed by the simulator must say so, unmistakably.
  await expect(page.getByText("SIMULATED OBSERVATORY")).toBeVisible();
  await expect(page.getByText("Stellar Tbilisi")).toBeVisible();
  await expect(page.getByText(/Reported \d+ (s|min|h) ago/)).toBeVisible();

  const now = field(page, "link");
  await expect(now.getByText("Online")).toBeVisible();
  await expect(field(page, "hold").getByText("No hold")).toBeVisible();

  await shoot(page, `${evidence}/01-status.png`);
});

test("shows an hour with no forecast as unknown, never as clear", async ({ page }) => {
  await page.goto("/en/status");
  await expect(page.getByRole("table")).toBeVisible({ timeout: firstCompile });

  await expect(page.locator("tbody tr")).toHaveCount(3);
  await expect(page.getByText("No forecast is stored for this hour.")).toBeVisible();
  // The unknown hour carries no numbers at all, so it cannot read as a clear one.
  const unknownRow = page.locator("tbody tr", {
    hasText: "No forecast is stored for this hour.",
  });
  await expect(unknownRow.locator("td")).toHaveCount(1);
});

test("calls the forecast advisory and keeps the operator's hold authoritative", async ({
  page,
}) => {
  await page.goto("/en/status");
  await expect(page.getByRole("heading", { name: "Tonight's conditions" })).toBeVisible({
    timeout: firstCompile,
  });
  await expect(page.getByText(/Advisory only/)).toBeVisible();
  await expect(page.getByText(/never starts or clears a weather hold/)).toBeVisible();
});

test("renders in Georgian", async ({ page }) => {
  await page.goto("/ka/status");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
    timeout: firstCompile,
  });
  await expect(page.getByText("SIMULATED OBSERVATORY")).toBeVisible();
  await expect(page.getByText("ამაღამის პირობები")).toBeVisible();
  await shoot(page, `${evidence}/02-status-georgian.png`);
});

test("the footer reaches the status page in both locales", async ({ page }) => {
  for (const locale of ["en", "ka"]) {
    await page.goto(`/${locale}`);
    await expect(page.locator(`footer a[href="/${locale}/status"]`)).toBeVisible();
  }
});

// The unreachable and no-observatory paths are read server-side, so page.route
// cannot reach them. They are covered in src/features/status/read.test.ts.
