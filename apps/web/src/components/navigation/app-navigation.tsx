"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavigationIcon } from "@/components/navigation/navigation-icon";
import {
  plannedDestinations,
  type AppDestination,
} from "@/features/navigation/navigation-model";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type PlannedNavigationProps = {
  locale: Locale;
  navigation: Dictionary["navigation"]["app"];
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
 * The pages not built yet: reachable, under a name that says what they are, in the app's
 * footer (ADR-052 §6).
 */
export function PlannedNavigation({
  locale,
  navigation,
}: PlannedNavigationProps) {
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
