# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.spec.ts >> renders the Georgian poster hero and switches locale
- Location: e2e/home.spec.ts:39:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/en$/
Received string:  "http://localhost:3100/ka"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    11 × locator resolved to <html lang="ka" class="firago_5d16354f-module__IeozIa__variable anton_a8b17dcd-module__Xi7J6a__variable bowlby_one_ed1eb4f8-module__I1FHRq__variable oswald_f85f80dc-module__aMw1va__variable geist_e799d87a-module__u8MhCG__variable jetbrains_mono_c910bbf7-module__wROeXW__variable noto_sans_georgian_9880656b-module__biiUkq__variable">…</html>
       - unexpected value "http://localhost:3100/ka"

```

```yaml
- link "შინაარსზე გადასვლა":
  - /url: "#main-content"
- banner:
  - link "სტელარი — Astroman-ის პროდუქტი":
    - /url: /ka
    - text: Stellar Astroman-ისგან
  - navigation "საჯარო ნავიგაცია":
    - link "აღმოჩენა":
      - /url: /ka#tonight
    - link "პირდაპირი დაკვირვება":
      - /url: /ka/app/live
    - link "ობსერვატორია":
      - /url: /ka/observatory
    - link "ფასები":
      - /url: /ka/pricing
    - link "ჩვენს შესახებ":
      - /url: /ka#about
  - 'link "ენა: English"':
    - /url: /en
    - text: English
  - link "შესვლა":
    - /url: /ka/sign-in
  - link "აღმოჩენის დაწყება":
    - /url: /ka#tonight
