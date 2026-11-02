import type { MissionFailureReason, MissionState } from "@darkview/contracts";
import {
  zGetMissionResponse,
  zMissionClientPing,
  zMissionClientSubscribe,
  zStartMissionSessionResponse,
} from "@darkview/contracts/zod";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import type { Locale } from "@/i18n/config";
import {
  ApiRequestError,
  apiRequest,
  navigateWithFreshSession,
} from "@/lib/platform/browser";

import {
  channelUrl,
  initialLive,
  liveReducer,
  parseChannelMessage,
  reconnectDelay,
  reopensSession,
} from "./live";

/** The channel is swept after 120 s of silence; a ping well inside that keeps it. */
const pingEveryMs = 30_000;

/** How often a room that arrived in a weather hold asks whether the hold has lifted. */
const holdCheckEveryMs = 60_000;

/**
 * Clock skew between this browser and the platform, at most: a start refused as early
 * this close to the slot's opening is tried again, every `earlyRetryMs`.
 */
const skewMs = 2 * 60_000;
const earlyRetryMs = 10_000;

/**
 * How long the channel is kept after the mission ends or the slot's time is up: the
 * platform keeps sending telemetry for 300 s while the telescope parks (ADR-079 §5).
 */
const lingerMs = 330_000;

function header() {
  return { messageId: crypto.randomUUID(), sentAt: new Date().toISOString() };
}

function subscribeToClock(onTick: () => void) {
  const id = window.setInterval(onTick, 1000);
  return () => window.clearInterval(id);
}

/** Now, to the second, on the client only: the server renders null, so nothing mismatches. */
export function useNow() {
  return useSyncExternalStore(
    subscribeToClock,
    () => Math.floor(Date.now() / 1000) * 1000,
    () => null,
  );
}

/**
 * The room's live session: `startMissionSession`, then `/ws/mission/{id}` for as long as
 * the session lasts, and on until the telescope has parked.
 *
 * Opening the page inside the booked slot is the start (ADR-079 §1): a scheduled mission
 * starts when the page opens inside its slot, or when the slot opens while the page is
 * open; a live one is reopened on arrival, which rotates its session so a stale tab stops
 * watching. Before the slot, and after it, nothing is called. A start refused as too
 * early, within clock skew of the opening, is tried again; any other refusal waits for
 * the customer's retry.
 */
const longestTimerMs = 2 ** 31 - 1;

