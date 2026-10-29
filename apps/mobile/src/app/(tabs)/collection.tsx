import type { Capture, NativeSession, Target } from "@darkview/contracts";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useLocale } from "@/i18n/locale";
import { platform } from "@/platform/api";
import { useResource } from "@/platform/use-resource";
import { useSession } from "@/platform/session";
import { clock, localDate, nightLabel, targetName } from "@/present";
import { line, palette, radius, space } from "@/theme";
import { Header } from "@/ui/header";
import { Body, Loading, QuietButton, Screen, SimulatedBadge, Title, Unavailable } from "@/ui/kit";
import { type } from "@/ui/type";

export default function Collection() {
  const { state } = useSession();
  const { t } = useLocale();
  return (
    <Screen>
      <Header />
      <Title>{t.collection.title}</Title>
      {state.status === "loading" && <Loading />}
      {state.status === "signed-out" && (
        <View style={{ gap: space[3] }}>
          <Body tone="secondary">{t.collection.signIn}</Body>
          <QuietButton label={t.account.signInTitle} onPress={() => router.navigate("/account")} />
        </View>
      )}
      {state.status === "signed-in" && <Captures session={state.session} />}
    </Screen>
  );
}

async function readCollection(token: string) {
  const [captures, catalogue, observatories] = await Promise.all([
    platform.captures(token),
    platform.catalogue(),
    platform.observatories(),
  ]);
  const zone = observatories.items.find((item) => item.kind === "FIRST_PARTY")?.timezone ?? "UTC";
  return { captures: captures.items, targets: new Map(catalogue.items.map((item) => [item.id, item])), zone };
}

function Captures({ session }: { session: NativeSession }) {
  const { t } = useLocale();
  const { expired } = useSession();
  const { resource, retry } = useResource(() => readCollection(session.token), `collection:${session.token}`);

  useEffect(() => {
    if (resource.state === "unauthorized") void expired();
  }, [resource.state, expired]);

  if (resource.state === "loading") return <Loading />;
  if (resource.state !== "ready") return <Unavailable retry={retry} />;
  if (resource.value.captures.length === 0) {
    return (
      <View style={{ gap: space[2] }}>
        <Body>{t.collection.empty}</Body>
        <Body tone="secondary">{t.collection.emptyDetail}</Body>
      </View>
    );
  }
  return (
    <View style={styles.grid}>
      {resource.value.captures.map((capture) => (
        <Tile key={capture.id} capture={capture} target={resource.value.targets.get(capture.targetId)} zone={resource.value.zone} />
      ))}
    </View>
  );
}

function Tile({ capture, target, zone }: { capture: Capture; target?: Target; zone: string }) {
  const { t, locale } = useLocale();
  // A signed URL that fails to load (lapsed, or an object that is gone) is "no preview",
  // never an empty frame that could pass for a dark sky.
  const [failed, setFailed] = useState(false);
  return (
    <Link href={`/captures/${capture.id}`} asChild>
      <Pressable accessibilityRole="link" style={styles.tile}>
        {capture.thumbnailUrl && !failed ? (
          <Image
            source={{ uri: capture.thumbnailUrl }}
            style={styles.thumb}
            resizeMode="cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <View style={[styles.thumb, styles.noThumb]}>
            <Text style={[type.reading(locale), { color: palette.ink3, textAlign: "center" }]}>{t.collection.noPreview}</Text>
          </View>
        )}
        <View style={{ padding: space[3], gap: 2 }}>
          {capture.mode === "SIMULATED" && <SimulatedBadge />}
          <Text style={type.body(locale, true)} numberOfLines={1}>
            {target ? targetName(target, locale) : capture.imagingProfile}
          </Text>
          <Text style={type.reading(locale)} numberOfLines={1}>
            {`${nightLabel(localDate(Date.parse(capture.capturedAt), zone), locale)} · ${clock(capture.capturedAt, zone)}`}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  grid: { gap: space[3] },
  tile: { borderRadius: radius.medium, overflow: "hidden", borderWidth: StyleSheet.hairlineWidth, borderColor: line, backgroundColor: palette.deep },
  thumb: { width: "100%", aspectRatio: 16 / 9, backgroundColor: palette.bar },
  noThumb: { alignItems: "center", justifyContent: "center", padding: space[4] },
});
