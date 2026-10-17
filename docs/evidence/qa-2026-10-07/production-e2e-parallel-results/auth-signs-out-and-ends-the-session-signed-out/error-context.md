# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> signs out and ends the session
- Location: ../../../../../../../private/tmp/stellar-prod-tests/e2e/auth.spec.ts:56:1

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/en\/app$/
Received string:  "http://localhost:3100/en/sign-in"
Timeout: 90000ms

Call log:
  - Expect "toHaveURL" with timeout 90000ms
    176 × locator resolved to <html lang="en" class="firago_5d16354f-module__IeozIa__variable anton_a8b17dcd-module__Xi7J6a__variable bowlby_one_ed1eb4f8-module__I1FHRq__variable oswald_f85f80dc-module__aMw1va__variable geist_e799d87a-module__u8MhCG__variable jetbrains_mono_c910bbf7-module__wROeXW__variable noto_sans_georgian_9880656b-module__biiUkq__variable">…</html>
        - unexpected value "http://localhost:3100/en/sign-in"

```

```yaml
- link "Skip to content":
  - /url: "#main-content"
- banner:
  - link "Stellar by Astroman":
    - /url: /en
  - navigation "Public navigation":
    - link "Explore":
      - /url: /en#tonight
    - link "Live":
      - /url: /en/app/live
    - link "Observatory":
      - /url: /en/observatory
    - link "Pricing":
      - /url: /en/pricing
    - link "About":
      - /url: /en#about
  - 'link "Language: ქართული"':
    - /url: /ka/sign-in
    - text: ქართული
  - link "Sign in":
    - /url: /en/sign-in
  - link "Start exploring":
    - /url: /en#tonight
- main:
  - paragraph: Account
  - heading "Welcome back." [level=1]
  - paragraph: Sign in to manage your missions and personal captures.
  - alert: Authentication is temporarily unavailable. Please try again later.
  - text: Email
  - textbox "Email":
    - /placeholder: you@example.com
  - text: Password
  - textbox "Password"
  - button "Sign in"
  - paragraph:
    - link "Forgot your password?":
      - /url: /en/reset-password
  - paragraph:
    - text: New to Stellar?
    - link "Create an account":
      - /url: /en/register
  - paragraph: Your session is verified on the server. Observatory credentials never reach this browser.
- contentinfo:
  - text: Stellar by Astroman
  - paragraph: One real telescope in Tbilisi. The real sky, live.
  - navigation "Product · Company":
    - heading "Product" [level=2]
    - link "Missions":
      - /url: /en#tonight
    - link "Live":
      - /url: /en/app/live
    - link "Collection":
      - /url: /en/app/collection
    - link "Observatory":
      - /url: /en/observatory
    - link "Status":
      - /url: /en/status
    - heading "Company" [level=2]
    - text: About Contact
    - heading "Legal" [level=2]
    - link "Terms":
      - /url: /en/terms
    - link "Privacy":
      - /url: /en/privacy
    - link "Refunds":
      - /url: /en/refunds
    - heading "Language" [level=2]
    - link "ქართული":
      - /url: /ka/sign-in
    - link "English":
      - /url: /en/sign-in
- alert
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
  38  |   await expect(page.getByRole("main").getByRole("alert")).toHaveText(
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
> 58  |   await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });
      |                      ^ Error: expect(page).toHaveURL(expected) failed
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
  139 |   await page.goto("/ka/reset-password");
  140 |   await page.getByLabel("ელფოსტა").fill(`nobody-${Date.now()}@example.com`);
  141 |   await page.getByRole("button", { name: "ბმულის გაგზავნა" }).click();
  142 |   await expect(page).toHaveURL(/\/ka\/reset-password\?sent=1$/, {
  143 |     timeout: firstCompile,
  144 |   });
  145 |   await expect(page.getByRole("heading", { level: 1 })).toHaveText("შეამოწმე ელფოსტა.");
  146 | });
  147 | 
  148 | test("refuses a short new password before asking the platform", async ({ page }) => {
  149 |   await page.goto(resetLink("en", "observer@darkview.test"));
  150 |   const field = page.getByLabel("New password");
  151 |   // The browser's own minLength check would stop the form; this is the page's.
  152 |   await field.evaluate((input: HTMLInputElement) => input.removeAttribute("minlength"));
  153 |   await field.fill("too short");
  154 |   await page.getByRole("button", { name: "Set password" }).click();
  155 |   await expect(
  156 |     page.getByText("Use a password between 12 and 128 characters."),
  157 |   ).toBeVisible();
  158 | });
```