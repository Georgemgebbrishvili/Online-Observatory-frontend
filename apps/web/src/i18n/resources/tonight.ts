import { brand } from "@/brand";

/** Clients ADR-066: Tonight, live -- the public page, the room's switch and the home banner. */
export const tonightCopy = {
  en: {
    metadataTitle: `Tonight, live · ${brand.en.name}`,
    metadataDescription:
      "Watch a real telescope in Georgia, live, when an observer opens their session to everyone.",
    title: "Tonight, live",
    liveNow: "Live now",
    watching: "{target}, from the observatory in Georgia",
    endsAt: "Until {time}",
    states: {
      PREPARING: "The telescope is getting ready.",
      SLEWING: "The telescope is turning to the target.",
      VERIFYING: "Checking where it points.",
      CENTERING: "Centring the target.",
      OBSERVING: "On target. The picture builds as frames stack.",
      CAPTURING: "Taking the capture.",
    } as Record<string, string>,
    rate: "A frame every four seconds. Book a night for the full live view and the controls.",
    streamAlt: "Live view of {target}",
    streamAltSimulated: "Simulated live view of {target}",
    simulated: "Simulated",
    unavailable:
      "The view is full or the session has just ended. Up to twenty people can watch at once.",
    retry: "Try again",
    none: {
      title: "Nothing is live right now",
      detail:
        "Sessions are opened to everyone by the people who booked them. Book your own night and watch the whole of it.",
    },
    offline: {
      title: "The observatory is offline",
      detail: "Nothing can be watched until it reconnects.",
    },
    hold: {
      title: "Observing is on a weather hold",
      detail: "The sky over the observatory is not clear enough tonight.",
    },
    error: {
      title: "Tonight could not be read",
      detail: "Our servers did not answer. Try again in a moment.",
    },
    book: "Book your own night",
    banner: "Live now: {target}",
    bannerAction: "Watch",
    room: {
      title: "Tonight, live",
      off: "Only you and your observers see this session.",
      on: "Anyone can watch this session on Tonight, live, a frame every four seconds. No names are shown.",
      open: "Show on Tonight, live",
      close: "Stop showing",
      saving: "Saving…",
      failed: "That did not save. Try again.",
    },
  },
  ka: {
    metadataTitle: `ამაღამ, პირდაპირ · ${brand.ka.nominative}`,
    metadataDescription:
      "უყურე ნამდვილ ტელესკოპს საქართველოში, პირდაპირ, როცა დამკვირვებელი სეანსს ყველასთვის გახსნის.",
    title: "ამაღამ, პირდაპირ",
    liveNow: "ახლა პირდაპირ",
    watching: "{target}, ობსერვატორიიდან საქართველოში",
    endsAt: "{time}-მდე",
    states: {
      PREPARING: "ტელესკოპი ემზადება.",
      SLEWING: "ტელესკოპი ობიექტისკენ ტრიალდება.",
      VERIFYING: "მოწმდება, საით არის მიმართული.",
      CENTERING: "ობიექტი ცენტრდება.",
      OBSERVING: "ობიექტზეა. გამოსახულება კადრების დაჯამებით უმჯობესდება.",
      CAPTURING: "კეთდება გადაღება.",
    } as Record<string, string>,
    rate: "ერთი კადრი ყოველ ოთხ წამში. დაჯავშნე სეანსი სრული პირდაპირი გამოსახულებისა და მართვისთვის.",
    streamAlt: "პირდაპირი გამოსახულება: {target}",
    streamAltSimulated: "სიმულირებული პირდაპირი გამოსახულება: {target}",
    simulated: "სიმულირებული",
    unavailable:
      "ადგილი აღარ არის ან სეანსი ახლახან დასრულდა. ერთდროულად ოც კაცამდე შეუძლია ყურება.",
    retry: "თავიდან ცდა",
    none: {
      title: "ახლა პირდაპირ არაფერი მიდის",
      detail:
        "სეანსს ყველასთვის მისი დამჯავშნელი ხსნის. დაჯავშნე შენი სეანსი და უყურე თავიდან ბოლომდე.",
    },
    offline: {
      title: "ობსერვატორია კავშირგარეშეა",
      detail: "ყურება შეუძლებელია, სანამ კავშირი არ აღდგება.",
    },
    hold: {
      title: "დაკვირვება ამინდის გამო შეჩერებულია",
      detail: "ობსერვატორიის თავზე ცა ამაღამ საკმარისად მოწმენდილი არ არის.",
    },
    error: {
      title: "ამაღამინდელი მონაცემები ვერ წავიკითხეთ",
      detail: "ჩვენმა სერვერებმა არ უპასუხეს. სცადე ცოტა ხანში.",
    },
    book: "დაჯავშნე სეანსი",
    banner: "ახლა პირდაპირ: {target}",
    bannerAction: "ყურება",
    room: {
      title: "ამაღამ, პირდაპირ",
      off: "ამ სეანსს მხოლოდ შენ და შენი დამკვირვებლები ხედავთ.",
      on: "ამ სეანსს ყველას შეუძლია უყუროს გვერდზე „ამაღამ, პირდაპირ“, ერთი კადრი ოთხ წამში. სახელები არ ჩანს.",
      open: "გამოჩენა „ამაღამ, პირდაპირ“-ზე",
      close: "გამოჩენის შეწყვეტა",
      saving: "ინახება…",
      failed: "ვერ შეინახა. სცადე თავიდან.",
    },
  },
} as const;
