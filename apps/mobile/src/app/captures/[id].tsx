import type { NativeSession } from "@darkview/contracts";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Share, StyleSheet, Text, View } from "react-native";

import { useLocale } from "@/i18n/locale";
import { platform, PlatformError } from "@/platform/api";
import { webAppUrl } from "@/platform/config";
import { useResource } from "@/platform/use-resource";
import { useSession } from "@/platform/session";
import { clock, localDate, nightLabel, targetName } from "@/present";
import { line, palette, radius, space } from "@/theme";
import { Body, Label, Loading, PrimaryButton, QuietButton, Screen, SimulatedBadge, Title, Unavailable } from "@/ui/kit";
import { type } from "@/ui/type";

export default function CapturePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useSession();
  const { t } = useLocale();
  return (
    <Screen>
      <QuietButton label={t.back} onPress={() => (router.canGoBack() ? router.back() : router.replace("/collection"))} />
      {state.status === "loading" && <Loading />}
      {state.status === "signed-out" && <Body tone="secondary">{t.collection.signIn}</Body>}
      {state.status === "signed-in" && <Detail id={id} session={state.session} />}
    </Screen>
  );
}

async function readCapture(id: string, token: string) {
  const [capture, catalogue, observatories] = await Promise.all([
    platform.capture(id, token),
    platform.catalogue(),
    platform.observatories(),
  ]);
  // A capture with no stored image answers 404 here; that is "no preview", not a failure.
  const image = await platform.captureImage(id, token).catch((error: unknown) => {
    if (error instanceof PlatformError && error.status === 404) return null;
    throw error;
  });
  const zone = observatories.items.find((item) => item.kind === "FIRST_PARTY")?.timezone ?? "UTC";
  return { capture, image, zone, target: catalogue.items.find((item) => item.id === capture.targetId) ?? null };
}

const seconds = (ms: number) => (ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(ms % 1000 ? 1 : 0)} s`);

function Detail({ id, session }: { id: string; session: NativeSession }) {
  const { t, locale } = useLocale();
  const { expired } = useSession();
  const [failed, setFailed] = useState(false);
  const { resource, retry } = useResource(() => readCapture(id, session.token), `capture:${id}`);

  useEffect(() => {
    if (resource.state === "unauthorized") void expired();
  }, [resource.state, expired]);

  if (resource.state === "loading") return <Loading />;
  if (resource.state === "not-found") return <Unavailable />;
  if (resource.state !== "ready") return <Unavailable retry={retry} />;
  const { capture, image, zone, target } = resource.value;
  const rows: [string, string][] = [
    [t.collection.source, t.collection.sources[capture.mode]],
    [t.collection.captured, `${nightLabel(localDate(Date.parse(capture.capturedAt), zone), locale)} · ${clock(capture.capturedAt, zone)}`],
    [t.collection.exposure, seconds(capture.exposureMilliseconds)],
    [t.collection.gain, `${capture.gain}`],
    [t.collection.frames, `${capture.framesStacked}`],
    [t.collection.integration, `${capture.integrationSeconds} s`],
    ...(capture.widthPx && capture.heightPx ? [[t.collection.size, `${capture.widthPx} × ${capture.heightPx}`] as [string, string]] : []),
  ];

  return (
    <>
      <View style={{ gap: space[2] }}>
        {capture.mode === "SIMULATED" && <SimulatedBadge />}
        {target?.catalogId && <Label>{target.catalogId}</Label>}
        <Title>{target ? targetName(target, locale) : capture.imagingProfile}</Title>
      </View>
      {image && !failed ? (
        <Image source={{ uri: image.url }} style={styles.image} resizeMode="contain" onError={() => setFailed(true)} accessibilityLabel={target ? targetName(target, locale) : capture.imagingProfile} />
      ) : (
        <Body tone="tertiary">{t.collection.noPreview}</Body>
      )}
      {/* ADR-065: publishing is done on the website; a shared capture is handed on from here. */}
      {capture.visibility === "GALLERY" && capture.mode === "REAL" && (
        <View style={{ gap: space[2] }}>
          <Body tone="secondary">{t.collection.shared}</Body>
          <PrimaryButton
            label={t.collection.share}
            onPress={() => void Share.share({ url: `${webAppUrl}/${locale}/c/${capture.id}`, message: `${webAppUrl}/${locale}/c/${capture.id}` })}
          />
        </View>
      )}
      <View>
        {rows.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={[type.reading(locale), { color: palette.ink3, flex: 1 }]}>{label}</Text>
            <Text style={[type.reading(locale), { color: palette.ink }]}>{value}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  image: { width: "100%", aspectRatio: 1, borderRadius: radius.medium, backgroundColor: palette.bar },
  row: { flexDirection: "row", gap: space[3], paddingVertical: space[2], borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: line },
});
