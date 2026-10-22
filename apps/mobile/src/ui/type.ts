import type { TextStyle } from "react-native";

import type { Locale } from "@/i18n/copy";
import { face, palette, size } from "@/theme";

// ADR-052's type: Anton for display, Geist for English text, JetBrains Mono for labels
// and readings. Georgian sets in Noto Sans Georgian and is never uppercased or tracked.
export const type = {
  body: (locale: Locale, strong = false): TextStyle => ({
    fontFamily:
      locale === "ka"
        ? strong
          ? face.georgianStrong
          : face.georgian
        : strong
          ? face.bodyStrong
          : face.body,
    fontSize: size.body,
    lineHeight: size.body * 1.45,
    color: palette.ink,
  }),
  label: (locale: Locale): TextStyle =>
    locale === "ka"
      ? { fontFamily: face.georgianStrong, fontSize: size.hint, lineHeight: size.hint * 1.4 }
      : {
          fontFamily: face.mono,
          fontSize: size.hint,
          lineHeight: size.hint * 1.4,
          letterSpacing: 1.2,
          textTransform: "uppercase",
        },
  title: (locale: Locale): TextStyle =>
    locale === "ka"
      ? {
          fontFamily: face.georgianStrong,
          fontSize: size.title * 0.8,
          lineHeight: size.title * 1.15,
          color: palette.ink,
        }
      : {
          fontFamily: face.display,
          fontSize: size.title,
          lineHeight: size.title * 1.1,
          textTransform: "uppercase",
          color: palette.ink,
        },
  /** Readings and small print: mono for English and figures; JetBrains Mono has no Georgian letters. */
  reading: (locale: Locale = "en"): TextStyle => ({
    fontFamily: locale === "ka" ? face.georgian : face.mono,
    fontSize: size.hint,
    color: palette.ink2,
  }),
};
