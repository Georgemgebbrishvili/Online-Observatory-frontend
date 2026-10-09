import { createHash } from "node:crypto";

import { expect, test } from "@playwright/test";
import { appSidebar } from "./selectors";

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

// Platform ADR-048. The button is a link; the fake stands in for Google and the
// platform both, and the session arrives as cookies exactly as a password's does.
test("signs in with Google through the platform's redirect and lands in the app", async ({
  page,
  context,
}) => {
  await page.goto("/en/sign-in");
  await page.getByRole("link", { name: "Continue with Google" }).click();
  await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });
  const names = (await context.cookies()).map((cookie) => cookie.name).sort();
  expect(names).toEqual(["darkview_csrf", "darkview_session"]);
});

test("says so, on the sign-in page, when Google sign-in did not complete", async ({
  page,
}) => {
  await page.goto("/ka/register");
  await expect(page.getByRole("link", { name: "Google-ით გაგრძელება" })).toHaveAttribute(
    "href",
    "/api/auth/google/start?locale=ka",
  );
  await page.goto("/api/auth/google/start?locale=ka&outcome=refused");
  await expect(page).toHaveURL(/\/ka\/sign-in\?error=google$/, { timeout: firstCompile });
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "Google-ით შესვლა ვერ დასრულდა. სცადე ხელახლა, ან შედი ელფოსტითა და პაროლით.",
  );
});

test("refuses a wrong password without leaving the sign-in page", async ({ page }) => {
  await signIn(page, "observer@darkview.test", "not the password");
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
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
  await appSidebar(page).getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/en\/sign-in$/, { timeout: firstCompile });

  await page.goto("/en/app");
  await expect(page).toHaveURL(/\/en\/sign-in$/, { timeout: firstCompile });
});

// Platform ADR-049: the demo, with no email to send, verifies at once and signs in.
test("lands in the app when the platform verified the address at once", async ({
  page,
  context,
}) => {
  await page.goto("/en/register");
  await page.getByLabel("Name").fill("Demo Observer");
  await page.getByLabel("Email").fill(`new-${Date.now()}@demo.test`);
  await page.getByLabel("Password").fill("a long enough password");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });
  const names = (await context.cookies()).map((cookie) => cookie.name).sort();
  expect(names).toEqual(["darkview_csrf", "darkview_session"]);
});

test("creates an account, and asks for the email before any session", async ({
  page,
  context,
}) => {
  const email = `new-${Date.now()}@example.com`;
  const secret = "a long enough password";

  await page.goto("/en/register");
  await page.getByLabel("Name").fill("New Observer");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(secret);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/en\/verify-email$/, { timeout: firstCompile });
  // ADR-016: no session until the address is verified.
  expect((await context.cookies()).map((cookie) => cookie.name)).not.toContain(
    "darkview_session",
  );

  await signIn(page, email, secret);
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "Verify your email before signing in.",
  );
});

// ADR-040. The fake platform derives a reset token from the address, as
// e2e/fake-platform.mjs explains, so the test can open the link it asked for.
const resetLink = (locale: string, email: string) =>
  `/${locale}/reset-password/${createHash("sha256").update(`reset:${email}`).digest("base64url")}`;

test("resets a forgotten password from the sign-in page, and signs in with the new one", async ({
  page,
  context,
}) => {
  const email = "forgetful@darkview.test";
  const secret = `a new password ${Date.now()}`;

  await page.goto("/en/sign-in");
  await page.getByRole("link", { name: "Forgot your password?" }).click();
  await expect(page).toHaveURL(/\/en\/reset-password$/, { timeout: firstCompile });
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Send link" }).click();
  await expect(page).toHaveURL(/\/en\/reset-password\?sent=1$/, {
    timeout: firstCompile,
  });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Check your email.");

  await page.goto(resetLink("en", email));
  await page.getByLabel("New password").fill(secret);
  await page.getByRole("button", { name: "Set password" }).click();
  await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });

  // The link worked once.
  await context.clearCookies();
  await page.goto(resetLink("en", email));
  await page.getByLabel("New password").fill("yet another long password");
  await page.getByRole("button", { name: "Set password" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "This link is invalid, used or expired.",
  );
  await expect(page.getByRole("link", { name: "Send a new link" })).toHaveAttribute(
    "href",
    "/en/reset-password",
  );

  await signIn(page, email, secret);
  await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });
});

test("answers an unknown address exactly as a known one, in Georgian", async ({
  page,
}) => {
  await page.goto("/ka/reset-password");
  await page.getByLabel("ელფოსტა").fill(`nobody-${Date.now()}@example.com`);
  await page.getByRole("button", { name: "ბმულის გაგზავნა" }).click();
  await expect(page).toHaveURL(/\/ka\/reset-password\?sent=1$/, {
    timeout: firstCompile,
  });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("შეამოწმე ელფოსტა.");
});

test("refuses a short new password before asking the platform", async ({ page }) => {
  await page.goto(resetLink("en", "observer@darkview.test"));
  const field = page.getByLabel("New password");
  // The browser's own minLength check would stop the form; this is the page's.
  await field.evaluate((input: HTMLInputElement) => input.removeAttribute("minlength"));
  await field.fill("too short");
  await page.getByRole("button", { name: "Set password" }).click();
  await expect(
    page.getByText("Use a password between 12 and 128 characters."),
  ).toBeVisible();
});

test("offers a new link when the reset link was mangled on its way out of the email", async ({
  page,
}) => {
  // Shorter than the contract's sixteen characters: the platform refuses the token itself.
  await page.goto("/en/reset-password/cut-short");
  await page.getByLabel("New password").fill("a long enough new password");
  await page.getByRole("button", { name: "Set password" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "This link is invalid, used or expired.",
  );
});
