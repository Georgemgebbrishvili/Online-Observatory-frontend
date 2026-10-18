"use client";

import type {
  BookableObservatory,
  Booking,
  Slot,
  SlotTarget,
  Target,
} from "@darkview/contracts";
import {
  zCreateBookingResponse,
  zListSlotTargetsResponse,
  zRescheduleBookingResponse,
} from "@darkview/contracts/zod";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { MoonGlyph, moonThatNight } from "@/components/booking/moon-glyph";
import { ModeNotice } from "@/components/observatory/mode-notice";
import { checkoutTarget } from "@/features/booking/checkout";
import { targetDescription, targetName, targetVisual } from "@/features/targets/present";
import type { Locale } from "@/i18n/config";
import { boardCopy } from "@/i18n/resources/board";
import { bookingCopy } from "@/i18n/resources/booking";
import { rescheduleCopy } from "@/i18n/resources/reschedule";
import { reserveCopy } from "@/i18n/resources/reserve";
import { statusCopy } from "@/i18n/resources/status";
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
  mode: "SIMULATED" | "REAL" | null;
  nights: BoardNight[];
  targets: Target[];
  /** A booking whose lost slot is being replaced: its length, for free (ADR-043). */
  reschedule: Booking | null;
  /** A slot named in the address (the old reserve page's way in): chosen on arrival. */
  initialStartAt: string | null;
  signInPath: string;
};

type Phase = "idle" | "reserving" | "redirecting";

function intlLocale(locale: Locale) {
  return locale === "ka" ? "ka-GE" : "en-GB";
}

