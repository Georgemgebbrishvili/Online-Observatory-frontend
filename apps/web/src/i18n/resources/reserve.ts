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
  /** `{reasons}` is replaced by the platform's block reasons, in words. */
  notObservableBecause: string;
  failed: string;
  otherSlot: string;
};

type ReserveCopy = {
  metadataTitle: string;
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
    title: "What will you observe?",
    back: "Back to the night",
    nothingUp: {
      title: "Nothing is up for this whole session.",
      description: "Try another slot.",
    },
    notOffered: {
      title: "This slot cannot be booked.",
      description: "It is taken, started, or no longer offered.",
    },
    unreachable: {
      title: "Observing times could not be loaded.",
      description: "Try again shortly.",
    },
    withheld: "Not up for the whole slot",
    needs: (minutes) => `Needs ${minutes} min`,
    note: "We hold the session while you pay. If payment fails, it is released.",
    form: {
      choose: "Choose what to observe",
      reserve: "Reserve and pay",
      reserving: "Reserving",
      redirecting: "Opening the payment page",
      taken: "Just booked by someone else. Choose another.",
      weatherHold: "Weather hold tonight.",
      offline: "The observatory is offline.",
      notObservable: "That object isn't up the whole session. Choose another.",
      notObservableBecause:
        "That object isn't up the whole session ({reasons}). Choose another.",
      failed: "Something went wrong. Try again.",
      otherSlot: "Choose another slot",
    },
  },
  ka: {
    metadataTitle: `სეანსის დაჯავშნა · ${brand.ka.nominative}`,
    title: "რას დააკვირდები?",
    back: "ღამეზე დაბრუნება",
    nothingUp: {
      title: "მთელი სეანსის განმავლობაში არაფერი ჩანს.",
      description: "სცადე სხვა სეანსი.",
    },
    notOffered: {
      title: "ამ სეანსის დაჯავშნა შეუძლებელია.",
      description: "ის დაკავებულია, დაწყებულია ან აღარ იყიდება.",
    },
    unreachable: {
      title: "დრო ვერ ჩაიტვირთა.",
      description: "ცოტა ხანში სცადე.",
    },
    withheld: "მთელ სეანსს არ ჩანს",
    needs: (minutes) => `საჭიროა ${minutes} წთ`,
    note: "სანამ იხდი, სეანსი შენთვის ინახება. თუ გადახდა ვერ მოხერხდა, სეანსი გათავისუფლდება.",
    form: {
      choose: "აირჩიე, რას დააკვირდები",
      reserve: "დაჯავშნა და გადახდა",
      reserving: "იჯავშნება",
      redirecting: "გადახდაზე გადადიხარ",
      taken: "ეს სეანსი ახლახან დაიჯავშნა. აირჩიე სხვა.",
      weatherHold: "ამ ღამეს ამინდის გამო არ ვმუშაობთ.",
      offline: "ობსერვატორია კავშირგარეშეა.",
      notObservable: "ეს ობიექტი მთელ სეანსს აღარ ჩანს. აირჩიე სხვა.",
      notObservableBecause:
        "ეს ობიექტი მთელ სეანსს აღარ ჩანს ({reasons}). აირჩიე სხვა.",
      failed: "რაღაც შეფერხდა. სცადე თავიდან.",
      otherSlot: "აირჩიე სხვა სეანსი",
    },
  },
};
