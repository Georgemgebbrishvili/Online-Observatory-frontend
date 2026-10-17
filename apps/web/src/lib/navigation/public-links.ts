import type { Locale } from "@/i18n/config";
import type { PublicNavigationDictionary } from "@/types/navigation";

/** The header's five pages, in the order a visitor meets them: see, book, watch, vote, pay. */
export function publicLinks(locale: Locale, navigation: PublicNavigationDictionary) {
  return [
    { label: navigation.observatory, href: `/${locale}/observatory` },
    { label: navigation.book, href: `/${locale}/app/book` },
    { label: navigation.live, href: `/${locale}/app/live` },
    { label: navigation.vote, href: `/${locale}/vote` },
    { label: navigation.pricing, href: `/${locale}/pricing` },
  ];
}
