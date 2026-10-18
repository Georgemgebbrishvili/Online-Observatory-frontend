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
  pickSlotFirst: string;
  up: string;
  needs: (minutes: number) => string;
  loadingTargets: string;
  noTargets: string;
  session: string;
  pickStart: string;
  pickTarget: string;
  cost: string;
  free: string;
  goToSession: string;
  siteTime: string;
};

export const boardCopy: Record<"en" | "ka", BoardCopy> = {
  en: {
    lede: "Pick a night, a start and a target. The telescope is yours for the whole slot.",
    night: "Night",
    start: "Start",
    target: "Target",
    open: (count) => `${count} open`,
    full: "Full",
    noSlots: "No observing time that night.",
    tooSoon: "Already started",
    pickSlotFirst: "Pick a start to see what is up",
    up: "Up for the whole slot",
    needs: (minutes) => `Needs ${minutes} min`,
    loadingTargets: "Reading the sky for this slot",
    noTargets: "Nothing in the catalogue is up for the whole of this slot.",
    session: "Your session",
    pickStart: "Pick a half-hour",
    pickTarget: "Choose a target",
    cost: "Cost",
    free: "Free",
    goToSession: "Go to your session",
    siteTime: "Observatory time",
  },
  ka: {
    lede: "აირჩიე ღამე, დასაწყისი და ობიექტი. მთელი სეანსის განმავლობაში ტელესკოპი შენია.",
    night: "ღამე",
    start: "დასაწყისი",
    target: "ობიექტი",
    open: (count) => `${count} თავისუფალი`,
    full: "სავსეა",
    noSlots: "ამ ღამეს დაკვირვების დრო არ არის.",
    tooSoon: "უკვე დაიწყო",
    pickSlotFirst: "აირჩიე დასაწყისი, რომ ნახო რა ჩანს",
    up: "ჩანს მთელი სეანსის განმავლობაში",
    needs: (minutes) => `სჭირდება ${minutes} წთ`,
    loadingTargets: "ვამოწმებთ, რა ჩანს ამ სეანსზე",
    noTargets: "კატალოგიდან არცერთი ობიექტი არ ჩანს ამ სეანსის მთელი განმავლობაში.",
    session: "შენი სეანსი",
    pickStart: "აირჩიე დაწყების დრო",
    pickTarget: "აირჩიე ობიექტი",
    cost: "ღირებულება",
    free: "უფასო",
    goToSession: "შენს სეანსზე გადასვლა",
    siteTime: "ობსერვატორიის დრო",
  },
};
