import type { ReactNode } from "react";

import { BrandLockup } from "@/components/brand/brand-lockup";
import { AppNavigation } from "@/components/navigation/app-navigation";
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
    <div className="app-observatory-state">
      <div>
        <span>{navigation.observatory}</span>
        <strong>{navigation.observatoryName}</strong>
      </div>
      <div>
        <ObservatoryStatus status="ONLINE" label={navigation.statusOnline} />
        <small>{navigation.simulated}</small>
      </div>
    </div>
  );
}

export function AppShell({ children, locale, logoutLabel, navigation }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <a className="app-brand" href={`/${locale}`}>
          <BrandLockup
            ariaLabel={navigation.brandAriaLabel}
            endorsement={navigation.brandEndorsement}
          />
        </a>
        <AppNavigation locale={locale} navigation={navigation} placement="sidebar" />
        <SignOutButton className="app-logout-form" label={logoutLabel} locale={locale} />
        <ObservatoryState navigation={navigation} />
      </aside>

      <header className="app-mobile-header">
        <a className="app-brand" href={`/${locale}`}>
          <BrandLockup
            ariaLabel={navigation.brandAriaLabel}
            compact
            endorsement={navigation.brandEndorsement}
          />
        </a>
        <ObservatoryState navigation={navigation} />
        <SignOutButton
          className="app-mobile-logout"
          label={logoutLabel}
          locale={locale}
        />
      </header>

      <main id="main-content" className="app-content">
        {children}
      </main>

      <AppNavigation locale={locale} navigation={navigation} placement="bottom" />
    </div>
  );
}
