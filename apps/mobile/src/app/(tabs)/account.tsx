import type { Booking, NativeSession, Target } from "@darkview/contracts";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useLocale } from "@/i18n/locale";
import { platform } from "@/platform/api";
import { webAppUrl } from "@/platform/config";
import { useResource } from "@/platform/use-resource";
import { useSession, type SignInFailure } from "@/platform/session";
import { clock, localDate, nightLabel, targetName } from "@/present";
import { line, palette, radius, space } from "@/theme";
import { Header } from "@/ui/header";
import { Body, Card, Dot, Label, Loading, PrimaryButton, QuietButton, Screen, Title, Unavailable } from "@/ui/kit";
import { type } from "@/ui/type";

export default function Account() {
  const { state } = useSession();
  return (
    <Screen>
      <Header />
      {state.status === "loading" && <Loading />}
      {state.status === "signed-out" && <SignIn />}
      {state.status === "signed-in" && <Nights session={state.session} />}
    </Screen>
  );
}

function SignIn() {
  const { t, locale } = useLocale();
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<SignInFailure | null>(null);

  const submit = async () => {
    if (busy || !email || !password) return;
    setBusy(true);
    setFailure(await signIn(email.trim(), password));
    setBusy(false);
  };

  return (
    <View style={{ gap: space[4] }}>
      <View style={{ gap: space[2] }}>
        <Title>{t.account.signInTitle}</Title>
        <Body tone="secondary">{t.account.lede}</Body>
      </View>
      <Field label={t.account.email}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="username"
          accessibilityLabel={t.account.email}
          style={[type.body(locale), styles.input]}
        />
      </Field>
      <Field label={t.account.password}>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          accessibilityLabel={t.account.password}
          onSubmitEditing={submit}
          style={[type.body(locale), styles.input]}
        />
      </Field>
      {failure && (
        <View accessibilityLiveRegion="polite">
          <Body tone="error">{t.account.failure[failure]}</Body>
        </View>
      )}
      <PrimaryButton label={busy ? t.account.submitting : t.account.submit} busy={busy} onPress={submit} />
      <Card>
        <Body tone="secondary">{t.account.noAccount}</Body>
        <QuietButton
          label={t.account.createAccount}
          onPress={() => WebBrowser.openBrowserAsync(`${webAppUrl}/${locale}/register`)}
        />
      </Card>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: space[2] }}>
      <Label tone="muted">{label}</Label>
      {children}
    </View>
  );
}

// The catalogue names a booking's target; it is public, so it is read without the token.
async function readNights(session: NativeSession) {
  const [bookings, catalogue, observatories] = await Promise.all([
    platform.bookings(session.token),
    platform.catalogue(),
    platform.observatories(),
  ]);
  const targets = new Map<string, Target>(catalogue.items.map((target) => [target.id, target]));
  const zones = new Map(observatories.items.map((item) => [item.id, item.timezone]));
  return { bookings: bookings.items, targets, zones };
}

function Nights({ session }: { session: NativeSession }) {
  const { t } = useLocale();
  const { signOut, expired } = useSession();
  const { resource, retry } = useResource(() => readNights(session), `nights:${session.token}`);

  // The platform no longer honours the token (signed out elsewhere, a password change):
  // forget it, and the tab shows the sign-in form.
  useEffect(() => {
    if (resource.state === "unauthorized") void expired();
  }, [resource.state, expired]);

  return (
    <>
      <View style={{ gap: space[2] }}>
        <Label>{t.account.signedInAs(session.user.displayName ?? session.user.email)}</Label>
        <Title>{t.account.nights}</Title>
      </View>
      {resource.state === "loading" && <Loading />}
      {(resource.state === "unavailable" || resource.state === "not-found") && (
        <Unavailable retry={retry} />
      )}
      {resource.state === "ready" && resource.value.bookings.length === 0 && (
        <Body tone="secondary">{t.account.noNights}</Body>
      )}
      {resource.state === "ready" &&
        resource.value.bookings.map((booking) => (
          <Night
            key={booking.id}
            booking={booking}
            target={resource.value.targets.get(booking.targetId)}
            timezone={resource.value.zones.get(booking.observatoryId) ?? "Asia/Tbilisi"}
          />
        ))}
      <QuietButton label={t.account.signOut} onPress={signOut} />
      <Text style={[type.reading(), { color: palette.ink3 }]}>{session.user.email}</Text>
    </>
  );

}

function Night({ booking, target, timezone }: { booking: Booking; target?: Target; timezone: string }) {
  const { t, locale } = useLocale();
  const end = new Date(Date.parse(booking.slotStartAt) + booking.durationMinutes * 60_000).toISOString();
  const confirmed = booking.status === "CONFIRMED";
  const row = (
    <View style={styles.night}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={type.body(locale, true)}>{target ? targetName(target, locale) : "—"}</Text>
        <Text style={type.reading(locale)}>
          {`${nightLabel(localDate(Date.parse(booking.slotStartAt), timezone), locale)} · ${clock(booking.slotStartAt, timezone)}–${clock(end, timezone)}`}
        </Text>
      </View>
      <View style={styles.status}>
        <Dot tone={confirmed ? "live" : booking.status === "PENDING_PAYMENT" ? "warn" : "off"} />
        <Text style={[type.reading(locale), { color: confirmed ? palette.ink : palette.ink2 }]}>
          {t.account.status[booking.status]}
        </Text>
      </View>
    </View>
  );
  // A confirmed night with a mission opens its live room, as the website's booking does.
  if (!confirmed || !booking.missionId) return row;
  return (
    <Link href={`/missions/${booking.missionId}`} asChild>
      <Pressable accessibilityRole="link" accessibilityHint={t.room.open}>
        {row}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 48,
    paddingHorizontal: space[4],
    borderRadius: radius.small,
    borderWidth: 1,
    borderColor: line,
    backgroundColor: palette.deep,
    color: palette.ink,
  },
  night: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    minHeight: 64,
    paddingVertical: space[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: line,
  },
  status: { flexDirection: "row", alignItems: "center", gap: space[2] },
});
