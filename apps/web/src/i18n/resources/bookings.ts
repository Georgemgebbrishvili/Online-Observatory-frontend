import type { BookingLossCause, BookingStatus } from "@darkview/contracts";

import { brand } from "@/brand";

type StateCopy = { title: string; description: string };

type BookingsCopy = {
  metadataTitle: string;
  metadataDescription: string;
  eyebrow: string;
  title: string;
  /** The nights section on /app/book (ADR-051). */
  section: string;
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
    /** The slot in the reader's own zone, shown only when it is not the observatory's. */
    yourTime: string;
  };
  /** After a confirmed booking: what the customer does on the night. */
  next: { title: string; steps: string[] };
  minutes: (count: number) => string;
  points: (count: number) => string;
  /** A held slot: how long the hold lasts, and the way to pay (ADR-043). */
  heldUntil: (until: string) => string;
  holdLapsed: string;
  continuePayment: string;
  openObservation: string;
  paidCannotCancel: string;
  /** #194: said only once the confirmation was handed to the sender. */
  confirmationSent: (on: string) => string;
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
    metadataDescription: "Your telescope sessions.",
    eyebrow: "Bookings",
    title: "Your bookings.",
    section: "Your nights",
    bookSlot: "Book a session",
    newest: "Latest bookings",
    older: "Older bookings",
    empty: {
      title: "You have no bookings yet.",
      description: "Pick a night and book a session.",
    },
    noMore: {
      title: "No older bookings.",
      description: "That's all of them.",
    },
    unreachable: {
      title: "Your bookings could not be loaded.",
      description: "Try again shortly.",
    },
    retiredTarget: "Object no longer offered",
    unknownObservatory: "Observatory",
    status: {
      PENDING_PAYMENT: "Awaiting payment",
      CONFIRMED: "Confirmed",
      CANCELLED: "Cancelled",
      EXPIRED: "Expired",
      REFUNDED: "Refunded",
    },
    statement: {
      PENDING_PAYMENT: "Held until you pay or the hold ends.",
      CONFIRMED: "It's yours. It opens at the start time.",
      CANCELLED: "Released.",
      EXPIRED: "Not paid in time. Released.",
      REFUNDED: "Your payment was returned.",
    },
    back: "All bookings",
    facts: {
      slot: "Slot",
      observatory: "Observatory",
      length: "Length",
      price: "Price",
      tierDiscount: "Loyalty discount",
      loyaltyPoints: "Points spent",
      subscriptionMinutes: "Subscription minutes",
      reference: "Reference",
      yourTime: "Your time",
    },
    next: {
      title: "What happens next",
      steps: [
        "At the start time, open the session here. The telescope turns to your object.",
        "Watch live. Move, re-centre, capture.",
        "Captures are saved to your Collection.",
      ],
    },
    minutes: (count) => `${count} min`,
    points: (count) => `${count} points`,
    heldUntil: (until) => `Held for you until ${until}.`,
    holdLapsed: "The hold has ended.",
    continuePayment: "Continue to payment",
    openObservation: "Open the observation",
    paidCannotCancel: "Paid bookings can't be cancelled yet.",
    confirmationSent: (on) => `Confirmation emailed ${on}.`,
    cause: { WEATHER: "the weather", OBSERVATORY_FAULT: "an observatory fault" },
    lostSlot: (minutes, cause, until) =>
      `${minutes} min lost to ${cause}. Take a refund or a free session by ${until}.`,
    refunded: "Lost on our side. Your payment was returned.",
    rescheduled: "Lost on our side. Replaced with a free session.",
    rescheduledTo: "See the new booking",
    cancel: "Cancel booking",
    cancelQuestion: "Cancel this booking?",
    cancelConfirm: "Yes, cancel it",
    cancelKeep: "Keep it",
    cancelling: "Cancelling",
    refund: "Take the refund",
    refunding: "Refunding",
    changed: "This booking changed. Reload the page.",
    refundUnavailable:
      "Refund not available yet. Your claim stays open.",
    failed: "Something went wrong. Try again.",
  },
  ka: {
    metadataTitle: `შენი ჯავშნები · ${brand.ka.nominative}`,
    metadataDescription: "შენი დრო ტელესკოპთან.",
    eyebrow: "ჯავშნები",
    title: "შენი ჯავშნები.",
    section: "შენი ღამეები",
    bookSlot: "დაჯავშნე სეანსი",
    newest: "ბოლო ჯავშნები",
    older: "უფრო ძველი ჯავშნები",
    empty: {
      title: "ჯავშანი ჯერ არ გაქვს.",
      description: "აირჩიე ღამე და დაჯავშნე სეანსი.",
    },
    noMore: {
      title: "უფრო ძველი ჯავშნები არ არის.",
      description: "სულ ესაა.",
    },
    unreachable: {
      title: "ჯავშნების ჩატვირთვა ვერ მოხერხდა.",
      description: "ცოტა ხანში სცადე.",
    },
    retiredTarget: "ობიექტი აღარ არის ხელმისაწვდომი",
    unknownObservatory: "ობსერვატორია",
    status: {
      PENDING_PAYMENT: "გადახდას ელოდება",
      CONFIRMED: "დადასტურებულია",
      CANCELLED: "გაუქმებულია",
      EXPIRED: "ვადა ამოიწურა",
      REFUNDED: "თანხა დაბრუნდა",
    },
    statement: {
      PENDING_PAYMENT:
        "სეანსი შენთვის ინახება, სანამ გადაიხდი ან ვადა გავა.",
      CONFIRMED: "სეანსი შენია. დაწყების დროს გაიხსნება.",
      CANCELLED: "სეანსი გათავისუფლდა.",
      EXPIRED: "დროზე არ გადაიხადე. სეანსი გათავისუფლდა.",
      REFUNDED: "თანხა დაგიბრუნდა.",
    },
    back: "ყველა ჯავშანი",
    facts: {
      slot: "სეანსი",
      observatory: "ობსერვატორია",
      length: "ხანგრძლივობა",
      price: "ფასი",
      tierDiscount: "ერთგულების ფასდაკლება",
      loyaltyPoints: "დახარჯული ქულები",
      subscriptionMinutes: "გამოწერის წუთები",
      reference: "ნომერი",
      yourTime: "შენი დროით",
    },
    next: {
      title: "რა ხდება შემდეგ",
      steps: [
        "დაწყების დროს გახსენი სეანსი აქედან. ტელესკოპი შენს ობიექტს მიუბრუნდება.",
        "უყურე პირდაპირ. გადაადგილე, გაასწორე ცენტრში და გადაიღე.",
        "კადრები შენს კოლექციაში ინახება.",
      ],
    },
    minutes: (count) => `${count} წთ`,
    points: (count) => `${count} ქულა`,
    heldUntil: (until) => `შენთვის ინახება ${until}-მდე.`,
    holdLapsed: "ვადა გავიდა.",
    continuePayment: "გადახდის გაგრძელება",
    openObservation: "დაკვირვების გახსნა",
    paidCannotCancel:
      "გადახდილ ჯავშანს ჯერ ვერ გააუქმებ.",
    confirmationSent: (on) => `დადასტურება გამოგეგზავნა ელფოსტით · ${on}`,
    cause: { WEATHER: "ამინდის", OBSERVATORY_FAULT: "ობსერვატორიის ხარვეზის" },
    lostSlot: (minutes, cause, until) =>
      `${cause} გამო ${minutes} წთ დაიკარგა. ${until}-მდე აირჩიე: თანხის დაბრუნება ან უფასო სეანსი.`,
    refunded: "სეანსი ჩვენი მიზეზით ჩაიშალა. თანხა დაგიბრუნდა.",
    rescheduled: "სეანსი ჩვენი მიზეზით ჩაიშალა. მიიღე უფასო სეანსი.",
    rescheduledTo: "ახალი ჯავშნის ნახვა",
    cancel: "ჯავშნის გაუქმება",
    cancelQuestion: "გავაუქმოთ ჯავშანი?",
    cancelConfirm: "დიახ, გააუქმე",
    cancelKeep: "დატოვება",
    cancelling: "უქმდება",
    refund: "თანხის დაბრუნება",
    refunding: "ბრუნდება",
    changed: "ჯავშანი შეიცვალა. განაახლე გვერდი.",
    refundUnavailable:
      "თანხის დაბრუნება ჯერ შეუძლებელია. უფლება შენი რჩება.",
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