- main:
  - region "შენი დრო ნამდვილ ცასთან.":
    - paragraph: პირდაპირი დაკვირვება · თბილისი
    - heading "შენი დრო ნამდვილ ცასთან." [level=1]
    - paragraph: ნამდვილი ტელესკოპი თბილისში ცას პირდაპირ გაჩვენებს. დაჯავშნე დაკვირვების დრო და ნახე კამერის ნამდვილი კადრი.
    - link "დაჯავშნე დრო":
      - /url: /ka/app/book
    - link "დღევანდელი ცა":
      - /url: "#tonight"
    - paragraph: "2"
    - paragraph: ახლა დაკვირვებადი
    - paragraph: "150"
    - paragraph: აპერტურა · mm
    - paragraph: "1500"
    - paragraph: ფოკუსური მანძილი · mm
    - figure "სამი პლანეტა, რომელსაც ტელესკოპი აკვირდება, დახატული ფირფიტებად": პლანეტა იუპიტერი პლანეტა სატურნი პლანეტა მარსი ილუსტრაცია — არა ტელესკოპის კადრი
  - region "ოთხი ნაბიჯი. ერთი რეალური დაკვირვება.":
    - paragraph: როგორ მუშაობს სტელარი
    - heading "ოთხი ნაბიჯი. ერთი რეალური დაკვირვება." [level=2]
    - paragraph: სტელარი ნამდვილ ტელესკოპზე დროს ერთ გასაგებ მისიად აქცევს — დროის დაჯავშნიდან გადაღებული კადრის შენახვამდე.
    - list:
      - listitem:
        - heading "დაჯავშნა" [level=3]
        - paragraph: აირჩიე ობიექტი დღევანდელი დაკვირვებადი ციდან და დაჯავშნე დრო.
        - text: დღეს — სიმულაცია
      - listitem:
        - heading "მიბრუნება" [level=3]
        - paragraph: შენს დროზე ტელესკოპი თბილისში შენი ობიექტისკენ მიბრუნდება.
        - text: დღეს — სიმულაცია
      - listitem:
        - heading "ყურება" [level=3]
        - paragraph: პირდაპირ უყურებ მის კამერას და ხედავ, როგორ იკრიბება მოკლე ექსპოზიციებიდან უფრო მკაფიო გამოსახულება.
        - text: დღეს — სიმულაცია
      - listitem:
        - heading "შენახვა" [level=3]
        - paragraph: გადაიღე დაგროვილი კადრი და შეინახე შენს კოლექციაში.
        - text: დღეს — სიმულაცია
  - region "აირჩიე, რას დაინახავს ტელესკოპი შემდეგ.":
    - paragraph: დღევანდელი ცა
    - heading "აირჩიე, რას დაინახავს ტელესკოპი შემდეგ." [level=2]
    - paragraph: რას ხედავს ობსერვატორია დღეს და რატომ ვერ ხედავს დანარჩენს.
    - paragraph: ხილვადობას ობსერვატორია ახლა ითვლის
    - note:
      - strong: SIMULATED OBSERVATORY
      - text: ხილვადობა სიმულატორისთვის ითვლება. ნამდვილი ტელესკოპი არ მოძრაობს.
    - list:
      - listitem:
        - paragraph: ორმაგი ვარსკვლავი · Beta Cygni
        - heading "ალბირეო" [level=3]:
          - link "ალბირეო":
            - /url: /ka/app/missions/albireo
        - text: ახლა დაკვირვებადია
        - term: მიმდინარე სიმაღლე
        - definition: 61°
        - term: დაკვირვების დრო
        - definition: 03:50-მდე
      - listitem:
        - paragraph: პლანეტა
        - heading "სატურნი" [level=3]:
          - link "სატურნი":
            - /url: /ka/app/missions/saturn
        - text: ახლა დაკვირვებადია
        - term: მიმდინარე სიმაღლე
        - definition: 38°
        - term: დაკვირვების დრო
        - definition: 18:30 – 05:40
      - listitem:
        - paragraph: მთვარე
        - heading "მთვარე" [level=3]:
          - link "მთვარე":
            - /url: /ka/app/missions/moon-terminator
        - text: ტელესკოპის ხედვის არეზე დიდია
        - term: მიმდინარე სიმაღლე
        - definition: 44°
        - term: დაკვირვების დრო
        - definition: 17:10 – 02:20
      - listitem:
        - paragraph: სფერული გროვა · M13
        - heading "ჰერკულესის გროვა" [level=3]:
          - link "ჰერკულესის გროვა":
            - /url: /ka/app/missions/m13-hercules-cluster
        - text: ცაში ძალიან დაბლაა
        - term: მიმდინარე სიმაღლე
        - definition: 18°
        - term: დაკვირვების დრო
        - definition: 01:05-მდე
      - listitem:
        - paragraph: პლანეტა
        - heading "ვენერა" [level=3]:
          - link "ვენერა":
            - /url: /ka/app/missions/venus
        - text: ჰორიზონტს ქვემოთაა
        - term: მიმდინარე სიმაღლე
        - definition: "-12°"
        - term: დაკვირვების დრო
        - definition: 06:15-დან
    - link "დღევანდელი ყველა ობიექტი":
      - /url: /ka/app/missions
  - region "ერთი ნამდვილი ტელესკოპი, თბილისში.":
    - paragraph: ინსტრუმენტი
    - heading "ერთი ნამდვილი ტელესკოპი, თბილისში." [level=2]
    - paragraph: მას მხოლოდ ობსერვატორიის საკუთარი პროგრამა მართავს და არასდროს — ბრაუზერი პირდაპირ. რასაც ხედავ, იმას ხედავს მისი კამერა.
    - term: ტელესკოპი
    - definition: Celestron NexStar 6SE
    - term: აპერტურა
    - definition: 150 mm
    - term: ფოკუსური მანძილი
    - definition: 1500 mm
    - term: ფარდობითი ხვრელი
    - definition: f/10
    - term: კამერა
    - definition: ZWO ASI585MC გაგრილების გარეშე, ფერადი სენსორი
    - term: რეჟიმი
    - definition: პირდაპირი ხედი მოკლე ექსპოზიციები, რომლებიც შენს თვალწინ იკრიბება. ეს არ არის ხანგრძლივი ექსპოზიციის ასტროფოტოგრაფია.
    - term: მდებარეობა
    - definition: თბილისი, საქართველო
    - complementary "სტატუსი ახლა":
      - heading "სტატუსი ახლა" [level=3]
      - link "სრული სტატუსი":
        - /url: /ka/status
      - note:
        - strong: SIMULATED OBSERVATORY
        - text: პასუხობს სიმულატორი. ნამდვილი ტელესკოპი არ მოძრაობს.
      - term: ობსერვატორიის კავშირი
      - definition: ონლაინ
      - term: ამინდი
      - definition: მოწმენდილი
      - term: ამინდის შეჩერება
      - definition: შეჩერება არ არის
      - paragraph: დაკვირვება მიმდინარეობს
  - region "შენი შემდეგი დაკვირვება აქ იწყება.":
    - paragraph: დაიწყე დღეს
    - heading "შენი შემდეგი დაკვირვება აქ იწყება." [level=2]
    - paragraph: აირჩიე დაკვირვებადი ობიექტი და დაგეგმე შენი პირველი დაკვირვება სტელარზე.
    - link "დაჯავშნე დრო":
      - /url: /ka/app/book
    - link "დღევანდელი ცის ნახვა":
      - /url: "#tonight"
    - heading "პირადი სესიები" [level=3]
    - list:
      - listitem: 30 წთ
      - listitem: 60 წთ
      - listitem: 120 წთ
    - paragraph: უფრო ხანგრძლივი, მხოლოდ შენთვის გამოყოფილი დრო ტელესკოპზე მოგვიანებით დაემატება.
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
      - /url: /ka
    - link "English":
      - /url: /en
- alert
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | 
  3   | import { brand } from "../src/brand";
  4   | import { appSidebar, bottomNavigation } from "./selectors";
  5   | 
  6   | test("communicates real telescope access in the English poster hero", async ({
  7   |   page,
  8   | }) => {
  9   |   await page.goto("/en");
  10  | 
  11  |   const hero = page.locator(".poster-hero");
  12  |   await expect(
  13  |     page.getByRole("heading", { level: 1, name: "The real sky, live." }),
  14  |   ).toBeVisible();
  15  |   await expect(hero.locator(".title-sunset")).toHaveText("live.");
  16  |   await expect(hero.getByText(/A real telescope in Tbilisi, Georgia/)).toBeVisible();
  17  |   await expect(page.getByLabel(brand.en.siteName).first()).toBeVisible();
  18  |   await expect(hero.getByRole("link", { name: "Reserve a slot" })).toHaveAttribute(
  19  |     "href",
  20  |     "/en/app/book",
  21  |   );
  22  | 
  23  |   // The stats are the platform's: tonight's observable count, then the telescope.
  24  |   const stats = hero.locator(".stats-row > div");
  25  |   await expect(stats).toHaveCount(3);
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
> 58  |   await expect(page).toHaveURL(/\/en$/);
      |                      ^ Error: expect(page).toHaveURL(expected) failed
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
  126 |       await page.setViewportSize({ width, height: 844 });
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
```