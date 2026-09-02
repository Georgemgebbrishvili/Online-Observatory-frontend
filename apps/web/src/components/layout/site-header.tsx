"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

import { BrandLockup } from "@/components/brand/brand-lockup";
import { Container } from "@/components/ui/container";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type SiteHeaderProps = {
  locale: Locale;
  navigation: Dictionary["navigation"];
};

export function SiteHeader({ locale, navigation }: SiteHeaderProps) {
  const alternateLocale = locale === "en" ? "ka" : "en";
  const pathname = usePathname();
  const alternatePathname = pathname.replace(/^\/(en|ka)(?=\/|$)/, `/${alternateLocale}`);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const publicNavigation = navigation.public;
  const links = [
    { label: publicNavigation.explore, href: `/${locale}#tonight` },
    { label: publicNavigation.live, href: `/${locale}#live` },
    { label: publicNavigation.observatory, href: `/${locale}/observatory` },
    { label: publicNavigation.pricing, href: `/${locale}/pricing` },
    { label: publicNavigation.about, href: `/${locale}#about` },
  ];

  return (
    <header
      className="site-header"
      onKeyDownCapture={(event) => {
        if (event.key === "Escape" && menuOpen) {
          setMenuOpen(false);
          menuButtonRef.current?.focus();
        }
      }}
    >
      <Container className="header-inner">
        <Link className="brand-link" href={`/${locale}`} prefetch={false}>
          <BrandLockup
            ariaLabel={navigation.brandAriaLabel}
            endorsement={navigation.brandEndorsement}
          />
        </Link>
        <nav className="public-navigation" aria-label={publicNavigation.ariaLabel}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={link.href.includes("#") ? false : undefined}
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
          <Link className="public-sign-in" href={`/${locale}/sign-in`}>
            {publicNavigation.signIn}
          </Link>
          <Link
            className="button button-primary button-small"
            href={`/${locale}#tonight`}
            prefetch={false}
          >
            <span>{publicNavigation.startExploring}</span>
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
              prefetch={link.href.includes("#") ? false : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div>
          <Link href={`/${locale}/sign-in`}>{publicNavigation.signIn}</Link>
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
            href={`/${locale}#tonight`}
            prefetch={false}
          >
            <span>{publicNavigation.startExploring}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
