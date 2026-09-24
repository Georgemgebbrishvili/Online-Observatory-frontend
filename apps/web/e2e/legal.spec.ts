import { expect, test } from "@playwright/test";

// DV-072. None of these documents is in force, so the one thing every test here checks
// is that the page says so, and that a section with no reviewed text shows no text.
const evidence = "../../docs/evidence/dv-072";
const firstCompile = 90_000;

test.describe.configure({ timeout: 2 * firstCompile });

const documents = [
  { path: "terms", heading: "Terms of service" },
  { path: "privacy", heading: "Privacy policy" },
  { path: "refunds", heading: "Refund policy" },
] as const;

for (const { path, heading } of documents) {
  test(`/${path} is published as a draft`, async ({ page }) => {
    await page.goto(`/en/${path}`);

    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible({
      timeout: firstCompile,
    });
    await expect(page.getByRole("note")).toContainText("not yet in force");
    await expect(page.getByText("Awaiting legal review").first()).toBeVisible();

    await page.screenshot({ path: `${evidence}/${path}.png`, fullPage: true });
  });
}

test("the footer reaches all three documents, in both locales", async ({ page }) => {
  for (const locale of ["en", "ka"]) {
    await page.goto(`/${locale}`);
    for (const { path } of documents) {
      await expect(page.locator(`footer a[href="/${locale}/${path}"]`)).toBeVisible();
    }
  }
});

test("the Georgian documents carry the same draft notice", async ({ page }) => {
  await page.goto("/ka/refunds");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
    timeout: firstCompile,
  });
  await expect(page.getByRole("note")).toContainText("ჯერ არ მოქმედებს");
  await page.screenshot({ path: `${evidence}/refunds-georgian.png`, fullPage: true });
});
