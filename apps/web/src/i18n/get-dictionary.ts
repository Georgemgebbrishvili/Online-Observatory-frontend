import "server-only";

import type { Locale } from "./config";
import type { Dictionary } from "./types";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en").then((module) => module.default),
  ka: () => import("./dictionaries/ka").then((module) => module.default),
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}
