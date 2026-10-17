# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: watch.spec.ts >> a watcher >> buys a seat, watches the simulated session, and leaves
- Location: ../../../../../../../private/tmp/stellar-prod-tests/e2e/watch.spec.ts:35:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  locator('.live-feed')
Expected: "live"
Received: "connecting"

Call log:
  - Expect "toHaveAttribute" with timeout 5000ms
  - waiting for locator('.live-feed')
    - locator resolved to <div class="live-feed" data-live-busy="true" data-live-status="connecting">…</div>
    - unexpected value "connecting"
  - Protocol error (Runtime.callFunctionOn): Internal server error, session closed.

```

```yaml
- figure "Illustration — not telescope output"
- paragraph: Stellar Tbilisi ZWO ASI585MC · 3000 mm · f/20
- paragraph: Saturn
- region "Progress":
  - heading "Progress" [level=2]
  - text: Step 4 of 5
  - list
- status:
  - strong: Connecting
  - text: Waiting for the first picture from the camera.
```

# Test source

```ts
  1   | import { expect, test, type Page } from "@playwright/test";
  2   | 
  3   | // Phase 4 slice 5, against e2e/fake-platform.mjs: Nino's session open to watchers, a
  4   | // second one with every seat sold, and the observer's own session, which nobody opened.
  5   | // Buying a seat changes the fake for the session that bought it, so a buyer signs in on
  6   | // a session of its own and parallel tests never share a seat.
  7   | const open = "23000000-0000-4000-8000-000000000004";
  8   | const full = "24000000-0000-4000-8000-000000000005";
  9   | const observing = "20000000-0000-4000-8000-000000000001";
  10  | 
  11  | async function signIn(page: Page, email: string) {
  12  |   await page.goto("/en/sign-in");
  13  |   await page.getByLabel("Email").fill(email);
  14  |   await page.getByLabel("Password").fill("correct horse battery");
  15  |   await page.getByRole("button", { name: "Sign in" }).click();
  16  |   await expect(page).toHaveURL(/\/en\/app$/);
  17  | }
  18  | 
  19  | async function scenario(page: Page, value: string) {
  20  |   await page
  21  |     .context()
  22  |     .addCookies([{ name: "fake_watch", value, url: "http://localhost:3100" }]);
  23  | }
  24  | 
  25  | async function payAtCheckout(page: Page, locale: "en" | "ka", buy: string) {
  26  |   await page.getByRole("button", { name: buy }).click();
  27  |   await expect(page).toHaveURL(/\/api\/payments\/[0-9a-f-]+\/sandbox-checkout$/);
  28  |   await page.getByRole("button", { name: "Pay" }).click();
  29  |   await expect(page).toHaveURL(new RegExp(`/${locale}/app/missions/${open}/watch$`));
  30  | }
  31  | 
  32  | test.describe("a watcher", () => {
  33  |   test.use({ storageState: { cookies: [], origins: [] } });
  34  | 
  35  |   test("buys a seat, watches the simulated session, and leaves", async ({ page }) => {
  36  |     await signIn(page, "observer@darkview.test");
  37  |     await page.goto(`/en/app/missions/${open}/watch`);
  38  | 
  39  |     await expect(
  40  |       page.getByRole("heading", { level: 1, name: "Nino is observing Saturn." }),
  41  |     ).toBeVisible();
  42  |     await expect(page.getByText("2 of 5 seats taken.")).toBeVisible();
  43  |     await expect(
  44  |       page.getByRole("note").filter({ hasText: "Simulated observatory" }),
  45  |     ).toBeVisible();
  46  | 
  47  |     await payAtCheckout(page, "en", "Buy a seat");
  48  |     await expect(
  49  |       page.getByText("You are watching. You cannot move the telescope or keep captures."),
  50  |     ).toBeVisible();
  51  |     await expect(page.getByText("3 of 5 seats taken.")).toBeVisible();
> 52  |     await expect(page.locator(".live-feed")).toHaveAttribute("data-live-status", "live");
      |                                              ^ Error: expect(locator).toHaveAttribute(expected) failed
  53  |     await expect(page.locator(".live-feed-badge")).toHaveText("Simulated");
  54  |     // View only: nothing that moves the telescope or keeps a capture.
  55  |     await expect(
  56  |       page.getByRole("button", { name: /Capture|^Stop$|Re-centre/ }),
  57  |     ).toHaveCount(0);
  58  | 
  59  |     await page.getByRole("button", { name: "Stop watching" }).click();
  60  |     await expect(
  61  |       page.getByText("You left. Your seat stays yours until the session ends."),
  62  |     ).toBeVisible();
  63  |     await expect(page.locator(".live-feed")).toHaveCount(0);
  64  | 
  65  |     // The seat is still theirs: watching again needs no checkout.
  66  |     await page.getByRole("button", { name: "Watch again" }).click();
  67  |     await expect(page.locator(".live-feed")).toHaveAttribute("data-live-status", "live");
  68  |   });
  69  | 
  70  |   test("waits for a payment that settles late, then watches", async ({ page }) => {
  71  |     await signIn(page, "observer@darkview.test");
  72  |     await scenario(page, "settling");
  73  |     await page.goto(`/en/app/missions/${open}/watch`);
  74  | 
  75  |     await payAtCheckout(page, "en", "Buy a seat");
  76  |     await expect(page.getByText("Waiting for your payment to settle")).toBeVisible();
  77  |     await expect(page.locator(".live-feed")).toHaveAttribute("data-live-status", "live", {
  78  |       timeout: 10_000,
  79  |     });
  80  |   });
  81  | 
  82  |   test("is told when the owner closes the session", async ({ page }) => {
  83  |     await signIn(page, "observer@darkview.test");
  84  |     await scenario(page, "closed");
  85  |     await page.goto(`/en/app/missions/${open}/watch`);
  86  | 
  87  |     await payAtCheckout(page, "en", "Buy a seat");
  88  |     await expect(
  89  |       page.getByRole("heading", {
  90  |         level: 1,
  91  |         name: "The owner closed this session to watchers.",
  92  |       }),
  93  |     ).toBeVisible();
  94  |     await expect(page.locator(".live-feed")).toHaveCount(0);
  95  |   });
  96  | 
  97  |   test("finds every seat taken", async ({ page }) => {
  98  |     await signIn(page, "observer@darkview.test");
  99  |     await page.goto(`/en/app/missions/${full}/watch`);
  100 |     await expect(page.getByText("5 of 5 seats taken.")).toBeVisible();
  101 |     await expect(page.getByText("Every seat is taken.")).toBeVisible();
  102 |     await expect(page.getByRole("button", { name: "Buy a seat" })).toHaveCount(0);
  103 |   });
  104 | 
  105 |   test("is told a session nobody opened is not open to watch", async ({ page }) => {
  106 |     await signIn(page, "watcher@darkview.test");
  107 |     await page.goto(`/en/app/missions/${observing}/watch`);
  108 |     await expect(
  109 |       page.getByRole("heading", { level: 1, name: "This session is not open to watch." }),
  110 |     ).toBeVisible();
  111 |   });
  112 | 
  113 |   test("buys and watches in Georgian, returned to the Georgian page", async ({
  114 |     page,
  115 |   }) => {
  116 |     await signIn(page, "watcher@darkview.test");
  117 |     await page.goto(`/ka/app/missions/${open}/watch`);
  118 | 
  119 |     await expect(
  120 |       page.getByRole("heading", { level: 1, name: "Nino აკვირდება: სატურნი." }),
  121 |     ).toBeVisible();
  122 |     await expect(page.getByText("დაკავებულია 2 ადგილი 5-დან.")).toBeVisible();
  123 | 
  124 |     await payAtCheckout(page, "ka", "ადგილის ყიდვა");
  125 |     await expect(
  126 |       page.getByText("შენ უყურებ. ტელესკოპის მართვა და კადრების შენახვა შეუძლებელია."),
  127 |     ).toBeVisible();
  128 |     await expect(page.locator(".live-feed-badge")).toHaveText("სიმულირებული");
  129 | 
  130 |     await page.getByRole("button", { name: "ყურების შეწყვეტა" }).click();
  131 |     await expect(page.getByRole("button", { name: "ხელახლა ყურება" })).toBeVisible();
  132 |   });
  133 | 
  134 |   test("the Georgian watch page fits a phone", async ({ page }) => {
  135 |     await signIn(page, "watcher@darkview.test");
  136 |     await page.setViewportSize({ width: 390, height: 844 });
  137 |     await page.goto(`/ka/app/missions/${open}/watch`);
  138 |     await expect(page.getByRole("button", { name: "ადგილის ყიდვა" })).toBeVisible();
  139 |     expect(
  140 |       await page.evaluate(() => document.documentElement.scrollWidth),
  141 |     ).toBeLessThanOrEqual(390);
  142 |   });
  143 | });
  144 | 
  145 | test("the owner is sent to the live room", async ({ page }) => {
  146 |   await page.goto(`/en/app/missions/${observing}/watch`);
  147 |   await expect(
  148 |     page.getByRole("heading", { level: 1, name: "This is your session." }),
  149 |   ).toBeVisible();
  150 |   await expect(page.getByRole("link", { name: "Go to the live room" })).toHaveAttribute(
  151 |     "href",
  152 |     `/en/app/missions/${observing}/session`,
```