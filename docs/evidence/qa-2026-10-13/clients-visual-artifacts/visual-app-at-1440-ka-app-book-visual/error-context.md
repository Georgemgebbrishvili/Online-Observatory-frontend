# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> app at 1440 >> ka /app/book
- Location: e2e/visual.spec.ts:139:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

Timeout: 15000ms
  Timeout 15000ms exceeded.

  Snapshot: ka-app-book-1440.png

Call log:
  - Expect "toHaveScreenshot(ka-app-book-1440.png)" with timeout 15000ms
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
        - navigation "აპლიკაციის ნავიგაცია" [ref=e9]:
          - link "მთავარი" [ref=e10] [cursor=pointer]:
            - /url: /ka/app
          - link "დაჯავშნა" [ref=e12] [cursor=pointer]:
            - /url: /ka/app/book
          - link "პირდაპირი დაკვირვება" [ref=e14] [cursor=pointer]:
            - /url: /ka/app/live
          - link "კოლექცია" [ref=e16] [cursor=pointer]:
            - /url: /ka/app/collection
          - link "პროფილი" [ref=e18] [cursor=pointer]:
            - /url: /ka/app/profile
        - generic [ref=e20]:
          - group "ობსერვატორიის სტატუსი" [ref=e21]:
            - strong [ref=e22]: თბილისის ობსერვატორია
            - generic [ref=e23]: ონლაინ
            - generic [ref=e25]: სიმულირებული სტატუსი
          - button "გასვლა" [ref=e27] [cursor=pointer]
    - main [ref=e28]:
      - generic [ref=e29]:
        - generic [ref=e30]:
          - paragraph [ref=e31]: სტელარი თბილისი
          - heading "დრო ტელესკოპთან." [level=1] [ref=e32]
          - paragraph [ref=e33]: ყოველი სლოტი ობსერვატორიის ასტრონომიული სიბნელიდან იჭრება, მისივე დროის სარტყელში.
          - link "შენი ჯავშნები" [ref=e34] [cursor=pointer]:
            - /url: "#booking-nights"
        - note [ref=e35]:
          - strong [ref=e36]: სიმულირებული ობსერვატორია
          - generic [ref=e37]: პასუხობს სიმულატორი. ნამდვილი ტელესკოპი არ მოძრაობს.
        - navigation "აირჩიე ღამე" [ref=e38]:
          - heading "აირჩიე ღამე" [level=2] [ref=e39]
          - list [ref=e40]:
            - listitem [ref=e41]:
              - link [ref=e42] [cursor=pointer]:
                - /url: /ka/app/book?date=2026-10-13
                - time [ref=e43]: სამ, 13 ოქტ
            - listitem [ref=e44]:
              - link [ref=e45] [cursor=pointer]:
                - /url: /ka/app/book?date=2026-10-14
                - time [ref=e46]: ოთხ, 14 ოქტ
            - listitem [ref=e47]:
              - link [ref=e48] [cursor=pointer]:
                - /url: /ka/app/book?date=2026-10-15
                - time [ref=e49]: ხუთ, 15 ოქტ
            - listitem [ref=e50]:
              - link [ref=e51] [cursor=pointer]:
                - /url: /ka/app/book?date=2026-10-16
                - time [ref=e52]: პარ, 16 ოქტ
            - listitem [ref=e53]:
              - link [ref=e54] [cursor=pointer]:
                - /url: /ka/app/book?date=2026-10-17
                - time [ref=e55]: შაბ, 17 ოქტ
            - listitem [ref=e56]:
              - link [ref=e57] [cursor=pointer]:
                - /url: /ka/app/book?date=2026-10-18
                - time [ref=e58]: კვი, 18 ოქტ
            - listitem [ref=e59]:
              - link [ref=e60] [cursor=pointer]:
                - /url: /ka/app/book?date=2026-10-19
                - time [ref=e61]: ორშ, 19 ოქტ
        - region [ref=e62]:
          - heading "დაკვირვების დრო" [level=2] [ref=e63]
          - list [ref=e64]:
            - listitem [ref=e65]:
              - generic [ref=e66]:
                - time [ref=e67]: 18:00
                - text: –
                - time [ref=e68]: 18:30
                - text: GMT+4
              - generic [ref=e69]: 30 წთ
              - generic [ref=e70]: 45,00 ₾
              - link "არჩევა 18:00–18:30" [ref=e72] [cursor=pointer]:
                - /url: /ka/app/book/reserve?startAt=2026-10-13T14%3A00%3A00.000Z
                - text: არჩევა
            - listitem [ref=e73]:
              - generic [ref=e74]:
                - time [ref=e75]: 18:40
                - text: –
                - time [ref=e76]: 19:10
                - text: GMT+4
              - generic [ref=e77]: 30 წთ
              - generic [ref=e78]: 45,00 ₾
              - generic [ref=e79]: დაჯავშნილია
            - listitem [ref=e80]:
              - generic [ref=e81]:
                - time [ref=e82]: 19:20
                - text: –
                - time [ref=e83]: 19:50
                - text: GMT+4
              - generic [ref=e84]: 30 წთ
              - generic [ref=e85]: 45,00 ₾
              - link "არჩევა 19:20–19:50" [ref=e87] [cursor=pointer]:
                - /url: /ka/app/book/reserve?startAt=2026-10-13T15%3A20%3A00.000Z
                - text: არჩევა
            - listitem [ref=e88]:
              - generic [ref=e89]:
                - time [ref=e90]: 20:00
                - text: –
                - time [ref=e91]: 20:30
                - text: GMT+4
              - generic [ref=e92]: 30 წთ
              - generic [ref=e93]: 45,00 ₾
              - link "არჩევა 20:00–20:30" [ref=e95] [cursor=pointer]:
                - /url: /ka/app/book/reserve?startAt=2026-10-13T16%3A00%3A00.000Z
                - text: არჩევა
            - listitem [ref=e96]:
              - generic [ref=e97]:
                - time [ref=e98]: 20:40
                - text: –
                - time [ref=e99]: 21:10
                - text: GMT+4
              - generic [ref=e100]: 30 წთ
              - generic [ref=e101]: 45,00 ₾
              - link "არჩევა 20:40–21:10" [ref=e103] [cursor=pointer]:
                - /url: /ka/app/book/reserve?startAt=2026-10-13T16%3A40%3A00.000Z
                - text: არჩევა
            - listitem [ref=e104]:
              - generic [ref=e105]:
                - time [ref=e106]: 21:20
                - text: –
                - time [ref=e107]: 21:50
                - text: GMT+4
              - generic [ref=e108]: 30 წთ
              - generic [ref=e109]: 45,00 ₾
              - link "არჩევა 21:20–21:50" [ref=e111] [cursor=pointer]:
                - /url: /ka/app/book/reserve?startAt=2026-10-13T17%3A20%3A00.000Z
                - text: არჩევა
            - listitem [ref=e112]:
              - generic [ref=e113]:
                - time [ref=e114]: 22:00
                - text: –
                - time [ref=e115]: 22:30
                - text: GMT+4
              - generic [ref=e116]: 30 წთ
              - generic [ref=e117]: 45,00 ₾
              - link "არჩევა 22:00–22:30" [ref=e119] [cursor=pointer]:
                - /url: /ka/app/book/reserve?startAt=2026-10-13T18%3A00%3A00.000Z
                - text: არჩევა
            - listitem [ref=e120]:
              - generic [ref=e121]:
                - time [ref=e122]: 22:40
                - text: –
                - time [ref=e123]: 23:10
                - text: GMT+4
              - generic [ref=e124]: 30 წთ
              - generic [ref=e125]: 45,00 ₾
              - link "არჩევა 22:40–23:10" [ref=e127] [cursor=pointer]:
                - /url: /ka/app/book/reserve?startAt=2026-10-13T18%3A40%3A00.000Z
                - text: არჩევა
            - listitem [ref=e128]:
              - generic [ref=e129]:
                - time [ref=e130]: 23:20
                - text: –
                - time [ref=e131]: 23:50
                - text: GMT+4
              - generic [ref=e132]: 30 წთ
              - generic [ref=e133]: 45,00 ₾
              - link "არჩევა 23:20–23:50" [ref=e135] [cursor=pointer]:
                - /url: /ka/app/book/reserve?startAt=2026-10-13T19%3A20%3A00.000Z
                - text: არჩევა
      - region [ref=e136]:
        - heading "შენი ღამეები" [level=2] [ref=e138]
        - list [ref=e139]:
          - listitem [ref=e140]:
            - link "ალბირეო ოთხ, 16 იან. 2030, 19:20–19:50 GMT+4 45,00 ₾ გადახდას ელოდება" [ref=e141] [cursor=pointer]:
              - /url: /ka/app/bookings/52000000-0000-4000-8000-000000000003
              - generic [ref=e142]: ალბირეო
              - generic [ref=e143]: ოთხ, 16 იან. 2030, 19:20–19:50 GMT+4
              - generic [ref=e144]: 45,00 ₾
              - generic [ref=e145]: გადახდას ელოდება
          - listitem [ref=e147]:
            - link "სატურნი სამ, 15 იან. 2030, 22:00–22:30 GMT+4 45,00 ₾ დადასტურებულია" [ref=e148] [cursor=pointer]:
              - /url: /ka/app/bookings/51000000-0000-4000-8000-000000000002
              - generic [ref=e149]: სატურნი
              - generic [ref=e150]: სამ, 15 იან. 2030, 22:00–22:30 GMT+4
              - generic [ref=e151]: 45,00 ₾
              - generic [ref=e152]: დადასტურებულია
          - listitem [ref=e154]:
            - link "ჰერკულესის გროვა ხუთ, 24 სექ. 2026, 00:00–00:30 GMT+4 45,00 ₾ დადასტურებულია" [ref=e155] [cursor=pointer]:
              - /url: /ka/app/bookings/50000000-0000-4000-8000-000000000001
              - generic [ref=e156]: ჰერკულესის გროვა
              - generic [ref=e157]: ხუთ, 24 სექ. 2026, 00:00–00:30 GMT+4
              - generic [ref=e158]: 45,00 ₾
              - generic [ref=e159]: დადასტურებულია
          - listitem [ref=e161]:
            - link "მთვარე კვი, 20 სექ. 2026, 20:00–20:30 GMT+4 45,00 ₾ დადასტურებულია" [ref=e162] [cursor=pointer]:
              - /url: /ka/app/bookings/53000000-0000-4000-8000-000000000004
              - generic [ref=e163]: მთვარე
              - generic [ref=e164]: კვი, 20 სექ. 2026, 20:00–20:30 GMT+4
              - generic [ref=e165]: 45,00 ₾
              - generic [ref=e166]: დადასტურებულია
        - navigation "ჯავშნები" [ref=e168]:
          - link "უფრო ძველი ჯავშნები" [ref=e169] [cursor=pointer]:
            - /url: /ka/app/book?cursor=53000000-0000-4000-8000-000000000004
    - contentinfo [ref=e171]:
      - generic "სტელარი — Astroman-ის პროდუქტი" [ref=e172]:
        - generic [ref=e173]: Stellar
        - generic [ref=e174]: Astroman-ისგან
      - navigation "ჯერ მიუწვდომელია" [ref=e175]:
        - paragraph [ref=e176]: ჯერ მიუწვდომელია
        - link "გამოწერა" [ref=e177] [cursor=pointer]:
          - /url: /ka/app/subscription
        - link "ლოიალობა" [ref=e183] [cursor=pointer]:
          - /url: /ka/app/loyalty
        - link "დაკვირვების პასი" [ref=e188] [cursor=pointer]:
          - /url: /ka/app/passes
  - button "Open Next.js Dev Tools" [ref=e198] [cursor=pointer]
  - alert [ref=e202]
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