import { expect, test as setup } from "@playwright/test";

// A cold `next dev` compiles each route on its first visit, which takes longer
// than the default five seconds.
const firstCompile = 90_000;
setup.describe.configure({ timeout: 2 * firstCompile });

// One signed-in session per role, reused by every test that needs one.
for (const role of ["observer", "operator"] as const) {
  setup(`sign in as the ${role}`, async ({ page }) => {
    await page.goto("/en/sign-in");
    await page.getByLabel("Email").fill(`${role}@darkview.test`);
    await page.getByLabel("Password").fill("correct horse battery");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });
    await page.context().storageState({ path: `e2e/.auth/${role}.json` });
  });
}
