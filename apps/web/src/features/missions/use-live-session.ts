import type { MissionFailureReason, MissionState } from "@darkview/contracts";
import {
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
 * the session lasts. A scheduled mission waits for the customer's start; a live one is
 * reopened on arrival, which rotates its session so a stale tab stops watching.
 *
 * The start is never retried by itself: for a scheduled mission it moves the telescope.
 * The channel is: it is subscription only.
 */
export function useLiveSession({
  failureReason,
  locale,
  missionId,
  state,
}: {
  missionId: string;
  state: MissionState;
  failureReason: MissionFailureReason | null;
  locale: Locale;
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
  // customer's own start must not reopen (and so rotate) the session it just opened, and
  // React's development double-mount must not rotate it twice.
  const [arrivedIn] = useState(state);
  const reopened = useRef(false);
  useEffect(() => {
    if (reopened.current || !reopensSession(arrivedIn)) return;
    reopened.current = true;
    void start();
  }, [arrivedIn, start]);

  const sessionId = live.session?.sessionId ?? null;
  const channelPath = live.session?.missionChannelUrl ?? null;
  const closed =
    live.expired ||
    live.channelError !== null ||
    (live.missionState !== "SCHEDULED" &&
      live.missionState !== "WEATHER_HOLD" &&
      !reopensSession(live.missionState));

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
        // The channel's capture carries no thumbnail: the room reads it again.
        if (message.type === "MISSION_CAPTURE_READY") refresh.current();
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

  // The session ends at its expiresAt, whatever the channel is doing.
  const expiresAt = live.session?.expiresAt ?? null;
  useEffect(() => {
    if (!expiresAt) return;
    const id = window.setTimeout(
      () => dispatch({ type: "expired" }),
      Math.max(0, Date.parse(expiresAt) - Date.now()),
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
