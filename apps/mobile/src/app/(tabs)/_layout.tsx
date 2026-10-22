import { Tabs } from "expo-router";

import { useLocale } from "@/i18n/locale";
import { line, palette } from "@/theme";
import { type } from "@/ui/type";

// The phone tab bar: glass over the bar colour, the active tab in the accent (ADR-052).
export default function TabsLayout() {
  const { t, locale } = useLocale();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.redInk,
        tabBarInactiveTintColor: palette.ink3,
        tabBarLabelStyle: { ...type.label(locale), marginBottom: 2 },
        tabBarIconStyle: { display: "none" },
        tabBarStyle: {
          backgroundColor: `${palette.bar}e6`,
          borderTopColor: line,
          minHeight: 56,
        },
        sceneStyle: { backgroundColor: palette.canvas },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t.tabs.tonight }} />
      <Tabs.Screen name="book" options={{ title: t.tabs.book }} />
      <Tabs.Screen name="account" options={{ title: t.tabs.account }} />
    </Tabs>
  );
}
