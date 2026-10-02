import type { MissionEvent, TonightTarget } from "@darkview/contracts";
import type { Locale } from "@/i18n/config";

import { brand } from "@/brand";

export const designSystemCopy = {
  en: {
    metadataTitle: `Design system — ${brand.en.name}`,
    metadataDescription: `Internal ${brand.en.name} visual system and component reference.`,
    eyebrow: "Internal reference · 01",
    title: "Visual system",
    introduction: `The ${brand.en.name} poster language, ADR-039: a pitch-black ground, cream ink, warm plates, Anton headlines. Orange for actions, yellow for anything live, Photon Blue for data. Nothing glows.`,
    internal: "Development route · noindex",
    sections: {
      foundations: [
        "01",
        "Foundations",
        "Colour roles and the five faces, Georgian included.",
        "as amended by ADR-039 — ground and ink, colour roles, type",
      ],
      typeScale: [
        "02",
        "Type scale",
        "Every size in the product comes from this scale.",
        "as amended by ADR-039 — type",
      ],
      poster: [
        "03",
        "Kicker and stats",
        "An orange kicker above an Anton headline; Anton numbers over Oswald labels, under a hairline.",
        "as amended by ADR-039 — components",
      ],
      actions: [
        "04",
        "Actions & selection",
        "One filled orange primary; outline, ghost and danger; chips and the simulated badge. Focus is a Photon Blue ring.",
        "as amended by ADR-039 — components",
      ],
      statuses: [
        "05",
        "Operational status",
        "Observable state with text, shape, and restrained color.",
        "§04 Semantic colors · §08 Live observation page, rule 04",
      ],
      surfaces: [
        "06",
        "Surfaces",
        "Cards and panels for calm information hierarchy.",
        "§08 Surface mapping · §07 Iconography (card radius)",
      ],
      overlays: [
        "07",
        "Overlays & disclosure",
        "Native modal, sheet, dropdown, and tooltip behavior.",
        `§08 Surface mapping · §09 What ${brand.en.name} must never be, 04`,
      ],
      navigation: [
        "08",
        "Tabs",
        "Compact keyboard-navigable content switching.",
        "§08 Surface mapping · §04 The 90 / 8 / 2 rule",
      ],
      feedback: [
        "09",
        "Loading & recovery",
        "Skeleton, empty, and error states.",
        "§02 Tone of voice · §04 Semantic colors",
      ],
      forms: [
        "10",
        "Forms",
        "Clear labels, guidance, validation, and disabled states.",
        "§08 Surface mapping · §05 Typography (16px UI minimum)",
      ],
      showcase: [
        "11",
        "Plate fan",
        "Three plates in cream poster frames beside the homepage headline, always captioned as illustrations. A soft shadow under the stock; nothing glows.",
        "as amended by ADR-039 — the homepage",
      ],
      homepage: [
        "12",
        "Homepage sections",
        "How a session works as four steps between hairlines, each with where it stands today, and tonight's targets as ruled rows from the platform.",
        "as amended by ADR-039 — the homepage",
      ],
    },
    palette: "Core palette",
    paletteNames: [
      "Night",
      "Deep · wells",
      "Plate",
      "Plate · hover",
      "Rule",
      "Rule · strong",
      "Ink",
      "Ink 2 · secondary",
      "Ink 3 · tertiary",
      "Ink 4 · disabled",
      "Orange · action",
      "Orange · hover",
      "Orange ink · text",
      "Yellow · live",
      "Photon Blue · data",
      "Success",
      "Warning",
      "Error",
    ],
    typography: "Typography",
    fonts: {
      headline: "Anton · Headline — Noto Sans Georgian 800",
      title: "Bowlby One · Sunset title — one line per page",
      label: "Oswald · Spaced label — Noto Sans Georgian 600",
      body: "Geist · Body — FiraGO",
      data: "JetBrains Mono · Data",
    },
    georgianSample: brand.ka.tagline,
    titleSample: "The real sky",
    labelSample: "Tonight · Tbilisi",
    georgianLabelSample: "დღეს ღამით · თბილისი",
    georgianBodySample: "ტელესკოპი ნამდვილად მიბრუნდება შენ მიერ არჩეული ობიექტისკენ.",
    typeScale: {
      display: "The real sky",
      hero: brand.en.tagline,
      h1: "Tonight above the horizon",
      h2: "The instrument is ready",
      h3: "Reserve an observation",
      stat: "14 · 42.7° · 08:12",
      kicker: "Live telescope · Tbilisi",
      "body-lg": "Lead paragraphs and intros",
      body: "Body copy across the product",
      label: "Labels · metadata",
      caption: "Captions and micro-copy",
      mono: "RA 05h 35m 17.3s · DEC −05° 23′ 28″ · EXP 4.0s × 15",
    },
    idle: "Idle",
    liveLabel: "Live",
    observatoryStatuses: {
      ONLINE: "Online",
      PREPARING: "Preparing",
      OBSERVING: "Observing",
      PARKED: "Parked",
      OFFLINE: "Offline",
      WEATHER_HOLD: "Weather hold",
      MAINTENANCE: "Maintenance",
    },
    displaySample: brand.en.tagline,
    bodySample:
      "Instrument-grade interfaces should remain legible, measured, and quiet under low-light conditions.",
    buttons: {
      primary: "Reserve observation",
      secondary: "View details",
      ghost: "Cancel",
      danger: "End observation",
      loading: "Checking sky",
      disabled: "Unavailable",
      small: "Small",
      medium: "Medium",
      large: "Large",
      search: "Search targets",
      locate: "Locate telescope",
    },
    chips: ["Available tonight", "Deep sky", "Selected"],
    simulatedBadge: "Simulated",
    poster: {
      kicker: "Live telescope · Tbilisi",
      headline: "One telescope. Your sky.",
      stats: [
        ["6″", "Aperture"],
        ["1", "Observer at the controls"],
        ["10", "Watching seats"],
      ],
    },
    statusGroups: {
      observatory: "ObservatoryStatus",
      live: "LiveIndicator",
      availability: "TargetAvailability",
      mode: "ModeNotice",
      mission: "MissionStatus",
    },
    cards: {
      eyebrow: "Tonight · 22:40",
      title: "M42 · Orion Nebula",
      description:
        "Emission nebula in Orion with an excellent observation window from Tbilisi.",
      footer: "Available for a 12-minute mission",
      panelTitle: "Surface panel",
      panelDescription:
        "A quiet container for grouped controls, metadata, and observatory information.",
      elevatedTitle: "Elevated panel",
      elevatedDescription:
        "Reserved for focused layers and content that needs stronger separation.",
      captureCard:
        "CaptureCard — a simulated capture with a drawn frame, one with no preview, and the download states",
      slotRow: "SlotRow — available, booked, and held for weather",
      bookingRow:
        "BookingRow — awaiting payment, confirmed, cancelled, expired, refunded",
      bookingActions:
        "BookingActions — cancel, asking to confirm, cancelling, refund, refunding, refund refused",
      reserveForm:
        "ReserveForm — nothing chosen, a target chosen, reserving, opening the payment page, the slot taken",
      missionSteps: "MissionSteps — at a step, complete, and stopped by a failure",
      roomSharing:
        "RoomSharing — private, opening, open with two watching, asking to stop, link copied, session ended",
      watch:
        "WatchView — a seat for sale, buying, loading, error, simulated, full, paying, watching, left, closed by the owner, ended, the owner, not open",
      roomControls:
        "RoomControls — observing, waiting for the telescope, done, refused, no answer, asking to stop, before centring, while capturing, no capture",
      pointingDial:
        "PointingDial — high in the south, low in the west, below the horizon, the telescope slewing to the target, the telescope with no position",
      targetPreview: "TargetPreview — a planet's plate, and a target with none",
      liveFeed:
        "LiveFeed — not started, starting, connecting, live (simulated), reconnecting, offline, weather hold, expired, closed, refused, error",
    },
    overlay: {
      openModal: "Open modal",
      modalTitle: "Confirm observation",
      modalDescription: "Review the target before reserving telescope capacity.",
      modalBody:
        "M42 is observable from 22:40 to 01:15. This design-system example does not schedule a mission.",
      openSheet: "Open sheet",
      sheetTitle: "Observation settings",
      sheetDescription:
        "Secondary controls remain close without leaving the current context.",
      sheetBody:
        "Sheets are intended for compact settings and inspection panels on smaller screens.",
      close: "Close",
      dropdown: "Observation mode",
      options: ["Guided mission", "Scheduled mission", "Private observatory"],
      tooltip: "Coordinates use the J2000 epoch",
      tooltipLabel: "Coordinate information",
    },
    tabs: {
      label: "Target data views",
      overview: "Overview",
      visibility: "Visibility",
      equipment: "Equipment",
      overviewBody: "Scientific context and a concise observation summary.",
      visibilityBody: "Altitude, moon separation, and the predicted observing window.",
      equipmentBody: "The assigned optical train and camera configuration.",
    },
    feedback: {
      loading: "Loading preview",
      emptyTitle: "No captures yet",
      emptyDescription: "Images captured during completed missions will appear here.",
      emptyAction: "Explore targets",
      errorTitle: "Observatory state unavailable",
      errorDescription:
        "The last verified state is preserved while the connection recovers.",
      retry: "Try again",
    },
    form: {
      title: "Mission request",
      target: "Target name",
      targetPlaceholder: "Messier or common name",
      targetHint: "Search uses catalog and common names.",
      notes: "Observation notes",
      notesPlaceholder: "Optional notes for this mission",
      email: "Notification email",
      emailError: "Enter a valid email address.",
      consent: "Notify me when observation begins",
      submit: "Review request",
    },
  },
  ka: {
    metadataTitle: `დიზაინ სისტემა — ${brand.ka.nominative}`,
    metadataDescription: `${brand.ka.genitive} შიდა ვიზუალური სისტემა და კომპონენტების ცნობარი.`,
    eyebrow: "შიდა ცნობარი · 01",
    title: "ვიზუალური სისტემა",
    introduction: `${brand.ka.genitive} პოსტერის ენა, ADR-039: შავი ფონი, კრემისფერი ტექსტი, თბილი პანელები და მაღალი სათაურები. ნარინჯისფერი — ქმედებისთვის, ყვითელი — ყველაფრისთვის, რაც პირდაპირ ეთერშია, ცისფერი — მონაცემებისთვის. არაფერი ანათებს.`,
    internal: "დეველოპერული გვერდი · noindex",
    sections: {
      foundations: [
        "01",
        "საფუძვლები",
        "ფერების როლები და ხუთი შრიფტი, ქართულის ჩათვლით.",
        "as amended by ADR-039 — ground and ink, colour roles, type",
      ],
      typeScale: [
        "02",
        "ტიპოგრაფიული შკალა",
        "პროდუქტში ყველა ზომა ამ შკალიდან მოდის.",
        "as amended by ADR-039 — type",
      ],
      poster: [
        "03",
        "ზედწარწერა და მაჩვენებლები",
        "ნარინჯისფერი ზედწარწერა სათაურის ზემოთ; დიდი ციფრები წარწერების ზემოთ, თხელი ხაზის ქვეშ.",
        "as amended by ADR-039 — components",
      ],
      actions: [
        "04",
        "ქმედებები და არჩევა",
        "ერთი ნარინჯისფერი მთავარი ღილაკი; კონტურიანი, უფონო და საშიში; ჩიპები და სიმულაციის ნიშანი. ფოკუსი — ცისფერი რგოლი.",
        "as amended by ADR-039 — components",
      ],
      statuses: [
        "05",
        "ოპერაციული სტატუსი",
        "მდგომარეობა ტექსტით, ფორმითა და თავშეკავებული ფერით.",
        "§04 Semantic colors · §08 Live observation page, rule 04",
      ],
      surfaces: [
        "06",
        "ზედაპირები",
        "ბარათები და პანელები მშვიდი ინფორმაციული იერარქიისთვის.",
        "§08 Surface mapping · §07 Iconography (card radius)",
      ],
      overlays: [
        "07",
        "ზედდებული ფენები",
        "მოდალი, გვერდითი პანელი, ჩამონათვალი და მინიშნება.",
        `§08 Surface mapping · §09 What ${brand.en.name} must never be, 04`,
      ],
      navigation: [
        "08",
        "ტაბები",
        "კლავიატურით მართვადი კომპაქტური ნავიგაცია.",
        "§08 Surface mapping · §04 The 90 / 8 / 2 rule",
      ],
      feedback: [
        "09",
        "ჩატვირთვა და აღდგენა",
        "ჩატვირთვის, ცარიელი და შეცდომის მდგომარეობები.",
        "§02 Tone of voice · §04 Semantic colors",
      ],
      forms: [
        "10",
        "ფორმები",
        "გასაგები ეტიკეტები, მინიშნებები და ვალიდაცია.",
        "§08 Surface mapping · §05 Typography (16px UI minimum)",
      ],
      showcase: [
        "11",
        "ფირფიტების მარაო",
        "სამი ფირფიტა კრემისფერ ჩარჩოებში მთავარი გვერდის სათაურის გვერდით, ყოველთვის ილუსტრაციის წარწერით. რბილი ჩრდილი ქვემოთ; არაფერი ანათებს.",
        "as amended by ADR-039 — the homepage",
      ],
      homepage: [
        "12",
        "მთავარი გვერდის სექციები",
        "როგორ მიმდინარეობს სესია — ოთხი ნაბიჯი თხელ ხაზებს შორის, თითოეული იმით, სად დგას დღეს, და დღევანდელი სამიზნეები პლატფორმიდან, ხაზებით გაყოფილ რიგებად.",
        "as amended by ADR-039 — the homepage",
      ],
    },
    palette: "ძირითადი პალიტრა",
    paletteNames: [
      "ღამე",
      "სიღრმე · ჭები",
      "პანელი",
      "პანელი · კურსორის მიტანისას",
      "ხაზი",
      "ხაზი · მკვეთრი",
      "ტექსტი",
      "ტექსტი 2 · მეორადი",
      "ტექსტი 3 · მესამეული",
      "ტექსტი 4 · გამორთული",
      "ნარინჯისფერი · ქმედება",
      "ნარინჯისფერი · კურსორის მიტანისას",
      "ნარინჯისფერი ტექსტი",
      "ყვითელი · პირდაპირი",
      "ცისფერი · მონაცემები",
      "წარმატება",
      "გაფრთხილება",
      "შეცდომა",
    ],
    typography: "ტიპოგრაფია",
    fonts: {
      headline: "Anton · სათაური — Noto Sans Georgian 800",
      title: "Bowlby One · მზის ჩასვლის სათაური — ერთი ხაზი გვერდზე",
      label: "Oswald · ეტიკეტი — Noto Sans Georgian 600",
      body: "Geist · ტექსტი — FiraGO",
      data: "JetBrains Mono · მონაცემები",
    },
    georgianSample: brand.ka.tagline,
    titleSample: "The real sky",
    labelSample: "Tonight · Tbilisi",
    georgianLabelSample: "დღეს ღამით · თბილისი",
    georgianBodySample: "ტელესკოპი ნამდვილად მიბრუნდება შენ მიერ არჩეული ობიექტისკენ.",
    typeScale: {
      display: "ნამდვილი ცა",
      hero: brand.ka.tagline,
      h1: "დღეს ღამით ჰორიზონტის ზემოთ",
      h2: "ინსტრუმენტი მზადაა",
      h3: "დაკვირვების დაჯავშნა",
      stat: "14 · 42.7° · 08:12",
      kicker: "ცოცხალი ტელესკოპი · თბილისი",
      "body-lg": "შესავალი აბზაცები",
      body: "ძირითადი ტექსტი მთელ პროდუქტში",
      label: "ეტიკეტები · მეტამონაცემები",
      caption: "წარწერები და მოკლე ტექსტი",
      mono: "RA 05h 35m 17.3s · DEC −05° 23′ 28″ · EXP 4.0s × 15",
    },
    idle: "უმოქმედო",
    liveLabel: "პირდაპირი",
    observatoryStatuses: {
      ONLINE: "ონლაინ",
      PREPARING: "მზადდება",
      OBSERVING: "დაკვირვება მიმდინარეობს",
      PARKED: "გაჩერებულია",
      OFFLINE: "ოფლაინ",
      WEATHER_HOLD: "ამინდის გამო შეჩერებულია",
      MAINTENANCE: "ტექნიკური მომსახურება",
    },
    displaySample: brand.ka.tagline,
    bodySample:
      "ინსტრუმენტული ინტერფეისი დაბალი განათების პირობებშიც მკაფიო, გაწონასწორებული და მშვიდი უნდა დარჩეს.",
    buttons: {
      primary: "დაკვირვების დაჯავშნა",
      secondary: "დეტალების ნახვა",
      ghost: "გაუქმება",
      danger: "დაკვირვების დასრულება",
      loading: "ცის შემოწმება",
      disabled: "მიუწვდომელია",
      small: "პატარა",
      medium: "საშუალო",
      large: "დიდი",
      search: "სამიზნეების ძიება",
      locate: "ტელესკოპის პოვნა",
    },
    chips: ["ხელმისაწვდომია დღეს", "ღრმა ცა", "არჩეულია"],
    simulatedBadge: "სიმულაცია",
    poster: {
      kicker: "ცოცხალი ტელესკოპი · თბილისი",
      headline: "ერთი ტელესკოპი. შენი ცა.",
      stats: [
        ["6″", "აპერტურა"],
        ["1", "დამკვირვებელი მართვის პულტთან"],
        ["10", "მაყურებლის ადგილი"],
      ],
    },
    statusGroups: {
      observatory: "ObservatoryStatus",
      live: "LiveIndicator",
      availability: "TargetAvailability",
      mode: "ModeNotice",
      mission: "MissionStatus",
    },
    cards: {
      eyebrow: "დღეს · 22:40",
      title: "M42 · ორიონის ნისლეული",
      description:
        "ემისიური ნისლეული ორიონში, თბილისიდან დაკვირვებისთვის შესანიშნავი დროის მონაკვეთით.",
      footer: "ხელმისაწვდომია 12-წუთიანი მისიისთვის",
      panelTitle: "ზედაპირის პანელი",
      panelDescription:
        "მშვიდი კონტეინერი მართვის ელემენტებისა და ობსერვატორიის მონაცემებისთვის.",
      elevatedTitle: "ამაღლებული პანელი",
      elevatedDescription:
        "გამოიყენება ფოკუსირებულ ფენებსა და მკაფიოდ გამოსაყოფ კონტენტში.",
      captureCard:
        "CaptureCard — სიმულირებული კადრი დახატული გამოსახულებით, კადრი მინიატურის გარეშე და ჩამოტვირთვის მდგომარეობები",
      slotRow: "SlotRow — თავისუფალი, დაჯავშნილი და ამინდის გამო შეჩერებული",
      bookingRow:
        "BookingRow — გადახდას ელოდება, დადასტურებული, გაუქმებული, ვადაგასული, თანხა დაბრუნებული",
      bookingActions:
        "BookingActions — გაუქმება, დადასტურების კითხვა, უქმდება, თანხის დაბრუნება, ბრუნდება, დაბრუნება უარყოფილია",
      reserveForm:
        "ReserveForm — არაფერია არჩეული, ობიექტი არჩეულია, იჯავშნება, იხსნება გადახდის გვერდი, დრო დაკავებულია",
      missionSteps: "MissionSteps — მიმდინარე ნაბიჯი, დასრულებული და შეცდომით შეჩერებული",
      roomSharing:
        "RoomSharing — პირადი, იხსნება, ღიაა ორი მაყურებლით, შეწყვეტის კითხვა, ბმული დაკოპირდა, სესია დასრულდა",
      watch:
        "WatchView — ადგილი იყიდება, იყიდება, იტვირთება, შეცდომა, სიმულირებული, სავსეა, გადახდის მოლოდინი, ყურება, გასული, მფლობელმა დახურა, დასრულდა, მფლობელი, არ არის ღია",
      roomControls:
        "RoomControls — დაკვირვება, ტელესკოპის მოლოდინი, შესრულდა, უარი, პასუხი არ არის, შეჩერების კითხვა, ცენტრირებამდე, გადაღებისას, გადაღების გარეშე",
      pointingDial:
        "PointingDial — მაღლა სამხრეთით, დაბლა დასავლეთით, ჰორიზონტს ქვემოთ, ტელესკოპი ობიექტისკენ მიიწევს, ტელესკოპი მდებარეობის გარეშე",
      targetPreview: "TargetPreview — პლანეტის ილუსტრაცია და ობიექტი ილუსტრაციის გარეშე",
      liveFeed:
        "LiveFeed — დაუწყებელი, იწყება, კავშირი მყარდება, პირდაპირი (სიმულირებული), კავშირი აღდგება, ოფლაინ, ამინდის გამო შეჩერებული, დრო ამოწურული, დახურული, უარყოფილი, შეცდომა",
    },
    overlay: {
      openModal: "მოდალის გახსნა",
      modalTitle: "დაკვირვების დადასტურება",
      modalDescription: "ტელესკოპის დროის დაჯავშნამდე შეამოწმეთ სამიზნე.",
      modalBody:
        "M42-ზე დაკვირვება შესაძლებელია 22:40-დან 01:15-მდე. ეს მაგალითი მისიას არ გეგმავს.",
      openSheet: "პანელის გახსნა",
      sheetTitle: "დაკვირვების პარამეტრები",
      sheetDescription: "დამატებითი მართვა მიმდინარე კონტექსტიდან გასვლის გარეშე.",
      sheetBody:
        "გვერდითი პანელი გამოიყენება კომპაქტური პარამეტრებისა და ინსპექტირებისთვის.",
      close: "დახურვა",
      dropdown: "დაკვირვების რეჟიმი",
      options: ["მართვადი მისია", "დაგეგმილი მისია", "პირადი ობსერვატორია"],
      tooltip: "კოორდინატები იყენებს J2000 ეპოქას",
      tooltipLabel: "ინფორმაცია კოორდინატებზე",
    },
    tabs: {
      label: "სამიზნის მონაცემები",
      overview: "მიმოხილვა",
      visibility: "ხილვადობა",
      equipment: "აღჭურვილობა",
      overviewBody: "სამეცნიერო კონტექსტი და დაკვირვების მოკლე აღწერა.",
      visibilityBody: "სიმაღლე, მთვარესთან დაშორება და დაკვირვების სავარაუდო დრო.",
      equipmentBody: "მინიჭებული ოპტიკური სისტემა და კამერის კონფიგურაცია.",
    },
    feedback: {
      loading: "პრევიუს ჩატვირთვა",
      emptyTitle: "სურათები ჯერ არ არის",
      emptyDescription: "დასრულებული მისიების დროს გადაღებული სურათები აქ გამოჩნდება.",
      emptyAction: "სამიზნეების ნახვა",
      errorTitle: "ობსერვატორიის სტატუსი მიუწვდომელია",
      errorDescription: "ბოლო დადასტურებული მდგომარეობა ინახება კავშირის აღდგენამდე.",
      retry: "ხელახლა ცდა",
    },
    form: {
      title: "მისიის მოთხოვნა",
      target: "სამიზნის სახელი",
      targetPlaceholder: "მესიეს ან გავრცელებული სახელი",
      targetHint: "ძიება იყენებს კატალოგურ და გავრცელებულ სახელებს.",
      notes: "დაკვირვების შენიშვნები",
      notesPlaceholder: "ამ მისიის დამატებითი შენიშვნები",
      email: "შეტყობინების ელფოსტა",
      emailError: "შეიყვანეთ სწორი ელფოსტის მისამართი.",
      consent: "შემატყობინე დაკვირვების დაწყებისას",
      submit: "მოთხოვნის შემოწმება",
    },
  },
} as const satisfies Record<Locale, object>;

