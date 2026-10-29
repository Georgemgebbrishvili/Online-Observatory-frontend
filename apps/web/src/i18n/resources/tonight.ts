import { brand } from "@/brand";

/** Clients ADR-066: Tonight, live -- the public page, the room's switch and the home banner. */
export const tonightCopy = {
  en: {
    metadataTitle: `Tonight, live · ${brand.en.name}`,
    metadataDescription:
      "Watch a real telescope in Georgia, live.",
    title: "Tonight, live",
    liveNow: "Live now",
    watching: "{target}, live from Georgia",
    endsAt: "Until {time}",
    states: {
      PREPARING: "The telescope is getting ready.",
      SLEWING: "Turning to the target.",
      VERIFYING: "Checking position.",
      CENTERING: "Centring the target.",
      OBSERVING: "On target. The image is sharpening.",
      CAPTURING: "Taking a picture.",
    } as Record<string, string>,
    rate: "One frame every 4 seconds. Book a session for full control.",
    streamAlt: "Live view of {target}",
    streamAltSimulated: "Simulated live view of {target}",
    simulated: "Simulated",
    unavailable:
      "Full or just ended. Up to 20 people can watch.",
    retry: "Try again",
    none: {
      title: "Nothing is live right now",
      detail:
        "Book your own session and watch it all.",
    },
    offline: {
      title: "The observatory is offline",
      detail: "Back when it reconnects.",
    },
    hold: {
      title: "Paused for weather",
      detail: "The sky isn't clear enough tonight.",
    },
    error: {
      title: "Couldn't load",
      detail: "Try again in a moment.",
    },
    book: "Book a session",
    banner: "Live now: {target}",
    bannerAction: "Watch",
    room: {
      title: "Tonight, live",
      off: "Only you and your guests see this.",
      on: "Anyone can watch on Tonight, live. No names shown.",
      open: "Show on Tonight, live",
      close: "Stop showing",
      saving: "Saving…",
      failed: "Not saved. Try again.",
    },
  },
  ka: {
    metadataTitle: `ამაღამ, პირდაპირ · ${brand.ka.nominative}`,
    metadataDescription:
      "უყურე ნამდვილ ტელესკოპს საქართველოში, პირდაპირ.",
    title: "ამაღამ, პირდაპირ",
    liveNow: "ახლა პირდაპირ",
    watching: "{target}, პირდაპირ საქართველოდან",
    endsAt: "{time}-მდე",
    states: {
      PREPARING: "ტელესკოპი ემზადება.",
      SLEWING: "ობიექტისკენ ტრიალდება.",
      VERIFYING: "მიმართულება მოწმდება.",
      CENTERING: "ობიექტი ცენტრდება.",
      OBSERVING: "ობიექტზეა. სურათი თანდათან მკაფიოვდება.",
      CAPTURING: "სურათი იღება.",
    } as Record<string, string>,
    rate: "ერთი კადრი 4 წამში. სრული მართვისთვის დაჯავშნე სეანსი.",
    streamAlt: "პირდაპირი გამოსახულება: {target}",
    streamAltSimulated: "სიმულირებული პირდაპირი გამოსახულება: {target}",
    simulated: "სიმულირებული",
    unavailable:
      "ადგილი აღარ არის ან სეანსი დასრულდა. ერთად 20-მდე ადამიანი უყურებს.",
    retry: "თავიდან სცადე",
    none: {
      title: "ახლა პირდაპირ არაფერია",
      detail:
        "დაჯავშნე შენი სეანსი და უყურე ბოლომდე.",
    },
    offline: {
      title: "ობსერვატორია გათიშულია",
      detail: "დაბრუნდება, როცა კავშირი აღდგება.",
    },
    hold: {
      title: "შეჩერებულია ამინდის გამო",
      detail: "ამაღამ ცა საკმარისად მოწმენდილი არ არის.",
    },
    error: {
      title: "ვერ ჩაიტვირთა",
      detail: "სცადე ცოტა ხანში.",
    },
    book: "დაჯავშნე სეანსი",
    banner: "ახლა პირდაპირ: {target}",
    bannerAction: "ყურება",
    room: {
      title: "ამაღამ, პირდაპირ",
      off: "ამას მხოლოდ შენ და შენი სტუმრები ხედავთ.",
      on: "ყველას შეუძლია უყუროს „ამაღამ, პირდაპირ“-ზე. სახელები არ ჩანს.",
      open: "ჩვენება „ამაღამ, პირდაპირ“-ზე",
      close: "ჩვენების გათიშვა",
      saving: "ინახება…",
      failed: "ვერ შეინახა. სცადე თავიდან.",
    },
  },
} as const;
