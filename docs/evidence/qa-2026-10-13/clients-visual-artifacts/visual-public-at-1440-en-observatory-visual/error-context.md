# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> public at 1440 >> en /observatory
- Location: e2e/visual.spec.ts:127:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

Timeout: 15000ms
  Timeout 15000ms exceeded.

  Snapshot: en-observatory-1440.png

Call log:
  - Expect "toHaveScreenshot(en-observatory-1440.png)" with timeout 15000ms
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
            - /url: /ka/observatory
            - text: ქართული
          - link "Sign in" [ref=e17] [cursor=pointer]:
            - /url: /en/sign-in
          - link "Start exploring" [ref=e18] [cursor=pointer]:
            - /url: /en#tonight
    - main [ref=e20]:
      - region [ref=e21]:
        - generic [ref=e22]:
          - generic [ref=e23]: Fri, 25 Sept 2026
          - time [ref=e24]: 20:00
          - generic [ref=e25]: Site time · Tbilisi
        - generic [ref=e26]:
          - generic [ref=e27]:
            - generic [ref=e28]:
              - generic [ref=e29]: Live remote observatory · Tbilisi
              - generic [ref=e33]: Observing
            - paragraph [ref=e35]:
              - generic [ref=e36]: Celestron NexStar 6SE
              - text: •ZWO ASI585MC
            - heading "Stellar Tbilisi" [level=1] [ref=e37]
            - paragraph [ref=e38]: One telescope · 2 targets up tonight
            - paragraph [ref=e39]: One real telescope on a Tbilisi rooftop, run by the observatory's own software. You reserve the time; it does the moving.
            - note [ref=e40]:
              - strong [ref=e41]: SIMULATED OBSERVATORY
              - generic [ref=e42]: The simulator is answering. No real telescope is moving.
            - paragraph [ref=e43]: An observation is in progress
            - generic [ref=e45]:
              - generic [ref=e50]:
                - term [ref=e51]: Forecast, first hour
                - definition [ref=e52]: 12% cloud
              - generic [ref=e57]:
                - term [ref=e58]: First bookable hour
                - definition [ref=e59]: 00:00
            - generic [ref=e60]:
              - link "Book a slot" [ref=e61] [cursor=pointer]:
                - /url: /en/app/book
              - link "Watch live" [ref=e63] [cursor=pointer]:
                - /url: /en/app/live
          - figure "The camera's frame drawn over the Moon, to scale" [ref=e66]:
            - generic [ref=e67]:
              - generic [ref=e74]:
                - generic [ref=e75]: 25.5′ × 14.4′
                - text: Camera frame
              - generic [ref=e76]:
                - generic [ref=e77]: 31.1′
                - text: Moon, mean size
            - generic [ref=e78]: Illustration — not telescope output
        - navigation "Ways in" [ref=e79]:
          - link "01 Book a slot Book" [ref=e80] [cursor=pointer]:
            - /url: /en/app/book
            - generic [ref=e81]: "01"
            - generic [ref=e82]: Book a slot
            - generic [ref=e83]: Book →
          - link "02 Watch a live session Watch" [ref=e84] [cursor=pointer]:
            - /url: /en/app/live
            - generic [ref=e85]: "02"
            - generic [ref=e86]: Watch a live session
            - generic [ref=e87]: Watch →
          - link "03 See tonight's targets Browse" [ref=e88] [cursor=pointer]:
            - /url: /en/app/missions
            - generic [ref=e89]: "03"
            - generic [ref=e90]: See tonight's targets
            - generic [ref=e91]: Browse →
          - link "Full status" [ref=e93] [cursor=pointer]:
            - /url: /en/status
            - text: Full status
            - generic [ref=e94]: →
      - generic [ref=e95]:
        - region [ref=e96]:
          - generic [ref=e97]:
            - heading "A six-inch telescope and a colour camera." [level=2] [ref=e98]
            - generic [ref=e99]: 01 · The instrument
          - paragraph [ref=e100]: "Small, well understood and honest about what it can show: the Moon, the planets, double stars and the brighter clusters and nebulae, live."
          - article [ref=e101]:
            - generic [ref=e102]:
              - generic [ref=e103]: "01"
              - generic [ref=e104]:
                - heading "Celestron NexStar 6SE" [level=3] [ref=e105]
                - paragraph [ref=e106]: Tbilisi, Georgia · Schmidt-Cassegrain · Computerised alt-azimuth
              - generic [ref=e107]: Observing
            - generic [ref=e109]:
              - generic [ref=e110]:
                - term [ref=e111]: aperture
                - definition [ref=e112]: 150 mm
              - generic [ref=e113]:
                - term [ref=e114]: focal length
                - definition [ref=e115]: 1500 mm
              - generic [ref=e116]:
                - term [ref=e117]: Focal ratio
                - definition [ref=e118]: f/10
              - generic [ref=e119]:
                - term [ref=e120]: Field of view
                - definition [ref=e121]: 25.5′ × 14.4′
              - generic [ref=e122]:
                - term [ref=e123]: Camera
                - definition [ref=e124]: ZWO ASI585MC
            - generic [ref=e125]:
              - paragraph [ref=e126]: Uncooled, one-shot colour. Each frame arrives in colour; there are no filter passes. Short exposures, stacked as you watch. Not long-exposure astrophotography.
              - link "Book a slot" [ref=e127] [cursor=pointer]:
                - /url: /en/app/book
          - generic [ref=e129]:
            - heading "Optical configurations" [level=3] [ref=e130]
            - paragraph [ref=e131]: Each target is observed in one of three configurations, chosen for it in the catalogue.
            - list [ref=e132]:
              - listitem [ref=e133]:
                - generic [ref=e134]: With reducer
                - generic [ref=e135]: 945 mm · f/6.3
              - listitem [ref=e136]:
                - generic [ref=e137]: Native
                - generic [ref=e138]: 1500 mm · f/10
              - listitem [ref=e139]:
                - generic [ref=e140]: With Barlow
                - generic [ref=e141]: 3000 mm · f/20
        - region [ref=e142]:
          - generic [ref=e143]:
            - heading "Tonight" [level=2] [ref=e144]
            - link "All of tonight" [ref=e145] [cursor=pointer]:
              - /url: /en/app/missions
              - text: All of tonight →
          - paragraph [ref=e146]: Targets the telescope can reach tonight.
          - list [ref=e147]:
            - listitem [ref=e148]:
              - link "Albireo Double star 61° Until 03:50" [ref=e149] [cursor=pointer]:
                - /url: /en/app/missions/albireo
                - generic [ref=e150]: Albireo
                - generic [ref=e151]:
                  - generic [ref=e152]: Double star
                  - generic [ref=e153]: 61°
                  - generic [ref=e154]: Until 03:50
                - generic [ref=e155]: →
            - listitem [ref=e156]:
              - link "Saturn Planet 38° 18:30 – 05:40" [ref=e157] [cursor=pointer]:
                - /url: /en/app/missions/saturn
                - generic [ref=e158]: Saturn
                - generic [ref=e159]:
                  - generic [ref=e160]: Planet
                  - generic [ref=e161]: 38°
                  - generic [ref=e162]: 18:30 – 05:40
                - generic [ref=e163]: →
        - region [ref=e164]:
          - generic [ref=e165]:
            - heading "Ways in" [level=2] [ref=e166]
            - generic [ref=e167]: Three ways in
          - list [ref=e168]:
            - listitem [ref=e169]:
              - generic [ref=e170]: "01"
              - generic [ref=e171]:
                - heading "Book a slot" [level=3] [ref=e172]
                - paragraph [ref=e173]: Reserve time on the telescope, choose what it points at, and keep what you capture.
              - link "Book" [ref=e174] [cursor=pointer]:
                - /url: /en/app/book
                - text: Book →
            - listitem [ref=e175]:
              - generic [ref=e176]: "02"
              - generic [ref=e177]:
                - heading "Watch a live session" [level=3] [ref=e178]
                - paragraph [ref=e179]: Open the session that is running now, or the one you booked. Signed-in observers only.
              - link "Watch" [ref=e180] [cursor=pointer]:
                - /url: /en/app/live
                - text: Watch →
            - listitem [ref=e181]:
              - generic [ref=e182]: "03"
              - generic [ref=e183]:
                - heading "See tonight's targets" [level=3] [ref=e184]
                - paragraph [ref=e185]: Everything the telescope can reach tonight, with how high it climbs and when.
              - link "Browse" [ref=e186] [cursor=pointer]:
                - /url: /en/app/missions
                - text: Browse →
        - region [ref=e187]:
          - generic [ref=e188]:
            - heading "Nothing moves until it is allowed to." [level=2] [ref=e189]
            - generic [ref=e190]: 02 · Safety
          - paragraph [ref=e191]: Every command is checked in the cloud and checked again beside the telescope. A command the observatory considers unsafe is refused, whoever sent it.
          - list [ref=e192]:
            - listitem [ref=e193]:
              - generic [ref=e194]: "01"
              - heading "The simulator by default" [level=3] [ref=e195]
              - paragraph [ref=e196]: The observatory software starts on a simulated telescope and camera. Pages fed by the simulator say so.
            - listitem [ref=e197]:
              - generic [ref=e198]: "02"
              - heading "Real hardware only when attended" [level=3] [ref=e199]
              - paragraph [ref=e200]: Switching to the real telescope takes a deliberate action by an operator who is physically present.
            - listitem [ref=e201]:
              - generic [ref=e202]: "03"
              - heading "Sun avoidance" [level=3] [ref=e203]
              - paragraph [ref=e204]: Directions near the Sun are refused before the telescope moves, on every path, with no override from a booking.
            - listitem [ref=e205]:
              - generic [ref=e206]: "04"
              - heading "Altitude envelope and horizon mask" [level=3] [ref=e207]
              - paragraph [ref=e208]: Slews stay between a minimum altitude and a maximum measured on the real optical train, and clear of the rooftop's surveyed obstructions. Until that maximum is measured, every slew is refused.
            - listitem [ref=e209]:
              - generic [ref=e210]: "05"
              - heading "One owner, fresh commands" [level=3] [ref=e211]
              - paragraph [ref=e212]: Only the session's current owner can command the telescope. Expired and repeated commands are rejected.
            - listitem [ref=e213]:
              - generic [ref=e214]: "06"
              - heading "Emergency park" [level=3] [ref=e215]
              - paragraph [ref=e216]: On an operator's abort, a lost connection or a device fault, capture stops, motion halts and the telescope parks.
            - listitem [ref=e217]:
              - generic [ref=e218]: "07"
              - heading "The observatory dials out" [level=3] [ref=e219]
              - paragraph [ref=e220]: It accepts no inbound connection from the internet. Its only link is one authenticated connection it opens itself, and no browser ever addresses the telescope or camera.
        - region [ref=e221]:
          - generic [ref=e222]:
            - heading "A rooftop in Tbilisi." [level=2] [ref=e223]
            - generic [ref=e224]: 03 · The site
          - paragraph [ref=e225]: The telescope is installed on a rooftop in Tbilisi, Georgia, on mains power.
          - generic [ref=e226]:
            - generic [ref=e227]:
              - term [ref=e228]: City
              - definition [ref=e229]: Tbilisi, Georgia
            - generic [ref=e230]:
              - term [ref=e231]: Placement
              - definition [ref=e232]: Rooftop, mains power
            - generic [ref=e233]:
              - term [ref=e234]: Exact location
              - definition [ref=e235]: Not published. Public pages carry no coordinates precise enough to find the instrument.
          - region [ref=e236]:
            - generic [ref=e237]:
              - heading "One site today." [level=3] [ref=e238]
              - generic [ref=e239]: 04 · The network
            - paragraph [ref=e240]: Stellar is built so that more observatories could join later. Today there is exactly one, and it is this one.
            - generic [ref=e241]:
              - generic [ref=e242]:
                - term [ref=e243]: Today
                - definition [ref=e244]: One observatory, in Tbilisi, operated by Stellar.
              - generic [ref=e245]:
                - term [ref=e246]: Later
                - definition [ref=e247]: Other sites may join, each only after review, technical integration and safety checks. None is connected, and none is shown as if it were.
              - generic [ref=e248]:
                - term [ref=e249]: Partner applications
                - definition [ref=e250]: Not open.
    - contentinfo [ref=e251]:
      - generic [ref=e252]:
        - generic [ref=e253]:
          - generic "Stellar by Astroman" [ref=e254]:
            - generic [ref=e255]: Stellar
            - generic [ref=e256]: by Astroman
          - paragraph [ref=e257]: One real telescope in Tbilisi. The real sky, live.
        - navigation "Product · Company" [ref=e258]:
          - generic [ref=e259]:
            - heading "Product" [level=2] [ref=e260]
            - link "Missions" [ref=e261] [cursor=pointer]:
              - /url: /en#tonight
            - link "Live" [ref=e262] [cursor=pointer]:
              - /url: /en/app/live
            - link "Collection" [ref=e263] [cursor=pointer]:
              - /url: /en/app/collection
            - link "Observatory" [ref=e264] [cursor=pointer]:
              - /url: /en/observatory
            - link "Status" [ref=e265] [cursor=pointer]:
              - /url: /en/status
          - generic [ref=e266]:
            - heading "Company" [level=2] [ref=e267]
            - generic "Coming soon" [ref=e268]: About
            - generic "Coming soon" [ref=e269]: Contact
          - generic [ref=e270]:
            - heading "Legal" [level=2] [ref=e271]
            - link "Terms" [ref=e272] [cursor=pointer]:
              - /url: /en/terms
            - link "Privacy" [ref=e273] [cursor=pointer]:
              - /url: /en/privacy
            - link "Refunds" [ref=e274] [cursor=pointer]:
              - /url: /en/refunds
          - generic [ref=e275]:
            - heading "Language" [level=2] [ref=e276]
            - link "ქართული" [ref=e277] [cursor=pointer]:
              - /url: /ka/observatory
            - link "English" [ref=e278] [cursor=pointer]:
              - /url: /en/observatory
  - button "Open Next.js Dev Tools" [ref=e284] [cursor=pointer]
  - alert [ref=e288]
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