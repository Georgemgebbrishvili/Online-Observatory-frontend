import type { BookableObservatory, TonightSession } from "@darkview/contracts";
import { Link, router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useLocale } from "@/i18n/locale";
import { useSpectate } from "@/live/use-spectate";
import { platform } from "@/platform/api";
import { webAppUrl } from "@/platform/config";
import { readNight } from "@/platform/night";
import { useObservatory } from "@/platform/use-observatory";
import { useResource } from "@/platform/use-resource";
import {
  clock,
  cloudSummary,
  nextOpenSlot,
  observatoryName,
  price,
  sortTonight,
  statusHeadline,
  targetName,
} from "@/present";
import { face, line, palette, radius, space, touch } from "@/theme";
import { Header } from "@/ui/header";
import { ChevronRight } from "@/ui/icons";
import {
  Body,
  Card,
  Dot,
  Label,
  Loading,
  PrimaryButton,
  QuietButton,
  SimulatedBadge,
  Screen,
  Title,
  Unavailable,
} from "@/ui/kit";
import { type } from "@/ui/type";

export default function Tonight() {
  const { t } = useLocale();
  const { resource, retry } = useObservatory();

  return (
    <Screen>
      <Header />
      <LiveTonight />
      {resource.state === "loading" && <Loading />}
      {(resource.state === "unavailable" || resource.state === "not-found") && (
        <Unavailable retry={retry} />
      )}
      {resource.state === "ready" && !resource.value && <Unavailable message={t.noObservatory} />}
      {resource.state === "ready" && resource.value && (
        <>
          <Hero observatory={resource.value} />
          <NextSlot observatory={resource.value} />
          <Status observatory={resource.value} />
          <Conditions observatory={resource.value} />
          <Targets observatory={resource.value} />
        </>
      )}
    </Screen>
  );
}

/** The observatory by name and aperture: the instrument's make is never shown. */
function Hero({ observatory }: { observatory: BookableObservatory }) {
  const { t, locale } = useLocale();
  const { demo, name } = observatoryName(locale === "ka" ? observatory.nameKa : observatory.nameEn);
  return (
    <View style={{ gap: space[2] }}>
      <Label>{t.tagline}</Label>
      <Title>{name}</Title>
      <View style={styles.heroMeta}>
        {demo && (
          <View style={styles.demo}>
            <Text style={[type.label(locale), { color: palette.gold }]}>{t.demo}</Text>
          </View>
        )}
        <Text style={[type.reading(locale), { color: palette.ink3, flexShrink: 1 }]}>
          {t.instrument(observatory.telescope.apertureMm, observatory.telescope.focalLengthMm)}
        </Text>
      </View>
    </View>
  );
}

/** The one thing to do tonight: the next open slot, and the way to book it. */
function NextSlot({ observatory }: { observatory: BookableObservatory }) {
  const { t, locale } = useLocale();
  const { resource, retry } = useResource(() => readNight(observatory), `night:${observatory.id}`);
  const book = () => WebBrowser.openBrowserAsync(`${webAppUrl}/${locale}/app/book`);

  if (resource.state === "loading") return <Loading />;
  if (resource.state !== "ready") return <Unavailable retry={retry} />;

  const slot = nextOpenSlot(resource.value.items, Date.now());
  return (
    <View style={styles.ticket}>
      <Label>{t.next.title}</Label>
      {slot ? (
        <View style={{ gap: space[1] }}>
          <Text style={styles.ticketTime} accessibilityLabel={`${clock(slot.startAt, observatory.timezone)}–${clock(slot.endAt, observatory.timezone)}`}>
            {`${clock(slot.startAt, observatory.timezone)}–${clock(slot.endAt, observatory.timezone)}`}
          </Text>
          <View style={styles.ticketMeta}>
            <Dot tone="live" />
            <Text style={[type.body(locale), { color: palette.ink2, flex: 1 }]}>{t.next.open}</Text>
            <Text style={[type.reading(locale), { color: palette.ink }]}>{price(slot.priceMinor, locale)}</Text>
          </View>
        </View>
      ) : (
        <View style={{ gap: space[1] }}>
          <Body strong>{t.next.full}</Body>
          <Body tone="secondary">{t.next.fullDetail}</Body>
        </View>
      )}
      <PrimaryButton label={slot ? t.next.cta : t.next.otherNight} onPress={book} />
      {resource.value.items.length > 0 && (
        <QuietButton wide label={t.next.allSlots} onPress={() => router.navigate("/book")} />
      )}
    </View>
  );
}

/** Clients ADR-066: the session its owner opened to anyone; nothing when there is none. */
function LiveTonight() {
  const { resource } = useResource(() => platform.tonight(), "tonight");
  if (resource.state !== "ready" || !resource.value.live) return null;
  return <Spectator session={resource.value.live} />;
}

function Spectator({ session }: { session: TonightSession }) {
  const { t, locale } = useLocale();
  const [attempt, setAttempt] = useState(0);
  const view = useSpectate(session.streamPath, attempt);
  const target = targetName(session.target, locale);

  return (
    <View style={{ gap: space[3] }}>
      <Label>{t.spectate.liveNow}</Label>
      <Title>{t.spectate.watching(target)}</Title>
      <Body tone="secondary">{t.room.states[session.state]}</Body>
      <View style={styles.feed}>
        {view.status === "frame" ? (
          <Image
            source={{ uri: view.uri }}
            style={styles.frame}
            resizeMode="contain"
            accessibilityLabel={t.spectate.watching(target)}
          />
        ) : (
          <View style={[styles.frame, styles.empty]}>
            <Text style={[type.reading(locale), { color: palette.ink3, textAlign: "center" }]}>
              {view.status === "full" ? t.spectate.full : t.spectate.waiting}
            </Text>
            {view.status === "full" && (
              <QuietButton label={t.retry} onPress={() => setAttempt((value) => value + 1)} />
            )}
          </View>
        )}
        {session.mode === "SIMULATED" && (
          <View style={styles.badge}>
            <SimulatedBadge />
          </View>
        )}
      </View>
      <Body tone="tertiary">{t.spectate.rate}</Body>
    </View>
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
                <ChevronRight color={palette.ink3} />
              </Pressable>
            </Link>
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  feed: {
    borderRadius: radius.medium,
    overflow: "hidden",
    backgroundColor: palette.bar,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: line,
  },
  frame: { width: "100%", aspectRatio: 16 / 9 },
  empty: { alignItems: "center", justifyContent: "center", gap: space[2], padding: space[4] },
  badge: { position: "absolute", top: space[3], left: space[3] },
  statusRow: { flexDirection: "row", alignItems: "center", gap: space[2] },
  heroMeta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: space[2] },
  demo: {
    paddingHorizontal: space[2],
    paddingVertical: 2,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: palette.gold,
  },
  ticket: {
    gap: space[4],
    padding: space[4],
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: `${palette.red}55`,
    backgroundColor: palette.deep,
    boxShadow: `0 0 40px -12px ${palette.red}66`,
  },
  ticketTime: { fontFamily: face.display, fontSize: 40, lineHeight: 46, color: palette.cream, letterSpacing: 1 },
  ticketMeta: { flexDirection: "row", alignItems: "center", gap: space[2] },
  target: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    minHeight: touch + 8,
    paddingVertical: space[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: line,
  },
});
