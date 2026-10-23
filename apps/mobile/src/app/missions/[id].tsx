import type { Mission, NativeSession, Target } from "@darkview/contracts";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useLocale } from "@/i18n/locale";
import { frameNote, isLive, remaining, stepOf, stoppedStates } from "@/live/room";
import { useLive, type CommandOutcome } from "@/live/use-live";
import { platform } from "@/platform/api";
import { useResource } from "@/platform/use-resource";
import { useSession } from "@/platform/session";
import { clock, targetName } from "@/present";
import { line, palette, radius, space } from "@/theme";
import { Body, Card, Dot, Label, Loading, PrimaryButton, QuietButton, Screen, SimulatedBadge, Title, Unavailable } from "@/ui/kit";
import { type } from "@/ui/type";

export default function MissionRoom() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useSession();
  const { t } = useLocale();

  const back = <QuietButton label={t.back} onPress={() => (router.canGoBack() ? router.back() : router.replace("/account"))} />;
  if (state.status !== "signed-in") {
    return (
      <Screen>
        {back}
        {state.status === "loading" ? <Loading /> : <Body tone="secondary">{t.collection.signIn}</Body>}
      </Screen>
    );
  }
  return <Loaded id={id} session={state.session} back={back} />;
}

async function readRoom(id: string, token: string) {
  const [mission, catalogue, observatories] = await Promise.all([
    platform.mission(id, token),
    platform.catalogue(),
    platform.observatories(),
  ]);
  const target = catalogue.items.find((item) => item.id === mission.targetId) ?? null;
  const timezone = observatories.items.find((item) => item.id === mission.observatoryId)?.timezone ?? "UTC";
  return { mission, target, timezone };
}

function Loaded({ id, session, back }: { id: string; session: NativeSession; back: React.ReactNode }) {
  const { expired } = useSession();
  const { resource, retry } = useResource(() => readRoom(id, session.token), `room:${id}`);

  useEffect(() => {
    if (resource.state === "unauthorized") void expired();
  }, [resource.state, expired]);

  return (
    <Screen>
      {back}
      {resource.state === "loading" && <Loading />}
      {resource.state === "not-found" && <Unavailable />}
      {resource.state === "unavailable" && <Unavailable retry={retry} />}
      {resource.state === "ready" && (
        <RoomView
          mission={resource.value.mission}
          target={resource.value.target}
          timezone={resource.value.timezone}
          token={session.token}
        />
      )}
    </Screen>
  );
}

function useNow(every = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), every);
    return () => clearInterval(timer);
  }, [every]);
  return now;
}

function RoomView({ mission, target, timezone, token }: { mission: Mission; target: Target | null; timezone: string; token: string }) {
  const { t, locale } = useLocale();
  const live = useLive(mission, token);
  const now = useNow();
  const { room, start, session } = live;
  const name = target ? targetName(target, locale) : "—";
  const step = stepOf(room.state);
  const stopped = stoppedStates.includes(room.state);
  const left = session ? remaining(session.expiresAt, now) : null;
  const opensAt = mission.scheduledStartAt ? Date.parse(mission.scheduledStartAt) : null;
  const mayStart = opensAt === null || now >= opensAt;

  return (
    <>
      <View style={{ gap: space[2] }}>
        {mission.mode === "SIMULATED" ? <SimulatedBadge /> : null}
        <Label>{name}</Label>
        <Title>{t.room.states[room.state]}</Title>
        {left && <Text style={[type.reading(locale), { color: palette.ink }]}>{t.room.left(left)}</Text>}
        {session && !left && <Body tone="secondary">{t.room.timeUp}</Body>}
      </View>

      <Steps step={step} stopped={stopped} />

      <Feed live={live} />

      {room.state === "SCHEDULED" && start.status !== "open" && (
        <Card>
          {!mayStart && opensAt !== null && <Body tone="secondary">{t.room.startsAt(clock(new Date(opensAt).toISOString(), timezone))}</Body>}
          {start.status === "failed" && <Body tone="error">{t.room.startFailed}</Body>}
          {mayStart && (
            <PrimaryButton label={start.status === "starting" ? t.room.starting : t.room.start} onPress={live.open} />
          )}
        </Card>
      )}

      {room.channelError === "FORBIDDEN" && (
        <Card>
          <Body tone="secondary">{t.room.refusedChannel}</Body>
          <QuietButton label={t.room.reopen} onPress={live.open} />
        </Card>
      )}

      {session && left && isLive(room.state) && <Controls live={live} target={target} />}

      {room.capturesArrived > 0 && (
        <Card>
          <Body>{t.room.newCapture}</Body>
          <QuietButton label={t.room.toCollection} onPress={() => router.push("/collection")} />
        </Card>
      )}

      {(stopped || room.state === "COMPLETE" || room.state === "PROCESSING") && (
        <Body tone="secondary">{t.room.ended}</Body>
      )}
    </>
  );
}

