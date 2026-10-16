/** The booking board's own words (ADR-053 §7); the slot reasons and the form's are booking.ts's and reserve.ts's. */
export type BoardCopy = {
  facts: { slot: string; nights: string; nightsValue: (count: number) => string; hold: string; holdValue: string };
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
    facts: {
      slot: "Slot",
      nights: "Nights",
      nightsValue: (count) => `${count} ahead`,
      hold: "Hold",
      holdValue: "while you pay",
    },
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
    facts: {
      slot: "სლოტი",
      nights: "ღამეები",
      nightsValue: (count) => `${count} წინ`,
      hold: "დაჯავშნა",
      holdValue: "სანამ იხდი",
    },
    night: "ღამე",
    start: "დასაწყისი",
    target: "ობიექტი",
    open: (count) => `${count} ღია`,
    full: "სავსეა",
    noSlots: "ამ ღამეს დაკვირვების დრო არ არის.",
    tooSoon: "უკვე დაიწყო",
    pickSlotFirst: "აირჩიე დასაწყისი, რომ ნახო რა ჩანს",
    up: "ჩანს მთელი სლოტის განმავლობაში",
    needs: (minutes) => `სჭირდება ${minutes} წთ`,
    loadingTargets: "ამ სლოტისთვის ცას ვკითხულობთ",
    noTargets: "კატალოგიდან არცერთი ობიექტი არ ჩანს ამ სლოტის მთელი განმავლობაში.",
    session: "შენი სესია",
    pickStart: "აირჩიე ნახევარი საათი",
    pickTarget: "აირჩიე ობიექტი",
    cost: "ღირებულება",
    free: "უფასო",
    goToSession: "შენს სესიაზე გადასვლა",
    siteTime: "ობსერვატორიის დრო",
  },
};
