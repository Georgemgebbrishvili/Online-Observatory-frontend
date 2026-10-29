import { useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { View } from "react-native";

import { useLocale } from "@/i18n/locale";
import { platform } from "@/platform/api";
import { webAppUrl } from "@/platform/config";
import { useResource } from "@/platform/use-resource";
import { targetDescription, targetName } from "@/present";
import { space } from "@/theme";
import { Body, Card, Label, Loading, PrimaryButton, Screen, Title, Unavailable } from "@/ui/kit";

export default function TargetPage() {
  const { t, locale } = useLocale();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { resource, retry } = useResource(() => platform.target(slug), `target:${slug}`);

  return (
    <Screen back="/">
      {resource.state === "loading" && <Loading />}
      {resource.state === "not-found" && <Unavailable message={t.notFound} />}
      {resource.state === "unavailable" && <Unavailable retry={retry} />}
      {resource.state === "ready" && (
        <>
          <View style={{ gap: space[2] }}>
            {resource.value.catalogId && <Label>{resource.value.catalogId}</Label>}
            <Title>{targetName(resource.value, locale)}</Title>
          </View>
          {targetDescription(resource.value, locale) && (
            <Body tone="secondary">{targetDescription(resource.value, locale)}</Body>
          )}
          <Card>
            <Body>{t.magnitude(resource.value.magnitude)}</Body>
            <Body>{t.minutes(resource.value.expectedMissionMinutes)}</Body>
          </Card>
          <PrimaryButton
            label={t.book.cta}
            onPress={() => WebBrowser.openBrowserAsync(`${webAppUrl}/${locale}/app/book`)}
          />
        </>
      )}
    </Screen>
  );
}
