import type { BookableObservatory } from "@darkview/contracts";
import * as WebBrowser from "expo-web-browser";
import { StyleSheet, Text, View } from "react-native";

import { useLocale } from "@/i18n/locale";
import { webAppUrl } from "@/platform/config";
import { readNight } from "@/platform/night";
import { useObservatory } from "@/platform/use-observatory";
import { useResource } from "@/platform/use-resource";
import { clock, nightLabel, price } from "@/present";
import { line, palette, space } from "@/theme";
import { Header } from "@/ui/header";
import { Body, Card, Dot, Label, Loading, PrimaryButton, Screen, Title, Unavailable } from "@/ui/kit";
import { type } from "@/ui/type";

export default function Book() {
  const { t } = useLocale();
  const { resource, retry } = useObservatory();

  return (
    <Screen>
      <Header />
      {resource.state === "loading" && <Loading />}
      {(resource.state === "unavailable" || resource.state === "not-found") && (
        <Unavailable retry={retry} />
      )}
      {resource.state === "ready" && !resource.value && <Unavailable message={t.noObservatory} />}
      {resource.state === "ready" && resource.value && <Night observatory={resource.value} />}
    </Screen>
  );
}

function Night({ observatory }: { observatory: BookableObservatory }) {
  const { t, locale } = useLocale();
  const { resource, retry } = useResource(() => readNight(observatory), `night:${observatory.id}`);

  const openWebsite = () => WebBrowser.openBrowserAsync(`${webAppUrl}/${locale}/app/book`);

  return (
    <>
      <View style={{ gap: space[2] }}>
        <Label>{t.book.title}</Label>
        {resource.state === "ready" && <Title>{nightLabel(resource.value.date, locale)}</Title>}
        <Body tone="tertiary">{t.book.siteTime(observatory.timezone)}</Body>
      </View>

      <Card>
        <Body tone="secondary">{t.book.handover}</Body>
        <PrimaryButton label={t.book.cta} onPress={openWebsite} />
      </Card>

      {resource.state === "loading" && <Loading />}
      {resource.state !== "loading" && resource.state !== "ready" && <Unavailable retry={retry} />}
      {resource.state === "ready" && resource.value.items.length === 0 && (
        <Body tone="secondary">{t.book.noSlots}</Body>
      )}
      {resource.state === "ready" && resource.value.items.length > 0 && (
        <View>
          {resource.value.items.map((slot) => (
            <View
              key={slot.startAt}
              style={styles.slot}
              accessible
              accessibilityLabel={`${clock(slot.startAt, observatory.timezone)}, ${slot.available ? t.book.open : t.book.full}, ${price(slot.priceMinor, locale)}`}
            >
              <Dot tone={slot.available ? "live" : "off"} />
              <Text style={[type.reading(locale), styles.time, !slot.available && styles.taken]}>
                {`${clock(slot.startAt, observatory.timezone)}–${clock(slot.endAt, observatory.timezone)}`}
              </Text>
              <Text style={[type.body(locale), { color: slot.available ? palette.ink : palette.ink3, flex: 1 }]}>
                {slot.available ? t.book.open : t.book.full}
              </Text>
              <Text style={type.reading(locale)}>{price(slot.priceMinor, locale)}</Text>
            </View>
          ))}
        </View>
      )}

    </>
  );
}

const styles = StyleSheet.create({
  slot: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    minHeight: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: line,
  },
  time: { color: palette.ink, width: 104 },
  taken: { color: palette.ink3, textDecorationLine: "line-through" },
});
