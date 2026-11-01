import type { Locale } from "@/i18n/config";
import type { SkyBody } from "@/features/sky/tonight-sky";

const en = {
  eye: "Naked eye",
  scope: "Telescope",
  lit: "{lit}% lit",
  names: {
    Moon: "Moon",
    Mercury: "Mercury",
    Venus: "Venus",
    Mars: "Mars",
    Jupiter: "Jupiter",
    Saturn: "Saturn",
    Uranus: "Uranus",
    Neptune: "Neptune",
  } satisfies Record<SkyBody, string>,
  compass: [
    "North",
    "North-east",
    "East",
    "South-east",
    "South",
    "South-west",
    "West",
    "North-west",
  ],
  chart: "Tonight's sky from sunset to sunrise",
  open: "Open times",
  now: "Now",
  book: "Book {time}",
  stat: { best: "Best time", high: "Highest", up: "Visible", look: "Look" },
};

const ka: typeof en = {
  eye: "თვალით ჩანს",
  scope: "ტელესკოპით",
  lit: "{lit}% განათებული",
  names: {
    Moon: "მთვარე",
    Mercury: "მერკური",
    Venus: "ვენერა",
    Mars: "მარსი",
    Jupiter: "იუპიტერი",
    Saturn: "სატურნი",
    Uranus: "ურანი",
    Neptune: "ნეპტუნი",
  },
  compass: [
    "ჩრდილოეთი",
    "ჩრდილო-აღმოსავლეთი",
    "აღმოსავლეთი",
    "სამხრეთ-აღმოსავლეთი",
    "სამხრეთი",
    "სამხრეთ-დასავლეთი",
    "დასავლეთი",
    "ჩრდილო-დასავლეთი",
  ],
  chart: "ამაღამის ცა მზის ჩასვლიდან ამოსვლამდე",
  open: "თავისუფალი დრო",
  now: "ახლა",
  book: "დაჯავშნე {time}",
  stat: { best: "საუკეთესო დრო", high: "სიმაღლე", up: "ჩანს", look: "მიმართულება" },
};

export const skyTonightCopy: Record<Locale, typeof en> = { en, ka };
