import { notFound } from "next/navigation";

import { HomeShell } from "@/components/layout/home-shell";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { readTonight } from "@/features/targets/read";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { siteUrl } from "@/lib/seo";
import "@/styles/homepage.css";
import { brand } from "@/brand";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const [dictionary, tonight] = await Promise.all([
    getDictionary(locale),
    readTonight(locale),
  ]);
  return (
    <div className="site-frame">
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
      <SiteHeader locale={locale} navigation={dictionary.navigation} />
      <HomeShell content={dictionary.home} locale={locale} tonight={tonight} />
      <SiteFooter footer={dictionary.footer} locale={locale} />
    </div>
  );
}
