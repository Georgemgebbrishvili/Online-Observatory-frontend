"use client";

import type {
  BookableObservatory,
  Booking,
  CardPrize,
  Slot,
  SlotTarget,
  Target,
} from "@darkview/contracts";
import {
  zCreateBookingResponse,
  zJoinWaitlistResponse,
  zListMyWaitlistEntriesResponse,
  zListSlotTargetsResponse,
  zRescheduleBookingResponse,
} from "@darkview/contracts/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { SkyMonth, useSkyCalendar } from "@/components/booking/night-calendar";
import { NightTimeline } from "@/components/booking/night-timeline";
import { TargetArt, targetAccent } from "@/components/booking/target-art";
import { Dropdown } from "@/components/ui/dropdown";
import { longDate } from "@/features/cards/dates";
import { checkoutTarget } from "@/features/booking/checkout";
import { readRefusal } from "@/features/booking/refusal";
import { nightSky } from "@/features/booking/night-sky";
import { targetDescription, targetName } from "@/features/targets/present";
import type { Locale } from "@/i18n/config";
import { boardCopy, type BoardCopy } from "@/i18n/resources/board";
import { cardsCopy } from "@/i18n/resources/cards";
import { giftCopy } from "@/i18n/resources/gift";
import { bookingCopy } from "@/i18n/resources/booking";
import { rescheduleCopy } from "@/i18n/resources/reschedule";
import { reserveCopy } from "@/i18n/resources/reserve";
import { targetCopy } from "@/i18n/resources/targets";
import {
  ApiRequestError,
  apiRequest,
  navigateWithFreshSession,
} from "@/lib/platform/browser";

import type { BoardNight, BoardSlot } from "@/features/booking/board";

type BookingBoardProps = {
  locale: Locale;
  observatory: BookableObservatory;
  nights: BoardNight[];
  targets: Target[];
  /** A booking whose lost slot is being replaced: its length, for free (ADR-043). */
  reschedule: Booking | null;
  /** A slot named in the address (the old reserve page's way in): chosen on arrival. */
  initialStartAt: string | null;
  signInPath: string;
  /** ADR-058: the account's unspent free-slot and discount prizes for this observatory. */
  prizes?: CardPrize[];
};

type Phase = "idle" | "reserving" | "redirecting";

function intlLocale(locale: Locale) {
  return locale === "ka" ? "ka-GE" : "en-GB";
}

/** ADR-068: a forecast clear enough to call a start "clear". */
const CLEAR_CLOUD_PERCENT = 30;

function forecastText(slot: Slot, words: BoardCopy["forecast"]) {
  const { status, cloudCoverPercent } = slot.forecast;
  return status === "KNOWN" && cloudCoverPercent !== null
    ? words.cloud(Math.round(cloudCoverPercent))
    : words.unknown;
}

/** Whether a target can be booked for a slot, by the two rules `createBooking` applies. */
function bookable({ target, visibility }: SlotTarget, durationMinutes: number) {
  return visibility.observable && target.expectedMissionMinutes <= durationMinutes;
}

function Step({ title, aside }: { title: string; aside?: ReactNode }) {
  return (
    <header className="board-step">
      <h2>{title}</h2>
      <span className="board-rule" aria-hidden="true" />
      {aside && <span className="board-aside">{aside}</span>}
    </header>
  );
}

/**
 * The booking board (ADR-053 §7), as one screen: a night, a start, a target, and the
 * session beside them — what it costs and one button. The nights and their slots are the
 * platform's, read on the server; what is up for a chosen slot is read here, from
 * `GET /targets/visibility`; reserving is `POST /bookings` with an idempotency key and
 * the checkout redirect (ADR-043), or the free replacement of a lost slot.
 */
