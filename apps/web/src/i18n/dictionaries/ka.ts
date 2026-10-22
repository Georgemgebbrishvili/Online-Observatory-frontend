import type { Dictionary } from "../types";
import { brand } from "@/brand";

const dictionary = {
  metadata: {
    title: brand.en.siteName,
    description:
      "დაჯავშნე დრო ნამდვილ ტელესკოპზე საქართველოში, უყურე, რას ხედავს, და შეინახე, რასაც გადაიღებ.",
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
        "ეს გვერდი განლაგების პრევიუა. ფუნქციური შინაარსი ცალკე დაემატება.",
      plannedDescription: `${brand.ka.genitive} ეს ნაწილი ჯერ არ აშენებულა. აქ იმიტომ ჩანს, რომ ნახო, რა მოდის — და როცა მზად იქნება, სწორედ ამ გვერდიდან იმუშავებს.`,
    },
  },
  home: {
    hero: {
      headline: "შენი დრო",
      sunset: "ნამდვილ ცასთან.",
      lede: "ნამდვილი ტელესკოპი საქართველოში. დაჯავშნე სეანსი და უყურე მისი კამერის გამოსახულებას.",
      cta: "დაჯავშნე სეანსი",
      plates: { saturn: "სატურნი", jupiter: "იუპიტერი", mars: "მარსი", venus: "ვენერა" },
      sky: {
        label:
          "ღამის ცა. გადაატარე კურსორი ან შეეხე, რომ იპოვო მასში დახატული პლანეტები. თითოეული ილუსტრაციაა და არა ტელესკოპის გამოსახულება.",
        explore: "გამოიკვლიე ცა",
        tap: "შეეხე ცას",
        foundBefore: "ნაპოვნია",
        foundAfter: "",
        illustration: "ილუსტრაცია — არა ტელესკოპის გამოსახულება",
      },
    },
    common: {
      minutes: "წთ",
      window: "ხილვადობის დრო",
      altitude: "მიმდინარე სიმაღლე",
    },
    howItWorks: {
      eyebrow: `როგორ მუშაობს ${brand.ka.nominative}`,
      title: "ოთხი ნაბიჯი. ერთი რეალური დაკვირვება.",
      description: `${brand.ka.nominative} ნამდვილ ტელესკოპთან გატარებულ დროს ერთ გასაგებ მისიად აქცევს — სეანსის დაჯავშნიდან კადრის შენახვამდე.`,
      steps: [
        {
          title: "დაჯავშნა",
          description: "აირჩიე ღამე და დრო.",
          action: "დაჯავშნე სეანსი",
        },
        {
          title: "მობრუნება",
          description: "ტელესკოპი შენი ობიექტისკენ მობრუნდება.",
          action: "ობსერვატორია",
        },
        {
          title: "ყურება",
          description: "უყურე მის კამერას, სანამ გამოსახულება იკვეთება.",
        },
        {
          title: "შენახვა",
          description: "შეინახე კადრი შენს კოლექციაში.",
          action: "კოლექცია",
        },
      ],
    },
    tonight: {
      eyebrow: "ამაღამინდელი ცა",
      title: "აირჩიე, რას დაინახავს ტელესკოპი შემდეგ.",
      description: "რას ხედავს ობსერვატორია ამაღამ და რატომ ვერ ხედავს დანარჩენს.",
      all: "ამაღამინდელი ყველა ობიექტი",
    },
    instrument: {
      eyebrow: "ინსტრუმენტი",
      title: "ერთი ნამდვილი ტელესკოპი, საქართველოში.",
      description:
        "მას მხოლოდ ობსერვატორიის საკუთარი პროგრამა მართავს — ბრაუზერიდან პირდაპირ არასდროს. რასაც ხედავ, იმას ხედავს მისი კამერა.",
      aperture: "აპერტურა",
      focalLength: "ფოკუსური მანძილი",
      focalRatio: "ფარდობითი ხვრელი",
      camera: "კამერა",
      cameraValue: "ZWO ASI585MC",
      mode: "რეჟიმი",
      modeValue: "პირდაპირი გამოსახულება",
      location: "მდებარეობა",
      locationValue: "საქართველო",
      millimetres: "მმ",
    },
    finalCta: {
      eyebrow: "დაიწყე ამაღამ",
      title: "შენი შემდეგი დაკვირვება აქ იწყება.",
      description: `აირჩიე დაკვირვებადი ობიექტი და დაგეგმე შენი პირველი დაკვირვება ${brand.ka.on}.`,
      action: "დაჯავშნე სეანსი",
      secondary: "ამაღამინდელი ცის ნახვა",
      privateTitle: "კერძო სეანსები",
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
      "ამ მისამართზე არაფერია. შესაძლოა, გადატანილია, ან ბმული შეცდომით აიკრიფა.",
    action: `${brand.ka.on} დაბრუნება`,
  },
} satisfies Dictionary;

export default dictionary;
