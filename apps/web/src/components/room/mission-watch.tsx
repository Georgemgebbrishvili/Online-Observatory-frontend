"use client";

import type { MissionWatchView, ObserverPack } from "@darkview/contracts";
import {
  zGetMissionWatchViewResponse,
  zJoinMissionAsObserverResponse,
  zPurchaseObserverPackResponse,
} from "@darkview/contracts/zod";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { checkoutTarget } from "@/features/booking/checkout";
import { formatPrice } from "@/components/booking/booking-night";
import { ModeNotice } from "@/components/observatory/mode-notice";
import { Button, ButtonLink } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { feedPlates, missionProgress, plateFor } from "@/features/missions/room";
import { useWatchChannel } from "@/features/missions/use-watch-channel";
import {
  clearCheckout,
  markCheckout,
  openingPhase,
  packRefund,
  returnedFromCheckout,
  sessionOver,
  watchStatus,
} from "@/features/missions/watch";
import { fill } from "@/features/operator/format";
import type { Locale } from "@/i18n/config";
import { roomCopy } from "@/i18n/resources/room";
import { statusCopy } from "@/i18n/resources/status";
import { watchCopy, type WatchCopy } from "@/i18n/resources/watch";
import {
  ApiRequestError,
  apiRequest,
  navigateWithFreshSession,
} from "@/lib/platform/browser";

import { LiveFeed } from "./live-feed";
import { MissionSteps } from "./mission-steps";
import { PanelHead } from "./panel-head";
import { TargetPreview } from "./target-preview";

export type WatchPhase =
  /** The read in flight. */
  | "loading"
  /** 404: nobody opened it to this caller, or it does not exist. */
  | "not-open"
  /** The caller owns the mission: their place is the live room. */
  | "owner"
  | "sale"
  | "full"
  /** Back from the checkout; the join answers 402 until the payment settles. */
  | "paying"
  | "watching"
  /** Left by choice: the seat is still theirs (ADR-007, a seat outlives a connection). */
  | "left"
  /** The owner closed the session to watchers. */
  | "closed"
  | "over"
  | "error";

export type WatchPending = "buy" | "join" | "leave" | null;

type WatchViewProps = {
  phase: WatchPhase;
  copy: WatchCopy;
  /** The target's name, for the eyebrow; null before the view is read. */
  target?: string | null;
  /** The observatory's name, on the seat panel; null before the view is read. */
  observatory?: string | null;
  /** "{owner} is observing {target}.", filled. */
  headline?: string | null;
  /** "{count} of {capacity} seats taken.", filled. */
  seats?: string | null;
  simulated?: { label: string; detail: string } | null;
  pending?: WatchPending;
  /** A refusal the caller can act on: try again, or no checkout to pay at. */
  notice?: string | null;
  /** ADR-045: what a close refunded, or owes, for the caller's seat; filled. */
  refund?: string | null;
  /** The live room, for the owner. */
  roomPath?: string;
  /** The feed, with its steps, while watching. */
  feed?: ReactNode;
  /** 2 for specimens side by side on the design system, which has its own h1. */
  headingLevel?: 1 | 2;
  label?: string;
  onBuy?: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
};

const seatedPhases: readonly WatchPhase[] = [
  "sale",
  "full",
  "paying",
  "watching",
  "left",
];

