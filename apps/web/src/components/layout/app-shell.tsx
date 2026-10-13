import type { ReactNode } from "react";

import { BrandLockup } from "@/components/brand/brand-lockup";
import { AppNavigation, PlannedNavigation } from "@/components/navigation/app-navigation";
import { ObservatoryStatus } from "@/components/observatory/observatory-status";
import { SignOutButton } from "@/components/auth/sign-out-button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type AppShellProps = {
  children: ReactNode;
  locale: Locale;
  navigation: Dictionary["navigation"]["app"];
  logoutLabel: string;
};

function ObservatoryState({ navigation }: Pick<AppShellProps, "navigation">) {
  return (
    <div
      className="app-observatory-state"
      role="group"
      aria-label={navigation.observatory}
    >
      <strong>{navigation.observatoryName}</strong>
      <ObservatoryStatus status="ONLINE" label={navigation.statusOnline} />
      <small>{navigation.simulated}</small>
    </div>
  );
}

/**
 * The signed-in shell as the Skychaser site draws its own (ADR-052 §6): one glass bar
 * with the lockup, the destinations, the observatory and the account; the tab bar on a
 * phone; a footer that signs off and holds the pages not built yet.
 */
export function AppShell({ children, locale, logoutLabel, navigation }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-bar">
        <div className="app-bar-inner">
          <a className="app-brand" href={`/${locale}`}>
            <BrandLockup ariaLabel={navigation.brandAriaLabel} />
          </a>
          <AppNavigation locale={locale} navigation={navigation} placement="bar" />
          <div className="app-bar-end">
            <ObservatoryState navigation={navigation} />
            <SignOutButton
              className="app-logout-form"
              label={logoutLabel}
              locale={locale}
            />
          </div>
        </div>
      </header>

      <main id="main-content" className="app-content">
        {children}
      </main>

      <footer className="app-footer">
        <BrandLockup
          ariaLabel={navigation.brandAriaLabel}
          endorsement={navigation.brandEndorsement}
        />
        <PlannedNavigation locale={locale} navigation={navigation} />
      </footer>

      <AppNavigation locale={locale} navigation={navigation} placement="bottom" />
    </div>
  );
}
