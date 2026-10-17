# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> app at 390 >> ka /app/book?reschedule=53000000-0000-4000-8000-000000000004
- Location: e2e/visual.spec.ts:139:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

Timeout: 15000ms
  Timeout 15000ms exceeded.

  Snapshot: ka-app-book-reschedule-53000000-0000-4000-8000-000000000004-390.png

Call log:
  - Expect "toHaveScreenshot(ka-app-book-reschedule-53000000-0000-4000-8000-000000000004-390.png)" with timeout 15000ms
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
          - group "ობსერვატორიის სტატუსი" [ref=e10]:
            - generic [ref=e11]: ონლაინ
          - button "გასვლა" [ref=e14] [cursor=pointer]
    - main [ref=e15]:
      - generic [ref=e16]:
        - generic [ref=e17]:
          - paragraph [ref=e18]: სტელარი თბილისი
          - heading "დრო ტელესკოპთან." [level=1] [ref=e19]
          - paragraph [ref=e20]: ირჩევ უფასო დროს დაკარგულის ნაცვლად.
          - link "შენი ჯავშნები" [ref=e21] [cursor=pointer]:
            - /url: "#booking-nights"
        - note [ref=e22]:
          - strong [ref=e23]: სიმულირებული ობსერვატორია
          - generic [ref=e24]: პასუხობს სიმულატორი. ნამდვილი ტელესკოპი არ მოძრაობს.
        - navigation "აირჩიე ღამე" [ref=e25]:
          - heading "აირჩიე ღამე" [level=2] [ref=e26]
          - list [ref=e27]:
            - listitem [ref=e28]:
              - link [ref=e29] [cursor=pointer]:
                - /url: /ka/app/book?date=2026-10-13&reschedule=53000000-0000-4000-8000-000000000004
                - time [ref=e30]: სამ, 13 ოქტ
            - listitem [ref=e31]:
              - link [ref=e32] [cursor=pointer]:
                - /url: /ka/app/book?date=2026-10-14&reschedule=53000000-0000-4000-8000-000000000004
                - time [ref=e33]: ოთხ, 14 ოქტ
            - listitem [ref=e34]:
              - link [ref=e35] [cursor=pointer]:
                - /url: /ka/app/book?date=2026-10-15&reschedule=53000000-0000-4000-8000-000000000004
                - time [ref=e36]: ხუთ, 15 ოქტ
            - listitem [ref=e37]:
              - link [ref=e38] [cursor=pointer]:
                - /url: /ka/app/book?date=2026-10-16&reschedule=53000000-0000-4000-8000-000000000004
                - time [ref=e39]: პარ, 16 ოქტ
            - listitem [ref=e40]:
              - link [ref=e41] [cursor=pointer]:
                - /url: /ka/app/book?date=2026-10-17&reschedule=53000000-0000-4000-8000-000000000004
                - time [ref=e42]: შაბ, 17 ოქტ
            - listitem [ref=e43]:
              - link [ref=e44] [cursor=pointer]:
                - /url: /ka/app/book?date=2026-10-18&reschedule=53000000-0000-4000-8000-000000000004
                - time [ref=e45]: კვი, 18 ოქტ
            - listitem [ref=e46]:
              - link [ref=e47] [cursor=pointer]:
                - /url: /ka/app/book?date=2026-10-19&reschedule=53000000-0000-4000-8000-000000000004
                - time [ref=e48]: ორშ, 19 ოქტ
        - region [ref=e49]:
          - heading "დაკვირვების დრო" [level=2] [ref=e50]
          - list [ref=e51]:
            - listitem [ref=e52]:
              - generic [ref=e53]:
                - time [ref=e54]: 18:00
                - text: –
                - time [ref=e55]: 18:30
                - text: GMT+4
              - generic [ref=e56]: 30 წთ
              - generic [ref=e57]: უფასო
              - link "არჩევა 18:00–18:30" [ref=e59] [cursor=pointer]:
                - /url: /ka/app/book/reserve?startAt=2026-10-13T14%3A00%3A00.000Z&reschedule=53000000-0000-4000-8000-000000000004
                - text: არჩევა
            - listitem [ref=e60]:
              - generic [ref=e61]:
                - time [ref=e62]: 18:40
                - text: –
                - time [ref=e63]: 19:10
                - text: GMT+4
              - generic [ref=e64]: 30 წთ
              - generic [ref=e65]: უფასო
              - generic [ref=e66]: დაჯავშნილია
            - listitem [ref=e67]:
              - generic [ref=e68]:
                - time [ref=e69]: 19:20
                - text: –
                - time [ref=e70]: 19:50
                - text: GMT+4
              - generic [ref=e71]: 30 წთ
              - generic [ref=e72]: უფასო
              - link "არჩევა 19:20–19:50" [ref=e74] [cursor=pointer]:
                - /url: /ka/app/book/reserve?startAt=2026-10-13T15%3A20%3A00.000Z&reschedule=53000000-0000-4000-8000-000000000004
                - text: არჩევა
            - listitem [ref=e75]:
              - generic [ref=e76]:
                - time [ref=e77]: 20:00
                - text: –
                - time [ref=e78]: 20:30
                - text: GMT+4
              - generic [ref=e79]: 30 წთ
              - generic [ref=e80]: უფასო
              - link "არჩევა 20:00–20:30" [ref=e82] [cursor=pointer]:
                - /url: /ka/app/book/reserve?startAt=2026-10-13T16%3A00%3A00.000Z&reschedule=53000000-0000-4000-8000-000000000004
                - text: არჩევა
            - listitem [ref=e83]:
              - generic [ref=e84]:
                - time [ref=e85]: 20:40
                - text: –
                - time [ref=e86]: 21:10
                - text: GMT+4
              - generic [ref=e87]: 30 წთ
              - generic [ref=e88]: უფასო
              - link "არჩევა 20:40–21:10" [ref=e90] [cursor=pointer]:
                - /url: /ka/app/book/reserve?startAt=2026-10-13T16%3A40%3A00.000Z&reschedule=53000000-0000-4000-8000-000000000004
                - text: არჩევა
            - listitem [ref=e91]:
              - generic [ref=e92]:
                - time [ref=e93]: 21:20
                - text: –
                - time [ref=e94]: 21:50
                - text: GMT+4
              - generic [ref=e95]: 30 წთ
              - generic [ref=e96]: უფასო
              - link "არჩევა 21:20–21:50" [ref=e98] [cursor=pointer]:
                - /url: /ka/app/book/reserve?startAt=2026-10-13T17%3A20%3A00.000Z&reschedule=53000000-0000-4000-8000-000000000004
                - text: არჩევა
            - listitem [ref=e99]:
              - generic [ref=e100]:
                - time [ref=e101]: 22:00
                - text: –
                - time [ref=e102]: 22:30
                - text: GMT+4
              - generic [ref=e103]: 30 წთ
              - generic [ref=e104]: უფასო
              - link "არჩევა 22:00–22:30" [ref=e106] [cursor=pointer]:
                - /url: /ka/app/book/reserve?startAt=2026-10-13T18%3A00%3A00.000Z&reschedule=53000000-0000-4000-8000-000000000004
                - text: არჩევა
            - listitem [ref=e107]:
              - generic [ref=e108]:
                - time [ref=e109]: 22:40
                - text: –
                - time [ref=e110]: 23:10
                - text: GMT+4
              - generic [ref=e111]: 30 წთ
              - generic [ref=e112]: უფასო
              - link "არჩევა 22:40–23:10" [ref=e114] [cursor=pointer]:
                - /url: /ka/app/book/reserve?startAt=2026-10-13T18%3A40%3A00.000Z&reschedule=53000000-0000-4000-8000-000000000004
                - text: არჩევა
            - listitem [ref=e115]:
              - generic [ref=e116]:
                - time [ref=e117]: 23:20
                - text: –
                - time [ref=e118]: 23:50
                - text: GMT+4
              - generic [ref=e119]: 30 წთ
              - generic [ref=e120]: უფასო
              - link "არჩევა 23:20–23:50" [ref=e122] [cursor=pointer]:
                - /url: /ka/app/book/reserve?startAt=2026-10-13T19%3A20%3A00.000Z&reschedule=53000000-0000-4000-8000-000000000004
                - text: არჩევა
    - contentinfo [ref=e123]:
      - generic "სტელარი — Astroman-ის პროდუქტი" [ref=e124]:
        - generic [ref=e125]: Stellar
        - generic [ref=e126]: Astroman-ისგან
      - navigation "ჯერ მიუწვდომელია" [ref=e127]:
        - paragraph [ref=e128]: ჯერ მიუწვდომელია
        - link "გამოწერა" [ref=e129] [cursor=pointer]:
          - /url: /ka/app/subscription
        - link "ლოიალობა" [ref=e135] [cursor=pointer]:
          - /url: /ka/app/loyalty
        - link "დაკვირვების პასი" [ref=e140] [cursor=pointer]:
          - /url: /ka/app/passes
    - navigation "აპლიკაციის ნავიგაცია" [ref=e145]:
      - link "მთავარი" [ref=e146] [cursor=pointer]:
        - /url: /ka/app
      - link "დაჯავშნა" [ref=e151] [cursor=pointer]:
        - /url: /ka/app/book
      - link "პირდაპირი" [ref=e158] [cursor=pointer]:
        - /url: /ka/app/live
      - link "კოლექცია" [ref=e164] [cursor=pointer]:
        - /url: /ka/app/collection
      - link "პროფილი" [ref=e171] [cursor=pointer]:
        - /url: /ka/app/profile
  - button "Open Next.js Dev Tools" [ref=e182] [cursor=pointer]
  - alert [ref=e186]
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