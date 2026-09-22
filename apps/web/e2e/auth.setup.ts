import { expect, test as setup } from "@playwright/test";

// A cold `next dev` compiles each route on its first visit, which takes longer
// than the default five seconds.
const firstCompile = 90_000;
setup.describe.configure({ timeout: 2 * firstCompile });

// One signed-in observer session, reused by every test that needs one.
setup("sign in as the observer", async ({ page }) => {
  await page.goto("/en/sign-in");
  await page.getByLabel("Email").fill("observer@darkview.test");
  await page.getByLabel("Password").fill("correct horse battery");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });
  await page.context().storageState({ path: "e2e/.auth/observer.json" });
});
