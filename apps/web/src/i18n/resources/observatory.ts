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
    metadataTitle: `Tbilisi Observatory · ${brand.en.name}`,
    metadataDescription: `${brand.en.name}'s live remote telescope in Tbilisi: its status right now, tonight's targets, the instrument, and the rules it keeps.`,
    eyebrow: "Live remote observatory · Tbilisi",
    statement: `One real telescope on a Tbilisi rooftop, run by the observatory's own software. You reserve the time; it does the moving.`,
    liveStatus: "Live status",
    fullStatus: "Full status",
    observingNow: (target) => `Observing now: ${target}`,
    missionInProgress: "An observation is in progress",
    statusUnavailable: {
      title: "The observatory's status is unavailable right now.",
      description: "Nothing below is affected. Try the full status page shortly.",
    },
    noObservatory: {
      title: "No observatory is listed.",
      description: "There is nothing to report yet.",
    },
    tonight: "Tonight",
    tonightDescription: "Targets the telescope can reach tonight.",
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
      watch: "Watch live",
      siteTime: "Site time · Tbilisi",
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
            body: "Reserve time on the telescope, choose what it points at, and keep what you capture.",
            cta: "Book",
          },
          {
            title: "Watch a live session",
            body: "Open the session that is running now, or the one you booked. Signed-in observers only.",
            cta: "Watch",
          },
          {
            title: "See tonight's targets",
            body: "Everything the telescope can reach tonight, with how high it climbs and when.",
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
      title: "A six-inch telescope and a colour camera.",
      lede: "Small, well understood and honest about what it can show: the Moon, the planets, double stars and the brighter clusters and nebulae, live.",
      design: "Design",
      designValue: "Schmidt-Cassegrain",
      mount: "Mount",
      mountValue: "Computerised alt-azimuth",
      focalRatio: "Focal ratio",
      cameraNote:
        "Uncooled, one-shot colour. Each frame arrives in colour; there are no filter passes.",
      mode: "Mode",
      modeValue: "Live view",
      modeNote:
        "Short exposures, stacked as you watch. Not long-exposure astrophotography.",
      optics: "Optical configurations",
      opticsLede:
        "Each target is observed in one of three configurations, chosen for it in the catalogue.",
      configurations: [
        { name: "With reducer", value: "945 mm · f/6.3" },
        { name: "Native", value: "1500 mm · f/10" },
        { name: "With Barlow", value: "3000 mm · f/20" },
      ],
      millimetres: "mm",
    },
    safetySection: {
      kicker: "02 · Safety",
      title: "Nothing moves until it is allowed to.",
      lede: "Every command is checked in the cloud and checked again beside the telescope. A command the observatory considers unsafe is refused, whoever sent it.",
      rules: [
        {
          title: "The simulator by default",
          description:
            "The observatory software starts on a simulated telescope and camera. Pages fed by the simulator say so.",
        },
        {
          title: "Real hardware only when attended",
          description:
            "Switching to the real telescope takes a deliberate action by an operator who is physically present.",
        },
        {
          title: "Sun avoidance",
          description:
            "Directions near the Sun are refused before the telescope moves, on every path, with no override from a booking.",
        },
        {
          title: "Altitude envelope and horizon mask",
          description:
            "Slews stay between a minimum altitude and a maximum measured on the real optical train, and clear of the rooftop's surveyed obstructions. Until that maximum is measured, every slew is refused.",
        },
        {
          title: "One owner, fresh commands",
          description:
            "Only the session's current owner can command the telescope. Expired and repeated commands are rejected.",
        },
        {
          title: "Emergency park",
          description:
            "On an operator's abort, a lost connection or a device fault, capture stops, motion halts and the telescope parks.",
        },
        {
          title: "The observatory dials out",
          description:
            "It accepts no inbound connection from the internet. Its only link is one authenticated connection it opens itself, and no browser ever addresses the telescope or camera.",
        },
      ],
    },
    siteSection: {
      kicker: "03 · The site",
      title: "A rooftop in Tbilisi.",
      lede: "The telescope is installed on a rooftop in Tbilisi, Georgia, on mains power.",
      city: "City",
      cityValue: "Tbilisi, Georgia",
      placement: "Placement",
      placementValue: "Rooftop, mains power",
      precision: "Exact location",
      precisionValue:
        "Not published. Public pages carry no coordinates precise enough to find the instrument.",
    },
    networkSection: {
      kicker: "04 · The network",
      title: "One site today.",
      lede: `${brand.en.name} is built so that more observatories could join later. Today there is exactly one, and it is this one.`,
      today: "Today",
      todayValue: `One observatory, in Tbilisi, operated by ${brand.en.name}.`,
      later: "Later",
      laterValue:
        "Other sites may join, each only after review, technical integration and safety checks. None is connected, and none is shown as if it were.",
      applications: "Partner applications",
      applicationsValue: "Not open.",
    },
  },
  ka: {
    metadataTitle: `თბილისის ობსერვატორია · ${brand.ka.nominative}`,
    metadataDescription: `${brand.ka.genitive} დისტანციური ტელესკოპი თბილისში: მისი სტატუსი ახლა, დღევანდელი ობიექტები, ინსტრუმენტი და წესები, რომლებსაც იცავს.`,
    eyebrow: "დისტანციური ობსერვატორია · თბილისი",
    statement:
      "ერთი ნამდვილი ტელესკოპი თბილისის სახურავზე, რომელსაც ობსერვატორიის საკუთარი პროგრამა მართავს. შენ დროს ჯავშნი, მოძრაობას კი ის ასრულებს.",
    liveStatus: "სტატუსი ახლა",
    fullStatus: "სრული სტატუსი",
    observingNow: (target) => `ახლა დაკვირვება მიმდინარეობს: ${target}`,
    missionInProgress: "დაკვირვება მიმდინარეობს",
    statusUnavailable: {
      title: "ობსერვატორიის სტატუსი ახლა მიუწვდომელია.",
      description:
        "ქვემოთ მოცემულ ინფორმაციაზე ეს გავლენას არ ახდენს. სცადე სრული სტატუსის გვერდი ცოტა ხანში.",
    },
    noObservatory: {
      title: "ობსერვატორია არ არის მითითებული.",
      description: "ჯერჯერობით საანგარიშო არაფერია.",
    },
    tonight: "ამაღამ",
    tonightDescription: "ობიექტები, რომლებსაც ტელესკოპი ამაღამ მისწვდება.",
    scene: {
      states: {
        online: "ხაზზეა",
        observing: "დაკვირვება მიმდინარეობს",
        hold: "ამინდის გამო შეჩერებულია",
        degraded: "კავშირი შეფერხებულია",
        offline: "ხაზგარეშეა",
      },
      summary: (targets) => `ერთი ტელესკოპი · ამაღამ ხილულია ${targets} ობიექტი`,
      cloud: (percent) => `${percent}% ღრუბელი`,
      cloudAbout: "პროგნოზი, პირველი საათი",
      noForecast: "პროგნოზი ჯერ არ არის",
      firstHour: "პირველი ჯავშნადი საათი",
      noHours: "ამაღამ ჯავშნადი საათი არ არის",
      book: "დაჯავშნე დრო",
      watch: "უყურე პირდაპირ",
      siteTime: "ადგილობრივი დრო · თბილისი",
      plate: {
        aria: "კამერის კადრი მთვარეზე, მასშტაბით",
        sensor: "კამერის კადრი",
        moon: "მთვარე, საშუალო ზომა",
      },
      ways: {
        label: "როგორ დაიწყო",
        note: "სამი გზა",
        items: [
          {
            title: "დაჯავშნე დრო",
            body: "დაჯავშნე დრო ტელესკოპთან, აირჩიე, რას დააკვირდება, და შეინახე, რასაც გადაიღებ.",
            cta: "დაჯავშნა",
          },
          {
            title: "უყურე პირდაპირ სესიას",
            body: "გახსენი ახლა მიმდინარე სესია ან ის, რომელიც დაჯავშნე. მხოლოდ ავტორიზებული დამკვირვებლებისთვის.",
            cta: "ყურება",
          },
          {
            title: "ნახე ამაღამ ხილული ობიექტები",
            body: "ყველაფერი, რასაც ტელესკოპი ამაღამ მისწვდება: რა სიმაღლეზე ადის და როდის.",
            cta: "დათვალიერება",
          },
        ],
      },
      instrumentNote:
        "მოკლე ექსპოზიციები, რომლებიც შენს თვალწინ იკრიბება. ეს არ არის ხანგრძლივი ექსპოზიციის ასტროფოტოგრაფია.",
      fieldOfView: "ხედვის არე",
      tonightAll: "ამაღამ ყველა",
    },
    telescope: "ტელესკოპი",
    aperture: "აპერტურა",
    focalLength: "ფოკუსური მანძილი",
    camera: "კამერა",
    cameraModel: "ZWO ASI585MC",
    cameraType: "გაგრილების გარეშე, ფერადი სენსორი",
    illustration: "ილუსტრაცია — არა ტელესკოპის გამოსახულება",
    instrumentSection: {
      kicker: "01 · ინსტრუმენტი",
      title: "ექვსდიუმიანი ტელესკოპი და ფერადი კამერა.",
      lede: "პატარა, კარგად შესწავლილი და გულწრფელი იმაში, რისი ჩვენებაც შეუძლია: მთვარე, პლანეტები, ორმაგი ვარსკვლავები და უფრო კაშკაშა გროვები და ნისლეულები — რეალურ დროში.",
      design: "კონსტრუქცია",
      designValue: "შმიდტ-კასეგრენი",
      mount: "მონტირება",
      mountValue: "კომპიუტერული ალტ-აზიმუტური",
      focalRatio: "ფარდობითი ხვრელი",
      cameraNote:
        "გაგრილების გარეშე, ფერადი სენსორი. ყოველი კადრი ფერადი მოდის; ფილტრების ცალკე გადაღება არ არის.",
      mode: "რეჟიმი",
      modeValue: "პირდაპირი ხედი",
      modeNote:
        "მოკლე ექსპოზიციები, რომლებიც შენს თვალწინ იკრიბება. ეს არ არის ხანგრძლივი ექსპოზიციის ასტროფოტოგრაფია.",
      optics: "ოპტიკური კონფიგურაციები",
      opticsLede:
        "ყოველ ობიექტს სამიდან ერთ კონფიგურაციაში აკვირდებიან, რომელიც მისთვის კატალოგშია არჩეული.",
      configurations: [
        { name: "რედუქტორით", value: "945 mm · f/6.3" },
        { name: "ძირითადი", value: "1500 mm · f/10" },
        { name: "ბარლოუთი", value: "3000 mm · f/20" },
      ],
      millimetres: "mm",
    },
    safetySection: {
      kicker: "02 · უსაფრთხოება",
      title: "არაფერი მოძრაობს, სანამ ნებადართული არ არის.",
      lede: "ყოველი ბრძანება მოწმდება სერვერზე და ხელახლა — ტელესკოპთან. ბრძანებას, რომელსაც ობსერვატორია სახიფათოდ მიიჩნევს, უარს ეუბნება, ვინც არ უნდა გაგზავნოს.",
      rules: [
        {
          title: "ნაგულისხმევად — სიმულატორი",
          description:
            "ობსერვატორიის პროგრამა სიმულირებული ტელესკოპითა და კამერით ირთვება. გვერდები, რომლებიც სიმულატორის მონაცემებს აჩვენებს, ამას მიუთითებს.",
        },
        {
          title: "ნამდვილი აპარატურა — მხოლოდ ოპერატორის თანდასწრებით",
          description:
            "ნამდვილ ტელესკოპზე გადართვას სჭირდება ადგილზე ფიზიკურად მყოფი ოპერატორის შეგნებული მოქმედება.",
        },
        {
          title: "მზისგან დაცვა",
          description:
            "მზესთან ახლოს მიმართულებები ტელესკოპის მოძრაობამდე იბლოკება, ყველა გზაზე, და ჯავშანი ამას ვერ შეცვლის.",
        },
        {
          title: "სიმაღლის საზღვრები და ჰორიზონტის ნიღაბი",
          description:
            "მოძრაობა რჩება მინიმალურ სიმაღლესა და ნამდვილ ოპტიკურ სისტემაზე გაზომილ მაქსიმუმს შორის და სახურავის აღწერილ დაბრკოლებებს გვერდს უვლის. სანამ ეს მაქსიმუმი არ გაიზომება, ყველა მოძრაობა იბლოკება.",
        },
        {
          title: "ერთი მფლობელი, ახალი ბრძანებები",
          description:
            "ტელესკოპს მხოლოდ სესიის მიმდინარე მფლობელი მართავს. ვადაგასული და განმეორებული ბრძანებები უარყოფილია.",
        },
        {
          title: "საგანგებო პარკირება",
          description:
            "ოპერატორის შეწყვეტისას, კავშირის დაკარგვისას ან მოწყობილობის ხარვეზისას გადაღება ჩერდება, მოძრაობა წყდება და ტელესკოპი პარკირდება.",
        },
        {
          title: "ობსერვატორია თავად უკავშირდება",
          description:
            "ის ინტერნეტიდან შემომავალ კავშირს არ იღებს. მისი ერთადერთი კავშირი არის ერთი ავტორიზებული არხი, რომელსაც თავად ხსნის, და ბრაუზერი ტელესკოპს ან კამერას არასდროს მიმართავს.",
        },
      ],
    },
    siteSection: {
      kicker: "03 · ადგილი",
      title: "სახურავი თბილისში.",
      lede: "ტელესკოპი დამონტაჟებულია თბილისში, სახურავზე, ქსელის ელექტროკვებით.",
      city: "ქალაქი",
      cityValue: "თბილისი, საქართველო",
      placement: "განთავსება",
      placementValue: "სახურავი, ქსელის კვება",
      precision: "ზუსტი მდებარეობა",
      precisionValue:
        "არ ქვეყნდება. საჯარო გვერდებზე არ არის ისეთი ზუსტი კოორდინატები, რომლებითაც ინსტრუმენტის პოვნა შეიძლება.",
    },
    networkSection: {
      kicker: "04 · ქსელი",
      title: "დღეს — ერთი ადგილი.",
      lede: `${brand.ka.nominative} ისეა აგებული, რომ მომავალში სხვა ობსერვატორიებიც შეუერთდეს. დღეს მხოლოდ ერთია — ეს.`,
      today: "დღეს",
      todayValue: `ერთი ობსერვატორია თბილისში, რომელსაც ${brand.ka.nominative} მართავს.`,
      later: "მოგვიანებით",
      laterValue:
        "სხვა ადგილები შეიძლება შეუერთდეს, თითოეული მხოლოდ შემოწმების, ტექნიკური ინტეგრაციისა და უსაფრთხოების დადასტურების შემდეგ. არცერთი არ არის დაკავშირებული და არცერთი არ არის ნაჩვენები ისე, თითქოს იყოს.",
      applications: "პარტნიორების განაცხადები",
      applicationsValue: "მიღება არ არის გახსნილი.",
    },
  },
};
