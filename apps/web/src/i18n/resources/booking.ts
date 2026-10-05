import type { SlotUnavailableReason } from "@darkview/contracts";

import { brand } from "@/brand";

type StateCopy = { title: string; description: string };

type BookingCopy = {
  metadataTitle: string;
  metadataDescription: string;
  eyebrow: string;
  title: string;
  introduction: string;
  yourBookings: string;
  nights: string;
  slots: string;
  minutes: (count: number) => string;
  available: string;
  choose: string;
  unavailable: string;
  reasons: Record<SlotUnavailableReason, string>;
  noSlots: StateCopy;
  unreachable: StateCopy;
  noObservatory: StateCopy;
};

export const bookingCopy: Record<"en" | "ka", BookingCopy> = {
  en: {
    metadataTitle: `Book an observation · ${brand.en.name}`,
    metadataDescription: "Observing time on the telescope, night by night.",
    eyebrow: "Book an observation",
    title: "Time on the telescope.",
    introduction:
      "Every slot is cut from astronomical darkness at the observatory, in its own time zone.",
    yourBookings: "Your bookings",
    nights: "Choose a night",
    slots: "Observing time",
    minutes: (count) => `${count} min`,
    available: "Available",
    choose: "Choose",
    unavailable: "Unavailable",
    reasons: {
      ALREADY_BOOKED: "Booked",
      OUTSIDE_ASTRONOMICAL_DARKNESS: "Not dark enough",
      WEATHER_HOLD: "Weather hold",
      OBSERVATORY_OFFLINE: "Observatory offline",
      MAINTENANCE: "Maintenance",
      IN_THE_PAST: "Already started",
    },
    noSlots: {
      title: "No observing time this night.",
      description: "Try another night.",
    },
    unreachable: {
      title: "Observing times could not be loaded.",
      description: "Try again shortly.",
    },
    noObservatory: {
      title: "No observatory is listed.",
      description: "There is nothing to book yet.",
    },
  },
  ka: {
    metadataTitle: `დაკვირვების დაჯავშნა · ${brand.ka.nominative}`,
    metadataDescription: "ტელესკოპის დრო, ღამე-ღამე.",
    eyebrow: "დაკვირვების დაჯავშნა",
    title: "დრო ტელესკოპთან.",
    introduction:
      "ყოველი სლოტი ობსერვატორიის ასტრონომიული სიბნელიდან იჭრება, მისივე დროის სარტყელში.",
    yourBookings: "შენი ჯავშნები",
    nights: "აირჩიე ღამე",
    slots: "დაკვირვების დრო",
    minutes: (count) => `${count} წთ`,
    available: "თავისუფალია",
    choose: "არჩევა",
    unavailable: "მიუწვდომელია",
    reasons: {
      ALREADY_BOOKED: "დაჯავშნილია",
      OUTSIDE_ASTRONOMICAL_DARKNESS: "ცა საკმარისად ბნელი არ არის",
      WEATHER_HOLD: "ამინდის გამო შეჩერება",
      OBSERVATORY_OFFLINE: "ობსერვატორია კავშირგარეშეა",
      MAINTENANCE: "ტექნიკური სამუშაოები",
      IN_THE_PAST: "უკვე დაიწყო",
    },
    noSlots: {
      title: "ამ ღამეს დაკვირვების დრო არ არის.",
      description: "სცადე სხვა ღამე.",
    },
    unreachable: {
      title: "დაკვირვების დროის ჩატვირთვა ვერ მოხერხდა.",
      description: "სცადე ცოტა ხანში.",
    },
    noObservatory: {
      title: "ობსერვატორია არ არის მითითებული.",
      description: "ჯერჯერობით დასაჯავშნი არაფერია.",
    },
  },
};
