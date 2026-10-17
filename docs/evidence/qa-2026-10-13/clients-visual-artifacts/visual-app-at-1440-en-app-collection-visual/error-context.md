# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> app at 1440 >> en /app/collection
- Location: e2e/visual.spec.ts:139:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

Timeout: 15000ms
  Timeout 15000ms exceeded.

  Snapshot: en-app-collection-1440.png

Call log:
  - Expect "toHaveScreenshot(en-app-collection-1440.png)" with timeout 15000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Timeout 15000ms exceeded.

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - link [ref=e6] [cursor=pointer]:
          - /url: /en
          - generic "Stellar by Astroman" [ref=e7]: Stellar
        - navigation "Application navigation" [ref=e9]:
          - link "Home" [ref=e10] [cursor=pointer]:
            - /url: /en/app
          - link "Book" [ref=e12] [cursor=pointer]:
            - /url: /en/app/book
          - link "Live" [ref=e14] [cursor=pointer]:
            - /url: /en/app/live
          - link "Collection" [ref=e16] [cursor=pointer]:
            - /url: /en/app/collection
          - link "Profile" [ref=e18] [cursor=pointer]:
            - /url: /en/app/profile
        - generic [ref=e20]:
          - group "Observatory status" [ref=e21]:
            - strong [ref=e22]: Tbilisi Observatory
            - generic [ref=e23]: Online
            - generic [ref=e25]: Simulated status
          - button "Sign out" [ref=e27] [cursor=pointer]
    - main [ref=e28]:
      - generic [ref=e29]:
        - generic [ref=e30]:
          - paragraph [ref=e31]: Your observations
          - heading "A sky only you have seen." [level=1] [ref=e32]
          - paragraph [ref=e33]: Every capture you take during an observation is kept here, with the settings the telescope used.
        - region [ref=e34]:
          - 'link "Open capture: Hercules Cluster" [ref=e35] [cursor=pointer]':
            - /url: /en/app/collection/60000000-0000-4000-8000-000000000001
            - img "Hercules Cluster, as captured" [ref=e36]
            - generic [ref=e37]:
              - generic [ref=e38]: Simulated capture
              - generic [ref=e39]: Private
          - generic [ref=e40]:
            - paragraph [ref=e41]: Latest capture
            - paragraph [ref=e42]: M13 · 60000000
            - heading "Hercules Cluster" [level=2] [ref=e43]
            - paragraph [ref=e44]: 23 September 2026 at 00:10 GMT+4
            - link "Open capture" [ref=e45] [cursor=pointer]:
              - /url: /en/app/collection/60000000-0000-4000-8000-000000000001
        - region [ref=e47]:
          - generic [ref=e48]:
            - heading "Observation archive" [level=2] [ref=e49]
            - paragraph [ref=e50]: Newest first, by the time the shutter closed.
          - article [ref=e52]:
            - 'link "Open capture: Hercules Cluster" [ref=e53] [cursor=pointer]':
              - /url: /en/app/collection/60000000-0000-4000-8000-000000000002
              - img "Hercules Cluster, as captured" [ref=e54]
              - generic [ref=e55]:
                - generic [ref=e56]: Simulated capture
                - generic [ref=e57]: Private
            - generic [ref=e58]:
              - generic [ref=e59]: M13 · 60000000
              - heading [level=3] [ref=e60]:
                - link "Hercules Cluster" [ref=e61] [cursor=pointer]:
                  - /url: /en/app/collection/60000000-0000-4000-8000-000000000002
              - paragraph [ref=e62]: 23 September 2026 at 00:06 GMT+4
        - region [ref=e63]:
          - generic [ref=e64]:
            - heading "Past nights" [level=2] [ref=e65]
            - paragraph [ref=e66]: Every observation you have made, latest first, with what it kept.
          - list [ref=e67]:
            - listitem [ref=e68]:
              - 'link "Open the night: Hercules Cluster" [ref=e69] [cursor=pointer]':
                - /url: /en/app/missions/22000000-0000-4000-8000-000000000003/session
                - time [ref=e70]: 23 September 2026 at 00:12 GMT+4
                - strong [ref=e71]: Hercules Cluster
                - generic [ref=e72]: Observation complete
                - generic [ref=e73]: 3 captures
        - navigation "Observation archive" [ref=e74]:
          - link "Older captures" [ref=e75] [cursor=pointer]:
            - /url: /en/app/collection?cursor=60000000-0000-4000-8000-000000000002
    - contentinfo [ref=e77]:
      - generic "Stellar by Astroman" [ref=e78]:
        - generic [ref=e79]: Stellar
        - generic [ref=e80]: by Astroman
      - navigation "Not yet available" [ref=e81]:
        - paragraph [ref=e82]: Not yet available
        - link "Subscription" [ref=e83] [cursor=pointer]:
          - /url: /en/app/subscription
        - link "Loyalty" [ref=e89] [cursor=pointer]:
          - /url: /en/app/loyalty
        - link "Observation Pass" [ref=e94] [cursor=pointer]:
          - /url: /en/app/passes
  - button "Open Next.js Dev Tools" [ref=e104] [cursor=pointer]
  - alert [ref=e108]
