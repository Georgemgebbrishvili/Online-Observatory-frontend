import type { Metadata } from "next";
import { headers } from "next/headers";

import { brand } from "@/brand";
import { defaultLocale, isLocale, localeHeader } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { fontVariables } from "@/styles/fonts";
import "@/styles/globals.css";

import NotFound from "./[locale]/not-found";

async function requestLocale() {
  const requested = (await headers()).get(localeHeader) ?? defaultLocale;
  return isLocale(requested) ? requested : defaultLocale;
}

// This page bypasses the locale layout, so the tab's title is named here.
export async function generateMetadata(): Promise<Metadata> {
  const locale = await requestLocale();
  const copy = (await getDictionary(locale)).notFound;
  const name = locale === "ka" ? brand.ka.nominative : brand.en.name;
  return { title: `${copy.title} · ${name}`, robots: { index: false } };
}

// The proxy answers an unknown address with a 404 status, and a 404 status is served
// this page rather than the locale tree's not-found, so it wraps that one in the document.
export default async function GlobalNotFound() {
  const locale = await requestLocale();
  return (
    <html lang={locale} className={fontVariables}>
      <body>
        <NotFound />
      </body>
    </html>
  );
}
