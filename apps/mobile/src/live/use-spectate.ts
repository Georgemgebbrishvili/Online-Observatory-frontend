import { fetch as streamingFetch } from "expo/fetch";
import { useEffect, useState } from "react";

import { realtimeBaseUrl } from "@/platform/config";

import { jpegDataUri, multipartFrames } from "./mjpeg";
import { onRealtime } from "./room";

export type Spectate =
  | { status: "waiting" }
  | { status: "frame"; uri: string }
  | { status: "full" };

/**
 * Clients ADR-066: the spectator view of a session opened to anyone. No bearer: the
 * realtime service serves it to whoever asks, up to its cap, and answers 503 beyond it.
 * A dropped stream is read again; a full one waits for the viewer's retry.
 */
export function useSpectate(streamPath: string, attempt: number): Spectate {
  const [state, setState] = useState<Spectate>({ status: "waiting" });

  useEffect(() => {
    const abort = new AbortController();
    const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    setState({ status: "waiting" });

    (async () => {
      let tries = 0;
      while (!abort.signal.aborted) {
        try {
          const response = await streamingFetch(onRealtime(streamPath, realtimeBaseUrl, "http"), {
            signal: abort.signal,
          });
          if (response.status === 503) {
            setState({ status: "full" });
            return;
          }
          if (response.ok && response.body) {
            const reader = response.body.getReader();
            const frames = multipartFrames();
            for (;;) {
              const { value, done } = await reader.read();
              if (done) break;
              const latest = frames(value).at(-1);
              if (latest) {
                tries = 0;
                setState({ status: "frame", uri: jpegDataUri(latest) });
              }
            }
          }
        } catch {
          // Aborted, or the connection dropped; the loop decides.
        }
        // A still picture must never pass for the live sky.
        if (!abort.signal.aborted) setState({ status: "waiting" });
        await pause(Math.min(16_000, 2000 * 2 ** tries++));
      }
    })();
    return () => abort.abort();
  }, [streamPath, attempt]);

  return state;
}
