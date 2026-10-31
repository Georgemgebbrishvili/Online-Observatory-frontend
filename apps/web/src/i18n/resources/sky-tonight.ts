import type { Locale } from "@/i18n/config";
import type { SkyBody } from "@/features/sky/tonight-sky";

const en = {
  kicker: "Tonight's sky",
  title: "What's up over Tbilisi",
  best: "Best {time}",
  up: "Up {from}–{to}",
  eye: "Naked eye",
  scope: "Telescope",
  lit: "{lit}% lit",
  empty: "No planets up tonight. The deep sky has the night to itself.",
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
  directions: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"],
};

const ka: typeof en = {
  kicker: "ამაღამის ცა",
  title: "რა ჩანს თბილისის თავზე",
  best: "საუკეთესოდ {time}",
  up: "ჩანს {from}–{to}",
  eye: "შეუიარაღებელი თვალით",
  scope: "ტელესკოპით",
  lit: "{lit}% განათებული",
  empty: "ამაღამ პლანეტები არ ჩანს. ღამე შორეულ ცას ეკუთვნის.",
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
  directions: ["ჩ", "ჩა", "ა", "სა", "ს", "სდ", "დ", "ჩდ"],
};

export const skyTonightCopy: Record<Locale, typeof en> = { en, ka };
