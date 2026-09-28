import type { MissionEvent, TonightTarget } from "@darkview/contracts";
import type { Locale } from "@/i18n/config";

import { brand } from "@/brand";

export const designSystemCopy = {
  en: {
    metadataTitle: `Design system — ${brand.en.name}`,
    metadataDescription: `Internal ${brand.en.name} visual system and component reference.`,
    eyebrow: "Internal reference · 01",
    title: "Visual system",
    introduction:
      "A restrained interface language for observing real skies: high-contrast structure, optical precision, and Photon Blue reserved for active states.",
    internal: "Development route · noindex",
    sections: {
      foundations: [
        "01",
        "Foundations",
        "Color, type, spacing, radius, and elevation tokens.",
        "§04 Color · §05 Typography · §11 Developer cheat sheet",
      ],
      typeScale: [
        "02",
        "Type scale",
        "Every size in the product comes from this scale.",
        "§05 Type scale",
      ],
      actions: [
        "03",
        "Actions & selection",
        "Buttons, icon actions, chips, and focus behavior.",
        "§08 Button styles · §07 Iconography",
      ],
      statuses: [
        "04",
        "Operational status",
        "Observable state with text, shape, and restrained color.",
        "§04 Semantic colors · §08 Live observation page, rule 04",
      ],
      surfaces: [
        "05",
        "Surfaces",
        "Cards and panels for calm information hierarchy.",
        "§08 Surface mapping · §07 Iconography (card radius)",
      ],
      overlays: [
        "06",
        "Overlays & disclosure",
        "Native modal, sheet, dropdown, and tooltip behavior.",
        `§08 Surface mapping · §09 What ${brand.en.name} must never be, 04`,
      ],
      navigation: [
        "07",
        "Tabs",
        "Compact keyboard-navigable content switching.",
        "§08 Surface mapping · §04 The 90 / 8 / 2 rule",
      ],
      feedback: [
        "08",
        "Loading & recovery",
        "Skeleton, empty, and error states.",
        "§02 Tone of voice · §04 Semantic colors",
      ],
      forms: [
        "09",
        "Forms",
        "Clear labels, guidance, validation, and disabled states.",
        "§08 Surface mapping · §05 Typography (16px UI minimum)",
      ],
      showcase: [
        "10",
        "Planet hero",
        "The homepage hero: one featured planet, and two more that feature themselves on press. Its own type, colour and glow, by ADR-029.",
        "ADR-029 · overrides §05 and §09 for this hero only",
      ],
      homepage: [
        "11",
        "Homepage sections",
        "Below the hero, in its language: tonight's rail with its filters and steps, the white and quiet pills that lean toward the pointer, and the counters.",
        "ADR-030 · the hero's type and colour, without its glow",
      ],
    },
    palette: "Core palette",
    paletteNames: [
      `${brand.en.name} Night`,
      "Surface",
      "Observatory Blue",
      "Surface hover",
      "Border",
      "Instrument",
      "Secondary text",
      "Tertiary text",
      "Photon Blue",
      "Deep Signal",
      "Success",
      "Warning",
      "Error",
      "Info",
    ],
    typography: "Typography",
    displayFont: "Noto Serif Georgian · Display",
    bodyFont: "FiraGO · UI / Body",
    monoFont: "IBM Plex Mono · Data",
    typeScale: {
      hero: brand.en.tagline,
      h1: "Tonight above the horizon",
      h2: "The instrument is ready",
      h3: "Reserve an observation",
      "body-lg": "Lead paragraphs and intros",
      body: "Body copy across the product",
      label: "Labels · metadata",
      caption: "Captions and micro-copy",
      mono: "RA 05h 35m 17.3s · DEC −05° 23′ 28″ · EXP 4.0s × 15",
    },
    opticalLabel: `${brand.en.name} optical interface motif`,
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
      search: "Search targets",
      locate: "Locate telescope",
    },
    chips: ["Available tonight", "Deep sky", "Selected"],
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
      targetCard: "TargetCard — observable and blocked specimens",
      captureCard:
        "CaptureCard — a simulated capture with a drawn frame, one with no preview, and the download states",
      slotRow: "SlotRow — available, booked, and held for weather",
      missionSteps: "MissionSteps — at a step, complete, and stopped by a failure",
      pointingDial:
        "PointingDial — high in the south, low in the west, below the horizon",
      targetPreview: "TargetPreview — a planet's plate, and a target with none",
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
    introduction:
      "რეალურ ცაზე დაკვირვებისთვის შექმნილი თავშეკავებული ინტერფეისი: მაღალი კონტრასტი, ოპტიკური სიზუსტე და ცისფერი მხოლოდ აქტიური მდგომარეობებისთვის.",
    internal: "დეველოპერული გვერდი · noindex",
    sections: {
      foundations: [
        "01",
        "საფუძვლები",
        "ფერის, ტიპოგრაფიის, სივრცის, რადიუსისა და ჩრდილის ტოკენები.",
        "§04 Color · §05 Typography · §11 Developer cheat sheet",
      ],
      typeScale: [
        "02",
        "ტიპოგრაფიული შკალა",
        "პროდუქტში ყველა ზომა ამ შკალიდან მოდის.",
        "§05 Type scale",
      ],
      actions: [
        "03",
        "ქმედებები და არჩევა",
        "ღილაკები, იკონები, ჩიპები და ფოკუსის ქცევა.",
        "§08 Button styles · §07 Iconography",
      ],
      statuses: [
        "04",
        "ოპერაციული სტატუსი",
        "მდგომარეობა ტექსტით, ფორმითა და თავშეკავებული ფერით.",
        "§04 Semantic colors · §08 Live observation page, rule 04",
      ],
      surfaces: [
        "05",
        "ზედაპირები",
        "ბარათები და პანელები მშვიდი ინფორმაციული იერარქიისთვის.",
        "§08 Surface mapping · §07 Iconography (card radius)",
      ],
      overlays: [
        "06",
        "ზედდებული ფენები",
        "მოდალი, გვერდითი პანელი, ჩამონათვალი და მინიშნება.",
        `§08 Surface mapping · §09 What ${brand.en.name} must never be, 04`,
      ],
      navigation: [
        "07",
        "ტაბები",
        "კლავიატურით მართვადი კომპაქტური ნავიგაცია.",
        "§08 Surface mapping · §04 The 90 / 8 / 2 rule",
      ],
      feedback: [
        "08",
        "ჩატვირთვა და აღდგენა",
        "ჩატვირთვის, ცარიელი და შეცდომის მდგომარეობები.",
        "§02 Tone of voice · §04 Semantic colors",
      ],
      forms: [
        "09",
        "ფორმები",
        "გასაგები ეტიკეტები, მინიშნებები და ვალიდაცია.",
        "§08 Surface mapping · §05 Typography (16px UI minimum)",
      ],
      showcase: [
        "10",
        "პლანეტების ეკრანი",
        "მთავარი გვერდის პირველი ეკრანი: ერთი რჩეული პლანეტა და ორი სხვა, რომლებიც დაჭერისას მის ადგილს იკავებს. საკუთარი შრიფტით, ფერით და ნათებით — ADR-029.",
        "ADR-029 · overrides §05 and §09 for this hero only",
      ],
      homepage: [
        "11",
        "მთავარი გვერდის სექციები",
        "პირველი ეკრანის ქვემოთ, მისივე ენით: დღევანდელი სამიზნეების ზოლი ფილტრებითა და ღილაკებით, თეთრი და მშვიდი ღილაკები, რომლებიც კურსორისკენ იხრება, და მთვლელები.",
        "ADR-030 · the hero's type and colour, without its glow",
      ],
    },
    palette: "ძირითადი პალიტრა",
    paletteNames: [
      `ფონი · ${brand.en.name} Night`,
      "ზედაპირი",
      "ამაღლებული ზედაპირი · Observatory Blue",
      "ზედაპირი კურსორის მიტანისას",
      "საზღვარი",
      "ძირითადი ტექსტი · Instrument",
      "მეორადი ტექსტი",
      "მესამეული ტექსტი",
      "აქცენტი · Photon Blue",
      "Deep Signal",
      "წარმატება",
      "გაფრთხილება",
      "შეცდომა",
      "ინფორმაცია",
    ],
    typography: "ტიპოგრაფია",
    displayFont: "Noto Serif Georgian · სათაური",
    bodyFont: "FiraGO · ინტერფეისი / ტექსტი",
    monoFont: "IBM Plex Mono · მონაცემები",
    typeScale: {
      hero: brand.ka.tagline,
      h1: "დღეს ღამით ჰორიზონტის ზემოთ",
      h2: "ინსტრუმენტი მზადაა",
      h3: "დაკვირვების დაჯავშნა",
      "body-lg": "შესავალი აბზაცები",
      body: "ძირითადი ტექსტი მთელ პროდუქტში",
      label: "ეტიკეტები · მეტამონაცემები",
      caption: "წარწერები და მოკლე ტექსტი",
      mono: "RA 05h 35m 17.3s · DEC −05° 23′ 28″ · EXP 4.0s × 15",
    },
    opticalLabel: `${brand.ka.genitive} ოპტიკური ინტერფეისის მოტივი`,
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
      search: "სამიზნეების ძიება",
      locate: "ტელესკოპის პოვნა",
    },
    chips: ["ხელმისაწვდომია დღეს", "ღრმა ცა", "არჩეულია"],
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
      targetCard: "TargetCard — დაკვირვებადი და დაბლოკილი ნიმუშები",
      captureCard:
        "CaptureCard — სიმულირებული კადრი დახატული გამოსახულებით, კადრი მინიატურის გარეშე და ჩამოტვირთვის მდგომარეობები",
      slotRow: "SlotRow — თავისუფალი, დაჯავშნილი და ამინდის გამო შეჩერებული",
      missionSteps: "MissionSteps — მიმდინარე ნაბიჯი, დასრულებული და შეცდომით შეჩერებული",
      pointingDial: "PointingDial — მაღლა სამხრეთით, დაბლა დასავლეთით, ჰორიზონტს ქვემოთ",
      targetPreview: "TargetPreview — პლანეტის ილუსტრაცია და ობიექტი ილუსტრაციის გარეშე",
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
