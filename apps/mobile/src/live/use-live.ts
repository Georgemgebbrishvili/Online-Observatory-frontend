import type {
  Mission,
  MissionChannelMessage,
  MissionCommandRequest,
  MissionSession,
} from "@darkview/contracts";
import { fetch as streamingFetch } from "expo/fetch";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import { platform, PlatformError } from "@/platform/api";
import { realtimeBaseUrl } from "@/platform/config";

import { jpegDataUri, multipartFrames } from "./mjpeg";
import { initialRoom, isLive, onRealtime, reduce, verdictOutcome, type Room } from "./room";

type StartState =
  | { status: "idle" }
  | { status: "starting" }
  | { status: "open"; session: MissionSession }
  | { status: "failed"; code: string | null };

export type CommandOutcome =
  | { status: "sending" | "waiting" }
  | { status: "done"; type: MissionCommandRequest["type"] }
  | { status: "refused"; reason: string | null }
  | { status: "no-answer" | "failed" };

const randomId = () =>
  "xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx".replace(/x/g, () =>
    Math.floor(Math.random() * 16).toString(16),
  );

/**
 * One customer's live session on one mission (the website's use-live-session, for a
 * phone). The channel and the stream carry the native session as a bearer (ADR-061).
 */
export function useLive(mission: Mission, token: string) {
  const [room, dispatch] = useReducer(
    (current: Room, message: MissionChannelMessage | { type: "RESET"; room: Room }) =>
      message.type === "RESET" ? message.room : reduce(current, message),
    initialRoom(mission.state, mission.failureReason ?? null),
  );
  const [start, setStart] = useState<StartState>({ status: "idle" });
  const [connected, setConnected] = useState(false);
  const [frame, setFrame] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<CommandOutcome | null>(null);
  const pendingCommand = useRef<{ id: string; type: MissionCommandRequest["type"]; expiresAt: number } | null>(null);

  const open = useCallback(async () => {
    setStart({ status: "starting" });
    try {
      setStart({ status: "open", session: await platform.startMission(mission.id, token) });
    } catch (error) {
      setStart({ status: "failed", code: error instanceof PlatformError ? error.code : null });
    }
  }, [mission.id, token]);

  // A mission already under way reopens its session at once; a scheduled one waits for
  // the customer's Start.
  useEffect(() => {
    if (isLive(mission.state)) void open();
  }, [mission.state, open]);

  const session = start.status === "open" ? start.session : null;

  // The channel: subscribe, ping every 30 s, reconnect with backoff.
  useEffect(() => {
    if (!session || room.channelError) return;
    let socket: WebSocket | null = null;
    let closed = false;
    let attempt = 0;
    let ping: ReturnType<typeof setInterval> | undefined;
    let retry: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      const url = onRealtime(session.missionChannelUrl, realtimeBaseUrl, "ws");
      // React Native's WebSocket takes headers as a third argument; a browser's does not.
      const Socket = WebSocket as unknown as new (
        url: string,
        protocols: string[] | undefined,
        options: { headers: Record<string, string> },
      ) => WebSocket;
      socket = new Socket(url, undefined, { headers: { authorization: `Bearer ${token}` } });
      socket.onopen = () => {
        attempt = 0;
        setConnected(true);
        socket?.send(
          JSON.stringify({
            type: "CLIENT_SUBSCRIBE",
            messageId: randomId(),
            sentAt: new Date().toISOString(),
            missionId: mission.id,
            sessionId: session.sessionId,
          }),
        );
        ping = setInterval(
          () =>
            socket?.send(
              JSON.stringify({ type: "CLIENT_PING", messageId: randomId(), sentAt: new Date().toISOString() }),
            ),
          30_000,
        );
      };
      socket.onmessage = (event) => {
        try {
          dispatch(JSON.parse(String(event.data)) as MissionChannelMessage);
        } catch {
          // Not a channel message; the contract sends nothing else.
        }
      };
      socket.onclose = () => {
        setConnected(false);
        clearInterval(ping);
        if (closed) return;
        retry = setTimeout(connect, Math.min(15_000, 1000 * 2 ** attempt++));
      };
    };

    connect();
    return () => {
      closed = true;
      clearInterval(ping);
      clearTimeout(retry);
      socket?.close();
    };
  }, [session, room.channelError, mission.id, token]);

  // The live view: read the signed stream, one JPEG at a time.
  const streamUrl = room.stream?.url ?? null;
  useEffect(() => {
    if (!streamUrl) {
      setFrame(null);
      return;
    }
    const abort = new AbortController();
    const expiresAt = room.stream ? Date.parse(room.stream.expiresAt) : 0;
    const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // The stream answers 404 until the agent's first frame arrives, and ends when its
    // grant does; both are ordinary. Read it again until the URL lapses, by which time
    // the channel has offered a renewed one.
    (async () => {
      let attempt = 0;
      while (!abort.signal.aborted && Date.now() < expiresAt) {
        try {
          const response = await streamingFetch(onRealtime(streamUrl, realtimeBaseUrl, "http"), {
            headers: { authorization: `Bearer ${token}` },
            signal: abort.signal,
          });
          if (response.ok && response.body) {
            const reader = response.body.getReader();
            const frames = multipartFrames();
            for (;;) {
              const { value, done } = await reader.read();
              if (done) break;
              const latest = frames(value).at(-1);
              if (latest) {
                attempt = 0;
                setFrame(jpegDataUri(latest));
              }
            }
          }
        } catch {
          // Aborted, or the connection dropped; the loop decides.
        }
        // A stream that stopped leaves no frame behind: a still picture must never pass
        // for the live sky.
        if (!abort.signal.aborted) setFrame(null);
        await pause(Math.min(8000, 1000 * 2 ** attempt++));
      }
    })();
    return () => abort.abort();
  }, [streamUrl, token]);

  // A command's verdict arrives on the channel, possibly before its 202.
  useEffect(() => {
    const pending = pendingCommand.current;
    if (!pending) return;
    const verdict = room.verdicts[pending.id];
    if (verdict) {
      pendingCommand.current = null;
      setOutcome(
        verdictOutcome(verdict.status) === "done"
          ? { status: "done", type: pending.type }
          : { status: "refused", reason: verdict.rejectionReason },
      );
      return;
    }
    const timer = setTimeout(() => {
      if (pendingCommand.current?.id === pending.id) {
        pendingCommand.current = null;
        setOutcome({ status: "no-answer" });
      }
    }, Math.max(0, pending.expiresAt + 1000 - Date.now()));
    return () => clearTimeout(timer);
  }, [room.verdicts, outcome]);

  const send = useCallback(
    async (body: MissionCommandRequest) => {
      if (pendingCommand.current) return;
      setOutcome({ status: "sending" });
      try {
        const accepted = await platform.command(mission.id, token, body);
        if (accepted.status !== "ACCEPTED") {
          setOutcome({ status: "refused", reason: accepted.rejectionReason ?? null });
          return;
        }
        pendingCommand.current = {
          id: accepted.commandId,
          type: body.type,
          expiresAt: Date.parse(accepted.expiresAt),
        };
        setOutcome({ status: "waiting" });
      } catch (error) {
        const refused = error instanceof PlatformError && (error.status === 403 || error.status === 409);
        setOutcome(refused ? { status: "refused", reason: null } : { status: "failed" });
      }
    },
    [mission.id, token],
  );

  return { room, start, open, session, connected, frame, send, outcome };
}