/**
 * TargetCard specimens, observable and blocked. Shapes from the contract with
 * values chosen to exercise both states; nothing here is a reading of the sky.
 */
const specimenTarget = {
  positionSource: "EPHEMERIS",
  coordinates: null,
  catalogId: null,
  descriptionEn: null,
  descriptionKa: null,
  previewImageUrl: null,
  opticalConfig: "F20_BARLOW",
  imagingProfile: "PLANETARY",
  minAltitudeDegrees: 25,
  expectedMissionMinutes: 15,
  enabled: true,
} as const;

const specimenVisibility = {
  evaluatedAt: "2026-09-25T18:00:00Z",
  sunAltitudeDegrees: -24,
  moonSeparationDegrees: 80,
  risesAt: "2026-09-25T15:10:00Z",
  setsAt: "2026-09-26T01:40:00Z",
} as const;

export const targetSpecimens: TonightTarget[] = [
  {
    target: {
      ...specimenTarget,
      id: "00000000-0000-4000-8000-00000000d501",
      slug: "specimen-observable",
      type: "PLANET",
      nameEn: "Saturn",
      nameKa: "სატურნი",
      solarSystemBody: "SATURN",
      angularSizeArcmin: 0.3,
      magnitude: 0.6,
    },
    visibility: {
      ...specimenVisibility,
      observable: true,
      horizontal: { altitudeDegrees: 38, azimuthDegrees: 170 },
      blockReasons: [],
    },
  },
  {
    target: {
      ...specimenTarget,
      id: "00000000-0000-4000-8000-00000000d502",
      slug: "specimen-blocked",
      type: "PLANET",
      nameEn: "Venus",
      nameKa: "ვენერა",
      solarSystemBody: "VENUS",
      angularSizeArcmin: 0.4,
      magnitude: -4.1,
    },
    visibility: {
      ...specimenVisibility,
      observable: false,
      horizontal: { altitudeDegrees: -12, azimuthDegrees: 280 },
      blockReasons: ["BELOW_HORIZON"],
    },
  },
];

