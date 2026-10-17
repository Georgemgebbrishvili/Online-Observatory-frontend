# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> operator at 1440 >> ka /admin
- Location: e2e/visual.spec.ts:151:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

Timeout: 15000ms
  Failed to take two consecutive stable screenshots.

  Snapshot: ka-admin-1440.png

Call log:
  - Expect "toHaveScreenshot(ka-admin-1440.png)" with timeout 15000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Expected an image 1440px by 1001px, received 1440px by 900px. 191255 pixels (ratio 0.14 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Expected an image 1440px by 900px, received 1440px by 1001px. 191255 pixels (ratio 0.14 of all image pixels) are different.
  - waiting 250ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Timeout 15000ms exceeded.

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "შინაარსზე გადასვლა" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - link [ref=e6] [cursor=pointer]:
          - /url: /ka
          - generic "სტელარი — Astroman-ის პროდუქტი" [ref=e7]: Stellar
        - generic [ref=e9]:
          - paragraph [ref=e10]: ობსერვატორია · სტელარი თბილისი
          - heading "ოპერატორის პანელი" [level=1] [ref=e11]
        - navigation "ოპერატორის პანელი" [ref=e12]:
          - link "მიმოხილვა" [ref=e13] [cursor=pointer]:
            - /url: /ka/admin
          - link "მართვა" [ref=e14] [cursor=pointer]:
            - /url: /ka/admin/control
          - link "მისიები" [ref=e15] [cursor=pointer]:
            - /url: /ka/admin/missions
          - link "ობიექტები" [ref=e16] [cursor=pointer]:
            - /url: /ka/admin/targets
          - link "ჟურნალი" [ref=e17] [cursor=pointer]:
            - /url: /ka/admin/logs
      - status [ref=e18]:
        - strong [ref=e19]: სიმულირებული ობსერვატორია
        - generic [ref=e20]: პასუხობს სიმულატორი. აქედან ნამდვილი ტელესკოპი არ მოძრაობს.
      - generic [ref=e21]:
        - button "საგანგებო დაპარკვა" [ref=e22] [cursor=pointer]
        - status
    - main [ref=e23]:
      - generic [ref=e24]:
        - status [ref=e25]: მიღებულია 0 s წინ
        - region [ref=e26]:
          - heading "მოწყობილობები" [level=2] [ref=e27]
          - generic [ref=e28]:
            - generic [ref=e29]:
              - term [ref=e30]: აგენტის კავშირი
              - definition [ref=e31]:
                - generic [ref=e32]: ონლაინ
            - generic [ref=e34]:
              - term [ref=e35]: სამაგრი
              - definition [ref=e36]:
                - generic [ref=e37]: გამართულია
            - generic [ref=e39]:
              - term [ref=e40]: კამერა
              - definition [ref=e41]:
                - generic [ref=e42]: გამართულია
            - generic [ref=e44]:
              - term [ref=e45]: ფოკუსერი
              - definition [ref=e46]:
                - generic [ref=e47]: გამართულია
            - generic [ref=e49]:
              - term [ref=e50]: ამინდი
              - definition [ref=e51]: მოწმენდილი
        - region [ref=e52]:
          - heading "ტელემეტრია" [level=2] [ref=e53]
          - generic [ref=e54]:
            - generic [ref=e55]:
              - term [ref=e56]: RA / Dec (J2000)
              - definition [ref=e57]:
                - generic [ref=e58]: RA 16h 41m 42.0s · DEC +36° 27′ 36″
            - generic [ref=e59]:
              - term [ref=e60]: სიმაღლე / აზიმუტი
              - definition [ref=e61]:
                - generic [ref=e62]: ALT 61.2° · AZ 241.7°
            - generic [ref=e63]:
              - term [ref=e64]: თვალყურის დევნება
              - definition [ref=e65]: კი
            - generic [ref=e66]:
              - term [ref=e67]: დაპარკულია
              - definition [ref=e68]: არა
            - generic [ref=e69]:
              - term [ref=e70]: მოძრაობს
              - definition [ref=e71]: არა
            - generic [ref=e72]:
              - term [ref=e73]: ფოკუსერის პოზიცია
              - definition [ref=e74]:
                - generic [ref=e75]: "12480"
            - generic [ref=e76]:
              - term [ref=e77]: გარემოს ტემპერატურა
              - definition [ref=e78]:
                - generic [ref=e79]: 14.5 °C
            - generic [ref=e80]:
              - term [ref=e81]: აგენტის ვერსია
              - definition [ref=e82]:
                - generic [ref=e83]: 0.1.0-sim
        - region [ref=e84]:
          - heading "აქტიური მისია" [level=2] [ref=e85]
          - generic [ref=e86]:
            - generic [ref=e87]:
              - term [ref=e88]: აქტიური მისია
              - definition [ref=e89]:
                - generic [ref=e90]: 20000000-0000-4000-8000-000000000001
            - generic [ref=e91]:
              - term [ref=e92]: სესია
              - definition [ref=e93]:
                - generic [ref=e94]: 40000000-0000-4000-8000-000000000001
            - generic [ref=e95]:
              - term [ref=e96]: კავშირის დაყოვნება
              - definition [ref=e97]:
                - generic [ref=e98]: არ იზომება
            - generic [ref=e99]:
              - term [ref=e100]: ბოლო heartbeat
              - definition [ref=e101]:
                - generic [ref=e102]: 0 s
        - region [ref=e103]:
          - heading "უსაფრთხოების პარამეტრები" [level=2] [ref=e104]
          - generic [ref=e105]:
            - generic [ref=e106]:
              - term [ref=e107]: მინიმალური სიმაღლე
              - definition [ref=e108]:
                - generic [ref=e109]: 20°
            - generic [ref=e110]:
              - term [ref=e111]: მაქსიმალური სიმაღლე (MAX_ALT_SAFE)
              - definition [ref=e112]:
                - generic [ref=e113]: გაუზომავია — ყველა მოძრაობა უარყოფილია
            - generic [ref=e115]:
              - term [ref=e116]: მზისგან დაშორება
              - definition [ref=e117]:
                - generic [ref=e118]: 30°
  - button "Open Next.js Dev Tools" [ref=e124] [cursor=pointer]
  - alert [ref=e128]
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