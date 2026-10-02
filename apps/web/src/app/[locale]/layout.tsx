import type { Metadata } from "next";
import {
  Anton,
  Bowlby_One,
  Geist,
  JetBrains_Mono,
  Noto_Sans_Georgian,
  Oswald,
} from "next/font/google";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, locales } from "@/i18n/config";
import { localizedMetadata, siteUrl } from "@/lib/seo";
import "@/styles/globals.css";
import { brand } from "@/brand";

const firaGO = localFont({
  src: [
    { path: "../fonts/firago/FiraGO-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/firago/FiraGO-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/firago/FiraGO-SemiBold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-firago",
  display: "swap",
});

// ADR-039 type. Anton for headlines, Bowlby One for the one sunset title, Oswald for
// spaced labels, Geist for body, JetBrains Mono for data.
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const bowlbyOne = Bowlby_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bowlby-one",
  display: "swap",
  preload: false,
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: false,
});

// The Mkhedruli headline and label face, variable in weight. Its width axis narrows Latin
// but hardly Mkhedruli, so Georgian headlines are heavy at their natural width.
const notoSansGeorgian = Noto_Sans_Georgian({
  subsets: ["georgian"],
  variable: "--font-noto-sans-georgian",
  display: "swap",
  preload: false,
});

const fontVariables = [
  firaGO,
  anton,
  bowlbyOne,
  oswald,
  geist,
  jetBrainsMono,
  notoSansGeorgian,
]
  .map((font) => font.variable)
  .join(" ");

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
