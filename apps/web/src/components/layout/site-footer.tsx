import Link from "next/link";

import {
  BrandLockup,
  wordmarkPath,
  wordmarkViewBox,
} from "@/components/brand/brand-lockup";
import { Container } from "@/components/ui/container";
import type { Locale } from "@/i18n/config";
import { legalPaths } from "@/i18n/resources/legal";
import type { Dictionary } from "@/i18n/types";

type SiteFooterProps = {
  footer: Dictionary["footer"];
  locale: Locale;
  path?: string;
};

export function SiteFooter({ footer, locale, path = "" }: SiteFooterProps) {
  const legalItems = [
    { href: `/${locale}/${legalPaths.terms}`, label: footer.terms },
    { href: `/${locale}/${legalPaths.privacy}`, label: footer.privacy },
    { href: `/${locale}/${legalPaths.refunds}`, label: footer.refunds },
  ];
  const localizedPath = path ? `/${path}` : "";

  return (
    <footer className="site-footer">
      <Container className="footer-grid">
        <div className="footer-brand">
          <BrandLockup
            ariaLabel={footer.brandAriaLabel}
            endorsement={footer.brandEndorsement}
          />
          <p>{footer.statement}</p>
        </div>

        <nav className="footer-nav" aria-label={footer.product}>
          <div>
            <h2>{footer.product}</h2>
            <Link href={`/${locale}/observatory`}>{footer.observatory}</Link>
            <Link href={`/${locale}/app/book`}>{footer.book}</Link>
            <Link href={`/${locale}/app/collection`}>{footer.collection}</Link>
            <Link href={`/${locale}/pricing`}>{footer.pricing}</Link>
            <Link href={`/${locale}/gift`}>{footer.gift}</Link>
            <Link href={`/${locale}/vote`}>{footer.vote}</Link>
            <Link href={`/${locale}/app/cards`}>{footer.cards}</Link>
            <Link href={`/${locale}/status`}>{footer.status}</Link>
          </div>
          <div>
            <h2>{footer.legal}</h2>
            {legalItems.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
          <div>
            <h2>{footer.language}</h2>
            <Link
              href={`/ka${localizedPath}`}
              hrefLang="ka"
              lang="ka"
              prefetch={false}
              aria-current={locale === "ka" ? "page" : undefined}
            >
              {footer.georgianLanguage}
            </Link>
            <Link
              href={`/en${localizedPath}`}
              hrefLang="en"
              lang="en"
              prefetch={false}
              aria-current={locale === "en" ? "page" : undefined}
            >
              {footer.englishLanguage}
            </Link>
          </div>
        </nav>
      </Container>
      {/* ADR-100: the name set large across the foot, fading into the night. */}
      <div className="footer-mark" aria-hidden="true">
        {/* The lockup's outlines, so the foot of every page loads no font for one word. */}
        <svg viewBox={wordmarkViewBox} focusable="false">
          <defs>
            <linearGradient id="footer-mark-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" className="footer-mark-top" />
              <stop offset="0.85" className="footer-mark-foot" />
            </linearGradient>
          </defs>
          <path d={wordmarkPath} fill="url(#footer-mark-fade)" />
        </svg>
      </div>
    </footer>
  );
}
