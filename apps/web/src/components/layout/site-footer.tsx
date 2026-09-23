import Link from "next/link";

import { BrandLockup } from "@/components/brand/brand-lockup";
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
  const futureItems = [footer.about, footer.contact];
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

        <nav className="footer-nav" aria-label={`${footer.product} · ${footer.company}`}>
          <div>
            <h2>{footer.product}</h2>
            <Link href={`/${locale}#tonight`} prefetch={false}>
              {footer.missions}
            </Link>
            <Link href={`/${locale}#live`} prefetch={false}>
              {footer.live}
            </Link>
            <Link href={`/${locale}#collection`} prefetch={false}>
              {footer.collection}
            </Link>
            <Link href={`/${locale}/observatory`}>{footer.observatory}</Link>
          </div>
          <div>
            <h2>{footer.company}</h2>
            {futureItems.map((item) => (
              <span key={item} title={footer.comingSoon}>
                {item}
              </span>
            ))}
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
    </footer>
  );
}
