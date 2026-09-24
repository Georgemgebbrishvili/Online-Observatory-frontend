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
  placement: "sidebar" | "bottom";
};

export function AppNavigation({ locale, navigation, placement }: AppNavigationProps) {
  const pathname = usePathname();

  function link(destination: AppDestination) {
    const href = `/${locale}/app${destination.segment ? `/${destination.segment}` : ""}`;
    const isActive =
      pathname === href ||
      (destination.segment !== "" && pathname.startsWith(`${href}/`));
    const label =
      placement === "bottom"
        ? navigation.mobile[destination.key as keyof typeof navigation.mobile]
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
  }

  return (
    <>
      <nav
        className={`app-navigation app-navigation-${placement}`}
        aria-label={navigation.ariaLabel}
        // Both placements carry the same accessible name, so this is what tells them
        // apart without depending on a class name that a restyle may rename. Only one
        // of the two is ever displayed, so they are never both in the a11y tree.
        data-placement={placement}
      >
        {primaryDestinations.map(link)}
      </nav>

      {/*
       * The bottom bar holds five and no more. The planned surfaces are reachable from
       * the sidebar, as a second landmark with a name of its own so the two never
       * collide, grouped under a heading that says what they are.
       */}
      {placement === "sidebar" && (
        <nav
          className="app-navigation app-navigation-planned"
          aria-label={navigation.plannedGroup}
          data-placement="planned"
        >
          <p className="app-nav-group">{navigation.plannedGroup}</p>
          {plannedDestinations.map(link)}
        </nav>
      )}
    </>
  );
}
