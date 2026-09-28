import { notFound } from "next/navigation";

import { homeFonts } from "@/components/home/fonts";
import { PlanetHero } from "@/components/home/planet-hero";
import { HomeShell } from "@/components/layout/home-shell";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { readObservatoryPanel } from "@/features/home/read";
import { readTonight } from "@/features/targets/read";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { siteUrl } from "@/lib/seo";
import "@/styles/homepage.css";
import "@/styles/planet-hero.css";
import { brand } from "@/brand";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const [dictionary, tonight, panel] = await Promise.all([
    getDictionary(locale),
    readTonight(locale),
    readObservatoryPanel(),
  ]);
  return (
    <div className={`site-frame home-page ${homeFonts}`}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: brand.en.siteName,
            url: new URL(`/${locale}`, siteUrl).toString(),
            inLanguage: locale === "ka" ? "ka-GE" : "en-US",
            description: dictionary.metadata.description,
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: brand.en.siteName,
            url: siteUrl.origin,
          },
        ]}
      />
      <PlanetHero
        content={dictionary.home.hero}
        navigation={dictionary.navigation}
        locale={locale}
        nextId="about"
      />
      <HomeShell
        content={dictionary.home}
        locale={locale}
        tonight={tonight}
        panel={panel}
      />
      <SiteFooter footer={dictionary.footer} locale={locale} />
    </div>
  );
}
