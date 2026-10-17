# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bookings.spec.ts >> a confirmed booking opens its observation and says why it cannot be cancelled
- Location: e2e/bookings.spec.ts:44:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Saturn', level: 1 })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Saturn', level: 1 })

```

```yaml
- link "Skip to content":
  - /url: "#main-content"
- alert
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
    - /url: /ka/app/bookings/51000000-0000-4000-8000-000000000002
    - text: ქართული
  - link "Sign in":
    - /url: /en/sign-in
  - link "Start exploring":
    - /url: /en#tonight
- main:
  - region "Observation not found":
    - paragraph: "404"
    - heading "Observation not found" [level=1]
    - paragraph: Nothing is at this address. It may have moved, or the link was mistyped.
    - link "Return to Stellar":
      - /url: /en
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
      - /url: /ka
    - link "English":
      - /url: /en
```

# Test source

```ts
  1   | import { expect, type Page, test } from "@playwright/test";
  2   | 
  3   | // Phase 3 slice 3, against e2e/fake-platform.mjs: the observer's seven bookings, one in
  4   | // every state, four to a page.
  5   | 
  6   | const pending = "52000000-0000-4000-8000-000000000003";
  7   | const upcoming = "51000000-0000-4000-8000-000000000002";
  8   | const lost = "53000000-0000-4000-8000-000000000004";
  9   | 
  10  | test("/app/bookings lists the bookings latest slot first, four to a page", async ({
  11  |   page,
  12  | }) => {
  13  |   await page.goto("/en/app/bookings");
  14  | 
  15  |   await expect(
  16  |     page.getByRole("heading", { level: 1, name: "Your bookings." }),
  17  |   ).toBeVisible();
  18  |   const rows = page.locator(".booking-row");
  19  |   await expect(rows).toHaveCount(4);
  20  |   await expect(rows.first()).toContainText("Albireo");
  21  |   await expect(rows.first()).toContainText("Awaiting payment");
  22  |   await expect(rows.first()).toContainText("19:20–19:50");
  23  |   await expect(rows.first()).toContainText("GMT+4");
  24  |   await expect(rows.nth(1)).toContainText("Saturn");
  25  |   await expect(rows.nth(1)).toContainText("Confirmed");
  26  | 
  27  |   await page.getByRole("link", { name: "Older bookings" }).click();
  28  |   await expect(rows).toHaveCount(3);
  29  |   await expect(rows.nth(0)).toContainText("Expired");
  30  |   await expect(rows.nth(1)).toContainText("Refunded");
  31  |   await expect(rows.nth(2)).toContainText("Cancelled");
  32  |   await expect(page.getByRole("link", { name: "Older bookings" })).toHaveCount(0);
  33  | 
  34  |   await page.getByRole("link", { name: "Latest bookings" }).click();
  35  |   await expect(rows).toHaveCount(4);
  36  | });
  37  | 
  38  | test("/app/book reaches the bookings", async ({ page }) => {
  39  |   await page.goto("/en/app/book");
  40  |   await page.getByRole("link", { name: "Your bookings" }).click();
  41  |   await expect(page).toHaveURL(/\/en\/app\/bookings$/);
  42  | });
  43  | 
  44  | test("a confirmed booking opens its observation and says why it cannot be cancelled", async ({
  45  |   page,
  46  | }) => {
  47  |   await page.goto(`/en/app/bookings/${upcoming}`);
  48  | 
> 49  |   await expect(page.getByRole("heading", { level: 1, name: "Saturn" })).toBeVisible();
      |                                                                         ^ Error: expect(locator).toBeVisible() failed
  50  |   await expect(page.getByText("Confirmed", { exact: true })).toBeVisible();
  51  |   await expect(page.getByText("SIMULATED OBSERVATORY")).toBeVisible();
  52  |   await expect(page.getByText("Loyalty discount")).toBeVisible();
  53  |   await expect(
  54  |     page.getByText("A paid booking cannot be cancelled until refunds are available."),
  55  |   ).toBeVisible();
  56  |   await expect(page.getByRole("button", { name: "Cancel booking" })).toHaveCount(0);
  57  |   await expect(page.getByRole("link", { name: "Open the observation" })).toHaveAttribute(
  58  |     "href",
  59  |     "/en/app/missions/21000000-0000-4000-8000-000000000002/session",
  60  |   );
  61  | });
  62  | 
  63  | test("a booking awaiting payment says how long it is held and offers the checkout", async ({
  64  |   page,
  65  | }) => {
  66  |   await page.goto(`/en/app/bookings/${pending}`);
  67  | 
  68  |   await expect(page.getByText("Awaiting payment", { exact: true })).toBeVisible();
  69  |   await expect(page.getByText("Held for you until Wed, 16 Jan 2030, 18:35 GMT+4.")).toBeVisible();
  70  |   await expect(page.getByRole("link", { name: "Continue to payment" })).toHaveAttribute(
  71  |     "href",
  72  |     /\/api\/payments\/62000000-0000-4000-8000-000000000003\/sandbox-checkout$/,
  73  |   );
  74  | });
  75  | 
  76  | test("an unknown booking and a malformed id are both not found", async ({ page }) => {
  77  |   for (const id of ["59000000-0000-4000-8000-000000000009", "not-a-booking"]) {
  78  |     await page.goto(`/en/app/bookings/${id}`);
  79  |     await expect(page.getByRole("heading", { level: 1 })).not.toHaveText(
  80  |       "Your bookings.",
  81  |     );
  82  |     await expect(page.locator(".booking-detail")).toHaveCount(0);
  83  |   }
  84  | });
  85  | 
  86  | test("the Georgian bookings fit a phone", async ({ page }) => {
  87  |   await page.setViewportSize({ width: 390, height: 844 });
  88  |   await page.goto("/ka/app/bookings");
  89  |   await expect(
  90  |     page.getByRole("heading", { level: 1, name: "შენი ჯავშნები." }),
  91  |   ).toBeVisible();
  92  |   await expect(page.locator(".booking-row").first()).toContainText("გადახდას ელოდება");
  93  |   const width = await page.evaluate(() => document.documentElement.scrollWidth);
  94  |   expect(width).toBeLessThanOrEqual(390);
  95  | 
  96  |   await page.goto(`/ka/app/bookings/${lost}`);
  97  |   await expect(page.getByText(/18 წუთი ამინდის გამო დაიკარგა/)).toBeVisible();
  98  |   expect(
  99  |     await page.evaluate(() => document.documentElement.scrollWidth),
  100 |   ).toBeLessThanOrEqual(390);
  101 | });
  102 | 
  103 | // Cancelling and refunding change the booking for the session that did it, so these sign
  104 | // in on sessions of their own and the shared observer's bookings stay as they are.
  105 | test.describe("changing a booking", () => {
  106 |   test.use({ storageState: { cookies: [], origins: [] } });
  107 | 
  108 |   async function signIn(page: Page) {
  109 |     await page.goto("/en/sign-in");
  110 |     await page.getByLabel("Email").fill("observer@darkview.test");
  111 |     await page.getByLabel("Password").fill("correct horse battery");
  112 |     await page.getByRole("button", { name: "Sign in" }).click();
  113 |     await expect(page).toHaveURL(/\/en\/app$/);
  114 |   }
  115 | 
  116 |   test("a booking awaiting payment is cancelled after a confirmation", async ({
  117 |     page,
  118 |   }) => {
  119 |     await signIn(page);
  120 |     await page.goto(`/en/app/bookings/${pending}`);
  121 | 
  122 |     await expect(page.getByText("Awaiting payment", { exact: true })).toBeVisible();
  123 |     await page.getByRole("button", { name: "Cancel booking" }).click();
  124 |     await expect(
  125 |       page.getByText("Cancel this booking and release the slot?"),
  126 |     ).toBeVisible();
  127 | 
  128 |     await page.getByRole("button", { name: "Keep it" }).click();
  129 |     await page.getByRole("button", { name: "Cancel booking" }).click();
  130 |     await page.getByRole("button", { name: "Yes, cancel it" }).click();
  131 | 
  132 |     await expect(page.getByText("Cancelled", { exact: true })).toBeVisible();
  133 |     await expect(page.getByText("The slot has been released.")).toBeVisible();
  134 |     await expect(page.getByRole("button", { name: "Cancel booking" })).toHaveCount(0);
  135 |   });
  136 | 
  137 |   test("a slot lost to the weather is refunded", async ({ page }) => {
  138 |     await signIn(page);
  139 |     await page.goto(`/en/app/bookings/${lost}`);
  140 | 
  141 |     await expect(
  142 |       page.getByText(
  143 |         "18 minutes of this slot were lost to the weather. You can take a refund or a free slot until 20 October 2026.",
  144 |       ),
  145 |     ).toBeVisible();
  146 |     await page.getByRole("button", { name: "Take the refund" }).click();
  147 | 
  148 |     await expect(page.getByText("Refunded", { exact: true })).toBeVisible();
  149 |     await expect(
```