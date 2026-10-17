# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: profile.spec.ts >> deletes the account after the password, and it cannot sign in again
- Location: ../../../../../../../private/tmp/stellar-prod-tests/e2e/profile.spec.ts:140:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Email or password is incorrect.')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Email or password is incorrect.')

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
  67  |   await expect(password.getByRole("status")).toHaveText(
  68  |     "Password changed. You're signed out everywhere else.",
  69  |   );
  70  |   secret = next;
  71  | 
  72  |   await signIn(page, start);
  73  | });
  74  | 
  75  | test("moves the address only when the link sent to the new one is opened", async ({
  76  |   page,
  77  | }) => {
  78  |   await signIn(page, start);
  79  |   await page.goto("/en/app/profile");
  80  | 
  81  |   const email = panel(page, "Email");
  82  |   await expect(email.getByText(`Your address is ${start}.`)).toBeVisible();
  83  | 
  84  |   // The address the account already has.
  85  |   await email.getByLabel("New email").fill(start);
  86  |   await email.getByLabel("Current password").fill(secret);
  87  |   await email.getByRole("button", { name: "Send link" }).click();
  88  |   await expect(email.getByText("That is already your address.")).toBeVisible();
  89  | 
  90  |   await email.getByLabel("New email").fill(moved);
  91  |   await email.getByLabel("Current password").fill(secret);
  92  |   await email.getByRole("button", { name: "Send link" }).click();
  93  |   await expect(email.getByRole("status")).toContainText(`Check ${moved}.`);
  94  | 
  95  |   // Nothing moved yet.
  96  |   await page.reload();
  97  |   await expect(panel(page, "Email").getByText(`Your address is ${start}.`)).toBeVisible();
  98  | 
  99  |   // The link is in the account's language, Georgian since the first test.
  100 |   await page.context().clearCookies();
  101 |   await page.goto(changeLink("ka", moved));
  102 |   await page.getByRole("button", { name: "ელფოსტის დადასტურება" }).click();
  103 |   await expect(page).toHaveURL(/\/ka\/app$/, { timeout: firstCompile });
  104 | 
  105 |   await signIn(page, moved);
  106 | });
  107 | 
  108 | // C4 (ADR-044): deleting the account. The observer has a paid slot ahead, a held one, a
  109 | // refund owed and a live mission, so the platform names what to settle first; the
  110 | // leaving account has nothing, and goes.
  111 | async function signInAs(page: Page, email: string) {
  112 |   await page.context().clearCookies();
  113 |   await page.goto("/en/sign-in");
  114 |   await page.getByLabel("Email").fill(email);
  115 |   await page.getByLabel("Password").fill("correct horse battery");
  116 |   await page.getByRole("button", { name: "Sign in" }).click();
  117 |   await expect(page).toHaveURL(/\/en\/app$/, { timeout: firstCompile });
  118 | }
  119 | 
  120 | test("says what to settle before an account can be deleted, and keeps it", async ({ page }) => {
  121 |   await signInAs(page, "observer@darkview.test");
  122 |   await page.goto("/en/app/profile");
  123 | 
  124 |   const deletion = panel(page, "Delete your account");
  125 |   await deletion.getByLabel("Current password").fill("correct horse battery");
  126 |   await deletion.getByLabel("I understand that this cannot be undone.").check();
  127 |   await deletion.getByRole("button", { name: "Delete my account" }).click();
  128 | 
  129 |   const alert = deletion.getByRole("alert");
  130 |   await expect(alert).toContainText("Your account cannot be deleted yet:");
  131 |   await expect(alert).toContainText("An observation of yours is not over yet.");
  132 |   await expect(alert).toContainText("A paid slot of yours is still ahead.");
  133 |   await expect(alert).toContainText("A slot is held for you awaiting payment.");
  134 |   await expect(alert).toContainText("A refund or a free slot is owed to you.");
  135 | 
  136 |   await page.goto("/en/app/profile");
  137 |   await expect(page).toHaveURL(/\/en\/app\/profile$/);
  138 | });
  139 | 
  140 | test("deletes the account after the password, and it cannot sign in again", async ({
  141 |   page,
  142 | }) => {
  143 |   await signInAs(page, "leaving@darkview.test");
  144 |   await page.goto("/en/app/profile");
  145 | 
  146 |   const deletion = panel(page, "Delete your account");
  147 |   await expect(deletion).toContainText("Your loyalty points are lost.");
  148 |   await deletion.getByLabel("Current password").fill("not my password at all");
  149 |   await deletion.getByLabel("I understand that this cannot be undone.").check();
  150 |   await deletion.getByRole("button", { name: "Delete my account" }).click();
  151 |   await expect(deletion.getByText("That is not your current password.")).toBeVisible();
  152 | 
  153 |   // The form resets after every answer, as React's form actions do: the box is asked
  154 |   // for again, each time.
  155 |   await deletion.getByLabel("Current password").fill("correct horse battery");
  156 |   await deletion.getByLabel("I understand that this cannot be undone.").check();
  157 |   await deletion.getByRole("button", { name: "Delete my account" }).click();
  158 |   await expect(deletion.getByRole("status")).toHaveText("Your account has been deleted.");
  159 | 
  160 |   await deletion.getByRole("link", { name: "Go to the home page" }).click();
  161 |   await expect(page).toHaveURL(/\/en$/);
  162 | 
  163 |   await page.goto("/en/sign-in");
  164 |   await page.getByLabel("Email").fill("leaving@darkview.test");
  165 |   await page.getByLabel("Password").fill("correct horse battery");
  166 |   await page.getByRole("button", { name: "Sign in" }).click();
> 167 |   await expect(page.getByText("Email or password is incorrect.")).toBeVisible();
      |                                                                   ^ Error: expect(locator).toBeVisible() failed
  168 | });
  169 | 
```