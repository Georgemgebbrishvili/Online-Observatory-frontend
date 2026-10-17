# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> refuses a wrong password without leaving the sign-in page
- Location: ../../../../../../../private/tmp/stellar-prod-tests/e2e/auth.spec.ts:36:1

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  getByRole('main').getByRole('alert')
Expected: "Email or password is incorrect."
Received: "Authentication is temporarily unavailable. Please try again later."
Timeout:  5000ms

Call log:
  - Expect "toHaveText" with timeout 5000ms
  - waiting for getByRole('main').getByRole('alert')
    11 × locator resolved to <p role="alert" class="auth-form-error">Authentication is temporarily unavailable. Please…</p>
       - unexpected value "Authentication is temporarily unavailable. Please try again later."

```

```yaml
- alert: Authentication is temporarily unavailable. Please try again later.
```

# Test source

```ts
  1   | import { createHash } from "node:crypto";
  2   | 
  3   | import { expect, test } from "@playwright/test";
  4   | import { appSidebar } from "./selectors";
  5   | 
  6   | // A cold `next dev` compiles each route on its first visit, which takes longer
  7   | // than the default five seconds.
  8   | const firstCompile = 90_000;
  9   | test.describe.configure({ timeout: 2 * firstCompile });
  10  | 
  11  | // Against e2e/fake-platform.mjs, which enforces ADR-016's rules the way the API does.
  12  | const password = "correct horse battery";
  13  | 
  14  | async function signIn(
  15  |   page: import("@playwright/test").Page,
  16  |   email: string,
  17  |   secret = password,
  18  | ) {
  19  |   await page.goto("/en/sign-in");
  20  |   await page.getByLabel("Email").fill(email);
  21  |   await page.getByLabel("Password").fill(secret);
  22  |   await page.getByRole("button", { name: "Sign in" }).click();
  23  | }
  24  | 
  25  | test("signs in through /api and reaches the app on the session the API set", async ({
  26  |   page,
  27  |   context,
  28  | }) => {
  29  |   await signIn(page, "observer@darkview.test");
  30  |   await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });
  31  | 
  32  |   const names = (await context.cookies()).map((cookie) => cookie.name).sort();
  33  |   expect(names).toEqual(["__Host-darkview_csrf", "__Host-darkview_session"]);
  34  | });
  35  | 
  36  | test("refuses a wrong password without leaving the sign-in page", async ({ page }) => {
  37  |   await signIn(page, "observer@darkview.test", "not the password");
> 38  |   await expect(page.getByRole("main").getByRole("alert")).toHaveText(
      |                                                           ^ Error: expect(locator).toHaveText(expected) failed
  39  |     "Email or password is incorrect.",
  40  |   );
  41  |   await expect(page).toHaveURL(/\/en\/sign-in$/, { timeout: firstCompile });
  42  | });
  43  | 
  44  | test("treats a session cookie without its CSRF cookie as signed out", async ({
  45  |   page,
  46  |   context,
  47  | }) => {
  48  |   await signIn(page, "observer@darkview.test");
  49  |   await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });
  50  | 
  51  |   await context.clearCookies({ name: "__Host-darkview_csrf" });
  52  |   await page.goto("/en/app");
  53  |   await expect(page).toHaveURL(/\/en\/sign-in$/, { timeout: firstCompile });
  54  | });
  55  | 
  56  | test("signs out and ends the session", async ({ page }) => {
  57  |   await signIn(page, "observer@darkview.test");
  58  |   await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });
  59  | 
  60  |   await page.waitForLoadState("networkidle");
  61  |   await appSidebar(page).getByRole("button", { name: "Sign out" }).click();
  62  |   await expect(page).toHaveURL(/\/en\/sign-in$/, { timeout: firstCompile });
  63  | 
  64  |   await page.goto("/en/app");
  65  |   await expect(page).toHaveURL(/\/en\/sign-in$/, { timeout: firstCompile });
  66  | });
  67  | 
  68  | test("creates an account, and asks for the email before any session", async ({
  69  |   page,
  70  |   context,
  71  | }) => {
  72  |   const email = `new-${Date.now()}@example.com`;
  73  |   const secret = "a long enough password";
  74  | 
  75  |   await page.goto("/en/register");
  76  |   await page.getByLabel("Name").fill("New Observer");
  77  |   await page.getByLabel("Email").fill(email);
  78  |   await page.getByLabel("Password").fill(secret);
  79  |   await page.getByRole("button", { name: "Create account" }).click();
  80  |   await expect(page).toHaveURL(/\/en\/verify-email$/, { timeout: firstCompile });
  81  |   // ADR-016: no session until the address is verified.
  82  |   expect((await context.cookies()).map((cookie) => cookie.name)).not.toContain(
  83  |     "__Host-darkview_session",
  84  |   );
  85  | 
  86  |   await signIn(page, email, secret);
  87  |   await expect(page.getByRole("main").getByRole("alert")).toHaveText(
  88  |     "Verify your email before signing in.",
  89  |   );
  90  | });
  91  | 
  92  | // ADR-040. The fake platform derives a reset token from the address, as
  93  | // e2e/fake-platform.mjs explains, so the test can open the link it asked for.
  94  | const resetLink = (locale: string, email: string) =>
  95  |   `/${locale}/reset-password/${createHash("sha256").update(`reset:${email}`).digest("base64url")}`;
  96  | 
  97  | test("resets a forgotten password from the sign-in page, and signs in with the new one", async ({
  98  |   page,
  99  |   context,
  100 | }) => {
  101 |   const email = "forgetful@darkview.test";
  102 |   const secret = `a new password ${Date.now()}`;
  103 | 
  104 |   await page.goto("/en/sign-in");
  105 |   await page.getByRole("link", { name: "Forgot your password?" }).click();
  106 |   await expect(page).toHaveURL(/\/en\/reset-password$/, { timeout: firstCompile });
  107 |   await page.getByLabel("Email").fill(email);
  108 |   await page.getByRole("button", { name: "Send link" }).click();
  109 |   await expect(page).toHaveURL(/\/en\/reset-password\?sent=1$/, {
  110 |     timeout: firstCompile,
  111 |   });
  112 |   await expect(page.getByRole("heading", { level: 1 })).toHaveText("Check your email.");
  113 | 
  114 |   await page.goto(resetLink("en", email));
  115 |   await page.getByLabel("New password").fill(secret);
  116 |   await page.getByRole("button", { name: "Set password" }).click();
  117 |   await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });
  118 | 
  119 |   // The link worked once.
  120 |   await context.clearCookies();
  121 |   await page.goto(resetLink("en", email));
  122 |   await page.getByLabel("New password").fill("yet another long password");
  123 |   await page.getByRole("button", { name: "Set password" }).click();
  124 |   await expect(page.getByRole("main").getByRole("alert")).toHaveText(
  125 |     "This link is invalid, used or expired.",
  126 |   );
  127 |   await expect(page.getByRole("link", { name: "Send a new link" })).toHaveAttribute(
  128 |     "href",
  129 |     "/en/reset-password",
  130 |   );
  131 | 
  132 |   await signIn(page, email, secret);
  133 |   await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });
  134 | });
  135 | 
  136 | test("answers an unknown address exactly as a known one, in Georgian", async ({
  137 |   page,
  138 | }) => {
```