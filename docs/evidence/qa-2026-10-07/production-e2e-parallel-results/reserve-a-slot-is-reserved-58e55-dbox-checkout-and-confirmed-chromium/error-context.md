# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reserve.spec.ts >> a slot is reserved, paid at the sandbox checkout, and confirmed
- Location: ../../../../../../../private/tmp/stellar-prod-tests/e2e/reserve.spec.ts:25:1

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/en\/app\/book\/reserve\?startAt=/
Received string:  "http://localhost:3100/en/app/book"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    12 × locator resolved to <html lang="en" class="firago_5d16354f-module__IeozIa__variable anton_a8b17dcd-module__Xi7J6a__variable bowlby_one_ed1eb4f8-module__I1FHRq__variable oswald_f85f80dc-module__aMw1va__variable geist_e799d87a-module__u8MhCG__variable jetbrains_mono_c910bbf7-module__wROeXW__variable noto_sans_georgian_9880656b-module__biiUkq__variable">…</html>
       - unexpected value "http://localhost:3100/en/app/book"

```

```yaml
- link "Skip to content":
  - /url: "#main-content"
- complementary "Account and observatory":
  - link "Stellar by Astroman":
    - /url: /en
  - navigation "Application navigation":
    - link "Home":
      - /url: /en/app
    - link "Missions":
      - /url: /en/app/missions
    - link "Book an observation":
      - /url: /en/app/book
    - link "Live":
      - /url: /en/app/live
    - link "Collection":
      - /url: /en/app/collection
    - link "Profile":
      - /url: /en/app/profile
  - navigation "Not yet available":
    - paragraph: Not yet available
    - link "Subscription":
      - /url: /en/app/subscription
    - link "Loyalty":
      - /url: /en/app/loyalty
    - link "Observation Pass":
      - /url: /en/app/passes
  - button "Sign out"
  - text: Observatory status
  - strong: Tbilisi Observatory
  - text: Online Simulated status
- main:
  - paragraph: Stellar Tbilisi
  - heading "Time on the telescope." [level=1]
  - paragraph: Every slot is cut from astronomical darkness at the observatory, in its own time zone.
  - link "Your bookings":
    - /url: /en/app/bookings
  - note:
    - strong: SIMULATED OBSERVATORY
    - text: The simulator is answering. No real telescope is moving.
  - navigation "Choose a night":
    - heading "Choose a night" [level=2]
    - list:
      - listitem:
        - link "Wed 7 Oct":
          - /url: /en/app/book?date=2026-10-07
          - time: Wed 7 Oct
      - listitem:
        - link "Thu 8 Oct":
          - /url: /en/app/book?date=2026-10-08
          - time: Thu 8 Oct
      - listitem:
        - link "Fri 9 Oct":
          - /url: /en/app/book?date=2026-10-09
          - time: Fri 9 Oct
      - listitem:
        - link "Sat 10 Oct":
          - /url: /en/app/book?date=2026-10-10
          - time: Sat 10 Oct
      - listitem:
        - link "Sun 11 Oct":
          - /url: /en/app/book?date=2026-10-11
          - time: Sun 11 Oct
      - listitem:
        - link "Mon 12 Oct":
          - /url: /en/app/book?date=2026-10-12
          - time: Mon 12 Oct
      - listitem:
        - link "Tue 13 Oct":
          - /url: /en/app/book?date=2026-10-13
          - time: Tue 13 Oct
  - region "Observing time":
    - heading "Observing time" [level=2]
    - list:
      - listitem:
        - time: 18:00
        - text: –
        - time: 18:30
        - text: GMT+4 30 min GEL 45.00
        - link "Choose 18:00–18:30":
          - /url: /en/app/book/reserve?startAt=2026-10-07T14%3A00%3A00.000Z
          - text: Choose
      - listitem:
        - time: 18:40
        - text: –
        - time: 19:10
        - text: GMT+4 30 min GEL 45.00 Booked
      - listitem:
        - time: 19:20
        - text: –
        - time: 19:50
        - text: GMT+4 30 min GEL 45.00
        - link "Choose 19:20–19:50":
          - /url: /en/app/book/reserve?startAt=2026-10-07T15%3A20%3A00.000Z
          - text: Choose
      - listitem:
        - time: 20:00
        - text: –
        - time: 20:30
        - text: GMT+4 30 min GEL 45.00
        - link "Choose 20:00–20:30":
          - /url: /en/app/book/reserve?startAt=2026-10-07T16%3A00%3A00.000Z
          - text: Choose
      - listitem:
        - time: 20:40
        - text: –
        - time: 21:10
        - text: GMT+4 30 min GEL 45.00
        - link "Choose 20:40–21:10":
          - /url: /en/app/book/reserve?startAt=2026-10-07T16%3A40%3A00.000Z
          - text: Choose
      - listitem:
        - time: 21:20
        - text: –
        - time: 21:50
        - text: GMT+4 30 min GEL 45.00
        - link "Choose 21:20–21:50":
          - /url: /en/app/book/reserve?startAt=2026-10-07T17%3A20%3A00.000Z
          - text: Choose
      - listitem:
        - time: 22:00
        - text: –
        - time: 22:30
        - text: GMT+4 30 min GEL 45.00
        - link "Choose 22:00–22:30":
          - /url: /en/app/book/reserve?startAt=2026-10-07T18%3A00%3A00.000Z
          - text: Choose
      - listitem:
        - time: 22:40
        - text: –
        - time: 23:10
        - text: GMT+4 30 min GEL 45.00
        - link "Choose 22:40–23:10":
          - /url: /en/app/book/reserve?startAt=2026-10-07T18%3A40%3A00.000Z
          - text: Choose
      - listitem:
        - time: 23:20
        - text: –
        - time: 23:50
        - text: GMT+4 30 min GEL 45.00
        - link "Choose 23:20–23:50":
          - /url: /en/app/book/reserve?startAt=2026-10-07T19%3A20%3A00.000Z
          - text: Choose
