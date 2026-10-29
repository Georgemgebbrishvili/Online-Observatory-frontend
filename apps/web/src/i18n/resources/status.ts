import type { Locale } from "@/i18n/config";
import { brand } from "@/brand";

const en = {
  metadataTitle: `Observatory status · ${brand.en.name}`,
  metadataDescription: `Observatory status and tonight's sky.`,
  title: "Telescope status",
  updated: "Reported {age} ago",
  age: { seconds: "{value} s", minutes: "{value} min", hours: "{value} h" },
  mode: {
    SIMULATED: {
      banner: "SIMULATED OBSERVATORY",
      detail: "Simulator only. No real telescope is moving.",
    },
    REAL: {
      banner: "REAL HARDWARE",
      detail: "The real telescope is connected.",
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
    ONLINE: "Connected.",
    DEGRADED: "Connected, but slow to respond.",
    OFFLINE: "Not connected. Data may be old.",
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
      "Hourly forecast. For guidance only; the operator decides on weather holds.",
    empty: "No bookable hours tonight.",
    hour: "Hour",
    cloud: "Cloud",
    cloudLayers: "Low / mid / high",
    precipitation: "Precipitation",
    humidity: "Humidity",
    wind: "Wind",
    seeing: "Seeing",
    chartCaption: "Cloud cover by hour",
    tableLabel: "Hourly forecast table",
    unknown: "Unknown",
    unknownHour: "No forecast is stored for this hour.",
    source: "Forecast from {source}, fetched {age} ago.",
    sources: { METEOBLUE: "meteoblue", OPEN_METEO: "Open-Meteo" },
  },
  uptime: {
    title: "The last 30 days",
    summary: "connected over the last 30 days",
    notMeasured:
      "No data yet.",
    daysLabel: "Connection by day, oldest first",
    dayLabel: "{date}: {value}",
    today: "Today",
    legendLabel: "Key",
    legend: {
      up: "Connected",
      partial: "Some interruption",
      down: "Mostly offline",
      unmeasured: "Not measured",
    },
    incidentsTitle: "Recent interruptions",
    noIncidents: "No interruption in the last 30 days.",
    incident: "{from}, for {minutes} min",
    ongoing: "Since {from}, still offline",
    detail:
      "Connection to our servers. Weather can still close it.",
    unavailable: "Couldn't load history.",
  },
  unavailable: {
    title: "Status is unavailable",
    detail: "Our servers didn't answer. Try again soon.",
  },
  noObservatory: {
    title: "No observatory is listed",
    detail: "No bookable observatory yet.",
  },
  back: `Return to ${brand.en.name}`,
};

export const statusCopy = {
  en,
  ka: {
    metadataTitle: `ობსერვატორიის სტატუსი · ${brand.ka.nominative}`,
    metadataDescription: `ობსერვატორიის სტატუსი და ამაღამინდელი ცა.`,
    title: "ტელესკოპის სტატუსი",
    updated: "მიღებულია {age} წინ",
    age: { seconds: "{value} წმ", minutes: "{value} წთ", hours: "{value} სთ" },
    mode: {
      SIMULATED: {
        banner: "სიმულირებული ობსერვატორია",
        detail: "მხოლოდ სიმულატორი. ნამდვილი ტელესკოპი არ მოძრაობს.",
      },
      REAL: {
        banner: "ნამდვილი აპარატურა",
        detail: "ნამდვილი ტელესკოპი დაკავშირებულია.",
      },
    },
    now: {
      title: "ახლა",
      link: "ობსერვატორიის კავშირი",
      weather: "ამინდი",
      weatherSource: "წყარო",
      hold: "ამინდის პაუზა",
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
      OFFLINE: "გათიშულია",
    },
    linkDetail: {
      ONLINE: "დაკავშირებულია.",
      DEGRADED: "დაკავშირებულია, მაგრამ ნელა პასუხობს.",
      OFFLINE:
        "არ არის დაკავშირებული. მონაცემი შეიძლება ძველი იყოს.",
    },
    weather: {
      CLEAR: "მოწმენდილი",
      CLOUDY: "მოღრუბლული",
      UNSAFE: "სახიფათო",
      UNKNOWN: "უცნობია",
    },
    weatherSource: { OPERATOR: "ოპერატორი", SENSOR: "ობსერვატორიის სენსორი" },
    conditions: {
      title: "ამაღამინდელი პირობები",
      detail:
        "საათობრივი პროგნოზი. მხოლოდ ორიენტირისთვის; პაუზაზე ოპერატორი წყვეტს.",
      empty: "ამაღამ დასაჯავშნი საათები არ არის.",
      hour: "საათი",
      cloud: "ღრუბლიანობა",
      cloudLayers: "დაბალი / საშუალო / მაღალი",
      precipitation: "ნალექი",
      humidity: "ტენიანობა",
      wind: "ქარი",
      seeing: "ჰაერის სიმშვიდე",
      chartCaption: "ღრუბლიანობა საათების მიხედვით",
      tableLabel: "საათობრივი პროგნოზის ცხრილი",
      unknown: "უცნობია",
      unknownHour: "ამ საათისთვის პროგნოზი შენახული არ არის.",
      source: "პროგნოზი: {source}, მიღებულია {age} წინ.",
      sources: { METEOBLUE: "meteoblue", OPEN_METEO: "Open-Meteo" },
    },
    uptime: {
      title: "ბოლო 30 დღე",
      summary: "დაკავშირებული ბოლო 30 დღის განმავლობაში",
      notMeasured:
        "მონაცემი ჯერ არ არის.",
      daysLabel: "კავშირი დღეების მიხედვით",
      dayLabel: "{date}: {value}",
      today: "დღეს",
      legendLabel: "აღნიშვნები",
      legend: {
        up: "დაკავშირებული",
        partial: "მცირე შეფერხება",
        down: "ძირითადად გათიშული",
        unmeasured: "მონაცემი არ არის",
      },
      incidentsTitle: "ბოლო შეფერხებები",
      noIncidents: "30 დღეში შეფერხება არ ყოფილა.",
      incident: "{from}, {minutes} წთ",
      ongoing: "{from}-დან, ჯერ გათიშულია",
      detail:
        "კავშირი ჩვენს სერვერებთან. ამინდმა მაინც შეიძლება დახუროს.",
      unavailable: "ისტორია ვერ ჩაიტვირთა.",
    },
    unavailable: {
      title: "სტატუსი მიუწვდომელია",
      detail: "სერვერმა არ უპასუხა. სცადე მოგვიანებით.",
    },
    noObservatory: {
      title: "ობსერვატორია არ არის",
      detail: "დასაჯავშნი ობსერვატორია ჯერ არ არის.",
    },
    back: `${brand.ka.on} დაბრუნება`,
  },
} as const satisfies Record<Locale, typeof en>;

export type StatusCopy = (typeof statusCopy)[Locale];
