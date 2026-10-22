import { Pressable, StyleSheet, Text, View } from "react-native";

import { useLocale } from "@/i18n/locale";
import { face, palette, space } from "@/theme";
import { type } from "@/ui/type";

/** The wordmark, and the language switch: all the header carries (ADR-057). */
export function Header() {
  const { t, locale, toggle } = useLocale();
  return (
    <View style={styles.row}>
      <Text style={styles.mark} accessibilityRole="header">
        STELLAR
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t.language}
        onPress={toggle}
        hitSlop={12}
        style={styles.switch}
      >
        <Text style={[type.label(locale === "en" ? "ka" : "en"), { color: palette.ink2 }]}>
          {t.language}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  mark: { fontFamily: face.display, fontSize: 22, letterSpacing: 3, color: palette.ink },
  switch: { minHeight: 44, justifyContent: "center" },
});
