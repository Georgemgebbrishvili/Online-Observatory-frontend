import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ObservatoryConsole from "@/components/observatory-console/ObservatoryConsole";
import { JsonLd } from "@/components/seo/json-ld";
import { readConditions, readObservatoryPanel } from "@/features/home/read";
import { quickStartTarget } from "@/features/observatory/console-target";
import { observatories } from "@/features/observatory/observatories";
import { readTonight } from "@/features/targets/read";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { observatoryPageCopy } from "@/i18n/resources/observatory";
import { getCurrentUser } from "@/lib/platform/session";
import { localizedMetadata, siteUrl } from "@/lib/seo";
import "@/styles/observatory-console.css";

type ObservatoryRouteProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ObservatoryRouteProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const copy = observatoryPageCopy[locale];
  return localizedMetadata({
    locale,
    path: "observatory",
    title: copy.metadataTitle,
    description: copy.metadataDescription,
  });
}

/**
 * /observatory is the observatory console (ADR-053): connect, calibrate, point and
 * capture on the sky model, in the Skychaser site's console. The real instrument's name,
 * mode and forecast come from the platform; everything the console draws is the model's,
 * badged Simulated unless the instrument is REAL.
 */
export default async function ObservatoryRoute({ params }: ObservatoryRouteProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const [dictionary, panel, tonight, user] = await Promise.all([
    getDictionary(locale),
    readObservatoryPanel(),
    readTonight(locale),
    getCurrentUser(),
  ]);
  const conditions =
    panel.kind === "ok" ? await readConditions(panel.observatory.id) : null;
  const cloud =
    conditions?.items.find(
      (hour) => hour.status === "KNOWN" && hour.cloudCoverPercent !== null,
    )?.cloudCoverPercent ?? null;
  const copy = observatoryPageCopy[locale];
  const name =
    panel.kind === "ok"
      ? locale === "ka"
        ? panel.observatory.nameKa
        : panel.observatory.nameEn
      : observatories[0].name[locale];
  const alternate = locale === "en" ? "ka" : "en";
  const nav = dictionary.navigation;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Place",
          name,
          description: copy.metadataDescription,
          url: new URL(`/${locale}/observatory`, siteUrl).toString(),
          address: {
            "@type": "PostalAddress",
            addressLocality: locale === "ka" ? "თბილისი" : "Tbilisi",
            addressCountry: "GE",
          },
        }}
      />
      <ObservatoryConsole
        locale={locale}
        tonight={tonight.kind === "ok" ? quickStartTarget(tonight.items, locale) : null}
        nodeCloud={cloud === null ? null : Math.round(cloud)}
        observatoryName={name}
        simulated={panel.kind !== "ok" || panel.status.mode !== "REAL"}
        brandLabel={nav.brandAriaLabel}
        links={[
          { label: nav.public.explore, href: `/${locale}#tonight` },
          { label: nav.public.live, href: `/${locale}/app/live` },
          { label: nav.public.observatory, href: `/${locale}/observatory`, current: true },
          { label: nav.public.vote, href: `/${locale}/vote` },
          { label: nav.public.pricing, href: `/${locale}/pricing` },
          { label: nav.public.about, href: `/${locale}#about` },
        ]}
        language={{
          label: nav.languageName,
          href: `/${alternate}/observatory`,
          hrefLang: alternate,
        }}
        account={
          user
            ? { label: nav.app.profile, href: `/${locale}/app/profile` }
            : { label: nav.public.signIn, href: `/${locale}/sign-in` }
        }
        caption={copy.illustration}
      />
    </>
  );
}
