import type { VisibilityBlockReason } from "@darkview/contracts";

/** The booking board's own words (ADR-053 §7); the slot reasons and the form's are booking.ts's and reserve.ts's. */
export type BoardCopy = {
  lede: string;
  night: string;
  start: string;
  target: string;
  open: (count: number) => string;
  full: string;
  noSlots: string;
  tooSoon: string;
  optional: string;
  anyTarget: string;
  up: string;
  needs: (minutes: number) => string;
  loadingTargets: string;
  noTargets: string;
  session: string;
  pickStart: string;
  cost: string;
  free: string;
  goToSession: string;
  siteTime: string;
  timeline: {
    label: string;
    sunset: string;
    dusk: string;
    midnight: string;
    dawn: string;
    sunrise: string;
    moon: string;
  };
  /** The target card's chip: one short line; the full reason stays in its name. */
  upShort: string;
  needsShort: (minutes: number) => string;
  reasonsShort: Record<VisibilityBlockReason, string>;
  illustrations: string;
};

export const boardCopy: Record<"en" | "ka", BoardCopy> = {
  en: {
    lede: "Pick a night and a start. The telescope is yours for 30 minutes.",
    night: "Night",
    start: "Start",
    target: "Object",
    open: (count) => `${count} open`,
    full: "Full",
    noSlots: "No observing time that night.",
    tooSoon: "Already started",
    optional: "Optional · we point at the best one up",
    anyTarget: "Best in the sky",
    up: "Up for the whole slot",
    needs: (minutes) => `Needs ${minutes} min`,
    loadingTargets: "Reading the sky for this slot",
    noTargets: "Nothing in the catalogue is up for the whole of this slot.",
    session: "Your session",
    pickStart: "Pick a start",
    cost: "Cost",
    free: "Free",
    goToSession: "Go to your session",
    siteTime: "Observatory time",
    timeline: {
      label: "The night at the observatory",
      sunset: "Sunset",
      dusk: "Dark",
      midnight: "Midnight",
      dawn: "Dawn",
      sunrise: "Sunrise",
      moon: "Moon up",
    },
    upShort: "Up all slot",
    needsShort: (minutes) => `Needs ${minutes} min`,
    reasonsShort: {
      SAFETY_ENVELOPE_UNMEASURED: "Limits unmeasured",
      TARGET_DISABLED: "Not offered",
      OBSERVATORY_OFFLINE: "Offline",
      WEATHER_HOLD: "Weather hold",
      BELOW_HORIZON: "Below horizon",
      BELOW_MIN_ALTITUDE: "Too low",
      ABOVE_MAX_ALTITUDE: "Too high",
      BEHIND_HORIZON_MASK: "Behind horizon",
      IN_FORBIDDEN_AZIMUTH: "Out of reach",
      SUN_TOO_HIGH: "Not dark yet",
      TOO_CLOSE_TO_SUN: "Near the Sun",
      TOO_CLOSE_TO_MOON: "Near the Moon",
      DOES_NOT_FIT_FIELD: "Too large",
    },
    illustrations: "Illustrations — not telescope output",
  },
  ka: {
    lede: "აირჩიე ღამე და დასაწყისი. ტელესკოპი 30 წუთით შენია.",
    night: "ღამე",
    start: "დასაწყისი",
    target: "ობიექტი",
    open: (count) => `${count} თავისუფალი`,
    full: "სავსეა",
    noSlots: "ამ ღამეს დაკვირვების დრო არ არის.",
    tooSoon: "უკვე დაიწყო",
    optional: "არასავალდებულო · ავირჩევთ საუკეთესოს",
    anyTarget: "საუკეთესო ცაზე",
    up: "ჩანს მთელი სეანსის განმავლობაში",
    needs: (minutes) => `სჭირდება ${minutes} წთ`,
    loadingTargets: "ვამოწმებთ, რა ჩანს ამ სეანსზე",
    noTargets: "კატალოგიდან არცერთი ობიექტი არ ჩანს ამ სეანსის მთელი განმავლობაში.",
    session: "შენი სეანსი",
    pickStart: "აირჩიე დაწყების დრო",
    cost: "ღირებულება",
    free: "უფასო",
    goToSession: "შენს სეანსზე გადასვლა",
    siteTime: "ობსერვატორიის დრო",
    timeline: {
      label: "ღამე ობსერვატორიაში",
      sunset: "მზის ჩასვლა",
      dusk: "სიბნელე",
      midnight: "შუაღამე",
      dawn: "განთიადი",
      sunrise: "მზის ამოსვლა",
      moon: "მთვარე ცაზეა",
    },
    upShort: "ჩანს",
    needsShort: (minutes) => `${minutes} წთ სჭირდება`,
    reasonsShort: {
      SAFETY_ENVELOPE_UNMEASURED: "გაუზომავია",
      TARGET_DISABLED: "მიუწვდომელია",
      OBSERVATORY_OFFLINE: "კავშირგარეშეა",
      WEATHER_HOLD: "ამინდის პაუზა",
      BELOW_HORIZON: "ჩასულია",
      BELOW_MIN_ALTITUDE: "დაბლაა",
      ABOVE_MAX_ALTITUDE: "მაღლაა",
      BEHIND_HORIZON_MASK: "დაფარულია",
      IN_FORBIDDEN_AZIMUTH: "მიუწვდომელია",
      SUN_TOO_HIGH: "ჯერ ნათელია",
      TOO_CLOSE_TO_SUN: "მზის მახლობლად",
      TOO_CLOSE_TO_MOON: "მთვარესთან ახლოს",
      DOES_NOT_FIT_FIELD: "დიდია",
    },
    illustrations: "ილუსტრაციები — არა ტელესკოპის გამოსახულება",
  },
};
