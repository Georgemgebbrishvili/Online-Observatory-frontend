import type { BookingLossCause, BookingStatus } from "@darkview/contracts";

import { brand } from "@/brand";

type StateCopy = { title: string; description: string };

type BookingsCopy = {
  metadataTitle: string;
  metadataDescription: string;
  eyebrow: string;
  title: string;
  introduction: string;
  bookSlot: string;
  newest: string;
  older: string;
  empty: StateCopy;
  noMore: StateCopy;
  unreachable: StateCopy;
  retiredTarget: string;
  unknownObservatory: string;
  status: Record<BookingStatus, string>;
  /** What each status means for the customer, on the booking's own page. */
  statement: Record<BookingStatus, string>;
  back: string;
  facts: {
    slot: string;
    observatory: string;
    length: string;
    price: string;
    tierDiscount: string;
    loyaltyPoints: string;
    subscriptionMinutes: string;
    reference: string;
  };
  minutes: (count: number) => string;
  points: (count: number) => string;
  /** A held slot: how long the hold lasts, and the way to pay (ADR-043). */
  heldUntil: (until: string) => string;
  holdLapsed: string;
  continuePayment: string;
  openObservation: string;
  paidCannotCancel: string;
  cause: Record<BookingLossCause, string>;
  lostSlot: (minutes: number, cause: string, until: string) => string;
  refunded: string;
  rescheduled: string;
  rescheduledTo: string;
  cancel: string;
  cancelConfirm: string;
  cancelKeep: string;
  cancelQuestion: string;
  cancelling: string;
  refund: string;
  refunding: string;
  changed: string;
  refundUnavailable: string;
  failed: string;
};

