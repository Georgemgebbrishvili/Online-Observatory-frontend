import type { Dictionary } from "../types";
import { brand } from "@/brand";

const dictionary = {
  metadata: {
    title: brand.en.siteName,
    description:
      "დაუკავშირდით რეალურ ობსერვატორიებს, გაუშვით ასტრონომიული მისიები და გადაიღეთ ღამის ცის საკუთარი სურათები.",
  },
  navigation: {
    ariaLabel: "მთავარი ნავიგაცია",
    skip: "შინაარსზე გადასვლა",
    language: "ენა",
    languageName: "English",
    brandAriaLabel: `${brand.ka.nominative} — ${brand.ka.maker}`,
    brandEndorsement: brand.ka.endorsement,
    public: {
      ariaLabel: "საჯარო ნავიგაცია",
      menu: "ნავიგაციის გახსნა",
      closeMenu: "ნავიგაციის დახურვა",
      explore: "აღმოჩენა",
      live: "პირდაპირი დაკვირვება",
      observatory: "ობსერვატორია",
      pricing: "ფასები",
      about: "ჩვენ შესახებ",
      signIn: "შესვლა",
      startExploring: "აღმოჩენის დაწყება",
    },
    app: {
      ariaLabel: "აპლიკაციის ნავიგაცია",
      sidebarAriaLabel: "ანგარიში და ობსერვატორია",
      brandAriaLabel: `${brand.ka.nominative} — ${brand.ka.maker}`,
      brandEndorsement: brand.ka.endorsement,
      home: "მთავარი",
      missions: "მისიები",
      live: "პირდაპირი დაკვირვება",
      collection: "კოლექცია",
      profile: "პროფილი",
      book: "დაკვირვების დაჯავშნა",
      subscription: "გამოწერა",
      loyalty: "ლოიალობა",
      passes: "დაკვირვების პასი",
      plannedGroup: "ჯერ მიუწვდომელია",
      mobile: {
        home: "მთავარი",
        missions: "მისიები",
        live: "პირდაპირი",
        collection: "კოლექცია",
        profile: "პროფილი",
      },
      observatory: "ობსერვატორიის სტატუსი",
      observatoryName: "თბილისის ობსერვატორია",
      statusOnline: "ონლაინ",
      simulated: "სიმულირებული სტატუსი",
      previewEyebrow: "აპლიკაციის გარსი",
      previewDescription:
        "ეს მიმართულება განლაგების პრევიუა. ფუნქციური შინაარსი ცალკე დაემატება.",
      plannedEyebrow: "ჯერ მიუწვდომელია",
      plannedDescription: `${brand.ka.genitive} ეს ნაწილი ჯერ არ აშენებულა. აქ იმიტომ ჩანს, რომ ნახოთ რა მოდის — და როცა მზად იქნება, სწორედ ამ გვერდიდან იმუშავებს.`,
    },
  },
  home: {
    hero: {
      eyebrow: "პლანეტა",
      cta: "დაჯავშნე დრო",
      showPlanet: "აჩვენე: {planet}",
      nextSection: "შემდეგ სექციაზე გადასვლა",
      illustration: "ილუსტრაცია — არა ტელესკოპის კადრი",
      planets: {
        earth: {
          name: "დედამიწა",
          lede: [
            "პლანეტა, საიდანაც ვაკვირდებით. ნამდვილი ტელესკოპი თბილისში ცას პირდაპირ",
            "გაჩვენებს. დაჯავშნე დაკვირვების დრო და ნახე კამერის ნამდვილი კადრი.",
          ],
        },
        venus: {
          name: "ვენერა",
          lede: [
            "ყველაზე კაშკაშა პლანეტა ჩვენს ცაზე, ფაზებით, როგორც პატარა მთვარე. დაჯავშნე",
            "დაკვირვების დრო და უყურე მას პირდაპირ, ნამდვილი ტელესკოპით.",
          ],
        },
        mars: {
          name: "მარსი",
          lede: [
            "წითელი პლანეტა, რომლის დეტალებიც ოპოზიციისას ჩანს საუკეთესოდ. დაჯავშნე",
            "დაკვირვების დრო და უყურე მას პირდაპირ, თბილისიდან.",
          ],
        },
      },
    },
    common: {
      viewTarget: "ობიექტის ნახვა",
      illustration: "საკატალოგო ილუსტრაცია",
      minutes: "წთ",
      window: "დაკვირვების დრო",
      altitude: "მიმდინარე სიმაღლე",
      duration: "მისია",
    },
    howItWorks: {
      eyebrow: `როგორ მუშაობს ${brand.ka.nominative}`,
      title: "სამი ნაბიჯი. ერთი რეალური დაკვირვება.",
      description: `${brand.ka.nominative} ნამდვილ ტელესკოპზე დროს ერთ გასაგებ მისიად აქცევს — სამიზნის არჩევიდან გადაღებული კადრის შენახვამდე.`,
      steps: [
        {
          title: "აირჩიეთ",
          description: "აირჩიეთ სამიზნე დღევანდელი დაკვირვებადი ციდან და დაჯავშნეთ დრო.",
        },
        {
          title: "დააკვირდით",
          description:
            "თქვენს დროზე ტელესკოპი თბილისში მისკენ მიბრუნდება, თქვენ კი უყურებთ, როგორ იკრიბება ცოცხალი გამოსახულება.",
        },
        {
          title: "შეინახეთ",
          description: "გადაიღეთ დაგროვილი კადრი და შეინახეთ თქვენს კოლექციაში.",
        },
      ],
    },
    tonight: {
      eyebrow: "დღევანდელი ცა",
      title: "აირჩიეთ, რას დაინახავს ტელესკოპი შემდეგ.",
      description:
        "ყველა სამიზნე, რომელიც ობსერვატორიამ იცის — რას ხედავს დღეს და რატომ ვერ ხედავს დანარჩენს.",
      scheduleNote:
        "ხილვადობას ობსერვატორია ახლა ითვლის · სურათები ილუსტრაციებია და არა ტელესკოპის კადრები",
      railLabel: "დღევანდელი სამიზნეები",
      all: "ყველა",
      previous: "წინა სამიზნეები",
      next: "შემდეგი სამიზნეები",
    },
    instrument: {
      eyebrow: "ინსტრუმენტი",
      title: "ერთი ნამდვილი ტელესკოპი, თბილისში.",
      description:
        "მას მხოლოდ ობსერვატორიის საკუთარი პროგრამა მართავს და არასდროს — ბრაუზერი პირდაპირ. რასაც ხედავთ, იმას ხედავს მისი კამერა.",
      aperture: "აპერტურა",
      focalLength: "ფოკუსური მანძილი",
      focalRatio: "ფარდობითი ხვრელი",
      camera: "კამერა",
      cameraValue: "ZWO ASI585MC",
      cameraNote: "ფერადი სენსორი, ცოცხალი სტეკით",
      millimetres: "მმ",
    },
    finalCta: {
      eyebrow: "დაიწყეთ დღეს",
      title: "თქვენი შემდეგი დაკვირვება აქ იწყება.",
      description: `აირჩიეთ დაკვირვებადი სამიზნე და ჩამოაყალიბეთ პირველი ${brand.ka.genitive} მისია.`,
      action: "დაჯავშნე დრო",
      secondary: "დღევანდელი ცის ნახვა",
      privateTitle: "პირადი სესიები",
      privateNote:
        "უფრო ხანგრძლივი, მხოლოდ თქვენთვის გამოყოფილი დრო ტელესკოპზე მოგვიანებით დაემატება.",
    },
  },
  footer: {
    brandAriaLabel: `${brand.ka.nominative} — ${brand.ka.maker}`,
    brandEndorsement: brand.ka.endorsement,
    georgianLanguage: "ქართული",
    englishLanguage: "English",
    statement: "პრემიუმ ოპტიკური ინსტრუმენტი ღრმა კოსმოსის დასანახად.",
    product: "პროდუქტი",
    company: "კომპანია",
    legal: "სამართლებრივი",
    language: "ენა",
    missions: "მისიები",
    live: "პირდაპირი დაკვირვება",
    collection: "კოლექცია",
    observatory: "ობსერვატორია",
    status: "სტატუსი",
    about: "ჩვენ შესახებ",
    contact: "კონტაქტი",
    privacy: "კონფიდენციალურობა",
    terms: "პირობები",
    refunds: "თანხის დაბრუნება",
    comingSoon: "მალე",
  },
  notFound: {
    title: "დაკვირვება ვერ მოიძებნა",
    action: `${brand.ka.on} დაბრუნება`,
  },
} satisfies Dictionary;

export default dictionary;
