# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.spec.ts >> keeps the public homepage within a mobile viewport
- Location: e2e/home.spec.ts:123:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.setViewportSize: Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=f2e1]:
  - link "შინაარსზე გადასვლა" [ref=f2e2] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=f2e3]:
    - banner [ref=f2e4]:
      - generic [ref=f2e5]:
        - link [ref=f2e6] [cursor=pointer]:
          - /url: /ka
          - generic "სტელარი — Astroman-ის პროდუქტი" [ref=f2e7]:
            - generic [ref=f2e8]: Stellar
            - generic [ref=f2e9]: Astroman-ისგან
        - button "ნავიგაციის გახსნა" [ref=f2e10] [cursor=pointer]
    - main [ref=f2e13]:
      - region [ref=f2e14]:
        - generic [ref=f2e15]:
          - generic [ref=f2e16]:
            - paragraph [ref=f2e17]: პირდაპირი დაკვირვება · თბილისი
            - heading "შენი დრო ნამდვილ ცასთან." [level=1] [ref=f2e18]:
              - generic [ref=f2e19]: შენი დრო
              - generic [ref=f2e20]: ნამდვილ ცასთან.
            - paragraph [ref=f2e21]: ნამდვილი ტელესკოპი თბილისში ცას პირდაპირ გაჩვენებს. დაჯავშნე დაკვირვების დრო და ნახე კამერის ნამდვილი კადრი.
            - generic [ref=f2e22]:
              - link "დაჯავშნე დრო" [ref=f2e23] [cursor=pointer]:
                - /url: /ka/app/book
              - link "დღევანდელი ცა" [ref=f2e25] [cursor=pointer]:
                - /url: "#tonight"
                - text: დღევანდელი ცა →
            - generic [ref=f2e26]:
              - generic [ref=f2e27]:
                - paragraph [ref=f2e28]: "2"
                - paragraph [ref=f2e29]: ახლა დაკვირვებადი
              - generic [ref=f2e30]:
                - paragraph [ref=f2e31]: "150"
                - paragraph [ref=f2e32]: აპერტურა · mm
              - generic [ref=f2e33]:
                - paragraph [ref=f2e34]: "1500"
                - paragraph [ref=f2e35]: ფოკუსური მანძილი · mm
          - figure "სამი პლანეტა, რომელსაც ტელესკოპი აკვირდება, დახატული ფირფიტებად" [ref=f2e36]:
            - generic [ref=f2e37]:
              - generic [ref=f2e38]: იუპიტერი
              - generic [ref=f2e41]: სატურნი
              - generic [ref=f2e44]: მარსი
            - generic [ref=f2e47]: ილუსტრაცია — არა ტელესკოპის კადრი
      - region [ref=f2e48]:
        - generic [ref=f2e49]:
          - generic [ref=f2e50]:
            - paragraph [ref=f2e51]: როგორ მუშაობს სტელარი
            - heading "ოთხი ნაბიჯი. ერთი რეალური დაკვირვება." [level=2] [ref=f2e52]
            - paragraph [ref=f2e53]: სტელარი ნამდვილ ტელესკოპზე დროს ერთ გასაგებ მისიად აქცევს — დროის დაჯავშნიდან გადაღებული კადრის შენახვამდე.
          - list [ref=f2e54]:
            - listitem [ref=f2e55]:
              - heading "დაჯავშნა" [level=3] [ref=f2e61]
              - paragraph [ref=f2e62]: აირჩიე ობიექტი დღევანდელი დაკვირვებადი ციდან და დაჯავშნე დრო.
              - generic [ref=f2e63]: დღეს — სიმულაცია
            - listitem [ref=f2e64]:
              - heading "მიბრუნება" [level=3] [ref=f2e70]
              - paragraph [ref=f2e71]: შენს დროზე ტელესკოპი თბილისში შენი ობიექტისკენ მიბრუნდება.
              - generic [ref=f2e72]: დღეს — სიმულაცია
            - listitem [ref=f2e73]:
              - heading "ყურება" [level=3] [ref=f2e79]
              - paragraph [ref=f2e80]: პირდაპირ უყურებ მის კამერას და ხედავ, როგორ იკრიბება მოკლე ექსპოზიციებიდან უფრო მკაფიო გამოსახულება.
              - generic [ref=f2e81]: დღეს — სიმულაცია
            - listitem [ref=f2e82]:
              - heading "შენახვა" [level=3] [ref=f2e87]
              - paragraph [ref=f2e88]: გადაიღე დაგროვილი კადრი და შეინახე შენს კოლექციაში.
              - generic [ref=f2e89]: დღეს — სიმულაცია
      - region [ref=f2e90]:
        - generic [ref=f2e91]:
          - generic [ref=f2e92]:
            - generic [ref=f2e93]:
              - paragraph [ref=f2e94]: დღევანდელი ცა
              - heading "აირჩიე, რას დაინახავს ტელესკოპი შემდეგ." [level=2] [ref=f2e95]
              - paragraph [ref=f2e96]: რას ხედავს ობსერვატორია დღეს და რატომ ვერ ხედავს დანარჩენს.
            - paragraph [ref=f2e97]: ხილვადობას ობსერვატორია ახლა ითვლის
          - generic [ref=f2e98]:
            - note [ref=f2e100]:
              - strong [ref=f2e101]: SIMULATED OBSERVATORY
              - generic [ref=f2e102]: ხილვადობა სიმულატორისთვის ითვლება. ნამდვილი ტელესკოპი არ მოძრაობს.
            - list [ref=f2e103]:
              - listitem [ref=f2e104]:
                - generic [ref=f2e105]: "01"
                - generic [ref=f2e106]:
                  - paragraph [ref=f2e107]: ორმაგი ვარსკვლავი · Beta Cygni
                  - heading [level=3] [ref=f2e108]:
                    - link "ალბირეო" [ref=f2e109] [cursor=pointer]:
                      - /url: /ka/app/missions/albireo
                - generic [ref=f2e110]: ახლა დაკვირვებადია
                - generic [ref=f2e112]:
                  - generic [ref=f2e113]:
                    - term [ref=f2e114]: მიმდინარე სიმაღლე
                    - definition [ref=f2e115]: 61°
                  - generic [ref=f2e116]:
                    - term [ref=f2e117]: დაკვირვების დრო
                    - definition [ref=f2e118]: 03:50-მდე
                - generic [ref=f2e119]: →
              - listitem [ref=f2e120]:
                - generic [ref=f2e121]: "02"
                - generic [ref=f2e122]:
                  - paragraph [ref=f2e123]: პლანეტა
                  - heading [level=3] [ref=f2e124]:
                    - link "სატურნი" [ref=f2e125] [cursor=pointer]:
                      - /url: /ka/app/missions/saturn
                - generic [ref=f2e126]: ახლა დაკვირვებადია
                - generic [ref=f2e128]:
                  - generic [ref=f2e129]:
                    - term [ref=f2e130]: მიმდინარე სიმაღლე
                    - definition [ref=f2e131]: 38°
                  - generic [ref=f2e132]:
                    - term [ref=f2e133]: დაკვირვების დრო
                    - definition [ref=f2e134]: 18:30 – 05:40
                - generic [ref=f2e135]: →
              - listitem [ref=f2e136]:
                - generic [ref=f2e137]: "03"
                - generic [ref=f2e138]:
                  - paragraph [ref=f2e139]: მთვარე
                  - heading [level=3] [ref=f2e140]:
                    - link "მთვარე" [ref=f2e141] [cursor=pointer]:
                      - /url: /ka/app/missions/moon-terminator
                - generic [ref=f2e142]: ტელესკოპის ხედვის არეზე დიდია
                - generic [ref=f2e144]:
                  - generic [ref=f2e145]:
                    - term [ref=f2e146]: მიმდინარე სიმაღლე
                    - definition [ref=f2e147]: 44°
                  - generic [ref=f2e148]:
                    - term [ref=f2e149]: დაკვირვების დრო
                    - definition [ref=f2e150]: 17:10 – 02:20
                - generic [ref=f2e151]: →
              - listitem [ref=f2e152]:
                - generic [ref=f2e153]: "04"
                - generic [ref=f2e154]:
                  - paragraph [ref=f2e155]: სფერული გროვა · M13
                  - heading [level=3] [ref=f2e156]:
                    - link "ჰერკულესის გროვა" [ref=f2e157] [cursor=pointer]:
                      - /url: /ka/app/missions/m13-hercules-cluster
                - generic [ref=f2e158]: ცაში ძალიან დაბლაა
                - generic [ref=f2e160]:
                  - generic [ref=f2e161]:
                    - term [ref=f2e162]: მიმდინარე სიმაღლე
                    - definition [ref=f2e163]: 18°
                  - generic [ref=f2e164]:
                    - term [ref=f2e165]: დაკვირვების დრო
                    - definition [ref=f2e166]: 01:05-მდე
                - generic [ref=f2e167]: →
              - listitem [ref=f2e168]:
                - generic [ref=f2e169]: "05"
                - generic [ref=f2e170]:
                  - paragraph [ref=f2e171]: პლანეტა
                  - heading [level=3] [ref=f2e172]:
                    - link "ვენერა" [ref=f2e173] [cursor=pointer]:
                      - /url: /ka/app/missions/venus
                - generic [ref=f2e174]: ჰორიზონტს ქვემოთაა
                - generic [ref=f2e176]:
                  - generic [ref=f2e177]:
                    - term [ref=f2e178]: მიმდინარე სიმაღლე
                    - definition [ref=f2e179]: "-12°"
                  - generic [ref=f2e180]:
                    - term [ref=f2e181]: დაკვირვების დრო
                    - definition [ref=f2e182]: 06:15-დან
                - generic [ref=f2e183]: →
            - link "დღევანდელი ყველა ობიექტი" [ref=f2e184] [cursor=pointer]:
              - /url: /ka/app/missions
      - region [ref=f2e186]:
        - generic [ref=f2e187]:
          - generic [ref=f2e188]:
            - generic [ref=f2e189]:
              - paragraph [ref=f2e190]: ინსტრუმენტი
              - heading "ერთი ნამდვილი ტელესკოპი, თბილისში." [level=2] [ref=f2e191]
              - paragraph [ref=f2e192]: მას მხოლოდ ობსერვატორიის საკუთარი პროგრამა მართავს და არასდროს — ბრაუზერი პირდაპირ. რასაც ხედავ, იმას ხედავს მისი კამერა.
            - generic [ref=f2e193]:
              - generic [ref=f2e194]:
                - term [ref=f2e195]: ტელესკოპი
                - definition [ref=f2e196]: Celestron NexStar 6SE
              - generic [ref=f2e197]:
                - term [ref=f2e198]: აპერტურა
                - definition [ref=f2e199]:
                  - generic [ref=f2e200]: "150"
                  - generic [ref=f2e201]: mm
              - generic [ref=f2e202]:
                - term [ref=f2e203]: ფოკუსური მანძილი
                - definition [ref=f2e204]:
                  - generic [ref=f2e205]: "1500"
                  - generic [ref=f2e206]: mm
              - generic [ref=f2e207]:
                - term [ref=f2e208]: ფარდობითი ხვრელი
                - definition [ref=f2e209]: f/10
              - generic [ref=f2e210]:
                - term [ref=f2e211]: კამერა
                - definition [ref=f2e212]:
                  - text: ZWO ASI585MC
                  - generic [ref=f2e213]: გაგრილების გარეშე, ფერადი სენსორი
              - generic [ref=f2e214]:
                - term [ref=f2e215]: რეჟიმი
                - definition [ref=f2e216]:
                  - text: პირდაპირი ხედი
                  - generic [ref=f2e217]: მოკლე ექსპოზიციები, რომლებიც შენს თვალწინ იკრიბება. ეს არ არის ხანგრძლივი ექსპოზიციის ასტროფოტოგრაფია.
              - generic [ref=f2e218]:
                - term [ref=f2e219]: მდებარეობა
                - definition [ref=f2e220]: თბილისი, საქართველო
          - complementary [ref=f2e221]:
            - generic [ref=f2e222]:
              - heading "სტატუსი ახლა" [level=3] [ref=f2e223]
              - link "სრული სტატუსი" [ref=f2e224] [cursor=pointer]:
                - /url: /ka/status
                - text: სრული სტატუსი →
            - note [ref=f2e225]:
              - strong [ref=f2e226]: SIMULATED OBSERVATORY
              - generic [ref=f2e227]: პასუხობს სიმულატორი. ნამდვილი ტელესკოპი არ მოძრაობს.
            - generic [ref=f2e228]:
              - generic [ref=f2e229]:
                - term [ref=f2e230]: ობსერვატორიის კავშირი
                - definition [ref=f2e231]:
                  - generic [ref=f2e232]: ონლაინ
              - generic [ref=f2e234]:
                - term [ref=f2e235]: ამინდი
                - definition [ref=f2e236]:
                  - generic [ref=f2e237]: მოწმენდილი
              - generic [ref=f2e239]:
                - term [ref=f2e240]: ამინდის შეჩერება
                - definition [ref=f2e241]:
                  - generic [ref=f2e242]: შეჩერება არ არის
            - paragraph [ref=f2e244]: დაკვირვება მიმდინარეობს
      - region [ref=f2e245]:
        - generic [ref=f2e246]:
          - paragraph [ref=f2e247]: დაიწყე დღეს
          - heading "შენი შემდეგი დაკვირვება აქ იწყება." [level=2] [ref=f2e248]
          - paragraph [ref=f2e249]: აირჩიე დაკვირვებადი ობიექტი და დაგეგმე შენი პირველი დაკვირვება სტელარზე.
          - generic [ref=f2e250]:
            - link "დაჯავშნე დრო" [ref=f2e251] [cursor=pointer]:
              - /url: /ka/app/book
            - link "დღევანდელი ცის ნახვა" [ref=f2e253] [cursor=pointer]:
              - /url: "#tonight"
          - generic [ref=f2e255]:
            - heading "პირადი სესიები" [level=3] [ref=f2e256]
            - list [ref=f2e257]:
              - listitem [ref=f2e258]: 30 წთ
              - listitem [ref=f2e259]: 60 წთ
              - listitem [ref=f2e260]: 120 წთ
            - paragraph [ref=f2e261]: უფრო ხანგრძლივი, მხოლოდ შენთვის გამოყოფილი დრო ტელესკოპზე მოგვიანებით დაემატება.
    - contentinfo [ref=f2e262]:
      - generic [ref=f2e263]:
        - generic [ref=f2e264]:
          - generic "სტელარი — Astroman-ის პროდუქტი" [ref=f2e265]:
            - generic [ref=f2e266]: Stellar
            - generic [ref=f2e267]: Astroman-ისგან
          - paragraph [ref=f2e268]: ერთი ნამდვილი ტელესკოპი თბილისში. შენი დრო ნამდვილ ცასთან.
        - navigation "პროდუქტი · კომპანია" [ref=f2e269]:
          - generic [ref=f2e270]:
            - heading "პროდუქტი" [level=2] [ref=f2e271]
            - link "მისიები" [ref=f2e272] [cursor=pointer]:
              - /url: /ka#tonight
            - link "პირდაპირი დაკვირვება" [ref=f2e273] [cursor=pointer]:
              - /url: /ka/app/live
            - link "კოლექცია" [ref=f2e274] [cursor=pointer]:
              - /url: /ka/app/collection
            - link "ობსერვატორია" [ref=f2e275] [cursor=pointer]:
              - /url: /ka/observatory
            - link "სტატუსი" [ref=f2e276] [cursor=pointer]:
              - /url: /ka/status
          - generic [ref=f2e277]:
            - heading "კომპანია" [level=2] [ref=f2e278]
            - generic "მალე" [ref=f2e279]: ჩვენს შესახებ
            - generic "მალე" [ref=f2e280]: კონტაქტი
          - generic [ref=f2e281]:
            - heading "სამართლებრივი" [level=2] [ref=f2e282]
            - link "პირობები" [ref=f2e283] [cursor=pointer]:
              - /url: /ka/terms
            - link "კონფიდენციალურობა" [ref=f2e284] [cursor=pointer]:
              - /url: /ka/privacy
            - link "თანხის დაბრუნება" [ref=f2e285] [cursor=pointer]:
              - /url: /ka/refunds
          - generic [ref=f2e286]:
            - heading "ენა" [level=2] [ref=f2e287]
            - link "ქართული" [ref=f2e288] [cursor=pointer]:
              - /url: /ka
            - link "English" [ref=f2e289] [cursor=pointer]:
              - /url: /en
  - button "Open Next.js Dev Tools" [ref=f2e295] [cursor=pointer]
  - alert [ref=f2e299]
