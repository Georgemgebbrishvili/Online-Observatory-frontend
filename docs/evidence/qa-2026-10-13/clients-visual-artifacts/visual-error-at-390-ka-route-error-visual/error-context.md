# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> error at 390 >> ka route error
- Location: e2e/visual.spec.ts:164:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/ka\/app$/
Received string:  "http://localhost:3100/ka/sign-in"
Timeout: 15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    - locator resolved to <html lang="ka" class="firago_5d16354f-module__IeozIa__variable anton_a8b17dcd-module__Xi7J6a__variable archivo_8c2be2a3-module__iX1fDW__variable oswald_f85f80dc-module__aMw1va__variable geist_e799d87a-module__u8MhCG__variable jetbrains_mono_c910bbf7-module__wROeXW__variable noto_sans_georgian_9880656b-module__biiUkq__variable">…</html>
    - unexpected value "http://localhost:3100/ka/sign-in"
    - waiting for "http://localhost:3100/ka/app" navigation to finish...

```

```yaml
- link "შინაარსზე გადასვლა":
  - /url: "#main-content"
- banner:
  - link "სტელარი — Astroman-ის პროდუქტი":
    - /url: /ka
    - text: Stellar
  - button "ნავიგაციის გახსნა"
- main:
  - paragraph: ანგარიში
  - heading "კეთილი იყოს შენი დაბრუნება." [level=1]
  - paragraph: შედი ანგარიშში მისიებისა და პირადი კადრების სამართავად.
  - link "Google-ით გაგრძელება":
    - /url: /api/auth/google/start?locale=ka
  - text: ელფოსტა
  - textbox "ელფოსტა":
    - /placeholder: you@example.com
    - text: failing@darkview.test
  - text: პაროლი
  - textbox "პაროლი": correct horse battery
  - button "შესვლა" [disabled]
  - paragraph:
    - link "დაგავიწყდა პაროლი?":
      - /url: /ka/reset-password
  - paragraph:
    - text: ჯერ არ გაქვს სტელარის ანგარიში?
    - link "ანგარიშის შექმნა":
      - /url: /ka/register
  - paragraph: შენი სესია სერვერზე მოწმდება. ობსერვატორიის წვდომის მონაცემები ბრაუზერამდე არასოდეს აღწევს.
- contentinfo:
  - text: Stellar Astroman-ისგან
  - paragraph: ერთი ნამდვილი ტელესკოპი თბილისში. შენი დრო ნამდვილ ცასთან.
  - navigation "პროდუქტი · კომპანია":
    - heading "პროდუქტი" [level=2]
    - link "მისიები":
      - /url: /ka#tonight
    - link "პირდაპირი დაკვირვება":
      - /url: /ka/app/live
    - link "კოლექცია":
      - /url: /ka/app/collection
    - link "ობსერვატორია":
      - /url: /ka/observatory
    - link "სტატუსი":
      - /url: /ka/status
    - heading "კომპანია" [level=2]
    - text: ჩვენს შესახებ კონტაქტი
    - heading "სამართლებრივი" [level=2]
    - link "პირობები":
      - /url: /ka/terms
    - link "კონფიდენციალურობა":
      - /url: /ka/privacy
    - link "თანხის დაბრუნება":
      - /url: /ka/refunds
    - heading "ენა" [level=2]
    - link "ქართული":
      - /url: /ka/sign-in
    - link "English":
      - /url: /en/sign-in
- alert
```

# Test source

```ts
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
  105 |   await expect(page).toHaveScreenshot(name, {
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
> 169 |         await expect(page).toHaveURL(new RegExp(`/${locale}/app$`));
      |                            ^ Error: expect(page).toHaveURL(expected) failed
  170 |         await capture(page, "admin/targets", locale, width, "error");
  171 |       });
  172 |     }
  173 |   });
  174 | }
  175 | 
```