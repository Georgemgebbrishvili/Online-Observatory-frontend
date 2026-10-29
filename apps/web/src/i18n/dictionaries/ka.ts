import type { Dictionary } from "../types";
import { brand } from "@/brand";

const dictionary = {
  metadata: {
    title: brand.en.siteName,
    description:
      "დაჯავშნე ნამდვილი ტელესკოპი საქართველოში და უყურე ცას პირდაპირ.",
  },
  navigation: {
    ariaLabel: "მთავარი ნავიგაცია",
    skip: "შინაარსზე გადასვლა",
    language: "ენა",
    languageName: "English",
    brandAriaLabel: `${brand.ka.nominative} — ${brand.ka.maker}`,
    public: {
      ariaLabel: "საჯარო ნავიგაცია",
      menu: "ნავიგაციის გახსნა",
      closeMenu: "ნავიგაციის დახურვა",
      book: "დაჯავშნა",
      observatory: "ობსერვატორია",
      pricing: "ფასები",
      explorer: brand.ka.game,
      signIn: "შესვლა",
      register: "ანგარიშის შექმნა",
      reserve: "დაჯავშნე სეანსი",
      account: "ანგარიში",
      overview: "მიმოხილვა",
    },
    app: {
      ariaLabel: "აპლიკაციის ნავიგაცია",
      home: "მთავარი",
      book: "დაჯავშნა",
      live: "პირდაპირი დაკვირვება",
      collection: "კოლექცია",
      profile: "პროფილი",
      cards: "კვირის ბარათები",
      bookings: "შენი ღამეები",
      subscription: "გამოწერა",
      loyalty: "ლოიალობა",
      passes: "დაკვირვების აბონემენტი",
      plannedGroup: "ჯერ მიუწვდომელია",
      previewDescription:
        "ეს გვერდი ჯერ მზადდება.",
      plannedDescription: "ეს ნაწილი ჯერ მზად არ არის. მალე აქვე ჩაირთვება.",
    },
  },
  home: {
    hero: {
      headline: "შენი დრო",
      sunset: "ნამდვილ ცასთან.",
      lede: "ნამდვილი ტელესკოპი საქართველოში. დაჯავშნე დრო და უყურე პირდაპირ.",
      cta: "დაჯავშნე სეანსი",
      plates: {
        saturn: "სატურნი",
        jupiter: "იუპიტერი",
        mars: "მარსი",
        venus: "ვენერა",
        "moon-terminator": "მთვარე",
        "m42-orion-nebula": "ორიონის ნისლეული",
        "m57-ring-nebula": "რგოლისებრი ნისლეული",
        "m27-dumbbell-nebula": "ჰანტელის ნისლეული",
        "m13-hercules-cluster": "ჰერკულესის გროვა",
        albireo: "ალბირეო",
        "mizar-alcor": "მიცარი და ალკორი",
      },
      kinds: {
        planet: "პლანეტა",
        moon: "ჩვენი მთვარე",
        nebula: "ნისლეული",
        planetaryNebula: "პლანეტარული ნისლეული",
        cluster: "ვარსკვლავთგროვა",
        double: "ორმაგი ვარსკვლავი",
      },
      sky: {
        label:
          "ღამის ცა. შეეხე და იპოვე დახატული პლანეტები, ნისლეულები და ვარსკვლავები. ყველა ნახატია და არა ტელესკოპის კადრი.",
        explore: "გამოიკვლიე ცა",
        tap: "შეეხე ცას",
        foundBefore: "ნაპოვნია",
        foundAfter: "",
        illustration: "ილუსტრაცია — არა ტელესკოპის გამოსახულება",
      },
    },
    common: {
      minutes: "წთ",
      window: "ხილვადობა",
      altitude: "სიმაღლე ახლა",
    },
    howItWorks: {
      eyebrow: "როგორ მუშაობს",
      title: "ოთხი ნაბიჯი ცამდე.",
      steps: [
        {
          title: "დაჯავშნე",
          description: "აირჩიე ღამე.",
        },
        {
          title: "დამიზნება",
          description: "ტელესკოპი ობიექტს მიუბრუნდება.",
        },
        {
          title: "უყურე",
          description: "უყურე პირდაპირ.",
        },
        {
          title: "შეინახე",
          description: "შეინახე ფოტო.",
        },
      ],
    },
    tonight: {
      kicker: "ამაღამ",
      title: "რას ხედავს ტელესკოპი",
      all: "ყველა ობიექტი",
      empty: "ამაღამ არაფერი ჩანს.",
      unavailable: "ცის მონაცემები ახლა მიუწვდომელია.",
    },
    live: {
      kicker: "ახლა",
      title: "ობსერვატორია",
      observing: "ახლა უყურებს: {name}",
      inProgress: "ახლა მიმდინარეობს სეანსი",
      watch: "უყურე",
      fullStatus: "სტატუსი",
      unavailable: "სტატუსი ახლა მიუწვდომელია.",
    },
    more: {
      book: {
        kicker: "დაჯავშნა",
        title: "სამი ნაბიჯი ტელესკოპამდე",
        steps: [
          {
            title: "აირჩიე ღამე",
            text: "შვიდ ღამემდე წინასწარ.",
          },
          {
            title: "აირჩიე დრო",
            text: "15 წუთიდან 4 საათამდე.",
          },
          {
            title: "დაჯავშნე",
            text: "ღრუბლებმა ხელი შეგიშალა? სხვა სეანსს უფასოდ მიიღებ.",
          },
        ],
        lengths: "ნებისმიერი ხანგრძლივობა, ერთი ფასი",
        perMinute: "{price} წუთში",
        cta: "დაჯავშნე სეანსი",
      },
      ways: {
        kicker: "მეტი",
        title: "კიდევ",
        items: [
          { title: "კვირის კენჭისყრა", text: "აირჩიე კვირის ობიექტი.", href: "vote" },
          { title: "აჩუქე ღამე", text: "აჩუქე ღამე ტელესკოპთან.", href: "gift" },
          {
            title: brand.ka.game,
            text: "იმოგზაურე მზის სისტემაში.",
            href: "explorer",
          },
          {
            title: "კვირის ბარათები",
            text: "ყოველ კვირა უფასო ბარათი. მოიგე სეანსი ან ფასდაკლება.",
            href: "app/cards",
          },
        ],
      },
      faq: {
        kicker: "კითხვები",
        title: "ხშირი კითხვები",
        items: [
          {
            q: "მჭირდება ტელესკოპი ან აპლიკაცია?",
            a: "არა. ყველაფერი ბრაუზერში მუშაობს.",
          },
          {
            q: "რა ხდება, თუ მოღრუბლულია?",
            a: "თუ ამინდი სეანსს შეაჩერებს, სხვა ღამეს უფასოდ აირჩევ.",
          },
          {
            q: "რამდენ ხანს გრძელდება სეანსი?",
            a: "15 წუთიდან 4 საათამდე.",
          },
          {
            q: "შემიძლია თავად ავირჩიო, რას ვუყურო?",
            a: "კი. ან ჩვენ ავირჩევთ საუკეთესოს.",
          },
        ],
      },
      closer: {
        title: "ცა ღიაა",
        sunset: "ამაღამ.",
        lede: "ნამდვილი ტელესკოპი, რამდენიმე შეხებაში.",
        cta: "დაჯავშნე სეანსი",
        secondary: "ნახე ობსერვატორია",
      },
    },
  },
  footer: {
    brandAriaLabel: `${brand.ka.nominative} — ${brand.ka.maker}`,
    brandEndorsement: brand.ka.endorsement,
    georgianLanguage: "ქართული",
    englishLanguage: "English",
    statement: "ერთი ნამდვილი ტელესკოპი საქართველოში.",
    product: "პროდუქტი",
    legal: "სამართლებრივი",
    language: "ენა",
    book: "დაჯავშნა",
    pricing: "ფასები",
    collection: "კოლექცია",
    observatory: "ობსერვატორია",
    status: "სტატუსი",
    privacy: "კონფიდენციალურობა",
    terms: "პირობები",
    refunds: "თანხის დაბრუნება",
  },
  notFound: {
    title: "დაკვირვება ვერ მოიძებნა",
    description:
      "ბმული არასწორია ან გვერდი გადატანილია.",
    action: `${brand.ka.on} დაბრუნება`,
  },
} satisfies Dictionary;

export default dictionary;
