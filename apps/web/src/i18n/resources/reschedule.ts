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
    replacing: "Choosing a free slot to replace the one that was lost.",
    free: "Free",
    closed: {
      title: "This booking has no free slot to claim.",
      description: "It has been replaced or refunded already, or the offer has lapsed.",
    },
    toBooking: "Back to the booking",
    toBookings: "Your bookings",
    note: "The new slot is confirmed at once, at no charge. The refund is no longer offered once it is booked.",
    form: {
      book: "Book this slot free",
      booking: "Booking",
    },
  },
  ka: {
    offer: "აირჩიე უფასო დრო",
    replacing: "ირჩევ უფასო დროს დაკარგულის ნაცვლად.",
    free: "უფასო",
    closed: {
      title: "ამ ჯავშანზე უფასო დრო აღარ არის.",
      description: "ის უკვე შეიცვალა ან თანხა დაბრუნდა, ან შეთავაზების ვადა ამოიწურა.",
    },
    toBooking: "ჯავშანზე დაბრუნება",
    toBookings: "შენი ჯავშნები",
    note: "ახალი დრო მაშინვე დადასტურდება, უფასოდ. დაჯავშნის შემდეგ თანხის დაბრუნება აღარ იქნება შესაძლებელი.",
    form: {
      book: "ამ დროის უფასოდ დაჯავშნა",
      booking: "იჯავშნება",
    },
  },
};
