# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> public at 1440 >> en /
- Location: e2e/visual.spec.ts:127:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

Timeout: 15000ms
  Timeout 15000ms exceeded.

  Snapshot: en-home-1440.png

Call log:
  - Expect "toHaveScreenshot(en-home-1440.png)" with timeout 15000ms
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
        - navigation "Public navigation" [ref=e9]:
          - link "Explore" [ref=e10] [cursor=pointer]:
            - /url: /en#tonight
          - link "Live" [ref=e11] [cursor=pointer]:
            - /url: /en/app/live
          - link "Observatory" [ref=e12] [cursor=pointer]:
            - /url: /en/observatory
          - link "Pricing" [ref=e13] [cursor=pointer]:
            - /url: /en/pricing
          - link "About" [ref=e14] [cursor=pointer]:
            - /url: /en#about
        - generic [ref=e15]:
          - 'link "Language: ქართული" [ref=e16] [cursor=pointer]':
            - /url: /ka
            - text: ქართული
          - link "Sign in" [ref=e17] [cursor=pointer]:
            - /url: /en/sign-in
          - link "Start exploring" [ref=e18] [cursor=pointer]:
            - /url: /en#tonight
    - main [ref=e20]:
      - region "The real sky, live." [ref=e21]:
        - generic [ref=e22] [cursor=pointer]:
          - generic:
            - paragraph:
              - generic: Explore the sky
              - generic: ·
              - generic: "1"
              - generic: /
              - generic: "4"
              - generic: found
            - paragraph: Illustration — not telescope output
        - generic:
          - heading "The real sky, live." [level=1]:
            - text: The real sky,
            - emphasis: live.
          - paragraph: A real telescope in Tbilisi, Georgia, shows you the sky live. Reserve an observation slot and watch the real camera feed.
          - link "Reserve a slot" [ref=e24] [cursor=pointer]:
            - /url: /en/app/book
      - region [ref=e26]:
        - generic [ref=e27]:
          - generic [ref=e28]:
            - paragraph [ref=e29]: How Stellar works
            - heading "Four steps. One real observation." [level=2] [ref=e30]
            - paragraph [ref=e31]: Stellar turns time on a real telescope into one clear mission, from reserving a slot to keeping what you captured.
          - list [ref=e32]:
            - listitem [ref=e33]:
              - heading "Reserve" [level=3] [ref=e39]
              - paragraph [ref=e40]: Pick a target from tonight's observable sky and reserve a slot.
              - generic [ref=e41]: Simulated today
            - listitem [ref=e42]:
              - heading "Slew" [level=3] [ref=e48]
              - paragraph [ref=e49]: At your slot the telescope in Tbilisi turns to your target.
              - generic [ref=e50]: Simulated today
            - listitem [ref=e51]:
              - heading "Watch" [level=3] [ref=e57]
              - paragraph [ref=e58]: You watch its camera live as short exposures stack into a clearer view.
              - generic [ref=e59]: Simulated today
            - listitem [ref=e60]:
              - heading "Keep" [level=3] [ref=e65]
              - paragraph [ref=e66]: Capture the stacked frame and keep it in your Collection.
              - generic [ref=e67]: Simulated today
      - region [ref=e68]:
        - generic [ref=e69]:
          - generic [ref=e70]:
            - generic [ref=e71]:
              - paragraph [ref=e72]: Tonight's sky
              - heading "Choose what the telescope sees next." [level=2] [ref=e73]
              - paragraph [ref=e74]: What the observatory can see tonight, and why it cannot see the rest.
            - paragraph [ref=e75]: Visibility computed live by the observatory
          - generic [ref=e76]:
            - note [ref=e78]:
              - strong [ref=e79]: SIMULATED OBSERVATORY
              - generic [ref=e80]: Visibility is computed for the simulator. No real telescope is moving.
            - list [ref=e81]:
              - listitem [ref=e82]:
                - generic [ref=e83]: "01"
                - generic [ref=e84]:
                  - paragraph [ref=e85]: Double star · Beta Cygni
                  - heading [level=3] [ref=e86]:
                    - link "Albireo" [ref=e87] [cursor=pointer]:
                      - /url: /en/app/missions/albireo
                - generic [ref=e88]: Observable now
                - generic [ref=e90]:
                  - generic [ref=e91]:
                    - term [ref=e92]: Altitude now
                    - definition [ref=e93]: 61°
                  - generic [ref=e94]:
                    - term [ref=e95]: Window
                    - definition [ref=e96]: Until 03:50
                - generic [ref=e97]: →
              - listitem [ref=e98]:
                - generic [ref=e99]: "02"
                - generic [ref=e100]:
                  - paragraph [ref=e101]: Planet
                  - heading [level=3] [ref=e102]:
                    - link "Saturn" [ref=e103] [cursor=pointer]:
                      - /url: /en/app/missions/saturn
                - generic [ref=e104]: Observable now
                - generic [ref=e106]:
                  - generic [ref=e107]:
                    - term [ref=e108]: Altitude now
                    - definition [ref=e109]: 38°
                  - generic [ref=e110]:
                    - term [ref=e111]: Window
                    - definition [ref=e112]: 18:30 – 05:40
                - generic [ref=e113]: →
              - listitem [ref=e114]:
                - generic [ref=e115]: "03"
                - generic [ref=e116]:
                  - paragraph [ref=e117]: Moon
                  - heading [level=3] [ref=e118]:
                    - link "Moon" [ref=e119] [cursor=pointer]:
                      - /url: /en/app/missions/moon-terminator
                - generic [ref=e120]: Larger than the telescope's field of view
                - generic [ref=e122]:
                  - generic [ref=e123]:
                    - term [ref=e124]: Altitude now
                    - definition [ref=e125]: 44°
                  - generic [ref=e126]:
                    - term [ref=e127]: Window
                    - definition [ref=e128]: 17:10 – 02:20
                - generic [ref=e129]: →
              - listitem [ref=e130]:
                - generic [ref=e131]: "04"
                - generic [ref=e132]:
                  - paragraph [ref=e133]: Globular cluster · M13
                  - heading [level=3] [ref=e134]:
                    - link "Hercules Cluster" [ref=e135] [cursor=pointer]:
                      - /url: /en/app/missions/m13-hercules-cluster
                - generic [ref=e136]: Too low in the sky
                - generic [ref=e138]:
                  - generic [ref=e139]:
                    - term [ref=e140]: Altitude now
                    - definition [ref=e141]: 18°
                  - generic [ref=e142]:
                    - term [ref=e143]: Window
                    - definition [ref=e144]: Until 01:05
                - generic [ref=e145]: →
              - listitem [ref=e146]:
                - generic [ref=e147]: "05"
                - generic [ref=e148]:
                  - paragraph [ref=e149]: Planet
                  - heading [level=3] [ref=e150]:
                    - link "Venus" [ref=e151] [cursor=pointer]:
                      - /url: /en/app/missions/venus
                - generic [ref=e152]: Below the horizon
                - generic [ref=e154]:
                  - generic [ref=e155]:
                    - term [ref=e156]: Altitude now
                    - definition [ref=e157]: "-12°"
                  - generic [ref=e158]:
                    - term [ref=e159]: Window
                    - definition [ref=e160]: From 06:15
                - generic [ref=e161]: →
            - link "All of tonight's targets" [ref=e162] [cursor=pointer]:
              - /url: /en/app/missions
      - region [ref=e164]:
        - generic [ref=e165]:
          - generic [ref=e166]:
            - generic [ref=e167]:
              - paragraph [ref=e168]: The instrument
              - heading "One real telescope, in Tbilisi." [level=2] [ref=e169]
              - paragraph [ref=e170]: Commanded only by the observatory's own software, never directly from a browser. What you see is what its camera sees.
            - generic [ref=e171]:
              - generic [ref=e172]:
                - term [ref=e173]: Telescope
                - definition [ref=e174]: Celestron NexStar 6SE
              - generic [ref=e175]:
                - term [ref=e176]: Aperture
                - definition [ref=e177]:
                  - generic [ref=e178]: "150"
                  - generic [ref=e179]: mm
              - generic [ref=e180]:
                - term [ref=e181]: Focal length
                - definition [ref=e182]:
                  - generic [ref=e183]: "1500"
                  - generic [ref=e184]: mm
              - generic [ref=e185]:
                - term [ref=e186]: Focal ratio
                - definition [ref=e187]: f/10
              - generic [ref=e188]:
                - term [ref=e189]: Camera
                - definition [ref=e190]:
                  - text: ZWO ASI585MC
                  - generic [ref=e191]: Uncooled, one-shot colour
              - generic [ref=e192]:
                - term [ref=e193]: Mode
                - definition [ref=e194]:
                  - text: Live view
                  - generic [ref=e195]: Short exposures, stacked as you watch. Not long-exposure astrophotography.
              - generic [ref=e196]:
                - term [ref=e197]: Location
                - definition [ref=e198]: Tbilisi, Georgia
          - complementary [ref=e199]:
            - generic [ref=e200]:
              - heading "Live status" [level=3] [ref=e201]
              - link "Full status" [ref=e202] [cursor=pointer]:
                - /url: /en/status
                - text: Full status →
            - note [ref=e203]:
              - strong [ref=e204]: SIMULATED OBSERVATORY
              - generic [ref=e205]: The simulator is answering. No real telescope is moving.
            - generic [ref=e206]:
              - generic [ref=e207]:
                - term [ref=e208]: Observatory link
                - definition [ref=e209]:
                  - generic [ref=e210]: Online
              - generic [ref=e212]:
                - term [ref=e213]: Weather
                - definition [ref=e214]:
                  - generic [ref=e215]: Clear
              - generic [ref=e217]:
                - term [ref=e218]: Weather hold
                - definition [ref=e219]:
                  - generic [ref=e220]: No hold
            - paragraph [ref=e222]: An observation is in progress
      - region [ref=e223]:
        - generic [ref=e224]:
          - paragraph [ref=e225]: Begin with tonight
          - heading "Your next observation starts here." [level=2] [ref=e226]
          - paragraph [ref=e227]: Choose an observable target and shape your first Stellar mission.
          - generic [ref=e228]:
            - link "Reserve a slot" [ref=e229] [cursor=pointer]:
              - /url: /en/app/book
            - link "Explore tonight's sky" [ref=e231] [cursor=pointer]:
              - /url: "#tonight"
          - generic [ref=e233]:
            - heading "Private sessions" [level=3] [ref=e234]
            - list [ref=e235]:
              - listitem [ref=e236]: 30 min
              - listitem [ref=e237]: 60 min
              - listitem [ref=e238]: 120 min
            - paragraph [ref=e239]: Longer, dedicated telescope windows are coming later.
    - contentinfo [ref=e240]:
      - generic [ref=e241]:
        - generic [ref=e242]:
          - generic "Stellar by Astroman" [ref=e243]:
            - generic [ref=e244]: Stellar
            - generic [ref=e245]: by Astroman
          - paragraph [ref=e246]: One real telescope in Tbilisi. The real sky, live.
        - navigation "Product · Company" [ref=e247]:
          - generic [ref=e248]:
            - heading "Product" [level=2] [ref=e249]
            - link "Missions" [ref=e250] [cursor=pointer]:
              - /url: /en#tonight
            - link "Live" [ref=e251] [cursor=pointer]:
              - /url: /en/app/live
            - link "Collection" [ref=e252] [cursor=pointer]:
              - /url: /en/app/collection
            - link "Observatory" [ref=e253] [cursor=pointer]:
              - /url: /en/observatory
            - link "Status" [ref=e254] [cursor=pointer]:
              - /url: /en/status
          - generic [ref=e255]:
            - heading "Company" [level=2] [ref=e256]
            - generic "Coming soon" [ref=e257]: About
            - generic "Coming soon" [ref=e258]: Contact
          - generic [ref=e259]:
            - heading "Legal" [level=2] [ref=e260]
            - link "Terms" [ref=e261] [cursor=pointer]:
              - /url: /en/terms
            - link "Privacy" [ref=e262] [cursor=pointer]:
              - /url: /en/privacy
            - link "Refunds" [ref=e263] [cursor=pointer]:
              - /url: /en/refunds
          - generic [ref=e264]:
            - heading "Language" [level=2] [ref=e265]
            - link "ქართული" [ref=e266] [cursor=pointer]:
              - /url: /ka
            - link "English" [ref=e267] [cursor=pointer]:
              - /url: /en
  - button "Open Next.js Dev Tools" [ref=e273] [cursor=pointer]
  - alert [ref=e277]
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