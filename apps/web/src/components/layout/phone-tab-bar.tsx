"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type PhoneTabBarProps = {
  locale: Locale;
  navigation: Dictionary["navigation"];
  signedIn: boolean;
};

type Tab = "observatory" | "book" | "profile";

const pressedKey = "stellar:phone-tab";
const tabNames: readonly string[] = ["observatory", "book", "profile"];
const isTab = (value: string | null): value is Tab =>
  value !== null && tabNames.includes(value);
const noSubscription = () => () => {};
const readPressed = () => {
  try {
    return sessionStorage.getItem(pressedKey);
  } catch {
    return null;
  }
};

function TabIcon({ name }: { name: Tab }) {
  if (name === "observatory") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.5 19h17" />
        <path d="M5.5 19v-6a6.5 6.5 0 0 1 13 0v6" />
        <path d="M12 6.5v6.5" />
        <path d="M10 19v-3h4v3" />
      </svg>
    );
  }
  if (name === "book") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="5" width="16" height="15" rx="2.5" />
        <path d="M4 10h16M8.5 3v4M15.5 3v4" />
        <path d="m9.5 15 1.8 1.8 3.4-3.6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M5.2 19.5c1.3-3.1 3.9-4.7 6.8-4.7s5.5 1.6 6.8 4.7" />
    </svg>
  );
}

/**
 * On a phone, the three places a customer goes back to, under the thumb: the observatory,
 * booking a night, and their own profile (or signing in). Glass, like the header.
 */
export function PhoneTabBar({ locale, navigation, signedIn }: PhoneTabBarProps) {
  const pathname = usePathname();
  // The pressed tab lights at once, before its page arrives.
  const [pressed, setPressed] = useState<{ tab: Tab; from: string } | null>(null);
  const pressedHere = pressed?.from === pathname ? pressed.tab : null;

  const base = `/${locale}`;
  const within = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const onAuthPage = within(`${base}/sign-in`) || within(`${base}/register`);
  const onAccountPage = within(`${base}/app`) && !within(`${base}/app/book`);

  // Booking signed out lands on sign-in: that page keeps the tab that was pressed lit.
  const stored = useSyncExternalStore(noSubscription, readPressed, () => null);
  const cameFor = onAuthPage && isTab(stored) ? stored : null;
  useEffect(() => {
    if (onAuthPage) return;
    try {
      sessionStorage.removeItem(pressedKey);
    } catch {
      // No storage: nothing was remembered.
    }
  }, [onAuthPage]);
  const press = (tab: Tab) => {
    setPressed({ tab, from: pathname });
    try {
      sessionStorage.setItem(pressedKey, tab);
    } catch {
      // No storage: the sign-in page lights Profile.
    }
  };

  const tabs: { key: Tab; label: string; href: string; current: boolean }[] = [
    {
      key: "observatory",
      label: navigation.public.observatory,
      href: `${base}/observatory`,
      current: within(`${base}/observatory`) || (onAuthPage && cameFor === "observatory"),
    },
    {
      key: "book",
      label: navigation.public.book,
      href: `${base}/app/book`,
      current: within(`${base}/app/book`) || (onAuthPage && cameFor === "book"),
    },
    {
      key: "profile",
      label: navigation.app.profile,
      href: signedIn ? `${base}/app/profile` : `${base}/sign-in`,
      current: onAccountPage || (onAuthPage && (cameFor ?? "profile") === "profile"),
    },
  ];

  return (
    <nav className="phone-tab-bar" aria-label={navigation.app.ariaLabel}>
      {tabs.map((tab) => {
        const current = pressedHere ? pressedHere === tab.key : tab.current;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className="phone-tab"
            aria-current={current ? "page" : undefined}
            data-signed-in={tab.key === "profile" && signedIn ? "" : undefined}
            onClick={() => press(tab.key)}
          >
            <span className="phone-tab-icon">
              <TabIcon name={tab.key} />
            </span>
            <span className="phone-tab-label">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
