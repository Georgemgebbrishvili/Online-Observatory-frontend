"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavigationIcon } from "@/components/navigation/navigation-icon";
import {
  plannedDestinations,
  primaryDestinations,
  type AppDestination,
} from "@/features/navigation/navigation-model";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type AppNavigationProps = {
  locale: Locale;
  navigation: Dictionary["navigation"]["app"];
  placement: "bar" | "bottom";
};

function useDestinationLink(
  locale: Locale,
  label: (destination: AppDestination) => string,
) {
  const pathname = usePathname();
  return function link(destination: AppDestination) {
    const href = `/${locale}/app${destination.segment ? `/${destination.segment}` : ""}`;
    const isActive =
      pathname === href ||
      (destination.segment !== "" && pathname.startsWith(`${href}/`));

    return (
      <Link
        key={destination.key}
        href={href}
        aria-current={isActive ? "page" : undefined}
      >
        <span className="app-nav-icon">
          <NavigationIcon name={destination.icon} />
        </span>
        <span>{label(destination)}</span>
      </Link>
    );
  };
}

/**
 * The five destinations (ADR-051): along the top bar on a desk, in the bottom tab bar on
 * a phone (ADR-052 §6). Both carry the same accessible name; only one is ever displayed.
 */
export function AppNavigation({ locale, navigation, placement }: AppNavigationProps) {
  const link = useDestinationLink(locale, (destination) =>
    placement === "bottom"
      ? navigation.mobile[destination.key as keyof typeof navigation.mobile]
      : navigation[destination.key],
  );

  return (
    <nav
      className={`app-navigation app-navigation-${placement}`}
      aria-label={navigation.ariaLabel}
      data-placement={placement}
    >
      {primaryDestinations.map(link)}
    </nav>
  );
}

/**
 * The pages not built yet: reachable, under a name that says what they are, in the app's
 * footer (ADR-052 §6).
 */
export function PlannedNavigation({
  locale,
  navigation,
}: Omit<AppNavigationProps, "placement">) {
  const link = useDestinationLink(locale, (destination) => navigation[destination.key]);

  return (
    <nav
      className="app-navigation app-navigation-planned"
      aria-label={navigation.plannedGroup}
      data-placement="planned"
    >
      <p className="app-nav-group">{navigation.plannedGroup}</p>
      {plannedDestinations.map(link)}
    </nav>
  );
}
