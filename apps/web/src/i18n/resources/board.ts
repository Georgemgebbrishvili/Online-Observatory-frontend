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
  /** ADR-074: the time grid's prompt, as the run is chosen. */
  hint: { start: string; end: string; again: string };
  /** The night's dark hours, above the grid. */
  dark: (from: string, to: string) => string;
  grid: string;
  /** Why a run stopped short of the tap. */
  clipped: (time: string) => string;
  longest: string;
  /** A replacement keeps its length: a start without room for it. */
  noRoom: (length: string) => string;
  checking: string;
  stretchGone: string;
  quoteFailed: string;
  /** The target card's chip: one short line; the full reason stays in its name. */
  upShort: string;
  needsShort: (minutes: number) => string;
  reasonsShort: Record<VisibilityBlockReason, string>;
  illustrations: string;
  /** ADR-068: a slot's forecast, plainly a forecast. */
  forecast: { label: string; cloud: (percent: number) => string; unknown: string };
  /** ADR-068: the waitlist for a taken start, and the start a weather loss is offered. */
  waitlist: {
    taken: string;
    join: string;
    joining: string;
    joined: (position: number) => string;
    refused: string;
    yours: (time: string) => string;
  };
  nextClear: string;
  /** ADR-072: how long the session runs, any quarter hour from 15 minutes to 4 hours. */
  length: string;
  duration: (minutes: number) => string;
  shorter: string;
  longer: string;
  /** The object tile chosen when none is: the platform points at the best one up. */
  anySub: string;
};

export const boardCopy: Record<"en" | "ka", BoardCopy> = {
  en: {
    lede: "Pick a night, tap a start, then tap where it ends. The telescope is yours for that time.",
    length: "Length",
    duration: (minutes) => {
      const hours = Math.floor(minutes / 60);
      const rest = minutes % 60;
      if (!hours) return `${rest} min`;
      return rest ? `${hours} h ${rest} min` : `${hours} h`;
    },
    shorter: "Shorter",
    longer: "Longer",
    anySub: "We choose",
    forecast: {
      label: "Forecast",
      cloud: (percent) => `${percent}% cloud`,
      unknown: "No forecast yet",
    },
    waitlist: {
      taken:
        "Someone holds this start. Wait for it, and if it frees you will be emailed and it is held for you for 15 minutes.",
      join: "Join the waitlist",
      joining: "Joining…",
      joined: (position) =>
        `You are number ${position} in line. We will email you if it frees.`,
      refused:
        "You cannot wait for this start: you hold it, already wait for it, or wait for three already.",
      yours: (time) => `Freed and held for you until ${time}.`,
    },
    nextClear: "The next clear start is chosen for you.",
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
    hint: {
      start: "Tap a start time.",
      end: "Now tap where it ends, up to 4 hours later.",
      again: "Tap a new start to change it, or use − and +.",
    },
    dark: (from, to) => `Dark ${from} – ${to}`,
    grid: "Observing time",
    clipped: (time) => `It ends at ${time}: the time after it is taken.`,
    longest: "4 hours is the longest session.",
    noRoom: (length) => `There is no free ${length} from that start.`,
    checking: "Checking…",
    stretchGone: "That time is no longer free. Pick another start.",
    quoteFailed: "Could not check that time. Try again.",
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
    lede: "აირჩიე ღამე, მონიშნე დასაწყისი, შემდეგ — დასასრული. ტელესკოპი ამ დროით შენია.",
    length: "ხანგრძლივობა",
    duration: (minutes) => {
      const hours = Math.floor(minutes / 60);
      const rest = minutes % 60;
      if (!hours) return `${rest} წთ`;
      return rest ? `${hours} სთ ${rest} წთ` : `${hours} სთ`;
    },
    shorter: "უფრო მოკლე",
    longer: "უფრო გრძელი",
    anySub: "ჩვენ ავარჩევთ",
    forecast: {
      label: "პროგნოზი",
      cloud: (percent) => `${percent}% ღრუბელი`,
      unknown: "პროგნოზი ჯერ არ არის",
    },
    waitlist: {
      taken:
        "ეს დასაწყისი სხვას უკავია. დაელოდე: თუ გათავისუფლდება, მოგწერთ და 15 წუთით შენთვის დავაკავებთ.",
      join: "რიგში ჩადგომა",
      joining: "რიგში დგები…",
      joined: (position) => `რიგში ${position}-ე ხარ. თუ გათავისუფლდება, მოგწერთ.`,
      refused:
        "ამ დასაწყისს ვერ დაელოდები: უკვე შენია, უკვე ელოდები ან სამს უკვე ელოდები.",
      yours: (time) => `გათავისუფლდა და ${time}-მდე შენთვისაა დაკავებული.`,
    },
    nextClear: "შენთვის არჩეულია შემდეგი მოწმენდილი დასაწყისი.",
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
    hint: {
      start: "მონიშნე დაწყების დრო.",
      end: "ახლა მონიშნე, სად მთავრდება — 4 საათამდე.",
      again: "შესაცვლელად მონიშნე ახალი დასაწყისი, ან გამოიყენე − და +.",
    },
    dark: (from, to) => `სიბნელე ${from} – ${to}`,
    grid: "დაკვირვების დრო",
    clipped: (time) => `მთავრდება ${time}-ზე: შემდეგი დრო დაკავებულია.`,
    longest: "ყველაზე გრძელი სეანსი 4 საათია.",
    noRoom: (length) => `ამ დასაწყისიდან თავისუფალი ${length} არ არის.`,
    checking: "ვამოწმებთ…",
    stretchGone: "ეს დრო უკვე დაკავებულია. აირჩიე სხვა დასაწყისი.",
    quoteFailed: "დროის შემოწმება ვერ მოხერხდა. სცადე თავიდან.",
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
