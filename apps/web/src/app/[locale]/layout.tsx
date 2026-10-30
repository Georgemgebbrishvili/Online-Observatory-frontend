import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, locales } from "@/i18n/config";
import { localizedMetadata, siteUrl } from "@/lib/seo";
import "@/styles/globals.css";
import { brand } from "@/brand";
import { fontVariables } from "@/styles/fonts";
import { palette } from "@/styles/tokens";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

type LocaleMetadataProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// The phone's own bars take the canvas colour, and the page may draw under a notch or the
// gesture bar: every fixed bar pads itself with env(safe-area-inset-*).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: palette.canvas,
  colorScheme: "dark",
};

export async function generateMetadata({
  params,
}: LocaleMetadataProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = await getDictionary(locale);
  return {
    metadataBase: siteUrl,
    ...localizedMetadata({
      locale,
      title: dictionary.metadata.title,
      description: dictionary.metadata.description,
    }),
    applicationName: brand.en.name,
    category: "astronomy",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);
  return (
    <html lang={locale} className={fontVariables}>
      <body>
        <a className="skip-link" href="#main-content">
          {dictionary.navigation.skip}
        </a>
        {children}
      </body>
    </html>
  );
}
