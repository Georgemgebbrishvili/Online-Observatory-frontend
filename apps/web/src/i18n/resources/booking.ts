import type { SlotUnavailableReason } from "@darkview/contracts";

import { brand } from "@/brand";

type StateCopy = { title: string; description: string };

type BookingCopy = {
  metadataTitle: string;
  metadataDescription: string;
  eyebrow: string;
  title: string;
  introduction: string;
  nights: string;
  slots: string;
  minutes: (count: number) => string;
  available: string;
  unavailable: string;
  reasons: Record<SlotUnavailableReason, string>;
  reservingSoon: StateCopy;
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
    nights: "Choose a night",
    slots: "Observing time",
    minutes: (count) => `${count} min`,
    available: "Available",
    unavailable: "Unavailable",
    reasons: {
      ALREADY_BOOKED: "Booked",
      OUTSIDE_ASTRONOMICAL_DARKNESS: "Not dark enough",
      WEATHER_HOLD: "Weather hold",
      OBSERVATORY_OFFLINE: "Observatory offline",
      MAINTENANCE: "Maintenance",
      IN_THE_PAST: "Already started",
    },
    reservingSoon: {
      title: "Reserving a slot is not open yet.",
      description:
        "It opens once the platform can confirm which targets each slot can deliver, so you are never sold a target that has set.",
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
    nights: "აირჩიეთ ღამე",
    slots: "დაკვირვების დრო",
    minutes: (count) => `${count} წთ`,
    available: "თავისუფალია",
    unavailable: "მიუწვდომელია",
    reasons: {
      ALREADY_BOOKED: "დაჯავშნილია",
      OUTSIDE_ASTRONOMICAL_DARKNESS: "საკმარისად ბნელა არ არის",
      WEATHER_HOLD: "ამინდის გამო შეჩერება",
      OBSERVATORY_OFFLINE: "ობსერვატორია ოფლაინია",
      MAINTENANCE: "ტექნიკური სამუშაოები",
      IN_THE_PAST: "უკვე დაიწყო",
    },
    reservingSoon: {
      title: "სლოტის დაჯავშნა ჯერ არ არის ხელმისაწვდომი.",
      description:
        "გაიხსნება, როცა პლატფორმა შეძლებს დაადასტუროს, რომელი ობიექტები ჩანს თითოეულ სლოტში — რომ არასოდეს მიიღოთ უკვე ჩასული ობიექტი.",
    },
    noSlots: {
      title: "ამ ღამეს დაკვირვების დრო არ არის.",
      description: "სცადეთ სხვა ღამე.",
    },
    unreachable: {
      title: "დაკვირვების დროის ჩატვირთვა ვერ მოხერხდა.",
      description: "სცადეთ ცოტა ხანში.",
    },
    noObservatory: {
      title: "ობსერვატორია არ არის მითითებული.",
      description: "ჯერჯერობით დასაჯავშნი არაფერია.",
    },
  },
};
