import { Pressable, StyleSheet, Text, View } from "react-native";

import { useLocale } from "@/i18n/locale";
import { line, palette, radius, space, touch } from "@/theme";
import { CometMark, Wordmark } from "@/ui/icons";
import { type } from "@/ui/type";

/** The lockup, and the language switch: all the header carries (ADR-057). */
export function Header() {
  const { t, locale, toggle } = useLocale();
  return (
    <View style={styles.row}>
      <View style={styles.lockup} accessible accessibilityRole="header" accessibilityLabel={t.name}>
        <CometMark size={26} />
        <Wordmark height={15} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t.language}
        onPress={toggle}
        style={({ pressed }) => [styles.switch, pressed && { backgroundColor: palette.deep }]}
      >
        <Text style={[type.label(locale === "en" ? "ka" : "en"), { color: palette.ink2 }]}>
          {t.language}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: touch },
  lockup: { flexDirection: "row", alignItems: "center", gap: space[2] },
  switch: {
    minHeight: 40,
    minWidth: touch,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: space[3],
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: line,
    // A 40 dp chip, its touch area grown to 48.
    marginVertical: 4,
  },
});
