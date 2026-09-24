import type { Locale } from "@/i18n/config";

const en = {
  metadataTitle: "Stellar · Observatory status",
  metadataDescription:
    "Live status of the Stellar observatory in Tbilisi, and tonight's viewing conditions.",
  eyebrow: "OBSERVATORY STATUS",
  title: "What the telescope is doing now.",
  introduction:
    "Read straight from the observatory. Nothing on this page is estimated, and nothing is shown that the platform did not report.",
  updated: "Reported {age} ago",
  age: { seconds: "{value} s", minutes: "{value} min", hours: "{value} h" },
  mode: {
    SIMULATED: {
      banner: "SIMULATED OBSERVATORY",
      detail: "The simulator is answering. No real telescope is moving.",
    },
    REAL: {
      banner: "REAL HARDWARE",
      detail: "The physical telescope is answering.",
    },
  },
  now: {
    title: "Right now",
    link: "Observatory link",
    weather: "Weather",
    weatherSource: "Reported by",
    hold: "Weather hold",
    holdActive: "Observing is held",
    holdInactive: "No hold",
    mission: "Observation in progress",
    target: "Current target",
    lastMission: "Last completed observation",
    never: "None yet",
    none: "None",
    unknown: "Unknown",
    yes: "Yes",
    no: "No",
  },
  link: {
    ONLINE: "Online",
    DEGRADED: "Degraded",
    OFFLINE: "Offline",
  },
  linkDetail: {
    ONLINE: "The observatory is connected and reporting.",
    DEGRADED: "The observatory is connected, but a check is late.",
    OFFLINE: "The observatory is not connected, so nothing here is current.",
  },
  weather: {
    CLEAR: "Clear",
    CLOUDY: "Cloudy",
    UNSAFE: "Unsafe",
    UNKNOWN: "Unknown",
  },
  weatherSource: { OPERATOR: "The operator", SENSOR: "A sensor at the observatory" },
  conditions: {
    title: "Tonight's conditions",
    detail:
      "An hourly forecast for tonight's bookable hours. Advisory only: a forecast never starts or clears a weather hold, and the operator's hold above is what decides whether observing runs.",
    empty: "Tonight offers no bookable hours.",
    hour: "Hour",
    cloud: "Cloud",
    cloudLayers: "Low / mid / high",
    precipitation: "Precipitation",
    humidity: "Humidity",
    wind: "Wind",
    seeing: "Seeing",
    unknown: "Unknown",
    unknownHour: "No forecast is stored for this hour.",
    source: "Forecast from {source}, fetched {age} ago.",
    sources: { METEOBLUE: "meteoblue", OPEN_METEO: "Open-Meteo" },
  },
  unavailable: {
    title: "Status is unavailable",
    detail:
      "The Stellar platform did not answer, so this page has nothing current to show. It shows no older reading rather than presenting a stale one as live.",
  },
  noObservatory: {
    title: "No observatory is listed",
    detail: "The platform lists no bookable observatory to report on.",
  },
  back: "Return to Stellar",
};

export const statusCopy = {
  en,
  ka: {
    metadataTitle: "სტელარი · ობსერვატორიის სტატუსი",
    metadataDescription:
      "სტელარის თბილისის ობსერვატორიის მიმდინარე სტატუსი და ამაღამის დაკვირვების პირობები.",
    eyebrow: "ობსერვატორიის სტატუსი",
    title: "რას აკეთებს ტელესკოპი ახლა.",
    introduction:
      "წაკითხულია პირდაპირ ობსერვატორიიდან. ამ გვერდზე არაფერია ნავარაუდევი და არაფერი ჩანს ისეთი, რაც პლატფორმას არ მოუწოდებია.",
    updated: "მიღებულია {age} წინ",
    age: { seconds: "{value} წმ", minutes: "{value} წთ", hours: "{value} სთ" },
    mode: {
      SIMULATED: {
        banner: "SIMULATED OBSERVATORY",
        detail: "პასუხობს სიმულატორი. ნამდვილი ტელესკოპი არ მოძრაობს.",
      },
      REAL: {
        banner: "ნამდვილი აპარატურა",
        detail: "პასუხობს ფიზიკური ტელესკოპი.",
      },
    },
    now: {
      title: "ახლა",
      link: "ობსერვატორიის კავშირი",
      weather: "ამინდი",
      weatherSource: "მონაცემის წყარო",
      hold: "ამინდის შეჩერება",
      holdActive: "დაკვირვება შეჩერებულია",
      holdInactive: "შეჩერება არ არის",
      mission: "მიმდინარე დაკვირვება",
      target: "მიმდინარე ობიექტი",
      lastMission: "ბოლო დასრულებული დაკვირვება",
      never: "ჯერ არ ყოფილა",
      none: "არცერთი",
      unknown: "უცნობია",
      yes: "კი",
      no: "არა",
    },
    link: {
      ONLINE: "ონლაინ",
      DEGRADED: "არასტაბილური",
      OFFLINE: "ოფლაინ",
    },
    linkDetail: {
      ONLINE: "ობსერვატორია დაკავშირებულია და მონაცემებს აგზავნის.",
      DEGRADED: "ობსერვატორია დაკავშირებულია, მაგრამ შემოწმება იგვიანებს.",
      OFFLINE: "ობსერვატორია დაკავშირებული არ არის, ამიტომ აქ არაფერია მიმდინარე.",
    },
    weather: {
      CLEAR: "მოწმენდილი",
      CLOUDY: "ღრუბლიანი",
      UNSAFE: "სახიფათო",
      UNKNOWN: "უცნობია",
    },
    weatherSource: { OPERATOR: "ოპერატორი", SENSOR: "ობსერვატორიის სენსორი" },
    conditions: {
      title: "ამაღამის პირობები",
      detail:
        "საათობრივი პროგნოზი ამაღამის სამუშაო საათებისთვის. მხოლოდ საინფორმაციოა: პროგნოზი ამინდის შეჩერებას არც იწყებს და არც ხსნის — ამას ზემოთ მითითებული ოპერატორის შეჩერება წყვეტს.",
      empty: "ამაღამ სამუშაო საათები არ არის.",
      hour: "საათი",
      cloud: "ღრუბლიანობა",
      cloudLayers: "დაბალი / საშუალო / მაღალი",
      precipitation: "ნალექი",
      humidity: "ტენიანობა",
      wind: "ქარი",
      seeing: "სიმშვიდე",
      unknown: "უცნობია",
      unknownHour: "ამ საათისთვის პროგნოზი შენახული არ არის.",
      source: "პროგნოზი: {source}, მიღებულია {age} წინ.",
      sources: { METEOBLUE: "meteoblue", OPEN_METEO: "Open-Meteo" },
    },
    unavailable: {
      title: "სტატუსი მიუწვდომელია",
      detail:
        "სტელარის პლატფორმამ არ უპასუხა, ამიტომ ამ გვერდს მიმდინარე მონაცემი არ აქვს. ძველ მონაცემს მიმდინარედ არ აჩვენებს — სჯობს არაფერი აჩვენოს.",
    },
    noObservatory: {
      title: "ობსერვატორია არ არის",
      detail: "პლატფორმა არცერთ ხელმისაწვდომ ობსერვატორიას არ აბრუნებს.",
    },
    back: "სტელარზე დაბრუნება",
  },
} as const satisfies Record<Locale, typeof en>;

export type StatusCopy = (typeof statusCopy)[Locale];
