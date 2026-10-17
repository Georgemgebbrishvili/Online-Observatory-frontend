# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> public at 1440 >> en /privacy
- Location: e2e/visual.spec.ts:127:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  13 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: en-privacy-1440.png

Call log:
  - Expect "toHaveScreenshot(en-privacy-1440.png)" with timeout 15000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 13 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 13 pixels (ratio 0.01 of all image pixels) are different.

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
          - generic "Stellar by Astroman" [ref=e7]:
            - generic [ref=e8]: Stellar
            - generic [ref=e9]: by Astroman
        - navigation "Public navigation" [ref=e10]:
          - link "Explore" [ref=e11] [cursor=pointer]:
            - /url: /en#tonight
          - link "Live" [ref=e12] [cursor=pointer]:
            - /url: /en/app/live
          - link "Observatory" [ref=e13] [cursor=pointer]:
            - /url: /en/observatory
          - link "Pricing" [ref=e14] [cursor=pointer]:
            - /url: /en/pricing
          - link "About" [ref=e15] [cursor=pointer]:
            - /url: /en#about
        - generic [ref=e16]:
          - 'link "Language: ქართული" [ref=e17] [cursor=pointer]':
            - /url: /ka/privacy
            - text: ქართული
          - link "Sign in" [ref=e18] [cursor=pointer]:
            - /url: /en/sign-in
          - link "Start exploring" [ref=e19] [cursor=pointer]:
            - /url: /en#tonight
    - main [ref=e21]:
      - region [ref=e22]:
        - generic [ref=e23]:
          - paragraph [ref=e24]: Legal · Draft
          - heading "Privacy policy" [level=1] [ref=e25]
          - paragraph [ref=e26]: What Stellar records about you and why. This document needs a data inventory and legal review before it can be published properly.
      - generic [ref=e27]:
        - navigation [ref=e28]:
          - heading "Contents" [level=2] [ref=e29]
          - list [ref=e30]:
            - listitem [ref=e31]:
              - link "01 Staying signed in" [ref=e32] [cursor=pointer]:
                - /url: "#section-1"
                - generic [ref=e33]: "01"
                - generic [ref=e34]: Staying signed in
            - listitem [ref=e35]:
              - link "02 What Stellar collects · Awaiting legal review" [ref=e36] [cursor=pointer]:
                - /url: "#section-2"
                - generic [ref=e37]: "02"
                - generic [ref=e38]:
                  - text: What Stellar collects
                  - generic [ref=e39]: · Awaiting legal review
            - listitem [ref=e40]:
              - link "03 Your captures and your Collection · Awaiting legal review" [ref=e41] [cursor=pointer]:
                - /url: "#section-3"
                - generic [ref=e42]: "03"
                - generic [ref=e43]:
                  - text: Your captures and your Collection
                  - generic [ref=e44]: · Awaiting legal review
            - listitem [ref=e45]:
              - link "04 Payment information · Awaiting legal review" [ref=e46] [cursor=pointer]:
                - /url: "#section-4"
                - generic [ref=e47]: "04"
                - generic [ref=e48]:
                  - text: Payment information
                  - generic [ref=e49]: · Awaiting legal review
            - listitem [ref=e50]:
              - link "05 Who else processes your data · Awaiting legal review" [ref=e51] [cursor=pointer]:
                - /url: "#section-5"
                - generic [ref=e52]: "05"
                - generic [ref=e53]:
                  - text: Who else processes your data
                  - generic [ref=e54]: · Awaiting legal review
            - listitem [ref=e55]:
              - link "06 How long data is kept · Awaiting legal review" [ref=e56] [cursor=pointer]:
                - /url: "#section-6"
                - generic [ref=e57]: "06"
                - generic [ref=e58]:
                  - text: How long data is kept
                  - generic [ref=e59]: · Awaiting legal review
            - listitem [ref=e60]:
              - link "07 Your rights over your data · Awaiting legal review" [ref=e61] [cursor=pointer]:
                - /url: "#section-7"
                - generic [ref=e62]: "07"
                - generic [ref=e63]:
                  - text: Your rights over your data
                  - generic [ref=e64]: · Awaiting legal review
            - listitem [ref=e65]:
              - link "08 How to contact us about privacy · Awaiting legal review" [ref=e66] [cursor=pointer]:
                - /url: "#section-8"
                - generic [ref=e67]: "08"
                - generic [ref=e68]:
                  - text: How to contact us about privacy
                  - generic [ref=e69]: · Awaiting legal review
        - article [ref=e70]:
          - note [ref=e71]:
            - generic [ref=e72]: DRAFT
            - heading "These terms are not yet in force" [level=2] [ref=e73]
            - paragraph [ref=e74]: Stellar has not launched and this document is awaiting legal review. Sections marked as settled record decisions already taken about how the service will work. They are published for transparency and do not yet bind anyone.
            - paragraph [ref=e75]: 7 of 8 sections are awaiting legal review. Each will be written and reviewed before Stellar opens.
          - region [ref=e76]:
            - heading "01 Staying signed in" [level=2] [ref=e77]:
              - generic [ref=e78]: "01"
              - text: Staying signed in
            - generic [ref=e79]: Settled
            - paragraph [ref=e80]: Signing in sets session cookies in your browser. They exist to keep you signed in and to protect the forms you submit against cross-site request forgery. They are not advertising cookies and they do not follow you to other sites.
          - region [ref=e81]:
            - heading "02 What Stellar collects" [level=2] [ref=e82]:
              - generic [ref=e83]: "02"
              - text: What Stellar collects
            - generic [ref=e84]: Awaiting legal review
          - region [ref=e85]:
            - heading "03 Your captures and your Collection" [level=2] [ref=e86]:
              - generic [ref=e87]: "03"
              - text: Your captures and your Collection
            - generic [ref=e88]: Awaiting legal review
          - region [ref=e89]:
            - heading "04 Payment information" [level=2] [ref=e90]:
              - generic [ref=e91]: "04"
              - text: Payment information
            - generic [ref=e92]: Awaiting legal review
          - region [ref=e93]:
            - heading "05 Who else processes your data" [level=2] [ref=e94]:
              - generic [ref=e95]: "05"
              - text: Who else processes your data
            - generic [ref=e96]: Awaiting legal review
          - region [ref=e97]:
            - heading "06 How long data is kept" [level=2] [ref=e98]:
              - generic [ref=e99]: "06"
              - text: How long data is kept
            - generic [ref=e100]: Awaiting legal review
          - region [ref=e101]:
            - heading "07 Your rights over your data" [level=2] [ref=e102]:
              - generic [ref=e103]: "07"
              - text: Your rights over your data
            - generic [ref=e104]: Awaiting legal review
          - region [ref=e105]:
            - heading "08 How to contact us about privacy" [level=2] [ref=e106]:
              - generic [ref=e107]: "08"
              - text: How to contact us about privacy
            - generic [ref=e108]: Awaiting legal review
          - link "Return to Stellar" [ref=e109] [cursor=pointer]:
            - /url: /en
    - contentinfo [ref=e110]:
      - generic [ref=e111]:
        - generic [ref=e112]:
          - generic "Stellar by Astroman" [ref=e113]:
            - generic [ref=e114]: Stellar
            - generic [ref=e115]: by Astroman
          - paragraph [ref=e116]: One real telescope in Tbilisi. The real sky, live.
        - navigation "Product · Company" [ref=e117]:
          - generic [ref=e118]:
            - heading "Product" [level=2] [ref=e119]
            - link "Missions" [ref=e120] [cursor=pointer]:
              - /url: /en#tonight
            - link "Live" [ref=e121] [cursor=pointer]:
              - /url: /en/app/live
            - link "Collection" [ref=e122] [cursor=pointer]:
              - /url: /en/app/collection
            - link "Observatory" [ref=e123] [cursor=pointer]:
              - /url: /en/observatory
            - link "Status" [ref=e124] [cursor=pointer]:
              - /url: /en/status
          - generic [ref=e125]:
            - heading "Company" [level=2] [ref=e126]
            - generic "Coming soon" [ref=e127]: About
            - generic "Coming soon" [ref=e128]: Contact
          - generic [ref=e129]:
            - heading "Legal" [level=2] [ref=e130]
            - link "Terms" [ref=e131] [cursor=pointer]:
              - /url: /en/terms
            - link "Privacy" [ref=e132] [cursor=pointer]:
              - /url: /en/privacy
            - link "Refunds" [ref=e133] [cursor=pointer]:
              - /url: /en/refunds
          - generic [ref=e134]:
            - heading "Language" [level=2] [ref=e135]
            - link "ქართული" [ref=e136] [cursor=pointer]:
              - /url: /ka/privacy
            - link "English" [ref=e137] [cursor=pointer]:
              - /url: /en/privacy
  - button "Open Next.js Dev Tools" [ref=e143] [cursor=pointer]
  - alert [ref=e147]
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