# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bookings.spec.ts >> /app/bookings lists the bookings latest slot first, four to a page
- Location: ../../../../../../../private/tmp/stellar-prod-tests/e2e/bookings.spec.ts:10:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.booking-row').first()
Expected substring: "Expired"
Received string:    ""

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('.booking-row').first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e3]:
    - complementary "Account and observatory" [ref=e4]:
      - generic [ref=e5]:
        - link [ref=e6] [cursor=pointer]:
          - /url: /en
          - generic "Stellar by Astroman" [ref=e7]:
            - generic [ref=e8]: Stellar
            - generic [ref=e9]: by Astroman
        - navigation "Application navigation" [ref=e10]:
          - link "Home" [ref=e11] [cursor=pointer]:
            - /url: /en/app
          - link "Missions" [ref=e16] [cursor=pointer]:
            - /url: /en/app/missions
          - link "Book an observation" [ref=e23] [cursor=pointer]:
            - /url: /en/app/book
          - link "Live" [ref=e30] [cursor=pointer]:
            - /url: /en/app/live
          - link "Collection" [ref=e36] [cursor=pointer]:
            - /url: /en/app/collection
          - link "Profile" [ref=e43] [cursor=pointer]:
            - /url: /en/app/profile
        - navigation "Not yet available" [ref=e49]:
          - paragraph [ref=e50]: Not yet available
          - link "Subscription" [ref=e51] [cursor=pointer]:
            - /url: /en/app/subscription
          - link "Loyalty" [ref=e57] [cursor=pointer]:
            - /url: /en/app/loyalty
          - link "Observation Pass" [ref=e62] [cursor=pointer]:
            - /url: /en/app/passes
        - button "Sign out" [ref=e68] [cursor=pointer]
        - generic [ref=e69]:
          - generic [ref=e70]:
            - generic [ref=e71]: Observatory status
            - strong [ref=e72]: Tbilisi Observatory
          - generic [ref=e73]:
            - generic [ref=e74]: Online
            - generic [ref=e76]: Simulated status
    - main [ref=e77]:
      - generic [ref=e78]:
        - generic [ref=e79]:
          - paragraph [ref=e80]: Bookings
          - heading "Your bookings." [level=1] [ref=e81]
          - paragraph [ref=e82]: Every slot you have held or paid for, latest first, in the observatory's time.
        - list [ref=e83]:
          - listitem [ref=e84]:
            - link "Venus Fri, 18 Sept 2026, 19:00–19:30 GMT+4 GEL 45.00 Expired" [ref=e85] [cursor=pointer]:
              - /url: /en/app/bookings/54000000-0000-4000-8000-000000000005
              - generic [ref=e86]: Venus
              - generic [ref=e87]: Fri, 18 Sept 2026, 19:00–19:30 GMT+4
              - generic [ref=e88]: GEL 45.00
              - generic [ref=e89]: Expired
          - listitem [ref=e91]:
            - link "Hercules Cluster Tue, 15 Sept 2026, 21:20–21:50 GMT+4 GEL 45.00 Refunded" [ref=e92] [cursor=pointer]:
              - /url: /en/app/bookings/55000000-0000-4000-8000-000000000006
              - generic [ref=e93]: Hercules Cluster
              - generic [ref=e94]: Tue, 15 Sept 2026, 21:20–21:50 GMT+4
              - generic [ref=e95]: GEL 45.00
              - generic [ref=e96]: Refunded
          - listitem [ref=e98]:
            - link "Saturn Sat, 12 Sept 2026, 20:40–21:10 GMT+4 GEL 45.00 Cancelled" [ref=e99] [cursor=pointer]:
              - /url: /en/app/bookings/56000000-0000-4000-8000-000000000007
              - generic [ref=e100]: Saturn
              - generic [ref=e101]: Sat, 12 Sept 2026, 20:40–21:10 GMT+4
              - generic [ref=e102]: GEL 45.00
              - generic [ref=e103]: Cancelled
        - navigation "Bookings" [ref=e105]:
          - link "Latest bookings" [ref=e106] [cursor=pointer]:
            - /url: /en/app/bookings
  - alert [ref=e108]
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
> 29  |   await expect(rows.nth(0)).toContainText("Expired");
      |                             ^ Error: expect(locator).toContainText(expected) failed
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
  49  |   await expect(page.getByRole("heading", { level: 1, name: "Saturn" })).toBeVisible();
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
```