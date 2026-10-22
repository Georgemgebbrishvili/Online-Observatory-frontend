import type { BookableObservatory } from "@darkview/contracts";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useLocale } from "@/i18n/locale";
import { platform } from "@/platform/api";
import { useObservatory } from "@/platform/use-observatory";
import { useResource } from "@/platform/use-resource";
import { cloudSummary, sortTonight, statusHeadline, targetName } from "@/present";
import { line, space } from "@/theme";
import { Header } from "@/ui/header";
import { Body, Card, Dot, Label, Loading, SimulatedBadge, Screen, Title, Unavailable } from "@/ui/kit";
import { type } from "@/ui/type";

export default function Tonight() {
  const { t, locale } = useLocale();
  const { resource, retry } = useObservatory();

  return (
    <Screen>
      <Header />
      {resource.state === "loading" && <Loading />}
      {(resource.state === "unavailable" || resource.state === "not-found") && (
        <Unavailable retry={retry} />
      )}
      {resource.state === "ready" && !resource.value && <Unavailable message={t.noObservatory} />}
      {resource.state === "ready" && resource.value && (
        <>
          <View style={{ gap: space[2] }}>
            <Label>{t.tagline}</Label>
            <Title>{locale === "ka" ? resource.value.nameKa : resource.value.nameEn}</Title>
            <Body tone="tertiary">
              {`${resource.value.telescope.manufacturer} ${resource.value.telescope.model} · ${resource.value.telescope.apertureMm} mm`}
            </Body>
          </View>
          <Status observatory={resource.value} />
          <Conditions observatory={resource.value} />
          <Targets observatory={resource.value} />
        </>
      )}
    </Screen>
  );
}

function Status({ observatory }: { observatory: BookableObservatory }) {
  const { t } = useLocale();
  const { resource, retry } = useResource(() => platform.status(observatory.id), `status:${observatory.id}`);

  if (resource.state === "loading") return <Loading />;
  if (resource.state !== "ready") return <Unavailable retry={retry} />;

  const status = resource.value;
  const headline = statusHeadline(status);
  return (
    <Card>
      {status.mode === "SIMULATED" ? <SimulatedBadge /> : <Label tone="muted">{t.real}</Label>}
      {status.mode === "SIMULATED" && <Body tone="secondary">{t.simulatedDetail}</Body>}
      <View style={styles.statusRow}>
        <Dot tone={headline.tone} />
        <Body strong>
          {headline.kind === "weather"
            ? t.weatherLine(t.weather[headline.weather])
            : t.headline[headline.kind]}
        </Body>
      </View>
      <Body tone="tertiary">{`${t.link[status.link]}${status.missionInProgress ? ` · ${t.missionInProgress}` : ""}`}</Body>
    </Card>
  );
}

function Conditions({ observatory }: { observatory: BookableObservatory }) {
  const { t } = useLocale();
  const { resource, retry } = useResource(
    () => platform.conditions(observatory.id),
    `conditions:${observatory.id}`,
  );

  if (resource.state === "loading") return null;
  if (resource.state !== "ready") return <Unavailable retry={retry} />;

  const summary = cloudSummary(resource.value.items);
  return (
    <View style={{ gap: space[2] }}>
      <Label>{t.conditions}</Label>
      <Body>
        {resource.value.items.length === 0
          ? t.noHours
          : summary
            ? t.cloud(summary.median, summary.knownHours, summary.hours)
            : t.noForecast}
      </Body>
      <Body tone="tertiary">{t.advisory}</Body>
    </View>
  );
}

function Targets({ observatory }: { observatory: BookableObservatory }) {
  const { t, locale } = useLocale();
  const { resource, retry } = useResource(
    () => platform.tonightTargets(observatory.id),
    `tonight:${observatory.id}`,
  );

  return (
    <View style={{ gap: space[3] }}>
      <Label>{t.targets}</Label>
      {resource.state === "loading" && <Loading />}
      {resource.state !== "loading" && resource.state !== "ready" && <Unavailable retry={retry} />}
      {resource.state === "ready" && resource.value.items.length === 0 && (
        <Body tone="secondary">{t.noTargets}</Body>
      )}
      {resource.state === "ready" &&
        sortTonight(resource.value.items).map(({ target, visibility }) => {
          const reason = visibility.blockReasons[0];
          return (
            <Link key={target.id} href={`/targets/${target.slug}`} asChild>
              <Pressable accessibilityRole="link" style={styles.target}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={type.body(locale, true)}>{targetName(target, locale)}</Text>
                  <Text style={type.reading(locale)}>
                    {visibility.observable
                      ? `${t.visible} · ${t.altitude(visibility.horizontal.altitudeDegrees)}`
                      : reason
                        ? t.reasons[reason]
                        : t.altitude(visibility.horizontal.altitudeDegrees)}
                  </Text>
                </View>
                <Dot tone={visibility.observable ? "live" : "off"} />
              </Pressable>
            </Link>
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  statusRow: { flexDirection: "row", alignItems: "center", gap: space[2] },
  target: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    minHeight: 56,
    paddingVertical: space[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: line,
  },
});
