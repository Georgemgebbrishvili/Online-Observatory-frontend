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
    watching: "თქვენ უყურებთ. ტელესკოპის მართვა და კადრების შენახვა შეუძლებელია.",
    leave: "ყურების შეწყვეტა",
    left: "თქვენ გახვედით. ადგილი სესიის დასრულებამდე თქვენია.",
    watchAgain: "ხელახლა ყურება",
    offline: "ობსერვატორია გათიშულია.",
    simulated: "სიმულირებული ობსერვატორია",
    closed: "მფლობელმა სესია მაყურებლებისთვის დახურა.",
    over: "ეს სესია დასრულდა.",
    owner: "ეს თქვენი სესიაა.",
    ownerAction: "ცოცხალ ოთახში გადასვლა",
    failed: "რაღაც შეფერხდა. სცადეთ თავიდან.",
  },
};
