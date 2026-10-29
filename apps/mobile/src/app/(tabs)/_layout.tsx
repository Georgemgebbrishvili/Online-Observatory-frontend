import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLocale } from "@/i18n/locale";
import { line, palette } from "@/theme";
import { AccountIcon, BookIcon, CollectionIcon, TonightIcon } from "@/ui/icons";
import { type } from "@/ui/type";

// The phone tab bar: the bar colour under the system navigation bar, the active tab in the
// accent (ADR-052). Back from any tab returns to Tonight, then leaves the app.
export default function TabsLayout() {
  const { t, locale } = useLocale();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      backBehavior="firstRoute"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.redInk,
        tabBarInactiveTintColor: palette.ink3,
        // Four tabs on a 360 dp phone: the label keeps its face but loses most tracking.
        tabBarLabelStyle: { ...type.label(locale), fontSize: 12, lineHeight: 16, letterSpacing: locale === "ka" ? 0 : 0.6 },
        tabBarStyle: {
          backgroundColor: palette.bar,
          borderTopColor: line,
          // Icon over label in 60 dp, above the system navigation bar.
          height: 64 + insets.bottom,
          paddingTop: 2,
          paddingBottom: 2 + insets.bottom,
        },
        sceneStyle: { backgroundColor: palette.canvas },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t.tabs.tonight, tabBarIcon: ({ color }) => <TonightIcon color={color} /> }}
      />
      <Tabs.Screen
        name="book"
        options={{ title: t.tabs.book, tabBarIcon: ({ color }) => <BookIcon color={color} /> }}
      />
      <Tabs.Screen
        name="collection"
        options={{ title: t.tabs.collection, tabBarIcon: ({ color }) => <CollectionIcon color={color} /> }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: t.tabs.account, tabBarIcon: ({ color }) => <AccountIcon color={color} /> }}
      />
    </Tabs>
  );
}
