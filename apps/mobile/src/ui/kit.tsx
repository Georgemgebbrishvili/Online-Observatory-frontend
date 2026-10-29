import { router, type Href } from "expo-router";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, type TextStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLocale } from "@/i18n/locale";
import { line, palette, radius, space, touch } from "@/theme";
import { ChevronLeft } from "@/ui/icons";
import { type } from "@/ui/type";
import type { Tone } from "@/present";

/**
 * A scrolling page, edge to edge: the canvas runs under the system bars and the content
 * keeps clear of them. A tab's bottom inset belongs to the tab bar; a pushed page (one
 * with `back`) keeps clear of the navigation bar itself and leads with a back bar.
 */
export function Screen({ children, back }: { children: ReactNode; back?: Href }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.safe}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + space[2],
            paddingLeft: space[4] + insets.left,
            paddingRight: space[4] + insets.right,
            paddingBottom: space[6] + (back ? insets.bottom : 0),
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {back && <BackBar fallback={back} />}
        {children}
      </ScrollView>
      {/* Scrolled content never runs under the status bar's clock and icons. */}
      <View pointerEvents="none" style={[styles.scrim, { height: insets.top }]} />
    </View>
  );
}

/** Back to where the page was opened from; to `fallback` when it was opened by a link. */
function BackBar({ fallback }: { fallback: Href }) {
  const { t, locale } = useLocale();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t.back}
      onPress={() => (router.canGoBack() ? router.back() : router.replace(fallback))}
      style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}
    >
      <ChevronLeft color={palette.ink} />
      <Text style={[type.body(locale, true), { color: palette.ink }]}>{t.back}</Text>
    </Pressable>
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

/** Skychaser's poster button (ADR-075): vermilion, cream letters, a hard print shadow. */
export function PrimaryButton({
  label,
  onPress,
  busy = false,
}: {
  label: string;
  onPress: () => void;
  busy?: boolean;
}) {
  const { locale } = useLocale();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy }}
      onPress={onPress}
      disabled={busy}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, busy && { opacity: 0.7 }]}
    >
      {busy && <ActivityIndicator color={palette.gdInk} />}
      <Text style={[type.body(locale, true), styles.buttonLabel]}>{label}</Text>
    </Pressable>
  );
}

export function QuietButton({
  label,
  onPress,
  wide = false,
}: {
  label: string;
  onPress: () => void;
  wide?: boolean;
}) {
  const { locale } = useLocale();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.quiet, wide && styles.wide, pressed && { backgroundColor: palette.deep }]}
    >
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
  scroll: { gap: space[5] },
  scrim: { position: "absolute", top: 0, left: 0, right: 0, backgroundColor: `${palette.canvas}f2` },
  back: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: space[1],
    minHeight: touch,
    paddingRight: space[3],
    marginLeft: -space[1],
    marginBottom: -space[3],
  },
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
    minHeight: 52,
    flexDirection: "row",
    gap: space[2],
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space[5],
    borderRadius: radius.button,
    backgroundColor: palette.redFill,
    experimental_backgroundImage: `linear-gradient(180deg, ${palette.sun4} 0%, ${palette.redFill} 50%, ${palette.gdMid} 100%)`,
    boxShadow: `0 3px 0 ${palette.gdDeep}, 0 12px 30px -8px ${palette.sun4}99`,
  },
  pressed: { transform: [{ translateY: 2 }], boxShadow: `0 1px 0 ${palette.gdDeep}` },
  buttonLabel: { color: palette.gdInk, textShadowColor: `${palette.gdDeep}99`, textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 },
  quiet: {
    alignSelf: "flex-start",
    minHeight: touch,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space[4],
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: line,
  },
  wide: { alignSelf: "stretch" },
  state: { gap: space[3], paddingVertical: space[5] },
});
