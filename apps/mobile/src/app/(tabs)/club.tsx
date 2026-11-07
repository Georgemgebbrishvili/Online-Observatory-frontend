import type { LoyaltyAccount, LoyaltyScheme, NativeSession } from "@darkview/contracts";
import { router } from "expo-router";
import { useEffect } from "react";
import { Share, StyleSheet, Text, View } from "react-native";

import type { Locale } from "@/i18n/copy";
import { useLocale } from "@/i18n/locale";
import { platform } from "@/platform/api";
import { webAppUrl } from "@/platform/config";
import { clubProgress, points } from "@/platform/loyalty";
import { useResource } from "@/platform/use-resource";
import { useSession } from "@/platform/session";
import { localDate, nightLabel } from "@/present";
import { face, line, palette, radius, size, space } from "@/theme";
import { Header } from "@/ui/header";
import { Body, Card, Label, Loading, PrimaryButton, QuietButton, Screen, Title, Unavailable } from "@/ui/kit";
import { type } from "@/ui/type";

// Clients ADR-084 §6–7: the Loyalty Club, read-only. No purchase, redemption or "use
// points" control lives here; points are spent on the website.
export default function Club() {
  const { state } = useSession();
  const { t } = useLocale();
  return (
    <Screen>
      <Header />
      <Title>{t.club.title}</Title>
      {state.status === "loading" && <Loading />}
      {state.status === "signed-out" && <Public />}
      {state.status === "signed-in" && <Member session={state.session} />}
    </Screen>
  );
}

function tierName(tier: { nameEn: string; nameKa: string }, locale: Locale) {
  return locale === "ka" ? tier.nameKa : tier.nameEn;
}

/** Signed out: the public scheme, and a way to sign in. */
function Public() {
  const { t } = useLocale();
  const { resource, retry } = useResource(() => platform.loyaltyScheme(), "loyalty-scheme");
  return (
    <>
      <Body tone="secondary">{t.club.signIn}</Body>
      <PrimaryButton label={t.account.signInTitle} onPress={() => router.navigate("/account")} />
      {resource.state === "loading" && <Loading />}
      {resource.state !== "loading" && resource.state !== "ready" && <Unavailable retry={retry} />}
      {resource.state === "ready" && (
        <>
          <Ladder scheme={resource.value} current={null} />
          <Earn scheme={resource.value} />
        </>
      )}
    </>
  );
}

async function readClub(token: string) {
  const [scheme, account] = await Promise.all([platform.loyaltyScheme(), platform.loyalty(token)]);
  return { scheme, account };
}

function Member({ session }: { session: NativeSession }) {
  const { expired } = useSession();
  const { resource, retry } = useResource(() => readClub(session.token), `club:${session.token}`);

  useEffect(() => {
    if (resource.state === "unauthorized") void expired();
  }, [resource.state, expired]);

  if (resource.state === "loading") return <Loading />;
  if (resource.state !== "ready") return <Unavailable retry={retry} />;
  const { scheme, account } = resource.value;
  return (
    <>
      <MemberCard account={account} scheme={scheme} />
      <Referral code={account.referralCode} />
      <Ladder scheme={scheme} current={account.tier.code} />
      <Earn scheme={scheme} />
      <History account={account} />
    </>
  );
}

function MemberCard({ account, scheme }: { account: LoyaltyAccount; scheme: LoyaltyScheme }) {
  const { t, locale } = useLocale();
  const progress = clubProgress(account, scheme);
  return (
    <View style={styles.card} accessibilityRole="summary">
      <Text style={[type.label(locale), styles.onPaper2]}>{t.club.member}</Text>
      <Text style={[type.title(locale), styles.onPaper]}>{tierName(account.tier, locale)}</Text>
      <Text style={[type.reading(locale), styles.onPaper2]}>{t.club.off(account.tier.discountPercent)}</Text>
      <View style={styles.balance}>
        <Text style={[styles.figure, styles.onPaper]}>{points(account.balance)}</Text>
        <Text style={[type.body(locale), styles.onPaper2]}>{t.club.balance}</Text>
      </View>
      {progress.top ? (
        <Text style={[type.body(locale), styles.onPaper2]}>{t.club.top}</Text>
      ) : (
        <View style={{ gap: space[2] }}>
          <View
            style={styles.bar}
            accessibilityRole="progressbar"
            accessibilityLabel={t.club.progress(tierName(progress.next, locale))}
            accessibilityValue={{ min: 0, max: progress.next.thresholdPoints, now: Math.max(account.tierPoints, 0) }}
          >
            <View style={[styles.fill, { width: `${progress.fraction * 100}%` }]} />
            {progress.markers.map((marker) => (
              <View
                key={marker.at}
                style={[styles.marker, { left: `${marker.at * 100}%` }, marker.reached && { backgroundColor: palette.gdMid }]}
              />
            ))}
          </View>
          <Text style={[type.reading(locale), styles.onPaper2]}>
            {`${t.club.tierPoints(points(Math.max(account.tierPoints, 0)))} · ${t.club.toNext(points(progress.remaining), tierName(progress.next, locale))}`}
          </Text>
        </View>
      )}
    </View>
  );
}

