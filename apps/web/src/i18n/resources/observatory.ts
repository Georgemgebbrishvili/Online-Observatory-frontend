import { brand } from "@/brand";

type StateCopy = { title: string; description: string };
type Rule = { title: string; description: string };
type Way = { title: string; body: string; cta: string };

type SceneCopy = {
  states: Record<"online" | "observing" | "hold" | "degraded" | "offline", string>;
  summary: (targets: number) => string;
  cloud: (percent: number) => string;
  cloudAbout: string;
  noForecast: string;
  firstHour: string;
  noHours: string;
  book: string;
  watch: string;
  siteTime: string;
  plate: { aria: string; sensor: string; moon: string };
  ways: { label: string; note: string; items: [Way, Way, Way] };
  instrumentNote: string;
  fieldOfView: string;
  tonightAll: string;
};

type ObservatoryPageCopy = {
  metadataTitle: string;
  metadataDescription: string;
  eyebrow: string;
  statement: string;
  liveStatus: string;
  fullStatus: string;
  observingNow: (target: string) => string;
  missionInProgress: string;
  statusUnavailable: StateCopy;
  noObservatory: StateCopy;
  tonight: string;
  tonightDescription: string;
  scene: SceneCopy;
  telescope: string;
  aperture: string;
  focalLength: string;
  camera: string;
  cameraModel: string;
  cameraType: string;
  illustration: string;
  instrumentSection: {
    kicker: string;
    title: string;
    lede: string;
    design: string;
    designValue: string;
    mount: string;
    mountValue: string;
    focalRatio: string;
    cameraNote: string;
    mode: string;
    modeValue: string;
    modeNote: string;
    optics: string;
    opticsLede: string;
    configurations: { name: string; value: string }[];
    millimetres: string;
  };
  safetySection: {
    kicker: string;
    title: string;
    lede: string;
    rules: Rule[];
  };
  siteSection: {
    kicker: string;
    title: string;
    lede: string;
    city: string;
    cityValue: string;
    placement: string;
    placementValue: string;
    precision: string;
    precisionValue: string;
  };
  networkSection: {
    kicker: string;
    title: string;
    lede: string;
    today: string;
    todayValue: string;
    later: string;
    laterValue: string;
    applications: string;
    applicationsValue: string;
  };
};

