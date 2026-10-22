"use client";

import type { CardDraw as Draw, CardDrawCard, CardPrize } from "@darkview/contracts";
import { zPickCardResponse } from "@darkview/contracts/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { SkychaserCard, type CardFaceProps } from "@/components/cards/skychaser-card";
import { longDate, weekdayTime } from "@/features/cards/dates";
import type { Locale } from "@/i18n/config";
import { cardsCopy } from "@/i18n/resources/cards";
import {
  ApiRequestError,
  apiRequest,
  navigateWithFreshSession,
} from "@/lib/platform/browser";

export type CardTargetNames = Record<string, { name: string; kind: string }>;

type CardDrawProps = {
  locale: Locale;
  draw: Draw;
  /** Catalogue names and kinds, by slug, in the page's language. */
  targets: CardTargetNames;
  timezone: string;
  signInPath: string;
  /** The server's clock at render: whether the deal is still open is judged against it. */
  now: string;
};

/** How long the picked card shows alone before the other two turn. */
const othersAfterMs = 900;

/**
 * The week's three cards (ADR-058 §2). The platform decided them when it dealt them;
 * this only asks it to turn one (`POST /card-draws/{id}/pick`) and shows the answer:
 * the picked card first, then the other two.
 */
export function CardDraw({ draw: initial, locale, now, signInPath, targets, timezone }: CardDrawProps) {
  const copy = cardsCopy[locale];
  const router = useRouter();
  const [draw, setDraw] = useState(initial);
  const [pending, setPending] = useState<number | null>(null);
  const [othersShown, setOthersShown] = useState(initial.picked !== null);
  const [note, setNote] = useState("");
  // One key per deal, so a retried pick answers the first one's result.
  const key = useRef(`pick-${initial.id}`);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => clearTimeout(timer.current ?? undefined), []);

  const open = draw.picked === null && Date.parse(now) < Date.parse(draw.opensNextAt);

  async function turn(position: number) {
    if (!open || pending !== null) return;
    setPending(position);
    setNote("");
    try {
      const answer = await apiRequest(`/card-draws/${encodeURIComponent(draw.id)}/pick`, {
        method: "POST",
        headers: { "Idempotency-Key": key.current },
        body: { position },
        schema: zPickCardResponse,
      });
      setDraw(answer);
      timer.current = setTimeout(() => {
        setOthersShown(true);
        // The prize list below is the server's; read it again now the prize exists.
        router.refresh();
      }, othersAfterMs);
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        navigateWithFreshSession(signInPath);
        return;
      }
      const code = error instanceof ApiRequestError ? error.error?.code : undefined;
      setNote(
        code === "CARD_DRAW_CLOSED"
          ? copy.refused.closed
          : code === "CARD_ALREADY_PICKED"
            ? copy.refused.picked
            : copy.refused.failed,
      );
      if (code === "CARD_ALREADY_PICKED") router.refresh();
    } finally {
      setPending(null);
    }
  }

  const faceOf = (card: CardDrawCard): CardFaceProps | null => {
    if (!card.turned || !card.rarity) return null;
    if (draw.picked !== card.position && !othersShown) return null;
    const target = card.targetSlug ? targets[card.targetSlug] : undefined;
    const prize = card.prize ?? null;
    const kindOfRarity = draw.odds.cards.find((entry) => entry.rarity === card.rarity)?.prizeKind ?? null;
    return {
      rarity: card.rarity,
      rarityLabel: copy.rarity[card.rarity],
      slug: target ? card.targetSlug : null,
      name: target?.name ?? copy.rarity[card.rarity],
      kind: target?.kind ?? "",
      prize: copy.prize(prize?.kind ?? kindOfRarity, {
        durationMinutes: prize?.durationMinutes ?? draw.odds.freeSlotDurationMinutes,
        percentOff: prize?.percentOff ?? draw.odds.discountPercentOff,
      }),
      position: card.position,
    };
  };

  const pickedCard = draw.picked === null ? null : draw.cards[draw.picked];
  const when = weekdayTime(new Date(draw.opensNextAt), locale, timezone);

  return (
    <div className="cards-draw">
      {open && <p className="cards-choose">{copy.choose}</p>}
      <ol className="cards-row" aria-label={copy.title} data-picked={draw.picked !== null || undefined}>
        {draw.cards.map((card) => {
          const face = faceOf(card);
          return (
            <li key={card.position} data-picked={draw.picked === card.position || undefined}>
              <SkychaserCard
                face={face}
                picked={draw.picked === card.position}
                onTurn={open ? () => turn(card.position) : undefined}
                turnLabel={copy.turn(card.position)}
                busy={pending === card.position}
                disabled={pending !== null}
                caption={face ? copy.illustration : pending === card.position ? copy.turning : undefined}
              />
            </li>
          );
        })}
      </ol>

      <p className="cards-note" role="status" aria-live="polite">
        {note}
      </p>

      {pickedCard?.rarity && (
        <section className="cards-result" aria-labelledby="cards-result-title">
          <h2 id="cards-result-title">
            {pickedCard.prize
              ? copy.result.won(
                  copy.rarity[pickedCard.rarity],
                  copy.prize(pickedCard.prize.kind, pickedCard.prize),
                )
              : copy.result.nothing}
          </h2>
          {pickedCard.prize && <PrizeCode locale={locale} prize={pickedCard.prize} />}
          <p className="cards-next">{copy.result.next(when)}</p>
        </section>
      )}
    </div>
  );
}

/** A prize's code, how long it lasts and where it is spent. */
export function PrizeCode({ locale, prize }: { locale: Locale; prize: CardPrize }) {
  const copy = cardsCopy[locale].prizes;
  const [copied, setCopied] = useState(false);
  const until = longDate(new Date(prize.expiresAt), locale);

  return (
    <div className="cards-code">
      {prize.voucherCode && (
        <p className="cards-code-row">
          <span className="cards-code-label">{copy.code}</span>
          <code>{prize.voucherCode}</code>
          <button
            type="button"
            className="button button-secondary button-small"
            onClick={() => {
              void navigator.clipboard?.writeText(prize.voucherCode ?? "").then(() => setCopied(true));
            }}
          >
            {copied ? copy.copied : copy.copy}
          </button>
        </p>
      )}
      {prize.status === "ACTIVE" && <p className="cards-code-meta">{copy.expires(until)}</p>}
      {prize.status === "ACTIVE" &&
        (prize.kind === "OBSERVER_SEAT" ? (
          <p className="cards-code-meta">{copy.seat}</p>
        ) : (
          <Link className="button button-primary" href={`/${locale}/app/book`}>
            {copy.book}
          </Link>
        ))}
    </div>
  );
}
