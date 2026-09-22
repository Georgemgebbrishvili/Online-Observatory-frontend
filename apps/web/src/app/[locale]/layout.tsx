import type { Metadata } from "next";
import { IBM_Plex_Mono, Noto_Serif_Georgian } from "next/font/google";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, locales } from "@/i18n/config";
import { localizedMetadata, siteUrl } from "@/lib/seo";
import "@/styles/globals.css";

const firaGO = localFont({
  src: [
    { path: "../fonts/firago/FiraGO-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/firago/FiraGO-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/firago/FiraGO-SemiBold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-firago",
  display: "swap",
});

const notoSerifGeorgian = Noto_Serif_Georgian({
  subsets: ["georgian", "latin"],
  weight: ["500", "600"],
  variable: "--font-noto-serif-georgian",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
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
  return (
    <html
      lang={locale}
      className={`${firaGO.variable} ${notoSerifGeorgian.variable} ${ibmPlexMono.variable}`}
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
