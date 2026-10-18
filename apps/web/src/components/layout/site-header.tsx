import { SiteHeaderBar } from "@/components/layout/site-header-bar";
import type { Locale } from "@/i18n/config";
import { authCopy } from "@/i18n/resources/auth";
import type { Dictionary } from "@/i18n/types";

type SiteHeaderProps = {
  locale: Locale;
  navigation: Dictionary["navigation"];
};

/** The header on every public page; it finds a session in the browser, so pages stay static. */
export function SiteHeader({ locale, navigation }: SiteHeaderProps) {
  return (
    <SiteHeaderBar
      locale={locale}
      navigation={navigation}
      signOutLabel={authCopy[locale].logout}
    />
  );
}