/** Our drawn plate of a target, where there is one (ADR-052 §7); the rest take a swatch. */
function plateOf(target: Target): string | null {
  const body = target.solarSystemBody?.toLowerCase();
  return body && ["saturn", "jupiter", "mars", "venus"].includes(body)
    ? `/plates/${body}.webp`
    : null;
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
  mode,
  nights,
  observatory,
  reschedule,
  signInPath,
  targets,
}: BookingBoardProps) {
  const copy = boardCopy[locale];
  const booking = bookingCopy[locale];
  const reserve = reserveCopy[locale];
  const replacing = rescheduleCopy[locale];
  const words = targetCopy[locale];
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

  // A replacement is for the lost slot's length (rescheduleBooking); otherwise any open slot.
  const offered = (slot: Slot) =>
    slot.available && (!reschedule || slot.durationMinutes === reschedule.durationMinutes);
  const openCount = (night: BoardNight) => night.slots.filter(offered).length;
  const nightOf = (startAt: string | null) =>
    nights.find((night) => night.slots.some((slot) => slot.startAt === startAt))?.date ?? null;

  const [night, setNight] = useState(
    () =>
      nightOf(initialStartAt) ??
      nights.find((candidate) => openCount(candidate) > 0)?.date ??
      nights[0]?.date ??
      "",
  );
  const [slotAt, setSlotAt] = useState<string | null>(() => {
    const slot = nights.flatMap((n) => n.slots).find((s) => s.startAt === initialStartAt);
    return slot && offered(slot) ? slot.startAt : null;
  });
  const [targetId, setTargetId] = useState<string | null>(reschedule?.targetId ?? null);
  const [skies, setSkies] = useState<Record<string, SlotTarget[]>>({});
  const reading = useRef(new Set<string>());
  const [phase, setPhase] = useState<Phase>("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [key] = useState(() => crypto.randomUUID());

  const current = nights.find((candidate) => candidate.date === night) ?? nights[0];
  const slots = current?.slots ?? [];
  const chosen = slots.find((slot) => slot.startAt === slotAt && offered(slot)) ?? null;

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
  const ready = !!chosen && !!target && canBook(target);

  const pickNight = (date: string) => {
    setNight(date);
    setSlotAt(null);
    setFeedback(null);
  };
  const pickSlot = (slot: Slot) => {
    setSlotAt(slot.startAt);
    setFeedback(null);
    readSky(slot);
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!chosen || !target || !ready || phase !== "idle") return;
    setPhase("reserving");
    setFeedback(null);
    try {
      if (reschedule) {
        const booked = await apiRequest(
          `/bookings/${encodeURIComponent(reschedule.id)}/reschedule`,
          {
            method: "POST",
            body: { slotStartAt: chosen.startAt, targetId: target.id },
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
          targetId: target.id,
          slotStartAt: chosen.startAt,
          durationMinutes: chosen.durationMinutes,
          locale,
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
      setFeedback(
        code === "SLOT_UNAVAILABLE" || code === "CONFLICT"
          ? reserve.form.taken
          : code === "WEATHER_HOLD"
            ? reserve.form.weatherHold
            : code === "OBSERVATORY_OFFLINE"
              ? reserve.form.offline
              : code === "TARGET_NOT_OBSERVABLE"
                ? reserve.form.notObservable
                : reserve.form.failed,
      );
    }
  }

  const price = (slot: BoardSlot) => (reschedule ? replacing.free : slot.price);
  const endOf = (slot: Slot) => new Date(Date.parse(slot.startAt) + slot.durationMinutes * 60_000);
  const buttonLabel =
    phase === "reserving"
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

      {mode === "SIMULATED" && (
        <ModeNotice
          mode="SIMULATED"
          label={statusCopy[locale].mode.SIMULATED.banner}
          detail={statusCopy[locale].mode.SIMULATED.detail}
        />
      )}

      <div className="board-grid">
        <div className="board-pick">
          <Step title={copy.night} />
          <div className="board-nights" role="radiogroup" aria-label={booking.nights}>
            {nights.map((candidate) => {
              const open = openCount(candidate);
              const moon = moonThatNight(candidate.date, timezone);
              const label = candidate.label.long;
              return (
                <button
                  key={candidate.date}
                  type="button"
                  role="radio"
                  aria-checked={candidate.date === night}
                  className={`board-night${open === 0 ? " is-full" : ""}`}
                  onClick={() => pickNight(candidate.date)}
                  aria-label={`${label}, ${open === 0 ? copy.full : copy.open(open)}`}
                >
                  <small>{candidate.label.weekday}</small>
                  <b>{candidate.label.day}</b>
                  <small>{candidate.label.month}</small>
                  <MoonGlyph lit={moon.lit} waxing={moon.waxing} />
                  <i>{open === 0 ? copy.full : copy.open(open)}</i>
                </button>
              );
            })}
          </div>

          <Step
            title={copy.start}
            aside={zone ? `${copy.siteTime} · ${zone}` : copy.siteTime}
          />
          {current && (
            <div
              className="board-slots"
              role="radiogroup"
              aria-label={`${booking.slots}, ${current.label.long}`}
            >
              {slots.map((slot) => {
                const ok = offered(slot);
                const reason = slot.unavailableReason
                  ? booking.reasons[slot.unavailableReason]
                  : null;
                const start = time.format(new Date(slot.startAt));
                return (
                  <button
                    key={slot.startAt}
                    type="button"
                    role="radio"
                    aria-checked={chosen?.startAt === slot.startAt}
                    className={`board-slot${
                      slot.unavailableReason === "ALREADY_BOOKED"
                        ? " is-taken"
                        : slot.unavailableReason === "IN_THE_PAST"
                          ? " is-past"
                          : !ok
                            ? " is-short"
                            : ""
                    }`}
                    disabled={!ok}
                    onClick={() => pickSlot(slot)}
                    title={reason ?? undefined}
                    aria-label={`${start}–${time.format(endOf(slot))}${reason ? `, ${reason}` : ""}`}
                  >
                    <time dateTime={slot.startAt}>{start}</time>
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
                ? copy.pickSlotFirst
                : loading
                  ? copy.loadingTargets
                  : judged && judged.every((item) => !bookable(item, chosen.durationMinutes))
                    ? copy.noTargets
                    : undefined
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
              const plate = plateOf(candidate);
              const about = targetDescription(candidate, locale);
              const state = !chosen
                ? null
                : !item
                  ? null
                  : bookable(item, chosen.durationMinutes)
                    ? { tone: "up", text: copy.up }
                    : item.visibility.observable
                      ? { tone: "down", text: copy.needs(candidate.expectedMissionMinutes) }
                      : {
                          tone: "down",
                          text:
                            item.visibility.blockReasons
                              .map((reason) => words.reasons[reason])
                              .join(" · ") || booking.unavailable,
                        };
              return (
                <button
                  key={candidate.id}
                  type="button"
                  role="radio"
                  aria-checked={targetId === candidate.id}
                  className={`board-target${down ? " is-down" : ""}`}
                  disabled={down}
                  onClick={() => setTargetId(candidate.id)}
                  aria-label={`${targetName(candidate, locale)}, ${state?.text ?? words.types[candidate.type]}`}
                >
                  <span className={`board-thumb board-thumb-${targetVisual(candidate)}`} aria-hidden="true">
                    {plate && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={plate} alt="" loading="lazy" decoding="async" />
                    )}
                  </span>
                  <span className="board-target-text">
                    <span className="board-target-name">{targetName(candidate, locale)}</span>
                    <span className="board-target-sub">
                      {words.types[candidate.type]} · {booking.minutes(candidate.expectedMissionMinutes)}
                    </span>
                    {about && <span className="board-target-about">{about}</span>}
                  </span>
                  {state && (
                    <span className={`board-target-state is-${state.tone}`}>{state.text}</span>
                  )}
                </button>
              );
            })}
          </div>
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
              <dd>{target ? targetName(target, locale) : copy.pickTarget}</dd>
            </div>
          </dl>
          <div className="board-total">
            <span className="board-label">{copy.cost}</span>
            <strong>{chosen ? price(chosen) : "—"}</strong>
            {chosen && <span>{booking.minutes(chosen.durationMinutes)}</span>}
          </div>
          <button
            type="submit"
            className="button button-primary button-large board-book"
            disabled={!ready || phase !== "idle"}
          >
            <span>{buttonLabel}</span>
          </button>
          <p className="board-caption">{reschedule ? replacing.note : reserve.note}</p>
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
      <Link className="page-link board-bookings" href="#booking-nights">
        {booking.yourBookings}
      </Link>
    </form>
  );
}

