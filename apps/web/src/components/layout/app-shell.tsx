import type { ReactNode } from "react";

import { BrandLockup } from "@/components/brand/brand-lockup";
import { AppNavigation } from "@/components/navigation/app-navigation";
import { ObservatoryStatus } from "@/components/observatory/observatory-status";
import { logoutAction } from "@/features/auth/actions";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type AppShellProps = {
  children: ReactNode;
  locale: Locale;
  navigation: Dictionary["navigation"]["app"];
  csrfToken: string;
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

export function AppShell({
  children,
  csrfToken,
  locale,
  logoutLabel,
  navigation,
}: AppShellProps) {
  const logout = logoutAction.bind(null, locale);

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
        <form action={logout} className="app-logout-form">
          <input name="csrfToken" type="hidden" value={csrfToken} />
          <button type="submit">{logoutLabel}</button>
        </form>
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
        <form action={logout} className="app-mobile-logout">
          <input name="csrfToken" type="hidden" value={csrfToken} />
          <button type="submit">{logoutLabel}</button>
        </form>
      </header>

      <main id="main-content" className="app-content">
        {children}
      </main>

      <AppNavigation locale={locale} navigation={navigation} placement="bottom" />
    </div>
  );
}
