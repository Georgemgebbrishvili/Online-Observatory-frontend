import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, type TextStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLocale } from "@/i18n/locale";
import { line, palette, radius, space } from "@/theme";
import { type } from "@/ui/type";
import type { Tone } from "@/present";

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>{children}</ScrollView>
    </SafeAreaView>
  );
}

/** Body text in the locale's face: Geist for English, Noto Sans Georgian for Georgian. */
export function Body({
  children,
  tone = "primary",
  strong = false,
  style,
}: {
  children: ReactNode;
  tone?: "primary" | "secondary" | "tertiary" | "error";
  strong?: boolean;
  style?: TextStyle;
}) {
  const { locale } = useLocale();
  return <Text style={[type.body(locale, strong), { color: inks[tone] }, style]}>{children}</Text>;
}

/** A section label. English is uppercased and tracked; Georgian never is. */
export function Label({ children, tone = "accent" }: { children: ReactNode; tone?: "accent" | "muted" }) {
  const { locale } = useLocale();
  return (
    <Text
      accessibilityRole="header"
      style={[type.label(locale), { color: tone === "accent" ? palette.redInk : palette.ink3 }]}
    >
      {children}
    </Text>
  );
}

export function Title({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  return (
    <Text accessibilityRole="header" style={type.title(locale)}>
      {children}
    </Text>
  );
}

const inks = {
  primary: palette.ink,
  secondary: palette.ink2,
  tertiary: palette.ink3,
  error: palette.error,
};

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

const toneColour: Record<Tone, string> = { live: palette.green, warn: palette.gold, off: palette.ink3 };

export function Dot({ tone }: { tone: Tone }) {
  return <View style={[styles.dot, { backgroundColor: toneColour[tone] }]} />;
}

/** Gold pill: a simulated observatory is always badged (CLAUDE.md). */
export function SimulatedBadge() {
  const { t, locale } = useLocale();
  return (
    <View style={styles.badge} accessibilityLabel={t.simulated}>
      <Text style={[type.label(locale), { color: palette.gold }]}>{t.simulated}</Text>
    </View>
  );
}

export function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { locale } = useLocale();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
    >
      <Text style={[type.body(locale, true), { color: palette.ink }]}>{label}</Text>
    </Pressable>
  );
}

export function QuietButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { locale } = useLocale();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.quiet} hitSlop={8}>
      <Text style={[type.body(locale, true), { color: palette.ink }]}>{label}</Text>
    </Pressable>
  );
}

export function Loading() {
  const { t } = useLocale();
  return (
    <View style={styles.state} accessibilityLiveRegion="polite">
      <ActivityIndicator color={palette.redInk} />
      <Body tone="secondary">{t.loading}</Body>
    </View>
  );
}

export function Unavailable({ retry, message }: { retry?: () => void; message?: string }) {
  const { t } = useLocale();
  return (
    <View style={styles.state} accessibilityLiveRegion="polite">
      <Body tone="error">{message ?? t.unavailable}</Body>
      {retry && <QuietButton label={t.retry} onPress={retry} />}
    </View>
  );
}


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.canvas },
  scroll: { padding: space[4], gap: space[5], paddingBottom: space[6] * 2 },
  card: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: line,
    backgroundColor: palette.deep,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.gold,
  },
  button: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space[5],
    borderRadius: radius.pill,
    backgroundColor: palette.redFill,
    boxShadow: `0 0 24px ${palette.red}66`,
  },
  quiet: {
    alignSelf: "flex-start",
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: line,
  },
  state: { gap: space[3], paddingVertical: space[5] },
});
