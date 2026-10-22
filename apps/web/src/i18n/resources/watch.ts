import { brand } from "@/brand";

/** Strings only, so the copy can cross into the client component whole. */
export type WatchCopy = {
  metadataTitle: string;
  eyebrow: string;
  loading: string;
  notOpen: string;
  /** "{owner} is observing {target}." */
  headline: string;
  /** The owner, when they have no display name. */
  someone: string;
  seats: string;
  buy: string;
  full: string;
  paying: string;
  checkAgain: string;
  checkoutUnavailable: string;
  watching: string;
  leave: string;
  left: string;
  watchAgain: string;
  offline: string;
  closed: string;
  /** ADR-045: "{amount} was refunded …", once the money is back. */
  refunded: string;
  /** ADR-045: "{amount} will be refunded …", decided but not yet issued. Never "was". */
  refundOwed: string;
  over: string;
  owner: string;
  ownerAction: string;
  /** The owner's panel, under the target's name. */
  ownerNote: string;
  /** The panel that holds the seat and its actions. */
  seatTitle: string;
  failed: string;
};

export const watchCopy: Record<"en" | "ka", WatchCopy> = {
  en: {
    metadataTitle: `{target} · Watch · ${brand.en.name}`,
    eyebrow: "Watching · {target}",
    loading: "Opening the session",
    notOpen: "This session is not open to watch.",
    headline: "{owner} is observing {target}.",
    someone: `A ${brand.en.name} observer`,
    seats: "{count} of {capacity} seats taken.",
    buy: "Buy a seat",
    full: "Every seat is taken.",
    paying: "Waiting for your payment to settle",
    checkAgain: "Check again",
    checkoutUnavailable: "Seats cannot be paid for yet.",
    watching: "You are watching. You cannot move the telescope or keep captures.",
    leave: "Stop watching",
    left: "You left. Your seat stays yours until the session ends.",
    watchAgain: "Watch again",
    offline: "The observatory is offline.",
    closed: "The owner closed this session to watchers.",
    refunded: "{amount} was refunded to you for the time the close took.",
    refundOwed: "{amount} will be refunded to you for the time the close took.",
    over: "This session has ended.",
    owner: "This is your session.",
    ownerAction: "Go to the live room",
    ownerNote:
      "You control it from the live room. Watching is for the people you share it with.",
    seatTitle: "Your seat",
    failed: "Something went wrong. Try again.",
  },
  ka: {
    metadataTitle: `{target} · ყურება · ${brand.ka.nominative}`,
    eyebrow: "ყურება · {target}",
    loading: "ეთერი იხსნება",
    notOpen: "ეს ეთერი საყურებლად ღია არ არის.",
    headline: "{owner} აკვირდება: {target}.",
    someone: `${brand.ka.genitive} დამკვირვებელი`,
    seats: "დაკავებულია {count} ადგილი {capacity}-დან.",
    buy: "ადგილის ყიდვა",
    full: "ყველა ადგილი დაკავებულია.",
    paying: "ველოდებით გადახდის დადასტურებას",
    checkAgain: "ხელახლა შემოწმება",
    checkoutUnavailable: "ადგილის გადახდა ჯერ შეუძლებელია.",
    watching: "შენ მაყურებელი ხარ: ტელესკოპს ვერ მართავ და კადრებს ვერ ინახავ.",
    leave: "ყურების შეწყვეტა",
    left: "გახვედი. ადგილი ეთერის დასრულებამდე შენია.",
    watchAgain: "ხელახლა ყურება",
    offline: "ობსერვატორია კავშირგარეშეა.",
    closed: "მასპინძელმა ეთერი მაყურებლებისთვის დახურა.",
    refunded: "დახურვის გამო დაკარგული დროისთვის {amount} დაგიბრუნდა.",
    refundOwed: "დახურვის გამო დაკარგული დროისთვის {amount} დაგიბრუნდება.",
    over: "ეთერი დასრულდა.",
    owner: "ეს შენი ეთერია.",
    ownerAction: "შენს სეანსზე გადასვლა",
    ownerNote:
      "მას შენი სეანსის გვერდიდან მართავ. ეს გვერდი მათთვისაა, ვისაც ეთერს გაუზიარებ.",
    seatTitle: "შენი ადგილი",
    failed: "რაღაც შეფერხდა. სცადე თავიდან.",
  },
};
