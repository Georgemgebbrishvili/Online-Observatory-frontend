# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: room-live.spec.ts >> a session another tab holds offers to watch here
- Location: ../../../../../../../private/tmp/stellar-prod-tests/e2e/room-live.spec.ts:266:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.live-feed-status [role]')
Expected substring: "This observation is open in another window or tab."
Received string:    "ConnectingWaiting for the first picture from the camera."
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('.live-feed-status [role]')
    5 × locator resolved to <div role="status">…</div>
      - unexpected value "StartingOpening your session with the observatory."
    5 × locator resolved to <div role="status">…</div>
      - unexpected value "ConnectingWaiting for the first picture from the camera."

```

```yaml
- status:
  - strong: Connecting
  - text: Waiting for the first picture from the camera.
```

# Test source

```ts
  169 |     await expect(page.locator(".live-feed")).toHaveAttribute("data-live-status", "hold");
  170 |   });
  171 | }
  172 | 
  173 | for (const [locale, text] of [
  174 |   ["en", "Your time is up"],
  175 |   ["ka", "დრო ამოიწურა"],
  176 | ] as const) {
  177 |   test(`${locale}: the session ends at its expiresAt`, async ({ page }) => {
  178 |     await scenario(page, "expire");
  179 |     await page.goto(`/${locale}/app/missions/${observing}/session`);
  180 |     await expect(feedStatus(page)).toContainText(text, { timeout: 15_000 });
  181 |     await expect(page.locator(".live-feed [data-live-stream]")).toHaveCount(0);
  182 |   });
  183 | }
  184 | 
  185 | for (const [locale, text, retry] of [
  186 |   ["en", "Something went wrong", "Try again"],
  187 |   ["ka", "რაღაც შეფერხდა", "სცადე თავიდან"],
  188 | ] as const) {
  189 |   test(`${locale}: a start the platform fails is an error with a retry`, async ({
  190 |     page,
  191 |   }) => {
  192 |     await scenario(page, "error");
  193 |     await page.goto(`/${locale}/app/missions/${observing}/session`);
  194 |     await expect(feedStatus(page)).toContainText(text);
  195 |     await expect(page.getByRole("button", { name: retry })).toBeVisible();
  196 |   });
  197 | }
  198 | 
  199 | // A4: an observation stopped short is a designed screen: the state, the reason, what
  200 | // happens next, and the way forward. Each arrives on the channel after the session opened.
  201 | const stops = [
  202 |   {
  203 |     scenario: "not-visible",
  204 |     reason: "TARGET_SET_BELOW_LIMIT",
  205 |     heading: { en: "Target not visible", ka: "ობიექტი არ ჩანს" },
  206 |   },
  207 |   {
  208 |     scenario: "hardware",
  209 |     reason: "MOUNT_FAULT",
  210 |     heading: { en: "Observatory hardware error", ka: "ობსერვატორიის აპარატურის შეცდომა" },
  211 |   },
  212 |   {
  213 |     scenario: "cancelled",
  214 |     reason: "OPERATOR_ABORT",
  215 |     heading: { en: "Mission cancelled", ka: "მისია გაუქმებულია" },
  216 |   },
  217 |   {
  218 |     scenario: "failed",
  219 |     reason: "CENTERING_ITERATIONS_EXHAUSTED",
  220 |     heading: { en: "Mission failed", ka: "მისია ვერ შესრულდა" },
  221 |   },
  222 |   {
  223 |     // Heartbeat loss: the link goes, and the cloud closes the mission out.
  224 |     scenario: "heartbeat",
  225 |     reason: "AGENT_LINK_LOST",
  226 |     heading: { en: "Mission failed", ka: "მისია ვერ შესრულდა" },
  227 |   },
  228 | ] as const;
  229 | 
  230 | for (const stop of stops) {
  231 |   for (const locale of ["en", "ka"] as const) {
  232 |     test(`${locale}: ${stop.scenario} stops the observation, with a way forward`, async ({
  233 |       page,
  234 |     }) => {
  235 |       const heading = stop.heading[locale];
  236 |       const actions =
  237 |         locale === "en"
  238 |           ? { book: "Book another night", booking: "See your booking" }
  239 |           : { book: "დაჯავშნე სხვა ღამე", booking: "ჯავშნის ნახვა" };
  240 |       await scenario(page, stop.scenario);
  241 |       await page.goto(`/${locale}/app/missions/${observing}/session`);
  242 | 
  243 |       await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible({
  244 |         timeout: 15_000,
  245 |       });
  246 |       await expect(page.locator(".live-feed")).toHaveAttribute(
  247 |         "data-live-status",
  248 |         "stopped",
  249 |       );
  250 |       await expect(page.locator(".room-reason")).toHaveText(
  251 |         roomCopy[locale].reasons[stop.reason],
  252 |       );
  253 |       await expect(page.locator(".live-feed [data-live-stream]")).toHaveCount(0);
  254 |       await expect(page.getByRole("link", { name: actions.book })).toHaveAttribute(
  255 |         "href",
  256 |         `/${locale}/app/book`,
  257 |       );
  258 |       await expect(page.getByRole("link", { name: actions.booking })).toHaveAttribute(
  259 |         "href",
  260 |         `/${locale}/app/bookings/50000000-0000-4000-8000-000000000001`,
  261 |       );
  262 |     });
  263 |   }
  264 | }
  265 | 
  266 | test("a session another tab holds offers to watch here", async ({ page }) => {
  267 |   await scenario(page, "forbidden");
  268 |   await page.goto(`/en/app/missions/${observing}/session`);
> 269 |   await expect(feedStatus(page)).toContainText(
      |                                  ^ Error: expect(locator).toContainText(expected) failed
  270 |     "This observation is open in another window or tab.",
  271 |   );
  272 |   await expect(page.getByRole("button", { name: "Watch here" })).toBeVisible();
  273 | });
  274 | 
```