```

# Test source

```ts
  5   |   locales,
  6   |   operatorRoutes,
  7   |   parameterisedRoutes,
  8   |   publicRoutes,
  9   |   signedOutRoutes,
  10  | } from "./routes";
  11  | 
  12  | /**
  13  |  * The visual gate. Every public and every /app route, both languages, phone and
  14  |  * desktop, compared against baselines generated only inside the Playwright container
  15  |  * (`npm run visual:update`). Fonts rasterise differently on macOS, so a baseline
  16  |  * from anywhere else would fail CI for reasons that are not changes to the product.
  17  |  */
  18  | test.skip(
  19  |   process.platform !== "linux",
  20  |   "Visual baselines exist only for the Playwright container: run `npm run visual`.",
  21  | );
  22  | 
  23  | // A fixed instant for everything the browser computes. What the server renders from
  24  | // its own clock is masked instead.
  25  | const fixedTime = new Date("2026-09-25T20:00:00+04:00");
  26  | 
  27  | const widths = [
  28  |   { name: "390", viewport: { width: 390, height: 844 } },
  29  |   { name: "1440", viewport: { width: 1440, height: 900 } },
  30  | ] as const;
  31  | 
  32  | function masks(page: Page) {
  33  |   return [
  34  |     page.locator("time"),
  35  |     page.locator(".live-time"),
  36  |     // /status: the fake platform's hours and ages are relative to the server's clock.
  37  |     page.locator(".status-page tbody th"),
  38  |     page.locator("[data-field]").filter({ hasText: /\d{1,2}:\d{2}|ago|წინ/ }),
  39  |     page.locator(".status-observatory .data"),
  40  |     page.locator(".status-source"),
  41  |     // The room's forecast hour is the one the server read it in.
  42  |     page.locator(".room-reading-live"),
  43  |     // The live stream: a frame has arrived or not yet, and it is not waited on (below).
  44  |     page.locator(".live-feed [data-live-stream]"),
  45  |     // The operator overview's ages are the server's clock against the fake's readings.
  46  |     page.locator(".operator-freshness"),
  47  |     page.locator("[data-age]"),
  48  |     // A hash of the server's error, whose length changes with the code that threw it:
  49  |     // the whole line, so the mask's box does not.
  50  |     page.locator(".route-error-digest"),
  51  |     // The legal contents: Georgian rows of fractional height, whose text lands a pixel
  52  |     // apart from one run to the next.
  53  |     page.locator(".legal-toc ol"),
  54  |     // The observatory's clock is blank until it mounts, then the browser's time.
  55  |     page.locator(".site-clock"),
  56  |   ];
  57  | }
  58  | 
  59  | async function capture(
  60  |   page: Page,
  61  |   route: string,
  62  |   locale: string,
  63  |   width: string,
  64  |   label = route,
  65  | ) {
  66  |   await page.clock.setFixedTime(fixedTime);
  67  |   await page.goto(`/${locale}${route ? `/${route}` : ""}`);
  68  |   await expect(page.locator("h1").first()).toBeAttached();
  69  |   // Every image decoded. Not "networkidle": the dev server holds connections open,
  70  |   // and on some routes it never settles.
  71  |   // The live room settles first: a feed still starting or connecting is a moment, not a
  72  |   // state. Its MJPEG stream never "completes" -- it replaces itself -- so it is not waited on.
  73  |   await page.waitForFunction(() => !document.querySelector(".room [data-live-busy]"));
  74  |   // The operator's lists and console are fetched by the browser: loaded, not mid-way.
  75  |   await page.waitForFunction(
  76  |     () =>
  77  |       !document.querySelector(
  78  |         ':is(.operator-list, .operator-manual)[aria-busy="true"]',
  79  |       ),
  80  |   );
  81  |   await page.waitForFunction(() =>
  82  |     [...document.images].every(
  83  |       (image) => image.complete || "liveStream" in image.dataset,
  84  |     ),
  85  |   );
  86  | 
  87  |   // The body face for the locale (ADR-039): Geist for English, FiraGO for Georgian.
  88  |   const bodyFace = locale === "ka" ? "firago" : "geist";
  89  |   const bodyLoaded = await page.evaluate(async (face) => {
  90  |     await document.fonts.ready;
  91  |     return [...document.fonts].some((loaded) => {
  92  |       const family = loaded.family.toLowerCase();
  93  |       // next/font also declares a "<face> Fallback" from a system font: not the face.
  94  |       return (
  95  |         family.includes(face) &&
  96  |         !family.includes("fallback") &&
  97  |         loaded.status === "loaded"
  98  |       );
  99  |     });
  100 |   }, bodyFace);
  101 |   expect(bodyLoaded, `${bodyFace} must be loaded before capture`).toBe(true);
  102 | 
  103 |   // A query string is part of some routes; a file name keeps letters, digits and dashes.
  104 |   const name = `${locale}-${(label || "home").replace(/[^a-z0-9-]+/gi, "-")}-${width}.png`;
> 105 |   await expect(page).toHaveScreenshot(name, {
      |                      ^ Error: expect(page).toHaveScreenshot(expected) failed
  106 |     fullPage: true,
  107 |     mask: masks(page),
  108 |     stylePath: "e2e/visual.css",
  109 |   });
  110 | }
  111 | 
  112 | for (const { name: width, viewport } of widths) {
  113 |   test.describe(`public at ${width}`, () => {
  114 |     test.use({ viewport, storageState: { cookies: [], origins: [] } });
  115 | 
  116 |     for (const locale of locales) {
  117 |       // verify-email: where registering lands. not-found: any address that matches no
  118 |       // route. reset-password: its "sent" answer, and a reset link (ADR-040).
  119 |       for (const route of [
  120 |         ...publicRoutes,
  121 |         ...signedOutRoutes,
  122 |         "verify-email",
  123 |         "reset-password?sent=1",
  124 |         "reset-password/a-reset-link-token-for-the-visual-gate",
  125 |         "not-found",
  126 |       ]) {
  127 |         test(`${locale} /${route}`, async ({ page }) => {
  128 |           await capture(page, route, locale, width);
  129 |         });
  130 |       }
  131 |     }
  132 |   });
  133 | 
  134 |   test.describe(`app at ${width}`, () => {
  135 |     test.use({ viewport, storageState: "e2e/.auth/observer.json" });
  136 | 
  137 |     for (const locale of locales) {
  138 |       for (const route of [...appRoutes, ...parameterisedRoutes]) {
  139 |         test(`${locale} /${route}`, async ({ page }) => {
  140 |           await capture(page, route, locale, width);
  141 |         });
  142 |       }
  143 |     }
  144 |   });
  145 | 
  146 |   test.describe(`operator at ${width}`, () => {
  147 |     test.use({ viewport, storageState: "e2e/.auth/operator.json" });
  148 | 
  149 |     for (const locale of locales) {
  150 |       for (const route of operatorRoutes) {
  151 |         test(`${locale} /${route}`, async ({ page }) => {
  152 |           await capture(page, route, locale, width);
  153 |         });
  154 |       }
  155 |     }
  156 |   });
  157 | 
  158 |   // The route error screen. The fake platform fails every catalogue read for this one
  159 |   // operator, and the targets page does not catch it.
  160 |   test.describe(`error at ${width}`, () => {
  161 |     test.use({ viewport, storageState: { cookies: [], origins: [] } });
  162 | 
  163 |     for (const locale of locales) {
  164 |       test(`${locale} route error`, async ({ page }) => {
  165 |         await page.goto(`/${locale}/sign-in`);
  166 |         await page.locator('input[type="email"]').fill("failing@darkview.test");
  167 |         await page.locator('input[type="password"]').fill("correct horse battery");
  168 |         await page.locator('button[type="submit"]').click();
  169 |         await expect(page).toHaveURL(new RegExp(`/${locale}/app$`));
  170 |         await capture(page, "admin/targets", locale, width, "error");
  171 |       });
  172 |     }
  173 |   });
  174 | }
  175 | 
```