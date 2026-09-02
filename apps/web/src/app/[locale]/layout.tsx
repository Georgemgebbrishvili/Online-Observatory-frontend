import type { Metadata } from "next";
import { Inter, Noto_Sans_Georgian, Space_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, locales } from "@/i18n/config";
import { localizedMetadata, siteUrl } from "@/lib/seo";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const notoSansGeorgian = Noto_Sans_Georgian({
  subsets: ["georgian"],
  variable: "--font-georgian",
  display: "swap",
  preload: false,
});

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
    applicationName: "Darkview",
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
  const bodyFont = locale === "ka" ? notoSansGeorgian.variable : inter.variable;

  return (
    <html
      lang={locale}
      className={`${bodyFont} ${spaceGrotesk.variable}`}
    >
      <body>
        <a className="skip-link" href="#main-content">
          {dictionary.navigation.skip}
        </a>
        {children}
      </body>
    </html>
  );
}
