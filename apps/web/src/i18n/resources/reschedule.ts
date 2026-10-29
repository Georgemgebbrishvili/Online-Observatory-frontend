type StateCopy = { title: string; description: string };

type RescheduleCopy = {
  offer: string;
  replacing: string;
  free: string;
  closed: StateCopy;
  toBooking: string;
  toBookings: string;
  note: string;
  /** The reserve form's button, in place of reserving and paying. */
  form: { book: string; booking: string };
};

export const rescheduleCopy: Record<"en" | "ka", RescheduleCopy> = {
  en: {
    offer: "Choose a free slot",
    replacing: "Pick a free session to replace the lost one.",
    free: "Free",
    closed: {
      title: "No free session to claim.",
      description: "It was already replaced or refunded, or the offer expired.",
    },
    toBooking: "Back to the booking",
    toBookings: "Your bookings",
    note: "Confirmed at once, free. After that, no refund.",
    form: {
      book: "Book free",
      booking: "Booking",
    },
  },
  ka: {
    offer: "აირჩიე უფასო სეანსი",
    replacing: "აირჩიე უფასო სეანსი დაკარგულის ნაცვლად.",
    free: "უფასო",
    closed: {
      title: "უფასო სეანსი აღარ გეკუთვნის.",
      description: "უკვე შეიცვალა, თანხა დაბრუნდა ან ვადა გავიდა.",
    },
    toBooking: "ჯავშანზე დაბრუნება",
    toBookings: "შენი ჯავშნები",
    note: "დადასტურდება მაშინვე, უფასოდ. ამის შემდეგ თანხა აღარ დაბრუნდება.",
    form: {
      book: "უფასოდ დაჯავშნა",
      booking: "იჯავშნება",
    },
  },
};
