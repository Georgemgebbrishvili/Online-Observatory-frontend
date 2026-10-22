import { getLocales } from "expo-localization";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { copy, type Copy, type Locale } from "./copy";

const LocaleContext = createContext<{
  locale: Locale;
  t: Copy;
  toggle: () => void;
} | null>(null);

function deviceLocale(): Locale {
  return getLocales()[0]?.languageCode === "ka" ? "ka" : "en";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(deviceLocale);
  const value = useMemo(
    () => ({
      locale,
      t: copy[locale],
      toggle: () => setLocale((current) => (current === "en" ? "ka" : "en")),
    }),
    [locale],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale outside LocaleProvider");
  return value;
}
