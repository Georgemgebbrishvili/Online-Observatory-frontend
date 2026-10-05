import Link from "next/link";
import { headers } from "next/headers";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Container } from "@/components/ui/container";
import { defaultLocale, isLocale, localeHeader } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import "@/styles/pages.css";

export default async function NotFound() {
  const requested = (await headers()).get(localeHeader) ?? defaultLocale;
  const locale = isLocale(requested) ? requested : defaultLocale;
  const dictionary = await getDictionary(locale);
  const copy = dictionary.notFound;

  return (
    <div className="site-frame">
      <SiteHeader locale={locale} navigation={dictionary.navigation} />
      <main id="main-content" className="public-page not-found">
        <section className="page-hero" aria-labelledby="not-found-title">
          <Container>
            <p className="kicker">404</p>
            <h1 id="not-found-title">{copy.title}</h1>
            <p className="page-lede">{copy.description}</p>
            <Link className="button button-primary not-found-action" href={`/${locale}`}>
              {copy.action}
            </Link>
          </Container>
        </section>
      </main>
      <SiteFooter footer={dictionary.footer} locale={locale} />
    </div>
  );
}
