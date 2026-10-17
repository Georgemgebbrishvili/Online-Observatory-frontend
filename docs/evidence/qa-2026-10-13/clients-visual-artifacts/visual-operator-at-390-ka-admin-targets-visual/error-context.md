# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> operator at 390 >> ka /admin/targets
- Location: e2e/visual.spec.ts:151:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

Timeout: 15000ms
  Timeout 15000ms exceeded.

  Snapshot: ka-admin-targets-390.png

Call log:
  - Expect "toHaveScreenshot(ka-admin-targets-390.png)" with timeout 15000ms
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
      - region [ref=e24]:
        - generic [ref=e25]:
          - heading "ობიექტები" [level=2] [ref=e26]
          - paragraph [ref=e27]: ოპერატორის დამტკიცებული კატალოგი. ობიექტის გამორთვა მას ერთდროულად ყველა მომხმარებლის ეკრანიდან შლის.
        - table [ref=e29]:
          - rowgroup [ref=e30]:
            - row [ref=e31]:
              - columnheader "ობიექტი" [ref=e32]
              - columnheader "კატალოგი" [ref=e33]
              - columnheader "პოზიცია" [ref=e34]
              - columnheader "მინიმალური სიმაღლე" [ref=e35]
              - columnheader "სავარაუდო წუთები" [ref=e36]
              - columnheader "ჩართული" [ref=e37]
              - columnheader "ჩართვა" [ref=e38]
          - rowgroup [ref=e40]:
            - row [ref=e41]:
              - rowheader "ჰერკულესის გროვა" [ref=e42]
              - cell "M13" [ref=e43]
              - cell "RA 16h 41m 42.0s · DEC +36° 27′ 36″" [ref=e44]
              - cell "25°" [ref=e45]
              - cell "10" [ref=e46]
              - cell "კი" [ref=e47]
              - cell [ref=e50]:
                - 'button "გამორთვა: ჰერკულესის გროვა" [ref=e51] [cursor=pointer]':
                  - generic [ref=e52]: გამორთვა
            - row [ref=e53]:
              - rowheader "სატურნი" [ref=e54]
              - cell "არცერთი" [ref=e55]
              - cell "ეფემერიდი · SATURN" [ref=e56]
              - cell "20°" [ref=e57]
              - cell "10" [ref=e58]
              - cell "კი" [ref=e59]
              - cell [ref=e62]:
                - 'button "გამორთვა: სატურნი" [ref=e63] [cursor=pointer]':
                  - generic [ref=e64]: გამორთვა
            - row [ref=e65]:
              - rowheader "ალბირეო" [ref=e66]
              - cell "Beta Cygni" [ref=e67]
              - cell "RA 19h 30m 43.2s · DEC +27° 57′ 36″" [ref=e68]
              - cell "25°" [ref=e69]
              - cell "15" [ref=e70]
              - cell "კი" [ref=e71]
              - cell [ref=e74]:
                - 'button "გამორთვა: ალბირეო" [ref=e75] [cursor=pointer]':
                  - generic [ref=e76]: გამორთვა
            - row [ref=e77]:
              - rowheader "მთვარე" [ref=e78]
              - cell "არცერთი" [ref=e79]
              - cell "ეფემერიდი · MOON" [ref=e80]
              - cell "25°" [ref=e81]
              - cell "15" [ref=e82]
              - cell "კი" [ref=e83]
              - cell [ref=e86]:
                - 'button "გამორთვა: მთვარე" [ref=e87] [cursor=pointer]':
                  - generic [ref=e88]: გამორთვა
            - row [ref=e89]:
              - rowheader "ვენერა" [ref=e90]
              - cell "არცერთი" [ref=e91]
              - cell "ეფემერიდი · VENUS" [ref=e92]
              - cell "25°" [ref=e93]
              - cell "15" [ref=e94]
              - cell "კი" [ref=e95]
              - cell [ref=e98]:
                - 'button "გამორთვა: ვენერა" [ref=e99] [cursor=pointer]':
                  - generic [ref=e100]: გამორთვა
  - button "Open Next.js Dev Tools" [ref=e106] [cursor=pointer]
  - alert [ref=e110]
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