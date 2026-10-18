"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { Container } from "@/components/ui/container";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { publicLinks } from "@/lib/navigation/public-links";
import { csrfCookieName } from "@/lib/platform/config";

type SiteHeaderBarProps = {
  locale: Locale;
  navigation: Dictionary["navigation"];
  signOutLabel: string;
  /** Known on the server for signed-in pages; elsewhere the browser checks. */
  signedIn?: boolean;
};

// The platform sets its readable CSRF cookie beside every session (ADR-016 §2), so its
// presence says a session exists without asking the API or rendering per request.
const noSubscription = () => () => {};
const hasSessionCookie = () => document.cookie.includes(`${csrfCookieName}=`);

/**
 * The one header every page carries, signed in or not: the same three pages, the same
 * place for the language and the booking button. A signed-in visitor gets an Account
 * menu where "Sign in" would be, holding their own pages.
 */
export function SiteHeaderBar({
  locale,
  navigation,
  signedIn = false,
  signOutLabel,
}: SiteHeaderBarProps) {
  const sessionCookie = useSyncExternalStore(noSubscription, hasSessionCookie, () => false);
  const account = signedIn || sessionCookie ? { signOut: signOutLabel } : null;
  const alternateLocale = locale === "en" ? "ka" : "en";
  const pathname = usePathname();
  const alternatePathname = pathname.replace(/^\/(en|ka)(?=\/|$)/, `/${alternateLocale}`);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const publicNavigation = navigation.public;
  const app = navigation.app;
  const links = publicLinks(locale, publicNavigation);
  const accountLinks = [
    { label: publicNavigation.overview, href: `/${locale}/app` },
    { label: app.live, href: `/${locale}/app/live` },
    { label: app.collection, href: `/${locale}/app/collection` },
    { label: app.profile, href: `/${locale}/app/profile` },
  ];
  const isCurrent = (href: string) =>
    href === `/${locale}/app` ? pathname === href : pathname.startsWith(href);

  useEffect(() => {
    if (!accountOpen) return;
    const close = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [accountOpen]);

  return (
    <header
      className="site-header"
      onKeyDownCapture={(event) => {
        if (event.key !== "Escape") return;
        if (menuOpen) {
          setMenuOpen(false);
          menuButtonRef.current?.focus();
        }
        setAccountOpen(false);
      }}
    >
      <Container className="header-inner">
        <Link className="brand-link" href={`/${locale}`} prefetch={false}>
          <BrandLockup ariaLabel={navigation.brandAriaLabel} />
        </Link>
        <nav className="public-navigation" aria-label={publicNavigation.ariaLabel}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname.startsWith(link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="public-actions">
          <Link
            className="language-link"
            href={alternatePathname}
            hrefLang={alternateLocale}
            lang={alternateLocale}
            aria-label={`${navigation.language}: ${navigation.languageName}`}
          >
            {navigation.languageName}
          </Link>
          {account ? (
            <div className="account-menu" ref={accountRef}>
              <button
                className="public-sign-in account-menu-button"
                type="button"
                aria-expanded={accountOpen}
                aria-controls="account-menu-list"
                onClick={() => setAccountOpen((current) => !current)}
              >
                {publicNavigation.account}
                <span aria-hidden="true" className="account-menu-caret" />
              </button>
              <div
                className="account-menu-list"
                id="account-menu-list"
                data-open={accountOpen || undefined}
              >
                <nav aria-label={publicNavigation.account}>
                  {accountLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={isCurrent(link.href) ? "page" : undefined}
                      onClick={() => setAccountOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <SignOutButton
                  className="account-menu-sign-out"
                  label={account.signOut}
                  locale={locale}
                />
              </div>
            </div>
          ) : (
            <Link className="public-sign-in" href={`/${locale}/sign-in`}>
              {publicNavigation.signIn}
            </Link>
          )}
          <Link
            className="button button-primary button-small"
            href={`/${locale}/app/book`}
          >
            <span>{publicNavigation.reserve}</span>
          </Link>
        </div>
        <button
          ref={menuButtonRef}
          className="public-menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="public-mobile-menu"
          aria-label={menuOpen ? publicNavigation.closeMenu : publicNavigation.menu}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </Container>
      <div
        className="public-mobile-menu"
        id="public-mobile-menu"
        data-open={menuOpen || undefined}
      >
        <nav aria-label={publicNavigation.ariaLabel}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname.startsWith(link.href) ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {account && (
          <nav className="mobile-account" aria-label={publicNavigation.account}>
            <p>{publicNavigation.account}</p>
            {accountLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isCurrent(link.href) ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
        <div>
          {account ? (
            <SignOutButton
              className="mobile-sign-out"
              label={account.signOut}
              locale={locale}
            />
          ) : (
            <Link href={`/${locale}/sign-in`}>{publicNavigation.signIn}</Link>
          )}
          <Link
            href={alternatePathname}
            hrefLang={alternateLocale}
            lang={alternateLocale}
            aria-label={`${navigation.language}: ${navigation.languageName}`}
          >
            {navigation.languageName}
          </Link>
          <Link
            className="button button-primary button-medium"
            href={`/${locale}/app/book`}
            onClick={() => setMenuOpen(false)}
          >
            <span>{publicNavigation.reserve}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