```

# Test source

```ts
  26  |   await expect(stats.nth(0)).toContainText("Observable now");
  27  |   await expect(stats.nth(1)).toContainText("150");
  28  |   await expect(stats.nth(2)).toContainText("1500");
  29  | 
  30  |   // The fan's plates are drawings; the fan says so (CLAUDE.md, ADR-039).
  31  |   const fan = hero.locator(".plate-fan");
  32  |   await expect(fan.locator(".plate-fan-plate")).toHaveCount(3);
  33  |   for (const name of ["Jupiter", "Saturn", "Mars"]) {
  34  |     await expect(fan.getByText(name, { exact: true })).toBeVisible();
  35  |   }
  36  |   await expect(fan.getByText("Illustration — not telescope output")).toBeVisible();
  37  | });
  38  | 
  39  | test("renders the Georgian poster hero and switches locale", async ({ page }) => {
  40  |   await page.setViewportSize({ width: 1440, height: 900 });
  41  |   await page.goto("/ka");
  42  | 
  43  |   await expect(
  44  |     page.getByRole("heading", { level: 1, name: "შენი დრო ნამდვილ ცასთან." }),
  45  |   ).toBeVisible();
  46  |   await expect(
  47  |     page.locator(".poster-hero").getByRole("link", { name: "დაჯავშნე დრო" }),
  48  |   ).toHaveAttribute("href", "/ka/app/book");
  49  |   await expect(
  50  |     page.locator(".plate-fan").getByText("ილუსტრაცია — არა ტელესკოპის კადრი"),
  51  |   ).toBeVisible();
  52  |   // Mkhedruli has no capitals: the headline is never uppercased.
  53  |   await expect(page.locator(".poster-hero-title .title-sunset")).toHaveCSS(
  54  |     "text-transform",
  55  |     "none",
  56  |   );
  57  |   await page.getByRole("link", { name: "ენა: English" }).click();
  58  |   await expect(page).toHaveURL(/\/en$/);
  59  | });
  60  | 
  61  | test("renders the complete data-driven public homepage", async ({ page }) => {
  62  |   await page.goto("/en");
  63  | 
  64  |   for (const heading of [
  65  |     "Four steps. One real observation.",
  66  |     "Choose what the telescope sees next.",
  67  |     "One real telescope, in Tbilisi.",
  68  |     "Your next observation starts here.",
  69  |   ]) {
  70  |     await expect(page.getByRole("heading", { level: 2, name: heading })).toBeVisible();
  71  |   }
  72  |   for (const gone of [
  73  |     "Three steps. One real observation.",
  74  |     "A real observatory, in motion.",
  75  |     "A visual record of where you looked.",
  76  |   ]) {
  77  |     await expect(page.getByRole("heading", { name: gone })).toHaveCount(0);
  78  |   }
  79  | 
  80  |   // How a session works: four steps, each saying it is simulated today.
  81  |   const steps = page.locator("#about .flight-plan-step");
  82  |   await expect(steps).toHaveCount(4);
  83  |   for (const step of ["Reserve", "Slew", "Watch", "Keep"]) {
  84  |     await expect(page.getByRole("heading", { name: step, exact: true })).toBeVisible();
  85  |   }
  86  |   await expect(page.locator("#about .flight-plan-status")).toHaveText(
  87  |     Array(4).fill("Simulated today"),
  88  |   );
  89  | 
  90  |   // Tonight's list comes from GET /targets/tonight on the fake platform.
  91  |   const tonight = page.locator("#tonight");
  92  |   for (const target of ["Saturn", "Albireo", "Moon", "Hercules Cluster", "Venus"]) {
  93  |     await expect(
  94  |       tonight.getByRole("heading", { name: target, exact: true }),
  95  |     ).toBeVisible();
  96  |   }
  97  |   await expect(tonight.getByRole("link", { name: "Saturn" })).toHaveAttribute(
  98  |     "href",
  99  |     "/en/app/missions/saturn",
  100 |   );
  101 |   await expect(
  102 |     tonight.getByRole("link", { name: "All of tonight's targets" }),
  103 |   ).toHaveAttribute("href", "/en/app/missions");
  104 |   await expect(tonight.getByText("SIMULATED OBSERVATORY")).toBeVisible();
  105 | 
  106 |   // The instrument is the platform's telescope, not a fixture.
  107 |   const instrument = page.locator("#live");
  108 |   await expect(instrument.getByText("Celestron NexStar 6SE")).toBeVisible();
  109 |   await expect(instrument.getByText("150", { exact: true })).toBeVisible();
  110 |   await expect(instrument.getByText("1500", { exact: true })).toBeVisible();
  111 |   await expect(instrument.getByText("f/10", { exact: true })).toBeVisible();
  112 |   await expect(instrument.getByText("ZWO ASI585MC")).toBeVisible();
  113 |   await expect(instrument.getByText(/Not long-exposure astrophotography/)).toBeVisible();
  114 |   await expect(instrument.getByText("Online", { exact: true })).toBeVisible();
  115 | 
  116 |   await expect(page.getByText("30 min", { exact: true })).toBeVisible();
  117 |   await expect(page.getByText("120 min", { exact: true })).toBeVisible();
  118 |   await expect(
  119 |     page.locator("#final-cta").getByRole("link", { name: "Reserve a slot" }),
  120 |   ).toHaveAttribute("href", "/en/app/book");
  121 | });
  122 | 
  123 | test("keeps the public homepage within a mobile viewport", async ({ page }) => {
  124 |   for (const locale of ["en", "ka"]) {
  125 |     for (const width of [320, 390]) {
> 126 |       await page.setViewportSize({ width, height: 844 });
      |                  ^ Error: page.setViewportSize: Test timeout of 30000ms exceeded.
  127 |       await page.goto(`/${locale}`);
  128 | 
  129 |       const viewport = await page.evaluate(() => ({
  130 |         clientWidth: document.documentElement.clientWidth,
  131 |         scrollWidth: document.documentElement.scrollWidth,
  132 |       }));
  133 |       expect(viewport.scrollWidth, `${locale} at ${width}px`).toBe(viewport.clientWidth);
  134 |       await expect(page.locator(".poster-hero .button-primary")).toBeVisible();
  135 |       await expect(page.locator(".plate-fan-caption")).toBeVisible();
  136 |     }
  137 |   }
  138 | });
  139 | 
  140 | test("provides the complete public navigation on desktop and mobile", async ({
  141 |   page,
  142 | }) => {
  143 |   await page.goto("/en");
  144 | 
  145 |   const header = page.getByRole("banner");
  146 |   const publicNavigation = header.getByRole("navigation", {
  147 |     name: "Public navigation",
  148 |   });
  149 | 
  150 |   for (const item of ["Explore", "Live", "Observatory", "Pricing", "About"]) {
  151 |     await expect(publicNavigation.getByRole("link", { name: item })).toBeVisible();
  152 |   }
  153 | 
  154 |   await expect(header.getByRole("link", { name: "Sign in" })).toBeVisible();
  155 |   await expect(header.getByRole("link", { name: "Start exploring" })).toBeVisible();
  156 | 
  157 |   await page.setViewportSize({ width: 390, height: 844 });
  158 |   await page.reload();
  159 |   await page.getByRole("button", { name: "Open navigation" }).click();
  160 | 
  161 |   await expect(
  162 |     header.getByRole("navigation", { name: "Public navigation" }),
  163 |   ).toBeVisible();
  164 |   await expect(header.getByRole("link", { name: "Sign in" })).toBeVisible();
  165 | });
  166 | 
  167 | test("uses a desktop sidebar and native-style mobile app navigation", async ({
  168 |   page,
  169 | }) => {
  170 |   await page.goto("/en/app");
  171 | 
  172 |   const sidebar = appSidebar(page);
  173 |   await expect(sidebar).toBeVisible();
  174 |   await expect(sidebar.getByLabel(brand.en.siteName)).toBeVisible();
  175 |   await expect(sidebar.getByText("Tbilisi Observatory")).toBeVisible();
  176 |   await expect(sidebar.getByText("Simulated status")).toBeVisible();
  177 | 
  178 |   for (const item of ["Home", "Missions", "Live", "Collection", "Profile"]) {
  179 |     await expect(sidebar.getByRole("link", { name: item })).toBeVisible();
  180 |   }
  181 | 
  182 |   await expect(sidebar.getByRole("link", { name: "Home" })).toHaveAttribute(
  183 |     "aria-current",
  184 |     "page",
  185 |   );
  186 | 
  187 |   await page.setViewportSize({ width: 390, height: 844 });
  188 |   await page.reload();
  189 | 
  190 |   const bottomNav = bottomNavigation(page);
  191 |   await expect(sidebar).toBeHidden();
  192 |   await expect(bottomNav).toBeVisible();
  193 |   await expect(page.getByRole("banner").getByText("Online")).toBeVisible();
  194 |   const mobileMissionsLink = bottomNav.getByRole("link", { name: "Missions" });
  195 |   await expect(mobileMissionsLink).toBeVisible();
  196 |   await Promise.all([
  197 |     page.waitForURL(/\/en\/app\/missions$/),
  198 |     mobileMissionsLink.click(),
  199 |   ]);
  200 |   await expect(bottomNav.getByRole("link", { name: "Missions" })).toHaveAttribute(
  201 |     "aria-current",
  202 |     "page",
  203 |   );
  204 | 
  205 |   const viewport = await page.evaluate(() => ({
  206 |     clientWidth: document.documentElement.clientWidth,
  207 |     scrollWidth: document.documentElement.scrollWidth,
  208 |   }));
  209 |   expect(viewport.scrollWidth).toBe(viewport.clientWidth);
  210 | });
  211 | 
  212 | test("shows and operates the internal visual system", async ({ page }) => {
  213 |   await page.goto("/design-system");
  214 | 
  215 |   await expect(page).toHaveURL(/\/en\/design-system$/);
  216 |   await expect(page.getByRole("heading", { name: "Visual system" })).toBeVisible();
  217 |   await expect(page.getByText("Weather hold", { exact: true }).first()).toBeVisible();
  218 |   await expect(page.getByText("Processing")).toBeVisible();
  219 | 
  220 |   await page.getByRole("button", { name: "Open modal" }).click();
  221 |   const dialog = page.getByRole("dialog", { name: "Confirm observation" });
  222 |   await expect(dialog).toBeVisible();
  223 |   await dialog.getByRole("button", { name: "Close" }).first().click();
  224 |   await expect(dialog).not.toBeVisible();
  225 | 
  226 |   await page.getByRole("tab", { name: "Visibility" }).click();
```