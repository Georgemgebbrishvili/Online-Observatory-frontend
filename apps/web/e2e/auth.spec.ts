import { expect, test } from "@playwright/test";

// A cold `next dev` compiles each route on its first visit, which takes longer
// than the default five seconds.
const firstCompile = 90_000;
test.describe.configure({ timeout: 2 * firstCompile });

// Against e2e/fake-platform.mjs, which enforces ADR-016's rules the way the API does.
const password = "correct horse battery";

async function signIn(
  page: import("@playwright/test").Page,
  email: string,
  secret = password,
) {
  await page.goto("/en/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(secret);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("signs in through /api and reaches the app on the session the API set", async ({
  page,
  context,
}) => {
  await signIn(page, "observer@darkview.test");
  await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });

  const names = (await context.cookies()).map((cookie) => cookie.name).sort();
  expect(names).toEqual(["darkview_csrf", "darkview_session"]);
});

test("refuses a wrong password without leaving the sign-in page", async ({ page }) => {
  await signIn(page, "observer@darkview.test", "not the password");
  await expect(page.locator(".auth-form-error")).toHaveText(
    "Email or password is incorrect.",
  );
  await expect(page).toHaveURL(/\/en\/sign-in$/, { timeout: firstCompile });
});

test("treats a session cookie without its CSRF cookie as signed out", async ({
  page,
  context,
}) => {
  await signIn(page, "observer@darkview.test");
  await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });

  await context.clearCookies({ name: "darkview_csrf" });
  await page.goto("/en/app");
  await expect(page).toHaveURL(/\/en\/sign-in$/, { timeout: firstCompile });
});

test("signs out and ends the session", async ({ page }) => {
  await signIn(page, "observer@darkview.test");
  await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });

  await page.waitForLoadState("networkidle");
  await page.locator(".app-logout-form").getByRole("button").click();
  await expect(page).toHaveURL(/\/en\/sign-in$/, { timeout: firstCompile });

  await page.goto("/en/app");
  await expect(page).toHaveURL(/\/en\/sign-in$/, { timeout: firstCompile });
});