function Steps({ step, stopped }: { step: number | null; stopped: boolean }) {
  const { t, locale } = useLocale();
  return (
    <View style={styles.steps} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: 5, now: (step ?? 0) + 1 }}>
      {t.room.steps.map((label, index) => {
        const current = index === step;
        const done = step !== null && index < step;
        return (
          <View key={label} style={styles.step}>
            <View
              style={[
                styles.stepBar,
                done && { backgroundColor: palette.ink2 },
                current && { backgroundColor: stopped ? palette.error : palette.red, boxShadow: `0 0 12px ${palette.red}` },
              ]}
            />
            <Text style={[type.label(locale), { color: current ? palette.ink : palette.ink3, fontSize: 13 }]} numberOfLines={1}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function Feed({ live }: { live: ReturnType<typeof useLive> }) {
  const { t, locale } = useLocale();
  const { room, frame, connected, session, start } = live;
  const status =
    room.link === "OFFLINE"
      ? t.room.offline
      : start.status === "starting"
        ? t.room.starting
        : session && !connected
          ? t.room.reconnecting
          : session && !room.stream
            ? t.room.connecting
            : session && !frame
              ? t.room.waitingForFrame
              : null;

  // An ended mission has no picture to wait for.
  if (!isLive(room.state) && start.status !== "starting") return null;
  return (
    <View style={styles.feed}>
      {frame ? (
        <Image source={{ uri: frame }} style={styles.frame} resizeMode="contain" accessibilityLabel={t.room.states[room.state]} />
      ) : (
        <View style={[styles.frame, styles.empty]}>
          <Text style={[type.reading(locale), { color: palette.ink3 }]}>{status}</Text>
        </View>
      )}
      {room.stream && (
        <View style={styles.badge}>
          {room.stream.mode === "SIMULATED" ? (
            <SimulatedBadge />
          ) : (
            <View style={styles.livePill}>
              <Dot tone="live" />
              <Text style={[type.label("en"), { color: palette.ink }]}>{t.room.live}</Text>
            </View>
          )}
        </View>
      )}
      {room.stream && room.frame && (
        <Text style={[type.label(locale), styles.frameNote]}>{frameNote(room.frame, t.room, locale)}</Text>
      )}
      {frame && status && <Text style={[type.reading(locale), styles.overlay]}>{status}</Text>}
    </View>
  );
}

function Controls({ live, target }: { live: ReturnType<typeof useLive>; target: Target | null }) {
  const { t } = useLocale();
  const [confirmStop, setConfirmStop] = useState(false);
  const { room, send, outcome } = live;
  const busy = outcome?.status === "sending" || outcome?.status === "waiting";
  const observing = room.state === "OBSERVING";
  const nudge = (axis: "ALTITUDE" | "AZIMUTH", direction: "POSITIVE" | "NEGATIVE") =>
    send({ type: "NUDGE", nudge: { kind: "NUDGE", axis, direction, stepArcminutes: 2 } });

  return (
    <View style={{ gap: space[3] }}>
      <Label>{t.room.controls}</Label>
      {observing ? (
        <>
          <View style={styles.pad}>
            <Pad label={t.room.up} onPress={() => nudge("ALTITUDE", "POSITIVE")} disabled={busy} />
            <View style={styles.padRow}>
              <Pad label={t.room.left_} onPress={() => nudge("AZIMUTH", "NEGATIVE")} disabled={busy} />
              <Pad label={t.room.recenter} onPress={() => send({ type: "RECENTER" })} disabled={busy} />
              <Pad label={t.room.right} onPress={() => nudge("AZIMUTH", "POSITIVE")} disabled={busy} />
            </View>
            <Pad label={t.room.down} onPress={() => nudge("ALTITUDE", "NEGATIVE")} disabled={busy} />
          </View>
          {target && (
            <PrimaryButton
              label={t.room.capture}
              onPress={() => !busy && send({ type: "CAPTURE", capture: { kind: "CAPTURE", imagingProfile: target.imagingProfile } })}
            />
          )}
        </>
      ) : (
        <Body tone="secondary">{room.state === "CAPTURING" ? t.room.capturingHint : t.room.centring}</Body>
      )}
      <Outcome outcome={outcome} />
      {confirmStop ? (
        <Card>
          <Body>{t.room.stopQuestion}</Body>
          <View style={styles.padRow}>
            <QuietButton label={t.room.stopKeep} onPress={() => setConfirmStop(false)} />
            <QuietButton
              label={t.room.stopConfirm}
              onPress={() => {
                setConfirmStop(false);
                void send({ type: "ABORT", reason: null });
              }}
            />
          </View>
        </Card>
      ) : (
        <QuietButton label={t.room.stop} onPress={() => setConfirmStop(true)} />
      )}
    </View>
  );
}

function Pad({ label, onPress, disabled }: { label: string; onPress: () => void; disabled: boolean }) {
  const { locale } = useLocale();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.padButton, (pressed || disabled) && { opacity: 0.6 }]}
    >
      <Text style={[type.body(locale, true), { color: palette.ink }]}>{label}</Text>
    </Pressable>
  );
}

function Outcome({ outcome }: { outcome: CommandOutcome | null }) {
  const { t } = useLocale();
  if (!outcome) return null;
  const text = {
    sending: t.room.sending,
    waiting: t.room.waiting,
    done: t.room.done,
    refused: t.room.refused,
    "no-answer": t.room.noAnswer,
    failed: t.room.failed,
  }[outcome.status];
  return (
    <View accessibilityLiveRegion="polite">
      <Body tone={outcome.status === "refused" || outcome.status === "failed" || outcome.status === "no-answer" ? "error" : "secondary"}>
        {text}
      </Body>
    </View>
  );
}

const styles = StyleSheet.create({
  steps: { flexDirection: "row", gap: space[2] },
  step: { flex: 1, gap: space[1] },
  stepBar: { height: 4, borderRadius: 2, backgroundColor: line },
  feed: { borderRadius: radius.medium, overflow: "hidden", backgroundColor: palette.bar, borderWidth: StyleSheet.hairlineWidth, borderColor: line },
  frame: { width: "100%", aspectRatio: 16 / 9 },
  empty: { alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: space[3], left: space[3] },
  livePill: { flexDirection: "row", alignItems: "center", gap: space[2], paddingHorizontal: space[3], paddingVertical: space[1], borderRadius: radius.pill, backgroundColor: `${palette.bar}cc` },
  overlay: { position: "absolute", bottom: space[2], left: space[3], color: palette.ink2 },
  frameNote: { position: "absolute", top: space[3], right: space[3], maxWidth: "55%", color: palette.ink2, textAlign: "right" },
  pad: { alignItems: "center", gap: space[2] },
  padRow: { flexDirection: "row", gap: space[2], alignItems: "center" },
  padButton: { minWidth: 96, minHeight: 48, alignItems: "center", justifyContent: "center", paddingHorizontal: space[3], borderRadius: radius.small, borderWidth: 1, borderColor: line, backgroundColor: palette.deep },
});
