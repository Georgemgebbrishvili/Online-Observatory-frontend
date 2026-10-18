import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeaderBar } from "@/components/layout/site-header-bar";
import { PlannedNavigation } from "@/components/navigation/app-navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type AppShellProps = {
  children: ReactNode;
  locale: Locale;
  dictionary: Dictionary;
  logoutLabel: string;
};

/**
 * The signed-in pages wear the site's own header and footer, so pressing Book never
 * swaps the menu out from under the visitor. Their own pages sit in the Account menu.
 */
export function AppShell({ children, dictionary, locale, logoutLabel }: AppShellProps) {
  return (
    <div className="site-frame app-shell">
      <SiteHeaderBar
        locale={locale}
        navigation={dictionary.navigation}
        signOutLabel={logoutLabel}
        signedIn
      />

      <main id="main-content" className="app-content">
        {children}
      </main>

      <div className="app-planned">
        <PlannedNavigation locale={locale} navigation={dictionary.navigation.app} />
      </div>
      <SiteFooter footer={dictionary.footer} locale={locale} />
    </div>
  );
}
