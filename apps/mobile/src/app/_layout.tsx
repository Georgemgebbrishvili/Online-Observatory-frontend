import { Anton_400Regular } from "@expo-google-fonts/anton";
import { Geist_400Regular, Geist_600SemiBold } from "@expo-google-fonts/geist";
import { JetBrainsMono_500Medium } from "@expo-google-fonts/jetbrains-mono";
import {
  NotoSansGeorgian_400Regular,
  NotoSansGeorgian_700Bold,
} from "@expo-google-fonts/noto-sans-georgian";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LocaleProvider } from "@/i18n/locale";
import { SessionProvider } from "@/platform/session";
import { palette } from "@/theme";

export default function RootLayout() {
  const [loaded] = useFonts({
    Anton_400Regular,
    Geist_400Regular,
    Geist_600SemiBold,
    JetBrainsMono_500Medium,
    NotoSansGeorgian_400Regular,
    NotoSansGeorgian_700Bold,
  });

  if (!loaded) return <View style={{ flex: 1, backgroundColor: palette.canvas }} />;

  return (
    <SafeAreaProvider>
      <LocaleProvider>
        <SessionProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: palette.canvas },
            }}
          />
        </SessionProvider>
      </LocaleProvider>
    </SafeAreaProvider>
  );
}
