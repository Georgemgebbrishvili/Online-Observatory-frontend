# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> app at 390 >> ka /app/missions/21000000-0000-4000-8000-000000000002/session
- Location: e2e/visual.spec.ts:139:9

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: screencast.showOverlays: Target page, context or browser has been closed
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
          - group "ობსერვატორიის სტატუსი" [ref=e10]:
            - generic [ref=e11]: ონლაინ
          - button "გასვლა" [ref=e14] [cursor=pointer]
    - main [ref=e15]:
      - generic [ref=e17]:
        - generic [ref=e18]:
          - region [ref=e19]:
            - generic [ref=e20]:
              - 'link "უკან: სატურნი" [ref=e21] [cursor=pointer]':
                - /url: /ka/app/missions/saturn
                - text: "← უკან: სატურნი"
              - paragraph [ref=e22]: მისია · სატურნი
              - heading "დაკვირვება დაგეგმილია" [level=1] [ref=e24]
              - paragraph [ref=e25]: ობსერვატორიამ ამ ობიექტისთვის დრო გამოყო.
            - note [ref=e26]:
              - strong [ref=e27]: სიმულირებული ობსერვატორია
              - generic [ref=e28]: პასუხობს სიმულატორი. ნამდვილი ტელესკოპი არ მოძრაობს.
          - region [ref=e29]:
            - generic [ref=e30]:
              - heading "ობსერვატორია" [level=2] [ref=e31]
              - generic [ref=e34]: სტელარი თბილისი
            - generic [ref=e35]:
              - generic [ref=e36]:
                - term [ref=e37]: ობსერვატორიის კავშირი
                - definition [ref=e38]:
                  - generic [ref=e39]: ონლაინ
              - generic [ref=e41]:
                - term [ref=e42]: ამინდი
                - definition [ref=e43]: მოწმენდილი
              - generic [ref=e44]:
                - term [ref=e45]: ღრუბლიანობა, პროგნოზი
                - definition [ref=e46]: პროგნოზი არ არის
        - generic [ref=e47]:
          - region [ref=e48]:
            - heading "პირდაპირი ხედი" [level=2] [ref=e49]
            - generic [ref=e50]:
              - figure "ილუსტრაცია — არა ტელესკოპის კადრი" [ref=e53]
              - generic [ref=e57]:
                - region [ref=e58]:
                  - generic [ref=e59]:
                    - heading "მიმდინარეობა" [level=2] [ref=e60]
                    - generic [ref=e63]: ნაბიჯი 1 5-დან
                  - list [ref=e64]:
                    - listitem [ref=e65]:
                      - generic [ref=e66]: "01"
                      - generic [ref=e67]: მომზადება
                      - generic [ref=e68]: ახლა
                    - listitem [ref=e69]:
                      - generic [ref=e70]: "02"
                      - generic [ref=e71]: მიმართვა
                    - listitem [ref=e72]:
                      - generic [ref=e73]: "03"
                      - generic [ref=e74]: ცენტრირება
                    - listitem [ref=e75]:
                      - generic [ref=e76]: "04"
                      - generic [ref=e77]: დაკვირვება
                    - listitem [ref=e78]:
                      - generic [ref=e79]: "05"
                      - generic [ref=e80]: გადაღება
                - generic [ref=e81]:
                  - status [ref=e82]:
                    - strong [ref=e83]: ჯერ არ დაწყებულა
                    - generic [ref=e84]: შენი დრო 15 იანვარი, 2030, 22:00 GMT+4-ზე იწყება. დაკვირვებას მაშინ დაიწყებ.
                  - button "დაიწყე დაკვირვება" [disabled] [ref=e86]
          - generic "ახლა" [ref=e88]:
            - generic [ref=e89]:
              - term [ref=e90]: სიმაღლე
              - definition [ref=e91]: 38.0°
            - generic [ref=e92]:
              - term [ref=e93]: დარჩენილი დრო
              - definition [ref=e94]: —
            - generic [ref=e95]:
              - term [ref=e96]: კადრები
              - definition [ref=e97]: "0"
        - generic [ref=e98]:
          - region [ref=e99]:
            - generic [ref=e100]:
              - heading "სად არის სატურნი" [level=2] [ref=e101]
              - generic [ref=e104]: სიმაღლე · აზიმუტი
            - generic [ref=e105]:
              - 'img "ცის ციფერბლატი: ჰორიზონტი კიდეზეა, ზენიტი — ცენტრში, ჩრდილოეთი — ზემოთ." [ref=e106]':
                - generic [ref=e178]: ჩ
                - generic [ref=e179]: ა
                - generic [ref=e180]: ს
                - generic [ref=e181]: დ
              - generic [ref=e187]:
                - generic [ref=e188]:
                  - term [ref=e189]: სიმაღლე
                  - definition [ref=e190]: 38.0°
                - generic [ref=e191]:
                  - term [ref=e192]: აზიმუტი
                  - definition [ref=e193]: 160.0°
                - generic [ref=e194]:
                  - term [ref=e195]: ამოდის
                  - definition [ref=e196]:
                    - time [ref=e197]: 18:30
                - generic [ref=e198]:
                  - term [ref=e199]: ჩადის
                  - definition [ref=e200]:
                    - time [ref=e201]: 05:40
            - paragraph [ref=e202]:
              - text: ეს ობიექტის მდებარეობაა და არა ტელესკოპის. ტელესკოპის მდებარეობა აქ დაკვირვების დროს გამოჩნდება.
              - time [ref=e203]: გამოთვლილია 22:00-ზე.
          - region [ref=e204]:
            - generic [ref=e205]:
              - heading "ამ მისიის კადრები" [level=2] [ref=e206]
              - link "შენი კოლექცია" [ref=e210] [cursor=pointer]:
                - /url: /ka/app/collection
            - paragraph [ref=e211]: კადრები ჯერ არ არის.
        - region [ref=e212]:
          - heading "მისიის ისტორია" [level=2] [ref=e214]
          - list [ref=e217]:
            - listitem [ref=e218]:
              - time [ref=e219]: 23 სექტემბერი, 2026, 22:01 GMT+4
              - strong [ref=e220]: დაკვირვების დრო დაჯავშნილია
              - generic [ref=e221]: სტელარი
            - listitem [ref=e222]:
              - time [ref=e223]: 23 სექტემბერი, 2026, 22:00 GMT+4
              - strong [ref=e224]: მისიის მოთხოვნა შეიქმნა
              - generic [ref=e225]: სტელარი
    - contentinfo [ref=e227]:
      - generic "სტელარი — Astroman-ის პროდუქტი" [ref=e228]:
        - generic [ref=e229]: Stellar
        - generic [ref=e230]: Astroman-ისგან
      - navigation "ჯერ მიუწვდომელია" [ref=e231]:
        - paragraph [ref=e232]: ჯერ მიუწვდომელია
        - link "გამოწერა" [ref=e233] [cursor=pointer]:
          - /url: /ka/app/subscription
        - link "ლოიალობა" [ref=e239] [cursor=pointer]:
          - /url: /ka/app/loyalty
        - link "დაკვირვების პასი" [ref=e244] [cursor=pointer]:
          - /url: /ka/app/passes
    - navigation "აპლიკაციის ნავიგაცია" [ref=e249]:
      - link "მთავარი" [ref=e250] [cursor=pointer]:
        - /url: /ka/app
      - link "დაჯავშნა" [ref=e255] [cursor=pointer]:
        - /url: /ka/app/book
      - link "პირდაპირი" [ref=e262] [cursor=pointer]:
        - /url: /ka/app/live
      - link "კოლექცია" [ref=e268] [cursor=pointer]:
        - /url: /ka/app/collection
      - link "პროფილი" [ref=e275] [cursor=pointer]:
        - /url: /ka/app/profile
  - alert [ref=e281]
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
      |   ^ Error: screencast.showOverlays: Target page, context or browser has been closed
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