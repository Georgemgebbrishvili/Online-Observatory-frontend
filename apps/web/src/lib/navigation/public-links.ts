import type { Locale } from "@/i18n/config";
import type { PublicNavigationDictionary } from "@/types/navigation";

/** The header's three pages, in the order a visitor meets them: see, book, play (ADR-057). */
export function publicLinks(locale: Locale, navigation: PublicNavigationDictionary) {
  return [
    { label: navigation.observatory, href: `/${locale}/observatory` },
    { label: navigation.book, href: `/${locale}/app/book` },
    { label: navigation.explorer, href: `/${locale}/explorer` },
  ];
}
