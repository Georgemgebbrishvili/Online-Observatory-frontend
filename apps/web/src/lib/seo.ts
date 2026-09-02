import type { Metadata } from "next";

import type { Locale } from "@/i18n/config";

export const siteUrl = new URL(process.env.APP_URL ?? "http://localhost:3000");

export function localizedMetadata({
  description,
  locale,
  path = "",
  title,
}: {
  description: string;
  locale: Locale;
  path?: string;
  title: string;
}): Metadata {
  const localizedPath = path ? `/${path}` : "";
  const canonical = `/${locale}${localizedPath}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: `/en${localizedPath}`,
        ka: `/ka${localizedPath}`,
        "x-default": `/en${localizedPath}`,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: "Darkview by Astroman",
      locale: locale === "ka" ? "ka_GE" : "en_US",
      alternateLocale: locale === "ka" ? ["en_US"] : ["ka_GE"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export const privatePageMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};
