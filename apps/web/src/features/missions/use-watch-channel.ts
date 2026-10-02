import type { MissionFailureReason, MissionState } from "@darkview/contracts";
import { zMissionClientPing, zMissionClientSubscribe } from "@darkview/contracts/zod";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import {
  channelUrl,
  initialLive,
  liveReducer,
  parseChannelMessage,
  reconnectDelay,
} from "./live";
import { sessionOver } from "./watch";

/** As the room's: the channel is swept after 120 s of silence. */
const pingEveryMs = 30_000;

function header() {
  return { messageId: crypto.randomUUID(), sentAt: new Date().toISOString() };
}

/**
 * An observer's view of `/ws/mission/{id}` (the contract's mission client channel): a
 * subscribe that states no session, which the realtime service admits on the seat
 * alone (ADR-007). Subscription only, as for the owner; nothing here can command.
 *
 * Every close is reported, and the page decides what it meant by reading the watch view
 * again: the owner closing the session, the session ending, or a dropped connection to
 * open again with `reconnect`. A refusal is a close too: the service sends MISSION_ERROR
 * and hangs up, so it is not kept as a state of its own.
 */
export function useWatchChannel({
  enabled,
  failureReason,
  missionId,
  onClosed,
  state,
}: {
  missionId: string;
  state: MissionState;
  failureReason: MissionFailureReason | null;
  /** True while the caller holds an attached seat. */
  enabled: boolean;
  onClosed: () => void;
}) {
  const [live, dispatch] = useReducer(liveReducer, undefined, () =>
    initialLive(state, failureReason),
  );
  const [connection, setConnection] = useState(0);
  const attempts = useRef(0);
  const over = sessionOver(live.missionState);

  const closed = useRef(onClosed);
  useEffect(() => {
    closed.current = onClosed;
  }, [onClosed]);

  /** Open the channel again, backing off: 1 s doubling to 15 s. */
  const reconnect = useCallback(() => {
    const delay = reconnectDelay(attempts.current);
    attempts.current += 1;
    window.setTimeout(() => setConnection((value) => value + 1), delay);
  }, []);

  useEffect(() => {
    if (!enabled || over) return;
    let disposed = false;
    let ping: number | undefined;
    const socket = new WebSocket(channelUrl(`/ws/mission/${missionId}`, window.location));

    socket.onopen = () => {
      dispatch({ type: "socket-open" });
      socket.send(
        JSON.stringify(
          zMissionClientSubscribe.parse({
            type: "CLIENT_SUBSCRIBE",
            ...header(),
            missionId,
            sessionId: null,
          }),
        ),
      );
      ping = window.setInterval(() => {
        socket.send(
          JSON.stringify(zMissionClientPing.parse({ type: "CLIENT_PING", ...header() })),
        );
      }, pingEveryMs);
    };
    socket.onmessage = (event) => {
      const message = parseChannelMessage(event.data);
      if (!message || message.type === "MISSION_ERROR") return;
      if (message.type === "MISSION_STREAM") attempts.current = 0;
      dispatch({ type: "message", message });
    };
    socket.onclose = () => {
      window.clearInterval(ping);
      if (disposed) return;
      dispatch({ type: "socket-lost" });
      closed.current();
    };

    return () => {
      disposed = true;
      window.clearInterval(ping);
      socket.close();
    };
  }, [connection, enabled, missionId, over]);

  /**
   * The picture failed: an expired URL, or a seat withdrawn, which the stream refuses
   * before the channel says anything. A fresh subscribe tells the two apart.
   */
  const onStreamError = useCallback(() => {
    dispatch({ type: "stream-failed" });
    reconnect();
  }, [reconnect]);

  return { live, reconnect, onStreamError };
}