/**
 * CaptureCard specimens. The frame is a drawn field of points in a data URI, shown
 * only under the simulated badge: nothing on this page is telescope output.
 */
const specimenFrame = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#05080d"/>${Array.from(
    { length: 60 },
    (_, index) => {
      const angle = index * 2.39996;
      const radius = 4 + Math.sqrt(index) * 22;
      return `<circle cx="${(200 + Math.cos(angle) * radius).toFixed(1)}" cy="${(200 + Math.sin(angle) * radius).toFixed(1)}" r="${(2.6 - index / 30).toFixed(2)}" fill="#dfe6ec"/>`;
    },
  ).join("")}</svg>`,
)}`;

const specimenTitle = { en: "Hercules Cluster", ka: "ჰერკულესის გროვა" } as const;

export const captureSpecimens = [
  {
    title: specimenTitle,
    captureId: "specimen-simulated",
    thumbnail: specimenFrame,
    simulated: true,
    visibility: "PRIVATE",
    capturedAt: "2026-09-22T20:10:00Z",
  },
  {
    title: specimenTitle,
    captureId: "specimen-no-preview",
    thumbnail: null,
    simulated: false,
    visibility: "GALLERY",
    capturedAt: "2026-09-22T20:02:00Z",
  },
] as const;

/** SlotRow specimens: one of each state a night can show. Not a reading of any night. */
export const slotSpecimens = [
  { available: true, unavailableReason: null, startAt: "2026-09-26T14:00:00Z" },
  {
    available: false,
    unavailableReason: "ALREADY_BOOKED",
    startAt: "2026-09-26T14:40:00Z",
  },
  {
    available: false,
    unavailableReason: "WEATHER_HOLD",
    startAt: "2026-09-26T15:20:00Z",
  },
].map((slot) => ({
  ...slot,
  endAt: new Date(Date.parse(slot.startAt) + 30 * 60_000).toISOString(),
  durationMinutes: 30,
  priceMinor: 4500,
  currency: "GEL" as const,
  unavailableReason: slot.unavailableReason as "ALREADY_BOOKED" | "WEATHER_HOLD" | null,
}));

/** PointingDial specimens: positions, not a reading of any sky. */
export const dialSpecimens = [
  { altitudeDegrees: 42.1, azimuthDegrees: 143.6 },
  { altitudeDegrees: 8.5, azimuthDegrees: 281 },
  { altitudeDegrees: -12, azimuthDegrees: 20 },
] as const;

/** A history for the stopped MissionSteps specimen: slewing, then a hardware error. */
export const stepSpecimenHistory = (
  ["SCHEDULED", "SLEWING", "HARDWARE_ERROR"] as const
).map((state, index): MissionEvent => ({
  id: `70000000-0000-4000-8000-00000000000${index}`,
  missionId: "20000000-0000-4000-8000-000000000001",
  at: `2026-09-23T20:0${index}:00.000Z`,
  state,
  failureReason: state === "HARDWARE_ERROR" ? "MOUNT_FAULT" : null,
  source: "AGENT",
  commandId: null,
  detail: null,
}));
