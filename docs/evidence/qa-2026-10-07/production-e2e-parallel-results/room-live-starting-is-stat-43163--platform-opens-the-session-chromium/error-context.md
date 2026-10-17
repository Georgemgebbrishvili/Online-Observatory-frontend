# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: room-live.spec.ts >> starting is stated while the platform opens the session
- Location: ../../../../../../../private/tmp/stellar-prod-tests/e2e/room-live.spec.ts:69:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  locator('.live-feed')
Expected: "live"
Received: "connecting"
Timeout:  5000ms

Call log:
  - Expect "toHaveAttribute" with timeout 5000ms
  - waiting for locator('.live-feed')
    6 × locator resolved to <div class="live-feed" data-live-busy="true" data-live-status="starting">…</div>
      - unexpected value "starting"
    5 × locator resolved to <div class="live-feed" data-live-busy="true" data-live-status="connecting">…</div>
      - unexpected value "connecting"

```

```yaml
- figure:
  - img "Hercules Cluster"
- paragraph: Stellar Tbilisi ZWO ASI585MC · 945 mm · f/6.3
- paragraph: Hercules Cluster 16h 41m 42s / +36° 27′ 36″
- paragraph:
  - text: Time left
  - time: 29:57
- region "Progress":
  - heading "Progress" [level=2]
  - text: Step 4 of 5
  - list
- status:
  - strong: Connecting
  - text: Waiting for the first picture from the camera.
