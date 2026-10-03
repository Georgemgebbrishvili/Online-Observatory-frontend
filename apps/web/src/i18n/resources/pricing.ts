import { brand } from "@/brand";

export const pricingPageCopy = {
  en: {
    metadataTitle: `${brand.en.name} · Pricing`,
    metadataDescription: `What ${brand.en.name} costs today: watching is free, and an observation slot is priced when you book it.`,
    eyebrow: "Pricing",
    title: "What it costs today.",
    introduction:
      "Two things exist today: watching, which is free, and booking the telescope for a slot of your own.",
    offerings: "What exists today",
    free: "Free",
    perSlot: "Priced per slot",
    perSlotNote: "Each slot shows its length and price before you pay.",
    included: "Includes",
    provisional: "Prices are provisional until launch and may change before then.",
    laterTitle: "Later",
    later:
      "Subscriptions, observation passes and private sessions are planned. None is on sale yet, and none has a price.",
  },
  ka: {
    metadataTitle: `${brand.ka.nominative} · ფასები`,
    metadataDescription: `რა ღირს ${brand.ka.nominative} დღეს: ყურება უფასოა, სადამკვირვებლო სლოტის ფასი კი დაჯავშნისას ჩანს.`,
    eyebrow: "ფასები",
    title: "რა ღირს დღეს.",
    introduction:
      "დღეს ორი რამ არსებობს: ყურება, რომელიც უფასოა, და ტელესკოპის დაჯავშნა საკუთარი სლოტისთვის.",
    offerings: "რა არსებობს დღეს",
    free: "უფასო",
    perSlot: "ფასი სლოტზე",
    perSlotNote: "ყოველი სლოტის ხანგრძლივობა და ფასი გადახდამდე ჩანს.",
    included: "მოიცავს",
    provisional: "ფასები გაშვებამდე წინასწარია და მანამდე შეიძლება შეიცვალოს.",
    laterTitle: "მოგვიანებით",
    later:
      "დაგეგმილია გამოწერები, დაკვირვების პასები და პირადი სესიები. არცერთი ჯერ არ იყიდება და არცერთს ფასი არ აქვს.",
  },
} as const;