export const observatoryPageCopy: Record<"en" | "ka", ObservatoryPageCopy> = {
  en: {
    metadataTitle: `Observatory · ${brand.en.name}`,
    metadataDescription: `${brand.en.name}'s remote telescope in Georgia: live status, tonight's targets, the instrument and its safety rules.`,
    eyebrow: "Remote observatory · Georgia",
    statement: `One real telescope on a rooftop in Georgia. You book the time; it does the moving.`,
    liveStatus: "Status",
    fullStatus: "Full status",
    observingNow: (target) => `Observing now: ${target}`,
    missionInProgress: "An observation is in progress",
    statusUnavailable: {
      title: "The observatory's status is unavailable right now.",
      description: "Try the full status page shortly.",
    },
    noObservatory: {
      title: "No observatory is listed.",
      description: "Nothing to report yet.",
    },
    tonight: "Tonight",
    tonightDescription: "What the telescope can reach tonight.",
    scene: {
      states: {
        online: "Online",
        observing: "Observing",
        hold: "Weather hold",
        degraded: "Degraded",
        offline: "Offline",
      },
      summary: (targets) =>
        `One telescope · ${targets === 1 ? "1 target" : `${targets} targets`} up tonight`,
      cloud: (percent) => `${percent}% cloud`,
      cloudAbout: "Forecast, first hour",
      noForecast: "No forecast yet",
      firstHour: "First bookable hour",
      noHours: "No bookable hours tonight",
      book: "Book a slot",
      watch: "Watch",
      siteTime: "Site time",
      plate: {
        aria: "The camera's frame drawn over the Moon, to scale",
        sensor: "Camera frame",
        moon: "Moon, mean size",
      },
      ways: {
        label: "Ways in",
        note: "Three ways in",
        items: [
          {
            title: "Book a slot",
            body: "Pick a target. Keep what you capture.",
            cta: "Book",
          },
          {
            title: "Watch a live session",
            body: "The running session, or yours. Sign-in required.",
            cta: "Watch",
          },
          {
            title: "See tonight's targets",
            body: "What is up tonight, and when.",
            cta: "Browse",
          },
        ],
      },
      instrumentNote:
        "Short exposures, stacked as you watch. Not long-exposure astrophotography.",
      fieldOfView: "Field of view",
      tonightAll: "All of tonight",
    },
    telescope: "Telescope",
    aperture: "aperture",
    focalLength: "focal length",
    camera: "Camera",
    cameraModel: "ZWO ASI585MC",
    cameraType: "Uncooled, one-shot colour",
    illustration: "Illustration — not telescope output",
    instrumentSection: {
      kicker: "01 · The instrument",
      title: "An 8-inch telescope and a colour camera.",
      lede: "The Moon, planets, double stars and bright clusters and nebulae, live.",
      design: "Design",
      designValue: "Schmidt-Cassegrain",
      mount: "Mount",
      mountValue: "Computerised alt-azimuth",
      focalRatio: "Focal ratio",
      cameraNote:
        "Uncooled, one-shot colour. Every frame is in colour.",
      mode: "Mode",
      modeValue: "Live view",
      modeNote:
        "Short exposures, stacked as you watch. Not long-exposure astrophotography.",
      optics: "Optical configurations",
      opticsLede:
        "Each target uses one of three setups.",
      configurations: [
        { name: "With reducer", value: "1280 mm · f/6.3" },
        { name: "Native", value: "2032 mm · f/10" },
        { name: "With Barlow", value: "4064 mm · f/20" },
      ],
      millimetres: "mm",
    },
    safetySection: {
      kicker: "02 · Safety",
      title: "Nothing moves until it is allowed to.",
      lede: "Every command is checked twice: in the cloud and at the telescope. Unsafe commands are refused.",
      rules: [
        {
          title: "Real hardware only when attended",
          description:
            "Only an operator on site can switch to the real telescope.",
        },
        {
          title: "Sun avoidance",
          description:
            "Positions near the Sun are refused before any move. No booking can override this.",
        },
        {
          title: "Altitude envelope and horizon mask",
          description:
            "Slews stay within measured altitude limits and clear of rooftop obstructions. Until the upper limit is measured, every slew is refused.",
        },
        {
          title: "One owner, fresh commands",
          description:
            "Only the session owner can command it. Expired or repeated commands are rejected.",
        },
        {
          title: "Emergency park",
          description:
            "On abort, lost connection or a fault, capture stops and the telescope parks.",
        },
        {
          title: "The observatory dials out",
          description:
            "No inbound connections. It opens its own single secure link. No browser ever reaches the telescope or camera.",
        },
      ],
    },
    siteSection: {
      kicker: "03 · The site",
      title: "A rooftop in Georgia.",
      lede: "Installed on a rooftop in Georgia, on mains power.",
      city: "Country",
      cityValue: "Georgia",
      placement: "Placement",
      placementValue: "Rooftop, mains power",
      precision: "Exact location",
      precisionValue:
        "Not published.",
    },
    networkSection: {
      kicker: "04 · The network",
      title: "One site today.",
      lede: `Built so more observatories can join later. Today there is one.`,
      today: "Today",
      todayValue: `One observatory, in Georgia, operated by ${brand.en.name}.`,
      later: "Later",
      laterValue:
        "Other sites may join after review and safety checks. None is connected yet.",
      applications: "Partner applications",
      applicationsValue: "Not open.",
    },
  },
  ka: {
    metadataTitle: `ობსერვატორია · ${brand.ka.nominative}`,
    metadataDescription: `${brand.ka.genitive} დისტანციური ტელესკოპი საქართველოში: სტატუსი, ამაღამინდელი ობიექტები, ინსტრუმენტი და უსაფრთხოების წესები.`,
    eyebrow: "დისტანციური ობსერვატორია · საქართველო",
    statement:
      "ერთი ნამდვილი ტელესკოპი სახურავზე, საქართველოში. შენ ჯავშნი დროს, ტელესკოპი თავად მოძრაობს.",
    liveStatus: "სტატუსი",
    fullStatus: "სრული სტატუსი",
    observingNow: (target) => `ახლა ვაკვირდებით: ${target}`,
    missionInProgress: "დაკვირვება მიმდინარეობს",
    statusUnavailable: {
      title: "ობსერვატორიის სტატუსი ახლა მიუწვდომელია.",
      description:
        "სცადე სრული სტატუსის გვერდი ცოტა ხანში.",
    },
    noObservatory: {
      title: "ობსერვატორია არ არის მითითებული.",
      description: "ჯერ სათქმელი არაფერია.",
    },
    tonight: "ამაღამ",
    tonightDescription: "რას მისწვდება ტელესკოპი ამაღამ.",
    scene: {
      states: {
        online: "ონლაინ",
        observing: "დაკვირვება მიმდინარეობს",
        hold: "ამინდის გამო შეჩერებულია",
        degraded: "არასტაბილური",
        offline: "კავშირგარეშეა",
      },
      summary: (targets) => `ერთი ტელესკოპი · ამაღამ ჩანს ${targets} ობიექტი`,
      cloud: (percent) => `${percent}% ღრუბლიანობა`,
      cloudAbout: "პროგნოზი, პირველი საათი",
      noForecast: "პროგნოზი ჯერ არ არის",
      firstHour: "პირველი დასაჯავშნი საათი",
      noHours: "ამაღამ დასაჯავშნი საათი არ არის",
      book: "დაჯავშნე სეანსი",
      watch: "უყურე",
      siteTime: "ადგილობრივი დრო",
      plate: {
        aria: "კამერის კადრი მთვარეზე, მასშტაბით",
        sensor: "კამერის კადრი",
        moon: "მთვარე, საშუალო ზომა",
      },
      ways: {
        label: "როგორ დავიწყო",
        note: "სამი გზა",
        items: [
          {
            title: "დაჯავშნე სეანსი",
            body: "აირჩიე ობიექტი და შეინახე კადრები.",
            cta: "დაჯავშნა",
          },
          {
            title: "უყურე პირდაპირ",
            body: "მიმდინარე ან შენი სეანსი. საჭიროა შესვლა.",
            cta: "ყურება",
          },
          {
            title: "ამაღამინდელი ობიექტები",
            body: "რა ჩანს ამაღამ და როდის.",
            cta: "დათვალიერება",
          },
        ],
      },
      instrumentNote:
        "მოკლე კადრები შენს თვალწინ ჯამდება. ეს არ არის ხანგრძლივი ექსპოზიციის ფოტო.",
      fieldOfView: "ხედვის ველი",
      tonightAll: "ამაღამ ყველა",
    },
    telescope: "ტელესკოპი",
    aperture: "აპერტურა",
    focalLength: "ფოკუსური მანძილი",
    camera: "კამერა",
    cameraModel: "ZWO ASI585MC",
    cameraType: "ფერადი, გაგრილების გარეშე",
    illustration: "ილუსტრაცია — არა ტელესკოპის გამოსახულება",
    instrumentSection: {
      kicker: "01 · ინსტრუმენტი",
      title: "203 მმ ტელესკოპი და ფერადი კამერა.",
      lede: "მთვარე, პლანეტები, ორმაგი ვარსკვლავები, კაშკაშა გროვები და ნისლეულები — პირდაპირ.",
      design: "ოპტიკური სქემა",
      designValue: "შმიდტ-კასეგრენი",
      mount: "მონტირება",
      mountValue: "კომპიუტერიზებული ალტაზიმუტური",
      focalRatio: "ფარდობითი ხვრელი",
      cameraNote:
        "ფერადი, გაგრილების გარეშე. ყოველი კადრი ფერადია.",
      mode: "რეჟიმი",
      modeValue: "პირდაპირი გამოსახულება",
      modeNote:
        "მოკლე კადრები შენს თვალწინ ჯამდება. ეს არ არის ხანგრძლივი ექსპოზიციის ფოტო.",
      optics: "ოპტიკის ვარიანტები",
      opticsLede:
        "ყოველ ობიექტს სამიდან ერთი ვარიანტი აქვს.",
      configurations: [
        { name: "რედუქტორით", value: "1280 მმ · f/6.3" },
        { name: "ძირითადი", value: "2032 მმ · f/10" },
        { name: "ბარლოუთი", value: "4064 მმ · f/20" },
      ],
      millimetres: "მმ",
    },
    safetySection: {
      kicker: "02 · უსაფრთხოება",
      title: "ნებართვის გარეშე არაფერი მოძრაობს.",
      lede: "ყოველი ბრძანება ორჯერ მოწმდება: სერვერზე და ტელესკოპთან. სახიფათო ბრძანება არ სრულდება.",
      rules: [
        {
          title: "ნამდვილი ტელესკოპი — მხოლოდ ოპერატორთან",
          description:
            "ნამდვილ ტელესკოპზე გადართვა მხოლოდ ადგილზე მყოფ ოპერატორს შეუძლია.",
        },
        {
          title: "მზისგან დაცვა",
          description:
            "მზესთან ახლოს მიმართვა იბლოკება. ჯავშანი ამას ვერ შეცვლის.",
        },
        {
          title: "სიმაღლის საზღვრები და ჰორიზონტის ნიღაბი",
          description:
            "ტელესკოპი გაზომილ ზღვრებში მოძრაობს და სახურავის დაბრკოლებებს უვლის გვერდს. სანამ ზედა ზღვარი არ გაიზომება, ყველა მოძრაობა იბლოკება.",
        },
        {
          title: "ერთი მფლობელი, ახალი ბრძანებები",
          description:
            "ტელესკოპს მხოლოდ სეანსის მფლობელი მართავს. ძველი და განმეორებული ბრძანებები უარიყოფა.",
        },
        {
          title: "საგანგებო პარკირება",
          description:
            "შეწყვეტისას, კავშირის დაკარგვისას ან ხარვეზისას გადაღება ჩერდება და ტელესკოპი პარკირდება.",
        },
        {
          title: "ობსერვატორია თავად უკავშირდება",
          description:
            "გარედან კავშირს არ იღებს და თავად ხსნის ერთ დაცულ არხს. ბრაუზერი ტელესკოპს და კამერას ვერასდროს მიწვდება.",
        },
      ],
    },
    siteSection: {
      kicker: "03 · ადგილი",
      title: "სახურავი საქართველოში.",
      lede: "ტელესკოპი სახურავზეა, საქართველოში, ქსელის კვებით.",
      city: "ქვეყანა",
      cityValue: "საქართველო",
      placement: "განთავსება",
      placementValue: "სახურავი, ქსელის კვება",
      precision: "ზუსტი მდებარეობა",
      precisionValue:
        "არ ქვეყნდება.",
    },
    networkSection: {
      kicker: "04 · ქსელი",
      title: "დღეს — ერთი ობსერვატორია.",
      lede: `მომავალში სხვა ობსერვატორიებიც შეიძლება დაემატოს. დღეს მხოლოდ ერთია.`,
      today: "დღეს",
      todayValue: `ერთი ობსერვატორია საქართველოში, რომელსაც ${brand.ka.nominative} მართავს.`,
      later: "მოგვიანებით",
      laterValue:
        "სხვა ობსერვატორიები შემოწმების შემდეგ შეიძლება დაემატოს. ჯერ არცერთი არ არის დაკავშირებული.",
      applications: "პარტნიორობის განაცხადები",
      applicationsValue: "ჯერ არ მიიღება.",
    },
  },
};
