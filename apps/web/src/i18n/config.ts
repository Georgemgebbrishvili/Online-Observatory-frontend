export const locales = ["en", "ka"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

/** Set by the proxy on every localized request, for the one file that gets no params. */
export const localeHeader = "x-locale";