function Referral({ code }: { code: string }) {
  const { t, locale } = useLocale();
  const link = `${webAppUrl}/${locale}/register?ref=${encodeURIComponent(code)}`;
  return (
    <Card>
      <Label>{t.club.invite}</Label>
      <View style={styles.row}>
        <Text style={[type.reading(locale), { color: palette.ink2 }]}>{t.club.code}</Text>
        <Text selectable style={[type.body(locale, true), styles.code]}>
          {code}
        </Text>
      </View>
      <QuietButton label={t.club.share} onPress={() => void Share.share({ message: t.club.shareText(link) })} />
    </Card>
  );
}

function Ladder({ scheme, current }: { scheme: LoyaltyScheme; current: string | null }) {
  const { t, locale } = useLocale();
  const tiers = [...scheme.tiers].sort((a, b) => a.thresholdPoints - b.thresholdPoints);
  return (
    <View style={{ gap: space[2] }}>
      <Label>{t.club.tiers}</Label>
      {tiers.map((tier) => {
        const mine = tier.code === current;
        return (
          <View key={tier.code} style={[styles.tier, mine && styles.tierMine]}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={type.body(locale, true)}>{tierName(tier, locale)}</Text>
              <Text style={[type.reading(locale), { color: palette.ink2 }]}>
                {tier.thresholdPoints === 0 ? t.club.start : t.club.from(points(tier.thresholdPoints))}
              </Text>
              {mine && <Text style={[type.reading(locale), { color: palette.redInk }]}>{t.club.yours}</Text>}
            </View>
            <Text style={type.body(locale, true)}>{t.club.tierOff(tier.discountPercent)}</Text>
          </View>
        );
      })}
    </View>
  );
}

function Earn({ scheme }: { scheme: LoyaltyScheme }) {
  const { t } = useLocale();
  const ways = [
    t.club.rate(scheme.pointsPerGel),
    ...(scheme.welcomeBonusPoints > 0 ? [t.club.welcome(scheme.welcomeBonusPoints)] : []),
    ...(scheme.referralBonusPoints > 0 ? [t.club.referral(scheme.referralBonusPoints)] : []),
    t.club.spend,
  ];
  return (
    <Card>
      <Label>{t.club.earn}</Label>
      {ways.map((way) => (
        <Body key={way} tone="secondary">
          {way}
        </Body>
      ))}
      <Body>{t.club.rules}</Body>
    </Card>
  );
}

function History({ account }: { account: LoyaltyAccount }) {
  const { t, locale } = useLocale();
  return (
    <View style={{ gap: space[1] }}>
      <Label>{t.club.history}</Label>
      {account.recentEntries.length === 0 && <Body tone="secondary">{t.club.empty}</Body>}
      {account.recentEntries.map((entry) => (
        <View key={entry.id} style={styles.entry}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={type.body(locale)}>{t.club.kinds[entry.kind]}</Text>
            <Text style={[type.reading(locale), { color: palette.ink2 }]}>
              {nightLabel(localDate(Date.parse(entry.createdAt), "Asia/Tbilisi"), locale)}
              {entry.kind === "ADMIN_ADJUSTMENT" && entry.reason ? ` · ${entry.reason}` : ""}
            </Text>
          </View>
          <Text style={[type.body(locale, true), { color: entry.points < 0 ? palette.ink2 : palette.green }]}>
            {t.club.points(points(entry.points, true))}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: space[2],
    padding: space[5],
    borderRadius: radius.medium,
    backgroundColor: palette.paper,
  },
  onPaper: { color: palette.paperInk },
  onPaper2: { color: palette.paperMuted },
  figure: { fontFamily: face.display, fontSize: size.display, lineHeight: size.display * 1.1 },
  balance: { flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", gap: space[2] },
  bar: { height: 12, borderRadius: 6, backgroundColor: "rgba(43, 27, 18, 0.14)", justifyContent: "center" },
  fill: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 6, backgroundColor: palette.sun4 },
  marker: { position: "absolute", width: 4, top: -4, bottom: -4, marginLeft: -2, borderRadius: 2, backgroundColor: palette.paperMuted },
  row: { flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", gap: space[3] },
  code: { color: palette.ink, letterSpacing: 1 },
  tier: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    padding: space[3],
    borderRadius: radius.small,
    borderWidth: 1,
    borderColor: line,
  },
  tierMine: { borderColor: palette.red, backgroundColor: "rgba(227, 72, 44, 0.12)" },
  entry: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    minHeight: 56,
    paddingVertical: space[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: line,
  },
});
