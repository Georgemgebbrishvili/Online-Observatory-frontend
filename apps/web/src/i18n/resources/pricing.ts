import { brand } from "@/brand";

export const pricingPageCopy = {
  en: {
    metadataTitle: `Pricing · ${brand.en.name}`,
    metadataDescription: `What ${brand.en.name} costs today: browsing is free; a seat in a live session and an observation slot are priced when you buy them.`,
    eyebrow: "Pricing",
    title: "What it costs today.",
    introduction:
      "Three things exist today: browsing tonight's sky, which is free, a seat in somebody's live session, and a slot of your own on the telescope.",
    offerings: "What exists today",
    free: "Free",
    perSlot: "Priced per slot",
    perSlotNote: "Each slot shows its length and price before you pay.",
    perSeat: "Priced per seat",
    perSeatNote: "The watch link shows the seat's price before you pay.",
    included: "Includes",
    provisional: "Prices are provisional until launch and may change before then.",
    laterTitle: "Later",
    later:
      "Subscriptions, observation passes and private sessions are planned. None is on sale yet, and none has a price.",
  },
  ka: {
    metadataTitle: `ფასები · ${brand.ka.nominative}`,
    metadataDescription: `რა ღირს ${brand.ka.nominative} დღეს: დათვალიერება უფასოა, ადგილი პირდაპირ სესიაში და დაკვირვების სლოტი კი ყიდვისას ფასდება.`,
    eyebrow: "ფასები",
    title: "რა ღირს დღეს.",
    introduction:
      "დღეს სამი რამ არსებობს: ამაღამინდელი ცის დათვალიერება, რომელიც უფასოა, ადგილი სხვის პირდაპირ სესიაში და შენი საკუთარი სლოტი ტელესკოპზე.",
    offerings: "რა არსებობს დღეს",
    free: "უფასო",
    perSlot: "ფასი სლოტზე",
    perSlotNote: "ყოველი სლოტის ხანგრძლივობა და ფასი გადახდამდე ჩანს.",
    perSeat: "ფასი ადგილზე",
    perSeatNote: "ადგილის ფასი სანახავ ბმულზე გადახდამდე ჩანს.",
    included: "მოიცავს",
    provisional: "ფასები გაშვებამდე წინასწარია და მანამდე შეიძლება შეიცვალოს.",
    laterTitle: "მოგვიანებით",
    later:
      "დაგეგმილია გამოწერები, დაკვირვების პასები და პირადი სესიები. არცერთი ჯერ არ იყიდება და არცერთს ფასი არ აქვს.",
  },
} as const;
