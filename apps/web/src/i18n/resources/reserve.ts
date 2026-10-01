import { brand } from "@/brand";

type StateCopy = { title: string; description: string };

/** Strings only, so the form's copy can cross into a client component whole. */
export type ReserveFormCopy = {
  choose: string;
  reserve: string;
  reserving: string;
  redirecting: string;
  taken: string;
  weatherHold: string;
  offline: string;
  notObservable: string;
  failed: string;
  otherSlot: string;
};

type ReserveCopy = {
  metadataTitle: string;
  eyebrow: string;
  title: string;
  back: string;
  nothingUp: StateCopy;
  notOffered: StateCopy;
  unreachable: StateCopy;
  withheld: string;
  needs: (minutes: number) => string;
  note: string;
  form: ReserveFormCopy;
};

export const reserveCopy: Record<"en" | "ka", ReserveCopy> = {
  en: {
    metadataTitle: `Reserve a slot · ${brand.en.name}`,
    eyebrow: "Reserve a slot",
    title: "What will you observe?",
    back: "Back to the night",
    nothingUp: {
      title: "Nothing in the catalogue is up for the whole of this slot.",
      description: "Try another slot.",
    },
    notOffered: {
      title: "This slot cannot be booked.",
      description: "It has been taken, has started, or is no longer offered.",
    },
    unreachable: {
      title: "Observing times could not be loaded.",
      description: "Try again shortly.",
    },
    withheld: "Not up for the whole slot",
    needs: (minutes) => `Needs ${minutes} min`,
    note: "The slot is held for you while you pay. If the payment does not complete, the hold lapses and the slot is released.",
    form: {
      choose: "Choose what to observe",
      reserve: "Reserve and pay",
      reserving: "Reserving",
      redirecting: "Opening the payment page",
      taken: "Somebody booked this slot a moment ago. Choose another.",
      weatherHold: "The observatory is on weather hold for this night.",
      offline: "The observatory is offline.",
      notObservable: "That target is no longer up for this whole slot. Choose another.",
      failed: "Something went wrong. Try again.",
      otherSlot: "Choose another slot",
    },
  },
  ka: {
    metadataTitle: `დროის დაჯავშნა · ${brand.ka.nominative}`,
    eyebrow: "დროის დაჯავშნა",
    title: "რას დააკვირდებით?",
    back: "ღამეზე დაბრუნება",
    nothingUp: {
      title: "ამ დროის განმავლობაში კატალოგიდან არცერთი ობიექტი არ ჩანს.",
      description: "სცადეთ სხვა დრო.",
    },
    notOffered: {
      title: "ამ დროის დაჯავშნა შეუძლებელია.",
      description: "ის დაკავებულია, უკვე დაიწყო ან აღარ არის შეთავაზებული.",
    },
    unreachable: {
      title: "დაკვირვების დროის ჩატვირთვა ვერ მოხერხდა.",
      description: "სცადეთ ცოტა ხანში.",
    },
    withheld: "მთელი დროის განმავლობაში არ ჩანს",
    needs: (minutes) => `საჭიროა ${minutes} წთ`,
    note: "გადახდის განმავლობაში დრო თქვენთვის დაკავებულია. თუ გადახდა არ დასრულდა, ვადა ამოიწურება და დრო გათავისუფლდება.",
    form: {
      choose: "აირჩიეთ, რას დააკვირდებით",
      reserve: "დაჯავშნა და გადახდა",
      reserving: "იჯავშნება",
      redirecting: "იხსნება გადახდის გვერდი",
      taken: "ეს დრო ახლახან სხვამ დაჯავშნა. აირჩიეთ სხვა.",
      weatherHold: "ამ ღამეს ობსერვატორია ამინდის გამო შეჩერებულია.",
      offline: "ობსერვატორია ოფლაინშია.",
      notObservable: "ეს ობიექტი მთელი ამ დროის განმავლობაში აღარ ჩანს. აირჩიეთ სხვა.",
      failed: "რაღაც შეფერხდა. სცადეთ თავიდან.",
      otherSlot: "აირჩიეთ სხვა დრო",
    },
  },
};