- button "Capture"
```

# Test source

```ts
  1   | import { expect, test, type Page } from "@playwright/test";
  2   | 
  3   | import { roomCopy } from "../src/i18n/resources/room";
  4   | 
  5   | // Phase 4 slice 2, against e2e/fake-platform.mjs: the session start, the mission channel
  6   | // over the web app's /ws proxy, and the MJPEG stream. The `fake_live` cookie picks the
  7   | // fake's scenario for this browser context only, so parallel tests never share one.
  8   | const observing = "20000000-0000-4000-8000-000000000001";
  9   | const scheduled = "21000000-0000-4000-8000-000000000002";
  10  | 
  11  | async function scenario(page: Page, value: string) {
  12  |   await page
  13  |     .context()
  14  |     .addCookies([{ name: "fake_live", value, url: "http://localhost:3100" }]);
  15  | }
  16  | 
  17  | function feedStatus(page: Page) {
  18  |   return page.locator(".live-feed-status [role]");
  19  | }
  20  | 
  21  | test("an observing mission opens its session and shows the simulated stream", async ({
  22  |   page,
  23  | }) => {
  24  |   await page.goto(`/en/app/missions/${observing}/session`);
  25  | 
  26  |   const stream = page.getByRole("img", {
  27  |     name: "Simulated live view of Hercules Cluster",
  28  |   });
  29  |   await expect(stream).toBeVisible();
  30  |   // The MJPEG stream decodes: the frame reached the page through the /stream proxy.
  31  |   await expect
  32  |     .poll(() => stream.evaluate((image: HTMLImageElement) => image.naturalWidth))
  33  |     .toBeGreaterThan(0);
  34  |   await expect(stream).toHaveAttribute(
  35  |     "src",
  36  |     new RegExp(`^http://localhost:3100/stream/mission/${observing}\\?t=`),
  37  |   );
  38  | 
  39  |   const feed = page.locator(".live-feed");
  40  |   await expect(feed).toHaveAttribute("data-live-status", "live");
  41  |   await expect(feed.getByText("Simulated", { exact: true })).toBeVisible();
  42  |   await expect(feedStatus(page)).toContainText("Simulator output, not telescope output.");
  43  |   // The red LIVE dot is a real camera's only.
  44  |   await expect(feed.locator(".live-indicator-active")).toHaveCount(0);
  45  |   await expect(feed.getByText(/Time left/)).toBeVisible();
  46  |   await expect(page.getByText("Illustration — not telescope output")).toHaveCount(0);
  47  | });
  48  | 
  49  | test("the Georgian live room fits a phone", async ({ page }) => {
  50  |   await page.setViewportSize({ width: 390, height: 844 });
  51  |   await page.goto(`/ka/app/missions/${observing}/session`);
  52  | 
  53  |   await expect(
  54  |     page.getByRole("img", { name: "სიმულირებული პირდაპირი ხედი: ჰერკულესის გროვა" }),
  55  |   ).toBeVisible();
  56  |   await expect(page.locator(".live-feed").getByText("სიმულირებული")).toBeVisible();
  57  |   await expect(page.getByText(/დარჩენილი დრო/)).toBeVisible();
  58  | 
  59  |   const viewport = await page.evaluate(() => ({
  60  |     clientWidth: document.documentElement.clientWidth,
  61  |     scrollWidth: document.documentElement.scrollWidth,
  62  |   }));
  63  |   expect(viewport.scrollWidth).toBe(viewport.clientWidth);
  64  |   const box = await page.locator(".live-feed").boundingBox();
  65  |   expect(box?.x).toBeGreaterThanOrEqual(16);
  66  |   expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(390 - 16);
  67  | });
  68  | 
  69  | test("starting is stated while the platform opens the session", async ({ page }) => {
  70  |   await scenario(page, "slow");
  71  |   await page.goto(`/en/app/missions/${observing}/session`);
  72  |   await expect(feedStatus(page)).toContainText("Starting");
> 73  |   await expect(page.locator(".live-feed")).toHaveAttribute("data-live-status", "live");
      |                                            ^ Error: expect(locator).toHaveAttribute(expected) failed
  74  | });
  75  | 
  76  | for (const [locale, opens, button] of [
  77  |   ["en", "Your slot opens at", "Start observation"],
  78  |   ["ka", "შენი დრო", "დაიწყე დაკვირვება"],
  79  | ] as const) {
  80  |   test(`${locale}: a scheduled mission waits for its slot, with the plate as an illustration`, async ({
  81  |     page,
  82  |   }) => {
  83  |     await page.goto(`/${locale}/app/missions/${scheduled}/session`);
  84  |     await expect(feedStatus(page)).toContainText(opens);
  85  |     await expect(page.getByRole("button", { name: button })).toBeDisabled();
  86  |     await expect(page.locator(".target-preview img")).toHaveAttribute(
  87  |       "src",
  88  |       "/plates/saturn.webp",
  89  |     );
  90  |     await expect(page.locator(".live-feed [data-live-stream]")).toHaveCount(0);
  91  |   });
  92  | }
  93  | 
  94  | test("the customer starts a scheduled mission once its slot is open", async ({
  95  |   page,
  96  | }) => {
  97  |   await scenario(page, "open");
  98  |   // The fake's slot is 2030-01-15 18:00 UTC; the browser reads it five minutes in.
  99  |   await page.clock.setFixedTime(new Date("2030-01-15T18:05:00.000Z"));
  100 |   await page.goto(`/en/app/missions/${scheduled}/session`);
  101 | 
  102 |   const start = page.getByRole("button", { name: "Start observation" });
  103 |   await expect(start).toBeEnabled();
  104 |   await expect(feedStatus(page)).toContainText(
  105 |     "Your slot is open. Starting turns the telescope to Saturn.",
  106 |   );
  107 |   await start.click();
  108 | 
  109 |   await expect(
  110 |     page.getByRole("heading", { level: 1, name: "Moving telescope to Saturn" }),
  111 |   ).toBeVisible();
  112 |   await expect(
  113 |     page.getByRole("region", { name: "Progress" }).getByText("Step 2 of 5"),
  114 |   ).toBeVisible();
  115 |   await expect(feedStatus(page)).toContainText("Connecting");
  116 |   await expect(page.getByRole("button", { name: "Start observation" })).toHaveCount(0);
  117 | 
  118 |   // The dial follows the mount from the channel: it travels while slewing and settles
  119 |   // on Saturn's position once centring.
  120 |   const pointing = page.getByRole("region", { name: "Where the telescope points" });
  121 |   await expect(pointing.locator(".pointing-dial-telescope")).toBeVisible();
  122 |   await expect(
  123 |     page.getByRole("heading", { level: 1, name: "Centring the target" }),
  124 |   ).toBeVisible();
  125 |   await expect(pointing.locator('[data-pointing="altitude"]')).toHaveText("38.0°");
  126 |   await expect(pointing.locator('[data-pointing="azimuth"]')).toHaveText("160.0°");
  127 |   await expect(pointing.locator(".pointing-dial-reference")).toBeVisible();
  128 | });
  129 | 
  130 | for (const [locale, text] of [
  131 |   ["en", "Reconnecting"],
  132 |   ["ka", "კავშირი აღდგება"],
  133 | ] as const) {
  134 |   test(`${locale}: a dropped channel is stated as reconnecting`, async ({ page }) => {
  135 |     await scenario(page, "drop");
  136 |     await page.goto(`/${locale}/app/missions/${observing}/session`);
  137 |     await expect(feedStatus(page)).toContainText(text);
  138 |   });
  139 | }
  140 | 
  141 | for (const [locale, text, noPosition] of [
  142 |   ["en", "Observatory offline", "The telescope has not reported a position."],
  143 |   ["ka", "ობსერვატორია კავშირგარეშეა", "ტელესკოპს მდებარეობა ჯერ არ გადმოუცია."],
  144 | ] as const) {
  145 |   test(`${locale}: an offline agent is stated, with no telescope position`, async ({
  146 |     page,
  147 |   }) => {
  148 |     await scenario(page, "offline");
  149 |     await page.goto(`/${locale}/app/missions/${observing}/session`);
  150 |     // The start, the channel and its first message: a round trip or three, not a render.
  151 |     await expect(feedStatus(page)).toContainText(text, { timeout: 15_000 });
  152 |     await expect(page.locator(".live-feed [data-live-stream]")).toHaveCount(0);
  153 |     await expect(page.getByText(noPosition)).toBeVisible();
  154 |     await expect(page.locator(".pointing-dial-telescope")).toHaveCount(0);
  155 |   });
  156 | }
  157 | 
  158 | for (const [locale, heading, reason] of [
  159 |   ["en", "Weather hold", "The weather is not safe for observing."],
  160 |   ["ka", "მისია ამინდის გამო შეჩერდა", "ამინდი დაკვირვებისთვის უსაფრთხო არ არის."],
  161 | ] as const) {
  162 |   test(`${locale}: a weather hold from the channel stops the feed`, async ({ page }) => {
  163 |     await scenario(page, "hold");
  164 |     await page.goto(`/${locale}/app/missions/${observing}/session`);
  165 |     await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible({
  166 |       timeout: 15_000,
  167 |     });
  168 |     await expect(page.getByText(reason)).toBeVisible();
  169 |     await expect(page.locator(".live-feed")).toHaveAttribute("data-live-status", "hold");
  170 |   });
  171 | }
  172 | 
  173 | for (const [locale, text] of [
```