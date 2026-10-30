import { headers } from "next/headers";

import { defaultLocale, isLocale, localeHeader } from "@/i18n/config";
import { fontVariables } from "@/styles/fonts";
import "@/styles/globals.css";

import NotFound from "./[locale]/not-found";

// The proxy answers an unknown address with a 404 status, and a 404 status is served
// this page rather than the locale tree's not-found, so it wraps that one in the document.
export default async function GlobalNotFound() {
  const requested = (await headers()).get(localeHeader) ?? defaultLocale;
  const locale = isLocale(requested) ? requested : defaultLocale;
  return (
    <html lang={locale} className={fontVariables}>
      <body>
        <NotFound />
      </body>
    </html>
  );
}
