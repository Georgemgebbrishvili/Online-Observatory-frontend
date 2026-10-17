# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> public at 1440 >> en /terms
- Location: e2e/visual.spec.ts:127:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  111 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: en-terms-1440.png

Call log:
  - Expect "toHaveScreenshot(en-terms-1440.png)" with timeout 15000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 111 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 111 pixels (ratio 0.01 of all image pixels) are different.

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
            - /url: /ka/terms
            - text: ქართული
          - link "Sign in" [ref=e17] [cursor=pointer]:
            - /url: /en/sign-in
          - link "Start exploring" [ref=e18] [cursor=pointer]:
            - /url: /en#tonight
    - main [ref=e20]:
      - region [ref=e21]:
        - generic [ref=e22]:
          - paragraph [ref=e23]: Legal · Draft
          - heading "Terms of service" [level=1] [ref=e24]
          - paragraph [ref=e25]: What Stellar offers, and what it does not. This draft is published early so that the parts already settled can be read and challenged.
      - generic [ref=e26]:
        - navigation [ref=e27]:
          - heading "Contents" [level=2] [ref=e28]
          - list [ref=e29]:
            - listitem [ref=e30]:
              - link "01 What Stellar is" [ref=e31] [cursor=pointer]:
                - /url: "#section-1"
                - generic [ref=e32]: "01"
                - generic [ref=e33]: What Stellar is
            - listitem [ref=e34]:
              - link "02 An observation slot" [ref=e35] [cursor=pointer]:
                - /url: "#section-2"
                - generic [ref=e36]: "02"
                - generic [ref=e37]: An observation slot
            - listitem [ref=e38]:
              - link "03 Your account · Awaiting legal review" [ref=e39] [cursor=pointer]:
                - /url: "#section-3"
                - generic [ref=e40]: "03"
                - generic [ref=e41]:
                  - text: Your account
                  - generic [ref=e42]: · Awaiting legal review
            - listitem [ref=e43]:
              - link "04 Weather, visibility and a slot we cannot run · Awaiting legal review" [ref=e44] [cursor=pointer]:
                - /url: "#section-4"
                - generic [ref=e45]: "04"
                - generic [ref=e46]:
                  - text: Weather, visibility and a slot we cannot run
                  - generic [ref=e47]: · Awaiting legal review
            - listitem [ref=e48]:
              - link "05 Acceptable use · Awaiting legal review" [ref=e49] [cursor=pointer]:
                - /url: "#section-5"
                - generic [ref=e50]: "05"
                - generic [ref=e51]:
                  - text: Acceptable use
                  - generic [ref=e52]: · Awaiting legal review
            - listitem [ref=e53]:
              - link "06 Availability, liability and limits · Awaiting legal review" [ref=e54] [cursor=pointer]:
                - /url: "#section-6"
                - generic [ref=e55]: "06"
                - generic [ref=e56]:
                  - text: Availability, liability and limits
                  - generic [ref=e57]: · Awaiting legal review
            - listitem [ref=e58]:
              - link "07 Changes to these terms · Awaiting legal review" [ref=e59] [cursor=pointer]:
                - /url: "#section-7"
                - generic [ref=e60]: "07"
                - generic [ref=e61]:
                  - text: Changes to these terms
                  - generic [ref=e62]: · Awaiting legal review
            - listitem [ref=e63]:
              - link "08 Governing law and disputes · Awaiting legal review" [ref=e64] [cursor=pointer]:
                - /url: "#section-8"
                - generic [ref=e65]: "08"
                - generic [ref=e66]:
                  - text: Governing law and disputes
                  - generic [ref=e67]: · Awaiting legal review
        - article [ref=e68]:
          - note [ref=e69]:
            - generic [ref=e70]: DRAFT
            - heading "These terms are not yet in force" [level=2] [ref=e71]
            - paragraph [ref=e72]: Stellar has not launched and this document is awaiting legal review. Sections marked as settled record decisions already taken about how the service will work. They are published for transparency and do not yet bind anyone.
            - paragraph [ref=e73]: 6 of 8 sections are awaiting legal review. Each will be written and reviewed before Stellar opens.
          - region [ref=e74]:
            - heading "01 What Stellar is" [level=2] [ref=e75]:
              - generic [ref=e76]: "01"
              - text: What Stellar is
            - generic [ref=e77]: Settled
            - paragraph [ref=e78]: Stellar is a live remote observatory in Tbilisi, Georgia. You reserve an observation slot, choose a target from an operator-approved list, and a real Celestron NexStar 6SE moves to that target while you watch its camera output.
            - paragraph [ref=e79]: Stellar is a live-view service. It uses short exposures and live stacking, the technique usually called electronically assisted astronomy. It is not a long-exposure astrophotography service, and it does not produce results comparable to a research observatory or a space telescope.
          - region [ref=e80]:
            - heading "02 An observation slot" [level=2] [ref=e81]:
              - generic [ref=e82]: "02"
              - text: An observation slot
            - generic [ref=e83]: Settled
            - paragraph [ref=e84]: A slot is a reserved period of telescope time with an operator-approved target. One observation runs at a time, and one person controls the telescope for the length of their slot.
            - paragraph [ref=e85]: The sky decides what is visible. A target that has set, has not risen, or sits below the telescope's safe altitude cannot be observed, whatever the booking says.
          - region [ref=e86]:
            - heading "03 Your account" [level=2] [ref=e87]:
              - generic [ref=e88]: "03"
              - text: Your account
            - generic [ref=e89]: Awaiting legal review
          - region [ref=e90]:
            - heading "04 Weather, visibility and a slot we cannot run" [level=2] [ref=e91]:
              - generic [ref=e92]: "04"
              - text: Weather, visibility and a slot we cannot run
            - generic [ref=e93]: Awaiting legal review
          - region [ref=e94]:
            - heading "05 Acceptable use" [level=2] [ref=e95]:
              - generic [ref=e96]: "05"
              - text: Acceptable use
            - generic [ref=e97]: Awaiting legal review
          - region [ref=e98]:
            - heading "06 Availability, liability and limits" [level=2] [ref=e99]:
              - generic [ref=e100]: "06"
              - text: Availability, liability and limits
            - generic [ref=e101]: Awaiting legal review
          - region [ref=e102]:
            - heading "07 Changes to these terms" [level=2] [ref=e103]:
              - generic [ref=e104]: "07"
              - text: Changes to these terms
            - generic [ref=e105]: Awaiting legal review
          - region [ref=e106]:
            - heading "08 Governing law and disputes" [level=2] [ref=e107]:
              - generic [ref=e108]: "08"
              - text: Governing law and disputes
            - generic [ref=e109]: Awaiting legal review
          - link "Return to Stellar" [ref=e110] [cursor=pointer]:
            - /url: /en
    - contentinfo [ref=e111]:
      - generic [ref=e112]:
        - generic [ref=e113]:
          - generic "Stellar by Astroman" [ref=e114]:
            - generic [ref=e115]: Stellar
            - generic [ref=e116]: by Astroman
          - paragraph [ref=e117]: One real telescope in Tbilisi. The real sky, live.
        - navigation "Product · Company" [ref=e118]:
          - generic [ref=e119]:
            - heading "Product" [level=2] [ref=e120]
            - link "Missions" [ref=e121] [cursor=pointer]:
              - /url: /en#tonight
            - link "Live" [ref=e122] [cursor=pointer]:
              - /url: /en/app/live
            - link "Collection" [ref=e123] [cursor=pointer]:
              - /url: /en/app/collection
            - link "Observatory" [ref=e124] [cursor=pointer]:
              - /url: /en/observatory
            - link "Status" [ref=e125] [cursor=pointer]:
              - /url: /en/status
          - generic [ref=e126]:
            - heading "Company" [level=2] [ref=e127]
            - generic "Coming soon" [ref=e128]: About
            - generic "Coming soon" [ref=e129]: Contact
          - generic [ref=e130]:
            - heading "Legal" [level=2] [ref=e131]
            - link "Terms" [ref=e132] [cursor=pointer]:
              - /url: /en/terms
            - link "Privacy" [ref=e133] [cursor=pointer]:
              - /url: /en/privacy
            - link "Refunds" [ref=e134] [cursor=pointer]:
              - /url: /en/refunds
          - generic [ref=e135]:
            - heading "Language" [level=2] [ref=e136]
            - link "ქართული" [ref=e137] [cursor=pointer]:
              - /url: /ka/terms
            - link "English" [ref=e138] [cursor=pointer]:
              - /url: /en/terms
  - button "Open Next.js Dev Tools" [ref=e144] [cursor=pointer]
  - alert [ref=e148]
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