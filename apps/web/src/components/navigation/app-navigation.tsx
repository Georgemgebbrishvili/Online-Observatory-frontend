"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavigationIcon } from "@/components/navigation/navigation-icon";
import { appDestinations } from "@/features/navigation/navigation-model";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type AppNavigationProps = {
  locale: Locale;
  navigation: Dictionary["navigation"]["app"];
  placement: "sidebar" | "bottom";
};

export function AppNavigation({ locale, navigation, placement }: AppNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className={`app-navigation app-navigation-${placement}`}
      aria-label={navigation.ariaLabel}
    >
      {appDestinations.map((destination) => {
        const href = `/${locale}/app${destination.segment ? `/${destination.segment}` : ""}`;
        const isActive =
          pathname === href ||
          (destination.segment !== "" && pathname.startsWith(`${href}/`));
        const label =
          placement === "bottom"
            ? navigation.mobile[destination.key]
            : navigation[destination.key];

        return (
          <Link
            key={destination.key}
            href={href}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="app-nav-icon">
              <NavigationIcon name={destination.icon} />
            </span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