- alert
```

# Test source

```ts
  1   | import { expect, type Page, test } from "@playwright/test";
  2   | 
  3   | // Phase 3 slices 2 and 4, against e2e/fake-platform.mjs: nine slots from 18:00 Tbilisi,
  4   | // the second booked and the ninth taken "a moment ago"; Albireo and Saturn up for the
  5   | // whole slot, the Moon, M13 and Venus not. The fake's sandbox checkout answers 303 to the
  6   | // booking's page, as the platform's does.
  7   | //
  8   | // A reservation belongs to the session that made it, so these sign in on their own.
  9   | test.use({ storageState: { cookies: [], origins: [] } });
  10  | 
  11  | async function signIn(page: Page) {
  12  |   await page.goto("/en/sign-in");
  13  |   await page.getByLabel("Email").fill("observer@darkview.test");
  14  |   await page.getByLabel("Password").fill("correct horse battery");
  15  |   await page.getByRole("button", { name: "Sign in" }).click();
  16  |   await expect(page).toHaveURL(/\/en\/app$/);
  17  | }
  18  | 
  19  | async function openSlot(page: Page, index: number) {
  20  |   await page.goto("/en/app/book");
  21  |   await page.locator(".slot-row").nth(index).getByRole("link").click();
> 22  |   await expect(page).toHaveURL(/\/en\/app\/book\/reserve\?startAt=/);
      |                      ^ Error: expect(page).toHaveURL(expected) failed
  23  | }
  24  | 
  25  | test("a slot is reserved, paid at the sandbox checkout, and confirmed", async ({
  26  |   page,
  27  | }) => {
  28  |   await signIn(page);
  29  |   await openSlot(page, 0);
  30  | 
  31  |   await expect(
  32  |     page.getByRole("heading", { level: 1, name: "What will you observe?" }),
  33  |   ).toBeVisible();
  34  |   const choices = page.getByRole("radio");
  35  |   await expect(choices).toHaveCount(2);
  36  |   await expect(page.getByRole("radio", { name: /Albireo/ })).toBeVisible();
  37  |   await expect(page.getByRole("radio", { name: /Saturn/ })).toBeVisible();
  38  | 
  39  |   const withheld = page.getByRole("region", { name: "Not up for the whole slot" });
  40  |   await expect(withheld).toContainText("Hercules Cluster");
  41  |   await expect(withheld).toContainText("Too low in the sky");
  42  |   await expect(withheld).toContainText("Below the horizon");
  43  | 
  44  |   const reserve = page.getByRole("button", { name: "Reserve and pay" });
  45  |   await expect(reserve).toBeDisabled();
  46  |   await page.getByRole("radio", { name: /Saturn/ }).check();
  47  | 
  48  |   const request = page.waitForRequest(
  49  |     (sent) => sent.url().endsWith("/api/bookings") && sent.method() === "POST",
  50  |   );
  51  |   await reserve.click();
  52  |   expect((await request).headers()["idempotency-key"]).toMatch(/^[0-9a-f-]{36}$/);
  53  | 
  54  |   await expect(page).toHaveURL(/\/api\/payments\/[0-9a-f-]+\/sandbox-checkout$/);
  55  |   await page.getByRole("button", { name: "Pay" }).click();
  56  | 
  57  |   await expect(page).toHaveURL(/\/en\/app\/bookings\/[0-9a-f-]+$/);
  58  |   await expect(page.getByRole("heading", { level: 1, name: "Saturn" })).toBeVisible();
  59  |   await expect(page.getByText("Confirmed", { exact: true })).toBeVisible();
  60  | 
  61  |   await page.goto("/en/app/bookings");
  62  |   await expect(page.locator(".booking-row", { hasText: "Saturn" }).first()).toBeVisible();
  63  | });
  64  | 
  65  | test("a customer who left the checkout pays from the booking's own page", async ({
  66  |   page,
  67  | }) => {
  68  |   await signIn(page);
  69  |   await openSlot(page, 3);
  70  |   await page.getByRole("radio", { name: /Saturn/ }).check();
  71  |   const reserved = page.waitForResponse(
  72  |     (received) => received.url().endsWith("/api/bookings") && received.status() === 201,
  73  |   );
  74  |   await page.getByRole("button", { name: "Reserve and pay" }).click();
  75  |   const { booking } = (await (await reserved).json()) as { booking: { id: string } };
  76  |   await expect(page).toHaveURL(/\/api\/payments\/[0-9a-f-]+\/sandbox-checkout$/);
  77  | 
  78  |   // Leaves without answering, and comes back to the booking.
  79  |   await page.goto(`/en/app/bookings/${booking.id}`);
  80  |   await expect(page.getByText("Awaiting payment", { exact: true })).toBeVisible();
  81  |   await expect(page.getByText(/^Held for you until /)).toBeVisible();
  82  | 
  83  |   await page.getByRole("link", { name: "Continue to payment" }).click();
  84  |   await expect(page).toHaveURL(/\/api\/payments\/[0-9a-f-]+\/sandbox-checkout$/);
  85  |   await page.getByRole("button", { name: "Pay" }).click();
  86  | 
  87  |   await expect(page).toHaveURL(/\/en\/app\/bookings\/[0-9a-f-]+$/);
  88  |   await expect(page.getByText("Confirmed", { exact: true })).toBeVisible();
  89  |   await expect(page.getByRole("link", { name: "Continue to payment" })).toHaveCount(0);
  90  | });
  91  | 
  92  | test("declining at the checkout cancels the booking", async ({ page }) => {
  93  |   await signIn(page);
  94  |   await openSlot(page, 2);
  95  |   await page.getByRole("radio", { name: /Albireo/ }).check();
  96  |   await page.getByRole("button", { name: "Reserve and pay" }).click();
  97  | 
  98  |   await page.getByRole("button", { name: "Decline" }).click();
  99  |   await expect(page).toHaveURL(/\/en\/app\/bookings\/[0-9a-f-]+$/);
  100 |   await expect(page.getByText("Cancelled", { exact: true })).toBeVisible();
  101 | });
  102 | 
  103 | test("a slot taken a moment ago is refused, and the customer is sent elsewhere", async ({
  104 |   page,
  105 | }) => {
  106 |   await signIn(page);
  107 |   await openSlot(page, 8);
  108 |   await page.getByRole("radio", { name: /Saturn/ }).check();
  109 |   await page.getByRole("button", { name: "Reserve and pay" }).click();
  110 | 
  111 |   await expect(page.locator(".booking-feedback")).toHaveText(
  112 |     "Somebody booked this slot a moment ago. Choose another.",
  113 |   );
  114 |   await expect(page).toHaveURL(/\/en\/app\/book\/reserve/);
  115 | });
  116 | 
  117 | test("a booked slot, or no slot at all, cannot be reserved", async ({ page }) => {
  118 |   await signIn(page);
  119 |   await page.goto("/en/app/book");
  120 |   await expect(page.locator(".slot-row").nth(1).getByRole("link")).toHaveCount(0);
  121 | 
  122 |   // Ten minutes into a slot is no slot's start; the fake offers every night's slots.
```