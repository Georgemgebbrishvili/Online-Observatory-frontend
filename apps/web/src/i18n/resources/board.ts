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
  /** ADR-075: the run the board opens with, and the quick lengths beside the stepper. */
  picked: (clear: boolean, length: string) => string;
  quickLengths: string;
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
    lede: "Pick a night, a start and an end.",
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
        "This start is taken. Join the waitlist: if it frees, we email you and hold it 15 minutes.",
      join: "Join the waitlist",
      joining: "Joining…",
      joined: (position) =>
        `You are number ${position} in line.`,
      refused:
        "You can't wait for this start. You hold it, already wait, or wait for three.",
      yours: (time) => `Freed and held for you until ${time}.`,
    },
    nextClear: "Next clear start picked.",
    night: "Night",
    start: "Start",
    target: "Object",
    open: (count) => `${count} open`,
    full: "Full",
    noSlots: "No observing time that night.",
    tooSoon: "Already started",
    optional: "Optional · we pick the best",
    anyTarget: "Best in the sky",
    up: "Up for the whole slot",
    needs: (minutes) => `Needs ${minutes} min`,
    loadingTargets: "Checking the sky…",
    noTargets: "Nothing is up for this whole session.",
    session: "Your session",
    pickStart: "Pick a start",
    cost: "Cost",
    free: "Free",
    goToSession: "Go to your session",
    siteTime: "Observatory time",
    hint: {
      start: "Tap a start time.",
      end: "Tap the end, up to 4 h later.",
      again: "Tap to change, or use − and +.",
    },
    dark: (from, to) => `Dark ${from} – ${to}`,
    grid: "Observing time",
    clipped: (time) => `Ends at ${time}: next time is taken.`,
    longest: "Longest session: 4 h.",
    noRoom: (length) => `No free ${length} from that start.`,
    checking: "Checking…",
    picked: (clear, length) =>
      `Next ${clear ? "clear" : "free"} ${length} picked. Tap to change.`,
    quickLengths: "Quick lengths",
    stretchGone: "That time is taken. Pick another start.",
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
    lede: "აირჩიე ღამე, დასაწყისი და დასასრული.",
    length: "ხანგრძლივობა",
    duration: (minutes) => {
      const hours = Math.floor(minutes / 60);
      const rest = minutes % 60;
      if (!hours) return `${rest} წთ`;
      return rest ? `${hours} სთ ${rest} წთ` : `${hours} სთ`;
    },
    shorter: "მოკლე",
    longer: "გრძელი",
    anySub: "ჩვენ ავარჩევთ",
    forecast: {
      label: "პროგნოზი",
      cloud: (percent) => `${percent}% ღრუბელი`,
      unknown: "პროგნოზი ჯერ არ არის",
    },
    waitlist: {
      taken:
        "ეს დრო დაკავებულია. ჩადექი რიგში: თუ გათავისუფლდა, მოგწერთ და 15 წუთით შეგინახავთ.",
      join: "რიგში ჩადგომა",
      joining: "რიგში დგები…",
      joined: (position) => `რიგში ${position}-ე ხარ.`,
      refused:
        "რიგში ვერ ჩადგები: დრო უკვე შენია, უკვე რიგში ხარ ან სამ რიგში დგახარ.",
      yours: (time) => `გათავისუფლდა. შენთვის ინახება ${time}-მდე.`,
    },
    nextClear: "ავირჩიეთ შემდეგი მოწმენდილი დრო.",
    night: "ღამე",
    start: "დასაწყისი",
    target: "ობიექტი",
    open: (count) => `${count} თავისუფალი`,
    full: "სავსეა",
    noSlots: "ამ ღამეს დაკვირვების დრო არ არის.",
    tooSoon: "უკვე დაიწყო",
    optional: "არასავალდებულო · საუკეთესოს ჩვენ ავარჩევთ",
    anyTarget: "საუკეთესო ცაზე",
    up: "ჩანს მთელი სეანსი",
    needs: (minutes) => `სჭირდება ${minutes} წთ`,
    loadingTargets: "ვამოწმებთ ცას…",
    noTargets: "მთელი სეანსის განმავლობაში არაფერი ჩანს.",
    session: "შენი სეანსი",
    pickStart: "აირჩიე დაწყების დრო",
    cost: "ფასი",
    free: "უფასო",
    goToSession: "სეანსზე გადასვლა",
    siteTime: "ობსერვატორიის დრო",
    hint: {
      start: "მონიშნე დაწყების დრო.",
      end: "ახლა მონიშნე დასასრული (4 სთ-მდე).",
      again: "შესაცვლელად მონიშნე სხვა დრო ან გამოიყენე − და +.",
    },
    dark: (from, to) => `სიბნელე ${from} – ${to}`,
    grid: "დაკვირვების დრო",
    clipped: (time) => `მთავრდება ${time}-ზე: მერე დაკავებულია.`,
    longest: "სეანსი მაქსიმუმ 4 საათია.",
    noRoom: (length) => `ამ დასაწყისიდან თავისუფალი ${length} არ არის.`,
    checking: "ვამოწმებთ…",
    picked: (clear, length) =>
      `ავირჩიეთ შემდეგი ${clear ? "მოწმენდილი" : "თავისუფალი"} ${length}. შესაცვლელად მონიშნე სხვა დრო.`,
    quickLengths: "სწრაფი არჩევანი",
    stretchGone: "ეს დრო დაკავებულია. აირჩიე სხვა.",
    quoteFailed: "ვერ შევამოწმეთ. სცადე თავიდან.",
    upShort: "ჩანს",
    needsShort: (minutes) => `სჭირდება ${minutes} წთ`,
    reasonsShort: {
      SAFETY_ENVELOPE_UNMEASURED: "საზღვრები გაუზომავია",
      TARGET_DISABLED: "მიუწვდომელია",
      OBSERVATORY_OFFLINE: "კავშირგარეშეა",
      WEATHER_HOLD: "ამინდის გამო შეჩერებულია",
      BELOW_HORIZON: "ჩასულია",
      BELOW_MIN_ALTITUDE: "დაბლაა",
      ABOVE_MAX_ALTITUDE: "მაღლაა",
      BEHIND_HORIZON_MASK: "დაფარულია",
      IN_FORBIDDEN_AZIMUTH: "მიუწვდომელია",
      SUN_TOO_HIGH: "ჯერ ნათელია",
      TOO_CLOSE_TO_SUN: "მზესთან ახლოს",
      TOO_CLOSE_TO_MOON: "მთვარესთან ახლოს",
      DOES_NOT_FIT_FIELD: "ძალიან დიდია",
    },
    illustrations: "ილუსტრაციები — არა ტელესკოპის გამოსახულება",
  },
};