export const bookingsCopy: Record<"en" | "ka", BookingsCopy> = {
  en: {
    metadataTitle: `Your bookings · ${brand.en.name}`,
    metadataDescription: "Your observing time on the telescope.",
    eyebrow: "Bookings",
    title: "Your bookings.",
    introduction:
      "Every slot you have held or paid for, latest first, in the observatory's time.",
    bookSlot: "Book a slot",
    newest: "Latest bookings",
    older: "Older bookings",
    empty: {
      title: "You have no bookings yet.",
      description: "Choose a night and a slot to book time on the telescope.",
    },
    noMore: {
      title: "No older bookings.",
      description: "That is every booking on your account.",
    },
    unreachable: {
      title: "Your bookings could not be loaded.",
      description: "Try again shortly.",
    },
    retiredTarget: "A target no longer in the catalogue",
    unknownObservatory: "Observatory",
    status: {
      PENDING_PAYMENT: "Awaiting payment",
      CONFIRMED: "Confirmed",
      CANCELLED: "Cancelled",
      EXPIRED: "Expired",
      REFUNDED: "Refunded",
    },
    statement: {
      PENDING_PAYMENT: "The slot is held until the payment completes or the hold lapses.",
      CONFIRMED: "The slot is yours. The observation opens at its start.",
      CANCELLED: "The slot has been released.",
      EXPIRED: "The hold lapsed before payment. The slot has been released.",
      REFUNDED: "The amount paid has been returned.",
    },
    back: "All bookings",
    facts: {
      slot: "Slot",
      observatory: "Observatory",
      length: "Length",
      price: "Price",
      tierDiscount: "Loyalty discount",
      loyaltyPoints: "Points spent",
      subscriptionMinutes: "Paid with subscription minutes",
      reference: "Reference",
    },
    minutes: (count) => `${count} min`,
    points: (count) => `${count} points`,
    heldUntil: (until) => `Held for you until ${until}.`,
    holdLapsed: "The hold has ended, and the slot is no longer held for you.",
    continuePayment: "Continue to payment",
    openObservation: "Open the observation",
    paidCannotCancel: "A paid booking cannot be cancelled until refunds are available.",
    cause: { WEATHER: "the weather", OBSERVATORY_FAULT: "an observatory fault" },
    lostSlot: (minutes, cause, until) =>
      `${minutes} minutes of this slot were lost to ${cause}. You can take a refund or a free slot until ${until}.`,
    refunded: "This slot was lost on our side, and the amount paid has been returned.",
    rescheduled: "This slot was lost on our side, and replaced with a free one.",
    rescheduledTo: "See the new booking",
    cancel: "Cancel booking",
    cancelQuestion: "Cancel this booking and release the slot?",
    cancelConfirm: "Yes, cancel it",
    cancelKeep: "Keep it",
    cancelling: "Cancelling",
    refund: "Take the refund",
    refunding: "Refunding",
    changed: "This booking has changed. Reload the page to see where it stands.",
    refundUnavailable:
      "Refunds cannot be issued for this payment yet. Your entitlement stays open.",
    failed: "Something went wrong. Try again.",
  },
  ka: {
    metadataTitle: `შენი ჯავშნები · ${brand.ka.nominative}`,
    metadataDescription: "შენი დრო ტელესკოპთან.",
    eyebrow: "ჯავშნები",
    title: "შენი ჯავშნები.",
    introduction:
      "ყველა დაკავებული ან გადახდილი დრო, ბოლოდან დაწყებული, ობსერვატორიის დროით.",
    bookSlot: "დაჯავშნე დრო",
    newest: "ბოლო ჯავშნები",
    older: "უფრო ძველი ჯავშნები",
    empty: {
      title: "ჯავშნები ჯერ არ გაქვს.",
      description: "აირჩიე ღამე და დრო, რომ ტელესკოპთან დრო დაჯავშნო.",
    },
    noMore: {
      title: "უფრო ძველი ჯავშნები არ არის.",
      description: "ეს შენი ანგარიშის ყველა ჯავშანია.",
    },
    unreachable: {
      title: "ჯავშნების ჩატვირთვა ვერ მოხერხდა.",
      description: "სცადე ცოტა ხანში.",
    },
    retiredTarget: "ობიექტი, რომელიც კატალოგში აღარ არის",
    unknownObservatory: "ობსერვატორია",
    status: {
      PENDING_PAYMENT: "გადახდას ელოდება",
      CONFIRMED: "დადასტურებულია",
      CANCELLED: "გაუქმებულია",
      EXPIRED: "ვადა ამოიწურა",
      REFUNDED: "თანხა დაბრუნებულია",
    },
    statement: {
      PENDING_PAYMENT:
        "დრო დაკავებულია, სანამ გადახდა არ დასრულდება ან ვადა არ ამოიწურება.",
      CONFIRMED: "დრო შენია. დაკვირვება მისი დაწყებისას გაიხსნება.",
      CANCELLED: "დრო გათავისუფლდა.",
      EXPIRED: "გადახდამდე ვადა ამოიწურა. დრო გათავისუფლდა.",
      REFUNDED: "გადახდილი თანხა დაბრუნებულია.",
    },
    back: "ყველა ჯავშანი",
    facts: {
      slot: "დრო",
      observatory: "ობსერვატორია",
      length: "ხანგრძლივობა",
      price: "ფასი",
      tierDiscount: "ლოიალობის ფასდაკლება",
      loyaltyPoints: "დახარჯული ქულები",
      subscriptionMinutes: "გადახდილია გამოწერის წუთებით",
      reference: "ნომერი",
    },
    minutes: (count) => `${count} წთ`,
    points: (count) => `${count} ქულა`,
    heldUntil: (until) => `დრო შენთვის დაკავებულია ${until}-მდე.`,
    holdLapsed: "ვადა ამოიწურა და დრო შენთვის აღარ არის დაკავებული.",
    continuePayment: "გადახდის გაგრძელება",
    openObservation: "დაკვირვების გახსნა",
    paidCannotCancel:
      "გადახდილი ჯავშნის გაუქმება შეუძლებელია, სანამ თანხის დაბრუნება არ ამოქმედდება.",
    cause: { WEATHER: "ამინდის", OBSERVATORY_FAULT: "ობსერვატორიის ხარვეზის" },
    lostSlot: (minutes, cause, until) =>
      `ამ დროიდან ${minutes} წუთი ${cause} გამო დაიკარგა. შეგიძლია დაიბრუნო თანხა ან აირჩიო უფასო დრო. ვადა: ${until}.`,
    refunded: "ეს დრო ჩვენი მხრიდან დაიკარგა და გადახდილი თანხა დაბრუნებულია.",
    rescheduled: "ეს დრო ჩვენი მხრიდან დაიკარგა და უფასო დროით შეიცვალა.",
    rescheduledTo: "ახალი ჯავშნის ნახვა",
    cancel: "ჯავშნის გაუქმება",
    cancelQuestion: "გავაუქმოთ ეს ჯავშანი და გავათავისუფლოთ დრო?",
    cancelConfirm: "დიახ, გაუქმება",
    cancelKeep: "დატოვება",
    cancelling: "უქმდება",
    refund: "თანხის დაბრუნება",
    refunding: "ბრუნდება",
    changed: "ეს ჯავშანი შეიცვალა. განაახლე გვერდი, რომ ნახო მისი მდგომარეობა.",
    refundUnavailable:
      "ამ გადახდისთვის თანხის დაბრუნება ჯერ შეუძლებელია. შენი უფლება ძალაში რჩება.",
    failed: "რაღაც შეფერხდა. სცადე თავიდან.",
  },
};

/** Strings only: the copy's functions cannot cross into a client component. */
export function bookingActionsCopy(locale: "en" | "ka") {
  const copy = bookingsCopy[locale];
  return {
    cancel: copy.cancel,
    cancelQuestion: copy.cancelQuestion,
    cancelConfirm: copy.cancelConfirm,
    cancelKeep: copy.cancelKeep,
    cancelling: copy.cancelling,
    refund: copy.refund,
    refunding: copy.refunding,
    changed: copy.changed,
    refundUnavailable: copy.refundUnavailable,
    failed: copy.failed,
  };
}
