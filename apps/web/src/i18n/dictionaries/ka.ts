import type { Dictionary } from "../types";
import { brand } from "@/brand";

const dictionary = {
  metadata: {
    title: brand.en.siteName,
    description: "დაჯავშნე ნამდვილი ტელესკოპი და უყურე ცას პირდაპირ.",
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
      sky: "ღამის ცა",
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
      loyalty: "კლუბი",
      passes: "დაკვირვების აბონემენტი",
      plannedGroup: "ჯერ მიუწვდომელია",
      previewDescription: "ეს გვერდი ჯერ მზადდება.",
      plannedDescription: "მალე დაემატება.",
    },
  },
  home: {
    hero: {
      kicker: "ონლაინ ობსერვატორია",
      headline: "შენი დრო",
      sunset: "ნამდვილ ცასთან.",
      lede: "დაჯავშნე ნამდვილი ტელესკოპი. უყურე ცას პირდაპირ.",
      cta: "დაჯავშნე სეანსი",
      watch: "უყურე პირდაპირ",
      illustration: "ილუსტრაცია — არა ტელესკოპის გამოსახულება",
      moonCredit: "მთვარე: NASA/GSFC/Arizona State University",
      specs: ["203 მმ ტელესკოპი", "ფერადი ასტროკამერა", "პირდაპირი გამოსახულება ბრაუზერში"],
      panels: {
        tonight: "ამაღამ",
        noTimes: "ამაღამ თავისუფალი დრო არ არის",
        upTonight: "ამაღამ ცაზე: {count}",
        perMinute: "წუთში",
      },
    },
    common: {
      minutes: "წთ",
      window: "ხილვადობა",
      altitude: "სიმაღლე ახლა",
    },
    howItWorks: {
      title: "როგორ მუშაობს",
      steps: [
        { title: "დაჯავშნე", description: "აირჩიე ღამე და დრო." },
        { title: "დაუმიზნე", description: "ტელესკოპი შენი ობიექტისკენ შემობრუნდება." },
        { title: "უყურე", description: "ნახე პირდაპირ ეთერში, ბრაუზერიდან." },
        { title: "შეინახე", description: "გადაღებული კადრები შენთან რჩება." },
      ],
    },
    tonight: { title: "ამაღამ" },
    instrument: {
      kicker: "ინსტრუმენტი",
      title: "ნამდვილი ოპტიკა. ნამდვილი სინათლე.",
      lede: "8-დიუმიანი შმიდტ-კასეგრენი კომპიუტერიზებულ მონტირებაზე და ფერადი ასტროკამერა. მოკლე კადრები შენს თვალწინ გროვდება.",
      figures: [
        { value: "203", unit: "მმ", label: "აპერტურა" },
        { value: "2032", unit: "მმ", label: "ფოკუსური მანძილი · f/10" },
        { value: "3", unit: "", label: "ოპტიკის ვარიანტი, f/6.3-დან f/20-მდე" },
        { value: "8.3", unit: "მპ", label: "ფერადი კამერა, ყოველი კადრი ფერადია" },
      ],
      safety: {
        title: "ორჯერ შემოწმებული",
        text: "ყოველი ბრძანება მოწმდება ღრუბელში და კიდევ ერთხელ — ტელესკოპთან.",
      },
      diagram: "სქემა — როგორ გადის სინათლე ტელესკოპში",
    },
    closing: {
      title: "ამაღამ ცა შენია.",
      lede: "აირჩიე დრო და ობიექტი — და უყურე, როგორ შემობრუნდება ნამდვილი ტელესკოპი.",
      gift: "აჩუქე ღამე",
    },
    more: {
      price: {
        title: "გადაიხადე წუთობრივად",
        cloud: "ღრუბლებმა ხელი შეგიშალა? შემდეგი სეანსი უფასოა.",
      },
      faq: {
        title: "ხშირი კითხვები",
        items: [
          {
            q: "მჭირდება ტელესკოპი ან აპლიკაცია?",
            a: "არა. ყველაფერი ბრაუზერში მუშაობს.",
          },
          {
            q: "რა ხდება, თუ ცა მოღრუბლულია?",
            a: "სხვა ღამეს უფასოდ დაჯავშნი.",
          },
          { q: "რამდენ ხანს გრძელდება სეანსი?", a: "15 წუთიდან 4 საათამდე." },
          {
            q: "შემიძლია თავად ავირჩიო ობიექტი?",
            a: "დიახ, ან ჩვენ შეგირჩევთ საუკეთესოს.",
          },
        ],
      },
    },
  },
  footer: {
    brandAriaLabel: `${brand.ka.nominative} — ${brand.ka.maker}`,
    brandEndorsement: brand.ka.endorsement,
    georgianLanguage: "ქართული",
    englishLanguage: "English",
    statement: "ნამდვილი ტელესკოპი, პირდაპირ.",
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
    gift: "აჩუქე ღამე",
    vote: "კვირის კენჭისყრა",
    cards: "კვირის ბარათები",
  },
  notFound: {
    title: "გვერდი ვერ მოიძებნა",
    description: "ბმული არასწორია ან გვერდი გადატანილია.",
    action: `${brand.ka.on} დაბრუნება`,
  },
} satisfies Dictionary;

export default dictionary;
