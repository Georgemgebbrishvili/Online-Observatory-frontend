# Darkview Georgian terminology

This document is the review source for Georgian product and astronomy language. It separates approved interface wording from specialist terms that still need confirmation by a Georgian-speaking astronomer.

## Product language

| English               | Georgian                  | Usage note                                                                                                         |
| --------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Home                  | მთავარი                   | Primary navigation                                                                                                 |
| Missions              | მისიები                   | Primary navigation                                                                                                 |
| Live                  | პირდაპირი დაკვირვება      | Prefer over „პირდაპირი ეთერი“ because the product is an observation, not a broadcast channel                       |
| Collection            | კოლექცია                  | Primary navigation                                                                                                 |
| Observatory           | ობსერვატორია              | Primary navigation                                                                                                 |
| Tonight’s Sky         | დღევანდელი ცა             | Natural discovery context; use „დღეს ღამით“ only for a specific time statement                                     |
| Start Mission         | დაიწყე მისია              | Primary CTA                                                                                                        |
| Schedule Mission      | დაგეგმე მისია             | Secondary CTA                                                                                                      |
| Capture (action)      | გადაიღე                   | Primary camera CTA                                                                                                 |
| Capture (noun)        | კადრი                     | A saved observation asset                                                                                          |
| Target Locked         | ობიექტი დაფიქსირდა        | Consumer mission state; avoids a literal translation of “locked”                                                   |
| Live observation      | პირდაპირი დაკვირვება      | Preferred product term                                                                                             |
| Simulated observatory | სიმულირებული ობსერვატორია | The English all-caps safety label `SIMULATED OBSERVATORY` remains unchanged in the simulator so it is unmistakable |

## Approved astronomy terms

| English             | Georgian                    | Usage note                                                                                    |
| ------------------- | --------------------------- | --------------------------------------------------------------------------------------------- |
| astronomy           | ასტრონომია                  | Standard term                                                                                 |
| observation         | დაკვირვება                  | Standard term                                                                                 |
| astronomical object | ასტრონომიული ობიექტი        | Use „ობიექტი“ in consumer copy when context is clear                                          |
| target              | სამიზნე                     | Suitable for internal/technical mission language; prefer „ობიექტი“ in primary consumer states |
| telescope           | ტელესკოპი                   | Standard term                                                                                 |
| observatory         | ობსერვატორია                | Standard term                                                                                 |
| planet              | პლანეტა                     | Standard term                                                                                 |
| Moon                | მთვარე                      | Proper object name                                                                            |
| natural satellite   | ბუნებრივი თანამგზავრი       | Standard term                                                                                 |
| galaxy              | გალაქტიკა                   | Standard term                                                                                 |
| nebula              | ნისლეული                    | Standard term                                                                                 |
| planetary nebula    | პლანეტარული ნისლეული        | Standard term                                                                                 |
| star                | ვარსკვლავი                  | Standard term                                                                                 |
| star cluster        | ვარსკვლავური გროვა          | Use „გროვა“ in compact filters                                                                |
| globular cluster    | სფერული ვარსკვლავური გროვა  | Compact UI may use „სფერული გროვა“                                                            |
| constellation       | თანავარსკვლავედი            | Standard term                                                                                 |
| horizon             | ჰორიზონტი                   | Standard term                                                                                 |
| altitude            | სიმაღლე                     | Astronomical context supplies the meaning; avoid the unnatural calque „ალტიტუდა“              |
| visibility          | ხილვადობა                   | Standard term                                                                                 |
| coordinates         | კოორდინატები                | Standard term                                                                                 |
| angular size        | კუთხური ზომა                | Standard term                                                                                 |
| apparent magnitude  | ხილული ვარსკვლავიერი სიდიდე | Use only inside advanced technical information                                                |
| aperture            | აპერტურა                    | Established optical term                                                                      |
| focal length        | ფოკუსური მანძილი            | Established optical term                                                                      |
| exposure            | ექსპოზიცია                  | Established photography/astronomy term                                                        |
| camera              | კამერა                      | Standard term                                                                                 |
| optics              | ოპტიკა                      | Standard term                                                                                 |

## Human review required

These terms are deliberately not normalized as definitive Georgian astronomy terminology yet.

| English                | Current UI approach                                                           | Question for reviewer                                                                      |
| ---------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| right ascension (RA)   | Keep `RA` in the collapsed technical section                                  | Confirm whether „პირდაპირი აღვლენა“ is the preferred contemporary Georgian scientific term |
| declination (Dec)      | Keep `Dec` in the collapsed technical section                                 | Confirm whether „დახრილობა“ is sufficiently precise in this context                        |
| plate solving          | Describe as „საცნობარო კადრის ღამის ცის რუკასთან შედარება“                    | Confirm a recognized concise Georgian technical term, if one is used professionally        |
| slew / slewing         | Consumer wording: „ტელესკოპი ობიექტისკენ მოძრაობს“                            | Confirm the specialist term used by Georgian observatories                                 |
| telescope mount        | Consumer wording: „ტელესკოპის სამაგრი“; equipment label currently „მონტირება“ | Confirm the preferred hardware noun                                                        |
| alt-azimuth            | „ალტ-აზიმუტური“                                                               | Confirm spelling and hyphenation                                                           |
| Schmidt–Cassegrain     | „შმიდტ-კასეგრენი“                                                             | Confirm transliteration and dash convention                                                |
| lunar terminator       | „მთვარის ტერმინატორი“                                                         | Confirm whether a Georgian descriptive alternative is preferred                            |
| FITS                   | Keep the international acronym `FITS`                                         | Approve the Georgian explanatory phrase before the feature ships                           |
| calibration / stacking | Current consumer wording describes frames being calibrated and combined       | Confirm specialist nouns before exposing advanced processing controls                      |

## Voice and typography

- Use short, direct verbs for primary actions: „დაიწყე“, „გადაიღე“, „ნახე“.
- Use neutral explanatory sentences instead of translating English idioms word for word.
- Use Georgian quotation marks only in editorial prose; interface labels do not need quotation marks.
- Do not add artificial letter spacing to Georgian headings. Georgian pages use Noto Sans Georgian with a slightly more open line height than Latin pages.
- Preserve international catalog identifiers and units (`M31`, `RA`, `Dec`, `mm`, `FITS`) unchanged.