export function useLiveSession({
  failureReason,
  locale,
  missionId,
  opensAt = null,
  endsAt = null,
  startsOnOpen = false,
  state,
}: {
  missionId: string;
  state: MissionState;
  failureReason: MissionFailureReason | null;
  locale: Locale;
  /** The slot's start and end, in ms; null when unknown. */
  opensAt?: number | null;
  endsAt?: number | null;
  /**
   * The session page (ADR-079 §1): a scheduled mission starts when the page is open
   * inside its slot. The observatory console starts one only when asked.
   */
  startsOnOpen?: boolean;
}) {
  const [live, dispatch] = useReducer(liveReducer, undefined, () =>
    initialLive(state, failureReason),
  );
  const router = useRouter();
  const [connection, setConnection] = useState(0);
  const streamFailures = useRef(0);

  const start = useCallback(async () => {
    dispatch({ type: "start" });
    try {
      const session = await apiRequest(
        `/missions/${encodeURIComponent(missionId)}/start`,
        { method: "POST", schema: zStartMissionSessionResponse },
      );
      dispatch({ type: "started", session });
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        navigateWithFreshSession(`/${locale}/sign-in`);
        return;
      }
      dispatch({
        type: "start-failed",
        code: error instanceof ApiRequestError ? (error.error?.code ?? null) : null,
      });
    }
  }, [locale, missionId]);

  // Once per page, and only for the state the page arrived in: a refresh after the
  // page's own start must not reopen (and so rotate) the session it just opened, and
  // React's development double-mount must not rotate it twice.
  const now = useNow();
  const [arrivedIn] = useState(state);
  const inSlot =
    now !== null && (opensAt === null || now >= opensAt) && (endsAt === null || now < endsAt);
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) return;
    if (!reopensSession(arrivedIn) && !(startsOnOpen && arrivedIn === "SCHEDULED" && inSlot))
      return;
    opened.current = true;
    void start();
  }, [arrivedIn, inSlot, start, startsOnOpen]);

  // The browser's clock may run ahead of the platform's: a start refused as early, just
  // after the opening, is tried again.
  const early =
    live.start === "failed" &&
    live.startError === "MISSION_NOT_ACTIVE" &&
    live.missionState === "SCHEDULED" &&
    opensAt !== null &&
    now !== null &&
    now < opensAt + skewMs;
  useEffect(() => {
    if (!early) return;
    const id = window.setTimeout(() => void start(), earlyRetryMs);
    return () => window.clearTimeout(id);
  }, [early, start]);

  // A hold opens no session, so no channel tells the room when it lifts. It asks, and
  // reloads on any change: the page it arrived on was rendered for the hold.
  useEffect(() => {
    if (arrivedIn !== "WEATHER_HOLD" || live.session) return;
    const id = window.setInterval(async () => {
      try {
        const mission = await apiRequest(`/missions/${encodeURIComponent(missionId)}`, {
          schema: zGetMissionResponse,
        });
        if (mission.state !== "WEATHER_HOLD")
          navigateWithFreshSession(window.location.pathname);
      } catch {
        // The next check tries again; a failed read is not a change.
      }
    }, holdCheckEveryMs);
    return () => window.clearInterval(id);
  }, [arrivedIn, live.session, missionId]);

  const sessionId = live.session?.sessionId ?? null;
  const channelPath = live.session?.missionChannelUrl ?? null;
  // Past the live states, or past the slot's time, the channel stays while the telescope
  // finishes and parks, until MISSION_SESSION_ENDED (sent after the park) or for no longer
  // than the platform keeps saying so.
  const ending =
    live.expired ||
    (live.missionState !== "SCHEDULED" &&
      live.missionState !== "WEATHER_HOLD" &&
      !reopensSession(live.missionState));
  const [lingered, setLingered] = useState(false);
  useEffect(() => {
    if (!ending) return;
    const id = window.setTimeout(() => setLingered(true), lingerMs);
    return () => window.clearTimeout(id);
  }, [ending]);
  const closed =
    live.channelError !== null ||
    live.ended !== null ||
    (ending && lingered);

  const refresh = useRef(router.refresh);
  useEffect(() => {
    refresh.current = router.refresh;
  }, [router]);

  useEffect(() => {
    if (!sessionId || !channelPath || closed) return;
    let disposed = false;
    let attempt = 0;
    let socket: WebSocket | null = null;
    let retry: number | undefined;
    let ping: number | undefined;

    const open = () => {
      const current = new WebSocket(channelUrl(channelPath, window.location));
      socket = current;
      current.onopen = () => {
        attempt = 0;
        dispatch({ type: "socket-open" });
        current.send(
          JSON.stringify(
            zMissionClientSubscribe.parse({
              type: "CLIENT_SUBSCRIBE",
              ...header(),
              missionId,
              sessionId,
            }),
          ),
        );
        ping = window.setInterval(() => {
          current.send(
            JSON.stringify(
              zMissionClientPing.parse({ type: "CLIENT_PING", ...header() }),
            ),
          );
        }, pingEveryMs);
      };
      current.onmessage = (event) => {
        const message = parseChannelMessage(event.data);
        if (!message) return;
        if (message.type === "MISSION_STREAM") streamFailures.current = 0;
        // The channel's capture carries no thumbnail: the room reads it again, as it does
        // for the session's end, which names every capture it kept.
        if (
          message.type === "MISSION_CAPTURE_READY" ||
          message.type === "MISSION_SESSION_ENDED"
        )
          refresh.current();
        dispatch({ type: "message", message });
      };
      current.onclose = () => {
        window.clearInterval(ping);
        if (disposed) return;
        dispatch({ type: "socket-lost" });
        retry = window.setTimeout(open, reconnectDelay(attempt));
        attempt += 1;
      };
    };

    open();
    return () => {
      disposed = true;
      window.clearTimeout(retry);
      window.clearInterval(ping);
      socket?.close();
    };
  }, [channelPath, closed, connection, missionId, sessionId]);

  // The session ends at its expiresAt, whatever the channel is doing. A browser timer
  // longer than 2^31 - 1 ms (24.8 days) fires at once, so the wait is capped there.
  const expiresAt = live.session?.expiresAt ?? null;
  useEffect(() => {
    if (!expiresAt) return;
    const id = window.setTimeout(
      () => dispatch({ type: "expired" }),
      Math.min(longestTimerMs, Math.max(0, Date.parse(expiresAt) - Date.now())),
    );
    return () => window.clearTimeout(id);
  }, [expiresAt]);

  // A new state is a new line in the history the server renders.
  const shown = useRef(live.missionState);
  useEffect(() => {
    if (shown.current === live.missionState) return;
    shown.current = live.missionState;
    refresh.current();
  }, [live.missionState]);

  /**
   * The picture failed: an expired or refused URL. A fresh subscribe is offered a fresh
   * URL when a frame exists, so the channel is reopened, backing off.
   */
  const onStreamError = useCallback(() => {
    dispatch({ type: "stream-failed" });
    const delay = reconnectDelay(streamFailures.current);
    streamFailures.current += 1;
    window.setTimeout(() => setConnection((value) => value + 1), delay);
  }, []);

  return { live, start, onStreamError };
}
