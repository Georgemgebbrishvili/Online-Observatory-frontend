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
  simulated: string;
  closed: string;
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
    simulated: "Simulated observatory",
    closed: "The owner closed this session to watchers.",
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
    loading: "სესია იხსნება",
    notOpen: "ეს სესია საყურებლად ღია არ არის.",
    headline: "{owner} აკვირდება: {target}.",
    someone: `${brand.ka.genitive} დამკვირვებელი`,
    seats: "დაკავებულია {count} ადგილი {capacity}-დან.",
    buy: "ადგილის ყიდვა",
    full: "ყველა ადგილი დაკავებულია.",
    paying: "ველოდებით გადახდის დადასტურებას",
    checkAgain: "ხელახლა შემოწმება",
    checkoutUnavailable: "ადგილის გადახდა ჯერ შეუძლებელია.",
    watching: "შენ უყურებ. ტელესკოპის მართვა და კადრების შენახვა შეუძლებელია.",
    leave: "ყურების შეწყვეტა",
    left: "შენ გახვედი. ადგილი სესიის დასრულებამდე შენია.",
    watchAgain: "ხელახლა ყურება",
    offline: "ობსერვატორია კავშირგარეშეა.",
    simulated: "სიმულირებული ობსერვატორია",
    closed: "მფლობელმა სესია მაყურებლებისთვის დახურა.",
    over: "ეს სესია დასრულდა.",
    owner: "ეს შენი სესიაა.",
    ownerAction: "პირდაპირი დაკვირვების ოთახში გადასვლა",
    ownerNote:
      "მას პირდაპირი დაკვირვების ოთახიდან მართავ. ყურება მათთვისაა, ვისაც სესიას გაუზიარებ.",
    seatTitle: "შენი ადგილი",
    failed: "რაღაც შეფერხდა. სცადე თავიდან.",
  },
};
