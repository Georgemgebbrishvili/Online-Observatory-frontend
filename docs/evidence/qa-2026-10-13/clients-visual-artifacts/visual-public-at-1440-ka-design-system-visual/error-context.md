# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> public at 1440 >> ka /design-system
- Location: e2e/visual.spec.ts:127:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

Timeout: 15000ms
  Timeout 15000ms exceeded.

  Snapshot: ka-design-system-1440.png

Call log:
  - Expect "toHaveScreenshot(ka-design-system-1440.png)" with timeout 15000ms
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
  - main [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e6]:
        - paragraph [ref=e7]: შიდა ცნობარი · 01
        - heading "ვიზუალური სისტემა" [level=1] [ref=e9]
        - paragraph [ref=e10]: "სტელარის ვიზუალური ენა, ADR-052, Skychaser-ის საიტიდან: თითქმის შავი ფონი ვარსკვლავებით, თეთრი ტექსტი, მაღალი სათაურები. წითელი — აქცენტებისა და მთავარი ღილაკებისთვის, მწვანე — პირდაპირი ეთერისთვის, ოქროსფერი — სიმულაციისთვის. ღილაკები და პირდაპირი ეთერის ნიშნები ანათებს."
        - generic [ref=e11]: დეველოპერული გვერდი · noindex
      - region [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: "01"
          - generic [ref=e15]:
            - heading "საფუძვლები" [level=2] [ref=e16]
            - paragraph [ref=e17]: ფერების როლები და ხუთი შრიფტი, ქართულის ჩათვლით.
            - paragraph [ref=e18]: Brand Identity System v2.0 · as amended by ADR-052 — ground and ink, colour roles, type
        - generic [ref=e19]:
          - generic [ref=e20]:
            - heading "ძირითადი პალიტრა" [level=3] [ref=e21]
            - generic [ref=e22]:
              - generic [ref=e23]:
                - generic [ref=e25]: ღამე
                - code [ref=e26]: "--color-night"
                - code [ref=e27]: "#0d0d0d"
              - generic [ref=e28]:
                - generic [ref=e30]: სიღრმე · ჭები
                - code [ref=e31]: "--color-surface-base"
                - code [ref=e32]: "#131313"
              - generic [ref=e33]:
                - generic [ref=e35]: პანელი
                - code [ref=e36]: "--color-surface-raised"
                - code [ref=e37]: cream 6%
              - generic [ref=e38]:
                - generic [ref=e40]: პანელი · კურსორის მიტანისას
                - code [ref=e41]: "--color-surface-hover"
                - code [ref=e42]: cream 11%
              - generic [ref=e43]:
                - generic [ref=e45]: ხაზი
                - code [ref=e46]: "--color-border-subtle"
                - code [ref=e47]: rule 12%
              - generic [ref=e48]:
                - generic [ref=e50]: ხაზი · მკვეთრი
                - code [ref=e51]: "--color-border-strong"
                - code [ref=e52]: rule 22%
              - generic [ref=e53]:
                - generic [ref=e55]: ტექსტი
                - code [ref=e56]: "--color-text-primary"
                - code [ref=e57]: "#f4f4f2"
              - generic [ref=e58]:
                - generic [ref=e60]: ტექსტი 2 · მეორადი
                - code [ref=e61]: "--color-text-secondary"
                - code [ref=e62]: "#b8b8b4"
              - generic [ref=e63]:
                - generic [ref=e65]: ტექსტი 3 · მესამეული
                - code [ref=e66]: "--color-text-tertiary"
                - code [ref=e67]: "#969692"
              - generic [ref=e68]:
                - generic [ref=e70]: ტექსტი 4 · გამორთული
                - code [ref=e71]: "--color-text-disabled"
                - code [ref=e72]: "#73736f"
              - generic [ref=e73]:
                - generic [ref=e75]: წითელი · აქცენტი
                - code [ref=e76]: "--color-accent"
                - code [ref=e77]: "#e3482c"
              - generic [ref=e78]:
                - generic [ref=e80]: წითელი · ღილაკის ფონი
                - code [ref=e81]: "--color-action"
                - code [ref=e82]: "#c8392a"
              - generic [ref=e83]:
                - generic [ref=e85]: წითელი ტექსტი
                - code [ref=e86]: "--color-accent-ink"
                - code [ref=e87]: "#f0785a"
              - generic [ref=e88]:
                - generic [ref=e90]: მწვანე · პირდაპირი ეთერი
                - code [ref=e91]: "--color-live"
                - code [ref=e92]: "#2ecc71"
              - generic [ref=e93]:
                - generic [ref=e95]: ოქროსფერი · სიმულაცია
                - code [ref=e96]: "--color-simulated"
                - code [ref=e97]: "#e2b85a"
              - generic [ref=e98]:
                - generic [ref=e100]: წარმატება
                - code [ref=e101]: "--color-success"
                - code [ref=e102]: "#2ecc71"
              - generic [ref=e103]:
                - generic [ref=e105]: გაფრთხილება
                - code [ref=e106]: "--color-warning"
                - code [ref=e107]: "#e2b85a"
              - generic [ref=e108]:
                - generic [ref=e110]: შეცდომა
                - code [ref=e111]: "--color-error"
                - code [ref=e112]: "#ff7a6b"
          - generic [ref=e113]:
            - heading "ტიპოგრაფია" [level=3] [ref=e114]
            - generic [ref=e115]:
              - generic [ref=e116]:
                - text: Anton · სათაური — Noto Sans Georgian 800
                - paragraph [ref=e117]: შენი დრო ნამდვილ ცასთან.
                - paragraph [ref=e118]: შენი დრო ნამდვილ ცასთან.
              - generic [ref=e119]:
                - text: Anton · მზის ჩასვლის სათაური — ერთი ხაზი გვერდზე
                - paragraph [ref=e120]:
                  - generic [ref=e121]: The real sky
              - generic [ref=e122]:
                - text: Oswald · ეტიკეტი — Noto Sans Georgian 600
                - paragraph [ref=e123]: Tonight · Tbilisi
                - paragraph [ref=e124]: ამაღამ · თბილისი
              - generic [ref=e125]:
                - text: Geist · ტექსტი — FiraGO
                - paragraph [ref=e126]: ინსტრუმენტული ინტერფეისი დაბალი განათების პირობებშიც მკაფიო, გაწონასწორებული და მშვიდი უნდა დარჩეს.
                - paragraph [ref=e127]: ტელესკოპი ნამდვილად მიბრუნდება შენ მიერ არჩეული ობიექტისკენ.
              - generic [ref=e128]:
                - text: JetBrains Mono · მონაცემები
                - paragraph [ref=e129]: RA 05h 35m 17.3s · DEC −05° 23′ 28″ · EXP 4.0s × 15
              - generic [ref=e130]:
                - code [ref=e131]: "04"
                - code [ref=e132]: "08"
                - code [ref=e133]: "12"
                - code [ref=e134]: "16"
                - code [ref=e135]: "24"
                - code [ref=e136]: "32"
      - region [ref=e137]:
        - generic [ref=e138]:
          - generic [ref=e139]: "02"
          - generic [ref=e140]:
            - heading "ტიპოგრაფიული შკალა" [level=2] [ref=e141]
            - paragraph [ref=e142]: პროდუქტში ყველა ზომა ამ შკალიდან მოდის.
            - paragraph [ref=e143]: Brand Identity System v2.0 · as amended by ADR-052 — type
        - generic [ref=e145]:
          - generic [ref=e146]:
            - term [ref=e147]:
              - code [ref=e148]: "--font-size-display"
            - definition [ref=e149]: ნამდვილი ცა
          - generic [ref=e150]:
            - term [ref=e151]:
              - code [ref=e152]: "--font-size-hero"
            - definition [ref=e153]: შენი დრო ნამდვილ ცასთან.
          - generic [ref=e154]:
            - term [ref=e155]:
              - code [ref=e156]: "--font-size-h1"
            - definition [ref=e157]: ამაღამ ჰორიზონტის ზემოთ
          - generic [ref=e158]:
            - term [ref=e159]:
              - code [ref=e160]: "--font-size-h2"
            - definition [ref=e161]: ინსტრუმენტი მზადაა
          - generic [ref=e162]:
            - term [ref=e163]:
              - code [ref=e164]: "--font-size-h3"
            - definition [ref=e165]: დაკვირვების დაჯავშნა
          - generic [ref=e166]:
            - term [ref=e167]:
              - code [ref=e168]: "--font-size-stat"
            - definition [ref=e169]: 14 · 42.7° · 08:12
          - generic [ref=e170]:
            - term [ref=e171]:
              - code [ref=e172]: "--font-size-kicker"
            - definition [ref=e173]: პირდაპირი დაკვირვება · თბილისი
          - generic [ref=e174]:
            - term [ref=e175]:
              - code [ref=e176]: "--font-size-body-lg"
            - definition [ref=e177]: შესავალი აბზაცები
          - generic [ref=e178]:
            - term [ref=e179]:
              - code [ref=e180]: "--font-size-body"
            - definition [ref=e181]: ძირითადი ტექსტი მთელ პროდუქტში
          - generic [ref=e182]:
            - term [ref=e183]:
              - code [ref=e184]: "--font-size-label"
            - definition [ref=e185]: ეტიკეტები · მეტამონაცემები
          - generic [ref=e186]:
            - term [ref=e187]:
              - code [ref=e188]: "--font-size-caption"
            - definition [ref=e189]: წარწერები და მოკლე ტექსტი
          - generic [ref=e190]:
            - term [ref=e191]:
              - code [ref=e192]: "--font-size-mono"
            - definition [ref=e193]: RA 05h 35m 17.3s · DEC −05° 23′ 28″ · EXP 4.0s × 15
      - region [ref=e194]:
        - generic [ref=e195]:
          - generic [ref=e196]: "03"
          - generic [ref=e197]:
            - heading "ზედწარწერა და მაჩვენებლები" [level=2] [ref=e198]
            - paragraph [ref=e199]: წითელი ზედწარწერა სათაურის ზემოთ; დიდი ციფრები წარწერების ზემოთ, თხელი ხაზის ქვეშ.
            - paragraph [ref=e200]: Brand Identity System v2.0 · as amended by ADR-052 — components
        - generic [ref=e201]:
          - paragraph [ref=e202]: პირდაპირი დაკვირვება · თბილისი
          - paragraph [ref=e203]: ერთი ტელესკოპი. შენი ცა.
          - generic [ref=e204]:
            - generic [ref=e205]:
              - paragraph [ref=e206]: 6″
              - paragraph [ref=e207]: აპერტურა
            - generic [ref=e208]:
              - paragraph [ref=e209]: "1"
              - paragraph [ref=e210]: დამკვირვებელი მართვის პულტთან
            - generic [ref=e211]:
              - paragraph [ref=e212]: "10"
              - paragraph [ref=e213]: მაყურებლის ადგილი
      - region [ref=e214]:
        - generic [ref=e215]:
          - generic [ref=e216]: "04"
          - generic [ref=e217]:
            - heading "ქმედებები და არჩევა" [level=2] [ref=e218]
            - paragraph [ref=e219]: ერთი წითელი მთავარი ღილაკი თავისი ნათებით; კონტურიანი, უფონო და საშიში; ჩიპები და სიმულაციის ნიშანი. ფოკუსი — წითელი რგოლი.
            - paragraph [ref=e220]: Brand Identity System v2.0 · as amended by ADR-052 — components
        - generic [ref=e221]:
          - generic [ref=e222]:
            - button "დაკვირვების დაჯავშნა" [ref=e223] [cursor=pointer]
            - button "დეტალების ნახვა" [ref=e225] [cursor=pointer]
            - button "გაუქმება" [ref=e227] [cursor=pointer]
            - button "დაკვირვების დასრულება" [ref=e229] [cursor=pointer]
            - button "ცის შემოწმება" [disabled] [ref=e231]
            - button "მიუწვდომელია" [disabled] [ref=e234]
          - generic [ref=e236]:
            - button "პატარა" [ref=e237] [cursor=pointer]
            - button "საშუალო" [ref=e239] [cursor=pointer]
            - button "დიდი" [ref=e241] [cursor=pointer]
            - button "მიუწვდომელია" [disabled] [ref=e243]
            - button "ცის შემოწმება" [disabled] [ref=e245]
            - link "Google-ით გაგრძელება" [ref=e248] [cursor=pointer]:
              - /url: "#google"
          - generic [ref=e251]:
            - button "ობიექტების ძიება" [ref=e252] [cursor=pointer]
            - button "ტელესკოპის პოვნა" [ref=e256] [cursor=pointer]
            - generic [ref=e261]: ხელმისაწვდომია ამაღამ
            - generic [ref=e262]: ნათელი ნისლეული
            - generic [ref=e263]: არჩეულია
            - generic [ref=e264]: სიმულირებული
      - region [ref=e265]:
        - generic [ref=e266]:
          - generic [ref=e267]: "05"
          - generic [ref=e268]:
            - heading "ოპერაციული სტატუსი" [level=2] [ref=e269]
            - paragraph [ref=e270]: მდგომარეობა ტექსტით, ფორმითა და თავშეკავებული ფერით.
            - paragraph [ref=e271]: Brand Identity System v2.0 · §04 Semantic colors · §08 Live observation page, rule 04
        - generic [ref=e272]:
          - generic [ref=e273]:
            - heading "ObservatoryStatus" [level=3] [ref=e274]
            - generic [ref=e275]:
              - generic [ref=e276]: ონლაინ
              - generic [ref=e278]: მზადდება
              - generic [ref=e280]: დაკვირვება მიმდინარეობს
              - generic [ref=e282]: გაჩერებულია
              - generic [ref=e284]: კავშირგარეშეა
              - generic [ref=e286]: ამინდის გამო შეჩერებულია
              - generic [ref=e288]: ტექნიკური მომსახურება
          - generic [ref=e290]:
            - heading "LiveIndicator" [level=3] [ref=e291]
            - generic [ref=e292]:
              - generic [ref=e293]: პირდაპირი
              - generic [ref=e295]: უმოქმედო
            - heading "TargetAvailability" [level=3] [ref=e297]
            - generic [ref=e298]:
              - generic [ref=e299]: ახლა დაკვირვებადია
              - generic [ref=e301]: ტელესკოპის უსაფრთხოების ზღვრები ჯერ არ არის გაზომილი
              - generic [ref=e303]: ამჟამად არ არის ხელმისაწვდომი
              - generic [ref=e305]: ობსერვატორია კავშირგარეშეა
              - generic [ref=e307]: შეჩერებულია ამინდის გამო
              - generic [ref=e309]: ჰორიზონტს ქვემოთაა
              - generic [ref=e311]: ცაში ძალიან დაბლაა
              - generic [ref=e313]: ტელესკოპისთვის ძალიან მაღლაა
              - generic [ref=e315]: ადგილობრივი ჰორიზონტის მიღმაა
              - generic [ref=e317]: ტელესკოპი ამ მიმართულებით არ მიიმართება
              - generic [ref=e319]: ცა ჯერ საკმარისად ბნელი არ არის
              - generic [ref=e321]: მზესთან ძალიან ახლოსაა
              - generic [ref=e323]: მთვარესთან ძალიან ახლოსაა
              - generic [ref=e325]: ტელესკოპის ხედვის არეზე დიდია
          - generic [ref=e327]:
            - heading "ModeNotice" [level=3] [ref=e328]
            - generic [ref=e329]:
              - note [ref=e330]:
                - strong [ref=e331]: სიმულირებული ობსერვატორია
                - generic [ref=e332]: პასუხობს სიმულატორი. ნამდვილი ტელესკოპი არ მოძრაობს.
              - note [ref=e333]:
                - strong [ref=e334]: ნამდვილი აპარატურა
                - generic [ref=e335]: პასუხობს ფიზიკური ტელესკოპი.
          - generic [ref=e336]:
            - heading "MissionStatus" [level=3] [ref=e337]
            - generic [ref=e338]:
              - generic [ref=e339]: მისია მოთხოვნილია
              - generic [ref=e341]: დაკვირვება დაგეგმილია
              - generic [ref=e343]: შენი დაკვირვება მზადდება
              - generic [ref=e345]: ტელესკოპი ობიექტისკენ მოძრაობს
              - generic [ref=e347]: მდებარეობა მოწმდება
              - generic [ref=e349]: ობიექტი ცენტრდება
              - generic [ref=e351]: დაკვირვება მიმდინარეობს
              - generic [ref=e353]: მიმდინარეობს გადაღება
              - generic [ref=e355]: გამოსახულება მუშავდება
              - generic [ref=e357]: დაკვირვება დასრულებულია
              - generic [ref=e359]: მისია ამინდის გამო შეჩერდა
              - generic [ref=e361]: ობიექტი არ ჩანს
              - generic [ref=e363]: ობსერვატორიის აპარატურის შეცდომა
              - generic [ref=e365]: მისია გაუქმებულია
              - generic [ref=e367]: მისია ვერ შესრულდა
      - region [ref=e369]:
        - generic [ref=e370]:
          - generic [ref=e371]: "06"
          - generic [ref=e372]:
            - heading "ზედაპირები" [level=2] [ref=e373]
            - paragraph [ref=e374]: ბარათები და პანელები მშვიდი ინფორმაციული იერარქიისთვის.
            - paragraph [ref=e375]: Brand Identity System v2.0 · §08 Surface mapping · §07 Iconography (card radius)
        - generic [ref=e376]:
          - article [ref=e377]:
            - generic [ref=e378]:
              - paragraph [ref=e379]: ამაღამ · 22:40
              - heading "M42 · ორიონის ნისლეული" [level=3] [ref=e380]
            - paragraph [ref=e382]: ემისიური ნისლეული ორიონში, თბილისიდან დაკვირვებისთვის შესანიშნავი დროის მონაკვეთით.
            - generic [ref=e384]:
              - generic [ref=e385]: ხელმისაწვდომია 12-წუთიანი მისიისთვის
              - button "დეტალების ნახვა" [ref=e386] [cursor=pointer]
          - generic [ref=e388]:
            - heading "ზედაპირის პანელი" [level=3] [ref=e389]
            - paragraph [ref=e390]: მშვიდი კონტეინერი მართვის ელემენტებისა და ობსერვატორიის მონაცემებისთვის.
          - generic [ref=e391]:
            - heading "ამაღლებული პანელი" [level=3] [ref=e392]
            - paragraph [ref=e393]: გამოიყენება ფოკუსირებულ ფენებსა და მკაფიოდ გამოსაყოფ კონტენტში.
        - heading "CaptureCard — სიმულირებული კადრი დახატული გამოსახულებით, კადრი მინიატურის გარეშე და ჩამოტვირთვის მდგომარეობები" [level=3] [ref=e394]
        - generic [ref=e395]:
          - article [ref=e396]:
            - 'link "კადრის გახსნა: ჰერკულესის გროვა" [ref=e397] [cursor=pointer]':
              - /url: /ka/design-system#surfaces-title
              - img "ჰერკულესის გროვა — გადაღებული კადრი" [ref=e398]
              - generic [ref=e399]:
                - generic [ref=e400]: სიმულირებული კადრი
                - generic [ref=e401]: პირადი
            - generic [ref=e402]:
              - generic [ref=e403]: M13 · 60000000
              - heading [level=3] [ref=e404]:
                - link "ჰერკულესის გროვა" [ref=e405] [cursor=pointer]:
                  - /url: /ka/design-system#surfaces-title
              - paragraph [ref=e406]: 23 სექტემბერი, 2026, 00:10 GMT+4
          - article [ref=e407]:
            - 'link "კადრის გახსნა: ჰერკულესის გროვა" [ref=e408] [cursor=pointer]':
              - /url: /ka/design-system#surfaces-title
              - generic [ref=e409]:
                - generic [ref=e410]: ○
                - text: ამ კადრს მინიატურა არ აქვს
              - generic [ref=e411]: გალერეაში
            - generic [ref=e413]:
              - generic [ref=e414]: M13 · 60000000
              - heading [level=3] [ref=e415]:
                - link "ჰერკულესის გროვა" [ref=e416] [cursor=pointer]:
                  - /url: /ka/design-system#surfaces-title
              - paragraph [ref=e417]: 23 სექტემბერი, 2026, 00:02 GMT+4
          - generic [ref=e418]:
            - generic [ref=e419]:
              - generic [ref=e420]:
                - button "კადრის ჩამოტვირთვა" [ref=e421]
                - paragraph [ref=e423]: ამ კადრისთვის FITS არ ჩაწერილა
              - paragraph [ref=e424]: ჩამოტვირთვის ბმული მოთხოვნისას იქმნება და მალევე ვადა ეწურება.
            - note [ref=e425]: ჩამოტვირთვის ბმული ვერ შეიქმნა. სცადე ხელახლა.
        - heading "SlotRow — თავისუფალი, დაჯავშნილი და ამინდის გამო შეჩერებული" [level=3] [ref=e426]
        - list [ref=e427]:
          - listitem [ref=e428]:
            - generic [ref=e429]:
              - time [ref=e430]: 18:00
              - text: –
              - time [ref=e431]: 18:30
              - text: GMT+4
            - generic [ref=e432]: 30 წთ
            - generic [ref=e433]: 45,00 ₾
            - link "არჩევა 18:00–18:30" [ref=e435] [cursor=pointer]:
              - /url: "#"
              - text: არჩევა
          - listitem [ref=e436]:
            - generic [ref=e437]:
              - time [ref=e438]: 18:40
              - text: –
              - time [ref=e439]: 19:10
              - text: GMT+4
            - generic [ref=e440]: 30 წთ
            - generic [ref=e441]: 45,00 ₾
            - generic [ref=e442]: დაჯავშნილია
          - listitem [ref=e443]:
            - generic [ref=e444]:
              - time [ref=e445]: 19:20
              - text: –
              - time [ref=e446]: 19:50
              - text: GMT+4
            - generic [ref=e447]: 30 წთ
            - generic [ref=e448]: 45,00 ₾
            - generic [ref=e449]: ამინდის გამო შეჩერება
          - listitem [ref=e450]:
            - generic [ref=e451]:
              - time [ref=e452]: 18:00
              - text: –
              - time [ref=e453]: 18:30
              - text: GMT+4
            - generic [ref=e454]: 30 წთ
            - generic [ref=e455]: უფასო
            - link "არჩევა 18:00–18:30" [ref=e457] [cursor=pointer]:
              - /url: "#"
              - text: არჩევა
        - heading "BookingRow — გადახდას ელოდება, დადასტურებული, გაუქმებული, ვადაგასული, თანხა დაბრუნებული" [level=3] [ref=e458]
        - list [ref=e459]:
          - listitem [ref=e460]:
            - link "Saturn ხუთ, 1 ოქტ. 2026, 18:00–18:30 GMT+4 45,00 ₾ გადახდას ელოდება" [ref=e461] [cursor=pointer]:
              - /url: "#"
              - generic [ref=e462]: Saturn
              - generic [ref=e463]: ხუთ, 1 ოქტ. 2026, 18:00–18:30 GMT+4
              - generic [ref=e464]: 45,00 ₾
              - generic [ref=e465]: გადახდას ელოდება
          - listitem [ref=e467]:
            - link "Albireo პარ, 2 ოქტ. 2026, 18:00–18:30 GMT+4 45,00 ₾ დადასტურებულია" [ref=e468] [cursor=pointer]:
              - /url: "#"
              - generic [ref=e469]: Albireo
              - generic [ref=e470]: პარ, 2 ოქტ. 2026, 18:00–18:30 GMT+4
              - generic [ref=e471]: 45,00 ₾
              - generic [ref=e472]: დადასტურებულია
          - listitem [ref=e474]:
            - link "M13 შაბ, 3 ოქტ. 2026, 18:00–18:30 GMT+4 45,00 ₾ გაუქმებულია" [ref=e475] [cursor=pointer]:
              - /url: "#"
              - generic [ref=e476]: M13
              - generic [ref=e477]: შაბ, 3 ოქტ. 2026, 18:00–18:30 GMT+4
              - generic [ref=e478]: 45,00 ₾
              - generic [ref=e479]: გაუქმებულია
          - listitem [ref=e481]:
            - link "Venus კვი, 4 ოქტ. 2026, 18:00–18:30 GMT+4 45,00 ₾ ვადა ამოიწურა" [ref=e482] [cursor=pointer]:
              - /url: "#"
              - generic [ref=e483]: Venus
              - generic [ref=e484]: კვი, 4 ოქტ. 2026, 18:00–18:30 GMT+4
              - generic [ref=e485]: 45,00 ₾
              - generic [ref=e486]: ვადა ამოიწურა
          - listitem [ref=e488]:
            - link "Moon ორშ, 5 ოქტ. 2026, 18:00–18:30 GMT+4 45,00 ₾ თანხა დაბრუნებულია" [ref=e489] [cursor=pointer]:
              - /url: "#"
              - generic [ref=e490]: Moon
              - generic [ref=e491]: ორშ, 5 ოქტ. 2026, 18:00–18:30 GMT+4
              - generic [ref=e492]: 45,00 ₾
              - generic [ref=e493]: თანხა დაბრუნებულია
        - heading "BookingActions — გაუქმება, დადასტურების კითხვა, უქმდება, თანხის დაბრუნება, ბრუნდება, დაბრუნება უარყოფილია" [level=3] [ref=e495]
        - generic [ref=e496]:
          - button "ჯავშნის გაუქმება" [ref=e499] [cursor=pointer]
          - group "გავაუქმოთ ეს ჯავშანი და გავათავისუფლოთ დრო?" [ref=e503]:
            - paragraph [ref=e504]: გავაუქმოთ ეს ჯავშანი და გავათავისუფლოთ დრო?
            - generic [ref=e505]:
              - button "დიახ, გაუქმება" [ref=e506] [cursor=pointer]
              - button "დატოვება" [ref=e508] [cursor=pointer]
          - group "გავაუქმოთ ეს ჯავშანი და გავათავისუფლოთ დრო?" [ref=e512]:
            - paragraph [ref=e513]: გავაუქმოთ ეს ჯავშანი და გავათავისუფლოთ დრო?
            - generic [ref=e514]:
              - button "უქმდება" [disabled] [ref=e515]
              - button "დატოვება" [disabled] [ref=e518]
          - button "თანხის დაბრუნება" [ref=e522] [cursor=pointer]
          - button "ბრუნდება" [disabled] [ref=e526]
          - generic [ref=e530]:
            - button "თანხის დაბრუნება" [ref=e531] [cursor=pointer]
            - alert [ref=e533]: ამ გადახდისთვის თანხის დაბრუნება ჯერ შეუძლებელია. შენი უფლება ძალაში რჩება.
        - heading "ReserveForm — არაფერია არჩეული, ობიექტი არჩეულია, იჯავშნება, იხსნება გადახდის გვერდი, დრო დაკავებულია" [level=3] [ref=e534]
        - generic [ref=e535]:
          - generic [ref=e537]:
            - group "აირჩიე, რას დააკვირდები" [ref=e538]:
              - list [ref=e540]:
                - listitem [ref=e541]:
                  - generic [ref=e542] [cursor=pointer]:
                    - radio "Albireo β Cyg" [ref=e543]
                    - generic [ref=e544]: Albireo
                    - generic [ref=e545]: β Cyg
                - listitem [ref=e546]:
                  - generic [ref=e547] [cursor=pointer]:
                    - radio "Saturn" [ref=e548]
                    - generic [ref=e549]: Saturn
            - button "დაჯავშნა და გადახდა" [disabled] [ref=e550]
          - generic [ref=e553]:
            - group "აირჩიე, რას დააკვირდები" [ref=e554]:
              - list [ref=e556]:
                - listitem [ref=e557]:
                  - generic [ref=e558] [cursor=pointer]:
                    - radio "Albireo β Cyg" [ref=e559]
                    - generic [ref=e560]: Albireo
                    - generic [ref=e561]: β Cyg
                - listitem [ref=e562]:
                  - generic [ref=e563] [cursor=pointer]:
                    - radio "Saturn" [checked] [ref=e564]
                    - generic [ref=e565]: Saturn
            - button "დაჯავშნა და გადახდა" [ref=e566] [cursor=pointer]
          - generic [ref=e569]:
            - group "აირჩიე, რას დააკვირდები" [ref=e570]:
              - list [ref=e572]:
                - listitem [ref=e573]:
                  - generic [ref=e574]:
                    - radio "Albireo β Cyg" [disabled] [ref=e575]
                    - generic [ref=e576]: Albireo
                    - generic [ref=e577]: β Cyg
                - listitem [ref=e578]:
                  - generic [ref=e579]:
                    - radio "Saturn" [checked] [disabled] [ref=e580]
                    - generic [ref=e581]: Saturn
            - button "იჯავშნება" [disabled] [ref=e582]
          - generic [ref=e586]:
            - group "აირჩიე, რას დააკვირდები" [ref=e587]:
              - list [ref=e589]:
                - listitem [ref=e590]:
                  - generic [ref=e591]:
                    - radio "Albireo β Cyg" [disabled] [ref=e592]
                    - generic [ref=e593]: Albireo
                    - generic [ref=e594]: β Cyg
                - listitem [ref=e595]:
                  - generic [ref=e596]:
                    - radio "Saturn" [checked] [disabled] [ref=e597]
                    - generic [ref=e598]: Saturn
            - button "იხსნება გადახდის გვერდი" [disabled] [ref=e599]
          - generic [ref=e603]:
            - group "აირჩიე, რას დააკვირდები" [ref=e604]:
              - list [ref=e606]:
                - listitem [ref=e607]:
                  - generic [ref=e608] [cursor=pointer]:
                    - radio "Albireo β Cyg" [ref=e609]
                    - generic [ref=e610]: Albireo
                    - generic [ref=e611]: β Cyg
                - listitem [ref=e612]:
                  - generic [ref=e613] [cursor=pointer]:
                    - radio "Saturn" [checked] [ref=e614]
                    - generic [ref=e615]: Saturn
            - button "დაჯავშნა და გადახდა" [ref=e616] [cursor=pointer]
            - alert [ref=e618]: ეს დრო ახლახან სხვამ დაჯავშნა. აირჩიე სხვა.
        - heading "Console — ობსერვატორიის პანელი ონლაინ, არასტაბილური და კავშირგარეშე; მიმართულების პანელის მაჩვენებლები; ოთახის ღილაკები" [level=3] [ref=e619]
        - generic [ref=e620]:
          - region [ref=e621]:
            - generic [ref=e622]:
              - heading "ობსერვატორია — ონლაინ" [level=3] [ref=e623]
              - generic [ref=e626]: თბილისის ობსერვატორია
            - generic [ref=e627]:
              - generic [ref=e628]:
                - term [ref=e629]: ობსერვატორიის კავშირი
                - definition [ref=e630]:
                  - generic [ref=e631]: ონლაინ
              - generic [ref=e633]:
                - term [ref=e634]: ამინდი
                - definition [ref=e635]: მოწმენდილი
              - generic [ref=e636]:
                - term [ref=e637]: ღრუბლიანობა, პროგნოზი
                - definition [ref=e638]: 12%
          - region [ref=e639]:
            - generic [ref=e640]:
              - heading "ობსერვატორია — არასტაბილური" [level=3] [ref=e641]
              - generic [ref=e644]: თბილისის ობსერვატორია
            - generic [ref=e645]:
              - generic [ref=e646]:
                - term [ref=e647]: ობსერვატორიის კავშირი
                - definition [ref=e648]:
                  - generic [ref=e649]: არასტაბილური
              - generic [ref=e651]:
                - term [ref=e652]: ამინდი
                - definition [ref=e653]: მოღრუბლული
              - generic [ref=e654]:
                - term [ref=e655]: ღრუბლიანობა, პროგნოზი
                - definition [ref=e656]: 64%
          - region [ref=e657]:
            - generic [ref=e658]:
              - heading "ობსერვატორია — კავშირგარეშეა" [level=3] [ref=e659]
              - generic [ref=e662]: თბილისის ობსერვატორია
            - generic [ref=e663]:
              - generic [ref=e664]:
                - term [ref=e665]: ობსერვატორიის კავშირი
                - definition [ref=e666]:
                  - generic [ref=e667]: კავშირგარეშეა
              - generic [ref=e669]:
                - term [ref=e670]: ამინდი
                - definition [ref=e671]: უცნობია
              - generic [ref=e672]:
                - term [ref=e673]: ღრუბლიანობა, პროგნოზი
                - definition [ref=e674]: პროგნოზი არ არის
          - region [ref=e675]:
            - generic [ref=e676]:
              - heading "სად არის სატურნი" [level=2] [ref=e677]
              - generic [ref=e680]: სიმაღლე · აზიმუტი
            - generic [ref=e681]:
              - 'img "ცის ციფერბლატი: ჰორიზონტი კიდეზეა, ზენიტი — ცენტრში, ჩრდილოეთი — ზემოთ." [ref=e682]':
                - generic [ref=e754]: ჩ
                - generic [ref=e755]: ა
                - generic [ref=e756]: ს
                - generic [ref=e757]: დ
              - generic [ref=e763]:
                - generic [ref=e764]:
                  - term [ref=e765]: სიმაღლე
                  - definition [ref=e766]: 42.7°
                - generic [ref=e767]:
                  - term [ref=e768]: აზიმუტი
                  - definition [ref=e769]: 168.3°
                - generic [ref=e770]:
                  - term [ref=e771]: ამოდის
                  - definition [ref=e772]:
                    - time [ref=e773]: 17:12
                - generic [ref=e774]:
                  - term [ref=e775]: ჩადის
                  - definition [ref=e776]:
                    - time [ref=e777]: 03:48
            - paragraph [ref=e778]:
              - text: ეს ობიექტის მდებარეობაა და არა ტელესკოპის. ტელესკოპის მდებარეობა აქ დაკვირვების დროს გამოჩნდება.
              - time [ref=e779]: გამოთვლილია 22:00-ზე.
          - generic [ref=e780]:
            - button "დაკვირვების დაჯავშნა" [ref=e781] [cursor=pointer]
            - button "დიდი" [ref=e783] [cursor=pointer]
            - button "ცის შემოწმება" [disabled] [ref=e785]
            - button "მიუწვდომელია" [disabled] [ref=e788]
            - button "დაკვირვების დასრულება" [ref=e790] [cursor=pointer]
        - heading "RoomSharing — პირადი, იხსნება, ღიაა ორი მაყურებლით, შეწყვეტის კითხვა, ბმული დაკოპირდა, სესია დასრულდა" [level=3] [ref=e792]
        - generic [ref=e793]:
          - region "გაზიარება 1" [ref=e794]:
            - heading "გაზიარება" [level=2] [ref=e796]
            - paragraph [ref=e799]: ამ სესიას მხოლოდ შენ ხედავ.
            - button "ნება დართე სხვებს, უყურონ" [ref=e801] [cursor=pointer]
            - paragraph [ref=e803]
          - region "გაზიარება 2" [ref=e804]:
            - heading "გაზიარება" [level=2] [ref=e806]
            - paragraph [ref=e809]: ამ სესიას მხოლოდ შენ ხედავ.
            - button "ინახება" [disabled] [ref=e811]
            - paragraph [ref=e814]
          - region "გაზიარება 3" [ref=e815]:
            - generic [ref=e816]:
              - heading "გაზიარება" [level=2] [ref=e817]
              - generic [ref=e820]: 2 / 5
            - paragraph [ref=e821]: სხვებს შეუძლიათ უყურონ. დაკავებულია 2 ადგილი 5-დან.
            - generic [ref=e822]:
              - button "ბმულის კოპირება" [ref=e823] [cursor=pointer]
              - button "გაზიარების შეწყვეტა" [ref=e825] [cursor=pointer]
            - paragraph [ref=e827]
          - region "გაზიარება 4" [ref=e828]:
            - generic [ref=e829]:
              - heading "გაზიარება" [level=2] [ref=e830]
              - generic [ref=e833]: 2 / 5
            - paragraph [ref=e834]: სხვებს შეუძლიათ უყურონ. დაკავებულია 2 ადგილი 5-დან.
            - button "ბმულის კოპირება" [ref=e836] [cursor=pointer]
            - group "შევწყვიტოთ გაზიარება?" [ref=e838]:
              - paragraph [ref=e839]:
                - strong [ref=e840]: შევწყვიტოთ გაზიარება?
                - text: ყველა მაყურებელი გაითიშება. გადახდილ მაყურებლებს დაკარგული დროის თანხა დაუბრუნდებათ.
              - generic [ref=e841]:
                - button "შეწყვეტა" [ref=e842] [cursor=pointer]
                - button "გაგრძელება" [ref=e844] [cursor=pointer]
            - paragraph [ref=e846]
          - region "გაზიარება 5" [ref=e847]:
            - generic [ref=e848]:
              - heading "გაზიარება" [level=2] [ref=e849]
              - generic [ref=e852]: 2 / 5
            - paragraph [ref=e853]: სხვებს შეუძლიათ უყურონ. დაკავებულია 2 ადგილი 5-დან.
            - generic [ref=e854]:
              - button "ბმულის კოპირება" [ref=e855] [cursor=pointer]
              - button "გაზიარების შეწყვეტა" [ref=e857] [cursor=pointer]
            - paragraph [ref=e859]: ბმული დაკოპირდა
          - region "გაზიარება 6" [ref=e860]:
            - heading "გაზიარება" [level=2] [ref=e862]
            - paragraph [ref=e865]: ეს სესია დასრულდა.
        - heading "WatchView — ადგილი იყიდება, იყიდება, იტვირთება, შეცდომა, სიმულირებული, სავსეა, გადახდის მოლოდინი, ყურება, გასული, მფლობელმა დახურა, დახურულია თანხის დაბრუნებით, დასრულდა დასაბრუნებელი თანხით, დასრულდა, მფლობელი, არ არის ღია" [level=3] [ref=e866]
        - generic [ref=e867]:
          - region "WatchView 1" [ref=e868]:
            - generic [ref=e869]:
              - paragraph [ref=e870]: ყურება · Saturn
              - 'heading "Nino აკვირდება: Saturn." [level=2] [ref=e872]'
              - paragraph [ref=e873]: დაკავებულია 2 ადგილი 5-დან.
            - generic [ref=e875]:
              - generic [ref=e876]:
                - heading "შენი ადგილი" [level=3] [ref=e877]
                - generic [ref=e880]: თბილისის ობსერვატორია
              - button "ადგილის ყიდვა" [ref=e882] [cursor=pointer]
          - region "WatchView 2" [ref=e884]:
            - generic [ref=e885]:
              - paragraph [ref=e886]: ყურება · Saturn
              - 'heading "Nino აკვირდება: Saturn." [level=2] [ref=e888]'
              - paragraph [ref=e889]: დაკავებულია 2 ადგილი 5-დან.
            - generic [ref=e891]:
              - generic [ref=e892]:
                - heading "შენი ადგილი" [level=3] [ref=e893]
                - generic [ref=e896]: თბილისის ობსერვატორია
              - button "ადგილის ყიდვა" [disabled] [ref=e898]
          - region "WatchView 3" [ref=e901]:
            - heading "სესია იხსნება" [level=2] [ref=e903]
            - generic [ref=e905]:
              - heading "შენი ადგილი" [level=3] [ref=e907]
              - status [ref=e910]:
                - generic [ref=e911]: სესია იხსნება
          - region "WatchView 4" [ref=e916]:
            - heading "რაღაც შეფერხდა. სცადე თავიდან." [level=2] [ref=e918]
          - region "WatchView 5" [ref=e919]:
            - generic [ref=e920]:
              - paragraph [ref=e921]: ყურება · Saturn
              - 'heading "Nino აკვირდება: Saturn." [level=2] [ref=e923]'
              - paragraph [ref=e924]: დაკავებულია 2 ადგილი 5-დან.
            - note [ref=e925]:
              - strong [ref=e926]: სიმულირებული ობსერვატორია
              - generic [ref=e927]: პასუხობს სიმულატორი. ნამდვილი ტელესკოპი არ მოძრაობს.
            - generic [ref=e929]:
              - generic [ref=e930]:
                - heading "შენი ადგილი" [level=3] [ref=e931]
                - generic [ref=e934]: თბილისის ობსერვატორია
              - button "ადგილის ყიდვა" [ref=e936] [cursor=pointer]
          - region "WatchView 6" [ref=e938]:
            - generic [ref=e939]:
              - paragraph [ref=e940]: ყურება · Saturn
              - 'heading "Nino აკვირდება: Saturn." [level=2] [ref=e942]'
              - paragraph [ref=e943]: დაკავებულია 5 ადგილი 5-დან.
            - note [ref=e944]:
              - strong [ref=e945]: სიმულირებული ობსერვატორია
              - generic [ref=e946]: პასუხობს სიმულატორი. ნამდვილი ტელესკოპი არ მოძრაობს.
            - generic [ref=e948]:
              - generic [ref=e949]:
                - heading "შენი ადგილი" [level=3] [ref=e950]
                - generic [ref=e953]: თბილისის ობსერვატორია
              - paragraph [ref=e954]: ყველა ადგილი დაკავებულია.
          - region "WatchView 7" [ref=e955]:
            - generic [ref=e956]:
              - paragraph [ref=e957]: ყურება · Saturn
              - 'heading "Nino აკვირდება: Saturn." [level=2] [ref=e959]'
              - paragraph [ref=e960]: დაკავებულია 2 ადგილი 5-დან.
            - note [ref=e961]:
              - strong [ref=e962]: სიმულირებული ობსერვატორია
              - generic [ref=e963]: პასუხობს სიმულატორი. ნამდვილი ტელესკოპი არ მოძრაობს.
            - generic [ref=e965]:
              - generic [ref=e966]:
                - heading "შენი ადგილი" [level=3] [ref=e967]
                - generic [ref=e970]: თბილისის ობსერვატორია
              - status [ref=e971]: ველოდებით გადახდის დადასტურებას
              - button "ხელახლა შემოწმება" [disabled] [ref=e973]
          - region "WatchView 8" [ref=e976]:
            - generic [ref=e977]:
              - paragraph [ref=e978]: ყურება · Saturn
              - 'heading "Nino აკვირდება: Saturn." [level=2] [ref=e980]'
              - paragraph [ref=e981]: დაკავებულია 2 ადგილი 5-დან.
            - note [ref=e982]:
              - strong [ref=e983]: სიმულირებული ობსერვატორია
              - generic [ref=e984]: პასუხობს სიმულატორი. ნამდვილი ტელესკოპი არ მოძრაობს.
            - generic [ref=e985]:
              - generic [ref=e986]:
                - generic [ref=e988]:
                  - generic [ref=e989]:
                    - 'img "სიმულირებული პირდაპირი ხედი: Saturn" [ref=e990]'
                    - generic [ref=e991]: სიმულირებული
                  - generic:
                    - paragraph:
                      - generic: თბილისის ობსერვატორია
                      - generic: ZWO ASI585MC · 1500 mm · f/10
                    - paragraph:
                      - generic: სატურნი
                - generic [ref=e993]:
                  - region [ref=e994]:
                    - generic [ref=e995]:
                      - heading "მიმდინარეობა" [level=2] [ref=e996]
                      - generic [ref=e999]: ნაბიჯი 4 5-დან
                    - list [ref=e1000]:
                      - listitem [ref=e1001]:
                        - generic [ref=e1005]: მომზადება
                      - listitem [ref=e1006]:
                        - generic [ref=e1010]: მიმართვა
                      - listitem [ref=e1011]:
                        - generic [ref=e1015]: ცენტრირება
                      - listitem [ref=e1016]:
                        - generic [ref=e1017]: "04"
                        - generic [ref=e1018]: დაკვირვება
                        - generic [ref=e1019]: ახლა
                      - listitem [ref=e1020]:
                        - generic [ref=e1021]: "05"
                        - generic [ref=e1022]: გადაღება
                  - status [ref=e1024]:
                    - strong [ref=e1025]: პირდაპირი ხედი
                    - generic [ref=e1026]: სიმულატორის გამოსახულება და არა ტელესკოპის კადრი.
              - generic [ref=e1027]:
                - generic [ref=e1028]:
                  - heading "შენი ადგილი" [level=3] [ref=e1029]
                  - generic [ref=e1032]: თბილისის ობსერვატორია
                - paragraph [ref=e1033]: შენ უყურებ. ტელესკოპის მართვა და კადრების შენახვა შეუძლებელია.
                - button "ყურების შეწყვეტა" [ref=e1035] [cursor=pointer]
          - region "WatchView 9" [ref=e1037]:
            - generic [ref=e1038]:
              - paragraph [ref=e1039]: ყურება · Saturn
              - 'heading "Nino აკვირდება: Saturn." [level=2] [ref=e1041]'
              - paragraph [ref=e1042]: დაკავებულია 2 ადგილი 5-დან.
            - note [ref=e1043]:
              - strong [ref=e1044]: სიმულირებული ობსერვატორია
              - generic [ref=e1045]: პასუხობს სიმულატორი. ნამდვილი ტელესკოპი არ მოძრაობს.
            - generic [ref=e1047]:
              - generic [ref=e1048]:
                - heading "შენი ადგილი" [level=3] [ref=e1049]
                - generic [ref=e1052]: თბილისის ობსერვატორია
              - paragraph [ref=e1053]: შენ გახვედი. ადგილი სესიის დასრულებამდე შენია.
              - button "ხელახლა ყურება" [ref=e1055] [cursor=pointer]
          - region "WatchView 10" [ref=e1057]:
            - generic [ref=e1058]:
              - paragraph [ref=e1059]: ყურება · Saturn
              - heading "მფლობელმა სესია მაყურებლებისთვის დახურა." [level=2] [ref=e1061]
          - region "WatchView 11" [ref=e1062]:
            - generic [ref=e1063]:
              - paragraph [ref=e1064]: ყურება · Saturn
              - heading "მფლობელმა სესია მაყურებლებისთვის დახურა." [level=2] [ref=e1066]
            - generic [ref=e1068]:
              - generic [ref=e1069]:
                - heading "შენი ადგილი" [level=3] [ref=e1070]
                - generic [ref=e1073]: თბილისის ობსერვატორია
              - paragraph [ref=e1074]: დახურვის გამო დაკარგული დროისთვის 7,50 ₾ დაგიბრუნდა.
          - region "WatchView 12" [ref=e1075]:
            - generic [ref=e1076]:
              - paragraph [ref=e1077]: ყურება · Saturn
              - heading "ეს სესია დასრულდა." [level=2] [ref=e1079]
            - generic [ref=e1081]:
              - generic [ref=e1082]:
                - heading "შენი ადგილი" [level=3] [ref=e1083]
                - generic [ref=e1086]: თბილისის ობსერვატორია
              - paragraph [ref=e1087]: დახურვის გამო დაკარგული დროისთვის 7,50 ₾ დაგიბრუნდება.
          - region "WatchView 13" [ref=e1088]:
            - generic [ref=e1089]:
              - paragraph [ref=e1090]: ყურება · Saturn
              - heading "ეს სესია დასრულდა." [level=2] [ref=e1092]
          - region "WatchView 14" [ref=e1093]:
            - generic [ref=e1094]:
              - paragraph [ref=e1095]: ყურება · Saturn
              - heading "ეს შენი სესიაა." [level=2] [ref=e1097]
            - generic [ref=e1099]:
              - generic [ref=e1100]:
                - heading "Saturn" [level=3] [ref=e1101]
                - generic [ref=e1104]: თბილისის ობსერვატორია
              - paragraph [ref=e1105]: მას პირდაპირი დაკვირვების ოთახიდან მართავ. ყურება მათთვისაა, ვისაც სესიას გაუზიარებ.
              - link "პირდაპირი დაკვირვების ოთახში გადასვლა" [ref=e1107] [cursor=pointer]:
                - /url: /ka/design-system
          - region "WatchView 15" [ref=e1109]:
            - heading "ეს სესია საყურებლად ღია არ არის." [level=2] [ref=e1111]
        - heading "RoomControls — მართვა დაკვირვებისას, ტელესკოპის მოლოდინი, გადაღება დაიწყო, უარი, პასუხი არ არის, ცენტრირებამდე, გადაღებისას, გადაღების გარეშე; შემდეგ გადაღება და სესიის პანელის დასრულება, დასრულების კითხვა და დასრულება" [level=3] [ref=e1112]
        - generic [ref=e1113]:
          - region "მართვა 1" [ref=e1114]:
            - generic [ref=e1115]:
              - heading "მართვა" [level=2] [ref=e1116]
              - generic [ref=e1119]: 2′
            - generic [ref=e1120]:
              - button "მაღლა, 2 რკალური წუთი" [ref=e1121] [cursor=pointer]:
                - generic [ref=e1122]: ↑
              - button "მარცხნივ, 2 რკალური წუთი" [ref=e1123] [cursor=pointer]:
                - generic [ref=e1124]: ←
              - button "მარჯვნივ, 2 რკალური წუთი" [ref=e1125] [cursor=pointer]:
                - generic [ref=e1126]: →
              - button "დაბლა, 2 რკალური წუთი" [ref=e1127] [cursor=pointer]:
                - generic [ref=e1128]: ↓
              - button "ცენტრირება" [ref=e1129] [cursor=pointer]
            - paragraph [ref=e1130]
          - region "მართვა 2" [ref=e1131]:
            - generic [ref=e1132]:
              - heading "მართვა" [level=2] [ref=e1133]
              - generic [ref=e1136]: 2′
            - generic [ref=e1137]:
              - button "მაღლა, 2 რკალური წუთი" [disabled] [ref=e1138]:
                - generic [ref=e1139]: ↑
              - button "მარცხნივ, 2 რკალური წუთი" [disabled] [ref=e1140]:
                - generic [ref=e1141]: ←
              - button "მარჯვნივ, 2 რკალური წუთი" [disabled] [ref=e1142]:
                - generic [ref=e1143]: →
              - button "დაბლა, 2 რკალური წუთი" [disabled] [ref=e1144]:
                - generic [ref=e1145]: ↓
              - button "ცენტრირება" [disabled] [ref=e1146]
            - paragraph [ref=e1147]: ველოდებით ტელესკოპს
          - region "მართვა 3" [ref=e1148]:
            - generic [ref=e1149]:
              - heading "მართვა" [level=2] [ref=e1150]
              - generic [ref=e1153]: 2′
            - generic [ref=e1154]:
              - button "მაღლა, 2 რკალური წუთი" [ref=e1155] [cursor=pointer]:
                - generic [ref=e1156]: ↑
              - button "მარცხნივ, 2 რკალური წუთი" [ref=e1157] [cursor=pointer]:
                - generic [ref=e1158]: ←
              - button "მარჯვნივ, 2 რკალური წუთი" [ref=e1159] [cursor=pointer]:
                - generic [ref=e1160]: →
              - button "დაბლა, 2 რკალური წუთი" [ref=e1161] [cursor=pointer]:
                - generic [ref=e1162]: ↓
              - button "ცენტრირება" [ref=e1163] [cursor=pointer]
            - paragraph [ref=e1164]: გადაღება დაიწყო.
          - region "მართვა 4" [ref=e1165]:
            - generic [ref=e1166]:
              - heading "მართვა" [level=2] [ref=e1167]
              - generic [ref=e1170]: 2′
            - generic [ref=e1171]:
              - button "მაღლა, 2 რკალური წუთი" [ref=e1172] [cursor=pointer]:
                - generic [ref=e1173]: ↑
              - button "მარცხნივ, 2 რკალური წუთი" [ref=e1174] [cursor=pointer]:
                - generic [ref=e1175]: ←
              - button "მარჯვნივ, 2 რკალური წუთი" [ref=e1176] [cursor=pointer]:
                - generic [ref=e1177]: →
              - button "დაბლა, 2 რკალური წუთი" [ref=e1178] [cursor=pointer]:
                - generic [ref=e1179]: ↓
              - button "ცენტრირება" [ref=e1180] [cursor=pointer]
            - paragraph [ref=e1181]: ეს ტელესკოპს ობიექტიდან დასაშვებზე მეტად გადასწევდა. გასაგრძელებლად გამოიყენე ცენტრირება.
          - region "მართვა 5" [ref=e1182]:
            - generic [ref=e1183]:
              - heading "მართვა" [level=2] [ref=e1184]
              - generic [ref=e1187]: 2′
            - generic [ref=e1188]:
              - button "მაღლა, 2 რკალური წუთი" [ref=e1189] [cursor=pointer]:
                - generic [ref=e1190]: ↑
              - button "მარცხნივ, 2 რკალური წუთი" [ref=e1191] [cursor=pointer]:
                - generic [ref=e1192]: ←
              - button "მარჯვნივ, 2 რკალური წუთი" [ref=e1193] [cursor=pointer]:
                - generic [ref=e1194]: →
              - button "დაბლა, 2 რკალური წუთი" [ref=e1195] [cursor=pointer]:
                - generic [ref=e1196]: ↓
              - button "ცენტრირება" [ref=e1197] [cursor=pointer]
            - paragraph [ref=e1198]: ტელესკოპმა არ უპასუხა. სცადე თავიდან.
          - region "მართვა 6" [ref=e1199]:
            - generic [ref=e1200]:
              - heading "მართვა" [level=2] [ref=e1201]
              - generic [ref=e1204]: 2′
            - generic [ref=e1205]:
              - button "მაღლა, 2 რკალური წუთი" [ref=e1206] [cursor=pointer]:
                - generic [ref=e1207]: ↑
              - button "მარცხნივ, 2 რკალური წუთი" [ref=e1208] [cursor=pointer]:
                - generic [ref=e1209]: ←
              - button "მარჯვნივ, 2 რკალური წუთი" [ref=e1210] [cursor=pointer]:
                - generic [ref=e1211]: →
              - button "დაბლა, 2 რკალური წუთი" [ref=e1212] [cursor=pointer]:
                - generic [ref=e1213]: ↓
              - button "ცენტრირება" [ref=e1214] [cursor=pointer]
            - paragraph [ref=e1215]
          - region "მართვა 7" [ref=e1216]:
            - heading "მართვა" [level=2] [ref=e1218]
            - paragraph [ref=e1221]: მართვა გაიხსნება, როცა ობიექტი ცენტრში მოექცევა.
            - paragraph [ref=e1222]
          - region "მართვა 8" [ref=e1223]:
            - heading "მართვა" [level=2] [ref=e1225]
            - paragraph [ref=e1228]: მიმდინარეობს გადაღება. მართვა დასრულების შემდეგ დაბრუნდება.
            - paragraph [ref=e1229]
          - region "მართვა 9" [ref=e1230]:
            - generic [ref=e1231]:
              - heading "მართვა" [level=2] [ref=e1232]
              - generic [ref=e1235]: 2′
            - generic [ref=e1236]:
              - button "მაღლა, 2 რკალური წუთი" [ref=e1237] [cursor=pointer]:
                - generic [ref=e1238]: ↑
              - button "მარცხნივ, 2 რკალური წუთი" [ref=e1239] [cursor=pointer]:
                - generic [ref=e1240]: ←
              - button "მარჯვნივ, 2 რკალური წუთი" [ref=e1241] [cursor=pointer]:
                - generic [ref=e1242]: →
              - button "დაბლა, 2 რკალური წუთი" [ref=e1243] [cursor=pointer]:
                - generic [ref=e1244]: ↓
              - button "ცენტრირება" [ref=e1245] [cursor=pointer]
            - paragraph [ref=e1246]: "გადაღება მიუწვდომელია: ეს ობიექტი კატალოგში აღარ არის."
            - paragraph [ref=e1247]
        - generic [ref=e1248]:
          - generic [ref=e1249]:
            - button "გადაღება" [ref=e1250] [cursor=pointer]
            - button "გადაღება" [disabled] [ref=e1252]
          - region "სესია 1" [ref=e1255]:
            - heading "სესია" [level=2] [ref=e1257]
            - button "დასრულება" [ref=e1260] [cursor=pointer]
          - region "სესია 2" [ref=e1262]:
            - heading "სესია" [level=2] [ref=e1264]
            - group "დავასრულოთ დაკვირვება?" [ref=e1267]:
              - paragraph [ref=e1268]:
                - strong [ref=e1269]: დავასრულოთ დაკვირვება?
                - text: ტელესკოპი პარკირდება და დარჩენილი დრო არ ბრუნდება.
              - generic [ref=e1270]:
                - button "დასრულება" [ref=e1271] [cursor=pointer]
                - button "გაგრძელება" [ref=e1273] [cursor=pointer]
          - region "სესია 3" [ref=e1275]:
            - heading "სესია" [level=2] [ref=e1277]
            - group "დავასრულოთ დაკვირვება?" [ref=e1280]:
              - paragraph [ref=e1281]:
                - strong [ref=e1282]: დავასრულოთ დაკვირვება?
                - text: ტელესკოპი პარკირდება და დარჩენილი დრო არ ბრუნდება.
              - generic [ref=e1283]:
                - button "დასრულება" [disabled] [ref=e1284]
                - button "გაგრძელება" [disabled] [ref=e1287]
        - heading "MissionSteps — მიმდინარე ნაბიჯი, დასრულებული და შეცდომით შეჩერებული" [level=3] [ref=e1289]
        - generic [ref=e1290]:
          - region [ref=e1291]:
            - generic [ref=e1292]:
              - heading "მიმდინარეობა — მდებარეობა მოწმდება" [level=2] [ref=e1293]
              - generic [ref=e1296]: ნაბიჯი 3 5-დან
            - list [ref=e1297]:
              - listitem [ref=e1298]:
                - generic [ref=e1302]: მომზადება
              - listitem [ref=e1303]:
                - generic [ref=e1307]: მიმართვა
              - listitem [ref=e1308]:
                - generic [ref=e1309]: "03"
                - generic [ref=e1310]: ცენტრირება
                - generic [ref=e1311]: ახლა
              - listitem [ref=e1312]:
                - generic [ref=e1313]: "04"
                - generic [ref=e1314]: დაკვირვება
              - listitem [ref=e1315]:
                - generic [ref=e1316]: "05"
                - generic [ref=e1317]: გადაღება
          - region [ref=e1318]:
            - generic [ref=e1319]:
              - heading "მიმდინარეობა — დაკვირვება დასრულებულია" [level=2] [ref=e1320]
              - generic [ref=e1323]: ნაბიჯი 5 5-დან
            - list [ref=e1324]:
              - listitem [ref=e1325]:
                - generic [ref=e1329]: მომზადება
              - listitem [ref=e1330]:
                - generic [ref=e1334]: მიმართვა
              - listitem [ref=e1335]:
                - generic [ref=e1339]: ცენტრირება
              - listitem [ref=e1340]:
                - generic [ref=e1344]: დაკვირვება
              - listitem [ref=e1345]:
                - generic [ref=e1349]: გადაღება
          - region [ref=e1350]:
            - generic [ref=e1351]:
              - heading "მიმდინარეობა — ობსერვატორიის აპარატურის შეცდომა" [level=2] [ref=e1352]
              - generic [ref=e1355]: ნაბიჯი 2 5-დან
            - list [ref=e1356]:
              - listitem [ref=e1357]:
                - generic [ref=e1361]: მომზადება
              - listitem [ref=e1362]:
                - generic [ref=e1363]: "02"
                - generic [ref=e1364]: მიმართვა
                - generic [ref=e1365]: აქ შეჩერდა
              - listitem [ref=e1366]:
                - generic [ref=e1367]: "03"
                - generic [ref=e1368]: ცენტრირება
              - listitem [ref=e1369]:
                - generic [ref=e1370]: "04"
                - generic [ref=e1371]: დაკვირვება
              - listitem [ref=e1372]:
                - generic [ref=e1373]: "05"
                - generic [ref=e1374]: გადაღება
        - heading "PointingDial — მაღლა სამხრეთით, დაბლა დასავლეთით, ჰორიზონტს ქვემოთ, ტელესკოპი ობიექტისკენ მიიწევს, ტელესკოპი მდებარეობის გარეშე" [level=3] [ref=e1375]
        - generic [ref=e1376]:
          - 'img "ცის ციფერბლატი: ჰორიზონტი კიდეზეა, ზენიტი — ცენტრში, ჩრდილოეთი — ზემოთ." [ref=e1377]':
            - generic [ref=e1449]: ჩ
            - generic [ref=e1450]: ა
            - generic [ref=e1451]: ს
            - generic [ref=e1452]: დ
          - 'img "ცის ციფერბლატი: ჰორიზონტი კიდეზეა, ზენიტი — ცენტრში, ჩრდილოეთი — ზემოთ." [ref=e1458]':
            - generic [ref=e1530]: ჩ
            - generic [ref=e1531]: ა
            - generic [ref=e1532]: ს
            - generic [ref=e1533]: დ
          - 'img "ცის ციფერბლატი: ჰორიზონტი კიდეზეა, ზენიტი — ცენტრში, ჩრდილოეთი — ზემოთ." [ref=e1539]':
            - generic [ref=e1611]: ჩ
            - generic [ref=e1612]: ა
            - generic [ref=e1613]: ს
            - generic [ref=e1614]: დ
          - 'img "ცის ციფერბლატი: ჰორიზონტი კიდეზეა, ზენიტი — ცენტრში, ჩრდილოეთი — ზემოთ." [ref=e1616]':
            - generic [ref=e1688]: ჩ
            - generic [ref=e1689]: ა
            - generic [ref=e1690]: ს
            - generic [ref=e1691]: დ
          - 'img "ცის ციფერბლატი: ჰორიზონტი კიდეზეა, ზენიტი — ცენტრში, ჩრდილოეთი — ზემოთ." [ref=e1697]':
            - generic [ref=e1769]: ჩ
            - generic [ref=e1770]: ა
            - generic [ref=e1771]: ს
            - generic [ref=e1772]: დ
        - heading "TargetPreview — პლანეტის ილუსტრაცია და ობიექტი ილუსტრაციის გარეშე" [level=3] [ref=e1775]
        - generic [ref=e1776]:
          - 'figure "ილუსტრაცია — არა ტელესკოპის კადრი პირდაპირი ხედი აქ გაიხსნება, როცა ტელესკოპი ობიექტს მიაღწევს: Saturn." [ref=e1777]':
            - generic [ref=e1779]:
              - generic [ref=e1780]: ილუსტრაცია — არა ტელესკოპის კადრი
              - generic [ref=e1781]: "პირდაპირი ხედი აქ გაიხსნება, როცა ტელესკოპი ობიექტს მიაღწევს: Saturn."
          - 'figure "პირდაპირი ხედი აქ გაიხსნება, როცა ტელესკოპი ობიექტს მიაღწევს: M13." [ref=e1782]':
            - img "M13" [ref=e1784]
        - heading "LiveFeed — დაუწყებელი, იწყება, კავშირი მყარდება, პირდაპირი (სიმულირებული), კავშირი აღდგება, კავშირგარეშე, ამინდის გამო შეჩერებული, დრო ამოწურული, დახურული, უარყოფილი, შეცდომა" [level=3] [ref=e1794]
        - generic [ref=e1795]:
          - generic [ref=e1796]:
            - generic [ref=e1798]:
              - figure "ილუსტრაცია — არა ტელესკოპის კადრი" [ref=e1799]
              - generic:
                - paragraph:
                  - generic: თბილისის ობსერვატორია
                  - generic: ZWO ASI585MC · 1500 mm · f/10
                - paragraph:
                  - generic: სატურნი
            - generic [ref=e1804]:
              - status [ref=e1805]:
                - strong [ref=e1806]: ჯერ არ დაწყებულა
                - generic [ref=e1807]: შენი დრო 15 იანვარი, 2030, 22:00 GMT+4-ზე იწყება. დაკვირვებას მაშინ დაიწყებ.
              - button "დაიწყე დაკვირვება" [disabled] [ref=e1809]
          - generic [ref=e1811]:
            - generic [ref=e1813]:
              - figure "ილუსტრაცია — არა ტელესკოპის კადრი" [ref=e1814]
              - generic:
                - paragraph:
                  - generic: თბილისის ობსერვატორია
                  - generic: ZWO ASI585MC · 1500 mm · f/10
                - paragraph:
                  - generic: სატურნი
            - generic [ref=e1819]:
              - status [ref=e1820]:
                - strong [ref=e1821]: იწყება
                - generic [ref=e1822]: ობსერვატორიასთან შენი სესია იხსნება.
              - button "დაიწყე დაკვირვება" [disabled] [ref=e1824]
          - generic [ref=e1827]:
            - generic [ref=e1829]:
              - figure "ილუსტრაცია — არა ტელესკოპის კადრი" [ref=e1830]
              - generic:
                - paragraph:
                  - generic: თბილისის ობსერვატორია
                  - generic: ZWO ASI585MC · 1500 mm · f/10
                - paragraph:
                  - generic: სატურნი
                - paragraph:
                  - text: დარჩენილი დრო
                  - time: 24:00
            - status [ref=e1836]:
              - strong [ref=e1837]: კავშირი მყარდება
              - generic [ref=e1838]: ველოდებით კამერის პირველ კადრს.
          - generic [ref=e1839]:
            - generic [ref=e1841]:
              - generic [ref=e1842]:
                - 'img "სიმულირებული პირდაპირი ხედი: Saturn" [ref=e1843]'
                - generic [ref=e1844]: სიმულირებული
              - generic:
                - paragraph:
                  - generic: თბილისის ობსერვატორია
                  - generic: ZWO ASI585MC · 1500 mm · f/10
                - paragraph:
                  - generic: სატურნი
                - paragraph:
                  - text: დარჩენილი დრო
                  - time: 24:00
            - status [ref=e1848]:
              - strong [ref=e1849]: პირდაპირი ხედი
              - generic [ref=e1850]: სიმულატორის გამოსახულება და არა ტელესკოპის კადრი.
          - generic [ref=e1851]:
            - generic [ref=e1853]:
              - figure "ილუსტრაცია — არა ტელესკოპის კადრი" [ref=e1854]
              - generic:
                - paragraph:
                  - generic: თბილისის ობსერვატორია
                  - generic: ZWO ASI585MC · 1500 mm · f/10
                - paragraph:
                  - generic: სატურნი
                - paragraph:
                  - text: დარჩენილი დრო
                  - time: 24:00
            - status [ref=e1860]:
              - strong [ref=e1861]: კავშირი აღდგება
              - generic [ref=e1862]: ობსერვატორიასთან კავშირი გაწყდა. ვცდილობთ თავიდან.
          - generic [ref=e1863]:
            - generic [ref=e1865]:
              - figure "ილუსტრაცია — არა ტელესკოპის კადრი" [ref=e1866]
              - generic:
                - paragraph:
                  - generic: თბილისის ობსერვატორია
                  - generic: ZWO ASI585MC · 1500 mm · f/10
                - paragraph:
                  - generic: სატურნი
            - status [ref=e1872]:
              - strong [ref=e1873]: ობსერვატორია კავშირგარეშეა
              - generic [ref=e1874]: ობსერვატორია არ არის დაკავშირებული. პირდაპირი ხედი კავშირის აღდგენისთანავე დაბრუნდება.
          - generic [ref=e1875]:
            - generic [ref=e1877]:
              - figure "ილუსტრაცია — არა ტელესკოპის კადრი" [ref=e1878]
              - generic:
                - paragraph:
                  - generic: თბილისის ობსერვატორია
                  - generic: ZWO ASI585MC · 1500 mm · f/10
                - paragraph:
                  - generic: სატურნი
            - status [ref=e1884]:
              - strong [ref=e1885]: მისია ამინდის გამო შეჩერდა
              - generic [ref=e1886]: ცა დაკვირვებისთვის უსაფრთხო არ არის. მისია გამოდარებას ელოდება.
          - generic [ref=e1887]:
            - generic [ref=e1889]:
              - figure "ილუსტრაცია — არა ტელესკოპის კადრი" [ref=e1890]
              - generic:
                - paragraph:
                  - generic: თბილისის ობსერვატორია
                  - generic: ZWO ASI585MC · 1500 mm · f/10
                - paragraph:
                  - generic: სატურნი
            - status [ref=e1896]:
              - strong [ref=e1897]: დრო ამოიწურა
              - generic [ref=e1898]: შენი დაკვირვების სესია დასრულდა. კადრები შენს კოლექციაში რჩება.
          - generic [ref=e1899]:
            - generic [ref=e1901]:
              - figure "ილუსტრაცია — არა ტელესკოპის კადრი" [ref=e1902]
              - generic:
                - paragraph:
                  - generic: თბილისის ობსერვატორია
                  - generic: ZWO ASI585MC · 1500 mm · f/10
                - paragraph:
                  - generic: სატურნი
            - status [ref=e1908]:
              - strong [ref=e1909]: პირდაპირი ხედი დაიხურა
              - generic [ref=e1910]: ამ მისიის პირდაპირი ხედი დაიხურა.
          - generic [ref=e1911]:
            - generic [ref=e1913]:
              - figure "ილუსტრაცია — არა ტელესკოპის კადრი" [ref=e1914]
              - generic:
                - paragraph:
                  - generic: თბილისის ობსერვატორია
                  - generic: ZWO ASI585MC · 1500 mm · f/10
                - paragraph:
                  - generic: სატურნი
            - generic [ref=e1919]:
              - status [ref=e1920]:
                - strong [ref=e1921]: დაკვირვება შეწყდა
                - generic [ref=e1922]: ტელესკოპი უსაფრთხოდაა. აქამდე გადაღებული კადრები კოლექციაში რჩება.
              - generic [ref=e1923]:
                - link "ჯავშნის ნახვა" [ref=e1924] [cursor=pointer]:
                  - /url: /ka/app/bookings
                - link "დაჯავშნე სხვა ღამე" [ref=e1926] [cursor=pointer]:
                  - /url: /ka/app/book
          - generic [ref=e1928]:
            - generic [ref=e1930]:
              - figure "ილუსტრაცია — არა ტელესკოპის კადრი" [ref=e1931]
              - generic:
                - paragraph:
                  - generic: თბილისის ობსერვატორია
                  - generic: ZWO ASI585MC · 1500 mm · f/10
                - paragraph:
                  - generic: სატურნი
            - generic [ref=e1936]:
              - alert [ref=e1937]:
                - strong [ref=e1938]: პირდაპირი ხედი ვერ გაიხსნა
                - generic [ref=e1939]: ობსერვატორიის უსაფრთხოების შემოწმებამ ობიექტი ამ წუთას უარყო. სცადე რამდენიმე წუთში.
              - button "სცადე თავიდან" [ref=e1941] [cursor=pointer]
          - generic [ref=e1943]:
            - generic [ref=e1945]:
              - figure "ილუსტრაცია — არა ტელესკოპის კადრი" [ref=e1946]
              - generic:
                - paragraph:
                  - generic: თბილისის ობსერვატორია
                  - generic: ZWO ASI585MC · 1500 mm · f/10
                - paragraph:
                  - generic: სატურნი
            - generic [ref=e1951]:
              - alert [ref=e1952]:
                - strong [ref=e1953]: რაღაც შეფერხდა
                - generic [ref=e1954]: ჩვენმა სერვერებმა არ უპასუხეს. სცადე ცოტა ხანში.
              - button "სცადე თავიდან" [ref=e1956] [cursor=pointer]
      - region [ref=e1958]:
        - generic [ref=e1959]:
          - generic [ref=e1960]: "07"
          - generic [ref=e1961]:
            - heading "ზედდებული ფენები" [level=2] [ref=e1962]
            - paragraph [ref=e1963]: მოდალი, გვერდითი პანელი, ჩამონათვალი და მინიშნება.
            - paragraph [ref=e1964]: Brand Identity System v2.0 · §08 Surface mapping · §09 What Stellar must never be, 04
        - generic [ref=e1966]:
          - button "მოდალის გახსნა" [ref=e1967] [cursor=pointer]
          - button "პანელის გახსნა" [ref=e1969] [cursor=pointer]
          - generic [ref=e1971]:
            - generic [ref=e1972]: დაკვირვების რეჟიმი
            - generic [ref=e1973]:
              - combobox "დაკვირვების რეჟიმი" [ref=e1974] [cursor=pointer]:
                - option "მართვადი მისია" [selected]
                - option "დაგეგმილი მისია"
                - option "პირადი ობსერვატორია"
              - generic: ⌄
          - generic [ref=e1975]:
            - generic "ინფორმაცია კოორდინატებზე" [ref=e1976]: J2000
            - tooltip "კოორდინატები იყენებს J2000 ეპოქას"
      - region [ref=e1977]:
        - generic [ref=e1978]:
          - generic [ref=e1979]: "08"
          - generic [ref=e1980]:
            - heading "ტაბები" [level=2] [ref=e1981]
            - paragraph [ref=e1982]: კლავიატურით მართვადი კომპაქტური ნავიგაცია.
            - paragraph [ref=e1983]: Brand Identity System v2.0 · §08 Surface mapping · §04 The 90 / 8 / 2 rule
        - generic [ref=e1984]:
          - tablist "ობიექტის მონაცემები" [ref=e1985]:
            - tab "მიმოხილვა" [selected] [ref=e1986] [cursor=pointer]
            - tab "ხილვადობა" [ref=e1987] [cursor=pointer]
            - tab "აღჭურვილობა" [ref=e1988] [cursor=pointer]
          - tabpanel "მიმოხილვა" [ref=e1989]: სამეცნიერო კონტექსტი და დაკვირვების მოკლე აღწერა.
      - region [ref=e1990]:
        - generic [ref=e1991]:
          - generic [ref=e1992]: "09"
          - generic [ref=e1993]:
            - heading "ჩატვირთვა და აღდგენა" [level=2] [ref=e1994]
            - paragraph [ref=e1995]: ჩატვირთვის, ცარიელი და შეცდომის მდგომარეობები.
            - paragraph [ref=e1996]: Brand Identity System v2.0 · §02 Tone of voice · §04 Semantic colors
        - generic [ref=e1997]:
          - status "პრევიუს ჩატვირთვა" [ref=e1998]
          - status [ref=e2005]:
            - generic [ref=e2006]: ○
            - heading "სურათები ჯერ არ არის" [level=3] [ref=e2007]
            - paragraph [ref=e2008]: დასრულებული მისიების დროს გადაღებული სურათები აქ გამოჩნდება.
            - button "ობიექტების ნახვა" [ref=e2010] [cursor=pointer]
          - alert [ref=e2012]:
            - generic [ref=e2013]: "!"
            - heading "ობსერვატორიის სტატუსი მიუწვდომელია" [level=3] [ref=e2014]
            - paragraph [ref=e2015]: ბოლო დადასტურებული მდგომარეობა ინახება კავშირის აღდგენამდე.
            - button "სცადე თავიდან" [ref=e2017] [cursor=pointer]
      - region [ref=e2019]:
        - generic [ref=e2020]:
          - generic [ref=e2021]: "10"
          - generic [ref=e2022]:
            - heading "ფორმები" [level=2] [ref=e2023]
            - paragraph [ref=e2024]: გასაგები ეტიკეტები, მინიშნებები და ვალიდაცია.
            - paragraph [ref=e2025]: Brand Identity System v2.0 · §08 Surface mapping · §05 Typography (16px UI minimum)
        - generic [ref=e2027]:
          - heading "მისიის მოთხოვნა" [level=3] [ref=e2028]
          - generic [ref=e2029]:
            - generic [ref=e2030]: ობიექტის სახელი
            - textbox "ობიექტის სახელი" [ref=e2032]:
              - /placeholder: მესიეს ან გავრცელებული სახელი
            - paragraph [ref=e2033]: ძიება იყენებს კატალოგურ და გავრცელებულ სახელებს.
          - generic [ref=e2034]:
            - generic [ref=e2035]: დაკვირვების შენიშვნები
            - textbox "დაკვირვების შენიშვნები" [ref=e2037]:
              - /placeholder: ამ მისიის დამატებითი შენიშვნები
          - generic [ref=e2038]:
            - generic [ref=e2039]: შეტყობინების ელფოსტა
            - textbox "შეტყობინების ელფოსტა" [invalid] [ref=e2041]: observer@
            - paragraph [ref=e2042]: შეიყვანე სწორი ელფოსტის მისამართი.
          - generic [ref=e2043] [cursor=pointer]:
            - checkbox "შემატყობინე დაკვირვების დაწყებისას" [checked] [ref=e2044]
            - generic [ref=e2046]: შემატყობინე დაკვირვების დაწყებისას
          - button "მოთხოვნის შემოწმება" [ref=e2047] [cursor=pointer]
        - generic [ref=e2049]:
          - heading "პაროლი" [level=3] [ref=e2050]
          - status [ref=e2051]: პაროლი შეიცვალა. ყველა სხვა მოწყობილობაზე სესია დასრულდა.
          - alert [ref=e2052]: ანგარიშის ცვლილება ახლა მიუწვდომელია. მოგვიანებით სცადე.
          - button "პაროლის შეცვლა" [disabled] [ref=e2053]
      - region [ref=e2056]:
        - generic [ref=e2057]:
          - generic [ref=e2058]: "11"
          - generic [ref=e2059]:
            - heading "ცა" [level=2] [ref=e2060]
            - paragraph [ref=e2061]: "მთავარი გვერდის პირველი ეკრანი: Skychaser-ის ცა, სადაც კურსორი ჩვენს დახატულ ფირფიტებს პოულობს, ილუსტრაციის წარწერით; სათაურის ბოლო სიტყვები წითლად, ერთი მთავარი ღილაკი."
            - paragraph [ref=e2062]: Brand Identity System v2.0 · as amended by ADR-052 — the homepage
        - region "შენი დრო ნამდვილ ცასთან." [ref=e2064]:
          - generic [ref=e2065] [cursor=pointer]:
            - img "ღამის ცა. გადაატარე კურსორი ან შეეხე, რომ იპოვო მასში დახატული პლანეტები. თითოეული ილუსტრაციაა და არა ტელესკოპის კადრი." [ref=e2067]
            - generic:
              - paragraph:
                - generic: გამოიკვლიე ცა
                - generic: ·
                - generic: ნაპოვნია
                - generic: "4"
                - generic: /
                - generic: "4"
              - paragraph: ილუსტრაცია — არა ტელესკოპის კადრი
          - generic:
            - heading "შენი დრო ნამდვილ ცასთან." [level=2]:
              - text: შენი დრო
              - emphasis: ნამდვილ ცასთან.
            - paragraph: ნამდვილი ტელესკოპი თბილისში ცას პირდაპირ გაჩვენებს. დაჯავშნე დაკვირვების დრო და ნახე კამერის ნამდვილი კადრი.
            - link "დაჯავშნე დრო" [ref=e2068] [cursor=pointer]:
              - /url: /ka/app/book
      - region [ref=e2070]:
        - generic [ref=e2071]:
          - generic [ref=e2072]: "12"
          - generic [ref=e2073]:
            - heading "მთავარი გვერდის სექციები" [level=2] [ref=e2074]
            - paragraph [ref=e2075]: როგორ მიმდინარეობს სესია — ოთხი ნაბიჯი თხელ ხაზებს შორის, თითოეული იმით, სად დგას დღეს, და ამაღამინდელი ობიექტები პლატფორმიდან, ხაზებით გაყოფილ რიგებად.
            - paragraph [ref=e2076]: Brand Identity System v2.0 · as amended by ADR-052 — the homepage
        - generic [ref=e2077]:
          - list [ref=e2078]:
            - listitem [ref=e2079]:
              - heading "დაჯავშნა" [level=3] [ref=e2085]
              - paragraph [ref=e2086]: აირჩიე ობიექტი დღევანდელი დაკვირვებადი ციდან და დაჯავშნე დრო.
              - generic [ref=e2087]: დღეს — სიმულაცია
            - listitem [ref=e2088]:
              - heading "მიბრუნება" [level=3] [ref=e2094]
              - paragraph [ref=e2095]: შენს დროზე ტელესკოპი თბილისში შენი ობიექტისკენ მიბრუნდება.
              - generic [ref=e2096]: დღეს — სიმულაცია
            - listitem [ref=e2097]:
              - heading "ყურება" [level=3] [ref=e2103]
              - paragraph [ref=e2104]: პირდაპირ უყურებ მის კამერას და ხედავ, როგორ იკრიბება მოკლე ექსპოზიციებიდან უფრო მკაფიო გამოსახულება.
              - generic [ref=e2105]: დღეს — სიმულაცია
            - listitem [ref=e2106]:
              - heading "შენახვა" [level=3] [ref=e2111]
              - paragraph [ref=e2112]: გადაიღე დაგროვილი კადრი და შეინახე შენს კოლექციაში.
              - generic [ref=e2113]: დღეს — სიმულაცია
          - list [ref=e2114]:
            - listitem [ref=e2115]:
              - generic [ref=e2116]: "01"
              - generic [ref=e2117]:
                - paragraph [ref=e2118]: პლანეტა
                - heading [level=3] [ref=e2119]:
                  - link "სატურნი" [ref=e2120] [cursor=pointer]:
                    - /url: /ka/app/missions/specimen-observable
              - generic [ref=e2121]: ახლა დაკვირვებადია
              - generic [ref=e2123]:
                - generic [ref=e2124]:
                  - term [ref=e2125]: მიმდინარე სიმაღლე
                  - definition [ref=e2126]: 38°
                - generic [ref=e2127]:
                  - term [ref=e2128]: დაკვირვების დრო
                  - definition [ref=e2129]: 19:10 – 05:40
              - generic [ref=e2130]: →
            - listitem [ref=e2131]:
              - generic [ref=e2132]: "02"
              - generic [ref=e2133]:
                - paragraph [ref=e2134]: პლანეტა
                - heading [level=3] [ref=e2135]:
                  - link "ვენერა" [ref=e2136] [cursor=pointer]:
                    - /url: /ka/app/missions/specimen-blocked
              - generic [ref=e2137]: ჰორიზონტს ქვემოთაა
              - generic [ref=e2139]:
                - generic [ref=e2140]:
                  - term [ref=e2141]: მიმდინარე სიმაღლე
                  - definition [ref=e2142]: "-12°"
                - generic [ref=e2143]:
                  - term [ref=e2144]: დაკვირვების დრო
                  - definition [ref=e2145]: 19:10 – 05:40
              - generic [ref=e2146]: →
      - region [ref=e2147]:
        - generic [ref=e2148]:
          - generic [ref=e2149]: "13"
          - generic [ref=e2150]:
            - heading "ობსერვატორიის სცენა" [level=2] [ref=e2151]
            - paragraph [ref=e2152]: "ობსერვატორიის გვერდის ნაწილები Skychaser-ის კონსოლის ფონზე: მდგომარეობა აბრად ხუთივე მნიშვნელობით (ონლაინ და მიმდინარე დაკვირვება მწვანედ ანათებს), ადგილობრივი საათი, კამერის კადრი მთვარეზე მასშტაბით და წარწერით, და გზების პანელი — მუქი მონოლითები კუთხის ნიშნებით."
            - paragraph [ref=e2153]: Brand Identity System v2.0 · as amended by ADR-052 — the observatory page
        - generic [ref=e2154]:
          - generic [ref=e2155]:
            - generic [ref=e2156]: ხაზზეა
            - generic [ref=e2158]: დაკვირვება მიმდინარეობს
            - generic [ref=e2160]: ამინდის გამო შეჩერებულია
            - generic [ref=e2162]: კავშირი შეფერხებულია
            - generic [ref=e2164]: ხაზგარეშეა
          - generic [ref=e2166]:
            - generic [ref=e2167]: Fri, Sep 25, 2026
            - time [ref=e2168]: 20:00
            - generic [ref=e2169]: ადგილობრივი დრო · თბილისი
          - figure "კამერის კადრი მთვარეზე, მასშტაბით" [ref=e2171]:
            - generic [ref=e2172]:
              - generic [ref=e2179]:
                - generic [ref=e2180]: 25,5′ × 14,4′
                - text: კამერის კადრი
              - generic [ref=e2181]:
                - generic [ref=e2182]: 31,1′
                - text: მთვარე, საშუალო ზომა
            - generic [ref=e2183]: ილუსტრაცია — არა ტელესკოპის გამოსახულება
          - navigation "როგორ დაიწყო" [ref=e2184]:
            - link "01 დაჯავშნე დრო დაჯავშნა" [ref=e2185] [cursor=pointer]:
              - /url: "#observatory-scene-title"
              - generic [ref=e2186]: "01"
              - generic [ref=e2187]: დაჯავშნე დრო
              - generic [ref=e2188]: დაჯავშნა →
            - link "02 უყურე პირდაპირ სესიას ყურება" [ref=e2189] [cursor=pointer]:
              - /url: "#observatory-scene-title"
              - generic [ref=e2190]: "02"
              - generic [ref=e2191]: უყურე პირდაპირ სესიას
              - generic [ref=e2192]: ყურება →
            - link "03 ნახე ამაღამ ხილული ობიექტები დათვალიერება" [ref=e2193] [cursor=pointer]:
              - /url: "#observatory-scene-title"
              - generic [ref=e2194]: "03"
              - generic [ref=e2195]: ნახე ამაღამ ხილული ობიექტები
              - generic [ref=e2196]: დათვალიერება →
  - generic [ref=e2201] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e2202]
    - generic [ref=e2206]:
      - button "Open issues overlay" [ref=e2207]:
        - generic [ref=e2208]:
          - generic [ref=e2209]: "0"
          - generic [ref=e2210]: "1"
        - generic [ref=e2211]: Issue
      - button "Collapse issues badge" [ref=e2212]
  - alert [ref=e2215]
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