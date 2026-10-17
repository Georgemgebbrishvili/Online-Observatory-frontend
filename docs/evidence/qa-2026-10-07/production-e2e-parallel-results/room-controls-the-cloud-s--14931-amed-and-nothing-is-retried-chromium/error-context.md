# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: room-controls.spec.ts >> the cloud's safety refusal is named, and nothing is retried
- Location: ../../../../../../../private/tmp/stellar-prod-tests/e2e/room-controls.spec.ts:71:1

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
    8 × locator resolved to <div class="live-feed" data-live-busy="true" data-live-status="starting">…</div>
      - unexpected value "starting"
    - locator resolved to <div class="live-feed" data-live-busy="true" data-live-status="connecting">…</div>
    - unexpected value "connecting"

```

```yaml
- figure:
  - img "Hercules Cluster"
- paragraph: Stellar Tbilisi ZWO ASI585MC · 945 mm · f/6.3
- paragraph: Hercules Cluster 16h 41m 42s / +36° 27′ 36″
- paragraph:
  - text: Time left
  - time: 29:58
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
  3   | // Phase 4 slice 3, against e2e/fake-platform.mjs: `submitMissionCommand` and the agent's
  4   | // verdict on the mission channel. The `fake_command` cookie picks the outcome for this
  5   | // browser context only: unset (accepted), refuse, cloud, silent.
  6   | const observing = "20000000-0000-4000-8000-000000000001";
  7   | 
  8   | async function outcome(page: Page, value: string) {
  9   |   await page
  10  |     .context()
  11  |     .addCookies([{ name: "fake_command", value, url: "http://localhost:3100" }]);
  12  | }
  13  | 
  14  | async function openRoom(page: Page, locale = "en") {
  15  |   // Its own room: the verdicts on other tests' commands, a stop among them, stay there.
  16  |   await page.context().addCookies([
  17  |     { name: "fake_room", value: crypto.randomUUID(), url: "http://localhost:3100" },
  18  |   ]);
  19  |   await page.goto(`/${locale}/app/missions/${observing}/session`);
> 20  |   await expect(page.locator(".live-feed")).toHaveAttribute("data-live-status", "live");
      |                                            ^ Error: expect(locator).toHaveAttribute(expected) failed
  21  | }
  22  | 
  23  | const status = (page: Page) => page.locator(".room-controls-status");
  24  | 
  25  | test("a nudge is relayed, answered by the telescope, and the controls unlock", async ({
  26  |   page,
  27  | }) => {
  28  |   await openRoom(page);
  29  |   const controls = page.getByRole("region", { name: "Controls" });
  30  |   const request = page.waitForRequest((sent) =>
  31  |     sent.url().endsWith(`/api/missions/${observing}/command`),
  32  |   );
  33  |   await controls.getByRole("button", { name: "Higher, 2 arcminutes" }).click();
  34  | 
  35  |   expect((await request).postDataJSON()).toEqual({
  36  |     type: "NUDGE",
  37  |     nudge: { kind: "NUDGE", axis: "ALTITUDE", direction: "POSITIVE", stepArcminutes: 2 },
  38  |   });
  39  |   await expect(status(page)).toHaveText("Moved higher.");
  40  |   await expect(
  41  |     controls.getByRole("button", { name: "Lower, 2 arcminutes" }),
  42  |   ).toBeEnabled();
  43  | });
  44  | 
  45  | test("a capture runs, and the controls return when it is done", async ({ page }) => {
  46  |   await openRoom(page);
  47  |   const controls = page.getByRole("region", { name: "Controls" });
  48  |   // Capture is the one primary action, under the feed with the steps.
  49  |   const capture = page.locator(".live-feed-action").getByRole("button", {
  50  |     name: "Capture",
  51  |   });
  52  |   await capture.click();
  53  | 
  54  |   await expect(
  55  |     controls.getByText("Capturing. The controls return when it is done."),
  56  |   ).toBeVisible();
  57  |   await expect(capture).toBeVisible();
  58  | });
  59  | 
  60  | test("the telescope's own refusal is named, though the cloud approved it", async ({
  61  |   page,
  62  | }) => {
  63  |   await outcome(page, "refuse");
  64  |   await openRoom(page);
  65  |   await page.getByRole("button", { name: "Right, 2 arcminutes" }).click();
  66  |   await expect(status(page)).toHaveText(
  67  |     "That would go past how far you can move from the target. Re-centre to continue.",
  68  |   );
  69  | });
  70  | 
  71  | test("the cloud's safety refusal is named, and nothing is retried", async ({ page }) => {
  72  |   await outcome(page, "cloud");
  73  |   await openRoom(page);
  74  |   let sent = 0;
  75  |   page.on("request", (request) => {
  76  |     if (request.url().endsWith("/command")) sent += 1;
  77  |   });
  78  |   await page.getByRole("button", { name: "Re-centre" }).click();
  79  |   await expect(status(page)).toHaveText(
  80  |     "The telescope's safe range has not been measured, so it will not move.",
  81  |   );
  82  |   expect(sent).toBe(1);
  83  | });
  84  | 
  85  | test("a command with no answer gives up at its deadline", async ({ page }) => {
  86  |   await outcome(page, "silent");
  87  |   await openRoom(page);
  88  |   await page.getByRole("button", { name: "Left, 2 arcminutes" }).click();
  89  |   await expect(status(page)).toHaveText("No answer from the telescope. Try again.");
  90  |   await expect(page.getByRole("button", { name: "Left, 2 arcminutes" })).toBeEnabled();
  91  | });
  92  | 
  93  | test("stopping asks first, then ends the observation", async ({ page }) => {
  94  |   await openRoom(page);
  95  |   // Stop lives in the session panel, beside the hand control.
  96  |   const session = page.getByRole("region", { name: "Session" });
  97  |   await session.getByRole("button", { name: "Stop" }).click();
  98  | 
  99  |   const confirm = session.getByRole("group", { name: "Stop the observation?" });
  100 |   await expect(confirm).toContainText("your remaining time is not returned");
  101 |   await confirm.getByRole("button", { name: "Stop" }).click();
  102 | 
  103 |   // The customer's own stop is CANCELLED: an observation stopped short (A4).
  104 |   await expect(page.locator(".live-feed")).toHaveAttribute("data-live-status", "stopped");
  105 |   await expect(
  106 |     page.getByRole("heading", { level: 1, name: "Mission cancelled" }),
  107 |   ).toBeVisible();
  108 |   await expect(page.getByRole("region", { name: "Controls" })).toHaveCount(0);
  109 |   await expect(page.getByRole("region", { name: "Session" })).toHaveCount(0);
  110 | });
  111 | 
  112 | test("the Georgian controls fit a phone", async ({ page }) => {
  113 |   await page.setViewportSize({ width: 390, height: 844 });
  114 |   await openRoom(page, "ka");
  115 |   await expect(page.getByRole("region", { name: "მართვა" })).toBeVisible();
  116 |   await expect(page.getByRole("button", { name: "გადაღება" })).toBeVisible();
  117 |   expect(
  118 |     await page.evaluate(() => document.documentElement.scrollWidth),
  119 |   ).toBeLessThanOrEqual(390);
  120 | });
```