export function BookingBoard({
  initialStartAt,
  locale,
  nights,
  observatory,
  prizes = [],
  reschedule,
  signInPath,
  targets,
}: BookingBoardProps) {
  const copy = boardCopy[locale];
  const booking = bookingCopy[locale];
  const reserve = reserveCopy[locale];
  const replacing = rescheduleCopy[locale];
  const words = targetCopy[locale];
  const cards = cardsCopy[locale];
  const gifts = giftCopy[locale].board;
  const timezone = observatory.timezone;

  const time = useMemo(
    () =>
      new Intl.DateTimeFormat(intlLocale(locale), {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone: timezone,
      }),
    [locale, timezone],
  );
  const firstSlot = nights.flatMap((n) => n.slots)[0];
  // The zone's short name at the first slot: the observatory's, not the reader's.
  const zone = firstSlot
    ? new Intl.DateTimeFormat("en-GB", { timeZone: timezone, timeZoneName: "short" })
        .formatToParts(new Date(firstSlot.startAt))
        .find((part) => part.type === "timeZoneName")?.value
    : undefined;

  const router = useRouter();
  // Slots refused as taken on this visit, struck out until the night is read again.
  const [gone, setGone] = useState<ReadonlySet<string>>(() => new Set());

  // ADR-068: starts freed and held for this customer by their waitlist, read in the browser.
  const [held, setHeld] = useState<ReadonlyMap<string, string>>(() => new Map());
  useEffect(() => {
    apiRequest("/waitlist", { schema: zListMyWaitlistEntriesResponse })
      .then(({ items }) =>
        setHeld(
          new Map(
            items
              .filter((item) => item.status === "OFFERED" && item.offerExpiresAt)
              .map((item) => [item.slotStartAt, item.offerExpiresAt!]),
          ),
        ),
      )
      .catch(() => {});
  }, []);

  // A replacement is for the lost slot's length (rescheduleBooking); otherwise any open slot.
  const offered = (slot: Slot) =>
    (slot.available ||
      (slot.unavailableReason === "HELD_FOR_WAITLIST" && held.has(slot.startAt))) &&
    !gone.has(slot.startAt) &&
    (!reschedule || slot.durationMinutes === reschedule.durationMinutes);
  // ADR-068: a start somebody else holds can be waited for, never on a replacement.
  const waitable = (slot: Slot) =>
    !reschedule &&
    !offered(slot) &&
    (slot.unavailableReason === "ALREADY_BOOKED" ||
      slot.unavailableReason === "HELD_FOR_WAITLIST" ||
      gone.has(slot.startAt));
  const openCount = (night: BoardNight) => night.slots.filter(offered).length;
  const nightOf = (startAt: string | null) =>
    nights.find((night) => night.slots.some((slot) => slot.startAt === startAt))?.date ?? null;

  // ADR-068: a replacement for a weather loss opens on the next clear start.
  const [nextClear] = useState<string | null>(() =>
    reschedule && !initialStartAt
      ? (nights
          .flatMap((n) => n.slots)
          .find(
            (s) =>
              offered(s) &&
              s.forecast.status === "KNOWN" &&
              s.forecast.cloudCoverPercent !== null &&
              s.forecast.cloudCoverPercent <= CLEAR_CLOUD_PERCENT,
          )?.startAt ?? null)
      : null,
  );
  const [night, setNight] = useState(
    () =>
      nightOf(initialStartAt) ??
      nightOf(nextClear) ??
      nights.find((candidate) => openCount(candidate) > 0)?.date ??
      nights[0]?.date ??
      "",
  );
  const [slotAt, setSlotAt] = useState<string | null>(() => {
    const slot = nights
      .flatMap((n) => n.slots)
      .find((s) => s.startAt === (initialStartAt ?? nextClear));
    return slot && offered(slot) ? slot.startAt : null;
  });
  const [notice, setNotice] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(reschedule?.targetId ?? null);
  const [skies, setSkies] = useState<Record<string, SlotTarget[]>>({});
  const reading = useRef(new Set<string>());
  const [phase, setPhase] = useState<Phase>("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [key] = useState(() => crypto.randomUUID());

  const current = nights.find((candidate) => candidate.date === night) ?? nights[0];
  const slots = current?.slots ?? [];
  // The night's light, on the observatory's clock and from its site.
  const darkness = current ? nightSky(current.date, timezone) : null;
  const chosen = slots.find((slot) => slot.startAt === slotAt && offered(slot)) ?? null;
  const waiting = slots.find((slot) => slot.startAt === slotAt && waitable(slot)) ?? null;

  // What is up for a slot, read once per slot: when it is picked, and for the slot the
  // address named, on arrival.
  const readSky = useCallback(
    (slot: Slot) => {
      const { startAt } = slot;
      if (reading.current.has(startAt)) return;
      reading.current.add(startAt);
      apiRequest(
        `/targets/visibility?observatoryId=${encodeURIComponent(observatory.id)}&startAt=${encodeURIComponent(startAt)}&durationMinutes=${slot.durationMinutes}`,
        { schema: zListSlotTargetsResponse },
      )
        .then((list) => setSkies((all) => ({ ...all, [startAt]: list.items })))
        .catch(() => setSkies((all) => ({ ...all, [startAt]: [] })));
    },
    [observatory.id],
  );
  useEffect(() => {
    if (chosen) readSky(chosen);
    // Once, for the slot chosen on arrival; a pick reads its own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const judged = chosen ? (skies[chosen.startAt] ?? null) : null;
  const loading = !!chosen && judged === null;
  const judgement = (target: Target) =>
    judged?.find((item) => item.target.id === target.id) ?? null;
  const canBook = (target: Target) => {
    const item = judgement(target);
    return !!chosen && !!item && bookable(item, chosen.durationMinutes);
  };
  const target = targets.find((candidate) => candidate.id === targetId) ?? null;
  // The object is optional: without one, the platform assigns the best one up.
  const ready = !!chosen && (!target || canBook(target));

  // ADR-058: a prize the chosen slot can take. A free slot pays only for its own length.
  const [prizeId, setPrizeId] = useState("");
  const usable = reschedule
    ? []
    : prizes.filter(
        (prize) =>
          prize.voucherCode &&
          (prize.kind === "DISCOUNT" ||
            (prize.kind === "FREE_SLOT" && (!chosen || chosen.durationMinutes === prize.durationMinutes))),
      );
  // ADR-067: a gift code typed in takes the place of any prize; a booking takes one.
  const [giftCode, setGiftCode] = useState("");
  const gift = reschedule ? "" : giftCode.trim();
  const prize = gift ? null : (usable.find((candidate) => candidate.id === prizeId) ?? null);

  const pickNight = (date: string) => {
    setNight(date);
    setSlotAt(null);
    setFeedback(null);
  };
  const pickSlot = (slot: Slot) => {
    setSlotAt(slot.startAt);
    setFeedback(null);
    setNotice(null);
    if (offered(slot)) readSky(slot);
  };

  async function joinWaitlist() {
    if (!waiting || phase !== "idle") return;
    setPhase("reserving");
    setFeedback(null);
    try {
      const entry = await apiRequest("/waitlist", {
        method: "POST",
        body: {
          observatoryId: observatory.id,
          slotStartAt: waiting.startAt,
          durationMinutes: waiting.durationMinutes,
        },
        schema: zJoinWaitlistResponse,
      });
      setNotice(copy.waitlist.joined(entry.position ?? 1));
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        navigateWithFreshSession(signInPath);
        return;
      }
      setFeedback(
        error instanceof ApiRequestError && (error.status === 409 || error.status === 422)
          ? copy.waitlist.refused
          : reserve.form.failed,
      );
    } finally {
      setPhase("idle");
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (waiting) return void joinWaitlist();
    if (!chosen || !ready || phase !== "idle") return;
    setPhase("reserving");
    setFeedback(null);
    try {
      if (reschedule) {
        const booked = await apiRequest(
          `/bookings/${encodeURIComponent(reschedule.id)}/reschedule`,
          {
            method: "POST",
            body: { slotStartAt: chosen.startAt, targetId: target?.id ?? reschedule.targetId },
            schema: zRescheduleBookingResponse,
          },
        );
        setPhase("redirecting");
        navigateWithFreshSession(`/${locale}/app/bookings/${booked.id}`);
        return;
      }
      const { booking: made, paymentIntent } = await apiRequest("/bookings", {
        method: "POST",
        headers: { "Idempotency-Key": key },
        body: {
          observatoryId: observatory.id,
          ...(target ? { targetId: target.id } : {}),
          slotStartAt: chosen.startAt,
          durationMinutes: chosen.durationMinutes,
          locale,
          ...(gift
            ? { voucherCode: gift }
            : prize?.voucherCode
              ? { voucherCode: prize.voucherCode }
              : {}),
        },
        schema: zCreateBookingResponse,
      });
      const bookingPage = `/${locale}/app/bookings/${made.id}`;
      const checkout = paymentIntent?.redirectUrl
        ? checkoutTarget(paymentIntent.redirectUrl, window.location.origin)
        : null;
      setPhase("redirecting");
      // A full navigation: the checkout is not a page of this app, and it sets cookies of
      // its own on the way back.
      navigateWithFreshSession(checkout ?? bookingPage);
    } catch (error) {
      setPhase("idle");
      if (error instanceof ApiRequestError && error.status === 401) {
        navigateWithFreshSession(signInPath);
        return;
      }
      const code = error instanceof ApiRequestError ? error.error?.code : undefined;
      if (reschedule && code === "CONFLICT") {
        setPhase("redirecting");
        navigateWithFreshSession(`/${locale}/app/bookings/${reschedule.id}`);
        return;
      }
      const refusal = readRefusal(error, reserve.form, words.reasons);
      setFeedback(
        gift && code === "VALIDATION_FAILED"
          ? gifts.refused
          : prize && code === "VALIDATION_FAILED"
          ? cards.board.refused
          : !target && code === "VALIDATION_FAILED"
            ? copy.noTargets
            : refusal.message,
      );
      if (refusal.slotGone) {
        setGone((all) => new Set(all).add(chosen.startAt));
        setSlotAt(null);
        router.refresh();
      }
      if (refusal.skyChanged) {
        setTargetId(null);
        reading.current.delete(chosen.startAt);
        setSkies((all) => {
          const rest = { ...all };
          delete rest[chosen.startAt];
          return rest;
        });
        readSky(chosen);
      }
    }
  }

  const sky = useSkyCalendar({
    locale,
    timezone,
    nights: nights.map((candidate) => ({ date: candidate.date, open: openCount(candidate) })),
    selected: night,
    onPick: pickNight,
    openLabel: copy.open,
    fullLabel: copy.full,
  });

  const price = (slot: BoardSlot) =>
    reschedule
      ? replacing.free
      : gift
        ? gifts.paid
        : prize?.kind === "FREE_SLOT"
          ? cards.board.free
          : slot.price;
  const endOf = (slot: Slot) => new Date(Date.parse(slot.startAt) + slot.durationMinutes * 60_000);
  const buttonLabel = waiting
    ? phase === "reserving"
      ? copy.waitlist.joining
      : copy.waitlist.join
    : phase === "reserving"
      ? reschedule
        ? replacing.form.booking
        : reserve.form.reserving
      : phase === "redirecting"
        ? reschedule
          ? replacing.form.booking
          : reserve.form.redirecting
        : reschedule
          ? replacing.form.book
          : reserve.form.reserve;

  return (
    <form className="board" onSubmit={submit} aria-busy={phase !== "idle" || undefined}>
      <header className="board-head">
        <h1 className="visually-hidden">{booking.title}</h1>
        <p className="board-lede">{reschedule ? replacing.replacing : copy.lede}</p>
      </header>

      <div className="board-grid">
        <div className="board-cal">
          <Step title={copy.night} />
          <SkyMonth groupLabel={booking.nights} sky={sky} />
        </div>

        <div className="board-pick">
          <Step
            title={copy.start}
            aside={zone ? `${copy.siteTime} · ${zone}` : copy.siteTime}
          />
          {current && darkness && slots.length > 0 && (
            <NightTimeline
              sky={darkness}
              copy={copy.timeline}
              clock={(at) => time.format(new Date(at))}
              slots={slots.map((slot) => ({
                startAt: slot.startAt,
                durationMinutes: slot.durationMinutes,
                state:
                  chosen?.startAt === slot.startAt ? "chosen" : offered(slot) ? "open" : "taken",
              }))}
            />
          )}
          {current && (
            <div
              className="board-slots"
              role="radiogroup"
              aria-label={`${booking.slots}, ${current.label.long}`}
            >
              {slots.map((slot) => {
                const ok = offered(slot);
                const reason =
                  ok || !slot.unavailableReason ? null : booking.reasons[slot.unavailableReason];
                const cloud = forecastText(slot, copy.forecast);
                const start = time.format(new Date(slot.startAt));
                return (
                  <button
                    key={slot.startAt}
                    type="button"
                    role="radio"
                    aria-checked={(chosen ?? waiting)?.startAt === slot.startAt}
                    className={`board-slot${
                      waitable(slot)
                        ? " is-taken"
                        : slot.unavailableReason === "IN_THE_PAST"
                          ? " is-past"
                          : !ok
                            ? " is-short"
                            : ""
                    }`}
                    disabled={!ok && !waitable(slot)}
                    onClick={() => pickSlot(slot)}
                    title={reason ?? undefined}
                    aria-label={`${start}–${time.format(endOf(slot))}${reason ? `, ${reason}` : ""}, ${copy.forecast.label}: ${cloud}`}
                  >
                    <time dateTime={slot.startAt}>{start}</time>
                    {slot.forecast.status === "KNOWN" && slot.forecast.cloudCoverPercent !== null && (
                      <small className="board-slot-cloud" aria-hidden="true">
                        {Math.round(slot.forecast.cloudCoverPercent)}%
                      </small>
                    )}
                  </button>
                );
              })}
              {slots.length === 0 && <p className="board-note">{copy.noSlots}</p>}
            </div>
          )}

          <Step
            title={copy.target}
            aside={
              !chosen
                ? copy.optional
                : loading
                  ? copy.loadingTargets
                  : judged && judged.every((item) => !bookable(item, chosen.durationMinutes))
                    ? copy.noTargets
                    : copy.optional
            }
          />
          <div
            className="board-targets"
            role="radiogroup"
            aria-label={copy.target}
            aria-busy={loading || undefined}
          >
            {targets.map((candidate) => {
              const item = judgement(candidate);
              const down = !!chosen && !!judged && !canBook(candidate);
              const reasons = item?.visibility.blockReasons ?? [];
              const state = !chosen
                ? null
                : !item
                  ? null
                  : bookable(item, chosen.durationMinutes)
                    ? { tone: "up", text: copy.up, short: copy.upShort }
                    : item.visibility.observable
                      ? {
                          tone: "down",
                          text: copy.needs(candidate.expectedMissionMinutes),
                          short: copy.needsShort(candidate.expectedMissionMinutes),
                        }
                      : {
                          tone: "down",
                          text:
                            reasons.map((reason) => words.reasons[reason]).join(" · ") ||
                            booking.unavailable,
                          short: reasons[0] ? copy.reasonsShort[reasons[0]] : booking.unavailable,
                        };
              return (
                <button
                  key={candidate.id}
                  type="button"
                  role="radio"
                  aria-checked={targetId === candidate.id}
                  className={`board-target${down ? " is-down" : ""}`}
                  data-accent={targetAccent(candidate)}
                  disabled={down}
                  onClick={() => setTargetId(targetId === candidate.id ? null : candidate.id)}
                  aria-label={`${targetName(candidate, locale)}, ${state?.text ?? words.types[candidate.type]}`}
                >
                  <span className="board-thumb" aria-hidden="true">
                    <TargetArt target={candidate} />
                  </span>
                  <span className="board-target-text">
                    <span className="board-target-name">{targetName(candidate, locale)}</span>
                    {state ? (
                      <span className={`board-target-state is-${state.tone}`} title={state.text}>
                        <span aria-hidden="true">{state.short}</span>
                        <span className="visually-hidden">{state.text}</span>
                      </span>
                    ) : (
                      <span className="board-target-sub">{words.types[candidate.type]}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="board-focus">
            {target && (
              <>
                <b>{targetName(target, locale)}</b> {targetDescription(target, locale)}
              </>
            )}
            <span className="board-art-note">{copy.illustrations}</span>
          </p>
        </div>

        <aside className="board-sum" id="session" aria-live="polite" aria-label={copy.session}>
          <div className="board-sumhead">
            <span className="kicker">{copy.session}</span>
          </div>
          <dl className="board-rows">
            <div>
              <dt>{copy.night}</dt>
              <dd>{current ? current.label.short : "—"}</dd>
            </div>
            <div>
              <dt>{copy.start}</dt>
              <dd>
                {chosen
                  ? `${time.format(new Date(chosen.startAt))} – ${time.format(endOf(chosen))}${zone ? ` ${zone}` : ""}`
                  : copy.pickStart}
              </dd>
            </div>
            <div>
              <dt>{copy.target}</dt>
              <dd>{target ? targetName(target, locale) : copy.anyTarget}</dd>
            </div>
            {(chosen ?? waiting) && (
              <div>
                <dt>{copy.forecast.label}</dt>
                <dd>{forecastText((chosen ?? waiting)!, copy.forecast)}</dd>
              </div>
            )}
          </dl>
          {chosen && held.has(chosen.startAt) && (
            <p className="board-caption">
              {copy.waitlist.yours(time.format(new Date(held.get(chosen.startAt)!)))}
            </p>
          )}
          {chosen && chosen.startAt === nextClear && <p className="board-caption">{copy.nextClear}</p>}
          {waiting && <p className="board-caption">{copy.waitlist.taken}</p>}
          {usable.length > 0 && (
            <Dropdown
              label={cards.board.label}
              value={prize?.id ?? ""}
              onChange={(event) => setPrizeId(event.target.value)}
              options={[
                { value: "", label: cards.board.none },
                ...usable.map((candidate) => ({
                  value: candidate.id,
                  label: cards.board.option(
                    cards.prize(candidate.kind, candidate),
                    longDate(new Date(candidate.expiresAt), locale),
                  ),
                })),
              ]}
            />
          )}
          {!reschedule && (
            <details className="board-gift" open={giftCode !== "" || undefined}>
              <summary>{gifts.label}</summary>
              <label className="field">
                <span className="field-label">{gifts.field}</span>
                <input
                  className="field-input data"
                  name="giftCode"
                  value={giftCode}
                  onChange={(event) => {
                    setGiftCode(event.target.value);
                    setFeedback(null);
                  }}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={40}
                />
                {gift && <span className="field-hint">{gifts.note}</span>}
              </label>
            </details>
          )}
          <div className="board-total">
            <span className="board-label">{copy.cost}</span>
            <strong>{chosen ? price(chosen) : "—"}</strong>
            {chosen && <span>{booking.minutes(chosen.durationMinutes)}</span>}
            {chosen && prize?.kind === "DISCOUNT" && prize.percentOff && (
              <span>{cards.board.discount(prize.percentOff)}</span>
            )}
          </div>
          <button
            type="submit"
            className="button button-primary button-large board-book"
            disabled={(!ready && !waiting) || phase !== "idle"}
          >
            <span>{buttonLabel}</span>
          </button>
          <p className="board-caption">{reschedule ? replacing.note : reserve.note}</p>
          {notice && (
            <p className="board-caption" role="status">
              {notice}
            </p>
          )}
          {feedback && (
            <p className="booking-feedback" role="alert">
              {feedback}
            </p>
          )}
        </aside>
      </div>

      {chosen && (
        <a href="#session" className="board-bar" aria-label={copy.goToSession}>
          <span>
            {time.format(new Date(chosen.startAt))} · {booking.minutes(chosen.durationMinutes)}
          </span>
          <b>{price(chosen)}</b>
          <span className="board-bar-go">{reschedule ? replacing.form.book : reserve.form.reserve}</span>
        </a>
      )}
    </form>
  );
}