/** The watch page in one state, drawn from props alone: the design system shows each. */
export function WatchView({
  copy,
  feed,
  headingLevel = 1,
  headline,
  label,
  notice,
  observatory,
  onBuy,
  onJoin,
  onLeave,
  pending = null,
  phase,
  refund = null,
  roomPath,
  seats,
  simulated,
  target,
}: WatchViewProps) {
  const Heading = headingLevel === 2 ? "h2" : "h1";
  const about = seatedPhases.includes(phase);
  const heading =
    phase === "loading"
      ? copy.loading
      : phase === "not-open"
        ? copy.notOpen
        : phase === "owner"
          ? copy.owner
          : phase === "closed"
            ? copy.closed
            : phase === "over"
              ? copy.over
              : phase === "error"
                ? copy.failed
                : (headline ?? copy.loading);

  const body =
    phase === "loading" ? (
      <LoadingState label={copy.loading} lines={3} />
    ) : phase === "owner" && roomPath ? (
      <>
        <p>{copy.ownerNote}</p>
        <div className="watch-actions">
          <ButtonLink href={roomPath} size="large">
            {copy.ownerAction}
          </ButtonLink>
        </div>
      </>
    ) : phase === "sale" ? (
      <div className="watch-actions">
        <Button size="large" loading={pending === "buy"} onClick={() => onBuy?.()}>
          {copy.buy}
        </Button>
      </div>
    ) : phase === "full" ? (
      <p>{copy.full}</p>
    ) : phase === "paying" ? (
      <>
        <p role="status">{copy.paying}</p>
        <div className="watch-actions">
          <Button
            variant="secondary"
            loading={pending === "join"}
            onClick={() => onJoin?.()}
          >
            {copy.checkAgain}
          </Button>
        </div>
      </>
    ) : phase === "watching" ? (
      <>
        <p>{copy.watching}</p>
        <div className="watch-actions">
          <Button
            variant="secondary"
            loading={pending === "leave"}
            onClick={() => onLeave?.()}
          >
            {copy.leave}
          </Button>
        </div>
      </>
    ) : phase === "left" ? (
      <>
        <p>{copy.left}</p>
        <div className="watch-actions">
          <Button loading={pending === "join"} onClick={() => onJoin?.()}>
            {copy.watchAgain}
          </Button>
        </div>
      </>
    ) : null;

  return (
    <section
      className="watch room-console"
      data-watch-phase={phase}
      aria-label={label}
      aria-busy={phase === "loading" || undefined}
    >
      <div className="room-atmo" aria-hidden="true">
        <div className="room-atmo-glow" />
        <div className="room-atmo-aurora room-atmo-aurora-a" />
        <div className="room-atmo-aurora room-atmo-aurora-b" />
        <div className="room-atmo-aurora room-atmo-aurora-c" />
        <div className="room-atmo-dots" />
        <div className="room-atmo-ring" />
        <div className="room-atmo-ring room-atmo-ring-b" />
      </div>
      <header className="room-head">
        {target && (
          <p className="eyebrow">
            <span aria-hidden="true" />
            {fill(copy.eyebrow, { target })}
          </p>
        )}
        <Heading>{heading}</Heading>
        {about && seats && <p>{seats}</p>}
      </header>

      {simulated && (
        <ModeNotice mode="SIMULATED" label={simulated.label} detail={simulated.detail} />
      )}

      <div
        className="watch-grid"
        data-watching={phase === "watching" && feed ? "true" : undefined}
      >
        {phase === "watching" && feed}
        {(body || notice || refund) && (
          <div className="room-panel watch-panel">
            <PanelHead
              level={headingLevel === 2 ? 3 : 2}
              icon={phase === "owner" ? "observatory" : "seat"}
              title={phase === "owner" && target ? target : copy.seatTitle}
              meta={observatory ?? undefined}
            />
            {body}
            {refund && <p className="watch-refund">{refund}</p>}
            {notice && (
              <p className="watch-notice" role="alert">
                {notice}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/** After a checkout, how many times the join is asked while it answers 402, and how often. */
export const settleTries = 5;
export const settleEveryMs = 2_000;

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

type MissionWatchProps = {
  view: MissionWatchView;
  locale: Locale;
};

/**
 * The observer's seat (Phase 4 slice 5, ADR-007): buy it with `purchaseObserverPack` and
 * the checkout its intent names, take it with `joinMissionAsObserver`, watch the mission
 * channel, and leave with `leaveMissionAsObserver`. View only: no control, no capture.
 */
export function MissionWatch({ locale, view }: MissionWatchProps) {
  const copy = watchCopy[locale];
  const room = roomCopy[locale];
  const status = statusCopy[locale];
  const { mission, target } = view;
  const path = `/missions/${encodeURIComponent(mission.id)}`;
  const signInPath = `/${locale}/sign-in`;
  const capacity = mission.observerCapacity ?? 5;

  const [count, setCount] = useState(view.observerCount);
  const [phase, setPhase] = useState<WatchPhase>(() => openingPhase(view, capacity));
  // The caller's own pack (ADR-045): re-read after a close, for what it gave back.
  const [pack, setPack] = useState<ObserverPack | null>(view.myObserverPack);
  const [pending, setPending] = useState<WatchPending>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  /** A refusal every request shares: sign in again, or a state the page moves to. */
  const fail = useCallback(
    (error: unknown) => {
      if (!(error instanceof ApiRequestError)) return setNotice(copy.failed);
      if (error.status === 401) return navigateWithFreshSession(signInPath);
      const code = error.error?.code;
      const next: WatchPhase | null =
        code === "OBSERVER_CAPACITY_REACHED"
          ? "full"
          : code === "MISSION_NOT_ACTIVE"
            ? "over"
            : error.status === 404 || code === "MISSION_NOT_OBSERVABLE"
              ? "closed"
              : null;
      if (!next) return setNotice(copy.failed);
      clearCheckout();
      setPhase(next);
    },
    [copy.failed, signInPath],
  );

  /**
   * Take the seat. After a checkout the payment may not have settled yet, so a 402 is
   * asked again a few times before the page says it is waiting and offers to check.
   */
  const join = useCallback(
    async (settling: boolean) => {
      setPending("join");
      setNotice(null);
      if (settling) setPhase("paying");
      for (let attempt = 1; ; attempt += 1) {
        try {
          await apiRequest(`${path}/observers`, {
            method: "POST",
            schema: zJoinMissionAsObserverResponse,
          });
          clearCheckout();
          setCount((value) => value + 1);
          setPhase("watching");
          break;
        } catch (error) {
          const unpaid = error instanceof ApiRequestError && error.status === 402;
          if (unpaid && settling && attempt < settleTries) {
            await wait(settleEveryMs);
            if (!mounted.current) return;
            continue;
          }
          if (unpaid) setPhase("paying");
          else fail(error);
          break;
        }
      }
      setPending(null);
    },
    [fail, path],
  );

  // Back from the checkout, which says nothing in the address: the page noted the
  // mission before it left. A timer, so React's development double-mount joins once.
  // A seat already settled opens on "left" (ADR-045), so that joins too.
  const [arrivedIn] = useState(phase);
  useEffect(() => {
    if (
      (arrivedIn !== "sale" && arrivedIn !== "left") ||
      !returnedFromCheckout(mission.id)
    )
      return;
    const id = window.setTimeout(() => void join(true), 0);
    return () => window.clearTimeout(id);
  }, [arrivedIn, join, mission.id]);

  async function buy() {
    setPending("buy");
    setNotice(null);
    try {
      const { observerPack, paymentIntent } = await apiRequest(`${path}/observer-pack`, {
        method: "POST",
        schema: zPurchaseObserverPackResponse,
      });
      // Bought earlier and left: the same pack comes back, already paid.
      if (observerPack.status === "PAID") return void (await join(false));
      const checkout = paymentIntent.redirectUrl
        ? checkoutTarget(paymentIntent.redirectUrl, window.location.origin)
        : null;
      if (!checkout) {
        setNotice(copy.checkoutUnavailable);
        setPending(null);
        return;
      }
      markCheckout(mission.id);
      // A full navigation, as booking's: the checkout is not a page of this app.
      navigateWithFreshSession(checkout);
    } catch (error) {
      setPending(null);
      fail(error);
    }
  }

  async function leave() {
    setPending("leave");
    setNotice(null);
    try {
      await apiRequest(`${path}/observers`, { method: "DELETE" });
      setCount((value) => Math.max(0, value - 1));
      setPhase("left");
    } catch (error) {
      fail(error);
    } finally {
      setPending(null);
    }
  }

  const check = useRef<() => void>(() => {});
  const onClosed = useCallback(() => check.current(), []);
  const { live, onStreamError, reconnect } = useWatchChannel({
    missionId: mission.id,
    state: mission.state,
    failureReason: mission.failureReason ?? null,
    enabled: phase === "watching",
    onClosed,
  });

  // The channel closed: read the view again to learn why. A 404 or a seat that is gone
  // is the owner closing the session (closing detaches every seat); anything else is a
  // dropped connection, opened again.
  useEffect(() => {
    check.current = () => {
      apiRequest(`${path}/watch`, { schema: zGetMissionWatchViewResponse })
        .then((next) => {
          if (!mounted.current) return;
          setPack(next.myObserverPack);
          if (sessionOver(next.mission.state)) setPhase("over");
          else if (!next.myObserverSeat) setPhase("closed");
          else reconnect();
        })
        .catch((error: unknown) => {
          if (!mounted.current) return;
          if (error instanceof ApiRequestError && error.status === 401)
            return navigateWithFreshSession(signInPath);
          if (error instanceof ApiRequestError && error.status === 404)
            return setPhase("closed");
          reconnect();
        });
    };
  }, [path, reconnect, signInPath]);

  const refunded = packRefund(pack);
  const refund = refunded
    ? fill(refunded.kind === "refunded" ? copy.refunded : copy.refundOwed, {
        amount: formatPrice(refunded.minor, refunded.currency, locale),
      })
    : null;

  const targetName = locale === "ka" ? target.nameKa : target.nameEn;
  const named = (template: string) => fill(template, { target: targetName });
  const shown = phase === "watching" && sessionOver(live.missionState) ? "over" : phase;

  const feedStatus = watchStatus(live);
  const text =
    feedStatus === "offline"
      ? { title: copy.offline, description: room.live.status.offline.description }
      : feedStatus === "live" && live.stream?.mode === "REAL"
        ? { title: room.live.status.live.title, description: room.live.liveReal }
        : {
            title: room.live.status[feedStatus].title,
            description: named(room.live.status[feedStatus].description),
          };

  const statuses = missionProgress(
    live.missionState,
    live.seen.length ? live.seen.map((state) => ({ state })) : null,
  );
  const reached = Math.max(
    statuses.findIndex((step) => step === "current" || step === "stopped"),
    live.missionState === "COMPLETE" ? 4 : 0,
  );

  return (
    <WatchView
      phase={shown}
      copy={copy}
      target={targetName}
      observatory={locale === "ka" ? view.observatory.nameKa : view.observatory.nameEn}
      headline={fill(copy.headline, {
        owner: view.ownerDisplayName ?? copy.someone,
        target: targetName,
      })}
      seats={fill(copy.seats, { count: String(count), capacity: String(capacity) })}
      simulated={
        mission.mode === "SIMULATED" || live.stream?.mode === "SIMULATED"
          ? { label: copy.simulated, detail: status.mode.SIMULATED.detail }
          : null
      }
      pending={pending}
      notice={notice}
      refund={refund}
      onBuy={() => void buy()}
      onJoin={() => void join(phase === "paying")}
      onLeave={() => void leave()}
      feed={
        <section className="room-feed" aria-labelledby="watch-feed-title">
          <h2 id="watch-feed-title" className="visually-hidden">
            {room.feed.label}
          </h2>
          <LiveFeed
            status={feedStatus}
            stream={
              live.stream && {
                url: live.stream.url,
                simulated: live.stream.mode === "SIMULATED",
                alt: named(
                  live.stream.mode === "SIMULATED"
                    ? room.live.streamAltSimulated
                    : room.live.streamAlt,
                ),
              }
            }
            preview={
              <TargetPreview
                plate={plateFor(target.slug)}
                name={targetName}
                caption={room.feed.illustration}
              />
            }
            plates={feedPlates(view.observatory, target, locale, room.feed)}
            title={text.title}
            description={text.description}
            labels={{
              simulated: room.live.simulated,
              live: room.live.live,
              timeLeft: room.live.timeLeft,
            }}
            timeLeft={null}
            steps={
              <MissionSteps
                title={room.steps.title}
                names={room.steps.names}
                statuses={statuses}
                position={fill(room.steps.stepOf, { step: String(reached + 1) })}
                now={room.steps.now}
                stopped={room.steps.stopped}
              />
            }
            onStreamError={onStreamError}
          />
        </section>
      }
    />
  );
}
