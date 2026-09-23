import type { Dictionary } from "../types";

const dictionary = {
  metadata: {
    title: "Darkview by Astroman",
    description:
      "დაუკავშირდით რეალურ ობსერვატორიებს, გაუშვით ასტრონომიული მისიები და გადაიღეთ ღამის ცის საკუთარი სურათები.",
  },
  navigation: {
    ariaLabel: "მთავარი ნავიგაცია",
    skip: "შინაარსზე გადასვლა",
    language: "ენა",
    languageName: "English",
    brandAriaLabel: "Darkview — Astroman-ის პროდუქტი",
    brandEndorsement: "Astroman-ისგან",
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
      brandAriaLabel: "Darkview — Astroman-ის პროდუქტი",
      brandEndorsement: "Astroman-ისგან",
      home: "მთავარი",
      missions: "მისიები",
      live: "პირდაპირი დაკვირვება",
      collection: "კოლექცია",
      profile: "პროფილი",
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
    },
  },
  home: {
    hero: {
      eyebrow: "DARKVIEW · BY ASTROMAN",
      title: "აღმოაჩინეთ რეალური სამყარო.",
      description:
        "დაუკავშირდით რეალურ ობსერვატორიებს, გაუშვით ასტრონომიული მისიები და გადაიღეთ ღამის ცის საკუთარი სურათები.",
      primaryCta: "დაიწყე მისია",
      secondaryCta: "უყურე პირდაპირ დაკვირვებას",
      visualLabel: "დისტანციური ობსერვატორიის ინტერფეისი",
      visualTitle: "რეალურ ტელესკოპზე წვდომა",
      visualTarget: "სამიზნე · სატურნი",
      visualLocation: "თბილისი · 41.72° ჩრდ.",
      visualOperation: "სერვერით მართული ოპტიკა",
      visualStatus: "ონლაინ",
      visualLive: "პირდაპირი",
    },
    demoLabel: "სადემონსტრაციო მონაცემები",
    common: {
      watchLive: "პირდაპირი დაკვირვების ნახვა",
      planMission: "მისიის დაგეგმვა",
      illustration: "საკატალოგო ილუსტრაცია",
      minutes: "წთ",
      approximateViewers: "დაახლ. მაყურებელი",
      currentTarget: "მიმდინარე სამიზნე",
      currentMission: "მიმდინარე მისია",
      telescope: "ტელესკოპი",
      status: "სტატუსი",
      bestTime: "საუკეთესო დრო",
      duration: "მისია",
      liveLabel: "პირდაპირი",
      observatoryOnline: "ონლაინ",
      qualities: {
        Excellent: "შესანიშნავი",
        Good: "კარგი",
        Fair: "დამაკმაყოფილებელი",
        Unavailable: "მიუწვდომელი",
      },
    },
    live: {
      index: "01",
      eyebrow: "პირდაპირი დაკვირვება",
      title: "რეალური ობსერვატორია მოქმედებაში.",
      description:
        "ერთ ზუსტ ინტერფეისში ადევნეთ თვალი ტელესკოპის მდგომარეობას, სამიზნესა და აქტიურ მისიას.",
      observatoryName: "Darkview თბილისის ობსერვატორია",
      targetName: "სატურნი",
      currentMission: "DV-042 · სატურნის ოპოზიციის დაკვირვება",
      telescopeState: "სამიზნის თვალყურის დევნება",
    },
    tonight: {
      index: "02",
      eyebrow: "დღევანდელი ცა",
      title: "აირჩიეთ, რას დაინახავს ტელესკოპი შემდეგ.",
      description:
        "მისია იწყება დაკვირვებადი სამიზნითა და ღამის ცაზე რეალური დროის მონაკვეთით.",
      scheduleNote:
        "საილუსტრაციო დროები · საბოლოო ხელმისაწვდომობა გადამოწმებას საჭიროებს",
      targets: {
        moon: {
          name: "მთვარე",
          type: "ბუნებრივი თანამგზავრი",
          visibility: "ჰორიზონტზე მაღლა",
          bestTime: "20:10–22:30",
        },
        saturn: {
          name: "სატურნი",
          type: "პლანეტა",
          visibility: "სამხრეთ-დასავლეთი",
          bestTime: "21:40–23:15",
        },
        jupiter: {
          name: "იუპიტერი",
          type: "პლანეტა",
          visibility: "ამოდის აღმოსავლეთით",
          bestTime: "22:05–01:40",
        },
        m31: {
          name: "M31 ანდრომედა",
          type: "გალაქტიკა",
          visibility: "ჩრდილო-აღმოსავლეთი",
          bestTime: "22:20–01:10",
        },
        m13: {
          name: "M13",
          type: "სფერული გროვა",
          visibility: "დასავლეთის ცა",
          bestTime: "20:50–22:40",
        },
        m27: {
          name: "M27",
          type: "პლანეტარული ნისლეული",
          visibility: "ჩრდილო-დასავლეთი",
          bestTime: "21:15–23:35",
        },
        m57: {
          name: "M57",
          type: "პლანეტარული ნისლეული",
          visibility: "მაღლა დასავლეთით",
          bestTime: "20:45–22:55",
        },
        m42: {
          name: "M42 ორიონი",
          type: "ემისიური ნისლეული",
          visibility: "დაბლა სამხრეთ-აღმოსავლეთით",
          bestTime: "23:30–02:15",
        },
      },
    },
    howItWorks: {
      index: "03",
      eyebrow: "როგორ მუშაობს Darkview",
      title: "სამი ნაბიჯი. ერთი რეალური დაკვირვება.",
      description:
        "Darkview ობსერვატორიაზე წვდომას არჩევიდან გადაღებამდე გასაგებ მისიად აქცევს.",
      steps: [
        {
          title: "აირჩიეთ",
          description: "აირჩიეთ ობიექტი დღევანდელი დაკვირვებადი ციდან.",
        },
        {
          title: "დააკვირდით",
          description: "რეალური ტელესკოპი ავტომატურად პოულობს და მიჰყვება მას.",
        },
        {
          title: "შეინახეთ",
          description: "გადაიღეთ საკუთარი ასტრონომიული სურათი და დაამატეთ კოლექციაში.",
        },
      ],
    },
    realObservatory: {
      index: "04",
      eyebrow: "რეალური ობსერვატორია",
      title: "ფიზიკურ ოპტიკასთან დაკავშირებული პროგრამა.",
      description:
        "Darkview-ის მისიები დაცული ობსერვატორიის პროგრამის გავლით რეალურ ტელესკოპსა და კამერამდე მიდის — არასოდეს პირდაპირ ბრაუზერიდან.",
      statement:
        "ყველა ბრძანება რჩება სერვერზე. ყველა დაკვირვება მიბმულია დადასტურებულ მისიაზე.",
      locationLabel: "მდებარეობა",
      location: "თბილისი, საქართველო",
      cameraLabel: "კამერა",
      camera: "გაგრილებადი ასტრონომიული კამერა",
      operationLabel: "ოპერაცია",
      operation: "მისიის რეალური დროის მდგომარეობა",
      telescopeLabel: "ტელესკოპი",
      telescope: "დაპარკინგებული · სადემონსტრაციო მდგომარეობა",
    },
    collection: {
      index: "05",
      eyebrow: "თქვენი კოლექცია",
      title: "ვიზუალური ჩანაწერი იმისა, თუ სად გაიხედეთ.",
      description:
        "ყოველი დასრულებული მისია შეიძლება გახდეს პირადი დაკვირვება, რომელსაც შეინახავთ და შეადარებთ.",
      statement:
        "ეს არ არის ფოტოარქივის სურათები. ეს Darkview-ის გავლით შესრულებული დაკვირვებებია.",
      disclaimer:
        "დეველოპერული ჩანაცვლებები · ტელესკოპის რეალური კადრები წარმოდგენილი არ არის",
      frames: {
        m42: { name: "ორიონის ნისლეული", catalog: "M42 · ჩანაცვლების კადრი" },
        moon: { name: "მთვარის ტერმინატორი", catalog: "მთვარე · ჩანაცვლების კადრი" },
        m13: { name: "ჰერკულესის გროვა", catalog: "M13 · ჩანაცვლების კადრი" },
      },
    },
    network: {
      index: "06",
      eyebrow: "ობსერვატორიების ქსელი",
      title: "ერთი აქტიური კვანძი. ფრთხილი ზრდისთვის შექმნილი.",
      description:
        "არქიტექტურა მომავალ ობსერვატორიებს უჭერს მხარს ისე, რომ არარსებულ ქსელს არ აცხადებს.",
      observatoryName: "თბილისის ობსერვატორია",
      active: "აქტიური",
      location: "თბილისი · საქართველო",
      descriptionLine: "Darkview-ის ძირითადი ობსერვატორიის კვანძი",
      futureNote:
        "ახალი კვანძები გამოცხადდება მხოლოდ ფიზიკური ინტეგრაციისა და გადამოწმების შემდეგ.",
    },
    privateObservatory: {
      index: "07",
      eyebrow: "პირადი ობსერვატორია",
      title: "უფრო გრძელი დრო თქვენი ცის გეგმისთვის.",
      description:
        "პრემიუმ პირადი სესიები გამოყოფილ დროს შესთავაზებს უფრო ღრმა, დამოუკიდებელ კვლევას.",
      sessionLabel: "პირადი სესია",
      sessionDescription: "ტელესკოპის გამოყოფილი დრო",
      availability: "მოგვიანებით · გადახდა ჯერ არ არის ჩართული",
    },
    finalCta: {
      eyebrow: "დაიწყეთ დღეს",
      title: "თქვენი შემდეგი დაკვირვება აქ იწყება.",
      description: "აირჩიეთ დაკვირვებადი სამიზნე და ჩამოაყალიბეთ პირველი Darkview მისია.",
      action: "დღევანდელი ცის ნახვა",
    },
  },
  footer: {
    brandAriaLabel: "Darkview — Astroman-ის პროდუქტი",
    brandEndorsement: "Astroman-ისგან",
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
    action: "Darkview-ზე დაბრუნება",
  },
} satisfies Dictionary;

export default dictionary;
